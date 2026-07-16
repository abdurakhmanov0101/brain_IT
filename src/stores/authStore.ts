import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTeacherStore } from './teacherStore';
import { useStudentStore } from './studentStore';

export type AuthRoleType =
  | 'Super Admin'
  | 'Academy Director'
  | 'Teacher'
  | 'Student'
  | 'Parent'
  | 'Company Director'
  | 'Project Manager'
  | 'Developer'
  | 'Staff'
  | 'Client';

export interface AuthUserType {
  id: string;
  name: string;
  role: AuthRoleType;
  avatar?: string;
  studentId?: string;
  email?: string;
}

interface AuthState {
  currentUser: AuthUserType | null;
  token: string | null;
  setUser: (user: AuthUserType, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      setUser: (user, token) => set({ currentUser: user, token }),
      logout: () => set({ currentUser: null, token: null }),
    }),
    { name: 'brain-it-authStore-v12' }
  )
);

// ─── Login ──────────────────────────────────────────────────────────────────
// Tizimda yagona Super Admin: avazbek / jummanazarov
// Ustoz va o'quvchilar o'z tizimdan kiritilgan login/parollari orqali kiradi
export const mockLogin = async (
  username: string,
  password: string
): Promise<{ user: AuthUserType; token: string } | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // ── 1. Super Admin ───────────────────────────────────────────────────
      if (username === 'avazbek' && password === 'jummanazarov') {
        return resolve({
          user: {
            id: 'u_superadmin',
            name: 'Avazbek Jummanazarov',
            role: 'Super Admin',
            avatar: undefined,
          },
          token: `jwt_${Date.now()}`,
        });
      }

      // ── 2. Ustozlar ─────────────────────────────────────────────────────
      const foundTeacher = useTeacherStore
        .getState()
        .teachers.find(
          (t) => t.username === username && t.password === password
        );
      if (foundTeacher) {
        return resolve({
          user: {
            id: foundTeacher.id,
            name: foundTeacher.fullName,
            role: 'Teacher',
            avatar: foundTeacher.photo || undefined,
          },
          token: `jwt_${Date.now()}`,
        });
      }

      // ── 3. O'quvchilar ───────────────────────────────────────────────────
      const foundStudent = useStudentStore
        .getState()
        .students.find(
          (s) =>
            s.studentUsername === username && s.studentPassword === password
        );
      if (foundStudent) {
        return resolve({
          user: {
            id: `u_${foundStudent.id}`,
            name: foundStudent.fullName,
            role: 'Student',
            avatar: foundStudent.photo || undefined,
            studentId: foundStudent.id,
          },
          token: `jwt_${Date.now()}`,
        });
      }

      // Topilmadi
      resolve(null);
    }, 400);
  });
};
