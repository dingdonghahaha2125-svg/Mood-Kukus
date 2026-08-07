import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const sizeMap = {
    sm: {
      box: 'w-8 h-8',
      icon: 'w-5 h-5',
      title: 'text-sm',
      sub: 'text-[9px]',
    },
    md: {
      box: 'w-10 h-10',
      icon: 'w-6 h-6',
      title: 'text-base sm:text-lg',
      sub: 'text-[10px]',
    },
    lg: {
      box: 'w-14 h-14',
      icon: 'w-8 h-8',
      title: 'text-xl sm:text-2xl',
      sub: 'text-xs',
    },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Iconic Bamboo Steamer SVG Badge */}
      <div
        className={`relative ${sizeMap.box} rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-amber-900/30 flex items-center justify-center group transition-transform active:scale-95`}
      >
        <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle Steamer Weave Pattern & Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 opacity-80" />

          {/* Steamer & Steam SVG Icon */}
          <svg
            className={`${sizeMap.icon} relative z-10 text-amber-400 transition-transform group-hover:scale-110`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Steam Swirls */}
            <path
              d="M7 3c1 1 1 2 0 3"
              className="animate-pulse text-emerald-300"
              strokeWidth="1.5"
            />
            <path
              d="M12 2c1.2 1.2 1.2 2.4 0 3.6"
              className="animate-pulse text-amber-200"
              strokeWidth="1.5"
              style={{ animationDelay: '300ms' }}
            />
            <path
              d="M17 3c1 1 1 2 0 3"
              className="animate-pulse text-emerald-300"
              strokeWidth="1.5"
              style={{ animationDelay: '600ms' }}
            />

            {/* Bamboo Steamer Lid & Basket */}
            <path
              d="M3 11c0-2.5 4-4 9-4s9 1.5 9 4"
              fill="currentColor"
              fillOpacity="0.2"
              className="text-amber-500"
            />
            <path d="M2 11h20" className="text-amber-400" strokeWidth="2.2" />
            <path d="M3 11v6c0 2 4 3 9 3s9-1 9-3v-6" className="text-amber-400" />
            <path d="M3 14c0 1.5 4 2.5 9 2.5s9-1 9-2.5" strokeDasharray="2 2" className="text-amber-300" />

            {/* Banana Leaf Base Accent */}
            <path
              d="M5 20c3 1.5 11 1.5 14 0"
              className="text-emerald-400"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black ${sizeMap.title} tracking-tight uppercase leading-none bg-gradient-to-r from-amber-300 via-amber-100 to-emerald-300 bg-clip-text text-transparent`}
          >
            MOOD KUKUS
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px] uppercase border border-emerald-500/30">
            MAMUJU
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-semibold tracking-widest text-stone-400 uppercase ${sizeMap.sub} mt-0.5`}>
            Kuliner Kukusan Sehat & Alami
          </span>
        )}
      </div>
    </div>
  );
};
