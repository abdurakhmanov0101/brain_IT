import React, { useState } from 'react';
import { Users, Plus, Search, Phone, Edit2, Trash2, KeyRound, Copy, DollarSign, Briefcase } from 'lucide-react';
import { useStaffStore, type Staff } from '../../stores/staffStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Modal } from '../../components/Modal';

type FormState = Omit<Staff, 'id' | 'username' | 'password'>;

const emptyForm: FormState = {
  fullName: '', phone: '', role: 'Menejer', fixedSalary: 0, salaryBalance: 0, hiredDate: new Date().toISOString().split('T')[0]
};

export const StaffModule: React.FC = () => {
  const { staffList, addStaff, updateStaff, deleteStaff } = useStaffStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showCredentials, setShowCredentials] = useState<string | null>(null);

  if (currentUser?.role !== 'Academy Director' && currentUser?.role !== 'Super Admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <h2 className="text-xl font-bold text-slate-500">Bu sahifaga kirish huquqingiz yo'q</h2>
      </div>
    );
  }

  const filteredStaff = staffList.filter((s) => s.fullName.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));
  const totalSalary = staffList.reduce((s, st) => s + st.fixedSalary, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || form.fixedSalary <= 0) {
      addToast({ type: 'error', message: "Barcha maydonlarni to'g'ri to'ldiring" });
      return;
    }
    
    if (editOpen) {
      updateStaff(editOpen, form);
      addToast({ type: 'success', message: 'Xodim yangilandi' });
    } else {
      addStaff(form);
      addToast({ type: 'success', message: "Yangi xodim qo'shildi! Login/Parolni ko'rish uchun 🔑 tugmasini bosing." });
    }
    
    setAddOpen(false);
    setEditOpen(null);
    setForm(emptyForm);
  };

  const openEdit = (s: Staff) => {
    setForm({ fullName: s.fullName, phone: s.phone, role: s.role, fixedSalary: s.fixedSalary, salaryBalance: s.salaryBalance, hiredDate: s.hiredDate });
    setEditOpen(s.id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Haqiqatan ham ushbu xodimni o'chirmoqchimisiz?")) {
      deleteStaff(id);
      addToast({ type: 'success', message: "Xodim o'chirildi" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ type: 'success', message: 'Nusxalandi!' });
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] xl:max-w-[1650px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" />
            Xodimlar (HR)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">O'quv markazi xodimlari va ularning maoshlarini boshqarish</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
          <Plus className="h-5 w-5" /> Yangi Xodim
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-400 transition-colors">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
          <Users className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jami Xodimlar</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{staffList.length} ta</p>
        </div>
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-400 transition-colors">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <DollarSign className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jami Oylik Fond</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{totalSalary.toLocaleString()} so'm</p>
        </div>
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 relative overflow-hidden group hover:border-amber-400 transition-colors">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
          <Briefcase className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lavozimlar</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{new Set(staffList.map(s => s.role)).size} xil</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border p-5 relative overflow-hidden">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input type="text" placeholder="Xodimlarni ism yoki raqam bo'yicha qidirish..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">F.I.SH.</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lavozimi</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefon</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Oylik Maoshi</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joriy Balansi</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Login</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((s) => (
                <React.Fragment key={s.id}>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xs">
                          {s.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{s.fullName}</p>
                          <p className="text-[11px] text-slate-400">{s.hiredDate} dan</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">{s.role}</span></td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{s.phone}</td>
                    <td className="py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">{s.fixedSalary.toLocaleString()} so'm</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${s.salaryBalance > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {s.salaryBalance.toLocaleString()} so'm
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => setShowCredentials(showCredentials === s.id ? null : s.id)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors" title="Login/Parolni ko'rish">
                        <KeyRound className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                  {showCredentials === s.id && (
                    <tr className="bg-amber-50 dark:bg-amber-900/10">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold">Login:</span>
                            <code className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg font-mono text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">{s.username}</code>
                            <button onClick={() => copyToClipboard(s.username)} className="p-1 text-slate-400 hover:text-indigo-500"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold">Parol:</span>
                            <code className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg font-mono text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700">{s.password}</code>
                            <button onClick={() => copyToClipboard(s.password)} className="p-1 text-slate-400 hover:text-indigo-500"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Xodimlar topilmadi</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={addOpen || !!editOpen} onClose={() => { setAddOpen(false); setEditOpen(null); }} title={editOpen ? "Xodimni Tahrirlash" : "Yangi Xodim Qo'shish"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">F.I.SH.</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="+998" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lavozimi</label>
              <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Menejer, Farrosh..." required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Oylik Maoshi (so'm)</label>
              <input type="number" value={form.fixedSalary} onChange={(e) => setForm({ ...form, fixedSalary: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" min="0" required />
            </div>
          </div>
          {!editOpen && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 font-medium">
              <KeyRound className="w-4 h-4 inline mr-1" /> Xodimga avtomatik tarzda Login va Parol yaratiladi. Ularni jadvaldan ko'rishingiz mumkin.
            </div>
          )}
          <div className="flex justify-end pt-2 gap-3">
            <button type="button" onClick={() => { setAddOpen(false); setEditOpen(null); }} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm">Bekor qilish</button>
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 text-sm">Saqlash</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
