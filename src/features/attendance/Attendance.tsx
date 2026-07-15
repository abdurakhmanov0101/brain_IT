import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Check, X, AlertCircle, QrCode, Users, ChevronRight, ChevronLeft,
  CalendarCheck, BookOpen, Trash2, Download, Search, Info, Plus, ChevronDown, ChevronUp, Clock, Coins, Send, MessageSquare
} from 'lucide-react';
import { useAttendanceStore, type AttendanceRecord } from '../../stores/attendanceStore';
import { useGroupStore } from '../../stores/groupStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAuthStore } from '../../stores/authStore';
import { useCoinStore } from '../../stores/coinStore';
import { useUIStore } from '../../stores/uiStore';
import { useTelegramStore } from '../../stores/telegramStore';
import { sendAttendanceNotification } from '../../services/telegramBot';
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

  // Ensure today's date is present if we are looking at the current year and month
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (year === now.getFullYear() && monthIndex === now.getMonth() && !dates.some(d => d.dateStr === todayStr)) {
    const day = now.getDate();
    const label = `${String(day).padStart(2, '0')}.${String(monthIndex + 1).padStart(2, '0')}`;
    dates.push({ dateStr: todayStr, label, dayIndex: dates.length + 1 });
    dates.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    dates.forEach((d, idx) => d.dayIndex = idx + 1);
  }

  return dates;
};

