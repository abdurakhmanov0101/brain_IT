const fs = require('fs');
const path = require('path');

const replacements = {
  'src/stores/attendanceStore.ts': [
    [/const\s+initialAttendance:\s*AttendanceLog\[\]\s*=\s*\[[^]*?\];/g, 'const initialAttendance: AttendanceLog[] = [];']
  ],
  'src/stores/classroomStore.ts': [
    [/const\s+initialLessons:\s*LessonRecord\[\]\s*=\s*\[[^]*?\];/g, 'const initialLessons: LessonRecord[] = [];']
  ],
  'src/stores/contractStore.ts': [
    [/const\s+initial:\s*Contract\[\]\s*=\s*\[[^]*?\];/g, 'const initial: Contract[] = [];']
  ],
  'src/stores/courseStore.ts': [
    [/const\s+initial:\s*AcademyCourse\[\]\s*=\s*\[[^]*?\];/g, 'const initial: AcademyCourse[] = [];']
  ],
  'src/stores/financeStore.ts': [
    [/const\s+initialFinance:\s*FinanceRecord\[\]\s*=\s*\[[^]*?\];/g, 'const initialFinance: FinanceRecord[] = [];'],
    [/const\s+initialTransactions:\s*Transaction\[\]\s*=\s*\[[^]*?\];/g, 'const initialTransactions: Transaction[] = [];']
  ],
  'src/stores/groupStore.ts': [
    [/const\s+initialGroups:\s*AcademyGroup\[\]\s*=\s*\[[^]*?\];/g, 'const initialGroups: AcademyGroup[] = [];']
  ],
  'src/stores/homeworkStore.ts': [
    [/const\s+initialAssignments:\s*Assignment\[\]\s*=\s*\[[^]*?\];/g, 'const initialAssignments: Assignment[] = [];'],
    [/const\s+initialSubmissions:\s*Submission\[\]\s*=\s*\[[^]*?\];/g, 'const initialSubmissions: Submission[] = [];']
  ],
  'src/stores/inClassTaskStore.ts': [
    [/const\s+initialTasks:\s*InClassTask\[\]\s*=\s*\[[^]*?\];/g, 'const initialTasks: InClassTask[] = [];']
  ],
  'src/stores/pmStore.ts': [
    [/const\s+initialProjects:\s*Project\[\]\s*=\s*\[[^]*?\];/g, 'const initialProjects: Project[] = [];']
  ],
  'src/stores/staffStore.ts': [
    [/const\s+initialStaff:\s*StaffMember\[\]\s*=\s*\[[^]*?\];/g, 'const initialStaff: StaffMember[] = [];']
  ],
  'src/stores/studentStore.ts': [
    [/const\s+rawStudents:\s*InitStudent\[\]\s*=\s*generateStudents\(\);/g, 'const rawStudents: InitStudent[] = [];']
  ],
  'src/stores/teacherStore.ts': [
    [/const\s+rawTeachers:\s*InitTeacher\[\]\s*=\s*generateTeachers\(\);/g, 'const rawTeachers: InitTeacher[] = [];']
  ]
};

for (const [file, list] of Object.entries(replacements)) {
  const absPath = path.resolve(file);
  if (!fs.existsSync(absPath)) {
    console.error('File not found:', file);
    continue;
  }
  let content = fs.readFileSync(absPath, 'utf8');
  const original = content;
  
  for (const [regex, replacement] of list) {
    content = content.replace(regex, replacement);
  }
  
  // Also rename storage keys to bust cache in all of these
  content = content.replace(/(name:\s*['"])([^'"]+)(['"])/g, (match, p1, p2, p3) => {
    if (p2.includes('brain') || p2.includes('classroom') || p2.includes('homework') || p2.includes('teacher') || p2.includes('staff')) {
      return `${p1}${p2}-prod-v3${p3}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(absPath, content);
    console.log('Cleaned and renamed storage key in:', file);
  } else {
    console.warn('No replacement done for:', file);
  }
}
