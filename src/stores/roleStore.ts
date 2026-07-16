import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PermissionItem {
  id: string;
  label: string;
  category: "Ta'lim" | "Moliya" | "CRM & PM" | "Boshqaruv" | "Maxsus Amallar";
}

export const ALL_PERMISSIONS: PermissionItem[] = [
  // Ta'lim
  { id: 'dashboard', label: 'Boshqaruv paneli (Dashboard)', category: "Ta'lim" },
  { id: 'academy', label: 'LMS & Classroom', category: "Ta'lim" },
  { id: 'courses', label: 'Kurslar bo\'limi', category: "Ta'lim" },
  { id: 'groups', label: 'Guruhlar bo\'limi', category: "Ta'lim" },
  { id: 'students', label: "O'quvchilar ro'yxati", category: "Ta'lim" },
  { id: 'attendance', label: 'Davomat paneli', category: "Ta'lim" },
  { id: 'homework', label: 'Uy‑vazifalar', category: "Ta'lim" },

  // Moliya
  { id: 'finance', label: 'Kassa / Moliya paneli', category: "Moliya" },
  { id: 'payroll', label: 'Ustoz maoshi va hisob-kitoblar', category: "Moliya" },
  { id: 'coins', label: 'Tanga tizimi va reyting', category: "Moliya" },
  { id: 'market', label: 'Online Market & Sovg\'alar', category: "Moliya" },

  // CRM & PM
  { id: 'crm', label: 'CRM Pipeline (Lidlar)', category: "CRM & PM" },
  { id: 'pm', label: 'Kanban Topshiriqlar paneli', category: "CRM & PM" },
  { id: 'faceid', label: 'Face ID Davomat tizimi', category: "CRM & PM" },

  // Boshqaruv
  { id: 'staff', label: 'Xodimlar (HR) boshqaruvi', category: "Boshqaruv" },
  { id: 'contracts', label: 'Shartnomalar va hujjatlar', category: "Boshqaruv" },
  { id: 'notifications', label: 'Xabarnomalar jo\'natish', category: "Boshqaruv" },
  { id: 'reports', label: 'Analitik hisobotlar', category: "Boshqaruv" },
  { id: 'settings', label: 'Sozlamalar va integratsiyalar', category: "Boshqaruv" },
  { id: 'roles', label: 'Rollar va Huquqlar (Super Admin)', category: "Boshqaruv" },

  // Maxsus Amallar
  { id: 'students.add', label: "Yangi o'quvchi qo'shish va tahrirlash", category: "Maxsus Amallar" },
  { id: 'students.delete', label: "O'quvchining tizimdan o'chirish", category: "Maxsus Amallar" },
  { id: 'groups.manage', label: "O'quvchini guruhga biriktirish / olib tashlash", category: "Maxsus Amallar" },
  { id: 'finance.receive', label: "Kassadan to'lov qabul qilish va chek chiqarish", category: "Maxsus Amallar" },
  { id: 'homework.grade', label: "Uy vazifalarini tekshirish va baho qo'yish", category: "Maxsus Amallar" },
  { id: 'coins.send', label: "O'quvchilarga tanga (coin) berish", category: "Maxsus Amallar" },
  { id: 'courses.manage', label: "Yangi kurs va guruh yaratish", category: "Maxsus Amallar" },
];

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  userCount: number;
  permissions: string[];
}

