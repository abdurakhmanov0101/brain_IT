import React, { useState } from 'react';
import {
  LayoutDashboard, GraduationCap, KanbanSquare, Camera, Users,
  BookOpen, UsersRound, DollarSign, CalendarCheck, Coins,
  Banknote, Bell, FileText, BarChart2, User, Heart, X,
  ShoppingBag, Briefcase, ChevronLeft, ChevronRight, Zap, Shield
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCoinStore } from '../stores/coinStore';
import { useRoleStore } from '../stores/roleStore';
import { useStudentStore } from '../stores/studentStore';
import { useUIStore } from '../stores/uiStore';
import { getTranslation } from '../utils/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Asosiy',
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Academy Director', 'Teacher', 'Student', 'Company Director', 'Project Manager'] },
    ],
  },
  {
    label: "Ta'lim",
    items: [
      { id: 'academy',    name: 'LMS & Classroom', icon: GraduationCap, roles: ['Super Admin', 'Academy Director', 'Teacher', 'Student'] },
      { id: 'courses',    name: 'Kurslar',         icon: BookOpen,      roles: ['Super Admin', 'Academy Director', 'Teacher'] },
      { id: 'groups',     name: 'Guruhlar',        icon: UsersRound,    roles: ['Super Admin', 'Academy Director', 'Teacher'] },
      { id: 'students',   name: "O'quvchilar",     icon: Users,         roles: ['Super Admin', 'Academy Director', 'Teacher'] },
      { id: 'teachers',   name: "Ustozlar",        icon: Users,         roles: ['Super Admin', 'Academy Director'] },
      { id: 'attendance', name: 'Davomat',         icon: CalendarCheck, roles: ['Super Admin', 'Academy Director', 'Teacher'] },
      { id: 'homework', name: 'Uy‑vazifalar', icon: BookOpen, roles: ['Super Admin', 'Academy Director', 'Teacher', 'Student'] },
    ],
  },
  {
    label: 'Moliya',
    items: [
      { id: 'finance',    name: 'Kassa / Moliya',  icon: DollarSign,    roles: ['Super Admin', 'Academy Director'] },
      { id: 'payroll',    name: 'Ustoz maoshi',    icon: Banknote,      roles: ['Super Admin', 'Academy Director'] },
      { id: 'coins',      name: 'Tanga tizimi',    icon: Coins,         roles: ['Super Admin', 'Academy Director', 'Teacher', 'Student'] },
      { id: 'market',     name: 'Market',          icon: ShoppingBag,   roles: ['Super Admin', 'Academy Director', 'Student'] },
    ],
  },
  {
    label: 'CRM / PM',
    items: [
      { id: 'crm',    name: 'CRM Pipeline',   icon: Users,        roles: ['Super Admin', 'Company Director', 'Project Manager'] },
      { id: 'pm',     name: 'Kanban Topshiriqlar', icon: KanbanSquare, roles: ['Super Admin', 'Company Director', 'Project Manager'] },
      { id: 'faceid', name: 'Face ID Davomat', icon: Camera,       roles: ['Super Admin', 'Academy Director', 'Teacher'] },
    ],
  },
  {
    label: 'Boshqaruv',
    items: [
      { id: 'staff',         name: "Xodimlar (HR)",  icon: Users,        roles: ['Super Admin', 'Academy Director'] },
      { id: 'contracts',     name: 'Shartnomalar',   icon: FileText,     roles: ['Super Admin', 'Academy Director'] },
      { id: 'notifications', name: 'Xabarnomalar',   icon: Bell,         roles: ['Super Admin', 'Academy Director'] },
      { id: 'reports',       name: 'Hisobotlar',     icon: BarChart2,    roles: ['Super Admin', 'Academy Director', 'Company Director'] },
      { id: 'roles',         name: 'Rollar va Huquqlar', icon: Shield,   roles: ['Super Admin'] },
    ],
  },
  {
    label: 'Portallar',
    items: [
      { id: 'student-portal',  name: "O'quvchi portali", icon: User,         roles: ['Super Admin', 'Academy Director', 'Student', 'Parent'] },
      { id: 'parent-portal',   name: 'Ota-ona portali',  icon: Heart,        roles: ['Super Admin', 'Academy Director', 'Parent'] },
      { id: 'teacher-portal',  name: 'Ustoz paneli',     icon: GraduationCap,roles: ['Teacher'] },
      { id: 'staff-portal',    name: 'Xodim paneli',     icon: Briefcase,    roles: ['Staff', 'Super Admin', 'Academy Director'] },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab,
  collapsed = false, onToggle,
  mobileOpen = false, onMobileClose,
}) => {
  const { currentUser } = useAuthStore();
  const { balances } = useCoinStore();
  const { language } = useUIStore();
  const toggle = onToggle ?? (() => {});

  if (!currentUser) return null;

  const myCoins = balances[currentUser.id] || 
    (currentUser.studentId ? balances[currentUser.studentId] : 0) || 
    balances[currentUser.id.replace('u_', '')] || 
    (useStudentStore.getState().students.find(s => s.id === (currentUser.studentId || currentUser.id.replace('u_', '')) || s.id === currentUser.id)?.coins || 0);

  const translateGroupLabel = (lbl: string) => {
    if (lbl === 'Asosiy') return getTranslation(language, 'groupMain');
    if (lbl === "Ta'lim") return getTranslation(language, 'groupEducation');
    if (lbl === 'Moliya') return getTranslation(language, 'groupFinance');
    if (lbl === 'CRM / PM') return getTranslation(language, 'groupCrmPm');
    if (lbl === 'Boshqaruv') return getTranslation(language, 'groupManagement');
    if (lbl === 'Portallar') return getTranslation(language, 'groupPortals');
    return lbl;
  };

  const translateItemName = (id: string, defName: string) => {
    return getTranslation(language, id as any) || defName;
  };

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-light-surface dark:bg-dark-surface border-r border-slate-200/60 dark:border-dark-border select-none shadow-xl lg:shadow-none
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className={`flex items-center shrink-0 border-b border-slate-200/60 dark:border-dark-border transition-all duration-300 ${collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4 gap-3'}`}>
          {/* Logo */}
          {collapsed ? (
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md border border-slate-200/80 dark:border-white/10 flex items-center justify-center bg-transparent">
                <img src="/logo.png" alt="Brain IT Academy" className="w-full h-full object-contain p-0.5" />
              </div>
            </div>
          ) : (
            <div className="relative shrink-0 flex-1 flex justify-center">
              <div className="w-48 h-16 overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Brain IT Academy" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={toggle}
            className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all ${collapsed ? 'mt-0' : ''}`}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {/* Mobile close */}
          <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-3 space-y-5">
            {menuGroups.map((group) => {
              const visible = group.items.filter(item => {
                if (currentUser.role === 'Super Admin') {
                  if (['student-portal', 'parent-portal', 'teacher-portal', 'staff-portal'].includes(item.id)) return false;
                  return true;
                }
                return item.roles.includes(currentUser.role) || useRoleStore.getState().hasPermission(currentUser.role, item.id);
              });
              if (visible.length === 0) return null;
              const groupText = translateGroupLabel(group.label);
              return (
                <div key={group.label}>
                  {!collapsed && (
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2 mb-2">
                      {groupText}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {visible.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const itemText = translateItemName(item.id, item.name);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          title={collapsed ? itemText : undefined}
                          className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                        >
                          <Icon className={`h-[18px] w-[18px] shrink-0 transition-all ${isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 group-hover:text-brand-500'}`} />
                          {!collapsed && (
                            <span className="truncate">{itemText}</span>
                          )}
                          {!collapsed && item.badge && (
                            <span className="ml-auto text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Coin balance strip */}
        {!collapsed && (
          <div className="mx-3 mb-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/15 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-500/30 shrink-0">
              <Coins className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">{getTranslation(language, 'coinBalance')}</p>
              <p className="font-heading font-black text-base text-amber-600 dark:text-amber-400 leading-tight">{myCoins.toLocaleString()}</p>
            </div>
            <Zap className="h-4 w-4 text-amber-400 ml-auto shrink-0 animate-pulse" />
          </div>
        )}

        {/* User card */}
        <div className={`border-t border-slate-200/60 dark:border-dark-border transition-all ${collapsed ? 'p-3 flex justify-center' : 'p-4 flex items-center gap-3'}`}>
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&bold=true`}
              alt={currentUser.name}
              className="h-9 w-9 rounded-xl object-cover border-2 border-white dark:border-dark-muted shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-dark-surface" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 truncate uppercase tracking-wider mt-0.5">{currentUser.role}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
