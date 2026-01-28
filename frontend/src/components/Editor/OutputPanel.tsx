import { useRef, useEffect, useState } from 'react';
import { Terminal, Trash2, X, ChevronUp, ChevronDown, Clock, Keyboard } from 'lucide-react';

interface OutputPanelProps {
  output: string[];
  isRunning: boolean;
  executionTime: number | null;
  height: number;
  onHeightChange: (height: number) => void;
  onClear: () => void;
  onClose: () => void;
  stdin: string;
  onStdinChange: (value: string) => void;
}

export default function OutputPanel({
  output,
  isRunning,
  executionTime,
  height,
  onHeightChange,
  onClear,
  onClose,
  stdin,
  onStdinChange
}: OutputPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [showInput, setShowInput] = useState(false);

  // 自动滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // 拖拽调整高度
  useEffect(() => {
    const resizeHandle = resizeRef.current;
    if (!resizeHandle) return;

    let startY = 0;
    let startHeight = 0;

    const onMouseDown = (e: MouseEvent) => {
      startY = e.clientY;
      startHeight = height;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      const newHeight = Math.min(Math.max(100, startHeight + delta), 500);
      onHeightChange(newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    resizeHandle.addEventListener('mousedown', onMouseDown);
    return () => resizeHandle.removeEventListener('mousedown', onMouseDown);
  }, [height, onHeightChange]);

  const formatOutput = (line: string) => {
    if (line.includes('❌') || line.includes('错误')) {
      return <span className="text-red-400">{line}</span>;
    }
    if (line.includes('✅') || line.includes('成功')) {
      return <span className="text-green-400">{line}</span>;
    }
    if (line.includes('🔨') || line.includes('编译')) {
      return <span className="text-yellow-400">{line}</span>;
    }
    if (line.includes('📤') || line.includes('输出')) {
      return <span className="text-blue-400">{line}</span>;
    }
    if (line.includes('✨')) {
      return <span className="text-purple-400">{line}</span>;
    }
    if (line.includes('警告')) {
      return <span className="text-orange-400">{line}</span>;
    }
    if (line.startsWith('─')) {
      return <span className="text-gray-600">{line}</span>;
    }
    return <span className="text-gray-300">{line}</span>;
  };

  return (
    <div
      className="bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col"
      style={{ height }}
    >
      {/* 拖拽手柄 */}
      <div
        ref={resizeRef}
        className="h-1 bg-[#3c3c3c] cursor-ns-resize hover:bg-blue-500 transition-colors"
      />

      {/* 头部 */}
      <div className="h-9 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white">
            <Terminal size={14} />
            <span className="text-sm font-medium">输出</span>
          </div>
          {executionTime !== null && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>{executionTime}ms</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInput(!showInput)}
            className={`p-1 rounded flex items-center gap-1 text-xs ${
              showInput
                ? 'text-green-400 bg-green-900/30'
                : 'text-gray-500 hover:text-white hover:bg-gray-700'
            }`}
            title="程序输入（cin 读取的数据）"
          >
            <Keyboard size={14} />
            <span>输入</span>
          </button>
          <button
            onClick={onClear}
            className="p-1 text-gray-500 hover:text-white hover:bg-gray-700 rounded"
            title="清空输出"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => onHeightChange(height === 100 ? 250 : 100)}
            className="p-1 text-gray-500 hover:text-white hover:bg-gray-700 rounded"
            title={height === 100 ? '展开' : '收起'}
          >
            {height === 100 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white hover:bg-gray-700 rounded"
            title="关闭"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 输入区域 - 用于 cin 读取数据 */}
      {showInput && (
        <div className="border-b border-[#3c3c3c] bg-[#1a1a1a]">
          <div className="px-3 py-2">
            <div className="text-xs text-gray-500 mb-1">
              📥 程序输入（cin 会从这里读取数据，每行一个输入）
            </div>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="在这里输入程序需要的数据，例如：&#10;5&#10;1 2 3 4 5"
              className="w-full h-20 bg-[#252526] text-gray-300 text-sm font-mono p-2 rounded border border-[#3c3c3c] focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* 输出内容 */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm whitespace-pre-wrap break-all"
      >
        {output.length === 0 ? (
          <div className="text-gray-600 text-center py-8">
            点击 "运行" 按钮或按 Ctrl+Enter 执行代码
          </div>
        ) : (
          <div className="space-y-0.5">
            {output.map((line, index) => (
              <div key={index} className="leading-relaxed">
                {formatOutput(line)}
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>执行中...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
