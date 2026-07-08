import React from 'react';
import {
  LayoutDashboard, GraduationCap, KanbanSquare, Camera, Users,
  BookOpen, UsersRound, DollarSign, CalendarCheck,
  Banknote, Bell, FileText, BarChart2, User, Heart,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { type User as UserType } from '../data/mockData';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: React.ElementType;
  roles: UserType['role'][];
}

const menuGroups = [
  {
    label: 'Asosiy',
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Academy Director', 'Company Director', 'Project Manager', 'Teacher', 'Student'] },
    ] as MenuItem[],
  },
  {
    label: "Ta'lim markazi",
    items: [
      { id: 'academy',    name: 'LMS Classroom',  icon: GraduationCap, roles: ['Super Admin', 'Academy Director', 'Teacher', 'Student'] },
      { id: 'courses',    name: 'Kurslar',         icon: BookOpen,      roles: ['Super Admin', 'Academy Director', 'Teacher'] },
      { id: 'groups',     name: 'Guruhlar',        icon: UsersRound,    roles: ['Super Admin', 'Academy Director', 'Teacher'] },
      { id: 'students',   name: "O'quvchilar",     icon: Users,         roles: ['Super Admin', 'Academy Director', 'Teacher'] },
      { id: 'teachers',   name: "O'qituvchilar",    icon: Users,         roles: ['Super Admin', 'Academy Director'] },
      { id: 'attendance', name: 'Davomat',         icon: CalendarCheck, roles: ['Super Admin', 'Academy Director', 'Teacher'] },
    ] as MenuItem[],
  },
  {
    label: 'Moliya',
    items: [
      { id: 'finance', name: 'Moliya',       icon: DollarSign, roles: ['Super Admin', 'Academy Director', 'Company Director'] },
      { id: 'payroll', name: 'Ustoz maoshi', icon: Banknote,   roles: ['Super Admin', 'Academy Director'] },
    ] as MenuItem[],
  },
  {
    label: 'CRM / PM',
    items: [
      { id: 'crm',    name: 'CRM Pipeline',   icon: Users,        roles: ['Super Admin', 'Company Director', 'Project Manager'] },
      { id: 'pm',     name: 'Kanban PM',       icon: KanbanSquare, roles: ['Super Admin', 'Company Director', 'Project Manager', 'Developer', 'Client'] },
      { id: 'faceid', name: 'Face ID Davomat', icon: Camera,       roles: ['Super Admin', 'Academy Director', 'Company Director', 'Teacher'] },
    ] as MenuItem[],
  },
  {
    label: 'Boshqaruv',
    items: [
      { id: 'contracts',     name: 'Shartnomalar', icon: FileText,  roles: ['Super Admin', 'Academy Director'] },
      { id: 'notifications', name: 'Xabarnomalar', icon: Bell,      roles: ['Super Admin', 'Academy Director'] },
      { id: 'reports',       name: 'Hisobotlar',   icon: BarChart2, roles: ['Super Admin', 'Academy Director', 'Company Director'] },
    ] as MenuItem[],
  },
  {
    label: 'Portallar',
    items: [
      { id: 'student-portal', name: "O'quvchi portali", icon: User,  roles: ['Super Admin', 'Academy Director', 'Student', 'Parent'] },
      { id: 'parent-portal',  name: 'Ota-ona portali',  icon: Heart, roles: ['Super Admin', 'Academy Director', 'Student', 'Parent'] },
    ] as MenuItem[],
  },
];

export const TopNav: React.FC<TopNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  return (
    <nav className="w-full bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-b border-white/10 dark:border-white/5 py-2 px-4 lg:px-8 shadow-sm relative z-20">
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(currentUser.role));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className="flex gap-2 items-center">
              <div className="h-6 w-px bg-white/10 mx-2 first:hidden" />
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap group relative overflow-hidden ${
                      isActive ? 'text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-slate-400 hover:text-white'
                    }`}>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-white/20 premium-inner-glow rounded-xl" />
                    )}
                    {!isActive && (
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    )}
                    <Icon className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                    <span className="relative z-10 tracking-wide">{item.name}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </nav>
  );
};
