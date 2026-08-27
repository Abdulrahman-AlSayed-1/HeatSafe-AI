import { Task, ExposureType } from '../api/tasks';
import {
  Clock,
  Sun,
  TreePine,
  Home,
  Layers,
  Edit2,
  Trash2,
  Users,
  Flame,
  AlertTriangle,
  ShieldCheck,
  Timer,
  Droplets,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

const exposureTypeConfig: Record<ExposureType, { icon: any; label: string; color: string }> = {
  [ExposureType.HIGH]: {
    icon: Sun,
    label: 'High Exposure',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  [ExposureType.MODERATE]: {
    icon: TreePine,
    label: 'Moderate Exposure',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  [ExposureType.LOW]: {
    icon: Layers,
    label: 'Low Exposure',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  [ExposureType.INDOOR]: {
    icon: Home,
    label: 'Indoor',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

const getTaskRiskBadge = (level?: string, score?: number) => {
  if (!level || level === 'AWAITING_FORECAST' || level === 'UNSUPPORTED' || score == null) {
    return null;
  }

  const finalScore = score.toFixed(1);
  switch (level.toUpperCase()) {
    case 'EXTREME':
      return {
        label: `EXTREME RISK • ${finalScore}/10`,
        className: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-300',
        Icon: Flame,
        iconColor: 'text-red-600',
      };
    case 'HIGH':
      return {
        label: `HIGH RISK • ${finalScore}/10`,
        className: 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-300',
        Icon: Flame,
        iconColor: 'text-orange-600',
      };
    case 'MODERATE':
      return {
        label: `MODERATE RISK • ${finalScore}/10`,
        className: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-300',
        Icon: AlertTriangle,
        iconColor: 'text-amber-600',
      };
    default:
      return {
        label: `LOW RISK • ${finalScore}/10`,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300',
        Icon: ShieldCheck,
        iconColor: 'text-emerald-600',
      };
  }
};

export default function TaskList({ tasks, loading, onEdit, onDelete, emptyTitle, emptyMessage }: TaskListProps) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((n) => (
          <div
            key={n}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-4 sm:p-5 animate-pulse"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Task name skeleton */}
                  <div className="h-5 bg-slate-200 rounded-lg w-40"></div>
                  {/* Risk Badge skeleton */}
                  <div className="h-5 bg-slate-200 rounded-full w-28"></div>
                  {/* Exposure Badge skeleton */}
                  <div className="h-5 bg-slate-100 rounded-full w-24"></div>
                </div>

                {/* Subtitle / Details skeleton */}
                <div className="flex items-center gap-4">
                  <div className="h-3.5 bg-slate-100 rounded w-28"></div>
                  <div className="h-3.5 bg-slate-100 rounded w-20"></div>
                  <div className="h-3.5 bg-slate-100 rounded w-20"></div>
                </div>

                {/* Work rest protocol skeleton */}
                <div className="h-6 bg-slate-50 rounded-xl w-60 mt-1 border border-slate-100"></div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
                <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-700 font-semibold text-sm">{emptyTitle || 'No tasks found'}</p>
        <p className="text-slate-400 text-xs mt-0.5">{emptyMessage || 'Add your first task to get started'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const config = exposureTypeConfig[task.exposureType] || exposureTypeConfig[ExposureType.HIGH];
        const ExposureIcon = config.icon;
        const taskRisk = getTaskRiskBadge(task.riskLevel, task.riskScore);
        const RiskIcon = taskRisk ? taskRisk.Icon : null;

        return (
          <div
            key={task.id}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-base truncate">{task.name}</h3>

                  {/* Individual Task Risk Score Badge */}
                  {taskRisk && RiskIcon && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${taskRisk.className}`}
                      title={task.riskReason || 'Individual Task Heat Risk Score'}
                    >
                      <RiskIcon className={`w-3.5 h-3.5 ${taskRisk.iconColor}`} />
                      <span>{taskRisk.label}</span>
                    </span>
                  )}

                  {/* Exposure Type Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} flex items-center gap-1.5`}>
                    <ExposureIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
                )}

                {/* Task Risk Explanation Subtitle */}
                {task.riskReason && (
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>{task.riskReason}</span>
                  </p>
                )}

                {/* Active Mitigations & Work-Rest Protocols */}
                {(task.workRestRatio && task.workRestRatio !== 'CONTINUOUS' || task.coolingMeasures || task.mitigationNotes) && (
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    {task.workRestRatio && task.workRestRatio !== 'CONTINUOUS' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-blue-600" />
                        <span>{task.workRestRatio.replace('_', 'm Work / ')}m Rest</span>
                      </span>
                    )}
                    {task.coolingMeasures && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5" title={task.coolingMeasures}>
                        <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cooling Controls Active</span>
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(task.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatDuration(task.durationMinutes)}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Users className="w-3 h-3 text-emerald-600" />
                    <span>{task.workerCount || 1} {task.workerCount === 1 ? 'worker' : 'workers'}</span>
                  </div>
                </div>

                {/* Sleek 4-Phase Segmented Thermal Tracker */}
                {(() => {
                  const d = new Date(task.startTime);
                  const startHour = d.getHours() + d.getMinutes() / 60;
                  const durHours = (task.durationMinutes || 60) / 60;
                  const endHour = startHour + durHours;

                  const inDawn = startHour < 6 || (endHour > 0 && startHour <= 0);
                  const inMorning = (startHour < 12 && endHour > 6);
                  const inPeak = (startHour < 17 && endHour > 12);
                  const inEvening = (endHour > 17 && startHour < 24) || endHour > 24;

                  const phases = [
                    {
                      id: 'dawn',
                      name: 'Dawn',
                      hours: '00–06h',
                      isActive: inDawn,
                      activeStyle: 'bg-indigo-600 text-white font-bold ring-1 ring-indigo-700 shadow-xs',
                      inactiveStyle: 'bg-slate-100/90 text-slate-400 border border-slate-200/80',
                    },
                    {
                      id: 'morning',
                      name: 'Morning',
                      hours: '06–12h',
                      isActive: inMorning,
                      activeStyle: 'bg-blue-600 text-white font-bold ring-1 ring-blue-700 shadow-xs',
                      inactiveStyle: 'bg-slate-100/90 text-slate-400 border border-slate-200/80',
                    },
                    {
                      id: 'peak',
                      name: 'Midday Peak',
                      hours: '12–17h',
                      isActive: inPeak,
                      isDanger: true,
                      activeStyle: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-extrabold ring-1 ring-red-700 shadow-xs',
                      inactiveStyle: 'bg-red-50/40 text-red-400/70 border border-red-100/80',
                    },
                    {
                      id: 'evening',
                      name: 'Evening',
                      hours: '17–24h',
                      isActive: inEvening,
                      activeStyle: 'bg-teal-700 text-white font-bold ring-1 ring-teal-800 shadow-xs',
                      inactiveStyle: 'bg-slate-100/90 text-slate-400 border border-slate-200/80',
                    },
                  ];

                  return (
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Shift Diurnal Schedule:</span>
                        </span>
                        {inPeak ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-red-500" />
                            <span>Overlaps Midday Heat (12–17h)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Off-Peak Cool Hours</span>
                          </span>
                        )}
                      </div>

                      {/* 4 Phase Segment Grid */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {phases.map((phase) => (
                          <div
                            key={phase.id}
                            className={`py-1.5 px-1.5 sm:px-2 rounded-xl text-center transition-all ${
                              phase.isActive ? phase.activeStyle : phase.inactiveStyle
                            }`}
                          >
                            <div className="text-[10px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1">
                              {phase.isActive && phase.isDanger && <Flame className="w-2.5 h-2.5 text-white animate-bounce flex-shrink-0" />}
                              {phase.isActive && !phase.isDanger && <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>}
                              <span className="truncate">{phase.name}</span>
                            </div>
                            <div className={`text-[9px] font-mono mt-0.5 ${phase.isActive ? 'text-white/90 font-bold' : 'text-slate-400'}`}>
                              {phase.hours}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {(onEdit || onDelete) && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(task)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
