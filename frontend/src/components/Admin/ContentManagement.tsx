import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Layers, FileText, CheckCircle, XCircle } from 'lucide-react';

interface ExerciseData {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  difficulty: string;
  xp: number;
  unit?: { id: string; title: string };
  lesson?: { id: string; title: string };
  completedCount: number;
  submissionCount: number;
  mistakeCount: number;
}

interface UnitData {
  id: string;
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
  lessonCount: number;
  exerciseCount: number;
  userProgressCount: number;
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<'exercises' | 'units'>('exercises');
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'exercises') {
      loadExercises();
    } else {
      loadUnits();
    }
  }, [activeTab, page]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const result = await api.getAdminExercises({ page, limit: 20 });
      setExercises(result.exercises);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      setLoading(true);
      const result = await api.getAdminUnits();
      setUnits(result);
    } catch (error) {
      console.error('Failed to load units:', error);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-400 bg-green-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
      case 'HARD': return 'text-red-400 bg-red-500/20';
      default: return 'text-white/50 bg-white/10';
    }
  };

  return (
    <div className="flex-1 bg-[#1a1a2e] overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">内容管理</h1>

        {/* 标签页 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('exercises'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'exercises' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <FileText size={18} />
            练习题目
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'units' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Layers size={18} />
            技能单元
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'exercises' ? (
          <>
            {/* 练习题列表 */}
            <div className="bg-[#252536] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">题目</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">类型</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">难度</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">分类</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">完成数</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">错误数</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map(exercise => (
                    <tr key={exercise.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{exercise.title}</p>
                        {exercise.unit && (
                          <p className="text-white/50 text-xs">{exercise.unit.title}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/70 text-sm">{getTypeLabel(exercise.type)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty === 'EASY' ? '简单' : exercise.difficulty === 'MEDIUM' ? '中等' : '困难'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/70 text-sm">{exercise.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle size={14} />
                          <span>{exercise.completedCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-red-400">
                          <XCircle size={14} />
                          <span>{exercise.mistakeCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-yellow-400 font-medium">{exercise.xp}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-30"
                >
                  上一页
                </button>
                <span className="text-white/50">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-30"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          /* 技能单元列表 */
          <div className="grid grid-cols-2 gap-6">
            {units.map(unit => (
              <div key={unit.id} className="bg-[#252536] rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{unit.icon}</span>
                  <div>
                    <h3 className="text-white font-bold text-lg">{unit.title}</h3>
                    <p className="text-white/50 text-sm">{unit.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-400">{unit.lessonCount}</p>
                    <p className="text-white/50 text-xs">课程</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-400">{unit.exerciseCount}</p>
                    <p className="text-white/50 text-xs">题目</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-purple-400">{unit.userProgressCount}</p>
                    <p className="text-white/50 text-xs">学习人数</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
