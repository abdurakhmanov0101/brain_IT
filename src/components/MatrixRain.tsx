import { useEffect, useRef } from 'react';

const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&';

interface MatrixRainProps {
  opacity?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ opacity = 0.18 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const FONT_SIZE = 14;
    const FPS = 25;
    const INTERVAL = 1000 / FPS;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let cols = Math.floor(canvas.width / FONT_SIZE);
    // Each drop starts at a random negative Y to stagger them
    let drops: number[] = Array.from({ length: cols }, () => Math.random() * -120);
    // Each column has a random speed multiplier
    let speeds: number[] = Array.from({ length: cols }, () => 0.4 + Math.random() * 0.8);

    const handleResize = () => {
      resize();
      cols = Math.floor(canvas.width / FONT_SIZE);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
      speeds = Array.from({ length: cols }, () => 0.4 + Math.random() * 0.8);
    };
    window.addEventListener('resize', handleResize);

    let raf: number;
    let last = 0;

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (time - last < INTERVAL) return;
      last = time;

      // Semi-transparent overlay — creates the fading trail
      ctx.fillStyle = 'rgba(5, 8, 22, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;

      for (let i = 0; i < cols; i++) {
        const y = drops[i] * FONT_SIZE;
        if (y < 0) {
          drops[i] += speeds[i];
          continue;
        }

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        // Occasionally flash the head character white/cyan for depth
        if (Math.random() > 0.92) {
          ctx.fillStyle = '#c8fff0';
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = '#00ff87';
          ctx.globalAlpha = 0.75 + Math.random() * 0.25;
        }

        ctx.fillText(char, i * FONT_SIZE, y);
        ctx.globalAlpha = 1;

        // Reset column once it scrolls past the canvas
        if (y > canvas.height && Math.random() > 0.97) {
          drops[i] = 0;
          speeds[i] = 0.4 + Math.random() * 0.8;
        }
        drops[i] += speeds[i];
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity }}
    />
  );
};
