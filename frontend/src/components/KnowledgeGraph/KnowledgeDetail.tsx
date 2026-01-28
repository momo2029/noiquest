import { SkillUnit } from '../../types';
import { Check, Lock, Star, ArrowRight, BookOpen, Crown } from 'lucide-react';

interface KnowledgeDetailProps {
  unit: SkillUnit;
  onNavigateToSkillTree: () => void;
}

export default function KnowledgeDetail({
  unit,
  onNavigateToSkillTree,
}: KnowledgeDetailProps) {
  const isLocked = !unit.unlocked;
  const isCompleted = unit.completed;
  const progress = unit.totalLessons
    ? Math.round((unit.lessonsCompleted / unit.totalLessons) * 100)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* 知识点头部 */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${isLocked ? 'bg-gray-700' : 'bg-white/10'}
          `}
        >
          {isLocked ? (
            <Lock size={24} className="text-gray-500" />
          ) : isCompleted ? (
            unit.crownLevel > 0 ? (
              <Crown size={24} className="text-yellow-400" />
            ) : (
              <Check size={24} className="text-green-400" />
            )
          ) : (
            <span>{unit.icon}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg">{unit.title}</h3>
          <p className="text-xs text-gray-500 font-mono">{unit.code}</p>
        </div>
      </div>

      {/* 核心度 */}
      {unit.coreLevel > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs text-gray-400 mr-1">核心度:</span>
          {Array.from({ length: unit.coreLevel }).map((_, i) => (
            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      )}

      {/* 描述 */}
      <p className="text-sm text-gray-400 mb-4">{unit.description}</p>

      {/* 状态标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${isCompleted
              ? 'bg-green-500/20 text-green-400'
              : isLocked
                ? 'bg-gray-500/20 text-gray-400'
                : 'bg-blue-500/20 text-blue-400'
            }
          `}
        >
          {isCompleted ? '已掌握' : isLocked ? '未解锁' : '学习中'}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
          {unit.moduleName}
        </span>
      </div>

      {/* 学习进度 */}
      {!isLocked && unit.totalLessons > 0 && (
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">学习进度</span>
            <span className="text-white font-bold">
              {unit.lessonsCompleted} / {unit.totalLessons} 课程
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {isCompleted && unit.crownLevel > 0 && (
            <div className="flex items-center gap-1 mt-2 text-yellow-400">
              <Crown size={14} />
              <span className="text-xs">皇冠等级: {unit.crownLevel}</span>
            </div>
          )}
        </div>
      )}

      {/* 前置依赖 */}
      {unit.prerequisites && unit.prerequisites.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm text-gray-500 mb-2">前置知识点</h4>
          <div className="space-y-1">
            {unit.prerequisites.map((prereq) => (
              <div
                key={prereq.id}
                className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2"
              >
                <span className="text-xs font-mono text-gray-500">{prereq.code}</span>
                <span>{prereq.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 后续知识点 */}
      {unit.dependents && unit.dependents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm text-gray-500 mb-2">后续知识点</h4>
          <div className="space-y-1">
            {unit.dependents.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2"
              >
                <span className="text-xs font-mono text-gray-500">{dep.code}</span>
                <span>{dep.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {!isCompleted && (
        <button
          onClick={onNavigateToSkillTree}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
            ${isLocked
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
            }
          `}
          disabled={isLocked}
        >
          <BookOpen size={18} />
          <span>{isLocked ? '需要先完成前置知识点' : '前往学习'}</span>
          {!isLocked && <ArrowRight size={18} />}
        </button>
      )}

      {isCompleted && (
        <button
          onClick={onNavigateToSkillTree}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <BookOpen size={18} />
          <span>复习巩固</span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}
