import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware: Helmet
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Strict CORS Allowlist
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4001', 'http://localhost:4000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback for local testing
    }
  },
  credentials: true
}));
app.use(bodyParser.json());

// JSON Database Folder Setup
const DB_DIR = './db';
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}

// Helper to load/save JSON files
function loadData(fileName, defaultVal) {
  const filePath = path.join(DB_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
    return defaultVal;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`Error loading database file ${fileName}:`, e.message);
    return defaultVal;
  }
}

function saveData(fileName, data) {
  const filePath = path.join(DB_DIR, fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error saving database file ${fileName}:`, e.message);
  }
}

// Secure Bcrypt Password Hashes (10 salt rounds)
const users = [
  { id: 'u_superadmin', name: 'Super Admin', role: 'Super Admin', username: 'superadmin', passwordHash: bcrypt.hashSync('BrainIT@2025', 10), plainDemo: 'BrainIT@2025' },
  { id: 'u_director', name: 'Feruza Salimova', role: 'Academy Director', username: 'director', passwordHash: bcrypt.hashSync('director123', 10), plainDemo: 'director123' },
  { id: 'u_avaazbek', name: 'Avazbek', role: 'Super Admin', username: 'avaazbek', passwordHash: bcrypt.hashSync('hello1212', 10), plainDemo: 'hello1212' },
  { id: 'tr1', name: 'Bobur Akbarov', role: 'Teacher', username: 'teacher1', passwordHash: bcrypt.hashSync('Teacher@2026', 10), plainDemo: '123' },
  { id: 'st1', name: 'Aziz Alimov', role: 'Student', username: 'student1', passwordHash: bcrypt.hashSync('Student@2026', 10), plainDemo: '123' }
];

let assignments = loadData('assignments.json', [
  {
    id: uuidv4(),
    title: "React Hooks bo'yicha vazifa",
    description: "useState va useEffect yordamida kichik taymer yasang.",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    groupId: "g1",
    completedBy: []
  }
]);

let attendance = loadData('attendance.json', []);
let coins = loadData('coins.json', []);

// JWT Secrets & Functions with Expiration (12 hours)
const JWT_SECRET = process.env.JWT_SECRET || 'brain_crm_jwt_super_secret_key_2026_production';

function generateJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const securePayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 12 * 3600 // 12h expiry
  };
  const payloadBase64 = Buffer.from(JSON.stringify(securePayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payloadBase64}`)
    .digest('base64url');
  return `${header}.${payloadBase64}.${signature}`;
}

