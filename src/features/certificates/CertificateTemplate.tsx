import React, { forwardRef } from 'react';
import QRCode from 'react-qr-code';

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  issueDate: string;
  certificateNumber: string;
  verifyUrl: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ studentName, courseName, issueDate, certificateNumber, verifyUrl }, ref) => {
    return (
      <div
        ref={ref}
        className="relative bg-[#f8f9fa] w-[1000px] h-[707px] flex flex-col justify-between overflow-hidden"
        style={{
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          color: '#1a1a1a',
        }}
      >
        {/* Ornate Background & Borders */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-multiply"></div>
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-800 z-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-800 z-30"></div>
        
        {/* Corner Ornaments */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-emerald-700/20 rounded-tl-3xl m-6"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-emerald-700/20 rounded-tr-3xl m-6"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-emerald-700/20 rounded-bl-3xl m-6"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-emerald-700/20 rounded-br-3xl m-6"></div>

        {/* Certificate Inner Border */}
        <div className="absolute inset-10 border border-emerald-900/10 pointer-events-none rounded-xl"></div>
        <div className="absolute inset-11 border-[3px] border-emerald-800/10 pointer-events-none rounded-xl"></div>

        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px]"></div>

        {/* Coursera-style Hanging Ribbon on the Right */}
        <div className="absolute top-0 right-14 w-44 h-[75%] bg-white/90 backdrop-blur-sm border-x border-b border-emerald-800/10 z-20 shadow-xl flex flex-col items-center pt-24" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 92%, 0 100%)' }}>
            <p className="text-emerald-800 font-bold tracking-[0.2em] text-[10px] leading-relaxed text-center opacity-80">
              COURSE<br/>CERTIFICATE
            </p>
            {/* Stamp / Seal moved into the ribbon */}
            <div className="mt-20 opacity-90 drop-shadow-md mix-blend-multiply">
               <svg width="110" height="110" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" stroke="#059669" strokeWidth="2" strokeDasharray="5 5" />
                  <circle cx="50" cy="50" r="39" stroke="#059669" strokeWidth="1" fill="#ecfdf5" fillOpacity="0.5" />
                  <circle cx="50" cy="50" r="28" stroke="#059669" strokeWidth="0.5" />
                  <path d="M38 50L45 57L62 40" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <text x="50" y="24" fontSize="7" fill="#064e3b" fontWeight="bold" textAnchor="middle" transform="rotate(-15 50 50)" letterSpacing="1">BRAIN IT ACADEMY</text>
                  <text x="50" y="81" fontSize="7" fill="#064e3b" fontWeight="bold" textAnchor="middle" transform="rotate(15 50 50)" letterSpacing="1">OFFICIAL SEAL</text>
               </svg>
            </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start pt-16 px-24 relative z-10">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Brain IT Academy Logo" className="h-16 object-contain drop-shadow-md" />
            <div className="border-l-2 border-emerald-200 pl-4">
              <h2 className="text-xl font-black tracking-tight text-emerald-950 uppercase">Brain IT Academy</h2>
              <p className="text-[10px] text-emerald-700 tracking-[0.3em] uppercase font-bold mt-0.5">Innovatsion Ta'lim</p>
            </div>
          </div>
          {/* Certificate Number - Positioned carefully to not overlap the ribbon */}
          <div className="text-right flex flex-col justify-center h-16 mr-60">
            <p className="text-[10px] text-emerald-600/80 uppercase tracking-widest font-black mb-1">Sertifikat Raqami</p>
            <p className="font-mono text-emerald-950 font-bold text-lg bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">{certificateNumber}</p>
          </div>
        </div>

        {/* Content - Constrained width so it never overlaps the ribbon */}
        <div className="flex-1 flex flex-col items-start justify-center text-left pl-24 pr-64 relative z-10 mt-4">
          <p className="text-emerald-600 font-bold tracking-[0.4em] uppercase text-sm mb-6 flex items-center gap-4">
            Muvaffaqiyatli Bitiruv Sertifikati
            <span className="w-24 h-[1px] bg-emerald-300"></span>
          </p>
          
          <p className="text-zinc-500 text-sm font-medium mb-4 uppercase tracking-widest">Ushbu sertifikat rasman taqdim etiladi:</p>

          <h1 className="text-6xl font-black mb-8 text-emerald-950 capitalize drop-shadow-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
            {studentName}
          </h1>
          
          <p className="text-zinc-700 text-lg max-w-2xl leading-relaxed">
            Brain IT Academy tomonidan tashkil etilgan <span className="font-bold text-emerald-800 text-xl mx-2 border-b-2 border-emerald-200">{courseName}</span> 
            kursini to'liq va muvaffaqiyatli tamomlagani hamda soha bo'yicha amaliy bilimlarni yuqori darajada o'zlashtirgani uchun berildi.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-end pb-16 px-24 relative z-10 w-full gap-8">
          {/* Left: Date */}
          <div className="flex flex-col items-center w-40">
            <div className="w-full border-b-2 border-emerald-800/20 mb-3"></div>
            <p className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest">Berilgan Sana</p>
            <p className="text-base font-bold mt-1 text-emerald-950">{new Date(issueDate).toLocaleDateString('uz-UZ')}</p>
          </div>
          
          {/* Center: Signature (Seal was moved to the ribbon) */}
          <div className="flex flex-col items-center relative w-56 flex-1">
            <div className="w-48 border-b-2 border-emerald-800/20 mb-3 flex justify-center items-end h-16 relative z-10">
              {/* Signature Text instead of broken image */}
              <span style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '2.5rem', color: '#064e3b', opacity: 0.85, transform: 'rotate(-5deg) translateY(8px)', display: 'inline-block' }}>
                J. Omonov
              </span>
            </div>
            <p className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest relative z-10">Akademiya Direktori</p>
            <p className="text-base font-bold mt-1 text-emerald-950 relative z-10">Jahongir Omonov</p>
          </div>

          {/* Right: QR Code */}
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-lg shadow-emerald-900/5 border border-emerald-100 w-28 shrink-0 relative z-10 mr-48">
            <QRCode value={verifyUrl} size={80} level="H" fgColor="#064e3b" />
            <p className="text-[9px] text-emerald-700/70 mt-2 font-bold tracking-widest uppercase">Tasdiqlash</p>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
