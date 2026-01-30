import { useState } from 'react';
import { Exercise } from '../../types';
import { Send } from 'lucide-react';

// 后端实际的数据格式
interface BackendFillBlankData {
  code: string;
  blanks: {
    answer: string;
    hint?: string;
  }[];
  explanation?: string;
}

interface FillBlankQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: Record<string, string>) => void;
  disabled?: boolean;
}

export default function FillBlankQuestion({ exercise, onSubmit, disabled }: FillBlankQuestionProps) {
  const data = exercise.questionData as unknown as BackendFillBlankData;
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!data || !data.code) return null;

  const handleChange = (blankIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [blankIndex]: value }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  // 按行渲染代码，处理每行中的 {{blank}}
  const renderLines = () => {
    const lines = data.code.split('\n');
    let blankIndex = 0;

    return lines.map((line, lineIndex) => {
      const parts = line.split('{{blank}}');
      const lineElements: JSX.Element[] = [];

      parts.forEach((part, partIndex) => {
        // 添加代码部分
        if (part) {
          lineElements.push(
            <span key={`code-${lineIndex}-${partIndex}`} className="text-gray-300">
              {part}
            </span>
          );
        }

        // 在每个部分之后添加输入框（除了最后一个）
        if (partIndex < parts.length - 1) {
          const blank = data.blanks[blankIndex];
          const currentBlankIndex = blankIndex;
          lineElements.push(
            <input
              key={`blank-${currentBlankIndex}`}
              type="text"
              value={answers[currentBlankIndex] || ''}
              onChange={(e) => handleChange(currentBlankIndex, e.target.value)}
              placeholder={blank?.hint || '填写答案'}
              disabled={disabled}
              className="mx-1 px-2 py-0.5 bg-blue-500/20 border-2 border-blue-500/50 rounded text-blue-300 placeholder-blue-300/50 focus:outline-none focus:border-blue-400 min-w-[80px] text-center inline-block"
            />
          );
          blankIndex++;
        }
      });

      return (
        <div key={lineIndex} className="flex items-center min-h-[28px]">
          <span className="text-gray-500 w-8 text-right mr-4 select-none flex-shrink-0">
            {lineIndex + 1}
          </span>
          <div className="flex items-center whitespace-pre">
            {lineElements.length > 0 ? lineElements : <span>&nbsp;</span>}
          </div>
        </div>
      );
    });
  };

  // 计算需要填写的空白数量
  const blankCount = (data.code.match(/\{\{blank\}\}/g) || []).length;
  const filledCount = Object.keys(answers).filter(k => answers[k]?.trim()).length;

  return (
    <div>
      {/* 代码区域 */}
      <div className="bg-[#1e1e1e] rounded-xl p-4 font-mono text-sm mb-6 overflow-x-auto">
        {renderLines()}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled || filledCount < blankCount}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交答案
      </button>
    </div>
  );
}
