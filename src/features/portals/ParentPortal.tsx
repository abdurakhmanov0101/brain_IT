import React, { useState } from 'react';
import { Shield, Calendar, MessageCircle, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAttendanceStore } from '../../stores/attendanceStore';

const fmtMoney = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

interface Props { studentId?: string; }

export const ParentPortal: React.FC<Props> = ({ studentId = 'st1' }) => {
  const { students, payments } = useStudentStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { getByStudent } = useAttendanceStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'payments'>('overview');

  const student = students.find((s) => s.id === studentId);
  if (!student) return <div className="text-center py-20 text-slate-400">O'quvchi topilmadi</div>;

  const studentGroups = groups.filter((g) => student.groupIds.includes(g.id));
  const studentCourses = courses.filter((c) => studentGroups.some((g) => g.courseId === c.id));
  const myPayments = payments.filter((p) => p.studentId === studentId).slice().reverse();
  const attendance = getByStudent(studentId);
  const presentCount = attendance.filter((r) => r.status === 'present').length;
  const lateCount = attendance.filter((r) => r.status === 'late').length;
  const absentCount = attendance.filter((r) => r.status === 'absent').length;
  const attendanceRate = attendance.length ? Math.round(((presentCount + lateCount) / attendance.length) * 100) : 0;
  const isDebt = student.balance < 0;
  const isLow = student.balance >= 0 && student.balance < (studentCourses[0]?.lessonPrice ?? 0) * 3;

  const teacherFeedbacks = [
    { teacher: 'Bobur Akbarov', date: '2026-06-15', feedback: "Faol ishtirokchi. Uy vazifalarini o't vaqtida topshirmoqda.", grade: 'A' },
    { teacher: 'Bobur Akbarov', date: '2026-06-08', feedback: "Bu haftada React loyihasini a'lo bajarib topshirdi.", grade: 'A+' },
    { teacher: 'Bobur Akbarov', date: '2026-06-01', feedback: "JavaScript topshirig'ida biroz qiynaldi, lekin qo'shimcha mashq qildi.", grade: 'B+' },
  ];

  const tabs: Array<['overview' | 'attendance' | 'payments', string]> = [
    ['overview', 'Umumiy'], ['attendance', 'Davomat'], ['payments', "To'lovlar"]
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 p-6 text-white">
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl"><Shield className="h-8 w-8 text-white" /></div>
          <div>
            <p className="text-violet-200 text-sm">Ota-ona kabineti</p>
            <h1 className="font-heading font-black text-2xl">{student.fullName}</h1>
            <p className="text-violet-200 text-sm">O'quvchi · {student.enrolledDate} dan beri o'qiyapti</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-2xl p-4 text-center border ${isDebt ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : isLow ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
          <p className={`text-xl font-black ${isDebt ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-700' : 'text-emerald-700 dark:text-emerald-400'}`}>{fmtMoney(student.balance)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Balans</p>
          {isDebt && <p className="text-xs text-red-500 mt-1 flex items-center justify-center gap-1"><AlertTriangle className="h-3 w-3" /> Qarz!</p>}
        </div>
        <div className="rounded-2xl p-4 text-center border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <p className={`text-xl font-black ${attendanceRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : attendanceRate >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{attendanceRate}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Davomat</p>
        </div>
        <div className="rounded-2xl p-4 text-center border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{studentGroups.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Aktiv guruhlar</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-dark-border">
        {tabs.map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab ? 'border-violet-600 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">O'quv guruhlari</h3>
            {studentGroups.map((g) => {
              const course = courses.find((c) => c.id === g.courseId);
              return (
                <div key={g.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-2">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-slate-800 dark:text-white">{g.name}</p>
                    <span className="text-xs text-indigo-500 font-medium">{course?.monthlyPrice.toLocaleString()} so'm/oy</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>📅 {g.schedule.days.slice(0, 3).join(', ')}</span>
                    <span>🕐 {g.schedule.time}</span>
                    <span>🏫 {g.room}</span>
                    <span>📚 {course?.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><MessageCircle className="h-5 w-5 text-indigo-500" /> Ustoz mulohazalari</h3>
            <div className="space-y-3">
              {teacherFeedbacks.map((fb, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{fb.teacher}</p>
                      <p className="text-xs text-slate-400">{fb.date}</p>
                    </div>
                    <span className={`font-black text-lg ${fb.grade.includes('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{fb.grade}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{fb.feedback}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-2xl p-5 border ${isDebt || isLow ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-dark-border'}`}>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">To'lov qilish</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Joriy balans: <strong className={isDebt ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}>{fmtMoney(student.balance)}</strong></p>
            <div className="flex gap-3">
              <a href="https://payme.uz" target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold text-center">📱 Payme</a>
              <a href="https://click.uz" target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold text-center">⚡ Click</a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Keldi', count: presentCount, color: 'text-emerald-600 dark:text-emerald-400', Icon: CheckCircle },
              { label: 'Kech qoldi', count: lateCount, color: 'text-amber-600', Icon: Clock },
              { label: 'Kelmadi', count: absentCount, color: 'text-red-500', Icon: XCircle }].map((s) => (
              <div key={s.label} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl p-4 text-center">
                <s.Icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                <p className={`text-xl font-black ${s.color}`}>{s.count}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-dark-border">
              {attendance.slice().reverse().map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    {r.status === 'present' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                    {r.status === 'absent' && <XCircle className="h-5 w-5 text-red-400" />}
                    {r.status === 'late' && <Clock className="h-5 w-5 text-amber-400" />}
                    {r.status === 'excused' && <Calendar className="h-5 w-5 text-blue-400" />}
                    <span className="text-sm text-slate-700 dark:text-slate-300">{r.date}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold ${r.status === 'present' ? 'text-emerald-600 dark:text-emerald-400' : r.status === 'absent' ? 'text-red-500' : r.status === 'late' ? 'text-amber-500' : 'text-blue-500'}`}>
                      {r.status === 'present' ? 'Keldi' : r.status === 'absent' ? 'Kelmadi' : r.status === 'late' ? 'Kech qoldi' : 'Sababli'}
                    </span>
                    {r.deductionApplied && <p className="text-[10px] text-slate-400">Dars hisobdan yechildi</p>}
                  </div>
                </div>
              ))}
              {attendance.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Davomat yozuvlari yo'q</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-3">
          {myPayments.map((p) => (
            <div key={p.id} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{p.date}</p>
                <p className="text-xs text-slate-400">{p.type.toUpperCase()} · {p.note || "To'lov"} · {p.receivedBy}</p>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{p.amount.toLocaleString()} so'm</span>
            </div>
          ))}
          {myPayments.length === 0 && <p className="text-sm text-slate-400 text-center py-8">To'lovlar tarixi yo'q</p>}
        </div>
      )}
    </div>
  );
};
