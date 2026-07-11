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
          color: '#0e2a5c',
        }}
      >
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex justify-end items-center pr-20 opacity-[0.04] pointer-events-none z-0">
          <img src="/logo.png" alt="watermark" className="w-[700px] h-[700px] object-contain grayscale" />
        </div>

        {/* TOP LEFT GEOMETRY */}
        <div className="absolute top-0 left-0 z-10 pointer-events-none">
          <div className="absolute w-[550px] h-[550px] border-[50px] border-[#38bdf8]" style={{ top: '-250px', left: '-250px', transform: 'rotate(45deg)' }}></div>
          <div className="absolute w-[450px] h-[450px] border-[50px] border-[#0e2a5c]" style={{ top: '-240px', left: '-240px', transform: 'rotate(45deg)' }}></div>
          <div className="absolute w-[350px] h-[350px] bg-[#2063c6]" style={{ top: '-220px', left: '-220px', transform: 'rotate(45deg)' }}></div>
        </div>

        {/* BOTTOM LEFT GEOMETRY */}
        <div className="absolute bottom-0 left-0 z-10 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] bg-[#0e2a5c]" style={{ bottom: '-350px', left: '-200px', transform: 'rotate(45deg)' }}></div>
          <div className="absolute w-[350px] h-[350px] bg-[#38bdf8]" style={{ bottom: '-280px', left: '-120px', transform: 'rotate(45deg)' }}></div>
          <div className="absolute w-[250px] h-[250px] bg-[#2063c6]" style={{ bottom: '-200px', left: '-150px', transform: 'rotate(45deg)' }}></div>
        </div>

        {/* TECH LINES SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 707">
          {/* Bottom Right Vertical Tech Lines */}
          <path d="M920,200 L920,500 L950,530 L950,600" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <circle cx="950" cy="600" r="5" fill="#e2e8f0" />
          
          <path d="M960,300 L960,450 L930,480 L930,550" fill="none" stroke="#0e2a5c" strokeWidth="1.5" />
          <circle cx="930" cy="550" r="4" fill="#0e2a5c" />
          
          <path d="M980,400 L980,500 L960,520 L960,580" fill="none" stroke="#2063c6" strokeWidth="1.5" />
          <circle cx="960" cy="580" r="4" fill="#2063c6" />

          {/* Bottom Center Horizontal Tech Lines */}
          <path d="M450,660 L600,660 L630,690 L700,690" fill="none" stroke="#0e2a5c" strokeWidth="2" />
          <circle cx="700" cy="690" r="4" fill="#0e2a5c" />
          
          <path d="M500,680 L650,680 L670,660 L750,660" fill="none" stroke="#2063c6" strokeWidth="1.5" />
          <circle cx="750" cy="660" r="3" fill="#2063c6" />
        </svg>

        {/* TOP RIGHT LOGO */}
        <div className="absolute top-12 right-16 z-20">
          <img src="/logo.png" alt="Brain IT Academy" className="h-20 object-contain drop-shadow-sm" />
        </div>

        {/* MAIN CENTER CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center pt-[150px] z-30">
          
          {/* SERTIFIKAT Title */}
          <h1 className="text-[72px] font-serif text-[#0e2a5c] tracking-[0.08em] uppercase leading-none mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            SERTIFIKAT
          </h1>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="w-24 h-[1px] bg-[#0e2a5c]"></div>
            <div className="w-2 h-2 rounded-full bg-[#0e2a5c]"></div>
            <div className="w-4 h-4 border border-[#0e2a5c] rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#0e2a5c] rotate-45"></div>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#0e2a5c]"></div>
            <div className="w-24 h-[1px] bg-[#0e2a5c]"></div>
          </div>

          {/* Student Name */}
          <h2 className="text-[64px] text-[#2063c6] capitalize mb-6 leading-none px-12" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', 'Lucida Handwriting', cursive" }}>
            {studentName}
          </h2>

          {/* Thin Gold Line */}
          <div className="w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-10"></div>

          {/* Course Description */}
          <p className="text-[#0e2a5c] text-[22px] leading-loose text-center max-w-[700px]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ushbu sertifikat <span className="font-bold">“Brain IT academy”</span> sining <br/>
            <span className="font-bold text-[#2063c6]">“{courseName}”</span> kursini <br/>
            muvaffaqiyatli bitirgani uchun taqdim etildi
          </p>

        </div>

        {/* BOTTOM FOOTER AREA */}
        <div className="absolute bottom-16 left-0 w-full px-24 flex justify-between items-end z-40">
          
          {/* Left: Director */}
          <div className="flex flex-col items-center w-56">
            <p className="text-[#0e2a5c] text-[18px] font-bold text-center leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
              Brain IT academiyasi<br/>direktori
            </p>
          </div>

          {/* Center: Date and ID */}
          <div className="flex flex-col items-center pb-2">
            <p className="text-[#0e2a5c] text-[15px] font-bold tracking-widest mb-2">SANA: <span className="font-mono">{new Date(issueDate).toLocaleDateString('uz-UZ')}</span></p>
            <p className="text-[#0e2a5c] text-[15px] font-bold tracking-widest">ID: <span className="font-mono">{certificateNumber}</span></p>
          </div>

          {/* Right: Signature Line & QR */}
          <div className="flex items-end gap-6 w-56">
            {/* QR Code */}
            <div className="p-1.5 bg-white rounded border border-[#e2e8f0] shadow-sm mb-1">
              <QRCode value={verifyUrl} size={48} level="M" fgColor="#0e2a5c" />
            </div>
            {/* Signature Line */}
            <div className="flex-1 flex flex-col items-center justify-end h-full">
              {/* Optional: Add electronic signature image here if provided */}
              <div className="w-full h-[1.5px] bg-[#0e2a5c] mt-12 relative">
                <span className="absolute -top-10 left-1/2 -translate-x-1/2" style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '2rem', color: '#0e2a5c', transform: 'translateX(-50%) rotate(-5deg)' }}>
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
