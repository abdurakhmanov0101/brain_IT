import React, { useEffect, useRef } from 'react';

const CHARS = '01アイウエオカキ</>{}[]()=+-*&^%0123456789ABCDEFabcdef!#@$~≈∑π§Ω';

interface Logo {
  id: string;
  content: React.ReactNode;
  fg: string;
  bg: string;
  left: string;
  top: string;
  delay: number;
  dur: number;
}

const ReactIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="50" rx="47" ry="16" stroke="#61DAFB" strokeWidth="6" />
    <ellipse cx="50" cy="50" rx="47" ry="16" stroke="#61DAFB" strokeWidth="6" transform="rotate(60 50 50)" />
    <ellipse cx="50" cy="50" rx="47" ry="16" stroke="#61DAFB" strokeWidth="6" transform="rotate(120 50 50)" />
    <circle cx="50" cy="50" r="8" fill="#61DAFB" />
  </svg>
);

const DockerIcon = () => (
  <svg width="24" height="20" viewBox="0 0 80 65" fill="#2496ED">
    <rect x="8" y="32" width="13" height="13" rx="2" />
    <rect x="24" y="32" width="13" height="13" rx="2" />
    <rect x="40" y="32" width="13" height="13" rx="2" />
    <rect x="8" y="16" width="13" height="13" rx="2" />
    <rect x="24" y="16" width="13" height="13" rx="2" />
    <rect x="40" y="16" width="13" height="13" rx="2" />
    <rect x="56" y="16" width="13" height="13" rx="2" />
    <rect x="24" y="0" width="13" height="13" rx="2" />
    <path d="M72 30c-2-5-8-6-13-5-2-7-7-10-13-10-1 5 0 9 3 13H8c0 15 10 24 25 24h18c12 0 21-7 24-18z" />
  </svg>
);

const GitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="46" stroke="#F05032" strokeWidth="6" />
    <circle cx="30" cy="68" r="9" fill="#F05032" />
    <circle cx="70" cy="30" r="9" fill="#F05032" />
    <circle cx="70" cy="68" r="9" fill="#F05032" />
    <path d="M30 68 L70 30 M70 30 L70 68" stroke="#F05032" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const PythonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <path d="M50 5C28 5 30 15 30 15L30 35H52V40H20C20 40 5 38 5 60s14 20 14 20h9V68s-1-13 12-13h28c0 0 11 1 11-10V24C79 24 72 5 50 5z" fill="#3776AB" />
    <path d="M50 95C72 95 70 85 70 85L70 65H48V60H80C80 60 95 62 95 40S81 20 81 20H72V32s1 13-12 13H32c0 0-11-1-11 10V76C21 76 28 95 50 95z" fill="#FFD43B" />
    <circle cx="37" cy="22" r="5" fill="#fff" />
    <circle cx="63" cy="78" r="5" fill="#3776AB" />
  </svg>
);

