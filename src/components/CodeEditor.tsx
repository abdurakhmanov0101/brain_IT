import React, { useState } from 'react';
import EditorMod from 'react-simple-code-editor';
const Editor = (EditorMod as unknown as { default: React.ComponentType<any> }).default || EditorMod;
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-markup'; // for HTML
import 'prismjs/themes/prism-tomorrow.css'; // dark theme
import { Play, Loader2 } from 'lucide-react';
import { executeCode, SUPPORTED_LANGUAGES } from '../utils/codeRunner';
import type { CodeExecutionResult } from '../utils/codeRunner';

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  readOnly?: boolean;
  onChange?: (code: string, language: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  initialLanguage = 'python',
  readOnly = false,
  onChange,
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (onChange) onChange(newCode, language);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (onChange) onChange(code, newLang);
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput('');
    setError('');
    setExecutionTime(null);
    setExitCode(null);
    setErrorType(null);

    const result = await executeCode(language, code);

    if (result.error) {
      setError(result.error);
    } else {
      if (result.stderr) {
        setError(result.stderr);
      }
      setOutput(result.stdout);
    }
    
    if (result.executionTime !== undefined) setExecutionTime(result.executionTime);
    if (result.exitCode !== undefined) setExitCode(result.exitCode);
    if (result.errorType !== undefined) setErrorType(result.errorType || null);
    
    setIsRunning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  const highlightCode = (codeToHighlight: string) => {
    // Basic mapping for prism grammar
    let grammar = Prism.languages.javascript;
    if (language === 'python') grammar = Prism.languages.python;
    else if (language === 'java') grammar = Prism.languages.java;
    else if (language === 'cpp' || language === 'c') grammar = Prism.languages.cpp;
    else if (language === 'html') grammar = Prism.languages.html || Prism.languages.javascript;
    
    return Prism.highlight(codeToHighlight, grammar, language);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden shadow-xl border border-slate-700">
      {/* Editor Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-slate-700">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            disabled={readOnly}
            className="bg-[#333333] text-white text-sm rounded-lg px-3 py-1.5 border border-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 appearance-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          {readOnly && <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">O'qish uchun (Read-only)</span>}
        </div>
        
        <button
          onClick={handleRun}
          disabled={isRunning || !code.trim()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[400px]">
        {/* Editor Pane */}
        <div className="flex-1 overflow-auto border-b md:border-b-0 md:border-r border-slate-700 relative group">
          <div className="absolute top-2 right-4 text-xs font-bold text-slate-500 uppercase z-10 pointer-events-none">
            {language}
          </div>
          <Editor
            value={code}
            onValueChange={handleCodeChange}
            highlight={highlightCode}
            padding={16}
            disabled={readOnly}
            style={{
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              fontSize: 14,
              minHeight: '100%',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
            }}
            onKeyDown={handleKeyDown}
            className="editor-container focus:outline-none"
          />
        </div>

        {/* Output Pane */}
        <div className="flex-1 bg-black flex flex-col relative">
          <div className="px-4 py-2 bg-[#1a1a1a] border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
            <span>{language === 'html' ? 'Browser Preview' : 'Terminal (Output)'}</span>
            {executionTime !== null && language !== 'html' && (
              <div className="flex gap-3 text-[10px]">
                <span>Vaqt: {Math.round(executionTime)}ms</span>
                {exitCode !== null && <span>Exit code: {exitCode}</span>}
              </div>
            )}
          </div>
          <div className={`p-4 flex-1 font-mono text-sm ${language === 'html' ? 'p-0 bg-white' : 'overflow-auto'}`}>
            {language === 'html' ? (
              <iframe
                title="HTML Preview"
                srcDoc={output ? output : code} // If 'run' was clicked, use code
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts"
              />
            ) : isRunning ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Kodni bajarish... (Executing)</span>
              </div>
            ) : (
              <>
                {!output && !error && (
                  <span className="text-slate-600">Natija bu yerda chiqadi... (Run qilish uchun Ctrl+Enter bosing)</span>
                )}
                {output && <pre className="text-emerald-400 whitespace-pre-wrap">{output}</pre>}
                {error && (
                  <pre className={`whitespace-pre-wrap mt-2 ${
                    errorType === 'network' ? 'text-amber-400' : 
                    errorType === 'timeout' || errorType === 'memory' ? 'text-yellow-400' : 
                    'text-rose-400'
                  }`}>
                    {error}
                  </pre>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
