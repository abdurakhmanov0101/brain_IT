import React, { useState } from 'react';
import { Bell, Sun, Moon, CheckCircle2, AlertCircle, LogOut, Menu } from 'lucide-react';
import { type User } from '../data/mockData';

interface HeaderProps {
  activeTab: string;
  currentUser: User;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: 'uz' | 'ru' | 'en';
  setLanguage: (lang: 'uz' | 'ru' | 'en') => void;
  onLogout?: () => void;
  bgAnimationEnabled?: boolean;
  setBgAnimationEnabled?: (v: boolean) => void;
  onMobileMenuToggle?: () => void;
}

const titles: Record<'uz' | 'ru' | 'en', Record<string, string>> = {
  uz: {
    dashboard: 'Boshqaruv Paneli', academy: 'IT Academy LMS & Classroom', pm: 'Loyiha Boshqaruvi (Kanban)',
    faceid: 'Face ID Real-Time Davomat', crm: 'CRM & Sales Pipeline', courses: 'Kurslar', groups: 'Guruhlar',
    students: "O'quvchilar", attendance: 'Davomat', finance: 'Moliya', payroll: 'Ustoz Maoshi',
    contracts: 'Shartnomalar', notifications: 'Xabarnomalar', reports: 'Hisobotlar',
    'student-portal': "O'quvchi Portali", 'parent-portal': 'Ota-ona Portali', default: 'Boshqaruv Paneli',
  },
  ru: { dashboard: 'Панель управления', default: 'Панель управления' },
  en: { dashboard: 'Dashboard Overview', default: 'Dashboard' },
};

const labels: Record<'uz' | 'ru' | 'en', Record<string, string>> = {
  uz: { welcome: 'Xush kelibsiz', activeRole: 'Faol rol', notifications: 'Bildirishnomalar', markRead: "O'qilgan deb belgilash", logoutTitle: 'Chiqish' },
  ru: { welcome: 'Добро пожаловать', activeRole: 'Роль', notifications: 'Уведомления', markRead: 'Отметить', logoutTitle: 'Выход' },
  en: { welcome: 'Welcome', activeRole: 'Active role', notifications: 'Notifications', markRead: 'Mark all read', logoutTitle: 'Logout' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab, currentUser, darkMode, setDarkMode,
  language, setLanguage, bgAnimationEnabled, setBgAnimationEnabled, onLogout, onMobileMenuToggle,
}) => {
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: '1', title: 'Face ID: Davomat',   message: 'Sardor Ahmedov darsga keldi (On Time)',                            type: 'success', time: '5 daqiqa oldin', read: false },
    { id: '2', title: 'Yangi Shartnoma',    message: 'UzBank loyihasi shartnomasi imzolandi',                             type: 'info',    time: '1 soat oldin',  read: false },
    { id: '3', title: 'AI Topshiriq',       message: "Davron topshirig'i 95 ball bilan tekshirildi",                      type: 'success', time: '2 soat oldin',  read: true },
    { id: '4', title: 'Moliya Xabari',      message: "Oylik to'lovlar hisoboti tayyorlandi",                              type: 'alert',   time: '1 kun oldin',   read: true },
  ]);

  const unread = notifs.filter((n) => !n.read).length;
  const getTitle = (tab: string) => titles[language][tab] ?? titles.uz[tab] ?? titles.uz.default;
  const lbl = labels[language];

  return (
    <header className="h-16 lg:h-20 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border px-4 lg:px-8 flex items-center gap-3 sticky top-0 z-30">
      <button onClick={onMobileMenuToggle} className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h2 className="font-heading font-bold text-base lg:text-xl text-slate-800 dark:text-white leading-tight truncate">{getTitle(activeTab)}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:block truncate">
          {lbl.welcome}, {currentUser.name} | {lbl.activeRole}: {currentUser.role}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <select value={language} onChange={(e) => setLanguage(e.target.value as 'uz' | 'ru' | 'en')}
          className="hidden sm:block bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 rounded-xl py-2 px-2 text-xs font-semibold focus:outline-none">
          <option value="uz">UZ</option><option value="ru">RU</option><option value="en">EN</option>
        </select>

        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
        </button>

        {setBgAnimationEnabled && (
          <button onClick={() => setBgAnimationEnabled(!bgAnimationEnabled)}
            className={`hidden sm:flex p-2 rounded-xl border text-xs font-bold transition-all ${bgAnimationEnabled ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300'}`}>
            AI
          </button>
        )}

        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            {unread > 0 && <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">{unread}</span>}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-3 w-72 lg:w-80 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <span className="font-heading font-semibold text-sm text-slate-800 dark:text-white">{lbl.notifications}</span>
                {unread > 0 && <button onClick={() => setNotifs(notifs.map((n) => ({ ...n, read: true })))} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{lbl.markRead}</button>}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border">
                {notifs.map((n) => (
                  <div key={n.id} className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}>
                    {n.type === 'alert' ? <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" /> : <CheckCircle2 className={`h-5 w-5 shrink-0 ${n.type === 'success' ? 'text-emerald-500' : 'text-indigo-500'}`} />}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-dark-border hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{currentUser.name}</p>
            <span className="text-xs text-slate-400">{currentUser.role}</span>
          </div>
          <img src={currentUser.avatar} alt={currentUser.name} className="h-9 w-9 rounded-full border border-slate-200 dark:border-dark-border object-cover" />
        </div>

        {onLogout && (
          <button onClick={onLogout} className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20" title={lbl.logoutTitle}>
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};
