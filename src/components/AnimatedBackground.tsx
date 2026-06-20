import React from 'react';

interface Props {
  darkMode: boolean;
  enabled?: boolean;
}

const AnimatedBackground: React.FC<Props> = ({ darkMode, enabled = true }) => {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* animated gradient layer (falls back to static when disabled) */}
      <div className={`${enabled ? 'animated-gradient' : 'static-gradient'} ${darkMode ? 'animated-gradient-dark' : 'animated-gradient-light'}`} />

      {/* floating AI/IT styled nodes (SVG) */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <g fill="none" stroke="url(#g1)" strokeWidth={0.6} opacity="0.45">
          <circle className="floating-node delay-0" cx="12" cy="18" r="3" fill="#7c3aed" />
          <circle className="floating-node delay-1" cx="22" cy="34" r="2.5" fill="#06b6d4" />
          <circle className="floating-node delay-2" cx="34" cy="28" r="3.5" fill="#a855f7" />
          <circle className="floating-node delay-3" cx="48" cy="20" r="4" fill="#06b6d4" />
          <circle className="floating-node delay-4" cx="62" cy="36" r="2.8" fill="#7c3aed" />
          <circle className="floating-node delay-5" cx="76" cy="24" r="3.2" fill="#06b6d4" />
          <circle className="floating-node delay-6" cx="88" cy="40" r="2.2" fill="#a855f7" />

          {/* subtle connecting lines */}
          <path className="node-line" d="M12 18 L22 34" />
          <path className="node-line" d="M22 34 L34 28" />
          <path className="node-line" d="M34 28 L48 20" />
          <path className="node-line" d="M48 20 L62 36" />
          <path className="node-line" d="M62 36 L76 24" />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedBackground;
