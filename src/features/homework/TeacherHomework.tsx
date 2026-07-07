import React, { useState } from 'react';
import {
  Plus, Edit3, Trash2, CheckCircle2, X, Star, FileText,
  Code, Users, Clock, BookOpen, ChevronRight, Award,
  TrendingUp, Eye, Download, Link2, AlertTriangle
} from 'lucide-react';
import { useHomeworkStore } from '../../stores/homeworkStore';
import type { Assignment, Submission } from '../../stores/homeworkStore';
import { useAuthStore } from '../../stores/authStore';
import { useCoinStore } from '../../stores/coinStore';
import { HomeworkForm } from './HomeworkForm';
import { CodeEditor } from '../../components/CodeEditor';
import { useUIStore } from '../../stores/uiStore';
import { useStudentStore } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';

function GradeBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = pct >= 85 ? 'from-emerald-500 to-green-400' : pct >= 65 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-pink-400';
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const TeacherHomework: React.FC = () => {
  const { assignments, submissions, addAssignment, updateAssignment, deleteAssignment, gradeSubmission } = useHomeworkStore();
  const { students } = useStudentStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { addToast } = useUIStore();
  const { currentUser } = useAuthStore();
  const { sendCoins } = useCoinStore();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | typeof assignments[0]>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  // Isolation
  const teacherGroupIds = groups.filter(g => g.teacherId === currentUser?.id).map(g => g.id);
  const visibleAssignments = assignments.filter(a => teacherGroupIds.includes(a.groupId));
  const visibleSubmissions = submissions.filter(s => {
    const assignment = assignments.find(a => a.id === s.assignmentId);
    return assignment && teacherGroupIds.includes(assignment.groupId);
  });

  // Stats
  const totalSubs = visibleSubmissions.length;
  const gradedSubs = visibleSubmissions.filter(s => s.status === 'graded').length;
  const pendingSubs = visibleSubmissions.filter(s => s.status === 'submitted').length;
  const orphanedSubs = visibleSubmissions.filter(s => !s.assignmentId);

  const getStudentBySid = (sid: string) => {
    return (
      students.find(s =>
        s.id === sid ||
        `u_${s.id}` === sid ||
        s.id === sid.replace('u_', '') ||
        s.id === sid.replace('st', 's') ||
        s.id === sid.replace('s', 'st')
      ) || { id: sid, fullName: `O'quvchi (${sid})`, photo: '' }
    );
  };

  const handleCreate = (data: Omit<typeof assignments[0], 'id' | 'completedBy'>) => {
    addAssignment(data);
    setShowForm(false);
    addToast({ type: 'success', message: '✅ Yangi vazifa yaratildi!' });
  };

  const handleUpdate = (id: string, data: Partial<Omit<typeof assignments[0], 'id' | 'completedBy'>>) => {
    updateAssignment(id, data);
    setEditing(null);
    setShowForm(false);
    addToast({ type: 'success', message: '✅ Vazifa yangilandi!' });
  };

  const handleOpenGrading = (sub: Submission) => {
    setSelectedSubmission(sub);
    setGradeScore(sub.grade || 0);
    setGradeFeedback(sub.feedback || '');
  };

  const handleSaveGrade = () => {
    if (!selectedSubmission || !currentUser) return;
    let coins = 0;
    if (gradeScore >= 95) coins = 3;
    else if (gradeScore >= 85) coins = 2;
    else if (gradeScore >= 65) coins = 1;

    if (coins > 0 && selectedSubmission.status !== 'graded') {
      const student = getStudentBySid(selectedSubmission.studentId);
      if (student && 'fullName' in student) {
        sendCoins(currentUser.id, currentUser.name, student.id, student.fullName, coins, `${selectedAssignment?.title} vazifasi uchun baho`);
      }
    }
    gradeSubmission(selectedSubmission.id, gradeScore, gradeFeedback, coins);
    addToast({ type: 'success', message: `✅ Baho saqlandi! ${coins > 0 ? `+${coins} 🪙 tanga yuborildi` : ''}` });
    setSelectedSubmission(null);
  };

  // ─── Submissions Modal ───────────────────────────────────────────────
  const renderSubmissionsModal = () => {
    if (!selectedAssignment) return null;
    const groupStudentIds = groups.find(g => g.id === selectedAssignment.groupId)?.studentIds || [];
    const groupStudents = students.filter(s =>
      s.groupIds?.includes(selectedAssignment.groupId) || groupStudentIds.includes(s.id)
    );
    const assignmentSubs = submissions.filter(s => s.assignmentId === selectedAssignment.id);
    const submittedCount = assignmentSubs.length;
    const gradedCount = assignmentSubs.filter(s => s.status === 'graded').length;

    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4">
        <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-300">
          {/* Modal Header */}
          <div className="relative p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shrink-0">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSelectedAssignment(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 className="font-heading font-bold text-xl pr-10">{selectedAssignment.title}</h2>
            <p className="text-white/70 text-sm mt-1 line-clamp-2">{selectedAssignment.description}</p>
            {/* Progress */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Topshirgan</span>
                  <span className="font-bold text-white">{submittedCount}/{groupStudents.length}</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-1.5 bg-white rounded-full transition-all duration-700" style={{ width: `${groupStudents.length ? (submittedCount / groupStudents.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="text-center shrink-0">
                <p className="text-2xl font-black">{gradedCount}</p>
                <p className="text-xs text-white/70">Baholangan</p>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-auto p-4">
            {groupStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="font-bold text-slate-600 dark:text-slate-400">Bu guruhda o'quvchi yo'q</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupStudents.map(student => {
                  const sub = assignmentSubs.find(s =>
                    s.studentId === student.id ||
                    s.studentId === student.id.replace('st', 's') ||
                    s.studentId === `u_${student.id}`
                  );
                  const isGraded = sub?.status === 'graded';
                  const isSubmitted = sub?.status === 'submitted';

                  return (
                    <div key={student.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      isGraded ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' :
                      isSubmitted ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50' :
                      'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    }`}>
                      {/* Avatar */}
                      {student.photo ? (
                        <img src={student.photo} alt={student.fullName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{student.fullName[0]}</span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{student.fullName}</p>
                        {isGraded && sub ? (
                          <div className="flex items-center gap-2 mt-1">
                            <GradeBar value={sub.grade!} />
                            <span className={`text-xs font-black shrink-0 ${sub.grade! >= 85 ? 'text-emerald-600' : sub.grade! >= 65 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {sub.grade}/100
                            </span>
                            {sub.coinsAwarded ? <span className="text-xs text-amber-500 font-bold shrink-0">+{sub.coinsAwarded}🪙</span> : null}
                          </div>
                        ) : isSubmitted ? (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {sub?.type === 'code' ? 'Kod yuborilgan' : 'Fayl yuborilgan'} — tekshirishni kutmoqda
                          </p>
                        ) : (
                          <p className="text-xs text-rose-500 mt-0.5">Hali topshirmagan</p>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        disabled={!sub}
                        onClick={() => { if (sub) handleOpenGrading(sub); }}
                        className={`shrink-0 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                          sub
                            ? isGraded
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400'
                              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {isGraded ? <><Eye className="h-3 w-3" /> Ko'rish</> : <><Star className="h-3 w-3" /> Baholash</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Grading Modal ───────────────────────────────────────────────────
  const renderGradingModal = () => {
    if (!selectedSubmission) return null;
    const student = getStudentBySid(selectedSubmission.studentId);
    const isAlreadyGraded = selectedSubmission.status === 'graded';
    const gradeColor = gradeScore >= 85 ? 'text-emerald-500' : gradeScore >= 65 ? 'text-amber-500' : gradeScore > 0 ? 'text-rose-500' : 'text-slate-400';
    const coinsPreview = gradeScore >= 95 ? 3 : gradeScore >= 85 ? 2 : gradeScore >= 65 ? 1 : 0;

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center gap-4 p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-lg text-slate-800 dark:text-white">
                {student?.fullName} — Baholash
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedAssignment?.title} · {new Date(selectedSubmission.submittedAt).toLocaleString('uz-UZ')}
              </p>
            </div>
            {isAlreadyGraded && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full">
                ✓ Baholangan
              </span>
            )}
            <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Left: Submission Content */}
            <div className="flex-[2] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#1a1a2e]">
              {selectedSubmission.type === 'code' ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase shrink-0">
                    <Code className="h-3.5 w-3.5" />
                    O'quvchi kodi · {selectedSubmission.language}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor
                      initialCode={selectedSubmission.code}
                      initialLanguage={selectedSubmission.language}
                      readOnly={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col p-5 gap-4 overflow-auto">
                  {/* File info */}
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      {selectedSubmission.fileUrl?.startsWith('http') ? (
                        <Link2 className="h-6 w-6 text-indigo-600" />
                      ) : (
                        <FileText className="h-6 w-6 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white truncate">
                        {selectedSubmission.fileName || (selectedSubmission.fileUrl?.startsWith('http') ? 'Tashqi havola' : 'Yuborilgan fayl')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {selectedSubmission.fileUrl?.startsWith('data:') ? 'To\'g\'ridan yuklangan fayl' : selectedSubmission.fileUrl}
                      </p>
                    </div>
                  </div>

                  {/* Image preview */}
                  {selectedSubmission.fileUrl?.startsWith('data:image/') && (
                    <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 overflow-hidden min-h-40">
                      <img
                        src={selectedSubmission.fileUrl}
                        alt={selectedSubmission.fileName || 'Rasm'}
                        className="max-w-full max-h-full object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* PDF preview */}
                  {selectedSubmission.fileUrl?.startsWith('data:application/pdf') && (
                    <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 min-h-48">
                      <iframe src={selectedSubmission.fileUrl} title="PDF" className="w-full h-full" style={{ minHeight: '300px' }} />
                    </div>
                  )}

                  {/* Download / Open button */}
                  {selectedSubmission.fileUrl && (
                    <a
                      href={selectedSubmission.fileUrl}
                      download={selectedSubmission.fileName || 'vazifa-fayli'}
                      target={selectedSubmission.fileUrl.startsWith('data:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      {selectedSubmission.fileUrl.startsWith('http') ? (
                        <><Link2 className="h-4 w-4" /> Havolani ochish</>
                      ) : (
                        <><Download className="h-4 w-4" /> Faylni yuklab olish</>
                      )}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right: Grading Panel */}
            <div className="lg:w-72 xl:w-80 shrink-0 p-5 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto gap-5">
              {/* Score display */}
              <div className="text-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Baho (0-100)</p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScore}
                  onChange={e => setGradeScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className={`w-full text-5xl font-black text-center p-2 rounded-2xl bg-transparent border-2 focus:outline-none transition-all ${
                    gradeScore >= 85 ? 'border-emerald-400 text-emerald-500' :
                    gradeScore >= 65 ? 'border-amber-400 text-amber-500' :
                    gradeScore > 0 ? 'border-rose-400 text-rose-500' :
                    'border-slate-200 dark:border-slate-600 text-slate-400'
                  }`}
                />
                {/* Quick buttons */}
                <div className="flex gap-2 mt-3 justify-center flex-wrap">
                  {[50, 65, 75, 85, 95, 100].map(v => (
                    <button
                      key={v}
                      onClick={() => setGradeScore(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        gradeScore === v
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coins preview */}
              {coinsPreview > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                  <span className="text-2xl">{coinsPreview === 3 ? '🏆' : coinsPreview === 2 ? '🥈' : '🥉'}</span>
                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">O'quvchiga {coinsPreview} 🪙 tanga beriladi</p>
                    <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70">{gradeScore >= 95 ? 'A\'lo natija!' : gradeScore >= 85 ? 'Yaxshi natija' : 'Qoniqarli'}</p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ustoz izohi</label>
                <textarea
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  rows={5}
                  placeholder="O'quvchiga tavsiyalar, tushuntirishlar..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none flex-1"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Bekor
                </button>
                <button
                  onClick={handleSaveGrade}
                  disabled={gradeScore === 0}
                  className="flex-[2] py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 page-enter">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-700 to-violet-700 p-7 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Ustoz paneli</p>
            <h1 className="font-heading font-black text-3xl mt-1">Uy‑Vazifalar</h1>
            <p className="text-white/70 text-sm mt-1">Guruh o'quvchilari javoblarini tekshiring va baholang.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 font-bold hover:bg-white/90 rounded-2xl transition-all active:scale-95 shadow-xl shadow-black/20"
          >
            <Plus className="h-4 w-4" /> Yangi vazifa
          </button>
        </div>

        {/* Stats row */}
        <div className="relative flex flex-wrap gap-4 mt-6">
          {[
            { label: 'Jami vazifalar', value: visibleAssignments.length, icon: BookOpen },
            { label: 'Topshirilgan', value: totalSubs, icon: TrendingUp },
            { label: 'Tekshirilmoqda', value: pendingSubs, icon: Clock },
            { label: 'Baholangan', value: gradedSubs, icon: Award },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Icon className="h-4 w-4 text-white/70" />
              <div>
                <p className="text-xl font-black leading-none">{value}</p>
                <p className="text-[10px] text-white/60 font-semibold">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {orphanedSubs.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 mb-6 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-500">Eski formatdagi vazifalar topildi! ({orphanedSubs.length} ta)</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">
              Bular tizim yangilanishidan oldin yuborilgan va aniq vazifaga biriktirilmagan vazifalar. Ularga avtomat tarzda "Eski Format" maqomi berilgan.
            </p>
          </div>
        </div>
      )}

      {/* ─── Assignment Cards ─── */}
      {visibleAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">Vazifalar yo'q</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Birinchi vazifani yarating!</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-colors">
            + Yangi vazifa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleAssignments.map(a => {
            const groupData = groups.find(g => g.id === a.groupId);
            const course = groupData ? courses.find(c => c.id === groupData.courseId) : null;
            const groupStudentsCount = groupData?.studentIds.length || 0;
            const assignmentSubs = visibleSubmissions.filter(s => s.assignmentId === a.id);
            const subsCount = assignmentSubs.length;
            const gradedCount = assignmentSubs.filter(s => s.status === 'graded').length;
            const pendingCount = assignmentSubs.filter(s => s.status === 'submitted').length;
            const isOverdue = new Date(a.dueDate) < new Date();
            const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);

            return (
              <div key={a.id} className="group bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col gap-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 shrink-0 mt-0.5">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug">{a.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {course?.name ? `${course.name} · ` : ''}{groupData?.name || 'Guruh noma\'lum'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => { setEditing(a); setShowForm(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteAssignment(a.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1">{a.description}</p>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    <span>Topshirganlar</span>
                    <span>{subsCount}/{groupStudentsCount}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                      style={{ width: `${groupStudentsCount ? (subsCount / groupStudentsCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Badges + date */}
                <div className="flex items-center gap-2 flex-wrap">
                  {pendingCount > 0 && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" />{pendingCount} kutmoqda
                    </span>
                  )}
                  {gradedCount > 0 && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />{gradedCount} baholangan
                    </span>
                  )}
                  <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isOverdue ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {isOverdue ? '⚠ Muddat o\'tdi' : `${daysLeft} kun qoldi`}
                  </span>
                </div>

                {/* Action button */}
                <button
                  onClick={() => setSelectedAssignment(a)}
                  className="w-full py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-900/20 dark:hover:bg-indigo-600 text-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <Users className="h-4 w-4" />
                  Javoblarni tekshirish
                  <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modals ─── */}
      {showForm && (
        <HomeworkForm
          initialData={editing ?? undefined}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSubmit={editing ? (data) => handleUpdate(editing.id, data) : handleCreate}
        />
      )}
      {renderSubmissionsModal()}
      {renderGradingModal()}
    </div>
  );
};
