import React, { useState } from 'react';
import { FileText, Plus, Download, CheckCircle, Clock, AlertCircle, Printer } from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useCourseStore } from '../../stores/courseStore';
import { useContractStore } from '../../stores/contractStore';
import { useUIStore } from '../../stores/uiStore';
import { statusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { StatCard } from '../../components/StatCard';
import { exportCSV } from '../../utils/exportCSV';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';

export const Contracts: React.FC = () => {
  const { students } = useStudentStore();
  const { courses } = useCourseStore();
  const { contracts, addContract, updateContract } = useContractStore();
  const { addToast } = useUIStore();
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ studentId: '', courseId: '', startDate: '', endDate: '' });

  const getStudent = (id: string) => students.find((s) => s.id === id);
  const getCourse = (id: string) => courses.find((c) => c.id === id);

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
                <input 
                  type="date" 
                  value={form[key]} 
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  min={key === 'endDate' && form.startDate ? form.startDate : undefined}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                />
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

            {/* Official Stamp & Signature Overlay for Print */}
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
