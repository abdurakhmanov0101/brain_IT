import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InClassTask {
  id: string;
  lessonId: string;
  groupId: string;
  title: string;
  description: string;
  createdAt: string; // ISO String
  durationMinutes: number; // e.g. 30
  expiresAt: string; // ISO String of expiration
}

export interface InClassSubmission {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  code: string;
  status: 'submitted' | 'graded';
  grade?: number; // 0-100%
  feedback?: string;
  coinsAwarded?: number;
  submittedAt: string; // ISO string
}

interface InClassTaskState {
  tasks: InClassTask[];
  submissions: InClassSubmission[];
  addTask: (task: Omit<InClassTask, 'id' | 'createdAt' | 'expiresAt'>) => void;
  submitTask: (taskId: string, studentId: string, studentName: string, code: string) => void;
  gradeSubmission: (subId: string, grade: number, feedback: string, coinsAwarded?: number) => void;
  deleteTask: (taskId: string) => void;
}

export const useInClassTaskStore = create<InClassTaskState>()(
  persist(
    (set) => ({
      tasks: [],
      submissions: [],
      addTask: (taskData) => set((state) => {
        const id = `ict_${Date.now()}`;
        const createdAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + taskData.durationMinutes * 60 * 1000).toISOString();
        const newTask: InClassTask = {
          ...taskData,
          id,
          createdAt,
          expiresAt
        };
        return {
          tasks: [...state.tasks, newTask]
        };
      }),
      submitTask: (taskId, studentId, studentName, code) => set((state) => {
        const subId = `ics_${Date.now()}`;
        const filteredSubmissions = state.submissions.filter(s => !(s.taskId === taskId && s.studentId === studentId));
        const newSub: InClassSubmission = {
          id: subId,
          taskId,
          studentId,
          studentName,
          code,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        };
        return {
          submissions: [...filteredSubmissions, newSub]
        };
      }),
      gradeSubmission: (subId, grade, feedback, coinsAwarded = 0) => set((state) => {
        const submissions = state.submissions.map((s) => {
          if (s.id === subId) {
            return {
              ...s,
              status: 'graded' as const,
              grade,
              feedback,
              coinsAwarded
            };
          }
          return s;
        });
        return { submissions };
      }),
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        submissions: state.submissions.filter(s => s.taskId !== taskId)
      }))
    }),
    {
      name: 'brain-it-inClassTaskStore-v10'
    }
  )
);
