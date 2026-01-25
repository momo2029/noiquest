import { Router, Response } from 'express';
import { config } from '../config/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import prisma from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const SYSTEM_PROMPT = `你是 NOI Studio 的 AI 编程助教，专门帮助初中生学习 C++ 编程，备战 CSP-J、CSP-S 和 NOI 竞赛。

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

// 发送消息到 AI
router.post('/chat', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { messages, sessionId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      throw new AppError('消息格式错误', 400);
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

    const currentSessionId = sessionId || uuidv4();

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
            res.write(`data: ${JSON.stringify({ content, sessionId: currentSessionId })}\n\n`);
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

    res.json({ explanation });
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

    res.json({ analysis });
  } catch (error) {
    next(error);
  }
});

export { router as aiRouter };
