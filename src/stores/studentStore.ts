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
  photo: string;
  groupIds: string[];
  teacherId?: string;
  balance: number;
  contractId?: string;
  leadSource: string;
  enrolledDate: string;
  status: 'active' | 'frozen' | 'left';
  notes?: string;
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

const rawStudents: InitStudent[] = [
  { id: 'st1',  fullName: 'Aziz Alimov',        phone: '+998901234567', parentPhone: '+998901234560', photo: photos[0], groupIds: ['g1'],       teacherId: 'tr1', balance: 3200000,  leadSource: 'Instagram', enrolledDate: '2026-02-01', status: 'active' },
  { id: 'st2',  fullName: 'Malika Sobirova',     phone: '+998937654321', parentPhone: '+998937654320', photo: photos[2], groupIds: ['g1'],       teacherId: 'tr1', balance: 800000,   leadSource: 'Telegram',  enrolledDate: '2026-02-05', status: 'active' },
  { id: 'st3',  fullName: 'Sherzod Umarov',      phone: '+998991112233', parentPhone: '+998991112230', photo: photos[1], groupIds: ['g2'],       teacherId: 'tr2', balance: -333333,  leadSource: 'Tavsiya',   enrolledDate: '2026-01-15', status: 'active' },
  { id: 'st4',  fullName: 'Dilnoza Rahimova',    phone: '+998900012345', parentPhone: '+998900012340', photo: photos[3], groupIds: ['g2'],       teacherId: 'tr2', balance: 5000000,  leadSource: 'Vebsayt',   enrolledDate: '2026-01-20', status: 'active' },
  { id: 'st5',  fullName: 'Jasur Toshmatov',     phone: '+998935551234', parentPhone: '+998935551230', photo: photos[1], groupIds: ['g3'],       teacherId: 'tr3', balance: 2100000,  leadSource: 'Instagram', enrolledDate: '2026-03-01', status: 'active' },
  { id: 'st6',  fullName: 'Kamola Yusupova',     phone: '+998994441122', parentPhone: '+998994441120', photo: photos[7], groupIds: ['g3'],       teacherId: 'tr3', balance: 4000000,  leadSource: 'Telegram',  enrolledDate: '2026-03-05', status: 'active' },
  { id: 'st7',  fullName: 'Bobur Nazarov',       phone: '+998901110022', parentPhone: '+998901110020', photo: photos[6], groupIds: ['g4'],       teacherId: 'tr4', balance: 0,        leadSource: 'Tavsiya',   enrolledDate: '2026-04-01', status: 'active' },
  { id: 'st8',  fullName: 'Zulfiya Hasanova',    phone: '+998933334455', parentPhone: '+998933334450', photo: photos[3], groupIds: ['g4'],       teacherId: 'tr4', balance: 1500000,  leadSource: 'Instagram', enrolledDate: '2026-04-10', status: 'active' },
  { id: 'st9',  fullName: 'Otabek Qodirov',      phone: '+998905556677', parentPhone: '+998905556670', photo: photos[0], groupIds: ['g1', 'g5'], teacherId: 'tr1', balance: 6000000,  leadSource: 'Vebsayt',   enrolledDate: '2026-02-15', status: 'active' },
  { id: 'st10', fullName: 'Nilufar Ismoilova',   phone: '+998907778899', parentPhone: '+998907778890', photo: photos[2], groupIds: ['g5'],       teacherId: 'tr5', balance: -666666,  leadSource: 'Instagram', enrolledDate: '2026-05-01', status: 'active' },
  { id: 'st11', fullName: 'Sardor Bekmurodov',   phone: '+998902223344', parentPhone: '+998902223340', photo: photos[5], groupIds: ['g2'],       teacherId: 'tr2', balance: 3500000,  leadSource: 'Telegram',  enrolledDate: '2026-01-10', status: 'active' },
  { id: 'st12', fullName: 'Feruza Razzaqova',    phone: '+998904445566', parentPhone: '+998904445560', photo: photos[7], groupIds: ['g6'],       teacherId: 'tr6', balance: 2000000,  leadSource: 'Tavsiya',   enrolledDate: '2026-05-15', status: 'active' },
  { id: 'st13', fullName: 'Humoyun Valiyev',     phone: '+998906667788', parentPhone: '+998906667780', photo: photos[4], groupIds: ['g6'],       teacherId: 'tr6', balance: 500000,   leadSource: 'Instagram', enrolledDate: '2026-05-20', status: 'active' },
  { id: 'st14', fullName: 'Mohira Ergasheva',    phone: '+998908889900', parentPhone: '+998908889900', photo: photos[2], groupIds: ['g3'],       teacherId: 'tr3', balance: 4500000,  leadSource: 'Telegram',  enrolledDate: '2026-03-15', status: 'active' },
  { id: 'st15', fullName: 'Ulugbek Sobirov',     phone: '+998901231234', parentPhone: '+998901231230', photo: photos[6], groupIds: ['g4'],       teacherId: 'tr4', balance: 1800000,  leadSource: 'Vebsayt',   enrolledDate: '2026-04-20', status: 'frozen' },
  { id: 'st16', fullName: 'Shakhnoza Mirova',    phone: '+998939997766', parentPhone: '+998939997760', photo: photos[3], groupIds: ['g1'],       teacherId: 'tr1', balance: 3800000,  leadSource: 'Tavsiya',   enrolledDate: '2026-02-25', status: 'active' },
  { id: 'st17', fullName: 'Eldor Xolmatov',      phone: '+998906661122', parentPhone: '+998906661120', photo: photos[1], groupIds: ['g5'],       teacherId: 'tr5', balance: 2600000,  leadSource: 'Instagram', enrolledDate: '2026-05-05', status: 'active' },
  { id: 'st18', fullName: 'Gulnora Abdullayeva', phone: '+998903334455', parentPhone: '+998903334450', photo: photos[7], groupIds: ['g2'],       teacherId: 'tr2', balance: -500000,  leadSource: 'Telegram',  enrolledDate: '2026-01-25', status: 'active' },
  { id: 'st19', fullName: 'Ravshan Normatov',    phone: '+998905555111', parentPhone: '+998905555110', photo: photos[4], groupIds: ['g6'],       teacherId: 'tr6', balance: 700000,   leadSource: 'Instagram', enrolledDate: '2026-06-01', status: 'active' },
  { id: 'st20', fullName: 'Barno Tursunova',     phone: '+998907776655', parentPhone: '+998907776650', photo: photos[2], groupIds: ['g3'],       teacherId: 'tr3', balance: 5200000,  leadSource: 'Vebsayt',   enrolledDate: '2026-03-10', status: 'left' },
];

