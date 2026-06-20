import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useUIStore } from '../../stores/uiStore';

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

interface Props { open: boolean; onClose: () => void; }

export const AddGroupModal: React.FC<Props> = ({ open, onClose }) => {
  const { addGroup } = useGroupStore();
  const { courses } = useCourseStore();
  const { teachers } = useTeacherStore();
  const { addToast } = useUIStore();
  const [form, setForm] = useState({ name: '', courseId: '', teacherId: '', room: '', maxStudents: 12, time: '10:00', days: [] as string[], status: 'active' as const, startDate: '' });

  const setField = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const toggleDay = (day: string) => setForm((f) => ({ ...f, days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.courseId || !form.teacherId || form.days.length === 0) {
      addToast({ type: 'error', message: "Barcha maydonlarni to'ldiring" }); return;
    }
    addGroup({ ...form, schedule: { days: form.days, time: form.time } });
    addToast({ type: 'success', message: `"${form.name}" guruhi yaratildi` });
    setForm({ name: '', courseId: '', teacherId: '', room: '', maxStudents: 12, time: '10:00', days: [], status: 'active', startDate: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Yangi guruh yaratish" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Guruh nomi *</label>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Frontend G-2"
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Xona</label>
            <input value={form.room} onChange={(e) => setField('room', e.target.value)} placeholder="101-xona"
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kurs *</label>
            <select value={form.courseId} onChange={(e) => setField('courseId', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Kursni tanlang</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.monthlyPrice.toLocaleString()} so'm/oy</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Ustoz *</label>
            <select value={form.teacherId} onChange={(e) => setField('teacherId', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Ustoz tanlang</option>
              {teachers.filter((t) => t.status === 'active').map((t) => <option key={t.id} value={t.id}>{t.fullName} — {t.specialization}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Max o'quvchilar</label>
            <input type="number" value={form.maxStudents} onChange={(e) => setField('maxStudents', Number(e.target.value))} min={1} max={30}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dars vaqti</label>
            <input type="time" value={form.time} onChange={(e) => setField('time', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Boshlanish sanasi</label>
            <input type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Dars kunlari *</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.days.includes(day) ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Bekor</button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">Guruh yaratish</button>
        </div>
      </form>
    </Modal>
  );
};
