import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, UserPlus, UserMinus, Clock, BookOpen, Search, ArrowLeft,
  Download, CalendarCheck, Check, Trash2, Calendar, FileText, History, Info 
} from 'lucide-react';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useStudentStore } from '../../stores/studentStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useHomeworkStore } from '../../stores/homeworkStore';
import { useUIStore } from '../../stores/uiStore';
import { StatCard } from '../../components/StatCard';
import { Badge, statusBadge } from '../../components/Badge';
import { AddGroupModal } from './AddGroupModal';
import { useAuthStore } from '../../stores/authStore';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';

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

export const Groups: React.FC = () => {
  const { groups, addStudentToGroup, removeStudentFromGroup } = useGroupStore();
  const { courses } = useCourseStore();
  const { teachers } = useTeacherStore();
  const { students, updateStudent } = useStudentStore();
  const { records, markAttendance, deleteRecord } = useAttendanceStore();
  const { assignments } = useHomeworkStore();
  const { addToast } = useUIStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [addOpen, setAddOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'students' | 'homework' | 'history'>('students');
  const [addStudentId, setAddStudentId] = useState('');
  const [search, setSearch] = useState('');

  const isTeacher = currentUser?.role === 'Teacher';

  const visibleGroups = React.useMemo(() => {
    if (!currentUser) return [];
    if (['Super Admin', 'Academy Director', 'Company Director', 'Project Manager'].includes(currentUser.role)) return groups;
    if (currentUser.role === 'Teacher') {
      const tg = groups.filter(g => g.teacherId === currentUser.id || g.teacherId === currentUser.id?.replace('u_', '') || g.teacherId === 'tr_umid');
      return tg.length > 0 ? tg : groups;
    }
    return groups;
  }, [groups, currentUser]);

  // Grid states
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth()); // 0-indexed, hozirgi oy
  const [gridSearch, setGridSearch] = useState('');
  const [activeCell, setActiveCell] = useState<{ studentId: string; date: string } | null>(null);

  const getCourse = (id: string) => courses.find((c) => c.id === id);
  const getTeacher = (id: string) => teachers.find((t) => t.id === id);
  const getStudent = (id: string) => students.find((s) => s.id === id);

  const detailGroup = groups.find((g) => g.id === activeGroupId);
  const groupStudents = detailGroup ? detailGroup.studentIds.map(getStudent).filter(Boolean) : [];
  const notInGroup = students.filter((s) => !detailGroup?.studentIds.includes(s.id) && s.status === 'active');
  const groupHomeworks = assignments.filter((a) => a.groupId === activeGroupId);

  const [groupStatusTab, setGroupStatusTab] = useState<'active' | 'archived'>('active');

  const filteredGroups = visibleGroups.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = groupStatusTab === 'active' ? g.status !== 'archived' : g.status === 'archived';
    return matchSearch && matchStatus;
  });

  const handleAddStudent = () => {
    if (!addStudentId || !activeGroupId) return;
    addStudentToGroup(activeGroupId, addStudentId);
    addToast({ type: 'success', message: "O'quvchi guruhga muvaffaqiyatli qo'shildi" });
    setAddStudentId('');
  };

  const handleRemoveStudent = (sid: string) => {
    if (!activeGroupId) return;
    if (window.confirm("O'quvchini guruhdan chiqarmoqchimisiz?")) {
      removeStudentFromGroup(activeGroupId, sid);
      addToast({ type: 'warning', message: "O'quvchi guruhdan chiqarildi" });
    }
  };

  const activeCount = visibleGroups.filter((g) => g.status === 'active').length;
  const totalStudents = visibleGroups.reduce((sum, g) => sum + g.studentIds.length, 0);

  // Case A: Show list of groups
  if (activeGroupId === null) {
    return (
      <div className="space-y-6 page-enter">
        <PageHeaderBanner
          category="KATALOG VA GURUHLAR • GRID SIGNATURE"
          title="O'quv Guruhlari va Dars Jadvallari"
          description="Markazdagi faol va arxivlangan guruhlar katalogi, talabalar sig'imi hamda dars vaqtlari"
          accent="blue"
          icon={<Users className="w-3.5 h-3.5" />}
          rightAction={
            !isTeacher ? (
              <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95">
                <Plus className="h-4 w-4" /> Yangi guruh
              </button>
            ) : undefined
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Jami guruhlar" value={visibleGroups.length} icon={Users} />
          <StatCard title="Aktiv guruhlar" value={activeCount} icon={Users} iconColor="text-emerald-600 dark:text-emerald-400" />
          <StatCard title="Jami o'quvchilar" value={totalStudents} icon={Users} iconColor="text-emerald-600 dark:text-emerald-400" />
          <StatCard title="Kurslar soni" value={courses.length} icon={BookOpen} iconColor="text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex bg-slate-100 dark:bg-dark-border p-1 rounded-xl w-fit">
            <button
              onClick={() => setGroupStatusTab('active')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                groupStatusTab === 'active'
                  ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Faol guruhlar ({visibleGroups.filter(g => g.status !== 'archived').length})
            </button>
            <button
              onClick={() => setGroupStatusTab('archived')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                groupStatusTab === 'archived'
                  ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Arxiv ({visibleGroups.filter(g => g.status === 'archived').length})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Guruh nomini qidiring..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => {
            const course = getCourse(group.courseId);
            const teacher = getTeacher(group.teacherId);
            const fill = Math.round((group.studentIds.length / group.maxStudents) * 100);
            return (
              <div 
                key={group.id} 
                className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer card-hover" 
                onClick={() => setActiveGroupId(group.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{group.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{course?.name ?? group.courseId}</p>
                  </div>
                  {statusBadge(group.status)}
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{group.studentIds.length}/{group.maxStudents} o'quvchi</span>
                    <span className="ml-auto text-xs font-medium text-slate-400">{fill}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${fill >= 90 ? 'bg-red-500' : fill >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${fill}%` }} />
                  </div>
                  {teacher && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <img src={teacher.photo} alt={teacher.fullName} className="h-5 w-5 rounded-full object-cover" />
                      <span className="text-xs">{teacher.fullName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="text-xs">{group.schedule.days.map((d) => d.slice(0, 3)).join(', ')} — {group.schedule.time}</span>
                  </div>
                  {group.room && <Badge label={group.room} color="slate" />}
                </div>
              </div>
            );
          })}
          {filteredGroups.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Guruhlar topilmadi</p>
            </div>
          )}
        </div>

        <AddGroupModal open={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    );
  }

  // Case B: Detailed Group view matching the user's screenshot
  const selectedCourseObj = getCourse(detailGroup?.courseId || '');
  const selectedTeacherObj = getTeacher(detailGroup?.teacherId || '');

  return (
    <div className="space-y-6 page-enter">
      {/* Top Header with Back button */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => { setActiveGroupId(null); setDetailTab('students'); }} 
          className="p-2.5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">{detailGroup?.name}</h1>
          <p className="text-xs text-slate-500">Guruh ma'lumotlari va faoliyati boshqaruvi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* ──────────────── LEFT COLUMN: GROUP INFO CARD (SIDEBAR) ──────────────── */}
        <div className="xl:col-span-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white">Guruh ma'lumotlari</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guruh nomi</p>
              <p className="font-heading font-black text-sm text-slate-800 dark:text-white mt-0.5">{detailGroup?.name}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daraja</p>
              <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">Standard</span>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ta'lim turi</p>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                offline
              </span>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xona / Platforma</p>
              <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 mt-0.5">{detailGroup?.room || 'Microsoft'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
              <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">Dars jadvali</h4>
              
              <div>
                <p className="text-[10px] font-medium text-slate-400">Dars vaqti</p>
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">{detailGroup?.schedule.time} - {(() => {
                  if (!detailGroup) return '';
                  const [h, m] = detailGroup.schedule.time.split(':').map(Number);
                  const endHour = String((h + 2) % 24).padStart(2, '0');
                  return `${endHour}:${String(m).padStart(2, '0')}`;
                })()}</p>
              </div>

              <div>
                <p className="text-[10px] font-medium text-slate-400">Dars kunlari</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {detailGroup?.schedule.days.map(day => (
                    <span key={day} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">{day}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium text-slate-400">Dars davomiyligi</p>
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">2 soat</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">Akademik ma'lumot</h4>
              
              <div>
                <p className="text-[10px] font-medium text-slate-400">Kurs / Fan</p>
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">{selectedCourseObj?.name || 'Backend Development'}</p>
              </div>

              <div>
                <p className="text-[10px] font-medium text-slate-400">O'qituvchi</p>
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">{selectedTeacherObj?.fullName || "—"}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">Guruh faoliyat muddati</h4>
              
              <div>
                <p className="text-[10px] font-medium text-slate-400">Boshlanish sanasi</p>
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">{detailGroup ? new Date(detailGroup.startDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
              </div>

              <div>
                <p className="text-[10px] font-medium text-slate-400">Tugash kuni</p>
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">{(() => {
                  if (!detailGroup) return '';
                  const start = new Date(detailGroup.startDate);
                  start.setMonth(start.getMonth() + 3);
                  return start.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
                })()}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => addToast({ type: 'info', message: "Tahrirlash oynasi ochildi." })}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10"
            >
              Tahrirlash
            </button>
            <button
              onClick={() => addToast({ type: 'error', message: "Guruh arxivlandi!" })}
              className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Guruhni arxivlash
            </button>
          </div>
        </div>

        {/* ──────────────── RIGHT COLUMN: TABS PANEL (STUDENTS / HOMEWORK / HISTORY / ATTENDANCE) ──────────────── */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Sub-tabs selection */}
          <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl w-max">
            <button 
              onClick={() => setDetailTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${detailTab === 'students' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <Users className="w-4 h-4" />
              <span>O'quvchilar</span>
            </button>
            
            <button 
              onClick={() => setDetailTab('homework')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${detailTab === 'homework' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Topshiriqlar</span>
            </button>

            <button 
              onClick={() => setDetailTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${detailTab === 'history' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <History className="w-4 h-4" />
              <span>Guruh tarixi ma'lumotlari</span>
            </button>

            <button 
              onClick={() => navigate('/attendance', { state: { groupId: activeGroupId } })}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Davomat</span>
            </button>
          </div>

          {/* TAB 1: STUDENTS LIST */}
          {detailTab === 'students' && (
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="font-heading font-bold text-base text-slate-800 dark:text-white">Aktiv guruh o'quvchilari ({groupStudents.length}/{detailGroup?.maxStudents})</h4>
                
                {/* Search */}
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={gridSearch}
                    onChange={(e) => setGridSearch(e.target.value)}
                    placeholder="O'quvchi ismini qidiring..."
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">O'quvchi</th>
                      <th className="px-4 py-3">Telefon</th>
                      <th className="px-4 py-3">Balans</th>
                      <th className="px-4 py-3">Holat</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Harakat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {groupStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
                          <img src={s.photo} alt={s.fullName} className="w-8 h-8 rounded-full object-cover" />
                          <span>{s.fullName}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">{s.phone}</td>
                        <td className="px-4 py-3.5 font-extrabold text-emerald-500">{s.balance.toLocaleString()} so'm</td>
                        <td className="px-4 py-3.5">
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-md">Faol</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button onClick={() => handleRemoveStudent(s.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors" title="Guruhdan olib tashlash">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Student Section */}
              {detailGroup && detailGroup.studentIds.length < detailGroup.maxStudents && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2.5">Yangi o'quvchi qo'shish</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select 
                      value={addStudentId} 
                      onChange={(e) => setAddStudentId(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">O'quvchini tanlang...</option>
                      {notInGroup.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                    </select>
                    <button 
                      onClick={handleAddStudent} 
                      disabled={!addStudentId} 
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/15 justify-center"
                    >
                      <UserPlus className="h-4.5 w-4.5" /> 
                      <span>Guruhga qo'shish</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HOMEWORK LIST */}
          {detailTab === 'homework' && (
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h4 className="font-heading font-bold text-base text-slate-800 dark:text-white">Guruhga berilgan topshiriqlar</h4>
                <button 
                  onClick={() => addToast({ type: 'info', message: "Yangi uy vazifasi yaratish oynasi" })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yangi vazifa</span>
                </button>
              </div>

              <div className="space-y-3">
                {groupHomeworks.map(hw => (
                  <div key={hw.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{hw.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{hw.description}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold mt-2">
                        <Clock className="w-3 h-3" />
                        <span>Muddati: {new Date(hw.dueDate).toLocaleDateString('uz-UZ')}</span>
                      </div>
                    </div>
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-md shrink-0">
                      {hw.completedBy?.length || 0} topshirdi
                    </span>
                  </div>
                ))}
                {groupHomeworks.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-semibold">Guruhda hali uy vazifalari yo'q</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GROUP HISTORY LOGS */}
          {detailTab === 'history' && (
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 space-y-4">
              <h4 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-2">Guruh tarixi va loglari</h4>
              
              <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
                {[
                  { title: 'Guruh davomati tekshirildi', desc: 'Iyul oyi darslari ustoz tomonidan davomat qilindi.', date: 'Bugun, 13:45', icon: CalendarCheck, color: 'bg-emerald-500' },
                  { title: "Yangi o'quvchi qo'shildi", desc: "Samira Rustamova guruh a'zoligiga qabul qilindi.", date: 'Kecha, 11:20', icon: UserPlus, color: 'bg-emerald-500' },
                  { title: 'Yangi uy vazifasi yuklandi', desc: 'React.js componentlar bo\'yicha portfolio yaratish topshirig\'i berildi.', date: '3 kun avval', icon: FileText, color: 'bg-amber-500' },
                  { title: 'Guruh ochildi', desc: `Guruh faoliyati boshlandi. Birinchi dars dars jadvaliga muvofiq o'tildi.`, date: detailGroup ? new Date(detailGroup.startDate).toLocaleDateString('uz-UZ') : '', icon: Plus, color: 'bg-emerald-500' },
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle icon */}
                    <div className={`absolute -left-9 top-0.5 w-6.5 h-6.5 rounded-full ${item.color} text-white flex items-center justify-center border-4 border-white dark:border-slate-900`}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
