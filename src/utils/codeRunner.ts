// Piston API integration for executing code in the browser

import { API_BASE_URL } from '../api/client';
import { useAuthStore } from '../stores/authStore';

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  executionTime?: number;
  exitCode?: number | null;
  errorType?: 'network' | 'timeout' | 'memory' | 'syntax' | null;
}

// Maps language names to Piston language versions
const LANGUAGE_VERSIONS: Record<string, string> = {
  javascript: '18.15.0',
  python: '3.10.0',
  java: '15.0.2',
  cpp: '10.2.0',
  c: '10.2.0',
  php: '8.2.3',
  ruby: '3.0.1',
};

// Aliases for the dropdown
export const SUPPORTED_LANGUAGES = [
  { id: 'html', name: 'HTML / CSS / JS (Web)' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript (Node.js)' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'c', name: 'C' },
];

export async function executeCode(language: string, code: string): Promise<CodeExecutionResult> {
  const version = LANGUAGE_VERSIONS[language];
  
  if (!version) {
    return {
      stdout: '',
      stderr: '',
      error: `Language '${language}' is not supported.`,
    };
  }

  try {
    const startTime = performance.now();
    
    // If language is HTML, we don't send it to backend, the UI will handle it via iframe
    if (language === 'html') {
      return {
        stdout: '',
        stderr: '',
        executionTime: 0,
      };
    }

    const authStore = useAuthStore.getState();
    const userId = authStore.currentUser?.id;

    const response = await fetch(`${API_BASE_URL}/code/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        version,
        files: [
          {
            content: code,
          },
        ],
        userId // Pass userId for rate-limiting
      }),
    });

    const data = await response.json();
    const endTime = performance.now();

    if (!response.ok) {
      return {
        stdout: '',
        stderr: '',
        error: data.message || 'API Error',
      };
    }

    return {
      stdout: data.run?.stdout || '',
      stderr: data.run?.stderr || '',
      executionTime: endTime - startTime,
      exitCode: data.run?.code,
      errorType: data.errorType,
    };
  } catch (err: any) {
    return {
      stdout: '',
      stderr: '',
      error: err.message || 'Failed to execute code. Please check your internet connection.',
    };
  }
}
