import { Shield, Flame, AlertTriangle, ShieldCheck, Sun, Clock, Users, RefreshCw } from 'lucide-react';

interface ThermalHorizonGaugeProps {
  score: number | null;
  riskLevel: string;
  peakTemp?: number | null;
  criticalWindow?: string;
  affectedWorkers?: number | string;
  isLoading?: boolean;
}

export default function ThermalHorizonGauge({
  score,
  riskLevel,
  peakTemp,
  criticalWindow,
  affectedWorkers,
  isLoading = false,
}: ThermalHorizonGaugeProps) {
  // Normalize score between 0 and 10
  const validScore = score !== null && !isNaN(score) ? Math.min(Math.max(score, 0), 10) : 0;
  const isUnsupported = riskLevel === 'UNSUPPORTED';
  const isPending = isLoading || riskLevel === 'PENDING' || score === null;

  // Arc calculation for a 220-degree gauge (from -200° to 20°)
  // Radius = 70
  const radius = 70;
  const circumference = Math.PI * radius * (220 / 180); // ~268.78
  const progressOffset = isPending || isUnsupported 
    ? circumference 
    : circumference - (validScore / 10) * circumference;

  // Status colors & tags
  const getLevelConfig = () => {
    if (isPending) {
      return {
        label: 'CALCULATING',
        glowColor: 'from-blue-500/20 to-indigo-500/20',
        textColor: 'text-blue-600',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        Icon: RefreshCw,
        iconColor: 'text-blue-500 animate-spin',
        summary: 'Synchronizing FortyGuard satellite microclimate data...',
      };
    }
    if (isUnsupported) {
      return {
        label: 'UNSUPPORTED',
        glowColor: 'from-slate-500/10 to-slate-600/10',
        textColor: 'text-slate-600',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
        Icon: AlertTriangle,
        iconColor: 'text-slate-500',
        summary: 'Outside supported geographic telemetry coverage area',
      };
    }

    const lvl = riskLevel.toUpperCase();
    switch (lvl) {
      case 'EXTREME':
        return {
          label: 'EXTREME THERMAL HAZARD',
          glowColor: 'from-red-500/25 via-rose-500/20 to-amber-500/20',
          textColor: 'text-red-600',
          badgeBg: 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400',
          Icon: Flame,
          iconColor: 'text-red-600 animate-bounce',
          summary: 'Critical exposure thresholds exceeded. Mandatory work stoppage or strict 15m/45m rest rotations required',
        };
      case 'HIGH':
        return {
          label: 'HIGH THERMAL HAZARD',
          glowColor: 'from-orange-500/25 via-red-500/15 to-amber-500/20',
          textColor: 'text-orange-600',
          badgeBg: 'bg-orange-100 text-orange-800 border-orange-300 ring-1 ring-orange-400',
          Icon: Flame,
          iconColor: 'text-orange-600',
          summary: 'Heavy physiological strain expected. Shift rescheduling and shaded hydration stations strongly advised',
        };
      case 'MODERATE':
        return {
          label: 'MODERATE HEAT STRESS',
          glowColor: 'from-amber-500/20 to-yellow-500/15',
          textColor: 'text-amber-600',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          Icon: AlertTriangle,
          iconColor: 'text-amber-600',
          summary: 'Elevated surface temperatures. Enforce standard hydration intervals and active worker monitoring',
        };
      default:
        return {
          label: 'SAFE THERMAL HORIZON',
          glowColor: 'from-emerald-500/20 to-teal-500/15',
          textColor: 'text-emerald-600',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          Icon: ShieldCheck,
          iconColor: 'text-emerald-600',
          summary: 'Surface thermal conditions are within safe operational physiological thresholds',
        };
    }
  };

  const config = getLevelConfig();

  const StatusIcon = isPending
    ? RefreshCw
    : isUnsupported
    ? Shield
    : riskLevel === 'EXTREME' || riskLevel === 'HIGH'
    ? Flame
    : riskLevel === 'MODERATE'
    ? AlertTriangle
    : ShieldCheck;

  return (
    <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-slate-200/90 overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-50/40 to-transparent rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Worksite Thermal Horizon & Hazard Composite
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Engine: FortyGuard TCM Microclimate Model + ISO 7243 Physiological Strain Matrix
            </p>
          </div>
        </div>

        {/* Telemetry Status Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
          </span>
          <span className="text-xs font-bold text-slate-600 font-mono">
            {isLoading ? 'SYNCING TELEMETRY' : 'LIVE TELEMETRY'}
          </span>
        </div>
      </div>

      {/* Main Horizon Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-center">
        {/* Left Column: Radial Horizon Arc Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-60 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[200/130]">
              <svg className="w-full h-full" viewBox="0 0 200 130">
                <defs>
                  {/* Arc Track Gradient */}
                  <linearGradient id="horizonTrackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="35%" stopColor="#F59E0B" />
                    <stop offset="70%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>

                  {/* Glow Filter */}
                  <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background Inactive Track */}
                <path
                  d="M 36.1 99.3 A 68 68 0 1 1 163.9 99.3"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* Active Progress Arc */}
                {!isPending && !isUnsupported && (
                  <path
                    d="M 36.1 99.3 A 68 68 0 1 1 163.9 99.3"
                    fill="none"
                    stroke="url(#horizonTrackGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    className="transition-all duration-1000 ease-out"
                    filter="url(#gaugeGlow)"
                  />
                )}
              </svg>

              {/* Central Score Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 text-center pointer-events-none">
                {isPending ? (
                  <div className="space-y-1">
                    <RefreshCw className="w-7 h-7 text-blue-500 animate-spin mx-auto" />
                    <span className="text-xs font-bold text-slate-400">Evaluating...</span>
                  </div>
                ) : isUnsupported ? (
                  <div className="space-y-0.5">
                    <span className="text-2xl font-black text-slate-400">N/A</span>
                    <span className="text-[11px] font-bold text-slate-400 block">Out of Area</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                        {validScore.toFixed(1)}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/10</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <StatusIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                      <span className={`text-[11px] font-extrabold uppercase tracking-wide ${config.textColor}`}>
                        {riskLevel}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Scale Labels */}
            <div className="flex items-center justify-between w-48 text-[10px] font-bold px-1 -mt-3.5 z-10">
              <span className="text-emerald-600">0.0 Safe</span>
              <span className="text-amber-600">5.0 Mod</span>
              <span className="text-red-600">10.0 Peak</span>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Horizon Metrics & Evidence (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5 leading-5">
          {/* Executive Summary Callout */}
          <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80">
            <p className="text-[12px] font-semibold text-slate-700 leading-relaxed">
              {config.summary}
            </p>
          </div>

          {/* 3 Metric Insight Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Peak Site Temperature */}
            <div className="p-3.5 flex justify-center items-center flex-col rounded-2xl bg-gradient-to-br from-orange-50/80 to-amber-50/40 border border-orange-200/70">
              <div className="flex items-center gap-2 text-orange-700">
                <Sun className="w-4 h-4 text-orange-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Peak Site Heat</span>
              </div>
              <p className="text-lg font-black text-slate-900 mt-1">
                {peakTemp != null ? `${peakTemp.toFixed(1)}°C` : '-- °C'}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">FortyGuard Surface Model</span>
            </div>

            {/* Critical Exposure Window */}
            <div className="p-3.5 flex justify-center items-center flex-col rounded-2xl bg-gradient-to-br from-red-50/80 to-rose-50/40 border border-red-200/70">
              <div className="flex items-center gap-2 text-red-700">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Danger Window</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-1.5 truncate" title={criticalWindow || 'None'}>
                {criticalWindow || 'None Detected'}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">OSHA High-Risk Window</span>
            </div>

            {/* Personnel at Risk */}
            <div className="p-3.5 flex justify-center items-center flex-col rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-200/70">
              <div className="flex items-center gap-2 text-blue-700">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Crew Exposure</span>
              </div>
              <p className="text-lg font-black text-slate-900 mt-1">
                {affectedWorkers !== undefined && affectedWorkers !== '--' ? `${affectedWorkers}` : '--'}
                <span className="text-xs font-semibold text-slate-500 ml-1">workers</span>
              </p>
              <span className="text-[10px] text-slate-500 font-medium">In Active Risk Shifts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
