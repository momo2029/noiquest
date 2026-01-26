import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, Target, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { api } from '../../services/api';

interface OverviewStats {
  totalExercises: number;
  totalAttempts: number;
  totalUsers: number;
  activeUsers: number;
  avgCorrectRate: number;
  today: {
    exercisesCompleted: number;
    xpEarned: number;
    activeUsers: number;
  };
}

interface ExerciseStat {
  exerciseId: string;
  title: string;
  type: string;
  difficulty: string;
  category: string;
  correctRate: number;
  totalAttempts: number;
  uniqueUsers: number;
}

export default function AdminStatistics() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [difficultExercises, setDifficultExercises] = useState<ExerciseStat[]>([]);
  const [popularExercises, setPopularExercises] = useState<ExerciseStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewData, difficult, popular] = await Promise.all([
        api.getStatisticsOverview(),
        api.getDifficultExercises(10),
        api.getPopularExercises(10),
      ]);
      setOverview(overviewData);
      setDifficultExercises(difficult);
      setPopularExercises(popular);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-400 bg-green-400/10';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10';
      case 'HARD': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '简单';
      case 'MEDIUM': return '中等';
      case 'HARD': return '困难';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <BarChart3 className="text-blue-400" size={28} />
        <h1 className="text-2xl font-bold">数据统计</h1>
      </div>

      {/* 总览卡片 */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <BookOpen size={16} />
              <span className="text-sm">题目总数</span>
            </div>
            <p className="text-3xl font-bold">{overview.totalExercises}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Target size={16} />
              <span className="text-sm">答题总次数</span>
            </div>
            <p className="text-3xl font-bold">{overview.totalAttempts.toLocaleString()}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Users size={16} />
              <span className="text-sm">学生总数</span>
            </div>
            <p className="text-3xl font-bold">{overview.totalUsers}</p>
            <p className="text-sm text-green-400">
              {overview.activeUsers} 活跃
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <TrendingUp size={16} />
              <span className="text-sm">平均正确率</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {Math.round(overview.avgCorrectRate * 100)}%
            </p>
          </div>
        </div>
      )}

      {/* 今日统计 */}
      {overview && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6">
          <h3 className="font-bold mb-4">今日数据</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{overview.today.exercisesCompleted}</p>
              <p className="text-sm text-gray-400">完成题目</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{overview.today.xpEarned}</p>
              <p className="text-sm text-gray-400">发放 XP</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{overview.today.activeUsers}</p>
              <p className="text-sm text-gray-400">活跃用户</p>
            </div>
          </div>
        </div>
      )}

      {/* 难题排行 */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-400" size={20} />
          难题排行（正确率最低）
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3 pr-4">排名</th>
                <th className="pb-3 pr-4">题目</th>
                <th className="pb-3 pr-4">难度</th>
                <th className="pb-3 pr-4">正确率</th>
                <th className="pb-3 pr-4">尝试次数</th>
                <th className="pb-3">用户数</th>
              </tr>
            </thead>
            <tbody>
              {difficultExercises.map((exercise, index) => (
                <tr key={exercise.exerciseId} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 pr-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      index < 3 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{exercise.title}</p>
                    <p className="text-xs text-gray-500">{exercise.category}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${exercise.correctRate * 100}%` }}
                        />
                      </div>
                      <span className="text-red-400 text-sm">
                        {Math.round(exercise.correctRate * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{exercise.totalAttempts}</td>
                  <td className="py-3 text-gray-400">{exercise.uniqueUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 热门题目 */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Star className="text-yellow-400" size={20} />
          热门题目（答题次数最多）
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3 pr-4">排名</th>
                <th className="pb-3 pr-4">题目</th>
                <th className="pb-3 pr-4">难度</th>
                <th className="pb-3 pr-4">正确率</th>
                <th className="pb-3 pr-4">尝试次数</th>
                <th className="pb-3">用户数</th>
              </tr>
            </thead>
            <tbody>
              {popularExercises.map((exercise, index) => (
                <tr key={exercise.exerciseId} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 pr-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      index < 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{exercise.title}</p>
                    <p className="text-xs text-gray-500">{exercise.category}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            exercise.correctRate >= 0.7 ? 'bg-green-500' :
                            exercise.correctRate >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${exercise.correctRate * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">
                        {Math.round(exercise.correctRate * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-yellow-400 font-medium">{exercise.totalAttempts}</td>
                  <td className="py-3 text-gray-400">{exercise.uniqueUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
