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
        {/* Large Faint Watermark */}
        <div className="absolute inset-0 flex justify-center items-center opacity-[0.03] pointer-events-none z-0">
          <h1 className="text-[200px] font-black uppercase text-[#0e2a5c] whitespace-nowrap -rotate-12" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.05em' }}>
            Brain IT
          </h1>
        </div>

        {/* TOP LEFT GEOMETRY (Parallel Diagonal Stripes) */}
        <svg className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none z-10" viewBox="0 0 600 600">
          {/* Dark Blue Inner Corner */}
          <polygon points="0,0 180,0 0,180" fill="#0e2a5c" />
          
          {/* Light Blue Stripe 1 */}
          <polygon points="200,0 280,0 0,280 0,200" fill="#38bdf8" />
          
          {/* Dark Blue Stripe 2 */}
          <polygon points="300,0 420,0 0,420 0,300" fill="#0e2a5c" />
          
          {/* Light Blue Stripe 3 */}
          <polygon points="440,0 520,0 0,520 0,440" fill="#38bdf8" />
        </svg>

        {/* BOTTOM LEFT GEOMETRY (Parallel Diagonal Stripes) */}
        <svg className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none z-10" viewBox="0 0 600 600">
          {/* Dark Blue Corner */}
          <polygon points="0,600 0,420 180,600" fill="#0e2a5c" />
          
          {/* Light Blue Stripe 1 */}
          <polygon points="0,400 0,320 280,600 200,600" fill="#38bdf8" />
          
          {/* Dark Blue Stripe 2 */}
          <polygon points="0,300 0,180 420,600 300,600" fill="#0e2a5c" />
        </svg>

        {/* BOTTOM RIGHT TECH LINES */}
        <svg className="absolute bottom-0 right-0 w-[400px] h-[300px] pointer-events-none z-10" viewBox="0 0 400 300">
          {/* Vertical Tech Lines */}
          <path d="M350,50 L350,200 L320,230 L320,280" fill="none" stroke="#2063c6" strokeWidth="1.5" />
          <circle cx="320" cy="280" r="4" fill="#2063c6" />
          
          <path d="M380,100 L380,180 L350,210 L350,260" fill="none" stroke="#0e2a5c" strokeWidth="1.5" />
          <circle cx="350" cy="260" r="3" fill="#0e2a5c" />
          
          {/* Circuit branches connecting near signature */}
          <path d="M150,250 L250,250 L280,220 L300,220" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="150" cy="250" r="4" fill="#38bdf8" />
          
          <path d="M100,270 L200,270 L230,240 L260,240" fill="none" stroke="#0e2a5c" strokeWidth="1.5" />
          <circle cx="100" cy="270" r="3" fill="#0e2a5c" />
        </svg>

        {/* TOP RIGHT LOGO */}
        <div className="absolute top-12 right-16 z-20">
          <img src="/logo.png" alt="Brain IT Academy" className="h-20 object-contain drop-shadow-sm" />
        </div>

        {/* MAIN CENTER CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center pt-[180px] z-30">
          
          {/* SERTIFIKAT Title */}
          <h1 className="text-[80px] font-serif text-[#0e2a5c] tracking-[0.1em] uppercase leading-none mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            SERTIFIKAT
          </h1>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-32 h-[1px] bg-[#0e2a5c]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0e2a5c]"></div>
            <div className="w-4 h-4 border border-[#0e2a5c] rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#0e2a5c] rotate-45"></div>
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
          <div className="flex flex-col items-center pb-2">
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
