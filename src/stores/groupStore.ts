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

[];

export const useGroupStore = create<GroupState>()(persist((set) => ({
  groups: [],
  addGroup: (g) => {
    const id = `g${Date.now()}`;
    set((s) => ({ groups: [...s.groups, { ...g, id, studentIds: [] }] }));
    return id;
  },
  updateGroup: (id, patch) => set((s) => ({ groups: s.groups.map((g) => g.id === id ? { ...g, ...patch } : g) })),
  deleteGroup: (id) => set((s) => ({ groups: s.groups.map((g) => g.id === id ? { ...g, status: 'archived' as const } : g) })),
  addStudentToGroup: (groupId, studentId) => {
    const g = useGroupStore.getState().groups.find(x => x.id === groupId);
    if (g && g.studentIds.length >= g.maxStudents) return;
    set((s) => ({
      groups: s.groups.map((g) => {
        if (g.id !== groupId || g.studentIds.includes(studentId) || g.studentIds.length >= g.maxStudents) return g;
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
}), { name: 'brain-it-groups-clean-v1-prod-v1' }));
