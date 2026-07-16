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

  // Isolation with fallback
  const isAdminOrAll = !currentUser || ['Super Admin', 'Academy Director'].includes(currentUser.role);
  const matchedGroups = groups.filter(g => g.teacherId === currentUser?.id || g.teacherId === currentUser?.id?.replace('u_', '') || g.teacherId === 'tr_umid');
  const teacherGroupIds = (isAdminOrAll || matchedGroups.length === 0) ? groups.map(g => g.id) : matchedGroups.map(g => g.id);
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
    if (gradeScore >= 90) coins = 2;
    else if (gradeScore >= 70) coins = 1;

    if (coins > 0 && (!selectedSubmission.coinsAwarded || selectedSubmission.coinsAwarded === 0)) {
      const student = getStudentBySid(selectedSubmission.studentId);
      if (student && 'fullName' in student) {
        sendCoins(currentUser.id, currentUser.name, student.id, student.fullName, coins, `${selectedAssignment?.title || 'Uy vazifasi'} uchun baho`);
        const stObj = useStudentStore.getState().students.find(s => s.id === student.id || `u_${s.id}` === student.id || s.id === student.id.replace('u_', ''));
        if (stObj) {
          useStudentStore.getState().updateStudent(stObj.id, { coins: (stObj.coins || 0) + coins });
        }
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
          <div className="relative p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0">
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
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{student.fullName[0]}</span>
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
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400'
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
    const coinsPreview = gradeScore >= 90 ? 2 : gradeScore >= 70 ? 1 : 0;

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
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      {selectedSubmission.fileUrl?.startsWith('http') ? (
                        <Link2 className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <FileText className="h-6 w-6 text-emerald-600" />
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
                      className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
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
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600'
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
                  <span className="text-2xl">{coinsPreview === 2 ? '🏆' : '🥈'}</span>
                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">O'quvchiga {coinsPreview} 🪙 tanga beriladi</p>
                    <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70">{gradeScore >= 90 ? 'A\'lo natija!' : 'Yaxshi natija'}</p>
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
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none flex-1"
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
      {/* ─── MODERN COMPACT HEADER ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Main Controls */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm premium-card-shadow">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/50">
              <BookOpen className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Ustoz Paneli</p>
              <h1 className="font-heading font-black text-2xl text-slate-800 dark:text-white leading-none">Uy-Vazifalar</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Guruh o'quvchilari javoblarini tekshiring va baholang.</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 relative z-10 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus className="h-4 w-4" /> Yangi vazifa
          </button>
        </div>

        {/* Right: Bento Stats */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-1">
          {[
            { label: 'Vazifalar', value: visibleAssignments.length, icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Topshirilgan', value: totalSubs, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Kutmoqda', value: pendingSubs, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Baholangan', value: gradedSubs, icon: Award, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm">
              <div className={`p-2 rounded-xl mb-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white leading-none mb-1">{value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
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
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-emerald-400" />
          </div>
          <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">Vazifalar yo'q</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Birinchi vazifani yarating!</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-colors">
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
              <div key={a.id} className="group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/40 dark:border-slate-700/50 hover:border-emerald-400/60 dark:hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] transition-all duration-300 flex flex-col gap-5 overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top row */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 border border-white/20">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="font-heading font-black text-lg text-slate-800 dark:text-white line-clamp-2 leading-tight tracking-tight">{a.title}</h3>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
                        {course?.name ? `${course.name} · ` : ''}{groupData?.name || 'Guruh noma\'lum'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => { setEditing(a); setShowForm(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all shadow-sm">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteAssignment(a.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all shadow-sm">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="relative z-10 text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2 flex-1 leading-relaxed">{a.description}</p>

                {/* Progress bar */}
                <div className="relative z-10">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                    <span>Topshirganlar</span>
                    <span className="text-slate-700 dark:text-slate-300">{subsCount}/{groupStudentsCount}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_rgb(52,211,153,0.5)]"
                      style={{ width: `${groupStudentsCount ? (subsCount / groupStudentsCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Badges + date */}
                <div className="relative z-10 flex items-center gap-2 flex-wrap">
                  {pendingCount > 0 && (
                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black rounded-xl flex items-center gap-1.5 shadow-sm">
                      <Clock className="h-3.5 w-3.5" />{pendingCount} KUTMOQDA
                    </span>
                  )}
                  {gradedCount > 0 && (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black rounded-xl flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />{gradedCount} BAHOLANGAN
                    </span>
                  )}
                  <span className={`ml-auto text-[10px] font-black px-3 py-1.5 rounded-xl border shadow-sm tracking-wide ${
                    isOverdue 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {isOverdue ? '⚠ MUDDAT O\'TDI' : `${daysLeft} KUN QOLDI`}
                  </span>
                </div>

                {/* Action button */}
                <button
                  onClick={() => setSelectedAssignment(a)}
                  className="relative z-10 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-emerald-500/25 border border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Users className="h-4.5 w-4.5" />
                  Javoblarni tekshirish
                  <ChevronRight className="h-4.5 w-4.5 group-hover/btn:translate-x-1 transition-transform" />
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
