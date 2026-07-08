import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExpenseCategory = 'Ustoz maoshi' | 'Ijara' | 'Kommunal' | 'Marketing' | 'Jihozlar' | 'Boshqa';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note: string;
  createdBy: string;
}

export interface PayrollRecord {
  id: string;
  teacherId: string;
  month: string;
  lessonsCount: number;
  totalAmount: number;
  status: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  paidDate?: string;
}

interface FinanceState {
  expenses: Expense[];
  payrollRecords: PayrollRecord[];
  addExpense: (e: Omit<Expense, 'id'>) => void;
  updatePayroll: (id: string, patch: Partial<PayrollRecord>) => void;
  addPayrollRecord: (r: Omit<PayrollRecord, 'id'>) => void;
  getTotalIncome: (payments: { amount: number; date: string }[], month?: string) => number;
  getTotalExpenses: (month?: string) => number;
  getMonthlyStats: (payments: { amount: number; date: string }[]) => { month: string; income: number; expense: number }[];
}

const initialPayroll: PayrollRecord[] = [
  { id: 'pr1', teacherId: 'tr1', month: '2026-04', lessonsCount: 12, totalAmount: 1680000, status: 'paid', paidAmount: 1680000, paidDate: '2026-05-01' },
  { id: 'pr2', teacherId: 'tr2', month: '2026-04', lessonsCount: 13, totalAmount: 2047500, status: 'paid', paidAmount: 2047500, paidDate: '2026-05-01' },
  { id: 'pr3', teacherId: 'tr3', month: '2026-04', lessonsCount: 12, totalAmount: 1050000, status: 'paid', paidAmount: 1050000, paidDate: '2026-05-01' },
  { id: 'pr4', teacherId: 'tr4', month: '2026-04', lessonsCount: 8, totalAmount: 1386666, status: 'paid', paidAmount: 1386666, paidDate: '2026-05-01' },
  { id: 'pr5', teacherId: 'tr1', month: '2026-05', lessonsCount: 13, totalAmount: 1820000, status: 'paid', paidAmount: 1820000, paidDate: '2026-06-02' },
  { id: 'pr6', teacherId: 'tr2', month: '2026-05', lessonsCount: 12, totalAmount: 1890000, status: 'paid', paidAmount: 1890000, paidDate: '2026-06-02' },
  { id: 'pr7', teacherId: 'tr3', month: '2026-05', lessonsCount: 13, totalAmount: 1137500, status: 'partial', paidAmount: 800000 },
  { id: 'pr8', teacherId: 'tr5', month: '2026-05', lessonsCount: 12, totalAmount: 940800, status: 'paid', paidAmount: 940800, paidDate: '2026-06-02' },
  { id: 'pr9', teacherId: 'tr1', month: '2026-06', lessonsCount: 8, totalAmount: 1120000, status: 'pending', paidAmount: 0 },
  { id: 'pr10', teacherId: 'tr2', month: '2026-06', lessonsCount: 9, totalAmount: 1417500, status: 'pending', paidAmount: 0 },
  { id: 'pr11', teacherId: 'tr4', month: '2026-06', lessonsCount: 7, totalAmount: 1213333, status: 'pending', paidAmount: 0 },
  { id: 'pr12', teacherId: 'tr6', month: '2026-06', lessonsCount: 8, totalAmount: 1486400, status: 'pending', paidAmount: 0 },
];

const initialExpenses: Expense[] = [
  { id: 'exp1', category: 'Ijara', amount: 5000000, date: '2026-04-01', note: 'Aprel ijarasi', createdBy: 'Feruza Salimova' },
  { id: 'exp2', category: 'Kommunal', amount: 800000, date: '2026-04-05', note: 'Elektr, suv, internet', createdBy: 'Feruza Salimova' },
  { id: 'exp3', category: 'Marketing', amount: 2000000, date: '2026-04-10', note: 'Instagram reklama', createdBy: 'Feruza Salimova' },
  { id: 'exp4', category: 'Jihozlar', amount: 3500000, date: '2026-04-15', note: 'Proyektor sotib olish', createdBy: 'Admin' },
  { id: 'exp5', category: 'Ijara', amount: 5000000, date: '2026-05-01', note: 'May ijarasi', createdBy: 'Feruza Salimova' },
  { id: 'exp6', category: 'Kommunal', amount: 750000, date: '2026-05-05', note: 'May kommunal', createdBy: 'Feruza Salimova' },
  { id: 'exp7', category: 'Marketing', amount: 1500000, date: '2026-05-12', note: 'Telegram kanalda reklama', createdBy: 'Admin' },
  { id: 'exp8', category: 'Boshqa', amount: 500000, date: '2026-05-20', note: 'Ofis buyumlari', createdBy: 'Feruza Salimova' },
  { id: 'exp9', category: 'Ijara', amount: 5000000, date: '2026-06-01', note: 'Iyun ijarasi', createdBy: 'Feruza Salimova' },
  { id: 'exp10', category: 'Kommunal', amount: 820000, date: '2026-06-05', note: 'Iyun kommunal', createdBy: 'Admin' },
  { id: 'exp11', category: 'Marketing', amount: 2500000, date: '2026-06-08', note: 'SMM va reklama', createdBy: 'Feruza Salimova' },
];

export const useFinanceStore = create<FinanceState>()(persist((set, get) => ({
  expenses: initialExpenses,
  payrollRecords: initialPayroll,
  addExpense: (e) => set((s) => ({ expenses: [...s.expenses, { ...e, id: `exp${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }] })),
  updatePayroll: (id, patch) => set((s) => ({ payrollRecords: s.payrollRecords.map((r) => r.id === id ? { ...r, ...patch } : r) })),
  addPayrollRecord: (r) => set((s) => ({ payrollRecords: [...s.payrollRecords, { ...r, id: `pr${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }] })),
  getTotalIncome: (payments, month) => {
    const filtered = month ? payments.filter((p) => p.date.startsWith(month)) : payments;
    return filtered.reduce((sum, p) => sum + p.amount, 0);
  },
  getTotalExpenses: (month) => {
    const filtered = month ? get().expenses.filter((e) => e.date.startsWith(month)) : get().expenses;
    return filtered.reduce((sum, e) => sum + e.amount, 0);
  },
  getMonthlyStats: (payments) => {
    const monthSet = new Set([...payments.map((p) => p.date.slice(0, 7)), ...get().expenses.map((e) => e.date.slice(0, 7))]);
    return Array.from(monthSet).sort().map((month) => ({
      month,
      income: payments.filter((p) => p.date.startsWith(month)).reduce((s, p) => s + p.amount, 0),
      expense: get().expenses.filter((e) => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0),
    }));
  },
}), { name: 'brain-it-finance-prod-v3' }));
