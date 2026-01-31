import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import {
  Users,
  BookOpen,
  Activity,
  UserPlus,
  Zap,
  Target,
  Award
} from 'lucide-react';

interface DashboardData {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    newToday: number;
    newThisWeek: number;
    activeToday: number;
  };
  content: {
    exercises: number;
    units: number;
    courses: number;
  };
  learning: {
    totalProgress: number;
    completedProgress: number;
    completionRate: number;
    totalSubmissions: number;
  };
  trends: {
    dailyActiveUsers: { day: string; count: number }[];
    dailyNewUsers: { day: string; count: number }[];
  };
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const result = await api.getAdminDashboard();
      setData(result);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/50">
        {t('common.error')}
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, subValue, color }: {
    icon: any;
    label: string;
    value: number | string;
    subValue?: string;
    color: string;
  }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <Icon size={28} className="opacity-80" />
        <span className="text-3xl font-black">{value}</span>
      </div>
      <p className="font-medium">{label}</p>
      {subValue && <p className="text-sm opacity-70 mt-1">{subValue}</p>}
    </div>
  );

  return (
    <div className="flex-1 bg-[#1a1a2e] overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">{t('admin.dashboard')}</h1>
          <p className="text-white/60">{t('admin.systemOverview')}</p>
        </div>

        {/* 用户统计卡片 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label={t('admin.totalUsers')}
            value={data.users.total}
            subValue={`${t('auth.student')} ${data.users.students} / ${t('auth.teacher')} ${data.users.teachers}`}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={UserPlus}
            label={t('admin.newToday')}
            value={data.users.newToday}
            subValue={t('admin.thisWeek', { count: data.users.newThisWeek })}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Activity}
            label={t('admin.activeToday')}
            value={data.users.activeToday}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Target}
            label={t('admin.completionRate')}
            value={`${data.learning.completionRate}%`}
            subValue={`${data.learning.completedProgress}/${data.learning.totalProgress}`}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* 内容统计 */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#252536] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-blue-400" size={24} />
              <h3 className="text-white font-bold text-lg">{t('admin.contentStats')}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('admin.skillUnits')}</span>
                <span className="text-white font-bold">{data.content.units}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('admin.coursesCount')}</span>
                <span className="text-white font-bold">{data.content.courses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('admin.exercisesCount')}</span>
                <span className="text-white font-bold">{data.content.exercises}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#252536] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-yellow-400" size={24} />
              <h3 className="text-white font-bold text-lg">{t('admin.learningData')}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('admin.totalSubmissions')}</span>
                <span className="text-white font-bold">{data.learning.totalSubmissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('admin.completedRecords')}</span>
                <span className="text-white font-bold">{data.learning.completedProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('admin.inProgressCount')}</span>
                <span className="text-white font-bold">{data.learning.totalProgress - data.learning.completedProgress}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#252536] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="text-green-400" size={24} />
              <h3 className="text-white font-bold text-lg">{t('admin.userDistribution')}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('auth.student')}</span>
                <span className="text-white font-bold">{data.users.students}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('auth.teacher')}</span>
                <span className="text-white font-bold">{data.users.teachers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">{t('admin.admins')}</span>
                <span className="text-white font-bold">{data.users.admins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 趋势图表 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 活跃用户趋势 */}
          <div className="bg-[#252536] rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">{t('admin.activeUsersLast7Days')}</h3>
            <div className="h-48 flex items-end gap-2">
              {data.trends.dailyActiveUsers.map((d, i) => {
                const maxCount = Math.max(...data.trends.dailyActiveUsers.map(x => x.count), 1);
                const height = (d.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: d.count > 0 ? '8px' : '0' }}
                    />
                    <span className="text-white/50 text-xs">
                      {new Date(d.day).getDate()}{t('admin.day')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 新增用户趋势 */}
          <div className="bg-[#252536] rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">{t('admin.newUsersLast7Days')}</h3>
            <div className="h-48 flex items-end gap-2">
              {data.trends.dailyNewUsers.map((d, i) => {
                const maxCount = Math.max(...data.trends.dailyNewUsers.map(x => x.count), 1);
                const height = (d.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-green-500 rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: d.count > 0 ? '8px' : '0' }}
                    />
                    <span className="text-white/50 text-xs">
                      {new Date(d.day).getDate()}{t('admin.day')}
                    </span>
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
