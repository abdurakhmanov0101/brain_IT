import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  groupId: string;
  completedBy: string[]; // student IDs
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  type: 'file' | 'code';
  fileUrl?: string;
  fileName?: string;   // original file name when uploaded directly
  code?: string;
  language?: string; // python, javascript, cpp, etc.
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
      assignments: [
        {
          id: 'hw1',
          title: "React va Tailwind CSS orqali Portfolio",
          description: "O'zingiz uchun shaxsiy portfolio vebsaytini React va Tailwind CSS yordamida yozing. Dark mode va animatsiyalar bo'lishi shart! GitHub'ga push qiling va havola yuboring.",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          groupId: "g1",
          completedBy: ['st1'],
        },
        {
          id: 'hw2',
          title: "JavaScript DOM va Eventlar",
          description: "Interaktiv Todo App va Kalkulyatorni Vanilla JS orqali yozing. Faylni ZIP qilib yuboring yoki GitHub link yuboring.",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          groupId: "g1",
          completedBy: [],
        },
        {
          id: 'hw3',
          title: "Python Django REST API",
          description: "Kitoblar do'koni (Bookstore) uchun CRUD API yarating. JWT autentifikatsiya qo'shilsin. Loyihani GitHub'ga joylashtiring.",
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          groupId: "g2",
          completedBy: [],
        },
        {
          id: 'hw4',
          title: "Python: Telegram Bot yozish",
          description: "Aiogram 3.x kutubxonasi yordamida foydalanuvchidan manzil olib, ob-havo ma'lumotini qaytaruvchi bot yozing. Bot tokenini yubormang!",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          groupId: "g3",
          completedBy: [],
        },
        {
          id: 'hw5',
          title: "HTML & CSS: Responsive Landing Page",
          description: "Biror mahsulot yoki xizmat uchun to'liq responsive landing page yarating. Mobile-first yondashuv qo'llanilsin.",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          groupId: "g3",
          completedBy: [],
        },
      ],
      groups: [
        { id: 'g1', name: 'Frontend G-1' },
        { id: 'g2', name: 'Backend G-1' },
        { id: 'g3', name: 'IT Foundation G-2' },
        { id: 'g4', name: 'Suniy Intellekt G-1' },
        { id: 'g5', name: 'English for IT G-1' },
        { id: 'g6', name: 'Kiberxavfsizlik G-1' },
      ],
      students: [
        { id: 'st1', name: 'Aziz Alimov', groupId: 'g1' },
        { id: 'st2', name: 'Malika Sobirova', groupId: 'g1' },
        { id: 'st9', name: 'Otabek Qodirov', groupId: 'g1' },
        { id: 'st16', name: 'Shakhnoza Mirova', groupId: 'g1' },
        { id: 'st3', name: 'Sherzod Umarov', groupId: 'g2' },
        { id: 'st4', name: 'Dilnoza Rahimova', groupId: 'g2' },
        { id: 'st5', name: 'Jasur Toshmatov', groupId: 'g3' },
        { id: 'st6', name: 'Kamola Yusupova', groupId: 'g3' },
      ],
      submissions: [
        {
          id: 'sub1',
          assignmentId: 'hw1',
          studentId: 'st1',
          type: 'code' as const,
          language: 'javascript',
          code: `// React Portfolio - Aziz Alimov
import React from "react";

const skills = ["React", "Tailwind CSS", "TypeScript", "Next.js"];

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 mb-6 flex items-center justify-center text-4xl">
          👨‍💻
        </div>
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Aziz Alimov
        </h1>
        <p className="text-xl text-slate-300 mt-3">Frontend Developer & UI Designer</p>
        <div className="flex flex-wrap gap-3 mt-8 justify-center">
          {skills.map(s => (
            <span key={s} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm font-bold text-cyan-400">
              {s}
            </span>
          ))}
        </div>
        <button className="mt-10 px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-indigo-500/30">
          Bog'lanish
        </button>
      </section>
    </div>
  );
}`,
          status: 'submitted' as const,
          submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
      ],
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
    { name: 'brain-it-homeworkStore-v11' }
  )
);
