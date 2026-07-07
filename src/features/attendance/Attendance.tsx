import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Check, X, AlertCircle, QrCode, Users, ChevronRight, ChevronLeft,
  CalendarCheck, BookOpen, Trash2, Download, Search, Info, Plus, ChevronDown, ChevronUp, Clock, Coins
} from 'lucide-react';
import { useAttendanceStore, type AttendanceRecord } from '../../stores/attendanceStore';
import { useGroupStore } from '../../stores/groupStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAuthStore } from '../../stores/authStore';
import { useCoinStore } from '../../stores/coinStore';
import { useUIStore } from '../../stores/uiStore';
import { statusBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';

const getMonthDatesForSchedule = (year: number, monthIndex: number, scheduleDays: string[]) => {
  const dayMap: Record<string, number> = {
    'Dushanba': 1, 'Monday': 1,
    'Seshanba': 2, 'Tuesday': 2,
    'Chorshanba': 3, 'Wednesday': 3,
    'Payshanba': 4, 'Thursday': 4,
    'Juma': 5, 'Friday': 5,
    'Shanba': 6, 'Saturday': 6,
    'Yakshanba': 0, 'Sunday': 0
  };

  const targetDayNums = scheduleDays.map(d => dayMap[d] ?? 1);
  const dates: { dateStr: string; label: string; dayIndex: number }[] = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  let lessonCount = 1;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    const dayOfWeek = d.getDay();
    if (targetDayNums.includes(dayOfWeek)) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const label = `${String(day).padStart(2, '0')}.${String(monthIndex + 1).padStart(2, '0')}`;
      dates.push({ dateStr, label, dayIndex: lessonCount++ });
    }
  }
  return dates;
};

