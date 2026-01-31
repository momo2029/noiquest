import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { SkillUnit, DailyQuest, DailyStatus, TierInfo, ModuleInfo, Tier } from '../../types';
import TierSelector from './TierSelector';
import ModuleSidebar from './ModuleSidebar';
import KnowledgeMap from './KnowledgeMap';
import SessionCard from './SessionCard';
import { Target, Flame, Trophy, BookOpen } from 'lucide-react';

interface SkillTreeViewProps {
  onStartSession: (sessionId: string) => void;
}

export default function SkillTreeView({ onStartSession }: SkillTreeViewProps) {
  const { t } = useTranslation();
  // 数据状态
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [skillTree, setSkillTree] = useState<SkillUnit[]>([]);
  const [dependencies, setDependencies] = useState<{ from: string; to: string }[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);

  // UI 状态
  const [selectedTier, setSelectedTier] = useState<Tier>('CSP_J');
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SkillUnit | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载梯队和每日数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 当梯队变化时，重新加载模块和技能树
  useEffect(() => {
    if (selectedTier) {
      loadModules();
      loadSkillTree();
    }
  }, [selectedTier]);

  // 当模块变化时，重新加载技能树
  useEffect(() => {
    if (selectedTier && selectedModuleId !== undefined) {
      loadSkillTree();
    }
  }, [selectedModuleId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tiersData, statusData, questsData] = await Promise.all([
        api.getTiers(),
        api.getDailyStatus(),
        api.getDailyQuests(),
      ]);
      setTiers(tiersData.tiers);
      setDailyStatus(statusData);
      setDailyQuests(questsData);

      // 找到第一个解锁的梯队
      const firstUnlocked = tiersData.tiers.find(t => t.unlocked);
      if (firstUnlocked) {
        setSelectedTier(firstUnlocked.id);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const data = await api.getModules(selectedTier);
      setModules(data.modules);
    } catch (error) {
      console.error('Failed to load modules:', error);
    }
  };

  const loadSkillTree = async () => {
    try {
      const params: { tier?: string; moduleId?: number } = { tier: selectedTier };
      if (selectedModuleId !== null) {
        params.moduleId = selectedModuleId;
      }
      const data = await api.getSkillTree(params);
      setSkillTree(data.skillTree);
      setDependencies(data.dependencies || []);
      setSelectedUnit(null);
    } catch (error) {
      console.error('Failed to load skill tree:', error);
    }
  };

  const handleClaimQuest = async (questId: string) => {
    try {
      await api.claimQuestReward(questId);
      const [statusData, questsData] = await Promise.all([
        api.getDailyStatus(),
        api.getDailyQuests(),
      ]);
      setDailyStatus(statusData);
      setDailyQuests(questsData);
    } catch (error) {
      console.error('Failed to claim quest:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">{t('skillTree.loadingSkillTree')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#16213e] overflow-hidden">
      {/* 顶部：梯队选择器 */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{t('skillTree.title')}</h1>
          <p className="text-sm text-gray-400">
            {t('skillTree.knowledgePoints', { count: skillTree.length })}
          </p>
        </div>
        <TierSelector
          tiers={tiers}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
        />
      </div>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：模块导航 */}
        <ModuleSidebar
          modules={modules}
          selectedModuleId={selectedModuleId}
          onSelectModule={setSelectedModuleId}
        />

        {/* 中间：知识点地图 */}
        <KnowledgeMap
          units={skillTree}
          dependencies={dependencies}
          selectedUnitId={selectedUnit?.id || null}
          onSelectUnit={setSelectedUnit}
        />

        {/* 右侧面板 */}
        <div className="w-80 bg-[#1e1e2e] border-l border-white/10 flex flex-col">
          {/* 每日目标 */}
          {dailyStatus && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-yellow-400" size={20} />
                <h3 className="text-white font-bold">{t('skillTree.todayGoal')}</h3>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">{t('skillTree.experience')}</span>
                  <span className="text-white font-bold">
                    {dailyStatus.xpEarned} / {dailyStatus.goalXp} XP
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dailyStatus.goalMet ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, dailyStatus.progress)}%` }}
                  />
                </div>
                {dailyStatus.goalMet && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <Trophy size={14} />
                    {t('skillTree.goalAchieved')}
                  </p>
                )}
              </div>

              {/* 连续天数 */}
              <div className="flex items-center gap-2 mt-3 bg-orange-500/10 rounded-lg px-3 py-2">
                <Flame className="text-orange-400" size={18} />
                <span className="text-white/80 text-sm">{t('skillTree.continuousLearning')}</span>
                <span className="text-orange-400 font-bold ml-auto">
                  {dailyStatus.streak} {t('common.days')}
                </span>
              </div>
            </div>
          )}

          {/* 选中知识点的课程列表 */}
          {selectedUnit ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{selectedUnit.icon}</span>
                <div>
                  <h3 className="text-white font-bold">{selectedUnit.title}</h3>
                  <p className="text-xs text-gray-500">{selectedUnit.code}</p>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                {selectedUnit.description}
              </p>

              {selectedUnit.courses && selectedUnit.courses.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm text-gray-500 mb-2">{t('skillTree.relatedCourses')}</h4>
                  {selectedUnit.courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white/5 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <p className="text-white font-medium text-sm">{course.title}</p>
                      <p className="text-gray-500 text-xs">{course.code}</p>
                      {course.sessions && course.sessions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {course.sessions.map((session) => (
                            <SessionCard
                              key={session.id}
                              session={session}
                              courseUnlocked={course.unlocked}
                              onStart={() => onStartSession(session.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('skillTree.courseInDevelopment')}</p>
                </div>
              )}
            </div>
          ) : (
            /* 每日任务 */
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-white font-bold mb-3">{t('skillTree.dailyQuests')}</h3>
              <div className="space-y-3">
                {dailyQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className={`bg-white/5 rounded-xl p-3 ${
                      quest.completed && !quest.claimed
                        ? 'ring-2 ring-green-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {quest.title}
                        </p>
                        <p className="text-white/50 text-xs">
                          {quest.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 text-xs font-bold">
                          +{quest.xpReward} XP
                        </p>
                        {quest.gemsReward > 0 && (
                          <p className="text-blue-400 text-xs">
                            +{quest.gemsReward} {t('common.gems')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quest.completed ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${quest.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-xs">
                        {quest.currentValue} / {quest.targetValue}
                      </span>
                      {quest.completed && !quest.claimed && (
                        <button
                          onClick={() => handleClaimQuest(quest.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          {t('skillTree.claimReward')}
                        </button>
                      )}
                      {quest.claimed && (
                        <span className="text-green-400 text-xs">{t('skillTree.claimed')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
