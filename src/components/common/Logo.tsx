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
  src,
  className = '',
  collapsed = false,
  size = 'md',
  variant = 'auto',
  showSubtitle = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Height configurations
  const heightStyles = {
    sm: { h: 'h-7 sm:h-8', iconSize: 30 },
    md: { h: 'h-8 sm:h-9 md:h-10', iconSize: 36 },
    lg: { h: 'h-10 sm:h-12', iconSize: 48 },
    xl: { h: 'h-14 sm:h-18', iconSize: 64 },
  };

  const selectedSize = heightStyles[size] || heightStyles.md;

  // Text color classes based on variant:
  // 'light' = used on dark backgrounds (e.g. #0B2A5B sidebar) -> pure white text
  // 'dark' = used on light backgrounds -> deep navy text
  // 'auto' = adapts to dark mode
  const titleColorClass =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
      ? 'text-[#0B2A5B]'
      : 'text-[#0B2A5B] dark:text-white';

  const subtitleColorClass =
    variant === 'light'
      ? 'text-slate-200'
      : variant === 'dark'
      ? 'text-[#0B2A5B]'
      : 'text-[#0B2A5B] dark:text-slate-300';

  const dividerColorClass =
    variant === 'light'
      ? 'bg-slate-300'
      : variant === 'dark'
      ? 'bg-[#0B2A5B]'
      : 'bg-[#0B2A5B] dark:bg-slate-400';

  // Only render <img> if a custom non-default src is passed and hasn't errored
  const useCustomImage = src && src !== '/sfs-logo.png' && src !== '/sfs-logo.svg' && !imageError;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {useCustomImage ? (
        <img
          src={src}
          alt="Software Factory and Services - SFS"
          onError={() => setImageError(true)}
          className={`${selectedSize.h} w-auto object-contain transition-all`}
        />
      ) : (
        /* Pristine High-Resolution Vector Brand Logo */
        <div className="flex items-center gap-2 sm:gap-3">
          {/* ISOTIPO EMBLEM: Industrial Factory, Chimney, Digital Circuits & Swoops */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              className={`${selectedSize.h} w-auto aspect-4/3 shrink-0 drop-shadow-xs`}
              viewBox="0 0 200 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="SFS Logo Isotipo"
            >
              <defs>
                <linearGradient id="chimneyBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0088FF" />
                  <stop offset="100%" stopColor="#004DA8" />
                </linearGradient>
                <linearGradient id="baseSwoopOrangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C22A00" />
                  <stop offset="45%" stopColor="#F37021" />
                  <stop offset="100%" stopColor="#FFA826" />
                </linearGradient>
                <linearGradient id="baseSwoopCyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0077D4" />
                  <stop offset="60%" stopColor="#00A2F3" />
                  <stop offset="100%" stopColor="#55D6FF" />
                </linearGradient>
              </defs>

              {/* Ascending Orange Pixels / Chimney Smoke */}
              <rect x="58" y="32" width="10" height="10" rx="1.5" fill="#F37021" transform="rotate(-6 63 37)" />
              <rect x="74" y="23" width="9.5" height="9.5" rx="1.5" fill="#F37021" transform="rotate(4 78 27)" />
              <rect x="87" y="15" width="10" height="10" rx="1.5" fill="#F37021" transform="rotate(-3 92 20)" />
              <rect x="71" y="8" width="8" height="8" rx="1.5" fill="#FF8D24" transform="rotate(7 75 12)" />
              <rect x="88" y="2" width="9.5" height="9.5" rx="1.5" fill="#FF8D24" transform="rotate(-5 93 7)" />
              <rect x="101" y="10" width="8" height="8" rx="1.5" fill="#F37021" transform="rotate(3 105 14)" />

              {/* Left Factory Block */}
              <path d="M20 84 L38 68 L52 78 L52 116 L20 116 Z" fill="#003D7A" />
              <path d="M20 84 L26 79 L38 68 L38 116 L20 116 Z" fill="#002752" />

              {/* Tall Chimney Tower */}
              <path d="M54 48 L73 45 L71 116 L52 116 Z" fill="url(#chimneyBlueGrad)" />
              <path d="M52 78 L54 48 L62 47 L60 116 L52 116 Z" fill="#002E5C" />

              {/* Right Modern Tech Building with Window Stripes */}
              <path d="M85 56 L126 38 L126 113 L85 116 Z" fill="#0B2A5B" />
              <path d="M85 56 L100 50 L100 115 L85 116 Z" fill="#0066B3" />
              <line x1="90" y1="62" x2="120" y2="48" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="90" y1="73" x2="120" y2="59" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="90" y1="84" x2="120" y2="70" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="90" y1="95" x2="120" y2="81" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="90" y1="106" x2="120" y2="92" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />

              {/* Circuit Board Traces (Cyan & Orange Nodes) */}
              <path d="M126 52 L140 52 L152 38 L165 38" fill="none" stroke="#00A2F3" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="165" cy="38" r="7.5" fill="none" stroke="#00A2F3" strokeWidth="3.5" />
              <circle cx="165" cy="38" r="2.5" fill="#00A2F3" />

              <path d="M126 70 L146 70 L160 54 L180 54" fill="none" stroke="#00A2F3" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="180" cy="54" r="7.5" fill="none" stroke="#00A2F3" strokeWidth="3.5" />
              <circle cx="180" cy="54" r="2.5" fill="#00A2F3" />

              {/* Circuit 3 with prominent orange sensor node */}
              <path d="M126 88 L138 88 L148 100 L168 100" fill="none" stroke="#00A2F3" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="168" cy="100" r="9" fill="#F37021" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="168" cy="100" r="3.5" fill="#FFFFFF" />

              {/* Vertical connector */}
              <path d="M146 70 L146 86 L138 94" fill="none" stroke="#00A2F3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Base Curved Dynamic Swoop */}
              <path d="M16 114 Q68 148 155 128 L147 136 Q63 156 10 118 Z" fill="#071B3E" />
              <path d="M12 116 Q80 145 174 110 Q90 130 18 114 Z" fill="url(#baseSwoopOrangeGrad)" />
              <path d="M80 132 Q138 125 186 98 Q134 118 80 130 Z" fill="url(#baseSwoopCyanGrad)" />
            </svg>
          </div>

          {/* TYPOGRAPHY */}
          {!collapsed && (
            <div className="flex flex-col justify-center leading-none whitespace-nowrap shrink-0 select-none">
              {/* DESKTOP FULL WORDMARK (Screens >= sm) */}
              <div className="hidden sm:flex sm:flex-col leading-none whitespace-nowrap shrink-0">
                <div
                  className={`font-black tracking-tight font-sans transition-colors whitespace-nowrap ${
                    size === 'sm'
                      ? 'text-xs sm:text-[13px]'
                      : size === 'lg'
                      ? 'text-lg sm:text-xl'
                      : size === 'xl'
                      ? 'text-xl sm:text-2xl'
                      : 'text-sm sm:text-base'
                  } ${titleColorClass}`}
                >
                  SOFTWARE FACTORY
                </div>

                {/* Subtitle: — AND SERVICES — */}
                <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                  <span className={`h-[1px] w-2.5 sm:w-3 ${dividerColorClass}`} />
                  <span
                    className={`text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.2em] uppercase ${subtitleColorClass}`}
                  >
                    AND SERVICES
                  </span>
                  <span className={`h-[1px] w-2.5 sm:w-3 ${dividerColorClass}`} />
                </div>

                {/* Subtitle / Service Desk Descriptor */}
                {showSubtitle && (
                  <div className="flex items-center gap-1 mt-1 text-[8.5px] sm:text-[9px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <span className="text-[#F37021] font-black tracking-wider uppercase">
                      Service Desk
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="font-medium tracking-normal">
                      Mesa de Ayuda ERP
                    </span>
                  </div>
                )}
              </div>

              {/* MOBILE COMPACT LOCKUP (Screens < sm: Crisp & High Contrast) */}
              <div className="flex sm:hidden flex-col leading-tight select-none whitespace-nowrap shrink-0">
                <div className="flex items-center gap-1 font-bold whitespace-nowrap">
                  <span className="text-xs font-black text-[#F37021] tracking-tight">SFS</span>
                  <span className={`text-xs font-extrabold ${titleColorClass}`}>
                    Service Desk
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
                  <span className={`text-[8px] font-semibold tracking-wider uppercase opacity-85 ${subtitleColorClass}`}>
                    Software Factory
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
