import React, { useState } from 'react';
import { Bell, Send, MessageCircle, AlertTriangle, CheckCircle, Clock, ChevronRight, X } from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useCourseStore } from '../../stores/courseStore';
import { useUIStore } from '../../stores/uiStore';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

interface NotifRecord {
  id: string; to: string; message: string; channel: 'sms' | 'telegram'; date: string; status: 'sent' | 'failed';
}

const templates = [
  { id: 't1', title: "To'lov eslatmasi (3 kun oldin)", body: "Hurmatli {ism}! Siz uchun {kurs} kursi bo'yicha to'lov muddati {sana}. Balans: {summa}. Brain IT Academy." },
  { id: 't2', title: "Balans kam ogohlantirishi", body: "Hurmatli {ism}! Balansda {summa} qoldi (1 darsdan kam). Iltimos, to'lovni amalga oshiring. Brain IT: +998990670066" },
  { id: 't3', title: "Davomat yo'qligi", body: "Hurmatli ota-ona! Farzandingiz {ism} bugun {guruh} guruhiga kelmadi. Ma'lumot uchun: +998990670066" },
  { id: 't4', title: "Dars bekor qilindi", body: "Hurmatli {ism}! {sana} sanasidagi {guruh} guruhi darsi bekor qilindi. Keyingi dars {keyingi_sana}. Uzr so'raymiz." },
];

const sampleNotifs: NotifRecord[] = [
  { id: 'n1', to: 'Aziz Alimov', message: "To'lov muddati 3 kun qoldi", channel: 'telegram', date: '2026-06-16', status: 'sent' },
  { id: 'n2', to: 'Frontend G-1 guruhi', message: "Balans ogohlantirishi yuborildi (3 ta o'quvchi)", channel: 'sms', date: '2026-06-15', status: 'sent' },
  { id: 'n3', to: 'Malika Sobirova', message: "Davomat yo'qligi — bugun kelmadi", channel: 'telegram', date: '2026-06-14', status: 'sent' },
  { id: 'n4', to: 'Sherzod Umarov', message: "To'lov eslatmasi", channel: 'sms', date: '2026-06-13', status: 'failed' },
];

