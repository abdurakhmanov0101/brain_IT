import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { Overview } from './features/dashboard/Overview';
import { Classroom } from './features/academy/Classroom';
import { KanbanBoard } from './features/pm/KanbanBoard';
import { FaceIDAttendance } from './features/faceid/FaceIDAttendance';
import { CrmPipeline } from './features/crm/CrmPipeline';
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

const Spinner = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[50vh]">
    <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
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
