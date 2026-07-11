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
        // A4 format landscape (1123px x 794px at 96 DPI)
        className="relative bg-white w-[1123px] h-[794px] overflow-hidden"
        style={{
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          color: '#0e2a5c',
        }}
      >
        {/* Large Central Watermark */}
        <div className="absolute inset-0 flex justify-center items-center opacity-[0.04] pointer-events-none z-0">
          <img src="/logo.png" alt="watermark" className="w-[600px] h-[600px] object-contain grayscale" />
        </div>

        {/* TOP LEFT GEOMETRY (Nested Chevrons using solid boxes with white borders) */}
        <div className="absolute top-0 left-0 z-10 pointer-events-none">
          {/* Outer Light Blue */}
          <div className="absolute w-[800px] h-[800px] bg-[#38bdf8] border-[18px] border-white shadow-sm" style={{ top: '-400px', left: '-400px', transform: 'rotate(45deg)' }}></div>
          {/* Middle Dark Blue */}
          <div className="absolute w-[620px] h-[620px] bg-[#0e2a5c] border-[18px] border-white shadow-sm" style={{ top: '-310px', left: '-310px', transform: 'rotate(45deg)' }}></div>
          {/* Inner Light Blue */}
          <div className="absolute w-[440px] h-[440px] bg-[#38bdf8] border-[18px] border-white shadow-sm" style={{ top: '-220px', left: '-220px', transform: 'rotate(45deg)' }}></div>
          {/* Corner Dark Blue */}
          <div className="absolute w-[260px] h-[260px] bg-[#0e2a5c] border-[18px] border-white shadow-sm" style={{ top: '-130px', left: '-130px', transform: 'rotate(45deg)' }}></div>
        </div>

        {/* BOTTOM LEFT GEOMETRY */}
        <div className="absolute bottom-0 left-0 z-10 pointer-events-none">
          {/* Outer Dark Blue */}
          <div className="absolute w-[620px] h-[620px] bg-[#0e2a5c] border-[18px] border-white shadow-sm" style={{ bottom: '-310px', left: '-310px', transform: 'rotate(45deg)' }}></div>
          {/* Middle Light Blue */}
          <div className="absolute w-[440px] h-[440px] bg-[#38bdf8] border-[18px] border-white shadow-sm" style={{ bottom: '-220px', left: '-220px', transform: 'rotate(45deg)' }}></div>
          {/* Corner Dark Blue */}
          <div className="absolute w-[260px] h-[260px] bg-[#0e2a5c] border-[18px] border-white shadow-sm" style={{ bottom: '-130px', left: '-130px', transform: 'rotate(45deg)' }}></div>
        </div>

        {/* BOTTOM RIGHT TECH LINES */}
        <svg className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none z-10" viewBox="0 0 500 300">
          {/* Horizontal Tech Lines extending from the left */}
          <path d="M50,260 L200,260 L240,220 L320,220" fill="none" stroke="#0e2a5c" strokeWidth="2" />
          <circle cx="320" cy="220" r="4" fill="#0e2a5c" />
          
          <path d="M120,280 L230,280 L260,250 L340,250" fill="none" stroke="#2063c6" strokeWidth="1.5" />
          <circle cx="340" cy="250" r="3" fill="#2063c6" />
          
          <path d="M180,240 L260,240 L280,220 L300,220" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="180" cy="240" r="3" fill="#38bdf8" />

          {/* Vertical Tech Lines on the right edge */}
          <path d="M460,50 L460,200 L430,230 L430,280" fill="none" stroke="#2063c6" strokeWidth="1.5" />
          <circle cx="430" cy="280" r="4" fill="#2063c6" />
          
          <path d="M480,100 L480,180 L450,210 L450,260" fill="none" stroke="#0e2a5c" strokeWidth="1.5" />
          <circle cx="450" cy="260" r="3" fill="#0e2a5c" />
        </svg>

        {/* TOP RIGHT LOGO */}
        <div className="absolute top-16 right-20 z-20">
          <img src="/logo.png" alt="Brain IT Academy" className="h-20 object-contain drop-shadow-sm" />
        </div>

        {/* MAIN CENTER CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center pt-[180px] z-30">
          
          {/* SERTIFIKAT Title */}
          <h1 className="text-[80px] font-serif text-[#0e2a5c] tracking-[0.1em] uppercase leading-none mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            SERTIFIKAT
          </h1>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="w-32 h-[1px] bg-[#0e2a5c]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0e2a5c]"></div>
            <div className="w-5 h-5 border border-[#0e2a5c] rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#0e2a5c] rotate-45"></div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0e2a5c]"></div>
            <div className="w-32 h-[1px] bg-[#0e2a5c]"></div>
          </div>

          {/* Student Name */}
          <h2 className="text-[72px] text-[#2063c6] capitalize mb-8 leading-none px-12" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', 'Lucida Handwriting', cursive" }}>
            {studentName}
          </h2>

          {/* Thin Gold Line */}
          <div className="w-[700px] h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-10 opacity-70"></div>

          {/* Course Description */}
          <p className="text-[#0e2a5c] text-[24px] leading-loose text-center max-w-[800px]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ushbu sertifikat <span className="font-bold">“Brain IT academy”</span> sining <br/>
            <span className="font-bold text-[#2063c6]">“{courseName}”</span> kursini <br/>
            muvaffaqiyatli bitirgani uchun taqdim etildi
          </p>

        </div>

        {/* BOTTOM FOOTER AREA */}
        <div className="absolute bottom-20 left-0 w-full px-32 flex justify-between items-end z-40">
          
          {/* Left: Director */}
          <div className="flex flex-col items-center w-64 pb-2">
            <p className="text-[#0e2a5c] text-[20px] font-bold text-center leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
              Brain IT academiyasi<br/>direktori
            </p>
          </div>

          {/* Center: Date and ID */}
          <div className="flex flex-col items-center pb-2 pl-10">
            <p className="text-[#0e2a5c] text-[16px] font-bold tracking-widest mb-3">SANA: <span className="font-mono">{new Date(issueDate).toLocaleDateString('uz-UZ')}</span></p>
            <p className="text-[#0e2a5c] text-[16px] font-bold tracking-widest">ID: <span className="font-mono">{certificateNumber}</span></p>
          </div>

          {/* Right: Signature Line & QR */}
          <div className="flex items-end gap-6 w-80">
            {/* QR Code */}
            <div className="p-1.5 bg-white rounded border border-[#e2e8f0] shadow-sm mb-1 z-20">
              <QRCode value={verifyUrl} size={64} level="M" fgColor="#0e2a5c" />
            </div>
            {/* Signature Line */}
            <div className="flex-1 flex flex-col items-center justify-end h-full z-20 pb-4">
              <div className="w-[180px] h-[2px] bg-[#0e2a5c] relative">
                <span className="absolute -top-14 left-1/2 -translate-x-1/2" style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '2.5rem', color: '#0e2a5c', transform: 'translateX(-50%) rotate(-5deg)', whiteSpace: 'nowrap' }}>
                  J. Omonov
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
