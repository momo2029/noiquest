import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DailyQuest } from '../../types';
import { CheckCircle, Gift, Zap, Gem } from 'lucide-react';

export default function DailyQuestList() {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const data = await api.getDailyQuests();
      setQuests(data);
    } catch (error) {
      console.error('Failed to load quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (questId: string) => {
    try {
      await api.claimQuestReward(questId);
      loadQuests();
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
            <div className="h-2 bg-white/10 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quests.map(quest => (
        <div
          key={quest.id}
          className={`
            bg-white/5 rounded-xl p-4 transition-all
            ${quest.completed && !quest.claimed ? 'ring-2 ring-green-500 bg-green-500/10' : ''}
          `}
        >
          {/* 头部 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* 状态图标 */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${quest.claimed
                  ? 'bg-gray-500/20'
                  : quest.completed
                    ? 'bg-green-500/20'
                    : 'bg-blue-500/20'
                }
              `}>
                {quest.claimed ? (
                  <CheckCircle className="text-gray-400" size={20} />
                ) : quest.completed ? (
                  <Gift className="text-green-400" size={20} />
                ) : (
                  <span className="text-blue-400 font-bold text-sm">
                    {quest.currentValue}/{quest.targetValue}
                  </span>
                )}
              </div>

              {/* 任务信息 */}
              <div>
                <p className={`font-medium ${quest.claimed ? 'text-white/50' : 'text-white'}`}>
                  {quest.title}
                </p>
                <p className="text-white/50 text-sm">{quest.description}</p>
              </div>
            </div>

            {/* 奖励 */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Zap size={14} />
                +{quest.xpReward}
              </div>
              {quest.gemsReward > 0 && (
                <div className="flex items-center gap-1 text-blue-400 text-xs">
                  <Gem size={12} />
                  +{quest.gemsReward}
                </div>
              )}
            </div>
          </div>

          {/* 进度条 */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                quest.claimed ? 'bg-gray-500' : quest.completed ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${quest.progress}%` }}
            />
          </div>

          {/* 领取按钮 */}
          {quest.completed && !quest.claimed && (
            <button
              onClick={() => handleClaim(quest.id)}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Gift size={18} />
              领取奖励
            </button>
          )}

          {quest.claimed && (
            <p className="text-center text-gray-400 text-sm">已领取</p>
          )}
        </div>
      ))}

      {quests.length === 0 && (
        <p className="text-white/50 text-center py-8">暂无每日任务</p>
      )}
    </div>
  );
}
