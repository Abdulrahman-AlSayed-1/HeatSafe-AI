import { Thermometer, ArrowDownRight, ArrowUpRight, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { WorksiteThermalProfileDTO } from '../api/thermalProfile';

interface ThermalProfileCardsProps {
  thermalProfile: WorksiteThermalProfileDTO | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function ThermalProfileCards({
  thermalProfile,
  loading,
  error,
  onRetry,
}: ThermalProfileCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md animate-pulse border border-slate-100"
          >
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error / Unavailable Fallback State
  if (error || !thermalProfile) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-slate-50 border-2 border-dashed border-amber-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  FortyGuard Thermal Profile (TCM)
                </h3>
                <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold border border-slate-200">
                  Synchronizing Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                {error ||
                  'Microclimate thermal profile is calibrating against site coordinates. Click retry to refresh.'}
              </p>
            </div>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-amber-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-amber-300 transition-all shadow-sm flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              Retry Telemetry
            </button>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Endpoint: <code>/v1/heatmap</code> (TCM)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Resolution: 100m Microclimate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Filter: Single-day diurnal peak</span>
          </div>
        </div>
      </div>
    );
  }

  const { minTemp, avgTemp, maxTemp, unit, dataBasis } = thermalProfile;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-slate-900">
            Worksite Thermal Profile (FortyGuard TCM)
          </h3>
        </div>
        {dataBasis && (
          <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium border border-emerald-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            FortyGuard Live: {dataBasis}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Min Temp */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-blue-100/70 rounded-2xl p-5 border border-sky-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
              Minimum Temp
            </span>
            <div className="w-8 h-8 rounded-full bg-sky-200/60 flex items-center justify-center text-sky-700">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-sky-900">
              {minTemp != null ? minTemp.toFixed(1) : '--'}
            </span>
            <span className="text-lg font-bold text-sky-700">{unit || '°C'}</span>
          </div>
          <p className="text-xs text-sky-600/90 mt-1 font-medium">Night & Early Morning Baseline</p>
        </div>

        {/* Avg Temp */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100/70 rounded-2xl p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Average Temp
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-200/60 flex items-center justify-center text-amber-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-amber-900">
              {avgTemp != null ? avgTemp.toFixed(1) : '--'}
            </span>
            <span className="text-lg font-bold text-amber-700">{unit || '°C'}</span>
          </div>
          <p className="text-xs text-amber-600/90 mt-1 font-medium">Mean AOI Daytime Ambient</p>
        </div>

        {/* Max Temp */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-red-100/80 rounded-2xl p-5 border border-rose-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Peak Maximum Temp
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-200/60 flex items-center justify-center text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-rose-900">
              {maxTemp != null ? maxTemp.toFixed(1) : '--'}
            </span>
            <span className="text-lg font-bold text-rose-700">{unit || '°C'}</span>
          </div>
          <p className="text-xs text-rose-600/90 mt-1 font-medium">Midday Microclimate Peak</p>
        </div>
      </div>
    </div>
  );
}
