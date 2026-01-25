import { useState } from 'react';
import { exercises, categories } from '../../data/exercises';
import { Exercise, Difficulty } from '../../types';
import { BookOpen, CheckCircle, Circle } from 'lucide-react';

interface ExerciseListProps {
  completedIds: string[];
  onSelectExercise: (exercise: Exercise) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500'
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
};

export default function ExerciseList({ completedIds, onSelectExercise }: ExerciseListProps) {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | '全部'>('全部');

  const filteredExercises = exercises.filter(ex => {
    const categoryMatch = selectedCategory === '全部' || ex.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === '全部' || ex.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const completedCount = completedIds.length;
  const totalCount = exercises.length;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* 头部统计 */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={24} className="text-blue-400" />
          <h2 className="text-xl font-bold">练习题库</h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            完成进度: <span className="text-green-400 font-bold">{completedCount}</span> / {totalCount}
          </span>
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">分类</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">难度</label>
          <div className="flex gap-2">
            {(['全部', 'easy', 'medium', 'hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedDifficulty === diff
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {diff === '全部' ? '全部' : difficultyLabels[diff]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredExercises.map(exercise => {
            const isCompleted = completedIds.includes(exercise.id);
            return (
              <div
                key={exercise.id}
                onClick={() => onSelectExercise(exercise)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  isCompleted
                    ? 'bg-green-900/30 border border-green-700 hover:bg-green-900/50'
                    : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-gray-500 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-medium">{exercise.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{exercise.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{exercise.category}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${difficultyColors[exercise.difficulty]} text-white`}>
                      {difficultyLabels[exercise.difficulty]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
