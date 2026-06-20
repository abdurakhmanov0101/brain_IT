import { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { Overview } from './features/dashboard/Overview';
import { Classroom } from './features/academy/Classroom';
import { KanbanBoard } from './features/pm/KanbanBoard';
import { FaceIDAttendance } from './features/faceid/FaceIDAttendance';
import { CrmPipeline } from './features/crm/CrmPipeline';
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore';
import {
  users,
  leads as initialLeads,
  projects as initialProjects,
  initialAttendance,
  type User,
  type Lead,
  type Project,
  type AttendanceLog,
} from './data/mockData';

const Groups         = lazy(() => import('./features/groups/Groups').then((m) => ({ default: m.Groups })));
const Courses        = lazy(() => import('./features/courses/Courses').then((m) => ({ default: m.Courses })));
const Students       = lazy(() => import('./features/students/Students').then((m) => ({ default: m.Students })));
const Attendance     = lazy(() => import('./features/attendance/Attendance').then((m) => ({ default: m.Attendance })));
const Finance        = lazy(() => import('./features/finance/Finance').then((m) => ({ default: m.Finance })));
const TeacherPayroll = lazy(() => import('./features/payroll/TeacherPayroll').then((m) => ({ default: m.TeacherPayroll })));
const Contracts      = lazy(() => import('./features/contracts/Contracts').then((m) => ({ default: m.Contracts })));
const Notifications  = lazy(() => import('./features/notifications/Notifications').then((m) => ({ default: m.Notifications })));
const Reports        = lazy(() => import('./features/reports/Reports').then((m) => ({ default: m.Reports })));
const StudentPortal  = lazy(() => import('./features/portals/StudentPortal').then((m) => ({ default: m.StudentPortal })));
const ParentPortal   = lazy(() => import('./features/portals/ParentPortal').then((m) => ({ default: m.ParentPortal })));

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
  </div>
);

type ViewMode = 'landing' | 'login' | 'portal';

const DEFAULT_TABS: Partial<Record<User['role'], string>> = {
  Student: 'student-portal',
  Parent: 'parent-portal',
};

const TAB_ACCESS: Record<string, User['role'][]> = {
  dashboard:        ['Super Admin', 'Academy Director', 'Company Director', 'Project Manager', 'Teacher', 'Student'],
  academy:          ['Super Admin', 'Academy Director', 'Teacher', 'Student'],
  courses:          ['Super Admin', 'Academy Director', 'Teacher'],
  groups:           ['Super Admin', 'Academy Director', 'Teacher'],
  students:         ['Super Admin', 'Academy Director', 'Teacher'],
  attendance:       ['Super Admin', 'Academy Director', 'Teacher'],
  finance:          ['Super Admin', 'Academy Director', 'Company Director'],
  payroll:          ['Super Admin', 'Academy Director'],
  pm:               ['Super Admin', 'Company Director', 'Project Manager', 'Developer', 'Client'],
  faceid:           ['Super Admin', 'Academy Director', 'Company Director', 'Teacher'],
  crm:              ['Super Admin', 'Company Director', 'Project Manager'],
  contracts:        ['Super Admin', 'Academy Director'],
  notifications:    ['Super Admin', 'Academy Director'],
  reports:          ['Super Admin', 'Academy Director', 'Company Director'],
  'student-portal': ['Super Admin', 'Academy Director', 'Student', 'Parent'],
  'parent-portal':  ['Super Admin', 'Academy Director', 'Student', 'Parent'],
};

function buildPortalUser(authUser: { id: string; name: string; role: User['role']; avatar?: string }): User {
  const matched = users.find((u) => u.role === authUser.role);
  return {
    id: authUser.id,
    name: authUser.name,
    email: matched?.email ?? `${authUser.role.replace(/\s+/g, '').toLowerCase()}@brainit.uz`,
    role: authUser.role,
    avatar: authUser.avatar ?? matched?.avatar ?? 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=100&h=100&fit=crop',
  };
}

