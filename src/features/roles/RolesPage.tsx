import React, { useState } from 'react';
import { Shield, Plus, Check, Trash2, Edit3, Lock, Users, CheckSquare, Square, AlertCircle, Info } from 'lucide-react';
import { useRoleStore, ALL_PERMISSIONS, type Role } from '../../stores/roleStore';
import { useUIStore } from '../../stores/uiStore';
import { Modal } from '../../components/Modal';

export const RolesPage: React.FC = () => {
  const { roles, addRole, updateRole, deleteRole } = useRoleStore();
  const { addToast } = useUIStore();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'r_superadmin');
  const [addOpen, setAddOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const categories: Array<"Ta'lim" | "Moliya" | "CRM & PM" | "Boshqaruv" | "Maxsus Amallar"> = [
    "Ta'lim", "Moliya", "CRM & PM", "Boshqaruv", "Maxsus Amallar"
  ];

  const handleTogglePermission = (permId: string) => {
    if (!selectedRole) return;
    if (selectedRole.name === 'Super Admin') {
      addToast({ type: 'warning', message: 'Super Admin huquqlarini o\'zgartirib bo\'lmaydi!' });
      return;
    }

    const currentPerms = selectedRole.permissions;
    const exists = currentPerms.includes(permId);
    const updated = exists
      ? currentPerms.filter(id => id !== permId)
      : [...currentPerms, permId];

    updateRole(selectedRole.id, { permissions: updated });
    addToast({
      type: 'success',
      message: exists
        ? `${selectedRole.name} roliga huquq bekor qilindi`
        : `${selectedRole.name} roliga huquq berildi`
    });
  };

  const handleSelectCategoryAll = (category: string, select: boolean) => {
    if (!selectedRole || selectedRole.name === 'Super Admin') return;
    const catPermIds = ALL_PERMISSIONS.filter(p => p.category === category).map(p => p.id);
    let updated: string[];
    if (select) {
      updated = Array.from(new Set([...selectedRole.permissions, ...catPermIds]));
    } else {
      updated = selectedRole.permissions.filter(id => !catPermIds.includes(id));
    }
    updateRole(selectedRole.id, { permissions: updated });
    addToast({ type: 'info', message: `${category} bo'limi huquqlari yangilandi` });
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    addRole({
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Yangi tizim foydalanuvchisi lavozimi',
      permissions: ['dashboard'],
    });
    addToast({ type: 'success', message: `${newRoleName} roli muvaffaqiyatli yaratildi!` });
    setNewRoleName('');
    setNewRoleDesc('');
    setAddOpen(false);
  };

  const handleDeleteRole = (id: string, name: string) => {
    if (confirm(`${name} rolini o'chirmoqchimisiz?`)) {
      deleteRole(id);
      addToast({ type: 'warning', message: `${name} roli o'chirildi` });
      if (selectedRoleId === id) setSelectedRoleId(roles[0]?.id || '');
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 p-8 text-white shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" /> Super Admin Boshqaruvi
          </div>
          <h1 className="font-heading font-black text-3xl lg:text-4xl">Rollar va Huquqlar paneli</h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Tizimdagi lavozimlar (O'qituvchi, Moderator, Kassir, Operator, Assistent v.h.k.) uchun qaysi bo'limlar ko'rinishi
            va qanday amallarni bajara olishini ptichka (checkbox) orqali 100% moslash.
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-700 font-bold text-sm hover:bg-white/90 rounded-2xl transition-all shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="h-5 w-5" /> Yangi rol qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Role List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-2 mb-1">
            <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" /> Tizim rollari ({roles.length})
            </h3>
            <span className="text-xs text-slate-400">Lavozimni tanlang</span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
            {roles.map(role => {
              const isSelected = role.id === selectedRoleId;
              const permCount = role.permissions.length;
              const totalPerms = ALL_PERMISSIONS.length;
              const pct = Math.round((permCount / totalPerms) * 100);

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-md'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{role.name}</h4>
                        {role.isSystem && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" /> Asosiy
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-normal">
                        {role.description}
                      </p>
                    </div>

                    {!role.isSystem && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id, role.name); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Progress bar of permissions */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Huquqlar: {permCount} / {totalPerms} ({pct}%)
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {role.userCount} kishi
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Checkbox Permissions Matrix */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          {selectedRole ? (
            <>
              {/* Header for selected role */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                      {selectedRole.name} <span className="text-indigo-600 dark:text-indigo-400 font-normal text-lg">huquqlari</span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ptichkalarni qo'yish yoki olib tashlash orqali ushbu roldagilar nimani ko'rishi va nima qila olishini boshqaring.
                  </p>
                </div>

                {selectedRole.name === 'Super Admin' && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    <Lock className="h-4 w-4 shrink-0" />
                    Super Admin barcha huquqlarga mutlaqo ega
                  </div>
                )}
              </div>

              {/* Categories and permissions */}
              <div className="space-y-6 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map(cat => {
                  const perms = ALL_PERMISSIONS.filter(p => p.category === cat);
                  const allSelected = perms.every(p => selectedRole.permissions.includes(p.id));

                  return (
                    <div key={cat} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60">
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block" />
                          {cat}
                        </h4>

                        {selectedRole.name !== 'Super Admin' && (
                          <button
                            onClick={() => handleSelectCategoryAll(cat, !allSelected)}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                          >
                            {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                            {allSelected ? "Barchasini olib tashlash" : "Barchasini tanlash"}
                          </button>
                        )}
                      </div>

                      {/* Checkboxes grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perms.map(perm => {
                          const isChecked = selectedRole.permissions.includes(perm.id);
                          const isDisabled = selectedRole.name === 'Super Admin';

                          return (
                            <label
                              key={perm.id}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isDisabled) handleTogglePermission(perm.id);
                              }}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-500 shadow-sm'
                                  : 'bg-white/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60 hover:opacity-100'
                              } ${isDisabled ? 'cursor-not-allowed opacity-90' : ''}`}
                            >
                              <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                isChecked
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                  : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700'
                              }`}>
                                {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-bold leading-tight ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {perm.label}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                  ID: {perm.id}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500">Lavozim tanlanmagan</div>
          )}
        </div>
      </div>

      {/* Add Role Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yangi rol va lavozim qo'shish" size="sm">
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-start gap-2.5 text-xs text-indigo-700 dark:text-indigo-300">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Lavozim qo'shilganidan so'ng, huquqlar panelidan unga kerakli ptichkalarni qo'yib sozlab chiqing.</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Rol nomi (Lavozim)
            </label>
            <input
              required
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Masalan: Moderator, Kassir, Operator, Assistent..."
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Qisqacha vazifasi / ta'rifi
            </label>
            <textarea
              rows={3}
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Tizimda nima ishlarni amalga oshiradi..."
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20"
            >
              Yaratish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
