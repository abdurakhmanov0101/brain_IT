import React, { useState } from 'react';
import { GraduationCap, User, Lock, Eye, EyeOff, LogIn, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuthStore, ADMIN_ACCOUNTS, type AuthRole } from '../../stores/authStore';
import { useStudentStore } from '../../stores/studentStore';
import { initialTeachers } from '../../stores/teacherStore';

interface LoginPageProps {
  onLogin: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const DEMO_HINTS = [
  { role: 'Super Admin', username: 'admin', password: 'admin123', color: 'text-rose-600 dark:text-rose-400' },
  { role: 'Academy Director', username: 'director', password: 'director123', color: 'text-violet-600 dark:text-violet-400' },
  { role: "O'qituvchi", username: 'bobur', password: '112233', color: 'text-blue-600 dark:text-blue-400' },
  { role: "O'quvchi", username: 'aziz4567', password: '234567', color: 'text-emerald-600 dark:text-emerald-400' },
  { role: 'Ota-ona', username: 'ota_aziz4560', password: '234560', color: 'text-amber-600 dark:text-amber-400' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const { students } = useStudentStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const u = username.trim().toLowerCase();
    const p = password.trim();

    const adminAcc = ADMIN_ACCOUNTS.find((a) => a.username === u && a.password === p);
    if (adminAcc) { setUser(adminAcc.user); onLogin(); setLoading(false); return; }

    const teacher = initialTeachers.find((t) => {
      const tUsername = t.email.split('@')[0].toLowerCase();
      const tPassword = t.phone.replace(/\D/g, '').slice(-6);
      return tUsername === u && tPassword === p;
    });
    if (teacher) {
      setUser({ id: teacher.id, name: teacher.fullName, role: 'Teacher' as AuthRole, avatar: teacher.photo });
      onLogin(); setLoading(false); return;
    }

    const student = students.find((s) => s.studentUsername.toLowerCase() === u && s.studentPassword === p);
    if (student) {
      setUser({ id: student.id, name: student.fullName, role: 'Student' as AuthRole, avatar: student.photo, studentId: student.id });
      onLogin(); setLoading(false); return;
    }

    const parentStu = students.find((s) => s.parentUsername.toLowerCase() === u && s.parentPassword === p);
    if (parentStu) {
      setUser({
        id: `parent_${parentStu.id}`,
        name: `${parentStu.fullName}ning ota-onasi`,
        role: 'Parent' as AuthRole,
        studentId: parentStu.id,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
      });
      onLogin(); setLoading(false); return;
    }

    setError("Login yoki parol noto'g'ri. Iltimos qayta urinib ko'ring.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/15 backdrop-blur rounded-3xl mb-8 shadow-2xl border border-white/20">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Brain IT Academy</h1>
          <p className="text-indigo-200 text-lg mb-12">Ta'lim boshqaruv tizimi</p>
          <div className="space-y-4 text-left">
            {[
              { icon: '🎓', label: "O'quvchilar portali", desc: "Darslar, davomat, balans" },
              { icon: '👨‍👩‍👧', label: 'Ota-onalar portali', desc: "Farzand taraqqiyotini kuzating" },
              { icon: '👨‍🏫', label: "O'qituvchilar paneli", desc: 'Guruhlar, davomat belgilash' },
              { icon: '⚡', label: 'Admin boshqaruvi', desc: "To'liq boshqaruv imkoniyati" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl px-5 py-3.5 border border-white/15">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-indigo-200 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/30">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">Brain IT Academy</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Boshqaruv tizimi</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tizimga kirish</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Login va parolingizni kiriting</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Foydalanuvchi nomi</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin yoki aziz4567" autoComplete="username" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Parol</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parolni kiriting" autoComplete="current-password" required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading || !username || !password}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 mt-2">
                {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="h-4 w-4" />Kirish</>}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Demo kirish (bosing)</p>
              <div className="space-y-1.5">
                {DEMO_HINTS.map((h) => (
                  <button key={h.username} type="button" onClick={() => { setUsername(h.username); setPassword(h.password); setError(''); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group">
                    <div className="flex items-center gap-2 text-left">
                      <span className={`text-xs font-semibold ${h.color} w-32 shrink-0`}>{h.role}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{h.username} / {h.password}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 px-1">
            <p className="text-xs text-slate-400">© 2026 Brain IT Academy</p>
            <button onClick={() => setDarkMode(!darkMode)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              {darkMode ? '☀️ Kunduzgi' : '🌙 Tungi'} rejim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
