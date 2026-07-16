import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Staff {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  fixedSalary: number;
  salaryBalance: number;
  hiredDate: string;
  username: string;
  password: string;
}

interface StaffState {
  staffList: Staff[];
  addStaff: (s: Omit<Staff, 'id' | 'username' | 'password'>) => void;
  updateStaff: (id: string, patch: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
}

const generateUsername = (name: string) => name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') + Math.floor(Math.random() * 100);
const generatePassword = () => Math.random().toString(36).slice(-8);

const initialStaff: Staff[] = [];

export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      staffList: initialStaff,
      addStaff: (s) => set((state) => ({
        staffList: [...state.staffList, {
          ...s,
          id: `stf${Date.now()}`,
          username: generateUsername(s.fullName),
          password: generatePassword()
        }]
      })),
      updateStaff: (id, patch) => set((state) => ({
        staffList: state.staffList.map((stf) => stf.id === id ? { ...stf, ...patch } : stf),
      })),
      deleteStaff: (id) => set((state) => ({ staffList: state.staffList.filter((stf) => stf.id !== id) })),
    }),
    { name: 'staff-store-prod-v4' }
  )
);
