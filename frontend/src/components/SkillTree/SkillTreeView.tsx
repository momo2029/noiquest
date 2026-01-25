import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SkillUnit, DailyQuest, DailyStatus } from '../../types';
import SkillUnitNode from './SkillUnitNode';
import LessonCard from './LessonCard';
import { Target, Flame, Trophy, ChevronRight } from 'lucide-react';

interface SkillTreeViewProps {
  onStartLesson: (lessonId: string) => void;
}

export default function SkillTreeView({ onStartLesson }: SkillTreeViewProps) {
  const [skillTree, setSkillTree] = useState<SkillUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<SkillUnit | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [treeData, statusData, questsData] = await Promise.all([
        api.getSkillTree(),
        api.getDailyStatus(),
        api.getDailyQuests(),
      ]);
      setSkillTree(treeData.skillTree);
      setDailyStatus(statusData);
      setDailyQuests(questsData);
    } catch (error) {
      console.error('Failed to load skill tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimQuest = async (questId: string) => {
    try {
      await api.claimQuestReward(questId);
      // 刷新数据
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
          <p className="text-white/70">加载技能树...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-gradient-to-b from-[#1a1a2e] to-[#16213e] overflow-hidden">
      {/* 左侧技能树 */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">C++ 学习之旅</h1>
            <p className="text-white/60">完成课程，解锁新技能</p>
          </div>

          {/* 技能树节点 */}
          <div className="relative">
            {/* 连接线 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500 opacity-30 -translate-x-1/2" />

            {/* 单元节点 */}
            <div className="relative space-y-6">
              {skillTree.map((unit, index) => (
                <SkillUnitNode
                  key={unit.id}
                  unit={unit}
                  index={index}
                  isSelected={selectedUnit?.id === unit.id}
                  onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧面板 */}
      <div className="w-80 bg-[#1e1e2e] border-l border-white/10 flex flex-col">
        {/* 每日目标 */}
        {dailyStatus && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="text-yellow-400" size={20} />
              <h3 className="text-white font-bold">今日目标</h3>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-sm">经验值</span>
                <span className="text-white font-bold">{dailyStatus.xpEarned} / {dailyStatus.goalXp} XP</span>
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
                  目标已达成！
                </p>
              )}
            </div>

            {/* 连续天数 */}
            <div className="flex items-center gap-2 mt-3 bg-orange-500/10 rounded-lg px-3 py-2">
              <Flame className="text-orange-400" size={18} />
              <span className="text-white/80 text-sm">连续学习</span>
              <span className="text-orange-400 font-bold ml-auto">{dailyStatus.streak} 天</span>
            </div>
          </div>
        )}

        {/* 每日任务 */}
        <div className="p-4 border-b border-white/10 flex-1 overflow-y-auto">
          <h3 className="text-white font-bold mb-3">每日任务</h3>
          <div className="space-y-3">
            {dailyQuests.map(quest => (
              <div
                key={quest.id}
                className={`bg-white/5 rounded-xl p-3 ${quest.completed && !quest.claimed ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">{quest.title}</p>
                    <p className="text-white/50 text-xs">{quest.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 text-xs font-bold">+{quest.xpReward} XP</p>
                    {quest.gemsReward > 0 && (
                      <p className="text-blue-400 text-xs">+{quest.gemsReward} 宝石</p>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${quest.completed ? 'bg-green-500' : 'bg-blue-500'}`}
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
                      领取奖励
                    </button>
                  )}
                  {quest.claimed && (
                    <span className="text-green-400 text-xs">已领取</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 选中单元的课程列表 */}
        {selectedUnit && (
          <div className="p-4 border-t border-white/10 max-h-[40%] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{selectedUnit.icon}</span>
              <h3 className="text-white font-bold">{selectedUnit.title}</h3>
            </div>
            <div className="space-y-2">
              {selectedUnit.lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  unitUnlocked={selectedUnit.unlocked}
                  onStart={() => onStartLesson(lesson.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
