import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, LogIn, AlertCircle, Zap, Fingerprint, Shield, Globe } from 'lucide-react';
import { useAuthStore, ADMIN_ACCOUNTS, type AuthRole } from '../../stores/authStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';

interface LoginPageProps {
  onLogin: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

// MATRIX RAIN (Sokin ranglar, lekin tez va jonli harakat)
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ'.split('');
    const fontSize = 14;
    let columns = width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * 100;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(4, 9, 20, 0.1)'; 
      ctx.fillRect(0, 0, width, height);

      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        if (Math.random() > 0.95) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 5;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        } else {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.4)'; // Sokinroq Cyan
          ctx.shadowBlur = 0;
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35); // Tezligi oldingidek (jonli)

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = width / fontSize;
      for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * 100;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 mix-blend-screen pointer-events-none" />;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, setDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [focusInput, setFocusInput] = useState<'username' | 'password' | null>(null);

  const { setUser } = useAuthStore();
  const { students } = useStudentStore();
  const { teachers } = useTeacherStore();

  useEffect(() => {
    setMounted(true);
    setDarkMode(true);
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [setDarkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500)); 
    const u = username.trim().toLowerCase();
    const p = password.trim();

    const adminAcc = ADMIN_ACCOUNTS.find((a) => a.username === u && a.password === p);
    if (adminAcc) { setUser(adminAcc.user); onLogin(); setLoading(false); return; }

    const teacher = teachers.find((t) => {
      const byUsername = t.username.toLowerCase() === u && t.password === p;
      const byEmail = t.email.split('@')[0].toLowerCase() === u && t.phone.replace(/\D/g, '').slice(-6) === p;
      return byUsername || byEmail;
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

    setError("Ruxsat etilmadi. Login yoki parol xato.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-[#040914] font-sans overflow-hidden selection:bg-cyan-500/30 perspective-[2000px]">
      
      {/* 1. MATRIX RAIN ORQA FON */}
      <MatrixRain />
      
      {/* 2. TV SCANLINE EFFEKTI */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] pointer-events-none z-0" />

      {/* 3. PARALLAX IKONKALAR (Animatsiyasi saqlangan, lekin ranglari sokin) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Shield className="absolute top-[15%] left-[20%] w-24 h-24 text-slate-700/30 transition-transform duration-[3000ms] ease-out blur-[1px]" style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) rotate(${mousePos.x * 20}deg)` }} />
        <Globe className="absolute bottom-[20%] right-[15%] w-32 h-32 text-slate-700/30 transition-transform duration-[4000ms] ease-out blur-[2px]" style={{ transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px) rotate(${mousePos.y * -30}deg)` }} />
      </div>

      {/* 4. ASOSIY 3D KARTA (Oldingi daxshatli 3D burilish animatsiyasi joyiga qaytarildi) */}
      <div 
        className={`relative z-10 w-full max-w-[420px] mx-4 transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)] preserve-3d ${mounted ? 'opacity-100 translate-y-0 scale-100 rotate-x-0' : 'opacity-0 translate-y-32 scale-75 rotate-x-12'}`}
        style={{ 
          transform: `rotateX(${mousePos.y * -8}deg) rotateY(${mousePos.x * 8}deg) translateZ(50px)`,
          transformStyle: 'preserve-3d' 
        }}
      >
        <div 
          className="relative bg-[#0b1121]/70 backdrop-blur-2xl rounded-3xl p-10 border border-slate-700/50 shadow-2xl overflow-visible"
        >
          {/* Logo qismi (Havoda ko'tarilib turuvchi 3D va Glitch animatsiyasi bilan) */}
          <div className="flex flex-col items-center mb-10 relative z-20" style={{ transform: 'translateZ(40px)' }}>
            <div className="relative group cursor-pointer mb-2">
               <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition duration-700"></div>
               <div className="relative bg-[#0f172a] w-20 h-20 rounded-2xl border border-cyan-500/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
                <img src="/image.png" alt="Brain IT" className="w-14 h-14 object-contain" />
                <Zap className="absolute -bottom-2 -right-2 w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-white tracking-widest uppercase mt-4 hover:animate-[glitch_0.3s_infinite] cursor-default transition-all duration-300">
              Brain<span className="text-cyan-400">.IT</span>
            </h1>
            <p className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-semibold mt-2">Autentifikatsiya</p>
          </div>

          {/* Forma Qismi (Karta ustida suzib turadi: translateZ 30px) */}
          <form onSubmit={handleLogin} className="space-y-6 relative z-20" style={{ transform: 'translateZ(30px)' }}>
            
            {/* ID / Login */}
            <div className="group relative">
              <div className="relative bg-[#0f172a] border border-slate-700 rounded-xl flex items-center overflow-hidden transition-all duration-300 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:-translate-y-0.5">
                <div className={`pl-4 pr-3 transition-colors duration-300 ${focusInput === 'username' ? 'text-cyan-400' : 'text-slate-500'}`}>
                  <Fingerprint className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusInput('username')}
                  onBlur={() => setFocusInput(null)}
                  placeholder="ID yoki Foydalanuvchi nomi" 
                  required
                  className="w-full py-4 pr-4 bg-transparent text-white placeholder:text-slate-500 text-sm font-semibold tracking-wide focus:outline-none"
                />
              </div>
            </div>

            {/* Maxfiy Kalit */}
            <div className="group relative">
              <div className="relative bg-[#0f172a] border border-slate-700 rounded-xl flex items-center overflow-hidden transition-all duration-300 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:-translate-y-0.5">
                <div className={`pl-4 pr-3 transition-colors duration-300 ${focusInput === 'password' ? 'text-cyan-400' : 'text-slate-500'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPass ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusInput('password')}
                  onBlur={() => setFocusInput(null)}
                  placeholder="Parolni kiriting" 
                  required
                  className="w-full py-4 pr-12 bg-transparent text-white placeholder:text-slate-500 text-sm font-semibold tracking-wide focus:outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-0 top-0 bottom-0 px-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Xatolik Xabari */}
            <div className={`overflow-hidden transition-all duration-500 ${error ? 'max-h-20 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}>
              <div className="flex items-center gap-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
                <span className="font-semibold tracking-wide text-xs">{error}</span>
              </div>
            </div>

            {/* JONLI TUGMA (Sokin rang, lekin yorug'lik o'tish animatsiyasi saqlangan) */}
            <button 
              type="submit" 
              disabled={loading || !username || !password}
              className="w-full relative group mt-6"
            >
              <div className="absolute -inset-1 bg-cyan-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center justify-center gap-3 bg-cyan-600 py-4 rounded-xl text-white overflow-hidden transition-transform duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-500">
                
                {/* O'tuvchi nur (Shimmer effect) */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none transform -skew-x-12"></div>
                
                {loading ? (
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white border-r-white rounded-full animate-spin" />
                    <span className="font-bold tracking-[0.2em] text-xs uppercase">Tekshirilmoqda...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" /> 
                    <span className="font-bold tracking-[0.2em] text-xs uppercase relative z-10">Tizimga kirish</span>
                  </>
                )}
              </div>
            </button>
          </form>

        </div>
        
        {/* Ostidagi mayda yozuv */}
        <div className="absolute -bottom-8 left-0 right-0 text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
            Himoyalangan Tizim
          </p>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 1px) }
          40% { transform: translate(-1px, -1px) }
          60% { transform: translate(2px, 1px) }
          80% { transform: translate(1px, -1px) }
          100% { transform: translate(0) }
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>

    </div>
  );
};
