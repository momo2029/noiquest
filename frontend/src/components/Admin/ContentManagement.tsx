import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Layers, FileText, BookOpen, Tag, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

type TabType = 'units' | 'lessons' | 'exercises' | 'knowledge';

interface SkillUnit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  requiredXp: number;
  isPublished: boolean;
  prerequisiteId?: string;
  lessons: { id: string; title: string; orderIndex: number; isPublished: boolean }[];
  _count: { exercises: number; lessons: number };
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  isPublished: boolean;
  unitId: string;
  unit: { id: string; title: string };
  _count: { exercises: number };
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  difficulty: string;
  xp: number;
  isPublished: boolean;
  unitId?: string;
  lessonId?: string;
  unit?: { id: string; title: string };
  lesson?: { id: string; title: string };
  questionData?: any;
  starterCode?: string;
  hint?: string;
  solution?: string;
  knowledgePoints?: { knowledgePoint: KnowledgePoint }[];
}

interface KnowledgePoint {
  id: string;
  name: string;
  category: string;
  orderIndex: number;
  _count?: { exercises: number };
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('units');
  const [units, setUnits] = useState<SkillUnit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 筛选状态
  const [filterUnitId, setFilterUnitId] = useState<string>('');
  const [filterLessonId, setFilterLessonId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  // 编辑状态
  const [editingUnit, setEditingUnit] = useState<Partial<SkillUnit> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [editingExercise, setEditingExercise] = useState<Partial<Exercise> | null>(null);
  const [editingKnowledge, setEditingKnowledge] = useState<Partial<KnowledgePoint> | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // 初始加载units（用于下拉选择）
  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, page, filterUnitId, filterLessonId, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'units':
          await loadUnits();
          break;
        case 'lessons':
          await loadLessons();
          break;
        case 'exercises':
          await loadExercises();
          break;
        case 'knowledge':
          await loadKnowledgePoints();
          break;
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const result = await api.getContentSkillUnits();
      setUnits(result || []);
    } catch (error) {
      console.error('加载单元失败:', error);
      setUnits([]);
    }
  };

  const loadLessons = async () => {
    try {
      const result = await api.getContentLessons(filterUnitId || undefined);
      setLessons(result || []);
    } catch (error) {
      console.error('加载课程失败:', error);
      setLessons([]);
    }
  };

  const loadExercises = async () => {
    try {
      const result = await api.getContentExercises({
        unitId: filterUnitId || undefined,
        lessonId: filterLessonId || undefined,
        type: filterType || undefined,
        page,
        limit: 20
      });
      setExercises(result.exercises || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('加载题目失败:', error);
      setExercises([]);
    }
  };

  const loadKnowledgePoints = async () => {
    try {
      const result = await api.getContentKnowledgePoints();
      setKnowledgePoints(result || []);
    } catch (error) {
      console.error('加载知识点失败:', error);
      setKnowledgePoints([]);
    }
  };

  // CRUD 操作 - 技能单元
  const handleSaveUnit = async () => {
    if (!editingUnit) return;
    try {
      if (editingUnit.id) {
        await api.updateContentSkillUnit(editingUnit.id, editingUnit);
      } else {
        await api.createContentSkillUnit(editingUnit as any);
      }
      setEditingUnit(null);
      loadUnits();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('确定要删除这个技能单元吗？')) return;
    try {
      await api.deleteContentSkillUnit(id);
      loadUnits();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleToggleUnitPublish = async (unit: SkillUnit) => {
    try {
      await api.updateContentSkillUnit(unit.id, { isPublished: !unit.isPublished });
      loadUnits();
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  // CRUD 操作 - 课程
  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    try {
      if (editingLesson.id) {
        await api.updateContentLesson(editingLesson.id, editingLesson);
      } else {
        await api.createContentLesson(editingLesson as any);
      }
      setEditingLesson(null);
      loadLessons();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('确定要删除这个课程吗？')) return;
    try {
      await api.deleteContentLesson(id);
      loadLessons();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // CRUD 操作 - 题目
  const handleSaveExercise = async () => {
    if (!editingExercise) return;
    try {
      if (editingExercise.id) {
        await api.updateContentExercise(editingExercise.id, editingExercise);
      } else {
        await api.createContentExercise(editingExercise);
      }
      setEditingExercise(null);
      loadExercises();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('确定要删除这道题目吗？')) return;
    try {
      await api.deleteContentExercise(id);
      loadExercises();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // CRUD 操作 - 知识点
  const handleSaveKnowledge = async () => {
    if (!editingKnowledge) return;
    try {
      if (editingKnowledge.id) {
        await api.updateContentKnowledgePoint(editingKnowledge.id, editingKnowledge);
      } else {
        await api.createContentKnowledgePoint(editingKnowledge as any);
      }
      setEditingKnowledge(null);
      loadKnowledgePoints();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('确定要删除这个知识点吗？')) return;
    try {
      await api.deleteContentKnowledgePoint(id);
      loadKnowledgePoints();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const toggleUnitExpand = (id: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedUnits(newExpanded);
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
            onClick={() => { setActiveTab('units'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'units' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Layers size={18} />
            技能单元
          </button>
          <button
            onClick={() => { setActiveTab('lessons'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'lessons' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <BookOpen size={18} />
            课程
          </button>
          <button
            onClick={() => { setActiveTab('exercises'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'exercises' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <FileText size={18} />
            题目
          </button>
          <button
            onClick={() => { setActiveTab('knowledge'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'knowledge' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Tag size={18} />
            知识点
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* 技能单元标签页 */}
            {activeTab === 'units' && (
              <div className="space-y-4">
                <button
                  onClick={() => setEditingUnit({ title: '', description: '', icon: '📚', color: 'from-blue-400 to-blue-600' })}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                >
                  <Plus size={18} /> 新建技能单元
                </button>

                <div className="space-y-3">
                  {units.map(unit => (
                    <div key={unit.id} className="bg-[#252536] rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <button onClick={() => toggleUnitExpand(unit.id)} className="text-white/50 hover:text-white">
                            {expandedUnits.has(unit.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                          <span className="text-3xl">{unit.icon}</span>
                          <div>
                            <h3 className="text-white font-bold">{unit.title}</h3>
                            <p className="text-white/50 text-sm">{unit.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50 text-sm">{unit._count.lessons} 课程 · {unit._count.exercises} 题目</span>
                          <button
                            onClick={() => handleToggleUnitPublish(unit)}
                            className={`p-2 rounded-lg ${unit.isPublished ? 'text-green-400 bg-green-500/20' : 'text-white/30 bg-white/10'}`}
                          >
                            {unit.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button onClick={() => setEditingUnit(unit)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {expandedUnits.has(unit.id) && unit.lessons.length > 0 && (
                        <div className="border-t border-white/10 p-4 pl-16 space-y-2">
                          {unit.lessons.map(lesson => (
                            <div key={lesson.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                              <span className="text-white/70">{lesson.title}</span>
                              <span className={`text-xs ${lesson.isPublished ? 'text-green-400' : 'text-white/30'}`}>
                                {lesson.isPublished ? '已发布' : '未发布'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 课程标签页 */}
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <select
                    value={filterUnitId}
                    onChange={(e) => setFilterUnitId(e.target.value)}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl border-none"
                  >
                    <option value="">全部单元</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                  </select>
                  <button
                    onClick={() => setEditingLesson({ title: '', unitId: filterUnitId || units[0]?.id })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    <Plus size={18} /> 新建课程
                  </button>
                </div>

                <div className="bg-[#252536] rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">课程名称</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">所属单元</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">题目数</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">状态</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.map(lesson => (
                        <tr key={lesson.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-white">{lesson.title}</td>
                          <td className="px-4 py-3 text-white/70">{lesson.unit.title}</td>
                          <td className="px-4 py-3 text-white/70">{lesson._count.exercises}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${lesson.isPublished ? 'text-green-400 bg-green-500/20' : 'text-white/50 bg-white/10'}`}>
                              {lesson.isPublished ? '已发布' : '未发布'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingLesson(lesson)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 题目标签页 */}
            {activeTab === 'exercises' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <select value={filterUnitId} onChange={(e) => { setFilterUnitId(e.target.value); setFilterLessonId(''); }} className="px-4 py-2 bg-white/10 text-white rounded-xl">
                    <option value="">全部单元</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                  </select>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 bg-white/10 text-white rounded-xl">
                    <option value="">全部类型</option>
                    <option value="CODING">编程题</option>
                    <option value="FILL_BLANK">填空题</option>
                    <option value="CODE_ORDER">排序题</option>
                    <option value="MULTIPLE_CHOICE">选择题</option>
                    <option value="MATCHING">配对题</option>
                    <option value="BUG_FIX">改错题</option>
                  </select>
                  <button
                    onClick={() => setEditingExercise({ title: '', description: '', category: '基础', difficulty: 'EASY', type: 'CODING', xp: 10 })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    <Plus size={18} /> 新建题目
                  </button>
                </div>

                <div className="bg-[#252536] rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">题目</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">类型</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">难度</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">XP</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercises.map(exercise => (
                        <tr key={exercise.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3">
                            <p className="text-white font-medium">{exercise.title}</p>
                            {exercise.unit && <p className="text-white/50 text-xs">{exercise.unit.title}</p>}
                          </td>
                          <td className="px-4 py-3 text-white/70 text-sm">{getTypeLabel(exercise.type)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                              {exercise.difficulty === 'EASY' ? '简单' : exercise.difficulty === 'MEDIUM' ? '中等' : '困难'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-yellow-400 font-medium">{exercise.xp}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingExercise(exercise)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteExercise(exercise.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-30">上一页</button>
                    <span className="text-white/50">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-30">下一页</button>
                  </div>
                )}
              </div>
            )}

            {/* 知识点标签页 */}
            {activeTab === 'knowledge' && (
              <div className="space-y-4">
                <button
                  onClick={() => setEditingKnowledge({ name: '', category: '语法' })}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                >
                  <Plus size={18} /> 新建知识点
                </button>

                <div className="bg-[#252536] rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">知识点</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">分类</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">关联题目</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {knowledgePoints.map(kp => (
                        <tr key={kp.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-white">{kp.name}</td>
                          <td className="px-4 py-3 text-white/70">{kp.category}</td>
                          <td className="px-4 py-3 text-white/70">{kp._count?.exercises || 0}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingKnowledge(kp)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteKnowledge(kp.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 技能单元编辑弹窗 */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252536] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{editingUnit.id ? '编辑' : '新建'}技能单元</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">标题</label>
                <input type="text" value={editingUnit.title || ''} onChange={e => setEditingUnit({...editingUnit, title: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">描述</label>
                <textarea value={editingUnit.description || ''} onChange={e => setEditingUnit({...editingUnit, description: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">图标</label>
                  <input type="text" value={editingUnit.icon || ''} onChange={e => setEditingUnit({...editingUnit, icon: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">所需XP</label>
                  <input type="number" value={editingUnit.requiredXp || 0} onChange={e => setEditingUnit({...editingUnit, requiredXp: Number(e.target.value)})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingUnit(null)} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"><X size={18} /></button>
              <button onClick={handleSaveUnit} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"><Save size={18} /> 保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 课程编辑弹窗 */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252536] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{editingLesson.id ? '编辑' : '新建'}课程</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">标题</label>
                <input type="text" value={editingLesson.title || ''} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">所属单元</label>
                <select value={editingLesson.unitId || ''} onChange={e => setEditingLesson({...editingLesson, unitId: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl">
                  {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">描述</label>
                <textarea value={editingLesson.description || ''} onChange={e => setEditingLesson({...editingLesson, description: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingLesson(null)} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"><X size={18} /></button>
              <button onClick={handleSaveLesson} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"><Save size={18} /> 保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 题目编辑弹窗 */}
      {editingExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-[#252536] rounded-2xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">{editingExercise.id ? '编辑' : '新建'}题目</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-white/70 text-sm mb-1">标题</label>
                <input type="text" value={editingExercise.title || ''} onChange={e => setEditingExercise({...editingExercise, title: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">描述</label>
                <textarea value={editingExercise.description || ''} onChange={e => setEditingExercise({...editingExercise, description: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">类型</label>
                  <select value={editingExercise.type || 'CODING'} onChange={e => setEditingExercise({...editingExercise, type: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl">
                    <option value="CODING">编程题</option>
                    <option value="FILL_BLANK">填空题</option>
                    <option value="CODE_ORDER">排序题</option>
                    <option value="MULTIPLE_CHOICE">选择题</option>
                    <option value="MATCHING">配对题</option>
                    <option value="BUG_FIX">改错题</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">难度</label>
                  <select value={editingExercise.difficulty || 'EASY'} onChange={e => setEditingExercise({...editingExercise, difficulty: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl">
                    <option value="EASY">简单</option>
                    <option value="MEDIUM">中等</option>
                    <option value="HARD">困难</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">XP</label>
                  <input type="number" value={editingExercise.xp || 10} onChange={e => setEditingExercise({...editingExercise, xp: Number(e.target.value)})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">所属单元</label>
                  <select value={editingExercise.unitId || ''} onChange={e => setEditingExercise({...editingExercise, unitId: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl">
                    <option value="">无</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">分类</label>
                  <input type="text" value={editingExercise.category || ''} onChange={e => setEditingExercise({...editingExercise, category: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">提示</label>
                <textarea value={editingExercise.hint || ''} onChange={e => setEditingExercise({...editingExercise, hint: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingExercise(null)} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"><X size={18} /></button>
              <button onClick={handleSaveExercise} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"><Save size={18} /> 保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 知识点编辑弹窗 */}
      {editingKnowledge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252536] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{editingKnowledge.id ? '编辑' : '新建'}知识点</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">名称</label>
                <input type="text" value={editingKnowledge.name || ''} onChange={e => setEditingKnowledge({...editingKnowledge, name: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">分类</label>
                <select value={editingKnowledge.category || '语法'} onChange={e => setEditingKnowledge({...editingKnowledge, category: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl">
                  <option value="语法">语法</option>
                  <option value="算法">算法</option>
                  <option value="数据结构">数据结构</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingKnowledge(null)} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"><X size={18} /></button>
              <button onClick={handleSaveKnowledge} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"><Save size={18} /> 保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
