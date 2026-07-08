import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AttendanceLog, initialAttendance } from '../data/mockData';

interface FaceIDState {
  logs: AttendanceLog[];
  setLogs: (logs: AttendanceLog[]) => void;
  addLog: (log: AttendanceLog) => void;
}

export const useFaceidStore = create<FaceIDState>()(
  persist(
    (set) => ({
      logs: initialAttendance,
      setLogs: (logs) => set({ logs }),
      addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
    }),
    { name: 'brain-it-faceid-logs-prod-v1' }
  )
);
