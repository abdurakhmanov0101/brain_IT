import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, DollarSign, Briefcase, TrendingUp, TrendingDown,
  GraduationCap, CheckCircle2, Clock, ChevronRight, BookOpen,
  Award, AlertCircle, FileText, Play, Coins, ArrowUpRight,
  BarChart2, Activity, Zap, Target, Star, Calendar, ShieldCheck,
  XCircle, CheckCircle, AlertTriangle, CreditCard, TrendingDown as Missing, Scan, Server, MapPin
} from 'lucide-react';
import { courses as mockCourses } from '../../data/mockData';
import { useAuthStore } from '../../stores/authStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useCoinStore } from '../../stores/coinStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useHomeworkStore } from '../../stores/homeworkStore';
import { useInClassTaskStore } from '../../stores/inClassTaskStore';
import { QuickFaceIDModal } from '../../components/common/QuickFaceIDModal';

// Animated number counter
function AnimatedCount({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, value);
      setCount(Math.floor(current));
      if (current >= value) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{count.toLocaleString()}{suffix}</>;
}

function RingProgress({ value, size = 80, stroke = 8, color = '#10B981' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-100 dark:text-slate-700" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
}

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { students, payments } = useStudentStore();
  const { teachers } = useTeacherStore();
  const { balances, transactions } = useCoinStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { records: attendanceRecords } = useAttendanceStore();
  const { assignments, submissions } = useHomeworkStore();
  const { submissions: inClassSubmissions } = useInClassTaskStore();
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  if (!currentUser) return null;

  const go = (path: string) => navigate(`/${path}`);

  const renderFaceCheckBanner = () => (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/90 via-slate-900/95 to-teal-950/90 border-2 border-emerald-500/40 p-6 text-white shadow-xl shadow-emerald-500/10 transition-all hover:border-emerald-400/60 group">
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/30 transition-colors" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/40 border border-white/20">
              <Scan className="w-7 h-7 text-white animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-black text-lg sm:text-xl text-white tracking-tight">
                Biometrik Face ID & GPS Lokatsiya Davomati
              </h3>
              <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                100% Avtomatik
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 font-medium mt-1 leading-relaxed max-w-2xl">
              Kameraga qarash orqali 1 soniyada yuzni tanitib va GPS koordinatani tasdiqlab, darsga kelganingizni belgilang yoki jismoniy turniketlarni nazorat qiling.
            </p>
          </div>
        </div>
        <button
          onClick={() => setFaceModalOpen(true)}
          className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-600/30 border border-white/20 flex items-center justify-center gap-2.5 shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Scan className="w-5 h-5 text-white animate-spin-slow" />
          <span>Skanerni Ochish</span>
        </button>
      </div>
    </div>
  );

  // ── STUDENT DASHBOARD ──────────────────────────────────────────
  if (currentUser.role === 'Student') {
    // Find student record
    const myStudent = students.find(s =>
      s.id === currentUser.studentId ||
      s.id === currentUser.id ||
      `u_${s.id}` === currentUser.id
    ) || students.find(s => s.fullName === currentUser.name);

    const myCoins = (myStudent?.coins || 0) || balances[currentUser.id] || (currentUser.studentId ? balances[currentUser.studentId] : 0) || balances[currentUser.id.replace('u_', '')] || 0;

    // My groups and courses
    const myGroups = groups.filter(g => myStudent?.groupIds?.includes(g.id));
    const myCourses = courses.filter(c => myGroups.some(g => g.courseId === c.id));

    // Attendance
    const myAttendance = attendanceRecords.filter(r =>
      (r.studentId === myStudent?.id || r.studentId === currentUser.studentId) && r.status !== 'freezed'
    );
    const presentCount = myAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentCount = myAttendance.filter(r => r.status === 'absent').length;
    const attendanceRate = myAttendance.length ? Math.round((presentCount / myAttendance.length) * 100) : 0;

    // Homework / grades
    const mySubs = submissions.filter(s =>
      s.studentId === myStudent?.id ||
      s.studentId === currentUser.studentId
    );
    const gradedSubs = mySubs.filter(s => s.status === 'graded' && s.grade !== undefined);
    const avgGrade = gradedSubs.length
      ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubs.length)
      : 0;

    // Homework by group/course
    const myAssignments = assignments.filter(a => myStudent?.groupIds?.includes(a.groupId));
    const pendingHW = myAssignments.filter(a => !mySubs.find(s => s.assignmentId === a.id));
    const submittedHW = myAssignments.filter(a => {
      const s = mySubs.find(sub => sub.assignmentId === a.id);
      return s && s.status === 'submitted';
    });

    // Balance and payments
    const balance = myStudent?.balance || 0;
    const myPayments = payments.filter(p => p.studentId === myStudent?.id).slice(-3).reverse();
    const paymentStatus = myStudent?.paymentStatus || (balance >= 0 ? 'paid' : 'unpaid');
    const isLowBalance = balance < 1000000;

    return (
      <div className="space-y-6 page-enter">
        {/* ✨ Premium Vibrant Hero ✨ */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/20">
          {/* Vibrant Mesh Gradients - Pure Green/Teal */}
          <div className="absolute inset-0 z-0 opacity-60 pointer-events-none mix-blend-overlay">
            <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[140%] bg-emerald-300/40 blur-[120px] rounded-full" />
            <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[120%] bg-teal-400/40 blur-[100px] rounded-full" />
            <div className="absolute top-[20%] right-[20%] w-[40%] h-[60%] bg-lime-300/20 blur-[80px] rounded-full" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-md text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                <Star className="h-3.5 w-3.5 text-yellow-300" fill="currentColor" /> 
                <span className="text-white drop-shadow-sm">O'quvchi Kabineti</span>
              </div>
              <h1 className="font-heading font-black text-4xl lg:text-5xl tracking-tight drop-shadow-md">
                Salom, <span className="text-white">{myStudent?.fullName?.split(' ')[0] || currentUser.name}</span>! 👋
              </h1>
              <p className="text-white/90 font-medium max-w-lg drop-shadow-sm text-sm lg:text-base leading-relaxed">
                {myGroups.length > 0
                  ? `${myGroups.map(g => g.name).join(' · ')} guruhi bo'yicha ta'limingizni davom ettiring. Yangi bilimlarga tayyormisiz? 🚀`
                  : 'O\'quv jarayoningizni kuzating.'}
              </p>
            </div>
            
            {/* Coin balance - Glassmorphism */}
            <div className="shrink-0 flex items-center gap-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl px-6 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-transform hover:scale-105 duration-300 cursor-default">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-white/40">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1 drop-shadow-sm">Tangalarim</p>
                <div className="flex items-baseline gap-1.5 drop-shadow-md">
                  <span className="font-heading font-black text-3xl text-white">{myCoins}</span>
                  <span className="text-yellow-300 font-bold text-sm">Coin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-4 mt-8 pt-8 border-t border-white/20">
            {[
              { label: 'Kurslarim', value: myCourses.length, icon: BookOpen },
              { label: 'Davomat', value: `${attendanceRate}%`, icon: Calendar },
              { label: 'O\'rtacha ball', value: avgGrade || '—', icon: Award },
              { label: 'Kutilgan vazifalar', value: pendingHW.length, icon: FileText },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/20 border border-white/30 shadow-inner backdrop-blur-md">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-black text-white leading-none mb-1 drop-shadow-sm">{value}</p>
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider drop-shadow-sm">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {renderFaceCheckBanner()}

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Kurslarim va Guruhlarim — col span 2 */}
          <div className="lg:col-span-2 space-y-5">

            {/* Courses */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" /> Mening Kurslarim
                </h3>
              </div>
              {myCourses.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Hali kursga biriktirilmagansiz</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCourses.map(course => {
                    const group = myGroups.find(g => g.courseId === course.id);
                    const groupSubs = mySubs.filter(s => {
                      const hw = assignments.find(a => a.id === s.assignmentId);
                      return hw?.groupId === group?.id;
                    });
                    const groupGraded = groupSubs.filter(s => s.status === 'graded' && s.grade !== undefined);
                    const courseAvg = groupGraded.length ? Math.round(groupGraded.reduce((sum, s) => sum + (s.grade || 0), 0) / groupGraded.length) : null;
                    const courseHWCount = assignments.filter(a => a.groupId === group?.id).length;
                    const progress = courseHWCount > 0 ? Math.round((groupSubs.length / courseHWCount) * 100) : 0;
                    const progressColor = progress >= 80 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#10b981';

                    return (
                      <div key={course.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                        <div className="shrink-0">
                          <RingProgress value={progress} size={60} stroke={6} color={progressColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white truncate">{course.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{group?.name} · {group?.schedule?.days?.join(', ')} {group?.schedule?.time}</p>
                            </div>
                            {courseAvg !== null && (
                              <span className={`shrink-0 text-sm font-black px-2 py-0.5 rounded-lg ${courseAvg >= 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : courseAvg >= 65 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                {courseAvg}/100
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: progressColor }} />
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">{groupSubs.length}/{courseHWCount} vazifa</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Homework by group */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-500" /> Uy Vazifalarim
                </h3>
                <button onClick={() => go('homework')} className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1">
                  Hammasini ko'rish <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              {myAssignments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">Hali vazifa berilmagan</div>
              ) : (
                <div className="space-y-3">
                  {myAssignments.slice(0, 5).map(hw => {
                    const sub = mySubs.find(s => s.assignmentId === hw.id);
                    const group = myGroups.find(g => g.id === hw.groupId);
                    const course = courses.find(c => c.id === group?.courseId);
                    const isGraded = sub?.status === 'graded';
                    const isSubmitted = sub?.status === 'submitted';
                    const isOverdue = !sub && new Date(hw.dueDate) < new Date();

                    return (
                      <div key={hw.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${isGraded ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40' : isSubmitted ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40' : isOverdue ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/40' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isGraded ? 'bg-emerald-100 dark:bg-emerald-900/30' : isSubmitted ? 'bg-amber-100 dark:bg-amber-900/30' : isOverdue ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                          {isGraded ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> :
                           isSubmitted ? <Clock className="h-4 w-4 text-amber-600" /> :
                           isOverdue ? <AlertCircle className="h-4 w-4 text-rose-600" /> :
                           <FileText className="h-4 w-4 text-slate-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{hw.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{course?.name || group?.name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          {isGraded && sub?.grade !== undefined ? (
                            <span className={`text-sm font-black ${sub.grade >= 85 ? 'text-emerald-600' : sub.grade >= 65 ? 'text-amber-600' : 'text-rose-600'}`}>{sub.grade}/100</span>
                          ) : (
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isSubmitted ? 'bg-amber-100 text-amber-700' : isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                              {isSubmitted ? 'Kutilmoqda' : isOverdue ? 'Kechikdi' : `${Math.ceil((new Date(hw.dueDate).getTime() - Date.now()) / 86400000)} kun`}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Attendance card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-emerald-500" /> Davomat
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <RingProgress value={attendanceRate} size={72} stroke={7} color={attendanceRate >= 80 ? '#10b981' : attendanceRate >= 60 ? '#f59e0b' : '#ef4444'} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-black ${attendanceRate >= 80 ? 'text-emerald-600' : attendanceRate >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{attendanceRate}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Kelgan: <span className="font-bold text-slate-800 dark:text-white">{presentCount}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Kelmagan: <span className="font-bold text-slate-800 dark:text-white">{absentCount}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Jami: <span className="font-bold text-slate-800 dark:text-white">{myAttendance.length}</span></span>
                  </div>
                </div>
              </div>
              {absentCount > 3 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-700 dark:text-rose-400 font-bold">Qoldirilgan darslar ko'p! Diqqat qiling.</p>
                </div>
              )}
              {myAttendance.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-2">Davomat ma'lumoti yo'q</p>
              )}
            </div>

            {/* Balance & Payment */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-emerald-500" /> Balans va To'lov
              </h3>
              {/* Balance */}
              <div className={`p-4 rounded-2xl mb-4 ${balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40'}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Hisob balansi</p>
                <p className={`text-2xl font-black ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {balance >= 0 ? '+' : ''}{balance.toLocaleString('uz-UZ')} so'm
                </p>
                {isLowBalance && balance >= 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Balans past — to'ldiring
                  </p>
                )}
                {balance < 0 && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Qarz mavjud!
                  </p>
                )}
              </div>
              {/* Payment status badge */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold mb-4 ${
                paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                paymentStatus === 'partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
              }`}>
                {paymentStatus === 'paid' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                 paymentStatus === 'partial' ? <AlertCircle className="h-3.5 w-3.5" /> :
                 <XCircle className="h-3.5 w-3.5" />}
                {paymentStatus === 'paid' ? "To'lov amalga oshirilgan ✓" :
                 paymentStatus === 'partial' ? "Qisman to'langan" : "To'lov amalga oshirilmagan!"}
              </div>
              {/* Recent payments */}
              {myPayments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">So'nggi to'lovlar</p>
                  <div className="space-y-2">
                    {myPayments.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{new Date(p.date).toLocaleDateString('uz-UZ')}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">+{p.amount.toLocaleString()} so'm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-heading font-bold text-slate-800 dark:text-white mb-4 text-sm">Tez harakatlar</h3>
              <div className="space-y-2">
                {[
                  { icon: FileText, label: 'Vazifalarni topshirish', path: 'homework', color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
                  { icon: Coins, label: 'Tanga do\'koni', path: 'coins', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                ].map(({ icon: Icon, label, path, color }) => (
                  <button key={path} onClick={() => go(path)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group">
                    <div className={`p-2 rounded-xl ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <QuickFaceIDModal open={faceModalOpen} onClose={() => setFaceModalOpen(false)} targetStudentId={myStudent?.id} />
      </div>
    );
  }

  // ── TEACHER DASHBOARD ──────────────────────────────────────────
  if (currentUser.role === 'Teacher') {
    // Calculate teacher profile details dynamically
    const myProfile = teachers.find(t => t.username === currentUser?.name?.toLowerCase() || t.fullName === currentUser?.name);
    const myCoins = (myProfile?.coins || 0) || balances[currentUser.id] || 0;
    const myStudents = students.filter(s => myProfile?.groupIds.some(g => s.groupIds.includes(g)));
    const myGroups = groups.filter(g => myProfile?.groupIds.includes(g.id));
    
    const pendingHWs = submissions.filter(s => 
      s.status === 'submitted' && 
      myStudents.some(st => st.id === s.studentId || `u_${st.id}` === s.studentId)
    );
    const pendingInClasses = inClassSubmissions.filter(s => 
      s.status === 'submitted' && 
      myStudents.some(st => st.id === s.studentId || `u_${st.id}` === s.studentId)
    );
    const totalPendingCount = pendingHWs.length + pendingInClasses.length;

    // Salary computations
    let totalExpected = 0;
    let received = 0;

    myStudents.forEach(s => {
      const sGroups = groups.filter(g => s.groupIds.includes(g.id));
      const sCourse = courses.find(c => sGroups.some(g => g.courseId === c.id));
      if (sCourse && myProfile) {
        const share = (sCourse.monthlyPrice * (myProfile.salaryPercentage || 35)) / 100;
        totalExpected += share;
        if (s.paymentStatus === 'paid') received += share;
      }
    });

    return (
      <div className="space-y-6 page-enter">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-2xl shadow-emerald-600/20">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                <Zap className="h-3 w-3" /> Ustoz Boshqaruv Paneli
              </span>
              <h1 className="font-heading font-black text-3xl lg:text-4xl">Assalomu alaykum, {currentUser.name}!</h1>
              <p className="text-white/70 mt-2 text-sm">Talabalarning uy vazifalarini va darslarni boshqarishingiz mumkin.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
              <div className="bg-amber-400/20 p-3 rounded-xl">
                <Coins className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider">Coin Balansim</p>
                <p className="font-heading font-black text-2xl text-amber-300">{myCoins.toLocaleString()} C</p>
              </div>
            </div>
          </div>
        </div>

        {renderFaceCheckBanner()}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Guruhlarim', value: myGroups.length, suffix: ' ta faol', icon: Users, bg: 'bg-brand-50 dark:bg-brand-500/10', iconColor: 'text-brand-600 dark:text-brand-400' },
            { name: "Jami O'quvchilarim", value: myStudents.length, suffix: ' ta', icon: Users, bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
            { name: 'Kutilayotgan Vazifalar', value: totalPendingCount, suffix: ' ta', icon: AlertCircle, bg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400' },
            { name: 'Maosh Hissasi (Haqiqiy)', value: received, prefix: '', suffix: ' so\'m', icon: DollarSign, bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="card card-hover p-5 stat-card">
              <div className={`inline-flex p-2.5 rounded-xl ${s.bg} mb-4`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.name}</p>
              <h3 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-1">
                <AnimatedCount value={s.value} prefix={(s as any).prefix || ''} suffix={s.suffix} />
              </h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Pending Submissions Summary & Reminder */}
            <div className="card p-6 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-amber-500/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 animate-pulse">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-slate-800 dark:text-white">⚠️ Eslatma: Tekshirilishi kutilayotgan vazifalar</h3>
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Uy vazifalar va sinfdagi topshiriqlarni baholab, talabalarni tanga bilan taqdirlang</p>
                  </div>
                </div>
                {totalPendingCount > 0 && (
                  <span className="bg-amber-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md shadow-amber-500/20">
                    {totalPendingCount} ta kutilmoqda
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-dark-border">
                {/* List Homework Submissions */}
                {pendingHWs.slice(0, 5).map((hw) => {
                  const st = students.find(s => s.id === hw.studentId || `u_${s.id}` === hw.studentId);
                  const group = groups.find(g => st?.groupIds.includes(g.id));
                  const course = courses.find(c => c.id === group?.courseId);
                  return (
                    <div key={`hw_${hw.id}`} className="py-3.5 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">Uy vazifa</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{st?.fullName || 'O\'quvchi'}</p>
                          <p className="text-[11px] text-slate-400 truncate">{course?.name || ''} · Yuborildi: {new Date(hw.submittedAt || Date.now()).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <button onClick={() => go('homework')} className="shrink-0 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1">
                        <span>Baholash</span> ➔
                      </button>
                    </div>
                  );
                })}

                {/* List In-Class Submissions */}
                {pendingInClasses.slice(0, 5).map((inc) => {
                  const st = students.find(s => s.id === inc.studentId || `u_${s.id}` === inc.studentId);
                  const group = groups.find(g => st?.groupIds.includes(g.id));
                  return (
                    <div key={`inc_${inc.id}`} className="py-3.5 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">Dars topshirig'i</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{st?.fullName || 'O\'quvchi'}</p>
                          <p className="text-[11px] text-slate-400 truncate">{group?.name || 'Guruh'} · Yuborildi: {new Date(inc.submittedAt || Date.now()).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {totalPendingCount === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">Barcha vazifalar o'z vaqtida tekshirilgan!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Hozirda kutilayotgan uy vazifalari yoki dars topshiriqlari yo'q.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Group salary breakdown table */}
            <div className="card p-6">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" /> Guruhlar Bo'yicha Oylik Taqsimoti
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5 rounded-l-lg">Guruh</th>
                      <th className="px-4 py-2.5">Kurs</th>
                      <th className="px-4 py-2.5 text-center">Talabalar</th>
                      <th className="px-4 py-2.5 text-right rounded-r-lg">Maosh Hissasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myGroups.map(group => {
                      const course = courses.find(c => c.id === group.courseId);
                      const groupStudents = students.filter(s => s.groupIds.includes(group.id));
                      const groupPaidStudents = groupStudents.filter(s => s.paymentStatus === 'paid');
                      
                      const groupSalaryShare = course 
                        ? groupPaidStudents.length * ((course.monthlyPrice * (myProfile?.salaryPercentage || 35)) / 100)
                        : 0;

                      return (
                        <tr key={group.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{group.name}</td>
                          <td className="px-4 py-3 text-slate-500">{course?.name || '—'}</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-600 dark:text-slate-400">
                            {groupPaidStudents.length} / {groupStudents.length} <span className="text-[10px] text-emerald-500">(To'lagan)</span>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-emerald-600">{groupSalaryShare.toLocaleString()} so'm</td>
                        </tr>
                      );
                    })}
                    {myGroups.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-400 text-sm">Guruhlar topilmadi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-5">
            <div className="card p-6">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4">Tezkor amallar</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Davomat belgilash', icon: CheckCircle2, path: 'attendance', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                  { label: 'Coin berish', icon: Coins, path: 'coins', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
                  { label: 'Dars videosi', icon: Play, path: 'teacher-portal', color: 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' },
                  { label: 'Mening panelim', icon: BarChart2, path: 'teacher-portal', color: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400' },
                ].map((a) => (
                  <button key={a.label} onClick={() => go(a.path)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl ${a.color} hover:scale-105 transition-all border border-current/10`}>
                    <a.icon className="h-6 w-6" />
                    <span className="text-[11px] font-bold text-center leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SUPER ADMIN / DIRECTOR DASHBOARD (100X UPGRADED DESIGN) ──────────────────────────
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalCoins = Object.values(balances).reduce((a, b) => a + b, 0);

  const stats = [
    { id: 1, name: 'Faol Talabalar', value: totalStudents, suffix: ' ta', change: '+15% o\'tgan oyga nisbatan', contextNote: "Davomat o'rtacha 94%", testimonialNote: "Davomat o'rtacha 94% — barqaror o'sish", up: true, icon: Users, iconBg: 'bg-brand-100 dark:bg-brand-500/20', iconColor: 'text-brand-600 dark:text-brand-400', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { id: 2, name: 'Oylik Daromad', value: 142500000, prefix: '', suffix: ' UZS', change: '+22% o\'sdi', contextNote: "Kassa tushumi +22% o'sdi", testimonialNote: "Kassa tushumi +22% o'sdi — rekord ko'rsatkich", up: true, icon: DollarSign, iconBg: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { id: 3, name: 'Ustozlar', value: totalTeachers, suffix: ' ta faol', change: '+18% faollik', contextNote: "Ustozlar KPI 94.8 ball", testimonialNote: "Ustozlar KPI o'rtacha 94.8 ball", up: true, icon: GraduationCap, iconBg: 'bg-teal-100 dark:bg-teal-500/20', iconColor: 'text-teal-600 dark:text-teal-400', badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
    { id: 5, name: 'Tizimda Coinlar', value: totalCoins, suffix: ' C', change: '+14% rag\'bat', contextNote: "Motivatsiya yuqori", testimonialNote: "O'quvchilar motivatsiyasi yuqori", up: true, icon: Coins, iconBg: 'bg-orange-100 dark:bg-orange-500/20', iconColor: 'text-orange-600 dark:text-orange-400', badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
    { id: 6, name: "O'zlashtirish", value: 87, suffix: '%', change: '+4.5% sifat', contextNote: "O'rtacha sifat 91%", testimonialNote: "Davomat va imtihonlar o'rtacha 91%", up: true, icon: Target, iconBg: 'bg-sky-100 dark:bg-sky-500/20', iconColor: 'text-sky-600 dark:text-sky-400', badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  ];

  const recentTx = transactions.slice(0, 6);

  return (
    <div className="space-y-6 page-enter pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 p-8 lg:p-10 text-white shadow-2xl shadow-brand-600/25">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm">
                <Zap className="h-3 w-3 text-yellow-300 animate-pulse" /> IT Academy Boshqaruv Markazi
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/25 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Biometrik Turniketlar 100% Onlayn
              </span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              Assalomu alaykum, {currentUser.name}!
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              Tizimdagi barcha o'quv jarayonlari, moliya, davomat va biometrik skanerlarning real-vaqt nazorati. Barcha ma'lumotlar jonli ko'rinishda.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="flex-1 sm:flex-initial text-center bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl shadow-lg hover:bg-white/15 transition-all">
              <p className="font-heading font-black text-3xl sm:text-4xl text-white">{totalStudents}</p>
              <p className="text-white/70 text-[11px] font-extrabold uppercase tracking-widest mt-1">O'quvchilar</p>
            </div>
            <div className="flex-1 sm:flex-initial text-center bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl shadow-lg hover:bg-white/15 transition-all">
              <p className="font-heading font-black text-3xl sm:text-4xl text-white">{totalTeachers}</p>
              <p className="text-white/70 text-[11px] font-extrabold uppercase tracking-widest mt-1">Ustozlar</p>
            </div>
            <button
              onClick={() => setFaceModalOpen(true)}
              className="flex-1 sm:flex-initial flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-6 py-4 rounded-2xl shadow-xl shadow-emerald-600/30 border border-white/25 transition-all hover:scale-105 cursor-pointer font-bold"
              title="Yuz tanish skanerini tezkor ochish"
            >
              <Scan className="h-6 w-6 text-white animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider">Tezkor Face ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* Face ID & Biometric Live Banner */}
      {renderFaceCheckBanner()}

      {/* Stat cards (Symmetrical 5-column grid — zero blank gaps) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.id} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-2xl ${s.iconBg} group-hover:scale-110 transition-transform`}>
                  <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                </div>
                <span className={`flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-1 rounded-lg shadow-2xs ${
                  s.up 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' 
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                }`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.change}
                </span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider leading-tight">{s.name}</p>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1.5 tracking-tight">
                <AnimatedCount value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </h3>
            </div>

            {/* EduTizim Testimonial indicator note */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border space-y-1.5">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-extrabold border ${s.badgeColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {s.contextNote}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 italic leading-snug">
                "{s.testimonialNote}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Asymmetric Grid: 2 columns left (Actions + Courses), 1 column right (System + Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT / CENTER SECTION: Quick Actions & Courses (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tezkor Amallar va Boshqaruv (Quick Actions 6-button Grid) */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Zap className="h-5 w-5" />
                  </span>
                  Tezkor Boshqaruv Markazi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Asosiy operatsiyalarga 1 tugma orqali o'ting</p>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                6 ta tezkor bo'lim
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[
                { label: 'Davomat & Skaner', sub: 'Yuz va GPS nazorat', icon: Calendar, path: 'attendance', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' },
                { label: 'Biometrik Face ID', sub: 'Xarita va Apparatlar', icon: Scan, path: 'face-id', color: 'from-brand-500 to-indigo-600', bg: 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800/50' },
                { label: 'Shartnomalar', sub: 'Yaratish va yuklash', icon: FileText, path: 'contracts', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' },
                { label: 'Ustozlar Maoshi', sub: 'KPI va hisoblash', icon: DollarSign, path: 'teacher-payroll', color: 'from-teal-500 to-emerald-600', bg: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/50' },
                { label: 'Coin & Tanga Tizimi', sub: 'Rag\'bat berish', icon: Coins, path: 'coins', color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50' },
                { label: 'O\'quvchilar & Guruh', sub: 'Ro\'yxatni ko\'rish', icon: Users, path: 'students', color: 'from-sky-500 to-blue-600', bg: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/50' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => go(action.path)}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5 text-left group bg-white dark:bg-slate-800/60 ${action.bg}`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md group-hover:scale-110 transition-transform shrink-0`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white truncate">{action.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{action.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* IT Academy Kurslari Table */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">IT Academy Kurslari va Yo'nalishlar</h3>
                  <p className="text-xs text-slate-400">Jami {courses.length} ta faol o'quv yo'nalishi</p>
                </div>
              </div>
              <button onClick={() => go('academy')} className="px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center gap-1.5 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">
                Barcha kurslar <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-dark-border">
              {courses.map((c) => {
                const title = c?.title || 'IT Kursi';
                const shortCode = title.substring(0, 2).toUpperCase();
                const price = c?.monthlyPrice || 500000;
                return (
                  <div key={c?.id || Math.random()} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-heading font-black text-sm text-brand-600 dark:text-brand-400 shrink-0">
                        {shortCode}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span>⏳ {c?.duration || '6 oy'}</span>
                          <span>•</span>
                          <span>💰 {price.toLocaleString()} so'm/oy</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/50">
                        {c?.level || 'Boshlang\'ich'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: System Health Monitor & Coin Feed (Col Span 1) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Biometric & Geofence Live Monitor Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Tizim Monitori
              </span>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <h4 className="font-heading font-black text-base text-white mb-3">Biometrik & GPS Nazorati</h4>
            
            <div className="space-y-3 text-xs">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Hardware Webhook API</span>
                </div>
                <span className="font-bold text-emerald-300">Faol ✓</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>GPS Geofence Radius</span>
                </div>
                <span className="font-bold text-amber-300">100m (Jonli)</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Telegram SMS & Rasm</span>
                </div>
                <span className="font-bold text-sky-300">892985... Ulangan</span>
              </div>
            </div>

            <button
              onClick={() => go('face-id')}
              className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>⚙️ Xarita & Apparat sozlamalari</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* So'nggi Coin Amaliyotlari */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">So'nggi Coin Amaliyotlar</h3>
                  <p className="text-xs text-slate-400">Tizimdagi real vaqt coin o'tishlari</p>
                </div>
              </div>
              <button onClick={() => go('coins')} className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline">
                Barchasi <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-dark-border max-h-[380px] overflow-y-auto">
              {recentTx.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-slate-400">Hech qanday amaliyot topilmadi</div>
              )}
              {recentTx.map((tx) => {
                const amount = tx?.amount || 0;
                return (
                  <div key={tx?.id || Math.random()} className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs shrink-0">
                        C
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{tx?.toName || 'O\'quvchi'}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{tx?.reason || 'Vazifa yoki faollik uchun'}</p>
                      </div>
                    </div>
                    <span className="font-heading font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg shrink-0">
                      +{amount.toLocaleString()} C
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-dark-border text-center">
              <button
                onClick={() => go('coins')}
                className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <span>Tanga balanslari va do'konni ko'rish</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickFaceIDModal open={faceModalOpen} onClose={() => setFaceModalOpen(false)} />
    </div>
  );
};

