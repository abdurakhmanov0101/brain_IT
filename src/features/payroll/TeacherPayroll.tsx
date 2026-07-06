import React, { useState } from 'react';
import { DollarSign, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import type { PayrollRecord } from '../../stores/financeStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useCourseStore } from '../../stores/courseStore';
import { useUIStore } from '../../stores/uiStore';
import { statusBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { exportCSV } from '../../utils/exportCSV';

const generateMonths = (count = 6): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};
const MONTHS = generateMonths();

export const TeacherPayroll: React.FC = () => {
  const { payrollRecords, updatePayroll, addPayrollRecord } = useFinanceStore();
  const { teachers } = useTeacherStore();
  const { courses } = useCourseStore();
  const { addToast } = useUIStore();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [payOpen, setPayOpen] = useState<PayrollRecord | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [partialAmount, setPartialAmount] = useState('');

  const getTeacher = (id: string) => teachers.find((t) => t.id === id);
  const monthRecords = payrollRecords.filter((r) => r.month === selectedMonth);
  const totalPaid = monthRecords.filter((r) => r.status === 'paid').reduce((s, r) => s + r.totalAmount, 0);
  const totalPending = monthRecords.filter((r) => r.status !== 'paid').reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);

  const handlePayFull = (record: PayrollRecord) => {
    const penalty = Number(penaltyAmount) || 0;
    const finalAmount = record.totalAmount + penalty;
    updatePayroll(record.id, { status: 'paid', paidAmount: finalAmount, paidDate: new Date().toISOString().split('T')[0] });
    addToast({ type: 'success', message: `${getTeacher(record.teacherId)?.fullName ?? record.teacherId} — to'liq${penalty > 0 ? ` + izho (${penalty.toLocaleString()} so'm)` : ''} to'landi` });
    setPayOpen(null);
    setPenaltyAmount('');
  };

  const handlePayPartial = (record: PayrollRecord) => {
    const penalty = Number(penaltyAmount) || 0;
    const effectiveTotal = record.totalAmount + penalty;
    const amount = Number(partialAmount);
    if (!amount || amount <= 0 || amount > effectiveTotal - record.paidAmount) {
      addToast({ type: 'error', message: "Noto'g'ri summa" });
      return;
    }
    const newPaid = record.paidAmount + amount;
    updatePayroll(record.id, { status: newPaid >= effectiveTotal ? 'paid' : 'partial', paidAmount: newPaid, paidDate: new Date().toISOString().split('T')[0] });
    addToast({ type: 'success', message: `${amount.toLocaleString()} so'm to'landi` });
    setPayOpen(null);
    setPartialAmount('');
    setPenaltyAmount('');
  };

  const handleGenerate = () => {
    const existing = payrollRecords.filter((r) => r.month === selectedMonth).map((r) => r.teacherId);
    const missing = teachers.filter((t) => t.status === 'active' && !existing.includes(t.id));
    missing.forEach((t) => {
      const teacherCourses = courses.filter((c) => t.courseIds.includes(c.id));
      const totalAmount = teacherCourses.length > 0
        ? teacherCourses.reduce((sum, c) => sum + Math.round(c.monthlyPrice * c.teacherPercent / 100), 0)
        : 1500000;
      const lessonsCount = teacherCourses.reduce((sum, c) => sum + c.lessonsPerWeek * 4, 0);
      addPayrollRecord({ teacherId: t.id, month: selectedMonth, lessonsCount, totalAmount, status: 'pending', paidAmount: 0 });
    });
    if (missing.length > 0) addToast({ type: 'success', message: `${missing.length} ta ustoz uchun maosh yaratildi` });
    else addToast({ type: 'info', message: 'Barcha ustoz maoshlari allaqachon yaratilgan' });
  };

  const handleExport = () => {
    exportCSV(monthRecords.map((r) => ({ Ustoz: getTeacher(r.teacherId)?.fullName ?? r.teacherId, Oy: r.month, Darslar: r.lessonsCount, "Jami summa": r.totalAmount, "To'langan": r.paidAmount, Holat: r.status, "To'lov sanasi": r.paidDate ?? '' })), `maosh_${selectedMonth}`);
    addToast({ type: 'success', message: 'CSV yuklab olindi' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Ustoz Maoshlari</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Oylik maoshlar va to'lovlar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button onClick={handleGenerate} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
            Maosh yaratish
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {MONTHS.map((m) => (
          <button key={m} onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedMonth === m ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami maoshlar" value={monthRecords.length} icon={DollarSign} />
        <StatCard title="To'langan" value={monthRecords.filter((r) => r.status === 'paid').length} icon={CheckCircle} iconColor="text-emerald-500" />
        <StatCard title="To'liq to'langan" value={`${(totalPaid / 1_000_000).toFixed(1)}M`} icon={DollarSign} iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Qoldiq" value={`${(totalPending / 1_000_000).toFixed(1)}M`} icon={AlertCircle} iconColor="text-amber-500" />
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-dark-border">
                {['Ustoz', 'Darslar', 'Jami maosh', "To'langan", 'Qoldiq', 'Holat', 'Amal'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {monthRecords.map((record) => {
                const teacher = getTeacher(record.teacherId);
                const remaining = record.totalAmount - record.paidAmount;
                const actualStatus = remaining <= 0 ? 'paid' : record.paidAmount > 0 ? 'partial' : 'pending';
                
                return (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        {teacher && <img src={teacher.photo} alt={teacher.fullName} className="h-8 w-8 rounded-full object-cover" />}
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{teacher?.fullName ?? record.teacherId}</p>
                          <p className="text-xs text-slate-400">{teacher?.specialization}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{record.lessonsCount}</td>
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-white">{record.totalAmount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">{record.paidAmount > 0 ? record.paidAmount.toLocaleString() : '0'}</td>
                    <td className="px-5 py-4 text-red-500 font-semibold">{remaining > 0 ? remaining.toLocaleString() : '—'}</td>
                    <td className="px-5 py-4">{statusBadge(actualStatus)}</td>
                    <td className="px-5 py-4">
                      {remaining > 0 ? (
                        <button onClick={() => { setPayOpen(record); setPartialAmount(''); }} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-500/30 transition-all flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" /> To'lash
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> {record.paidDate || 'To\'landi'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {monthRecords.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Bu oy uchun maosh ma'lumotlari yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!payOpen} onClose={() => setPayOpen(null)} title="Maosh to'lash" size="sm">
        {payOpen && (() => {
          const teacher = getTeacher(payOpen.teacherId);
          const remaining = (payOpen.totalAmount + Number(penaltyAmount)) - payOpen.paidAmount;
          return (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Ustoz:</span><span className="font-semibold">{teacher?.fullName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Jami maosh:</span><span className="font-semibold">{payOpen.totalAmount.toLocaleString()} so'm</span></div>
                <div className="flex justify-between"><span className="text-slate-500">To'langan:</span><span className="font-semibold text-emerald-600">{payOpen.paidAmount.toLocaleString()} so'm</span></div>
                <div className="flex justify-between border-t border-slate-200 dark:border-dark-border pt-2"><span className="text-slate-700 dark:text-slate-300 font-semibold">Qoldiq:</span><span className="font-black text-red-500">{remaining.toLocaleString()} so'm</span></div>
              </div>
              <button onClick={() => handlePayFull(payOpen)} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all">To'liq to'lash ({remaining.toLocaleString()} so'm)</button>
              <div className="flex gap-2 items-center">
                <input type="number" value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)} placeholder="Izoh (so'm)" min={0}
                  className="w-32 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold" />
                <input type="number" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} placeholder="Qisman summa kiriting..." min={1} max={remaining}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold" />
                <button onClick={() => handlePayPartial(payOpen)} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold whitespace-nowrap shadow-lg shadow-indigo-500/30 transition-all">Avans / Qisman</button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
