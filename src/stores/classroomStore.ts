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

const generateLessons = (): LessonRecord[] => {
  const list: LessonRecord[] = [];
  const topics = [
    { topic: 'Kirish dars va asosiy tushunchalar', desc: 'Ushbu darsda texnologiya haqida umumiy tushuncha va muhitni sozlash ko\'rib chiqildi.' },
    { topic: 'O\'zgaruvchilar va ma\'lumot turlari', desc: 'Ma\'lumotlar turlari, o\'zgaruvchilar bilan ishlash va sintaksis ko\'rib chiqildi.' },
  ];

  for (let gNum = 1; gNum <= 10; gNum++) {
    const groupId = `g${gNum}`;
    const teacherId = gNum <= 5 ? 'tr1' : 'tr2';
    const teacherName = gNum <= 5 ? 'Bobur Akbarov' : 'Jasur Shodiev';
    
    for (let lNum = 1; lNum <= 2; lNum++) {
      list.push({
        id: `ls-${groupId}-${lNum}`,
        teacherId,
        teacherName,
        groupId,
        date: `2026-07-0${4 + lNum}`,
        lessonNumber: lNum,
        topic: gNum <= 5 
          ? `Frontend dars #${lNum}: ${topics[lNum - 1].topic}`
          : `Backend dars #${lNum}: ${topics[lNum - 1].topic}`,
        description: topics[lNum - 1].desc,
        videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
        videoType: 'youtube',
        viewedBy: [],
        createdAt: new Date(`2026-07-0${4 + lNum}T10:00:00Z`).toISOString(),
      });
    }
  }
  return list;
};

const initialLessons = generateLessons();

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
    { name: 'brain-it-classroomStore-v11' }
  )
);
