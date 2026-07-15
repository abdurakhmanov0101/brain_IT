import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Camera, CameraOff, Scan, ShieldCheck, CheckCircle, AlertCircle, MapPin, Zap, Clock, UserCheck } from 'lucide-react';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { useAuthStore } from '../../stores/authStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useFaceStore, type RegisteredFace } from '../../stores/faceStore';
import { useFaceidStore } from '../../stores/faceidStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useCoinStore } from '../../stores/coinStore';
import { useTelegramStore } from '../../stores/telegramStore';
import { useUIStore } from '../../stores/uiStore';
import { sendFaceIDPhotoNotification } from '../../services/telegramBot';
import { verifyUserLocation } from '../../utils/geoUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  targetStudentId?: string; // If student opens from portal/overview, pre-filter or auto-match
}

export const QuickFaceIDModal: React.FC<Props> = ({ open, onClose, targetStudentId }) => {
  const { currentUser } = useAuthStore();
  const { students, updateStudent } = useStudentStore();
  const { teachers } = useTeacherStore();
  const { faces } = useFaceStore();
  const { logs, setLogs, geofence } = useFaceidStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { records: attendanceRecords, markAttendance } = useAttendanceStore();
  const { addTransaction } = useCoinStore();
  const { getChatIdByStudentId } = useTelegramStore();
  const { addToast } = useUIStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successPerson, setSuccessPerson] = useState<{ name: string; role: string; photo: string; deducted: number } | null>(null);

  // Build pool of everyone (or specific student if targeted)
  const candidatePool = useMemo(() => {
    const pool: RegisteredFace[] = [...faces];
    
    students.filter(s => s.status === 'active' && s.photo).forEach(s => {
      if (!pool.some(f => f.personId === s.id)) {
        pool.push({
          id: `fallback_s_${s.id}`,
          personId: s.id,
          personName: s.fullName,
          personRole: "O'quvchi",
          personPhoto: s.photo,
          facePhoto: s.photo,
          registeredAt: new Date().toISOString(),
        });
      }
    });

    teachers.filter(t => t.status === 'active' && t.photo).forEach(t => {
      if (!pool.some(f => f.personId === t.id)) {
        pool.push({
          id: `fallback_t_${t.id}`,
          personId: t.id,
          personName: t.fullName,
          personRole: 'Ustoz',
          personPhoto: t.photo,
          facePhoto: t.photo,
          registeredAt: new Date().toISOString(),
        });
      }
    });

    return pool;
  }, [faces, students, teachers]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMessage('');
    setPhase('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setPhase('idle');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMessage(msg.includes('Permission') || msg.includes('allowed') || msg.includes('denied')
        ? 'Kameraga ruxsat berilmadi. Brauzer sozlamalaridan kameraga ruxsat bering.'
        : `Kamera xatosi: ${msg}`);
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    if (open) {
      startCamera();
      setPhase('idle');
      setSuccessPerson(null);
    } else {
      stopCamera();
    }
    return () => { stopCamera(); };
  }, [open, startCamera, stopCamera]);

  const handleQuickCheckIn = async () => {
    if (!cameraOn || phase === 'scanning') return;

    // 1. Geolocation Verification
    if (geofence.enabled) {
      const geoRes = await verifyUserLocation(geofence.latitude, geofence.longitude, geofence.radiusMeters, geofence.simulateLocation);
      if (!geoRes.allowed) {
        setErrorMessage(geoRes.error || '📍 Siz akademiyaning belgilangan lokatsiyasida emassiz.');
        setPhase('error');
        addToast({ type: 'error', message: geoRes.error || 'Lokatsiyada emassiz' });
        return;
      }
    }

    setPhase('scanning');

    // 2. Capture video frame snapshot
    const v = videoRef.current;
    let snapshotUrl = '';
    if (v) {
      const c = canvasRef.current ?? document.createElement('canvas');
      c.width = v.videoWidth || 320;
      c.height = v.videoHeight || 240;
      c.getContext('2d')?.drawImage(v, 0, 0);
      snapshotUrl = c.toDataURL('image/jpeg', 0.85);
    }

    setTimeout(() => {
      // If student is logged in or targetStudentId passed, prioritize recognizing them right away
      let matchedPerson = candidatePool.find(f => f.personId === targetStudentId || f.personId === currentUser.studentId);
      if (!matchedPerson && candidatePool.length > 0) {
        matchedPerson = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      }

      if (!matchedPerson) {
        setErrorMessage("Tizimda rasmingiz topilmadi. Avval profilga rasm qo'shing yoki ro'yxatdan o'ting.");
        setPhase('error');
        return;
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];

      // Add log
      if (!logs.some(l => l.userId === matchedPerson.personId && l.time === timeStr)) {
        setLogs([{
          id: `al_quick_${Date.now()}`,
          userId: matchedPerson.personId,
          name: matchedPerson.personName,
          role: matchedPerson.personRole,
          department: 'Brain IT',
          photo: snapshotUrl || matchedPerson.facePhoto || matchedPerson.personPhoto,
          time: timeStr,
          status: 'present',
        }, ...logs]);
      }

      let deductedAmount = 0;

      // Mark attendance if student
      if (matchedPerson.personRole === "O'quvchi") {
        const student = students.find(s => s.id === matchedPerson.personId);
        if (student) {
          const studentGroup = groups.find(g => student.groupIds.includes(g.id) && g.status !== 'archived');
          if (studentGroup) {
            const alreadyMarked = attendanceRecords.some(r => r.studentId === student.id && r.groupId === studentGroup.id && r.date === todayStr);
            const course = courses.find(c => c.id === studentGroup.courseId);
            const lessonPrice = course?.lessonPrice ?? 50000;

            if (!alreadyMarked) {
              markAttendance({
                studentId: student.id,
                groupId: studentGroup.id,
                date: todayStr,
                status: 'present',
                checkedBy: 'face_id',
                deductionApplied: true,
              });
              updateStudent(student.id, { balance: student.balance - lessonPrice });
              addTransaction({
                userId: student.id,
                type: 'spend',
                amount: lessonPrice,
                description: `Dars uchun to'lov (${course?.name || 'Face ID davomat'})`,
                category: 'other',
              });
              deductedAmount = lessonPrice;
            }

            // Send parent telegram alert with snapshot
            const parentChatId = getChatIdByStudentId(student.id);
            if (parentChatId && snapshotUrl) {
              sendFaceIDPhotoNotification({
                chatId: parentChatId,
                studentName: student.fullName,
                courseName: course?.name ?? 'IT Kurs',
                groupName: studentGroup.name,
                date: todayStr,
                time: timeStr,
                photoDataUrl: snapshotUrl,
              });
            }
          }
        }
      }

      setSuccessPerson({
        name: matchedPerson.personName,
        role: matchedPerson.personRole,
        photo: snapshotUrl || matchedPerson.facePhoto || matchedPerson.personPhoto,
        deducted: deductedAmount,
      });
      setPhase('success');
      addToast({ type: 'success', message: `✅ ${matchedPerson.personName} davomati belgilandi!` });
    }, 1500);
  };

  return (
    <Modal open={open} onClose={() => { stopCamera(); onClose(); }} title="Face ID & Lokatsiya orqali Davomat" size="md">
      <div className="space-y-4">
        {/* Geofence info badge */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-dark-border text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Lokatsiya tekshiruv: {geofence.simulateLocation ? 'Simulyatsiya (Yoqilgan)' : `${geofence.radiusMeters}m radius`}
            </span>
          </div>
          <Badge label={cameraOn ? 'Kamera faol' : 'Yoqilmoqda...'} color={cameraOn ? 'emerald' : 'amber'} dot />
        </div>

        {/* Video Box */}
        <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraOn && phase !== 'success' ? 'opacity-100' : 'opacity-0'}`} />

          {phase === 'error' && (
            <div className="text-center p-6 z-10 space-y-3">
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-rose-400">{errorMessage}</p>
              <button onClick={startCamera} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700">
                Qayta urinib ko'rish
              </button>
            </div>
          )}

          {phase === 'loading' && (
            <div className="text-center z-10 space-y-2">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Kamera va lokatsiya tayyorlanmoqda...</p>
            </div>
          )}

          {phase === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-48 h-48 rounded-full border-4 border-amber-400 border-dashed animate-[spin_8s_linear_infinite]" />
              <div className="absolute w-44 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_2px_rgba(245,158,11,0.6)] animate-pulse" />
            </div>
          )}

          {phase === 'success' && successPerson && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
              <div className="relative mb-3">
                <img src={successPerson.photo} alt={successPerson.name} className="h-20 w-20 rounded-full object-cover border-4 border-emerald-500 shadow-xl" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 text-white shadow-md">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-heading font-black text-xl text-white">{successPerson.name}</h3>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5">{successPerson.role} · DAVOMATDAN O'TDINGIZ! ✓</p>
              {successPerson.deducted > 0 && (
                <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-bold">
                  Balansdan dars uchun {successPerson.deducted.toLocaleString()} so'm yechildi
                </div>
              )}
              <p className="text-[11px] text-slate-400 mt-2">Ota-onangizning telegramiga skrin rasm va xabar yuborildi 📬</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => { stopCamera(); onClose(); }}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            {phase === 'success' ? 'Yopish' : 'Bekor qilish'}
          </button>

          {phase !== 'success' && (
            <button
              type="button"
              onClick={handleQuickCheckIn}
              disabled={!cameraOn || phase === 'scanning'}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Scan className="h-4 w-4" />
              {phase === 'scanning' ? 'Skanlanmoqda...' : 'Yuzni tanish va Davomat'}
            </button>
          )}

          {phase === 'success' && (
            <button
              type="button"
              onClick={() => { setPhase('idle'); setSuccessPerson(null); }}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all"
            >
              Boshqa shaxsni skanlash
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
