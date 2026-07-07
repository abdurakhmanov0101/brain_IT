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

const sampleRecords: AttendanceRecord[] = [
  { id: 'ar1', studentId: 'st1', groupId: 'g1', date: daysAgo(14), status: 'present', checkedBy: 'manual', deductionApplied: true },
  { id: 'ar2', studentId: 'st2', groupId: 'g1', date: daysAgo(14), status: 'absent', checkedBy: 'manual', deductionApplied: false },
  { id: 'ar3', studentId: 'st9', groupId: 'g1', date: daysAgo(14), status: 'present', checkedBy: 'qr', deductionApplied: true },
  { id: 'ar4', studentId: 'st16', groupId: 'g1', date: daysAgo(14), status: 'late', checkedBy: 'manual', deductionApplied: true },
  { id: 'ar5', studentId: 'st1', groupId: 'g1', date: daysAgo(12), status: 'present', checkedBy: 'face_id', deductionApplied: true },
  { id: 'ar6', studentId: 'st2', groupId: 'g1', date: daysAgo(12), status: 'present', checkedBy: 'manual', deductionApplied: true },
  { id: 'ar7', studentId: 'st9', groupId: 'g1', date: daysAgo(12), status: 'excused', checkedBy: 'manual', deductionApplied: false },
  { id: 'ar8', studentId: 'st16', groupId: 'g1', date: daysAgo(12), status: 'present', checkedBy: 'qr', deductionApplied: true },
  { id: 'ar9', studentId: 'st1', groupId: 'g1', date: daysAgo(7), status: 'present', checkedBy: 'face_id', deductionApplied: true },
  { id: 'ar10', studentId: 'st2', groupId: 'g1', date: daysAgo(7), status: 'late', checkedBy: 'manual', deductionApplied: true },
  { id: 'ar11', studentId: 'st3', groupId: 'g2', date: daysAgo(13), status: 'present', checkedBy: 'manual', deductionApplied: true },
  { id: 'ar12', studentId: 'st4', groupId: 'g2', date: daysAgo(13), status: 'present', checkedBy: 'qr', deductionApplied: true },
  { id: 'ar13', studentId: 'st11', groupId: 'g2', date: daysAgo(13), status: 'absent', checkedBy: 'manual', deductionApplied: false },
  { id: 'ar14', studentId: 'st18', groupId: 'g2', date: daysAgo(13), status: 'present', checkedBy: 'face_id', deductionApplied: true },
  { id: 'ar15', studentId: 'st3', groupId: 'g2', date: daysAgo(6), status: 'absent', checkedBy: 'manual', deductionApplied: false },
  { id: 'ar16', studentId: 'st4', groupId: 'g2', date: daysAgo(6), status: 'present', checkedBy: 'manual', deductionApplied: true },
  { id: 'ar17', studentId: 'st5', groupId: 'g3', date: daysAgo(14), status: 'present', checkedBy: 'qr', deductionApplied: true },
  { id: 'ar18', studentId: 'st6', groupId: 'g3', date: daysAgo(14), status: 'present', checkedBy: 'manual', deductionApplied: true },
  { id: 'ar19', studentId: 'st5', groupId: 'g3', date: daysAgo(7), status: 'late', checkedBy: 'manual', deductionApplied: true },
  { id: 'ar20', studentId: 'st6', groupId: 'g3', date: daysAgo(7), status: 'excused', checkedBy: 'manual', deductionApplied: false },
];

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
    { name: 'brain-it-attendance' }
  )
);
