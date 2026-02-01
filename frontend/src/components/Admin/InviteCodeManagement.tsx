import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Ticket,
  Plus,
  Copy,
  Trash2,
  Check,
  X,
  Clock,
  Users,
  Filter
} from 'lucide-react';

interface InviteCode {
  id: string;
  code: string;
  type: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  note: string | null;
  createdAt: string;
}

export default function InviteCodeManagement() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unused' | 'used'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 生成表单
  const [generateForm, setGenerateForm] = useState({
    count:1,
    type: 'STUDENT',
    maxUses: 1,
    expiresInDays: 30,
    note: '',
    useCustomCodes: false,
    customCodes: ''
  });

  useEffect(() => {
    loadCodes();
  }, [filter]);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const result = await api.getInviteCodes({
        used: filter === 'all' ? undefined : filter === 'used'
      });
      setCodes(result.codes || []);
    } catch (error) {
      console.error('Failed to load invite codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      let result;
      
      if (generateForm.useCustomCodes) {
        const customCodesList = generateForm.customCodes
          .split('\n')
          .map(code => code.trim())
          .filter(code => code.length > 0);

        if (customCodesList.length === 0) {
          alert('请至少输入一个自定义邀请码');
          return;
        }

        result = await api.generateInviteCodes({
          type: generateForm.type,
          maxUses: generateForm.maxUses,
          expiresInDays: generateForm.expiresInDays || undefined,
          note: generateForm.note || undefined,
          customCodes: customCodesList
        });
      } else {
        result = await api.generateInviteCodes({
          count: generateForm.count,
          type: generateForm.type,
          maxUses: generateForm.maxUses,
          expiresInDays: generateForm.expiresInDays || undefined,
          note: generateForm.note || undefined
        });
      }
      
      setShowGenerateModal(false);
      setGenerateForm({
        count:1,
        type: 'STUDENT',
        maxUses: 1,
        expiresInDays: 30,
        note: '',
        useCustomCodes: false,
        customCodes: ''
      });
      loadCodes();
      alert(`成功生成 ${result.codes.length} 个邀请码`);
    } catch (error: any) {
      console.error('Failed to generate codes:', error);
      const errorMessage = error.response?.data?.error || error.message || '生成失败，请重试';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个邀请码吗？')) return;
    try {
      await api.deleteInviteCode(id);
      loadCodes();
    } catch (error) {
      console.error('Failed to delete code:', error);
    }
  };

  const handleDeleteExpired = async () => {
    if (!confirm('确定要删除所有过期和已用完的邀请码吗？')) return;
    try {
      await api.deleteExpiredInviteCodes();
      loadCodes();
    } catch (error) {
      console.error('Failed to delete expired codes:', error);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (code: InviteCode) => {
    if (code.usedCount >= code.maxUses) {
      return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">已用完</span>;
    }
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">已过期</span>;
    }
    return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">可用</span>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      STUDENT: 'bg-blue-500/20 text-blue-400',
      TEACHER: 'bg-purple-500/20 text-purple-400',
      ADMIN: 'bg-red-500/20 text-red-400'
    };
    const labels: Record<string, string> = {
      STUDENT: '学生',
      TEACHER: '教师',
      ADMIN: '管理员'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[type] || 'bg-gray-500/20 text-gray-400'}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-[#1a1a2e] overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Ticket className="text-pink-400" />
              邀请码管理
            </h1>
            <p className="text-white/60">生成和管理用户注册邀请码</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteExpired}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              清理过期
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              生成邀请码
            </button>
          </div>
        </div>

        {/* 筛选 */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={18} className="text-white/50" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('unused')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unused' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            未使用
          </button>
          <button
            onClick={() => setFilter('used')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'used' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            已使用
          </button>
        </div>

        {/* 邀请码列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="bg-[#252536] rounded-2xl p-12 text-center">
            <Ticket size={48} className="mx-auto mb-4 text-white/30" />
            <p className="text-white/50">暂无邀请码</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="mt-4 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-colors"
            >
              生成邀请码
            </button>
          </div>
        ) : (
          <div className="bg-[#252536] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/50 font-medium">邀请码</th>
                  <th className="text-left p-4 text-white/50 font-medium">类型</th>
                  <th className="text-left p-4 text-white/50 font-medium">使用情况</th>
                  <th className="text-left p-4 text-white/50 font-medium">有效期</th>
                  <th className="text-left p-4 text-white/50 font-medium">状态</th>
                  <th className="text-left p-4 text-white/50 font-medium">备注</th>
                  <th className="text-right p-4 text-white/50 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(code => (
                  <tr key={code.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="text-white font-mono bg-white/10 px-2 py-1 rounded">
                          {code.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="p-1 text-white/50 hover:text-white transition-colors"
                          title="复制邀请码"
                        >
                          {copiedCode === code.code ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">{getTypeBadge(code.type)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white/70">
                        <Users size={16} />
                        <span>{code.usedCount} / {code.maxUses}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {code.expiresAt ? (
                        <div className="flex items-center gap-2 text-white/70">
                          <Clock size={16} />
                          <span>{new Date(code.expiresAt).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-white/50">永久</span>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(code)}</td>
                    <td className="p-4">
                      <span className="text-white/50 text-sm">{code.note || '-'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="删除邀请码"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 生成邀请码弹窗 */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#252536] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">生成邀请码</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
                title="关闭"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 数量 */}
              <div>
                <label className="block text-white/70 text-sm mb-2">生成数量</label>
                <input
                  type="number"
                  value={generateForm.count}
                  onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                  placeholder="请输入生成数量"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* 类型 */}
              <div>
                <label className="block text-white/70 text-sm mb-2">用户类型</label>
                <select
                  value={generateForm.type}
                  onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value })}
                  title="用户类型"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="STUDENT">学生</option>
                  <option value="TEACHER">教师</option>
                  <option value="ADMIN">管理员</option>
                </select>
              </div>

              {/* 使用次数 */}
              <div>
                <label className="block text-white/70 text-sm mb-2">每码可用次数</label>
                <input
                  type="number"
                  value={generateForm.maxUses}
                  onChange={(e) => setGenerateForm({ ...generateForm, maxUses: parseInt(e.target.value) || 1 })}
                  min="1"
                  placeholder="请输入每码可用次数"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* 有效期 */}
              <div>
                <label className="block text-white/70 text-sm mb-2">有效期（天，0为永久）</label>
                <input
                  type="number"
                  value={generateForm.expiresInDays}
                  onChange={(e) => setGenerateForm({ ...generateForm, expiresInDays: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="请输入有效期天数"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-white/70 text-sm mb-2">备注（可选）</label>
                <input
                  type="text"
                  value={generateForm.note}
                  onChange={(e) => setGenerateForm({ ...generateForm, note: e.target.value })}
                  placeholder="例如：2024年春季招生"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* 自定义邀请码开关 */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useCustomCodes"
                  checked={generateForm.useCustomCodes}
                  onChange={(e) => setGenerateForm({ ...generateForm, useCustomCodes: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-pink-500 focus:ring-pink-500"
                />
                <label htmlFor="useCustomCodes" className="text-white/70 text-sm cursor-pointer">
                  使用自定义邀请码
                </label>
              </div>

              {/* 自定义邀请码输入 */}
              {generateForm.useCustomCodes && (
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    自定义邀请码（每行一个，4-20位）
                  </label>
                  <textarea
                    value={generateForm.customCodes}
                    onChange={(e) => setGenerateForm({ ...generateForm, customCodes: e.target.value })}
                    placeholder="CLASS2024&#10;SPRING2024&#10;SUMMER2024"
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 resize-none"
                  />
                  <p className="text-white/50 text-xs mt-1">
                    每行输入一个邀请码，长度必须在 4-20 位之间
                  </p>
                </div>
              )}

              {!generateForm.useCustomCodes && (
                <div>
                  <label className="block text-white/70 text-sm mb-2">生成数量</label>
                  <input
                    type="number"
                    value={generateForm.count}
                    onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="100"
                    placeholder="请输入生成数量"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
              >
                生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
