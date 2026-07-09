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
  {
    id: 'ac2',
    name: 'Frontend Development',
    category: 'Frontend',
    monthlyPrice: 500000,
    lessonPrice: 41667,
    teacherPercent: 40,
    durationMonths: 6,
    lessonsPerWeek: 3,
    syllabus: [],
    color: '#3b82f6'
  },
  {
    id: 'ac3',
    name: 'Backend Development',
    category: 'Backend',
    monthlyPrice: 600000,
    lessonPrice: 50000,
    teacherPercent: 40,
    durationMonths: 7,
    lessonsPerWeek: 3,
    syllabus: [],
    color: '#10b981'
  }
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
    { name: 'brain-it-courses-prod-v4' }
  )
);