function App() {
  const { darkMode, setDarkMode, language, setLanguage } = useUIStore();
  const authStore = useAuthStore();

  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bgAnimationEnabled, setBgAnimationEnabled] = useState(() => {
    try { return localStorage.getItem('landing:bgAnimationEnabled') !== '0'; } catch { return true; }
  });
  const [leadsList, setLeadsList] = useState<Lead[]>(initialLeads);
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [logs, setLogs] = useState<AttendanceLog[]>(initialAttendance);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    try { localStorage.setItem('landing:bgAnimationEnabled', bgAnimationEnabled ? '1' : '0'); } catch {}
  }, [bgAnimationEnabled]);

  const handleAddLead = (data: { name: string; phone: string; email: string; source: string; value: string }) => {
    setLeadsList((p) => [...p, { id: `ld_${Date.now()}`, ...data, status: 'new', date: new Date().toISOString().split('T')[0] }]);
  };

  const handleLoginSuccess = () => {
    const auth = authStore.currentUser;
    if (!auth) return;
    const user = buildPortalUser(auth);
    setCurrentUser(user);
    setActiveTab(DEFAULT_TABS[user.role] ?? 'dashboard');
    setViewMode('portal');
  };

  const handleRoleChange = (role: User['role']) => {
    const found = users.find((u) => u.role === role) ?? {
      id: `u_${role.replace(/\s+/g, '_').toLowerCase()}`,
      name: role,
      email: `${role.replace(/\s+/g, '').toLowerCase()}@brainit.uz`,
      role,
      avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=100&h=100&fit=crop',
    };
    setCurrentUser(found);
    const next = DEFAULT_TABS[role];
    if (next) { setActiveTab(next); return; }
    if (!TAB_ACCESS[activeTab]?.includes(role)) setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':      return <Overview currentUser={currentUser} setActiveTab={setActiveTab} projectsList={projectsList} />;
      case 'academy':        return <Classroom currentUser={currentUser} />;
      case 'pm':             return <KanbanBoard projectsList={projectsList} setProjectsList={setProjectsList} />;
      case 'faceid':         return <FaceIDAttendance logs={logs} setLogs={setLogs} />;
      case 'crm':            return <CrmPipeline leadsList={leadsList} setLeadsList={setLeadsList} />;
      case 'groups':         return <Suspense fallback={<Spinner />}><Groups /></Suspense>;
      case 'courses':        return <Suspense fallback={<Spinner />}><Courses /></Suspense>;
      case 'students':       return <Suspense fallback={<Spinner />}><Students /></Suspense>;
      case 'attendance':     return <Suspense fallback={<Spinner />}><Attendance /></Suspense>;
      case 'finance':        return <Suspense fallback={<Spinner />}><Finance /></Suspense>;
      case 'payroll':        return <Suspense fallback={<Spinner />}><TeacherPayroll /></Suspense>;
      case 'contracts':      return <Suspense fallback={<Spinner />}><Contracts /></Suspense>;
      case 'notifications':  return <Suspense fallback={<Spinner />}><Notifications /></Suspense>;
      case 'reports':        return <Suspense fallback={<Spinner />}><Reports /></Suspense>;
      case 'student-portal': return <Suspense fallback={<Spinner />}><StudentPortal /></Suspense>;
      case 'parent-portal':  return <Suspense fallback={<Spinner />}><ParentPortal /></Suspense>;
      default:               return <Overview currentUser={currentUser} setActiveTab={setActiveTab} projectsList={projectsList} />;
    }
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onEnterPortal={() => setViewMode('login')}
        onAddLead={handleAddLead}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        bgAnimationEnabled={bgAnimationEnabled}
        setBgAnimationEnabled={setBgAnimationEnabled}
      />
    );
  }

  if (viewMode === 'login') {
    return (
      <LoginPage
        onLogin={handleLoginSuccess}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        showRbac
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          language={language}
          setLanguage={setLanguage}
          bgAnimationEnabled={bgAnimationEnabled}
          setBgAnimationEnabled={setBgAnimationEnabled}
          onLogout={() => { authStore.logout(); setViewMode('landing'); }}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
