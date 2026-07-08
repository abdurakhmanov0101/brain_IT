import React from 'react';
import { useStaffStore } from '../../stores/staffStore';
import { useAuthStore } from '../../stores/authStore';
import { DollarSign, Briefcase, Calendar, TrendingUp, Wallet, Clock } from 'lucide-react';

const fmtMoney = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

export const StaffPortal: React.FC = () => {
  const { staffList } = useStaffStore();
  const { currentUser } = useAuthStore();

  const myProfile = staffList.find(s => s.username === currentUser?.name?.toLowerCase() || s.fullName === currentUser?.name);

  if (!myProfile) return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
      <p className="text-lg font-bold text-slate-500">Xodim profili topilmadi</p>
      <p className="text-sm text-slate-400 mt-1">Iltimos, admin bilan bog'laning</p>
    </div>
  );

  const monthlyPay = myProfile.fixedSalary;
  const currentBalance = myProfile.salaryBalance;
  const remaining = monthlyPay - currentBalance;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black border border-white/20">
            {myProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-heading font-black text-3xl mb-1">{myProfile.fullName}</h1>
            <p className="text-emerald-200 flex items-center gap-2 justify-center md:justify-start">
              <Briefcase className="w-4 h-4" /> {myProfile.role}
            </p>
            <p className="text-emerald-300 text-sm flex items-center gap-2 justify-center md:justify-start mt-1">
              <Calendar className="w-3.5 h-3.5" /> {myProfile.hiredDate} dan beri ishlamoqda
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-dark-card border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <DollarSign className="w-8 h-8 text-emerald-500 mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Belgilangan Oylik</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white">{fmtMoney(monthlyPay)}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-2">Har oyda belgilangan summa</p>
        </div>

        <div className="bg-white dark:bg-dark-card border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <Wallet className="w-8 h-8 text-emerald-500 mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Joriy Balans</p>
          <p className="text-3xl font-black text-emerald-600">{fmtMoney(currentBalance)}</p>
          <p className="text-xs text-emerald-500 font-semibold mt-2">Hisobingizga tushgan summa</p>
        </div>

        <div className="bg-white dark:bg-dark-card border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-400 transition-all hover:shadow-lg hover:shadow-amber-500/10">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <Clock className="w-8 h-8 text-amber-500 mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kutilayotgan To'lov</p>
          <p className="text-3xl font-black text-amber-600">{fmtMoney(remaining > 0 ? remaining : 0)}</p>
          <p className="text-xs text-amber-500 font-semibold mt-2">{remaining > 0 ? 'Oy oxirida to\'lanadi' : 'Barcha oylik to\'langan'}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Oylik To'lov Holati</h3>
          <span className="text-sm font-black text-emerald-600">{monthlyPay > 0 ? Math.min(100, Math.round((currentBalance / monthlyPay) * 100)) : 0}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${monthlyPay > 0 ? Math.min(100, (currentBalance / monthlyPay) * 100) : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>To'langan: {fmtMoney(currentBalance)}</span>
          <span>Jami oylik: {fmtMoney(monthlyPay)}</span>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Profil Ma'lumotlari</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ism-sharif</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{myProfile.fullName}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Lavozim</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">{myProfile.role}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Telefon</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{myProfile.phone}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ishga qabul sanasi</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{myProfile.hiredDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
