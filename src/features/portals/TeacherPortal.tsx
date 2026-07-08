import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../../stores/teacherStore';
import { useStudentStore } from '../../stores/studentStore';
import { useCoinStore } from '../../stores/coinStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useHomeworkStore } from '../../stores/homeworkStore';
import { useCourseStore } from '../../stores/courseStore';
import { useGroupStore } from '../../stores/groupStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { Users, Video, Coins, Award, BookOpen, Code, FileCode, CheckCircle, TrendingUp, DollarSign, AlertCircle, CalendarCheck, Trash2, Download, Search, Check, Info } from 'lucide-react';
import { CodeEditor } from '../../components/CodeEditor';

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

export const TeacherPortal: React.FC = () => {
  const { teachers } = useTeacherStore();
  const { students, updateStudent } = useStudentStore();
  const { addTransaction } = useCoinStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const { assignments, submissions, gradeSubmission } = useHomeworkStore();
  const { courses } = useCourseStore();
  const { groups } = useGroupStore();
  const { records, markAttendance } = useAttendanceStore();

  const myProfile = teachers.find(t => t.id === currentUser?.id || t.username === currentUser?.name?.toLowerCase() || t.fullName === currentUser?.name);
  const myStudents = students.filter(s => myProfile?.groupIds.some(g => s.groupIds.includes(g)));
  const myHomeworks = assignments.filter(h => myProfile?.groupIds.includes(h.groupId));
  const myGroups = groups.filter(g => myProfile?.groupIds.includes(g.id));

  const [activeTab, setActiveTab] = useState<'students' | 'lms' | 'homework' | 'finance'>('students');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [grade, setGrade] = useState<number>(0);
  const [hwFeedback, setHwFeedback] = useState<string>('');
  const [lmsUrl, setLmsUrl] = useState('');
  const [selectedHw, setSelectedHw] = useState<string | null>(null);

  if (!myProfile) return <div className="p-8 text-center text-slate-500">Ustoz profili topilmadi.</div>;

  // Finance calculations
  let totalExpected = 0;
  let received = 0;
  let unpaidExpected = 0;

  myStudents.forEach(s => {
    const sGroups = groups.filter(g => s.groupIds.includes(g.id));
    const sCourse = courses.find(c => sGroups.some(g => g.courseId === c.id));
    if (sCourse) {
      const share = (sCourse.monthlyPrice * (myProfile.salaryPercentage || 35)) / 100;
      totalExpected += share;
      if (s.paymentStatus === 'paid') received += share;
      else unpaidExpected += share;
    }
  });

  const getHwCodeUrl = (content: string) => {
    if (!content) return '';
    try {
      const data = JSON.parse(content);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${data.css || ''}</style>
        </head>
        <body>
          ${data.html || ''}
          <script>${data.js || ''}<\/script>
        </body>
        </html>
      `;
      return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
    } catch {
      if (content.trim().startsWith('<')) {
        return 'data:text/html;charset=utf-8,' + encodeURIComponent(content);
      }
      return '';
    }
  };

  const handleGradeHw = (hwId: string) => {
    let coinsToGive = 0;
    if (grade >= 95) coinsToGive = 3;
    else if (grade >= 80) coinsToGive = 2;
    else if (grade >= 60) coinsToGive = 1;

    gradeSubmission(hwId, grade, hwFeedback, coinsToGive);

    const hw = submissions.find(h => h.id === hwId);
    if (hw && coinsToGive > 0) {
      const st = students.find(s => s.id === hw.studentId);
      if (st) {
        updateStudent(st.id, { coins: (st.coins || 0) + coinsToGive });
        addTransaction({
          fromId: 'system', fromName: 'Uyga Vazifa Tizimi',
          toId: st.id, toName: st.fullName,
          amount: coinsToGive, reason: `Vazifadan ${grade}% baho uchun`
        });
      }
    }
    
    addToast({ type: 'success', message: `Vazifa baholandi!` });
    setGrade(0);
    setHwFeedback('');
    setSelectedHw(null);
  };

  const handleGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || grade < 0 || grade > 100) return;

    let coinsToGive = 0;
    if (grade >= 95) coinsToGive = 3;
    else if (grade >= 80) coinsToGive = 2;
    else if (grade >= 60) coinsToGive = 1;

    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    // Give coins
    if (coinsToGive > 0) {
      updateStudent(student.id, { coins: (student.coins || 0) + coinsToGive });
      addTransaction({
        fromId: 'system',
        fromName: 'Baholash tizimi',
        toId: student.id,
        toName: student.fullName,
        amount: coinsToGive,
        reason: `${grade}% baho uchun rag'batlantirish!`,
      });
      addToast({ type: 'success', message: `${student.fullName}ga ${grade}% baho va ${coinsToGive} ta tanga berildi!` });
    } else {
      addToast({ type: 'info', message: `${student.fullName}ga ${grade}% baho qo'yildi (tanga berilmadi).` });
    }
    
    setGrade(0);
    setSelectedStudent(null);
  };

  const handleUploadLms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmsUrl) return;
    addToast({ type: 'success', message: "LMS Dars videosi yuklandi! O'quvchilar ko'rganda tanga olasiz." });
    setLmsUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="glass premium-inner-glow p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
        <div className="flex items-center gap-6">
          <img src={myProfile.photo} alt={myProfile.fullName} className="h-24 w-24 rounded-full object-cover shadow-xl border-4 border-emerald-500/20" />
          <div>
            <h1 className="font-heading font-black text-2xl text-slate-800 dark:text-white mb-1">{myProfile.fullName}</h1>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase">{myProfile.specialization} Ustozi</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="glass px-5 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Guruhlar</span>
            <span className="font-black text-xl text-slate-800 dark:text-white">{myProfile.groupIds.length}</span>
          </div>
          <div className="glass px-5 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">O'quvchilar</span>
            <span className="font-black text-xl text-slate-800 dark:text-white">{myStudents.length}</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 px-5 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500">Tanga Balansi</span>
            <span className="font-black text-xl text-amber-600 dark:text-amber-500 flex items-center gap-1"><Coins className="h-4 w-4" /> {myProfile.coins || 0}</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-500">Joriy Maosh</span>
            <span className="font-black text-xl text-emerald-600 dark:text-emerald-500 flex items-center gap-1"><DollarSign className="h-4 w-4" /> {received.toLocaleString()} so'm</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTab('students')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'students' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
          <Users className="h-4 w-4" /> O'quvchilar
        </button>

        <button onClick={() => setActiveTab('homework')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'homework' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
          <BookOpen className="h-4 w-4" /> Vazifalar & Kod tekshirish
        </button>
        <button onClick={() => setActiveTab('finance')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'finance' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
          <DollarSign className="h-4 w-4" /> Oylik Statistika
        </button>
        <button onClick={() => setActiveTab('lms')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'lms' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
          <Video className="h-4 w-4" /> Dars Yuklash
        </button>
      </div>

      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass premium-card rounded-3xl p-6">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Mening O'quvchilarim</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {myStudents.map(student => (
                <div key={student.id} onClick={() => setSelectedStudent(student.id)} className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${selectedStudent === student.id ? 'bg-emerald-500/10 border border-emerald-500/30' : 'glass hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <img src={student.photo || 'https://via.placeholder.com/40'} alt={student.fullName} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{student.fullName}</p>
                      <p className="text-[11px] text-slate-500">{student.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md"><Coins className="h-3 w-3" /> {student.coins || 0}</span>
                  </div>
                </div>
              ))}
              {myStudents.length === 0 && <p className="text-sm text-slate-500 text-center py-8">Hozircha o'quvchilar yo'q.</p>}
            </div>
          </div>
          
          <div className="glass premium-card rounded-3xl p-6">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Baholash & Tanga</h2>
            {selectedStudent ? (
              <form onSubmit={handleGrade} className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5">
                  <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">{students.find(s => s.id === selectedStudent)?.fullName}</p>
                  <p className="text-[11px] text-slate-500">Guruhdagi ishtiroki va vazifasi uchun baho (%)</p>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Baho (0-100%)</label>
                  <input type="number" min="0" max="100" required value={grade || ''} onChange={(e) => setGrade(Number(e.target.value))} className="w-full text-2xl font-black text-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-4 focus:outline-none focus:border-emerald-500 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="space-y-2 pt-2">
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${grade >= 95 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-50 dark:bg-white/5 border-transparent'}`}>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">95% - 100%</span>
                    <span className="text-xs font-black text-amber-500 flex items-center gap-1">+3 <Coins className="h-3 w-3" /></span>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${grade >= 80 && grade < 95 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-50 dark:bg-white/5 border-transparent'}`}>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">80% - 94%</span>
                    <span className="text-xs font-black text-amber-500 flex items-center gap-1">+2 <Coins className="h-3 w-3" /></span>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${grade >= 60 && grade < 80 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-50 dark:bg-white/5 border-transparent'}`}>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">60% - 79%</span>
                    <span className="text-xs font-black text-amber-500 flex items-center gap-1">+1 <Coins className="h-3 w-3" /></span>
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 mt-4">
                  Baholash va Tanga berish
                </button>
              </form>
            ) : (
              <div className="text-center py-12 px-4">
                <Award className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">Baholash uchun chap tomondan o'quvchini tanlang.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'lms' && (
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-8 max-w-2xl mx-auto text-center">
          <div className="h-16 w-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Video className="h-8 w-8 text-teal-500" />
          </div>
          <h2 className="font-heading font-black text-2xl text-slate-800 dark:text-white mb-2">LMS uchun Dars Videosini Yuklash</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Bugungi darsingizning videosini joylang. O'quvchilar ushbu videoni oxirigacha ko'rishganda, avtomatik tarzda sizning hisobingizdan 1 tanga olinib, ularga beriladi.
          </p>
          <form onSubmit={handleUploadLms} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Video URL (YouTube, Vimeo, mp4)</label>
              <input type="url" required placeholder="https://..." value={lmsUrl} onChange={(e) => setLmsUrl(e.target.value)} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500" />
            </div>
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/25">
              Videoni Yuklash
            </button>
          </form>
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-5 h-[600px] flex flex-col">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Topshirilgan vazifalar</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {myHomeworks.length === 0 ? <p className="text-sm text-slate-400 text-center py-10">Vazifalar yo'q</p> : null}
              {submissions.map(hw => {
                const st = students.find(s => s.id === hw.studentId);
                return (
                  <div key={hw.id} onClick={() => setSelectedHw(hw.id)} className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedHw === hw.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{st?.fullName || "Noma'lum"}</p>
                      {hw.status === 'graded' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{(hw as any).title || 'Vazifa'}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      {hw.type === 'code' ? <><Code className="w-3 h-3" /> LIVE CODE</> : <><FileCode className="w-3 h-3" /> FAYL</>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 flex flex-col h-[600px]">
            {selectedHw ? (() => {
              const hw = submissions.find(h => h.id === selectedHw);
              if (!hw) return null;
              return (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                        {hw.type === 'code' ? <Code className="text-emerald-500" /> : <FileCode className="text-emerald-500" />} {hw.title}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Yuborilgan sana: {new Date(hw.submittedAt).toLocaleString('uz-UZ')}</p>
                    </div>
                  </div>

                  {hw.type === 'code' ? (
                    hw.language && hw.language !== 'web' ? (
                      <div className="flex-1 rounded-2xl overflow-hidden relative mb-6">
                        <CodeEditor 
                          initialCode={hw.code || (hw as any).content || ''}
                          initialLanguage={hw.language || 'javascript'}
                          readOnly={true}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white relative mb-6">
                        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-amber-400"/><div className="w-3 h-3 rounded-full bg-emerald-400"/></div>
                          <span className="text-xs font-mono text-slate-500 ml-2">Live Preview (Web HTML/CSS/JS)</span>
                        </div>
                        <iframe src={getHwCodeUrl(hw.code || (hw as any).content || '')} className="w-full h-[calc(100%-40px)] border-none" title="Live Preview" />
                      </div>
                    )
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl mb-6 bg-slate-50 dark:bg-slate-800/20">
                      <FileCode className="w-16 h-16 text-emerald-300 mb-3" />
                      <p className="text-slate-600 dark:text-slate-300 font-bold">{hw.fileName || (hw as any).originalFileName || 'Yuklangan fayl'}</p>
                      <a href={hw.fileUrl || (hw as any).content || '#'} download={hw.fileName || (hw as any).originalFileName || 'fayl'} className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-lg">Faylni Yuklab Olish</a>
                    </div>
                  )}

                  {hw.status === 'pending' ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">Baholash</h3>
                      <div className="flex gap-4 items-end">
                        <div className="w-24">
                          <label className="text-xs font-bold text-slate-500 block mb-1">Baho (%)</label>
                          <input type="number" min="0" max="100" value={grade || ''} onChange={e => setGrade(Number(e.target.value))} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-center font-black focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 block mb-1">Fikr/Izoh</label>
                          <input type="text" value={hwFeedback} onChange={e => setHwFeedback(e.target.value)} placeholder="Zo'r ishlangan..." className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <button onClick={() => handleGradeHw(hw.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-colors h-[38px] shadow-lg shadow-emerald-600/30">Saqlash</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-lg">Baho: {hw.grade}%</span>
                        {hw.coinsAwarded ? <span className="bg-amber-500 text-white font-bold text-xs px-2 py-1 rounded-md">+{hw.coinsAwarded} Tanga</span> : null}
                      </div>
                      {hw.feedback && <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2 font-medium">Izoh: {hw.feedback}</p>}
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Code className="w-16 h-16 mb-4 opacity-20" />
                <p>Tekshirish uchun vazifani tanlang</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-dark-card border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500 transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <TrendingUp className="w-8 h-8 text-emerald-500 mb-4" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">To'laganlardan Tushgan (Haqiqiy)</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{received.toLocaleString()} so'm</p>
              <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Balansingizga qo'shilgan</p>
            </div>
            
            <div className="bg-white dark:bg-dark-card border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 relative overflow-hidden group hover:border-rose-500 transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
              <AlertCircle className="w-8 h-8 text-rose-500 mb-4" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Qarzdorlardan Kutilayotgan</p>
              <p className="text-3xl font-black text-rose-600">{unpaidExpected.toLocaleString()} so'm</p>
              <p className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">To'lansa balansingizga qo'shiladi</p>
            </div>

            <div className="bg-white dark:bg-dark-card border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500 transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <DollarSign className="w-8 h-8 text-emerald-500 mb-4" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Jami Kutilayotgan Oylik</p>
              <p className="text-3xl font-black text-emerald-600">{totalExpected.toLocaleString()} so'm</p>
              <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">100% to'lov bo'lgandagi holat</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* O'quvchilar ro'yxati */}
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">O'quvchilar To'lov Holati (Joriy Oy)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">O'quvchi</th>
                      <th className="px-4 py-3">Guruhlar</th>
                      <th className="px-4 py-3">To'lov holati</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Sizning Ulushingiz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myStudents.map(s => {
                      const sGroups = groups.filter(g => s.groupIds.includes(g.id));
                      const sCourse = courses.find(c => sGroups.some(g => g.courseId === c.id));
                      const share = sCourse ? (sCourse.monthlyPrice * (myProfile.salaryPercentage || 35)) / 100 : 0;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{s.fullName}</td>
                          <td className="px-4 py-3 text-slate-500">{sGroups.map(g => g.name).join(', ')}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {s.paymentStatus === 'paid' ? 'To\'lagan' : 'Qarzdor'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-emerald-600">{share.toLocaleString()} so'm</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Guruhlar bo'yicha daromad */}
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Guruhlar Bo'yicha Daromad va Oylik</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {myGroups.map(g => {
                  const groupCourse = courses.find(c => c.id === g.courseId);
                  const groupStudentsList = students.filter(s => s.groupIds.includes(g.id));
                  const paidCount = groupStudentsList.filter(s => s.paymentStatus === 'paid').length;
                  const price = groupCourse?.monthlyPrice || 0;
                  const percent = myProfile.salaryPercentage || 35;
                  
                  const totalGroupExpected = price * groupStudentsList.length * percent / 100;
                  const actualGroupEarned = price * paidCount * percent / 100;

                  return (
                    <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white">{g.name}</h4>
                          <p className="text-[10px] text-slate-500">{groupCourse?.name || 'Kurs'}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded">
                          {percent}% ulush
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400">O'quvchilar: </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{groupStudentsList.length} ta ({paidCount} ta to'lagan)</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Kurs narxi: </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{price.toLocaleString()} so'm</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Kutilayotgan: </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{totalGroupExpected.toLocaleString()} so'm</span>
                        </div>
                        <div>
                          <span className="text-emerald-500">Olingan: </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{actualGroupEarned.toLocaleString()} so'm</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
