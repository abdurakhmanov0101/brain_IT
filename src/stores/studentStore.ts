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

const firstNames = [
  'Aziz', 'Malika', 'Sherzod', 'Dilnoza', 'Jasur', 'Kamola', 'Bobur', 'Zulfiya', 'Otabek', 'Nilufar',
  'Sardor', 'Feruza', 'Humoyun', 'Mohira', 'Ulugbek', 'Shakhnoza', 'Eldor', 'Gulnora', 'Ravshan', 'Barno',
  'Jamshid', 'Sevara', 'Bexruz', 'Madina', 'Shavkat', 'Zarina', 'Anvar', 'Shahlo', 'Murod', 'Dildora',
  'Sanjar', 'Nargiza', 'Islom', 'Rayhon', 'Rustam', 'Umida', 'Farrux', 'Guzal', 'Asadbek', 'Nodira'
];
const lastNames = [
  'Alimov', 'Sobirova', 'Umarov', 'Rahimova', 'Toshmatov', 'Yusupova', 'Nazarov', 'Hasanova', 'Qodirov', 'Ismoilova',
  'Bekmurodov', 'Razzaqova', 'Valiyev', 'Ergasheva', 'Sobirov', 'Mirova', 'Xolmatov', 'Abdullayeva', 'Normatov', 'Tursunova',
  'Karimov', 'Jalilova', 'Mirzayev', 'Kamilova', 'Rustamov', 'Azizova', 'Boltaboyev', 'Olimova', 'Tursunov', 'Sultonova',
  'Qosimova', 'Usmonov', 'Bozorova', 'Davlatov', 'Erkinova', 'Jumayev', 'Gafurova', 'Po\'latov', 'Salimova', 'Zokirov'
];

const generateStudents = (): InitStudent[] => {
  const list: InitStudent[] = [];
  let studentCount = 1;
  
  // 4 groups (g1, g2 for Umid/Frontend; g3, g4 for Jahongir/Backend)
  for (let gNum = 1; gNum <= 4; gNum++) {
    const groupId = `g${gNum}`;
    const teacherId = gNum <= 2 ? 'tr_umid' : 'tr_jahongir';
    const isFrontend = gNum <= 2;
    const coursePrice = isFrontend ? 1200000 : 1400000;
    const paid50Percent = coursePrice / 2; // Exactly 50% paid! Remaining balance = 50%
    
    // 10 students per group
    for (let sNum = 1; sNum <= 10; sNum++) {
      const id = `st${studentCount}`;
      const fName = firstNames[(studentCount - 1) % firstNames.length];
      const lName = lastNames[(studentCount - 1) % lastNames.length];
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
        balance: paid50Percent, // Remaining 50% balance
        leadSource: sNum % 3 === 0 ? 'Instagram' : sNum % 3 === 1 ? 'Telegram' : 'Tavsiya',
        enrolledDate: '2026-06-01',
        status: 'active',
        paymentStatus: 'partial',
        paymentNote: "50% to'lov qilingan"
      });
      
      studentCount++;
    }
  }
  return list;
};

const rawStudents: InitStudent[] = [];

const initialStudents: Student[] = rawStudents.map((s, idx) => ({
  ...s,
  studentUsername: `student${idx + 1}`,
  studentPassword: '123',
  parentUsername: genParentUsername(s.fullName, s.parentPhone),
  parentPassword: phonePass(s.parentPhone),
  coins: 50,
}));

const initialPayments: Payment[] = rawStudents.map((s, idx) => {
  const isFrontend = s.groupIds[0] === 'g1' || s.groupIds[0] === 'g2';
  const amount = isFrontend ? 600000 : 700000; // 50% of course fee
  return {
    id: `pay_${idx + 1}`,
    studentId: s.id,
    amount,
    type: idx % 2 === 0 ? 'payme' : 'click',
    date: '2026-06-02',
    receivedBy: 'Avazbek Admin',
    note: "Kurs uchun 50% oldindan to'lov"
  };
});

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: [],
      payments: [],
      deductions: [],
      addStudent: (s) => {
        const phoneClean = s.phone.replace(/\D/g, '');
        const exists = get().students.some(st => st.phone.replace(/\D/g, '') === phoneClean && st.status !== 'left');
        if (exists && phoneClean.length >= 7) {
          alert(`Bu telefon raqam (${s.phone}) bilan o'quvchi allaqachon mavjud!`);
          return '';
        }
        const id = `st${Date.now()}`;
        const studentUsername = genStudentUsername(s.fullName, s.phone);
        const studentPassword = phonePass(s.phone) || genRandomPassword();
        const parentUsername = genParentUsername(s.fullName, s.parentPhone);
        const parentPassword = phonePass(s.parentPhone) || genRandomPassword();
        set((state) => ({
          students: [
            ...state.students,
            {
              ...s,
              id,
              studentUsername,
              studentPassword,
              parentUsername,
              parentPassword,
              coins: 0,
            },
          ],
        }));
        return id;
      },
      updateStudent: (id, patch) =>
        set((state) => ({
          students: state.students.map((st) => (st.id === id ? { ...st, ...patch } : st)),
        })),
      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.map((st) => (st.id === id ? { ...st, status: 'left' as const } : st)),
        })),
      addPayment: (p) =>
        set((s) => {
          const newPay: Payment = { ...p, id: `pay${Date.now()}` };
          const target = s.students.find((st) => st.id === p.studentId);
          let newBalance = 0;
          if (target) {
            newBalance = target.balance - p.amount;
          }
          return {
            payments: [newPay, ...s.payments],
            students: s.students.map((st) =>
              st.id === p.studentId ? { ...st, balance: newBalance } : st
            ),
          };
        }),
      deductLesson: (d) =>
        set((s) => {
          const id = `ded${Date.now()}`;
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
        }),
      refundLesson: (studentId, amount) =>
        set((s) => ({
          students: s.students.map((st) =>
            st.id === studentId ? { ...st, balance: st.balance + amount } : st
          ),
        })),
      getStudentBalance: (id) => get().students.find((s) => s.id === id)?.balance ?? 0,
    }),
    { name: 'brain-it-students-clean-v2-prod-v1' }
  )
);
