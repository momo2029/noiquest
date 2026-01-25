import { useState } from 'react';
import { Exercise, BugFixData } from '../../types';
import { Send, AlertTriangle, Lightbulb } from 'lucide-react';

interface BugFixQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: Record<number, string>) => void;
  disabled?: boolean;
}

export default function BugFixQuestion({ exercise, onSubmit, disabled }: BugFixQuestionProps) {
  const data = exercise.questionData as BugFixData;
  const [fixes, setFixes] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});

  if (!data) return null;

  const lines = data.buggyCode.split('\n');
  const bugLines = new Set(data.bugs.map(b => b.line));

  const handleFixChange = (line: number, value: string) => {
    setFixes(prev => ({ ...prev, [line]: value }));
  };

  const toggleHint = (line: number) => {
    setShowHints(prev => ({ ...prev, [line]: !prev[line] }));
  };

  const handleSubmit = () => {
    onSubmit(fixes);
  };

  return (
    <div>
      {/* 说明 */}
      <div className="flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg mb-4">
        <AlertTriangle size={18} />
        <span className="text-sm">找出并修复代码中的错误</span>
      </div>

      {/* 代码区域 */}
      <div className="bg-[#1e1e1e] rounded-xl p-4 font-mono text-sm mb-6">
        {lines.map((line, index) => {
          const lineNum = index + 1;
          const hasBug = bugLines.has(lineNum);
          const bug = data.bugs.find(b => b.line === lineNum);

          return (
            <div key={index} className="group">
              <div className={`flex items-start gap-2 py-1 ${hasBug ? 'bg-red-500/10 -mx-4 px-4' : ''}`}>
                {/* 行号 */}
                <span className={`w-8 text-right select-none ${hasBug ? 'text-red-400' : 'text-gray-500'}`}>
                  {lineNum}
                </span>

                {/* 代码内容 */}
                <div className="flex-1">
                  {hasBug ? (
                    <div className="space-y-2">
                      {/* 原始错误代码 */}
                      <div className="flex items-center gap-2">
                        <code className="text-red-400 line-through opacity-70">{line}</code>
                        <AlertTriangle size={14} className="text-red-400" />
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
                      {bug?.hint && (
                        <div>
                          <button
                            onClick={() => toggleHint(lineNum)}
                            className="flex items-center gap-1 text-yellow-400 text-xs hover:text-yellow-300"
                          >
                            <Lightbulb size={12} />
                            {showHints[lineNum] ? '隐藏提示' : '显示提示'}
                          </button>
                          {showHints[lineNum] && (
                            <p className="text-yellow-400/70 text-xs mt-1 pl-4">
                              💡 {bug.hint}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <code className="text-gray-300">{line}</code>
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
        disabled={disabled || Object.keys(fixes).length < data.bugs.length}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交修复
      </button>
    </div>
  );
}
