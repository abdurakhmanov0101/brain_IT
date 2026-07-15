import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AttendanceLog, initialAttendance } from '../data/mockData';

export interface GeofenceConfig {
  enabled: boolean;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  simulateLocation: boolean;
}

interface FaceIDState {
  logs: AttendanceLog[];
  geofence: GeofenceConfig;
  setLogs: (logs: AttendanceLog[]) => void;
  addLog: (log: AttendanceLog) => void;
  updateGeofence: (config: Partial<GeofenceConfig>) => void;
}

const initialGeofence: GeofenceConfig = {
  enabled: true,
  latitude: 41.311081,
  longitude: 69.240562,
  radiusMeters: 100,
  simulateLocation: true,
};

export const useFaceidStore = create<FaceIDState>()(
  persist(
    (set) => ({
      logs: initialAttendance,
      geofence: initialGeofence,
      setLogs: (logs) => set({ logs }),
      addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
      updateGeofence: (config) => set((state) => ({ geofence: { ...state.geofence, ...config } })),
    }),
    { name: 'brain-it-faceid-logs' }
  )
);
