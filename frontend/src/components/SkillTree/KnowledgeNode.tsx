import { Lock, Check, Crown, Star } from 'lucide-react';
import { SkillUnit } from '../../types';

interface KnowledgeNodeProps {
  unit: SkillUnit;
  isSelected: boolean;
  onClick: () => void;
}

export default function KnowledgeNode({ unit, isSelected, onClick }: KnowledgeNodeProps) {
  const isLocked = !unit.unlocked;
  const isCompleted = unit.completed;
  const hasProgress = unit.sessionsCompleted > 0;
  const progress = unit.totalSessions
    ? Math.round((unit.sessionsCompleted / unit.totalSessions) * 100)
    : 0;

  // 根据核心度显示星星
  const renderCoreLevel = () => {
    if (!unit.coreLevel) return null;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: unit.coreLevel }).map((_, i) => (
          <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative w-full p-4 rounded-xl transition-all text-left
        ${isLocked
          ? 'bg-gray-800/50 cursor-not-allowed'
          : isSelected
            ? 'bg-white/15 ring-2 ring-white/30'
            : isCompleted
              ? 'bg-green-900/30 hover:bg-green-900/40'
              : hasProgress
                ? 'bg-blue-900/30 hover:bg-blue-900/40'
                : 'bg-white/5 hover:bg-white/10'
        }
      `}
    >
      {/* 头部：编号和核心度 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-mono">{unit.code}</span>
        {renderCoreLevel()}
      </div>

      {/* 图标和标题 */}
      <div className="flex items-start gap-3">
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center text-xl
            ${isLocked ? 'bg-gray-700' : 'bg-white/10'}
          `}
        >
          {isLocked ? (
            <Lock size={18} className="text-gray-500" />
          ) : isCompleted ? (
            unit.crownLevel > 0 ? (
              <Crown size={18} className="text-yellow-400" />
            ) : (
              <Check size={18} className="text-green-400" />
            )
          ) : (
            <span>{unit.icon}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`
              font-medium text-sm truncate
              ${isLocked ? 'text-gray-500' : 'text-white'}
            `}
          >
            {unit.title}
          </h4>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {unit.description}
          </p>
        </div>
      </div>

      {/* 进度条 */}
      {!isLocked && unit.totalSessions && unit.totalSessions > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">
              {unit.sessionsCompleted}/{unit.totalSessions} 课时
            </span>
            {isCompleted && unit.crownLevel > 0 && (
              <span className="text-yellow-400 flex items-center gap-1">
                <Crown size={12} />
                {unit.crownLevel}
              </span>
            )}
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 前置依赖提示 */}
      {isLocked && unit.prerequisites && unit.prerequisites.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          需要先完成: {unit.prerequisites.map(p => p.title).join(', ')}
        </div>
      )}
    </button>
  );
}
