import { useState } from 'react';
import { Exercise, MultipleChoiceData } from '../../types';
import { CheckCircle, Circle, Send } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function MultipleChoiceQuestion({ exercise, onSubmit, disabled }: MultipleChoiceQuestionProps) {
  const data = exercise.questionData as MultipleChoiceData;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!data) return null;

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  return (
    <div>
      {/* 问题 */}
      <div className="bg-[#1e1e1e] rounded-xl p-4 mb-6">
        <p className="text-white font-mono">{data.question}</p>
      </div>

      {/* 选项 */}
      <div className="space-y-3 mb-6">
        {data.options.map((option) => (
          <button
            key={option.id}
            onClick={() => !disabled && setSelectedOption(option.id)}
            disabled={disabled}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3
              ${selectedOption === option.id
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/30'
              }
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* 选择指示器 */}
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${selectedOption === option.id
                ? 'border-blue-500 bg-blue-500'
                : 'border-white/30'
              }
            `}>
              {selectedOption === option.id && (
                <CheckCircle size={16} className="text-white" />
              )}
            </div>

            {/* 选项标识 */}
            <span className={`
              w-8 h-8 rounded-lg flex items-center justify-center font-bold
              ${selectedOption === option.id
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70'
              }
            `}>
              {option.id}
            </span>

            {/* 选项文本 */}
            <span className="text-white flex-1">{option.text}</span>
          </button>
        ))}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled || !selectedOption}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交答案
      </button>
    </div>
  );
}
