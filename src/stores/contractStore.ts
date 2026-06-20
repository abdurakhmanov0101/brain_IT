import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Contract {
  id: string;
  studentId: string;
  courseId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'active' | 'expired' | 'pending';
  signedDate?: string;
  leadId?: string;
}

interface ContractState {
  contracts: Contract[];
  addContract: (c: Omit<Contract, 'id'>) => string;
  updateContract: (id: string, patch: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
}

const initial: Contract[] = [
  { id: 'ct1', studentId: 'st1', courseId: 'ac2', startDate: '2026-02-01', endDate: '2026-06-01', totalPrice: 16000000, status: 'active', signedDate: '2026-02-01' },
  { id: 'ct2', studentId: 'st2', courseId: 'ac2', startDate: '2026-02-05', endDate: '2026-06-05', totalPrice: 16000000, status: 'active', signedDate: '2026-02-05' },
  { id: 'ct3', studentId: 'st3', courseId: 'ac3', startDate: '2026-01-15', endDate: '2026-06-15', totalPrice: 22500000, status: 'active', signedDate: '2026-01-15' },
  { id: 'ct4', studentId: 'st7', courseId: 'ac4', startDate: '2026-04-01', endDate: '2026-09-01', totalPrice: 26000000, status: 'pending' },
];

export const useContractStore = create<ContractState>()(
  persist(
    (set) => ({
      contracts: initial,
      addContract: (c) => {
        const id = `ct${Date.now()}`;
        set((s) => ({ contracts: [...s.contracts, { ...c, id }] }));
        return id;
      },
      updateContract: (id, patch) => set((s) => ({
        contracts: s.contracts.map((c) => c.id === id ? { ...c, ...patch } : c)
      })),
      deleteContract: (id) => set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) })),
    }),
    { name: 'brain-it-contracts' }
  )
);
