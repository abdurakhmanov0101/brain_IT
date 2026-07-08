import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  groupId: string;
  completedBy: string[]; // student IDs
  type?: 'homework' | 'classtask'; 
  durationMinutes?: number; 
  lessonId?: string; // Qaysi darsga tegishli ekanligini bog'lash uchun
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  type: 'file' | 'code';
  fileUrl?: string;
  fileName?: string;   // original file name when uploaded directly
  code?: string;       // raw string or JSON string based on language
  language?: string;   // 'html/css/js', 'python', 'php', 'javascript', 'cpp', etc.
  status: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  coinsAwarded?: number;
  submittedAt: string; // ISO string
}

export interface Group {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  groupId: string;
}

interface HomeworkState {
  assignments: Assignment[];
  groups: Group[];
  students: Student[];
  submissions: Submission[];
  addAssignment: (a: Omit<Assignment, 'id' | 'completedBy'>) => void;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment, 'id' | 'completedBy'> >) => void;
  deleteAssignment: (id: string) => void;
  toggleComplete: (assignmentId: string, studentId: string) => void;
  setAssignments: (assignments: Assignment[]) => void;
  submitHomework: (submission: Omit<Submission, 'id' | 'status' | 'submittedAt'>) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string, coinsAwarded?: number) => void;
}

export const useHomeworkStore = create<HomeworkState>()(
  persist(
    (set, get) => ({
      assignments: [],
      groups: [],
      students: [],
      submissions: [],
      addAssignment: (a) => {
        const newAssign: Assignment = {
          id: crypto.randomUUID(),
          completedBy: [],
          ...a,
        };
        set({ assignments: [...get().assignments, newAssign] });
      },
      updateAssignment: (id, updates) => {
        set({
          assignments: get().assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        });
      },
      deleteAssignment: (id) => {
        set({ assignments: get().assignments.filter((a) => a.id !== id) });
      },
      toggleComplete: (assignmentId, studentId) => {
        set({
          assignments: get().assignments.map((a) => {
            if (a.id !== assignmentId) return a;
            const already = a.completedBy.includes(studentId);
            return {
              ...a,
              completedBy: already
                ? a.completedBy.filter((sid) => sid !== studentId)
                : [...a.completedBy, studentId],
            };
          }),
        });
      },
      setAssignments: (assignments) => set({ assignments }),
      submitHomework: (sub) => {
        const newSub: Submission = {
          id: crypto.randomUUID(),
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          ...sub,
        };
        set({ submissions: [...get().submissions, newSub] });
        
        // Auto mark assignment as completed by this student
        const assignment = get().assignments.find(a => a.id === sub.assignmentId);
        if (assignment && !assignment.completedBy.includes(sub.studentId)) {
          get().toggleComplete(sub.assignmentId, sub.studentId);
        }
      },
      gradeSubmission: (submissionId, grade, feedback, coinsAwarded) => {
        set({
          submissions: get().submissions.map((s) => 
            s.id === submissionId ? { ...s, status: 'graded', grade, feedback, coinsAwarded } : s
          ),
        });
      },
    }),
    { name: 'homework-store-clean-v1' }
  )
);