export const Attendance: React.FC = () => {
  const { records, markAttendance, deleteRecord } = useAttendanceStore();
  const { groups } = useGroupStore();
  const { students, deductLesson, refundLesson, updateStudent } = useStudentStore();
  const { teachers } = useTeacherStore();
  const { courses } = useCourseStore();
  const { addTransaction } = useCoinStore();
  const { addToast } = useUIStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  const isTeacher = currentUser?.role === 'Teacher';
  
  // Filter groups list based on user role
  const availableGroups = isTeacher 
    ? groups.filter(g => g.teacherId === currentUser?.id && g.status !== 'archived')
    : groups.filter(g => g.status !== 'archived');

  const location = useLocation();
  const stateGroupId = (location.state as any)?.groupId;

  const [selectedGroupId, setSelectedGroupId] = useState(stateGroupId || availableGroups[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(6); // July
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCell, setActiveCell] = useState<{ studentId: string; date: string } | null>(null);
  
  // Mobile accordion state for group info card
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Sync selectedGroupId if stateGroupId changes or auto-select first group
  useEffect(() => {
    if (stateGroupId) {
      setSelectedGroupId(stateGroupId);
    } else if (availableGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(availableGroups[0].id);
    }
  }, [stateGroupId, availableGroups, selectedGroupId]);

  const group = groups.find((g) => g.id === selectedGroupId);
  const course = courses.find((c) => c.id === group?.courseId);
  const teacher = teachers.find((t) => t.id === group?.teacherId);

  const groupStudents = group ? group.studentIds.map((id) => students.find((s) => s.id === id)).filter(Boolean) : [];
  const filteredStudents = groupStudents.filter((s) => s?.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

  const monthDates = group ? getMonthDatesForSchedule(selectedYear, selectedMonth, group.schedule.days) : [];

  const handleMarkStatus = (studentId: string, date: string, newStatus: AttendanceRecord['status'], grade?: number) => {
    if (!group || !course) return;
    const prev = records.find(r => r.studentId === studentId && r.groupId === group.id && r.date === date);
    if (prev?.status === newStatus && prev?.grade === grade) return;

    const deduct = newStatus === 'present' || newStatus === 'late' || newStatus === 'first_lesson';
    
    // Mark in attendance store
    markAttendance({ 
      studentId, 
      groupId: group.id, 
      date, 
      status: newStatus, 
      checkedBy: 'manual', 
      deductionApplied: deduct,
      ...(grade !== undefined ? { grade } : {})
    });

    // Handle student balance deduction / refund
    if (prev?.status === 'present' || prev?.status === 'late' || prev?.status === 'first_lesson') {
      refundLesson(studentId, course.lessonPrice);
    }
    if (deduct) {
      deductLesson({ 
        studentId, 
        groupId: group.id, 
        lessonDate: date, 
        amount: course.lessonPrice 
      });
    }
  };

  const handleClearStudentAttendance = (studentId: string) => {
    if (!group) return;
    if (window.confirm("O'quvchining ushbu oydagi barcha davomatlarini o'chirmoqchimisiz?")) {
      monthDates.forEach(dt => {
        const prev = records.find(r => r.studentId === studentId && r.groupId === group.id && r.date === dt.dateStr);
        if (prev?.status === 'present' || prev?.status === 'late' || prev?.status === 'first_lesson') {
          refundLesson(studentId, course?.lessonPrice || 0);
        }
        deleteRecord(studentId, group.id, dt.dateStr);
      });
      addToast({ type: 'success', message: "Davomat yozuvlari muvaffaqiyatli o'chirildi." });
    }
  };

  const presentCount = records.filter(r => r.groupId === selectedGroupId && r.date.startsWith(`${selectedYear}-${String(selectedMonth+1).padStart(2,'0')}`) && (r.status === 'present' || r.status === 'first_lesson')).length;
  const absentCount = records.filter(r => r.groupId === selectedGroupId && r.date.startsWith(`${selectedYear}-${String(selectedMonth+1).padStart(2,'0')}`) && r.status === 'absent').length;

  return (
    <div className="space-y-6 page-enter">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Davomat jurnali</h1>
          <p className="text-xs text-slate-500">Tizimdagi dars davomati va o'quvchilar reytingini boshqarish</p>
        </div>
      </div>

      {/* ─── FILTERS & HEADER CONTROLS ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm premium-card-shadow">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Guruh select */}
          <div className="w-full md:w-60">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block mb-1">Guruh</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">-- Guruhni tanlang --</option>
              {availableGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Davr select */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block mb-1">Davr (Oy / Yil)</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                {['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'].map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => addToast({ type: 'success', message: "Davomat eksport qilindi!" })}
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border border-indigo-100 dark:border-indigo-900/30"
          >
            <Download className="w-4 h-4" />
            <span>Hisobotni Yuklash (Export)</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        
        {/* ──────────────── COLUMN 1: SIDEBAR / COLLAPSIBLE GROUP INFO ──────────────── */}
        <div className="xl:col-span-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm transition-all premium-card-shadow">
          {/* Header click toggles sidebar on mobile */}
          <div 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="flex items-center justify-between p-4.5 cursor-pointer xl:cursor-default border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">Guruh ma'lumotlari</h3>
            </div>
            <div className="xl:hidden text-slate-400">
              {isSidebarExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {/* Expanded Container */}
          <div className={`${isSidebarExpanded ? 'block' : 'hidden'} xl:block p-5 space-y-4.5 text-xs`}>
            {group ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guruh nomi</p>
                  <p className="font-heading font-black text-slate-800 dark:text-white mt-0.5 text-sm">{group.name}</p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ta'lim turi</p>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                      offline
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xona</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 mt-1">{group.room || '101-xona'}</p>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dars vaqti & Kunlari</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{group.schedule.time} · {group.schedule.days.join(', ')}</p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kurs va Ustoz</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{course?.name} · {teacher?.fullName || 'Noma\'lum'}</p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Boshlanish sanasi</p>
                    <p className="font-medium text-slate-600 dark:text-slate-400 mt-0.5">{group.startDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tugash kuni</p>
                    <p className="font-medium text-slate-600 dark:text-slate-400 mt-0.5">{(() => {
                      const start = new Date(group.startDate);
                      start.setMonth(start.getMonth() + 3);
                      return start.toISOString().split('T')[0];
                    })()}</p>
                  </div>
                </div>

                {/* Status indicator legends added to make left card taller and aligned */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belgilar izohi</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Keldi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>1-dars</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-300" />
                      <span>Sababli</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Sababsiz</span>
                    </div>
                  </div>
                </div>

                {/* Ratings instructions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baholar & Mukofot</p>
                  <p className="text-[11px] text-slate-505 dark:text-slate-400 leading-relaxed">
                    Har bir dars uchun o'quvchini <span className="font-bold text-slate-700 dark:text-slate-350">1 dan 5 gacha</span> ball bilan baholang.
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">5 baho</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500">→ +2 tanga</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-lime-100 text-lime-700 dark:bg-lime-950/40 dark:text-lime-400 px-2 py-0.5 rounded-md font-bold">4 baho</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500">→ +1 tanga</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-400 py-4">Guruh tanlanmagan.</p>
            )}
          </div>
        </div>

        {/* ──────────────── COLUMN 2: COMPACT ATTENDANCE GRID ──────────────── */}
        <div className="xl:col-span-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col premium-card-shadow">
          
          {/* Search and stats bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism bo'yicha qidiruv..." 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-3.5 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Kelgan: {presentCount}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Kelmagan: {absentCount}</span>
              <span className="bg-slate-100 dark:bg-slate-850 px-2.5 py-0.5 rounded-lg text-[10px] text-slate-600 dark:text-slate-400">Jami: {filteredStudents.length} ta o'quvchi</span>
            </div>
          </div>

          {/* Swipe indicator helper shown on mobile/tablet */}
          <div className="xl:hidden flex items-center gap-1 text-[10px] text-indigo-550 font-bold mt-2.5 py-1 px-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-lg w-max animate-pulse">
            <span>← Jadvalni yon tomonga suring (Swipe horizontally) →</span>
          </div>

          {/* Table Container - Overflow touch enabled */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-xl mt-4 custom-scrollbar max-h-[600px] w-full block touch-pan-x">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-850 select-none">
                <tr>
                  <th rowSpan={2} className="px-3 py-2 text-center font-bold border-r border-slate-100 dark:border-slate-850 w-10">№</th>
                  <th rowSpan={2} className="px-3.5 py-2 font-bold border-r border-slate-100 dark:border-slate-850 min-w-[150px]">Ism</th>
                  <th rowSpan={2} className="px-3 py-2 font-bold border-r border-slate-100 dark:border-slate-850 min-w-[110px]">Telefon</th>
                  <th rowSpan={2} className="px-3 py-2 font-bold border-r border-slate-100 dark:border-slate-850 text-right min-w-[90px]">Balans</th>
                  <th rowSpan={2} className="px-3 py-2 font-bold border-r border-slate-100 dark:border-slate-850 min-w-[90px]">To'lov kuni</th>
                  <th rowSpan={2} className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-850 w-12">Bekor qilish</th>
                  
                  {/* Lesson header cells */}
                  {monthDates.map(dt => (
                    <th key={`lhead-${dt.dateStr}`} className="px-2.5 py-1 text-center text-[9px] font-medium border-r border-b border-slate-100 dark:border-slate-850 whitespace-nowrap">
                      {dt.dayIndex}-dars
                    </th>
                  ))}
                </tr>
                <tr>
                  {/* Lesson dates */}
                  {monthDates.map(dt => (
                    <th key={`ldate-${dt.dateStr}`} className="px-2.5 py-1 text-center text-[9px] font-bold text-slate-800 dark:text-slate-300 border-r border-slate-100 dark:border-slate-850 whitespace-nowrap">
                      {dt.label}
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredStudents.map((student, sIdx) => {
                  if (!student) return null;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="px-3 py-2 text-center text-slate-400 font-semibold border-r border-slate-100 dark:border-slate-850">{sIdx + 1}</td>
                      <td className="px-3.5 py-2 font-bold text-slate-800 dark:text-white border-r border-slate-100 dark:border-slate-850 truncate max-w-[180px]">{student.fullName}</td>
                      <td className="px-3 py-2 font-medium text-slate-500 border-r border-slate-100 dark:border-slate-850">{student.phone}</td>
                      <td className={`px-3 py-2 text-right font-black border-r border-slate-100 dark:border-slate-850 ${student.balance >= 0 ? 'text-slate-700 dark:text-slate-305' : 'text-rose-500'}`}>
                        {student.balance.toLocaleString()} so'm
                      </td>
                      <td className="px-3 py-2 text-slate-400 font-semibold border-r border-slate-100 dark:border-slate-850">{student.nextPaymentDate || '—'}</td>
                      <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-850">
                        <button
                          type="button"
                          onClick={() => handleClearStudentAttendance(student.id)}
                          className="text-rose-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                          title="Davomatlarni o'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Interactive calendar cells */}
                      {monthDates.map(dt => {
                        const record = records.find(r => r.studentId === student.id && r.groupId === selectedGroupId && r.date === dt.dateStr);
                        
                        return (
                          <td key={`cell-${student.id}-${dt.dateStr}`} className="px-2 py-2 text-center border-r border-slate-100 dark:border-slate-850 relative">
                            <div className="flex items-center justify-center">
                              {(() => {
                                // Sleek compact style
                                let circleStyle = "w-6.5 h-6.5 rounded-full flex items-center justify-center cursor-pointer transition-all border border-slate-200 dark:border-slate-800 hover:scale-105 select-none ";
                                let content = null;

                                if (record) {
                                  if (record.grade !== undefined) {
                                    const scoreColors = [
                                      '',
                                      'bg-rose-500 border-rose-600 text-white font-black',
                                      'bg-rose-400 border-rose-500 text-white font-black',
                                      'bg-amber-500 border-amber-600 text-white font-black',
                                      'bg-lime-500 border-lime-600 text-white font-black',
                                      'bg-emerald-500 border-emerald-600 text-white font-black shadow shadow-emerald-500/15'
                                    ];
                                    circleStyle += scoreColors[record.grade];
                                    content = <span className="text-[9px]">{record.grade}</span>;
                                  } else if (record.status === 'present') {
                                    circleStyle += "bg-emerald-500 border-emerald-600 text-white";
                                    content = <Check className="w-3 h-3" />;
                                  } else if (record.status === 'first_lesson') {
                                    circleStyle += "bg-amber-400 border-amber-500 text-white";
                                    content = <span className="w-1.5 h-1.5 rounded-full bg-white" />;
                                  } else if (record.status === 'excused') {
                                    circleStyle += "bg-slate-800 dark:bg-slate-200 border-slate-900 text-white dark:text-slate-900 font-bold";
                                    content = <span className="text-[8px]">S</span>;
                                  } else if (record.status === 'absent') {
                                    circleStyle += "bg-rose-500 border-rose-600 text-white";
                                    content = <span className="text-[8px] font-black">X</span>;
                                  }
                                } else {
                                  circleStyle += "bg-slate-50/50 dark:bg-slate-800/5 hover:bg-slate-100 hover:border-slate-350 dark:hover:bg-slate-800 text-transparent";
                                }

                                return (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveCell(
                                        activeCell && activeCell.studentId === student.id && activeCell.date === dt.dateStr
                                          ? null
                                          : { studentId: student.id, date: dt.dateStr }
                                      );
                                    }}
                                    className={circleStyle}
                                  >
                                    {content}
                                  </button>
                                );
                              })()}
                            </div>

                            {/* Floating cell edit editor popover */}
                            {activeCell && activeCell.studentId === student.id && activeCell.date === dt.dateStr && (
                              <div className="absolute right-0 top-full mt-1.5 z-45 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2.5 w-44 space-y-3 text-xs text-slate-700 dark:text-slate-200 text-left">
                                <div className="space-y-0.5">
                                  {[
                                    { status: 'present', label: 'Keldi', color: 'bg-emerald-500' },
                                    { status: 'first_lesson', label: 'Birinchi dars', color: 'bg-amber-400' },
                                    { status: 'excused', label: 'Sababli', color: 'bg-slate-800 dark:bg-slate-300' },
                                    { status: 'absent', label: 'Sababsiz', color: 'bg-rose-500' },
                                  ].map(opt => (
                                    <button
                                      key={opt.status}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkStatus(student.id, dt.dateStr, opt.status as any);
                                        addToast({ type: 'success', message: `${student.fullName}ga ${opt.label} belgilandi.` });
                                        setActiveCell(null);
                                      }}
                                      className="flex items-center gap-2 w-full hover:bg-slate-50 dark:hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors font-semibold"
                                    >
                                      <div className={`w-3 h-3 rounded-full ${opt.color}`} />
                                      <span className="text-[10px]">{opt.label}</span>
                                    </button>
                                  ))}
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Baho / Rating</p>
                                  <div className="flex gap-1 justify-between">
                                    {[
                                      { grade: 1, color: 'bg-red-500 hover:bg-red-600' },
                                      { grade: 2, color: 'bg-rose-450 hover:bg-rose-500' },
                                      { grade: 3, color: 'bg-amber-500 hover:bg-amber-600' },
                                      { grade: 4, color: 'bg-lime-500 hover:bg-lime-600' },
                                      { grade: 5, color: 'bg-emerald-500 hover:bg-emerald-600' },
                                    ].map(score => (
                                      <button
                                        key={score.grade}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Set score grade
                                          const coinsToGive = score.grade === 5 ? 2 : score.grade === 4 ? 1 : 0;
                                          handleMarkStatus(student.id, dt.dateStr, 'present', score.grade);
                                          
                                          if (coinsToGive > 0) {
                                            updateStudent(student.id, { coins: (student.coins || 0) + coinsToGive });
                                            addTransaction({
                                              fromId: 'system', fromName: 'Baholash tizimi',
                                              toId: student.id, toName: student.fullName,
                                              amount: coinsToGive, reason: `${dt.label} darsi uchun ${score.grade} baho`
                                            });
                                          }
                                          
                                          addToast({ type: 'success', message: `${student.fullName}ga ${score.grade} baho qo'yildi!` });
                                          setActiveCell(null);
                                        }}
                                        className={`w-5.5 h-5.5 rounded text-white font-black text-center flex items-center justify-center transition-colors text-[9px] ${score.color}`}
                                      >
                                        {score.grade}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6 + monthDates.length} className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                      O'quvchilar ro'yxati bo'sh. Guruh yoki sana tanlang.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
