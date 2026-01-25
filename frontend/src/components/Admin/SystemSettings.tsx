import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Zap,
  Bell,
  Globe
} from 'lucide-react';

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  inviteRequired: string;
  aiDailyLimit: string;
  defaultHearts: string;
  defaultGems: string;
  maintenanceMode: string;
  announcement: string;
}

export default function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    siteName: 'NOI Quest',
    siteDescription: '信息学奥赛 C++ 训练营',
    inviteRequired: 'false',
    aiDailyLimit: '100',
    defaultHearts: '5',
    defaultGems: '0',
    maintenanceMode: 'false',
    announcement: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await api.getAdminSettings();
      if (result.settings) {
        setConfig(prev => ({ ...prev, ...result.settings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateAdminSettings(config);
      alert('设置已保存');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1a1a2e] overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Settings className="text-gray-400" />
              系统设置
            </h1>
            <p className="text-white/60">配置系统参数和功能开关</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            保存设置
          </button>
        </div>

        {/* 基础设置 */}
        <div className="bg-[#252536] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Globe size={20} className="text-blue-400" />
            基础设置
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">网站名称</label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">网站描述</label>
              <input
                type="text"
                value={config.siteDescription}
                onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 注册设置 */}
        <div className="bg-[#252536] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Shield size={20} className="text-green-400" />
            注册设置
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">需要邀请码注册</p>
                <p className="text-white/50 text-sm">开启后，用户必须使用邀请码才能注册</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, inviteRequired: config.inviteRequired === 'true' ? 'false' : 'true' })}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  config.inviteRequired === 'true' ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                  config.inviteRequired === 'true' ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* AI 设置 */}
        <div className="bg-[#252536] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            AI 设置
          </h2>
          <div>
            <label className="block text-white/70 text-sm mb-2">每日 AI 调用限制（次/用户）</label>
            <input
              type="number"
              value={config.aiDailyLimit}
              onChange={(e) => setConfig({ ...config, aiDailyLimit: e.target.value })}
              min="1"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
            />
            <p className="text-white/50 text-sm mt-2">每个用户每天可以调用 AI 助手的次数上限</p>
          </div>
        </div>

        {/* 游戏化设置 */}
        <div className="bg-[#252536] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Zap size={20} className="text-purple-400" />
            游戏化设置
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">新用户初始生命值</label>
              <input
                type="number"
                value={config.defaultHearts}
                onChange={(e) => setConfig({ ...config, defaultHearts: e.target.value })}
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">新用户初始宝石</label>
              <input
                type="number"
                value={config.defaultGems}
                onChange={(e) => setConfig({ ...config, defaultGems: e.target.value })}
                min="0"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 公告设置 */}
        <div className="bg-[#252536] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Bell size={20} className="text-orange-400" />
            系统公告
          </h2>
          <div>
            <label className="block text-white/70 text-sm mb-2">公告内容（留空则不显示）</label>
            <textarea
              value={config.announcement}
              onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
              rows={3}
              placeholder="输入要向所有用户显示的公告内容..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        </div>

        {/* 维护模式 */}
        <div className="bg-[#252536] rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Shield size={20} className="text-red-400" />
            维护模式
          </h2>
          <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div>
              <p className="text-white font-medium">开启维护模式</p>
              <p className="text-white/50 text-sm">开启后，普通用户将无法访问系统</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, maintenanceMode: config.maintenanceMode === 'true' ? 'false' : 'true' })}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                config.maintenanceMode === 'true' ? 'bg-red-500' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                config.maintenanceMode === 'true' ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
