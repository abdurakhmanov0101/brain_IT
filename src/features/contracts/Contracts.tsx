import React, { useState, useMemo } from 'react';
import {
  FileText, Plus, Download, CheckCircle, Clock, AlertCircle,
  Printer, Search, ChevronDown, Zap, Users, Briefcase, X,
  ArrowLeft, Eye, ScrollText, ShieldCheck, GraduationCap, BriefcaseBusiness, FileSignature
} from 'lucide-react';
import { useStudentStore } from '../../stores/studentStore';
import { useCourseStore } from '../../stores/courseStore';
import { useContractStore } from '../../stores/contractStore';
import type { ContractType, Contract } from '../../stores/contractStore';
import { useGroupStore } from '../../stores/groupStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useStaffStore } from '../../stores/staffStore';
import { useUIStore } from '../../stores/uiStore';
import { Modal } from '../../components/Modal';
import { StatCard } from '../../components/StatCard';
import { exportCSV } from '../../utils/exportCSV';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { printStudentContractPDF } from '../../utils/printContractPDF';
import { printEmployeeContractPDF } from '../../utils/printContractPDF';

// ── helpers ────────────────────────────────────────────────────────────────
function fmtMoney(v: number) { return v.toLocaleString('uz-UZ') + ' so\'m'; }
function today() { return new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' }); }
function todayISO() { return new Date().toISOString().split('T')[0]; }
function padZero(n: number) { return String(n).padStart(2, '0'); }
function contractNum(id: string) {
  return String(id).replace('ct', '').slice(-6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Print-ready STUDENT contract (Ta'lim xizmatlari)
// ─────────────────────────────────────────────────────────────────────────────
export function StudentContractPreview({
  contract, studentName, courseName, parentName, startDate, endDate, totalPrice, monthlyPrice, contractNo
}: {
  contract?: Contract; studentName: string; courseName: string; parentName: string;
  startDate: string; endDate: string; totalPrice: number; monthlyPrice: number; contractNo: string;
}) {
  const dateNow = today();
  const monthlyStr = fmtMoney(monthlyPrice);
  const totalStr = fmtMoney(totalPrice);

  return (
    <div className="font-serif text-[13px] leading-relaxed text-slate-900 dark:text-slate-100 space-y-4 p-2">
      {/* Header */}
      <div className="text-center space-y-1 border-b-2 border-double border-slate-700 dark:border-slate-400 pb-4">
        <p className="font-black text-base uppercase tracking-widest">Ta'lim Xizmatlari Ko'rsatish To'g'risida</p>
        <p className="font-black text-xl uppercase tracking-widest">SHARTNOMA № {contractNo}</p>
        <div className="flex justify-between text-xs mt-2 text-slate-600 dark:text-slate-400">
          <span>Termiz shahri</span>
          <span>{dateNow}</span>
        </div>
      </div>

      {/* Parties */}
      <p className="text-[12px] leading-6">
        <span className="font-bold">"Brain IT Academy"</span> MChJ (nodavlat ta'lim muassasasi) nomidan direktori{' '}
        <span className="font-bold">Omonov Jahongir O'ral o'g'li</span> bir tomondan{' '}
        <span className="font-bold">"Ta'lim beruvchi"</span> deb nomlanadi, ikkinchi tomondan{' '}
        <span className="font-bold underline">{studentName || '____________________'}</span>{' '}
        <span className="font-bold">"Talaba"</span> deb nomlanadi, uchinchi tomondan{' '}
        <span className="font-bold underline">{parentName || '____________________'}</span>{' '}
        <span className="font-bold">"Talabaning ota-onasi"</span> deb nomlanadi va quyidagi shartnomani 2 nusxada imzoladilar.
      </p>

      {/* Section 1 */}
      <div>
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-2">1. SHARTNOMA PREDMETI</p>
        <p className="text-[11.5px] leading-6">
          1.1. Ta'lim beruvchi Talabaga{' '}
          <span className="font-bold underline">{courseName || '____________________'}</span>{' '}
          o'quv kursi dasturi bo'yicha ta'lim xizmatlarini taqdim etadi va Talaba va/yoki Talabaning ota-onasi ko'rsatilgan xizmatlar uchun haq to'lash majburiyatini oladi.
        </p>
      </div>

      {/* Section 2 short */}
      <div>
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-2">2. TOMONLARNING MAJBURIYATLARI</p>
        <p className="text-[11px] leading-5">
          2.1. Talaba dars jadvaliga asosan doimiy qatnashishi lozim. Topshiriqlarni to'liq bajarishi, to'lovlarni o'z vaqtida amalga oshirishi, pedagogik jamoaga hurmatda bo'lishi, kerakli hollarda oldindan ogohlantirishi shart.
        </p>
        <p className="text-[11px] leading-5 mt-1">
          2.2. Ta'lim beruvchi zarur o'quv materiallari, xonalar va jihozlar bilan ta'minlaydi.
        </p>
      </div>

      {/* Section 4 */}
      <div>
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-2">3. XIZMATLAR NARXLARI VA TO'LASH SHARTLARI</p>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-[11.5px] space-y-1">
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
            <span>Kurs nomi:</span>
            <span className="font-bold">{courseName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
            <span>Boshlanish sanasi:</span>
            <span className="font-bold">{startDate}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
            <span>Tugash sanasi:</span>
            <span className="font-bold">{endDate}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
            <span>Oylik to'lov:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{monthlyStr}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="font-black">Jami umumiy summa:</span>
            <span className="font-black text-emerald-700 dark:text-emerald-400 text-[13px]">{totalStr}</span>
          </div>
        </div>
        <p className="text-[11px] mt-2 leading-5">
          To'lov oldindan amalga oshirib boriladi. Ta'lim beruvchi to'lovni oldindan amalga oshirmagan Talabaga xizmat ko'rsatmaydi.
          Bir vaqtning o'zida 2 yoki undan ortiq kurslarga qatnashsa yoki to'lovni birdaniga amalga oshirsa umumiy narxning 10% chegirmaga ega bo'lish imkoni mavjud.
        </p>
      </div>

      {/* Signatures */}
      <div className="border-t-2 border-double border-slate-700 dark:border-slate-400 pt-4 mt-4">
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-4">TOMONLARNING MANZILI VA REKVIZITLARI</p>
        <div className="grid grid-cols-2 gap-6 text-[10.5px]">
          <div className="space-y-1">
            <p className="font-black uppercase">TA'LIM BERUVCHI</p>
            <p>Manzil: Surxondaryo viloyati, Termiz sh,</p>
            <p>Jayhun MFY, Afrosiyob ko'chasi, 39-B-uy</p>
            <p>Bank: Aloqabank Termiz filiali</p>
            <p>X/R: 20208000207469699001</p>
            <p>MFO: 00401 | INN: 313048200</p>
            <div className="mt-4 relative">
              <p>Direktor: ____________________</p>
              <p className="mt-2">Asoschi: ____________________</p>
              <img
                src="/muhr.png"
                alt="Muhr"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain mix-blend-multiply absolute left-[130px] -top-6 pointer-events-none select-none opacity-95"
              />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-black uppercase">O'QUVCHI</p>
            <p>Ismi: <span className="font-bold">{studentName || '________________'}</span></p>
            <p>Manzil: ____________________</p>
            <p>Telefon: ____________________</p>
            <p className="font-black uppercase mt-2">OTA-ONA</p>
            <p>Ismi: <span className="font-bold">{parentName || '________________'}</span></p>
            <p>Manzil: ____________________</p>
            <p>Telefon: ____________________</p>
            <div className="mt-4">
              <p>O'quvchi imzosi: ____________</p>
              <p className="mt-2">Ota-ona imzosi: _____________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Print-ready EMPLOYEE contract (Mehnat shartnomasi)
// ─────────────────────────────────────────────────────────────────────────────
function EmployeeContractPreview({
  employeeName, position, startDate, contractDurationYears, salaryAmount, contractNo
}: {
  employeeName: string; position: string; startDate: string;
  contractDurationYears: number; salaryAmount: number; contractNo: string;
}) {
  const dateNow = today();

  return (
    <div className="font-serif text-[13px] leading-relaxed text-slate-900 dark:text-slate-100 space-y-4 p-2">
      {/* Header */}
      <div className="text-center space-y-1 border-b-2 border-double border-slate-700 dark:border-slate-400 pb-4">
        <p className="font-black text-base uppercase tracking-widest">MEHNAT SHARTNOMASI</p>
        <p className="font-black text-xl uppercase">№ {contractNo}</p>
        <div className="flex justify-between text-xs mt-2 text-slate-600 dark:text-slate-400">
          <span>Termiz shahri</span>
          <span>{dateNow}</span>
        </div>
      </div>

      {/* Section 1 */}
      <div>
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-3">I. Mehnat shartnomasi tomonlari</p>
        <p className="text-[11.5px] leading-6">
          1.1. "Brain IT Academy" MCHJ direktori <span className="font-bold">Jahongir Omonov</span>{' '}
          (keyingi o'rinlarda "Ish beruvchi" deb yuritiladi) bir tomondan, fuqaro{' '}
          <span className="font-bold underline">{employeeName || '____________________'}</span>{' '}
          (keyingi o'rinlarda "Xodim" deb yuritiladi) ikkinchi tomondan amaldagi O'zbekiston Respublikasi Mehnat Kodeksining
          tegishli qoidalari va mehnat munosabatlarini tartibga soluvchi qonunchilik hujjatlariga asoslangan holda mazkur
          mehnat shartnomasini (keyingi o'rinlarda "Shartnoma" deb yuritiladi) tuzib, quyidagilarga kelishib oldilar.
        </p>
      </div>

      {/* Section 2 */}
      <div>
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-2">II. Shartnoma mavzusi va muddati</p>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-[11.5px] space-y-1">
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
            <span>Lavozim:</span>
            <span className="font-bold">{position || '____________________'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
            <span>Ishlashga tayinlangan sana:</span>
            <span className="font-bold">{startDate}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
            <span>Shartnoma muddati:</span>
            <span className="font-bold">{contractDurationYears} yil</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="font-black">Oylik ish haqi:</span>
            <span className="font-black text-emerald-700 dark:text-emerald-400">{fmtMoney(salaryAmount)}</span>
          </div>
        </div>
        <p className="text-[11px] mt-2">2.2. Shartnoma asosiy ish bo'yicha hisoblanadi.</p>
      </div>

      {/* Section 3 short */}
      <div>
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-2">III. Umumiy shartlar</p>
        <p className="text-[11px] leading-5">
          3.1. Xodim belgilangan tartibda amaldagi qonunchilik hujjatlari, maktabning ichki mehnat tartibi, odob-axloq qoidalari,
          nizomi, lavozim yo'riqnomasi va boshqa hujjatlariga asosan o'z vazifalarini shaxsan bajaradi.
          3.2. Xodimga maktabning shtat jadvaliga asosan belgilangan ish haqi to'lanadi hamda boshqa qonun bilan taqiqlanmagan imtiyoz va rag'batlantirishlar beriladi.
          3.3. Ish vaqti Ichki mehnat tartib-qoidasi bilan belgilanadi.
          3.4. Xodimning ish haqi naqd yoki plastik kartochkaga o'tkaziladi.
        </p>
      </div>

      {/* Obligations short */}
      <div>
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-2">IV. Tomonlarning majburiyatlari</p>
        <p className="text-[11px] leading-5">
          <span className="font-bold">Ish beruvchining majburiyatlari:</span> Xodimga ish haqi, imtiyoz va rag'batlantirishlarni o'z vaqtida berish;
          xavfsiz mehnat shart-sharoitlarini yaratish; qonunchilik va shartnoma shartlariga rioya qilish.
        </p>
        <p className="text-[11px] leading-5 mt-1">
          <span className="font-bold">Xodimning majburiyatlari:</span> Amaldagi qonun hujjatlari, shartnoma, ichki tartib qoidalariga rioya qilish;
          buyruq va topshiriqlarni bajarish; ma'lumotlarning maxfiyligini saqlash; korrupsiyaviy omillarga yo'l qo'ymaslik.
        </p>
      </div>

      {/* Terminate */}
      <div>
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-2">V. Shartnomani bekor qilish shartlari</p>
        <p className="text-[11px] leading-5">
          5.1. Tomonlarning o'zaro kelishuviga ko'ra. 5.2. Xodim majburiyatlarini bajarmaganda ish beruvchi tashabbusi bilan.
          5.4. Xodim shartnomani bir tomonlama bekor qilishiga yo'l qo'yilmaydi, bunday hollarda BXMning 50 baravar miqdorida jarimaga tortiladi.
        </p>
      </div>

      {/* Signatures */}
      <div className="border-t-2 border-double border-slate-700 dark:border-slate-400 pt-4 mt-4">
        <p className="font-black text-center uppercase tracking-wider text-[12px] mb-4">TOMONLARNING MANZILI VA IMZOLARI</p>
        <div className="grid grid-cols-2 gap-6 text-[10.5px]">
          <div className="space-y-1">
            <p className="font-black uppercase">ISH BERUVCHI</p>
            <p>Manzil: Surxondaryo viloyati, Termiz sh,</p>
            <p>Jayhun MFY, Afrosiyob ko'chasi, 39-B-uy</p>
            <p>Bank: Aloqabank Termiz filiali</p>
            <p>X/R: 20208000207469699001</p>
            <p>MFO: 00401 | INN: 313048200</p>
            <div className="mt-4 relative">
              <p>Direktor: ____________________</p>
              <p className="mt-1">(imzo)</p>
              <p className="mt-3">Asoschi: ____________________</p>
              <p className="mt-1">(imzo)</p>
              <img
                src="/muhr.png"
                alt="Muhr"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain mix-blend-multiply absolute left-[130px] -top-4 pointer-events-none select-none opacity-95"
              />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-black uppercase">XODIM</p>
            <p>F.I.O: <span className="font-bold">{employeeName || '________________'}</span></p>
            <p>Lavozim: <span className="font-bold">{position || '________________'}</span></p>
            <p>Manzil: ____________________</p>
            <p>Pasport: ____________________</p>
            <div className="mt-4">
              <p>Xodim imzosi: _______________</p>
              <p className="mt-1">(imzo)</p>
            </div>
          </div>
        </div>

        {/* Docs checklist */}
        <div className="mt-6 border-t border-slate-300 dark:border-slate-600 pt-4">
          <p className="font-black text-center text-[11px] mb-3">QUYIDAGI HUJJATLAR BILAN TANISHDIM:</p>
          <table className="w-full text-[10px] border border-collapse border-slate-400">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="border border-slate-400 px-2 py-1 text-left">Hujjat nomi</th>
                <th className="border border-slate-400 px-2 py-1 w-20 text-center">Imzo</th>
              </tr>
            </thead>
            <tbody>
              {[
                'Ichki mehnat tartibi va Odob-axloq qoidalari',
                'Boshqarma (bo\'lim) nizomi',
                'Lavozim yo\'riqnomasi',
                'Maktabning ichki nizomi',
                'Jamoa shartnomasi (kelishuv)',
                'Maxfiy, konfedensial, xizmatda foydalanishga taalluqli axborotlar bilan ishlashga oid hujjatlar',
                'Korrupsiyaga qarshi kurashish, yashirin iqtisodiyotni bartaraf qilishga oid hujjatlar',
              ].map((doc, i) => (
                <tr key={i}>
                  <td className="border border-slate-400 px-2 py-1">{doc}</td>
                  <td className="border border-slate-400 px-2 py-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Contract['status'] }) {
  const map = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 Faol',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 Kutilmoqda',
    expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 Muddati o\'tgan',
  };
  const [cls, label] = map[status].split(' ').reduce<[string, string]>((acc, cur, i, arr) => {
    if (i < arr.length - 1) { acc[0] += ' ' + cur; } else { acc[1] = cur; }
    return acc;
  }, ['', '']);
  const parts = map[status];
  const lastSpace = parts.lastIndexOf(' ');
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${parts.substring(0, lastSpace)}`}>
      {parts.substring(lastSpace + 1)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const Contracts: React.FC = () => {
  const { students } = useStudentStore();
  const { courses } = useCourseStore();
  const { groups } = useGroupStore();
  const { teachers } = useTeacherStore();
  const { staffList } = useStaffStore();
  const { contracts, addContract, updateContract, deleteContract } = useContractStore();
  const { addToast } = useUIStore();

  // Type selection step
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  // Student contract modal
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    studentId: '', courseId: '', startDate: todayISO(), endDate: '', parentName: ''
  });

  // Employee contract modal
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    employeeId: '', position: '', startDate: todayISO(),
    contractDurationYears: 1, salaryAmount: 0
  });

  // View modal
  const [viewId, setViewId] = useState<string | null>(null);

  // Filter & search
  const [filterType, setFilterType] = useState<'all' | ContractType>('all');
  const [searchQ, setSearchQ] = useState('');

  // ─── helpers ────────────────────────────────────────────────────────────
  const getStudent = (id: string) => students.find(s => s.id === id);
  const getCourse = (id: string) => courses.find(c => c.id === id);
  const getTeacher = (id: string) => teachers.find(t => t.id === id);
  const getEmployee = (id: string) => teachers.find(t => t.id === id) || staffList.find(s => s.id === id);

  const computeStudentContract = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;
    const studentGroup = groups.find(g => student.groupIds.includes(g.id) && g.status !== 'archived');
    if (!studentGroup) return null;
    const course = courses.find(c => c.id === studentGroup.courseId);
    if (!course) return null;
    const startDate = studentGroup.startDate || todayISO();
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + course.durationMonths);
    const endDate = end.toISOString().split('T')[0];
    const totalPrice = course.monthlyPrice * course.durationMonths;
    return { course, startDate, endDate, totalPrice };
  };

  // Auto-fill course/dates when student is chosen
  const handleStudentSelect = (studentId: string) => {
    const auto = computeStudentContract(studentId);
    const student = getStudent(studentId);
    setStudentForm(f => ({
      ...f,
      studentId,
      courseId: auto?.course.id ?? '',
      startDate: todayISO(),
      endDate: auto?.endDate ?? '',
      parentName: student?.parentName ?? '',
    }));
  };

  // Auto-fill when teacher chosen
  const handleEmployeeSelect = (employeeId: string) => {
    const t = teachers.find(x => x.id === employeeId);
    const s = staffList.find(x => x.id === employeeId);
    let position = '';
    let salaryAmount = 0;
    
    if (t) {
      position = t.specialization ? `${t.specialization} o'qituvchisi` : '';
      salaryAmount = 0;
    } else if (s) {
      position = s.role || '';
      salaryAmount = s.fixedSalary || 0;
    }

    setEmployeeForm(f => ({
      ...f,
      employeeId,
      position,
      salaryAmount,
      startDate: todayISO(),
    }));
  };

  const handleCreateStudentContract = (e: React.FormEvent) => {
    e.preventDefault();
    const { studentId, courseId, startDate, endDate, parentName } = studentForm;
    if (!studentId || !courseId || !startDate || !endDate) {
      addToast({ type: 'error', message: "Barcha majburiy maydonlarni to'ldiring" }); return;
    }
    const course = getCourse(courseId);
    const months = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const totalPrice = (course?.monthlyPrice ?? 0) * months;
    const num = contracts.length + 1;
    addContract({
      type: 'student',
      studentId,
      courseId,
      startDate,
      endDate,
      totalPrice,
      parentName,
      status: 'pending',
      contractNumber: String(num).padStart(3, '0'),
    });
    addToast({ type: 'success', message: `O'quv shartnomasi yaratildi ✅` });
    setStudentModalOpen(false);
    setStudentForm({ studentId: '', courseId: '', startDate: todayISO(), endDate: '', parentName: '' });
  };

  const handleCreateEmployeeContract = (e: React.FormEvent) => {
    e.preventDefault();
    const { employeeId, position, startDate, contractDurationYears, salaryAmount } = employeeForm;
    if (!employeeId || !position || !startDate) {
      addToast({ type: 'error', message: "Barcha majburiy maydonlarni to'ldiring" }); return;
    }
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + contractDurationYears);
    const endDate = end.toISOString().split('T')[0];
    const totalPrice = salaryAmount * 12 * contractDurationYears;
    const num = contracts.length + 1;
    addContract({
      type: 'employee',
      employeeId,
      position,
      startDate,
      endDate,
      totalPrice,
      salaryAmount,
      contractDurationYears,
      status: 'pending',
      contractNumber: String(num).padStart(3, '0'),
    });
    addToast({ type: 'success', message: `Mehnat shartnomasi yaratildi ✅` });
    setEmployeeModalOpen(false);
    setEmployeeForm({ employeeId: '', position: '', startDate: todayISO(), contractDurationYears: 1, salaryAmount: 0 });
  };

  const handleSign = (id: string) => {
    updateContract(id, { status: 'active', signedDate: todayISO() });
    addToast({ type: 'success', message: 'Shartnoma imzolandi ✅' });
  };

  const handleExport = () => {
    exportCSV(filteredContracts.map(c => ({
      Tur: c.type === 'student' ? 'O\'quvchi' : 'Xodim',
      Shaxs: c.type === 'student'
        ? getStudent(c.studentId ?? '')?.fullName ?? c.studentId
        : getTeacher(c.employeeId ?? '')?.fullName ?? c.employeeId,
      Boshlanish: c.startDate,
      Tugash: c.endDate,
      'Jami summa': c.totalPrice,
      Holat: c.status,
    })), 'shartnomalar');
    addToast({ type: 'success', message: 'CSV yuklab olindi' });
  };

  // Filter
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      if (filterType !== 'all' && c.type !== filterType) return false;
      if (!searchQ.trim()) return true;
      const q = searchQ.toLowerCase();
      if (c.type === 'student') {
        return getStudent(c.studentId ?? '')?.fullName?.toLowerCase().includes(q) ?? false;
      } else {
        return getTeacher(c.employeeId ?? '')?.fullName?.toLowerCase().includes(q) ?? false;
      }
    });
  }, [contracts, filterType, searchQ]);

  const viewContract = contracts.find(c => c.id === viewId);

  // Stats
  const studentContracts = contracts.filter(c => c.type === 'student');
  const employeeContracts = contracts.filter(c => c.type === 'employee');
  const activeCount = contracts.filter(c => c.status === 'active').length;
  const pendingCount = contracts.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeaderBanner
        category="RASMIY HUJJATLAR • SHARTNOMALAR"
        title="Shartnomalar Boshqaruvi"
        description="O'quvchi va xodimlar bilan tuzilgan barcha rasmiy shartnomalar"
        accent="slate"
        icon={<FileSignature className="w-3.5 h-3.5" />}
        rightAction={
          <div className="flex gap-2">
            <button onClick={handleExport}
              className="inline-flex items-center gap-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button onClick={() => setTypeModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95">
              <Plus className="h-4 w-4" /> Yangi shartnoma
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Jami shartnomalar" value={contracts.length} icon={ScrollText} />
        <StatCard title="Aktiv" value={activeCount} icon={ShieldCheck} iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="O'quvchi" value={studentContracts.length} icon={GraduationCap} iconColor="text-blue-600 dark:text-blue-400" />
        <StatCard title="Xodim / Ustoz" value={employeeContracts.length} icon={BriefcaseBusiness} iconColor="text-purple-600 dark:text-purple-400" />
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Ism bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'student', 'employee'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${filterType === t
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              {t === 'all' ? 'Barchasi' : t === 'student' ? 'O\'quvchi' : 'Xodim'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-dark-border">
                {['№', 'Tur', 'Shaxs', 'Lavozim / Kurs', 'Muddat', 'Jami summa', 'Holat', 'Amal'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {filteredContracts.map(ct => {
                const isStudent = ct.type === 'student';
                const person = isStudent ? getStudent(ct.studentId ?? '') : getTeacher(ct.employeeId ?? '');
                const course = isStudent ? getCourse(ct.courseId ?? '') : null;
                return (
                  <tr key={ct.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:-translate-y-[1px] hover:shadow-sm transition-all duration-200">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300">№ {ct.contractNumber || String(ct.id).slice(-6)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isStudent ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-purple-100/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'}`}>
                        {isStudent ? <GraduationCap className="h-3.5 w-3.5" /> : <BriefcaseBusiness className="h-3.5 w-3.5" />}
                        {isStudent ? 'O\'quvchi' : 'Xodim'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {person && (person as any).photo ? (
                           <img src={(person as any).photo} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" />
                        ) : (
                           <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800">
                             {((person as any)?.fullName || 'U').charAt(0)}
                           </div>
                        )}
                        <span className="font-medium text-slate-800 dark:text-white">{(person as any)?.fullName ?? (isStudent ? ct.studentId : ct.employeeId)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {isStudent ? course?.name : ct.position}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      <p>{ct.startDate}</p>
                      <p>— {ct.endDate}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {ct.totalPrice.toLocaleString()} so'm
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ct.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setViewId(ct.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Ko'rish
                        </button>
                        {ct.status === 'pending' && (
                          <button onClick={() => handleSign(ct.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-700">
                            Imzolash
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredContracts.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Shartnomalar yo'q</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TYPE SELECTION MODAL ─────────────────────────────────────────── */}
      <Modal open={typeModalOpen} onClose={() => setTypeModalOpen(false)} title="Shartnoma turi tanlang" size="sm">
        <div className="space-y-3">
          <button
            onClick={() => { setTypeModalOpen(false); setStudentModalOpen(true); }}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-black text-blue-800 dark:text-blue-300">Ta'lim Shartnomasi</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">O'quvchi bilan tuziladi</p>
            </div>
          </button>

          <button
            onClick={() => { setTypeModalOpen(false); setEmployeeModalOpen(true); }}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-black text-purple-800 dark:text-purple-300">Mehnat Shartnomasi</p>
              <p className="text-xs text-purple-600 dark:text-purple-500 mt-0.5">Xodim / Ustoz bilan tuziladi</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* ── STUDENT CONTRACT MODAL ───────────────────────────────────────── */}
      <Modal open={studentModalOpen} onClose={() => setStudentModalOpen(false)} title="Ta'lim Shartnomasi — Yangi" size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <form onSubmit={handleCreateStudentContract} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400 font-medium">
              📝 O'quvchi tanlanganida kurs, sanalar va ota-ona ismi avtomatik to'ldiriladi
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">O'quvchi *</label>
              <select
                value={studentForm.studentId}
                onChange={e => handleStudentSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">— O'quvchi tanlang —</option>
                {students.filter(s => s.status === 'active').map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} · {s.phone}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ota-ona ismi</label>
              <input
                value={studentForm.parentName}
                onChange={e => setStudentForm(f => ({ ...f, parentName: e.target.value }))}
                placeholder="Avomatik to'ldiriladi yoki qo'lda kiriting"
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kurs *</label>
              <select
                value={studentForm.courseId}
                onChange={e => setStudentForm(f => ({ ...f, courseId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">— Kurs tanlang —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} · {c.monthlyPrice.toLocaleString()} so'm/oy</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Boshlanish *</label>
                <input type="date" value={studentForm.startDate}
                  onChange={e => setStudentForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tugash *</label>
                <input type="date" value={studentForm.endDate}
                  onChange={e => setStudentForm(f => ({ ...f, endDate: e.target.value }))}
                  min={studentForm.startDate}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
              </div>
            </div>

            {studentForm.courseId && studentForm.startDate && studentForm.endDate && (() => {
              const months = Math.max(1, Math.ceil((new Date(studentForm.endDate).getTime() - new Date(studentForm.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)));
              const course = getCourse(studentForm.courseId);
              const total = (course?.monthlyPrice ?? 0) * months;
              return (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  {months} oy × {course?.monthlyPrice.toLocaleString()} so'm = <strong>{total.toLocaleString()} so'm</strong>
                </div>
              );
            })()}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStudentModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
                Shartnoma yaratish
              </button>
            </div>
          </form>

          {/* Right: Preview */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-auto max-h-[70vh] bg-white dark:bg-slate-900 p-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 text-center">Ko'rinish (preview)</p>
            <StudentContractPreview
              studentName={getStudent(studentForm.studentId)?.fullName ?? ''}
              courseName={getCourse(studentForm.courseId)?.name ?? ''}
              parentName={studentForm.parentName}
              startDate={studentForm.startDate}
              endDate={studentForm.endDate}
              totalPrice={(() => {
                const months = Math.max(1, Math.ceil((new Date(studentForm.endDate || todayISO()).getTime() - new Date(studentForm.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)));
                return (getCourse(studentForm.courseId)?.monthlyPrice ?? 0) * months;
              })()}
              monthlyPrice={getCourse(studentForm.courseId)?.monthlyPrice ?? 0}
              contractNo={String(contracts.length + 1).padStart(3, '0')}
            />
          </div>
        </div>
      </Modal>

      {/* ── EMPLOYEE CONTRACT MODAL ──────────────────────────────────────── */}
      <Modal open={employeeModalOpen} onClose={() => setEmployeeModalOpen(false)} title="Mehnat Shartnomasi — Yangi" size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <form onSubmit={handleCreateEmployeeContract} className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-xs text-purple-700 dark:text-purple-400 font-medium">
              👤 Xodim tanlanganida lavozim va sanalar avtomatik to'ldiriladi
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Xodim / Ustoz *</label>
              <select
                value={employeeForm.employeeId}
                onChange={e => handleEmployeeSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">— Xodim tanlang —</option>
                <optgroup label="O'qituvchilar">
                  {teachers.filter(t => t.status === 'active').map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} · {t.specialization}</option>
                  ))}
                </optgroup>
                <optgroup label="Boshqa xodimlar">
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} · {s.role}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lavozimi *</label>
              <input
                value={employeeForm.position}
                onChange={e => setEmployeeForm(f => ({ ...f, position: e.target.value }))}
                placeholder="Masalan: Frontend o'qituvchisi"
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ish boshlash sanasi *</label>
              <input type="date" value={employeeForm.startDate}
                onChange={e => setEmployeeForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Muddat (yil)</label>
                <select value={employeeForm.contractDurationYears}
                  onChange={e => setEmployeeForm(f => ({ ...f, contractDurationYears: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {[1, 2, 3, 5].map(y => <option key={y} value={y}>{y} yil</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Oylik ish haqi (so'm)</label>
                <input type="number" value={employeeForm.salaryAmount || ''}
                  onChange={e => setEmployeeForm(f => ({ ...f, salaryAmount: Number(e.target.value) }))}
                  placeholder="3 000 000"
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card py-2.5 px-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEmployeeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300">Bekor</button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold">
                Shartnoma yaratish
              </button>
            </div>
          </form>

          {/* Right: Preview */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-auto max-h-[70vh] bg-white dark:bg-slate-900 p-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 text-center">Ko'rinish (preview)</p>
            <EmployeeContractPreview
              employeeName={getEmployee(employeeForm.employeeId)?.fullName ?? ''}
              position={employeeForm.position}
              startDate={employeeForm.startDate}
              contractDurationYears={employeeForm.contractDurationYears}
              salaryAmount={employeeForm.salaryAmount}
              contractNo={String(contracts.length + 1).padStart(3, '0')}
            />
          </div>
        </div>
      </Modal>

      {/* ── VIEW CONTRACT MODAL ──────────────────────────────────────────── */}
      <Modal open={!!viewId} onClose={() => setViewId(null)} title="Shartnomani Ko'rish" size="lg">
        {viewContract && (
          <div className="space-y-4">
            <div className="overflow-auto max-h-[60vh] border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 p-5">
              {viewContract.type === 'student' ? (
                <StudentContractPreview
                  studentName={getStudent(viewContract.studentId ?? '')?.fullName ?? ''}
                  courseName={getCourse(viewContract.courseId ?? '')?.name ?? ''}
                  parentName={viewContract.parentName ?? ''}
                  startDate={viewContract.startDate}
                  endDate={viewContract.endDate}
                  totalPrice={viewContract.totalPrice}
                  monthlyPrice={getCourse(viewContract.courseId ?? '')?.monthlyPrice ?? 0}
                  contractNo={viewContract.contractNumber ?? contractNum(viewContract.id)}
                />
              ) : (
                <EmployeeContractPreview
                  employeeName={getEmployee(viewContract.employeeId ?? '')?.fullName ?? ''}
                  position={viewContract.position ?? ''}
                  startDate={viewContract.startDate}
                  contractDurationYears={viewContract.contractDurationYears ?? 1}
                  salaryAmount={viewContract.salaryAmount ?? 0}
                  contractNo={viewContract.contractNumber ?? contractNum(viewContract.id)}
                />
              )}
            </div>
            <div className="flex gap-3">
              {viewContract.status === 'pending' && (
                <button onClick={() => { handleSign(viewContract.id); setViewId(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">
                  Imzolash ✅
                </button>
              )}
              <button onClick={() => {
                if (viewContract.type === 'student') {
                  const _student = getStudent(viewContract.studentId ?? '');
                  const _course = getCourse(viewContract.courseId ?? '');
                  const _contractNum = viewContract.contractNumber ?? contractNum(viewContract.id);
                  const _months = Math.max(1, Math.ceil(
                    (new Date(viewContract.endDate).getTime() - new Date(viewContract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
                  ));
                  const _studentGroup = _student ? groups.find(g => _student.groupIds?.includes(g.id) && g.courseId === viewContract.courseId) : undefined;
                  printStudentContractPDF({
                    contractNo: _contractNum,
                    studentName: _student?.fullName ?? '',
                    parentName: viewContract.parentName ?? _student?.parentName ?? '',
                    studentPhone: _student?.phone ?? '',
                    parentPhone: _student?.parentPhone ?? '',
                    courseName: _course?.name ?? '',
                    durationMonths: _course?.durationMonths ?? _months,
                    lessonsPerWeek: _course?.lessonsPerWeek ?? 3,
                    monthlyPrice: _course?.monthlyPrice ?? 0,
                    lessonPrice: _course?.lessonPrice ?? 0,
                    totalPrice: viewContract.totalPrice,
                    startDate: viewContract.startDate,
                    endDate: viewContract.endDate,
                    signedDate: viewContract.signedDate ?? viewContract.startDate,
                    groupName: _studentGroup?.name,
                    groupDays: _studentGroup?.schedule?.days?.join(', '),
                    groupTime: _studentGroup?.schedule?.time,
                  });
                } else {
                  const _emp = getEmployee(viewContract.employeeId ?? '');
                  printEmployeeContractPDF({
                    contractNo: viewContract.contractNumber ?? contractNum(viewContract.id),
                    employeeName: _emp?.fullName ?? '',
                    position: viewContract.position ?? '',
                    startDate: viewContract.startDate,
                    contractDurationYears: viewContract.contractDurationYears ?? 1,
                    salaryAmount: viewContract.salaryAmount ?? 0,
                    signedDate: viewContract.signedDate ?? viewContract.startDate,
                  });
                }
              }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> PDF yuklab olish
              </button>
              <button onClick={() => setViewId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Yopish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
