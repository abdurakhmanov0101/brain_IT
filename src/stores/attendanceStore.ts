import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'first_lesson';
  checkedBy: 'manual' | 'qr' | 'face_id';
  deductionApplied: boolean;
  grade?: number;
}

interface AttendanceState {
  records: AttendanceRecord[];
  markAttendance: (r: Omit<AttendanceRecord, 'id'>) => string;
  updateRecord: (id: string, patch: Partial<AttendanceRecord>) => void;
  deleteRecord: (studentId: string, groupId: string, date: string) => void;
  getByGroup: (groupId: string, date?: string) => AttendanceRecord[];
  getByStudent: (studentId: string) => AttendanceRecord[];
  getStudentMonthlyRate: (studentId: string, month: string) => number;
}

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };

const sampleRecords: AttendanceRecord[] = [];

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      records: sampleRecords,
      markAttendance: (r) => {
        const existing = get().records.find(
          (x) => x.studentId === r.studentId && x.groupId === r.groupId && x.date === r.date
        );
        if (existing) {
          set((s) => ({ records: s.records.map((x) => x.id === existing.id ? { ...x, ...r } : x) }));
          return existing.id;
        }
        const id = `ar${Date.now()}`;
        set((s) => ({ records: [...s.records, { ...r, id }] }));
        return id;
      },
      updateRecord: (id, patch) => set((s) => ({
        records: s.records.map((r) => r.id === id ? { ...r, ...patch } : r)
      })),
      deleteRecord: (studentId, groupId, date) => set((s) => ({
        records: s.records.filter((r) => !(r.studentId === studentId && r.groupId === groupId && r.date === date))
      })),
      getByGroup: (groupId, date) => {
        const all = get().records.filter((r) => r.groupId === groupId);
        return date ? all.filter((r) => r.date === date) : all;
      },
      getByStudent: (studentId) => get().records.filter((r) => r.studentId === studentId),
      getStudentMonthlyRate: (studentId, month) => {
        const records = get().records.filter((r) => r.studentId === studentId && r.date.startsWith(month));
        if (!records.length) return 0;
        const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
        return Math.round((present / records.length) * 100);
      },
    }),
    { name: 'brain-it-attendanceStore-v12' }
  )
);
