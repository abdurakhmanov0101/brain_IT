import React, { useEffect, useRef } from 'react';

const CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+<>{}[]~' +
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

interface MatrixRainProps {
  opacity?: number;
  darkMode?: boolean;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ opacity = 0.25, darkMode = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    // Mobile optimization: larger font size = fewer columns = better performance
    const FONT_SIZE = isMobile ? 18 : 16;
    const FPS = isMobile ? 18 : 24;
    const INTERVAL = 1000 / FPS;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    resize();

    let cols = Math.floor(canvas.width / (isMobile ? FONT_SIZE : FONT_SIZE * 0.85));
    let drops: number[] = Array.from({ length: cols }, () => Math.random() * -100);
    let speeds: number[] = Array.from({ length: cols }, () => (isMobile ? 0.3 : 0.4) + Math.random() * 0.6);

    const handleResize = () => {
      resize();
      cols = Math.floor(canvas.width / (isMobile ? FONT_SIZE : FONT_SIZE * 0.85));
      drops = Array.from({ length: cols }, () => Math.random() * -50);
      speeds = Array.from({ length: cols }, () => (isMobile ? 0.3 : 0.4) + Math.random() * 0.6);
    };
    window.addEventListener('resize', handleResize);

    let raf: number;
    let last = 0;

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (time - last < INTERVAL) return;
      last = time;

      // Trail fade background: dark zinc-950 vs light zinc-100
      ctx.fillStyle = darkMode ? 'rgba(9, 9, 11, 0.1)' : 'rgba(250, 250, 250, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = darkMode 
        ? `bold ${FONT_SIZE}px 'Manrope', monospace`
        : `600 ${FONT_SIZE}px "JetBrains Mono", monospace`;

      for (let i = 0; i < cols; i++) {
        const y = drops[i] * FONT_SIZE;
        if (y < 0) {
          drops[i] += speeds[i];
          continue;
        }

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        // WCAG AA Contrast (> 4.5:1)
        if (Math.random() > 0.93) {
          ctx.fillStyle = darkMode ? '#a7f3d0' : '#4c1d95'; // head flash
          ctx.globalAlpha = darkMode ? 1 : 0.85;
        } else {
          ctx.fillStyle = darkMode ? '#10b981' : '#6d28d9'; // main character
          ctx.globalAlpha = darkMode ? (0.7 + Math.random() * 0.3) : 0.35; // distinct opacity body in light mode
        }

        const xPos = isMobile ? i * FONT_SIZE : i * (FONT_SIZE * 0.85);
        ctx.fillText(char, xPos, y);
        ctx.globalAlpha = 1;

        if (y > canvas.height && Math.random() > 0.97) {
          drops[i] = 0;
          speeds[i] = (isMobile ? 0.3 : 0.4) + Math.random() * 0.6;
        }
        drops[i] += speeds[i];
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 matrix-canvas"
      style={{ zIndex: 0, opacity: darkMode ? opacity : opacity * 1.5 }}
    />
  );
};
export default MatrixRain;
