import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// In‑memory mock data stores (replace with DB later)
const users = [
  { id: 'u_superadmin', name: 'Super Admin', role: 'Super Admin', username: 'superadmin', password: 'BrainIT@2025' },
  { id: 'u_director', name: 'Feruza Salimova', role: 'Academy Director', username: 'director', password: 'director123' },
  { id: 'u_avaazbek', name: 'Avazbek', role: 'Super Admin', username: 'avaazbek', password: 'hello1212' },
  { id: 'u_bobur', name: 'Bobur Akbarov', role: 'Teacher', username: 'bobur', password: 'bobur123' },
];

let assignments = [
  {
    id: uuidv4(),
    title: "Matematika darsligi",
    description: "2️⃣ sahifani o‘qing va yechimlarni yozing",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    groupId: "g1",
    completedBy: []
  },
  {
    id: uuidv4(),
    title: "Tarix taqdimoti",
    description: "O‘rganilgan voqealarni slaydli taqdim eting",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    groupId: "g2",
    completedBy: []
  }
];

let groups = [
  { id: "g1", name: "Guruh A" },
  { id: "g2", name: "Guruh B" }
];

let students = [
  { id: "s1", name: "Ali", groupId: "g1" },
  { id: "s2", name: "Vali", groupId: "g1" },
  { id: "s3", name: "Sami", groupId: "g2" },
  { id: "s4", name: "Olim", groupId: "g2" }
];

let attendance = [];
let coins = [];

// ---------- Auth ----------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  // In real app issue JWT; here return mock token
  const token = `mock_jwt_${Date.now()}`;
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// ---------- Homework ----------
app.get('/api/homework/assignments', (req, res) => {
  res.json(assignments);
});
app.post('/api/homework/assignments', (req, res) => {
  const { title, description, dueDate, groupId } = req.body;
  const newAssign = { id: uuidv4(), title, description, dueDate, groupId, completedBy: [] };
  assignments.push(newAssign);
  res.status(201).json(newAssign);
});
app.put('/api/homework/assignments/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = assignments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  assignments[idx] = { ...assignments[idx], ...updates };
  res.json(assignments[idx]);
});
app.delete('/api/homework/assignments/:id', (req, res) => {
  const { id } = req.params;
  assignments = assignments.filter(a => a.id !== id);
  res.status(204).send();
});
app.post('/api/homework/assignments/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  const assign = assignments.find(a => a.id === id);
  if (!assign) return res.status(404).json({ message: 'Assignment not found' });
  const already = assign.completedBy.includes(studentId);
  assign.completedBy = already ? assign.completedBy.filter(s => s !== studentId) : [...assign.completedBy, studentId];
  res.json(assign);
});

// ---------- Attendance ----------
app.get('/api/attendance/records', (req, res) => {
  res.json(attendance);
});
app.post('/api/attendance/records', (req, res) => {
  const { studentId, groupId, date, status, checkedBy } = req.body;
  const record = { id: uuidv4(), studentId, groupId, date, status, checkedBy };
  attendance.push(record);
  res.status(201).json(record);
});
app.put('/api/attendance/records/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = attendance.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  attendance[idx] = { ...attendance[idx], ...updates };
  res.json(attendance[idx]);
});
app.delete('/api/attendance/records/:id', (req, res) => {
  const { id } = req.params;
  attendance = attendance.filter(r => r.id !== id);
  res.status(204).send();
});

// ---------- Coins (simple) ----------
app.get('/api/coins', (req, res) => {
  res.json(coins);
});
app.post('/api/coins/transfer', (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  // Very basic logic – just push a transaction record
  const tx = { id: uuidv4(), fromUserId, toUserId, amount, date: new Date().toISOString() };
  coins.push(tx);
  res.status(201).json(tx);
});

app.listen(PORT, () => {
  console.log(`Mock Brain CRM backend listening on http://localhost:${PORT}`);
});
