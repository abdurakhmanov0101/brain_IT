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

export const users: User[] = [];

export const courses: Course[] = [];

export const projects: Project[] = [];

export const leads: Lead[] = [];

export const initialAttendance: AttendanceLog[] = [];

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
