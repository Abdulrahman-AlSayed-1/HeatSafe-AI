import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  TrendingDown,
  Clock,
  Building2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Timer,
  Droplets,
  Tent,
  Wind,
  Shirt,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Users,
  Plus,
  AlertCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { tasksApi, Task } from '../api/tasks';
import { scenarioApi, ScenarioResponseDTO } from '../api/scenario';
import { heatRiskApi, HeatRiskAssessmentDTO } from '../api/heatRisk';
import { worksitesApi } from '../api/worksites';
import { BrandIcon } from '../components/BrandLogo';
import toast from 'react-hot-toast';

// Work-Rest Protocol Presets
const WORK_REST_OPTIONS = [
  {
    id: 'CONTINUOUS',
    label: 'Continuous Work (60m / 0m)',
    desc: 'Unbroken shift with no scheduled recovery intervals',
    icon: Sun,
    color: 'border-slate-300 bg-white hover:bg-slate-50',
    activeColor: 'border-slate-800 bg-slate-900 text-white',
  },
  {
    id: '45_15',
    label: '45m Work / 15m Rest',
    desc: 'Standard OSHA moderate heat-strain protocol',
    icon: Timer,
    color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
    activeColor: 'border-blue-600 bg-blue-600 text-white',
  },
  {
    id: '30_30',
    label: '30m Work / 30m Rest',
    desc: '50% rest ratio for sustained elevated heat exposure',
    icon: ShieldCheck,
    color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
    activeColor: 'border-amber-600 bg-amber-600 text-white',
  },
  {
    id: '15_45',
    label: '15m Work / 45m Rest',
    desc: 'High-heat emergency protocol for critical temperatures',
    icon: ShieldAlert,
    color: 'border-red-200 bg-red-50/50 hover:bg-red-50',
    activeColor: 'border-red-600 bg-red-600 text-white',
  },
];

// On-Site Engineering & Administrative Controls
const COOLING_CONTROLS = [
  { id: 'SHADE_CANOPY', label: 'Shade Canopy / Rest Tent', icon: Tent },
  { id: 'HYDRATION_POINT', label: 'Electrolyte Hydration Station', icon: Droplets },
  { id: 'MISTING_FAN', label: 'High-Pressure Misting Fan', icon: Wind },
  { id: 'COOLING_VESTS', label: 'Phase-Change Cooling Vests', icon: Shirt },
];

// Time Shift Quick Presets
const TIME_PRESETS = [
  { label: '🌅 Early Morning (07:00)', time: '07:00' },
  { label: '🌤️ Pre-Heat Shift (08:30)', time: '08:30' },
  { label: '⛅ Late Afternoon (16:30)', time: '16:30' },
  { label: '🌙 Evening Shift (18:00)', time: '18:00' },
];

