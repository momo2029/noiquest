import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Clock, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  name: string;
  avatar: string;
  xp: number;
  league: string;
}

interface LeagueInfo {
  currentLeague: string;
  leagueName: string;
  leagueColor: string;
  weeklyXp: number;
  weeklyRank: number;
  totalInLeague: number;
  promotionZone: { threshold: number; inZone: boolean; xpNeeded: number };
  demotionZone: { threshold: number; inZone: boolean; safe: boolean };
  rewards: { xpMultiplier: number; weeklyBonus: number };
  endsIn: number;
  endsAt: string;
}

const LEAGUE_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  DIAMOND: '#B9F2FF',
  MASTER: '#9B59B6',
};

const LEAGUE_NAMES: Record<string, string> = {
  BRONZE: '青铜',
  SILVER: '白银',
  GOLD: '黄金',
  DIAMOND: '钻石',
  MASTER: '大师',
};

export default function LeaderboardView() {
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'>('WEEKLY');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; xp: number } | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leaderboardData, league] = await Promise.all([
        api.getLeaderboard(period),
        api.getLeagueInfo(),
      ]);

      setEntries(leaderboardData.entries);
      setMyRank(leaderboardData.myRank);
      setTotalParticipants(leaderboardData.totalParticipants);
      setLeagueInfo(league);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}天 ${hours % 24}小时`;
    }
    return `${hours}小时 ${minutes}分钟`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-gray-400 font-bold w-6 text-center">{rank}</span>;
  };

  const periodLabels: Record<string, string> = {
    DAILY: '今日',
    WEEKLY: '本周',
    MONTHLY: '本月',
    ALL_TIME: '总榜',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 联赛信息卡片 */}
      {leagueInfo && (
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${leagueInfo.leagueColor}40, ${leagueInfo.leagueColor}20)` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: leagueInfo.leagueColor }}
              >
                <Trophy />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{leagueInfo.leagueName}联赛</h2>
                <p className="text-sm opacity-80">第 {leagueInfo.weeklyRank} 名 / {leagueInfo.totalInLeague} 人</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{leagueInfo.weeklyXp}</p>
              <p className="text-sm opacity-80">本周 XP</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-sm opacity-80">XP 加成</p>
              <p className="text-xl font-bold">{leagueInfo.rewards.xpMultiplier}x</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-sm opacity-80">周奖励</p>
              <p className="text-xl font-bold">+{leagueInfo.rewards.weeklyBonus}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-sm opacity-80">结算倒计时</p>
              <p className="text-lg font-bold flex items-center justify-center gap-1">
                <Clock size={16} />
                {formatTime(leagueInfo.endsIn)}
              </p>
            </div>
          </div>

          {/* 晋级/降级提示 */}
          <div className="mt-4 flex gap-4">
            {leagueInfo.promotionZone.inZone ? (
              <div className="flex-1 bg-green-500/20 rounded-lg p-3 text-center">
                <TrendingUp className="inline mr-2" size={16} />
                <span className="text-green-300">晋级区</span>
              </div>
            ) : leagueInfo.promotionZone.xpNeeded > 0 ? (
              <div className="flex-1 bg-white/10 rounded-lg p-3 text-center">
                <span className="opacity-80">距晋级还需 </span>
                <span className="font-bold">{leagueInfo.promotionZone.xpNeeded} XP</span>
              </div>
            ) : null}

            {leagueInfo.demotionZone.inZone && (
              <div className="flex-1 bg-red-500/20 rounded-lg p-3 text-center">
                <span className="text-red-300">降级区</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 排行榜 */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        {/* 标题和周期选择 */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            排行榜
          </h2>

          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {periodLabels[period]}
              <ChevronDown size={16} />
            </button>

            {showPeriodDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                {Object.entries(periodLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPeriod(key as any);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors ${
                      period === key ? 'bg-blue-600' : ''
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 我的排名 */}
        {myRank && (
          <div className="p-4 bg-blue-600/20 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-blue-400">#{myRank.rank}</span>
              <span className="text-gray-300">我的排名</span>
              <span className="ml-auto text-xl font-bold">{myRank.xp} XP</span>
            </div>
          </div>
        )}

        {/* 排行榜列表 */}
        <div className="divide-y divide-gray-700">
          {entries.map((entry, index) => (
            <div
              key={entry.userId}
              className={`p-4 flex items-center gap-4 hover:bg-gray-700/50 transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              <div className="text-2xl">{entry.avatar}</div>

              <div className="flex-1">
                <p className="font-medium">{entry.name}</p>
                <p className="text-sm text-gray-400">@{entry.username}</p>
              </div>

              <div
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${LEAGUE_COLORS[entry.league]}30`,
                  color: LEAGUE_COLORS[entry.league],
                }}
              >
                {LEAGUE_NAMES[entry.league]}
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">{entry.xp}</p>
                <p className="text-xs text-gray-400">XP</p>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              暂无排行数据
            </div>
          )}
        </div>

        {/* 底部统计 */}
        <div className="p-4 bg-gray-700/50 text-center text-sm text-gray-400">
          共 {totalParticipants} 人参与
        </div>
      </div>
    </div>
  );
}
