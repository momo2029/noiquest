import { useState } from 'react';
import { DailyGoalLevel } from '../../types';
import { X, Target, Zap } from 'lucide-react';

interface GoalSettingModalProps {
  currentGoal: DailyGoalLevel;
  onSave: (goal: DailyGoalLevel) => void;
  onClose: () => void;
}

const GOAL_OPTIONS: { level: DailyGoalLevel; label: string; xp: number; description: string }[] = [
  { level: 'CASUAL', label: '休闲', xp: 10, description: '每天轻松学习' },
  { level: 'REGULAR', label: '常规', xp: 20, description: '保持稳定进步' },
  { level: 'SERIOUS', label: '认真', xp: 30, description: '加快学习速度' },
  { level: 'INTENSE', label: '挑战', xp: 50, description: '全力以赴' },
];

export default function GoalSettingModal({ currentGoal, onSave, onClose }: GoalSettingModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<DailyGoalLevel>(currentGoal);

  const handleSave = () => {
    onSave(selectedGoal);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#252536] rounded-2xl w-[400px] shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Target className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold text-white">设置每日目标</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <p className="text-white/70 text-sm mb-4">
            选择适合你的每日学习目标，坚持完成可以获得额外奖励！
          </p>

          {/* 目标选项 */}
          <div className="space-y-3">
            {GOAL_OPTIONS.map(option => (
              <button
                key={option.level}
                onClick={() => setSelectedGoal(option.level)}
                className={`
                  w-full p-4 rounded-xl border-2 text-left transition-all
                  ${selectedGoal === option.level
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{option.label}</p>
                    <p className="text-white/50 text-sm">{option.description}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Zap className="text-yellow-400" size={16} />
                    <span className="text-yellow-400 font-bold">{option.xp} XP</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-yellow-900 rounded-xl font-bold transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
