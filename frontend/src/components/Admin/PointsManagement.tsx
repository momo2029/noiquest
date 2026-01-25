import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Coins,
  Search,
  Plus,
  Minus,
  History,
  User,
  Zap,
  TrendingUp
} from 'lucide-react';

interface UserWithPoints {
  id: string;
  username: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  totalXp: number;
  gems: number;
}

export default function PointsManagement() {
  const [users, setUsers] = useState<UserWithPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithPoints | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'xp' | 'gems'>('xp');
  const [adjustReason, setAdjustReason] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await api.getAdminUsers({
        search: searchTerm,
        page,
        limit: 20
      });
      setUsers(result.users || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (isAdd: boolean) => {
    if (!selectedUser || !adjustAmount) return;

    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的数值');
      return;
    }

    const finalAmount = isAdd ? amount : -amount;

    try {
      const updateData: any = {};
      if (adjustType === 'xp') {
        updateData.xp = Math.max(0, selectedUser.xp + finalAmount);
        updateData.totalXp = Math.max(0, selectedUser.totalXp + (isAdd ? amount : 0));
      } else {
        updateData.gems = Math.max(0, selectedUser.gems + finalAmount);
      }

      await api.updateAdminUser(selectedUser.id, updateData);

      // 更新本地状态
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...updateData }
          : u
      ));
      setSelectedUser(prev => prev ? { ...prev, ...updateData } : null);

      setAdjustAmount('');
      setAdjustReason('');
      alert(`成功${isAdd ? '增加' : '扣除'} ${amount} ${adjustType === 'xp' ? 'XP' : '宝石'}`);
    } catch (error) {
      console.error('Failed to adjust points:', error);
      alert('操作失败，请重试');
    }
  };

  const filteredUsers = users;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 用户列表 */}
      <div className="w-96 bg-[#252536] border-r border-white/10 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
            <Coins className="text-yellow-400" size={20} />
            积分管理
          </h2>

          {/* 搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* 用户列表 */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              没有找到用户
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedUser?.id === user.id
                      ? 'bg-yellow-500/20 border border-yellow-500/50'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0) || user.username?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-white/50 text-sm truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{user.totalXp} XP</p>
                      <p className="text-white/50 text-sm">Lv.{user.level}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white/10 text-white rounded-lg disabled:opacity-50"
            >
              上一页
            </button>
            <span className="text-white/50">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-white/10 text-white rounded-lg disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* 积分调整面板 */}
      <div className="flex-1 bg-[#1a1a2e] overflow-y-auto p-8">
        {selectedUser ? (
          <div className="max-w-2xl mx-auto">
            {/* 用户信息卡片 */}
            <div className="bg-[#252536] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name?.charAt(0) || selectedUser.username?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                  <p className="text-white/60">{selectedUser.email}</p>
                </div>
              </div>

              {/* 积分统计 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Zap size={18} />
                    <span className="text-sm">当前 XP</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedUser.xp}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <TrendingUp size={18} />
                    <span className="text-sm">累计 XP</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedUser.totalXp}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-pink-400 mb-2">
                    <Coins size={18} />
                    <span className="text-sm">宝石</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedUser.gems}</p>
                </div>
              </div>
            </div>

            {/* 积分调整 */}
            <div className="bg-[#252536] rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <History size={20} />
                调整积分
              </h3>

              {/* 类型选择 */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAdjustType('xp')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    adjustType === 'xp'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  XP 经验值
                </button>
                <button
                  onClick={() => setAdjustType('gems')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    adjustType === 'gems'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  宝石
                </button>
              </div>

              {/* 数量输入 */}
              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">调整数量</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="输入数量"
                  min="1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500"
                />
              </div>

              {/* 原因输入 */}
              <div className="mb-6">
                <label className="block text-white/70 text-sm mb-2">调整原因（可选）</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="例如：活动奖励、补偿等"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAdjustPoints(true)}
                  disabled={!adjustAmount}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  增加
                </button>
                <button
                  onClick={() => handleAdjustPoints(false)}
                  disabled={!adjustAmount}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Minus size={20} />
                  扣除
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/50 h-full">
            <div className="text-center">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>选择一个用户来调整积分</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
