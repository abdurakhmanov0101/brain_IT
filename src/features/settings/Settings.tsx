import React, { useState } from 'react';
import {
  User, Bell, Shield, Palette, Globe, Moon, Sun, Save,
  Camera, Key, Eye, EyeOff, CheckCircle, Smartphone, Monitor,
  Volume2, VolumeX, Mail, Lock, Trash2, LogOut, ChevronRight,
  ToggleLeft, ToggleRight, Languages,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security' | 'language';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profil',       icon: User },
  { id: 'appearance',    label: "Ko'rinish",     icon: Palette },
  { id: 'notifications', label: 'Xabarnomalar', icon: Bell },
  { id: 'language',      label: 'Til',           icon: Languages },
  { id: 'security',      label: 'Xavfsizlik',   icon: Shield },
];

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }> = ({ value, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
    <div>
      <p className="text-sm font-semibold text-slate-800 dark:text-white">{label}</p>
      {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${value ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export const Settings: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { darkMode, setDarkMode, language, setLanguage } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState('admin@brainit.uz');
  const [phone, setPhone] = useState('+998 90 123 45 67');

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifReport, setNotifReport] = useState(true);
  const [notifSound, setNotifSound] = useState(true);

  // Security
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Sozlamalar</h1>
        <p className="text-sm text-slate-400 mt-1">Profilingiz va tizim sozlamalarini boshqaring</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar tabs */}
        <aside className="lg:w-56 shrink-0">
          <nav className="space-y-1 glass rounded-2xl p-3 border border-white/60 dark:border-white/8 shadow-sm">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {activeTab === id && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right content */}
        <div className="flex-1 glass rounded-2xl border border-white/60 dark:border-white/8 shadow-sm p-6 lg:p-8">

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-6">Profil ma'lumotlari</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  <img
                    src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff&bold=true&size=80`}
                    alt={currentUser.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500/30 shadow-lg"
                  />
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center shadow-md hover:bg-brand-600 transition-colors">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-sm text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wide mt-0.5">{currentUser.role}</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG yoki GIF. Max 2MB</p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">To'liq ism</label>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Rol</label>
                  <input
                    value={currentUser.role}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Telefon</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className={`mt-8 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/30 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {saved ? <><CheckCircle className="h-4 w-4" /> Saqlandi!</> : <><Save className="h-4 w-4" /> Saqlash</>}
              </button>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-6">Ko'rinish sozlamalari</h2>

              {/* Theme */}
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Mavzu</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                      !darkMode ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {!darkMode && <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center"><CheckCircle className="h-3 w-3 text-white" /></div>}
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <Sun className="h-6 w-6 text-amber-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Yorug'</span>
                  </button>

                  <button
                    onClick={() => setDarkMode(true)}
                    className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                      darkMode ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {darkMode && <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center"><CheckCircle className="h-3 w-3 text-white" /></div>}
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-sm">
                      <Moon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Qorong'i</span>
                  </button>
                </div>
              </div>

              {/* Display */}
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Interfeys</p>
                <div className="space-y-0">
                  <Toggle value={true} onChange={() => {}} label="Animatsiyalar" desc="Sahifa o'tish animatsiyalarini ko'rsatish" />
                  <Toggle value={true} onChange={() => {}} label="Siqilgan menyu" desc="Sidebar menyu collapse bo'lsin" />
                  <Toggle value={false} onChange={() => {}} label="Kompakt rejim" desc="Elementlar orasidagi bo'shliqni kamaytirish" />
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-6">Xabarnoma sozlamalari</h2>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kanal</p>
                  <div className="bg-slate-50 dark:bg-white/3 rounded-2xl px-5">
                    <Toggle value={notifEmail} onChange={setNotifEmail} label="Email xabarnomalar" desc="Muhim yangiliklar emailga yuborilsin" />
                    <Toggle value={notifSms} onChange={setNotifSms} label="SMS xabarnomalar" desc="To'lov va davomat eslatmalari" />
                    <Toggle value={notifPush} onChange={setNotifPush} label="Push xabarnomalar" desc="Brauzer orqali real-vaqt xabarlar" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Turlari</p>
                  <div className="bg-slate-50 dark:bg-white/3 rounded-2xl px-5">
                    <Toggle value={notifPayment} onChange={setNotifPayment} label="To'lov eslatmalari" desc="Har oylik to'lov muddati kelganda" />
                    <Toggle value={notifReport} onChange={setNotifReport} label="Hisobot tayyor" desc="Oylik hisobotlar tayyorlanganda" />
                    <Toggle value={notifSound} onChange={setNotifSound}
                      label={notifSound ? "🔔 Ovozli xabarnomalar" : "🔕 Ovozli xabarnomalar"}
                      desc="Xabar kelganda tovush chiqsin"
                    />
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className={`mt-8 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${saved ? 'bg-emerald-500 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/30'}`}>
                {saved ? <><CheckCircle className="h-4 w-4" /> Saqlandi!</> : <><Save className="h-4 w-4" /> Saqlash</>}
              </button>
            </div>
          )}

          {/* ── LANGUAGE ── */}
          {activeTab === 'language' && (
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-6">Til sozlamalari</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Tizim interfeysi uchun tilni tanlang</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { code: 'uz', label: "O'zbek", flag: '🇺🇿', desc: "O'zbek tili" },
                  { code: 'ru', label: 'Русский', flag: '🇷🇺', desc: 'Rus tili' },
                  { code: 'en', label: 'English', flag: '🇬🇧', desc: 'Ingliz tili' },
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code as 'uz' | 'ru' | 'en')}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${
                      language === l.code
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-white/20'
                    }`}
                  >
                    {language === l.code && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <span className="text-4xl">{l.flag}</span>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{l.label}</p>
                      <p className="text-xs text-slate-400">{l.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-6">Xavfsizlik sozlamalari</h2>

              {/* Password change */}
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Parolni o'zgartirish</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Joriy parol</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showOld ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                      <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Yangi parol</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className={`mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${saved ? 'bg-emerald-500 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/30'}`}
                >
                  {saved ? <><CheckCircle className="h-4 w-4" /> Yangilandi!</> : <><Key className="h-4 w-4" /> Parolni yangilash</>}
                </button>
              </div>

              {/* 2FA */}
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Ikki bosqichli tasdiqlash</p>
                <div className="bg-slate-50 dark:bg-white/3 rounded-2xl px-5">
                  <Toggle
                    value={twoFactor}
                    onChange={setTwoFactor}
                    label="2FA yoqish"
                    desc="Har kirishda SMS yoki authenticator orqali tasdiqlash"
                  />
                </div>
              </div>

              {/* Sessions */}
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Faol seanslar</p>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome — Windows 11', location: 'Toshkent, UZ', time: 'Hozir faol', current: true },
                    { device: 'Safari — iPhone 15', location: 'Toshkent, UZ', time: '2 soat oldin', current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            {s.device}
                            {s.current && <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Joriy</span>}
                          </p>
                          <p className="text-xs text-slate-400">{s.location} · {s.time}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <button className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline transition-colors">Yakunlash</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
