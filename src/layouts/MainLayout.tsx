import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ToastContainer } from '../components/Toast';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

export const MainLayout: React.FC = () => {
  const { darkMode, setDarkMode, language, setLanguage, sidebarCollapsed, toggleSidebar } = useUIStore();
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser = authStore.currentUser;
  if (!currentUser) return null;

  const currentTab = location.pathname.replace('/', '') || 'dashboard';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-500 relative font-sans text-zinc-900 dark:text-zinc-100">
      
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar relative z-0 bg-zinc-50 dark:bg-[#09090b]">
          <div className="max-w-[1700px] mx-auto w-full h-full page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
