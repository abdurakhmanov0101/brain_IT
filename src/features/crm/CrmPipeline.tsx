import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, Trash2, X, Phone, Mail, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useCourseStore } from '../../stores/courseStore';
import { useContractStore } from '../../stores/contractStore';
import { useUIStore } from '../../stores/uiStore';
import { Modal } from '../../components/Modal';
import type { Lead } from '../../data/mockData';

const STAGES: { key: Lead['status']; label: string; color: string }[] = [
  { key: 'new',        label: 'Yangi Lead',  color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  { key: 'contacted',  label: "Bog'lanildi", color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { key: 'interested', label: 'Qiziqish',    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  { key: 'demo',       label: 'Demo',        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { key: 'trial',      label: 'Sinov',       color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { key: 'enrolled',   label: "Ro'yxatdan",  color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  { key: 'contract',   label: 'Shartnoma',   color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
];

const SOURCES = ['Instagram', 'Telegram', 'Facebook', 'Website', 'Referral', 'YouTube'];

interface Props { leadsList: Lead[]; setLeadsList: React.Dispatch<React.SetStateAction<Lead[]>>; }

export const CrmPipeline: React.FC<Props> = ({ leadsList, setLeadsList }) => {
  const { students } = useStudentStore();
  const { courses } = useCourseStore();
  const { addContract } = useContractStore();
  const { addToast } = useUIStore();
  const [addOpen, setAddOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'Instagram', courseInterest: '', value: '', notes: '' });

  const stageLeads = (key: Lead['status']) => leadsList.filter((l) => l.status === key);
  const stageIdx = (key: Lead['status']) => STAGES.findIndex((s) => s.key === key);

  const moveLead = (id: string, dir: 1 | -1) => {
    setLeadsList((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const next = stageIdx(l.status) + dir;
      if (next < 0 || next >= STAGES.length) return l;
      return { ...l, status: STAGES[next].key };
    }));
  };

  const deleteLead = (id: string) => { setLeadsList((p) => p.filter((l) => l.id !== id)); setDetailLead(null); addToast({ type: 'warning', message: "Lead o'chirildi" }); };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { addToast({ type: 'error', message: 'Ism va telefon kiritilishi shart' }); return; }
    setLeadsList((p) => [...p, { id: `ld_${Date.now()}`, ...form, status: 'new', date: new Date().toISOString().split('T')[0] }]);
    addToast({ type: 'success', message: `${form.name} CRM ga qo'shildi` });
    setForm({ name: '', phone: '', email: '', source: 'Instagram', courseInterest: '', value: '', notes: '' });
    setAddOpen(false);
  };

  const handleConvert = (lead: Lead) => {
    const s = students.find((s) => s.phone === lead.phone);
    const c = courses.find((c) => c.name.toLowerCase().includes((lead.courseInterest ?? '').toLowerCase()));
    if (s && c) {
      const start = new Date().toISOString().split('T')[0];
      const end = new Date(Date.now() + 90 * 864e5).toISOString().split('T')[0];
      addContract({ studentId: s.id, courseId: c.id, startDate: start, endDate: end, totalPrice: c.monthlyPrice * 3, status: 'active' });
      moveLead(lead.id, 1); setDetailLead(null);
      addToast({ type: 'success', message: `${lead.name} o'quvchiga aylantirildi` });
    } else addToast({ type: 'warning', message: `${lead.name} tizimda topilmadi — qo'lda ro'yxatdan o'tkazing` });
  };

  const totalValue = leadsList.filter((l) => l.status !== 'archived').reduce((s, l) => s + (parseInt(l.value.replace(/,/g, '')) || 0), 0);
  const converted = leadsList.filter((l) => l.status === 'enrolled' || l.status === 'contract').length;
  const convRate = leadsList.length > 0 ? Math.round((converted / leadsList.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">CRM Pipeline</h1><p className="text-sm text-slate-500 dark:text-slate-400">Lidlarni boshqarish va konversiya kuzatuvi</p></div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"><Plus className="h-4 w-4" /> Yangi Lead</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ label: 'Jami leadlar', val: leadsList.filter((l) => l.status !== 'archived').length, icon: Users, c: 'text-indigo-500' }, { label: 'Pipeline qiymati', val: `${(totalValue / 1e6).toFixed(1)}M`, icon: DollarSign, c: 'text-emerald-500' }, { label: 'Konversiya', val: `${convRate}%`, icon: TrendingUp, c: 'text-amber-500' }, { label: 'Faol leadlar', val: leadsList.filter((l) => l.status !== 'archived' && l.status !== 'contract').length, icon: Target, c: 'text-purple-500' }].map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-4"><s.icon className={`h-5 w-5 ${s.c} mb-2`} /><p className="font-black text-xl text-slate-900 dark:text-white">{s.val}</p><p className="text-xs text-slate-400 mt-0.5">{s.label}</p></div>
        ))}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${STAGES.length * 240}px` }}>
          {STAGES.map((stage) => {
            const sLeads = stageLeads(stage.key);
            return (
              <div key={stage.key} className="flex-1 min-w-[220px]">
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${stage.color}`}>{stage.label}</div>
                  <span className="text-xs font-bold text-slate-500">{sLeads.length}</span>
                </div>
                <div className="space-y-2">
                  {sLeads.map((lead) => {
                    const idx = stageIdx(lead.status);
                    return (
                      <div key={lead.id} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setDetailLead(lead)}>
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{lead.name}</p>
                          <button onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                        {lead.courseInterest && <p className="text-xs text-slate-400 mt-1 truncate">{lead.courseInterest}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">{lead.source}</span>
                          {lead.value && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{lead.value}</span>}
                        </div>
                        <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                          {idx > 0 && <button onClick={() => moveLead(lead.id, -1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronLeft className="h-3.5 w-3.5" /></button>}
                          {idx < STAGES.length - 1 && <button onClick={() => moveLead(lead.id, 1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronRight className="h-3.5 w-3.5" /></button>}
                        </div>
                      </div>
                    );
                  })}
                  {sLeads.length === 0 && <div className="h-16 rounded-xl border border-dashed border-slate-200 dark:border-dark-border flex items-center justify-center text-xs text-slate-300 dark:text-slate-600">Bo'sh</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yangi Lead" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          {[{ l: 'Ism familya *', k: 'name', p: 'Jahongir Olimov' }, { l: 'Telefon *', k: 'phone', p: '+998901234567' }, { l: 'Email', k: 'email', p: 'email@mail.uz' }, { l: 'Qiziqish kursi', k: 'courseInterest', p: 'Frontend Development' }, { l: "Qiymat (so'm)", k: 'value', p: '1,200,000' }].map(({ l, k, p }) => (
            <div key={k}><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{l}</label><input value={form[k as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} placeholder={p} className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          ))}
          <div><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Manba</label><select value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">{SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="flex gap-3"><button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button><button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">Qo'shish</button></div>
        </form>
      </Modal>

      {detailLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40" onClick={() => setDetailLead(null)}>
          <div className="w-full max-w-sm h-full bg-white dark:bg-dark-card shadow-2xl p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Lead Ma'lumotlari</h3><button onClick={() => setDetailLead(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button></div>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-3">
                <p className="font-bold text-lg text-slate-800 dark:text-white">{detailLead.name}</p>
                {detailLead.phone && <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Phone className="h-4 w-4 shrink-0" />{detailLead.phone}</div>}
                {detailLead.email && <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Mail className="h-4 w-4 shrink-0" />{detailLead.email}</div>}
              </div>
              <div className="space-y-2 text-sm">
                {[['Manba', detailLead.source], ['Kurs', detailLead.courseInterest ?? '—'], ['Qiymat', `${detailLead.value} so'm`], ['Sana', detailLead.date]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between"><span className="text-slate-400">{l as string}:</span><span className="font-semibold text-slate-800 dark:text-white">{v as string}</span></div>
                ))}
              </div>
              {detailLead.notes && <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">{detailLead.notes}</div>}
              <div className="space-y-2 pt-4">
                {(detailLead.status === 'enrolled' || detailLead.status === 'contract') && (
                  <button onClick={() => handleConvert(detailLead)} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">O'quvchiga aylantirish</button>
                )}
                <div className="flex gap-2">
                  {stageIdx(detailLead.status) > 0 && <button onClick={() => { moveLead(detailLead.id, -1); setDetailLead(null); }} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-dark-border text-sm text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1"><ChevronLeft className="h-4 w-4" /> Orqaga</button>}
                  {stageIdx(detailLead.status) < STAGES.length - 1 && <button onClick={() => { moveLead(detailLead.id, 1); setDetailLead(null); }} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-1">Oldinga <ChevronRight className="h-4 w-4" /></button>}
                </div>
                <button onClick={() => deleteLead(detailLead.id)} className="w-full py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20">O'chirish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
