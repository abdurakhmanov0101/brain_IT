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
        className="relative bg-[#f4f7f6] w-[1000px] h-[707px] overflow-hidden"
        style={{
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          color: '#1a1a1a',
          // Faint radial repeating background to simulate the guilloche pattern safely
          backgroundImage: 'radial-gradient(circle at center, #cbd5e1 0.5px, transparent 0.5px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* SVG Waves Background */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 707">
          {/* Gold Wave */}
          <path d="M400,0 L1000,0 L1000,250 C700,200 600,100 400,0 Z" fill="#d4af37" />
          {/* Dark Blue Wave */}
          <path d="M0,0 L1000,0 L1000,120 C600,150 200,250 0,350 Z" fill="#1e3a5f" />
        </svg>

        {/* Top Left Title */}
        <div className="absolute top-16 left-16 z-10">
          <div className="flex items-center gap-4 mb-2">
            <img src="/logo.png" alt="Brain IT Academy Logo" className="h-14 object-contain brightness-0 invert" />
            <div className="border-l-[1.5px] border-[#d4af37] pl-3">
              <h2 className="text-xl font-black tracking-tight text-white uppercase leading-none">Brain IT<br/>Academy</h2>
            </div>
          </div>
          <h1 className="text-6xl font-serif text-[#d4af37] drop-shadow-md tracking-wide mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            CERTIFICATE
          </h1>
          <h2 className="text-xl text-white tracking-[0.2em] uppercase font-medium ml-1 mt-1">
            of Achievement
          </h2>
        </div>

        {/* Vertical Blue Ribbon */}
        <div className="absolute top-0 bottom-0 left-[180px] w-[60px] bg-[#1e3a5f] border-l-4 border-r-4 border-[#d4af37] z-10 shadow-lg"></div>

        {/* Gold Seal Pinned on Ribbon */}
        <div className="absolute top-[380px] left-[135px] w-[150px] h-[150px] z-20">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            {/* Outer ruffled edge */}
            <path d="M50 0 L55 5 L63 2 L66 9 L75 8 L76 16 L84 17 L83 25 L91 29 L88 36 L96 42 L92 49 L98 56 L91 61 L95 69 L87 72 L89 80 L80 81 L79 89 L70 88 L67 96 L58 93 L53 99 L45 95 L39 100 L32 94 L25 99 L20 92 L12 95 L9 87 L1 88 L1 80 L-5 77 L0 69 L-4 61 L2 54 L-2 46 L5 40 L3 32 L11 27 L11 19 L19 16 L21 8 L30 8 L34 1 L42 4 Z" fill="#d4af37" />
            {/* Inner rings */}
            <circle cx="50" cy="50" r="38" fill="#1e3a5f" />
            <circle cx="50" cy="50" r="36" fill="#d4af37" />
            <circle cx="50" cy="50" r="34" fill="#1e3a5f" />
            <circle cx="50" cy="50" r="32" fill="#d4af37" />
            {/* Seal Text */}
            <text x="50" y="45" fontSize="12" fill="#1e3a5f" fontWeight="bold" textAnchor="middle" fontFamily="'Playfair Display', serif">BEST</text>
            <text x="50" y="58" fontSize="11" fill="#1e3a5f" fontWeight="bold" textAnchor="middle" fontFamily="'Inter', sans-serif">STUDENT</text>
            <text x="50" y="70" fontSize="10" fill="#1e3a5f" fontWeight="bold" textAnchor="middle" fontFamily="'Inter', sans-serif">{new Date().getFullYear()}</text>
          </svg>
          
          {/* Seal Tails */}
          <svg viewBox="0 0 100 50" className="absolute -bottom-[35px] left-[15px] w-[120px] h-[60px] -z-10 drop-shadow-md">
            <path d="M10 0 L30 50 L45 35 L50 0 Z" fill="#b89324" />
            <path d="M90 0 L70 50 L55 35 L50 0 Z" fill="#b89324" />
          </svg>
        </div>

        {/* Main Content Area (to the right of the ribbon) */}
        <div className="absolute inset-0 left-[260px] top-[180px] pr-20 flex flex-col z-10">
          
          {/* Right Aligned Introductory Text */}
          <div className="text-right mb-12">
            <h3 className="text-[#1e3a5f] text-lg font-bold uppercase tracking-widest mb-1">
              This Certificate
            </h3>
            <h4 className="text-[#1a1a1a] text-base font-bold uppercase tracking-wider mb-1">
              Is proudly presented
            </h4>
            <p className="text-[#1a1a1a] text-sm font-semibold uppercase tracking-wider">
              For honorable achievement to
            </p>
          </div>

          {/* Student Name */}
          <div className="text-center w-full mb-8">
            <h1 className="text-[56px] text-[#1a1a1a] font-normal leading-none capitalize px-8" 
                style={{ fontFamily: "'Brush Script MT', 'Great Vibes', 'Lucida Handwriting', cursive" }}>
              {studentName}
            </h1>
            <div className="w-full h-[1.5px] bg-[#1a1a1a] mt-4"></div>
          </div>

          {/* Course Details */}
          <div className="text-center w-full mb-12">
            <h2 className="text-[#1e3a5f] text-2xl font-bold uppercase tracking-wider mb-4">
              {courseName}
            </h2>
            <p className="text-zinc-600 text-[13px] leading-relaxed max-w-[550px] mx-auto uppercase tracking-wide">
              Brain IT Academy tomonidan tashkil etilgan ushbu o'quv dasturini to'liq va muvaffaqiyatli tamomlagani 
              hamda soha bo'yicha amaliy bilimlarni yuqori darajada o'zlashtirgani uchun berildi.
            </p>
          </div>

          {/* Signatures & Footer Area */}
          <div className="flex justify-between items-end mt-auto mb-16 px-10">
            
            {/* Left Signature */}
            <div className="flex flex-col items-center w-48 relative">
              <div className="w-full border-b-[1.5px] border-[#1a1a1a] mb-2 flex justify-center items-end h-16 relative z-10">
                <span style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '2.2rem', color: '#1e3a5f', transform: 'rotate(-5deg) translateY(6px)', display: 'inline-block' }}>
                  J. Omonov
                </span>
              </div>
              <p className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest">Akademiya Direktori</p>
            </div>

            {/* Verification / QR */}
            <div className="flex flex-col items-center justify-end px-4">
              <div className="p-1.5 bg-white rounded border border-[#d4af37]/30 shadow-sm mb-2">
                <QRCode value={verifyUrl} size={50} level="M" fgColor="#1e3a5f" />
              </div>
              <p className="text-[8px] font-bold text-[#1e3a5f] uppercase tracking-widest text-center">
                Sertifikat raqami<br/><span className="font-mono">{certificateNumber}</span>
              </p>
            </div>

            {/* Right Signature (Date) */}
            <div className="flex flex-col items-center w-48 relative">
              <div className="w-full border-b-[1.5px] border-[#1a1a1a] mb-2 flex justify-center items-end h-16 relative z-10">
                <span className="text-lg font-medium text-[#1a1a1a] mb-1">
                  {new Date(issueDate).toLocaleDateString('uz-UZ')}
                </span>
              </div>
              <p className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest">Berilgan Sana</p>
            </div>

          </div>
        </div>

      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
