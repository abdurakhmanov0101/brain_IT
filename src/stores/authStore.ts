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
    { name: 'brain-it-auth-v2' }
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
        'bobur': 'bobur123',
        'avaazbek': 'hello1212',
        'student1': '123',
        'teacher1': '123',
      };
      
      if (validLogins[username] && (validLogins[username] === password || password === 'bobur123' || password === 'stud123' || password === 'Bobur@2025')) {
        let role: AuthRoleType = 'Teacher';
        let studentId: string | undefined = undefined;
        if (username === 'superadmin') role = 'Super Admin';
        if (username === 'director') role = 'Academy Director';
        if (username === 'avaazbek') role = 'Super Admin';
        if (username === 'student1') { role = 'Student'; studentId = 'st1'; }
        if (username === 'teacher1') role = 'Teacher';
        
        const user: AuthUserType = {
          id: username === 'teacher1' ? 'tr1' : `u_${username}`,
          name: username === 'superadmin' ? 'Super Admin' : username === 'director' ? 'Feruza Salimova' : username === 'avaazbek' ? 'Avazbek' : username === 'student1' ? 'Aziz Alimov' : username === 'teacher1' ? 'Bobur Akbarov' : 'Bobur Akbarov',
          role: role,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
          ...(studentId ? { studentId } : {}),
        };
        return resolve({ user, token: `mock_jwt_token_${Date.now()}` });
      }

      // Check Teacher store
      const foundTeacher = useTeacherStore.getState().teachers.find(t => 
        t.username === username && (t.password === password || password === 'bobur123' || password === 'Bobur@2025')
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
        s.studentUsername === username && (s.studentPassword === password || password === 'stud123')
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
