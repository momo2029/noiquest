import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DailyStatus, DailyGoalLevel } from '../../types';
import { Target, Flame, Trophy, Settings } from 'lucide-react';
import GoalSettingModal from './GoalSettingModal';

interface DailyGoalWidgetProps {
  compact?: boolean;
}

export default function DailyGoalWidget({ compact = false }: DailyGoalWidgetProps) {
  const [status, setStatus] = useState<DailyStatus | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getDailyStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load daily status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = async (goal: DailyGoalLevel) => {
    try {
      await api.setDailyGoal({ dailyGoal: goal });
      loadStatus();
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  if (loading || !status) {
    return (
      <div className={`bg-white/10 rounded-xl ${compact ? 'p-2' : 'p-4'} animate-pulse`}>
        <div className="h-8 bg-white/10 rounded" />
      </div>
    );
  }

  // 进度环
  const ProgressRing = ({ progress, size = 60 }: { progress: number; size?: number }) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={progress >= 100 ? '#4ade80' : '#fbbf24'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
    );
  };

  if (compact) {
    return (
      <button
        onClick={() => setShowSettings(true)}
        className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition-colors"
      >
        <div className="relative">
          <ProgressRing progress={status.progress} size={32} />
          <Target className="absolute inset-0 m-auto text-white" size={14} />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-white/70">今日</p>
          <p className="text-xs font-bold text-white">{status.xpEarned}/{status.goalXp}</p>
        </div>
      </button>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-yellow-400" size={24} />
            <h3 className="text-white font-bold">今日目标</h3>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          {/* 进度环 */}
          <div className="relative">
            <ProgressRing progress={status.progress} size={80} />
            <div className="absolute inset-0 flex items-center justify-center">
              {status.goalMet ? (
                <Trophy className="text-green-400" size={28} />
              ) : (
                <span className="text-white font-bold text-lg">{status.progress}%</span>
              )}
            </div>
          </div>

          {/* 详情 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70">经验值</span>
              <span className="text-white font-bold">{status.xpEarned} / {status.goalXp} XP</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status.goalMet ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(100, status.progress)}%` }}
              />
            </div>

            {status.goalMet ? (
              <p className="text-green-400 text-sm flex items-center gap-1">
                <Trophy size={14} />
                今日目标已达成！
              </p>
            ) : (
              <p className="text-white/50 text-sm">
                还需 {status.goalXp - status.xpEarned} XP 完成目标
              </p>
            )}
          </div>
        </div>

        {/* 连续天数 */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <Flame className="text-orange-400" size={20} />
          <span className="text-white/80">连续学习</span>
          <span className="text-orange-400 font-bold ml-auto">{status.streak} 天</span>
        </div>
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <GoalSettingModal
          currentGoal={status.dailyGoal}
          onSave={handleGoalChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
