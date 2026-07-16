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

const initialPayroll: PayrollRecord[] = [];

const initialExpenses: Expense[] = [];

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
}), { name: 'brain-it-financeStore-v11' }));
