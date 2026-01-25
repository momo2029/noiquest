import { AIMessage } from '../../types';

const API_BASE_URL = '/api';

// 获取 token
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export async function sendMessage(
  messages: AIMessage[],
  onStream?: (text: string) => void
): Promise<string> {
  const token = getToken();

  if (!token) {
    throw new Error('请先登录');
  }

  const requestMessages = messages.map(m => ({ role: m.role, content: m.content }));

  try {
    if (onStream) {
      // 流式请求
      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: requestMessages })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI 服务请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

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
              if (json.error) {
                throw new Error(json.error);
              }
              const content = json.content || '';
              fullText = content;
              onStream(fullText);
            } catch (e) {
              if (e instanceof SyntaxError) {
                // 忽略 JSON 解析错误
              } else {
                throw e;
              }
            }
          }
        }
      }

      return fullText;
    } else {
      // 非流式请求
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: requestMessages })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI 服务请求失败');
      }

      const data = await response.json();
      return data.message || '抱歉，我没有理解你的问题。';
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
