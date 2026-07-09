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
        className="relative bg-white w-[1000px] h-[707px] overflow-hidden"
        style={{
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          color: '#0f172a',
          // Faint neutral slate radial background instead of green
          backgroundImage: 'radial-gradient(circle at center, #cbd5e1 0.5px, transparent 0.5px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="absolute inset-0 bg-white/80 z-0"></div>

        {/* Certificate Inner Border - Subtle Gold */}
        <div className="absolute inset-6 border-[2px] border-[#d4af37]/30 z-10 pointer-events-none"></div>
        <div className="absolute inset-7 border border-[#d4af37]/20 z-10 pointer-events-none"></div>

        {/* SVG Waves Background - Top Left (Accents) */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 707">
          {/* Gold Wave */}
          <path d="M400,0 L1000,0 L1000,250 C700,200 600,100 400,0 Z" fill="#d4af37" opacity="0.9" />
          {/* Dark Emerald Wave */}
          <path d="M0,0 L1000,0 L1000,120 C600,150 200,250 0,350 Z" fill="#064e3b" />
        </svg>

        {/* Top Left Title (Inside the wave) */}
        <div className="absolute top-12 left-16 z-20">
          <div className="flex items-center gap-4 mb-2">
            <img src="/logo.png" alt="Brain IT Academy Logo" className="h-14 object-contain brightness-0 invert" />
            <div className="border-l-[1.5px] border-[#d4af37] pl-3">
              <h2 className="text-xl font-black tracking-tight text-white uppercase leading-none">Brain IT<br/>Academy</h2>
            </div>
          </div>
          <h1 className="text-[52px] font-serif text-[#d4af37] drop-shadow-md tracking-wide mt-2 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
            CERTIFICATE
          </h1>
          <h2 className="text-lg text-emerald-50 tracking-[0.2em] uppercase font-medium ml-1 mt-1">
            of Achievement
          </h2>
        </div>

        {/* VERTICAL RIBBON ON THE RIGHT */}
        <div className="absolute top-0 right-20 w-[110px] h-[75%] bg-[#064e3b] border-l-[3px] border-r-[3px] border-[#d4af37] z-30 shadow-2xl flex flex-col items-center pt-24" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 92%, 0 100%)' }}>
            <p className="text-[#d4af37] font-bold tracking-[0.2em] text-[10px] leading-relaxed text-center mb-10">
              OFFICIAL<br/>SEAL
            </p>
            {/* Gold Seal inside the ribbon */}
            <div className="relative w-[90px] h-[90px]">
               <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 drop-shadow-lg">
                  {/* Outer ruffled edge */}
                  <path d="M50 0 L55 5 L63 2 L66 9 L75 8 L76 16 L84 17 L83 25 L91 29 L88 36 L96 42 L92 49 L98 56 L91 61 L95 69 L87 72 L89 80 L80 81 L79 89 L70 88 L67 96 L58 93 L53 99 L45 95 L39 100 L32 94 L25 99 L20 92 L12 95 L9 87 L1 88 L1 80 L-5 77 L0 69 L-4 61 L2 54 L-2 46 L5 40 L3 32 L11 27 L11 19 L19 16 L21 8 L30 8 L34 1 L42 4 Z" fill="#d4af37" />
                  {/* Inner rings */}
                  <circle cx="50" cy="50" r="38" fill="#064e3b" />
                  <circle cx="50" cy="50" r="36" fill="#d4af37" />
                  <circle cx="50" cy="50" r="34" fill="#064e3b" />
                  <circle cx="50" cy="50" r="32" fill="#d4af37" />
                  {/* Seal Text */}
                  <text x="50" y="45" fontSize="12" fill="#064e3b" fontWeight="bold" textAnchor="middle" fontFamily="'Playfair Display', serif">BEST</text>
                  <text x="50" y="58" fontSize="10" fill="#064e3b" fontWeight="bold" textAnchor="middle" fontFamily="'Inter', sans-serif">STUDENT</text>
                  <text x="50" y="70" fontSize="10" fill="#064e3b" fontWeight="bold" textAnchor="middle" fontFamily="'Inter', sans-serif">{new Date().getFullYear()}</text>
               </svg>
            </div>
        </div>

        {/* LEFT CONTENT AREA - Neutral Colors Only */}
        <div className="absolute inset-0 w-[720px] h-full flex flex-col justify-end pt-64 pb-16 pl-20 pr-10 z-20">
          
          {/* Certificate Number */}
          <div className="absolute top-[270px] right-8 text-right">
             <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Sertifikat Raqami</p>
             <p className="font-mono text-slate-800 font-bold text-sm bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{certificateNumber}</p>
          </div>

          <div className="text-left mb-6 mt-8">
            <h4 className="text-slate-800 text-base font-bold uppercase tracking-widest mb-1">
              Ushbu sertifikat rasman taqdim etiladi
            </h4>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              For honorable achievement to:
            </p>
          </div>

          {/* Student Name */}
          <div className="text-left w-full mb-6">
            <h1 className="text-[56px] text-slate-900 font-normal leading-none capitalize" 
                style={{ fontFamily: "'Brush Script MT', 'Great Vibes', 'Lucida Handwriting', cursive" }}>
              {studentName}
            </h1>
            <div className="w-[90%] h-[1px] bg-slate-300 mt-4"></div>
          </div>

          {/* Course Details */}
          <div className="text-left w-[90%] mb-12">
            <h2 className="text-slate-900 text-2xl font-black uppercase tracking-wider mb-3">
              {courseName}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed uppercase tracking-wide">
              Brain IT Academy tomonidan tashkil etilgan ushbu o'quv dasturini to'liq va muvaffaqiyatli tamomlagani 
              hamda soha bo'yicha amaliy bilimlarni yuqori darajada o'zlashtirgani uchun berildi.
            </p>
          </div>

          {/* Signatures & Footer Area */}
          <div className="flex justify-between items-end w-[90%]">
            
            {/* Left: Date */}
            <div className="flex flex-col items-center w-40 relative">
              <div className="w-full border-b-[1.5px] border-slate-400 mb-2 flex justify-center items-end h-16 relative z-10">
                <span className="text-lg font-bold text-slate-800 mb-1">
                  {new Date(issueDate).toLocaleDateString('uz-UZ')}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Berilgan Sana</p>
            </div>
            
            {/* Center: QR Code */}
            <div className="flex flex-col items-center justify-end px-4">
              <div className="p-1.5 bg-white rounded border border-slate-200 shadow-sm mb-2">
                <QRCode value={verifyUrl} size={56} level="M" fgColor="#0f172a" />
              </div>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">
                Tasdiqlash
              </p>
            </div>

            {/* Right: Signature */}
            <div className="flex flex-col items-center w-48 relative">
              <div className="w-full border-b-[1.5px] border-slate-400 mb-2 flex justify-center items-end h-16 relative z-10">
                <span style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '2.2rem', color: '#0f172a', transform: 'rotate(-5deg) translateY(6px)', display: 'inline-block' }}>
                  J. Omonov
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Akademiya Direktori</p>
              <p className="text-xs font-bold mt-1 text-slate-900 relative z-10">Jahongir Omonov</p>
            </div>

          </div>
        </div>

      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
