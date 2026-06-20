import React, { useState, useRef } from 'react';
import { Play, Pause, BookOpen, CheckSquare, ChevronDown, ChevronRight, Award, Bot, Send, Cpu, SkipForward } from 'lucide-react';
import { courses, mockAIFeedback, type Course, type Lesson } from '../../data/mockData';
import { Modal } from '../../components/Modal';

interface Props { currentUser: { name: string; role: string }; }

const AI_RESPONSES: Record<string, string> = {
  python: "Python — interpretatsiya qilinadigan, yuqori darajali dasturlash tili. Oddiy sintaksisi bilan tez o'rganiladi.",
  oop: "OOP (Object-Oriented Programming) — obyektlar va klasslar orqali dastur yozish paradigmasi. Asosiy 4 tamoyil: Inkapsulatsiya, Vorislik, Polimorfizm, Abstraksiya.",
  class: "Klass — obyekt uchun qolip. `class MyClass:` deb e'lon qilinadi. `__init__` — konstruktor metod.",
  vorislik: "Vorislik — `class Child(Parent):` yordamida ota-klassdan barcha metodlarni meros olish.",
  react: "React — Facebook tomonidan yaratilgan UI kutubxonasi. Komponentlar, hooks va virtual DOM bilan ishlaydi.",
  hook: "React Hooks — funksional komponentlarga state va lifecycle imkonini beruvchi funksiyalar: useState, useEffect, useCallback...",
  state: "State — komponentning ichki holati. `useState` hook bilan e'lon qilinadi: `const [count, setCount] = useState(0)`.",
  typescript: "TypeScript — JavaScript'ning kuchaytirilgan versiyasi. Statik tiplashtirish xatolarni oldindan topishga yordam beradi.",
};

