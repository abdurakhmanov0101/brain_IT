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

[];

export const useClassroomStore = create<ClassroomState>()(
  persist(
    (set, get) => ({
      lessons: initialLessons,

      addLesson: (lesson) => {
        const newLesson: LessonRecord = {
          ...lesson,
          id: crypto.randomUUID(),
          viewedBy: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ lessons: [newLesson, ...state.lessons] }));
      },

      updateLesson: (id, updates) => {
        set((state) => ({
          lessons: state.lessons.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      deleteLesson: (id) => {
        set((state) => ({
          lessons: state.lessons.filter((l) => l.id !== id),
        }));
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
    { name: 'classroom-store-clean-v1-prod-v1' }
  )
);
