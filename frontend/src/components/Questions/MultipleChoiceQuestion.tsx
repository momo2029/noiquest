import { useState } from 'react';
import { Exercise } from '../../types';
import { CheckCircle, Send } from 'lucide-react';

// 后端实际的数据格式
interface BackendMultipleChoiceData {
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface MultipleChoiceQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function MultipleChoiceQuestion({ exercise, onSubmit, disabled }: MultipleChoiceQuestionProps) {
  const data = exercise.questionData as unknown as BackendMultipleChoiceData;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!data || !data.options) return null;

  const handleSubmit = () => {
    if (selectedIndex !== null) {
      onSubmit(String(selectedIndex));
    }
  };

  // 生成选项标识 A, B, C, D...
  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div>
      {/* 选项 */}
      <div className="space-y-3 mb-6">
        {data.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !disabled && setSelectedIndex(index)}
            disabled={disabled}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3
              ${selectedIndex === index
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/30'
              }
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* 选择指示器 */}
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${selectedIndex === index
                ? 'border-blue-500 bg-blue-500'
                : 'border-white/30'
              }
            `}>
              {selectedIndex === index && (
                <CheckCircle size={16} className="text-white" />
              )}
            </div>

            {/* 选项标识 */}
            <span className={`
              w-8 h-8 rounded-lg flex items-center justify-center font-bold
              ${selectedIndex === index
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70'
              }
            `}>
              {getOptionLabel(index)}
            </span>

            {/* 选项文本 */}
            <span className="text-white flex-1">{option}</span>
          </button>
        ))}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled || selectedIndex === null}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交答案
      </button>
    </div>
  );
}
