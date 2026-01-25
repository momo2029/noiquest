import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Building2,
  Plus,
  Search,
  Users,
  BookOpen,
  Trash2,
  Edit,
  X,
  ChevronRight
} from 'lucide-react';

interface Class {
  id: string;
  name: string;
  description?: string;
  teacherId?: string;
  teacher?: { name: string };
  _count?: { students: number };
  createdAt: string;
}

interface ClassFormData {
  name: string;
  description: string;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({ name: '', description: '' });
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const result = await api.getAdminClasses();
      setClasses(result.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async (classId: string) => {
    try {
      const result = await api.getAdminClassStudents(classId);
      setClassStudents(result.students || []);
    } catch (error) {
      console.error('Failed to load class students:', error);
    }
  };

  const handleCreateClass = async () => {
    if (!formData.name.trim()) return;
    try {
      await api.createAdminClass(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      loadClasses();
    } catch (error) {
      console.error('Failed to create class:', error);
    }
  };

  const handleUpdateClass = async () => {
    if (!editingClass || !formData.name.trim()) return;
    try {
      await api.updateAdminClass(editingClass.id, formData);
      setEditingClass(null);
      setFormData({ name: '', description: '' });
      loadClasses();
    } catch (error) {
      console.error('Failed to update class:', error);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('确定要删除这个班级吗？班级内的学生将被移出班级。')) return;
    try {
      await api.deleteAdminClass(classId);
      loadClasses();
      if (selectedClass?.id === classId) {
        setSelectedClass(null);
      }
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  const handleSelectClass = (cls: Class) => {
    setSelectedClass(cls);
    loadClassStudents(cls.id);
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 班级列表 */}
      <div className="w-80 bg-[#252536] border-r border-white/10 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Building2 className="text-purple-400" size={20} />
              班级管理
            </h2>
            <button
              onClick={() => {
                setFormData({ name: '', description: '' });
                setShowCreateModal(true);
              }}
              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* 搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="搜索班级..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* 班级列表 */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              {searchTerm ? '没有找到匹配的班级' : '暂无班级，点击 + 创建'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClasses.map(cls => (
                <div
                  key={cls.id}
                  onClick={() => handleSelectClass(cls)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedClass?.id === cls.id
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{cls.name}</h3>
                    <ChevronRight className="text-white/30" size={16} />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {cls._count?.students || 0} 人
                    </span>
                    {cls.teacher && (
                      <span>教师: {cls.teacher.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 班级详情 */}
      <div className="flex-1 bg-[#1a1a2e] overflow-y-auto">
        {selectedClass ? (
          <div className="p-8">
            {/* 班级信息头部 */}
            <div className="bg-[#252536] rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{selectedClass.name}</h1>
                  <p className="text-white/60">{selectedClass.description || '暂无描述'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData({
                        name: selectedClass.name,
                        description: selectedClass.description || ''
                      });
                      setEditingClass(selectedClass);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(selectedClass.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* 统计卡片 */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-2">
                    <Users size={16} />
                    <span>学生人数</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{classStudents.length}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-2">
                    <BookOpen size={16} />
                    <span>平均进度</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {classStudents.length > 0
                      ? Math.round(classStudents.reduce((sum, s) => sum + (s.totalXp || 0), 0) / classStudents.length)
                      : 0} XP
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 mb-2">
                    <Building2 size={16} />
                    <span>创建时间</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {new Date(selectedClass.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* 学生列表 */}
            <div className="bg-[#252536] rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">班级学生</h2>
              {classStudents.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  暂无学生
                </div>
              ) : (
                <div className="space-y-2">
                  {classStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {student.name?.charAt(0) || student.username?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{student.name}</p>
                          <p className="text-white/50 text-sm">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">Lv.{student.level}</p>
                        <p className="text-white/50 text-sm">{student.totalXp} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/50">
            <div className="text-center">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>选择一个班级查看详情</p>
            </div>
          </div>
        )}
      </div>

      {/* 创建/编辑班级弹窗 */}
      {(showCreateModal || editingClass) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#252536] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">
                {editingClass ? '编辑班级' : '创建班级'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingClass(null);
                }}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">班级名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：2024级1班"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">班级描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="可选，班级简介..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingClass(null);
                }}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                取消
              </button>
              <button
                onClick={editingClass ? handleUpdateClass : handleCreateClass}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                {editingClass ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
