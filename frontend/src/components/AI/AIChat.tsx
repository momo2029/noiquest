import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Code, AlertCircle, Sparkles, Loader2, X, Bot, User, Lightbulb, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AIMessage } from '../../types';
import { sendMessage, explainCode, analyzeError, optimizeCode } from './AIService';

interface AIChatProps {
  selectedCode?: string;
  currentCode?: string;
  onClose: () => void;
}

export default function AIChat({ selectedCode, currentCode, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // 自动调整输入框高度
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = async (customMessage?: AIMessage) => {
    const messageToSend = customMessage || { role: 'user' as const, content: input };

    if (!messageToSend.content.trim()) return;

    const newMessages = [...messages, messageToSend];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const response = await sendMessage(
        newMessages,
        (text) => {
          setStreamingText(text);
        },
        () => {
          // 收到 thinking 状态时，显示"思考中"
          setStreamingText('思考中...');
        }
      );

      setMessages([...newMessages, { role: 'assistant', content: response }]);
      setStreamingText('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发生未知错误';
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `抱歉，出现了一些问题：${errorMessage}\n\n请检查网络连接后重试。` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainCode = () => {
    const code = selectedCode || currentCode;
    if (code) {
      handleSend(explainCode(code));
    }
  };

  const handleAnalyzeError = () => {
    const error = prompt('请输入错误信息：');
    const code = selectedCode || currentCode;
    if (error && code) {
      handleSend(analyzeError(code, error));
    }
  };

  const handleOptimizeCode = () => {
    const code = selectedCode || currentCode;
    if (code) {
      handleSend(optimizeCode(code));
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickQuestions = [
    { icon: Lightbulb, text: 'C++基础语法是什么？', color: 'text-yellow-400' },
    { icon: Code, text: '如何定义一个函数？', color: 'text-blue-400' },
    { icon: AlertCircle, text: '常见的编译错误有哪些？', color: 'text-red-400' },
  ];

  return (
    <div className={`flex flex-col bg-[#1e1e1e] ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <span className="font-medium text-white text-sm">AI 编程助手</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded"
            title={isFullscreen ? "退出全屏" : "全屏"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={clearChat}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded"
            title="清空对话"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded"
            title="关闭"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="flex gap-1 px-3 py-2 border-b border-[#3c3c3c] overflow-x-auto">
        <button
          onClick={handleExplainCode}
          disabled={!selectedCode && !currentCode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Code size={12} />
          解释代码
        </button>
        <button
          onClick={handleAnalyzeError}
          disabled={!selectedCode && !currentCode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AlertCircle size={12} />
          分析错误
        </button>
        <button
          onClick={handleOptimizeCode}
          disabled={!selectedCode && !currentCode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={12} />
          优化建议
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingText && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={32} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">你好！我是你的编程助手</h3>
            <p className="text-sm text-gray-500 mb-6">有任何 C++ 编程问题都可以问我</p>

            {/* 快速问题 */}
            <div className="w-full space-y-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend({ role: 'user', content: q.text })}
                  className="w-full flex items-center gap-3 p-3 bg-[#252526] hover:bg-[#2a2d2e] rounded-lg text-left transition-colors"
                >
                  <q.icon size={16} className={q.color} />
                  <span className="text-sm text-gray-300">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user'
                ? 'bg-blue-600'
                : 'bg-gradient-to-br from-purple-500 to-blue-500'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#252526] text-gray-200'
              }`}
            >
              {msg.role === 'user' ? (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.content}</pre>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const inline = !match && !String(children).includes('\n');
                        return inline ? (
                          <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        ) : (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match ? match[1] : 'text'}
                            PreTag="div"
                            customStyle={{ margin: '0.5rem 0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Bot size={14} />
            </div>
            <div className="max-w-[85%] px-3 py-2 rounded-lg bg-[#252526] text-gray-200">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = !match && !String(children).includes('\n');
                      return inline ? (
                        <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      ) : (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match ? match[1] : 'text'}
                          PreTag="div"
                          customStyle={{ margin: '0.5rem 0', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      );
                    },
                  }}
                >
                  {streamingText}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isLoading && !streamingText && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Bot size={14} />
            </div>
            <div className="px-3 py-2 rounded-lg bg-[#252526]">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="animate-spin" size={14} />
                <span className="text-sm">思考中...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-3 border-t border-[#3c3c3c]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入你的问题... (Shift+Enter 换行)"
            rows={1}
            className="flex-1 px-3 py-2 bg-[#252526] border border-[#3c3c3c] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
