import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Download, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinanceStore } from '../../stores/financeStore';
import type { ExpenseCategory } from '../../stores/financeStore';
import { useStudentStore } from '../../stores/studentStore';
import { useUIStore } from '../../stores/uiStore';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { exportCSV } from '../../utils/exportCSV';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Ustoz maoshi', 'Ijara', 'Kommunal', 'Marketing', 'Jihozlar', 'Boshqa'];

export const Finance: React.FC = () => {
  const { expenses, addExpense, getTotalExpenses, getMonthlyStats } = useFinanceStore();
  const { payments } = useStudentStore();
  const { addToast } = useUIStore();
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<'overview' | 'expenses'>('overview');
  const [form, setForm] = useState({ category: 'Ijara' as ExpenseCategory, amount: '', date: new Date().toISOString().split('T')[0], note: '', createdBy: 'Admin' });

  const monthlyStats = getMonthlyStats(payments);
  const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = getTotalExpenses();
  const netProfit = totalIncome - totalExpense;

  const categoryStats = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.value > 0);

  const handleAddExpense = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { addToast({ type: 'error', message: "Miqdorni to'ldiring" }); return; }
    addExpense({ category: form.category, amount: Number(form.amount), date: form.date, note: form.note, createdBy: form.createdBy });
    addToast({ type: 'success', message: `Xarajat qo'shildi: ${Number(form.amount).toLocaleString()} so'm` });
    setForm({ category: 'Ijara', amount: '', date: new Date().toISOString().split('T')[0], note: '', createdBy: 'Admin' });
    setAddOpen(false);
  };

  const handleExport = () => {
    exportCSV(expenses.map((e) => ({ Kategoriya: e.category, Miqdor: e.amount, Sana: e.date, Izoh: e.note, Yaratdi: e.createdBy })), 'xarajatlar');
    addToast({ type: 'success', message: 'CSV yuklab olindi' });
  };

  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Moliya</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Daromad, xarajat va moliyaviy hisobot</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
            <Plus className="h-4 w-4" /> Xarajat qo'shish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami daromad" value={`${fmt(totalIncome)} so'm`} icon={TrendingUp} iconColor="text-emerald-600 dark:text-emerald-400" trend={{ value: 12, label: '+12%' }} />
        <StatCard title="Jami xarajat" value={`${fmt(totalExpense)} so'm`} icon={TrendingDown} iconColor="text-red-500" trend={{ value: 5, label: '-5%' }} />
        <StatCard title="Sof foyda" value={`${fmt(netProfit)} so'm`} icon={DollarSign} iconColor={netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'} />
        <StatCard title="Xarajat soni" value={expenses.length} icon={BarChart2} iconColor="text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="flex gap-2">
        {(['overview', 'expenses'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === v ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {v === 'overview' ? 'Umumiy ko\'rinish' : 'Xarajatlar'}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-5">Oylik daromad vs xarajat</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} so'm`]} />
                <Legend />
                <Area type="monotone" dataKey="income" name="Daromad" stroke="#6366f1" fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-indigo-500" /> Xarajat taqsimoti</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryStats} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={3}>
                    {categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} so'm`]} />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2"><BarChart2 className="h-4 w-4 text-indigo-500" /> Oylik foyda</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyStats.map((m) => ({ ...m, profit: m.income - m.expense }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} so'm`]} />
                  <Bar dataKey="profit" name="Foyda" radius={[6, 6, 0, 0]}>
                    {monthlyStats.map((m, i) => <Cell key={i} fill={(m.income - m.expense) >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {view === 'expenses' && (
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-dark-border">
                  {['Sana', 'Kategoriya', 'Miqdor', 'Izoh', 'Kim qo\'shdi'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {[...expenses].reverse().map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs">{e.date}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium">{e.category}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-red-500">{e.amount.toLocaleString()} so'm</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{e.note}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{e.createdBy}</td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-400">Xarajatlar yo'q</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yangi xarajat" size="md">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kategoriya</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Miqdor (so'm)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="1000000" min={0}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Sana</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Izoh</label>
            <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Xarajat haqida..."
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">Qo'shish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
