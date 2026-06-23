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
    username: 'superadmin',
    password: 'BrainIT@2025',
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
  { username: 'bobur',   password: 'bobur123',   user: { id: 'tr1', name: 'Bobur Akbarov',   role: 'Teacher', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop' } },
  { username: 'jasur',   password: 'jasur123',   user: { id: 'tr2', name: 'Jasur Shodiev',   role: 'Teacher', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop' } },
  { username: 'nodira',  password: 'nodira123',  user: { id: 'tr3', name: 'Nodira Rahimova', role: 'Teacher', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' } },
  { username: 'akbar',   password: 'akbar123',   user: { id: 'tr4', name: 'Akbar Toshmatov', role: 'Teacher', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' } },
  { username: 'dilnoza', password: 'dilnoza123', user: { id: 'tr5', name: 'Dilnoza Yusupova',role: 'Teacher', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop' } },
  { username: 'sardor',  password: 'sardor123',  user: { id: 'tr6', name: 'Sardor Rahimov',  role: 'Teacher', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop' } },
  { username: 'nilufar', password: 'nilufar123', user: { id: 'tr7', name: 'Nilufar Karimova',role: 'Teacher', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' } },
  { username: 'zulfiya', password: 'zulfiya123', user: { id: 'tr8', name: 'Zulfiya Nazarova',role: 'Teacher', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop' } },
];
