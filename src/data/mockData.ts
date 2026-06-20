export type UserRole = 'Super Admin' | 'Academy Director' | 'Teacher' | 'Student' | 'Parent' | 'Company Director' | 'Project Manager' | 'Developer' | 'Client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'article';
  duration: string;
  content: string;
  videoUrl?: string;
  assignment?: string;
  quizQuestions?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  price: number;
  duration: string;
  modules: Module[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: { name: string; avatar: string };
  estimatedHours: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'in_progress' | 'planned' | 'completed';
  progress: number;
  tasks: Task[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: 'new' | 'contacted' | 'interested' | 'demo' | 'trial' | 'enrolled' | 'contract' | 'archived';
  date: string;
  value: string;
  courseInterest?: string;
  notes?: string;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  name: string;
  role: string;
  photo: string;
  time: string;
  status: 'present' | 'late' | 'absent';
  department: string;
}

export const users: User[] = [
  { id: 'u1', name: 'Feruza Salimova',  email: 'admin@brainit.uz',    role: 'Super Admin',       avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
  { id: 'u2', name: 'Jasur Umarov',     email: 'director@brainit.uz', role: 'Academy Director',  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop' },
  { id: 'u3', name: 'Bobur Akbarov',    email: 'teacher@brainit.uz',  role: 'Teacher',           avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop' },
  { id: 'u4', name: 'Davron Rustamov',  email: 'student@brainit.uz',  role: 'Student',           avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop' },
  { id: 'u5', name: 'Otabek Qodirov',   email: 'pm@brainit.uz',       role: 'Project Manager',   avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
  { id: 'u6', name: 'Sherzod Nazarov',  email: 'dev@brainit.uz',      role: 'Developer',         avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop' },
  { id: 'u7', name: 'Kamola Yusupova',  email: 'company@brainit.uz',  role: 'Company Director',  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
];

export const courses: Course[] = [
  {
    id: 'c1',
    title: 'Python Full Stack Development',
    category: 'Dasturlash',
    level: "O'rta",
    price: 1200000,
    duration: '6 oy',
    modules: [
      {
        id: 'm1',
        title: 'Python Asoslari',
        lessons: [
          { id: 'l1', title: "Python kirish va o'rnatish", type: 'video', duration: '15 min', content: "Python — ko'p qirrali, yuqori darajali dasturlash tili. Ushbu darsda Python o'rnatish va birinchi dastur yozishni o'rganamiz.", videoUrl: 'https://example.com/l1.mp4' },
          { id: 'l2', title: "O'zgaruvchilar va ma'lumot turlari", type: 'article', duration: '20 min', content: "Python'da o'zgaruvchilar e'lon qilish uchun maxsus kalit so'z kerak emas.", assignment: 'int, float, str va bool turlaridan foydalanib kalkulyator dastur yozing.' },
          {
            id: 'l3', title: 'Python Asoslari Testi', type: 'quiz', duration: '10 min', content: 'Python asoslarini tekshirish uchun viktorina.',
            quizQuestions: [
              { id: 'q1', question: 'Python qaysi turdagi dasturlash tili?', options: ['Kompilyatsiya qilinadigan', 'Interpretatsiya qilinadigan', 'Assemble qilinadigan', 'Mashina tili'], correctAnswer: 1 },
              { id: 'q2', question: "Python'da izoh yozish uchun qaysi belgi ishlatiladi?", options: ['//', '/* */', '#', '--'], correctAnswer: 2 },
              { id: 'q3', question: "Python'da ro'yxat (list) qanday e'lon qilinadi?", options: ['(1, 2, 3)', '[1, 2, 3]', '{1, 2, 3}', '<1, 2, 3>'], correctAnswer: 1 },
            ],
          },
        ],
      },
      {
        id: 'm2',
        title: "Obyektga Yo'naltirilgan Dasturlash",
        lessons: [
          { id: 'l4', title: 'Klasslar va Obyektlar', type: 'video', duration: '25 min', content: "OOP — dasturiy ta'minotni obyektlar orqali modellashtirish usuli.", videoUrl: 'https://example.com/l4.mp4' },
          { id: 'l5', title: 'Vorislik (Inheritance)', type: 'article', duration: '30 min', content: "Vorislik — yangi klassning mavjud klassdan xususiyat va metodlarni meros olishidir.", assignment: 'Vehicle base klassidan meros oladigan Car va Truck klasslarini yarating.' },
        ],
      },
    ],
  },
  {
    id: 'c2',
    title: 'React.js TypeScript',
    category: 'Dasturlash',
    level: 'Yuqori',
    price: 1500000,
    duration: '5 oy',
    modules: [
      {
        id: 'm3',
        title: 'React Asoslari',
        lessons: [
          { id: 'l6', title: 'React va JSX kirish', type: 'video', duration: '20 min', content: 'React — Facebook tomonidan yaratilgan UI kutubxonasi.', videoUrl: 'https://example.com/l6.mp4' },
          { id: 'l7', title: 'State va Props', type: 'article', duration: '25 min', content: "State — komponentning ichki holati. Props — ota-komponentdan bolaga uzatiladigan ma'lumotlar.", assignment: 'useState hookidan foydalanib counter komponenti yarating.' },
        ],
      },
    ],
  },
];

export const projects: Project[] = [
  {
    id: 'p1', name: 'UzBank Mobile App', client: 'UzBank JSC', status: 'in_progress', progress: 65,
    tasks: [
      { id: 't1', title: 'Face ID login integratsiyasi', description: 'Mobile app uchun Face ID autentifikatsiya tizimi', status: 'in_progress', priority: 'high', assignee: { name: 'Sherzod Nazarov', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop' }, estimatedHours: 24 },
      { id: 't2', title: "To'lov tizimi integratsiyasi", description: 'Payme va Click gateway integratsiyasi', status: 'review', priority: 'critical', assignee: { name: 'Otabek Qodirov', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop' }, estimatedHours: 32 },
      { id: 't3', title: 'UI Design tizimi', description: 'Design tokenlar va komponentlar', status: 'done', priority: 'medium', assignee: { name: 'Sherzod Nazarov', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop' }, estimatedHours: 16 },
      { id: 't4', title: 'API xavfsizlik auditi', description: 'JWT, rate limiting va SQL injection himoyasi', status: 'todo', priority: 'high', assignee: { name: 'Otabek Qodirov', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop' }, estimatedHours: 16 },
    ],
  },
  {
    id: 'p2', name: 'CRM Logistics Platform', client: 'UzLogistics LLC', status: 'planned', progress: 15,
    tasks: [
      { id: 't5', title: 'Talablar tahlili', description: 'Mijoz bilan talablarni aniqlash', status: 'done', priority: 'high', assignee: { name: 'Otabek Qodirov', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop' }, estimatedHours: 8 },
      { id: 't6', title: "Ma'lumotlar bazasi dizayni", description: 'PostgreSQL sxemasi va ER diagramma', status: 'in_progress', priority: 'medium', assignee: { name: 'Sherzod Nazarov', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop' }, estimatedHours: 12 },
      { id: 't7', title: 'Frontend prototip', description: 'Figma dizayni va React prototip', status: 'todo', priority: 'low', assignee: { name: 'Sherzod Nazarov', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop' }, estimatedHours: 20 },
    ],
  },
];

export const leads: Lead[] = [
  { id: 'ld1', name: 'Jahongir Olimov',   phone: '+998901234567', email: 'jahongir@mail.uz',  source: 'Instagram', status: 'new',        date: '2026-06-18', value: '1,200,000', courseInterest: 'Frontend Development' },
  { id: 'ld2', name: 'Nilufar Hasanova',  phone: '+998902345678', email: 'nilufar@mail.uz',   source: 'Telegram',  status: 'contacted',  date: '2026-06-17', value: '1,500,000', courseInterest: 'Python Full Stack' },
  { id: 'ld3', name: 'Sardor Ergashev',   phone: '+998903456789', email: 'sardor@mail.uz',    source: 'Referral',  status: 'interested', date: '2026-06-16', value: '800,000',   courseInterest: 'IT Foundation' },
  { id: 'ld4', name: 'Malika Umarova',    phone: '+998904567890', email: 'malika@mail.uz',    source: 'Facebook',  status: 'demo',       date: '2026-06-15', value: '1,200,000', courseInterest: 'Frontend Development' },
  { id: 'ld5', name: 'Ulugbek Toshev',    phone: '+998905678901', email: 'ulugbek@mail.uz',   source: 'Website',   status: 'trial',      date: '2026-06-14', value: '1,800,000', courseInterest: 'AI & Machine Learning' },
  { id: 'ld6', name: 'Zulfiya Nazarova',  phone: '+998906789012', email: 'zulfiya2@mail.uz',  source: 'Instagram', status: 'enrolled',   date: '2026-06-10', value: '1,500,000', courseInterest: 'Python Full Stack' },
  { id: 'ld7', name: 'Botir Karimov',     phone: '+998907890123', email: 'botir@mail.uz',     source: 'Telegram',  status: 'contract',   date: '2026-06-08', value: '1,200,000', courseInterest: 'Frontend Development' },
  { id: 'ld8', name: 'Shahnoza Rahimova', phone: '+998908901234', email: 'shahnoza@mail.uz',  source: 'Referral',  status: 'new',        date: '2026-06-19', value: '800,000',   courseInterest: 'IT Foundation' },
  { id: 'ld9', name: 'Alisher Xolmatov',  phone: '+998909012345', email: 'alisher@mail.uz',   source: 'Website',   status: 'contacted',  date: '2026-06-18', value: '2,000,000', courseInterest: 'Cybersecurity' },
  { id: 'ld10',name: 'Feruza Qosimova',   phone: '+998900123456', email: 'feruza2@mail.uz',   source: 'Facebook',  status: 'archived',   date: '2026-05-20', value: '1,200,000', courseInterest: 'Frontend Development', notes: 'Budjet yetarli emas dedi' },
];

export const initialAttendance: AttendanceLog[] = [
  { id: 'al1', userId: 'tr1', name: 'Bobur Akbarov',  role: 'Ustoz',    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', time: '09:02', status: 'present', department: "Ta'lim" },
  { id: 'al2', userId: 'u5',  name: 'Otabek Qodirov', role: 'Menejer',  photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', time: '09:18', status: 'late',    department: 'PM' },
  { id: 'al3', userId: 'st1', name: 'Aziz Alimov',    role: "O'quvchi", photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop', time: '09:00', status: 'present', department: "Ta'lim" },
];

export const mockAIFeedback = (code: string): { score: number; feedback: string } => {
  const hasClass = code.includes('class ');
  const hasInit = code.includes('__init__');
  const hasInherit = code.includes('Vehicle') && code.includes('Car');
  if (hasClass && hasInit && hasInherit) {
    return { score: 95, feedback: "✅ A'lo natija! OOP tamoyillariga to'liq mos keladi.\n\n✔ Klass e'loni to'g'ri\n✔ __init__ konstruktor to'g'ri\n✔ Vorislik (Inheritance) to'g'ri\n\n💡 Maslahat: Keyingi bosqichda @property dekoratorini o'rganing." };
  }
  if (hasClass && hasInit) {
    return { score: 65, feedback: "⚠️ Yaxshi boshlanish! Klass va konstruktor mavjud, lekin vorislik qo'llanilmagan.\n\nclass Car(Vehicle):\n    pass" };
  }
  return { score: 30, feedback: "❌ Topshiriq to'liq bajarilmagan.\n\nYetishmayotgan:\n✗ class kalit so'zi\n✗ __init__ konstruktor\n✗ Vorislik" };
};
