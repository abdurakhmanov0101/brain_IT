import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, CheckCircle, AlertCircle, Clock, CameraOff, Scan,
  UserCheck, UserX, UserPlus, Trash2, ShieldCheck, Users,
} from 'lucide-react';
import { Badge } from '../../components/Badge';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useFaceStore, type RegisteredFace } from '../../stores/faceStore';
import { useFaceidStore } from '../../stores/faceidStore';
import { useUIStore } from '../../stores/uiStore';
import type { AttendanceLog } from '../../data/mockData';

type ScanPhase = 'idle' | 'loading' | 'scanning' | 'detected' | 'error';
type Tab = 'scan' | 'register';
type PersonType = 'student' | 'teacher';

export const FaceIDAttendance: React.FC = () => {
  /* ---------- stores ---------- */
  const { students } = useStudentStore();
  const { teachers } = useTeacherStore();
  const { faces, registerFace, removeFace, isRegistered } = useFaceStore();
  const { logs, setLogs } = useFaceidStore();
  const { addToast } = useUIStore();

  /* ---------- camera refs ---------- */
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLineRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ---------- scan state ---------- */
  const [tab, setTab] = useState<Tab>('scan');
  const [cameraOn, setCameraOn] = useState(false);
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [scanY, setScanY] = useState(0);
  const [detected, setDetected] = useState<RegisteredFace | null>(null);
  const [detectedStatus, setDetectedStatus] = useState<AttendanceLog['status']>('present');
  const [boxVisible, setBoxVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'student' | 'staff'>('all');
  const [camError, setCamError] = useState('');

  /* ---------- register state ---------- */
  const [personType, setPersonType] = useState<PersonType>('student');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [regCamOn, setRegCamOn] = useState(false);

  /* ---------- camera helpers ---------- */
  const stopStream = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const stopCamera = useCallback(() => {
    stopStream();
    setCameraOn(false); setRegCamOn(false);
    setPhase('idle'); setBoxVisible(false); setDetected(null); setCamError('');
  }, [stopStream]);

  const startCamera = useCallback(async (forRegister = false) => {
    setCamError(''); setPhase('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      if (forRegister) { setRegCamOn(true); setCapturedPhoto(''); }
      else setCameraOn(true);
      setPhase('idle');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setCamError(msg.includes('Permission') || msg.includes('allowed') || msg.includes('denied')
        ? 'Kameraga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering.'
        : `Kamera xatosi: ${msg}`);
      setPhase('error');
    }
  }, []);

  /* ---------- capture photo (for registration) ---------- */
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current ?? document.createElement('canvas');
    const v = videoRef.current;
    canvas.width = v.videoWidth || 320;
    canvas.height = v.videoHeight || 240;
    canvas.getContext('2d')?.drawImage(v, 0, 0);
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.85));
  }, []);

  /* ---------- save registration ---------- */
  const handleRegister = useCallback(() => {
    if (!selectedPersonId || !capturedPhoto) {
      addToast({ type: 'error', message: 'Shaxsni tanlang va rasmni oling' }); return;
    }
    const person = personType === 'student'
      ? students.find((s) => s.id === selectedPersonId)
      : teachers.find((t) => t.id === selectedPersonId);
    if (!person) return;
    registerFace({
      personId: selectedPersonId,
      personName: person.fullName,
      personRole: personType === 'student' ? "O'quvchi" : 'Ustoz',
      personPhoto: person.photo,
      facePhoto: capturedPhoto,
    });
    addToast({ type: 'success', message: `${person.fullName} yuz tizimiga qo'shildi` });
    setCapturedPhoto(''); stopStream(); setRegCamOn(false);
  }, [selectedPersonId, capturedPhoto, personType, students, teachers, registerFace, addToast, stopStream]);

  /* ---------- scan animation ---------- */
  const animateScanLine = useCallback(() => {
    scanLineRef.current = (scanLineRef.current + 1.8) % 100;
    setScanY(scanLineRef.current);
    animFrameRef.current = requestAnimationFrame(animateScanLine);
  }, []);

  /* ---------- scan ---------- */
  const handleScan = useCallback(() => {
    if (!cameraOn || phase === 'scanning') return;
    if (faces.length === 0) {
      addToast({ type: 'error', message: "Avval 'Ro'yxatdan o'tkazish' bo'limida yuzlarni ro'yxatga oling" }); return;
    }
    setPhase('scanning'); setBoxVisible(false); setDetected(null);
    scanLineRef.current = 0;
    animFrameRef.current = requestAnimationFrame(animateScanLine);

    setTimeout(() => {
      cancelAnimationFrame(animFrameRef.current);
      setBoxVisible(true);
      setTimeout(() => {
        const pick = faces[Math.floor(Math.random() * faces.length)];
        const statuses: AttendanceLog['status'][] = ['present', 'present', 'present', 'late', 'absent'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setDetected(pick); setDetectedStatus(status); setPhase('detected');
        
        if (!logs.some((l) => l.userId === pick.personId && l.time === time)) {
          setLogs([{
            id: `al_${Date.now()}`,
            userId: pick.personId, name: pick.personName,
            role: pick.personRole, department: 'Brain IT',
            photo: pick.facePhoto || pick.personPhoto,
            time, status,
          }, ...logs]);
        }
      }, 400);
    }, 1800 + Math.random() * 800);
  }, [cameraOn, phase, faces, animateScanLine, addToast, setLogs, logs]);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  /* ---------- derived ---------- */
  const presentCount = logs.filter((l) => l.status === 'present').length;
  const lateCount    = logs.filter((l) => l.status === 'late').length;
  const absentCount  = logs.filter((l) => l.status === 'absent').length;
  const filtered = logs.filter((l) =>
    filter === 'student' ? l.role === "O'quvchi" : filter === 'staff' ? l.role !== "O'quvchi" : true);

  const cornerColor = phase === 'detected'
    ? (detectedStatus === 'present' ? 'border-emerald-400' : detectedStatus === 'late' ? 'border-amber-400' : 'border-red-400')
    : 'border-emerald-400';
  const statusColor = detectedStatus === 'present' ? 'border-emerald-500 bg-emerald-500/10'
    : detectedStatus === 'late' ? 'border-amber-500 bg-amber-500/10' : 'border-red-500 bg-red-500/10';

  const personList = personType === 'student' ? students.filter((s) => s.status === 'active') : teachers.filter((t) => t.status === 'active');

  /* ===================== RENDER ===================== */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Face ID Davomat</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-vaqt yuz tanish tizimi</p>
        </div>
        <div className="flex gap-2">
          {(['scan', 'register'] as const).map((t) => (
            <button key={t} onClick={() => { stopCamera(); setTab(t); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {t === 'scan' ? <span className="flex items-center gap-1.5"><Scan className="h-3.5 w-3.5" /> Skanlaish</span>
                : <span className="flex items-center gap-1.5"><UserPlus className="h-3.5 w-3.5" /> Ro'yxatdan o'tkazish</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ====== TAB: SCAN ====== */}
      {tab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Panel */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kamera oynasi</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${phase === 'scanning' ? 'bg-red-500 animate-pulse' : cameraOn ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                <span className="text-[10px] text-slate-500 font-medium">
                  {phase === 'scanning' ? 'SKANLANMOQDA' : cameraOn ? 'JONLI' : 'YOPIQ'}
                </span>
              </div>
            </div>

            <div className="relative flex-1 bg-slate-950 overflow-hidden" style={{ minHeight: 280 }}>
              {/* Simulation Mode Badge */}
              <div className="absolute top-3 left-3 bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm z-10">
                SIMULYATSIYA REJIMI
              </div>

              <video ref={videoRef} autoPlay playsInline muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${cameraOn ? 'opacity-100' : 'opacity-0'}`} />

              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  {phase === 'error' ? (
                    <><CameraOff className="h-12 w-12 text-red-500/60" /><p className="text-xs text-red-400 text-center px-6 leading-relaxed">{camError}</p></>
                  ) : phase === 'loading' ? (
                    <><div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" /><p className="text-xs text-slate-400">Kamera ochilmoqda...</p></>
                  ) : (
                    <><CameraOff className="h-12 w-12 text-slate-700" /><p className="text-xs text-slate-500">Kamerani yoqish uchun bosing</p></>
                  )}
                </div>
              )}

              {cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Circular Frame */}
                  <div className={`relative w-48 h-48 rounded-full border-4 transition-all duration-500 flex items-center justify-center ${
                    phase === 'scanning' ? 'border-amber-400 border-dashed animate-[spin_12s_linear_infinite]'
                    : phase === 'detected' ? (detectedStatus === 'absent' ? 'border-red-500 bg-red-500/10' : 'border-emerald-500 bg-emerald-500/10')
                    : 'border-brand-500/30 border-dashed'
                  }`}>
                    {phase === 'scanning' && (
                      <div className="absolute inset-2 rounded-full border-2 border-amber-400/30 animate-pulse" />
                    )}

                    {phase === 'detected' && detected && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        {detectedStatus === 'present' ? <UserCheck className="h-12 w-12 text-emerald-400 drop-shadow-lg" />
                          : detectedStatus === 'late' ? <Clock className="h-12 w-12 text-amber-400 drop-shadow-lg" />
                          : <UserX className="h-12 w-12 text-red-400 drop-shadow-lg" />}
                      </div>
                    )}

                    {phase === 'idle' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Scan className="h-12 w-12 text-brand-500/40 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {phase === 'scanning' && (
                    <div className="absolute w-44 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_2px_rgba(245,158,11,0.6)] animate-pulse" />
                  )}
                </div>
              )}

              {phase === 'detected' && detected && (
                <div className={`absolute bottom-0 left-0 right-0 px-3 py-2.5 backdrop-blur-sm flex items-center gap-2.5 ${detectedStatus === 'present' ? 'bg-emerald-900/80' : detectedStatus === 'late' ? 'bg-amber-900/80' : 'bg-red-900/80'}`}>
                  <img src={detected.facePhoto || detected.personPhoto} alt={detected.personName}
                    className="h-8 w-8 rounded-full object-cover border-2 border-white/30 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{detected.personName}</p>
                    <p className="text-[10px] text-white/70">
                      {detected.personRole} · {detectedStatus === 'present' ? 'Keldi ✓' : detectedStatus === 'late' ? 'Kech keldi ⚠' : 'Kelmadi ✗'}
                    </p>
                  </div>
                  <ShieldCheck className={`h-5 w-5 ml-auto shrink-0 ${detectedStatus === 'present' ? 'text-emerald-300' : detectedStatus === 'late' ? 'text-amber-300' : 'text-red-300'}`} />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="p-4 border-t border-slate-800 space-y-2">
              {faces.length === 0 && (
                <p className="text-[10px] text-amber-400/80 text-center mb-1">
                  ⚠ Avval "Ro'yxatdan o'tkazish" orqali yuzlarni qo'shing
                </p>
              )}
              {!cameraOn ? (
                <button onClick={() => startCamera(false)} disabled={phase === 'loading'}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <Camera className="h-4 w-4" />
                  {phase === 'loading' ? 'Ochilmoqda...' : 'Kamerani Yoqish'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleScan} disabled={phase === 'scanning'}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                    <Scan className="h-4 w-4" />
                    {phase === 'scanning' ? 'Skanlanmoqda...' : 'Yuz skanlash'}
                  </button>
                  <button onClick={stopCamera} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors">
                    <CameraOff className="h-4 w-4" />
                  </button>
                </div>
              )}
              {phase === 'detected' && cameraOn && (
                <button onClick={() => { setPhase('idle'); setDetected(null); setBoxVisible(false); }}
                  className="w-full py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-xs font-medium transition-colors">
                  Qayta Skanlash
                </button>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[{ label: 'Keldi', count: presentCount, Icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'Kechikkan', count: lateCount, Icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { label: 'Kelmadi', count: absentCount, Icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' }].map((s) => (
                <div key={s.label} className={`${s.bg} border border-slate-200 dark:border-dark-border rounded-2xl p-4 text-center`}>
                  <s.Icon className={`h-6 w-6 ${s.color} mx-auto mb-2`} />
                  <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">So'nggi Kirish Jurnali</h3>
                <div className="flex gap-2">
                  {(['all', 'student', 'staff'] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                      {f === 'all' ? 'Barchasi' : f === 'student' ? 'Talabalar' : 'Xodimlar'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-dark-border max-h-[420px] overflow-y-auto">
                {filtered.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <img src={log.photo} alt={log.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{log.name}</p>
                      <p className="text-xs text-slate-400">{log.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge label={log.status === 'present' ? 'Keldi' : log.status === 'late' ? 'Kechikkan' : 'Kelmadi'}
                        color={log.status === 'present' ? 'green' : log.status === 'late' ? 'yellow' : 'red'} dot />
                      <p className="text-xs text-slate-400 mt-1">{log.time}</p>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm">Hali yozuvlar yo'q</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== TAB: REGISTER ====== */}
      {tab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration form */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 space-y-5">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-500" /> Yuz Ro'yxatdan O'tkazish
            </h2>

            {/* Person type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Shaxs turi</label>
              <div className="flex gap-2">
                {(['student', 'teacher'] as const).map((t) => (
                  <button key={t} onClick={() => { setPersonType(t); setSelectedPersonId(''); setCapturedPhoto(''); stopStream(); setRegCamOn(false); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${personType === t ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {t === 'student' ? "O'quvchi" : 'Ustoz'}
                  </button>
                ))}
              </div>
            </div>

            {/* Person selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                {personType === 'student' ? "O'quvchini tanlang" : 'Ustozni tanlang'}
              </label>
              <select value={selectedPersonId} onChange={(e) => { setSelectedPersonId(e.target.value); setCapturedPhoto(''); stopStream(); setRegCamOn(false); }}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">— tanlang —</option>
                {personList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName}{isRegistered(p.id) ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected person info */}
            {selectedPersonId && (() => {
              const p = personList.find((x) => x.id === selectedPersonId);
              if (!p) return null;
              return (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <img src={p.photo} alt={p.fullName} className="h-12 w-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{p.fullName}</p>
                    <p className="text-xs text-slate-400">{'specialization' in p ? p.specialization : ('groupIds' in p ? `Guruhlar: ${p.groupIds?.length ?? 0}` : '')}</p>
                  </div>
                  {isRegistered(p.id) && (
                    <Badge label="Ro'yxatda bor" color="green" dot />
                  )}
                </div>
              );
            })()}

            {/* Camera for registration */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Yuz rasmi (kamera)</label>
              <div className="relative bg-slate-900 rounded-xl overflow-hidden" style={{ minHeight: 200 }}>
                <video ref={videoRef} autoPlay playsInline muted
                  className={`w-full object-cover transition-opacity duration-300 ${regCamOn && !capturedPhoto ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                  style={{ maxHeight: 220 }} />

                {capturedPhoto ? (
                  <div className="relative">
                    <img src={capturedPhoto} alt="captured" className="w-full object-cover" style={{ maxHeight: 220 }} />
                    <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : !regCamOn ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <Camera className="h-10 w-10 text-slate-600" />
                    <p className="text-xs text-slate-500">Kamerani yoqing va rasm oling</p>
                  </div>
                ) : null}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2">
                {!regCamOn ? (
                  <button onClick={() => startCamera(true)} disabled={!selectedPersonId}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Camera className="h-4 w-4" /> Kamerani yoq
                  </button>
                ) : (
                  <>
                    <button onClick={capturePhoto}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                      <Camera className="h-4 w-4" /> Rasm ol
                    </button>
                    <button onClick={() => { stopStream(); setRegCamOn(false); }}
                      className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
                      <CameraOff className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {capturedPhoto && (
                <button onClick={handleRegister}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <ShieldCheck className="h-4 w-4" /> Tizimga saqlash
                </button>
              )}
            </div>
          </div>

          {/* Registered faces list */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" /> Ro'yxatga olinganlar
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                {faces.length} ta
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-dark-border max-h-[520px] overflow-y-auto">
              {faces.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-sm space-y-2">
                  <ShieldCheck className="h-10 w-10 mx-auto opacity-20" />
                  <p>Hali hech kim ro'yxatga olinmagan</p>
                </div>
              )}
              {faces.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Face photo captured */}
                  <div className="relative shrink-0">
                    <img src={f.facePhoto} alt={f.personName} className="h-12 w-12 rounded-full object-cover border-2 border-emerald-300 dark:border-emerald-700" />
                    <img src={f.personPhoto} alt="" className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full object-cover border border-white dark:border-dark-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{f.personName}</p>
                    <p className="text-xs text-slate-400">
                      {f.personRole} · {new Date(f.registeredAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                  <button onClick={() => { removeFace(f.personId); addToast({ type: 'warning', message: `${f.personName} tizimdan o'chirildi` }); }}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
