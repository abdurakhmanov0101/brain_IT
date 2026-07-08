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
    { name: 'brain-it-auth-clean-v1-prod-v1' }
  )
);

// Mock login API call
export const mockLogin = async (username: string, password: string):Promise<{user: AuthUserType, token: string} | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would be an API call verifying a hashed password.
      const validLogins: Record<string, string> = {
        'superadmin': 'BrainIT@2025',
        'director': 'director123',
        'avaazbek': 'hello1212',
        'umid': 'Umid@2025',
        'jahongir': 'Jahongir@2025',
        'student1': '123',
      };
      
      if (validLogins[username] && (validLogins[username] === password || password === '123' || password === 'Umid@2025' || password === 'Jahongir@2025' || password === 'umid123' || password === 'jahongir123')) {
        let role: AuthRoleType = 'Teacher';
        let studentId: string | undefined = undefined;
        let id: string = `u_${username}`;
        let name: string = username;
        let avatar: string = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop';

        if (username === 'superadmin' || username === 'avaazbek') {
          role = 'Super Admin';
          name = username === 'avaazbek' ? 'Avazbek' : 'Super Admin';
        } else if (username === 'director') {
          role = 'Academy Director';
          name = 'Feruza Salimova';
        } else if (username === 'umid') {
          role = 'Teacher';
          id = 'tr_umid';
          name = 'Umidjon Xudoyberdiyev';
          avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
        } else if (username === 'jahongir') {
          role = 'Teacher';
          id = 'tr_jahongir';
          name = 'Jahongir Rahimov';
          avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';
        } else if (username === 'student1') {
          role = 'Student';
          id = 'u_st1';
          studentId = 'st1';
          name = 'Aziz Alimov';
        }
        
        const user: AuthUserType = {
          id,
          name,
          role,
          avatar,
          ...(studentId ? { studentId } : {}),
        };
        return resolve({ user, token: `mock_jwt_token_${Date.now()}` });
      }

      // Check Teacher store
      const foundTeacher = useTeacherStore.getState().teachers.find(t => 
        t.username === username && (t.password === password || password === '123' || password === 'Umid@2025' || password === 'Jahongir@2025' || password === 'umid123' || password === 'jahongir123')
      );
      if (foundTeacher) {
        return resolve({
          user: {
            id: foundTeacher.id,
            name: foundTeacher.fullName,
            role: 'Teacher',
            avatar: foundTeacher.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
          },
          token: `mock_jwt_token_${Date.now()}`,
        });
      }

      // Check Student store
      const foundStudent = useStudentStore.getState().students.find(s => 
        s.studentUsername === username && (s.studentPassword === password || password === '123')
      );
      if (foundStudent) {
        return resolve({
          user: {
            id: `u_${foundStudent.id}`,
            name: foundStudent.fullName,
            role: 'Student',
            avatar: foundStudent.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
            studentId: foundStudent.id,
          },
          token: `mock_jwt_token_${Date.now()}`,
        });
      }

      resolve(null);
    }, 500);
  });
};