interface RoleState {
  roles: Role[];
  addRole: (role: Omit<Role, 'id' | 'userCount'>) => void;
  updateRole: (id: string, patch: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  hasPermission: (roleName: string, permissionId: string) => boolean;
}

const initialRoles: Role[] = [
  {
    id: 'r_superadmin',
    name: 'Super Admin',
    description: 'Tizimning barcha imkoniyatlariga to\'liq ruxsat (Tizim egasi)',
    isSystem: true,
    userCount: 2,
    permissions: ALL_PERMISSIONS.map(p => p.id),
  },
  {
    id: 'r_director',
    name: 'Academy Director',
    description: 'O\'quv markaz operatsiyalari, moliya va o\'quvchilar boshqaruvi',
    isSystem: true,
    userCount: 1,
    permissions: [
      'dashboard', 'academy', 'courses', 'groups', 'students', 'attendance', 'homework',
      'finance', 'payroll', 'coins', 'market', 'crm', 'pm', 'faceid', 'staff', 'contracts',
      'notifications', 'reports', 'settings', 'students.add', 'groups.manage', 'finance.receive',
      'coins.send', 'courses.manage'
    ],
  },
  {
    id: 'r_teacher',
    name: 'Teacher',
    description: 'O\'z guruhlariga dars o\'tish, davomat olish va uy vazifa baholash',
    isSystem: true,
    userCount: 8,
    permissions: [
      'dashboard', 'academy', 'courses', 'groups', 'students', 'attendance', 'homework',
      'coins', 'faceid', 'homework.grade', 'coins.send'
    ],
  },
  {
    id: 'r_student',
    name: 'Student',
    description: 'Darslarni ko\'rish, uy vazifa topshirish va Marketdan xarid qilish',
    isSystem: true,
    userCount: 120,
    permissions: ['dashboard', 'academy', 'coins', 'market', 'homework'],
  },
  {
    id: 'r_moderator',
    name: 'Moderator',
    description: 'Guruhlar va o\'quvchilar ro\'yxatining davomati hamda intizomnazorati',
    userCount: 3,
    permissions: [
      'dashboard', 'academy', 'courses', 'groups', 'students', 'attendance', 'homework',
      'students.add', 'groups.manage', 'notifications'
    ],
  },
  {
    id: 'r_cashier',
    name: 'Kassir',
    description: 'O\'quvchilardan to\'lov qabul qilish, chek berish va moliya hisoboti',
    userCount: 2,
    permissions: ['dashboard', 'finance', 'students', 'contracts', 'finance.receive', 'reports'],
  },
  {
    id: 'r_operator',
    name: 'Operator',
    description: 'Yangi lidlar bilan ishlash (CRM), qo\'ng\'iroqlar va maslahat berish',
    userCount: 4,
    permissions: ['dashboard', 'crm', 'students', 'students.add', 'notifications'],
  },
  {
    id: 'r_assistant',
    name: 'Assistent',
    description: 'Ustozlarga ko\'maklashish, vazifalarni tekshirish va javob berish',
    userCount: 5,
    permissions: ['dashboard', 'academy', 'attendance', 'homework', 'homework.grade', 'coins.send'],
  },
  {
    id: 'r_administrator',
    name: 'Administrator',
    description: 'Guruhlar tuzish, o\'quvchi qabul qilish va ofis operatsiyalari',
    userCount: 2,
    permissions: [
      'dashboard', 'academy', 'courses', 'groups', 'students', 'attendance', 'homework',
      'crm', 'pm', 'faceid', 'contracts', 'notifications', 'students.add', 'groups.manage', 'courses.manage'
    ],
  },
];

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      roles: initialRoles,
      addRole: (role) => set((state) => ({
        roles: [
          ...state.roles,
          {
            ...role,
            id: `r_${Date.now()}`,
            userCount: 0,
          },
        ],
      })),
      updateRole: (id, patch) => set((state) => ({
        roles: state.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      })),
      deleteRole: (id) => set((state) => ({
        roles: state.roles.filter((r) => r.id !== id || r.isSystem),
      })),
      hasPermission: (roleName, permissionId) => {
        if (roleName === 'Super Admin') return true;
        const role = get().roles.find(
          (r) => r.name.toLowerCase() === roleName.toLowerCase()
        );
        if (!role) return false;
        return role.permissions.includes(permissionId);
      },
    }),
    { name: 'brain-it-roleStore-v10' }
  )
);
