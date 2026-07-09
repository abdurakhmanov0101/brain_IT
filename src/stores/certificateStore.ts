import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  issueDate: string;
  certificateNumber: string;
}

interface CertificateState {
  certificates: Certificate[];
  addCertificate: (certificate: Certificate) => void;
  deleteCertificate: (id: string) => void;
  getCertificatesByStudent: (studentId: string) => Certificate[];
  getCertificateById: (id: string) => Certificate | undefined;
}

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set, get) => ({
      certificates: [],
      addCertificate: (certificate) => set((state) => ({
        certificates: [...state.certificates, certificate]
      })),
      deleteCertificate: (id) => set((state) => ({
        certificates: state.certificates.filter(c => c.id !== id)
      })),
      getCertificatesByStudent: (studentId) => {
        return get().certificates.filter(c => c.studentId === studentId);
      },
      getCertificateById: (id) => {
        return get().certificates.find(c => c.id === id);
      }
    }),
    {
      name: 'brain-certificates-storage',
    }
  )
);
