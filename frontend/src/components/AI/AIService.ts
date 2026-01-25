import { AIMessage } from '../../types';
import { getSettings } from '../../utils/storage';

const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

const SYSTEM_PROMPT = `你是一个专业的C++编程教学助手，专门帮助初中生学习C++编程。

你的职责：
1. 用简单易懂的语言解释C++概念
2. 帮助学生理解代码的含义和逻辑
3. 分析代码错误并给出修复建议
4. 回答学生关于C++编程的问题
5. 鼓励学生思考，而不是直接给出完整答案

注意事项：
- 使用中文回答
- 解释要通俗易懂，适合初中生理解
- 如果学生问的是作业题，引导他们思考而不是直接给答案
- 代码示例要简洁明了
- 对学生要有耐心，鼓励他们多尝试`;

export async function sendMessage(
  messages: AIMessage[],
  onStream?: (text: string) => void
): Promise<string> {
  const settings = getSettings();

  if (!settings.apiKey) {
    throw new Error('请先在设置中配置豆包API Key');
  }

  const requestMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: 'doubao-pro-32k',
        messages: requestMessages,
        stream: !!onStream
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API请求失败: ${error}`);
    }

    if (onStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

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
            fullText += content;
            onStream(fullText);
          } catch {
            // 忽略解析错误
          }
        }
      }

      return fullText;
    } else {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '抱歉，我没有理解你的问题。';
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
}

export function explainCode(code: string): AIMessage {
  return {
    role: 'user',
    content: `请解释以下C++代码的含义和功能：

\`\`\`cpp
${code}
\`\`\`

请用简单易懂的语言，逐行解释代码的作用。`
  };
}

export function analyzeError(code: string, error: string): AIMessage {
  return {
    role: 'user',
    content: `我的C++代码出现了错误，请帮我分析：

代码：
\`\`\`cpp
${code}
\`\`\`

错误信息：
${error}

请告诉我：
1. 这个错误是什么意思
2. 为什么会出现这个错误
3. 应该如何修复`
  };
}

export function optimizeCode(code: string): AIMessage {
  return {
    role: 'user',
    content: `请帮我优化以下C++代码：

\`\`\`cpp
${code}
\`\`\`

请从以下方面给出建议：
1. 代码效率
2. 代码可读性
3. 最佳实践`
  };
}
