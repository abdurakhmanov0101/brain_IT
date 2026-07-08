import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface UIState {
  darkMode: boolean;
  language: 'uz' | 'ru' | 'en';
  sidebarCollapsed: boolean;
  toasts: Toast[];
  setDarkMode: (v: boolean) => void;
  setLanguage: (lang: 'uz' | 'ru' | 'en') => void;
  toggleSidebar: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      language: 'uz',
      sidebarCollapsed: false,
      toasts: [],
      setDarkMode: (v) => {
        set({ darkMode: v });
        if (v) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      },
      setLanguage: (lang) => set({ language: lang }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      addToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, toast.duration ?? 3500);
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'brain-it-ui',
      partialize: (s) => ({ darkMode: s.darkMode, language: s.language }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.darkMode);
        }
      },
    }
  )
);
