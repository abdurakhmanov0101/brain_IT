import React, { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, AlertCircle, QrCode, Users,
  ChevronRight, ChevronLeft, CalendarCheck, BookOpen,
} from 'lucide-react';
import { useAttendanceStore, type AttendanceRecord } from '../../stores/attendanceStore';
import { useGroupStore } from '../../stores/groupStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { statusBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';

const STATUS_OPTIONS = [
  { value: 'present',  label: 'Keldi',      icon: CheckCircle,  color: 'text-emerald-500' },
  { value: 'absent',   label: 'Kelmadi',    icon: XCircle,      color: 'text-red-500'     },
  { value: 'late',     label: 'Kech keldi', icon: Clock,        color: 'text-amber-500'   },
  { value: 'excused',  label: 'Sababli',    icon: AlertCircle,  color: 'text-blue-500'    },
] as const;

export const Attendance: React.FC = () => {
  const { records, markAttendance } = useAttendanceStore();
  const { groups } = useGroupStore();
  const { students, deductLesson, refundLesson } = useStudentStore();
  const { teachers } = useTeacherStore();
  const { courses } = useCourseStore();
  const { addToast } = useUIStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isTeacher = currentUser?.role === 'Teacher';

  // If current user is a teacher — skip teacher-selection step
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    isTeacher ? (currentUser?.id ?? '') : ''
  );
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [qrOpen, setQrOpen] = useState(false);

  // Step logic
  const step: 1 | 2 | 3 = !selectedTeacherId ? 1 : !selectedGroup ? 2 : 3;

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const teacherGroups   = groups.filter((g) => g.teacherId === selectedTeacherId && g.status !== 'archived');
  const group           = groups.find((g) => g.id === selectedGroup);
  const course          = courses.find((c) => c.id === group?.courseId);

  const groupStudents   = group ? group.studentIds.map((id) => students.find((s) => s.id === id)).filter(Boolean) : [];
  const frozenStudents  = groupStudents.filter((s) => s?.status === 'frozen');
  const activeStudents  = groupStudents.filter((s) => s?.status === 'active');

  const getRecord = (studentId: string): AttendanceRecord | undefined =>
    records.find((r) => r.studentId === studentId && r.groupId === selectedGroup && r.date === selectedDate);

  const todayRecords  = records.filter((r) => r.groupId === selectedGroup && r.date === selectedDate);
  const presentCount  = todayRecords.filter((r) => r.status === 'present').length;
  const absentCount   = todayRecords.filter((r) => r.status === 'absent').length;
  const lateCount     = todayRecords.filter((r) => r.status === 'late').length;

  const totalCount    = records.filter((r) => r.groupId === selectedGroup).length;
  const totalPresent  = records.filter((r) => r.groupId === selectedGroup && r.status === 'present').length;
  const attendanceRate = totalCount > 0 ? Math.round((totalPresent / totalCount) * 100) : 0;

  const handleMark = (studentId: string, status: AttendanceRecord['status']) => {
    const prev = getRecord(studentId);
    if (prev?.status === status) return;
    const deduct = status === 'present' || status === 'late';
    markAttendance({ studentId, groupId: selectedGroup, date: selectedDate, status, checkedBy: 'manual', deductionApplied: deduct });
    if (course) {
      if (prev?.status === 'present' || prev?.status === 'late') refundLesson(studentId, course.lessonPrice);
      if (deduct) deductLesson({ studentId, groupId: selectedGroup, lessonDate: selectedDate, amount: course.lessonPrice });
    }
    addToast({ type: 'success', message: `Davomat belgilandi: ${STATUS_OPTIONS.find((o) => o.value === status)?.label}` });
  };

  const handleBulkPresent = () => {
    activeStudents.forEach((s) => {
      if (!s) return;
      const prev = getRecord(s.id);
      if (prev?.status !== 'present') {
        markAttendance({ studentId: s.id, groupId: selectedGroup, date: selectedDate, status: 'present', checkedBy: 'manual', deductionApplied: true });
        if (course && prev?.status !== 'late') deductLesson({ studentId: s.id, groupId: selectedGroup, lessonDate: selectedDate, amount: course.lessonPrice });
      }
    });
    addToast({ type: 'success', message: `${activeStudents.length} ta o'quvchi "Keldi" deb belgilandi` });
  };

  /* ─── breadcrumb reset helpers ─── */
  const goStep1 = () => { setSelectedTeacherId(''); setSelectedGroup(''); };
  const goStep2 = () => { setSelectedGroup(''); };

  /* ══════════════════════════════════════
     STEP 1 — Teacher selection
  ══════════════════════════════════════ */
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Davomat</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">O'qituvchini tanlang</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {teachers.filter((t) => t.status !== 'fired').map((teacher) => {
            const tGroups = groups.filter((g) => g.teacherId === teacher.id && g.status !== 'archived');
            const tStudents = tGroups.reduce((sum, g) => sum + g.studentIds.length, 0);
            return (
              <button
                key={teacher.id}
                onClick={() => setSelectedTeacherId(teacher.id)}
                className="text-left bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img src={teacher.photo} alt={teacher.fullName}
                      className="h-14 w-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-700 group-hover:border-indigo-300 transition-colors" />
                    <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-dark-card ${teacher.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{teacher.fullName}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{teacher.specialization}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{tGroups.length} guruh</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{tStudents} o'quvchi</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     STEP 2 — Group selection
  ══════════════════════════════════════ */
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {!isTeacher && (
            <button onClick={goStep1}
              className="p-2 rounded-xl border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
              {!isTeacher && <><span className="hover:text-indigo-500 cursor-pointer" onClick={goStep1}>O'qituvchilar</span><ChevronRight className="h-3 w-3" /></>}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTeacher?.fullName}</span>
            </div>
            <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Guruhni tanlang</h1>
          </div>
        </div>

        {teacherGroups.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Bu o'qituvchining guruhlari yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {teacherGroups.map((g) => {
              const gCourse = courses.find((c) => c.id === g.courseId);
              const todayRec = records.filter((r) => r.groupId === g.id && r.date === selectedDate);
              const markedCount = todayRec.length;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  className="text-left bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{g.name}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{gCourse?.name ?? '—'}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${g.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {g.status === 'active' ? 'AKTIV' : 'TO\'LIQ'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>{g.studentIds.length}/{g.maxStudents} o'quvchi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>{g.schedule.days.join(', ')} · {g.schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span>{g.room}</span>
                    </div>
                  </div>
                  {markedCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.round((markedCount / g.studentIds.length) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{markedCount}/{g.studentIds.length} belgilandi</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-end">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline flex items-center gap-1">
                      Davomatni belgilash <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Date picker always visible on step 2 */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-4 flex items-center gap-4">
          <CalendarCheck className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Sana:</span>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     STEP 3 — Attendance list
  ══════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* Breadcrumb + back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={goStep2}
            className="p-2 rounded-xl border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5 flex-wrap">
              {!isTeacher && <><span className="hover:text-indigo-500 cursor-pointer" onClick={goStep1}>O'qituvchilar</span><ChevronRight className="h-3 w-3" /></>}
              <span className="hover:text-indigo-500 cursor-pointer" onClick={goStep2}>{selectedTeacher?.fullName}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-slate-600 dark:text-slate-300">{group?.name}</span>
            </div>
            <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Davomat</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={handleBulkPresent}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold whitespace-nowrap transition-colors">
            Hammasi keldi
          </button>
          <button onClick={() => setQrOpen(true)}
            className="inline-flex items-center gap-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <QrCode className="h-4 w-4" /> QR
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Keldi"      value={presentCount}   icon={CheckCircle}  iconColor="text-emerald-500" />
        <StatCard title="Kelmadi"    value={absentCount}    icon={XCircle}      iconColor="text-red-500" />
        <StatCard title="Kech keldi" value={lateCount}      icon={Clock}        iconColor="text-amber-500" />
        <StatCard title="Davomat %"  value={`${attendanceRate}%`} icon={Users}  iconColor="text-indigo-500" />
      </div>

      {/* Group info banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl px-5 py-3 flex flex-wrap items-center gap-4 text-sm">
        <span className="font-bold text-indigo-700 dark:text-indigo-300">{group?.name}</span>
        <span className="text-indigo-500 dark:text-indigo-400 text-xs">{group?.schedule.days.join(', ')} · {group?.schedule.time}</span>
        <span className="text-indigo-500 dark:text-indigo-400 text-xs">{group?.room}</span>
        {course && <span className="text-indigo-500 dark:text-indigo-400 text-xs">Dars narxi: <strong>{course.lessonPrice.toLocaleString()} so'm</strong></span>}
      </div>

      {/* Student list */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Aktiv o'quvchilar · <span className="text-indigo-600 dark:text-indigo-400">{activeStudents.length} ta</span>
          </p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-dark-border">
          {activeStudents.map((student) => {
            if (!student) return null;
            const record = getRecord(student.id);
            return (
              <div key={student.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <img src={student.photo} alt={student.fullName}
                  className="h-10 w-10 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{student.fullName}</p>
                  <p className={`text-xs font-medium ${student.balance < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {student.balance.toLocaleString()} so'm
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      onClick={() => handleMark(student.id, value as AttendanceRecord['status'])}
                      title={label}
                      className={`p-2 rounded-xl transition-all ${record?.status === value
                        ? `${color} bg-white dark:bg-slate-700 shadow-md scale-110 ring-1 ring-current/20`
                        : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {activeStudents.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Guruhda aktiv o'quvchilar yo'q</p>
            </div>
          )}
        </div>

        {frozenStudents.length > 0 && (
          <div className="border-t border-slate-100 dark:border-dark-border px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Muzlatilgan o'quvchilar ({frozenStudents.length})
            </p>
            <div className="space-y-2 opacity-60">
              {frozenStudents.map((s) => s && (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <img src={s.photo} alt={s.fullName} className="h-8 w-8 rounded-full object-cover shrink-0" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex-1">{s.fullName}</p>
                  {statusBadge('frozen')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="QR Davomat" size="md">
        <div className="text-center space-y-4 py-4">
          <div className="w-48 h-48 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <QrCode className="h-24 w-24 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white">{group?.name}</p>
            <p className="text-sm text-slate-400">{selectedDate}</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            O'quvchilar telefonidan QR kodni skanlang. Davomat avtomatik belgilanadi.
          </p>
          <button onClick={() => setQrOpen(false)}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">
            Yopish
          </button>
        </div>
      </Modal>
    </div>
  );
};
