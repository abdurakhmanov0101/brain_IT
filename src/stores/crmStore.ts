import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Lead, leads as initialLeads } from '../data/mockData';

interface CRMState {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'status' | 'date'>) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  deleteLead: (id: string) => void;
  setLeads: (leads: Lead[]) => void;
}

export const useCrmStore = create<CRMState>()(
  persist(
    (set) => ({
      leads: [],
      addLead: (data) =>
        set((state) => ({
          leads: [
            ...state.leads,
            {
              id: `ld_${Date.now()}`,
              ...data,
              status: 'new',
              date: new Date().toISOString().split('T')[0],
            },
          ],
        })),
      updateLeadStatus: (id, status) =>
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, status } : l)),
        })),
      deleteLead: (id) =>
        set((state) => ({
          leads: state.leads.filter((l) => l.id !== id),
        })),
      setLeads: (leads) => set({ leads }),
    }),
    { name: 'brain-it-crm-leads' }
  )
);
