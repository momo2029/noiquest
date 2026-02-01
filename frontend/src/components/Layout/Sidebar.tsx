import { useTranslation } from 'react-i18next';
import { UserRole } from '../../types';
import {
  Code,
  BookOpen,
  BarChart3,
  Map,
  RefreshCw,
  Trophy,
  Award,
  LineChart,
  GitBranch,
  School
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ role, currentView, onViewChange }: SidebarProps) {
  const { t } = useTranslation();

  const studentMenuItems = [

    { id: 'skill-tree', icon: Map, label: t('nav.skillTree'), color: 'green' },
    { id: 'knowledge-map', icon: GitBranch, label: t('nav.knowledgeMap'), color: 'cyan' },
    { id: 'editor', icon: Code, label: t('nav.codeEditor'), color: 'blue' },
    { id: 'exercises', icon: BookOpen, label: t('nav.exercises'), color: 'cyan' },
    { id: 'review', icon: RefreshCw, label: t('nav.review'), color: 'orange' },
    { id: 'leaderboard', icon: Trophy, label: t('nav.leaderboard'), color: 'yellow' },
    { id: 'achievements', icon: Award, label: t('nav.achievements'), color: 'purple' },
    { id: 'analytics', icon: LineChart, label: t('nav.analytics'), color: 'pink' },
    { id: 'progress', icon: BarChart3, label: t('nav.progress'), color: 'purple' },
  ];

  const teacherMenuItems = [
    { id: 'classes', icon: School, label: t('nav.classes'), color: 'cyan' },
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
