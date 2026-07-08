import React, { useState, useMemo } from 'react';
import { UploadCloud, Code, FileCode, CheckCircle, Eye, Edit3, Sparkles, AlertCircle, File, Image as ImageIcon, Film, Archive } from 'lucide-react';
import { CodeEditor } from './CodeEditor';

export interface SubmissionData {
  type: 'file' | 'code';
  fileUrl?: string;
  fileName?: string;
  code?: string;
  language?: string;
}

interface SubmissionFormProps {
  onSubmit: (data: SubmissionData) => void;
  isLoading?: boolean;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<'code' | 'file'>('code');
  const [language, setLanguage] = useState<'web' | 'python' | 'php' | 'javascript' | 'cpp'>('web');
  const [webTab, setWebTab] = useState<'edit' | 'preview'>('edit');
  const [isDragging, setIsDragging] = useState(false);
  
  // File state
  const [file, setFile] = useState<File | null>(null);

  // Web State
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');

  // Single file code State
  const [singleCode, setSingleCode] = useState('');

  const previewDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { font-family: system-ui, sans-serif; padding: 16px; margin: 0; color: #333; } ${css}</style>
        </head>
        <body>
          ${html || '<div style="color: #999; text-align: center; padding: 40px;">HTML kodingiz natijasi shu yerda ko\'rinadi...</div>'}
          <script>${js}<\/script>
        </body>
      </html>
    `;
  }, [html, css, js]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'file') {
      if (!file) return;
      onSubmit({
        type: 'file',
        fileUrl: URL.createObjectURL(file),
        fileName: file.name
      });
    } else {
      if (language === 'web') {
        const payload = JSON.stringify({ html, css, js });
        onSubmit({
          type: 'code',
          code: payload,
          language: 'web'
        });
      } else {
        onSubmit({
          type: 'code',
          code: singleCode,
          language: language
        });
      }
    }
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-pink-500 animate-pulse" />;
    if (fileType.startsWith('video/')) return <Film className="w-8 h-8 text-emerald-500 animate-pulse" />;
    if (fileName.match(/\.(zip|rar|7z)$/i)) return <Archive className="w-8 h-8 text-amber-500 animate-bounce" />;
    if (fileName.match(/\.(py|js|ts|html|css|cpp|java)$/i)) return <Code className="w-8 h-8 text-emerald-500" />;
    return <File className="w-8 h-8 text-emerald-500" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 transition-all duration-300">
      {/* Animated Mode Switcher */}
      <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
        <button 
          type="button" 
          onClick={() => setMode('code')} 
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            mode === 'code' 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Code className={`w-4 h-4 ${mode === 'code' ? 'animate-spin-slow' : ''}`} /> 
          <span>Jonli Kod (Live Code)</span>
        </button>
        <button 
          type="button" 
          onClick={() => setMode('file')} 
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            mode === 'file' 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <FileCode className={`w-4 h-4 ${mode === 'file' ? 'animate-bounce' : ''}`} /> 
          <span>Fayl Yuklash</span>
        </button>
      </div>

      {mode === 'file' ? (
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${
            isDragging 
              ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 scale-[1.02] shadow-2xl shadow-emerald-500/20' 
              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-xl'
          }`}
        >
          <input 
            type="file" 
            onChange={(e) => e.target.files && setFile(e.target.files[0])} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
          />
          
