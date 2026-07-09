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
          // A pure CSS pattern that won't trigger CORS issues in html2canvas
          backgroundImage: 'radial-gradient(#059669 0.5px, transparent 0.5px), radial-gradient(#059669 0.5px, #f8f9fa 0.5px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      >
        {/* Soft overlay to make the dots very faint */}
        <div className="absolute inset-0 bg-white/95"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-white/80"></div>

        {/* Thin Green Borders on Left and Right sides */}
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-emerald-700 z-30"></div>
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-emerald-700 z-30"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-700 z-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-emerald-700 z-30"></div>
        
        {/* Corner Ornaments (Simplified for html2canvas) */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-[6px] border-l-[6px] border-emerald-700/30 rounded-tl-3xl m-8 z-20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t-[6px] border-r-[6px] border-emerald-700/30 rounded-tr-3xl m-8 z-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-[6px] border-l-[6px] border-emerald-700/30 rounded-bl-3xl m-8 z-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-[6px] border-r-[6px] border-emerald-700/30 rounded-br-3xl m-8 z-20"></div>

        {/* Certificate Inner Border */}
        <div className="absolute inset-10 border border-emerald-900/10 rounded-xl z-10"></div>
        
        {/* PREMIUM DARK EMERALD RIBBON ON THE RIGHT - Moved inwards (right-24) */}
        <div className="absolute top-0 right-24 w-36 h-[72%] bg-[#064e3b] z-40 shadow-2xl flex flex-col items-center pt-20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 92%, 0 100%)' }}>
            <p className="text-amber-400 font-bold tracking-[0.2em] text-[10px] leading-relaxed text-center mb-16">
              COURSE<br/>CERTIFICATE
            </p>
            {/* Gold Seal inside the ribbon */}
            <div className="relative w-[100px] h-[100px]">
               <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                  <circle cx="50" cy="50" r="46" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="50" cy="50" r="40" stroke="#fbbf24" strokeWidth="1" fill="#fbbf24" fillOpacity="0.1" />
                  <circle cx="50" cy="50" r="28" stroke="#fbbf24" strokeWidth="0.5" />
                  <path d="M38 50L45 57L62 40" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <text x="50" y="22" fontSize="6.5" fill="#fbbf24" fontWeight="bold" textAnchor="middle" transform="rotate(-15 50 50)" letterSpacing="1.5">BRAIN IT ACADEMY</text>
                  <text x="50" y="83" fontSize="6.5" fill="#fbbf24" fontWeight="bold" textAnchor="middle" transform="rotate(15 50 50)" letterSpacing="1.5">OFFICIAL SEAL</text>
               </svg>
            </div>
        </div>

        {/* LEFT CONTENT AREA - Width 700px out of 1000px, guarantees no overlap with the right ribbon */}
        <div className="absolute inset-0 w-[720px] h-full flex flex-col justify-between pt-16 pb-16 pl-24 pr-16 z-20">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Brain IT Academy Logo" className="h-16 object-contain" />
              <div className="border-l-2 border-emerald-400 pl-4 py-1">
                <h2 className="text-[22px] font-black tracking-tight text-emerald-950 uppercase leading-none">Brain IT<br/>Academy</h2>
              </div>
            </div>
            {/* Certificate Number */}
            <div className="text-right flex flex-col justify-center h-16 pt-2">
              <p className="text-[9px] text-emerald-700 uppercase tracking-widest font-black mb-1">Sertifikat Raqami</p>
              <p className="font-mono text-emerald-950 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{certificateNumber}</p>
            </div>
          </div>

          {/* Main Text Content */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-emerald-700 font-bold tracking-[0.3em] uppercase text-xs mb-6 flex items-center gap-4">
              Muvaffaqiyatli Bitiruv Sertifikati
              <span className="flex-1 h-[1px] bg-emerald-300"></span>
            </p>
            
            <p className="text-zinc-500 text-[13px] font-medium mb-3 uppercase tracking-widest">Ushbu sertifikat rasman taqdim etiladi:</p>

            <h1 className="text-[52px] font-black mb-6 text-[#1a1a1a] capitalize leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {studentName}
            </h1>
            
            <p className="text-zinc-700 text-base max-w-[550px] leading-relaxed">
              Brain IT Academy tomonidan tashkil etilgan <span className="font-bold text-emerald-800 text-lg mx-1 border-b-[1.5px] border-emerald-400">{courseName}</span> 
              kursini to'liq va muvaffaqiyatli tamomlagani hamda soha bo'yicha amaliy bilimlarni yuqori darajada o'zlashtirgani uchun berildi.
            </p>
          </div>

          {/* Footer - Date, Signature, QR Code */}
          <div className="flex justify-between items-end w-full pt-8">
            
            {/* Date */}
            <div className="flex flex-col items-center w-32">
              <div className="w-full border-b-2 border-emerald-800/20 mb-2"></div>
              <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Berilgan Sana</p>
              <p className="text-sm font-bold mt-1 text-[#1a1a1a]">{new Date(issueDate).toLocaleDateString('uz-UZ')}</p>
            </div>
            
            {/* Signature */}
            <div className="flex flex-col items-center w-48 relative">
              <div className="w-full border-b-2 border-emerald-800/20 mb-2 flex justify-center items-end h-16 relative z-10">
                {/* Temp Signature */}
                <span style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '2.2rem', color: '#064e3b', transform: 'rotate(-5deg) translateY(6px)', display: 'inline-block' }}>
                  J. Omonov
                </span>
              </div>
              <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest relative z-10">Akademiya Direktori</p>
              <p className="text-sm font-bold mt-1 text-[#1a1a1a] relative z-10">Jahongir Omonov</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center p-2 bg-white rounded-xl border border-emerald-200 shrink-0 relative z-10 shadow-sm">
              <QRCode value={verifyUrl} size={64} level="M" fgColor="#064e3b" />
              <p className="text-[8px] text-emerald-700 mt-1.5 font-bold tracking-widest uppercase">Tasdiqlash</p>
            </div>

          </div>
        </div>

      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
