import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RegisteredFace {
  id: string;
  personId: string;
  personName: string;
  personRole: string;
  personPhoto: string;
  facePhoto: string;
  registeredAt: string;
}

interface FaceState {
  faces: RegisteredFace[];
  registerFace: (f: Omit<RegisteredFace, 'id' | 'registeredAt'>) => void;
  removeFace: (personId: string) => void;
  isRegistered: (personId: string) => boolean;
  getFace: (personId: string) => RegisteredFace | undefined;
}

export const useFaceStore = create<FaceState>()(
  persist(
    (set, get) => ({
      faces: [],
      registerFace: (f) => {
        const existing = get().faces.some((x) => x.personId === f.personId);
        const newFace: RegisteredFace = { ...f, id: `face_${Date.now()}`, registeredAt: new Date().toISOString() };
        set((s) => ({
          faces: existing
            ? s.faces.map((x) => (x.personId === f.personId ? newFace : x))
            : [...s.faces, newFace],
        }));
      },
      removeFace: (personId) => set((s) => ({ faces: s.faces.filter((f) => f.personId !== personId) })),
      isRegistered: (personId) => get().faces.some((f) => f.personId === personId),
      getFace: (personId) => get().faces.find((f) => f.personId === personId),
    }),
    { name: 'brain-it-faceStore-v11' }
  )
);
