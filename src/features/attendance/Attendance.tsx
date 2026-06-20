import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, QrCode, Users, ChevronDown } from 'lucide-react';
import { useAttendanceStore, type AttendanceRecord } from '../../stores/attendanceStore';
import { useGroupStore } from '../../stores/groupStore';
import { useStudentStore } from '../../stores/studentStore';
import { useCourseStore } from '../../stores/courseStore';
import { useUIStore } from '../../stores/uiStore';
import { statusBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Keldi', icon: CheckCircle, color: 'text-emerald-500' },
  { value: 'absent', label: 'Kelmadi', icon: XCircle, color: 'text-red-500' },
  { value: 'late', label: 'Kech keldi', icon: Clock, color: 'text-amber-500' },
  { value: 'excused', label: 'Sababli', icon: AlertCircle, color: 'text-blue-500' },
] as const;

export const Attendance: React.FC = () => {
  const { records, markAttendance } = useAttendanceStore();
  const { groups } = useGroupStore();
  const { students, deductLesson, refundLesson } = useStudentStore();
  const { courses } = useCourseStore();
  const { addToast } = useUIStore();
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [qrOpen, setQrOpen] = useState(false);

  const group = groups.find((g) => g.id === selectedGroup);
  const course = courses.find((c) => c.id === group?.courseId);
  const groupStudents = group ? group.studentIds.map((id) => students.find((s) => s.id === id)).filter(Boolean) : [];
  const frozenStudents = groupStudents.filter((s) => s?.status === 'frozen');
  const activeStudents = groupStudents.filter((s) => s?.status === 'active');

  const getRecord = (studentId: string): AttendanceRecord | undefined =>
    records.find((r) => r.studentId === studentId && r.groupId === selectedGroup && r.date === selectedDate);

  const todayRecords = records.filter((r) => r.groupId === selectedGroup && r.date === selectedDate);
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const absentCount = todayRecords.filter((r) => r.status === 'absent').length;
  const lateCount = todayRecords.filter((r) => r.status === 'late').length;

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

  const totalCount = records.filter((r) => r.groupId === selectedGroup).length;
  const totalPresent = records.filter((r) => r.groupId === selectedGroup && r.status === 'present').length;
  const attendanceRate = totalCount > 0 ? Math.round((totalPresent / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Davomat</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Guruh davomatini belgilash</p>
        </div>
        <button onClick={() => setQrOpen(true)} className="inline-flex items-center gap-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
          <QrCode className="h-4 w-4" /> QR Davomat
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Keldi" value={presentCount} icon={CheckCircle} iconColor="text-emerald-500" />
        <StatCard title="Kelmadi" value={absentCount} icon={XCircle} iconColor="text-red-500" />
        <StatCard title="Kech keldi" value={lateCount} icon={Clock} iconColor="text-amber-500" />
        <StatCard title="Davomat %" value={`${attendanceRate}%`} icon={Users} iconColor="text-indigo-500" />
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 pr-8 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={handleBulkPresent} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold whitespace-nowrap">
            Hammasi keldi
          </button>
        </div>

        {course && (
          <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-2.5 text-xs text-indigo-700 dark:text-indigo-300">
            Har bir dars uchun <strong>{course.lessonPrice.toLocaleString()} so'm</strong> balansdan ayiriladi
          </div>
        )}

        <div className="space-y-2">
          {activeStudents.map((student) => {
            if (!student) return null;
            const record = getRecord(student.id);
            return (
              <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                <img src={student.photo} alt={student.fullName} className="h-9 w-9 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{student.fullName}</p>
                  <p className="text-xs text-slate-400">{student.balance.toLocaleString()} so'm</p>
                </div>
                <div className="flex gap-1.5">
                  {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                    <button key={value} onClick={() => handleMark(student.id, value as AttendanceRecord['status'])} title={label}
                      className={`p-2 rounded-lg transition-all ${record?.status === value ? `${color} bg-white dark:bg-slate-700 shadow-md scale-110` : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {activeStudents.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Guruhda o'quvchilar yo'q</p>
            </div>
          )}
        </div>

        {frozenStudents.length > 0 && (
          <div className="mt-6 border-t border-slate-100 dark:border-dark-border pt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Muzlatilgan o'quvchilar ({frozenStudents.length})</p>
            <div className="space-y-2 opacity-60">
              {frozenStudents.map((s) => s && (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <img src={s.photo} alt={s.fullName} className="h-8 w-8 rounded-full object-cover shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{s.fullName}</p>
                  </div>
                  {statusBadge('frozen')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="QR Davomat" size="md">
        <div className="text-center space-y-4 py-4">
          <div className="w-48 h-48 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <QrCode className="h-24 w-24 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white">{group?.name}</p>
            <p className="text-sm text-slate-400">{selectedDate}</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">O'quvchilar telefonidan QR kodni skanlang. Davomat avtomatik belgilanadi.</p>
          <button onClick={() => setQrOpen(false)} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">Yopish</button>
        </div>
      </Modal>
    </div>
  );
};
