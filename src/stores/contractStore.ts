import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ContractType = 'student' | 'employee';

export interface Contract {
  id: string;
  type: ContractType;
  // For student contracts
  studentId?: string;
  courseId?: string;
  parentName?: string;
  // For employee contracts
  employeeId?: string;  // teacher id
  position?: string;
  salaryAmount?: number;
  contractDurationYears?: number;
  // Shared
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'active' | 'expired' | 'pending';
  signedDate?: string;
  leadId?: string;
  // Contract number
  contractNumber?: string;
}

interface ContractState {
  contracts: Contract[];
  addContract: (c: Omit<Contract, 'id'>) => string;
  updateContract: (id: string, patch: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
}

const initial: Contract[] = [];

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
    { name: 'brain-it-contractStore-v10' }
  )
);
