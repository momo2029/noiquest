import { UserRole } from '../../types';
import {
  Code,
  BookOpen,
  BarChart3,
  Users,
  ClipboardList,
  LayoutDashboard,
  Map,
  RefreshCw,
  Trophy,
  Award,
  LineChart,
  GitBranch
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ role, currentView, onViewChange }: SidebarProps) {
  const studentMenuItems = [
 
    { id: 'skill-tree', icon: Map, label: '技能树', color: 'green' },
    { id: 'knowledge-map', icon: GitBranch, label: '知识图谱', color: 'cyan' },
    { id: 'editor', icon: Code, label: '代码编辑', color: 'blue' },
    { id: 'exercises', icon: BookOpen, label: '练习题库', color: 'cyan' },
    { id: 'review', icon: RefreshCw, label: '复习', color: 'orange' },
    { id: 'leaderboard', icon: Trophy, label: '排行榜', color: 'yellow' },
    { id: 'achievements', icon: Award, label: '成就', color: 'purple' },
    { id: 'analytics', icon: LineChart, label: '学习报告', color: 'pink' },
    { id: 'progress', icon: BarChart3, label: '学习进度', color: 'purple' },
  ];

  const teacherMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '仪表盘', color: 'blue' },
    { id: 'students', icon: Users, label: '学生管理', color: 'green' },
    { id: 'assignments', icon: ClipboardList, label: '作业管理', color: 'purple' },
  ];

  const menuItems = role === 'student' ? studentMenuItems : teacherMenuItems;

  return (
    <aside className="w-14 bg-[#252526] border-r border-[#3c3c3c] flex flex-col items-center py-2">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-lg mb-1 transition-all group ${
              isActive
                ? 'bg-[#37373d] text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2d2e]'
            }`}
            title={item.label}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r" />
            )}
            <Icon size={20} />

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-gray-700">
              {item.label}
            </div>
          </button>
        );
      })}
    </aside>
  );
}
