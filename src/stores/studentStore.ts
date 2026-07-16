import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const sendPushNotification = (title: string, body: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/vite.svg', badge: '/vite.svg' });
};

export const genStudentUsername = (fullName: string, phone: string): string => {
  const namePart = fullName.toLowerCase().replace(/[\s'-]/g, '').slice(0, 4);
  const phonePart = phone.replace(/\D/g, '').slice(-4);
  return `${namePart}${phonePart}`;
};

export const genParentUsername = (fullName: string, parentPhone: string): string => {
  const namePart = fullName.toLowerCase().replace(/[\s'-]/g, '').slice(0, 4);
  const phonePart = parentPhone.replace(/\D/g, '').slice(-4);
  return `ota_${namePart}${phonePart}`;
};

export const genRandomPassword = (): string => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const phonePass = (phone: string) => phone.replace(/\D/g, '').slice(-6);

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  parentPhone: string;
  parentName?: string;          // Ota-ona ismi (ixtiyoriy)
  photo: string;
  groupIds: string[];
  teacherId?: string;
  balance: number;
  contractId?: string;
  leadSource: string;
  enrolledDate: string;
  status: 'active' | 'frozen' | 'left';
  notes?: string;
  absentReason?: string;        // Ota-ona bot orqali yuborgan javob
  studentUsername: string;
  studentPassword: string;
  parentUsername: string;
  parentPassword: string;
  coins: number;
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  paymentNote?: string;
  nextPaymentDate?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  type: 'cash' | 'card' | 'payme' | 'click' | 'transfer';
  date: string;
  receivedBy: string;
  note: string;
}

export interface LessonDeduction {
  id: string;
  studentId: string;
  groupId: string;
  lessonDate: string;
  amount: number;
}

interface StudentState {
  students: Student[];
  payments: Payment[];
  deductions: LessonDeduction[];
  addStudent: (s: Omit<Student, 'id' | 'balance' | 'studentUsername' | 'studentPassword' | 'parentUsername' | 'parentPassword'>) => string;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  addPayment: (p: Omit<Payment, 'id'>) => void;
  deductLesson: (d: Omit<LessonDeduction, 'id'>) => void;
  refundLesson: (studentId: string, amount: number) => void;
  getStudentBalance: (id: string) => number;
}

const photos = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
];

type InitStudent = Omit<Student, 'studentUsername' | 'studentPassword' | 'parentUsername' | 'parentPassword' | 'coins'>;

const firstNames = ['Aziz', 'Malika', 'Sherzod', 'Dilnoza', 'Jasur', 'Kamola', 'Bobur', 'Zulfiya', 'Otabek', 'Nilufar', 'Sardor', 'Feruza', 'Humoyun', 'Mohira', 'Ulugbek', 'Shakhnoza', 'Eldor', 'Gulnora', 'Ravshan', 'Barno'];
const lastNames = ['Alimov', 'Sobirova', 'Umarov', 'Rahimova', 'Toshmatov', 'Yusupova', 'Nazarov', 'Hasanova', 'Qodirov', 'Ismoilova', 'Bekmurodov', 'Razzaqova', 'Valiyev', 'Ergasheva', 'Sobirov', 'Mirova', 'Xolmatov', 'Abdullayeva', 'Normatov', 'Tursunova'];

const generateStudents = (): InitStudent[] => {
  return [];
};

const rawStudents: InitStudent[] = generateStudents();

const initialStudents: Student[] = [];

const initialPayments: Payment[] = [];

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: initialStudents,
      payments: initialPayments,
      deductions: [],
      addStudent: (s) => {
        const id = `st${Date.now()}`;
        const studentUsername = genStudentUsername(s.fullName, s.phone);
        const studentPassword = phonePass(s.phone) || genRandomPassword();
        const parentUsername = genParentUsername(s.fullName, s.parentPhone);
        const parentPassword = phonePass(s.parentPhone) || genRandomPassword();
        const newStudent: Student = { ...s, id, balance: 0, studentUsername, studentPassword, parentUsername, parentPassword, coins: 0 };
        set((state) => ({ students: [...state.students, newStudent] }));
        return id;
      },
      updateStudent: (id, patch) =>
        set((s) => ({ students: s.students.map((st) => (st.id === id ? { ...st, ...patch } : st)) })),
      addPayment: (p) => {
        const id = `pay${Date.now()}`;
        set((s) => ({
          payments: [...s.payments, { ...p, id }],
          students: s.students.map((st) =>
            st.id === p.studentId ? { ...st, balance: st.balance + p.amount } : st
          ),
        }));
      },
      deductLesson: (d) => {
        const id = `ded${Date.now()}`;
        set((s) => {
          const updatedStudents = s.students.map((st) => {
            if (st.id !== d.studentId) return st;
            const newBalance = st.balance - d.amount;
            if (newBalance < 0 && st.balance >= 0) {
              sendPushNotification(
                'Brain IT Academy — Balans xabardorligi',
                `${st.fullName} balansi manfiy bo'ldi: ${newBalance.toLocaleString()} so'm`
              );
            }
            return { ...st, balance: newBalance };
          });
          return { deductions: [...s.deductions, { ...d, id }], students: updatedStudents };
        });
      },
      refundLesson: (studentId, amount) =>
        set((s) => ({
          students: s.students.map((st) =>
            st.id === studentId ? { ...st, balance: st.balance + amount } : st
          ),
        })),
      getStudentBalance: (id) => get().students.find((s) => s.id === id)?.balance ?? 0,
    }),
    { name: 'brain-it-studentStore-v11' }
  )
);
