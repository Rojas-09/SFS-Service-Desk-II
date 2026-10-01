import React, { useState } from 'react';

interface LogoProps {
  src?: string;
  className?: string;
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  src = '/sfs-logo.png',
  className = '',
  collapsed = false,
  size = 'md',
  variant = 'auto',
  showSubtitle = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  // Color selection based on variant
  // 'light' means the logo is placed on a dark background (needs light text)
  // 'dark' means the logo is placed on a light background (needs dark text)
  // 'auto' uses tailwind classes (dark:text-white)
  const isDarkBackground = variant === 'light';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* 1. Try rendering image if available */}
      {!imageError && src ? (
        <img
          src={src}
          alt="Software Factory and Services - SFS"
          onError={() => setImageError(true)}
          className={`${heightClasses[size]} w-auto object-contain transition-all`}
        />
      ) : (
        /* 2. High-fidelity Vector Artwork matching fondo.JPG exactly */
        <div className="flex items-center gap-2.5">
          {/* Isotype Emblem: Factory, Chimney, Digital Circuits & Swoop */}
          <svg
            className={`${heightClasses[size]} w-auto aspect-4/3 shrink-0`}
            viewBox="0 0 200 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="chimneyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0088FF"/>
                <stop offset="100%" stopColor="#004DA8"/>
              </linearGradient>
              <linearGradient id="baseSwoopOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C22A00"/>
                <stop offset="45%" stopColor="#F37021"/>
                <stop offset="100%" stopColor="#FFA826"/>
              </linearGradient>
              <linearGradient id="baseSwoopCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0077D4"/>
                <stop offset="60%" stopColor="#00A2F3"/>
                <stop offset="100%" stopColor="#55D6FF"/>
              </linearGradient>
            </defs>

            {/* Ascending Orange Pixels / Smoke from Chimney */}
            <rect x="58" y="32" width="10" height="10" rx="1.5" fill="#F37021" transform="rotate(-6 63 37)"/>
            <rect x="74" y="23" width="9.5" height="9.5" rx="1.5" fill="#F37021" transform="rotate(4 78 27)"/>
            <rect x="87" y="15" width="10" height="10" rx="1.5" fill="#F37021" transform="rotate(-3 92 20)"/>
            <rect x="71" y="8" width="8" height="8" rx="1.5" fill="#FF8D24" transform="rotate(7 75 12)"/>
            <rect x="88" y="2" width="9.5" height="9.5" rx="1.5" fill="#FF8D24" transform="rotate(-5 93 7)"/>
            <rect x="101" y="10" width="8" height="8" rx="1.5" fill="#F37021" transform="rotate(3 105 14)"/>

            {/* Left Industrial Factory block */}
            <path d="M20 84 L38 68 L52 78 L52 116 L20 116 Z" fill="#003D7A"/>
            <path d="M20 84 L26 79 L38 68 L38 116 L20 116 Z" fill="#002752"/>

            {/* Chimney Tower */}
            <path d="M54 48 L73 45 L71 116 L52 116 Z" fill="url(#chimneyBlue)"/>
            <path d="M52 78 L54 48 L62 47 L60 116 L52 116 Z" fill="#002E5C"/>

            {/* Right Tech Building */}
            <path d="M85 56 L126 38 L126 113 L85 116 Z" fill="#0B2A5B"/>
            <path d="M85 56 L100 50 L100 115 L85 116 Z" fill="#0066B3"/>
            {/* Windows */}
            <line x1="90" y1="62" x2="120" y2="48" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round"/>
            <line x1="90" y1="73" x2="120" y2="59" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round"/>
            <line x1="90" y1="84" x2="120" y2="70" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round"/>
            <line x1="90" y1="95" x2="120" y2="81" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round"/>
            <line x1="90" y1="106" x2="120" y2="92" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round"/>

            {/* Circuit Board Traces (Cyan & Orange Nodes) */}
            <path d="M126 52 L140 52 L152 38 L165 38" fill="none" stroke="#00A2F3" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="165" cy="38" r="7.5" fill="none" stroke="#00A2F3" strokeWidth="3.5"/>
            <circle cx="165" cy="38" r="2.5" fill="#00A2F3"/>

            <path d="M126 70 L146 70 L160 54 L180 54" fill="none" stroke="#00A2F3" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="180" cy="54" r="7.5" fill="none" stroke="#00A2F3" strokeWidth="3.5"/>
            <circle cx="180" cy="54" r="2.5" fill="#00A2F3"/>

            {/* Circuit 3 with prominent orange node */}
            <path d="M126 88 L138 88 L148 100 L168 100" fill="none" stroke="#00A2F3" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="168" cy="100" r="9" fill="#F37021" stroke="#FFFFFF" strokeWidth="2"/>
            <circle cx="168" cy="100" r="3.5" fill="#FFFFFF"/>

            {/* Vertical connector */}
            <path d="M146 70 L146 86 L138 94" fill="none" stroke="#00A2F3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Base Swoop / Curved Foundation */}
            <path d="M16 114 Q68 148 155 128 L147 136 Q63 156 10 118 Z" fill="#071B3E"/>
            <path d="M12 116 Q80 145 174 110 Q90 130 18 114 Z" fill="url(#baseSwoopOrange)"/>
            <path d="M80 132 Q138 125 186 98 Q134 118 80 130 Z" fill="url(#baseSwoopCyan)"/>
          </svg>

          {/* Typography */}
          {!collapsed && (
            <div className="flex flex-col justify-center leading-none">
              <div
                className={`font-black tracking-tight font-sans ${
                  size === 'sm'
                    ? 'text-sm'
                    : size === 'lg'
                    ? 'text-xl'
                    : size === 'xl'
                    ? 'text-2xl'
                    : 'text-base md:text-lg'
                } ${
                  isDarkBackground
                    ? 'text-white'
                    : 'text-[#0B2A5B] dark:text-white'
                }`}
              >
                SOFTWARE FACTORY
              </div>

              {/* Sub-line: — AND SERVICES — */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`h-[1px] w-3 ${
                    isDarkBackground ? 'bg-slate-300' : 'bg-[#0B2A5B] dark:bg-slate-400'
                  }`}
                />
                <span
                  className={`text-[9px] md:text-[10px] font-bold tracking-[0.22em] uppercase ${
                    isDarkBackground
                      ? 'text-slate-200'
                      : 'text-[#0B2A5B] dark:text-slate-300'
                  }`}
                >
                  AND SERVICES
                </span>
                <span
                  className={`h-[1px] w-3 ${
                    isDarkBackground ? 'bg-slate-300' : 'bg-[#0B2A5B] dark:bg-slate-400'
                  }`}
                />
              </div>

              {/* Service Desk pill badge */}
              {showSubtitle && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#F37021] text-white">
                    Service Desk
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 dark:text-slate-300 hidden sm:inline">
                    Mesa de Ayuda
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

