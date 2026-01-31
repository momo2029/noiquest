import { SkillUnit } from '../../types';
import { Check, Lock, Star, ArrowRight, BookOpen, Crown, Clock, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface KnowledgeDetailProps {
  unit: SkillUnit;
  onNavigateToSkillTree: () => void;
  onStartLearning?: () => void;
}

export default function KnowledgeDetail({
  unit,
  onNavigateToSkillTree,
  onStartLearning,
}: KnowledgeDetailProps) {
  const { t } = useTranslation();
  const isLocked = !unit.unlocked;
  const isCompleted = unit.completed;
  const progress = unit.totalSessions
    ? Math.round((unit.sessionsCompleted / unit.totalSessions) * 100)
    : 0;

  const hasLearningContent = unit.content || (unit.tips && unit.tips.length > 0) ||
    (unit.codeExamples && unit.codeExamples.length > 0);

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
          <span className="text-xs text-gray-400 mr-1">{t('skillTree.coreLevel', '核心度')}:</span>
          {Array.from({ length: unit.coreLevel }).map((_, i) => (
            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      )}

      {/* 预计学习时间 */}
      {unit.estimatedTime && (
        <div className="flex items-center gap-2 mb-3 text-gray-400">
          <Clock size={14} />
          <span className="text-sm">{t('learning.estimatedTime')}: {unit.estimatedTime} {t('common.minutes')}</span>
        </div>
      )}

      {/* 描述 */}
      <p className="text-sm text-gray-400 mb-4">{unit.description}</p>

      {/* 学习要点预览 */}
      {unit.tips && unit.tips.length > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
            <Lightbulb size={14} />
            <span>{t('learning.learningPoints')}</span>
          </div>
          <ul className="space-y-1">
            {unit.tips.slice(0, 3).map((tip, index) => (
              <li key={index} className="text-xs text-gray-300 flex items-start gap-1">
                <span className="text-cyan-400">•</span>
                <span className="line-clamp-1">{tip}</span>
              </li>
            ))}
            {unit.tips.length > 3 && (
              <li className="text-xs text-gray-500">+{unit.tips.length - 3} {t('common.more', '更多')}</li>
            )}
          </ul>
        </div>
      )}

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
          {isCompleted ? t('learning.learningStatus.mastered', '已掌握') : isLocked ? t('learning.learningStatus.notStarted', '未解锁') : t('learning.learningStatus.inProgress', '学习中')}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
          {unit.moduleName}
        </span>
      </div>

      {/* 学习进度 */}
      {!isLocked && unit.totalSessions > 0 && (
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">{t('learning.progress')}</span>
            <span className="text-white font-bold">
              {unit.sessionsCompleted} / {unit.totalSessions} {t('skillTree.sessions', '课时')}
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
              <span className="text-xs">{t('skillTree.crownLevel', '皇冠等级')}: {unit.crownLevel}</span>
            </div>
          )}
        </div>
      )}

      {/* 前置依赖 */}
      {unit.prerequisites && unit.prerequisites.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm text-gray-500 mb-2">{t('skillTree.prerequisites', '前置知识点')}</h4>
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
          <h4 className="text-sm text-gray-500 mb-2">{t('skillTree.dependents', '后续知识点')}</h4>
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
      <div className="space-y-2">
        {/* 学习资料按钮 */}
        {hasLearningContent && onStartLearning && (
          <button
            onClick={onStartLearning}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
              ${isLocked
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }
            `}
            disabled={isLocked}
          >
            <BookOpen size={18} />
            <span>{isCompleted ? t('learning.reviewContent') : t('learning.startLearning')}</span>
          </button>
        )}

        {/* 课程练习按钮 */}
        {!isCompleted && (
          <button
            onClick={onStartLearning || onNavigateToSkillTree}
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
            <span>{isLocked ? t('skillTree.needPrerequisites', '需要先完成前置知识点') : t('learning.viewCourse')}</span>
            {!isLocked && <ArrowRight size={18} />}
          </button>
        )}

        {isCompleted && (
          <button
            onClick={onStartLearning || onNavigateToSkillTree}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <BookOpen size={18} />
            <span>{t('learning.reviewContent')}</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
