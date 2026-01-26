import { useState, useEffect } from 'react';
import { Trophy, Lock, CheckCircle, Star, Flame, Target, Zap, Award } from 'lucide-react';
import { api } from '../../services/api';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  condition: { type: string; value: number };
  reward: { xp: number; gems: number };
  rarity: string;
  orderIndex: number;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  percentage?: number;
}

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  COMMON: { bg: 'bg-gray-700', border: 'border-gray-600', text: 'text-gray-300' },
  RARE: { bg: 'bg-blue-900/50', border: 'border-blue-500', text: 'text-blue-400' },
  EPIC: { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-400' },
  LEGENDARY: { bg: 'bg-yellow-900/50', border: 'border-yellow-500', text: 'text-yellow-400' },
};

const RARITY_NAMES: Record<string, string> = {
  COMMON: '普通',
  RARE: '稀有',
  EPIC: '史诗',
  LEGENDARY: '传说',
};

const CATEGORY_ICONS: Record<string, any> = {
  MILESTONE: Target,
  STREAK: Flame,
  MASTERY: Star,
  PERFECT: Award,
  SPEED: Zap,
  COLLECTION: Trophy,
};

const CATEGORY_NAMES: Record<string, string> = {
  MILESTONE: '里程碑',
  STREAK: '连续学习',
  MASTERY: '掌握度',
  PERFECT: '完美表现',
  SPEED: '速度',
  COLLECTION: '收集',
};

export default function AchievementsView() {
  const [achievements, setAchievements] = useState<{
    unlocked: Achievement[];
    inProgress: Achievement[];
    locked: Achievement[];
  }>({ unlocked: [], inProgress: [], locked: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'inProgress' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await api.getUserAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    let result: Achievement[] = [];

    if (filter === 'all' || filter === 'unlocked') {
      result = [...result, ...achievements.unlocked.map(a => ({ ...a, status: 'unlocked' }))];
    }
    if (filter === 'all' || filter === 'inProgress') {
      result = [...result, ...achievements.inProgress.map(a => ({ ...a, status: 'inProgress' }))];
    }
    if (filter === 'all' || filter === 'locked') {
      result = [...result, ...achievements.locked.map(a => ({ ...a, status: 'locked' }))];
    }

    if (categoryFilter !== 'all') {
      result = result.filter(a => a.category === categoryFilter);
    }

    return result;
  };

  const totalUnlocked = achievements.unlocked.length;
  const totalAchievements = achievements.unlocked.length + achievements.inProgress.length + achievements.locked.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 统计卡片 */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
            <Trophy size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">成就中心</h2>
            <p className="text-gray-400">
              已解锁 <span className="text-yellow-400 font-bold">{totalUnlocked}</span> / {totalAchievements} 个成就
            </p>
          </div>
          <div className="ml-auto">
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(totalUnlocked / totalAchievements) * 352} 352`}
                  className="text-yellow-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {Math.round((totalUnlocked / totalAchievements) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'unlocked', label: `已解锁 (${achievements.unlocked.length})` },
            { key: 'inProgress', label: `进行中 (${achievements.inProgress.length})` },
            { key: 'locked', label: `未解锁 (${achievements.locked.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300"
        >
          <option value="all">所有类型</option>
          {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </div>

      {/* 成就列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getFilteredAchievements().map((achievement: any) => {
          const rarityStyle = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.COMMON;
          const CategoryIcon = CATEGORY_ICONS[achievement.category] || Trophy;
          const isUnlocked = achievement.status === 'unlocked';
          const isInProgress = achievement.status === 'inProgress';

          return (
            <div
              key={achievement.id}
              className={`${rarityStyle.bg} border-2 ${rarityStyle.border} rounded-xl p-4 transition-all ${
                !isUnlocked ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-4xl ${!isUnlocked ? 'grayscale' : ''}`}>
                  {achievement.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{achievement.name}</h3>
                    {isUnlocked ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <Lock size={16} className="text-gray-500" />
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>

                  {/* 进度条 */}
                  {isInProgress && achievement.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>进度</span>
                        <span>{achievement.progress} / {achievement.target}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${achievement.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 解锁时间 */}
                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      解锁于 {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}

                  {/* 奖励和标签 */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${rarityStyle.text} bg-black/20`}>
                      {RARITY_NAMES[achievement.rarity]}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-black/20 flex items-center gap-1">
                      <CategoryIcon size={12} />
                      {CATEGORY_NAMES[achievement.category]}
                    </span>
                    <span className="text-xs text-yellow-400 ml-auto">
                      +{achievement.reward?.xp || 0} XP
                    </span>
                    {achievement.reward?.gems > 0 && (
                      <span className="text-xs text-blue-400">
                        +{achievement.reward.gems} 💎
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {getFilteredAchievements().length === 0 && (
        <div className="text-center py-12 text-gray-400">
          没有符合条件的成就
        </div>
      )}
    </div>
  );
}
