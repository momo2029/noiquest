import { useState, useEffect } from 'react';
import { Trash2, Users, Copy, Key, Search, X, Check, AlertCircle, Gem, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

interface ClassInfo {
  id: string;
  name: string;
  description?: string;
  _count?: { students: number };
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
  level?: number;
  totalXp?: number;
  gems?: number;
}

interface StudentMistakeSummary {
  id: string;
  name: string;
  avatar: string;
  totalMistakes: number;
  unreviewedMistakes: number;
}

interface MistakeRecord {
  id: string;
  wrongCount: number;
  status: string;
  lastWrongAt: string;
  userAnswer: any;
  correctAnswer: any;
  exercise: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
  };
}

export default function ClassManager() {
  const [myClass, setMyClass] = useState<ClassInfo | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 错题查看
  const [showMistakes, setShowMistakes] = useState(false);
  const [mistakesSummary, setMistakesSummary] = useState<StudentMistakeSummary[]>([]);
  const [selectedStudentForMistakes, setSelectedStudentForMistakes] = useState<StudentMistakeSummary | null>(null);
  const [studentMistakes, setStudentMistakes] = useState<MistakeRecord[]>([]);
  const [loadingMistakes, setLoadingMistakes] = useState(false);

  // 加载班级（教师默认只有一个班级）
  useEffect(() => {
    loadMyClass();
  }, []);

  const loadMyClass = async () => {
    try {
      setLoading(true);
      const classes = await api.getTeacherClasses();
      if (classes.length > 0) {
        const cls = classes[0];
        setMyClass(cls);
        // 加载班级详情
        const [studentsData, codesData] = await Promise.all([
          api.getTeacherClassStudents(cls.id),
          api.getClassInviteCodes(cls.id),
        ]);
        setStudents(studentsData);
        setInviteCodes(codesData.codes);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInviteCode = async () => {
    if (!myClass) return;
    try {
      const newCode = await api.createClassInviteCode(myClass.id, {
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
    if (!myClass) return;
    try {
      await api.deleteClassInviteCode(myClass.id, codeId);
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
    if (!myClass) return;
    try {
      await api.addStudentToClass(myClass.id, studentId);
      const studentsData = await api.getTeacherClassStudents(myClass.id);
      setStudents(studentsData);
      setSearchResults(searchResults.filter(s => s.id !== studentId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!myClass) return;
    if (!confirm('确定要将该学生移出班级吗？')) return;
    try {
      await api.removeStudentFromClass(myClass.id, studentId);
      setStudents(students.filter(s => s.id !== studentId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 加载错题统计
  const handleShowMistakes = async () => {
    if (!myClass) return;
    try {
      setLoadingMistakes(true);
      const data = await api.getClassMistakesSummary(myClass.id);
      setMistakesSummary(data.students);
      setShowMistakes(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingMistakes(false);
    }
  };

  // 加载学生错题详情
  const handleViewStudentMistakes = async (student: StudentMistakeSummary) => {
    if (!myClass) return;
    try {
      setLoadingMistakes(true);
      setSelectedStudentForMistakes(student);
      const data = await api.getStudentMistakes(myClass.id, student.id, { limit: 50 });
      setStudentMistakes(data.mistakes);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingMistakes(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!myClass) {
    return (
      <div className="h-full bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-400">您还没有班级，请联系管理员创建</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white p-6 overflow-y-auto">
      {/* 顶部统计 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-sm text-gray-400">班级学生</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Key size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inviteCodes.length}</p>
              <p className="text-sm text-gray-400">邀请码</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Gem size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">20%</p>
              <p className="text-sm text-gray-400">学生钻石分成</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* 邀请码管理 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Key size={20} />
              邀请码
            </h3>
            <button
              onClick={() => setShowCreateCode(true)}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
            >
              生成邀请码
            </button>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            分享邀请码给学生，学生注册时使用此邀请码将自动加入您的班级
          </p>

          {inviteCodes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无邀请码，点击上方按钮生成</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inviteCodes.map(code => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div>
                    <code className="text-lg font-mono text-blue-400">{code.code}</code>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>已用 {code.usedCount}/{code.maxUses}</span>
                      {code.expiresAt && (
                        <span>
                          {new Date(code.expiresAt) < new Date() ? (
                            <span className="text-red-400">已过期</span>
                          ) : (
                            `${new Date(code.expiresAt).toLocaleDateString()} 过期`
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyCode(code.code)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                      title="复制"
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
                      title="删除"
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
              学生列表 ({students.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleShowMistakes}
                disabled={loadingMistakes}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm"
              >
                查看错题
              </button>
              <button
                onClick={() => setShowAddStudent(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
              >
                添加学生
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无学生，分享邀请码邀请学生加入</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {students.map(student => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
                      {student.avatar || student.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-gray-400">Lv.{student.level} · {student.totalXp} XP</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                    title="移出班级"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
              <h3 className="text-lg font-semibold">添加学生</h3>
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
                className="w-full pl-10 pr-20 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearchStudents}
                disabled={searching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                {searching ? '...' : '搜索'}
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
              提示：推荐使用邀请码，让学生注册时自动加入班级
            </p>
          </div>
        </div>
      )}

      {/* 错题查看弹窗 */}
      {showMistakes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedStudentForMistakes ? (
                  <button
                    onClick={() => {
                      setSelectedStudentForMistakes(null);
                      setStudentMistakes([]);
                    }}
                    className="flex items-center gap-2 hover:text-blue-400"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                    {selectedStudentForMistakes.name} 的错题
                  </button>
                ) : (
                  '学生错题统计'
                )}
              </h3>
              <button
                onClick={() => {
                  setShowMistakes(false);
                  setSelectedStudentForMistakes(null);
                  setStudentMistakes([]);
                }}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingMistakes ? (
                <div className="text-center py-8 text-gray-400">加载中...</div>
              ) : selectedStudentForMistakes ? (
                // 学生错题详情
                studentMistakes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">该学生暂无错题记录</p>
                ) : (
                  <div className="space-y-2">
                    {studentMistakes.map(mistake => (
                      <div key={mistake.id} className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{mistake.exercise.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            mistake.status === 'MASTERED' ? 'bg-green-600' :
                            mistake.status === 'REVIEWING' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {mistake.status === 'MASTERED' ? '已掌握' :
                             mistake.status === 'REVIEWING' ? '复习中' : '未复习'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{mistake.exercise.category}</span>
                          <span>错误 {mistake.wrongCount} 次</span>
                          <span>最后错误: {new Date(mistake.lastWrongAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // 学生错题统计列表
                mistakesSummary.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">班级暂无学生</p>
                ) : (
                  <div className="space-y-2">
                    {mistakesSummary.map(student => (
                      <div
                        key={student.id}
                        onClick={() => handleViewStudentMistakes(student)}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
                            {student.avatar || student.name?.[0] || '?'}
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">
                              <span className="text-red-400">{student.unreviewedMistakes}</span>
                              <span className="text-gray-400"> / {student.totalMistakes} 题</span>
                            </p>
                            <p className="text-xs text-gray-500">未复习 / 总错题</p>
                          </div>
                          <ChevronRight size={20} className="text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
