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
        className="relative bg-white w-[1000px] h-[707px] flex flex-col overflow-hidden"
        style={{
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          color: '#1a1a1a',
        }}
      >
        {/* Very Faint Ornate Guilloche Background (like in the image) */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' patternUnits='userSpaceOnUse' width='40' height='40' patternTransform='scale(2) rotate(0)'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='transparent'/%3E%3Cpath d='M0 20c10-10 10-10 20 0s10 10 20 0' stroke='%23d4a373' stroke-width='0.5' fill='none'/%3E%3Cpath d='M0 20c10 10 10 10 20 0s10-10 20 0' stroke='%23d4a373' stroke-width='0.5' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3C/svg%3E")`
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-emerald-50/30 z-0"></div>
        
        {/* Outer & Inner Borders */}
        <div className="absolute inset-4 border-[1px] border-zinc-400 pointer-events-none z-10"></div>
        <div className="absolute inset-[18px] border-[0.5px] border-zinc-300 pointer-events-none z-10"></div>

        {/* Right Vertical Banner overlay */}
        <div className="absolute top-0 right-32 w-52 h-[80%] bg-[#f4f5f6] border-x border-b border-zinc-300 z-20 shadow-sm flex flex-col items-center pt-24" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 92%, 0 100%)' }}>
            <p className="text-zinc-600 font-bold tracking-widest text-[11px] leading-relaxed text-center">
              COURSE<br/>CERTIFICATE
            </p>
            {/* The circular seal inside the banner */}
            <div className="mt-20 relative w-40 h-40">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-80">
                  <circle cx="50" cy="50" r="45" stroke="#1a1a1a" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="42" stroke="#1a1a1a" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="32" stroke="#1a1a1a" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="29" stroke="#1a1a1a" strokeWidth="0.5" />
                  <path d="M25 50A25 25 0 0 1 75 50A25 25 0 0 1 25 50" stroke="#1a1a1a" strokeWidth="0.2" strokeDasharray="2 2" />
                  
                  {/* Circular text */}
                  <path id="curveTop" d="M 15 50 A 35 35 0 1 1 85 50" fill="transparent" />
                  <text fontSize="7" fill="#1a1a1a" fontWeight="bold" letterSpacing="2.5">
                    <textPath href="#curveTop" startOffset="50%" textAnchor="middle">INNOVATIVE EDUCATION</textPath>
                  </text>

                  <path id="curveBottom" d="M 85 50 A 35 35 0 1 1 15 50" fill="transparent" />
                  <text fontSize="6" fill="#1a1a1a" fontWeight="bold" letterSpacing="1.5">
                    <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">BRAIN IT ACADEMY</textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                   <img src="/logo.png" alt="Logo" className="h-10 opacity-90 grayscale contrast-125" />
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col pt-20 px-24 relative z-10">
          
          {/* Top Left Logo */}
          <div className="flex items-center gap-4 mb-20">
            <img src="/logo.png" alt="Brain IT Academy Logo" className="h-16 object-contain" />
            <div className="border-l-[1.5px] border-emerald-900 pl-4 py-1">
              <h2 className="text-[28px] font-black tracking-tight text-emerald-950 uppercase leading-none">Brain IT<br/>Academy</h2>
            </div>
          </div>

          <div className="max-w-2xl">
            {/* Date */}
            <p className="text-zinc-600 font-medium text-[13px] mb-8">
              {new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            {/* Student Name */}
            <h1 className="text-[44px] font-normal mb-8 text-zinc-800 uppercase leading-tight" style={{ fontFamily: "'Georgia', serif", letterSpacing: '0.05em' }}>
              {studentName}
            </h1>
            
            <p className="text-zinc-800 font-normal text-[15px] mb-6 italic" style={{ fontFamily: "'Georgia', serif" }}>
              has successfully completed
            </p>

            {/* Course Name */}
            <h2 className="text-[28px] font-bold text-zinc-900 mb-8" style={{ fontFamily: "'Georgia', serif" }}>
              {courseName}
            </h2>
            
            <p className="text-zinc-800 text-[14px] leading-relaxed max-w-[600px] mb-20" style={{ fontFamily: "'Georgia', serif" }}>
              an online non-credit course authorized by Brain IT Academy and offered through the academy's official learning platform.
            </p>

            {/* Signatures Area */}
            <div className="flex gap-20">
              <div className="flex flex-col w-64 relative">
                {/* Temp Signature */}
                <span className="absolute bottom-10 left-0" style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontSize: '2.5rem', color: '#1a1a1a', opacity: 0.8, transform: 'rotate(-3deg)' }}>
                  J. Omonov
                </span>
                <div className="w-full border-b border-zinc-400 mb-2 mt-16"></div>
                <p className="text-[12px] font-bold text-zinc-800">Jahongir Omonov</p>
                <p className="text-[10px] text-zinc-600 mt-1 leading-snug">
                  Director of Education and Operations<br/>
                  Center for Quantitative Modeling<br/>
                  Brain IT Academy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Right area */}
        <div className="absolute bottom-12 right-24 z-10 flex flex-col items-end text-right">
          <p className="text-[11px] text-zinc-500 mb-1">Verify at:</p>
          <a href={verifyUrl} className="text-[11px] text-blue-600 font-medium underline mb-3" target="_blank" rel="noreferrer">
            {verifyUrl}
          </a>
          <p className="text-[9px] text-zinc-400 max-w-[250px] leading-relaxed">
            Brain IT Academy has confirmed the identity of this individual and their participation in the course.
          </p>
          <div className="mt-4 border border-zinc-200 p-1 bg-white">
             <QRCode value={verifyUrl} size={60} level="M" fgColor="#1a1a1a" />
          </div>
        </div>

      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
