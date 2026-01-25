import { Lesson } from '../../types';
import { CheckCircle, Star, Play, Lock } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  unitUnlocked: boolean;
  onStart: () => void;
}

export default function LessonCard({ lesson, index, unitUnlocked, onStart }: LessonCardProps) {
  const isLocked = !unitUnlocked;
  const exerciseCount = lesson.exercises?.length || 0;

  return (
    <button
      onClick={onStart}
      disabled={isLocked}
      className={`
        w-full p-3 rounded-xl text-left transition-all
        ${isLocked
          ? 'bg-white/5 cursor-not-allowed opacity-50'
          : lesson.completed
            ? 'bg-green-500/20 hover:bg-green-500/30'
            : 'bg-white/10 hover:bg-white/20'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* 状态图标 */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isLocked
            ? 'bg-gray-600'
            : lesson.completed
              ? 'bg-green-500'
              : 'bg-blue-500'
          }
        `}>
          {isLocked ? (
            <Lock size={18} className="text-white/50" />
          ) : lesson.completed ? (
            <CheckCircle size={18} className="text-white" />
          ) : (
            <Play size={18} className="text-white" />
          )}
        </div>

        {/* 课程信息 */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{lesson.title}</h4>
          <p className="text-white/50 text-xs">{exerciseCount} 道题目</p>
        </div>

        {/* 完美通关标记 */}
        {lesson.perfectRun && (
          <Star className="text-yellow-400 fill-yellow-400" size={16} />
        )}
      </div>
    </button>
  );
}
