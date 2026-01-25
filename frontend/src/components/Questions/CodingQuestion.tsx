import { useState } from 'react';
import { Exercise } from '../../types';
import { Send, Lightbulb } from 'lucide-react';

interface CodingQuestionProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function CodingQuestion({ exercise, onSubmit, disabled }: CodingQuestionProps) {
  const [code, setCode] = useState(exercise.starterCode || '');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    onSubmit(code);
  };

  return (
    <div>
      {/* 代码编辑区 */}
      <div className="bg-[#1e1e1e] rounded-xl overflow-hidden mb-4">
        {/* 编辑器头部 */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
          <span className="text-white/50 text-sm">main.cpp</span>
          {exercise.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-yellow-400 text-sm hover:text-yellow-300"
            >
              <Lightbulb size={14} />
              {showHint ? '隐藏提示' : '显示提示'}
            </button>
          )}
        </div>

        {/* 提示 */}
        {showHint && exercise.hint && (
          <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
            <p className="text-yellow-400 text-sm">💡 {exercise.hint}</p>
          </div>
        )}

        {/* 代码编辑器 */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={disabled}
          className="w-full h-64 p-4 bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
          placeholder="在这里编写代码..."
          spellCheck={false}
        />
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled || !code.trim()}
        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        提交代码
      </button>
    </div>
  );
}
