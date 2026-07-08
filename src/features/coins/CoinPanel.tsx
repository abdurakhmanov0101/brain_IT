import React, { useState } from 'react';
import {
  Coins, Send, History, Award, Zap, Shield, Search,
  CheckCircle2, TrendingUp, TrendingDown, Gift, BookOpen,
  Star, ArrowUpRight, ArrowDownRight, Users, Clock
} from 'lucide-react';
import { useCoinStore } from '../../stores/coinStore';
import { useAuthStore } from '../../stores/authStore';
import { useStudentStore } from '../../stores/studentStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useUIStore } from '../../stores/uiStore';

// Coin rules data
const COIN_RULES = [
  {
    icon: BookOpen,
    color: 'emerald',
    title: "Uy vazifasi bahosiga qarab",
    rules: [
      { label: "95 ball va undan yuqori", coins: 3, emoji: "🥇" },
      { label: "85 ball va undan yuqori", coins: 2, emoji: "🥈" },
      { label: "65 ball va undan yuqori", coins: 1, emoji: "🥉" },
      { label: "65 balldan past", coins: 0, emoji: "❌", negative: true },
    ]
  },
  {
    icon: Star,
    color: 'blue',
    title: "Darsda faol ishtirok",
    rules: [
      { label: "Eng faol o'quvchi (ustoz beradi)", coins: 5, emoji: "⭐" },
      { label: "Savol bergan / javob topgan", coins: 2, emoji: "💡" },
    ]
  },
  {
    icon: CheckCircle2,
    color: 'teal',
    title: "Davomat va boshqalar",
    rules: [
      { label: "Videoni to'liq ko'rdi (belgiladi)", coins: 1, emoji: "📺" },
      { label: "Oylik to'lovni o'z vaqtida to'lash", coins: 0, note: "5% keshbek", emoji: "💳" },
    ]
  },
  {
    icon: Gift,
    color: 'amber',
    title: "Marketda sarflash",
    rules: [
      { label: "Sovg'alar va chegirmalar", coins: null, emoji: "🎁" },
      { label: "Kitoblar va o'quv materiali", coins: null, emoji: "📚" },
    ]
  }
];

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
  blue: 'bg-blue-100 text-emerald-600 dark:bg-blue-900/30 dark:text-emerald-400 border-blue-200 dark:border-blue-900/50',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-900/50',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
};