export const Notifications: React.FC = () => {
  const { students } = useStudentStore();
  const { groups } = useGroupStore();
  const { courses } = useCourseStore();
  const { addToast } = useUIStore();
  const [notifs, setNotifs] = useState<NotifRecord[]>(sampleNotifs);
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());
  const [sendOpen, setSendOpen] = useState(false);
  const [form, setForm] = useState({ targetType: 'student' as 'student' | 'group' | 'all', targetId: '', channel: 'telegram' as 'sms' | 'telegram', message: '', templateId: '' });

  const markRead = (id: string) => {
    setDismissing((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setNotifs((prev) => prev.filter((n) => n.id !== id));
      setDismissing((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }, 400);
  };

  const lowBalStudents = students.filter((s) => {
    const course = courses.find((c) => groups.some((g) => g.courseId === c.id && g.studentIds.includes(s.id)));
    return course && s.balance < course.lessonPrice * 3;
  });

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (t) setForm((f) => ({ ...f, templateId: id, message: t.body }));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message) return;
    const target = form.targetType === 'all' ? "Barcha o'quvchilar" :
      form.targetType === 'group' ? groups.find((g) => g.id === form.targetId)?.name ?? form.targetId :
      students.find((s) => s.id === form.targetId)?.fullName ?? form.targetId;
    const newNotif: NotifRecord = { id: `n${Date.now()}`, to: target, message: form.message, channel: form.channel, date: new Date().toISOString().split('T')[0], status: 'sent' };
    setNotifs((n) => [newNotif, ...n]);
    addToast({ type: 'success', message: `Xabarnoma yuborildi: ${target}` });
    setSendOpen(false);
    setForm({ targetType: 'student', targetId: '', channel: 'telegram', message: '', templateId: '' });
  };

  const sentCount = notifs.filter((n) => n.status === 'sent').length;
  const failedCount = notifs.filter((n) => n.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">Xabarnomalar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">SMS va Telegram orqali bildirishnomalar</p>
        </div>
        <button onClick={() => setSendOpen(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Send className="h-4 w-4" /> Xabarnoma yuborish
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ label: 'Jami yuborilgan', val: notifs.length, color: 'text-slate-900 dark:text-white' }, { label: 'Muvaffaqiyatli', val: sentCount, color: 'text-emerald-600 dark:text-emerald-400' }, { label: 'Muvaffaqiyatsiz', val: failedCount, color: 'text-red-500' }, { label: 'Balans kam', val: lowBalStudents.length, color: 'text-amber-600 dark:text-amber-400' }].map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Avtomatik triggerlar</h3>
        <div className="space-y-3">
          {[
            { icon: AlertTriangle, color: 'text-amber-500', title: "Balans kam ogohlantirishi", desc: `${lowBalStudents.length} ta o'quvchi (3 darsdan kam)`, action: () => { lowBalStudents.forEach((s) => { const n: NotifRecord = { id: `n${Date.now()}_${s.id}`, to: s.fullName, message: `Balansda ${s.balance.toLocaleString()} so'm qoldi`, channel: 'telegram', date: new Date().toISOString().split('T')[0], status: 'sent' }; setNotifs((prev) => [n, ...prev]); }); addToast({ type: 'success', message: `${lowBalStudents.length} ta o'quvchiga xabar yuborildi` }); } },
            { icon: Clock, color: 'text-blue-500', title: "To'lov eslatmasi", desc: "Oylik to'lov muddati yaqinlashganlar", action: () => addToast({ type: 'info', message: "To'lov eslatmalari yuborildi" }) },
            { icon: CheckCircle, color: 'text-emerald-500', title: "Davomat hisoboti", desc: "Haftalik davomat statistikasi", action: () => addToast({ type: 'success', message: 'Davomat hisoboti yuborildi' }) },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
              <button onClick={item.action} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Yuborish <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-dark-border">
          <h3 className="font-semibold text-slate-800 dark:text-white">Yuborilgan xabarnomalar</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-dark-border">
          {notifs.length === 0 && (
            <div className="px-5 py-12 text-center">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm text-slate-400 font-medium">Barcha xabarnomalar o'qildi</p>
            </div>
          )}
          {notifs.map((n) => (
            <div key={n.id}
              className="px-5 py-4 flex items-center gap-4 transition-all duration-400"
              style={{
                opacity: dismissing.has(n.id) ? 0 : 1,
                transform: dismissing.has(n.id) ? 'translateX(40px)' : 'translateX(0)',
              }}>
              <div className={`p-2 rounded-lg shrink-0 ${n.channel === 'telegram' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'bg-green-50 dark:bg-green-900/20 text-green-500'}`}>
                {n.channel === 'telegram' ? <MessageCircle className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{n.to}</p>
                <p className="text-xs text-slate-400 truncate">{n.message}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge label={n.status === 'sent' ? 'Yuborildi' : 'Xato'} color={n.status === 'sent' ? 'green' : 'red'} dot />
                <p className="text-xs text-slate-400 mt-1">{n.date}</p>
              </div>
              <button onClick={() => markRead(n.id)} title="O'qildi"
                className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={sendOpen} onClose={() => setSendOpen(false)} title="Xabarnoma yuborish" size="lg">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Shablon tanlash</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map((t) => (
                <button key={t.id} type="button" onClick={() => applyTemplate(t.id)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-colors ${form.templateId === t.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}>
                  {t.title}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Yuborish turi</label>
              <select value={form.targetType} onChange={(e) => setForm((f) => ({ ...f, targetType: e.target.value as typeof form.targetType, targetId: '' }))}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="student">O'quvchiga</option>
                <option value="group">Guruhga</option>
                <option value="all">Hammaga</option>
              </select>
            </div>
            {form.targetType !== 'all' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{form.targetType === 'student' ? "O'quvchi" : 'Guruh'}</label>
                <select value={form.targetId} onChange={(e) => setForm((f) => ({ ...f, targetId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Tanlang...</option>
                  {form.targetType === 'student' ? students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>) : groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kanal</label>
            <div className="flex gap-3">
              {(['telegram', 'sms'] as const).map((ch) => (
                <button key={ch} type="button" onClick={() => setForm((f) => ({ ...f, channel: ch }))}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${form.channel === ch ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400'}`}>
                  {ch === 'telegram' ? '📱 Telegram' : '📲 SMS'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Xabar matni</label>
            <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4} placeholder="Xabar matnini yozing..."
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            <p className="text-xs text-slate-400 mt-1">{form.message.length} belgi</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setSendOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2">
              <Send className="h-4 w-4" /> Yuborish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
