import { useState } from 'react';
import { Exercise } from '../../types';
import { ArrowLeft, Lightbulb, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  onLoadCode: (code: string) => void;
  onComplete: () => void;
  isCompleted: boolean;
}

export default function ExerciseDetail({
  exercise,
  onBack,
  onLoadCode,
  onComplete,
  isCompleted
}: ExerciseDetailProps) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500'
  };

  const difficultyLabels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-3"
        >
          <ArrowLeft size={18} />
          返回题目列表
        </button>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{exercise.title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{exercise.category}</span>
            <span className={`px-2 py-0.5 text-xs rounded ${difficultyColors[exercise.difficulty]} text-white`}>
              {difficultyLabels[exercise.difficulty]}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-green-600 text-white">
                <CheckCircle size={12} />
                已完成
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 题目描述 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-blue-400">题目描述</h3>
          <p className="text-gray-300">{exercise.description}</p>
        </div>

        {/* 提示 */}
        {exercise.hint && (
          <div className="bg-gray-800 rounded-lg p-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
            >
              <Lightbulb size={18} />
              {showHint ? '隐藏提示' : '查看提示'}
            </button>
            {showHint && (
              <p className="mt-3 text-gray-300 pl-6">{exercise.hint}</p>
            )}
          </div>
        )}

        {/* 参考答案 */}
        {exercise.solution && (
          <div className="bg-gray-800 rounded-lg p-4">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
            >
              {showSolution ? <EyeOff size={18} /> : <Eye size={18} />}
              {showSolution ? '隐藏答案' : '查看参考答案'}
            </button>
            {showSolution && (
              <pre className="mt-3 p-3 bg-gray-900 rounded text-sm overflow-x-auto">
                <code className="text-gray-300">{exercise.solution}</code>
              </pre>
            )}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-700 flex gap-3">
        <button
          onClick={() => onLoadCode(exercise.starterCode)}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          加载初始代码
        </button>
        {!isCompleted && (
          <button
            onClick={onComplete}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            标记为完成
          </button>
        )}
      </div>
    </div>
  );
}
