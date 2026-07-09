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
        className="relative bg-white w-[1000px] h-[707px] overflow-hidden flex"
        style={{
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          color: '#1a1a1a',
        }}
      >
        {/* Left Accent Bar */}
        <div className="w-4 h-full bg-[#059669] shrink-0"></div>
        <div className="w-1 h-full bg-[#34d399] shrink-0 ml-1"></div>

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-20 pointer-events-none"></div>

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col pt-16 pb-16 px-20 relative z-10">
          
          {/* Header Row */}
          <div className="flex justify-between items-start mb-24">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Brain IT Academy Logo" className="h-[72px] object-contain" />
              <div className="border-l-[1.5px] border-emerald-300 pl-4 py-1">
                <h2 className="text-2xl font-black tracking-tight text-emerald-950 uppercase leading-none">Brain IT<br/>Academy</h2>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1">
            <p className="text-zinc-400 font-bold tracking-[0.25em] uppercase text-[11px] mb-2">
              Berilgan sana: {new Date(issueDate).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <h1 className="text-6xl font-black mb-12 text-[#1a1a1a] capitalize" style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.02em' }}>
              {studentName}
            </h1>
            
            <p className="text-zinc-600 text-[15px] max-w-2xl leading-relaxed">
              ushbu o'quvchi Brain IT Academy tomonidan tashkil etilgan onlayn/oflayn o'quv dasturida qatnashdi va quyidagi kursni muvaffaqiyatli tamomladi:
            </p>

            <h2 className="text-[26px] font-bold text-emerald-900 mt-6 mb-8 max-w-3xl">
              {courseName}
            </h2>
            
            <p className="text-zinc-500 text-[13px] max-w-xl leading-relaxed">
              Mazkur sertifikat egasi tanlangan yo'nalish bo'yicha nazariy va amaliy bilimlarni o'zlashtirib, yakuniy imtihonlardan muvaffaqiyatli o'tganini tasdiqlaydi.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end mt-12 w-full border-t border-zinc-200 pt-8">
            <div className="flex items-end gap-16">
              <div className="flex flex-col relative">
                <span style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '2.5rem', color: '#064e3b', opacity: 0.9, transform: 'rotate(-2deg)', marginBottom: '-10px', display: 'inline-block' }}>
                  J. Omonov
                </span>
                <div className="w-48 border-b-[1.5px] border-zinc-400 mb-2 mt-2"></div>
                <p className="text-[13px] font-bold text-zinc-800">Jahongir Omonov</p>
                <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Akademiya Direktori<br/>Brain IT Academy</p>
              </div>

              {/* Verified Badge */}
              <div className="flex flex-col items-center opacity-90 pb-2">
                <svg width="70" height="70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="46" stroke="#059669" strokeWidth="2" />
                    <circle cx="50" cy="50" r="38" stroke="#059669" strokeWidth="1" strokeDasharray="3 3"/>
                    <path d="M35 50L45 60L65 38" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-[9px] font-bold text-emerald-700 tracking-widest uppercase mt-2">Tasdiqlangan</p>
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm mb-3">
                <QRCode value={verifyUrl} size={60} level="H" fgColor="#1a1a1a" />
              </div>
              <p className="text-[10px] font-semibold text-zinc-500">Sertifikatni tekshirish:</p>
              <p className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">{certificateNumber}</p>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
