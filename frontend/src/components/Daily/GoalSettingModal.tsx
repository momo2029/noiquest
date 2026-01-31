import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DailyGoalLevel } from '../../types';
import { X, Target, Zap } from 'lucide-react';

interface GoalSettingModalProps {
  currentGoal: DailyGoalLevel;
  onSave: (goal: DailyGoalLevel) => void;
  onClose: () => void;
}

export default function GoalSettingModal({ currentGoal, onSave, onClose }: GoalSettingModalProps) {
  const { t } = useTranslation();
  const [selectedGoal, setSelectedGoal] = useState<DailyGoalLevel>(currentGoal);

  const goalOptions = [
    { level: 'CASUAL' as DailyGoalLevel, label: t('daily.casual'), xp: 10, description: t('daily.casualDesc') },
    { level: 'REGULAR' as DailyGoalLevel, label: t('daily.regular'), xp: 20, description: t('daily.regularDesc') },
    { level: 'SERIOUS' as DailyGoalLevel, label: t('daily.serious'), xp: 30, description: t('daily.seriousDesc') },
    { level: 'INTENSE' as DailyGoalLevel, label: t('daily.intense'), xp: 50, description: t('daily.intenseDesc') },
  ];

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
            <h2 className="text-xl font-bold text-white">{t('daily.setGoalTitle')}</h2>
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
            {t('daily.goalDescription')}
          </p>

          {/* 目标选项 */}
          <div className="space-y-3">
            {goalOptions.map(option => (
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
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-yellow-900 rounded-xl font-bold transition-colors"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
