import { Router, Response } from 'express';
import { config } from '../config/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import prisma from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const SYSTEM_PROMPT = `你是 NOI Quest 的 AI 编程助教，专门帮助初中生学习 C++ 编程，备战 CSP-J、CSP-S 和 NOI 竞赛。

你的职责：
1. 用简单易懂的语言解释 C++ 概念和算法
2. 帮助学生理解代码的含义和逻辑
3. 分析代码错误并给出修复建议
4. 回答学生关于 C++ 编程和算法的问题
5. 引导学生思考，而不是直接给出完整答案

注意事项：
- 使用中文回答
- 解释要通俗易懂，适合初中生理解
- 如果学生问的是竞赛题，引导他们思考解题思路
- 代码示例要简洁明了，符合竞赛代码风格
- 对学生要有耐心，鼓励他们多尝试
- 适当介绍时间复杂度和空间复杂度的概念`;

// 检查并更新 AI 使用次数
async function checkAndUpdateAIUsage(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = config.ai.dailyLimit;

  // 获取或创建今日使用记录
  const record = await prisma.aIUsageRecord.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today, count: 0 },
  });

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  // 增加使用次数
  await prisma.aIUsageRecord.update({
    where: { userId_date: { userId, date: today } },
    data: { count: { increment: 1 } },
  });

  return { allowed: true, remaining: limit - record.count - 1, limit };
}

// 获取 AI 使用状态
router.get('/usage', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.aIUsageRecord.findUnique({
      where: { userId_date: { userId: req.user!.id, date: today } },
    });

    const used = record?.count || 0;
    const limit = config.ai.dailyLimit;

    res.json({
      used,
      remaining: Math.max(0, limit - used),
      limit,
    });
  } catch (error) {
    next(error);
  }
});

// 发送消息到 AI
router.post('/chat', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { messages, sessionId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      throw new AppError('消息格式错误', 400);
    }

    // 检查使用限制
    const usage = await checkAndUpdateAIUsage(req.user!.id);
    if (!usage.allowed) {
      throw new AppError(`今日 AI 问答次数已用完（${usage.limit}次/天），明天再来吧！`, 429);
    }

    const currentSessionId = sessionId || uuidv4();

    // 保存用户消息
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      await prisma.chatMessage.create({
        data: {
          userId: req.user!.id,
          sessionId: currentSessionId,
          role: 'user',
          content: lastUserMessage.content,
        },
      });
    }

    // 调用豆包 API
    const response = await fetch(config.doubao.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.doubao.apiKey}`,
      },
      body: JSON.stringify({
        model: config.doubao.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('豆包 API 错误:', errorText);
      throw new AppError(`AI 服务暂时不可用: ${errorText}`, 502);
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const assistantMessage = data.choices?.[0]?.message?.content || '抱歉，我没有理解你的问题。';

    // 保存 AI 回复
    await prisma.chatMessage.create({
      data: {
        userId: req.user!.id,
        sessionId: currentSessionId,
        role: 'assistant',
        content: assistantMessage,
      },
    });

    res.json({
      message: assistantMessage,
      sessionId: currentSessionId,
      usage: { remaining: usage.remaining, limit: usage.limit },
    });
  } catch (error) {
    next(error);
  }
});

