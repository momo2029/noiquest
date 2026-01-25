import { useState } from 'react';
import { Exercise, FillBlankData } from '../../types';
import { Send } from 'lucide-react';

interface FillBlankQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: Record<string, string>) => void;
  disabled?: boolean;
}

export default function FillBlankQuestion({ exercise, onSubmit, disabled }: FillBlankQuestionProps) {
  const data = exercise.questionData as FillBlankData;
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!data) return null;

  const handleChange = (blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  // 解析代码并替换空白处
  const renderCode = () => {
    let codeHtml = data.code;
    data.blanks.forEach(blank => {
      const placeholder = `___${blank.id}___`;
      const inputHtml = `<span class="blank-input" data-id="${blank.id}"></span>`;
      codeHtml = codeHtml.replace(placeholder, inputHtml);
    });
    return codeHtml;
  };

  // 将代码分割成行并渲染
  const lines = data.code.split('\n');

  return (
    <div>
      {/* 代码区域 */}
      <div className="bg-[#1e1e1e] rounded-xl p-4 font-mono text-sm mb-6">
        {lines.map((line, lineIndex) => {
          // 检查这行是否包含空白
          const parts: (string | { blankId: string; hint?: string })[] = [];
          let remaining = line;

          data.blanks.forEach(blank => {
            const placeholder = `___${blank.id}___`;
            const idx = remaining.indexOf(placeholder);
            if (idx !== -1) {
              if (idx > 0) {
                parts.push(remaining.substring(0, idx));
              }
              parts.push({ blankId: blank.id, hint: blank.hint });
              remaining = remaining.substring(idx + placeholder.length);
            }
          });

          if (remaining) {
            parts.push(remaining);
          }

          // 如果没有找到空白，直接显示整行
          if (parts.length === 0) {
            parts.push(line);
          }

          return (
            <div key={lineIndex} className="flex items-center min-h-[28px]">
              <span className="text-gray-500 w-8 text-right mr-4 select-none">{lineIndex + 1}</span>
              <div className="flex items-center flex-wrap">
                {parts.map((part, partIndex) => {
                  if (typeof part === 'string') {
                    return (
                      <span key={partIndex} className="text-gray-300 whitespace-pre">
                        {part}
                      </span>
                    );
                  } else {
                    return (
                      <input
                        key={partIndex}
                        type="text"
                        value={answers[part.blankId] || ''}
                        onChange={(e) => handleChange(part.blankId, e.target.value)}
                        placeholder={part.hint || '填写答案'}
                        disabled={disabled}
                        className="mx-1 px-2 py-0.5 bg-blue-500/20 border-2 border-blue-500/50 rounded text-blue-300 placeholder-blue-300/50 focus:outline-none focus:border-blue-400 min-w-[80px] text-center"
                      />
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled || Object.keys(answers).length < data.blanks.length}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交答案
      </button>
    </div>
  );
}
