import React, { useState } from 'react';
import { Users, Plus, Search, Phone, Mail, Edit2, Trash2, BookOpen, UsersRound, ChevronDown } from 'lucide-react';
import { useTeacherStore, type Teacher } from '../../stores/teacherStore';
import { useStudentStore } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useUIStore } from '../../stores/uiStore';
import { Badge, statusBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';

type FormState = Omit<Teacher, 'id'>;

const SPECIALIZATIONS = ['Frontend', 'Backend', 'AI/ML', 'Cybersecurity', 'Foundation', 'English', 'IT Kids', 'Computer Literacy', 'Roboto', 'Math'];

const emptyForm: FormState = {
  fullName: '', phone: '', email: '', photo: '',
  courseIds: [], groupIds: [], hiredDate: new Date().toISOString().split('T')[0],
  status: 'active', specialization: 'Frontend',
};

const AVATAR_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop',
];

export const Teachers: React.FC = () => {
  const { teachers, addTeacher, updateTeacher } = useTeacherStore();
  const { students } = useStudentStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { addToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'vacation' | 'fired'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = teachers.filter((t) => {
    const matchSearch = t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) || t.specialization.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStudentCount = (teacherId: string) => students.filter((s) => s.teacherId === teacherId).length;
  const getGroupCount   = (teacherId: string) => groups.filter((g) => g.teacherId === teacherId).length;
  const getTeacherGroups = (t: Teacher) => groups.filter((g) => g.teacherId === t.id);
  const getTeacherStudents = (t: Teacher) => students.filter((s) => s.teacherId === t.id);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setAddOpen(true); };
  const openEdit = (t: Teacher) => {
    const { id: _id, ...rest } = t;
    setForm(rest);
    setEditId(t.id);
    setAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) { addToast({ type: 'error', message: "Ism va telefon kiritilishi shart" }); return; }
    const photo = form.photo || AVATAR_PLACEHOLDERS[Math.floor(Math.random() * AVATAR_PLACEHOLDERS.length)];
    if (editId) {
      updateTeacher(editId, { ...form, photo });
      addToast({ type: 'success', message: `${form.fullName} ma'lumotlari yangilandi` });
    } else {
      addTeacher({ ...form, photo });
      addToast({ type: 'success', message: `${form.fullName} o'qituvchilar ro'yxatiga qo'shildi` });
    }
    setAddOpen(false);
  };

  const detailTeacher = teachers.find((t) => t.id === detailId);
  const activeCount   = teachers.filter((t) => t.status === 'active').length;
  const totalStudents = teachers.reduce((sum, t) => sum + getStudentCount(t.id), 0);
  const totalGroups   = groups.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">O'qituvchilar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">O'qituvchilarni boshqarish</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20">
          <Plus className="h-4 w-4" /> Yangi o'qituvchi
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami o'qituvchilar" value={teachers.length} icon={Users} />
        <StatCard title="Aktiv" value={activeCount} icon={Users} iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Jami guruhlar" value={totalGroups} icon={UsersRound} iconColor="text-indigo-600 dark:text-indigo-400" />
        <StatCard title="Jami o'quvchilar" value={totalStudents} icon={BookOpen} iconColor="text-purple-600 dark:text-purple-400" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism, telefon yoki mutaxassislik..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {(['all', 'active', 'vacation', 'fired'] as const).map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${statusFilter === f ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-indigo-300'}`}>
            {f === 'all' ? 'Barchasi' : f === 'active' ? 'Aktiv' : f === 'vacation' ? 'Ta\'til' : 'Ishdan ketgan'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((teacher) => {
          const stuCount   = getStudentCount(teacher.id);
          const groupCount = getGroupCount(teacher.id);
          const teacherCourses = courses.filter((c) => teacher.courseIds.includes(c.id));
          return (
            <div key={teacher.id}
              className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img src={teacher.photo} alt={teacher.fullName}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-700" />
                  <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-dark-card ${teacher.status === 'active' ? 'bg-emerald-500' : teacher.status === 'vacation' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{teacher.fullName}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{teacher.specialization}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(teacher)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => updateTeacher(teacher.id, { status: teacher.status === 'active' ? 'fired' : 'active' })}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Phone className="h-3 w-3 shrink-0" />{teacher.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Mail className="h-3 w-3 shrink-0" />{teacher.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Guruh', value: groupCount, color: 'text-indigo-600 dark:text-indigo-400' },
                  { label: "O'quvchi", value: stuCount, color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Kurs', value: teacherCourses.length, color: 'text-purple-600 dark:text-purple-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl py-2">
                    <p className={`text-lg font-black ${color}`}>{value}</p>
                    <p className="text-[10px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                {statusBadge(teacher.status === 'active' ? 'active' : teacher.status === 'vacation' ? 'frozen' : 'left')}
                <button onClick={() => setDetailId(teacher.id)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Batafsil →
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">O'qituvchi topilmadi</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={editId ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { label: "To'liq ism *", key: 'fullName', placeholder: 'Bobur Akbarov' },
              { label: 'Telefon *', key: 'phone', placeholder: '+998901112233' },
              { label: 'Email', key: 'email', placeholder: 'ustoz@brainit.uz' },
              { label: 'Foto URL', key: 'photo', placeholder: 'https://...' },
            ] as const).map(({ label, key, placeholder }) => (
              <div key={key} className={key === 'fullName' || key === 'email' ? 'sm:col-span-1' : ''}>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
                <input value={(form as Record<string, unknown>)[key] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Mutaxassislik</label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 pr-8 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Holat</label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Teacher['status'] }))}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 pr-8 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="active">Aktiv</option>
                  <option value="vacation">Ta'tilda</option>
                  <option value="fired">Ishdan ketgan</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Ishga qabul sanasi</label>
              <input type="date" value={form.hiredDate} onChange={(e) => setForm((f) => ({ ...f, hiredDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {form.photo && (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3">
              <img src={form.photo} alt="preview" className="h-12 w-12 rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDERS[0]; }} />
              <p className="text-xs text-slate-500">Foto ko'rinishi</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              Bekor
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">
              {editId ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailId} onClose={() => setDetailId(null)} title={detailTeacher?.fullName ?? ''} size="md">
        {detailTeacher && (() => {
          const tGroups   = getTeacherGroups(detailTeacher);
          const tStudents = getTeacherStudents(detailTeacher);
          const tCourses  = courses.filter((c) => detailTeacher.courseIds.includes(c.id));
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <img src={detailTeacher.photo} alt={detailTeacher.fullName}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-lg">{detailTeacher.fullName}</p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{detailTeacher.specialization}</p>
                  <div className="mt-1">{statusBadge(detailTeacher.status === 'active' ? 'active' : detailTeacher.status === 'vacation' ? 'frozen' : 'left')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Telefon</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{detailTeacher.phone}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-xs truncate">{detailTeacher.email}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Ishga kirgan</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{detailTeacher.hiredDate}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Jami o'quvchi</p>
                  <p className="font-black text-indigo-600 dark:text-indigo-400 text-xl">{tStudents.length}</p>
                </div>
              </div>

              {tCourses.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kurslari</p>
                  <div className="flex flex-wrap gap-2">
                    {tCourses.map((c) => <Badge key={c.id} label={c.name} color="indigo" />)}
                  </div>
                </div>
              )}

              {tGroups.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Guruhlari</p>
                  <div className="space-y-1.5">
                    {tGroups.map((g) => (
                      <div key={g.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 rounded-xl px-3 py-2">
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{g.name}</span>
                        <span className="text-xs text-slate-400">{g.studentIds.length} o'quvchi</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tStudents.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Biriktirilgan o'quvchilar</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {tStudents.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl px-3 py-2">
                        <img src={s.photo} alt={s.fullName} className="h-7 w-7 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{s.fullName}</p>
                        </div>
                        <span className={`text-xs font-semibold ${s.balance < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {s.balance.toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { openEdit(detailTeacher); setDetailId(null); }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">
                Tahrirlash
              </button>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
