import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ToastContainer } from '../components/Toast';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

const getThemeStyle = (role: string) => {
  if (role === 'Teacher') {
    return {
      '--color-brand-50': '#f5f3ff',
      '--color-brand-100': '#ede9fe',
      '--color-brand-200': '#ddd6fe',
      '--color-brand-400': '#a78bfa',
      '--color-brand-500': '#8b5cf6',
      '--color-brand-600': '#7c3aed',
      '--color-brand-700': '#6d28d9',
      '--color-brand-800': '#5b21b6',
      '--color-brand-900': '#4c1d95',
    } as React.CSSProperties;
  }
  if (role === 'Student') {
    return {
      '--color-brand-50': '#fffbeb',
      '--color-brand-100': '#fef3c7',
      '--color-brand-200': '#fde68a',
      '--color-brand-400': '#fbbf24',
      '--color-brand-500': '#f59e0b',
      '--color-brand-600': '#d97706',
      '--color-brand-700': '#b45309',
      '--color-brand-800': '#92400e',
      '--color-brand-900': '#78350f',
    } as React.CSSProperties;
  }
  if (role === 'Parent') {
    return {
      '--color-brand-50': '#f0fdfa',
      '--color-brand-100': '#ccfbf1',
      '--color-brand-200': '#99f6e4',
      '--color-brand-400': '#2dd4bf',
      '--color-brand-500': '#14b8a6',
      '--color-brand-600': '#0d9488',
      '--color-brand-700': '#0f766e',
      '--color-brand-800': '#115e59',
      '--color-brand-900': '#134e4a',
    } as React.CSSProperties;
  }
  return {
    '--color-brand-50': '#eef2ff',
    '--color-brand-100': '#e0e7ff',
    '--color-brand-200': '#c7d2fe',
    '--color-brand-400': '#818cf8',
    '--color-brand-500': '#6366f1',
    '--color-brand-600': '#4f46e5',
    '--color-brand-700': '#4338ca',
    '--color-brand-800': '#3730a3',
    '--color-brand-900': '#312e81',
  } as React.CSSProperties;
};

export const MainLayout: React.FC = () => {
  const { darkMode, setDarkMode, language, setLanguage, sidebarCollapsed, toggleSidebar } = useUIStore();
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser = authStore.currentUser;
  if (!currentUser) return null;

  const currentTab = location.pathname.replace('/', '') || 'dashboard';
  const themeStyle = getThemeStyle(currentUser.role);

  return (
    <div style={themeStyle} className="flex h-screen w-screen overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-500 relative font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* Global ambient glow (very subtle for Zinc Studio) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar */}
      <Sidebar
        activeTab={currentTab}
        setActiveTab={(path) => navigate(`/${path}`)}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative overflow-hidden">
        {/* Header - Flush at the top */}
        <div className="shrink-0 relative z-50">
          <Header
            activeTab={currentTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            language={language}
            setLanguage={setLanguage}
            onLogout={() => { authStore.logout(); window.location.href = '/login'; }}
            onMobileMenuToggle={() => setMobileOpen(true)}
          />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar relative z-0 bg-zinc-50 dark:bg-dark-bg">
          <div className="max-w-[1600px] xl:max-w-[1650px] mx-auto w-full h-full page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
