import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Clock, DollarSign, Users, ChevronDown, ChevronUp, Percent } from 'lucide-react';
import { useCourseStore, type AcademyCourse } from '../../stores/courseStore';
import { useGroupStore } from '../../stores/groupStore';
import { useUIStore } from '../../stores/uiStore';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useAuthStore } from '../../stores/authStore';
import { useTeacherStore } from '../../stores/teacherStore';

type FormState = Omit<AcademyCourse, 'id' | 'lessonPrice'>;

const CATEGORIES: AcademyCourse['category'][] = ['Frontend', 'Backend', 'AI', 'Roboto', 'Kids', 'English', 'Math', 'Foundation', 'Cybersecurity', 'ComputerLiteracy'];
const COLORS = ['emerald', 'blue', 'emerald', 'teal', 'red', 'pink', 'amber', 'slate', 'cyan', 'orange'];

const emptyForm: FormState = {
  name: '', category: 'Frontend', monthlyPrice: 4000000,
  teacherPercent: 30, durationMonths: 4, lessonsPerWeek: 3, syllabus: [], color: 'emerald',
};

export const Courses: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse } = useCourseStore();
  const { groups } = useGroupStore();
  const { addToast } = useUIStore();
  const { currentUser } = useAuthStore();
  const { teachers } = useTeacherStore();

  const isTeacher = currentUser?.role === 'Teacher';
  const isAdmin = ['Super Admin', 'Academy Director'].includes(currentUser?.role || '');

  const filteredCourses = courses.filter((c) => {
    if (!currentUser) return false;
    if (['Super Admin', 'Academy Director'].includes(currentUser.role)) return true;
    if (currentUser.role === 'Teacher') {
      const teacher = teachers.find(t => t.id === currentUser.id);
      return teacher?.courseIds.includes(c.id);
    }
    return true;
  });
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [syllabusText, setSyllabusText] = useState('');

  const getGroupCount = (id: string) => groups.filter((g) => g.courseId === id).length;
  const getStudentCount = (id: string) => groups.filter((g) => g.courseId === id).reduce((s, g) => s + g.studentIds.length, 0);
  const totalStudents = filteredCourses.reduce((sum, c) => sum + getStudentCount(c.id), 0);
  const previewLessonPrice = form.monthlyPrice > 0 && form.lessonsPerWeek > 0
    ? Math.round(form.monthlyPrice / (form.lessonsPerWeek * 4)) : 0;

  const openAdd = () => { setForm(emptyForm); setSyllabusText(''); setEditId(null); setAddOpen(true); };
  const openEdit = (c: AcademyCourse) => {
    const { id: _id, lessonPrice: _lp, ...rest } = c;
    setForm(rest);
    setSyllabusText(c.syllabus.join('\n'));
    setEditId(c.id);
    setAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.monthlyPrice <= 0) { addToast({ type: 'error', message: "Nom va narxni to'ldiring" }); return; }
    const syllabus = syllabusText.split('\n').map((s) => s.trim()).filter(Boolean);
    if (editId) {
      updateCourse(editId, { ...form, syllabus });
      addToast({ type: 'success', message: `"${form.name}" kursi yangilandi` });
    } else {
      addCourse({ ...form, syllabus });
      addToast({ type: 'success', message: `"${form.name}" kursi yaratildi` });
    }
    setAddOpen(false);
  };

  const handleDelete = (c: AcademyCourse) => {
    if (getGroupCount(c.id) > 0) { addToast({ type: 'error', message: "Bu kursga bog'liq guruhlar bor" }); return; }
    deleteCourse(c.id);
    addToast({ type: 'warning', message: `"${c.name}" kursi o'chirildi` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Kurslar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">O'quv kurslar boshqaruvi</p>
        </div>
        {!isTeacher && (
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
            <Plus className="h-4 w-4" /> Yangi kurs
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami kurslar"    value={filteredCourses.length}  icon={BookOpen} />
        <StatCard title="Jami o'quvchilar" value={totalStudents}   icon={Users}    iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Jami guruhlar"   value={groups.length}   icon={Users}    iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="O'rtacha narx"   value={filteredCourses.length > 0 ? `${Math.round(filteredCourses.reduce((s, c) => s + c.monthlyPrice, 0) / filteredCourses.length / 1000)}K` : '0'} icon={DollarSign} iconColor="text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="space-y-3">
        {filteredCourses.map((course) => {
          const groupCount = getGroupCount(course.id);
          const studentCount = getStudentCount(course.id);
          const isExpanded = expanded === course.id;
          return (
            <div key={course.id} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shrink-0">
                    <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">{course.name}</h3>
                      <Badge label={course.category} color="emerald" />
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.durationMonths} oy</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.lessonsPerWeek} dars/hafta</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{course.monthlyPrice.toLocaleString()} so'm/oy</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{course.lessonPrice.toLocaleString()} so'm/dars</span>
                      <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5" />{course.teacherPercent}% ustoz ulushi</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{groupCount} guruh · {studentCount} o'quvchi</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isTeacher && (
                      <>
                        <button onClick={() => openEdit(course)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(course)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                    <button onClick={() => setExpanded(isExpanded ? null : course.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {isExpanded && course.syllabus.length > 0 && (
                <div className="border-t border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-slate-800/20 px-5 py-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">O'quv dasturi</p>
                  <ol className="space-y-1.5">
                    {course.syllabus.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-xs font-bold text-emerald-400 shrink-0 mt-0.5">{i + 1}.</span>{item}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={editId ? 'Kursni tahrirlash' : 'Yangi kurs yaratish'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kurs nomi *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Frontend Development"
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kategoriya</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AcademyCourse['category'] }))}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Rang</label>
              <select value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {[{ label: 'Davomiylik (oy)', key: 'durationMonths', min: 1 }, { label: 'Dars/hafta', key: 'lessonsPerWeek', min: 1 }, { label: "Oylik narx (so'm)", key: 'monthlyPrice', min: 0 }, { label: "Ustoz ulushi (%)", key: 'teacherPercent', min: 0 }].map(({ label, key, min }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
                <input type="number" value={form[key as keyof FormState] as number} onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))} min={min}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
          </div>
          {previewLessonPrice > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-300">
              Dars narxi: <strong>{previewLessonPrice.toLocaleString()} so'm/dars</strong>
              {' · '}Jami kurs: <strong>{(form.monthlyPrice * form.durationMonths).toLocaleString()} so'm</strong>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">O'quv dasturi (har bir qator — bir mavzu)</label>
            <textarea value={syllabusText} onChange={(e) => setSyllabusText(e.target.value)} rows={6} placeholder={"HTML asoslari\nCSS flexbox\nJavaScript kirish\n..."}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono" />
            <p className="text-xs text-slate-400 mt-1">{syllabusText.split('\n').filter((s) => s.trim()).length} mavzu</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">{editId ? 'Saqlash' : 'Yaratish'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