export const CoinPanel: React.FC = () => {
  const { balances, transactions, sendCoins } = useCoinStore();
  const { currentUser } = useAuthStore();
  const { students } = useStudentStore();
  const { teachers } = useTeacherStore();
  const { addToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState<'rules' | 'leaderboard'>('rules');

  if (!currentUser) return null;
  const myBalance = balances[currentUser.id] || 0;
  const isAdmin = currentUser.role === 'Super Admin' || currentUser.role === 'Academy Director';
  const isTeacher = currentUser.role === 'Teacher';

  const allUsers = [
    ...students.map(s => ({ id: s.id, name: s.fullName, role: "O'quvchi" })),
    ...teachers.map(t => ({ id: t.id, name: t.fullName, role: 'Ustoz' }))
  ];

  const filteredUsers = search.length > 1
    ? allUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleSend = () => {
    if (!selectedUser || !amount || Number(amount) <= 0 || !reason) {
      addToast({ type: 'error', message: "Barcha maydonlarni to'g'ri to'ldiring" });
      return;
    }
    sendCoins(currentUser.id, currentUser.name, selectedUser.id, selectedUser.name, Number(amount), reason);
    addToast({ type: 'success', message: `${amount} 🪙 tanga muvaffaqiyatli yuborildi!` });
    setAmount('');
    setReason('');
    setSelectedUser(null);
    setSearch('');
  };

  const myTransactions = transactions
    .filter(t => t.fromId === currentUser.id || t.toId === currentUser.id)
    .slice(0, 30);

  // Leaderboard: top students by balance
  const leaderboard = students
    .map(s => ({ name: s.fullName, balance: balances[s.id] || 0 }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);

  const earned = myTransactions.filter(t => t.toId === currentUser.id).reduce((s, t) => s + t.amount, 0);
  const spent = myTransactions.filter(t => t.fromId === currentUser.id).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-8 text-white shadow-2xl shadow-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-xl">
              <Coins className="h-12 w-12 text-white" />
            </div>
            <div>
              <p className="text-amber-100/80 font-semibold mb-1 uppercase tracking-widest text-xs">Mening Tangalarim</p>
              <h1 className="font-black text-5xl lg:text-6xl tracking-tight">
                {myBalance.toLocaleString()}
                <span className="text-2xl text-amber-200 ml-2 font-bold">🪙</span>
              </h1>
              <p className="text-white/60 text-sm mt-1">{currentUser.name} · {currentUser.role}</p>
            </div>
          </div>

          {/* Stats mini */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
              <div className="flex items-center gap-1 justify-center text-emerald-300 mb-1">
                <ArrowDownRight className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Tushgan</span>
              </div>
              <p className="font-black text-xl">+{earned.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
              <div className="flex items-center gap-1 justify-center text-rose-300 mb-1">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Ketgan</span>
              </div>
              <p className="font-black text-xl">-{spent.toLocaleString()}</p>
            </div>
          </div>

          {isTeacher && (
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-300" />
              <span className="text-sm font-semibold">Auto-Refill yoniq!</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Send (left) + Rules/Leaderboard (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- SEND COINS (Admin/Teacher) --- */}
        {(isAdmin || isTeacher) && (
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <Send className="h-5 w-5 text-amber-500" /> Tanga Yuborish
            </h3>

            <div className="space-y-4">
              {/* Receiver search */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Qabul qiluvchi</label>
                {selectedUser ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-200 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-sm">
                        {selectedUser.name[0]}
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">{selectedUser.name}</span>
                    </div>
                    <button
                      onClick={() => { setSelectedUser(null); setSearch(''); }}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 bg-rose-100 dark:bg-rose-500/20 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Ism bo'yicha izlang..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-sm"
                      />
                    </div>
                    {search.length > 1 && (
                      <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 absolute left-0 right-0 mx-0">
                        {filteredUsers.length === 0 ? (
                          <p className="p-4 text-sm text-slate-500 text-center">Hech kim topilmadi</p>
                        ) : (
                          filteredUsers.map(u => (
                            <button
                              key={u.id}
                              onClick={() => setSelectedUser(u)}
                              className="w-full text-left px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex justify-between items-center border-b border-slate-100 dark:border-slate-800 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-sm">
                                  {u.name[0]}
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-white text-sm">{u.name}</span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                {u.role}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Miqdor 🪙</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white font-black text-2xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-center"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sabab</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Masalan: Uy vazifasi uchun"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setAmount(String(n))}
                    className="py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold text-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-amber-200 dark:border-amber-900/50"
                  >
                    +{n} 🪙
                  </button>
                ))}
              </div>

              <button
                onClick={handleSend}
                disabled={!selectedUser || !amount || !reason}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" /> Yuborish
              </button>
            </div>
          </div>
        )}

        {/* --- RIGHT PANEL: Rules + Leaderboard --- */}
        <div className={`${isAdmin || isTeacher ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-5`}>

          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'rules' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
            >
              <Award className="h-4 w-4" /> Tanga Qoidalari
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'leaderboard' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
            >
              <TrendingUp className="h-4 w-4" /> Reyting
            </button>
          </div>

          {activeTab === 'rules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COIN_RULES.map((section, i) => {
                const Icon = section.icon;
                const colors = colorMap[section.color];
                return (
                  <div key={i} className="bg-white dark:bg-slate-800/50 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold mb-4 border ${colors}`}>
                      <Icon className="h-4 w-4" />
                      {section.title}
                    </div>
                    <ul className="space-y-3">
                      {section.rules.map((rule, j) => (
                        <li key={j} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="text-base">{rule.emoji}</span>
                            <span>{rule.label}</span>
                          </div>
                          {rule.coins !== null && rule.coins !== undefined ? (
                            <span className={`text-sm font-black shrink-0 ${rule.negative ? 'text-rose-500' : 'text-amber-500'}`}>
                              {rule.negative ? '0 🪙' : `+${rule.coins} 🪙`}
                            </span>
                          ) : rule.note ? (
                            <span className="text-xs font-bold text-teal-500 shrink-0">{rule.note}</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 shrink-0">Market</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" /> O'quvchilar Reytingi (Top 10)
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {leaderboard.map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${i === 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl font-black text-sm shrink-0 ${
                      i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-white' :
                      i === 2 ? 'bg-orange-300 text-white' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>
                    <span className="flex-1 font-semibold text-slate-800 dark:text-white text-sm truncate">{item.name}</span>
                    <span className="font-black text-amber-500 text-sm shrink-0">{item.balance.toLocaleString()} 🪙</span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    Hali ma'lumot yo'q
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700/50">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-500" /> Tranzaksiya Tarixi
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
            So'nggi {myTransactions.length} ta
          </span>
        </div>

        {myTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Hali hech qanday amaliyot yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {myTransactions.map(tx => {
              const isIncoming = tx.toId === currentUser.id;
              return (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIncoming ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                    {isIncoming
                      ? <ArrowDownRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      : <ArrowUpRight className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {isIncoming ? tx.fromName : tx.toName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tx.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-base font-black ${isIncoming ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isIncoming ? '+' : '-'}{tx.amount} 🪙
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(tx.date).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
