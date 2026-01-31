import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Exercise } from '../../types';
import { api } from '../../services/api';
import { BookOpen, CheckCircle, Circle, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface ExerciseListProps {
  onSelectExercise: (exercise: Exercise) => void;
}

interface ExerciseListItem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  xp: number;
  completed: boolean;
  completedCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HARD: 'bg-red-500',
};

export default function ExerciseList({ onSelectExercise }: ExerciseListProps) {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);
  const [categories, setCategories] = useState<string[]>([t('common.all')]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState(t('common.all'));
  const [selectedDifficulty, setSelectedDifficulty] = useState(t('common.all'));
  const [selectedStatus, setSelectedStatus] = useState(t('common.all'));
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const difficultyLabels: Record<string, string> = {
    EASY: t('exercises.easy'),
    MEDIUM: t('exercises.medium'),
    HARD: t('exercises.hard'),
  };

  const difficulties = [t('common.all'), 'EASY', 'MEDIUM', 'HARD'];

  // 获取分类列表
  useEffect(() => {
    api.getExerciseCategories('EXERCISE_LIBRARY')
      .then(cats => setCategories([t('common.all'), ...cats]))
      .catch(console.error);
  }, [t]);

  // 获取练习题列表
  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        source: string;
        page: number;
        limit: number;
        category?: string;
        difficulty?: string;
        status?: string;
        search?: string;
      } = {
        source: 'EXERCISE_LIBRARY',
        page: currentPage,
        limit: 20,
      };

      if (selectedCategory !== t('common.all')) params.category = selectedCategory;
      if (selectedDifficulty !== t('common.all')) params.difficulty = selectedDifficulty;
      if (selectedStatus === 'completed') params.status = 'completed';
      if (selectedStatus === 'incomplete') params.status = 'incomplete';
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await api.getExercises(params);

      setExercises(response.exercises);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, selectedDifficulty, selectedStatus, searchQuery, t]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // 重置页码当筛选条件变化时
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery]);

  // 计算完成统计
  const completedCount = exercises.filter(e => e.completed).length;
  const totalCount = pagination?.total || exercises.length;

  // 加载状态
  if (loading && exercises.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-400">{t('exercises.loadingExercises')}</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && exercises.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchExercises}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* 头部统计 */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={24} className="text-blue-400" />
          <h2 className="text-xl font-bold">{t('exercises.title')}</h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            {t('exercises.completionProgress')}: <span className="text-green-400 font-bold">{completedCount}</span> / {totalCount}
          </span>
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('exercises.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 筛选器 */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        {/* 分类筛选 */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">{t('exercises.category')}</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 难度筛选 */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">{t('exercises.difficulty')}</label>
          <div className="flex gap-2">
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {diff === t('common.all') ? t('common.all') : difficultyLabels[diff]}
              </button>
            ))}
          </div>
        </div>

        {/* 状态筛选 */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">{t('exercises.status')}</label>
          <div className="flex gap-2">
            {[t('common.all'), 'incomplete', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status === t('common.all') ? t('common.all') : status === 'completed' ? t('exercises.completed') : t('exercises.incomplete')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
          </div>
        )}

        {!loading && exercises.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>{t('exercises.noExercisesFound')}</p>
          </div>
        )}

        <div className="space-y-2">
          {exercises.map(exercise => (
            <div
              key={exercise.id}
              onClick={() => onSelectExercise(exercise as unknown as Exercise)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                exercise.completed
                  ? 'bg-green-900/30 border border-green-700 hover:bg-green-900/50'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {exercise.completed ? (
                    <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-gray-500 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-medium">{exercise.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{exercise.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className="text-xs text-gray-400">{exercise.category}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${difficultyColors[exercise.difficulty] || 'bg-gray-500'} text-white`}>
                    {difficultyLabels[exercise.difficulty] || exercise.difficulty}
                  </span>
                  <span className="text-xs text-yellow-400">+{exercise.xp} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {t('exercises.page', { current: pagination.page, total: pagination.totalPages, count: pagination.total })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
