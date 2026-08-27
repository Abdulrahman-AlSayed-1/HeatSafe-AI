import { Flame, Clock, SunMedium, AlertCircle, RefreshCw } from 'lucide-react';
import { HeatExposureDTO } from '../api/heatExposure';

interface HeatExposurePanelProps {
  heatExposure: HeatExposureDTO | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function HeatExposurePanel({
  heatExposure,
  loading,
  error,
  onRetry,
}: HeatExposurePanelProps) {
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse border border-slate-100">
        <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-20 bg-slate-200 rounded-xl"></div>
          <div className="h-20 bg-slate-200 rounded-xl"></div>
          <div className="h-20 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error / Unavailable Fallback State
  if (error || !heatExposure) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-dashed border-orange-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 mt-0.5">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  FortyGuard Exceedance & Persistence Analytics
                </h3>
                <span className="text-xs px-2.5 py-0.5 bg-orange-100 text-orange-800 rounded-full font-semibold border border-orange-200">
                  Awaiting Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                {error ||
                  'Exceedance and persistence metrics calculate cumulative hours above threshold and continuous exposure duration using live FortyGuard satellite layers.'}
              </p>
            </div>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-orange-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-orange-300 transition-all shadow-sm flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
              Retry Analytics
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 opacity-50 pointer-events-none">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              Hours Above Threshold
            </div>
            <div className="text-2xl font-bold text-slate-400">-- h</div>
            <p className="text-xs text-slate-400 mt-1">Pending live telemetry stream</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              Longest Continuous Block
            </div>
            <div className="text-2xl font-bold text-slate-400">-- h</div>
            <p className="text-xs text-slate-400 mt-1">Pending live telemetry stream</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <SunMedium className="w-4 h-4" />
              Peak Thermal Window
            </div>
            <div className="text-2xl font-bold text-slate-400">14:00</div>
            <p className="text-xs text-slate-400 mt-1">Default estimated solar peak</p>
          </div>
        </div>
      </div>
    );
  }

  const { hoursAboveThreshold, longestContinuousExposure, peakHeatHour, thresholdCelsius } = heatExposure;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="text-base font-semibold text-slate-900">
            FortyGuard Exceedance & Persistence Analytics
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full font-medium border border-orange-200 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Threshold: {thresholdCelsius || 35}°C
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hours Above Threshold */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/70">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            Hours Above Threshold
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-900">{hoursAboveThreshold}</span>
            <span className="text-xs text-amber-700 font-medium">
              hours &gt; {thresholdCelsius}°C today
            </span>
          </div>
          <div className="w-full bg-amber-200/60 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((hoursAboveThreshold / 12) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Longest Continuous Exposure */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50/60 border border-red-200/70">
          <div className="flex items-center gap-2 text-red-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            Longest Continuous Block
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-red-900">{longestContinuousExposure}</span>
            <span className="text-xs text-red-700 font-medium">consecutive high-heat hours</span>
          </div>
          <div className="w-full bg-red-200/60 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((longestContinuousExposure / 8) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Peak Heat Time */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50/60 border border-purple-200/70">
          <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <SunMedium className="w-4 h-4" />
            Peak Thermal Window
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-purple-900">{peakHeatHour || '14:00'}</span>
            <span className="text-xs text-purple-700 font-medium">Highest solar irradiance</span>
          </div>
          <p className="text-xs text-purple-600/90 mt-3 font-medium">
            Avoid continuous high-effort manual tasks
          </p>
        </div>
      </div>
    </div>
  );
}
