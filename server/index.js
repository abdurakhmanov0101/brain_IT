import express from 'express';
import cors from 'cors';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const PISTON_API_URL = process.env.PISTON_API_URL || 'http://localhost:2000';

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

// Rate limit based on user ID passed in the body (or default to IP if none)
const executeRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user
  message: {
    stdout: '',
    stderr: '',
    error: 'Siz juda ko\'p so\'rov yubordingiz. Iltimos 1 daqiqa kuting.'
  },
  keyGenerator: (req) => {
    // Rely on a studentId or userId passed in the body, fallback to IP
    return req.body.userId || req.ip;
  }
});

app.post('/api/code/execute', executeRateLimit, async (req, res) => {
  const { language, version, files } = req.body;

  if (!language || !version || !files) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] EXEC_START | User: ${req.body.userId || 'Guest'} | Lang: ${language}`);

  try {
    let response;
    try {
      response = await axios.post(`${PISTON_API_URL}/api/v2/execute`, {
        language,
        version,
        files
      }, {
        timeout: 3000
      });
    } catch (err) {
      console.warn(`Local Piston at ${PISTON_API_URL} failed (${err.message}). Falling back to public EMKC Piston API...`);
      response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language,
        version,
        files
      }, {
        timeout: 10000
      });
    }

    let data = response.data;
    let run = data.run || {};
    
    // 4. Output uzunligiga chegara (10,000 belgi)
    const MAX_OUTPUT = 10000;
    if (run.stdout && run.stdout.length > MAX_OUTPUT) {
      run.stdout = run.stdout.substring(0, MAX_OUTPUT) + "\n\n...[OUTPUT KESILDI: Jami belgilar 10,000 dan oshdi]...";
    }
    if (run.stderr && run.stderr.length > MAX_OUTPUT) {
      run.stderr = run.stderr.substring(0, MAX_OUTPUT) + "\n\n...[XATOLIK KESILDI]...";
    }

    // 2. Xato turlarini farqlash
    data.errorType = null; // null | 'network' | 'timeout' | 'memory' | 'syntax'
    
    // a) Network Block
    if (run.stderr) {
      const stderrLower = run.stderr.toLowerCase();
      const networkErrors = ['network is unreachable', 'temporary failure in name resolution', 'enotfound', 'eai_again', 'econnrefused', 'fetch failed'];
      if (networkErrors.some(err => stderrLower.includes(err))) {
        data.errorType = 'network';
        run.stderr = "❌ XAVFSIZLIK CHEKLOVI: Kodingiz orqali tashqi tarmoqqa (internetga) ulanish ruxsat etilmaydi.\n\n[Original Xato]: " + run.stderr;
      }
    }

    // b) Timeout / Memory Limit
    if (run.signal === 'SIGKILL' || run.signal === 'SIGTERM' || run.signal === 'SIGXCPU') {
      // It's hard to perfectly distinguish memory vs timeout just from SIGKILL, but we can guess
      data.errorType = 'timeout'; 
      run.stderr = "⏳ TIMEOUT yoki XOTIRA LIMITI: Kodingiz juda uzoq ishladi yoki ajratilgan xotiradan (256MB) oshib ketdi.\nIltimos, cheksiz sikllar (infinite loop) yo'qligini tekshiring.";
    } else if (run.stderr && (run.stderr.includes('MemoryError') || run.stderr.includes('bad_alloc') || run.stderr.includes('out of memory'))) {
      data.errorType = 'memory';
      run.stderr = "🧠 XOTIRA LIMITI: Kodingiz tizim xotirasidan ko'p joy egalladi (256MB).\n\n" + run.stderr;
    } else if (run.code !== 0 && run.code !== null && !data.errorType) {
      data.errorType = 'syntax';
    }

    data.run = run;

    // 3. Server-side logging
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] EXEC_END | User: ${req.body.userId || 'Guest'} | Lang: ${language} | Time: ${duration}ms | Code: ${run.code} | ErrType: ${data.errorType || 'none'}`);

    res.json(data);
  } catch (error) {
    console.error('Piston Execution Error:', error.message);
    
    // Provide a clean user-friendly error
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      return res.status(503).json({
        stdout: '',
        stderr: '',
        error: "Kod ishga tushirish xizmati vaqtincha mavjud emas. Iltimos keyinroq urinib ko'ring."
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        stdout: '',
        stderr: '',
        error: "Kod ishlashi juda uzoq vaqt oldi (Timeout)."
      });
    }

    res.status(400).json({
      stdout: '',
      stderr: '',
      error: error.response?.data?.message || "Kodni ishga tushirishda xatolik yuz berdi."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Proxy Server running on port ${PORT}`);
  console.log(`Piston API configured at ${PISTON_API_URL}`);
});