// 流式聊天
router.post('/chat/stream', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { messages, sessionId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      throw new AppError('消息格式错误', 400);
    }

    // 检查使用限制
    const usage = await checkAndUpdateAIUsage(req.user!.id);
    if (!usage.allowed) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ error: `今日 AI 问答次数已用完（${usage.limit}次/天），明天再来吧！` })}\n\n`);
      res.end();
      return;
    }

    const currentSessionId = sessionId || uuidv4();

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 nginx 缓冲
    res.flushHeaders(); // 立即发送响应头

    // 立即发送思考状态，避免前端等待
    res.write(`data: ${JSON.stringify({ status: 'thinking' })}\n\n`);
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }

    // 调用豆包 API（流式）
    const response = await fetch(config.doubao.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.doubao.apiKey}`,
      },
      body: JSON.stringify({
        model: config.doubao.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.write(`data: ${JSON.stringify({ error: errorText })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

        for (const line of lines) {
          const data = line.replace('data:', '').trim();
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            fullContent += content;
            res.write(`data: ${JSON.stringify({ content: fullContent, sessionId: currentSessionId })}\n\n`);
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }

    // 保存完整对话
    if (fullContent) {
      await prisma.chatMessage.create({
        data: {
          userId: req.user!.id,
          sessionId: currentSessionId,
          role: 'assistant',
          content: fullContent,
        },
      });
    }

    res.write(`data: ${JSON.stringify({ usage: { remaining: usage.remaining, limit: usage.limit } })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    next(error);
  }
});

// 获取聊天历史
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { sessionId, limit = 50 } = req.query;

    const messages = await prisma.chatMessage.findMany({
      where: {
        userId: req.user!.id,
        ...(sessionId && { sessionId: sessionId as string }),
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
});

// 代码解释
router.post('/explain', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('请提供代码', 400);
    }

    // 检查使用限制
    const usage = await checkAndUpdateAIUsage(req.user!.id);
    if (!usage.allowed) {
      throw new AppError(`今日 AI 问答次数已用完（${usage.limit}次/天），明天再来吧！`, 429);
    }

    const prompt = `请解释以下 C++ 代码的含义和功能：

\`\`\`cpp
${code}
\`\`\`

请用简单易懂的语言，逐行解释代码的作用。`;

    const response = await fetch(config.doubao.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.doubao.apiKey}`,
      },
      body: JSON.stringify({
        model: config.doubao.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new AppError('AI 服务暂时不可用', 502);
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const explanation = data.choices?.[0]?.message?.content || '抱歉，无法解释这段代码。';

    res.json({ explanation, usage: { remaining: usage.remaining, limit: usage.limit } });
  } catch (error) {
    next(error);
  }
});

// 错误分析
router.post('/analyze-error', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { code, error: errorMsg } = req.body;

    if (!code || !errorMsg) {
      throw new AppError('请提供代码和错误信息', 400);
    }

    // 检查使用限制
    const usage = await checkAndUpdateAIUsage(req.user!.id);
    if (!usage.allowed) {
      throw new AppError(`今日 AI 问答次数已用完（${usage.limit}次/天），明天再来吧！`, 429);
    }

    const prompt = `我的 C++ 代码出现了错误，请帮我分析：

代码：
\`\`\`cpp
${code}
\`\`\`

错误信息：
${errorMsg}

请告诉我：
1. 这个错误是什么意思
2. 为什么会出现这个错误
3. 应该如何修复`;

    const response = await fetch(config.doubao.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.doubao.apiKey}`,
      },
      body: JSON.stringify({
        model: config.doubao.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new AppError('AI 服务暂时不可用', 502);
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const analysis = data.choices?.[0]?.message?.content || '抱歉，无法分析这个错误。';

    res.json({ analysis, usage: { remaining: usage.remaining, limit: usage.limit } });
  } catch (error) {
    next(error);
  }
});

// 获取题目提示（不给出答案，引导思考）
const HINT_SYSTEM_PROMPT = `你是 NOI Quest 的 AI 编程助教，专门帮助初中生学习 C++ 编程。

现在学生在做一道题目时遇到了困难，已经答错了两次。你的任务是给出提示，引导学生思考，但绝对不能直接给出答案。

提示原则：
1. 分析题目考查的知识点
2. 提醒学生注意容易出错的地方
3. 用问题引导学生思考
4. 给出思考方向，但不要给出具体答案
5. 语气要鼓励和耐心

注意：
- 使用中文回答
- 不要直接说出正确答案是什么
- 不要给出完整的代码
- 提示要简洁，控制在 100-200 字以内`;

router.post('/hint/:exerciseId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { exerciseId } = req.params;

    // 获取题目信息
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new AppError('题目不存在', 404);
    }

    // 检查使用限制
    const usage = await checkAndUpdateAIUsage(req.user!.id);
    if (!usage.allowed) {
      throw new AppError(`今日 AI 问答次数已用完（${usage.limit}次/天），明天再来吧！`, 429);
    }

    // 构建提示请求
    let questionInfo = `题目：${exercise.title}\n描述：${exercise.description}\n类型：${exercise.type}`;

    // 根据题目类型添加更多上下文（但不包含答案）
    if (exercise.questionData) {
      const qd = exercise.questionData as any;
      if (exercise.type === 'FILL_BLANK' && qd.code) {
        questionInfo += `\n代码模板：${qd.code}`;
      } else if (exercise.type === 'CODE_ORDER' && qd.lines) {
        questionInfo += `\n需要排序的代码行数：${qd.lines.length}`;
      } else if (exercise.type === 'MULTIPLE_CHOICE' && qd.question) {
        questionInfo += `\n问题：${qd.question}`;
        questionInfo += `\n选项：${qd.options.map((o: any) => o.text).join('、')}`;
      } else if (exercise.type === 'MATCHING') {
        questionInfo += `\n配对题，需要将左侧和右侧的内容正确配对`;
      } else if (exercise.type === 'BUG_FIX' && qd.buggyCode) {
        questionInfo += `\n有错误的代码：\n${qd.buggyCode}`;
      }
    }

    const prompt = `学生正在做以下题目，已经答错了两次，请给出提示帮助他思考，但不要直接给出答案：

${questionInfo}

请给出引导性的提示：`;

    const response = await fetch(config.doubao.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.doubao.apiKey}`,
      },
      body: JSON.stringify({
        model: config.doubao.model,
        messages: [
          { role: 'system', content: HINT_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new AppError('AI 服务暂时不可用', 502);
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const hint = data.choices?.[0]?.message?.content || '让我们一起来分析这道题。首先，仔细阅读题目要求，想想这道题考查的是什么知识点？';

    res.json({ hint, usage: { remaining: usage.remaining, limit: usage.limit } });
  } catch (error) {
    next(error);
  }
});

export { router as aiRouter };
