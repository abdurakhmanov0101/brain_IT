import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PermissionItem {
  id: string;
  label: string;
  category: "Ta'lim" | "Moliya" | "CRM & PM" | "Boshqaruv" | "Maxsus Amallar";
}

export const ALL_PERMISSIONS: PermissionItem[] = [
  // Ta'lim & Akademik
  { id: 'dashboard', label: 'Boshqaruv paneli (Dashboard ko\'rish)', category: "Ta'lim" },
  { id: 'groups.view', label: 'Guruhlarni ko\'rish', category: "Ta'lim" },
  { id: 'groups.create', label: 'Yangi guruh yaratish', category: "Ta'lim" },
  { id: 'groups.edit', label: 'Guruh ma\'lumotlarini tahrirlash', category: "Ta'lim" },
  { id: 'groups.delete', label: 'Guruhni arxivlash / o\'chirish', category: "Ta'lim" },
  { id: 'courses.view', label: 'Kurslar ro\'yxatini ko\'rish', category: "Ta'lim" },
  { id: 'courses.create', label: 'Yangi kurs qo\'shish', category: "Ta'lim" },
  { id: 'courses.edit', label: 'Kurs narxi va rejasini tahrirlash', category: "Ta'lim" },
  { id: 'courses.delete', label: 'Kursni o\'chirish', category: "Ta'lim" },
  { id: 'students.view', label: "O'quvchilar ro'yxatini ko'rish", category: "Ta'lim" },
  { id: 'students.add', label: "Yangi o'quvchi qo'shish va tahrirlash", category: "Ta'lim" },
  { id: 'students.delete', label: "O'quvchini tizimdan o'chirish (Arxivlash)", category: "Ta'lim" },
  { id: 'students.export', label: "O'quvchilar ro'yxatini CSV/Excel ga yuklash", category: "Ta'lim" },
  { id: 'groups.manage', label: "O'quvchini guruhga biriktirish / olib tashlash", category: "Ta'lim" },
  { id: 'attendance.view', label: 'Davomat panelini ko\'rish', category: "Ta'lim" },
  { id: 'attendance.mark', label: 'Bugungi dars uchun davomat olish', category: "Ta'lim" },
  { id: 'attendance.edit_past', label: 'O\'tgan kunlar davomatini o\'zgartirish (Admin)', category: "Ta'lim" },
  { id: 'homework.view', label: 'Uy vazifalari ro\'yxatini ko\'rish', category: "Ta'lim" },
  { id: 'homework.create', label: 'Yangi uy vazifasi va video dars yuklash', category: "Ta'lim" },
  { id: 'homework.grade', label: 'Uy vazifalarini tekshirish va baho qo\'yish', category: "Ta'lim" },
  { id: 'academy', label: 'LMS & Classroom interfeysi', category: "Ta'lim" },

  // Moliya & Kassa
  { id: 'finance', label: 'Kassa / Moliya panelini ko\'rish', category: "Moliya" },
  { id: 'finance.receive', label: 'Kassadan to\'lov qabul qilish va chek chiqarish', category: "Moliya" },
  { id: 'finance.expense', label: 'Xarajat (chiqim) kiritish', category: "Moliya" },
  { id: 'finance.export', label: 'Moliya va tranzaksiyalarni eksport qilish', category: "Moliya" },
  { id: 'payroll', label: 'Ustoz maoshlari panelini ko\'rish', category: "Moliya" },
  { id: 'payroll.generate', label: 'Ustozlarga oylik maosh hisoblab yaratish', category: "Moliya" },
  { id: 'payroll.pay', label: 'Ustoz maoshlarini to\'lash', category: "Moliya" },
  { id: 'coins', label: 'Tanga tizimi va reytingni ko\'rish', category: "Moliya" },
  { id: 'coins.send', label: 'O\'quvchilarga tanga (coin) berish', category: "Moliya" },
  { id: 'market', label: 'Online Market & Sovg\'alarni boshqarish', category: "Moliya" },

  // CRM & PM
  { id: 'crm', label: 'CRM Pipeline (Lidlar ko\'rish)', category: "CRM & PM" },
  { id: 'crm.edit', label: 'Lidlarni holatini o\'zgartirish', category: "CRM & PM" },
  { id: 'pm', label: 'Kanban Topshiriqlar paneli', category: "CRM & PM" },
  { id: 'faceid', label: 'Face ID Davomat tizimi', category: "CRM & PM" },

  // Boshqaruv & HR
  { id: 'staff', label: 'Xodimlar (HR) ro\'yxatini ko\'rish', category: "Boshqaruv" },
  { id: 'staff.create', label: 'Yangi xodim qo\'shish', category: "Boshqaruv" },
  { id: 'staff.edit', label: 'Xodim ma\'lumotlarini va lavozimini tahrirlash', category: "Boshqaruv" },
  { id: 'staff.delete', label: 'Xodimni bo\'shatish / o\'chirish', category: "Boshqaruv" },
  { id: 'contracts', label: 'Shartnomalar bo\'limini ko\'rish', category: "Boshqaruv" },
  { id: 'contracts.create', label: 'Yangi shartnoma yaratish', category: "Boshqaruv" },
  { id: 'contracts.sign', label: 'Shartnomani imzolash va faollashtirish', category: "Boshqaruv" },
  { id: 'contracts.print', label: 'Shartnomani chop etish (Muhr va Imzo bilan)', category: "Boshqaruv" },
  { id: 'notifications', label: 'Xabarnomalar jo\'natish', category: "Boshqaruv" },
  { id: 'reports', label: 'Analitik hisobotlarni ko\'rish', category: "Boshqaruv" },
  { id: 'settings', label: 'Sozlamalar va integratsiyalar', category: "Boshqaruv" },
  { id: 'roles', label: 'Rollar va Huquqlarni boshqarish (Super Admin)', category: "Boshqaruv" },

  // Maxsus Amallar
  { id: 'admin.override', label: "Favqulodda admin ruxsati (Override)", category: "Maxsus Amallar" },
  { id: 'audit.logs', label: "Tizim audit va tranzaksiya tarixini o'qish", category: "Maxsus Amallar" },
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

[];

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
        // Exact match
        if (role.permissions.includes(permissionId)) return true;
        // Granular prefix match (e.g., checking 'attendance' matches 'attendance.view')
        if (role.permissions.some(p => p.startsWith(`${permissionId}.`))) return true;
        // Parent match (e.g., checking 'attendance.view' matches 'attendance')
        if (role.permissions.some(p => permissionId.startsWith(`${p}.`))) return true;
        return false;
      },
    }),
    { name: 'brain_role_store_v2' }
  )
);
