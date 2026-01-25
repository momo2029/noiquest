import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Search,
  UserCog,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Shield,
  Zap,
  Heart,
  Gem
} from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatar: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  hearts: number;
  gems: number;
  createdAt: string;
  progressCount: number;
  submissionCount: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await api.getAdminUsers({ search, role: roleFilter, page, limit: 15 });
      setUsers(result.users);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      await api.updateAdminUser(userId, data);
      loadUsers();
      setEditMode(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？此操作不可恢复。')) return;
    try {
      await api.deleteAdminUser(userId);
      loadUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="text-red-400" size={16} />;
      case 'TEACHER': return <GraduationCap className="text-blue-400" size={16} />;
      default: return <User className="text-green-400" size={16} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理员';
      case 'TEACHER': return '教师';
      default: return '学生';
    }
  };

  return (
    <div className="flex-1 bg-[#1a1a2e] overflow-hidden flex">
      {/* 用户列表 */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">用户管理</h1>

          {/* 搜索和筛选 */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="搜索用户名、邮箱或姓名..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">全部角色</option>
              <option value="STUDENT">学生</option>
              <option value="TEACHER">教师</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>
        </div>

        {/* 用户表格 */}
        <div className="flex-1 bg-[#252536] rounded-2xl overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="bg-white/5 sticky top-0">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">用户</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">角色</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">等级</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">经验</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">完成题目</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">注册时间</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-white/50">加载中...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-white/50">暂无用户</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr
                      key={user.id}
                      className={`border-t border-white/5 hover:bg-white/5 cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-500/10' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{user.avatar}</span>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-white/50 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="text-white/70">{getRoleLabel(user.role)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-yellow-400 font-bold">Lv.{user.level}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/70">{user.totalXp} XP</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/70">{user.progressCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/50 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setEditMode(true); }}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                          >
                            <UserCog size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-white/50 text-sm">
              第 {page} / {totalPages} 页
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 用户详情/编辑面板 */}
      {selectedUser && (
        <div className="w-80 bg-[#252536] border-l border-white/10 p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <span className="text-5xl">{selectedUser.avatar}</span>
            <h3 className="text-white font-bold text-xl mt-2">{selectedUser.name}</h3>
            <p className="text-white/50 text-sm">{selectedUser.email}</p>
          </div>

          {editMode ? (
            <EditUserForm
              user={selectedUser}
              onSave={(data) => handleUpdateUser(selectedUser.id, data)}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/70">角色</span>
                <div className="flex items-center gap-2">
                  {getRoleIcon(selectedUser.role)}
                  <span className="text-white">{getRoleLabel(selectedUser.role)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/70">等级</span>
                <span className="text-yellow-400 font-bold">Lv.{selectedUser.level}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/70">经验值</span>
                <div className="flex items-center gap-1">
                  <Zap className="text-yellow-400" size={16} />
                  <span className="text-white">{selectedUser.totalXp}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/70">生命值</span>
                <div className="flex items-center gap-1">
                  <Heart className="text-red-400" size={16} />
                  <span className="text-white">{selectedUser.hearts}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/70">宝石</span>
                <div className="flex items-center gap-1">
                  <Gem className="text-blue-400" size={16} />
                  <span className="text-white">{selectedUser.gems}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/70">连续学习</span>
                <span className="text-orange-400">{selectedUser.streak} 天</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/70">完成题目</span>
                <span className="text-white">{selectedUser.progressCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/70">提交次数</span>
                <span className="text-white">{selectedUser.submissionCount}</span>
              </div>

              <button
                onClick={() => setEditMode(true)}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
              >
                编辑用户
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 编辑用户表单组件
function EditUserForm({ user, onSave, onCancel }: {
  user: UserData;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    role: user.role,
    level: user.level,
    hearts: user.hearts,
    gems: user.gems,
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-white/70 text-sm">姓名</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-white/70 text-sm">角色</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="STUDENT">学生</option>
          <option value="TEACHER">教师</option>
          <option value="ADMIN">管理员</option>
        </select>
      </div>
      <div>
        <label className="text-white/70 text-sm">等级</label>
        <input
          type="number"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
          className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-white/70 text-sm">生命值</label>
        <input
          type="number"
          value={formData.hearts}
          onChange={(e) => setFormData({ ...formData, hearts: Number(e.target.value) })}
          className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-white/70 text-sm">宝石</label>
        <input
          type="number"
          value={formData.gems}
          onChange={(e) => setFormData({ ...formData, gems: Number(e.target.value) })}
          className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onSave(formData)}
          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  );
}
