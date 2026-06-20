import React from 'react';
import {
  LayoutDashboard, GraduationCap, KanbanSquare, Camera, Users,
  ShieldAlert, BookOpen, UsersRound, DollarSign, CalendarCheck,
  Banknote, Bell, FileText, BarChart2, User, Heart, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { type User as UserType } from '../data/mockData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserType;
  onRoleChange: (role: UserType['role']) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  showRbac?: boolean;
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

const roleOptions: UserType['role'][] = [
  'Super Admin', 'Academy Director', 'Teacher', 'Student',
  'Company Director', 'Project Manager', 'Developer', 'Client',
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, currentUser, onRoleChange,
  collapsed = false, onToggle,
  mobileOpen = false, onMobileClose,
  showRbac = false,
}) => {
  const toggle = onToggle ?? (() => {});

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onMobileClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onMobileClose} />
      )}
      <aside className={[
        'bg-slate-900 text-white flex flex-col h-screen border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-16' : 'w-64',
        'fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:z-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}>
        <div className="px-4 py-5 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="font-heading font-bold text-base leading-tight truncate">Brain IT</h1>
              <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">Enterprise</span>
            </div>
          )}
          <button onClick={toggle} className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button onClick={onMobileClose} className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) => item.roles.includes(currentUser.role));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                {!collapsed && (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button key={item.id} onClick={() => handleNavClick(item.id)} title={collapsed ? item.name : undefined}
                        className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                          isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        }`}>
                        <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {showRbac && !collapsed && (
          <div className="p-3 mx-3 mb-3 bg-slate-800/50 border border-slate-700 rounded-xl space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> RBAC Simulator
            </div>
            <select value={currentUser.role} onChange={(e) => onRoleChange(e.target.value as UserType['role'])}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg py-1.5 px-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none">
              {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        )}

        <div className={`border-t border-slate-800 ${collapsed ? 'p-2' : 'p-3'} flex items-center gap-3 shrink-0`}>
          <img src={currentUser.avatar} alt={currentUser.name} className="h-8 w-8 rounded-full border border-slate-700 object-cover shrink-0" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-slate-200">{currentUser.name}</p>
              <p className="text-[10px] text-indigo-400 font-medium truncate">{currentUser.role}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
