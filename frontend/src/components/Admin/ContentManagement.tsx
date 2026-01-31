import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Layers, FileText, BookOpen, Tag, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight, Eye, EyeOff, GraduationCap } from 'lucide-react';
import LearningContentEditor from './LearningContentEditor';

type TabType = 'units' | 'courses' | 'exercises' | 'knowledge';

interface SkillUnit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  requiredXp: number;
  isPublished: boolean;
  code?: string;
  tier?: string;
  coreLevel?: number;
  moduleId?: number;
  moduleName?: string;
  hasContent?: boolean;
  estimatedTime?: number;
  module?: { id: number; name: string; icon: string };
  courses: { course: { id: string; code: string; title: string } }[];
  _count: { courses: number };
}

interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  objectives: string[];
  tier: string;
  orderIndex: number;
  isPublished: boolean;
  moduleId: number;
  module?: { id: number; name: string; icon: string };
  units: { unit: { id: string; title: string; code?: string } }[];
  sessions: { id: string; title: string; orderIndex: number; xpReward: number; isPublished: boolean }[];
  _count: { sessions: number; units: number };
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
  sessionExercises?: { session: { id: string; title: string; course: { id: string; code: string; title: string } } }[];
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [allKnowledgePoints, setAllKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 筛选状态
  const [filterCourseId, setFilterCourseId] = useState<string>('');
  const [filterSessionId, setFilterSessionId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterKnowledgePointId, setFilterKnowledgePointId] = useState<string>('');

  // 编辑状态
  const [editingUnit, setEditingUnit] = useState<Partial<SkillUnit> | null>(null);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [editingExercise, setEditingExercise] = useState<Partial<Exercise> | null>(null);
  const [selectedKnowledgePointIds, setSelectedKnowledgePointIds] = useState<string[]>([]);
  const [editingKnowledge, setEditingKnowledge] = useState<Partial<KnowledgePoint> | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // 学习资料编辑状态
  const [editingLearningContent, setEditingLearningContent] = useState<{ id: string; title: string } | null>(null);

  // 知识点筛选状态
  const [filterTier, setFilterTier] = useState<string>('');
  const [filterHasContent, setFilterHasContent] = useState<string>('');

  // 初始加载units（用于下拉选择）
  useEffect(() => {
    loadUnits();
    loadAllKnowledgePoints();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, page, filterCourseId, filterSessionId, filterType, filterKnowledgePointId, filterTier, filterHasContent]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'units':
          await loadUnits();
          break;
        case 'courses':
          await loadCourses();
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
      const result = await api.getAdminSkillUnits({
        tier: filterTier || undefined,
        hasContent: filterHasContent === 'true' ? true : filterHasContent === 'false' ? false : undefined,
      });
      setUnits(result.units || []);
    } catch (error) {
      console.error('加载单元失败:', error);
      setUnits([]);
    }
  };

  const loadCourses = async () => {
    try {
      const result = await api.getContentCourses();
      setCourses(result || []);
    } catch (error) {
      console.error('加载课程失败:', error);
      setCourses([]);
    }
  };

  const loadExercises = async () => {
    try {
      const result = await api.getContentExercises({
        courseId: filterCourseId || undefined,
        sessionId: filterSessionId || undefined,
        type: filterType || undefined,
        knowledgePointId: filterKnowledgePointId || undefined,
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

  const loadAllKnowledgePoints = async () => {
    try {
      const result = await api.getContentKnowledgePoints();
      setAllKnowledgePoints(result || []);
    } catch (error) {
      console.error('加载知识点失败:', error);
      setAllKnowledgePoints([]);
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
  const handleSaveCourse = async () => {
    if (!editingCourse) return;
    try {
      if (editingCourse.id) {
        await api.updateContentCourse(editingCourse.id, editingCourse);
      } else {
        await api.createContentCourse(editingCourse as any);
      }
      setEditingCourse(null);
      loadCourses();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('确定要删除这个课程吗？')) return;
    try {
      await api.deleteContentCourse(id);
      loadCourses();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // CRUD 操作 - 题目
  const handleSaveExercise = async () => {
    if (!editingExercise) return;
    try {
      const exerciseData = {
        ...editingExercise,
        knowledgePointIds: selectedKnowledgePointIds
      };
      if (editingExercise.id) {
        await api.updateContentExercise(editingExercise.id, exerciseData);
      } else {
        await api.createContentExercise(exerciseData);
      }
      setEditingExercise(null);
      setSelectedKnowledgePointIds([]);
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

  const toggleCourseExpand = (id: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCourses(newExpanded);
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
            onClick={() => { setActiveTab('courses'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'courses' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
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
                {/* 筛选和操作栏 */}
                <div className="flex items-center gap-4 flex-wrap">
                  <select
                    value={filterTier}
                    onChange={e => setFilterTier(e.target.value)}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl"
                  >
                    <option value="">全部梯队</option>
                    <option value="CSP_J">CSP-J 入门</option>
                    <option value="CSP_S">CSP-S 进阶</option>
                    <option value="PROVINCIAL">省选/NOI</option>
                    <option value="IOI">IOI</option>
                  </select>
                  <select
                    value={filterHasContent}
                    onChange={e => setFilterHasContent(e.target.value)}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl"
                  >
                    <option value="">全部状态</option>
                    <option value="true">有学习资料</option>
                    <option value="false">无学习资料</option>
                  </select>
                  <button
                    onClick={() => setEditingUnit({ title: '', description: '', icon: '📚', color: 'from-blue-400 to-blue-600' })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    <Plus size={18} /> 新建技能单元
                  </button>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>共 {units.length} 个知识点</span>
                  <span>|</span>
                  <span className="text-green-400">{units.filter(u => u.hasContent).length} 个有学习资料</span>
                  <span className="text-white/30">{units.filter(u => !u.hasContent).length} 个待添加</span>
                </div>

                <div className="space-y-3">
                  {units.map(unit => (
                    <div key={unit.id} className="bg-[#252536] rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <button onClick={() => toggleUnitExpand(unit.id)} className="text-white/50 hover:text-white">
                            {expandedUnits.has(unit.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                          <span className="text-3xl">{unit.icon || '📚'}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {unit.code && <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{unit.code}</span>}
                              {unit.tier && <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">{unit.tier}</span>}
                              {unit.moduleName && <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">{unit.moduleName}</span>}
                              {unit.hasContent ? (
                                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">有学习资料</span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/40 rounded">无学习资料</span>
                              )}
                              {unit.estimatedTime && (
                                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">{unit.estimatedTime}分钟</span>
                              )}
                            </div>
                            <h3 className="text-white font-bold">{unit.title}</h3>
                            <p className="text-white/50 text-sm line-clamp-1">{unit.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* 编辑学习资料按钮 */}
                          <button
                            onClick={() => setEditingLearningContent({ id: unit.id, title: unit.title })}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              unit.hasContent
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            }`}
                          >
                            <GraduationCap size={16} />
                            {unit.hasContent ? '编辑资料' : '添加资料'}
                          </button>
                          <button
                            onClick={() => handleToggleUnitPublish(unit)}
                            className={`p-2 rounded-lg ${unit.isPublished ? 'text-green-400 bg-green-500/20' : 'text-white/30 bg-white/10'}`}
                            title={unit.isPublished ? '已发布' : '未发布'}
                          >
                            {unit.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button onClick={() => setEditingUnit(unit)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg" title="编辑基本信息">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg" title="删除">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {expandedUnits.has(unit.id) && unit.courses && unit.courses.length > 0 && (
                        <div className="border-t border-white/10 p-4 pl-16 space-y-2">
                          {unit.courses.map(({ course }) => (
                            <div key={course.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                              <span className="text-white/70">{course.title}</span>
                              <span className="text-xs text-blue-400">{course.code}</span>
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
            {activeTab === 'courses' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setEditingCourse({ code: '', title: '', moduleId: 1, tier: 'CSP_J' })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    <Plus size={18} /> 新建课程
                  </button>
                </div>

                <div className="space-y-3">
                  {courses.map(course => (
                    <div key={course.id} className="bg-[#252536] rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <button onClick={() => toggleCourseExpand(course.id)} className="text-white/50 hover:text-white">
                            {expandedCourses.has(course.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{course.code}</span>
                              {course.module && <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">{course.module.icon} {course.module.name}</span>}
                              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">{course.tier}</span>
                            </div>
                            <h3 className="text-white font-bold">{course.title}</h3>
                            {course.description && <p className="text-white/50 text-sm">{course.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50 text-sm">{course._count.sessions} 课时 · {course._count.units} 知识点</span>
                          <button onClick={() => setEditingCourse(course)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {expandedCourses.has(course.id) && course.sessions && course.sessions.length > 0 && (
                        <div className="border-t border-white/10 p-4 pl-16 space-y-2">
                          {course.sessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                              <span className="text-white/70">{session.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-400 text-xs">+{session.xpReward} XP</span>
                                <span className={`text-xs ${session.isPublished ? 'text-green-400' : 'text-white/30'}`}>
                                  {session.isPublished ? '已发布' : '未发布'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 题目标签页 */}
            {activeTab === 'exercises' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <select value={filterCourseId} onChange={(e) => { setFilterCourseId(e.target.value); setFilterSessionId(''); }} className="px-4 py-2 bg-white/10 text-white rounded-xl">
                    <option value="">全部课程</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
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
                  <select value={filterKnowledgePointId} onChange={(e) => setFilterKnowledgePointId(e.target.value)} className="px-4 py-2 bg-white/10 text-white rounded-xl">
                    <option value="">全部知识点</option>
                    {allKnowledgePoints.map(kp => <option key={kp.id} value={kp.id}>{kp.name}</option>)}
                  </select>
                  <button
                    onClick={() => { setEditingExercise({ title: '', description: '', category: '基础', difficulty: 'EASY', type: 'CODING', xp: 10 }); setSelectedKnowledgePointIds([]); }}
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
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">知识点</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">XP</th>
                        <th className="text-left text-white/50 text-sm font-medium px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercises.map(exercise => (
                        <tr key={exercise.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3">
                            <p className="text-white font-medium">{exercise.title}</p>
                            {exercise.sessionExercises && exercise.sessionExercises[0] && (
                              <p className="text-white/50 text-xs">{exercise.sessionExercises[0].session.course.title}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white/70 text-sm">{getTypeLabel(exercise.type)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                              {exercise.difficulty === 'EASY' ? '简单' : exercise.difficulty === 'MEDIUM' ? '中等' : '困难'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {exercise.knowledgePoints && exercise.knowledgePoints.length > 0 ? (
                                exercise.knowledgePoints.map(({ knowledgePoint }) => (
                                  <span key={knowledgePoint.id} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                    {knowledgePoint.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-white/30 text-xs">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-yellow-400 font-medium">{exercise.xp}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditingExercise(exercise); setSelectedKnowledgePointIds(exercise.knowledgePoints?.map(kp => kp.knowledgePoint.id) || []); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
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
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252536] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{editingCourse.id ? '编辑' : '新建'}课程</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">课程编号</label>
                <input type="text" value={editingCourse.code || ''} onChange={e => setEditingCourse({...editingCourse, code: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">标题</label>
                <input type="text" value={editingCourse.title || ''} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">描述</label>
                <textarea value={editingCourse.description || ''} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">梯队</label>
                  <select value={editingCourse.tier || 'CSP_J'} onChange={e => setEditingCourse({...editingCourse, tier: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl">
                    <option value="CSP_J">CSP-J</option>
                    <option value="CSP_S">CSP-S</option>
                    <option value="PROVINCIAL">省选</option>
                    <option value="IOI">IOI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">模块ID</label>
                  <input type="number" value={editingCourse.moduleId || 1} onChange={e => setEditingCourse({...editingCourse, moduleId: Number(e.target.value)})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingCourse(null)} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"><X size={18} /></button>
              <button onClick={handleSaveCourse} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"><Save size={18} /> 保存</button>
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
                  <label className="block text-white/70 text-sm mb-1">分类</label>
                  <input type="text" value={editingExercise.category || ''} onChange={e => setEditingExercise({...editingExercise, category: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">提示</label>
                <textarea value={editingExercise.hint || ''} onChange={e => setEditingExercise({...editingExercise, hint: e.target.value})} className="w-full px-4 py-2 bg-white/10 text-white rounded-xl" rows={2} />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">关联知识点</label>
                <div className="bg-white/5 rounded-xl p-3 max-h-48 overflow-y-auto">
                  {(() => {
                    const grouped = allKnowledgePoints.reduce((acc, kp) => {
                      if (!acc[kp.category]) acc[kp.category] = [];
                      acc[kp.category].push(kp);
                      return acc;
                    }, {} as Record<string, KnowledgePoint[]>);
                    return Object.entries(grouped).map(([category, kps]) => (
                      <div key={category} className="mb-3 last:mb-0">
                        <div className="text-white/50 text-xs font-medium mb-1">{category}</div>
                        <div className="flex flex-wrap gap-2">
                          {kps.map(kp => (
                            <label key={kp.id} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedKnowledgePointIds.includes(kp.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedKnowledgePointIds([...selectedKnowledgePointIds, kp.id]);
                                  } else {
                                    setSelectedKnowledgePointIds(selectedKnowledgePointIds.filter(id => id !== kp.id));
                                  }
                                }}
                                className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                              />
                              <span className="text-white/80 text-sm">{kp.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                  {allKnowledgePoints.length === 0 && (
                    <p className="text-white/30 text-sm">暂无知识点，请先在知识点标签页创建</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setEditingExercise(null); setSelectedKnowledgePointIds([]); }} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"><X size={18} /></button>
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

      {/* 学习资料编辑器 */}
      {editingLearningContent && (
        <LearningContentEditor
          unitId={editingLearningContent.id}
          unitTitle={editingLearningContent.title}
          onClose={() => setEditingLearningContent(null)}
          onSaved={() => loadUnits()}
        />
      )}
    </div>
  );
}
