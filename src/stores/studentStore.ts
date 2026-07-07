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

const firstNames = ['Aziz', 'Malika', 'Sherzod', 'Dilnoza', 'Jasur', 'Kamola', 'Bobur', 'Zulfiya', 'Otabek', 'Nilufar', 'Sardor', 'Feruza', 'Humoyun', 'Mohira', 'Ulugbek', 'Shakhnoza', 'Eldor', 'Gulnora', 'Ravshan', 'Barno'];
const lastNames = ['Alimov', 'Sobirova', 'Umarov', 'Rahimova', 'Toshmatov', 'Yusupova', 'Nazarov', 'Hasanova', 'Qodirov', 'Ismoilova', 'Bekmurodov', 'Razzaqova', 'Valiyev', 'Ergasheva', 'Sobirov', 'Mirova', 'Xolmatov', 'Abdullayeva', 'Normatov', 'Tursunova'];

const generateStudents = (): InitStudent[] => {
  const list: InitStudent[] = [];
  let studentCount = 1;
  
  // 10 groups
  for (let gNum = 1; gNum <= 10; gNum++) {
    const groupId = `g${gNum}`;
    const teacherId = gNum <= 5 ? 'tr1' : 'tr2'; // Bobur for first 5, Jasur for next 5
    
    // 10 students per group
    for (let sNum = 1; sNum <= 10; sNum++) {
      const id = `st${studentCount}`;
      const fName = firstNames[(studentCount - 1) % firstNames.length];
      const lName = lastNames[(studentCount * 3) % lastNames.length];
      const fullName = `${fName} ${lName}`;
      
      const phoneDigits = (1000000 + studentCount).toString();
      const parentPhoneDigits = (2000000 + studentCount).toString();
      const phone = `+99890${phoneDigits}`;
      const parentPhone = `+99890${parentPhoneDigits}`;
      
      list.push({
        id,
        fullName,
        phone,
        parentPhone,
        photo: photos[(studentCount - 1) % photos.length],
        groupIds: [groupId],
        teacherId,
        balance: 3000000 - ((studentCount % 4) * 500000),
        leadSource: sNum % 3 === 0 ? 'Instagram' : sNum % 3 === 1 ? 'Telegram' : 'Tavsiya',
        enrolledDate: '2026-02-01',
        status: 'active'
      });
      
      studentCount++;
    }
  }
  return list;
};

const rawStudents: InitStudent[] = generateStudents();

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
