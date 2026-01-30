import { useState, useEffect } from 'react';
import { BarChart3, Clock, Target, TrendingUp, Brain, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api';

interface WeeklyData {
  period: string;
  summary: {
    totalDuration: number;
    totalExercises: number;
    totalCorrect: number;
    correctRate: number;
    xpEarned: number;
    sessionsCompleted: number;
    reviewsCompleted: number;
    streakDays: number;
  };
  dailyBreakdown: { date: string; duration: number; exercises: number; correctRate: number; xp: number }[];
  peakHours: { hour: number; sessions: number; avgDuration: number }[];
  comparison: { duration: string; exercises: string; correctRate: string };
}

interface KnowledgeMap {
  categories: {
    name: string;
    masteryLevel: number;
    knowledgePoints: { name: string; masteryLevel: number; reviewDue: boolean; reviewCount: number }[];
  }[];
  overallMastery: number;
  weakestPoints: string[];
  strongestPoints: string[];
}

export default function AnalyticsView() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weekly' | 'knowledge'>('weekly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [weekly, knowledge] = await Promise.all([
        api.getWeeklyAnalytics(),
        api.getKnowledgeMap(),
      ]);
      setWeeklyData(weekly);
      setKnowledgeMap(knowledge);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
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
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <BarChart3 className="text-blue-400" size={28} />
        <h1 className="text-2xl font-bold">学习报告</h1>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Calendar className="inline mr-2" size={16} />
          周报
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'knowledge' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Brain className="inline mr-2" size={16} />
          知识图谱
        </button>
      </div>

      {activeTab === 'weekly' && weeklyData && (
        <>
          {/* 周报摘要 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Clock size={16} />
                <span className="text-sm">学习时长</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(weeklyData.summary.totalDuration)}</p>
              <p className={`text-sm ${weeklyData.comparison.duration.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyData.comparison.duration} vs 上周
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Target size={16} />
                <span className="text-sm">完成题目</span>
              </div>
              <p className="text-2xl font-bold">{weeklyData.summary.totalExercises}</p>
              <p className={`text-sm ${weeklyData.comparison.exercises.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyData.comparison.exercises} vs 上周
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <CheckCircle size={16} />
                <span className="text-sm">正确率</span>
              </div>
              <p className="text-2xl font-bold">{weeklyData.summary.correctRate}%</p>
              <p className={`text-sm ${weeklyData.comparison.correctRate.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyData.comparison.correctRate} vs 上周
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <TrendingUp size={16} />
                <span className="text-sm">获得 XP</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{weeklyData.summary.xpEarned}</p>
              <p className="text-sm text-gray-400">
                连续 {weeklyData.summary.streakDays} 天学习
              </p>
            </div>
          </div>

          {/* 每日详情 */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="font-bold mb-4">每日学习情况</h3>
            <div className="space-y-3">
              {weeklyData.dailyBreakdown.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-400">
                    {getDayName(day.date)}
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-700 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${Math.min((day.exercises / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm">
                    {day.exercises} 题
                  </div>
                  <div className="w-16 text-right text-sm text-gray-400">
                    {day.correctRate}%
                  </div>
                  <div className="w-20 text-right text-sm text-yellow-400">
                    +{day.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 学习时段 */}
          {weeklyData.peakHours.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="font-bold mb-4">最佳学习时段</h3>
              <div className="flex gap-4">
                {weeklyData.peakHours.map((peak) => (
                  <div key={peak.hour} className="flex-1 bg-gray-700 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-400">{peak.hour}:00</p>
                    <p className="text-sm text-gray-400">{peak.sessions} 次学习</p>
                    <p className="text-xs text-gray-500">平均 {Math.round(peak.avgDuration / 60)} 分钟</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'knowledge' && knowledgeMap && (
        <>
          {/* 总体掌握度 */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">总体掌握度</h3>
                <p className="text-gray-400">基于你的学习和复习表现</p>
              </div>
              <div className="text-4xl font-bold text-purple-400">
                {Math.round(knowledgeMap.overallMastery * 100)}%
              </div>
            </div>
          </div>

          {/* 强项和弱项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle size={16} />
                强项
              </h3>
              <div className="space-y-2">
                {knowledgeMap.strongestPoints.map((point) => (
                  <div key={point} className="px-3 py-2 bg-green-500/10 rounded-lg text-sm">
                    {point}
                  </div>
                ))}
                {knowledgeMap.strongestPoints.length === 0 && (
                  <p className="text-gray-400 text-sm">继续学习，发现你的强项</p>
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                <XCircle size={16} />
                需要加强
              </h3>
              <div className="space-y-2">
                {knowledgeMap.weakestPoints.map((point) => (
                  <div key={point} className="px-3 py-2 bg-red-500/10 rounded-lg text-sm">
                    {point}
                  </div>
                ))}
                {knowledgeMap.weakestPoints.length === 0 && (
                  <p className="text-gray-400 text-sm">太棒了，没有明显的弱项</p>
                )}
              </div>
            </div>
          </div>

          {/* 知识点详情 */}
          <div className="space-y-4">
            {knowledgeMap.categories.map((category) => (
              <div key={category.name} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">{category.name}</h3>
                  <span className="text-sm text-gray-400">
                    掌握度 {Math.round(category.masteryLevel * 100)}%
                  </span>
                </div>

                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${category.masteryLevel * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {category.knowledgePoints.map((kp) => (
                    <div
                      key={kp.name}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                        kp.reviewDue ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-gray-700'
                      }`}
                    >
                      <span>{kp.name}</span>
                      <span className={`text-xs ${
                        kp.masteryLevel >= 0.8 ? 'text-green-400' :
                        kp.masteryLevel >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {Math.round(kp.masteryLevel * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
