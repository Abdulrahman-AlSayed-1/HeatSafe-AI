import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandIcon: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const svgSizes = {
    sm: 22,
    md: 28,
    lg: 34,
  };

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md shadow-indigo-950/25 border border-slate-700/60 hover:border-indigo-500/50 transition-all duration-300 group ${sizeClasses[size]} ${className}`}
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/15 via-indigo-500/15 to-orange-500/20 opacity-80 blur-xs"></div>

      <svg
        width={svgSizes[size]}
        height={svgSizes[size]}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transform group-hover:scale-105 transition-transform duration-300"
      >
        <defs>
          {/* Cooling Azure & Cyan Arc Gradient */}
          <linearGradient id="brandCoolArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          {/* Thermal Amber & Coral Arc Gradient */}
          <linearGradient id="brandHeatArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>

          {/* AI Spark Radial Glow */}
          <radialGradient id="brandSparkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Left Cooling & Safety Arc (Azure to Indigo) */}
        <path
          d="M32 11 C20 11 13 19 13 31 C13 42.5 22 49.5 32 53"
          stroke="url(#brandCoolArc)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Right Thermal & Heat Awareness Arc (Amber to Coral) */}
        <path
          d="M32 11 C44 11 51 19 51 31 C51 42.5 42 49.5 32 53"
          stroke="url(#brandHeatArc)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Apex Connection Node */}
        <circle cx="32" cy="11" r="3.2" fill="#FFFFFF" />

        {/* Center AI Intelligence Star / Spark */}
        <path
          d="M32 23 Q32 31 24.5 31 Q32 31 32 39 Q32 31 39.5 31 Q32 31 32 23 Z"
          fill="#FFFFFF"
        />
        <circle cx="32" cy="31" r="6" fill="url(#brandSparkGlow)" opacity="0.75" />
      </svg>
    </div>
  );
};

export default function BrandLogo({
  size = 'md',
  showSubtitle = true,
  showBadge = true,
  className = '',
  onClick,
}: BrandLogoProps) {
  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <BrandIcon size={size} />

      <div>
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-slate-900 ${titleSizes[size]}`}>
            HeatSafe{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">
              AI
            </span>
          </span>

          {showBadge && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200/80 shadow-xs">
              Enterprise
            </span>
          )}
        </div>

        {showSubtitle && (
          <p className={`text-slate-500 font-medium hidden sm:block ${subtitleSizes[size]}`}>
            FortyGuard Satellite Thermal Telemetry & Risk Engine
          </p>
        )}
      </div>
    </div>
  );
}