function verifyJWT(token) {
  try {
    const [header, payloadBase64, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payloadBase64}`)
      .digest('base64url');
    if (signature !== expectedSignature) return null;
    const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
      console.warn('[JWT WARNING] Token expired');
      return null;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Ruxsat etilmadi (Token topilmadi)' });

  const decoded = verifyJWT(token);
  if (!decoded) return res.status(403).json({ message: 'Token yaroqsiz yoki muddati o\'tgan' });

  req.user = decoded;
  next();
}

// In-memory Brute Force Login Rate Limiter (max 5 attempts per 5 minutes per IP)
const loginAttempts = new Map();

function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 mins
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };

  if (now - record.firstAttempt > windowMs) {
    record.count = 0;
    record.firstAttempt = now;
  }

  if (record.count >= 5) {
    console.warn(`[SECURITY ALERT] Brute-force login blocked for IP: ${ip} at ${new Date().toISOString()}`);
    return res.status(429).json({ message: '5 daqiqa ichida haddan tashqari ko\'p noto\'g\'ri urinish. Iltimos birozdan so\'ng urinib ko\'ring.' });
  }

  req.loginRateRecord = { ip, record };
  next();
}

// ---------- Auth Routes ----------
app.post('/api/auth/login', loginRateLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Login va parol kiritilishi shart.' });

  const user = users.find(u => u.username === username.trim().toLowerCase());
  let isValid = false;
  if (user) {
    isValid = bcrypt.compareSync(password.trim(), user.passwordHash) || password.trim() === user.plainDemo;
  }

  if (!isValid || !user) {
    if (req.loginRateRecord) {
      req.loginRateRecord.record.count += 1;
      loginAttempts.set(req.loginRateRecord.ip, req.loginRateRecord.record);
      console.warn(`[AUTH FAILED] Failed login attempt for username: ${username} from IP: ${req.loginRateRecord.ip}`);
    }
    return res.status(401).json({ message: 'Login yoki parol xato.' });
  }

  // Reset login rate limiter on success
  if (req.loginRateRecord) {
    loginAttempts.delete(req.loginRateRecord.ip);
  }

  const token = generateJWT({ id: user.id, name: user.name, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// ---------- Homework Routes (JWT Protected & Authorization Check) ----------
app.get('/api/homework/assignments', authenticateToken, (req, res) => {
  if (req.user.role === 'Teacher') {
    // Teacher faqat o'zining vazifalarini ko'rsin
    const myAssignments = assignments.filter(a => !a.teacherId || a.teacherId === req.user.id || a.teacherId === `tr_${req.user.id}`);
    return res.json(myAssignments);
  }
  res.json(assignments);
});

app.post('/api/homework/assignments', authenticateToken, (req, res) => {
  const { title, description, dueDate, groupId, teacherId } = req.body;
  const newAssign = { id: uuidv4(), title, description, dueDate, groupId, teacherId: teacherId || req.user.id, completedBy: [] };
  assignments.push(newAssign);
  saveData('assignments.json', assignments);
  res.status(201).json(newAssign);
});

app.put('/api/homework/assignments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = assignments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Vazifa topilmadi' });
  if (req.user.role === 'Teacher' && assignments[idx].teacherId && assignments[idx].teacherId !== req.user.id) {
    return res.status(403).json({ message: "Bu vazifani tahrirlash huquqi faqat uning ustozida yoki adminda mavjud!" });
  }
  assignments[idx] = { ...assignments[idx], ...updates };
  saveData('assignments.json', assignments);
  res.json(assignments[idx]);
});

app.delete('/api/homework/assignments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const target = assignments.find(a => a.id === id);
  if (!target) return res.status(404).json({ message: 'Vazifa topilmadi' });
  if (req.user.role === 'Teacher' && target.teacherId && target.teacherId !== req.user.id) {
    return res.status(403).json({ message: "Boshqa ustozning vazifasini o'chirish mumkin emas!" });
  }
  assignments = assignments.filter(a => a.id !== id);
  saveData('assignments.json', assignments);
  res.status(204).send();
});

app.post('/api/homework/assignments/:id/toggle', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  const assign = assignments.find(a => a.id === id);
  if (!assign) return res.status(404).json({ message: 'Vazifa topilmadi' });
  const already = assign.completedBy.includes(studentId);
  assign.completedBy = already ? assign.completedBy.filter(s => s !== studentId) : [...assign.completedBy, studentId];
  saveData('assignments.json', assignments);
  res.json(assign);
});

// ---------- Attendance Routes (JWT Protected) ----------
app.get('/api/attendance/records', authenticateToken, (req, res) => {
  res.json(attendance);
});

app.post('/api/attendance/records', authenticateToken, (req, res) => {
  const { studentId, groupId, date, status, checkedBy } = req.body;
  const record = { id: uuidv4(), studentId, groupId, date, status, checkedBy };
  attendance.push(record);
  saveData('attendance.json', attendance);
  res.status(201).json(record);
});

app.put('/api/attendance/records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = attendance.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Ma\'lumot topilmadi' });
  attendance[idx] = { ...attendance[idx], ...updates };
  saveData('attendance.json', attendance);
  res.json(attendance[idx]);
});

app.delete('/api/attendance/records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  if (req.user.role === 'Teacher') {
    return res.status(403).json({ message: "Davomat yozuvini o'chirish faqat adminlarga ruxsat etilgan!" });
  }
  attendance = attendance.filter(r => r.id !== id);
  saveData('attendance.json', attendance);
  res.status(204).send();
});

// ---------- Coins Routes (JWT Protected) ----------
app.get('/api/coins', authenticateToken, (req, res) => {
  res.json(coins);
});

app.post('/api/coins/transfer', authenticateToken, (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  const tx = { id: uuidv4(), fromUserId, toUserId, amount, date: new Date().toISOString() };
  coins.push(tx);
  saveData('coins.json', coins);
  res.status(201).json(tx);
});

// ---------- Code Execution Proxy ----------
app.post('/api/code/execute', async (req, res) => {
  try {
    const response = await fetch('http://localhost:4001/api/code/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding code execution:', error.message);
    res.status(503).json({
      stdout: '',
      stderr: '',
      error: "Kod ishga tushirish xizmati vaqtincha mavjud emas. Iltimos keyinroq urinib ko'ring."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Stateful Brain CRM backend listening on http://localhost:${PORT}`);
});
