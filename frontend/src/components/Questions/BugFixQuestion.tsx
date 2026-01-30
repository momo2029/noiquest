import { useState } from 'react';
import { Exercise } from '../../types';
import { Send, AlertTriangle, Lightbulb } from 'lucide-react';

// 后端实际的数据格式
interface BackendBugFixData {
  buggyCode: string;
  correctCode: string;
  bugLine: number;
  bugDescription?: string;
  explanation?: string;
}

interface BugFixQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: Record<number, string>) => void;
  disabled?: boolean;
}

export default function BugFixQuestion({ exercise, onSubmit, disabled }: BugFixQuestionProps) {
  const data = exercise.questionData as unknown as BackendBugFixData;
  const [fixes, setFixes] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState(false);

  if (!data || !data.buggyCode) return null;

  const lines = data.buggyCode.split('\n');
  const bugLine = data.bugLine;

  const handleFixChange = (line: number, value: string) => {
    setFixes(prev => ({ ...prev, [line]: value }));
  };

  const handleSubmit = () => {
    onSubmit(fixes);
  };

  // 获取正确代码中对应行的内容作为提示
  const getCorrectLine = () => {
    if (!data.correctCode) return null;
    const correctLines = data.correctCode.split('\n');
    return correctLines[bugLine - 1];
  };

  return (
    <div>
      {/* 说明 */}
      <div className="flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg mb-4">
        <AlertTriangle size={18} />
        <span className="text-sm">找出并修复代码中的错误</span>
      </div>

      {/* 错误描述 */}
      {data.bugDescription && (
        <div className="text-white/60 text-sm mb-4">
          提示：{data.bugDescription}
        </div>
      )}

      {/* 代码区域 */}
      <div className="bg-[#1e1e1e] rounded-xl p-4 font-mono text-sm mb-6">
        {lines.map((line, index) => {
          const lineNum = index + 1;
          const hasBug = lineNum === bugLine;

          return (
            <div key={index} className="group">
              <div className={`flex items-start gap-2 py-1 ${hasBug ? 'bg-red-500/10 -mx-4 px-4' : ''}`}>
                {/* 行号 */}
                <span className={`w-8 text-right select-none flex-shrink-0 ${hasBug ? 'text-red-400' : 'text-gray-500'}`}>
                  {lineNum}
                </span>

                {/* 代码内容 */}
                <div className="flex-1 min-w-0">
                  {hasBug ? (
                    <div className="space-y-2">
                      {/* 原始错误代码 */}
                      <div className="flex items-center gap-2">
                        <code className="text-red-400 line-through opacity-70">{line}</code>
                        <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                      </div>

                      {/* 修复输入框 */}
                      <input
                        type="text"
                        value={fixes[lineNum] || ''}
                        onChange={(e) => handleFixChange(lineNum, e.target.value)}
                        placeholder="输入修复后的代码..."
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-green-500/10 border-2 border-green-500/30 rounded-lg text-green-300 placeholder-green-300/50 focus:outline-none focus:border-green-500"
                      />

                      {/* 提示按钮 */}
                      {getCorrectLine() && (
                        <div>
                          <button
                            onClick={() => setShowHint(!showHint)}
                            className="flex items-center gap-1 text-yellow-400 text-xs hover:text-yellow-300"
                          >
                            <Lightbulb size={12} />
                            {showHint ? '隐藏提示' : '显示提示'}
                          </button>
                          {showHint && (
                            <p className="text-yellow-400/70 text-xs mt-1 pl-4">
                              💡 正确代码: <code>{getCorrectLine()}</code>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <code className="text-gray-300 whitespace-pre">{line}</code>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled || !fixes[bugLine]}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交修复
      </button>
    </div>
  );
}
