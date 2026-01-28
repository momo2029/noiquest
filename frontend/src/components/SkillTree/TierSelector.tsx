import { Lock } from 'lucide-react';
import { TierInfo, Tier } from '../../types';

interface TierSelectorProps {
  tiers: TierInfo[];
  selectedTier: Tier;
  onSelectTier: (tier: Tier) => void;
}

export default function TierSelector({ tiers, selectedTier, onSelectTier }: TierSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-[#1e1e2e] rounded-xl">
      {tiers.map((tier) => {
        const isSelected = tier.id === selectedTier;
        const isLocked = !tier.unlocked;

        return (
          <button
            key={tier.id}
            onClick={() => !isLocked && onSelectTier(tier.id)}
            disabled={isLocked}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${isSelected
                ? 'text-white shadow-lg'
                : isLocked
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
            style={{
              backgroundColor: isSelected ? tier.color : 'transparent',
            }}
            title={isLocked ? tier.unlockRequirement || '未解锁' : tier.name}
          >
            <div className="flex items-center gap-2">
              {isLocked && <Lock size={14} />}
              <span>{tier.name}</span>
              {!isLocked && tier.completionRate > 0 && (
                <span className="text-xs opacity-70">
                  {tier.completionRate}%
                </span>
              )}
            </div>

            {/* 进度条 */}
            {isSelected && tier.completionRate > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
                <div
                  className="h-full bg-white/30"
                  style={{ width: `${tier.completionRate}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
