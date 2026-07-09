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
        className="relative bg-white w-[800px] h-[565px] flex flex-col justify-between overflow-hidden shadow-2xl"
        style={{
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          color: '#1a1a1a',
        }}
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600"></div>
        <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-60"></div>

        {/* Certificate Border */}
        <div className="absolute inset-4 border border-zinc-200 pointer-events-none rounded-sm"></div>
        <div className="absolute inset-5 border-2 border-brand-100 pointer-events-none rounded-sm"></div>

        {/* Header */}
        <div className="flex justify-between items-start pt-12 px-16 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-brand-900">BRAIN</h2>
              <p className="text-xs text-brand-600 tracking-widest uppercase font-semibold">O'quv Markazi</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Sertifikat №</p>
            <p className="font-mono text-zinc-900 font-bold">{certificateNumber}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-20 relative z-10 -mt-8">
          <p className="text-sm font-semibold text-brand-600 tracking-[0.2em] uppercase mb-4">
            Muvaqqiyatli bitiruv sertifikati
          </p>
          
          <h1 className="text-5xl font-bold mb-6 text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {studentName}
          </h1>
          
          <p className="text-zinc-600 max-w-lg leading-relaxed text-sm">
            Ushbu sertifikat egasi Brain o'quv markazining 
            <span className="font-bold text-zinc-900 mx-1">{courseName}</span> 
            kursini muvaffaqiyatli tamomlagani va kerakli bilimlarni o'zlashtirgani uchun berildi.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end pb-12 px-16 relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-40 border-b border-zinc-400 mb-2"></div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Berilgan Sana</p>
            <p className="text-sm font-bold mt-1 text-zinc-900">{new Date(issueDate).toLocaleDateString('uz-UZ')}</p>
          </div>
          
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-12 opacity-80 mix-blend-multiply">
               <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="1" />
                  <text x="50" y="30" fontSize="8" fill="#ef4444" textAnchor="middle" transform="rotate(-15 50 50)">TASDIQLANGAN</text>
                  <text x="50" y="75" fontSize="8" fill="#ef4444" textAnchor="middle" transform="rotate(-15 50 50)">BRAIN EDU</text>
                  <path d="M40 50L47 57L60 40" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
            <div className="w-40 border-b border-zinc-400 mb-2 mt-6"></div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Direktor</p>
            <p className="text-sm font-bold mt-1 text-zinc-900">Alisher Rustamov</p>
          </div>

          <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm border border-zinc-100">
            <QRCode value={verifyUrl} size={64} level="M" />
            <p className="text-[8px] text-zinc-400 mt-2 font-mono">Skanerlang</p>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