export const Classroom: React.FC<Props> = ({ currentUser }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(courses[0].modules[0].lessons[0]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([courses[0].modules[0].id]));
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [aiCode, setAiCode] = useState('');
  const [aiFeedback, setAiFeedback] = useState<{ score: number; feedback: string } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Salom! Men AI Mentor - Brain IT Academy.\n\nKurs bo'yicha savollaringizni bering. Python, React, OOP, TypeScript haqida yordam beraman. 🎓" },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const totalLessons = selectedCourse.modules.reduce((s, m) => s + m.lessons.length, 0);
  const progress = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;

  const toggleModule = (id: string) => setExpandedModules((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const markComplete = () => setCompletedLessons((p) => new Set([...p, selectedLesson.id]));

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg.trim(); setChatMsg('');
    setChatHistory((h) => [...h, { role: 'user', text: userMsg }]);
    const key = Object.keys(AI_RESPONSES).find((k) => userMsg.toLowerCase().includes(k));
    const reply = key ? AI_RESPONSES[key] : "Bu mavzu bo'yicha hozircha ma'lumotim cheklangan. Ustoz bilan murojaat qiling yoki rasmiy hujjatlarni tekshiring.";
    setTimeout(() => { setChatHistory((h) => [...h, { role: 'ai', text: reply }]); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 700);
  };

  const quizScore = () => {
    if (!selectedLesson.quizQuestions) return 0;
    return selectedLesson.quizQuestions.filter((q) => quizAnswers[q.id] === q.correctAnswer).length;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] min-h-0">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-3 shrink-0 overflow-y-auto">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kurs tanlang</label>
          <select value={selectedCourse.id} onChange={(e) => { const c = courses.find((c) => c.id === e.target.value)!; setSelectedCourse(c); setSelectedLesson(c.modules[0].lessons[0]); setExpandedModules(new Set([c.modules[0].id])); setCompletedLessons(new Set()); }}
            className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2"><span>Progress</span><span>{completedLessons.size}/{totalLessons} dars</span></div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full"><div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="text-xs text-slate-400 mt-1 text-right">{progress}%</p>
          {progress === 100 && (
            <button onClick={() => setCertOpen(true)} className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"><Award className="h-4 w-4" /> Sertifikat olish</button>
          )}
        </div>
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden flex-1 overflow-y-auto">
          {selectedCourse.modules.map((mod) => (
            <div key={mod.id} className="border-b border-slate-100 dark:border-dark-border last:border-b-0">
              <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center justify-between p-4 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="text-left">{mod.title}</span>
                {expandedModules.has(mod.id) ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
              </button>
              {expandedModules.has(mod.id) && (
                <div className="pb-2">
                  {mod.lessons.map((lesson) => (
                    <button key={lesson.id} onClick={() => { setSelectedLesson(lesson); setAiFeedback(null); setQuizAnswers({}); setQuizSubmitted(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors ${selectedLesson.id === lesson.id ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${completedLessons.has(lesson.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {completedLessons.has(lesson.id) && <svg className="h-3 w-3 text-white fill-white" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lesson.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{lesson.type === 'video' ? '🎥' : lesson.type === 'quiz' ? '📝' : '📄'} {lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto">
        {selectedLesson.type === 'video' && (
          <div className="bg-slate-900 rounded-2xl overflow-hidden">
            <div className="relative bg-black flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => setPlaying(!playing)} className={`h-16 w-16 rounded-full flex items-center justify-center shadow-xl transition-all ${playing ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
                  {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5 fill-white" />}
                </button>
                <span className="text-slate-400 text-xs">{selectedLesson.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3">
              <button onClick={() => setPlaying(!playing)} className="text-white">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}</button>
              <div className="flex-1 h-1 bg-slate-700 rounded-full"><div className="h-full bg-indigo-500 rounded-full w-1/3" /></div>
              <SkipForward className="h-4 w-4 text-slate-400" />
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-slate-800 text-white text-xs rounded px-2 py-1 border-0 focus:outline-none">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => <option key={s} value={s}>{s}x</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${selectedLesson.type === 'video' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : selectedLesson.type === 'quiz' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
              {selectedLesson.type === 'video' ? <Play className="h-5 w-5" /> : selectedLesson.type === 'quiz' ? <CheckSquare className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <div><h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">{selectedLesson.title}</h2><span className="text-xs text-slate-400">{selectedLesson.duration}</span></div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{selectedLesson.content}</p>

          {selectedLesson.type === 'article' && selectedLesson.assignment && (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-indigo-700 dark:text-indigo-300">📋 Vazifa</h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-400">{selectedLesson.assignment}</p>
              <textarea value={aiCode} onChange={(e) => setAiCode(e.target.value)} placeholder="Python kodingizni shu yerga yozing..." rows={6}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900 py-2.5 px-3 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              <button onClick={() => setAiFeedback(mockAIFeedback(aiCode))} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                <Cpu className="h-4 w-4" /> AI bilan tekshirish
              </button>
              {aiFeedback && (
                <div className={`rounded-xl p-4 border ${aiFeedback.score >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : aiFeedback.score >= 50 ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-2xl font-black ${aiFeedback.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : aiFeedback.score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{aiFeedback.score}</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <p className="text-sm whitespace-pre-line text-slate-700 dark:text-slate-300">{aiFeedback.feedback}</p>
                  {aiFeedback.score >= 80 && <button onClick={markComplete} className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">✓ Darsni tugatildi deb belgilash</button>}
                </div>
              )}
            </div>
          )}

          {selectedLesson.type === 'quiz' && selectedLesson.quizQuestions && (
            <div className="space-y-4">
              {selectedLesson.quizQuestions.map((q, qi) => (
                <div key={q.id} className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[q.id] === oi;
                      const correct = quizSubmitted && oi === q.correctAnswer;
                      const wrong = quizSubmitted && selected && oi !== q.correctAnswer;
                      return (
                        <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${correct ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : wrong ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : selected ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-dark-border hover:border-slate-300'}`}>
                          <input type="radio" name={q.id} value={oi} checked={selected} onChange={() => !quizSubmitted && setQuizAnswers((a) => ({ ...a, [q.id]: oi }))} className="sr-only" />
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>{selected && <div className="h-2 w-2 rounded-full bg-indigo-500" />}</div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!quizSubmitted ? (
                <button onClick={() => setQuizSubmitted(true)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl">Yuborish</button>
              ) : (
                <div className={`rounded-xl p-4 text-center ${quizScore() === selectedLesson.quizQuestions.length ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
                  <p className="font-heading font-black text-2xl text-slate-800 dark:text-white">{quizScore()}/{selectedLesson.quizQuestions.length}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">to'g'ri javob</p>
                  {quizScore() === selectedLesson.quizQuestions.length && <button onClick={markComplete} className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">✓ Darsni tugatildi deb belgilash</button>}
                </div>
              )}
            </div>
          )}

          {selectedLesson.type === 'video' && (
            <button onClick={markComplete} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
              <CheckSquare className="h-4 w-4" /> Darsni tugatildi deb belgilash
            </button>
          )}
        </div>

        {/* AI Mentor Chat */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-dark-border">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl"><Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /></div>
            <div><h3 className="font-semibold text-sm text-slate-800 dark:text-white">AI Mentor</h3><p className="text-[10px] text-slate-400">Kurs bo'yicha savollar uchun</p></div>
          </div>
          <div className="h-52 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs whitespace-pre-line ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="px-4 py-3 border-t border-slate-100 dark:border-dark-border flex gap-2">
            <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder="Savol bering... (masalan: 'OOP nima?')"
              className="flex-1 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={handleSendChat} className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <Modal open={certOpen} onClose={() => setCertOpen(false)} title="🎓 Tabriklaymiz!" size="md">
        <div className="text-center space-y-4 py-4">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-2xl inline-block"><Award className="h-16 w-16 text-white" /></div>
          <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">{currentUser.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Siz <strong>{selectedCourse.title}</strong> kursini muvaffaqiyatli tugatdingiz!</p>
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
            <p className="text-amber-700 dark:text-amber-300 text-xs font-medium">Brain IT Academy | {new Date().toLocaleDateString('uz-UZ')}</p>
          </div>
          <button onClick={() => { setCertOpen(false); window.print(); }} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl">Chop etish (PDF)</button>
        </div>
      </Modal>
    </div>
  );
};
