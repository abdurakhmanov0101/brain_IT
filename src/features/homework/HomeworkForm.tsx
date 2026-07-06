import React, { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, Users, Calendar, ChevronDown, GraduationCap } from 'lucide-react';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useAuthStore } from '../../stores/authStore';
import type { Assignment } from '../../stores/homeworkStore';

interface HomeworkFormProps {
  initialData?: Omit<Assignment, 'id' | 'completedBy'>;
  onCancel: () => void;
  onSubmit: (data: Omit<Assignment, 'id' | 'completedBy'>) => void;
}

export const HomeworkForm: React.FC<HomeworkFormProps> = ({ initialData, onCancel, onSubmit }) => {
  const { currentUser } = useAuthStore();
  const { groups: allGroups } = useGroupStore();
  const { courses } = useCourseStore();
  const { teachers } = useTeacherStore();

  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Academy Director';

  // Find the teacher record for the current logged-in user (Teacher role)
  const myTeacherRecord = useMemo(() => {
    if (isAdmin) return null;
    return teachers.find(
      (t) =>
        t.username === currentUser?.name?.toLowerCase() ||
        t.id === currentUser?.id ||
        // fallback: match by username field in teacher store
        t.username === (currentUser as any)?.username
    ) || teachers.find((t) => t.groupIds.length > 0); // demo fallback to first teacher with groups
  }, [teachers, currentUser, isAdmin]);

  // For teachers: only their groups. For admins: all groups
  const availableGroups = useMemo(() => {
    if (isAdmin) return allGroups;
    if (!myTeacherRecord) return [];
    return allGroups.filter((g) => myTeacherRecord.groupIds.includes(g.id));
  }, [isAdmin, myTeacherRecord, allGroups]);

  // Admin: selected course to filter groups
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const filteredGroupsForAdmin = useMemo(() => {
    if (!isAdmin) return availableGroups;
    if (!selectedCourseId) return allGroups;
    return allGroups.filter((g) => g.courseId === selectedCourseId);
  }, [isAdmin, selectedCourseId, allGroups, availableGroups]);

  const displayGroups = isAdmin ? filteredGroupsForAdmin : availableGroups;

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate?.slice(0, 10) || '');
  const [groupId, setGroupId] = useState(initialData?.groupId || '');

  // Auto-select first group when available
  useEffect(() => {
    if (!groupId && displayGroups.length > 0) {
      setGroupId(displayGroups[0].id);
    }
  }, [displayGroups]);

  // Reset group when course filter changes
  useEffect(() => {
    setGroupId(filteredGroupsForAdmin[0]?.id || '');
  }, [selectedCourseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !groupId) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      groupId,
    });
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const selectedGroup = allGroups.find((g) => g.id === groupId);
  const selectedCourse = selectedGroup ? courses.find((c) => c.id === selectedGroup.courseId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-brand-600 to-accent-600">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-xl">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg">
                {initialData ? 'Vazifani tahrirlash' : 'Yangi vazifa yaratish'}
              </h2>
              <p className="text-white/70 text-xs mt-0.5">
                {isAdmin ? 'Kurs va guruhni tanlang' : `${availableGroups.length} ta guruhingiz mavjud`}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ADMIN: Course selector first */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <GraduationCap className="inline h-3.5 w-3.5 mr-1" />
                Kurs (ixtiyoriy filtr)
              </label>
              <div className="relative">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                >
                  <option value="">— Barcha kurslar —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Group selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <Users className="inline h-3.5 w-3.5 mr-1" />
              Guruh
            </label>
            {displayGroups.length === 0 ? (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 p-4 text-center text-sm text-rose-600 dark:text-rose-400">
                {isAdmin ? 'Bu kursda guruh mavjud emas' : 'Sizga biriktirilgan guruh topilmadi'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                {displayGroups.map((g) => {
                  const course = courses.find((c) => c.id === g.courseId);
                  const teacher = teachers.find((t) => t.id === g.teacherId);
                  return (
                    <label
                      key={g.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        groupId === g.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="groupId"
                        value={g.id}
                        checked={groupId === g.id}
                        onChange={() => setGroupId(g.id)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        groupId === g.id ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {groupId === g.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{g.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {course?.name}
                          {isAdmin && teacher ? ` • ${teacher.fullName}` : ''}
                          {` • ${g.studentIds.length} o'quvchi`}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                        g.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        g.status === 'full' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {g.status === 'active' ? 'Aktiv' : g.status === 'full' ? "To'liq" : 'Arxiv'}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Vazifa sarlavhasi
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Masalan: Python asoslari – 3-dars"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Tavsif / Ko'rsatma
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="O'quvchilarga nima qilish kerakligini yozing..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <Calendar className="inline h-3.5 w-3.5 mr-1" />
              Topshirish muddati
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Preview */}
          {groupId && title && (
            <div className="rounded-xl bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-900/20 dark:to-accent-900/20 border border-brand-100 dark:border-brand-800/50 p-4">
              <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase mb-1">Ko'rinish:</p>
              <p className="font-bold text-slate-800 dark:text-white text-sm">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedGroup?.name}
                {selectedCourse ? ` (${selectedCourse.name})` : ''}
                {dueDate ? ` • ${new Date(dueDate).toLocaleDateString('uz-UZ')}` : ''}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!groupId || !title || !dueDate}
              className="flex-[2] py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 active:scale-95"
            >
              {initialData ? '✏️ Yangilash' : '✅ Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
