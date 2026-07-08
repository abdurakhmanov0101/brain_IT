import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Download, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinanceStore } from '../../stores/financeStore';
import type { ExpenseCategory } from '../../stores/financeStore';
import { useStudentStore, type Student } from '../../stores/studentStore';
import { useCoinStore } from '../../stores/coinStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { StatCard } from '../../components/StatCard';
import { Coins, Search, Edit2 } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { exportCSV } from '../../utils/exportCSV';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';

const COLORS = ['#10b981', '#34d399', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Ustoz maoshi', 'Ijara', 'Kommunal', 'Marketing', 'Jihozlar', 'Boshqa'];

export const Finance: React.FC = () => {
  const { expenses, addExpense, getTotalExpenses, getMonthlyStats } = useFinanceStore();
  const { payments, students, updateStudent, addPayment } = useStudentStore();
  const { teachers, updateTeacher } = useTeacherStore();
  const { currentUser } = useAuthStore();
  const { addTransaction } = useCoinStore();
  const { addToast } = useUIStore();
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<'overview' | 'expenses' | 'students'>('overview');
  const [form, setForm] = useState({ category: 'Ijara' as ExpenseCategory, amount: '', date: new Date().toISOString().split('T')[0], note: '', createdBy: 'Admin' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ paymentStatus: 'unpaid' as any, paymentNote: '', nextPaymentDate: '' });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');

  const [kirimTab, setKirimTab] = useState<'students' | 'history'>('students');
  const [paymentNoteText, setPaymentNoteText] = useState('');

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

  const handleGiveCoin = (student: Student, amount: number, reason: string) => {
    updateStudent(student.id, { coins: (student.coins || 0) + amount });
    addTransaction({ fromId: 'finance', fromName: "Moliya Bo'limi", toId: student.id, toName: student.fullName, amount, reason });
    addToast({ type: 'success', message: `${student.fullName}ga ${amount} tanga berildi!` });
  };

  const handleAcceptPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPayment || !paymentAmount || paymentAmount <= 0) return;

    const amount = Number(paymentAmount);
    const teacherId = selectedStudentForPayment.teacherId;
    let teacherShare = 0;
    let academyShare = amount;

    if (teacherId) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher) {
        const percentage = teacher.salaryPercentage || 35; // default 35%
        teacherShare = (amount * percentage) / 100;
        academyShare = amount - teacherShare;
        
        // Update teacher balance
        updateTeacher(teacher.id, { salaryBalance: (teacher.salaryBalance || 0) + teacherShare });
      }
    }

    addPayment({
      studentId: selectedStudentForPayment.id,
      amount: academyShare + teacherShare, // Total amount is recorded
      type: 'cash',
      date: new Date().toISOString().split('T')[0],
      receivedBy: currentUser?.name || 'Admin',
      note: `${paymentNoteText || "Oylik to'lov"}. Ustoz ulushi: ${teacherShare.toLocaleString()} so'm`,
    });

    // Update student balance
    updateStudent(selectedStudentForPayment.id, { 
      balance: (selectedStudentForPayment.balance || 0) + amount, // If payment increases balance
      paymentStatus: 'paid' 
    });

    addToast({ type: 'success', message: "To'lov qabul qilindi!" });
    setPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentNoteText('');
    setSelectedStudentForPayment(null);
  };

  const saveStudentEdit = (id: string) => {
    updateStudent(id, {
      paymentStatus: editForm.paymentStatus,
      paymentNote: editForm.paymentNote,
      nextPaymentDate: editForm.nextPaymentDate,
    });
    setEditingStudent(null);
    addToast({ type: 'success', message: 'Saqlandi' });
  };

  const filteredStudents = students.filter(s => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  return (
    <div className="space-y-6">
      <PageHeaderBanner
        category="BANK & MOLIYA • FINTECH SIGNATURE"
        title="Kassa, Daromadlar va Xarajatlar Boshqaruvi"
        description="Jiddiy va 100% aniqlikdagi moliyaviy jurnal, kirim/chiqim amallari va avtomatik kassa balansi"
        accent="emerald"
        icon={<DollarSign className="w-3.5 h-3.5" />}
        rightAction={
          <div className="flex gap-2">
            <button onClick={handleExport} className="inline-flex items-center gap-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95">
              <Plus className="h-4 w-4" /> Xarajat qo'shish
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami daromad" value={`${fmt(totalIncome)} so'm`} icon={TrendingUp} iconColor="text-emerald-600 dark:text-emerald-400" trend={{ value: 12, label: '+12%' }} />
        <StatCard title="Jami xarajat" value={`${fmt(totalExpense)} so'm`} icon={TrendingDown} iconColor="text-red-500" trend={{ value: 5, label: '-5%' }} />
        <StatCard title="Sof foyda" value={`${fmt(netProfit)} so'm`} icon={DollarSign} iconColor={netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'} />
        <StatCard title="Xarajat soni" value={expenses.length} icon={BarChart2} iconColor="text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="flex gap-2">
        {(['overview', 'students', 'expenses'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === v ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {v === 'overview' ? 'Umumiy ko\'rinish' : v === 'students' ? 'Kirim (Kassa)' : 'Chiqim (Xarajatlar)'}
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
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                <Area type="monotone" dataKey="income" name="Daromad" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Xarajat" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-emerald-500" /> Xarajat taqsimoti</h3>
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
              <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2"><BarChart2 className="h-4 w-4 text-emerald-500" /> Oylik foyda</h3>
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
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">{e.category}</span>
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

      {view === 'students' && (
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-slate-200 dark:border-dark-border pb-2">
            <button onClick={() => setKirimTab('students')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${kirimTab === 'students' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>To'lov qabul qilish</button>
            <button onClick={() => setKirimTab('history')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${kirimTab === 'history' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Kirimlar tarixi</button>
          </div>

          {kirimTab === 'students' && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="O'quvchini ismi yoki familiyasi bo'yicha izlash..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-dark-border">
                    {['O\'quvchi', 'To\'lov holati', 'Izoh', 'Keyingi to\'lov', 'Tangalar / Aksiyalar', 'Amallar'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={s.photo || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{s.fullName}</p>
                            <p className="text-xs text-slate-500">{s.phone}</p>
                            <p className={`text-xs font-bold mt-0.5 ${s.balance < 0 ? 'text-red-500' : s.balance > 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                              {s.balance < 0 ? `Qarz: ${Math.abs(s.balance).toLocaleString()} so'm` : s.balance > 0 ? `Avans: ${s.balance.toLocaleString()} so'm` : `Balans: 0 so'm`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {editingStudent === s.id ? (
                          <select value={editForm.paymentStatus} onChange={(e) => setEditForm({...editForm, paymentStatus: e.target.value as any})} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs">
                            <option value="paid">To'liq to'lagan</option>
                            <option value="partial">Qisman to'lagan</option>
                            <option value="unpaid">To'lamagan</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : s.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                            {s.paymentStatus === 'paid' ? 'To\'lagan' : s.paymentStatus === 'partial' ? 'Qisman' : 'To\'lamagan'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {editingStudent === s.id ? (
                          <input type="text" placeholder="Izoh..." value={editForm.paymentNote} onChange={(e) => setEditForm({...editForm, paymentNote: e.target.value})} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs w-full max-w-[150px]" />
                        ) : (
                          <span className="text-xs text-slate-500">{s.paymentNote || '-'}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {editingStudent === s.id ? (
                          <input type="date" value={editForm.nextPaymentDate} onChange={(e) => setEditForm({...editForm, nextPaymentDate: e.target.value})} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs" />
                        ) : (
                          <span className="text-xs text-slate-500">{s.nextPaymentDate || '-'}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg"><Coins className="w-3 h-3" /> {s.coins || 0}</span>
                          {!editingStudent && (
                            <>
                              <button onClick={() => handleGiveCoin(s, 30, "Do'st taklif qilgani uchun")} className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-1 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors" title="Do'st taklif qilsa: +30">
                                +30 (Do'st)
                              </button>
                              <button onClick={() => handleGiveCoin(s, 10, "Barvaqt to'lov uchun")} className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-1 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors" title="5-chislogacha to'lasa: +10">
                                +10 (Barvaqt)
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {editingStudent === s.id ? (
                          <div className="flex gap-2">
                            <button onClick={() => saveStudentEdit(s.id)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold">Saqlash</button>
                            <button onClick={() => setEditingStudent(null)} className="text-xs bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded-lg font-bold">Bekor</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedStudentForPayment(s); setPaymentModalOpen(true); }} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">
                              To'lov qabul qilish
                            </button>
                            <button onClick={() => { setEditingStudent(s.id); setEditForm({ paymentStatus: s.paymentStatus || 'unpaid', paymentNote: s.paymentNote || '', nextPaymentDate: s.nextPaymentDate || '' }); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}

          {kirimTab === 'history' && (
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-dark-border">
                      {['Sana', 'O\'quvchi', 'Miqdor', 'Turi', 'Izoh', 'Qabul qildi'].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                    {[...payments].reverse().map((p) => {
                      const student = students.find(s => s.id === p.studentId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-3 text-xs text-slate-500">{p.date}</td>
                          <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{student?.fullName || 'Noma\'lum'}</td>
                          <td className="px-5 py-3 font-bold text-emerald-500">+{p.amount.toLocaleString()} so'm</td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-bold uppercase">{p.type}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-xs max-w-[200px] truncate" title={p.note}>{p.note || '-'}</td>
                          <td className="px-5 py-3 text-slate-500 text-xs">{p.receivedBy}</td>
                        </tr>
                      );
                    })}
                    {payments.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-slate-400">Kirimlar tarixi yo'q</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yangi xarajat" size="md">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kategoriya</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Miqdor (so'm)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="1000000" min={0}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Sana</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Izoh</label>
            <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Xarajat haqida..."
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">Qo'shish</button>
          </div>
        </form>
      </Modal>

      <Modal open={paymentModalOpen} onClose={() => { setPaymentModalOpen(false); setSelectedStudentForPayment(null); setPaymentAmount(''); }} title="To'lov qabul qilish" size="md">
        {selectedStudentForPayment && (
          <form onSubmit={handleAcceptPayment} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-800 dark:text-white text-lg">{selectedStudentForPayment.fullName}</p>
              <p className="text-sm text-slate-500 mb-2">Joriy balans: <span className={selectedStudentForPayment.balance < 0 ? 'text-red-500 font-bold' : selectedStudentForPayment.balance > 0 ? 'text-emerald-500 font-bold' : 'text-slate-500 font-bold'}>
                {selectedStudentForPayment.balance < 0 ? `Qarz: ${Math.abs(selectedStudentForPayment.balance).toLocaleString()} so'm` : selectedStudentForPayment.balance > 0 ? `Avans: ${selectedStudentForPayment.balance.toLocaleString()} so'm` : `0 so'm`}
              </span></p>
              {selectedStudentForPayment.teacherId && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500">Ustoz: <span className="font-semibold text-slate-700 dark:text-slate-300">{teachers.find(t => t.id === selectedStudentForPayment.teacherId)?.fullName || 'Topilmadi'}</span></p>
                  <p className="text-xs text-emerald-500 font-medium mt-1">
                    Ushbu to'lovdan ustoz o'z foizini ({teachers.find(t => t.id === selectedStudentForPayment.teacherId)?.salaryPercentage || 35}%) oladi.
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">To'lov miqdori (so'm)</label>
              <input type="number" min="0" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} required placeholder="Masalan: 300000"
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">To'liq izoh</label>
              <input type="text" value={paymentNoteText} onChange={(e) => setPaymentNoteText(e.target.value)} placeholder="Masalan: 1-kurs qishki oyi uchun to'liq to'lov..."
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            {paymentAmount && paymentAmount > 0 && selectedStudentForPayment.teacherId && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-sm">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Taqsimot:</p>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs">
                  <span>Ustozga ({(teachers.find(t => t.id === selectedStudentForPayment.teacherId)?.salaryPercentage || 35)}%):</span>
                  <span className="font-bold">{((Number(paymentAmount) * (teachers.find(t => t.id === selectedStudentForPayment.teacherId)?.salaryPercentage || 35)) / 100).toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
                  <span>Akademiyaga:</span>
                  <span className="font-bold">{(Number(paymentAmount) - ((Number(paymentAmount) * (teachers.find(t => t.id === selectedStudentForPayment.teacherId)?.salaryPercentage || 35)) / 100)).toLocaleString()} so'm</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setPaymentModalOpen(false); setSelectedStudentForPayment(null); setPaymentAmount(''); setPaymentNoteText(''); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Bekor</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/30">Tasdiqlash</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
