import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, FileCode, UploadCloud, Code, Play, ChevronRight, Zap, Target, TrendingUp, QrCode, Camera, Scan, FileText, ExternalLink } from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useHomeworkStore } from '../../stores/homeworkStore';
import { useUIStore } from '../../stores/uiStore';
import { Badge } from '../../components/Badge';
import { useCertificateStore } from '../../stores/certificateStore';

import { SubmissionForm, type SubmissionData } from '../../components/SubmissionForm';
import { QuickFaceIDModal } from '../../components/common/QuickFaceIDModal';

const fmtMoney = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

interface Props { studentId?: string; }

export const StudentPortal: React.FC<Props> = ({ studentId }) => {
  const { students, payments } = useStudentStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { getByStudent, markAttendance } = useAttendanceStore();
  const { submissions, submitHomework, assignments } = useHomeworkStore();
  const { addToast } = useUIStore();
  const { getCertificatesByStudent } = useCertificateStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'homework' | 'qr' | 'certificates'>('dashboard');
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [qrGroupId, setQrGroupId] = useState('');
  const [scanning, setScanning] = useState(false);
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

  const handleNewSubmission = (data: SubmissionData) => {
    if (!studentGroups[0]) {
      addToast({ type: 'error', message: "Siz hali hech qanday guruhda emassiz" });
      return;
    }
    if (!hwAssignmentId) {
      addToast({ type: 'error', message: "Vazifani tanlang!" });
      return;
    }

    const payload: any = {
      studentId: student.id,
      assignmentId: hwAssignmentId,
      type: data.type,
      code: data.code,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
    };

    submitHomework(payload);
    addToast({ type: 'success', message: "Vazifa muvaffaqiyatli yuborildi!" });
    setHwAssignmentId('');
  };

  return (
    <div className="space-y-6 max-w-[1600px] xl:max-w-[1650px] mx-auto">
      
      {/* ──────────────── PREMIUM VIBRANT HEADER CARD ──────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-600 p-8 sm:p-10 text-white shadow-2xl shadow-teal-500/20"
      >
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none mix-blend-overlay">
          <div className="absolute -top-[40%] right-[0%] w-[70%] h-[140%] bg-cyan-400/50 blur-[120px] rounded-full" />
          <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[100%] bg-yellow-400/40 blur-[100px] rounded-full" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
          <div className="relative group">
            <div className="absolute -inset-1 bg-white/30 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <img src={student.photo} alt={student.fullName} className="relative h-28 w-28 rounded-2xl border-2 border-white/20 object-cover shadow-2xl" />
            <div className="absolute -bottom-3 -right-3 bg-white text-teal-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-teal-100 shadow-lg shadow-black/10">
              PRO
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white mb-3 drop-shadow-md">
              Xush kelibsiz, <span className="text-white drop-shadow-lg">{student.fullName.split(' ')[0]}</span>!
            </h1>
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-white drop-shadow-sm text-sm font-medium shadow-inner">
              <BookOpen className="w-4 h-4 text-white" /> 
              {studentGroups.length > 0 ? studentGroups.map(g => g.name).join(', ') : 'Guruhga biriktirilmagan'}
            </div>
          </div>
          
          <div className="hidden lg:flex gap-4">
            <div className="bg-white/20 border border-white/30 rounded-2xl px-6 py-5 text-center backdrop-blur-xl shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] font-black text-white/90 uppercase tracking-widest mb-2 relative z-10 drop-shadow-sm">O'rtacha Ball</p>
              <p className="font-heading font-black text-3xl text-white relative z-10 drop-shadow-md">{avgGrade}<span className="text-lg text-white/70">%</span></p>
            </div>
            <div className="bg-white/20 border border-white/30 rounded-2xl px-6 py-5 text-center backdrop-blur-xl shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] font-black text-white/90 uppercase tracking-widest mb-2 relative z-10 drop-shadow-sm">Davomat</p>
              <p className="font-heading font-black text-3xl text-white relative z-10 drop-shadow-md">{attendanceRate}<span className="text-lg text-white/70">%</span></p>
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
        <button 
          onClick={() => setActiveTab('qr')} 
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'qr' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <QrCode className="w-4 h-4 text-emerald-500" /> QR & Face ID Davomat
        </button>
        <button 
          onClick={() => setActiveTab('certificates')} 
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'certificates' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <FileText className="w-4 h-4" /> Sertifikatlar
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
                    <BookOpen className="h-5 w-5 text-teal-500" /> Mening kurslarim
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
                        <div key={g.id} className="group flex flex-col p-4 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-teal-500/30 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{g.name}</p>
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
                <CreditCard className="h-5 w-5 text-teal-500" /> So'nggi to'lovlar
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
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">Yangi vazifa yuborish</h3>
                    <p className="text-xs font-medium text-zinc-500">Uyga vazifani kod yoki fayl ko'rinishida yuboring</p>
                  </div>
                </div>

                <div className="space-y-5">
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
                  
                  {hwAssignmentId ? (
                    <SubmissionForm onSubmit={handleNewSubmission} />
                  ) : (
                    <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm">
                      Avval yuqoridan vazifani tanlang
                    </div>
                  )}
                </div>
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
                    <div key={hw.id} className="p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/30 transition-colors relative overflow-hidden group">
                      
                      {hw.status === 'graded' && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 relative z-10">
                        <div>
                          <h4 className="font-heading font-bold text-base text-zinc-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-1">{hw.title}</h4>
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(hw.submittedAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {hw.type === 'code' ? <Code className="w-3.5 h-3.5 text-emerald-500" /> : <FileCode className="w-3.5 h-3.5 text-emerald-500" />}
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

        {/* ──────────────── QR DAVOMAT TAB ──────────────── */}
        {activeTab === 'qr' && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card max-w-xl mx-auto p-6 sm:p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
                <QrCode className="w-10 h-10" />
              </div>
              <h2 className="font-heading font-black text-2xl text-zinc-900 dark:text-white">QR Kod va Face ID orqali davomat</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Face ID kamerasida yuzingizni skanerlab yoki QR kod orqali bugungi darsga hozir ekanligingizni tasdiqlang.
              </p>
            </div>

            {/* Face ID Quick Action Box */}
            <div className="bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-brand-500/10 border-2 border-emerald-500/30 rounded-2xl p-5 text-center space-y-3 shadow-sm">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Scan className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="font-heading font-black text-lg text-zinc-900 dark:text-white">Face ID & GPS Lokatsiya orqali Davomat</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                O'z qurilmangiz kamerasidan yuzni skanerlab va GPS lokatsiyani tasdiqlab, bir soniyada davomatdan o'ting!
              </p>
              <button
                type="button"
                onClick={() => setFaceModalOpen(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Scan className="w-5 h-5" /> Face ID & GPS Skanerini Ochish
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Guruhni tanlang</label>
                <select
                  value={qrGroupId}
                  onChange={(e) => setQrGroupId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Guruh tanlang --</option>
                  {studentGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.room})
                    </option>
                  ))}
                </select>
              </div>

              {/* Simulated Camera Box */}
              <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-800 flex flex-col items-center justify-center">
                <div className="absolute inset-4 border-2 border-emerald-500/50 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-pulse" />
                </div>
                <Camera className="w-12 h-12 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-400 font-medium">Kamera tayyor — QR kodni markazlashtiring</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetGId = qrGroupId || studentGroups[0]?.id;
                  if (!targetGId) {
                    addToast({ type: 'error', message: "Siz hech qaysi guruhga a'zo emassiz!" });
                    return;
                  }
                  const todayStr = new Date().toISOString().split('T')[0];
                  const alreadyMarked = getByStudent(student.id).some(r => r.groupId === targetGId && r.date === todayStr);
                  if (alreadyMarked) {
                    addToast({ type: 'warning', message: "⏳ Siz bugun ushbu guruh uchun allaqachon davomatdan o'tgansiz!" });
                    return;
                  }
                  markAttendance({
                    studentId: student.id,
                    groupId: targetGId,
                    date: todayStr,
                    status: 'present',
                    checkedBy: 'qr',
                    deductionApplied: true
                  });
                  addToast({ type: 'success', message: "✅ QR Davomat muvaffaqiyatli belgilandi! Bugungi darsga hozir bo'ldingiz." });
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scan className="w-5 h-5" /> QR Kodni skanerlash va Davomat belgilash
              </button>
            </div>
          </motion.div>
        )}

        {/* ──────────────── CERTIFICATES TAB ──────────────── */}
        {activeTab === 'certificates' && (
          <motion.div 
            key="certificates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-brand-500" /> Mening Sertifikatlarim
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCertificatesByStudent(student.id).length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium">Hozircha sertifikatlar mavjud emas</p>
                  </div>
                ) : (
                  getCertificatesByStudent(student.id).map((cert) => {
                    const course = courses.find((c) => c.id === cert.courseId);
                    return (
                      <div key={cert.id} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 w-full h-1 bg-brand-500"></div>
                        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-500/20 text-brand-600 rounded-full flex items-center justify-center mb-4 mt-2">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-1">{course?.name || course?.title || 'Kurs'}</h4>
                        <p className="text-sm text-zinc-500 mb-4">{new Date(cert.issueDate).toLocaleDateString('uz-UZ')}</p>
                        <p className="text-xs font-mono text-zinc-400 mb-6 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-full">
                          {cert.certificateNumber}
                        </p>
                        <button
                          onClick={() => window.open(`/verify-certificate/${cert.id}`, '_blank')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 rounded-xl transition-colors font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ko'rish
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <QuickFaceIDModal open={faceModalOpen} onClose={() => setFaceModalOpen(false)} targetStudentId={student.id} />
    </div>
  );
};
