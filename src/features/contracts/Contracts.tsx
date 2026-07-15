import React, { useState, useMemo } from 'react';
import { FileText, Plus, Download, CheckCircle, Clock, AlertCircle, Printer, Users, Search, Check, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useCourseStore } from '../../stores/courseStore';
import { useContractStore } from '../../stores/contractStore';
import { useGroupStore } from '../../stores/groupStore';
import { useUIStore } from '../../stores/uiStore';
import { statusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { StatCard } from '../../components/StatCard';
import { exportCSV } from '../../utils/exportCSV';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';

export const Contracts: React.FC = () => {
  const { students } = useStudentStore();
  const { courses } = useCourseStore();
  const { groups } = useGroupStore();
  const { contracts, addContract, updateContract } = useContractStore();
  const { addToast } = useUIStore();

  // Single contract modal
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ studentId: '', courseId: '', startDate: '', endDate: '' });

  // Bulk contract modal
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkCourseOverride, setBulkCourseOverride] = useState('');
  const [bulkExpanded, setBulkExpanded] = useState(true);

  const getStudent = (id: string) => students.find((s) => s.id === id);
  const getCourse = (id: string) => courses.find((c) => c.id === id);
  const getStudentContract = (studentId: string) => contracts.find(c => c.studentId === studentId);

  // Auto-compute contract data from group + course (same logic as Students.tsx)
  const computeContractData = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;
    const studentGroup = groups.find(g => student.groupIds.includes(g.id) && g.status !== 'archived');
    if (!studentGroup) return null;
    const course = courses.find(c => c.id === studentGroup.courseId);
    if (!course) return null;
    const startDate = studentGroup.startDate || new Date().toISOString().split('T')[0];
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + course.durationMonths);
    const endDate = end.toISOString().split('T')[0];
    const totalPrice = course.monthlyPrice * course.durationMonths;
    return { studentGroup, course, startDate, endDate, totalPrice };
  };

  // Filtered students for bulk select
  const filteredStudents = useMemo(() =>
    students.filter(s =>
      s.status === 'active' &&
      (s.fullName.toLowerCase().includes(bulkSearch.toLowerCase()) || s.phone.includes(bulkSearch))
    ), [students, bulkSearch]);

  // Students without contract
  const studentsWithoutContract = filteredStudents.filter(s => !getStudentContract(s.id));
  const studentsWithContract = filteredStudents.filter(s => !!getStudentContract(s.id));

  const toggleSelect = (id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (bulkSelected.size === studentsWithoutContract.length && studentsWithoutContract.length > 0) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(studentsWithoutContract.map(s => s.id)));
    }
  };

  const handleBulkCreate = () => {
    if (bulkSelected.size === 0) {
      addToast({ type: 'error', message: "Kamida 1 ta o'quvchi tanlang!" }); return;
    }
    let created = 0;
    let skipped = 0;
    bulkSelected.forEach(studentId => {
      const computed = computeContractData(studentId);
      if (!computed) { skipped++; return; }

      // Use override course if selected, else auto
      const finalCourse = bulkCourseOverride ? getCourse(bulkCourseOverride) : computed.course;
      if (!finalCourse) { skipped++; return; }

      const startDate = computed.startDate;
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + finalCourse.durationMonths);
      const endDate = end.toISOString().split('T')[0];
      const totalPrice = finalCourse.monthlyPrice * finalCourse.durationMonths;

      addContract({
        studentId,
        courseId: finalCourse.id,
        startDate,
        endDate,
        totalPrice,
        status: 'active',
        signedDate: new Date().toISOString().split('T')[0],
      });
      created++;
    });

    addToast({ type: 'success', message: `✅ ${created} ta shartnoma yaratildi${skipped > 0 ? `, ${skipped} ta o'tkazib yuborildi (guruh/kurs yo'q)` : ''}!` });
    setBulkOpen(false);
    setBulkSelected(new Set());
    setBulkSearch('');
    setBulkCourseOverride('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.courseId || !form.startDate || !form.endDate) {
      addToast({ type: 'error', message: "Barcha maydonlarni to'ldiring" }); return;
    }
    const course = getCourse(form.courseId);
    const months = Math.max(1, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    addContract({ studentId: form.studentId, courseId: form.courseId, startDate: form.startDate, endDate: form.endDate, totalPrice: (course?.monthlyPrice ?? 0) * months, status: 'pending' });
    addToast({ type: 'success', message: 'Shartnoma yaratildi' });
    setForm({ studentId: '', courseId: '', startDate: '', endDate: '' });
    setAddOpen(false);
  };

  const handleSign = (id: string) => {
    updateContract(id, { status: 'active', signedDate: new Date().toISOString().split('T')[0] });
    addToast({ type: 'success', message: 'Shartnoma imzolandi' });
  };

  const handleExport = () => {
    exportCSV(contracts.map((c) => ({ ID: c.id, "O'quvchi": getStudent(c.studentId)?.fullName ?? c.studentId, Kurs: getCourse(c.courseId)?.name ?? c.courseId, Boshlanish: c.startDate, Tugash: c.endDate, "Jami summa": c.totalPrice, Holat: c.status, "Imzolangan sana": c.signedDate ?? '' })), 'shartnomalar');
    addToast({ type: 'success', message: 'CSV yuklab olindi' });
  };

  const viewContract = contracts.find((c) => c.id === viewOpen);
  const viewStudent = viewContract ? getStudent(viewContract.studentId) : null;
  const viewCourse = viewContract ? getCourse(viewContract.courseId) : null;
  const activeCount = contracts.filter((c) => c.status === 'active').length;
  const pendingCount = contracts.filter((c) => c.status === 'pending').length;

  const allSelected = studentsWithoutContract.length > 0 && bulkSelected.size === studentsWithoutContract.length;

  return (
    <div className="space-y-6">
      <PageHeaderBanner
        category="RASMIY HUJJATLAR • DOCUMENT SIGNATURE"
        title="O'quvchilar bilan Shartnomalar va Aktsiyalar"
        description="Jiddiy qog'oz hujjat estetikasi, yuridik imzolash holati hamda shartnomalarni chop etish"
        accent="slate"
        icon={<FileText className="w-3.5 h-3.5" />}
        rightAction={
          <div className="flex gap-2">
            <button onClick={handleExport} className="inline-flex items-center gap-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              onClick={() => { setBulkOpen(true); setBulkSelected(new Set()); setBulkSearch(''); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-amber-500/30 transition-all active:scale-95"
            >
              <Zap className="h-4 w-4" /> Ommaviy yaratish
            </button>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95">
              <Plus className="h-4 w-4" /> Yangi shartnoma
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami shartnomalar" value={contracts.length} icon={FileText} />
        <StatCard title="Aktiv" value={activeCount} icon={CheckCircle} iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Kutilmoqda" value={pendingCount} icon={Clock} iconColor="text-amber-600 dark:text-amber-400" />
        <StatCard title="Muddati o'tgan" value={contracts.filter((c) => c.status === 'expired').length} icon={AlertCircle} iconColor="text-red-500" />
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-dark-border">
                {["O'quvchi", 'Kurs', 'Muddat', 'Jami summa', 'Holat', 'Amal'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {contracts.map((ct) => {
                const student = getStudent(ct.studentId);
                const course = getCourse(ct.courseId);
                return (
                  <tr key={ct.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {student && <img src={student.photo} alt={student.fullName} className="h-7 w-7 rounded-full object-cover" />}
                        <span className="font-medium text-slate-800 dark:text-white">{student?.fullName ?? ct.studentId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{course?.name ?? ct.courseId}</td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs"><p>{ct.startDate}</p><p>— {ct.endDate}</p></td>
                    <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">{ct.totalPrice.toLocaleString()} so'm</td>
                    <td className="px-5 py-4">{statusBadge(ct.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setViewOpen(ct.id)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Ko'rish</button>
                        {ct.status === 'pending' && (
                          <button onClick={() => handleSign(ct.id)} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-700">Imzolash</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {contracts.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-slate-400">Shartnomalar yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── OMMAVIY YARATISH MODALI ─────────────────────────────────────────── */}
      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Ommaviy shartnoma yaratish" size="md">
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
            <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Avtomatik hisoblash</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">
                Har bir o'quvchi uchun guruh va kursdan avtomatik sanalar va narx hisoblanadi. Umumiy kurs tanlasangiz, u barcha tanlanganlar uchun qo'llaniladi.
              </p>
            </div>
          </div>

          {/* Course override */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Kurs (ixtiyoriy — bo'sh qoldirsangiz guruhdan avtomatik olinadi)
            </label>
            <select value={bulkCourseOverride} onChange={e => setBulkCourseOverride(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">— Avtomatik (guruhdan) —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} · {c.monthlyPrice.toLocaleString()} so'm/oy · {c.durationMonths} oy</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={bulkSearch} onChange={e => setBulkSearch(e.target.value)}
              placeholder="O'quvchi ismi yoki telefon..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>

          {/* Students WITHOUT contract */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setBulkExpanded(v => !v)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                {bulkExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                Shartnoma yo'q — {studentsWithoutContract.length} ta o'quvchi
              </button>
              <button type="button" onClick={selectAll}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors ${allSelected ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
                {allSelected ? '✓ Barchasi tanlandi' : 'Barchasini tanlash'}
              </button>
            </div>

            {bulkExpanded && (
              <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 dark:border-dark-border p-2 bg-slate-50/50 dark:bg-slate-800/30">
                {studentsWithoutContract.length === 0 && (
                  <p className="text-xs text-center text-slate-400 py-4">Barcha o'quvchilarda shartnoma mavjud</p>
                )}
                {studentsWithoutContract.map(s => {
                  const computed = computeContractData(s.id);
                  const isSelected = bulkSelected.has(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggleSelect(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${isSelected
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-200'
                      }`}>
                      {/* Checkbox */}
                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <img src={s.photo} alt={s.fullName} className="h-8 w-8 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{s.fullName}</p>
                        <p className="text-[10px] text-slate-400">{s.phone}</p>
                      </div>
                      {computed ? (
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{computed.totalPrice.toLocaleString()} so'm</p>
                          <p className="text-[10px] text-slate-400">{computed.course.name} · {computed.course.durationMonths} oy</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-400 shrink-0">Guruh/kurs yo'q</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Students WITH contract (read-only info) */}
          {studentsWithContract.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Allaqachon shartnomasi bor — {studentsWithContract.length} ta
              </p>
              <div className="max-h-28 overflow-y-auto space-y-1 rounded-xl border border-slate-200 dark:border-dark-border p-2 bg-slate-50 dark:bg-slate-800/20">
                {studentsWithContract.map(s => {
                  const ct = getStudentContract(s.id);
                  const course = getCourse(ct?.courseId ?? '');
                  return (
                    <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 opacity-60">
                      <img src={s.photo} alt={s.fullName} className="h-6 w-6 rounded-full object-cover" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 flex-1">{s.fullName}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{course?.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${ct?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {ct?.status === 'active' ? 'Faol' : 'Kutilmoqda'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary & Action */}
          {bulkSelected.size > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {bulkSelected.size} ta o'quvchi uchun shartnoma yaratiladi
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Jami taxminiy summa: <strong>
                  {Array.from(bulkSelected).reduce((sum, sid) => {
                    const computed = computeContractData(sid);
                    if (!computed) return sum;
                    const finalCourse = bulkCourseOverride ? getCourse(bulkCourseOverride) : computed.course;
                    return sum + (finalCourse ? finalCourse.monthlyPrice * finalCourse.durationMonths : 0);
                  }, 0).toLocaleString()} so'm
                </strong>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setBulkOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">
              Bekor
            </button>
            <button type="button" onClick={handleBulkCreate} disabled={bulkSelected.size === 0}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" />
              {bulkSelected.size > 0 ? `${bulkSelected.size} ta shartnoma yaratish` : 'O\'quvchi tanlang'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── YAKKA SHARTNOMA MODALI ──────────────────────────────────────────── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yangi shartnoma" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">O'quvchi *</label>
            <select value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">O'quvchi tanlang</option>
              {students.filter((s) => s.status === 'active').map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kurs *</label>
            <select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Kurs tanlang</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.monthlyPrice.toLocaleString()} so'm/oy</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['startDate', 'endDate'] as const).map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{key === 'startDate' ? 'Boshlanish' : 'Tugash'}</label>
                <input type="date" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  min={key === 'endDate' && form.startDate ? form.startDate : undefined}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
          </div>
          {form.courseId && form.startDate && form.endDate && (() => {
            const months = Math.max(1, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)));
            const total = (getCourse(form.courseId)?.monthlyPrice ?? 0) * months;
            return <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-300">{months} oy × {getCourse(form.courseId)?.monthlyPrice.toLocaleString()} = <strong>{total.toLocaleString()} so'm</strong></div>;
          })()}
          <div className="flex gap-3">
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">Yaratish</button>
          </div>
        </form>
      </Modal>

      {/* ── SHARTNOMA KO'RISH MODALI ────────────────────────────────────────── */}
      <Modal open={!!viewOpen} onClose={() => setViewOpen(null)} title="Shartnoma" size="md">
        {viewContract && viewStudent && viewCourse && (
          <div className="space-y-5">
            <div className="text-center space-y-1 border-b border-slate-200 dark:border-dark-border pb-5">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Brain IT Academy</p>
              <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white">O'QUV SHARTNOMASI</h2>
              <p className="text-xs text-slate-400">№ {viewContract.id.toUpperCase()}</p>
            </div>
            <div className="space-y-3 text-sm">
              {[["O'quvchi", viewStudent.fullName], ["Telefon", viewStudent.phone], ["Kurs", viewCourse.name], ["Muddat", `${viewContract.startDate} — ${viewContract.endDate}`], ["Oylik narx", `${viewCourse.monthlyPrice.toLocaleString()} so'm`]].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{label}:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{value}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 dark:border-dark-border pt-3">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Jami summa:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">{viewContract.totalPrice.toLocaleString()} so'm</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {statusBadge(viewContract.status)}
              {viewContract.signedDate && <span className="text-xs text-slate-400">Imzolangan: {viewContract.signedDate}</span>}
            </div>
            <div className="pt-6 mt-4 border-t border-slate-200 dark:border-dark-border flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">O'quvchi imzosi:</p>
                <div className="h-10 border-b border-dashed border-slate-400 w-36" />
              </div>
              <div className="relative text-center">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Markaz Rahbariyati:</p>
                <div className="relative inline-block">
                  <div className="border-2 border-emerald-600/80 rounded-full px-4 py-1.5 bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 transform -rotate-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider">BRAIN IT ACADEMY MCHJ</p>
                    <p className="text-[9px] font-bold">RASMIY MUHR VA IMZO ✓</p>
                  </div>
                  <p className="text-[11px] font-bold mt-1.5 text-slate-700 dark:text-slate-300">Direktor: F. Salimova</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {viewContract.status === 'pending' && (
                <button onClick={() => { handleSign(viewContract.id); setViewOpen(null); }} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">Imzolash</button>
              )}
              <button onClick={() => window.print()} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
                <Printer className="h-4 w-4" /> Chop etish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
