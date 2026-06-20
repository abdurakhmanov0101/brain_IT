import React from 'react';
import { Users, DollarSign, Briefcase, TrendingUp, GraduationCap, CheckCircle2, Clock, ChevronRight, BookOpen, Award, AlertCircle, FileText, Play } from 'lucide-react';
import { courses, type User, type Project } from '../../data/mockData';

interface OverviewProps {
  currentUser: User;
  setActiveTab: (tab: string) => void;
  projectsList: Project[];
}

export const Overview: React.FC<OverviewProps> = ({ currentUser, setActiveTab, projectsList }) => {

  if (currentUser.role === 'Student') {
    const stats = [
      { name: 'Faol Kurslarim', value: '2 ta kurs', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
      { name: 'Tugatilgan Darslar', value: '3 ta dars', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
      { name: "O'rtacha Ball", value: '85 ball', icon: Award, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' },
      { name: 'Sertifikatlar', value: '0 ta tayyor', icon: Award, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30' },
    ];
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white shadow-xl">
          <div className="relative z-10 space-y-2">
            <span className="bg-indigo-500/30 border border-indigo-400/20 text-indigo-200 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Talaba Kabineti</span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">Salom, {currentUser.name}!</h1>
            <p className="text-sm text-indigo-100 max-w-xl">Bugungi o'quv rejangiz tayyor. Darslarni davom ettiring.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => <div key={i} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm"><div className={`p-3 rounded-xl ${s.color} inline-block`}><s.icon className="h-6 w-6" /></div><div className="mt-4"><p className="text-xs text-slate-400 uppercase tracking-wider">{s.name}</p><h3 className="font-heading font-extrabold text-lg text-slate-800 dark:text-white mt-1">{s.value}</h3></div></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4">Kurslarim Progressi</h3>
            <div className="space-y-4">
              {courses.map((c) => (
                <div key={c.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300"><span>{c.title}</span><span>{c.id === 'c1' ? '75%' : '0%'}</span></div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full"><div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full" style={{ width: c.id === 'c1' ? '75%' : '0%' }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Tavsiya etiladi</span>
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-white">Klasslar va Obyektlar (OOP)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Python OOP tamoyillarini o'rganing va amaliy vazifani AI orqali tekshirish uchun topshiring.</p>
            </div>
            <button onClick={() => setActiveTab('academy')} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5">
              <Play className="h-4 w-4 fill-white" /> Darsni Boshlash
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'Teacher') {
    const stats = [
      { name: 'Guruhlarim', value: '3 ta faol', icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
      { name: "Jami O'quvchilarim", value: '48 ta', icon: Users, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
      { name: 'Kutilayotgan Vazifalar', value: '5 ta topshiriq', icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' },
      { name: "O'rtacha O'zlashtirish", value: '78%', icon: TrendingUp, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30' },
    ];
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-800 p-8 text-white shadow-xl">
          <div className="relative z-10 space-y-2">
            <span className="bg-emerald-500/30 border border-emerald-400/20 text-emerald-200 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Ustoz Boshqaruv Paneli</span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">Assalomu alaykum, {currentUser.name}!</h1>
            <p className="text-sm text-emerald-100 max-w-xl">Bugungi guruhlar faoliyati barqaror. Talabalarning uy vazifalarini tekshirishingiz mumkin.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => <div key={i} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm"><div className={`p-3 rounded-xl ${s.color} inline-block`}><s.icon className="h-6 w-6" /></div><div className="mt-4"><p className="text-xs text-slate-400 uppercase tracking-wider">{s.name}</p><h3 className="font-heading font-extrabold text-lg text-slate-800 dark:text-white mt-1">{s.value}</h3></div></div>)}
        </div>
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm">
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-4">Tekshirilishi kutilayotgan uy vazifalari</h3>
          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {[{ name: 'Davron Rustamov', course: 'Python Full Stack | OOP Vorislik' }, { name: 'Jahongir Olimov', course: 'React.js TypeScript | State & Interface' }].map((hw) => (
              <div key={hw.name} className="py-3 flex justify-between items-center text-xs">
                <div><p className="font-bold text-slate-700 dark:text-slate-200">{hw.name}</p><p className="text-[10px] text-slate-400">{hw.course}</p></div>
                <button onClick={() => setActiveTab('academy')} className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg">Ko'rish va Baholash</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'Developer' || currentUser.role === 'Project Manager') {
    const stats = [
      { name: 'Mening Tasklarim', value: '4 ta task', icon: Briefcase, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
      { name: 'Log Qilingan Vaqt', value: '32 soat', icon: Clock, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
      { name: 'Loyihalarim', value: '2 ta faol', icon: FileText, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30' },
      { name: 'Tugatilgan Tasklar', value: '12 ta done', icon: CheckCircle2, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30' },
    ];
    const allTasks = projectsList.flatMap((p) => p.tasks);
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-indigo-950 p-8 text-white shadow-xl">
          <div className="relative z-10 space-y-2">
            <span className="bg-indigo-500/20 border border-indigo-400/15 text-indigo-300 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Dasturchi Ish Paneli</span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">Salom, {currentUser.name}!</h1>
            <p className="text-sm text-slate-300 max-w-xl">Joriy sprint vazifalaringiz va ishlangan vaqt o'lchovlari.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => <div key={i} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm"><div className={`p-3 rounded-xl ${s.color} inline-block`}><s.icon className="h-6 w-6" /></div><div className="mt-4"><p className="text-xs text-slate-400 uppercase tracking-wider">{s.name}</p><h3 className="font-heading font-extrabold text-lg text-slate-800 dark:text-white mt-1">{s.value}</h3></div></div>)}
        </div>
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white">Mening Vazifalarim</h3>
            <button onClick={() => setActiveTab('pm')} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Kanban Boardga o'tish</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {allTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="py-3 flex justify-between items-center text-xs">
                <div><p className="font-bold text-slate-700 dark:text-slate-200">{task.title}</p><p className="text-[10px] text-slate-400">Est. {task.estimatedHours}h | {task.status.toUpperCase()}</p></div>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${task.priority === 'high' || task.priority === 'critical' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Management / Super Admin / Company Director
  const stats = [
    { id: 1, name: 'Faol Talabalar', value: '1,248 ta', change: '+12.5%', icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
    { id: 2, name: 'Aylik Daromad', value: '142,500,000 UZS', change: '+8.2%', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
    { id: 3, name: 'Joriy Loyihalar', value: `${projectsList.length} ta faol`, change: '2 ta yakunlandi', icon: Briefcase, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30' },
    { id: 4, name: 'Bitiruvchi / Sertifikat', value: '412 ta', change: '+18%', icon: CheckCircle2, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30' },
  ];
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <span className="bg-indigo-500/30 border border-indigo-400/20 text-indigo-200 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Kompaniya Monitori</span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">Xayrli kun, {currentUser.name}!</h1>
          <p className="text-sm text-indigo-100 max-w-xl">IT-Akademiya va Dasturiy ta'minot kompaniyasidagi barcha jarayonlar barqaror.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.id} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${s.color} transition-transform group-hover:scale-105`}><s.icon className="h-6 w-6" /></div>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-1"><TrendingUp className="h-3 w-3" />{s.change}</span>
            </div>
            <div className="mt-4"><p className="text-xs text-slate-400 uppercase tracking-wider">{s.name}</p><h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-800 dark:text-white mt-1 leading-tight">{s.value}</h3></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400"><GraduationCap className="h-5 w-5" /></div><h3 className="font-heading font-bold text-base text-slate-800 dark:text-white">IT Academy Kurslari</h3></div>
            <button onClick={() => setActiveTab('academy')} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">Classroomga o'tish <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="p-6 divide-y divide-slate-100 dark:divide-dark-border">
            {courses.map((c) => (
              <div key={c.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0"><h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{c.title}</h4><p className="text-xs text-slate-400 mt-1">{c.category} | {c.duration}</p></div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full shrink-0">{c.level}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400"><Briefcase className="h-5 w-5" /></div><h3 className="font-heading font-bold text-base text-slate-800 dark:text-white">Software Dev Loyihalar</h3></div>
            <button onClick={() => setActiveTab('pm')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5">PM Boardga o'tish <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="p-6 divide-y divide-slate-100 dark:divide-dark-border">
            {projectsList.map((p) => (
              <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0"><h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{p.name}</h4><p className="text-xs text-slate-400">Mijoz: {p.client}</p></div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.status === 'in_progress' ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{p.status === 'in_progress' ? 'ishlamoqda' : 'rejalashtirilgan'}</span>
                </div>
                <div><div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1"><span>Progress</span><span>{p.progress}%</span></div><div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress}%` }} /></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
