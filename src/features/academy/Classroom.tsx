import React, { useState, useMemo } from 'react';
import {
  Play, Plus, Calendar, Hash, BookOpen, Video, Eye, EyeOff,
  Trash2, Edit3, X, Users, CheckCircle2, Clock, Send,
  ChevronDown, FileText, TrendingUp, AlertCircle, Star
} from 'lucide-react';
import { useClassroomStore, type LessonRecord } from '../../stores/classroomStore';
import { useHomeworkStore } from '../../stores/homeworkStore';
import { useStudentStore } from '../../stores/studentStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

/* ─── Helpers ─── */
const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getYouTubeEmbedUrl = (url: string): string => {
  if (url.includes('embed')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

/* ─── Main Component ─── */
export const Classroom: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { lessons, addLesson, updateLesson, deleteLesson, markViewed } = useClassroomStore();
  const { groups } = useHomeworkStore();
  const { students } = useStudentStore();
  const { addToast } = useUIStore();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<LessonRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonRecord | null>(null);

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
    ? students.find(s =>
        s.id === currentUser.studentId ||
        s.id === currentUser.id ||
        `u_${s.id}` === currentUser.id ||
        s.fullName === currentUser.name
      )
    : null;

  const visibleGroups = isTeacher
    ? groups
    : groups.filter(g => myStudent?.groupIds?.includes(g.id));

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
    if (!formTopic.trim() || (!formVideoUrl.trim() && !formVideoFile)) {
      addToast({ type: 'error', message: 'Mavzu va video (URL yoki fayl) kiritilishi shart!' });
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
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
          <BookOpen className="h-10 w-10 text-indigo-400" />
        </div>
        <h2 className="font-bold text-xl text-slate-700 dark:text-slate-300">Siz hali biror guruhga biriktirilmagansiz</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Administrator siz uchun guruh tayinlagandan so'ng darslar ko'rinadi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/30 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm border border-white/20">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="font-heading font-black text-3xl lg:text-4xl tracking-tight">LMS Classroom</h1>
            </div>
            <p className="text-white/70 text-sm max-w-md">
              Dars materiallari, video yozuvlar va o'quvchi progressi — barchasi bir joyda.
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
              <button
                onClick={handleOpenForm}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/25 text-white font-bold text-sm rounded-xl backdrop-blur-sm transition-all active:scale-95 shadow-lg"
              >
                <Plus className="h-4 w-4" /> Yangi dars
              </button>
            )}
          </div>
        </div>
        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Jami darslar', value: groupLessons.length, icon: BookOpen },
            { label: "O'quvchilar", value: groupStudents.length, icon: Users },
            { label: "Bugungi dars", value: groupLessons.filter(l => l.date === new Date().toISOString().slice(0, 10)).length, icon: Calendar },
            { label: "O'rtacha ko'rish", value: groupLessons.length > 0 ? Math.round(groupLessons.reduce((s, l) => s + l.viewedBy.length, 0) / groupLessons.length) : 0, icon: Eye },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="h-3.5 w-3.5 text-white/60" />
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">{stat.label}</span>
              </div>
              <p className="font-heading font-black text-2xl text-white">{stat.value}</p>
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
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm font-medium">Hali dars yuklanmagan</p>
              {isTeacher && (
                <button onClick={handleOpenForm} className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
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
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                        : 'glass border-white/40 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/20 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Lesson number badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-heading font-black text-sm ${
                        isSelected
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
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
                        <p className={`text-sm font-bold leading-snug truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>
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
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-4">
                <Video className="h-10 w-10 text-indigo-300 dark:text-indigo-600" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-400 dark:text-slate-500">Darsni tanlang</h3>
              <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">Chapdan darsni bosing — bu yerda video va ma'lumotlar ko'rinadi</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Video Player */}
              <div className="glass premium-card rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                  {selectedLesson.videoUrl ? (
                    selectedLesson.videoType === 'youtube' ? (
                      <iframe
                        src={getYouTubeEmbedUrl(selectedLesson.videoUrl)}
                        title={selectedLesson.topic}
                        className="w-full h-full absolute inset-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video
                        src={selectedLesson.videoUrl}
                        controls
                        className="w-full h-full absolute inset-0 object-cover"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-16 w-16 text-white/30 mx-auto mb-3" />
                        <p className="text-white/40 text-sm">Video yuklanmagan</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson Info Card */}
              <div className="glass premium-card rounded-3xl p-6 md:p-8 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg">
                        #{selectedLesson.lessonNumber}-dars
                      </span>
                      <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(selectedLesson.date)}
                      </span>
                      <span className="text-xs font-semibold bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
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
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Dars haqida</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedLesson.description}
                  </p>
                </div>

                {/* Student view button */}
                {!isTeacher && (
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

                {/* ─── Student Viewing Stats (Teacher only) ─── */}
                {isTeacher && groupStudents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
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
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Video URL or File */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <Video className="h-3.5 w-3.5" /> Video yuklash yoki URL
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
                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 dark:hover:file:bg-indigo-900/50 transition-all border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-800"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
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
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {editingLesson ? 'Yangilash' : 'Yuklash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