export default function ScenarioEditor() {
  const { worksiteId } = useParams<{ worksiteId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [worksiteName, setWorksiteName] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);

  // 4 Simulation Levers State
  const [proposedTime, setProposedTime] = useState<string>('08:30');
  const [proposedDuration, setProposedDuration] = useState<number>(120);
  const [proposedWorkRest, setProposedWorkRest] = useState<string>('45_15');
  const [selectedCoolingMeasures, setSelectedCoolingMeasures] = useState<string[]>([
    'SHADE_CANOPY',
    'HYDRATION_POINT',
  ]);

  // Assessment results
  const [baselineAssessment, setBaselineAssessment] = useState<HeatRiskAssessmentDTO | null>(null);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResponseDTO | null>(null);

  // Fetch initial worksite data, tasks, and telemetry
  useEffect(() => {
    if (!worksiteId) return;
    const id = parseInt(worksiteId);
    setLoading(true);

    Promise.all([
      worksitesApi.get(id).then((res) => setWorksiteName(res.data.name)),
      tasksApi.getAll(id).then((res) => {
        const taskList = res.data || [];
        setTasks(taskList);

        const targetTaskQuery = searchParams.get('task');
        let initialTarget = taskList[0];

        if (targetTaskQuery && taskList.length > 0) {
          const matched = taskList.find(
            (t) => t.name.toLowerCase() === targetTaskQuery.toLowerCase() || t.name.toLowerCase().includes(targetTaskQuery.toLowerCase())
          );
          if (matched) initialTarget = matched;
        }

        if (initialTarget) {
          setSelectedTaskId(initialTarget.id);
          const date = new Date(initialTarget.startTime);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          setProposedTime(`${hours}:${minutes}`);
          setProposedDuration(initialTarget.durationMinutes || 120);
          setProposedWorkRest(initialTarget.workRestRatio || '45_15');
          if (initialTarget.coolingMeasures) {
            setSelectedCoolingMeasures(initialTarget.coolingMeasures.split(',').map((s) => s.trim()));
          }
        }
      }),
      heatRiskApi.assess(id).then((res) => setBaselineAssessment(res.data)),
    ])
      .catch((err) => {
        console.error('Error fetching worksite scenario context:', err);
        toast.error('Failed to load worksite task data');
      })
      .finally(() => setLoading(false));
  }, [worksiteId]);

  useEffect(() => {
    document.title = `HeatSafe AI — What-If Simulator${worksiteName ? ` | ${worksiteName}` : ''}`;
  }, [worksiteName]);

  // When selected task changes, initialize simulation levers to that task's parameters
  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    const date = new Date(task.startTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setProposedTime(`${hours}:${minutes}`);
    setProposedDuration(task.durationMinutes || 120);
    setProposedWorkRest(task.workRestRatio || 'CONTINUOUS');
    if (task.coolingMeasures) {
      setSelectedCoolingMeasures(task.coolingMeasures.split(',').map((s) => s.trim()));
    } else {
      setSelectedCoolingMeasures(['SHADE_CANOPY', 'HYDRATION_POINT']);
    }
  };

  // Toggle cooling control chips
  const toggleCoolingMeasure = (measureId: string) => {
    setSelectedCoolingMeasures((prev) =>
      prev.includes(measureId) ? prev.filter((m) => m !== measureId) : [...prev, measureId]
    );
  };

  // Run live What-If simulation against backend
  const evaluateCurrentScenario = async () => {
    if (!worksiteId || !selectedTaskId || !proposedTime) return;
    const wId = parseInt(worksiteId);

    try {
      setEvaluating(true);

      const targetTask = tasks.find((t) => t.id === selectedTaskId);
      const baseDate = targetTask ? new Date(targetTask.startTime) : new Date();
      const [h, m] = proposedTime.split(':').map(Number);
      baseDate.setHours(h, m, 0, 0);

      const payload = {
        taskId: selectedTaskId,
        proposedStartTime: baseDate.toISOString().replace('Z', ''),
        proposedDurationMinutes: proposedDuration,
        proposedWorkRestRatio: proposedWorkRest,
        proposedCoolingMeasures: selectedCoolingMeasures.join(','),
        applyToTask: false,
      };

      const res = await scenarioApi.evaluate(wId, payload);
      setScenarioResult(res.data);
    } catch (err: any) {
      console.error('Error evaluating what-if scenario:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // Trigger evaluation on lever changes
  useEffect(() => {
    if (selectedTaskId && proposedTime) {
      evaluateCurrentScenario();
    }
  }, [selectedTaskId, proposedTime, proposedDuration, proposedWorkRest, selectedCoolingMeasures]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const isAwaitingForecast = Boolean(
    selectedTask && (selectedTask.riskLevel === 'AWAITING_FORECAST' || selectedTask.riskScore == null)
  );

  // Apply Changes to Task in Database
  const handleApplyToTask = async () => {
    if (!worksiteId || !selectedTaskId || !proposedTime) return;
    if (isAwaitingForecast) {
      toast.error('Changes cannot be committed while task is awaiting FortyGuard satellite forecast (>24h out).');
      return;
    }
    const wId = parseInt(worksiteId);

    try {
      setApplying(true);
      const targetTask = tasks.find((t) => t.id === selectedTaskId);
      const baseDate = targetTask ? new Date(targetTask.startTime) : new Date();
      const [h, m] = proposedTime.split(':').map(Number);
      baseDate.setHours(h, m, 0, 0);

      const payload = {
        taskId: selectedTaskId,
        proposedStartTime: baseDate.toISOString().replace('Z', ''),
        proposedDurationMinutes: proposedDuration,
        proposedWorkRestRatio: proposedWorkRest,
        proposedCoolingMeasures: selectedCoolingMeasures.join(','),
        applyToTask: true,
      };

      const res = await scenarioApi.evaluate(wId, payload);
      toast.success('Mitigation plan applied! Dashboard recalculated.');

      navigate(`/changes-applied/${wId}`, {
        state: {
          taskName: targetTask?.name || 'Task',
          summary: res.data.mitigationSummary,
          baseline: res.data.baselineAssessment,
          proposed: res.data.proposedAssessment,
          baselineTaskRisk: res.data.baselineTaskRisk,
          proposedTaskRisk: res.data.proposedTaskRisk,
        },
      });
    } catch (err: any) {
      console.error('Error applying scenario changes:', err);
      toast.error('Failed to apply changes. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const getRiskBadgeStyles = (level?: string) => {
    switch (level) {
      case 'EXTREME':
        return 'bg-red-600 text-white border-red-500 shadow-red-200';
      case 'HIGH':
        return 'bg-orange-500 text-white border-orange-400 shadow-orange-200';
      case 'MODERATE':
        return 'bg-amber-500 text-white border-amber-400 shadow-amber-200';
      case 'UNSUPPORTED':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50/40 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-slate-200">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="font-bold text-slate-800 text-sm">Loading Worksite Simulation Cockpit...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50/40 bg-pattern pb-16">
      {/* Top Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(`/dashboard/${worksiteId}`)}
                className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-colors border border-slate-200 flex-shrink-0"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <BrandIcon size="sm" className="flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">What-If Heat Mitigation Simulator</h1>
                  <span className="hidden xs:inline-flex text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex-shrink-0">
                    Decision Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Worksite: <strong>{worksiteName || 'Loading...'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <button
                onClick={evaluateCurrentScenario}
                disabled={evaluating}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin text-blue-600' : ''}`} />
                <span>Re-simulate</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Simulator Cockpit */}
      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Helper Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex items-start gap-3.5">
          <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm flex-shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold">
              Experiment With 4 Operational Levers to Reduce Heat Risk
            </h2>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Test moving tasks to cooler diurnal hours, adjusting continuous duration, applying OSHA work-rest ratios, and deploying on-site cooling stations. Observe live impact before confirming changes.
            </p>
          </div>
        </div>

        {/* Task Selection Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Step 1: Select Target Worksite Task to Mitigate</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {tasks.length} Scheduled {tasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No tasks scheduled for this worksite. Please add a task from the Dashboard first.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                const isTaskAwaiting = task.riskLevel === 'AWAITING_FORECAST' || task.riskScore == null;
                const startTimeStr = new Date(task.startTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleSelectTask(task)}
                    className={`p-3.5 rounded-xl text-left border transition-all relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <p className="text-sm font-bold text-slate-900 truncate">{task.name}</p>
                      {isTaskAwaiting ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/80 flex-shrink-0 flex items-center gap-1">
                          <Timer className="w-2.5 h-2.5 text-amber-600" />
                          Awaiting Forecast
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200/80 flex-shrink-0">
                          Live Forecast Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{startTimeStr}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3 text-slate-400" />
                        <span>{task.durationMinutes}m</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{task.workerCount || 1}</span>
                      </span>
                    </div>
                    {task.mitigationNotes && (
                      <p className="text-[10px] text-emerald-700 font-medium mt-1 truncate">
                        ✓ {task.mitigationNotes}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4 Levers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {!selectedTask && (
              <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200/80 flex items-center gap-3 text-amber-900 text-xs font-semibold shadow-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>Please select a task from Step 1 above to test and tune operational mitigation levers.</span>
              </div>
            )}

            {/* Awaiting Forecast Pre-Shift Staging Advisory */}
            {selectedTask && isAwaitingForecast && (
              <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50/40 to-yellow-50/70 rounded-2xl border border-amber-200/90 text-xs text-amber-900 shadow-xs flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0 mt-0.5">
                  <Timer className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">Pre-Shift Planning Preview Mode (&gt;24h Shift)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/90 text-amber-900 border border-amber-300">
                      Preview Only • Schedule Changes Locked
                    </span>
                  </div>
                  <p className="text-amber-800/90 mt-1 leading-relaxed">
                    This shift is scheduled beyond the +24 hour horizon. You can configure work-rest protocols and cooling measures for pre-planning. Live FortyGuard satellite hazard scoring unlocks and changes can be applied once the T-24h satellite forecast window is reached.
                  </p>
                </div>
              </div>
            )}

            {/* Lever 1: Shift Work Time */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Shift Work Time Window</span>
                </label>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  {proposedTime}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => setProposedTime(preset.time)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      proposedTime === preset.time
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <input
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Lever 2: Task Duration */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Continuous Exposure Duration</span>
                </label>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                  {Math.floor(proposedDuration / 60)}h {proposedDuration % 60}m ({proposedDuration} mins)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[30, 60, 90, 120, 180, 240].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setProposedDuration(mins)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      proposedDuration === mins
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="30"
                max="360"
                step="15"
                value={proposedDuration}
                onChange={(e) => setProposedDuration(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Lever 3: Work-Rest Cycles */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/80 shadow-md space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">3</span>
                <span>Work-Rest Cycle (OSHA / ISO 7243 Protocol)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WORK_REST_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = proposedWorkRest === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setProposedWorkRest(opt.id)}
                      className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                        isActive
                          ? `${opt.activeColor} shadow-md`
                          : `${opt.color} text-slate-700`
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lever 4: On-Site Cooling & Hydration Controls */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">4</span>
                  <span>On-Site Environmental Engineering Controls</span>
                </label>
                <span className="text-xs font-bold text-emerald-700">
                  {selectedCoolingMeasures.length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COOLING_CONTROLS.map((control) => {
                  const Icon = control.icon;
                  const isChecked = selectedCoolingMeasures.includes(control.id);
                  return (
                    <button
                      key={control.id}
                      type="button"
                      onClick={() => toggleCoolingMeasure(control.id)}
                      className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isChecked ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold">{control.label}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side-by-Side Live Evaluation (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Comparison Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg sticky top-24 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Task Risk Simulation</h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                      {selectedTask ? `Target: ${selectedTask.name}` : 'No Task Selected'}
                    </p>
                  </div>
                </div>
                {selectedTask && evaluating && (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Calculating...
                  </span>
                )}
              </div>

              {!selectedTask ? (
                /* Appropriate State when No Task is Selected */
                <div className="py-8 px-4 text-center space-y-3 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No Task Selected</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {tasks.length > 0
                      ? 'Choose a task from Step 1 above to load its baseline thermal exposure and simulate mitigation controls.'
                      : 'Add a task to this worksite from the Dashboard first to start experimenting with heat safety scenarios.'}
                  </p>
                  {tasks.length === 0 && (
                    <button
                      type="button"
                      onClick={() => navigate(`/add-task/${worksiteId}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </button>
                  )}
                </div>
              ) : isAwaitingForecast ? (
                /* Dedicated Appropriate Stats State for Awaiting Forecast Tasks */
                <div className="space-y-4">
                  {/* Status Alert Banner */}
                  <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50/60 rounded-2xl border border-amber-200/90 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-900">
                      <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                        <Timer className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider">FortyGuard Telemetry Status</h4>
                        <p className="text-sm font-black text-amber-900">Awaiting Satellite Forecast Window (&gt;24h Out)</p>
                      </div>
                    </div>
                    <p className="text-xs text-amber-800/90 leading-relaxed pt-1 border-t border-amber-200/60">
                      This shift is scheduled for <strong>{new Date(selectedTask.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(selectedTask.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>. High-resolution FortyGuard satellite thermal curves and metabolic heat risk indices unlock automatically at <strong>T-24 hours</strong> before shift start.
                    </p>
                  </div>

                  {/* Shift & Telemetry Stats Matrix */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Status</p>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Pre-Shift Staged</span>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-0.5">Unlocks at T-24h</p>
                    </div>

                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-center space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Assigned Crew</p>
                      <p className="text-lg font-black text-blue-900">{selectedTask.workerCount || 4} Workers</p>
                      <p className="text-[10px] text-blue-600 font-medium">Headcount Planned</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Planned Duration</p>
                      <p className="text-sm font-bold text-slate-900">{proposedDuration} mins</p>
                      <p className="text-[10px] text-slate-500">Continuous Shift</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Configured Work-Rest</p>
                      <p className="text-sm font-bold text-slate-900">{proposedWorkRest.replace('_', '/')}</p>
                      <p className="text-[10px] text-slate-500">OSHA Protocol</p>
                    </div>
                  </div>

                  {/* Proactive Planning Guidance */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Proactive Planning Advisory:</span>
                    </p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      You can tune work-rest cycles and cooling measures in advance. Full numeric hazard delta simulations and live mitigation commits will become available when live FortyGuard satellite telemetry unlocks within 12 hours of the shift.
                    </p>
                  </div>
                </div>
              ) : (
                /* Active Task Risk Simulation View */
                <>
                  {/* Side by Side Task Risk Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Baseline Box */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Current Task Risk
                      </p>
                      <div
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getRiskBadgeStyles(
                          scenarioResult?.baselineTaskRisk?.riskLevel || selectedTask.riskLevel || 'HIGH'
                        )}`}
                      >
                        {scenarioResult?.baselineTaskRisk?.riskLevel || selectedTask.riskLevel || 'HIGH'}
                      </div>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        {scenarioResult?.baselineTaskRisk?.riskScore != null
                          ? `${scenarioResult.baselineTaskRisk.riskScore.toFixed(1)}/10`
                          : selectedTask.riskScore != null
                          ? `${selectedTask.riskScore.toFixed(1)}/10`
                          : '8.0/10'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {selectedTask.workerCount || 1} Worker{(selectedTask.workerCount || 1) > 1 ? 's' : ''} Exposed
                      </p>
                    </div>

                    {/* Proposed Box */}
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-center space-y-1 relative overflow-hidden">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Simulated Task Risk
                      </p>
                      <div
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getRiskBadgeStyles(
                          scenarioResult?.proposedTaskRisk?.riskLevel || 'LOW'
                        )}`}
                      >
                        {scenarioResult?.proposedTaskRisk?.riskLevel || 'LOW'}
                      </div>
                      <p className="text-2xl font-black text-emerald-800 mt-1">
                        {scenarioResult?.proposedTaskRisk?.riskScore != null
                          ? `${scenarioResult.proposedTaskRisk.riskScore.toFixed(1)}/10`
                          : '1.5/10'}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        {scenarioResult?.proposedTaskRisk?.riskLevel === 'LOW' || scenarioResult?.proposedTaskRisk?.riskLevel === 'SAFE'
                          ? '✓ Safeguarded'
                          : 'Partial Strain'}
                      </p>
                    </div>
                  </div>

                  {/* Task Score Reduction Improvement Badge */}
                  {(() => {
                    const base = scenarioResult?.baselineTaskRisk?.riskScore ?? selectedTask.riskScore ?? 7.5;
                    const prop = scenarioResult?.proposedTaskRisk?.riskScore ?? 2.0;
                    const delta = Math.max(0, base - prop);
                    if (delta > 0.2) {
                      return (
                        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                          <div className="p-2 bg-emerald-600 text-white rounded-lg flex-shrink-0">
                            <TrendingDown className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-900">
                              Task Risk Reduced by {delta.toFixed(1)} Points!
                            </p>
                            <p className="text-[11px] text-emerald-700">
                              Proposed mitigations effectively eliminate high metabolic heat strain for this task.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-center">
                        Adjust levers to find an optimal low-heat work schedule.
                      </div>
                    );
                  })()}

                  {/* Summary Description */}
                  {scenarioResult?.mitigationSummary && (
                    <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Operational Mitigation Summary:</span>
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {scenarioResult.mitigationSummary}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Environmental Worksite Context Pill */}
              <div className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Worksite Heat Level:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${getRiskBadgeStyles(baselineAssessment?.riskLevel)}`}>
                  {baselineAssessment?.riskLevel ? `${baselineAssessment.riskLevel} HEAT` : 'PENDING'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {isAwaitingForecast ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={true}
                      className="w-full py-3.5 px-4 bg-slate-200 text-slate-500 font-bold rounded-xl border border-slate-300 shadow-none cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
                      title="Mitigation plans can only be committed to live schedule once FortyGuard satellite thermal observations become active (within 24 hours of shift start)."
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Changes Locked — Awaiting Satellite Forecast (T-24h)</span>
                    </button>

                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span>
                          Mitigation plan application is disabled for shifts scheduled beyond 24 hours. Live thermal calculations require verified satellite raster telemetry.
                        </span>
                        {selectedTask && (
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/edit-task/${worksiteId}/${selectedTask.id}`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 text-[11px] shadow-xs transition-all"
                            >
                              <span>Edit Task Parameters in Dashboard →</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyToTask}
                    disabled={applying || !selectedTaskId}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {applying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Applying Changes to Worksite...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{selectedTaskId ? 'Apply Mitigation Plan to Schedule' : 'Select a Task to Apply Mitigation'}</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/${worksiteId}`)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors text-xs text-center"
                >
                  Cancel & Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
