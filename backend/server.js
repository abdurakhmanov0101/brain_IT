import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
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

// Initialize persistent state
const users = [
  { id: 'u_superadmin', name: 'Super Admin', role: 'Super Admin', username: 'superadmin', password: 'BrainIT@2025' },
  { id: 'u_director', name: 'Feruza Salimova', role: 'Academy Director', username: 'director', password: 'director123' },
  { id: 'u_avaazbek', name: 'Avazbek', role: 'Super Admin', username: 'avaazbek', password: 'hello1212' },
  { id: 'tr1', name: 'Bobur Akbarov', role: 'Teacher', username: 'teacher1', password: '123' },
  { id: 'st1', name: 'Aziz Alimov', role: 'Student', username: 'student1', password: '123' }
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

// JWT Secrets & Functions (Native Crypto implementation)
const JWT_SECRET = 'brain_crm_jwt_super_secret_key_2026';

function generateJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
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
    return JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
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

// ---------- Auth Routes ----------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username.trim().toLowerCase() && u.password === password.trim());
  if (!user) return res.status(401).json({ message: 'Login yoki parol xato.' });

  const token = generateJWT({ id: user.id, name: user.name, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// ---------- Homework Routes (JWT Protected) ----------
app.get('/api/homework/assignments', (req, res) => {
  res.json(assignments);
});

app.post('/api/homework/assignments', authenticateToken, (req, res) => {
  const { title, description, dueDate, groupId } = req.body;
  const newAssign = { id: uuidv4(), title, description, dueDate, groupId, completedBy: [] };
  assignments.push(newAssign);
  saveData('assignments.json', assignments);
  res.status(201).json(newAssign);
});

app.put('/api/homework/assignments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = assignments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Vazifa topilmadi' });
  assignments[idx] = { ...assignments[idx], ...updates };
  saveData('assignments.json', assignments);
  res.json(assignments[idx]);
});

app.delete('/api/homework/assignments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
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
app.get('/api/attendance/records', (req, res) => {
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
  attendance = attendance.filter(r => r.id !== id);
  saveData('attendance.json', attendance);
  res.status(204).send();
});

// ---------- Coins Routes (JWT Protected) ----------
app.get('/api/coins', (req, res) => {
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
