import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn, AlertCircle, Fingerprint, Shield, Sun, Moon, Sparkles, ArrowLeft, CheckCircle2, Code, Award, Users, TrendingUp } from 'lucide-react';
import { useAuthStore, mockLogin } from '../../stores/authStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';

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

    try {
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
    } catch {
      setError("Tizimda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className={`min-h-screen w-full flex font-sans transition-colors duration-500 ${darkMode ? 'bg-[#09090b] text-white' : 'bg-[#f4f4f5] text-zinc-900'}`}>
      
      {/* ──────────────── LEFT PANEL (50%): STRIPE / LINEAR INSPIRED SHOWCASE ──────────────── */}
      <div className={`hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden border-r transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-[#09090b] via-[#0f1117] to-[#09090b] text-white border-zinc-800/80' : 'bg-gradient-to-br from-emerald-900 via-slate-900 to-zinc-950 text-white border-zinc-800'}`}>
        
        {/* Background Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full max-w-lg mx-auto w-full">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-brand-500/30">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl tracking-tight text-white flex items-center gap-2">
                  Brain IT <span className="text-brand-300 text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 font-extrabold uppercase">LMS Ecosystem</span>
                </span>
                <span className="text-xs uppercase font-bold tracking-widest text-zinc-400 mt-0.5">
                  Professional CRM Platform
                </span>
              </div>
            </a>
          </div>

          {/* Center Showcase Interactive Cards */}
          <div className="space-y-8 my-auto py-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/15 border border-brand-500/30 text-brand-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Yangi Avlod Ta'lim Tizimi</span>
            </div>

            <h1 className="font-heading font-black text-4xl xl:text-5xl leading-tight tracking-tight text-white">
              Zamonaviy IT ta'limi <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">yagona tizimda</span>
            </h1>

            <p className="text-sm xl:text-base leading-relaxed text-zinc-300 font-normal">
              O'quvchilarni boshqarish, jonli kod yechish (compiler), avtomatlashgan davomat va gamifikatsiya — barchasi yagona yuqori tezlikdagi ekotizimda.
            </p>

            {/* Feature Stat Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">FaceID & Davomat</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">Har bir dars davomati real vaqtda qayd etiladi va hisoblanadi.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Code className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Live Code Compiler</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">JS, Python, C++, Java va HTML topshiriqlarini brauzerda tekshiring.</p>
              </div>
            </div>
          </div>

          {/* Bottom copyright info */}
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400 pt-6 border-t border-white/10">
            <span>© 2026 Brain IT Academy & Co.</span>
            <div className="flex items-center gap-2 text-zinc-300">
              <Shield className="w-4 h-4 text-brand-400" />
              <span>Enterprise SSL Shifrlangan</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── RIGHT PANEL (50%): CLEAN AUTH FORM ──────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto bg-light-surface dark:bg-dark-surface transition-colors duration-500">
        
        {/* Top Bar Navigation */}
        <div className="absolute top-6 inset-x-6 sm:inset-x-12 max-w-md lg:mx-auto lg:left-1/2 lg:-translate-x-1/2 flex items-center justify-between z-20">
          <a href="/" className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-brand-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifa</span>
          </a>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-brand-600 transition-all"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />}
          </button>
        </div>

        {/* Form Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md my-auto pt-16 lg:pt-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative space-y-7"
        >
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              B
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-zinc-950 dark:text-white">Brain IT <span className="text-emerald-600">LMS</span></span>
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>XAVFSIZ VA AVTOMATIK KIRISH</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-zinc-900 dark:text-white">
              Tizimga kirish
            </h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              O'z parolingiz va loginingiz bilan tizimga kiring.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / ID Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Login / Foydalanuvchi nomi
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${focusInput === 'username' ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  <Fingerprint className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusInput('username')}
                  onBlur={() => setFocusInput(null)}
                  placeholder="masalan: superadmin, teacher1, student1"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
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
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${focusInput === 'password' ? 'text-emerald-600' : 'text-zinc-400'}`}>
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
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-bold tracking-wider text-xs uppercase">Tekshirilmoqda...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Tizimga kirish</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Mobile Footer */}
        <div className="mt-8 text-center text-[11px] text-zinc-400 lg:hidden">
          © 2026 Brain IT Academy & Co.
        </div>
      </div>

    </div>
  );
};
