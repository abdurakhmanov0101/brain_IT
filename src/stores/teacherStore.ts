import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  photo: string;
  courseIds: string[];
  groupIds: string[];
  hiredDate: string;
  status: 'active' | 'vacation' | 'fired';
  specialization: string;
  username: string;
  password: string;
  coins: number;
  salaryPercentage: number;
  salaryBalance: number;
}

interface TeacherState {
  teachers: Teacher[];
  addTeacher: (t: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
}

export const initialTeachers: Teacher[] = [];

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set) => ({
      teachers: initialTeachers,
      addTeacher: (t) => set((s) => ({ teachers: [...s.teachers, { ...t, id: `tr${Date.now()}` }] })),
      updateTeacher: (id, patch) => set((s) => ({
        teachers: s.teachers.map((t) => t.id === id ? { ...t, ...patch } : t),
      })),
      deleteTeacher: (id) => set((s) => ({ teachers: s.teachers.filter((t) => t.id !== id) })),
    }),
    { name: 'brain-it-teacherStore-v10' }
  )
);
