export type Language = 'uz' | 'ru' | 'en';

export const APP_TRANSLATIONS = {
  uz: {
    // Menu groups
    groupMain: 'Asosiy',
    groupEducation: "Ta'lim",
    groupFinance: 'Moliya',
    groupCrmPm: 'CRM / PM',
    groupManagement: 'Boshqaruv',
    groupPortals: 'Portallar',

    // Menu items & page titles
    dashboard: 'Boshqaruv Paneli',
    academy: 'LMS & Classroom',
    courses: 'Kurslar',
    groups: 'Guruhlar',
    students: "O'quvchilar",
    teachers: 'Ustozlar',
    attendance: 'Davomat',
    homework: 'Uy‑vazifalar',
    finance: 'Kassa / Moliya',
    payroll: 'Ustoz Maoshi',
    coins: 'Tanga Tizimi',
    market: 'Market',
    crm: 'CRM Pipeline',
    pm: 'Kanban Topshiriqlar',
    faceid: 'Face ID Davomat',
    staff: 'Xodimlar (HR)',
    contracts: 'Shartnomalar',
    notifications: 'Xabarnomalar',
    reports: 'Hisobotlar',
    roles: 'Rollar va Huquqlar',
    'student-portal': "O'quvchi Portali",
    'parent-portal': 'Ota-ona Portali',
    'teacher-portal': 'Ustoz Paneli',
    'staff-portal': 'Xodim Paneli',
    settings: 'Sozlamalar',

    // Header & Common
    searchPlaceholder: "O'quvchi, guruh yoki kurs qidirish...",
    logout: 'Chiqish',
    loading: 'Yuklanmoqda...',
    coinBalance: 'Tanga balansim',
  },
  ru: {
    // Menu groups
    groupMain: 'Главная',
    groupEducation: 'Обучение',
    groupFinance: 'Финансы',
    groupCrmPm: 'CRM / Проекты',
    groupManagement: 'Управление',
    groupPortals: 'Порталы',

    // Menu items & page titles
    dashboard: 'Панель управления',
    academy: 'LMS и Обучение',
    courses: 'Курсы',
    groups: 'Группы',
    students: 'Студенты',
    teachers: 'Учителя',
    attendance: 'Посещаемость',
    homework: 'Домашние задания',
    finance: 'Касса / Финансы',
    payroll: 'Зарплаты учителей',
    coins: 'Система монет',
    market: 'Маркет',
    crm: 'CRM Воронка',
    pm: 'Канбан Задачи',
    faceid: 'Face ID Посещаемость',
    staff: 'Сотрудники (HR)',
    contracts: 'Договоры',
    notifications: 'Уведомления',
    reports: 'Отчеты',
    roles: 'Роли и права',
    'student-portal': 'Портал студента',
    'parent-portal': 'Портал родителей',
    'teacher-portal': 'Панель учителя',
    'staff-portal': 'Панель сотрудника',
    settings: 'Настройки',

    // Header & Common
    searchPlaceholder: 'Поиск студента, группы или курса...',
    logout: 'Выйти',
    loading: 'Загрузка...',
    coinBalance: 'Баланс монет',
  },
  en: {
    // Menu groups
    groupMain: 'Main',
    groupEducation: 'Education',
    groupFinance: 'Finance',
    groupCrmPm: 'CRM / PM',
    groupManagement: 'Management',
    groupPortals: 'Portals',

    // Menu items & page titles
    dashboard: 'Dashboard',
    academy: 'LMS & Classroom',
    courses: 'Courses',
    groups: 'Groups',
    students: 'Students',
    teachers: 'Teachers',
    attendance: 'Attendance',
    homework: 'Homework',
    finance: 'Cash / Finance',
    payroll: 'Teacher Payroll',
    coins: 'Coin System',
    market: 'Market',
    crm: 'CRM Pipeline',
    pm: 'Kanban Tasks',
    faceid: 'Face ID Attendance',
    staff: 'Staff (HR)',
    contracts: 'Contracts',
    notifications: 'Notifications',
    reports: 'Reports',
    roles: 'Roles & Permissions',
    'student-portal': 'Student Portal',
    'parent-portal': 'Parent Portal',
    'teacher-portal': 'Teacher Panel',
    'staff-portal': 'Staff Panel',
    settings: 'Settings',

    // Header & Common
    searchPlaceholder: 'Search student, group or course...',
    logout: 'Logout',
    loading: 'Loading...',
    coinBalance: 'Coin Balance',
  },
};

export function getTranslation(lang: Language, key: keyof typeof APP_TRANSLATIONS['uz']): string {
  const dict = APP_TRANSLATIONS[lang] || APP_TRANSLATIONS.uz;
  return dict[key] || APP_TRANSLATIONS.uz[key] || String(key);
}
