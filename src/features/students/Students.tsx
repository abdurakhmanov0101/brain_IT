import React, { useState, useMemo, useRef } from 'react';
import { printStudentContractPDF } from '../../utils/printContractPDF';
import { Users, Plus, Search, Phone, AlertTriangle, CreditCard, Copy, CheckCheck, KeyRound, ChevronLeft, ChevronRight, Send, MessageSquare, FileText, Download, PlusCircle, X as XIcon, FileSignature, ShieldCheck, ScrollText } from 'lucide-react';
import { useStudentStore, genStudentUsername, genParentUsername } from '../../stores/studentStore';
import { useGroupStore } from '../../stores/groupStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useTelegramStore } from '../../stores/telegramStore';
import { useContractStore } from '../../stores/contractStore';
import { useCourseStore } from '../../stores/courseStore';
import { Badge, statusBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';

const fmtMoney = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

interface AddStudentForm {
  fullName: string; phone: string; parentPhone: string; parentName: string; groupIds: string[]; teacherId: string; leadSource: string; status: 'active' | 'frozen' | 'left';
}
interface CreatedCreds {
  fullName: string; studentId: string; studentUsername: string; studentPassword: string;
  parentUsername: string; parentPassword: string; parentPhone: string; parentName: string;
}

const CopyField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-2.5">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        <p className="font-mono text-sm font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
      <button onClick={copy} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
        {copied ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

export const Students: React.FC = () => {
  const { students, addStudent, updateStudent, addPayment } = useStudentStore();
  const { groups, addStudentToGroup, removeStudentFromGroup } = useGroupStore();
  const { teachers } = useTeacherStore();
  const { courses } = useCourseStore();
  const { addToast } = useUIStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { isLinked } = useTelegramStore();
  const { contracts, addContract, deleteContract } = useContractStore();
  const isTeacher = currentUser?.role === 'Teacher';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen' | 'left'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<CreatedCreds | null>(null);
  const [addForm, setAddForm] = useState<AddStudentForm>({
    fullName: '', phone: '', parentPhone: '', parentName: '', groupIds: [],
    teacherId: isTeacher ? (currentUser?.id ?? '') : '',
    leadSource: 'Instagram', status: 'active',
  });
  const [payForm, setPayForm] = useState({ amount: '', type: 'cash' as const, note: '' });

  // ─── SMART CONTRACT SYSTEM ────────────────────────────────────────────────
  const [contractStudentId, setContractStudentId] = useState<string | null>(null);
  const [contractOverride, setContractOverride] = useState<{ totalPrice?: string; endDate?: string; status?: 'active' | 'pending' | 'expired' }>({}); 

  const getStudentContract = (studentId: string) => contracts.find(c => c.studentId === studentId);

  /**
   * Berilgan o'quvchi uchun guruh va kursdan avtomatik shartnoma ma'lumotlarini hisoblaydi.
   * 1. O'quvchining birinchi guruhini topadi
   * 2. Guruhning courseId orqali kursni topadi  
   * 3. Kursning durationMonths va monthlyPrice dan sana va narxni hisoblab chiqadi
   */
  const computeContractData = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    // O'quvchining birinchi aktiv guruhini topamiz
    const studentGroup = groups.find(g => student.groupIds.includes(g.id) && g.status !== 'archived');
    if (!studentGroup) return null;

    // Guruhga tegishli kursni topamiz
    const course = courses.find(c => c.id === studentGroup.courseId);
    if (!course) return null;

    // Boshlanish sanasi: guruhning startDate yoki bugun
    const startDate = studentGroup.startDate || new Date().toISOString().split('T')[0];

    // Tugash sanasi: startDate + durationMonths
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + course.durationMonths);
    const endDate = end.toISOString().split('T')[0];

    // Jami narx: oylik narx × oy soni
    const totalPrice = course.monthlyPrice * course.durationMonths;

    return {
      studentGroup,
      course,
      startDate,
      endDate,
      totalPrice,
      durationMonths: course.durationMonths,
      monthlyPrice: course.monthlyPrice,
    };
  };

  const openContractModal = (studentId: string) => {
    setContractStudentId(studentId);
    setContractOverride({});
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractStudentId) return;
    const computed = computeContractData(contractStudentId);
    if (!computed) {
      addToast({ type: 'error', message: "O'quvchi guruhga biriktirilmagan yoki guruh kursi topilmadi!" }); return;
    }
    const endDate = contractOverride.endDate || computed.endDate;
    const totalPrice = Number(contractOverride.totalPrice ?? computed.totalPrice);
    const status = contractOverride.status ?? 'active';

    addContract({
      studentId: contractStudentId,
      courseId: computed.course.id,
      startDate: computed.startDate,
      endDate,
      totalPrice,
      status,
      signedDate: new Date().toISOString().split('T')[0],
    });
    addToast({ type: 'success', message: `Shartnoma yaratildi! Davomiylik: ${computed.durationMonths} oy, Jami: ${totalPrice.toLocaleString()} so'm` });
    setContractStudentId(null);
    setContractOverride({});
  };

  const handleDownloadContract = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const contract = getStudentContract(studentId);
    const course = courses.find(c => c.id === contract?.courseId);
    if (!student || !contract) {
      addToast({ type: 'error', message: "Shartnoma topilmadi!" });
      return;
    }

    const contractNum = (contract as any).contractNumber ?? contract.id.slice(-6).toUpperCase();
    const months = Math.max(1, Math.ceil(
      (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));
    const totalPrice = Number(contract.totalPrice);
    const monthlyPrice = course?.monthlyPrice ?? Math.round(totalPrice / months);
    const lessonPrice = course?.lessonPrice ?? 0;
    const durationMonths = course?.durationMonths ?? months;
    const lessonsPerWeek = course?.lessonsPerWeek ?? 3;

    // Find the student's group for this course
    const studentGroup = groups.find(g =>
      student.groupIds.includes(g.id) && g.courseId === contract.courseId
    );

    printStudentContractPDF({
      contractNo: contractNum,
      studentName: student.fullName,
      parentName: student.parentName ?? '',
      studentPhone: student.phone,
      parentPhone: student.parentPhone ?? '',
      courseName: course?.name ?? contract.courseId ?? '',
      durationMonths,
      lessonsPerWeek,
      monthlyPrice,
      lessonPrice,
      totalPrice,
      startDate: contract.startDate,
      endDate: contract.endDate,
      signedDate: (contract as any).signedDate ?? contract.startDate,
      groupName: studentGroup?.name,
      groupDays: studentGroup?.schedule?.days?.join(', '),
      groupTime: studentGroup?.schedule?.time,
    });

    addToast({ type: 'success', message: 'Shartnoma yangi oynada ochildi. PDF sifatida saqlang!' });
  };

  // Teacher sees their students or fallback
  const teacherStudents = isTeacher
    ? students.filter((s) => s.teacherId === currentUser?.id || s.teacherId === currentUser?.id?.replace('u_', '') || s.teacherId === 'tr_umid')
    : students;
  const visibleStudents = isTeacher ? (teacherStudents.length > 0 ? teacherStudents : students) : students;

  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    return visibleStudents.filter((s) => {
      const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search);
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [visibleStudents, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedStudents = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page]);

  const activeCount  = visibleStudents.filter((s) => s.status === 'active').length;
  const debtCount    = visibleStudents.filter((s) => s.balance < 0).length;
  const lowBalCount  = visibleStudents.filter((s) => s.balance >= 0 && s.balance < 400000).length;
  const getStudentGroups = (groupIds: string[]) => groups.filter((g) => groupIds.includes(g.id));
  const getTeacherName = (teacherId?: string) => teachers.find((t) => t.id === teacherId)?.fullName ?? '—';

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName || !addForm.phone) { addToast({ type: 'error', message: 'Ism va telefon kiritilishi shart' }); return; }
    if (students.some(s => s.phone.replace(/\D/g, '') === addForm.phone.replace(/\D/g, ''))) {
      addToast({ type: 'error', message: "Bu telefon raqami bilan o'quvchi allaqachon mavjud! Dublikat raqam kiritib bo'lmaydi." });
      return;
    }
    const newId = `st${Date.now()}`;
    addStudent({ ...addForm, coins: 0, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', enrolledDate: new Date().toISOString().split('T')[0] });
    addForm.groupIds.forEach((gId) => addStudentToGroup(gId, newId));
    const phones = addForm.phone.replace(/\D/g, '');
    const pphones = addForm.parentPhone.replace(/\D/g, '');
    setCreatedCreds({
      fullName: addForm.fullName,
      studentId: newId,
      studentUsername: genStudentUsername(addForm.fullName, addForm.phone),
      studentPassword: phones.slice(-6),
      parentUsername: genParentUsername(addForm.fullName, addForm.parentPhone),
      parentPassword: pphones.slice(-6),
      parentPhone: addForm.parentPhone,
      parentName: addForm.parentName,
    });
    addToast({ type: 'success', message: `${addForm.fullName} qo'shildi! Ota-onasiga xabarnoma avtomatik yuborildi.` });
    setAddForm({ fullName: '', phone: '', parentPhone: '', parentName: '', groupIds: [], teacherId: isTeacher ? (currentUser?.id ?? '') : '', leadSource: 'Instagram', status: 'active' });
    setAddOpen(false);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payOpen || !payForm.amount) return;
    addPayment({ studentId: payOpen, amount: Number(payForm.amount), type: payForm.type, date: new Date().toISOString().split('T')[0], receivedBy: 'Admin', note: payForm.note });
    addToast({ type: 'success', message: `${Number(payForm.amount).toLocaleString()} so'm qabul qilindi` });
    setPayForm({ amount: '', type: 'cash', note: '' });
    setPayOpen(null);
  };

  const payStudent = students.find((s) => s.id === payOpen);
  const detailStudent = students.find((s) => s.id === detailOpen);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 dark:text-white">O'quvchilar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isTeacher ? `Mening o'quvchilarim (${visibleStudents.length} ta)` : "Barcha o'quvchilarni boshqarish"}
          </p>
        </div>
        {!isTeacher && (
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-600/20">
            <Plus className="h-4 w-4" /> Yangi o'quvchi
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami o'quvchilar" value={visibleStudents.length} icon={Users} />
        <StatCard title="Aktiv o'quvchilar" value={activeCount} icon={Users} iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Qarzli o'quvchilar" value={debtCount} icon={AlertTriangle} iconColor="text-red-500" />
        <StatCard title="Balans kam" value={lowBalCount} icon={CreditCard} iconColor="text-amber-600 dark:text-amber-400" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism yoki telefon raqam..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        {(['all', 'active', 'frozen', 'left'] as const).map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${statusFilter === f ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-emerald-300'}`}>
            {f === 'all' ? 'Barchasi' : f === 'active' ? 'Aktiv' : f === 'frozen' ? 'Muzlatilgan' : 'Ketgan'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">O'quvchi</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Guruhlar</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balans</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Holat</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Shartnoma</th>
                {!isTeacher && <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Ustoz</th>}
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Manba</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {paginatedStudents.map((student) => {
                const stuGroups = getStudentGroups(student.groupIds);
                const isDebt = student.balance < 0;
                const isLow = student.balance >= 0 && student.balance < 400000;
                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={student.photo} alt={student.fullName} className="h-9 w-9 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{student.fullName}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400"><Phone className="h-3 w-3" />{student.phone}</div>
                          {student.parentName && (
                            <div className="text-[10px] text-slate-400 mt-0.5">Ota-ona: <span className="font-semibold text-slate-600 dark:text-slate-300">{student.parentName}</span></div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {stuGroups.length === 0 ? <span className="text-slate-400 text-xs">—</span> : stuGroups.map((g) => <Badge key={g.id} label={g.name} color="emerald" />)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isDebt ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{fmtMoney(student.balance)}</span>
                        {isDebt && <AlertTriangle className="h-4 w-4 text-red-400" />}
                        {isLow && !isDebt && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">{statusBadge(student.status)}</td>

                    {/* Shartnoma ustuni */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      {(() => {
                        const contract = getStudentContract(student.id);
                        if (contract) {
                          return (
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm transition-all duration-200 ${
                                contract.status === 'active'
                                  ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                  : contract.status === 'expired'
                                  ? 'bg-rose-100/80 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                                  : 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                              }`}>
                                <ShieldCheck className="h-3 w-3" />
                                {contract.status === 'active' ? 'Faol' : contract.status === 'expired' ? 'Tugagan' : 'Kutilmoqda'}
                              </span>
                              <button
                                onClick={() => handleDownloadContract(student.id)}
                                title="Shartnomani yuklab olish"
                                className="p-1.5 rounded-lg text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        }
                        return (
                          <button
                            onClick={() => setContractStudentId(student.id)}
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md"
                          >
                            <FileSignature className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Shartnoma
                          </button>
                        );
                      })()}
                    </td>

                    {!isTeacher && <td className="px-5 py-4 hidden lg:table-cell"><span className="text-xs text-slate-600 dark:text-slate-300">{getTeacherName(student.teacherId)}</span></td>}
                    <td className="px-5 py-4 hidden lg:table-cell"><Badge label={student.leadSource} color="slate" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDetailOpen(student.id)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Ko'rish</button>
                        <button onClick={() => setPayOpen(student.id)} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 transition-colors">To'lov</button>
                        {isLinked(student.id) ? (
                          <span title="Telegram ulangan" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                            <Send className="h-3 w-3" /> TG
                          </span>
                        ) : (
                          <span title="Telegram ulanmagan" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold">
                            <Send className="h-3 w-3" /> —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400"><Users className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="font-medium">O'quvchi topilmadi</p></div>
          )}

          {/* Pagination Footer */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Jami <strong className="text-slate-800 dark:text-white">{filtered.length}</strong> ta o'quvchidan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} ko'rsatilmoqda
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold px-3 py-1 text-slate-700 dark:text-slate-200">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yangi o'quvchi qo'shish" size="md">
        <form onSubmit={handleAddStudent} className="space-y-4">
          {[{ label: "To'liq ism", key: 'fullName', placeholder: 'Aziz Alimov' }, { label: 'Telefon', key: 'phone', placeholder: '+998901234567' }, { label: 'Ota-ona ismi', key: 'parentName', placeholder: 'Alimov Sardor' }, { label: 'Ota-ona telefoni', key: 'parentPhone', placeholder: '+998901234560' }].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
              <input value={(addForm as unknown as Record<string, unknown>)[key] as string} onChange={(e) => setAddForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Ustoz</label>
            {isTeacher ? (
              <div className="w-full rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 py-2.5 px-3 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                {getTeacherName(currentUser?.id)}
              </div>
            ) : (
              <select value={addForm.teacherId} onChange={(e) => setAddForm((f) => ({ ...f, teacherId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">— Ustoz tanlang —</option>
                {teachers.filter((t) => t.status === 'active').map((t) => (
                  <option key={t.id} value={t.id}>{t.fullName} · {t.specialization}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Manba</label>
            <select value={addForm.leadSource} onChange={(e) => setAddForm((f) => ({ ...f, leadSource: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {['Instagram', 'Telegram', 'Tavsiya', 'Vebsayt', 'TikTok', 'Boshqa'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {/* Guruh tanlash — checkbox pill style */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Guruh</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-800/30">
              {groups.filter((g) => g.status !== 'archived').map((g) => {
                const selected = addForm.groupIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setAddForm((f) => ({
                      ...f,
                      groupIds: selected
                        ? f.groupIds.filter(id => id !== g.id)
                        : [...f.groupIds, g.id],
                    }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      selected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600'
                    }`}
                  >
                    {selected && <span className="text-[10px]">✓</span>}
                    {g.name}
                  </button>
                );
              })}
              {groups.filter(g => g.status !== 'archived').length === 0 && (
                <p className="text-xs text-slate-400 p-1">Guruhlar mavjud emas</p>
              )}
            </div>
            {addForm.groupIds.length > 0 && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                ✓ {addForm.groupIds.length} ta guruh tanlandi
              </p>
            )}
          </div>

          {/* Telegram note */}
          {addForm.parentPhone && (
            <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3">
              <Send className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Telegram xabarnomasi</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-500 mt-0.5">
                  O'quvchi yaratilgandan so'ng tizim avtomatik tarzda ota-onaga Telegram orqali xabarnoma yuboradi. Barcha davomat xabarlari avtomatik tarzda boradi.
                </p>
              </div>
            </div>
          )}
          {addForm.fullName && addForm.phone && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> Avtomatik yaratilajak login ma'lumotlari</p>
              <div className="space-y-1 text-xs font-mono text-slate-600 dark:text-slate-300">
                <p>O'quvchi: <strong>{genStudentUsername(addForm.fullName, addForm.phone)}</strong> / {addForm.phone.replace(/\D/g, '').slice(-6) || '———'}</p>
                {addForm.parentPhone && <p>Ota-ona: <strong>{genParentUsername(addForm.fullName, addForm.parentPhone)}</strong> / {addForm.parentPhone.replace(/\D/g, '').slice(-6) || '———'}</p>}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Bekor</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">Qo'shish</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!createdCreds} onClose={() => setCreatedCreds(null)} title="O'quvchi qo'shildi ✅" size="md">
        {createdCreds && (() => {
          return (
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl px-4 py-3">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">{createdCreds.fullName} tizimga qo'shildi!</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">Ota-onasiga tizim tomonidan avtomatik xabarnoma yuborildi ✅</p>
                </div>
              </div>

              {/* Login Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">O'quvchi kirishi</p>
                  <div className="space-y-1.5"><CopyField label="Login" value={createdCreds.studentUsername} /><CopyField label="Parol" value={createdCreds.studentPassword} /></div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-2">Ota-ona kirishi</p>
                  <div className="space-y-1.5"><CopyField label="Login" value={createdCreds.parentUsername} /><CopyField label="Parol" value={createdCreds.parentPassword} /></div>
                </div>
              </div>

              <button onClick={() => setCreatedCreds(null)} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
                Tushunarli, yopish
              </button>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!payOpen} onClose={() => setPayOpen(null)} title="To'lov qabul qilish" size="sm">
        {payStudent && (
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{payStudent.fullName}</p>
              <p className={`text-sm font-bold mt-1 ${payStudent.balance < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>Joriy balans: {fmtMoney(payStudent.balance)}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Summa (so'm)</label>
              <input type="number" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} placeholder="4000000"
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">To'lov turi</label>
              <select value={payForm.type} onChange={(e) => setPayForm((f) => ({ ...f, type: e.target.value as typeof payForm.type }))}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="cash">Naqd pul</option><option value="card">Bank kartasi</option><option value="payme">Payme</option><option value="click">Click</option><option value="transfer">Bank o'tkazma</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Izoh</label>
              <input value={payForm.note} onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))} placeholder="Iyun oyi to'lovi"
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setPayOpen(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">Qabul qilish</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!detailOpen} onClose={() => setDetailOpen(null)} title={detailStudent?.fullName ?? ''} size="md">
        {detailStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={detailStudent.photo} alt={detailStudent.fullName} className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{detailStudent.fullName}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" />{detailStudent.phone}</p>
                <p className="text-xs text-slate-400 mt-0.5">Ota-ona: <span className="font-semibold">{detailStudent.parentName || '—'}</span></p>
                <p className="text-xs text-slate-400">Tel: {detailStudent.parentPhone}</p>
                {/* Telegram ulanish holati */}
                {isLinked(detailStudent.id) ? (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    <Send className="h-3 w-3" /> Telegram ulangan ✅
                  </div>
                ) : (
                  <div
                    className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <Send className="h-3 w-3" /> Telegram xabarnoma faol ✅
                  </div>
                )}
              </div>
              {statusBadge(detailStudent.status)}
            </div>
            <div className={`rounded-xl p-4 ${detailStudent.balance < 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Balans</p>
              <p className={`text-2xl font-black ${detailStudent.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{fmtMoney(detailStudent.balance)}</p>
              {detailStudent.balance < 0 && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Qarz bor!</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Ro'yxatga olingan</p>
                <p className="font-semibold text-slate-800 dark:text-white">{detailStudent.enrolledDate}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Manba</p>
                <p className="font-semibold text-slate-800 dark:text-white">{detailStudent.leadSource}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Guruhlari</p>
              <div className="flex flex-wrap gap-2">
                {getStudentGroups(detailStudent.groupIds).map((g) => <Badge key={g.id} label={g.name} color="emerald" />)}
                {detailStudent.groupIds.length === 0 && <span className="text-sm text-slate-400">Guruhga biriktirilmagan</span>}
              </div>
              {!isTeacher && (
                <div className="mt-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">Guruhlarga biriktirish / olib tashlash:</p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {groups.filter(g => g.status !== 'archived').map(g => {
                      const isAssigned = detailStudent.groupIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            if (!isAssigned && g.studentIds.length >= g.maxStudents) {
                              addToast({ type: 'error', message: `Guruh sig'imi to'lgan (Max: ${g.maxStudents}). Qo'shib bo'lmaydi!` });
                              return;
                            }
                            const newGroupIds = isAssigned
                              ? detailStudent.groupIds.filter(id => id !== g.id)
                              : [...detailStudent.groupIds, g.id];
                            updateStudent(detailStudent.id, { groupIds: newGroupIds });
                            if (isAssigned) {
                              removeStudentFromGroup(g.id, detailStudent.id);
                            } else {
                              addStudentToGroup(g.id, detailStudent.id);
                            }
                            addToast({ type: 'success', message: isAssigned ? `${g.name} guruhidan olindi` : `${g.name} guruhiga biriktirildi` });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isAssigned
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                          }`}
                        >
                          {isAssigned ? '✓' : '+'} {g.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Ota-ona javobi (bot orqali kelgan) */}
            {detailStudent.absentReason && (
              <div className="border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                  <MessageSquare className="h-3.5 w-3.5" /> Ota-onadan kelgan javob (bot orqali):
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200">{detailStudent.absentReason}</p>
              </div>
            )}

            {/* Shartnoma bo'limi */}
            <div className="border-t border-slate-100 dark:border-dark-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><ScrollText className="h-3.5 w-3.5" /> Shartnoma</p>
                {!getStudentContract(detailStudent.id) && (
                  <button
                    onClick={() => { setDetailOpen(null); setContractStudentId(detailStudent.id); }}
                    className="group text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-900/20 dark:hover:bg-emerald-600 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" /> Yaratish
                  </button>
                )}
              </div>
              {(() => {
                const contract = getStudentContract(detailStudent.id);
                const course = courses.find(c => c.id === contract?.courseId);
                if (!contract) {
                  return (
                    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center">
                      <ScrollText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-medium text-slate-400">Shartnoma rasmiylashtirilmagan</p>
                    </div>
                  );
                }
                return (
                  <div className={`rounded-xl p-3.5 border transition-all hover:shadow-sm ${
                    contract.status === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                      : contract.status === 'expired'
                      ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'
                      : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Kurs: {course?.name || contract.courseId}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{contract.startDate} — {contract.endDate}</p>
                        <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 tracking-wide">{Number(contract.totalPrice).toLocaleString()} so'm</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          contract.status === 'active' ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : contract.status === 'expired' ? 'bg-rose-100/80 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                          : 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        }`}>
                          <ShieldCheck className="h-3 w-3" />
                          {contract.status === 'active' ? 'Faol' : contract.status === 'expired' ? 'Tugagan' : 'Kutilmoqda'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadContract(detailStudent.id)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all shadow-sm"
                        title="Shartnomani yuklab olish"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="border-t border-slate-100 dark:border-dark-border pt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> Login ma'lumotlari</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1.5">O'quvchi</p>
                  <CopyField label="Login" value={detailStudent.studentUsername} />
                  <div className="mt-1.5"><CopyField label="Parol" value={detailStudent.studentPassword} /></div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1.5">Ota-ona</p>
                  <CopyField label="Login" value={detailStudent.parentUsername} />
                  <div className="mt-1.5"><CopyField label="Parol" value={detailStudent.parentPassword} /></div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setDetailOpen(null); setPayOpen(detailStudent.id); }} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">To'lov qabul qilish</button>
              <button onClick={() => { updateStudent(detailStudent.id, { status: detailStudent.status === 'active' ? 'frozen' : 'active' }); addToast({ type: 'info', message: 'Holat yangilandi' }); setDetailOpen(null); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">
                {detailStudent.status === 'active' ? 'Muzlatish' : 'Faollashtirish'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Shartnoma yaratish modali — Smart Auto-Fill */}
      <Modal open={!!contractStudentId} onClose={() => setContractStudentId(null)} title="Shartnoma yaratish" size="sm">
        {contractStudentId && (() => {
          const student = students.find(s => s.id === contractStudentId);
          const computed = computeContractData(contractStudentId);
          const endDate = contractOverride.endDate || computed?.endDate || '';
          const totalPrice = contractOverride.totalPrice ?? computed?.totalPrice?.toString() ?? '';
          const status = contractOverride.status ?? 'active';
          return (
            <form onSubmit={handleCreateContract} className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
                <img src={student?.photo} alt={student?.fullName} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{student?.fullName}</p>
                  <p className="text-xs text-slate-400">{student?.phone}</p>
                </div>
              </div>
              {computed ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Kurs</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{computed.course.name}</p>
                      <p className="text-[10px] text-slate-500">{computed.durationMonths} oy davomiyligi</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-purple-500 uppercase mb-1">Guruh</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{computed.studentGroup.name}</p>
                      <p className="text-[10px] text-slate-500">{computed.studentGroup.schedule.days.length} kun/hafta, {computed.studentGroup.schedule.time}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Boshlanish</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{computed.startDate}</p>
                      <p className="text-[10px] text-slate-500">Guruh boshlanish sanasi</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">Oylik to'lov</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{computed.monthlyPrice.toLocaleString()} so'm</p>
                      <p className="text-[10px] text-slate-500">x {computed.durationMonths} oy</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Tugash sanasi <span className="normal-case font-normal text-slate-400">(o'zgartirish mumkin)</span>
                    </label>
                    <input type="date" value={endDate}
                      onChange={e => setContractOverride(o => ({ ...o, endDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Jami summa (so'm) <span className="normal-case font-normal text-slate-400">(o'zgartirish mumkin)</span>
                    </label>
                    <input type="number" value={totalPrice}
                      onChange={e => setContractOverride(o => ({ ...o, totalPrice: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    <p className="text-[11px] text-slate-400 mt-1">
                      = {computed.monthlyPrice.toLocaleString()} x {computed.durationMonths} oy = <strong className="text-emerald-600">{computed.totalPrice.toLocaleString()} so'm</strong>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Holat</label>
                    <div className="flex gap-2">
                      {(['active', 'pending', 'expired'] as const).map(s => (
                        <button key={s} type="button"
                          onClick={() => setContractOverride(o => ({ ...o, status: s }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${status === s ? s === 'active' ? 'bg-emerald-600 text-white' : s === 'pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {s === 'active' ? 'Faol' : s === 'pending' ? 'Kutilmoqda' : 'Tugagan'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Guruh yoki kurs topilmadi</p>
                  <p className="text-xs text-rose-500 mt-1">O'quvchini avval guruhga biriktiring.</p>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setContractStudentId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
                <button type="submit" disabled={!computed}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors">
                  Shartnomani yaratish
                </button>
              </div>
            </form>
          );
        })()}
      </Modal>
    </div>
  );
};