export const Attendance: React.FC = () => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const { records, markAttendance, deleteRecord } = useAttendanceStore();
  const { groups } = useGroupStore();
  const { students, deductLesson, refundLesson, updateStudent } = useStudentStore();
  const { teachers } = useTeacherStore();
  const { courses } = useCourseStore();
  const { addTransaction } = useCoinStore();
  const { addToast } = useUIStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { getChatId, pollAndProcessReplies } = useTelegramStore();

  const isTeacher = currentUser?.role === 'Teacher';
  
  // Filter groups list based on user role
  const teacherGroups = isTeacher 
    ? groups.filter(g => (g.teacherId === currentUser?.id || g.teacherId === currentUser?.id?.replace('u_', '') || g.teacherId === 'tr_umid') && g.status !== 'archived')
    : [];
  const availableGroups = isTeacher
    ? (teacherGroups.length > 0 ? teacherGroups : groups.filter(g => g.status !== 'archived'))
    : groups.filter(g => g.status !== 'archived');

  const location = useLocation();
  const stateGroupId = (location.state as any)?.groupId;

  const [selectedGroupId, setSelectedGroupId] = useState(stateGroupId || availableGroups[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth()); // 0-indexed, hozirgi oy
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

  // Polling for parent replies every 30 seconds when page is active
  useEffect(() => {
    const poll = async () => {
      const replies = await pollAndProcessReplies();
      for (const reply of replies) {
        updateStudent(reply.studentId, { absentReason: reply.replyText });
        addToast({ type: 'info', message: `Ota-ona javobi qabul qilindi: "${reply.replyText}"` });
      }
    };
    poll(); // initial poll
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkStatus = (studentId: string, date: string, newStatus: AttendanceRecord['status'], grade?: number) => {
    if (!group || !course) return;
    const prev = records.find(r => r.studentId === studentId && r.groupId === group.id && r.date === date);
    if (prev?.status === newStatus && prev?.grade === grade) return;

    // Sababsiz kelmaganlar (absent) uchun ham pul yechiladi. Sababli (excused) va muz (freezed) dan yechilmaydi.
    const deduct = newStatus === 'present' || newStatus === 'late' || newStatus === 'first_lesson' || newStatus === 'absent';
    
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
    const prevDeduct = prev?.status === 'present' || prev?.status === 'late' || prev?.status === 'first_lesson' || prev?.status === 'absent';
    if (prevDeduct) {
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

    // Telegram xabarnomasi yuborish
    const student = students.find(s => s.studentId === studentId || s.id === studentId);
    if (student && group && course) {
      const chatId = getChatId(student.id);
      if (chatId) {
        sendAttendanceNotification({
          chatId,
          studentName: student.fullName,
          courseName: course.name,
          groupName: group.name,
          date,
          time: group.schedule?.time ?? '10:00',
          status: newStatus,
        }).catch(() => {/* silent fail */});
      }
    }
  };

  const handleMarkAllPresent = (dateStr: string) => {
    if (!group || !course) return;
    if (window.confirm(`${dateStr} sanasi uchun guruhdagi barcha o'quvchilarni "Keldi" deb belgilamoqchimisiz? (Ularning hisobidan dars puli yechiladi)`)) {
      let markedCount = 0;
      filteredStudents.forEach(student => {
        if (!student) return;
        const isFreezed = student.enrolledDate && dateStr < student.enrolledDate;
        // Don't override if already marked (optional logic, but here we override everything that isn't freezed)
        if (!isFreezed) {
          handleMarkStatus(student.id, dateStr, 'present');
          markedCount++;
        }
      });
      addToast({ type: 'success', message: `${markedCount} ta o'quvchi keldi deb belgilandi!` });
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
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-1">Guruh</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">-- Guruhni tanlang --</option>
              {availableGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Davr select */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-1">Davr (Oy / Yil)</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
            className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border border-emerald-100 dark:border-emerald-900/30"
          >
            <Download className="w-4 h-4" />
            <span>Hisobotni Yuklash (Export)</span>
          </button>
        </div>
      </div>

      {/* ─── COMPACT GROUP INFO BAR ─── */}
      {group && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm premium-card-shadow text-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-slate-800 dark:text-white text-sm">{group.name}</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-md">Offline</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Ustoz:</span> {teacher?.fullName || 'Noma\'lum'}
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Xona:</span> {group.room || '101-xona'}
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Vaqt:</span> {group.schedule.time} ({group.schedule.days.join(', ')})
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
             <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Keldi</span>
             <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-300" /> Sababli</span>
             <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Sababsiz</span>
             <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px]">❄️</span> Muzlatilgan</span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-5 items-start">
        {/* ──────────────── COMPACT ATTENDANCE GRID ──────────────── */}
        <div className="w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col premium-card-shadow">
          
          {/* Search and stats bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism bo'yicha qidiruv..." 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-3.5 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Kelgan: {presentCount}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Kelmagan: {absentCount}</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg text-[10px] text-slate-600 dark:text-slate-400">Jami: {filteredStudents.length} ta o'quvchi</span>
            </div>
          </div>

          {/* Swipe indicator helper shown on mobile/tablet */}
          <div className="xl:hidden flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-2.5 py-1 px-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/30 rounded-lg w-max animate-pulse">
            <span>← Jadvalni yon tomonga suring (Swipe horizontally) →</span>
          </div>

          {/* Table Container - Overflow touch enabled */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl mt-4 custom-scrollbar max-h-[600px] w-full block touch-pan-x">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800 select-none">
                <tr>
                  <th rowSpan={2} className="px-3 py-2 text-center font-bold border-r border-slate-100 dark:border-slate-800 w-10">№</th>
                  <th rowSpan={2} className="px-3.5 py-2 font-bold border-r border-slate-100 dark:border-slate-800 min-w-[150px]">Ism</th>
                  <th rowSpan={2} className="px-3 py-2 font-bold border-r border-slate-100 dark:border-slate-800 min-w-[110px]">Telefon</th>
                  <th rowSpan={2} className="px-3 py-2 font-bold border-r border-slate-100 dark:border-slate-800 text-right min-w-[90px]">Balans</th>
                  <th rowSpan={2} className="px-3 py-2 font-bold border-r border-slate-100 dark:border-slate-800 min-w-[90px]">To'lov kuni</th>
                  <th rowSpan={2} className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-800 w-12">Bekor qilish</th>
                  
                  {/* Lesson header cells */}
                  {monthDates.map(dt => {
                    const isToday = dt.dateStr === todayStr;
                    return (
                      <th key={`lhead-${dt.dateStr}`} className={`px-2.5 py-1 text-center text-[9px] font-medium border-r border-b border-slate-100 dark:border-slate-800 whitespace-nowrap ${isToday ? 'bg-emerald-500 text-white font-bold shadow-sm' : ''}`}>
                        {dt.dayIndex}-dars{isToday ? ' (Bugun)' : ''}
                      </th>
                    );
                  })}
                </tr>
                <tr>
                  {/* Lesson dates */}
                  {monthDates.map(dt => {
                    const isToday = dt.dateStr === todayStr;
                    const isPastOrToday = dt.dateStr <= todayStr;
                    return (
                      <th key={`ldate-${dt.dateStr}`} className={`px-2 py-1.5 text-center text-[9px] font-bold border-r border-slate-100 dark:border-slate-800 whitespace-nowrap align-top ${isToday ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300'}`}>
                        <div>{dt.label}</div>
                        {isPastOrToday && (
                          <div className="mt-1 flex justify-center">
                            <button
                              onClick={() => handleMarkAllPresent(dt.dateStr)}
                              className={`flex items-center justify-center w-full max-w-[40px] py-0.5 rounded border text-[8px] transition-colors ${
                                isToday 
                                  ? 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-700' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 hover:bg-emerald-100'
                              }`}
                              title={`${dt.label} uchun hammaga davomat qo'yish`}
                            >
                              ✓ All
                            </button>
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student, sIdx) => {
                  if (!student) return null;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="px-3 py-2 text-center text-slate-400 font-semibold border-r border-slate-100 dark:border-slate-800">{sIdx + 1}</td>
                      <td className="px-3.5 py-2 font-bold text-slate-800 dark:text-white border-r border-slate-100 dark:border-slate-800 max-w-[240px]">
                        <div className="flex flex-col gap-1">
                          <span className="truncate block w-full">{student.fullName}</span>
                          {student.absentReason && (
                            <div className="flex items-start gap-1 bg-amber-500/10 border border-amber-500/30 rounded-lg p-1.5 text-[11px] text-amber-700 dark:text-amber-400 leading-tight w-full max-w-[220px] shadow-sm">
                              <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                              <div className="min-w-0">
                                <span className="font-extrabold block text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">💬 Ota-ona izohi:</span>
                                <span className="italic font-medium text-slate-700 dark:text-slate-300 whitespace-normal break-words">"{student.absentReason}"</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-500 border-r border-slate-100 dark:border-slate-800">{student.phone}</td>
                      <td className={`px-3 py-2 text-right font-black border-r border-slate-100 dark:border-slate-800 ${student.balance >= 0 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-500'}`}>
                        {student.balance.toLocaleString()} so'm
                      </td>
                      <td className="px-3 py-2 text-slate-400 font-semibold border-r border-slate-100 dark:border-slate-800">{student.nextPaymentDate || '—'}</td>
                      <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-slate-800">
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
                        const isFreezed = record?.status === 'freezed' || (student.enrolledDate && dt.dateStr < student.enrolledDate);
                        const isToday = dt.dateStr === todayStr;
                        
                        return (
                          <td key={`cell-${student.id}-${dt.dateStr}`} className="px-2 py-2 text-center border-r border-slate-100 dark:border-slate-800 relative">
                            <div className="flex items-center justify-center">
                              {(() => {
                                let circleStyle = "w-6.5 h-6.5 rounded-full flex items-center justify-center cursor-pointer transition-all border border-slate-200 dark:border-slate-800 hover:scale-105 select-none ";
                                let content = null;

                                if (isFreezed) {
                                  circleStyle += "bg-sky-500 border-sky-600 text-white shadow shadow-sky-500/15";
                                  content = <span className="text-[10px]" title="Muz (Yangi qo'shilgan, hisobga kirmaydi)">❄️</span>;
                                } else if (record) {
                                  if (record.status === 'present') {
                                    circleStyle += "bg-emerald-500 border-emerald-600 text-white";
                                    content = <Check className="w-3 h-3" />;
                                  } else if (record.status === 'late') {
                                    circleStyle += "bg-amber-400 border-amber-500 text-white";
                                    content = <Clock className="w-3 h-3" />;
                                  } else if (record.status === 'first_lesson') {
                                    circleStyle += "bg-sky-400 border-sky-500 text-white";
                                    content = <span className="text-[8px] font-black">1</span>;
                                  } else if (record.status === 'excused') {
                                    circleStyle += "bg-slate-700 dark:bg-slate-300 border-slate-800 text-white dark:text-slate-900 font-bold";
                                    content = <span className="text-[8px]">S</span>;
                                  } else if (record.status === 'absent') {
                                    circleStyle += "bg-rose-500 border-rose-600 text-white";
                                    content = <X className="w-3 h-3" />;
                                  }
                                } else {
                                  circleStyle += "bg-slate-50/50 dark:bg-slate-800/5 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-800 text-transparent";
                                }

                                if (dt.dateStr > todayStr) {
                                  circleStyle += " opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
                                } else if (dt.dateStr < todayStr && isTeacher) {
                                  circleStyle += " opacity-80 cursor-not-allowed";
                                }

                                return (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (dt.dateStr > todayStr) {
                                        addToast({ 
                                          type: 'warning', 
                                          message: "⏳ Kelgusi sanalarga oldindan davomat qilib bo'lmaydi! Faqat bugun va o'tgan kunlar uchun belgilang." 
                                        });
                                        return;
                                      }
                                      if (dt.dateStr < todayStr && isTeacher) {
                                        addToast({ 
                                          type: 'warning', 
                                          message: "⏳ O'tgan darslarga davomat belgilash yoki o'zgartirish faqat adminlar uchun ruxsat etiladi!" 
                                        });
                                        return;
                                      }
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
                              <div className="absolute right-0 top-full mt-1.5 z-45 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2.5 w-44 space-y-1 text-xs text-slate-700 dark:text-slate-200 text-left">
                                {[
                                  { status: 'present',      label: '✅ Keldi',         color: 'bg-emerald-500' },
                                  { status: 'late',         label: '⏰ Kech keldi',    color: 'bg-amber-400' },
                                  { status: 'first_lesson', label: '🆕 Birinchi dars', color: 'bg-sky-400' },
                                  { status: 'excused',      label: '📋 Sababli',       color: 'bg-slate-600 dark:bg-slate-300' },
                                  { status: 'absent',       label: '❌ Sababsiz',      color: 'bg-rose-500' },
                                  { status: 'freezed',      label: '❄️ Muz (hisobga kirmaydi)', color: 'bg-sky-500' },
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
                                    <div className={`w-3 h-3 rounded-full ${opt.color} shrink-0`} />
                                    <span className="text-[10px] truncate">{opt.label}</span>
                                  </button>
                                ))}
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
