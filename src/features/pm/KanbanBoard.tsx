import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, Trash2, Clock, User } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useUIStore } from '../../stores/uiStore';
import { usePmStore } from '../../stores/pmStore';
import type { Task } from '../../data/mockData';

const COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'todo',        label: 'Bajariladiganlar' },
  { key: 'in_progress', label: 'Ish Jarayonida' },
  { key: 'review',      label: 'Tekshiruv' },
  { key: 'done',        label: 'Tugatildi' },
];

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low:      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  medium:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  high:     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const PRIORITY_LABELS: Record<Task['priority'], string> = { low: 'Past', medium: "O'rta", high: 'Yuqori', critical: 'Kritik' };

const TEAM_AVATARS = [
  { name: 'Otabek Qodirov', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop' },
  { name: 'Sherzod Nazarov', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop' },
  { name: 'Bobur Akbarov',   avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop' },
];

export const KanbanBoard: React.FC = () => {
  const { addToast } = useUIStore();
  const { projects: projectsList, setProjects, updateProjectTaskStatus } = usePmStore();
  
  const [selectedProjectId, setSelectedProjectId] = useState(projectsList[0]?.id ?? '');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as Task['priority'], estimatedHours: 8, assigneeIdx: 0 });

  const project = projectsList.find((p) => p.id === selectedProjectId);
  if (!project) return <div className="text-slate-400">Loyiha topilmadi</div>;

  const colTasks = (col: Task['status']) => project.tasks.filter((t) => t.status === col);
  const colIdx = (status: Task['status']) => COLUMNS.findIndex((c) => c.key === status);

  const moveTask = (taskId: string, dir: 1 | -1) => {
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const next = colIdx(task.status) + dir;
    if (next >= 0 && next < COLUMNS.length) {
      updateProjectTaskStatus(selectedProjectId, taskId, COLUMNS[next].key);
      
      // Update progress logic locally
      setProjects(usePmStore.getState().projects.map(p => {
        if (p.id !== selectedProjectId) return p;
        const done = p.tasks.filter(t => t.status === 'done').length;
        return { ...p, progress: Math.round((done / p.tasks.length) * 100) };
      }));
    }
  };

  const deleteTask = (taskId: string) => {
    setProjects(projectsList.map((p) => {
      if (p.id !== selectedProjectId) return p;
      const tasks = p.tasks.filter((t) => t.id !== taskId);
      const done = tasks.filter((t) => t.status === 'done').length;
      return { ...p, tasks, progress: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
    }));
    addToast({ type: 'warning', message: 'Task o\'chirildi' });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    const assignee = TEAM_AVATARS[form.assigneeIdx];
    const newTask: Task = { id: `t_${Date.now()}`, title: form.title, description: form.description, status: 'todo', priority: form.priority, assignee, estimatedHours: form.estimatedHours };
    setProjects(projectsList.map((p) => {
      if (p.id !== selectedProjectId) return p;
      return { ...p, tasks: [...p.tasks, newTask] };
    }));
    addToast({ type: 'success', message: `Task qo'shildi: ${form.title}` });
    setForm({ title: '', description: '', priority: 'medium', estimatedHours: 8, assigneeIdx: 0 });
    setAddOpen(false);
  };

  const doneCount = project.tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Kanban PM Board</h1><p className="text-sm text-slate-500 dark:text-slate-400">Loyiha vazifalarini boshqarish</p></div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"><Plus className="h-4 w-4" /> Task qo'shish</button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {projectsList.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.client}</option>)}
        </select>
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 hidden sm:block">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
        </div>
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">{project.progress}% ({doneCount}/{project.tasks.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const tasks = colTasks(col.key);
          return (
            <div key={col.key} className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{col.label}</h3>
                <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-dark-border px-2 py-0.5 rounded-full">{tasks.length}</span>
              </div>
              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const idx = colIdx(task.status);
                  return (
                    <div key={task.id} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl p-3 shadow-sm group">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">{task.title}</p>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-500 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 ml-auto"><Clock className="h-3 w-3" />{task.estimatedHours}h</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <img src={task.assignee.avatar} alt={task.assignee.name} className="h-5 w-5 rounded-full object-cover" />
                          <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{task.assignee.name.split(' ')[0]}</span>
                        </div>
                        <div className="flex gap-1">
                          {idx > 0 && <button onClick={() => moveTask(task.id, -1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronLeft className="h-3.5 w-3.5" /></button>}
                          {idx < COLUMNS.length - 1 && <button onClick={() => moveTask(task.id, 1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronRight className="h-3.5 w-3.5" /></button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {tasks.length === 0 && <div className="h-20 rounded-xl border border-dashed border-slate-200 dark:border-dark-border flex items-center justify-center text-xs text-slate-300 dark:text-slate-600">Bo'sh</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yangi Task" size="md">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Sarlavha *</label><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task sarlavhasi" className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tavsif</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Task haqida..." className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Ustuvorlik</label><select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Task['priority'] }))} className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="low">Past</option><option value="medium">O'rta</option><option value="high">Yuqori</option><option value="critical">Kritik</option></select></div>
            <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Soatlar</label><input type="number" value={form.estimatedHours} onChange={(e) => setForm((f) => ({ ...f, estimatedHours: Number(e.target.value) }))} min={1} className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><User className="h-3.5 w-3.5" /> Mas'ul</label><select value={form.assigneeIdx} onChange={(e) => setForm((f) => ({ ...f, assigneeIdx: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">{TEAM_AVATARS.map((a, i) => <option key={i} value={i}>{a.name}</option>)}</select></div>
          <div className="flex gap-3"><button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button><button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">Qo'shish</button></div>
        </form>
      </Modal>
    </div>
  );
};
