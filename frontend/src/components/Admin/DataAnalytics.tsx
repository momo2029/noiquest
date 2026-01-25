import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TrendingUp, Users, Zap, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  dailyXpTrend: { day: string; totalXp: number; activeUsers: number }[];
  categoryStats: { category: string; count: number }[];
  typeStats: { type: string; count: number }[];
  difficultyStats: { difficulty: string; count: number }[];
  levelDistribution: { level: number; count: number }[];
  streakDistribution: { range: string; count: number }[];
}

export default function DataAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await api.getAdminAnalytics(days);
      setData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CODING: '编程题',
      FILL_BLANK: '填空题',
      CODE_ORDER: '排序题',
      MULTIPLE_CHOICE: '选择题',
      MATCHING: '配对题',
      BUG_FIX: '改错题',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1a1a2e]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1a1a2e] text-white/50">
        加载失败
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1a1a2e] overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">数据分析</h1>
            <p className="text-white/60">学习数据统计与分析</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none"
          >
            <option value={7}>最近7天</option>
            <option value={30}>最近30天</option>
            <option value={90}>最近90天</option>
          </select>
        </div>

        {/* XP 趋势图 */}
        <div className="bg-[#252536] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-yellow-400" size={24} />
            <h3 className="text-white font-bold text-lg">每日 XP 趋势</h3>
          </div>
          <div className="h-64 flex items-end gap-1">
            {data.dailyXpTrend.map((d, i) => {
              const maxXp = Math.max(...data.dailyXpTrend.map(x => x.totalXp), 1);
              const height = (d.totalXp / maxXp) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t transition-all hover:from-yellow-400 hover:to-yellow-300"
                    style={{ height: `${height}%`, minHeight: d.totalXp > 0 ? '4px' : '0' }}
                  />
                  {/* 悬浮提示 */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {d.totalXp} XP / {d.activeUsers} 人
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-white/30 text-xs">
            <span>{data.dailyXpTrend[0]?.day ? new Date(data.dailyXpTrend[0].day).toLocaleDateString('zh-CN') : ''}</span>
            <span>{data.dailyXpTrend[data.dailyXpTrend.length - 1]?.day ? new Date(data.dailyXpTrend[data.dailyXpTrend.length - 1].day).toLocaleDateString('zh-CN') : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* 题型分布 */}
          <div className="bg-[#252536] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-blue-400" size={24} />
              <h3 className="text-white font-bold text-lg">题型分布</h3>
            </div>
            <div className="space-y-3">
              {data.typeStats.map(stat => {
                const total = data.typeStats.reduce((sum, s) => sum + s.count, 0);
                const percent = total > 0 ? (stat.count / total) * 100 : 0;
                return (
                  <div key={stat.type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/70">{getTypeLabel(stat.type)}</span>
                      <span className="text-white">{stat.count}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 难度分布 */}
          <div className="bg-[#252536] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-yellow-400" size={24} />
              <h3 className="text-white font-bold text-lg">难度分布</h3>
            </div>
            <div className="flex items-end justify-center gap-8 h-40">
              {data.difficultyStats.map(stat => {
                const maxCount = Math.max(...data.difficultyStats.map(s => s.count), 1);
                const height = (stat.count / maxCount) * 100;
                const colors: Record<string, string> = {
                  EASY: 'bg-green-500',
                  MEDIUM: 'bg-yellow-500',
                  HARD: 'bg-red-500',
                };
                const labels: Record<string, string> = {
                  EASY: '简单',
                  MEDIUM: '中等',
                  HARD: '困难',
                };
                return (
                  <div key={stat.difficulty} className="flex flex-col items-center gap-2">
                    <span className="text-white font-bold">{stat.count}</span>
                    <div
                      className={`w-16 ${colors[stat.difficulty]} rounded-t`}
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    />
                    <span className="text-white/50 text-sm">{labels[stat.difficulty]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 用户等级分布 */}
          <div className="bg-[#252536] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-purple-400" size={24} />
              <h3 className="text-white font-bold text-lg">用户等级分布</h3>
            </div>
            <div className="h-48 flex items-end gap-1">
              {data.levelDistribution.slice(0, 20).map((stat, i) => {
                const maxCount = Math.max(...data.levelDistribution.map(s => s.count), 1);
                const height = (stat.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-purple-500 rounded-t"
                      style={{ height: `${height}%`, minHeight: stat.count > 0 ? '4px' : '0' }}
                    />
                    <span className="text-white/30 text-xs">{stat.level}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 连续学习天数分布 */}
          <div className="bg-[#252536] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-orange-400" size={24} />
              <h3 className="text-white font-bold text-lg">连续学习天数</h3>
            </div>
            <div className="space-y-3">
              {data.streakDistribution.map(stat => {
                const total = data.streakDistribution.reduce((sum, s) => sum + stat.count, 0);
                const percent = total > 0 ? (stat.count / total) * 100 : 0;
                return (
                  <div key={stat.range}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/70">{stat.range}</span>
                      <span className="text-white">{stat.count} 人</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
