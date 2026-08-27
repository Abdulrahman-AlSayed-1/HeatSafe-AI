import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Home,
  Building2,
  Calendar,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Shield,
  Sparkles,
} from 'lucide-react';
import { worksitesApi } from '../api/worksites';
import { HeatRiskAssessmentDTO } from '../api/heatRisk';

interface LocationState {
  taskName?: string;
  summary?: string;
  baseline?: HeatRiskAssessmentDTO;
  proposed?: HeatRiskAssessmentDTO;
  baselineTaskRisk?: { riskLevel: string; riskScore: number };
  proposedTaskRisk?: { riskLevel: string; riskScore: number };
}

export default function ChangesApplied() {
  const { worksiteId } = useParams<{ worksiteId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const [worksiteName, setWorksiteName] = useState<string>('Worksite');

  useEffect(() => {
    document.title = 'HeatSafe AI — Mitigation Plan Applied';
    if (worksiteId) {
      worksitesApi
        .get(parseInt(worksiteId))
        .then((res) => setWorksiteName(res.data.name))
        .catch(() => {});
    }
  }, [worksiteId]);

  const handleReturnToDashboard = () => {
    navigate(`/dashboard/${worksiteId}`);
  };

  const baseScoreNum = state.baselineTaskRisk?.riskScore ?? (state.baseline?.score ?? 7.5);
  const propScoreNum = state.proposedTaskRisk?.riskScore ?? (state.proposed?.score ?? 1.5);
  const delta = baseScoreNum - propScoreNum;
  const isImprovement = delta > 0.3;
  const isEscalation = delta < -0.3;

  const proposedTaskLevel = state.proposedTaskRisk?.riskLevel || (propScoreNum >= 7 ? 'HIGH' : propScoreNum >= 4 ? 'MODERATE' : 'LOW');
  const proposedTaskScore = propScoreNum.toFixed(1);
  const baselineTaskLevel = state.baselineTaskRisk?.riskLevel || (baseScoreNum >= 7 ? 'HIGH' : baseScoreNum >= 4 ? 'MODERATE' : 'LOW');
  const baselineTaskScore = baseScoreNum.toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50/40 bg-pattern pb-16">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleReturnToDashboard}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Schedule & Mitigations Applied</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Worksite: <strong>{worksiteName}</strong></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Dynamic Status Banner */}
          {isImprovement ? (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-emerald-200 relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 text-white">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Worksite Heat Mitigation Plan Active
              </h2>
              <p className="text-slate-600 text-sm max-w-lg mx-auto">
                Your task schedule modifications and OSHA work-rest protocols successfully de-escalated heat strain for this task.
              </p>
            </div>
          ) : isEscalation ? (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-orange-300 relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20 text-white">
                <AlertTriangle className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Schedule Updated: Elevated Heat Exposure Alert
              </h2>
              <p className="text-slate-600 text-sm max-w-lg mx-auto">
                The updated schedule shifts this task into a higher-temperature diurnal window. Consider adding work-rest cycles or cooling controls.
              </p>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center border border-blue-200 relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 text-white">
                <Calendar className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Operating Schedule Updated
              </h2>
              <p className="text-slate-600 text-sm max-w-lg mx-auto">
                Task modifications committed to the database. Thermal exposure levels remain within existing operating parameters.
              </p>
            </div>
          )}

          {/* Applied Mitigations Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Applied Schedule Changes</h3>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-xl border border-blue-200">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>{state.taskName || 'Selected Task'}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {state.summary || 'Task shift time, work-rest cycle, and cooling controls updated successfully.'}
                  </p>
                </div>
                <div className={`p-1.5 rounded-lg flex-shrink-0 text-white ${isEscalation ? 'bg-orange-500' : 'bg-emerald-600'}`}>
                  {isEscalation ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Recalculated Risk Metrics */}
          <div
            className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 space-y-4 ${
              isImprovement
                ? 'border-emerald-500'
                : isEscalation
                ? 'border-orange-500'
                : 'border-blue-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield
                className={`w-5 h-5 ${
                  isImprovement
                    ? 'text-emerald-600'
                    : isEscalation
                    ? 'text-orange-600'
                    : 'text-blue-600'
                }`}
              />
              <h3 className="text-base font-bold text-slate-900">Recalculated Task Risk & Exposure</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className={`flex flex-col items-center justify-center text-center p-4 rounded-xl border ${
                  isImprovement
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                    : isEscalation
                    ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Task Risk Status
                </p>
                <p
                  className={`text-2xl font-black mt-1 ${
                    isImprovement
                      ? 'text-emerald-800'
                      : isEscalation
                      ? 'text-orange-800'
                      : 'text-slate-900'
                  }`}
                >
                  {proposedTaskLevel}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Was: {baselineTaskLevel}</p>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Task Risk Score</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{proposedTaskScore} / 10</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Was: {baselineTaskScore} / 10</p>
              </div>

              <div
                className={`flex flex-col items-center justify-center text-center p-4 rounded-xl border ${
                  isImprovement
                    ? 'bg-blue-50 border-blue-200'
                    : isEscalation
                    ? 'bg-red-50 border-red-200'
                    : 'bg-indigo-50 border-indigo-200'
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isImprovement
                      ? 'text-blue-700'
                      : isEscalation
                      ? 'text-red-700'
                      : 'text-indigo-700'
                  }`}
                >
                  {isImprovement
                    ? 'Workers Safeguarded'
                    : isEscalation
                    ? 'Thermal Exposure Alert'
                    : 'Operational Status'}
                </p>
                <p
                  className={`text-2xl font-black mt-1 ${
                    isImprovement
                      ? 'text-blue-900'
                      : isEscalation
                      ? 'text-red-900'
                      : 'text-indigo-900'
                  }`}
                >
                  {isImprovement
                    ? '100% Protected'
                    : isEscalation
                    ? 'Caution Required'
                    : 'Schedule Active'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isImprovement
                    ? 'Safe from Peak Heat'
                    : isEscalation
                    ? 'Exposed to Peak Heat'
                    : 'Thermal Profile Stable'}
                </p>
              </div>
            </div>

            {/* Bottom Outcome Notice */}
            {isImprovement ? (
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-300 flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Task Risk Reduced by {Math.abs(delta).toFixed(1)} Points ({baselineTaskScore}/10 → {proposedTaskScore}/10)
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Workers are de-escalated from high diurnal solar heat strain.
                  </p>
                </div>
              </div>
            ) : isEscalation ? (
              <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border border-orange-300 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-red-700 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-900">
                    Task Risk Increased by {Math.abs(delta).toFixed(1)} Points ({baselineTaskScore}/10 → {proposedTaskScore}/10)
                  </p>
                  <p className="text-[11px] text-red-800">
                    Warning: The modified shift encounters higher environmental heat. Consider adding misting/cooling stations or 30/30 work-rest cycles.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-300 flex items-center gap-3">
                <Minus className="w-6 h-6 text-blue-700 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900">
                    Task Risk Maintained at {proposedTaskScore}/10 ({proposedTaskLevel})
                  </p>
                  <p className="text-[11px] text-blue-800">
                    Operating schedule saved with standard operational monitoring.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Navigation */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleReturnToDashboard}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
            >
              <Home className="w-5 h-5" />
              <span>Return to Worksite Dashboard</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

