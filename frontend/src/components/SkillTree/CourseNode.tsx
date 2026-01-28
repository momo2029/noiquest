import { Course } from '../../types';
import { Lock, Check, Crown, ChevronRight } from 'lucide-react';

interface CourseNodeProps {
  course: Course;
  isSelected: boolean;
  onClick: () => void;
}

export default function CourseNode({ course, isSelected, onClick }: CourseNodeProps) {
  const isLocked = !course.unlocked;
  const isCompleted = course.completed;
  const hasProgress = course.sessionsCompleted > 0;
  const progress = course.totalSessions
    ? Math.round((course.sessionsCompleted / course.totalSessions) * 100)
    : 0;

  // 获取状态样式
  const getStatusStyles = () => {
    if (isLocked) {
      return {
        bg: 'bg-gray-800/50',
        border: 'border-gray-700',
        iconBg: 'bg-gray-700',
        cursor: 'cursor-not-allowed',
      };
    }
    if (isCompleted) {
      return {
        bg: course.crownLevel > 0 ? 'bg-yellow-900/30' : 'bg-green-900/30',
        border: course.crownLevel > 0 ? 'border-yellow-500/50' : 'border-green-500/50',
        iconBg: course.crownLevel > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20',
        cursor: 'cursor-pointer',
      };
    }
    if (hasProgress) {
      return {
        bg: 'bg-blue-900/30',
        border: 'border-blue-500/50',
        iconBg: 'bg-blue-500/20',
        cursor: 'cursor-pointer',
      };
    }
    return {
      bg: 'bg-white/5',
      border: 'border-white/20',
      iconBg: 'bg-white/10',
      cursor: 'cursor-pointer',
    };
  };

  const styles = getStatusStyles();

  // 渲染状态图标
  const renderStatusIcon = () => {
    if (isLocked) {
      return <Lock size={24} className="text-gray-500" />;
    }
    if (isCompleted && course.crownLevel > 0) {
      return <Crown size={24} className="text-yellow-400" />;
    }
    if (isCompleted) {
      return <Check size={24} className="text-green-400" />;
    }
    // 可学习状态 - 显示课程序号
    return (
      <span className="text-lg font-bold text-white">
        {course.orderIndex}
      </span>
    );
  };

  // 渲染皇冠等级
  const renderCrownLevel = () => {
    if (!isCompleted || course.crownLevel === 0) return null;
    return (
      <div className="flex items-center gap-0.5 mt-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Crown
            key={i}
            size={12}
            className={i < course.crownLevel ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative w-36 p-3 rounded-xl transition-all text-center
        border-2 ${styles.border} ${styles.bg} ${styles.cursor}
        ${isSelected ? 'ring-2 ring-white/40 scale-105' : ''}
        ${!isLocked && !isSelected ? 'hover:scale-105 hover:ring-2 hover:ring-white/20' : ''}
        ${!isLocked && hasProgress && !isCompleted ? 'animate-pulse-slow' : ''}
      `}
    >
      {/* 状态图标 */}
      <div
        className={`
          w-12 h-12 mx-auto rounded-full flex items-center justify-center
          ${styles.iconBg}
        `}
      >
        {renderStatusIcon()}
      </div>

      {/* 进度条 */}
      {!isLocked && course.totalSessions > 0 && (
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 课程标题 */}
      <h4
        className={`
          mt-2 text-sm font-medium leading-tight
          ${isLocked ? 'text-gray-500' : 'text-white'}
        `}
      >
        第{course.orderIndex}节
      </h4>
      <p
        className={`
          text-xs leading-tight mt-0.5 line-clamp-2
          ${isLocked ? 'text-gray-600' : 'text-gray-400'}
        `}
      >
        {course.title}
      </p>

      {/* 皇冠等级 */}
      {renderCrownLevel()}

      {/* 进度文字 */}
      {!isLocked && course.totalSessions > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {course.sessionsCompleted}/{course.totalSessions}
        </p>
      )}

      {/* 锁定提示 */}
      {isLocked && course.prerequisites.length > 0 && (
        <p className="text-xs text-gray-600 mt-1">
          需完成前置课程
        </p>
      )}

      {/* 选中指示器 */}
      {isSelected && !isLocked && (
        <div className="absolute -right-1 top-1/2 -translate-y-1/2">
          <ChevronRight size={16} className="text-white/60" />
        </div>
      )}
    </button>
  );
}
