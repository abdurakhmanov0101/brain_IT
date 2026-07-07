import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, FileCode, UploadCloud, Code, Play, ChevronRight, Zap, Target, TrendingUp } from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useHomeworkStore } from '../../stores/homeworkStore';
import { useUIStore } from '../../stores/uiStore';
import { Badge } from '../../components/Badge';

const fmtMoney = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

interface Props { studentId?: string; }

export const StudentPortal: React.FC<Props> = ({ studentId }) => {
  const { students, payments } = useStudentStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { getByStudent } = useAttendanceStore();
  const { submissions, submitHomework, assignments } = useHomeworkStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'homework'>('dashboard');
  const [hwMode, setHwMode] = useState<'code' | 'file'>('code');
  const [hwAssignmentId, setHwAssignmentId] = useState('');
  const [hwFile, setHwFile] = useState<File | null>(null);
  const [hwHtml, setHwHtml] = useState('');
  const [hwCss, setHwCss] = useState('');
  const [hwJs, setHwJs] = useState('');

  // Auto-detect student if not provided via props (e.g. current logged in)
  const student = students.find((s) => s.id === studentId) || students[0]; 
  
  if (!student) return (
    <div className="flex items-center justify-center h-64 text-zinc-500 font-medium">O'quvchi ma'lumotlari topilmadi.</div>
  );

  const studentGroups = groups.filter((g) => student.groupIds.includes(g.id));
  const studentCourses = courses.filter((c) => studentGroups.some((g) => g.courseId === c.id));
  const myPayments = payments.filter((p) => p.studentId === student.id).slice().reverse();
  const attendance = getByStudent(student.id);
  
  const presentCount = attendance.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absentCount = attendance.filter((r) => r.status === 'absent').length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  
  const isLowBalance = student.balance < (studentCourses[0]?.lessonPrice ?? 0) * 3;
  const myHomeworks = submissions.filter(h => h.studentId === student.id);
  
  // Available assignments for this student's groups that haven't been submitted yet
  const availableAssignments = assignments.filter(a => 
    studentGroups.some(g => g.id === a.groupId) && 
    !myHomeworks.some(hw => hw.assignmentId === a.id)
  );

  const avgGrade = myHomeworks.filter(h => h.status === 'graded').length > 0 
    ? Math.round(myHomeworks.filter(h => h.status === 'graded').reduce((acc, h) => acc + (h.grade || 0), 0) / myHomeworks.filter(h => h.status === 'graded').length)
    : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedExt = ['.zip', '.rar', '.pdf', '.js', '.html', '.css', '.txt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExt.includes(fileExt)) {
        addToast({ type: 'error', message: `Xavfsizlik: Fayl formati (${fileExt}) ruxsat etilmaydi!` });
        e.target.value = '';
        setHwFile(null);
        return;
      }
      setHwFile(file);
    }
  };

  const handleHwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentGroups[0]) {
      addToast({ type: 'error', message: "Siz hali hech qanday guruhda emassiz" });
      return;
    }
    if (hwMode === 'code' && !hwHtml && !hwJs && !hwCss) {
      addToast({ type: 'error', message: "Kodni kiriting!" });
      return;
    }
    if (hwMode === 'file' && !hwFile) {
      addToast({ type: 'error', message: "Fayl tanlang!" });
      return;
    }

    if (!hwAssignmentId) {
      addToast({ type: 'error', message: "Vazifani tanlang!" });
      return;
    }

    const teacherId = student.teacherId || 'tr1';
    
    // Find assignment to get title
    const assignment = assignments.find(a => a.id === hwAssignmentId);

    const payload: any = {
      studentId: student.id,
      assignmentId: hwAssignmentId,
      type: hwMode,
    };

    if (hwMode === 'code') {
      payload.code = JSON.stringify({ html: hwHtml, css: hwCss, js: hwJs });
      payload.language = 'web'; // or whatever language they submit
    } else {
      payload.fileUrl = URL.createObjectURL(hwFile!);
      payload.fileName = hwFile!.name;
    }

    submitHomework(payload);

    addToast({ type: 'success', message: "Vazifa muvaffaqiyatli yuborildi!" });
    setHwAssignmentId(''); setHwHtml(''); setHwCss(''); setHwJs(''); setHwFile(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] xl:max-w-[1650px] mx-auto">
      
      {/* ──────────────── HEADER CARD ──────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 p-8 sm:p-10 text-white shadow-2xl"
      >
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen">
          <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-violet-600/30 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative">
            <img src={student.photo} alt={student.fullName} className="h-24 w-24 rounded-2xl border border-zinc-700/50 object-cover shadow-xl" />
            <div className="absolute -bottom-2 -right-2 bg-violet-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-950">
              PRO
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-white mb-2">
              Xush kelibsiz, <span className="text-violet-400">{student.fullName.split(' ')[0]}</span>!
            </h1>
            <p className="text-zinc-400 text-sm font-medium flex items-center justify-center sm:justify-start gap-2">
              <BookOpen className="w-4 h-4" /> 
              {studentGroups.length > 0 ? studentGroups.map(g => g.name).join(', ') : 'Guruhga biriktirilmagan'}
            </p>
          </div>
          
          <div className="hidden lg:flex gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">O'rtacha Ball</p>
              <p className="font-heading font-black text-2xl text-violet-400">{avgGrade}%</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Davomat</p>
              <p className="font-heading font-black text-2xl text-emerald-400">{attendanceRate}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ──────────────── TABS ──────────────── */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full sm:w-fit mx-auto sm:mx-0">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <Target className="w-4 h-4" /> Statistika
        </button>
        <button 
          onClick={() => setActiveTab('homework')} 
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'homework' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <UploadCloud className="w-4 h-4" /> Vazifalar
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ──────────────── DASHBOARD TAB ──────────────── */}
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Balance Card */}
            <div className={`card overflow-hidden relative border ${student.balance < 0 ? 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20' : isLowBalance ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20' : 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'}`}>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-current opacity-5" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Joriy Balans</p>
                  <p className={`font-heading font-black text-4xl tracking-tight ${student.balance < 0 ? 'text-rose-600 dark:text-rose-400' : isLowBalance ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {fmtMoney(student.balance)}
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${student.balance < 0 ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-500' : isLowBalance ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-500' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500'}`}>
                  <CreditCard className="h-8 w-8" />
                </div>
              </div>
              
              <div className="mt-5 pt-5 border-t border-current/10 flex items-center gap-2 text-sm font-semibold">
                {student.balance < 0 ? (
                  <><AlertTriangle className="h-4 w-4 text-rose-500" /> <span className="text-rose-600 dark:text-rose-400">Qarz bor! Iltimos to'lov qiling.</span></>
                ) : isLowBalance ? (
                  <><AlertTriangle className="h-4 w-4 text-amber-500" /> <span className="text-amber-600 dark:text-amber-400">Balans kam! Keyingi darsga yetmaydi.</span></>
                ) : (
                  <><CheckCircle className="h-4 w-4 text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400">Balans joyida. To'lov talab etilmaydi.</span></>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Courses & Groups */}
              <div className="card space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-violet-500" /> Mening kurslarim
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {studentGroups.length === 0 ? (
                    <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm font-medium text-zinc-500">Hali guruhga qo'shilmagansiz</p>
                    </div>
                  ) : (
                    studentGroups.map((g) => {
                      const course = courses.find((c) => c.id === g.courseId);
                      return (
                        <div key={g.id} className="group flex flex-col p-4 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-violet-500/30 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{g.name}</p>
                              <p className="text-xs font-semibold text-zinc-500 mt-0.5">{course?.name}</p>
                            </div>
                            <Badge label="Aktiv" color="emerald" dot />
                          </div>
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider bg-white dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-400" /> {g.schedule.days.slice(0,2).join(',')}</div>
                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-400" /> {g.schedule.time}</div>
                            <div className="flex items-center gap-1.5 col-span-2"><CreditCard className="w-3.5 h-3.5 text-zinc-400" /> {fmtMoney(course?.monthlyPrice || 0)} / OY</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Attendance */}
              <div className="card space-y-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" /> Davomat statistikasi
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">Keldi</p>
                    <p className="font-heading font-black text-2xl text-emerald-700 dark:text-emerald-400">{presentCount}</p>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider mb-1">Kelmadi</p>
                    <p className="font-heading font-black text-2xl text-rose-700 dark:text-rose-400">{absentCount}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1">Foiz</p>
                    <p className="font-heading font-black text-2xl text-amber-700 dark:text-amber-400">{attendanceRate}%</p>
                  </div>
                </div>

                <div className="flex-1 min-h-[200px] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden mt-2">
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-zinc-900/30 divide-y divide-zinc-200 dark:divide-zinc-800">
                    {attendance.slice().reverse().slice(0, 10).map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-white dark:hover:bg-zinc-800/50 transition-colors">
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{r.date}</span>
                        <Badge 
                          label={r.status === 'present' ? 'Keldi' : r.status === 'absent' ? 'Kelmadi' : r.status === 'late' ? 'Kech qoldi' : 'Sababli'} 
                          color={r.status === 'present' ? 'emerald' : r.status === 'absent' ? 'rose' : 'amber'} 
                        />
                      </div>
                    ))}
                    {attendance.length === 0 && (
                      <div className="p-8 text-center text-sm text-zinc-500 font-medium">Davomat yozuvlari yo'q</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="card space-y-5">
              <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-violet-500" /> So'nggi to'lovlar
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                      <th className="px-4 py-3 font-bold">Sana</th>
                      <th className="px-4 py-3 font-bold">Summa</th>
                      <th className="px-4 py-3 font-bold">Turi</th>
                      <th className="px-4 py-3 font-bold">Izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {myPayments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">To'lovlar tarixi mavjud emas.</td>
                      </tr>
                    ) : (
                      myPayments.slice(0,5).map(p => (
                        <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-4 font-semibold text-zinc-700 dark:text-zinc-300">{p.date}</td>
                          <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400">+{fmtMoney(p.amount)}</td>
                          <td className="px-4 py-4"><Badge label={p.type} color="zinc" /></td>
                          <td className="px-4 py-4 text-zinc-500 text-xs">{p.note || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ──────────────── HOMEWORK TAB ──────────────── */}
        {activeTab === 'homework' && (
          <motion.div 
            key="homework"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Submit HW */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card space-y-5">
                <div className="flex items-center gap-3 border-b border-light-border dark:border-dark-border pb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">Yangi vazifa yuborish</h3>
                    <p className="text-xs font-medium text-zinc-500">Uyga vazifani kod yoki fayl ko'rinishida yuboring</p>
                  </div>
                </div>

                <form onSubmit={handleHwSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="hw-assignment-select" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Qaysi vazifa uchun?</label>
                    <select 
                      id="hw-assignment-select"
                      required 
                      value={hwAssignmentId} 
                      onChange={e => setHwAssignmentId(e.target.value)} 
                      className="input-field w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl" 
                    >
                      <option value="" disabled>Vazifani tanlang</option>
                      {availableAssignments.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                      {availableAssignments.length === 0 && (
                        <option value="" disabled>Hozircha faol vazifalar yo'q</option>
                      )}
                    </select>
                  </div>
                  
                  <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button 
                      type="button" 
                      onClick={() => setHwMode('code')} 
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${hwMode === 'code' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white border border-zinc-200/50 dark:border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      <Code className="w-4 h-4" /> Live Code
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setHwMode('file')} 
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${hwMode === 'file' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white border border-zinc-200/50 dark:border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      <FileCode className="w-4 h-4" /> Fayl orqali
                    </button>
                  </div>

                  {hwMode === 'file' ? (
                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:border-violet-500 transition-all cursor-pointer group relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50">
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="relative z-0 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Faylni shu yerga tashlang yoki tanlang</span>
                        <span className="text-xs font-medium text-zinc-500 max-w-[200px]">.zip, .pdf, .js, .html, .css formatlari qo'llab quvvatlanadi</span>
                        
                        {hwFile && (
                          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold w-full max-w-xs truncate">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span className="truncate">{hwFile.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white dark:bg-dark-card px-1.5 text-[10px] uppercase font-black tracking-wider text-emerald-500 z-10">HTML</label>
                        <textarea value={hwHtml} onChange={e => setHwHtml(e.target.value)} className="w-full bg-zinc-950 text-emerald-400 text-[13px] p-4 rounded-xl outline-none font-mono min-h-[100px] border border-zinc-800 focus:border-emerald-500/50 transition-colors custom-scrollbar placeholder:text-zinc-800" placeholder="<h1>Salom Dunyo</h1>" />
                      </div>
                      <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white dark:bg-dark-card px-1.5 text-[10px] uppercase font-black tracking-wider text-cyan-500 z-10">CSS</label>
                        <textarea value={hwCss} onChange={e => setHwCss(e.target.value)} className="w-full bg-zinc-950 text-cyan-400 text-[13px] p-4 rounded-xl outline-none font-mono min-h-[100px] border border-zinc-800 focus:border-cyan-500/50 transition-colors custom-scrollbar placeholder:text-zinc-800" placeholder="h1 { color: red; }" />
                      </div>
                      <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white dark:bg-dark-card px-1.5 text-[10px] uppercase font-black tracking-wider text-amber-500 z-10">JS</label>
                        <textarea value={hwJs} onChange={e => setHwJs(e.target.value)} className="w-full bg-zinc-950 text-amber-400 text-[13px] p-4 rounded-xl outline-none font-mono min-h-[100px] border border-zinc-800 focus:border-amber-500/50 transition-colors custom-scrollbar placeholder:text-zinc-800" placeholder="console.log('JS Ishladi');" />
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={!hwAssignmentId || (hwMode === 'code' ? (!hwHtml && !hwCss && !hwJs) : !hwFile)} className="btn-primary w-full py-3.5 shadow-lg shadow-violet-600/20 disabled:opacity-50">
                    <UploadCloud className="w-5 h-5" /> Vazifani Yuborish
                  </button>
                </form>
              </div>
            </div>

            {/* History */}
            <div className="lg:col-span-3 card flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-4 mb-4">
                <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> Yuborilgan vazifalar tarixi
                </h3>
                <Badge label={`${myHomeworks.length} ta vazifa`} color="zinc" />
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {myHomeworks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-4">
                      <FileCode className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-white mb-1">Hali vazifalar yuborilmadi</p>
                    <p className="text-sm font-medium text-zinc-500">Chap tarafdagi forma orqali birinchi vazifangizni yuklang</p>
                  </div>
                ) : (
                  myHomeworks.slice().reverse().map(hw => (
                    <div key={hw.id} className="p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/30 transition-colors relative overflow-hidden group">
                      
                      {hw.status === 'graded' && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 relative z-10">
                        <div>
                          <h4 className="font-heading font-bold text-base text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-1">{hw.title}</h4>
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(hw.submittedAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {hw.type === 'code' ? <Code className="w-3.5 h-3.5 text-indigo-500" /> : <FileCode className="w-3.5 h-3.5 text-indigo-500" />}
                              {hw.type === 'code' ? 'Live Code' : hw.originalFileName}
                            </span>
                          </div>
                        </div>
                        <Badge label={hw.status === 'graded' ? 'Baholangan' : 'Tekshirilmoqda'} color={hw.status === 'graded' ? 'emerald' : 'amber'} />
                      </div>

                      {hw.status === 'graded' && (
                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700/50 relative z-10">
                          <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Ustoz bahosi</p>
                                <p className="font-heading font-black text-xl text-emerald-600 dark:text-emerald-400">{hw.grade}%</p>
                              </div>
                              {hw.coinsAwarded ? (
                                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  <span className="font-bold text-sm text-amber-600 dark:text-amber-500">+{hw.coinsAwarded} Tanga</span>
                                </div>
                              ) : null}
                            </div>
                            
                            {hw.feedback && (
                              <div className="flex-1 min-w-[200px] bg-zinc-100 dark:bg-zinc-900/80 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Izoh</p>
                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 italic">"{hw.feedback}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
