import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AcademyCourse {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'AI' | 'Roboto' | 'Kids' | 'English' | 'Math' | 'Foundation' | 'Cybersecurity' | 'ComputerLiteracy';
  monthlyPrice: number;
  lessonPrice: number;
  teacherPercent: number;
  durationMonths: number;
  lessonsPerWeek: number;
  syllabus: string[];
  color: string;
}

interface CourseState {
  courses: AcademyCourse[];
  addCourse: (c: Omit<AcademyCourse, 'id' | 'lessonPrice'>) => void;
  updateCourse: (id: string, patch: Partial<AcademyCourse>) => void;
  deleteCourse: (id: string) => void;
}

const calcLessonPrice = (monthly: number, lessonsPerWeek: number) =>
  Math.round(monthly / (lessonsPerWeek * 4));

const initial: AcademyCourse[] = [
  { id: 'ac1', name: 'IT Foundation', category: 'Foundation', monthlyPrice: 3500000, lessonPrice: calcLessonPrice(3500000, 3), teacherPercent: 30, durationMonths: 4, lessonsPerWeek: 3, syllabus: ['Kompyuter asoslari', 'MS Office', 'Internet va tarmoq', 'Kirish dasturlash'], color: 'indigo' },
  { id: 'ac2', name: 'Frontend dasturlash', category: 'Frontend', monthlyPrice: 4000000, lessonPrice: calcLessonPrice(4000000, 3), teacherPercent: 35, durationMonths: 4, lessonsPerWeek: 3, syllabus: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Next.js'], color: 'blue' },
  { id: 'ac3', name: 'Backend dasturlash', category: 'Backend', monthlyPrice: 4500000, lessonPrice: calcLessonPrice(4500000, 3), teacherPercent: 35, durationMonths: 5, lessonsPerWeek: 3, syllabus: ['Python asoslari', 'Django', 'REST API', 'PostgreSQL', 'Docker'], color: 'emerald' },
  { id: 'ac4', name: 'Suniy intellekt', category: 'AI', monthlyPrice: 5200000, lessonPrice: calcLessonPrice(5200000, 3), teacherPercent: 40, durationMonths: 5, lessonsPerWeek: 3, syllabus: ['Python ML', 'NumPy/Pandas', 'Scikit-learn', 'Neural Networks', 'LLM'], color: 'violet' },
  { id: 'ac5', name: 'Kiberxavfsizlik', category: 'Cybersecurity', monthlyPrice: 5800000, lessonPrice: calcLessonPrice(5800000, 3), teacherPercent: 40, durationMonths: 5, lessonsPerWeek: 3, syllabus: ['Tarmoq xavfsizligi', 'Penetration Testing', 'CTF', 'DevSecOps'], color: 'red' },
  { id: 'ac6', name: 'Kompyuter savodxonligi', category: 'ComputerLiteracy', monthlyPrice: 2500000, lessonPrice: calcLessonPrice(2500000, 3), teacherPercent: 25, durationMonths: 3, lessonsPerWeek: 3, syllabus: ['Windows/MacOS', 'MS Office', 'Internet', 'E-hukumat xizmatlari'], color: 'slate' },
  { id: 'ac7', name: 'IT Kids', category: 'Kids', monthlyPrice: 2000000, lessonPrice: calcLessonPrice(2000000, 2), teacherPercent: 25, durationMonths: 3, lessonsPerWeek: 2, syllabus: ['Scratch', 'Roblox Studio', 'Minecraft Education', 'Python Turtle'], color: 'pink' },
  { id: 'ac8', name: 'English for IT', category: 'English', monthlyPrice: 2800000, lessonPrice: calcLessonPrice(2800000, 3), teacherPercent: 28, durationMonths: 4, lessonsPerWeek: 3, syllabus: ['IT terminologiyasi', 'Technical Writing', 'Interview English', 'Documentation'], color: 'amber' },
];

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      courses: initial,
      addCourse: (c) => set((s) => ({
        courses: [...s.courses, { ...c, id: `ac${Date.now()}`, lessonPrice: calcLessonPrice(c.monthlyPrice, c.lessonsPerWeek) }]
      })),
      updateCourse: (id, patch) => set((s) => ({
        courses: s.courses.map((c) => c.id === id ? { ...c, ...patch, lessonPrice: calcLessonPrice(patch.monthlyPrice ?? c.monthlyPrice, patch.lessonsPerWeek ?? c.lessonsPerWeek) } : c)
      })),
      deleteCourse: (id) => set((s) => ({ courses: s.courses.filter((c) => c.id !== id) })),
    }),
    { name: 'brain-it-courses' }
  )
);
