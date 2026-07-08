import React, { useState, useMemo, useEffect } from 'react';
import {
  Play, Plus, Calendar, Hash, BookOpen, Video, Eye, EyeOff,
  Trash2, Edit3, X, Users, CheckCircle2, Clock, Send,
  ChevronDown, FileText, TrendingUp, AlertCircle, Star, Award, Code, Check
} from 'lucide-react';
import { useClassroomStore, type LessonRecord } from '../../stores/classroomStore';
import { useHomeworkStore } from '../../stores/homeworkStore';
import { useStudentStore } from '../../stores/studentStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useInClassTaskStore } from '../../stores/inClassTaskStore';
import { useCoinStore } from '../../stores/coinStore';
import { CodeEditor } from '../../components/CodeEditor';
import { useCourseStore } from '../../stores/courseStore';
import { useGroupStore } from '../../stores/groupStore';
import { SubmissionForm, type SubmissionData } from '../../components/SubmissionForm';

const formatDate = (d: string) => {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}, ${year}-yil`;
};

const getYouTubeEmbedUrl = (url: string): string => {
  if (url.includes('embed')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const CountdownTimer: React.FC<{ expiresAt: string }> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - Date.now();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft <= 0) {
    return (
      <span className="text-rose-500 font-extrabold animate-pulse flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800/30">
        <Clock className="w-4 h-4 text-rose-500" />
        <span>Vaqt tugadi (Qabul yopildi)</span>
      </span>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span className="text-rose-500 font-black tracking-wider animate-pulse flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
      <Clock className="w-4 h-4 animate-bounce text-rose-500" />
      <span>Qolgan vaqt: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
    </span>
  );
};

/* ─── Main Component ─── */
export const Classroom: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { lessons, addLesson, updateLesson, deleteLesson, markViewed } = useClassroomStore();
  const { groups } = useGroupStore();
  const { students } = useStudentStore();
  const { addToast } = useUIStore();

  const { tasks, submissions, addTask, submitTask, gradeSubmission: gradeInClassSub, deleteTask: deleteInClassTask } = useInClassTaskStore();
  const { sendCoins } = useCoinStore();
  const { updateStudent } = useStudentStore();
  const { courses } = useCourseStore();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<LessonRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonRecord | null>(null);

  // In-class task UI states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskTitle, setAddTaskTitle] = useState('');
  const [addTaskDesc, setAddTaskDesc] = useState('');
  const [addTaskDuration, setAddTaskDuration] = useState(30);
  const [selectedSubToGrade, setSelectedSubToGrade] = useState<any | null>(null);
  const [gradeScorePercent, setGradeScorePercent] = useState(0);
  const [gradeInClassFeedback, setGradeInClassFeedback] = useState('');
  const [studentCodeInput, setStudentCodeInput] = useState('// O\'quvchi kodi...\nconsole.log("Salom Brain IT!");');

  // Task creation dropdown states
  const [taskFormCourseId, setTaskFormCourseId] = useState('');
  const [taskFormGroupId, setTaskFormGroupId] = useState('');
  const [taskFormLessonId, setTaskFormLessonId] = useState('');

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formLessonNum, setFormLessonNum] = useState(1);
  const [formTopic, setFormTopic] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoFile, setFormVideoFile] = useState<File | null>(null);
  const [formGroupId, setFormGroupId] = useState(groups[0]?.id || 'g1');

  if (!currentUser) return null;

  const isTeacher = ['Super Admin', 'Academy Director', 'Teacher'].includes(currentUser.role);

  // For students: find their record and filter to their own groups only
  const myStudent = !isTeacher
    ? (students.find(s => s.id === currentUser.studentId || s.id === currentUser.id || `u_${s.id}` === currentUser.id) ||
       students.find(s => s.fullName === currentUser.name))
    : null;

  const visibleGroups = useMemo(() => {
    if (currentUser.role === 'Super Admin' || currentUser.role === 'Academy Director') {
      return groups;
    }
    if (isTeacher) {
      return groups.filter(g => 
        g.teacherId === currentUser.id || 
        g.teacherId === currentUser.id.replace('u_teacher', 'tr') ||
        (currentUser.id === 'u_teacher1' && g.teacherId === 'tr1')
      );
    }
    return groups.filter(g => myStudent?.groupIds?.includes(g.id));
  }, [groups, currentUser, isTeacher, myStudent]);

  // Default to first visible group
  const effectiveGroupId = selectedGroupId && visibleGroups.find(g => g.id === selectedGroupId)
    ? selectedGroupId
    : (visibleGroups[0]?.id || '');

  // Filter lessons by selected group
  const groupLessons = useMemo(() =>
    lessons
      .filter((l) => l.groupId === effectiveGroupId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [lessons, effectiveGroupId]
  );

  // Students in selected group
  const groupStudents = useMemo(() =>
    students.filter((s) => s.groupIds?.includes(effectiveGroupId)),
    [students, effectiveGroupId]
  );

  const resetForm = () => {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormLessonNum((groupLessons.length || 0) + 1);
    setFormTopic('');
    setFormDesc('');
    setFormVideoUrl('');
    setFormGroupId(selectedGroupId);
    setFormVideoFile(null);
    setEditingLesson(null);
  };

  const handleOpenForm = () => {
    resetForm();
    setFormLessonNum((groupLessons.length || 0) + 1);
    setShowForm(true);
  };

  const handleEdit = (lesson: LessonRecord) => {
    setEditingLesson(lesson);
    setFormDate(lesson.date);
    setFormLessonNum(lesson.lessonNumber);
    setFormTopic(lesson.topic);
    setFormDesc(lesson.description);
    setFormVideoUrl(lesson.videoUrl);
    setFormGroupId(lesson.groupId);
    // If editing a lesson that has a file video, create a temporary URL for preview
    if (lesson.videoUrl && lesson.videoUrl.startsWith('blob:')) {
      // Can't retrieve original File from URL, so leave file input empty
      setFormVideoFile(null);
    } else {
      setFormVideoFile(null);
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim()) {
      addToast({ type: 'error', message: 'Dars mavzusi kiritilishi shart!' });
      return;
    }

    // Determine video URL: if a file is selected, create a temporary object URL
    let finalVideoUrl = formVideoUrl.trim();
    let finalVideoType = '';
    if (formVideoFile) {
      finalVideoUrl = URL.createObjectURL(formVideoFile);
      finalVideoType = 'file';
    } else if (finalVideoUrl.includes('youtube')) {
      finalVideoType = 'youtube';
    } else {
      finalVideoType = 'link';
    }

    if (editingLesson) {
      updateLesson(editingLesson.id, {
        date: formDate,
        lessonNumber: formLessonNum,
        topic: formTopic,
        description: formDesc,
        videoUrl: finalVideoUrl,
        videoType: finalVideoType,
        groupId: formGroupId,
      });
      addToast({ type: 'success', message: 'Dars muvaffaqiyatli yangilandi!' });
    } else {
      addLesson({
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        groupId: formGroupId,
        date: formDate,
        lessonNumber: formLessonNum,
        topic: formTopic,
        description: formDesc,
        videoUrl: finalVideoUrl,
        videoType: finalVideoType,
      });
      addToast({ type: 'success', message: 'Yangi dars muvaffaqiyatli yuklandi!' });
    }
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteLesson(id);
    if (selectedLesson?.id === id) setSelectedLesson(null);
    addToast({ type: 'success', message: "Dars o'chirildi!" });
  };

  const handleMarkViewed = (lessonId: string) => {
    const studentId = currentUser.studentId || currentUser.id;
    markViewed(lessonId, studentId);
    addToast({ type: 'success', message: "Darsni ko'rganingiz belgilandi! ✅" });
  };

  const selectedGroupName = visibleGroups.find((g) => g.id === effectiveGroupId)?.name || 'Guruh';

  // If student has no groups, show message
  if (!isTeacher && visibleGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
          <BookOpen className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="font-bold text-xl text-slate-700 dark:text-slate-300">Siz hali biror guruhga biriktirilmagansiz</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Administrator siz uchun guruh tayinlagandan so'ng darslar ko'rinadi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* ═══ PREMIUM VIBRANT HEADER ═══ */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-600 p-8 sm:p-10 text-white shadow-2xl shadow-emerald-500/20">
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none mix-blend-overlay">
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[150%] bg-cyan-400/50 blur-[120px] rounded-full" />
          <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[100%] bg-yellow-400/40 blur-[100px] rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/30 shadow-inner">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-heading font-black text-4xl lg:text-5xl tracking-tight text-white drop-shadow-md">LMS Classroom</h1>
            </div>
            <p className="text-white/90 text-sm max-w-md font-medium leading-relaxed drop-shadow-sm">
              Dars materiallari, video yozuvlar va o'quvchi progressi — barchasi yagona zamonaviy muhitda crm orqali birlashtirilgan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Group selector */}
            <div className="relative">
              <select
                value={effectiveGroupId}
                onChange={(e) => { setSelectedGroupId(e.target.value); setSelectedLesson(null); }}
                className="appearance-none bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              >
                {visibleGroups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-white">{g.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
            </div>
            {isTeacher && (
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setAddTaskTitle('');
                    setAddTaskDesc('');
                    setAddTaskDuration(30);
                    // Pre-fill fields with current context
                    const defaultCourse = courses[0]?.id || '';
                    setTaskFormCourseId(defaultCourse);
                    setTaskFormGroupId(effectiveGroupId);
                    
                    const groupLessons = lessons.filter(l => l.groupId === effectiveGroupId);
                    setTaskFormLessonId(groupLessons[0]?.id || 'live_today');
                    
                    setShowAddTaskModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <Code className="h-4 w-4" /> Topshiriq berish
                </button>

                <button
                  onClick={handleOpenForm}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/25 text-white font-bold text-sm rounded-xl backdrop-blur-sm transition-all active:scale-95 shadow-lg"
                >
                  <Plus className="h-4 w-4" /> Dars qo'shish
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          {[
            { label: 'Jami darslar', value: groupLessons.length, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: "O'quvchilar", value: groupStudents.length, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: "Bugungi dars", value: groupLessons.filter(l => l.date === new Date().toISOString().slice(0, 10)).length, icon: Calendar, color: 'text-teal-400', bg: 'bg-teal-400/10' },
            { label: "O'rtacha ko'rish", value: groupLessons.length > 0 ? Math.round(groupLessons.reduce((s, l) => s + l.viewedBy.length, 0) / groupLessons.length) : 0, icon: Eye, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.bg} border border-white/5`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-black text-white leading-none mb-1">{stat.value}</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── LEFT: Lessons List ─── */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-heading font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {selectedGroupName} — Darslar
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{groupLessons.length} ta</span>
          </div>

          {groupLessons.length === 0 ? (
            <div className="glass premium-card rounded-2xl p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Hali dars yuklanmagan</p>
              {isTeacher && (
                <button onClick={handleOpenForm} className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  + Birinchi darsni yuklang
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar pr-1">
              {groupLessons.map((lesson) => {
                const viewedCount = lesson.viewedBy.length;
                const totalStudents = groupStudents.length || 1;
                const viewPercent = Math.round((viewedCount / totalStudents) * 100);
                const isSelected = selectedLesson?.id === lesson.id;
                const isToday = lesson.date === new Date().toISOString().slice(0, 10);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left rounded-2xl p-4 transition-all duration-200 border group ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40 shadow-lg premium-glow-brand'
                        : 'glass border-white/40 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Lesson number badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-heading font-black text-sm ${
                        isSelected
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        #{lesson.lessonNumber}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isToday && (
                            <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Bugun</span>
                          )}
                          <span className="text-[10px] text-slate-400 font-semibold">{formatDate(lesson.date)}</span>
                        </div>
                        <p className={`text-sm font-bold leading-snug truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-white'}`}>
                          {lesson.topic}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{lesson.description}</p>
                        {/* Progress bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${viewPercent >= 80 ? 'bg-emerald-500' : viewPercent >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                              style={{ width: `${viewPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{viewedCount}/{totalStudents}</span>
                          <Eye className="h-3 w-3 text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Lesson Detail ─── */}
        <div className="flex-1 min-w-0">
          {!selectedLesson ? (
            <div className="glass premium-card rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mb-4">
                <Video className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">Darsni tanlang</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Chapdan darsni bosing — bu yerda video va ma'lumotlar ko'rinadi</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Video Player (Only shown if teacher uploaded a video) */}
              {selectedLesson.videoUrl ? (
                <div className="relative group rounded-3xl p-1 bg-gradient-to-r from-emerald-500 via-emerald-500 to-pink-500 shadow-2xl shadow-emerald-500/20 transition-all duration-300">
                  <div className="relative bg-slate-950 rounded-[22px] overflow-hidden shadow-inner" style={{ aspectRatio: '16/9' }}>
                    <div className="absolute top-3.5 left-3.5 z-10 bg-black/70 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full flex items-center gap-2.5 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Video className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-xs font-extrabold text-white tracking-wide">
                        {selectedLesson.videoType === 'youtube' ? 'YouTube Video Dars' : 'Video Yozuv'}
                      </span>
                    </div>
                    {selectedLesson.videoType === 'youtube' ? (
                      <iframe
                        src={getYouTubeEmbedUrl(selectedLesson.videoUrl)}
                        title={selectedLesson.topic}
                        className="w-full h-full absolute inset-0 rounded-[22px]"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video
                        src={selectedLesson.videoUrl}
                        controls
                        className="w-full h-full absolute inset-0 object-cover rounded-[22px]"
                      />
                    )}
                  </div>
                </div>
              ) : null}

              {/* Lesson Info Card */}
              <div className="glass premium-card rounded-3xl p-6 md:p-8 space-y-5 premium-card-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
                        #{selectedLesson.lessonNumber}-dars
                      </span>
                      <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(selectedLesson.date)}
                      </span>
                      <span className="text-xs font-semibold bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {selectedGroupName}
                      </span>
                    </div>
                    <h2 className="font-heading font-extrabold text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-tight">
                      {selectedLesson.topic}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Ustoz: <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedLesson.teacherName}</span>
                    </p>
                  </div>
                  {isTeacher && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(selectedLesson)}
                        className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedLesson.id)}
                        className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

                {/* Description */}
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Dars haqida</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedLesson.description}
                  </p>
                </div>

                {/* Student view button (Only shown if video exists) */}
                {!isTeacher && selectedLesson.videoUrl && (
                  <button
                    onClick={() => handleMarkViewed(selectedLesson.id)}
                    disabled={selectedLesson.viewedBy.includes(currentUser.studentId || currentUser.id)}
                    className={`w-full py-3.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      selectedLesson.viewedBy.includes(currentUser.studentId || currentUser.id)
                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                    }`}
                  >
                    {selectedLesson.viewedBy.includes(currentUser.studentId || currentUser.id) ? (
                      <><Star className="h-5 w-5 fill-current" /> 100% ko&apos;rdi</>
                    ) : (
                      <><Eye className="h-5 w-5" /> Darsni ko'rdim deb belgilash</>
                    )}
                  </button>
                )}

                {/* ─── Student Viewing Stats (Teacher only, when video exists) ─── */}
                {isTeacher && selectedLesson.videoUrl && groupStudents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">O'quvchilar monitoringi</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {selectedLesson.viewedBy.length} ko'rgan
                        </span>
                        <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-bold">
                          <AlertCircle className="h-3.5 w-3.5" /> {groupStudents.length - selectedLesson.viewedBy.length} ko'rmagan
                        </span>
                      </div>
                    </div>

                    {/* Progress overview */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-200/60 dark:bg-slate-800/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 relative"
                          style={{ width: `${groupStudents.length > 0 ? (selectedLesson.viewedBy.length / groupStudents.length) * 100 : 0}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                        </div>
                      </div>
                      <span className="text-sm font-heading font-black text-slate-600 dark:text-slate-300">
                        {groupStudents.length > 0 ? Math.round((selectedLesson.viewedBy.length / groupStudents.length) * 100) : 0}%
                      </span>
                    </div>

                    {/* Student list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {groupStudents.map((student) => {
                        const viewed = selectedLesson.viewedBy.includes(student.id);
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              viewed
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
                            }`}
                          >
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                              viewed
                                ? 'bg-emerald-500 text-white'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                            }`}>
                              {student.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{student.fullName}</p>
                              <p className={`text-[10px] font-bold uppercase tracking-wider ${
                                viewed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                              }`}>
                                {viewed ? "✅ Ko'rgan" : "❌ Ko'rmagan"}
                              </p>
                            </div>
                            {viewed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            ) : (
                              <Clock className="h-5 w-5 text-red-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ──────────────── Darsdagi topshiriq (In-class Assignment) ──────────────── */}
              {(() => {
                const storedTask = tasks.find(t => t.lessonId === selectedLesson.id);
                const activeTask = storedTask || {
                  id: `lesson_task_${selectedLesson.id}`,
                  lessonId: selectedLesson.id,
                  groupId: selectedLesson.groupId,
                  title: `${selectedLesson.topic} (Dars vazifasi)`,
                  description: selectedLesson.description || "Ushbu dars bo'yicha amaliy topshiriqni bajaring va kod (yoki fayl) shaklida tizimga yuklang.",
                  createdAt: selectedLesson.createdAt || new Date().toISOString(),
                  durationMinutes: 45,
                  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                
                // Applied Premium Glow & Card Shadow Styles
                // - Added premium-glow-brand for active lesson sidebar items.
                // - Added premium-card-shadow to video player and description cards.
                const studentId = currentUser.studentId || currentUser.id;
                const mySubmission = activeTask ? submissions.find(s => s.taskId === activeTask.id && s.studentId === studentId) : null;
                const taskSubmissions = activeTask ? submissions.filter(s => s.taskId === activeTask.id) : [];

                return (
                  <div className="glass premium-card rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-heading font-black text-lg text-slate-800 dark:text-white">Darsdagi topshiriq (In-Class Task)</h3>
                          <p className="text-slate-400 text-xs mt-0.5">Dars davomida topshiriq berish va topshirish tizimi</p>
                        </div>
                      </div>
                      
                      {activeTask && (
                        <CountdownTimer expiresAt={activeTask.expiresAt} />
                      )}
                    </div>

                    {/* Active Task Details */}
                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-base text-slate-800 dark:text-white">{activeTask.title}</h4>
                          {isTeacher && (
                            <div className="flex items-center gap-3">
                              {!storedTask ? (
                                <button
                                  onClick={() => {
                                    setAddTaskTitle(`${selectedLesson.topic} darsdagi topshiriq`);
                                    setAddTaskDesc(selectedLesson.description || "Berilgan topshiriq shartlarini yozing...");
                                    setAddTaskDuration(30);
                                    setShowAddTaskModal(true);
                                  }}
                                  className="text-xs text-emerald-500 hover:underline font-bold flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Maxsus vaqt/shart sozlash
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (window.confirm("Ushbu topshiriqni va unga tegishli barcha javoblarni o'chirmoqchimisiz?")) {
                                      deleteInClassTask(storedTask.id);
                                      addToast({ type: 'info', message: "Topshiriq o'chirildi." });
                                    }
                                  }}
                                  className="text-xs text-rose-500 hover:underline font-bold flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> O'chirish
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {activeTask.description}
                          </p>
                          <div className="flex gap-4 text-xs font-semibold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span>Muddati: {activeTask.durationMinutes} daqiqa</span>
                            <span>Yaratilgan vaqt: {new Date(activeTask.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {isTeacher ? (
                          // TEACHER VIEW: Submissions list & Grading
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Topshirilgan javoblar</h4>
                              <span className="bg-rose-500/10 text-rose-500 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                Jami: {taskSubmissions.length}/{groupStudents.length}
                              </span>
                            </div>

                            {groupStudents.length === 0 ? (
                              <p className="text-slate-400 text-xs text-center">Guruhda o'quvchilar topilmadi.</p>
                            ) : (
                              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {groupStudents.map(student => {
                                  const sub = taskSubmissions.find(s => s.studentId === student.id);
                                  return (
                                    <div key={student.id} className="flex items-center justify-between py-3.5">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-300">
                                          {student.fullName[0]}
                                        </div>
                                        <div>
                                          <p className="font-bold text-sm text-slate-800 dark:text-white">{student.fullName}</p>
                                          {sub ? (
                                            <p className="text-[10px] text-slate-400">Topshirildi: {new Date(sub.submittedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                                          ) : (
                                            <p className="text-[10px] text-rose-500 font-bold">Topshirmagan</p>
                                          )}
                                        </div>
                                      </div>

                                      <div>
                                        {sub ? (
                                          sub.status === 'graded' ? (
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
                                                {sub.grade}%
                                              </span>
                                              {sub.coinsAwarded ? (
                                                <span className="text-xs font-bold text-amber-500">
                                                  +{sub.coinsAwarded} 🪙
                                                </span>
                                              ) : null}
                                              <button
                                                onClick={() => {
                                                  setSelectedSubToGrade(sub);
                                                  setGradeScorePercent(sub.grade || 0);
                                                  setGradeInClassFeedback(sub.feedback || '');
                                                }}
                                                className="text-xs text-emerald-600 hover:underline font-bold px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                                              >
                                                Ko'rish
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setSelectedSubToGrade(sub);
                                                setGradeScorePercent(100);
                                                setGradeInClassFeedback("Ajoyib yechim!");
                                              }}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 active:scale-95"
                                            >
                                              Baholash
                                            </button>
                                          )
                                        ) : (
                                          <span className="text-xs text-slate-400 italic">kutilyapti...</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          // STUDENT VIEW: Code Editor & Submission Status
                          <div className="space-y-4">
                            {mySubmission ? (
                              // Student already submitted
                              <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                                  <h5 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Topshiriq muvaffaqiyatli yuborildi!
                                  </h5>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Yuborilgan vaqt: {new Date(mySubmission.submittedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </p>

                                  {mySubmission.status === 'graded' ? (
                                    <div className="mt-3.5 pt-3.5 border-t border-emerald-100 dark:border-emerald-900/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Olingan baho</p>
                                        <div className="flex items-center gap-2">
                                          <span className="text-2xl font-black text-emerald-500">{mySubmission.grade}%</span>
                                          {mySubmission.coinsAwarded ? (
                                            <span className="text-sm font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg">
                                              +{mySubmission.coinsAwarded} 🪙 tanga mukofot!
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ustoz izohi</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                                          "{mySubmission.feedback || 'Izoh qoldirilmagan.'}"
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 animate-spin" />
                                      Ustoz tekshirishini va baholashini kuting.
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Yuborilgan kodingiz</label>
                                  <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                    <CodeEditor
                                      initialCode={mySubmission.code}
                                      initialLanguage="javascript"
                                      readOnly={true}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : new Date(activeTask.expiresAt).getTime() <= Date.now() ? (
                              <div className="p-5 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl">
                                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                                <h5 className="font-bold text-rose-600">Vaqt tugadi va qabul yopildi</h5>
                                <p className="text-xs text-slate-500 mt-1">Siz topshiriqni belgilangan vaqt ichida yuborishga ulgurmadingiz.</p>
                              </div>
                            ) : (
                              <div className="space-y-4 pt-2">
                                <SubmissionForm
                                  onSubmit={(data) => {
                                    submitTask(activeTask.id, {
                                      studentId,
                                      studentName: currentUser.name || "O'quvchi",
                                      type: data.type,
                                      code: data.code,
                                      language: data.language,
                                      fileUrl: data.fileUrl,
                                      fileName: data.fileName,
                                    });
                                    addToast({ type: 'success', message: "✅ Javobingiz muvaffaqiyatli topshirildi!" });
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                );
              })()}

            </div>
          )}
        </div>
      </div>

      {/* ═══ FORM MODAL ═══ */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/15 rounded-xl">
                    {editingLesson ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">{editingLesson ? 'Darsni tahrirlash' : 'Yangi dars yuklash'}</h3>
                    <p className="text-white/60 text-xs">Dars ma'lumotlarini kiriting</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/15 rounded-xl transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Sana
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
                {/* Lesson number */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    <Hash className="h-3.5 w-3.5" /> Dars raqami
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formLessonNum}
                    onChange={(e) => setFormLessonNum(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Group */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <Users className="h-3.5 w-3.5" /> Guruh
                </label>
                <select
                  value={formGroupId}
                  onChange={(e) => setFormGroupId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Mavzu nomi
                </label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Masalan: React Hooks — useState"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <FileText className="h-3.5 w-3.5" /> Qisqacha izoh
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Darsda nimalar o'rgatildi..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Video URL or File */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <Video className="h-3.5 w-3.5 text-emerald-500" /> Video yuklash yoki URL <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(Ixtiyoriy - shart emas)</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormVideoFile(e.target.files[0]);
                        setFormVideoUrl(''); // clear url if file selected
                      }
                    }}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400 dark:hover:file:bg-emerald-900/50 transition-all border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-800"
                  />
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                    <span className="text-xs text-slate-400 font-bold uppercase">yoki URL</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                  </div>
                  <input
                    type="url"
                    value={formVideoUrl}
                    onChange={(e) => {
                       setFormVideoUrl(e.target.value);
                       if (e.target.value) setFormVideoFile(null); // clear file if url entered
                    }}
                    placeholder="Masalan: https://youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>
                
                {/* Previews */}
                {formVideoUrl && formVideoUrl.includes('youtube') && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ aspectRatio: '16/9' }}>
                    <iframe src={getYouTubeEmbedUrl(formVideoUrl)} title="Preview" className="w-full h-full" />
                  </div>
                )}
                {formVideoFile && (
                   <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ aspectRatio: '16/9' }}>
                     <video src={URL.createObjectURL(formVideoFile)} controls className="w-full h-full object-cover" />
                   </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {editingLesson ? 'Yangilash' : 'Yuklash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ ADD IN-CLASS TASK MODAL ═══ */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 backdrop-blur-sm" onClick={() => setShowAddTaskModal(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/15 rounded-xl">
                    <Code className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">Darsda topshiriq berish</h3>
                    <p className="text-white/60 text-xs">O'quvchilar uchun tezkor sinov yaratish</p>
                  </div>
                </div>
                <button onClick={() => setShowAddTaskModal(false)} className="p-2 hover:bg-white/15 rounded-xl transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Kurs Select */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Kurs</label>
                <select
                  value={taskFormCourseId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setTaskFormCourseId(cid);
                    
                    // Filter groups that match this course
                    const courseGroups = groups.filter(g => g.courseId === cid);
                    const firstGroupId = courseGroups[0]?.id || '';
                    setTaskFormGroupId(firstGroupId);
                    
                    // Filter lessons for this group
                    const groupLessons = lessons.filter(l => l.groupId === firstGroupId);
                    setTaskFormLessonId(groupLessons[0]?.id || 'live_today');
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                >
                  <option value="" disabled>Kursni tanlang</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Guruh Select */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Guruh</label>
                <select
                  value={taskFormGroupId}
                  onChange={(e) => {
                    const gid = e.target.value;
                    setTaskFormGroupId(gid);
                    
                    // Filter lessons for this group
                    const groupLessons = lessons.filter(l => l.groupId === gid);
                    setTaskFormLessonId(groupLessons[0]?.id || 'live_today');
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                >
                  <option value="" disabled>Guruhni tanlang</option>
                  {groups.filter(g => !taskFormCourseId || g.courseId === taskFormCourseId).map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Dars Select */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Dars (Lesson)</label>
                <select
                  value={taskFormLessonId}
                  onChange={(e) => setTaskFormLessonId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                >
                  <option value="" disabled>Darsni tanlang</option>
                  <option value="live_today">🟢 Jonli amaliy dars (Avtomatik dars yaratish)</option>
                  {lessons.filter(l => l.groupId === taskFormGroupId).map(l => (
                    <option key={l.id} value={l.id}>#{l.lessonNumber}-dars: {l.topic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Topshiriq nomi</label>
                <input
                  type="text"
                  value={addTaskTitle}
                  onChange={(e) => setAddTaskTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Topshiriq sharti (Tavsif)</label>
                <textarea
                  value={addTaskDesc}
                  onChange={(e) => setAddTaskDesc(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Vaqt limiti (Daqiqada)</label>
                <select
                  value={addTaskDuration}
                  onChange={(e) => setAddTaskDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value={10}>10 daqiqa</option>
                  <option value={15}>15 daqiqa</option>
                  <option value={20}>20 daqiqa</option>
                  <option value={30}>30 daqiqa</option>
                  <option value={45}>45 daqiqa</option>
                  <option value={60}>60 daqiqa</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!addTaskTitle.trim() || !addTaskDesc.trim()) {
                      addToast({ type: 'error', message: "Barcha maydonlarni to'ldiring!" });
                      return;
                    }

                    let targetLessonId = taskFormLessonId || 'live_today';
                    if (targetLessonId === 'live_today' || !lessons.some(l => l.id === targetLessonId)) {
                      const newLsnId = crypto.randomUUID();
                      addLesson({
                        id: newLsnId,
                        groupId: taskFormGroupId,
                        lessonNumber: lessons.filter(l => l.groupId === taskFormGroupId).length + 1,
                        topic: `${new Date().toLocaleDateString('uz-UZ')} - Jonli dars topshirig'i`,
                        date: new Date().toISOString().slice(0, 10),
                        videoUrl: '',
                        materialUrl: '',
                        description: addTaskDesc || "Jonli dars davomida berilgan amaliy topshiriq",
                        viewedBy: []
                      });
                      targetLessonId = newLsnId;
                    }

                    addTask({
                      lessonId: targetLessonId,
                      groupId: taskFormGroupId,
                      title: addTaskTitle,
                      description: addTaskDesc,
                      durationMinutes: addTaskDuration
                    });
                    
                    // Auto select the group and lesson in the view to see the countdown
                    setSelectedGroupId(taskFormGroupId);
                    const targetLsn = useClassroomStore.getState().lessons.find(l => l.id === targetLessonId);
                    if (targetLsn) setSelectedLesson(targetLsn);
                    
                    addToast({ type: 'success', message: "✅ Darsdagi topshiriq muvaffaqiyatli yuborildi!" });
                    setShowAddTaskModal(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Yuborish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ GRADE IN-CLASS TASK SUBMISSION MODAL ═══ */}
      {selectedSubToGrade && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-bold text-lg text-slate-800 dark:text-white">
                  {selectedSubToGrade.studentName} — Darsdagi javobini baholash
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Topshirilgan vaqt: {new Date(selectedSubToGrade.submittedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
              <button onClick={() => setSelectedSubToGrade(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left: Code or File submissions preview */}
              <div className="flex-[2] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#1a1a2e]">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase shrink-0">
                  <Code className="h-3.5 w-3.5" />
                  O'quvchi javobi ({selectedSubToGrade.language || selectedSubToGrade.type || 'kod'})
                </div>
                <div className="flex-1 overflow-hidden p-4">
                  {selectedSubToGrade.type === 'file' ? (
                    <div className="flex-1 h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 bg-white dark:bg-slate-900">
                      <FileText className="w-16 h-16 text-emerald-400 mb-3" />
                      <p className="text-slate-700 dark:text-slate-200 font-bold text-base">{selectedSubToGrade.fileName || 'Yuklangan fayl'}</p>
                      <a 
                        href={selectedSubToGrade.fileUrl || '#'} 
                        download={selectedSubToGrade.fileName || 'fayl'} 
                        className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
                      >
                        Faylni Yuklab Olish
                      </a>
                    </div>
                  ) : (
                    <CodeEditor
                      initialCode={selectedSubToGrade.code}
                      initialLanguage={selectedSubToGrade.language || 'javascript'}
                      readOnly={true}
                    />
                  )}
                </div>
              </div>

              {/* Right: Grading Pane */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between bg-white dark:bg-slate-900">
                <div className="space-y-6">
                  {/* Score Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Baho (0-100%)</label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">{gradeScorePercent}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={gradeScorePercent}
                        onChange={(e) => setGradeScorePercent(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
                      />
                      <div className="flex justify-between w-full text-[10px] text-slate-400 mt-2 font-bold">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Coin preview */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-white font-bold text-lg">
                      🪙
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-500">Tanga mukofot (Avtomatik)</p>
                      <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {gradeScorePercent >= 90 ? "+2 tanga" : gradeScorePercent >= 70 ? "+1 tanga" : "0 tanga"} taqdim etiladi
                      </p>
                    </div>
                  </div>

                  {/* Feedback Comments */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Ustoz izohi</label>
                    <textarea
                      value={gradeInClassFeedback}
                      onChange={(e) => setGradeInClassFeedback(e.target.value)}
                      placeholder="Kod yechimini yaxshilash uchun maslahat bering..."
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSubToGrade(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      let coins = 0;
                      if (gradeScorePercent >= 90) coins = 2;
                      else if (gradeScorePercent >= 70) coins = 1;

                      // Update Store
                      gradeInClassSub(selectedSubToGrade.id, gradeScorePercent, gradeInClassFeedback, coins);

                      // Update Student Coins if not awarded previously
                      if (coins > 0 && (!selectedSubToGrade.coinsAwarded || selectedSubToGrade.coinsAwarded === 0)) {
                        const targetStudent = students.find(s => s.id === selectedSubToGrade.studentId || `u_${s.id}` === selectedSubToGrade.studentId || s.id === selectedSubToGrade.studentId.replace('u_', ''));
                        if (targetStudent) {
                          updateStudent(targetStudent.id, { coins: (targetStudent.coins || 0) + coins });
                          sendCoins(
                            currentUser.id,
                            currentUser.name,
                            targetStudent.id,
                            targetStudent.fullName,
                            coins,
                            `Darsdagi topshiriq uchun baholash (${gradeScorePercent}%)`
                          );
                        }
                      }

                      addToast({ type: 'success', message: `✅ Baho muvaffaqiyatli saqlandi! ${coins > 0 ? `+${coins} 🪙 tanga` : ''}` });
                      setSelectedSubToGrade(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Saqlash</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
