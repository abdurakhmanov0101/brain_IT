import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
const Overview         = lazy(() => import('./features/dashboard/Overview').then((m) => ({ default: m.Overview })));
const Classroom        = lazy(() => import('./features/academy/Classroom').then((m) => ({ default: m.Classroom })));
const KanbanBoard      = lazy(() => import('./features/pm/KanbanBoard').then((m) => ({ default: m.KanbanBoard })));
const FaceIDAttendance = lazy(() => import('./features/faceid/FaceIDAttendance').then((m) => ({ default: m.FaceIDAttendance })));
const CrmPipeline      = lazy(() => import('./features/crm/CrmPipeline').then((m) => ({ default: m.CrmPipeline })));
import { useUIStore } from './stores/uiStore';

const Teachers       = lazy(() => import('./features/teachers/Teachers').then((m) => ({ default: m.Teachers })));
const Groups         = lazy(() => import('./features/groups/Groups').then((m) => ({ default: m.Groups })));
const Courses        = lazy(() => import('./features/courses/Courses').then((m) => ({ default: m.Courses })));
const Students       = lazy(() => import('./features/students/Students').then((m) => ({ default: m.Students })));
const Attendance     = lazy(() => import('./features/attendance/Attendance').then((m) => ({ default: m.Attendance })));
const Finance        = lazy(() => import('./features/finance/Finance').then((m) => ({ default: m.Finance })));
const TeacherPayroll = lazy(() => import('./features/payroll/TeacherPayroll').then((m) => ({ default: m.TeacherPayroll })));
const Contracts      = lazy(() => import('./features/contracts/Contracts').then((m) => ({ default: m.Contracts })));
const Notifications  = lazy(() => import('./features/notifications/Notifications').then((m) => ({ default: m.Notifications })));
const Reports        = lazy(() => import('./features/reports/Reports').then((m) => ({ default: m.Reports })));
const Market         = lazy(() => import('./features/market/Market').then((m) => ({ default: m.Market })));
const StaffModule    = lazy(() => import('./features/staff/Staff').then((m) => ({ default: m.StaffModule })));
const TeacherPortal  = lazy(() => import('./features/portals/TeacherPortal').then((m) => ({ default: m.TeacherPortal })));
const StudentPortal  = lazy(() => import('./features/portals/StudentPortal').then((m) => ({ default: m.StudentPortal })));
const ParentPortal   = lazy(() => import('./features/portals/ParentPortal').then((m) => ({ default: m.ParentPortal })));
const StaffPortal    = lazy(() => import('./features/portals/StaffPortal').then((m) => ({ default: m.StaffPortal })));
const CoinPanel      = lazy(() => import('./features/coins/CoinPanel').then((m) => ({ default: m.CoinPanel })));
const Homework       = lazy(() => import('./features/homework/Homework').then((m) => ({ default: m.Homework })));
const SettingsPage   = lazy(() => import('./features/settings/Settings').then((m) => ({ default: m.Settings })));
const RolesPage      = lazy(() => import('./features/roles/RolesPage').then((m) => ({ default: m.RolesPage })));
const Certificates   = lazy(() => import('./features/certificates/Certificates').then((m) => ({ default: m.Certificates })));
const VerifyCertificate = lazy(() => import('./features/certificates/VerifyCertificate').then((m) => ({ default: m.VerifyCertificate })));


const Spinner = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[50vh] gap-4">
    <div className="relative w-16 h-16">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
      {/* Inner neuron SVG */}
      <div className="absolute inset-2 flex items-center justify-center">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-brand-500">
          <line x1="12" y1="16" x2="28" y2="12" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="12" y1="16" x2="20" y2="36" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="28" y1="12" x2="38" y2="28" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="20" y1="36" x2="38" y2="28" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
          
          <circle cx="12" cy="16" r="4" fill="currentColor" className="animate-pulse" />
          <circle cx="28" cy="12" r="4.5" fill="currentColor" style={{ animationDelay: '0.2s' }} className="animate-pulse animate-duration-1000" />
          <circle cx="20" cy="36" r="3.5" fill="currentColor" style={{ animationDelay: '0.4s' }} className="animate-pulse animate-duration-1000" />
          <circle cx="38" cy="28" r="5" fill="currentColor" style={{ animationDelay: '0.6s' }} className="animate-pulse animate-duration-1000" />
        </svg>
      </div>
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Yuklanmoqda...</span>
  </div>
);

function AppRoutes() {
  const { darkMode, setDarkMode, language, setLanguage } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage 
        onEnterPortal={() => navigate('/login')} 
        onAddLead={() => {}} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        language={language} 
        setLanguage={setLanguage} 
        bgAnimationEnabled={true} 
        setBgAnimationEnabled={() => {}} 
      />} />
      <Route path="/verify-certificate/:id" element={<Suspense fallback={<Spinner />}><VerifyCertificate /></Suspense>} />


      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage 
          onLogin={() => navigate('/dashboard')} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
        />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/academy" element={<Classroom />} />
          <Route path="/pm" element={<KanbanBoard />} />
          <Route path="/faceid" element={<FaceIDAttendance />} />
          <Route path="/crm" element={<CrmPipeline />} />
          
          {/* Lazy Loaded Routes */}
          <Route path="/teachers" element={<Suspense fallback={<Spinner />}><Teachers /></Suspense>} />
          <Route path="/groups" element={<Suspense fallback={<Spinner />}><Groups /></Suspense>} />
          <Route path="/courses" element={<Suspense fallback={<Spinner />}><Courses /></Suspense>} />
          <Route path="/students" element={<Suspense fallback={<Spinner />}><Students /></Suspense>} />
          <Route path="/attendance" element={<Suspense fallback={<Spinner />}><Attendance /></Suspense>} />
          <Route path="/finance" element={<Suspense fallback={<Spinner />}><Finance /></Suspense>} />
          <Route path="/payroll" element={<Suspense fallback={<Spinner />}><TeacherPayroll /></Suspense>} />
          <Route path="/contracts" element={<Suspense fallback={<Spinner />}><Contracts /></Suspense>} />
          <Route path="/notifications" element={<Suspense fallback={<Spinner />}><Notifications /></Suspense>} />
          <Route path="/market" element={<Suspense fallback={<Spinner />}><Market /></Suspense>} />
          <Route path="/staff" element={<Suspense fallback={<Spinner />}><StaffModule /></Suspense>} />
          <Route path="/teacher-portal" element={<Suspense fallback={<Spinner />}><TeacherPortal /></Suspense>} />
          <Route path="/reports" element={<Suspense fallback={<Spinner />}><Reports /></Suspense>} />
          <Route path="/student-portal" element={<Suspense fallback={<Spinner />}><StudentPortal studentId="st1" /></Suspense>} />
          <Route path="/parent-portal" element={<Suspense fallback={<Spinner />}><ParentPortal studentId="st1" /></Suspense>} />
          <Route path="/staff-portal" element={<Suspense fallback={<Spinner />}><StaffPortal /></Suspense>} />
          <Route path="/coins" element={<Suspense fallback={<Spinner />}><CoinPanel /></Suspense>} />
          <Route path="/homework" element={<Suspense fallback={<Spinner />}><Homework /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<Spinner />}><SettingsPage /></Suspense>} />
          <Route path="/roles" element={<Suspense fallback={<Spinner />}><RolesPage /></Suspense>} />
          <Route path="/certificates" element={<Suspense fallback={<Spinner />}><Certificates /></Suspense>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
