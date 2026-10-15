import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = true 
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Premium High-Fidelity Healthcare Crest & Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-900 to-emerald-700 p-0.5 shadow-lg shadow-teal-900/20 group-hover:scale-105 transition-all`}>
        <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-teal-950/90 to-slate-950 flex items-center justify-center relative overflow-hidden border border-teal-500/30">
          {/* Subtle glowing radial background */}
          <div className="absolute inset-0 bg-radial from-teal-400/20 via-transparent to-transparent opacity-80" />
          
          <svg className="w-4/5 h-4/5 relative z-10" viewBox="0 0 40 40" fill="none">
            {/* Hexagonal Medical Shield outline */}
            <path
              d="M20 3L35 9V20C35 29 28.5 35 20 38C11.5 35 5 29 5 20V9L20 3Z"
              className="fill-teal-950/80 stroke-teal-400/60"
              strokeWidth="1.5"
            />
            {/* Central Medical Cross */}
            <path
              d="M20 11V29M11 20H29"
              stroke="white"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Golden Heartbeat ECG Pulse */}
            <path
              d="M10 20H15L17.5 14L22.5 26L25 18L26.5 21H30"
              stroke="#F59E0B"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* 24/7 Red Emergency Badge */}
          <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.2 bg-gradient-to-r from-rose-600 to-red-600 text-[8px] font-black text-white rounded-md tracking-tighter shadow-xs border border-white/40">
            24/7
          </span>
        </div>
      </div>

      {/* Brand Wordmark & Official Hierarchy */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${textSizes[size]} font-black tracking-tight text-slate-900`}>
            MEDISEVA
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-[11px] tracking-wide shadow-2xs">
            360
          </span>
        </div>
        {showSubtitle && (
          <span className={`${subSizes[size]} font-bold tracking-wider text-teal-800 uppercase mt-0.5 whitespace-nowrap`}>
            National Healthcare Grid • All Districts 24/7
          </span>
        )}
      </div>
    </div>
  );
};
