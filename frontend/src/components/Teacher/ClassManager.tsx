import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Copy, Key, Search, X, Check } from 'lucide-react';
import { api } from '../../services/api';

interface ClassInfo {
  id: string;
  name: string;
  description?: string;
  _count?: { students: number };
  students?: any[];
}

interface InviteCode {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  note?: string;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
}

export default function ClassManager() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 创建班级
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  // 生成邀请码
  const [showCreateCode, setShowCreateCode] = useState(false);
  const [codeMaxUses, setCodeMaxUses] = useState(50);
  const [codeExpiresInDays, setCodeExpiresInDays] = useState<number | undefined>(undefined);
  const [codeNote, setCodeNote] = useState('');

  // 搜索学生
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);

  // 复制成功提示
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 加载班级列表
  useEffect(() => {
    loadClasses();
  }, []);

  // 加载选中班级的详情
  useEffect(() => {
    if (selectedClass) {
      loadClassDetail(selectedClass.id);
    }
  }, [selectedClass?.id]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await api.getTeacherClasses();
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClassDetail = async (classId: string) => {
    try {
      const [studentsData, codesData] = await Promise.all([
        api.getTeacherClassStudents(classId),
        api.getClassInviteCodes(classId),
      ]);
      setStudents(studentsData);
      setInviteCodes(codesData.codes);
    } catch (err: any) {
      console.error('加载班级详情失败:', err);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    try {
      const newClass = await api.createTeacherClass({
        name: newClassName.trim(),
        description: newClassDesc.trim() || undefined,
      });
      setClasses([newClass, ...classes]);
      setSelectedClass(newClass);
      setShowCreateClass(false);
      setNewClassName('');
      setNewClassDesc('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('确定要删除这个班级吗？班级内的学生将被移出。')) return;
    try {
      await api.deleteTeacherClass(classId);
      setClasses(classes.filter(c => c.id !== classId));
      if (selectedClass?.id === classId) {
        setSelectedClass(classes.find(c => c.id !== classId) || null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateInviteCode = async () => {
    if (!selectedClass) return;
    try {
      const newCode = await api.createClassInviteCode(selectedClass.id, {
        maxUses: codeMaxUses,
        expiresInDays: codeExpiresInDays,
        note: codeNote.trim() || undefined,
      });
      setInviteCodes([newCode, ...inviteCodes]);
      setShowCreateCode(false);
      setCodeMaxUses(50);
      setCodeExpiresInDays(undefined);
      setCodeNote('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteInviteCode = async (codeId: string) => {
    if (!selectedClass) return;
    try {
      await api.deleteClassInviteCode(selectedClass.id, codeId);
      setInviteCodes(inviteCodes.filter(c => c.id !== codeId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSearchStudents = async () => {
    if (searchKeyword.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const data = await api.searchUnassignedStudents(searchKeyword.trim());
      setSearchResults(data.users);
    } catch (err: any) {
      console.error('搜索失败:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddStudent = async (studentId: string) => {
    if (!selectedClass) return;
    try {
      await api.addStudentToClass(selectedClass.id, studentId);
      // 刷新学生列表
      const studentsData = await api.getTeacherClassStudents(selectedClass.id);
      setStudents(studentsData);
      // 从搜索结果中移除
      setSearchResults(searchResults.filter(s => s.id !== studentId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClass) return;
    if (!confirm('确定要将该学生移出班级吗？')) return;
    try {
      await api.removeStudentFromClass(selectedClass.id, studentId);
      setStudents(students.filter(s => s.id !== studentId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">班级管理</h1>
        <button
          onClick={() => setShowCreateClass(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          <Plus size={18} />
          创建班级
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* 班级列表 */}
        <div className="col-span-1 space-y-2">
          <h2 className="text-sm text-gray-400 mb-2">我的班级</h2>
          {classes.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无班级</p>
          ) : (
            classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedClass?.id === cls.id
                    ? 'bg-blue-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{cls.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClass(cls.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                  <Users size={12} />
                  <span>{cls._count?.students || 0} 名学生</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 班级详情 */}
        <div className="col-span-3">
          {selectedClass ? (
            <div className="space-y-6">
              {/* 邀请码管理 */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Key size={20} />
                    班级邀请码
                  </h3>
                  <button
                    onClick={() => setShowCreateCode(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                  >
                    <Plus size={16} />
                    生成邀请码
                  </button>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  分享邀请码给学生，学生注册时使用此邀请码将自动加入班级
                </p>

                {inviteCodes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无邀请码，点击上方按钮生成</p>
                ) : (
                  <div className="space-y-2">
                    {inviteCodes.map(code => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <code className="text-lg font-mono text-blue-400">{code.code}</code>
                          <span className="text-sm text-gray-400">
                            已用 {code.usedCount}/{code.maxUses}
                          </span>
                          {code.expiresAt && (
                            <span className="text-sm text-gray-400">
                              {new Date(code.expiresAt) < new Date() ? (
                                <span className="text-red-400">已过期</span>
                              ) : (
                                `${new Date(code.expiresAt).toLocaleDateString()} 过期`
                              )}
                            </span>
                          )}
                          {code.note && (
                            <span className="text-sm text-gray-500">{code.note}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCode(code.code)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                            title="复制邀请码"
                          >
                            {copiedCode === code.code ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteInviteCode(code.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                            title="删除邀请码"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 学生列表 */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users size={20} />
                    班级学生 ({students.length})
                  </h3>
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                  >
                    <Plus size={16} />
                    添加学生
                  </button>
                </div>

                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无学生</p>
                ) : (
                  <div className="space-y-2">
                    {students.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            {student.avatar ? (
                              <img src={student.avatar} alt="" className="w-full h-full rounded-full" />
                            ) : (
                              <span className="text-lg">{student.name?.[0] || '?'}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-400">{student.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-blue-400">Lv.{student.level}</p>
                            <p className="text-gray-400">{student.totalXp} XP</p>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(student.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                            title="移出班级"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              请选择或创建一个班级
            </div>
          )}
        </div>
      </div>

      {/* 创建班级弹窗 */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">创建班级</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">班级名称</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="例如：初一1班"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">班级描述（可选）</label>
                <input
                  type="text"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="例如：2024年春季班"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateClass}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                创建
              </button>
              <button
                onClick={() => setShowCreateClass(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 生成邀请码弹窗 */}
      {showCreateCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">生成邀请码</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">最大使用次数</label>
                <input
                  type="number"
                  value={codeMaxUses}
                  onChange={(e) => setCodeMaxUses(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">有效期（天，留空为永不过期）</label>
                <input
                  type="number"
                  value={codeExpiresInDays || ''}
                  onChange={(e) => setCodeExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
                  min={1}
                  placeholder="永不过期"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">备注（可选）</label>
                <input
                  type="text"
                  value={codeNote}
                  onChange={(e) => setCodeNote(e.target.value)}
                  placeholder="例如：2024春季招生"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateInviteCode}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                生成
              </button>
              <button
                onClick={() => setShowCreateCode(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加学生弹窗 */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">添加学生到班级</h3>
              <button
                onClick={() => {
                  setShowAddStudent(false);
                  setSearchKeyword('');
                  setSearchResults([]);
                }}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchStudents()}
                placeholder="搜索学生邮箱、用户名或姓名..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearchStudents}
                disabled={searching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                {searching ? '搜索中...' : '搜索'}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchKeyword.length >= 2 ? '未找到未分班的学生' : '输入关键词搜索学生'}
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-lg">{student.name?.[0] || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-400">{student.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddStudent(student.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                      >
                        添加
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-4">
              提示：也可以分享班级邀请码，让学生注册时自动加入班级
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
