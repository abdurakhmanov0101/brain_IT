import React, { useState } from 'react';
import { Users, Plus, UserPlus, UserMinus, Clock, BookOpen, Search } from 'lucide-react';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useStudentStore } from '../../stores/studentStore';
import { useUIStore } from '../../stores/uiStore';
import { StatCard } from '../../components/StatCard';
import { Badge, statusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { AddGroupModal } from './AddGroupModal';

export const Groups: React.FC = () => {
  const { groups, addStudentToGroup, removeStudentFromGroup } = useGroupStore();
  const { courses } = useCourseStore();
  const { teachers } = useTeacherStore();
  const { students } = useStudentStore();
  const { addToast } = useUIStore();
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [addStudentId, setAddStudentId] = useState('');
  const [search, setSearch] = useState('');

  const getCourse = (id: string) => courses.find((c) => c.id === id);
  const getTeacher = (id: string) => teachers.find((t) => t.id === id);
  const getStudent = (id: string) => students.find((s) => s.id === id);

  const detailGroup = groups.find((g) => g.id === detailId);
  const groupStudents = detailGroup ? detailGroup.studentIds.map(getStudent).filter(Boolean) : [];
  const notInGroup = students.filter((s) => !detailGroup?.studentIds.includes(s.id) && s.status === 'active');

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddStudent = () => {
    if (!addStudentId || !detailId) return;
    addStudentToGroup(detailId, addStudentId);
    addToast({ type: 'success', message: `O'quvchi guruhga qo'shildi` });
    setAddStudentId('');
  };

  const handleRemoveStudent = (sid: string) => {
    if (!detailId) return;
    removeStudentFromGroup(detailId, sid);
    addToast({ type: 'warning', message: `O'quvchi guruhdan chiqarildi` });
  };

  const activeCount = groups.filter((g) => g.status === 'active').length;
  const totalStudents = groups.reduce((sum, g) => sum + g.studentIds.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Guruhlar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">O'quv guruhlari boshqaruvi</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Plus className="h-4 w-4" /> Yangi guruh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami guruhlar" value={groups.length} icon={Users} />
        <StatCard title="Aktiv guruhlar" value={activeCount} icon={Users} iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Jami o'quvchilar" value={totalStudents} icon={Users} iconColor="text-indigo-600 dark:text-indigo-400" />
        <StatCard title="Kurslar soni" value={courses.length} icon={BookOpen} iconColor="text-purple-600 dark:text-purple-400" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Guruh nomini qidiring..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((group) => {
          const course = getCourse(group.courseId);
          const teacher = getTeacher(group.teacherId);
          const fill = Math.round((group.studentIds.length / group.maxStudents) * 100);
          return (
            <div key={group.id} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setDetailId(group.id)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{group.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{course?.name ?? group.courseId}</p>
                </div>
                {statusBadge(group.status)}
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>{group.studentIds.length}/{group.maxStudents} o'quvchi</span>
                  <span className="ml-auto text-xs font-medium text-slate-400">{fill}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${fill >= 90 ? 'bg-red-500' : fill >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${fill}%` }} />
                </div>
                {teacher && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <img src={teacher.photo} alt={teacher.fullName} className="h-5 w-5 rounded-full object-cover" />
                    <span className="text-xs">{teacher.fullName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="text-xs">{group.schedule.days.map((d) => d.slice(0, 3)).join(', ')} — {group.schedule.time}</span>
                </div>
                {group.room && <Badge label={group.room} color="slate" />}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Guruhlar topilmadi</p>
          </div>
        )}
      </div>

      <AddGroupModal open={addOpen} onClose={() => setAddOpen(false)} />

      <Modal open={!!detailId} onClose={() => { setDetailId(null); setAddStudentId(''); }} title={detailGroup?.name ?? 'Guruh'} size="lg">
        {detailGroup && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Kurs', getCourse(detailGroup.courseId)?.name], ['Ustoz', getTeacher(detailGroup.teacherId)?.fullName], ['Xona', detailGroup.room || '—'], ['Vaqt', `${detailGroup.schedule.days.map((d) => d.slice(0, 3)).join(', ')} ${detailGroup.schedule.time}`]].map(([label, val]) => (
                <div key={label as string}>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{label as string}</p>
                  <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{val as string}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">O'quvchilar ({detailGroup.studentIds.length}/{detailGroup.maxStudents})</h4>
              </div>
              <div className="space-y-2">
                {groupStudents.map((s) => s && (
                  <div key={s.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl px-3 py-2.5">
                    <img src={s.photo} alt={s.fullName} className="h-8 w-8 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.fullName}</p>
                      <p className="text-xs text-slate-400">{s.phone}</p>
                    </div>
                    {statusBadge(s.status)}
                    <button onClick={() => handleRemoveStudent(s.id)} className="ml-1 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {detailGroup.studentIds.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Hali o'quvchi yo'q</p>}
              </div>
            </div>

            {detailGroup.studentIds.length < detailGroup.maxStudents && (
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-2">O'quvchi qo'shish</h4>
                <div className="flex gap-2">
                  <select value={addStudentId} onChange={(e) => setAddStudentId(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">O'quvchi tanlang...</option>
                    {notInGroup.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                  </select>
                  <button onClick={handleAddStudent} disabled={!addStudentId} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4" /> Qo'shish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