const LOGOS: Logo[] = [
  { id: 'js',     fg: '#F7DF1E', bg: 'rgba(247,223,30,0.12)',  left: '4%',  top: '14%', delay: 0,   dur: 7,
    content: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 15 }}>JS</span> },
  { id: 'ts',     fg: '#3178C6', bg: 'rgba(49,120,198,0.12)',  left: '88%', top: '10%', delay: 1.5, dur: 8,
    content: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 15 }}>TS</span> },
  { id: 'react',  fg: '#61DAFB', bg: 'rgba(97,218,251,0.10)',  left: '8%',  top: '42%', delay: 0.8, dur: 9,
    content: <><ReactIcon /><span style={{ fontSize: 10, marginLeft: 5 }}>React</span></> },
  { id: 'python', fg: '#FFD43B', bg: 'rgba(55,118,171,0.12)',  left: '82%', top: '38%', delay: 0.5, dur: 7.5,
    content: <><PythonIcon /><span style={{ fontSize: 10, marginLeft: 5 }}>Python</span></> },
  { id: 'html',   fg: '#E34F26', bg: 'rgba(227,79,38,0.10)',   left: '36%', top: '5%',  delay: 1.2, dur: 7.5,
    content: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 13 }}>HTML5</span> },
  { id: 'css',    fg: '#1572B6', bg: 'rgba(21,114,182,0.10)',  left: '57%', top: '8%',  delay: 3,   dur: 6.5,
    content: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 13 }}>CSS3</span> },
  { id: 'node',   fg: '#339933', bg: 'rgba(51,153,51,0.10)',   left: '70%', top: '22%', delay: 2,   dur: 7,
    content: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 12 }}>Node.js</span> },
  { id: 'docker', fg: '#2496ED', bg: 'rgba(36,150,237,0.10)',  left: '86%', top: '50%', delay: 2.5, dur: 8.5,
    content: <><DockerIcon /><span style={{ fontSize: 10, marginLeft: 5 }}>Docker</span></> },
  { id: 'git',    fg: '#F05032', bg: 'rgba(240,80,50,0.10)',   left: '2%',  top: '28%', delay: 1.8, dur: 7,
    content: <><GitIcon /><span style={{ fontSize: 10, marginLeft: 5 }}>Git</span></> },
  { id: 'vue',    fg: '#42B883', bg: 'rgba(66,184,131,0.10)',  left: '21%', top: '8%',  delay: 1,   dur: 6.5,
    content: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 14 }}>Vue</span> },
  { id: 'django', fg: '#44B78B', bg: 'rgba(9,46,32,0.18)',     left: '19%', top: '38%', delay: 2.2, dur: 8,
    content: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 12 }}>Django</span> },
  { id: 'linux',  fg: '#FCC624', bg: 'rgba(252,198,36,0.10)',  left: '48%', top: '40%', delay: 1.6, dur: 9,
    content: <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 12 }}>Linux</span> },
];

const TechBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const FONT_SIZE = 14;
    let drops: number[] = [];
    let animId: number;
    let lastTime = 0;
    const FRAME_TIME = 1000 / 20;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.floor(canvas.width / FONT_SIZE);
      drops = Array.from({ length: cols }, () => Math.random() * -100);
    };

    const draw = (ts: number) => {
      animId = requestAnimationFrame(draw);
      if (ts - lastTime < FRAME_TIME) return;
      lastTime = ts;

      /* Slow fade — creates trailing effect */
      ctx.fillStyle = 'rgba(5, 7, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px "Courier New", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;
        const bright = Math.random();

        /* Leading char brighter, rest dimmer */
        if (bright > 0.97) {
          ctx.fillStyle = 'rgba(200, 220, 255, 0.95)'; // bright white-blue flash
        } else if (bright > 0.8) {
          ctx.fillStyle = `rgba(52,211,153,${0.6 + Math.random() * 0.35})`; // emerald bright
        } else {
          ctx.fillStyle = `rgba(16,185,129,${0.2 + Math.random() * 0.3})`; // emerald dim
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.45;
      }
    };

    init();
    window.addEventListener('resize', init);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    /* fixed — viewport ga yopishib turadi, sahifaning istalgan joyida ko'rinadi */
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none" aria-hidden>
      {/* Dark base — canvas visible bo'lishi uchun */}
      <div className="absolute inset-0 bg-slate-950" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Floating programming language logos */}
      {LOGOS.map((logo) => (
        <div
          key={logo.id}
          className="tech-logo absolute flex items-center justify-center rounded-xl"
          style={{
            left: logo.left,
            top: logo.top,
            padding: '8px 12px',
            backgroundColor: logo.bg,
            border: `1.5px solid ${logo.fg}40`,
            color: logo.fg,
            backdropFilter: 'blur(4px)',
            animationDuration: `${logo.dur}s`,
            animationDelay: `${logo.delay}s`,
            whiteSpace: 'nowrap',
          }}
        >
          {logo.content}
        </div>
      ))}
    </div>
  );
};

export default TechBackground;
