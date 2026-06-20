import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthRole =
  | 'Super Admin'
  | 'Academy Director'
  | 'Teacher'
  | 'Student'
  | 'Parent'
  | 'Company Director'
  | 'Project Manager'
  | 'Developer'
  | 'Client';

export interface AuthUser {
  id: string;
  name: string;
  role: AuthRole;
  avatar?: string;
  studentId?: string;
}

interface AuthState {
  currentUser: AuthUser | null;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      setUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
    }),
    { name: 'brain-it-auth' }
  )
);

export const ADMIN_ACCOUNTS: Array<{ username: string; password: string; user: AuthUser }> = [
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: 'admin1',
      name: 'Super Admin',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
    },
  },
  {
    username: 'director',
    password: 'director123',
    user: {
      id: 'admin2',
      name: 'Feruza Salimova',
      role: 'Academy Director',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    },
  },
];
