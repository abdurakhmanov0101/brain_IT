import React from 'react';
import { BookOpen, CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { Badge } from '../../components/Badge';

const fmtMoney = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

interface Props { studentId?: string; }

export const StudentPortal: React.FC<Props> = ({ studentId = 'st1' }) => {
  const { students, payments } = useStudentStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { getByStudent } = useAttendanceStore();

  const student = students.find((s) => s.id === studentId);
  if (!student) return <div className="text-center py-20 text-slate-400">O'quvchi topilmadi</div>;

  const studentGroups = groups.filter((g) => student.groupIds.includes(g.id));
  const studentCourses = courses.filter((c) => studentGroups.some((g) => g.courseId === c.id));
  const myPayments = payments.filter((p) => p.studentId === studentId).slice().reverse();
  const attendance = getByStudent(studentId);
  const presentCount = attendance.filter((r) => r.status === 'present' || r.status === 'late').length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const isLowBalance = student.balance < (studentCourses[0]?.lessonPrice ?? 0) * 3;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <img src={student.photo} alt={student.fullName} className="h-16 w-16 rounded-2xl border-2 border-white/30 object-cover" />
          <div>
            <h1 className="font-heading font-black text-2xl">Salom, {student.fullName.split(' ')[0]}!</h1>
            <p className="text-indigo-200 text-sm">O'quvchi kabineti · {student.enrolledDate} dan beri</p>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-5 border ${student.balance < 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : isLowBalance ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Joriy balans</p>
            <p className={`text-3xl font-black ${student.balance < 0 ? 'text-red-600 dark:text-red-400' : isLowBalance ? 'text-amber-700' : 'text-emerald-700 dark:text-emerald-400'}`}>{fmtMoney(student.balance)}</p>
          </div>
          <CreditCard className={`h-8 w-8 ${student.balance < 0 ? 'text-red-400' : isLowBalance ? 'text-amber-400' : 'text-emerald-400'}`} />
        </div>
        {student.balance < 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-semibold">
            <AlertTriangle className="h-4 w-4" /> Qarz bor! Iltimos, to'lovni amalga oshiring.
          </div>
        )}
        {isLowBalance && student.balance >= 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 font-semibold">
            <AlertTriangle className="h-4 w-4" /> Balans kam! Tez orada to'lang.
          </div>
        )}
        {!isLowBalance && student.balance > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" /> Balans yaxshi holda
          </div>
        )}
        <div className="mt-4 flex gap-3">
          <a href="https://payme.uz" target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold text-center transition-colors">📱 Payme orqali to'lash</a>
          <a href="https://click.uz" target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold text-center transition-colors">⚡ Click orqali to'lash</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><BookOpen className="h-5 w-5 text-indigo-500" /> Mening kurslarim</h3>
          {studentGroups.length === 0 ? (
            <p className="text-sm text-slate-400">Hali guruhga biriktirilmagan</p>
          ) : (
            studentGroups.map((g) => {
              const course = courses.find((c) => c.id === g.courseId);
              return (
                <div key={g.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{g.name}</p>
                      <p className="text-xs text-slate-400">{course?.name}</p>
                    </div>
                    <Badge label="Aktiv" color="green" dot />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>📅 {g.schedule.days.slice(0, 2).join(', ')}</span>
                    <span>🕐 {g.schedule.time}</span>
                    <span>🏫 {g.room}</span>
                    <span>💰 {course?.monthlyPrice.toLocaleString()} so'm/oy</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Calendar className="h-5 w-5 text-emerald-500" /> Davomat tarixi</h3>
          <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-900/20 dark:to-indigo-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{attendanceRate}%</p>
            <p className="text-xs text-slate-400">Umumiy davomat · {presentCount}/{attendance.length} dars</p>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {attendance.slice().reverse().slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-800/40 rounded-lg px-3 py-2">
                <span className="text-slate-500 dark:text-slate-400">{r.date}</span>
                <div className="flex items-center gap-1.5">
                  {r.status === 'present' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                  {r.status === 'absent' && <XCircle className="h-4 w-4 text-red-400" />}
                  {r.status === 'late' && <Clock className="h-4 w-4 text-amber-400" />}
                  <span className={`font-medium ${r.status === 'present' ? 'text-emerald-600 dark:text-emerald-400' : r.status === 'absent' ? 'text-red-500' : 'text-amber-500'}`}>
                    {r.status === 'present' ? 'Keldi' : r.status === 'absent' ? 'Kelmadi' : r.status === 'late' ? 'Kech qoldi' : 'Sababli'}
                  </span>
                </div>
              </div>
            ))}
            {attendance.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Davomat yozuvlari yo'q</p>}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><CreditCard className="h-5 w-5 text-violet-500" /> To'lov tarixi</h3>
        {myPayments.length === 0 ? (
          <p className="text-sm text-slate-400">To'lovlar tarixi yo'q</p>
        ) : (
          <div className="space-y-2">
            {myPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{p.date}</p>
                  <p className="text-xs text-slate-400">{p.type.toUpperCase()} · {p.note || "To'lov"}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{p.amount.toLocaleString()} so'm</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
