import React, { useState } from 'react';
import { Bell, Sun, Moon, LogOut, Menu, Coins, Search, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCoinStore } from '../stores/coinStore';
import { useUIStore } from '../stores/uiStore';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Boshqaruv Paneli',
  academy: 'LMS & Classroom',
  courses: 'Kurslar',
  groups: 'Guruhlar',
  students: "O'quvchilar",
  teachers: 'Ustozlar',
  attendance: 'Davomat',
  finance: 'Kassa / Moliya',
  payroll: 'Ustoz Maoshi',
  coins: 'Tanga Tizimi',
  market: 'Market',
  crm: 'CRM Pipeline',
  pm: 'Kanban Topshiriqlar',
  faceid: 'Face ID Davomat',
  staff: 'Xodimlar (HR)',
  contracts: 'Shartnomalar',
  notifications: 'Xabarnomalar',
  reports: 'Hisobotlar',
  'student-portal': "O'quvchi Portali",
  'parent-portal': 'Ota-ona Portali',
  'teacher-portal': 'Ustoz Paneli',
  'staff-portal': 'Xodim Paneli',
  'homework': 'Uy‑vazifalar',
  'settings': 'Sozlamalar',
  'roles': 'Rollar va Huquqlar (Super Admin)',
};

interface HeaderProps {
  activeTab: string;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: 'uz' | 'ru' | 'en';
  setLanguage: (lang: 'uz' | 'ru' | 'en') => void;
  onLogout?: () => void;
  onMobileMenuToggle?: () => void;
}

const NOTIFS = [
  { id: '1', title: 'Yangi to\'lov', message: "Sardor Ahmedov oylik to'lovini amalga oshirdi", time: '5 daqiqa oldin', read: false, color: 'emerald' },
  { id: '2', title: 'Yangi shartnoma', message: 'UzBank loyihasi shartnomasi imzolandi', time: '1 soat oldin', read: false, color: 'violet' },
  { id: '3', title: 'AI baholash', message: "Davron topshirig'i 95 ball bilan tekshirildi", time: '2 soat oldin', read: true, color: 'violet' },
  { id: '4', title: 'Moliya hisoboti', message: "Oylik to'lovlar hisoboti tayyorlandi", time: '1 kun oldin', read: true, color: 'amber' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab, darkMode, setDarkMode, language, setLanguage, onLogout, onMobileMenuToggle,
}) => {
  const { currentUser } = useAuthStore();
  const { balances } = useCoinStore();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);

  if (!currentUser) return null;

  const myCoins = balances[currentUser.id] || 0;
  const unread = notifs.filter(n => !n.read).length;
  const title = PAGE_TITLES[activeTab] ?? 'Boshqaruv Paneli';

  return (
    <header className="h-[72px] px-4 lg:px-6 flex items-center justify-between gap-4 relative z-30 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border shadow-sm">
      
      {/* Left side: Mobile Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="font-heading font-black text-lg lg:text-xl text-zinc-900 dark:text-white leading-tight truncate">
            {title}
          </h2>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            <span className="text-violet-600 dark:text-violet-400">{currentUser.name}</span>
            <span className="mx-1.5">•</span>
            <span>{currentUser.role}</span>
          </p>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-xl hidden md:flex items-center px-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="O'quvchi, guruh yoki kurs qidirish..."
            className="input-field w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Mobile Search Button */}
        <button className="md:hidden p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
          <Search className="h-5 w-5" />
        </button>

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'uz' | 'ru' | 'en')}
          className="hidden lg:block text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-transparent border-0 focus:ring-0 cursor-pointer py-1 pr-1 rounded-lg hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <option value="uz" className="bg-white dark:bg-dark-card">UZ</option>
          <option value="ru" className="bg-white dark:bg-dark-card">RU</option>
          <option value="en" className="bg-white dark:bg-dark-card">EN</option>
        </select>

        {/* Coin balance */}
        <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-amber-500/20 transition-colors">
          <Coins className="h-4 w-4 text-amber-500" />
          <span className="font-heading font-black text-sm text-amber-600 dark:text-amber-400">{myCoins.toLocaleString()}</span>
        </div>

        {/* Dark mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-violet-600 transition-all"
        >
          {darkMode
            ? <Sun className="h-5 w-5 text-amber-400" />
            : <Moon className="h-5 w-5" />
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-violet-600 transition-all"
          >
            <Bell className={`h-5 w-5 ${unread > 0 ? 'text-violet-500' : ''}`} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 border border-white dark:border-zinc-900" />
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 lg:w-96 card p-0 z-50 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-light-border dark:border-dark-border">
                <h3 className="font-heading font-bold text-sm text-zinc-900 dark:text-white">Xabarnomalar</h3>
                {unread > 0 && (
                  <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline">
                    O'qildi
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {notifs.map(n => (
                  <div key={n.id} className={`px-5 py-4 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!n.read ? 'bg-violet-500/5' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-violet-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{n.title}</p>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-2 uppercase tracking-wider">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="relative">
              <img
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=7c3aed&color=fff&bold=true`}
                alt={currentUser.name}
                className="h-8 w-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-surface" />
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 card p-1 z-50 overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-light-border dark:border-dark-border mb-1 sm:hidden">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mt-0.5">{currentUser.role}</p>
              </div>
              <button
                onClick={() => { setShowProfile(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
              >
                <Settings className="h-4 w-4 text-zinc-400" /> Sozlamalar
              </button>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-1" />
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Chiqish
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
