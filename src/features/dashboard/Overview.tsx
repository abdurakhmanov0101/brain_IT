import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, DollarSign, Briefcase, TrendingUp, TrendingDown,
  GraduationCap, CheckCircle2, Clock, ChevronRight, BookOpen,
  Award, AlertCircle, FileText, Play, Coins, ArrowUpRight,
  BarChart2, Activity, Zap, Target, Star, Calendar, ShieldCheck,
  XCircle, CheckCircle, AlertTriangle, CreditCard, TrendingDown as Missing
} from 'lucide-react';
import { courses as mockCourses } from '../../data/mockData';
import { useAuthStore } from '../../stores/authStore';
import { usePmStore } from '../../stores/pmStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useCoinStore } from '../../stores/coinStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useHomeworkStore } from '../../stores/homeworkStore';

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

function RingProgress({ value, size = 80, stroke = 8, color = '#6366f1' }: { value: number; size?: number; stroke?: number; color?: string }) {
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
  const { projects: projectsList } = usePmStore();
  const { students, payments } = useStudentStore();
  const { teachers } = useTeacherStore();
  const { balances, transactions } = useCoinStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { records: attendanceRecords } = useAttendanceStore();
  const { assignments, submissions } = useHomeworkStore();

  if (!currentUser) return null;

  const go = (path: string) => navigate(`/${path}`);

  // ── STUDENT DASHBOARD ──────────────────────────────────────────
  if (currentUser.role === 'Student') {
    const myCoins = balances[currentUser.id] || 0;

    // Find student record
    const myStudent = students.find(s =>
      s.id === currentUser.studentId ||
      s.id === currentUser.id ||
      `u_${s.id}` === currentUser.id ||
      s.fullName === currentUser.name
    );

    // My groups and courses
    const myGroups = groups.filter(g => myStudent?.groupIds?.includes(g.id));
    const myCourses = courses.filter(c => myGroups.some(g => g.courseId === c.id));

    // Attendance
    const myAttendance = attendanceRecords.filter(r =>
      r.studentId === myStudent?.id || r.studentId === currentUser.studentId
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
        {/* ─── Hero ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7 text-white shadow-2xl">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-300 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                <Star className="h-3 w-3" /> O'quvchi Kabineti
              </span>
              <h1 className="font-heading font-black text-3xl lg:text-4xl">Salom, {myStudent?.fullName || currentUser.name}! 👋</h1>
              <p className="text-white/70 mt-1.5 text-sm">
                {myGroups.length > 0
                  ? `${myGroups.map(g => g.name).join(' · ')} — davom eting! 🚀`
                  : 'O\'quv jarayoningizni kuzating.'}
              </p>
            </div>
            {/* Coin balance */}
            <div className="shrink-0 flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
              <div className="bg-amber-400/20 p-3 rounded-xl">
                <Coins className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Tangalarim</p>
                <p className="font-heading font-black text-2xl text-amber-300">{myCoins} 🪙</p>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="relative flex flex-wrap gap-3 mt-5">
            {[
              { label: 'Kurslarim', value: myCourses.length, icon: BookOpen },
              { label: 'Davomat', value: `${attendanceRate}%`, icon: Calendar },
              { label: 'O\'rtacha ball', value: avgGrade || '—', icon: Award },
              { label: 'Kutilgan vazifalar', value: pendingHW.length, icon: FileText },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                <Icon className="h-4 w-4 text-white/70" />
                <div>
                  <p className="text-lg font-black leading-none">{value}</p>
                  <p className="text-[10px] text-white/60 font-semibold">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Kurslarim va Guruhlarim — col span 2 */}
          <div className="lg:col-span-2 space-y-5">

            {/* Courses */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" /> Mening Kurslarim
                </h3>
                <button onClick={() => go('academy')} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
                  Classroomga o'tish <ChevronRight className="h-3 w-3" />
                </button>
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
                    const progressColor = progress >= 80 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#6366f1';

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
                  <FileText className="h-5 w-5 text-violet-500" /> Uy Vazifalarim
                </h3>
                <button onClick={() => go('homework')} className="text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-1">
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
                <Calendar className="h-5 w-5 text-blue-500" /> Davomat
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
                  { icon: BookOpen, label: 'Darslarni ko\'rish', path: 'academy', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
                  { icon: FileText, label: 'Vazifalarni topshirish', path: 'homework', color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
                  { icon: Coins, label: 'Tanga do\'koni', path: 'coins', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                ].map(({ icon: Icon, label, path, color }) => (
                  <button key={path} onClick={() => go(path)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group">
                    <div className={`p-2 rounded-xl ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TEACHER DASHBOARD ──────────────────────────────────────────
  if (currentUser.role === 'Teacher') {
    const myCoins = balances[currentUser.id] || 0;

    // Calculate teacher profile details dynamically
    const myProfile = teachers.find(t => t.username === currentUser?.name?.toLowerCase() || t.fullName === currentUser?.name);
    const myStudents = students.filter(s => myProfile?.groupIds.some(g => s.groupIds.includes(g)));
    const myGroups = groups.filter(g => myProfile?.groupIds.includes(g.id));
    const pendingHWCount = submissions.filter(s => 
      s.status === 'submitted' && 
      myStudents.some(st => st.id === s.studentId)
    ).length;

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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Guruhlarim', value: myGroups.length, suffix: ' ta faol', icon: Users, bg: 'bg-brand-50 dark:bg-brand-500/10', iconColor: 'text-brand-600 dark:text-brand-400' },
            { name: "Jami O'quvchilarim", value: myStudents.length, suffix: ' ta', icon: Users, bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
            { name: 'Kutilayotgan Vazifalar', value: pendingHWCount, suffix: ' ta', icon: AlertCircle, bg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400' },
            { name: 'Maosh Hissasi (Haqiqiy)', value: received, prefix: '', suffix: ' so\'m', icon: DollarSign, bg: 'bg-indigo-50 dark:bg-indigo-500/10', iconColor: 'text-indigo-600 dark:text-indigo-400' },
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
            {/* Pending Homework */}
            <div className="card p-6">
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4">Tekshirilishi kutilayotgan uy vazifalari</h3>
              <div className="divide-y divide-slate-100 dark:divide-dark-border">
                {submissions.filter(s => s.status === 'submitted' && myStudents.some(st => st.id === s.studentId)).slice(0, 5).map((hw) => {
                  const st = students.find(s => s.id === hw.studentId);
                  const group = groups.find(g => st?.groupIds.includes(g.id));
                  const course = courses.find(c => c.id === group?.courseId);
                  return (
                    <div key={hw.id} className="py-3.5 flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{st?.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{course?.name || 'Vazifa'}</p>
                      </div>
                      <button onClick={() => go('teacher-portal')} className="shrink-0 text-[11px] font-bold bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 px-3 py-1.5 rounded-lg transition-colors">
                        Ko'rish
                      </button>
                    </div>
                  );
                })}
                {submissions.filter(s => s.status === 'submitted' && myStudents.some(st => st.id === s.studentId)).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">Kutilayotgan vazifalar yo'q</p>
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
                  { label: 'Mening panelim', icon: BarChart2, path: 'teacher-portal', color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' },
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

  // ── SUPER ADMIN / DIRECTOR DASHBOARD ──────────────────────────
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalCoins = Object.values(balances).reduce((a, b) => a + b, 0);

  const stats = [
    { id: 1, name: 'Faol Talabalar', value: totalStudents, suffix: ' ta', change: '+12.5%', up: true, icon: Users, iconBg: 'bg-brand-100 dark:bg-brand-500/20', iconColor: 'text-brand-600 dark:text-brand-400' },
    { id: 2, name: 'Oylik Daromad', value: 142500000, prefix: '', suffix: ' UZS', change: '+8.2%', up: true, icon: DollarSign, iconBg: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { id: 3, name: 'Ustozlar', value: totalTeachers, suffix: ' ta faol', change: '+1', up: true, icon: GraduationCap, iconBg: 'bg-violet-100 dark:bg-violet-500/20', iconColor: 'text-violet-600 dark:text-violet-400' },
    { id: 4, name: 'Faol Loyihalar', value: projectsList.length, suffix: ' ta', change: '2 ta yangi', up: true, icon: Briefcase, iconBg: 'bg-amber-100 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400' },
    { id: 5, name: 'Tizimda Coinlar', value: totalCoins, suffix: ' C', change: '+5.6%', up: true, icon: Coins, iconBg: 'bg-orange-100 dark:bg-orange-500/20', iconColor: 'text-orange-600 dark:text-orange-400' },
    { id: 6, name: "O'zlashtirish", value: 87, suffix: '%', change: '+2.1%', up: true, icon: Target, iconBg: 'bg-sky-100 dark:bg-sky-500/20', iconColor: 'text-sky-600 dark:text-sky-400' },
  ];

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="space-y-6 page-enter">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 p-8 lg:p-10 text-white shadow-2xl shadow-brand-600/25">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-white/5 rounded-full blur-3xl translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              <Activity className="h-3 w-3" /> Super Admin Boshqaruv Paneli
            </span>
            <h1 className="font-heading font-black text-3xl lg:text-4xl xl:text-5xl">Xayrli kun, {currentUser.name}!</h1>
            <p className="text-white/70 mt-3 text-sm max-w-xl">IT-Akademiya va Dasturiy ta'minot kompaniyasidagi barcha jarayonlar barqaror ishlayapti.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="text-center bg-white/10 border border-white/20 px-5 py-4 rounded-2xl">
              <p className="font-heading font-black text-3xl">{totalStudents}</p>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mt-1">O'quvchilar</p>
            </div>
            <div className="text-center bg-white/10 border border-white/20 px-5 py-4 rounded-2xl">
              <p className="font-heading font-black text-3xl">{totalTeachers}</p>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mt-1">Ustozlar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.id} className="card card-hover p-5 stat-card group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${s.iconBg}`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-[10px] font-bold ${s.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {s.change}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{s.name}</p>
            <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white mt-1.5 leading-tight">
              <AnimatedCount value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </h3>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Courses */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-500/10">
                <GraduationCap className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">IT Academy Kurslari</h3>
            </div>
            <button onClick={() => go('academy')} className="text-[11px] font-bold text-brand-600 dark:text-brand-400 flex items-center gap-0.5 hover:underline">
              Ko'rish <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {courses.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-dark-muted transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{c.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.duration}</p>
                </div>
                <span className="badge badge-info shrink-0">{c.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Faol Loyihalar</h3>
            </div>
            <button onClick={() => go('pm')} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline">
              Kanban <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {projectsList.map((p) => (
              <div key={p.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-dark-muted transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{p.name}</p>
                    <p className="text-[11px] text-slate-400">Mijoz: {p.client}</p>
                  </div>
                  <span className={`badge ${p.status === 'in_progress' ? 'badge-info' : 'badge-warning'} shrink-0`}>
                    {p.status === 'in_progress' ? 'Faol' : 'Rejalangan'}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span>Progress</span><span>{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coin transactions */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">So'nggi Coin Amaliyotlar</h3>
            </div>
            <button onClick={() => go('coins')} className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 hover:underline">
              Barchasi <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {recentTx.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-400">Hech qanday amaliyot topilmadi</div>
            )}
            {recentTx.map((tx) => (
              <div key={tx.id} className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-dark-muted transition-colors">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{tx.toName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{tx.reason}</p>
                </div>
                <span className="font-heading font-black text-sm text-emerald-600 dark:text-emerald-400 shrink-0">+{tx.amount.toLocaleString()} C</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
