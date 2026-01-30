import { SkillUnit } from '../../types';
import { Lock, Crown, CheckCircle } from 'lucide-react';

interface SkillUnitNodeProps {
  unit: SkillUnit;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function SkillUnitNode({ unit, index, isSelected, onClick }: SkillUnitNodeProps) {
  const isLocked = !unit.unlocked;
  const totalSessions = unit.totalSessions;
  const completedSessions = unit.sessionsCompleted;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // 皇冠颜色
  const crownColors = ['text-gray-400', 'text-yellow-600', 'text-yellow-500', 'text-yellow-400', 'text-yellow-300', 'text-yellow-200'];

  return (
    <div
      className={`relative flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
    >
      <button
        onClick={onClick}
        disabled={isLocked}
        className={`
          relative w-64 p-4 rounded-2xl transition-all duration-300
          ${isLocked
            ? 'bg-gray-800/50 cursor-not-allowed'
            : isSelected
              ? 'bg-gradient-to-br ' + unit.color + ' shadow-lg shadow-blue-500/20 scale-105'
              : 'bg-gradient-to-br ' + unit.color + ' hover:scale-105 hover:shadow-lg'
          }
        `}
      >
        {/* 锁定遮罩 */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <Lock className="text-white/50" size={32} />
          </div>
        )}

        {/* 内容 */}
        <div className={isLocked ? 'opacity-50' : ''}>
          {/* 图标和标题 */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{unit.icon}</span>
            <div className="flex-1 text-left">
              <h3 className="text-white font-bold">{unit.title}</h3>
              <p className="text-white/70 text-xs">{unit.description}</p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span>{completedSessions} / {totalSessions} 课时</span>
              {unit.completed && <CheckCircle size={14} className="text-green-300" />}
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 皇冠等级 */}
          {unit.crownLevel > 0 && (
            <div className="absolute -top-2 -right-2 flex items-center gap-0.5 bg-yellow-900/80 px-2 py-1 rounded-full">
              {Array.from({ length: Math.min(unit.crownLevel, 5) }).map((_, i) => (
                <Crown key={i} size={12} className={crownColors[Math.min(unit.crownLevel, 5)]} />
              ))}
            </div>
          )}
        </div>

        {/* 选中指示器 */}
        {isSelected && !isLocked && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 rounded-sm" />
        )}
      </button>

      {/* 连接点 */}
      <div className={`
        absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4
        ${isLocked ? 'bg-gray-600 border-gray-500' : unit.completed ? 'bg-green-500 border-green-400' : 'bg-blue-500 border-blue-400'}
        ${index % 2 === 0 ? 'right-[calc(50%-8px)]' : 'left-[calc(50%-8px)]'}
      `} />
    </div>
  );
}