          {/* Decorative Glow Background */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {!file ? (
              <>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
                  <UploadCloud className="w-10 h-10 transition-transform duration-300 group-hover:-translate-y-1" />
                </div>
                <span className="text-base font-black text-slate-800 dark:text-white mb-1">Faylni shu yerga tashlang yoki tanlang</span>
                <span className="text-xs font-semibold text-slate-400 max-w-xs leading-relaxed">PDF, Word, ZIP, Python, JS, Rasm yoki Video formatlari qo'llab-quvvatlanadi</span>
                <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Sparkles className="w-3.5 h-3.5" /> Kompyuterdan tanlash
                </span>
              </>
            ) : (
              <div className="w-full max-w-md p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-2 border-emerald-500/30 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 shadow-lg">
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md shrink-0">
                  {getFileIcon(file.name, file.type)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-black text-slate-800 dark:text-white text-sm truncate">{file.name}</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {(file.size / 1024 / 1024).toFixed(2)} MB • Yuklashga tayyor!
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  O'zgartirish
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">Dasturlash tili:</label>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 focus:border-emerald-500 text-xs font-black text-slate-800 dark:text-white outline-none shadow-sm transition-all cursor-pointer hover:border-emerald-500"
              >
                <option value="web">🌐 Veb (HTML / CSS / JS)</option>
                <option value="python">🐍 Python (3.10)</option>
                <option value="javascript">⚡ JavaScript (Node.js)</option>
                <option value="php">🐘 PHP (8.2)</option>
                <option value="cpp">⚙️ C++ (10.2)</option>
              </select>
            </div>
          </div>

          {language === 'web' ? (
            <div className="space-y-4">
              {/* Web Mode Tabs */}
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setWebTab('edit')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      webTab === 'edit' 
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Kod yozish
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebTab('preview')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      webTab === 'preview' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Jonli Natija (Live Preview)
                  </button>
                </div>
                <span className="text-[11px] font-bold text-slate-400 px-3">Avtomatik birlashadi</span>
              </div>

              {webTab === 'edit' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
                  <div className="relative group flex flex-col h-64 bg-[#1e1e1e] rounded-2xl border-2 border-slate-700/80 focus-within:border-emerald-500 transition-all overflow-hidden shadow-lg">
                    <div className="bg-[#141414] px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> HTML
                      </span>
                    </div>
                    <textarea value={html} onChange={e => setHtml(e.target.value)} className="w-full flex-1 bg-transparent text-emerald-300 text-xs p-3.5 outline-none font-mono resize-none custom-scrollbar" placeholder="<h1>Salom Dunyo</h1>&#10;<p>Veb sahifa loyihasi...</p>" />
                  </div>

                  <div className="relative group flex flex-col h-64 bg-[#1e1e1e] rounded-2xl border-2 border-slate-700/80 focus-within:border-cyan-500 transition-all overflow-hidden shadow-lg">
                    <div className="bg-[#141414] px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" /> CSS
                      </span>
                    </div>
                    <textarea value={css} onChange={e => setCss(e.target.value)} className="w-full flex-1 bg-transparent text-cyan-300 text-xs p-3.5 outline-none font-mono resize-none custom-scrollbar" placeholder="h1 {&#10;  color: #10b981;&#10;  text-align: center;&#10;}" />
                  </div>

                  <div className="relative group flex flex-col h-64 bg-[#1e1e1e] rounded-2xl border-2 border-slate-700/80 focus-within:border-amber-500 transition-all overflow-hidden shadow-lg">
                    <div className="bg-[#141414] px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> JavaScript
                      </span>
                    </div>
                    <textarea value={js} onChange={e => setJs(e.target.value)} className="w-full flex-1 bg-transparent text-amber-300 text-xs p-3.5 outline-none font-mono resize-none custom-scrollbar" placeholder="console.log('JS Ishladi');&#10;document.querySelector('h1').style.color = 'red';" />
                  </div>
                </div>
              ) : (
                <div className="h-[360px] bg-white rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 relative">
                  <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-slate-800">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Jonli Brauzer Natijasi
                    </span>
                    <button type="button" onClick={() => setWebTab('edit')} className="text-xs text-emerald-400 hover:underline">← Tahrirlashga qaytish</button>
                  </div>
                  <iframe srcDoc={previewDoc} title="Preview" className="w-full h-[calc(100%-36px)] border-none bg-white" sandbox="allow-scripts" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="h-[360px] bg-[#1e1e1e] rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-xl">
                <CodeEditor 
                  initialCode={singleCode}
                  initialLanguage={language}
                  onChange={(c) => setSingleCode(c)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading || (mode === 'file' ? !file : (language === 'web' ? (!html && !css && !js) : !singleCode))} 
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <UploadCloud className="w-5 h-5 animate-bounce" />
        )}
        <span>{isLoading ? 'Yuklanmoqda...' : 'Vazifani Yuborish (Submit)'}</span>
      </button>
    </form>
  );
};
