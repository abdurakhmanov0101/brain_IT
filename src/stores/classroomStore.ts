import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LessonRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  groupId: string;
  date: string;
  lessonNumber: number;
  topic: string;
  description: string;
  videoUrl: string;
  videoType: 'youtube' | 'upload' | 'link';
  viewedBy: string[];
  createdAt: string;
}

interface ClassroomState {
  lessons: LessonRecord[];
  addLesson: (lesson: Omit<LessonRecord, 'id' | 'viewedBy' | 'createdAt'>) => void;
  updateLesson: (id: string, updates: Partial<Omit<LessonRecord, 'id'>>) => void;
  deleteLesson: (id: string) => void;
  markViewed: (lessonId: string, studentId: string) => void;
  getLessonsByGroup: (groupId: string) => LessonRecord[];
}

export const useClassroomStore = create<ClassroomState>()(
  persist(
    (set, get) => ({
      lessons: [
        {
          id: 'demo-1',
          teacherId: 't1',
          teacherName: 'Sardor Usmonov',
          groupId: 'g1',
          date: '2026-07-05',
          lessonNumber: 1,
          topic: 'React Asoslari — JSX va Komponentlar',
          description: "Bugungi darsda React kutubxonasining asosiy tushunchalari: JSX sintaksisi, funksional komponentlar, props orqali ma'lumot uzatish va birinchi komponent yaratish o'rgatildi.",
          videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
          videoType: 'youtube',
          viewedBy: ['s1', 's2'],
          createdAt: '2026-07-05T10:00:00Z',
        },
        {
          id: 'demo-2',
          teacherId: 't1',
          teacherName: 'Sardor Usmonov',
          groupId: 'g1',
          date: '2026-07-06',
          lessonNumber: 2,
          topic: 'React Hooks — useState va useEffect',
          description: "useState bilan holat boshqarish, useEffect bilan side-effect'lar ishlash, dependency array tushunchasi va amaliy misollar ko'rsatildi.",
          videoUrl: 'https://www.youtube.com/embed/O6P86uwfdR0',
          videoType: 'youtube',
          viewedBy: ['s1'],
          createdAt: '2026-07-06T10:00:00Z',
        },
        {
          id: 'demo-3',
          teacherId: 't2',
          teacherName: 'Dilshod Karimov',
          groupId: 'g2',
          date: '2026-07-06',
          lessonNumber: 1,
          topic: 'Python OOP — Klasslar va Obyektlar',
          description: "Python'da OOP paradigmasi, class yaratish, __init__ konstruktor, self kalit so'zi, attributlar va metodlar bilan ishlash o'rgatildi.",
          videoUrl: 'https://www.youtube.com/embed/ZDa-Z5JzLYM',
          videoType: 'youtube',
          viewedBy: [],
          createdAt: '2026-07-06T14:00:00Z',
        },
      ],

      addLesson: (lesson) => {
        const newLesson: LessonRecord = {
          ...lesson,
          id: crypto.randomUUID(),
          viewedBy: [],
          createdAt: new Date().toISOString(),
        };
        set({ lessons: [newLesson, ...get().lessons] });
      },

      updateLesson: (id, updates) => {
        set({
          lessons: get().lessons.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        });
      },

      deleteLesson: (id) => {
        set({ lessons: get().lessons.filter((l) => l.id !== id) });
      },

      markViewed: (lessonId, studentId) => {
        set({
          lessons: get().lessons.map((l) => {
            if (l.id !== lessonId) return l;
            if (l.viewedBy.includes(studentId)) return l;
            return { ...l, viewedBy: [...l.viewedBy, studentId] };
          }),
        });
      },

      getLessonsByGroup: (groupId) => {
        return get().lessons.filter((l) => l.groupId === groupId);
      },
    }),
    { name: 'classroom-store' }
  )
);
