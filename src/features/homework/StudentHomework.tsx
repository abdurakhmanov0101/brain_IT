import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  BookOpen, UploadCloud, Code, FileText, Send, X,
  CheckCircle2, AlertCircle, Clock, Star, Trophy, Coins,
  ChevronRight, ArrowLeft, Link, File, Image, Film, Archive, FileCode
} from 'lucide-react';
import { useHomeworkStore } from '../../stores/homeworkStore';
import type { Assignment, Submission } from '../../stores/homeworkStore';
import { useAuthStore } from '../../stores/authStore';
import { useStudentStore } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { CodeEditor } from '../../components/CodeEditor';
import { useUIStore } from '../../stores/uiStore';
import { SubmissionForm, type SubmissionData } from '../../components/SubmissionForm';

const COIN_RULES = [
  { min: 95, coins: 3, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: '3 tanga 🪙🪙🪙' },
  { min: 85, coins: 2, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: '2 tanga 🪙🪙' },
  { min: 65, coins: 1, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: '1 tanga 🪙' },
];

function GradeDisplay({ grade, coins }: { grade: number; coins?: number }) {
  const color = grade >= 85 ? 'text-emerald-500' : grade >= 65 ? 'text-amber-500' : 'text-rose-500';
  const bg = grade >= 85 ? 'bg-emerald-50 dark:bg-emerald-900/20' : grade >= 65 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-rose-50 dark:bg-rose-900/20';

  return (
    <div className={`rounded-2xl p-4 ${bg} flex items-center justify-between gap-4`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Baho</p>
        <p className={`text-4xl font-black ${color}`}>{grade}<span className="text-lg font-bold text-slate-400">/100</span></p>
      </div>
      {coins ? (
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Tangalar</p>
          <p className="text-3xl font-black text-amber-500">+{coins} 🪙</p>
        </div>
      ) : null}
    </div>
  );
}

export const StudentHomework: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { students } = useStudentStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { assignments, submissions, submitHomework } = useHomeworkStore();
  const { addToast } = useUIStore();

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submitType, setSubmitType] = useState<'code' | 'file' | 'link'>('code');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [fileUrl, setFileUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<string>(''); // base64
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewingResult, setViewingResult] = useState<Assignment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find student record from studentStore using currentUser
  const myStudent = useMemo(() => {
    if (!currentUser) return null;
    return (
      students.find((s) => s.id === currentUser.studentId || s.id === currentUser.id || `u_${s.id}` === currentUser.id || s.id.replace('st', 's') === currentUser.studentId) ||
      students.find((s) => s.fullName === currentUser.name || s.studentUsername === currentUser.name) ||
      students[0]
    );
  }, [currentUser, students]);

  // Get my group IDs from studentStore
  const myGroupIds = useMemo(() => myStudent?.groupIds || [], [myStudent]);

  // Filter assignments that belong to my groups
  const myAssignments = useMemo(() => {
    return assignments.filter((a) => myGroupIds.includes(a.groupId));
  }, [assignments, myGroupIds]);

  const getMySubmission = (assignmentId: string): Submission | undefined => {
    const sid = myStudent?.id || currentUser?.studentId || currentUser?.id || 'st1';
    return submissions.find((s) => s.assignmentId === assignmentId && (s.studentId === sid || s.studentId === `u_${sid}` || s.studentId === sid.replace('st', 's') || s.studentId === sid.replace('s', 'st')));
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      addToast({ type: 'error', message: 'Fayl hajmi 20MB dan oshmasligi kerak!' });
      return;
    }
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedFileData(result);
      setFileUrl(result); // store data URL as fileUrl
    };
    reader.readAsDataURL(file);
  }, [addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleSubmit = () => {
    if (submitType === 'code' && !code.trim()) {
      addToast({ type: 'error', message: 'Kodni kiriting!' });
      return;
    }
    if (submitType === 'file' && !uploadedFile) {
      addToast({ type: 'error', message: 'Fayl tanlang!' });
      return;
    }
    if (submitType === 'link' && !linkUrl.trim()) {
      addToast({ type: 'error', message: 'Havola kiriting!' });
      return;
    }
    const studentId = myStudent?.id || currentUser?.studentId || currentUser?.id || 'st1';
    const submissionType = submitType === 'link' ? 'file' : submitType as 'code' | 'file';
    submitHomework({
      assignmentId: selectedAssignment!.id,
      studentId,
      type: submissionType,
      code: submitType === 'code' ? code : undefined,
      language: submitType === 'code' ? language : undefined,
      fileUrl: submitType === 'file' ? uploadedFileData : submitType === 'link' ? linkUrl : undefined,
      fileName: submitType === 'file' ? uploadedFile?.name : undefined,
    });
    addToast({ type: 'success', message: '✅ Vazifa muvaffaqiyatli topshirildi!' });
    setSelectedAssignment(null);
    setCode('');
    setFileUrl('');
    setLinkUrl('');
    setUploadedFile(null);
    setUploadedFileData('');
  };

  const getGroupInfo = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    const course = group ? courses.find((c) => c.id === group.courseId) : null;
    return { group, course };
  };

  const pending = myAssignments.filter((a) => !getMySubmission(a.id));
  const submitted = myAssignments.filter((a) => {
    const sub = getMySubmission(a.id);
    return sub && sub.status === 'submitted';
  });
  const graded = myAssignments.filter((a) => {
    const sub = getMySubmission(a.id);
    return sub && sub.status === 'graded';
  });

  if (!myStudent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 p-8">
        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-slate-800 dark:text-white">O'quvchi topilmadi</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Siz tizimda ro'yxatdan o'tmagan yoki hisobingiz bilan bog'liq muammo mavjud.
          Administrator bilan bog'laning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-40 h-40 rounded-full border-4 border-white" />
          <div className="absolute bottom-2 right-24 w-20 h-20 rounded-full border-2 border-white" />
        </div>
        <div className="relative">
          <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-1">Salom, {myStudent.fullName}!</p>
          <h1 className="font-heading font-black text-3xl lg:text-4xl">Mening Vazifalarim</h1>
          <p className="text-white/70 mt-2 text-sm">
            O'qituvchi bergan vazifalarni bajaring va tanga yutib oling.
          </p>
          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { label: 'Bajarilmagan', value: pending.length, color: 'bg-white/20' },
              { label: 'Tekshirilmoqda', value: submitted.length, color: 'bg-amber-400/30' },
              { label: 'Baholangan', value: graded.length, color: 'bg-emerald-400/30' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} backdrop-blur-sm rounded-2xl px-5 py-3 text-center`}>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coin rules info */}
      <div className="grid grid-cols-3 gap-3">
        {COIN_RULES.map((rule) => (
          <div key={rule.min} className={`${rule.bg} rounded-2xl p-3 text-center border border-amber-100 dark:border-amber-900/30`}>
            <p className={`font-black text-lg ${rule.color}`}>{rule.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rule.min}% dan yuqori</p>
          </div>
        ))}
      </div>

      {myAssignments.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-emerald-400" />
          </div>
          <h3 className="font-bold text-xl text-slate-700 dark:text-slate-300">Hozircha vazifa yo'q</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs">
            O'qituvchingiz vazifa berganda bu yerda ko'rinadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {myAssignments.map((assignment) => {
            const submission = getMySubmission(assignment.id);
            const { group, course } = getGroupInfo(assignment.groupId);
            const isGraded = submission?.status === 'graded';
            const isSubmitted = !!submission;
            const isOverdue = new Date(assignment.dueDate) < new Date() && !isSubmitted;

            return (
              <div
                key={assignment.id}
                className={`relative bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 shadow-sm transition-all group ${
                  isGraded
                    ? 'border-emerald-200 dark:border-emerald-900/50'
                    : isSubmitted
                    ? 'border-amber-200 dark:border-amber-900/50'
                    : isOverdue
                    ? 'border-rose-200 dark:border-rose-900/50'
                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                }`}
              >
                {/* Status badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      isGraded ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      isSubmitted ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      isOverdue ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {isGraded ? <Trophy className="h-5 w-5" /> :
                       isSubmitted ? <Clock className="h-5 w-5" /> :
                       <BookOpen className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{assignment.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {course?.name || group?.name} •{' '}
                        {isOverdue ? (
                          <span className="text-rose-500 font-bold">Muddati o'tdi</span>
                        ) : (
                          `Muddat: ${new Date(assignment.dueDate).toLocaleDateString('uz-UZ')}`
                        )}
                      </p>
                    </div>
                  </div>
                  {isGraded && (
                    <span className="shrink-0 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Baholangan
                    </span>
                  )}
                  {isSubmitted && !isGraded && (
                    <span className="shrink-0 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-full flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Kutilmoqda
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-4 leading-relaxed">
                  {assignment.description}
                </p>

                {/* Grade result (if graded) */}
                {isGraded && submission && (
                  <div className="mb-4 space-y-3">
                    <GradeDisplay grade={submission.grade!} coins={submission.coinsAwarded} />
                    {submission.grade! < 30 && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-100 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50">
                        <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
                          ⚠️ Umuman yomon — shu darsni qayta ko'ring!
                        </p>
                      </div>
                    )}
                    {submission.grade! >= 30 && submission.grade! < 65 && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50">
                        <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
                        <p className="text-sm font-bold text-orange-700 dark:text-orange-400">
                          Natija yaxshi emas — qo'shimcha mashq qiling.
                        </p>
                      </div>
                    )}
                    {submission.feedback && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 mb-1.5">Ustoz izohi:</p>
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action button */}
                {!isSubmitted ? (
                  <button
                    onClick={() => { setSelectedAssignment(assignment); setCode(''); setFileUrl(''); setLinkUrl(''); setUploadedFile(null); setUploadedFileData(''); setSubmitType('code'); }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Vazifani topshirish
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    {isGraded ? 'Baho olindi' : 'Topshirilgan — tekshirilmoqda'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* === SUBMISSION MODAL === */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
            {/* Modal header */}
            <div className="flex items-center gap-4 p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="text-white">
                <h2 className="font-heading font-bold text-xl leading-tight">{selectedAssignment.title}</h2>
                <p className="text-white/70 text-xs mt-0.5">Javobingizni yuboring</p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="ml-auto p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Assignment description reminder */}
            <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/50">
              <p className="text-xs font-bold uppercase text-emerald-500 dark:text-emerald-400 mb-1">Vazifa:</p>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">{selectedAssignment.description}</p>
            </div>

            {/* Content area with modern SubmissionForm */}
            <div className="flex-1 overflow-auto px-6 pb-6 pt-4">
              <SubmissionForm
                onSubmit={(data) => {
                  const studentId = myStudent?.id || currentUser?.studentId || currentUser?.id || 'st1';
                  submitHomework({
                    assignmentId: selectedAssignment!.id,
                    studentId,
                    type: data.type,
                    code: data.code,
                    language: data.language,
                    fileUrl: data.fileUrl,
                    fileName: data.fileName,
                  });
                  addToast({ type: 'success', message: '✅ Vazifa muvaffaqiyatli topshirildi!' });
                  setSelectedAssignment(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
