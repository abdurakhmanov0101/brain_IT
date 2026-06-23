import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';
import { exportCSV } from '../../utils/exportCSV';

const MONTHLY_FINANCE = [
  { month: 'Yan', income: 95, expense: 52, profit: 43 },
  { month: 'Fev', income: 102, expense: 55, profit: 47 },
  { month: 'Mar', income: 118, expense: 60, profit: 58 },
  { month: 'Apr', income: 108, expense: 58, profit: 50 },
  { month: 'May', income: 132, expense: 65, profit: 67 },
  { month: 'Iyn', income: 142, expense: 68, profit: 74 },
];

const GROUP_ATTENDANCE = [
  { group: 'Python A', present: 14, late: 2, absent: 1 },
  { group: 'Python B', present: 11, late: 3, absent: 3 },
  { group: 'React A',  present: 16, late: 1, absent: 0 },
  { group: 'React B',  present: 10, late: 4, absent: 2 },
  { group: 'Flutter',  present: 12, late: 2, absent: 1 },
  { group: 'DevOps',   present: 8,  late: 1, absent: 2 },
];

const STUDENT_STATUS = [
  { name: 'Faol',         value: 892, color: '#6366f1' },
  { name: 'Muzlatilgan',  value: 87,  color: '#f59e0b' },
  { name: "To'xtatilgan", value: 156, color: '#ef4444' },
  { name: 'Bitiruvchi',   value: 412, color: '#10b981' },
];

const LEAD_SOURCES = [
  { name: 'Instagram', value: 38, color: '#6366f1' },
  { name: 'Telegram',  value: 24, color: '#06b6d4' },
  { name: 'Facebook',  value: 15, color: '#3b82f6' },
  { name: 'Referral',  value: 12, color: '#10b981' },
  { name: 'Website',   value: 8,  color: '#f59e0b' },
  { name: 'YouTube',   value: 3,  color: '#ef4444' },
];

const KPI_CARDS = [
  { label: 'Oylik Daromad',  value: '142.5M', unit: "so'm", change: '+8.2%',  icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
  { label: 'Faol Talabalar', value: '1,248',  unit: 'ta',   change: '+12.5%', icon: Users,      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
  { label: 'Konversiya',     value: '62',     unit: '%',    change: '+3.1%',  icon: TrendingUp, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  { label: 'Davomat',        value: '88',     unit: '%',    change: '+1.4%',  icon: CheckCircle,color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
];

type TabKey = 'finance' | 'attendance' | 'students' | 'leads';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('finance');

  const handleExport = () => {
    const map = {
      finance:    { data: MONTHLY_FINANCE,    name: 'moliya_hisoboti' },
      attendance: { data: GROUP_ATTENDANCE,   name: 'davomat_hisoboti' },
      students:   { data: STUDENT_STATUS,     name: 'talabalar_holati' },
      leads:      { data: LEAD_SOURCES,       name: 'lead_manbalar' },
    };
    const { data, name } = map[activeTab];
    exportCSV(data as unknown as Record<string, unknown>[], name);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Hisobotlar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tahliliy ko'rsatkichlar va grafiklar</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Download className="h-4 w-4" /> CSV Yuklab olish
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <div className={`p-2.5 rounded-xl inline-block mb-3 ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-xl text-slate-900 dark:text-white">{s.value}</span>
              <span className="text-xs text-slate-400">{s.unit}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" />{s.change}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([['finance', 'Moliya'], ['attendance', 'Davomat'], ['students', 'Talabalar'], ['leads', 'Leadlar']] as [TabKey, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === k ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {l}
          </button>
        ))}
      </div>

      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4">Oylik Daromad / Xarajat (M so'm)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_FINANCE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}M so'm`]} />
                <Legend />
                <Area type="monotone" dataKey="income"  stroke="#6366f1" fill="#6366f120" name="Daromad" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#ef444420" name="Xarajat" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4">Oylik Foyda (M so'm)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_FINANCE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}M so'm`]} />
                <Bar dataKey="profit" fill="#10b981" name="Foyda" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
          <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4">Guruhlar bo'yicha davomat</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={GROUP_ATTENDANCE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="group" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Keldi"     stackId="a" />
              <Bar dataKey="late"    fill="#f59e0b" name="Kechikkan" stackId="a" />
              <Bar dataKey="absent"  fill="#ef4444" name="Kelmadi"   radius={[2, 2, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4">Talabalar holati</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={STUDENT_STATUS} dataKey="value" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {STUDENT_STATUS.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4">Tafsilot</h3>
            <div className="space-y-3">
              {STUDENT_STATUS.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ background: s.color }} /><span className="text-slate-700 dark:text-slate-300">{s.name}</span></div>
                  <span className="font-bold text-slate-800 dark:text-white">{s.value} ta</span>
                </div>
              ))}
              <div className="border-t border-slate-100 dark:border-dark-border pt-3 flex justify-between text-sm font-bold text-slate-800 dark:text-white">
                <span>Jami</span><span>{STUDENT_STATUS.reduce((s, v) => s + v.value, 0)} ta</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4">Lead manbalari (%)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={LEAD_SOURCES} dataKey="value" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                  {LEAD_SOURCES.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white mb-4">Manbalar tafsiloti</h3>
            <div className="space-y-3">
              {LEAD_SOURCES.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{s.name}</span>
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <div className="h-full rounded-full" style={{ background: s.color, width: `${s.value}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white w-8 text-right">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