const initialStudents: Student[] = rawStudents.map((s) => ({
  ...s,
  studentUsername: genStudentUsername(s.fullName, s.phone),
  studentPassword: phonePass(s.phone),
  parentUsername: genParentUsername(s.fullName, s.parentPhone),
  parentPassword: phonePass(s.parentPhone),
  coins: 0,
}));

const initialPayments: Payment[] = [
  { id: 'pay1', studentId: 'st1', amount: 4000000, type: 'payme', date: '2026-04-01', receivedBy: 'Feruza Salimova', note: "Aprel oyi to'lovi" },
  { id: 'pay2', studentId: 'st2', amount: 4000000, type: 'cash', date: '2026-04-03', receivedBy: 'Admin', note: "Aprel to'lov" },
  { id: 'pay3', studentId: 'st3', amount: 4500000, type: 'click', date: '2026-04-05', receivedBy: 'Feruza Salimova', note: 'Aprel oyi' },
  { id: 'pay4', studentId: 'st4', amount: 4500000, type: 'card', date: '2026-04-10', receivedBy: 'Admin', note: '' },
  { id: 'pay5', studentId: 'st1', amount: 4000000, type: 'payme', date: '2026-05-01', receivedBy: 'Feruza Salimova', note: "May oyi to'lovi" },
  { id: 'pay6', studentId: 'st5', amount: 4000000, type: 'cash', date: '2026-05-02', receivedBy: 'Admin', note: "May to'lov" },
  { id: 'pay7', studentId: 'st6', amount: 4000000, type: 'transfer', date: '2026-05-05', receivedBy: 'Feruza Salimova', note: '' },
  { id: 'pay8', studentId: 'st9', amount: 8500000, type: 'payme', date: '2026-05-10', receivedBy: 'Admin', note: '2 kurs 2 oy' },
  { id: 'pay9', studentId: 'st1', amount: 4000000, type: 'click', date: '2026-06-01', receivedBy: 'Feruza Salimova', note: 'Iyun oyi' },
  { id: 'pay10', studentId: 'st11', amount: 4500000, type: 'cash', date: '2026-06-03', receivedBy: 'Admin', note: "Iyun to'lov" },
  { id: 'pay11', studentId: 'st12', amount: 3500000, type: 'payme', date: '2026-06-05', receivedBy: 'Feruza Salimova', note: '' },
  { id: 'pay12', studentId: 'st16', amount: 4000000, type: 'card', date: '2026-06-08', receivedBy: 'Admin', note: "Iyun to'lovi" },
];

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
    { name: 'brain-it-students' }
  )
);
