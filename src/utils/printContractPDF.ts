/**
 * Contract PDF utilities — opens styled HTML in new window for print/PDF save.
 * This approach is 100% reliable: no html2canvas, no CORS, no off-screen issues.
 * Generates vector-quality PDF through browser's native print dialog.
 */

// ── Shared Helpers ──────────────────────────────────────────────────────────
const fmtMoney = (n: number) => n.toLocaleString('uz-UZ') + " so'm";
const fmtDate = (d: string) => {
  if (!d) return '___';
  const date = new Date(d);
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const SHARED_STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', Times, 'DejaVu Serif', serif;
      font-size: 13px;
      color: #1a1a1a;
      background: #fff;
      padding: 36px 44px;
      line-height: 1.55;
    }
    .header {
      text-align: center;
      border-bottom: 3px double #222;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .header .academy { font-size: 11px; letter-spacing: 3px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
    .header .title { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
    .header .contract-no { font-size: 15px; font-weight: 900; margin-top: 2px; }
    .header .meta { display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-top: 10px; }
    .parties { font-size: 12px; line-height: 1.75; margin-bottom: 16px; text-align: justify; }
    .parties b { font-weight: 700; }
    .parties .u { text-decoration: underline; font-weight: 700; }
    .section { margin-bottom: 14px; page-break-inside: avoid; }
    .section-title {
      font-size: 11.5px; font-weight: 900; text-transform: uppercase;
      letter-spacing: 1.5px; text-align: center; margin-bottom: 8px;
      background: #f1f5f9; padding: 5px 0; border-radius: 4px;
    }
    .section p, .section li { font-size: 11.5px; line-height: 1.65; }
    .section ul { margin-left: 18px; margin-top: 4px; }
    .section li { margin-bottom: 3px; }
    .data-table {
      width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 6px;
    }
    .data-table td { padding: 6px 12px; border: 1px solid #d1d5db; vertical-align: middle; }
    .data-table td:first-child { color: #475569; width: 52%; }
    .data-table td:last-child { font-weight: 700; text-align: right; }
    .data-table tr.section-header td {
      background: #1e293b; color: #fff; font-weight: 800;
      text-align: center; font-size: 10.5px; letter-spacing: 1.5px;
      text-transform: uppercase; padding: 6px;
    }
    .data-table tr.total td { background: #f0fdf4; }
    .data-table tr.total td:last-child { color: #166534; font-size: 14px; font-weight: 900; }
    .note {
      font-size: 10.5px; line-height: 1.6; color: #475569;
      padding: 8px 14px; background: #f8fafc; border-left: 3px solid #94a3b8;
      margin-top: 6px; border-radius: 0 4px 4px 0;
    }
    .note b { color: #1e293b; }
    .signatures {
      border-top: 3px double #222; padding-top: 18px; margin-top: 20px;
      page-break-inside: avoid;
    }
    .sig-title {
      font-size: 11.5px; font-weight: 900; text-transform: uppercase;
      text-align: center; letter-spacing: 1.5px; margin-bottom: 16px;
      background: #f1f5f9; padding: 5px 0; border-radius: 4px;
    }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; font-size: 10.5px; }
    .sig-col .party-name {
      font-weight: 900; text-transform: uppercase; margin-bottom: 6px;
      font-size: 11px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;
    }
    .sig-col p { margin-bottom: 3px; }
    .sig-col b { font-weight: 700; }
    .sig-block { margin-top: 18px; }
    .sig-line { margin-bottom: 6px; }
    .muhr {
      position: absolute; width: 100px; height: 100px; object-fit: contain;
      mix-blend-mode: multiply; opacity: 0.95; top: -10px; left: 130px;
    }
    .doc-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 6px; }
    .doc-table th, .doc-table td { border: 1px solid #d1d5db; padding: 4px 10px; text-align: left; }
    .doc-table th { background: #f1f5f9; font-weight: 700; font-size: 10px; }
    .doc-table td:last-child { width: 60px; text-align: center; }
    .print-bar {
      position: fixed; top: 0; left: 0; right: 0; background: #1e293b;
      padding: 10px 20px; display: flex; align-items: center; justify-content: center;
      gap: 12px; z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .print-bar span { color: #94a3b8; font-family: system-ui; font-size: 13px; }
    .print-btn {
      background: #22c55e; color: #fff; border: none; padding: 8px 24px;
      border-radius: 8px; font-family: system-ui; font-size: 14px;
      font-weight: 700; cursor: pointer;
    }
    .print-btn:hover { background: #16a34a; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 16px 24px; }
      @page { margin: 12mm; size: A4 portrait; }
    }
`;

// ══════════════════════════════════════════════════════════════════════════════
//  1. STUDENT CONTRACT (O'quv shartnomasi)
// ══════════════════════════════════════════════════════════════════════════════

export interface StudentContractPrintData {
  contractNo: string;
  studentName: string;
  parentName: string;
  studentPhone: string;
  parentPhone: string;
  courseName: string;
  durationMonths: number;
  lessonsPerWeek: number;
  monthlyPrice: number;
  lessonPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  signedDate: string;
  groupName?: string;
  groupDays?: string;
  groupTime?: string;
}

export function printStudentContractPDF(data: StudentContractPrintData): void {
  const {
    contractNo, studentName, parentName,
    courseName, monthlyPrice,
    totalPrice, startDate, signedDate,
  } = data;
  const muhrUrl = window.location.origin + '/muhr.png';

  const html = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <title>O'quv Shartnomasi №${contractNo} — ${studentName}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>

  <div class="print-bar no-print">
    <span>Shartnoma tayyor. PDF sifatida saqlash uchun:</span>
    <button class="print-btn" onclick="window.print()">📄 PDF saqlab olish</button>
  </div>

  <div class="header">
    <div class="title">TA'LIM XIZMATLARI KOʻRSATISH TOʻGʻRISIDA</div>
    <div class="contract-no">SHARTNOMA № ${contractNo}</div>
    <div class="meta">
      <span>Termiz shahar</span>
      <span>${fmtDate(signedDate || startDate)}</span>
    </div>
  </div>

  <div class="section">
    <p>"Brain IT Academy" MChJ (nodavlat ta'lim muassasasi) nomidan direktori Omonov Jahongir O’ral o'g'li bir tomondan "Ta'lim beruvchi" deb nomlanadi, ikkinchi tomondan <span class="u">${studentName || '_________________________________________'}</span> "Talaba" deb nomlanadi, uchinchi tomondan <span class="u">${parentName || '____________________________'}</span> "Talabaning ota-onasi" deb nomlanadi va quyidagi shartnomani 2 nusxada imzoladilar.</p>
    <p style="margin-top:8px;">Ular birgalikda "Tomonlar" alohida "Tomon" deb yuritiladilar.</p>
  </div>

  <div class="section">
    <div class="section-title">1. SHARTNOMA PREDMETI</div>
    <p>1.1. Ta'lim beruvchi Talabaga <b>${courseName || '____________________________'}</b> oʻquv kursi dasturi boʻyicha ta'lim xizmatlarini (keyingi oʻrinlarda - Xizmatlar) taqdim etadi va Talaba va/yoki Talabaning ota-onasi koʻrsatilgan xizmatlar uchun haq toʻlash majburiyatini oladi.</p>
  </div>

  <div class="section">
    <div class="section-title">2. ТОМОNLARNING MAJBURIYATLARI</div>
    <p><b>2.1. "Talaba" hamda "Talabaning ota-onasi"ning majburiyatlari.</b></p>
    <p>2.1.1. "Talaba" Ta'lim beruvchi tomonidan ko'rsatilgan dars jadvali asosida dars jarayonlariga doimiy qatnashishi lozim.</p>
    <p>2.1.2. Ta'lim beruvchining pedagogik jamoasi tomonidan berilgan darslar boʻyicha topshiriqlarni toʻliq bajarish;</p>
    <p>2.1.3. Ta'lim beruvchi tomonidan koʻrsatilgan xizmatlar uchun oʻz vaqtida toʻliq toʻlovlarni amalga oshirish;</p>
    <p>2.1.4. Ta'lim beruvchining pedagogik va adminstrativ jamoasiga hurmatda boʻlish;</p>
    <p>2.1.5. Ta'lim beruvchiga darsga kelmaslikning asosli sabablarini oldindan bildirish hamda zarur hollarda tasdiqlovchi hujjatlarni taqdim etish;</p>
    <p>2.1.6. Ta'lim beruvchining binosi, jihozlari va boshqa mol-mulklariga g'amxo'rlik qilish, ularga yetkazilgan zararni toʻliq qoplash;</p>
    <p>2.1.7. Oʻquv qoʻllanmalari hamda darsliklarni avaylab asrash, har qanday holatda ularni Ta'lim beruvchining yozma roziligisiz tarqatmaslik (Agar ular yoʻqolsa Talaba va/yoki Talabaning ota-onasi ularni oʻz hisobidan sotib oladilar);</p>
    <p>2.1.8. Oʻquv markaz hududiga mast qiluvchi va spirtli ichimliklar olib kirmaslik, ularni iste'mol qilgan holda kelmaslik, markaz hududi va kirish qismida tamaki mahsulotlarini iste'mol qilmaslik;</p>
    <p>2.1.9. Ta'lim beruvchining ichki tartib qoidalariga rioya qilish, dars paytida aloqa vositalaridan foydalanmaslik;</p>
    <p>2.1.10. Talabaning ota-onasi kamida oyida bir marta Ta'lim beruvchi bilan oʻzaro suhbatni amalga oshirishi lozim.</p>

    <p style="margin-top:10px;"><b>2.2. "Talaba" hamda "Talabaning ota-onasi”ning huquqlari</b></p>
    <p>2.2.1. Ta'lim jarayonida kutubxonadan, oʻquv xonalaridan, oʻquv qo'llanmalaridan va jihozlardan bepul foydalanish;</p>
    <p>2.2.2. Agar ta'lim jarayonida Ta'lim beruvchining aybi bilan dars jarayoni bekor qilinsa, ushbu darslar oʻtilishini talab qilish;</p>
    <p>2.2.3. O'z xohishiga koʻra dars jarayonlarini muddatidan oldin yakunlash, bunda Ta'lim beruvchiga kamida 2 dars yoki 1 hafta oldin yozma ravishda ogohlantirish xati berilishi lozim;</p>
    <p>2.2.4. Talabaning ota-onasi Ta'lim beruvchidan oʻz farzandining ta'lim olish jarayonlari haqida ma'lumot olishi mumkin.</p>
    <p>2.2.5. Bir vaqtning oʻzida 2 yoki undan ortiq kurslarga qatnashsa umumiy narxning 10 fozi miqdorida chegirmaga ega boʻlish imkoni mavjud;</p>
    <p>2.2.6. Kurs uchun umumiy toʻlovni oldindan birdaniga amalga oshirsa umumiy narxning 10 fozi miqdorida chegirmaga ega boʻlish imkoni mavjud;</p>
  </div>

  <div class="section">
    <div class="section-title">3. TA'LIM BERUVCHINING HUQUQ VA MAJBURIYATLARI</div>
    <p><b>3.1. Ta'lim beruvchining majburiyatlari</b></p>
    <p>3.1.1. Talabani zarur oʻquv materiallari, oʻquv jarayoni uchun dars xonalar va jihozlar bilan ta'minlash;</p>
    <p>3.1.2. Talaba darsga kelolmaganligining asosli sabablarini koʻrsatgan taqdirda amalga oshirilgan toʻlovni keyingi darslar hisobiga oʻtkazish;</p>
    <p>3.1.3. Talabaning aybi tufayli qatnashmagan darslarni qaytadan oʻtib berishga majbur emas.</p>

    <p style="margin-top:10px;"><b>3.2. Ta'lim beruvchining huquqlari</b></p>
    <p>3.2.1. Butun oʻquv kurs davomida, oʻqish kursining davomiyligini saqlagan holda, pedogogik jamoa tarkibiga o'zgartirish kiritish;</p>
    <p>3.2.2. Talaba tomonidan sababsiz qoldirilgan darslarning o'rnini qoplamaslik;</p>
    <p>3.2.3. Agar darslar uchun toʻlov oldindan amalga oshirilmagan boʻlsa, Talabani darsga kiritmaslik;</p>
    <p>3.2.4. Talabalarning bilimlarini muntazam ravishda hisobga olish va nazorat qilish va ota-onalarni natijalar bilan tanishtirib borish;</p>
    <p>3.2.5. Oraliq va yakuniy imtihonlar tashkil etish;</p>
    <p>3.2.6. Darslar jadvalini Talabalarga bildirishnoma orqali darslar boshlanishidan kamida bir kun oldin bir tomonlama oʻzgartirish;</p>
    <p>3.2.7. Ta'til, Oʻzbekistonda nishonlanadigan bayramlar va boshqa sabablar(masalan: ta'mir)ga koʻra, sababli oʻtilmagan darslar toʻlovini keyingi darslar toʻloviga oʻtkazish orqali darslarni vaqtincha to'xtatib turish huquqini saqlab qoladi. Bunda, o'tilmagan darslar vaqti Talabalar bilan kelishilgan holda oʻtib beriladi.</p>
  </div>

  <div class="section">
    <div class="section-title">4. XIZMATLAR NARXLARI, SHARTLARI VA ULARNI TOʻLASH</div>
    <p>4.1. 1 ta Talaba uchun umumiy qiymati ${fmtMoney(totalPrice)} tashkil etadi. 1 oy uchun ${courseName} kursi uchun xizmatlarning narxi ${fmtMoney(monthlyPrice)}.</p>
    <p>4.2. Toʻlov oldindan amalga oshirib boriladi. Ta'lim beruvchi toʻlovni oldindan amalga oshirmagan Talabaga xizmat koʻrsatmaydi.</p>
    <p>4.3. Xizmat narxlarining oshirilishi Ta'lim beruvchi tomonidan asosli ravishda, Talabani va/yoki Talabaning ota-onasini ogohlantirgan holda amalga oshiriladi.</p>
    <p>4.4. Talaba dars jarayonlariga ishtirok etishni oldindan to'xtatgan holda, oldindan amalga oshirilgan toʻlovning koʻpi bilan bir oy uchun moʻljallangan qismi qaytarib berilmaydi.</p>
  </div>

  <div class="section">
    <div class="section-title">5. SHARTNOMANI O‘ZGARTIRISH VA BEKOR QILISH UCHUN ASOSLAR</div>
    <p>5.1. Ushbu shartnoma shartlari tomonlarning oʻzaro kelishuvi bilan amalga oshiriladi;</p>
    <p>5.2. Ushbu shartnoma Tomonlarning yoki bir tomonning yozma ravishdagi iltimosiga asosan muddatidan oldin bekor qilinishi mumkin, bunda Tomonlar shartnoma bekor qilinishi kutilayotgan sanadan 5 ish kuni oldin yozma iltimosnoma yuborishlari zarur hisoblanadi.</p>
    <p>5.3. Ushbu shartnoma Ta'lim beruvchining tashabbusi bilan bir tomonlama bekor qilinish mumkin:<br>
    - Talaba yoki Talabaning ota-onasi tomonidan toʻlovlar oʻz vaqtida amalga oshirilmaganda;<br>
    - Talaba shartnomaning 2.1.1., 2.1.2. va 2.1.9. qismlariga rioya qilmagan taqdirda;<br>
    - Talaba shartnomaning 2.1.4. qismi ikki marotaba buzilsa;<br>
    - Talaba oraliq imtihonlardan ketma-ket ikki marta yiqilsa ushbu kursdan chetlashtiriladi va Ta'lim beruvchi qayta oʻqitish vakolatini olmaydi.</p>
  </div>

  <div class="section">
    <div class="section-title">6. IJROCHI VA BUYURTMACHINING JAVOBGARLIGI</div>
    <p>6.1. Shartnoma boʻyicha oʻz majburiyatlarini bajarmaganlik yoki lozim darajada bajarmaganlik uchun Tomonlar Shartnoma va O'zbekiston Respublikasi qonunchiligi boʻyicha javobgar hisoblanadi.</p>
    <p>6.2. Guruhdan chetlatilgan va yakuniy imtihonlardan oʻta olmagan, darslarni yaxshi oʻzlashtira olmagan oʻquvchilar tegishli predmet/dasturni qayta oʻqish uchun toʻlovning 70 foizini qayta amalga oshirgan holda oʻqishlari mumkin.</p>
  </div>

  <div class="section">
    <div class="section-title">7. SHARTNOMANING MUDDATI</div>
    <p>7.1. Ushbu shartnoma tomonlar tomonidan tuzilgan kundan boshlab kuchga kiradi va tomonlar oʻz majburiyatlarini toʻliq amalga oshirmaguncha amalda hisoblanadi.</p>
  </div>

  <div class="section">
    <div class="section-title">8. FORS MAJOR VA BOSHQA HOLATLAR</div>
    <p>8.1. Ushbu Shartnoma tuzilgandan keyin Tomonlar oldindan koʻra bilmagan va oqilona choralar bilan toʻsqinlik qila olmagan holda yuzaga Favqulodda hodisalar natijasida Shartnoma boʻyicha o'z majburiyatlarini qisman yoki toʻliq bajarmaganligi uchun javobgarlikdan ozod qilinadi. Favqulodda xarakterga ega boʻlgan bunday hodisalarga quyidagilar kiradi: embargo, epidemiya, zilzila, yongʻin, toshqin va boshqa tabiiy hodisalar, davlat organlari tomonidan yangi qonun hujjatlari, qonunosti koʻrsatmalar, qoidalar, xatlar qabul qilinishi, shuningdek hokimiyat organlarining aralashuvi yoki taqiqlovchi harakatlari. Bunday holda, Shartnoma boʻyicha majburiyatlarni bajarish muddati bunday holatlar va ularning oqibatlari bartaraf qilinguncha suriladi.</p>
    <p>8.2. Ushbu shartnoma boʻyicha majburiyatlarni bajarish imkonsizligi yuzaga kelgan Tomon, yuqoridagi holatlarning paydo boʻlishi, kutilayotgan davomiyligi va bekor qilinishi toʻgʻrisida boshqa tomonga darhol 5 kun ichida yozma ravishda xabar beradi.</p>
  </div>

  <div class="section">
    <div class="section-title">9. YAKUNIY QOIDALAR</div>
    <p>9.1. Xizmatlar tugagandan keyin, koʻrsatilgan xizmatlar toʻgʻrisida dalolatnoma tuzilmaydi yoki imzolanmaydi hamda Qabul qilish aktlar ham imzolanmasdan amalga oshiriladi. Oxirgi pullik ta'lim xizmati tugagandan keyin 7 ish kun ichida Talaba yoki Talabaning ota onasi tomonidan ta'lim xizmati sifati toʻg'risida yozma ravishda e'tiroz olinmagan boʻlsa, Ta'lim beruvchi tomonidan xizmatlar toʻg'ri taqdim etilgan deb hisoblanadi.</p>
    <p>9.2. Ushbu shartnomada qayd etilmagan boshqa barcha holatlarda tomonlar O'zbekiston Respublikasining amaldagi qonunchiligi qoidalari va normalarini qo'llaydilar.</p>
    <p>9.3. Tomonlar yuzaga keladigan kelishmovchiliklarni faqat muzokaralar yoʻli bilan bartaraf etish uchun barcha sa'y-harakatlarini amalga oshiradilar. Agar kelishmovchiliklarni muzokaralar bilan hal qilishni iloji boʻlmasa, tomonlar nizo haqida Ta'lim beruvchining joylashgan joyidagi sudga murojaat qiladilar.</p>
    <p>9.4. Ushbu shartnoma tomonlarning har biri uchun 2 (ikki) nusxada, bir nusxa Ta'lim beruvchiga, bir nusxa Talaba va Talabaning ota-onasiga.</p>
  </div>

  <div class="signatures">
    <div class="sig-title">TOMONLARINING MANZILI VA REKVIZITLARI</div>
    <div class="sig-grid">
      <div class="sig-col">
        <div class="party-name">ISH BERUVCHI</div>
        <p>Manzil: Surxondaryo viloyati, Termiz sh,</p>
        <p>Jayhun MFY, Afrosiyob ko'chasi, 39-B-uy</p>
        <p>Bank: Aloqabank Termiz filiali</p>
        <p>X/R: 20208000207469699001</p>
        <p>MFO: 00401 | INN: 313048200</p>
        <div class="sig-block" style="position:relative;">
          <div class="sig-line">Direktor: ____________________</div>
          <div class="sig-line">(imzo)</div>
          <div class="sig-line" style="margin-top:20px;">ASOSCHI: ___________________</div>
          <div class="sig-line">(imzo)</div>
          <img class="muhr" src="${muhrUrl}" alt="Muhr" onerror="this.style.display='none'" style="top: -20px; left: 100px;" />
        </div>
      </div>
      <div class="sig-col">
        <div class="party-name">O'QUVCHI</div>
        <p>Manzil: ${parentName ? '____________________' : '____________________'}</p>
        <p>___________________________</p>
        <p>___________________________</p>
        <p>___________________________</p>
        <div class="sig-block">
          <div class="sig-line">O'QUVCHI: ____________________</div>
          <div class="sig-line">(imzo)</div>
        </div>
      </div>
    </div>
  </div>

  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 600); });</script>
</body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) { alert("Pop-up blokirovka qilingan. Iltimos pop-up ruxsatini bering."); return; }
  w.document.write(html);
  w.document.close();
}


// ══════════════════════════════════════════════════════════════════════════════
//  2. EMPLOYEE CONTRACT (Mehnat shartnomasi)
// ══════════════════════════════════════════════════════════════════════════════

export interface EmployeeContractPrintData {
  contractNo: string;
  employeeName: string;
  position: string;
  startDate: string;
  contractDurationYears: number;
  salaryAmount: number;
  signedDate: string;
}

export function printEmployeeContractPDF(data: EmployeeContractPrintData): void {
  const {
    contractNo, employeeName, position, startDate,
    contractDurationYears, salaryAmount, signedDate,
  } = data;
  const muhrUrl = window.location.origin + '/muhr.png';

  const docs = [
    "Ichki mehnat tartibi va Odob-axloq qoidalari",
    "Boshqarma (bo'lim) nizomi",
    "Lavozim yo'riqnomasi",
    "Maktabning ichki nizomi",
    "Jamoa shartnomasi (kelishuv)",
    "Maxfiy, konfedensial, xizmatda foydalanishga taalluqli axborotlar va hujjatlar bilan ishlashga oid hujjatlar",
    "Korrupsiyaga qarshi kurashish, yashirin iqtisodiyotni bartaraf qilish, korrupsiyaga yo'l qo'ymaslikka oid hujjatlar",
  ];

  const html = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <title>Mehnat Shartnomasi №${contractNo} — ${employeeName}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>

  <div class="print-bar no-print">
    <span>Mehnat shartnomasi tayyor. PDF sifatida saqlash uchun:</span>
    <button class="print-btn" onclick="window.print()">📄 PDF saqlab olish</button>
  </div>

  <div class="header">
    <div class="title">${contractNo}-Son MEHNAT SHARTNOMASI</div>
    <div class="meta">
      <span>Termiz shahri</span>
      <span>${fmtDate(signedDate || startDate)}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">I. Mehnat shartnomasi tomonlari</div>
    <p>1.1. "Brain IT Academy" MCHJ direktori Jahongir Omonov (keyingi o'rinlarda "Ish beruvchi” deb yuritiladi) bir tomondan, fuqaro <span class="u">${employeeName || '____________________'}</span> (keyingi o'rinlarda "Xodim" deb yuritiladi) ikkinchi tomondan amaldagi O'zbekiston Respublikasi Mehnat Kodeksining tegishli qoidalari va mehnat munosabatlarini tartibga soluvchi qonunchilik hujjatlariga asoslangan holda mazkur mehnat shartnomasini (keyingi o'rinlarda "Shartnoma" deb yuritiladi) tuzib, quyidagilarga kelishib oldilar:</p>
  </div>

  <div class="section">
    <div class="section-title">II. Shartnoma mavzusi va muddati</div>
    <p>2.1. Xodim mazkur shartnomaga asosan <span class="u">${position || '_____________________________'}</span> lavozimiga ${fmtDate(startDate)} dan tayinlanadi.</p>
    <p>2.2. Shartnoma asosiy ish bo'yicha hisoblanadi.</p>
    <p>2.3. Shartnoma ${contractDurationYears} yil muddatda o'z kuchini saqlab qoladi.</p>
  </div>

  <div class="section">
    <div class="section-title">III. Shartnomaning umumiy shartlari</div>
    <p>3.1. Xodim belgilangan tartibda amaldagi qonunchilik hujjatlari, maktabning ichki mehnat tartibi, odob-axloq qoidalari, nizomi, lavozim yo'riqnomasi va boshqa hujjatlariga asosan o'z vazifalarini shaxsan bajaradi va ularga amal qiladi.</p>
    <p>3.2. Xodimga maktabning shtat jadvaliga asosan belgilangan ish haqi (${fmtMoney(salaryAmount)}) to'lanadi hamda boshqa qonun bilan taqiqlanmagan imtiyoz, rag'batlantirishlar beriladi.</p>
    <p>3.3. Ish vaqti Ichki mehnat tartib-qoidasi bilan belgilanadi.</p>
    <p>3.4. Xodimning lavozimi bo'yicha ish haqi tasdiqlangan shtat jadvaliga muvofiq belgilanadi, uning miqdori Ish beruvchining buyrug'i asosida o'zgartirilishi mumkin.</p>
    <p>3.5. Xodimning ish haqi naqd yoki plastik kartochkaga o'tkaziladi.</p>
  </div>

  <div class="section">
    <div class="section-title">IV. Tomonlarning majburiyatlari</div>
    <p><b>4.1. Ish beruvchining majburiyatlari:</b></p>
    <p>4.1.1. Xodimga amaldagi qonun hujjatlari va boshqa barcha hujjatlar (keyingi o'rinlarda - boshqa hujjatlar)da nazarda tutilgan ish haqi, imtiyoz va rag'batlantirishlarni o'z vaqtida berish;</p>
    <p>4.1.2. Xavfsiz va samarali mehnat shart-sharoitlarini yaratish;</p>
    <p>4.1.3. Xodimni shtat jadvalidagi o'zgartirishlar xususida belgilangan tartibda yozma ravishda ogohlantirish;</p>
    <p>4.1.4. Mehnat qonunchiligi va ushbu shartnoma shartlariga rioya qilish.</p>
    
    <p style="margin-top: 10px;"><b>4.2. Xodimning majburiyatlari:</b></p>
    <p>4.2.1. Amaldagi qonun hujjatlari, mazkur shartnoma, maktab ma'muriyati hujjatlari, maktabning mehnat tartibi, Odob-axloq qoidalari, lavozim yo'riqnomasi va boshqa hujjatlarga asosan ish yuritish va ularga to'liq so'zsiz rioya qilish;</p>
    <p>4.2.2. Belgilangan mehnatni muhofaza qilish va xavfsizlik texnikasi qoidalariga rioya qilish;</p>
    <p>4.2.3. Ish beruvchining buyruqlari, farmoyishlari, boshqa topshiriq va ko'rsatmalarini bajarish, ularning bajarilishini ta'minlash;</p>
    <p>4.2.4. Lavozim vazifasini amalga oshirish vaqtida o'ziga ma'lum bo'lgan ma'lumotlarni, shuningdek xizmatga doir hujjatlar va mohiyati maxfiylikni anglatuvchi barcha axborotlarni tarqatmaslik, oshkor etmaslik va undan qonun va boshqa hujjatlarda nazarda tutilmagan hollardan tashqari foydalanmaslik;</p>
    <p>4.2.5. O'z faoliyatida korrupsiyaviy omillarga yo'l qo'ymaslik, tizimli asosda yashirin iqtisodiyotni bartaraf qilish va korrupsiyaga qarshi kurashish choralarini ko'rish;</p>
    <p>4.2.6. Shaxsiy-oilaviy masalalarining mehnat munosabatlariga oid ishchanlik obro'siga putur yetkazmasligini ta'minlash;</p>

    <p style="margin-top: 10px;"><b>4.3. Ish beruvchining huquqlari:</b></p>
    <p>4.3.1. Ish beruvchi ushbu shartnoma bo'yicha mehnat qonunchiligi bilan taqiqlanmagan barcha harakatlarni amalga oshirishga haqli.</p>

    <p style="margin-top: 10px;"><b>4.4. Xodimning huquqlari:</b></p>
    <p>4.4.1. Xavfsizlik va gigiyena talablariga javob beradigan sharoitlarda mehnat qilish;</p>
    <p>4.4.2. O'z vaqtida ish haqi, boshqa imtiyoz va rag'batlantirishlarni olish;</p>
    <p>4.4.3. Ushbu Shartnoma shartlariga zid bo'lmagan hamda amaldagi qonun hujjatlari bilan taqiqlanmagan harakatlarni amalga oshirish.</p>
  </div>

  <div class="section">
    <div class="section-title">V. Shartnomani bekor qilish shartlari</div>
    <p>5. Shartnoma quyidagi hollarda bekor qilinadi:</p>
    <p>5.1. Tomonlarning o'zaro kelishuviga ko'ra;</p>
    <p>5.2. Mazkur shartnomaning 4.2.-bandida nazarda tutilgan majburiyatlar xodim tomonidan bajarilmagan yoki lozim darajada bajarilmagan taqdirda ish beruvchining tashabbusi bilan;</p>
    <p>5.3. Qonunchilik hujjatlari va boshqa hujjatlarda ko'zda tutilgan boshqa qo'shimcha asoslar va sabablar mavjud bo'lgan hollarda;</p>
    <p>5.4. Xodim shartnomani bir tomonlama o'z boshimchalik bilan bekor qilishiga yo'l qo'yilmaydi, bunday hollarda BXM ning 50 baravar miqdorida jarimaga tortiladi.</p>
  </div>

  <div class="section">
    <div class="section-title">VI. Yakuniy qoidalar</div>
    <p>6.1. Ushbu shartnomada nazarda tutilmagan o'zga holatlar amaldagi qonun hujjatlari va boshqa hujjatlarga asosan tartibga solinadi.</p>
    <p>6.2. Tomonlar kelishuvi asosida kiritilgan o'zgartirishlar qo'shimcha ravishda alohida rasmiylashtiriladi va mehnat shartnomasiga ilova qilinib boriladi.</p>
    <p>6.3. Mazkur shartnomaning biron-bir sharti o'z kuchini yo'qotgan taqdirda ushbu mehnat shartnomasining qolgan qismi o'z kuchini saqlab qoladi.</p>
    <p>6.4. Tuzilgan ushbu shartnoma uning 2.1-bandida belgilangan kundan boshlab kuchga kirgan deb hisoblanadi va 2.3-bandida ko'rsatilgan muddat davomida amalda bo'ladi.</p>
    <p>6.5. Shartnoma ikki nusxada imzolanadi, ikkalasi ham bir xil yuridik kuchga ega bo'lgan holda bir nusxasi Ish beruvchida va ikkinchi nusxasi Xodimda saqlanadi.</p>
  </div>

  <div class="signatures">
    <div class="sig-title">TOMONLARNING MANZILI VA IMZOLARI</div>
    <div class="sig-grid">
      <div class="sig-col">
        <div class="party-name">ISH BERUVCHI</div>
        <p>Manzil: Surxondaryo viloyati, Termiz sh,</p>
        <p>Jayhun MFY, Afrosiyob ko'chasi, 39-B-uy</p>
        <p>Bank: Aloqabank Termiz filiali</p>
        <p>X/R: 20208000207469699001</p>
        <p>MFO: 00401 | INN: 313048200</p>
        <div class="sig-block" style="position:relative;">
          <div class="sig-line">Direktor: ____________________</div>
          <div class="sig-line">(imzo)</div>
          <div class="sig-line" style="margin-top:20px;">ASOSCHI: ___________________</div>
          <div class="sig-line">(imzo)</div>
          <img class="muhr" src="${muhrUrl}" alt="Muhr" onerror="this.style.display='none'" style="top: -20px; left: 100px;" />
        </div>
      </div>
      <div class="sig-col">
        <div class="party-name">XODIM</div>
        <p>Ismi: <b>${employeeName || '________________'}</b></p>
        <p>Manzil: ____________________</p>
        <p>___________________________</p>
        <p>___________________________</p>
        <div class="sig-block">
          <div class="sig-line">Xodim: ____________________</div>
          <div class="sig-line">(imzo)</div>
        </div>
      </div>
    </div>

    <div style="margin-top:20px; page-break-inside:avoid;">
      <div class="section-title">Quyidagi hujjatlar bilan tanishdim:</div>
      <table class="doc-table">
        <thead><tr><th>Hujjat nomi</th><th>Imzo</th></tr></thead>
        <tbody>
          ${docs.map(d => `<tr><td>${d}</td><td></td></tr>`).join('\n          ')}
        </tbody>
      </table>
    </div>
  </div>

  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 600); });</script>
</body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) { alert("Pop-up blokirovka qilingan. Iltimos pop-up ruxsatini bering."); return; }
  w.document.write(html);
  w.document.close();
}
