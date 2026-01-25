import { useState, useEffect } from 'react';
import { UserRole, AppSettings, Student, DailyStatus } from '../../types';
import { calculateLevel } from '../../data/exercises';
import { api } from '../../services/api';
import {
  Settings,
  User,
  GraduationCap,
  FolderTree,
  MessageSquare,
  Terminal,
  X,
  Minus,
  Plus,
  Flame,
  Heart,
  Gem,
  Zap,
  LogOut,
  Target,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  role: UserRole;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  showFileExplorer: boolean;
  showAIPanel: boolean;
  showOutput: boolean;
  onToggleFileExplorer: () => void;
  onToggleAIPanel: () => void;
  onToggleOutput: () => void;
  student?: Student;
  userName?: string;
  onLogout?: () => void;
  onViewChange?: (view: string) => void;
}

export default function Header({
  role,
  settings,
  onSettingsChange,
  showFileExplorer,
  showAIPanel,
  showOutput,
  onToggleFileExplorer,
  onToggleAIPanel,
  onToggleOutput,
  student,
  userName,
  onLogout,
  onViewChange
}: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  // 获取每日状态和复习数量
  useEffect(() => {
    if (role === 'student') {
      api.getDailyStatus().then(setDailyStatus).catch(console.error);
      api.getReviewStatus().then(status => setReviewCount(status.totalReviewItems)).catch(console.error);
    }
  }, [role]);

  const levelInfo = student ? calculateLevel(student.totalXp) : { level: 1, currentXp: 0, nextLevelXp: 50 };
  const xpProgress = (levelInfo.currentXp / levelInfo.nextLevelXp) * 100;

  // 每日目标进度环组件
  const DailyProgressRing = ({ progress, size = 36 }: { progress: number; size?: number }) => {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={progress >= 100 ? '#4ade80' : '#fbbf24'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
    );
  };

  return (
    <>
      <header className="h-14 bg-[#007acc] flex items-center justify-between px-4 select-none shadow-lg">
        {/* 左侧 Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🐿️</span>
            </div>
            <span className="font-black text-white text-lg">
              NOI<span className="text-[#1cb0f6]">Quest</span>
            </span>
          </div>

          {/* 视图切换按钮 */}
          <div className="flex items-center gap-1 ml-2 pl-4 border-l border-white/20">
            <button
              onClick={onToggleFileExplorer}
              className={`p-2 rounded-lg transition-colors ${
                showFileExplorer ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="文件浏览器"
            >
              <FolderTree size={18} />
            </button>
            <button
              onClick={onToggleOutput}
              className={`p-2 rounded-lg transition-colors ${
                showOutput ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="输出面板"
            >
              <Terminal size={18} />
            </button>
            <button
              onClick={onToggleAIPanel}
              className={`p-2 rounded-lg transition-colors ${
                showAIPanel ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="AI 助手"
            >
              <MessageSquare size={18} />
            </button>
          </div>
        </div>

        {/* 中间状态栏 - 学生模式 */}
        {role === 'student' && student && (
          <div className="flex items-center gap-4">
            {/* 每日目标进度 */}
            {dailyStatus && (
              <button
                onClick={() => onViewChange?.('skill-tree')}
                className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition-colors"
                title={`今日目标: ${dailyStatus.xpEarned}/${dailyStatus.goalXp} XP`}
              >
                <div className="relative">
                  <DailyProgressRing progress={dailyStatus.progress} size={32} />
                  <Target className="absolute inset-0 m-auto text-white" size={14} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/70">今日目标</p>
                  <p className="text-xs font-bold text-white">{dailyStatus.xpEarned}/{dailyStatus.goalXp}</p>
                </div>
              </button>
            )}

            {/* 复习提醒 */}
            {reviewCount > 0 && (
              <button
                onClick={() => onViewChange?.('review')}
                className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1.5 rounded-xl hover:bg-orange-500/30 transition-colors"
                title={`${reviewCount} 项待复习`}
              >
                <RefreshCw className="text-orange-300" size={18} />
                <span className="text-white font-bold text-sm">{reviewCount}</span>
              </button>
            )}

            {/* 连续学习 */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Flame className="text-orange-300" size={20} />
              <span className="text-white font-bold">{student.streak}</span>
            </div>

            {/* 生命值 */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Heart className="text-red-300" size={20} />
              <span className="text-white font-bold">{student.hearts}</span>
            </div>

            {/* 宝石 */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Gem className="text-blue-300" size={20} />
              <span className="text-white font-bold">{student.gems}</span>
            </div>

            {/* 等级和经验 */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-black text-yellow-900">{levelInfo.level}</span>
              </div>
              <div className="w-24">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/70 mt-0.5 text-center">
                  {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 右侧控制 */}
        <div className="flex items-center gap-3">
          {/* 用户名和角色显示 */}
          {userName && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
              {role === 'student' ? (
                <User size={16} className="text-white/70" />
              ) : (
                <GraduationCap size={16} className="text-white/70" />
              )}
              <span className="text-white text-sm font-medium">
                {userName}
              </span>
            </div>
          )}

          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="设置"
          >
            <Settings size={20} />
          </button>

          {/* 退出登录按钮 */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="退出登录"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[480px] shadow-2xl">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">设置</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* 设置内容 */}
            <div className="p-6 space-y-6">
              {/* 编辑器设置 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-[#007acc]" />
                  编辑器设置
                </h3>
                <div className="space-y-4">
                  {/* 字体大小 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">字体大小</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSettingsChange({ ...settings, fontSize: Math.max(12, settings.fontSize - 2) })}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-14 text-center font-medium text-gray-800">{settings.fontSize}px</span>
                      <button
                        onClick={() => onSettingsChange({ ...settings, fontSize: Math.min(24, settings.fontSize + 2) })}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Tab 大小 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tab 缩进</span>
                    <div className="flex items-center gap-2">
                      {[2, 4].map(size => (
                        <button
                          key={size}
                          onClick={() => onSettingsChange({ ...settings, tabSize: size })}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            settings.tabSize === size
                              ? 'bg-[#007acc] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {size} 空格
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 快捷键提示 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  ⌨️ 快捷键
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">运行代码</span>
                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-700 text-xs font-mono">Ctrl + Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">保存文件</span>
                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-700 text-xs font-mono">Ctrl + S</kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">格式化代码</span>
                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-700 text-xs font-mono">Shift + Alt + F</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部 */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2.5 bg-[#007acc] hover:bg-[#005a9e] text-white rounded-xl font-bold transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
