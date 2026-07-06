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

export const initialTeachers: Teacher[] = [
  { id: 'tr1', fullName: 'Bobur Akbarov',   phone: '+998901112233', email: 'bobur@brainit.uz',   photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', courseIds: ['ac2'], groupIds: ['g1'], hiredDate: '2024-09-01', status: 'active',   specialization: 'Frontend',           username: 'bobur',   password: 'Bobur@2025',   coins: 100, salaryPercentage: 35, salaryBalance: 0 },
  { id: 'tr2', fullName: 'Jasur Shodiev',    phone: '+998902223344', email: 'jasur@brainit.uz',   photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop', courseIds: ['ac3'], groupIds: ['g2'], hiredDate: '2024-09-01', status: 'active',   specialization: 'Backend',            username: 'jasur',   password: 'Jasur@2025',   coins: 100, salaryPercentage: 40, salaryBalance: 0 },
  { id: 'tr3', fullName: 'Nodira Rahimova',  phone: '+998903334455', email: 'nodira@brainit.uz',  photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', courseIds: ['ac1'], groupIds: ['g3'], hiredDate: '2025-01-15', status: 'active',   specialization: 'Foundation',         username: 'nodira',  password: 'Nodira@2025',  coins: 50,  salaryPercentage: 30, salaryBalance: 0 },
  { id: 'tr4', fullName: 'Akbar Toshmatov',  phone: '+998904445566', email: 'akbar@brainit.uz',   photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', courseIds: ['ac4'], groupIds: ['g4'], hiredDate: '2025-03-01', status: 'active',   specialization: 'AI/ML',              username: 'akbar',   password: 'Akbar@2025',   coins: 0,   salaryPercentage: 45, salaryBalance: 0 },
  { id: 'tr5', fullName: 'Dilnoza Yusupova', phone: '+998905556677', email: 'dilnoza@brainit.uz', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop', courseIds: ['ac8'], groupIds: ['g5'], hiredDate: '2025-02-01', status: 'active',   specialization: 'English',            username: 'dilnoza', password: 'Dilnoza@2025', coins: 0,   salaryPercentage: 30, salaryBalance: 0 },
  { id: 'tr6', fullName: 'Sardor Rahimov',   phone: '+998906667788', email: 'sardor@brainit.uz',  photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop', courseIds: ['ac5'], groupIds: ['g6'], hiredDate: '2025-04-01', status: 'active',   specialization: 'Cybersecurity',      username: 'sardor',  password: 'Sardor@2025',  coins: 0,   salaryPercentage: 50, salaryBalance: 0 },
  { id: 'tr7', fullName: 'Nilufar Karimova', phone: '+998907778899', email: 'nilufar@brainit.uz', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', courseIds: ['ac7'], groupIds: [],    hiredDate: '2025-05-01', status: 'active',   specialization: 'IT Kids',            username: 'nilufar', password: 'Nilufar@2025', coins: 0,   salaryPercentage: 35, salaryBalance: 0 },
  { id: 'tr8', fullName: 'Zulfiya Nazarova', phone: '+998908889900', email: 'zulfiya@brainit.uz', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop', courseIds: ['ac6'], groupIds: [],    hiredDate: '2025-06-01', status: 'vacation', specialization: 'Computer Literacy',  username: 'zulfiya', password: 'Zulfiya@2025', coins: 0,   salaryPercentage: 35, salaryBalance: 0 },
];

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
    { name: 'teacher-store' }
  )
);
