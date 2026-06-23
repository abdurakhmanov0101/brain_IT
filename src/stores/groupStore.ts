import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useStudentStore } from './studentStore';

export interface Group {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  schedule: { days: string[]; time: string };
  room: string;
  maxStudents: number;
  status: 'active' | 'full' | 'archived';
  studentIds: string[];
  startDate: string;
}

interface GroupState {
  groups: Group[];
  addGroup: (g: Omit<Group, 'id' | 'studentIds'>) => string;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addStudentToGroup: (groupId: string, studentId: string) => void;
  removeStudentFromGroup: (groupId: string, studentId: string) => void;
}

const initialGroups: Group[] = [
  { id: 'g1', name: 'Frontend G-1', courseId: 'ac2', teacherId: 'tr1', schedule: { days: ['Dushanba', 'Chorshanba', 'Juma'], time: '10:00' }, room: '101-xona', maxStudents: 12, status: 'active', studentIds: ['st1', 'st2', 'st9', 'st16'], startDate: '2026-02-01' },
  { id: 'g2', name: 'Backend G-1', courseId: 'ac3', teacherId: 'tr2', schedule: { days: ['Seshanba', 'Payshanba', 'Shanba'], time: '14:00' }, room: '102-xona', maxStudents: 10, status: 'active', studentIds: ['st3', 'st4', 'st11', 'st18'], startDate: '2026-01-15' },
  { id: 'g3', name: 'IT Foundation G-2', courseId: 'ac1', teacherId: 'tr3', schedule: { days: ['Dushanba', 'Chorshanba', 'Juma'], time: '16:00' }, room: '103-xona', maxStudents: 15, status: 'active', studentIds: ['st5', 'st6', 'st14', 'st20'], startDate: '2026-03-01' },
  { id: 'g4', name: 'Suniy Intellekt G-1', courseId: 'ac4', teacherId: 'tr4', schedule: { days: ['Seshanba', 'Payshanba'], time: '11:00' }, room: '104-xona', maxStudents: 10, status: 'active', studentIds: ['st7', 'st8', 'st15'], startDate: '2026-04-01' },
  { id: 'g5', name: 'English for IT G-1', courseId: 'ac8', teacherId: 'tr5', schedule: { days: ['Dushanba', 'Chorshanba', 'Juma'], time: '09:00' }, room: '105-xona', maxStudents: 12, status: 'active', studentIds: ['st9', 'st10', 'st17'], startDate: '2026-05-01' },
  { id: 'g6', name: 'Kiberxavfsizlik G-1', courseId: 'ac5', teacherId: 'tr6', schedule: { days: ['Seshanba', 'Payshanba', 'Shanba'], time: '17:00' }, room: '106-xona', maxStudents: 10, status: 'active', studentIds: ['st12', 'st13', 'st19'], startDate: '2026-05-15' },
];

export const useGroupStore = create<GroupState>()(persist((set) => ({
  groups: initialGroups,
  addGroup: (g) => {
    const id = `g${Date.now()}`;
    set((s) => ({ groups: [...s.groups, { ...g, id, studentIds: [] }] }));
    return id;
  },
  updateGroup: (id, patch) => set((s) => ({ groups: s.groups.map((g) => g.id === id ? { ...g, ...patch } : g) })),
  deleteGroup: (id) => set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),
  addStudentToGroup: (groupId, studentId) => {
    set((s) => ({
      groups: s.groups.map((g) => {
        if (g.id !== groupId || g.studentIds.includes(studentId)) return g;
        const updated = { ...g, studentIds: [...g.studentIds, studentId] };
        if (updated.studentIds.length >= updated.maxStudents) updated.status = 'full';
        return updated;
      })
    }));
    const student = useStudentStore.getState().students.find((s) => s.id === studentId);
    if (student && !student.groupIds.includes(groupId)) {
      useStudentStore.getState().updateStudent(studentId, { groupIds: [...student.groupIds, groupId] });
    }
  },
  removeStudentFromGroup: (groupId, studentId) => {
    set((s) => ({
      groups: s.groups.map((g) => g.id === groupId
        ? { ...g, studentIds: g.studentIds.filter((id) => id !== studentId), status: g.status === 'full' ? 'active' : g.status }
        : g)
    }));
    const student = useStudentStore.getState().students.find((s) => s.id === studentId);
    if (student) {
      useStudentStore.getState().updateStudent(studentId, { groupIds: student.groupIds.filter((id) => id !== groupId) });
    }
  },
}), { name: 'brain-it-groups' }));
