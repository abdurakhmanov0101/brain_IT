import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn, AlertCircle, Fingerprint, Shield, Sun, Moon, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { MatrixRain } from '../../components/MatrixRain';

interface LoginPageProps {
  onLogin: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusInput, setFocusInput] = useState<'username' | 'password' | null>(null);

  const { setUser } = useAuthStore();
  const { students } = useStudentStore();
  const { teachers } = useTeacherStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const u = username.trim().toLowerCase();
    const p = password.trim();

    import('../../stores/authStore').then(async ({ mockLogin }) => {
      const result = await mockLogin(u, p);
      if (result) {
        setUser(result.user, result.token);
        onLogin();
      } else {
        const teacher = teachers.find((t) => {
          const byUsername = t.username.toLowerCase() === u && t.password === p;
          const byEmail = t.email.split('@')[0].toLowerCase() === u && t.phone.replace(/\D/g, '').slice(-6) === p;
          return byUsername || byEmail;
        });
        if (teacher) {
          setUser({ id: teacher.id, name: teacher.fullName, role: 'Teacher' as any, avatar: teacher.photo }, `mock_token_t_${teacher.id}`);
          onLogin();
          setLoading(false);
          return;
        }

        const student = students.find((s) => s.studentUsername.toLowerCase() === u && s.studentPassword === p);
        if (student) {
          setUser({ id: student.id, name: student.fullName, role: 'Student' as any, avatar: student.photo, studentId: student.id }, `mock_token_s_${student.id}`);
          onLogin();
          setLoading(false);
          return;
        }

        const parentStu = students.find((s) => s.parentUsername.toLowerCase() === u && s.parentPassword === p);
        if (parentStu) {
          setUser({
            id: `parent_${parentStu.id}`,
            name: `${parentStu.fullName}ning ota-onasi`,
            role: 'Parent' as any,
            studentId: parentStu.id,
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
          }, `mock_token_p_${parentStu.id}`);
          onLogin();
          setLoading(false);
          return;
        }

        setError("Ruxsat etilmadi. Login yoki parol xato.");
      }
      setLoading(false);
    });
  };

  return (
    <div className={`min-h-screen w-full flex font-sans transition-colors duration-500 ${darkMode ? 'bg-[#09090b] text-white' : 'bg-[#f4f4f5] text-zinc-900'}`}>
      
      {/* ──────────────── LEFT PANEL (45%): BRANDING + MATRIX ──────────────── */}
      <div className={`hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 xl:p-16 2xl:p-24 overflow-hidden border-r transition-colors duration-500 ${darkMode ? 'bg-[#09090b] text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200'}`}>
        <MatrixRain opacity={0.28} darkMode={darkMode} />

        <div className="relative z-10 flex flex-col justify-between h-full max-w-sm xl:max-w-md mx-auto w-full">
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-600/30">
                B
              </div>
              <div className="flex flex-col">
                <span className={`font-heading font-black text-lg tracking-tight flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Brain IT <span className="text-brand-600 dark:text-brand-400 text-xs px-2 py-0.5 rounded bg-brand-500/10 dark:bg-brand-500/20 font-bold">LMS</span>
                </span>
                <span className={`text-[11px] uppercase font-bold tracking-widest -mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Ecosystem
                </span>
              </div>
            </a>
          </div>

          {/* Center Quote / Feature Highlight */}
          <div className="space-y-6 my-auto py-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-brand-500/10 border border-brand-500/20 text-brand-400' : 'bg-brand-50 border border-brand-200 text-brand-700'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enterprise Ta'lim Tizimi</span>
            </div>
            <h1 className={`font-heading font-black text-4xl xl:text-5xl leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
              Kelajak faqat <span className="text-brand-600 dark:text-brand-400">IT bilan!</span>
            </h1>
            <p className={`text-base leading-relaxed font-normal ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Barcha o'quv jarayonlari, vazifalar, davomatlar, va moliyaviy hisobotlar yagona professional platformada boshqariladi.
            </p>

            <div className={`pt-6 grid grid-cols-2 gap-4 border-t ${darkMode ? 'border-zinc-800/80' : 'border-zinc-200'}`}>
              <div>
                <div className={`font-heading font-black text-2xl ${darkMode ? 'text-white' : 'text-zinc-900'}`}>100%</div>
                <div className={`text-xs font-medium uppercase tracking-wider mt-0.5 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Avtomatlashgan nazorat</div>
              </div>
              <div>
                <div className="font-heading font-black text-2xl text-brand-600 dark:text-brand-400">AI</div>
                <div className={`text-xs font-medium uppercase tracking-wider mt-0.5 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Mentor & Tekshiruv</div>
              </div>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className={`flex items-center justify-between text-xs font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <span>© 2026 Brain IT Academy & Co.</span>
            <div className={`flex items-center gap-1.5 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-brand-500" />
              <span>256-bit SSL Shifrlangan</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── RIGHT PANEL (55%): CLEAN LOGIN FORM ──────────────── */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto bg-light-surface dark:bg-dark-surface transition-colors duration-500">
        
        {/* Top bar on right panel for mobile branding + theme toggle */}
        <div className="absolute top-6 inset-x-6 sm:inset-x-12 max-w-md lg:mx-auto lg:left-1/2 lg:-translate-x-1/2 flex items-center justify-between z-20">
          <a href="/" className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-brand-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </a>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-brand-600 transition-all"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />}
          </button>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8 my-auto pt-16 lg:pt-0"
        >
          {/* Mobile Logo (hidden on desktop) */}
          <div className="flex lg:hidden items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              B
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-zinc-950 dark:text-white">Brain IT <span className="text-brand-600">LMS</span></span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-zinc-900 dark:text-white">
              Xush kelibsiz
            </h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Tizimga kirish uchun login va parolingizni kiriting.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username / ID Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Foydalanuvchi nomi yoki ID
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${focusInput === 'username' ? 'text-brand-600' : 'text-zinc-400'}`}>
                  <Fingerprint className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusInput('username')}
                  onBlur={() => setFocusInput(null)}
                  placeholder="masalan: student1 yoki o'qituvchi logini"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Parol
                </label>
              </div>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${focusInput === 'password' ? 'text-brand-600' : 'text-zinc-400'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusInput('password')}
                  onBlur={() => setFocusInput(null)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary w-full py-3.5 mt-2 text-sm justify-center shadow-lg shadow-brand-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-bold tracking-wider text-xs uppercase">Tekshirilmoqda...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span className="font-bold tracking-wider text-xs uppercase">Tizimga kirish</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Help Box */}
          <div className="p-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5">
            <p className="font-bold text-zinc-700 dark:text-zinc-300">Test uchun ma'lumotlar:</p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div>O'quvchi: <span className="text-brand-600 dark:text-brand-400 font-bold">student1</span> / <span className="font-bold">123</span></div>
              <div>O'qituvchi: <span className="text-brand-600 dark:text-brand-400 font-bold">teacher1</span> / <span className="font-bold">123</span></div>
            </div>
          </div>
        </motion.div>

        {/* Mobile footer copyright */}
        <div className="mt-8 text-center text-[11px] text-zinc-400 lg:hidden">
          © 2026 Brain IT Academy & Co.
        </div>
      </div>

    </div>
  );
};
