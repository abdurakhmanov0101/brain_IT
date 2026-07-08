import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Project, projects as initialProjects } from '../data/mockData';

interface PMState {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  updateProjectTaskStatus: (projectId: string, taskId: string, status: any) => void;
}

export const usePmStore = create<PMState>()(
  persist(
    (set) => ({
      projects: initialProjects,
      setProjects: (projects) => set({ projects }),
      updateProjectTaskStatus: (projectId, taskId, status) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
                }
              : p
          ),
        })),
    }),
    { name: 'brain-it-pm-projects-prod-v1' }
  )
);
