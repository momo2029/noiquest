import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Coins,
  Ticket,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PieChart
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import ClassManagement from './ClassManagement';
import PointsManagement from './PointsManagement';
import InviteCodeManagement from './InviteCodeManagement';
import ContentManagement from './ContentManagement';
import DataAnalytics from './DataAnalytics';
import SystemSettings from './SystemSettings';
import AdminStatistics from './AdminStatistics';

interface AdminLayoutProps {
  userName?: string;
  onLogout: () => void;
}

type AdminView = 'dashboard' | 'users' | 'classes' | 'points' | 'invites' | 'content' | 'analytics' | 'statistics' | 'settings';

export default function AdminLayout({ userName, onLogout }: AdminLayoutProps) {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems: { id: AdminView; icon: any; label: string; color: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: '仪表盘', color: 'blue' },
    { id: 'users', icon: Users, label: '用户管理', color: 'green' },
    { id: 'classes', icon: Building2, label: '班级管理', color: 'purple' },
    { id: 'points', icon: Coins, label: '积分管理', color: 'yellow' },
    { id: 'invites', icon: Ticket, label: '邀请码管理', color: 'pink' },
    { id: 'content', icon: BookOpen, label: '内容管理', color: 'cyan' },
    { id: 'analytics', icon: BarChart3, label: '数据分析', color: 'orange' },
    { id: 'statistics', icon: PieChart, label: '题目统计', color: 'red' },
    { id: 'settings', icon: Settings, label: '系统设置', color: 'gray' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'classes':
        return <ClassManagement />;
      case 'points':
        return <PointsManagement />;
      case 'invites':
        return <InviteCodeManagement />;
      case 'content':
        return <ContentManagement />;
      case 'analytics':
        return <DataAnalytics />;
      case 'statistics':
        return <AdminStatistics />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-[#1a1a2e]">
      {/* 侧边栏 */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#252536] flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🐿️</span>
              </div>
              <div>
                <h1 className="text-white font-bold">NOI Quest</h1>
                <p className="text-white/50 text-xs">管理后台</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {userName?.charAt(0) || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{userName || '管理员'}</p>
                <p className="text-white/50 text-xs">系统管理员</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${
              sidebarCollapsed ? 'px-2' : ''
            }`}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
