import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  RefreshCw,
  Lightbulb,
  Calendar,
  Users,
  TrendingUp,
  ShieldCheck,
  Plus,
  AlertCircle,
  Trash2,
  Sparkles,
  Timer,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Info,
  Sliders,
  ArrowRight,
  FileText,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import TaskList from '../components/TaskList';
import ThermalProfileCards from '../components/ThermalProfileCards';
import HeatExposurePanel from '../components/HeatExposurePanel';
import RiskReasons from '../components/RiskReasons';
import ThermalHorizonGauge from '../components/ThermalHorizonGauge';
import { BrandIcon } from '../components/BrandLogo';
import HeatmapViewer from '../components/HeatmapViewer';
import { tasksApi, Task as ApiTask } from '../api/tasks';
import { worksitesApi, Worksite } from '../api/worksites';
import { temperatureApi, TemperatureSeries } from '../api/temperature';
import { heatRiskApi, HeatRiskAssessmentDTO } from '../api/heatRisk';
import { recommendationsApi, RecommendationDTO } from '../api/recommendations';
import { thermalProfileApi, WorksiteThermalProfileDTO } from '../api/thermalProfile';
import { heatExposureApi, HeatExposureDTO } from '../api/heatExposure';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload || payload.temp == null) return null;
  const temp = payload.temp;
  let color = '#10b981';
  if (temp >= 40) color = '#dc2626';
  else if (temp >= 38) color = '#f97316';
  else if (temp >= 35) color = '#f59e0b';
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const temp = payload[0].value;
    const isCritical = temp >= 38.0;
    const isModerate = temp >= 34.0 && temp < 38.0;

    const oshaProtocol =
      temp >= 41.0
        ? '15m Work / 45m Rest (Strict Stoppage Advisory)'
        : temp >= 38.0
        ? '30m Work / 30m Rest + Continuous Misting'
        : temp >= 34.0
        ? '45m Work / 15m Rest + Hydration'
        : 'Continuous Work (Standard Hydration)';

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs space-y-1.5 min-w-[210px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
          <span className="font-bold text-slate-300">{label}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              isCritical
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : isModerate
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isCritical ? 'Critical Heat' : isModerate ? 'Moderate Heat' : 'Safe Window'}
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-slate-400">Surface Temp:</span>
          <span className="text-lg font-black text-white">{temp.toFixed(1)}°C</span>
        </div>
        <div className="pt-1 text-[11px] text-slate-300 border-t border-slate-800/80">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">OSHA Guideline:</span>
          <span className="font-semibold text-amber-300">{oshaProtocol}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { worksiteId } = useParams<{ worksiteId: string }>();
  const navigate = useNavigate();
  const [activeRecIndex, setActiveRecIndex] = useState(0);
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [worksite, setWorksite] = useState<Worksite | null>(null);

  // Deletion modal state for tasks
  const [deleteModalTask, setDeleteModalTask] = useState<ApiTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<boolean>(false);

  // Data states
  const [temperatureData, setTemperatureData] = useState<TemperatureSeries | null>(null);
  const [thermalProfile, setThermalProfile] = useState<WorksiteThermalProfileDTO | null>(null);
  const [heatExposure, setHeatExposure] = useState<HeatExposureDTO | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<HeatRiskAssessmentDTO | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationDTO[]>([]);

  // Error states
  const [thermalError, setThermalError] = useState<string | null>(null);
  const [exposureError, setExposureError] = useState<string | null>(null);
  const [temperatureError, setTemperatureError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const extractErrorMessage = (err: any): string => {
    if (err?.response?.data?.message) return err.response.data.message;
    return 'Environmental telemetry observation is synchronizing.';
  };

  const fetchDashboardData = async (id: number) => {
    // Reset error states
    setThermalError(null);
    setExposureError(null);
    setTemperatureError(null);

    // 1. Fetch worksite metadata & tasks (core DB models)
    try {
      const wsRes = await worksitesApi.get(id);
      setWorksite(wsRes.data);
    } catch (err) {
      console.error('Failed to load worksite:', err);
      toast.error('Failed to load worksite details');
    }

    try {
      const taskRes = await tasksApi.getAll(id);
      setApiTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setApiTasks([]);
    }

    // 2. Fetch FortyGuard Telemetry Layers
    try {
      const tpRes = await thermalProfileApi.get(id);
      setThermalProfile(tpRes.data);
      setThermalError(null);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      setThermalError(msg);
      setThermalProfile(null);
    }

    try {
      const expRes = await heatExposureApi.get(id);
      setHeatExposure(expRes.data);
      setExposureError(null);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      setExposureError(msg);
      setHeatExposure(null);
    }

    try {
      const tempRes = await temperatureApi.getSeries(id);
      setTemperatureData(tempRes.data);
      setTemperatureError(null);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      setTemperatureError(msg);
      setTemperatureData(null);
    }

    try {
      const riskRes = await heatRiskApi.assess(id);
      setRiskAssessment(riskRes.data);
    } catch (err: any) {
      setRiskAssessment(null);
    }

    try {
      const recRes = await recommendationsApi.getAll(id);
      setRecommendations(Array.isArray(recRes.data) ? recRes.data : []);
    } catch (err: any) {
      console.warn('Recommendations endpoint:', err);
      setRecommendations([]);
    }
  };

  useEffect(() => {
    if (worksiteId) {
      setLoading(true);
      fetchDashboardData(parseInt(worksiteId)).finally(() => setLoading(false));
    }
  }, [worksiteId]);

  useEffect(() => {
    if (worksite?.name) {
      document.title = `HeatSafe AI — ${worksite.name}`;
    } else {
      document.title = 'HeatSafe AI — Worksite Dashboard';
    }
  }, [worksite?.name]);

  // Process temperature data for chart
  const chartData =
    temperatureData?.points?.map((point) => {
      const date = new Date(point.timestamp);
      const isCritical = (point.temperature || 0) >= 38.0;
      return {
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        temp: Math.round((point.temperature || 0) * 10) / 10,
        risk: isCritical ? 'critical' : 'safe',
        fill: isCritical ? '#dc2626' : '#22c55e',
      };
    }) || [];

  const worksiteName = worksite?.name || 'Worksite';
  const isAssessmentLoading = loading || !riskAssessment;
  const isUnsupported = riskAssessment?.riskLevel === 'UNSUPPORTED';
  const riskLevel = isAssessmentLoading ? 'PENDING' : (riskAssessment?.riskLevel || 'SAFE');

  const criticalWindow = isAssessmentLoading
    ? 'Syncing Telemetry...'
    : isUnsupported
      ? 'N/A (No Telemetry)'
      : (riskAssessment?.criticalWindows && riskAssessment.criticalWindows.length > 0
        ? `${new Date(riskAssessment.criticalWindows[0].start).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })} – ${new Date(riskAssessment.criticalWindows[0].end).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}`
        : 'None Detected');

  const affectedWorkers = isAssessmentLoading || isUnsupported
    ? '--'
    : (riskAssessment?.affectedTasks && riskAssessment.affectedTasks.length > 0
      ? riskAssessment.affectedTasks.reduce((sum, t) => {
        const found = apiTasks.find((tk) => tk.id === t.taskId);
        return sum + (t.workerCount || found?.workerCount || 4);
      }, 0)
      : 0);

  const handleConfirmDeleteTask = async () => {
    if (!deleteModalTask || !worksiteId) return;
    setDeletingTask(true);
    try {
      await tasksApi.delete(parseInt(worksiteId), deleteModalTask.id);
      setApiTasks((prev) => prev.filter((t) => t.id !== deleteModalTask.id));
      toast.success(`Task "${deleteModalTask.name}" removed from schedule`);
      setDeleteModalTask(null);
      // Re-trigger risk assessment and recommendations refresh
      fetchDashboardData(parseInt(worksiteId));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task. Please try again.');
    } finally {
      setDeletingTask(false);
    }
  };

  const activeForecastTasks = apiTasks.filter((task) => {
    return task.riskLevel !== 'AWAITING_FORECAST' && task.riskScore != null;
  });

  const awaitingForecastTasks = apiTasks.filter((task) => {
    return task.riskLevel === 'AWAITING_FORECAST' || task.riskScore == null;
  });

  const handleTestWhatIf = () => {
    navigate(`/scenario/${worksiteId}`);
  };

  const handleExportSchedule = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Brand Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('HeatSafe AI — Worksite Heat Safety Plan', 14, 13);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(
        `Worksite: ${worksiteName} | Location: (${worksite?.latitude.toFixed(4) || 'N/A'}, ${worksite?.longitude.toFixed(4) || 'N/A'}) | Generated: ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}`,
        14,
        21
      );

      // Section 1: Executive Risk Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Thermal Risk Assessment Summary', 14, 38);

      const riskLevelStr = isAssessmentLoading ? 'CALCULATING' : (riskAssessment?.riskLevel || 'N/A');
      const riskScoreVal =
        riskAssessment?.score != null ? `${riskAssessment.score.toFixed(1)} / 10.0` : '-- / 10.0';
      const peakTempStr = thermalProfile?.maxTemp != null
        ? `${thermalProfile.maxTemp.toFixed(1)}°C`
        : 'N/A (No Telemetry)';
      const criticalWinStr = criticalWindow;
      const workersAtRisk = affectedWorkers !== '--' ? `${affectedWorkers} personnel` : 'N/A';

      autoTable(doc, {
        startY: 42,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
        body: [
          ['Overall Risk Level', riskLevelStr, 'Risk Score', riskScoreVal],
          ['Peak Site Temperature', peakTempStr, 'Critical Heat Window', criticalWinStr],
          ['Exposed Workers', workersAtRisk, 'Telemetry Source', 'FortyGuard Live Microclimate Satellite API'],
        ],
        styles: { fontSize: 9, cellPadding: 3 },
      });

      // Section 2: Key Risk Drivers & Satellite Evidence
      let currentY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. Environmental Reasons & Drivers', 14, currentY);

      const reasonsList =
        riskAssessment?.reasons && riskAssessment.reasons.length > 0
          ? riskAssessment.reasons.map((r, i) => [`${i + 1}.`, r])
          : [['1.', 'Normal thermal conditions across worksite AOI.']];

      autoTable(doc, {
        startY: currentY + 4,
        theme: 'plain',
        body: reasonsList,
        columnStyles: {
          0: { cellWidth: 8, fontStyle: 'bold', textColor: [220, 38, 38] },
          1: { cellWidth: 'auto', textColor: [51, 65, 85] },
        },
        styles: { fontSize: 8.5, cellPadding: 2 },
      });

      // Section 3: Scheduled Tasks & Exposure
      currentY = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('3. Worksite Task Schedule & Heat Exposure', 14, currentY);

      const taskRows = apiTasks.map((t) => {
        const isAffected = riskAssessment?.affectedTasks?.some((at) => at.taskId === t.id);
        const startTimeStr = new Date(t.startTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const endTimeDate = new Date(new Date(t.startTime).getTime() + t.durationMinutes * 60000);
        const endTimeStr = endTimeDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return [
          t.name,
          `${startTimeStr} – ${endTimeStr}`,
          `${t.durationMinutes}m`,
          t.workRestRatio && t.workRestRatio !== 'CONTINUOUS' ? t.workRestRatio.replace('_', 'm/') + 'm' : 'Continuous',
          t.coolingMeasures ? t.coolingMeasures.replace(/_/g, ' ') : 'Standard',
          isAffected ? 'HEAT RISK' : 'MITIGATED / SAFE',
        ];
      });

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Task Name', 'Shift Time', 'Duration', 'Work-Rest', 'Cooling Controls', 'Safety Status']],
        body: taskRows.length > 0 ? taskRows : [['No tasks scheduled', '-', '-', '-', '-', '-']],
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // Section 4: AI Recommendations
      if (recommendations && recommendations.length > 0) {
        currentY = (doc as any).lastAutoTable.finalY + 8;
        if (currentY > 220) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('4. Recommended Mitigation Actions', 14, currentY);

        const recRows = recommendations.map((r) => [
          r.id.toString(),
          r.action,
          r.reasoning,
          r.expectedImpact,
        ]);

        autoTable(doc, {
          startY: currentY + 4,
          head: [['#', 'Action', 'Safety Rationale', 'Expected Impact']],
          body: recRows,
          headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 45, fontStyle: 'bold' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 42 },
          },
          styles: { fontSize: 8, cellPadding: 3 },
          alternateRowStyles: { fillColor: [255, 247, 237] },
        });
      }

      // Page numbers footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `HeatSafe AI — Occupational Heat Health Safety Standard • Page ${i} of ${totalPages}`,
          14,
          290
        );
      }

      const filename = `HeatSafe_Safety_Plan_${worksiteName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      doc.save(filename);
      toast.success('Heat-Safety Plan PDF exported successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to export PDF');
    }
  };

  const handleRefreshData = () => {
    if (worksiteId) {
      setRefreshing(true);
      fetchDashboardData(parseInt(worksiteId))
        .then(() => toast.success('Telemetry refreshed'))
        .catch(() => toast.error('Refresh completed with some errors'))
        .finally(() => setRefreshing(false));
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'EXTREME':
        return 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-200';
      case 'HIGH':
        return 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-red-100';
      case 'MODERATE':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-amber-100';
      case 'PENDING':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200 animate-pulse';
      case 'UNSUPPORTED':
        return 'bg-slate-200 text-slate-800 border border-slate-300 shadow-sm';
      default:
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 bg-pattern">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 flex-shrink-0"
                title="Back to Worksites"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <BrandIcon size="sm" className="flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{worksiteName}</h1>
                  <span className="hidden xs:inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200/60 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Thermal Intelligence Active
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {worksite?.timezone && <span>• {worksite.timezone}</span>}
                  {/* Clear Workforce Exposure indicator */}
                  {riskAssessment && (
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
                        riskAssessment.affectedTasks && riskAssessment.affectedTasks.length > 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {riskAssessment.affectedTasks && riskAssessment.affectedTasks.length > 0
                        ? `⚠️ ${riskAssessment.affectedTasks.length} active shift(s) exposed to peak heat`
                        : `✓ No active crews exposed to peak heat`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
              <div
                className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm ${getRiskBadgeColor(
                  riskLevel
                )}`}
              >
                {isAssessmentLoading ? 'CALCULATING' : riskLevel === 'UNSUPPORTED' ? 'UNSUPPORTED' : `${riskLevel} WORKFORCE RISK`}
              </div>

              {/* Header Quick Action: Export PDF */}
              <button
                onClick={handleExportSchedule}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl transition-all border border-slate-200 shadow-sm text-xs font-semibold"
                title="Export Worksite Heat Safety Plan (PDF)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Plan</span>
              </button>

              {/* Header Quick Action: What-If Simulator */}
              <button
                onClick={handleTestWhatIf}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-all shadow-sm shadow-blue-500/20 text-xs font-bold active:scale-95"
                title="Launch What-If Heat Mitigation Simulator"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulate What-If</span>
              </button>

              <button
                onClick={handleRefreshData}
                disabled={refreshing}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 disabled:opacity-50"
                title="Refresh thermal telemetry"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Thermal Horizon Radial Gauge */}
          <ThermalHorizonGauge
            score={riskAssessment?.score ?? null}
            riskLevel={riskLevel}
            peakTemp={thermalProfile?.maxTemp ?? null}
            criticalWindow={criticalWindow}
            affectedWorkers={affectedWorkers}
            isLoading={isAssessmentLoading}
          />

          {/* Detailed Risk Evidence & Reasons if present */}
          {riskAssessment?.reasons && riskAssessment.reasons.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-slate-100">
              <RiskReasons reasons={riskAssessment.reasons} riskLevel={riskLevel} />
            </div>
          )}

          {/* Thermal Profile Cards (FortyGuard TCM Min/Avg/Max) */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
            <ThermalProfileCards
              thermalProfile={thermalProfile}
              loading={loading}
              error={thermalError}
              onRetry={handleRefreshData}
            />
          </div>

          {/* FortyGuard Heat Exposure & Persistence Panel */}
          <HeatExposurePanel
            heatExposure={heatExposure}
            loading={loading}
            error={exposureError}
            onRetry={handleRefreshData}
          />

          {/* Spatial Heatmap Layer (Interactive Leaflet Map) */}
          {worksite && (
            <HeatmapViewer
              worksiteId={worksite.id}
              latitude={worksite.latitude}
              longitude={worksite.longitude}
              worksiteName={worksite.name}
            />
          )}

          {/* Temperature Timeline Chart */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Diurnal Temperature Curve & High-Risk Zones
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-slate-600">&ge; 38°C (Critical)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-600">&lt; 38°C (Safe)</span>
                </div>
              </div>
            </div>

            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="35%" stopColor="#f59e0b" />
                        <stop offset="55%" stopColor="#dc2626" />
                        <stop offset="75%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                      <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      domain={['auto', 'auto']}
                      label={{
                        value: 'Temperature (°C)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 13,
                        style: { textAnchor: 'middle'}
                      }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      fill="url(#fillGradient)"
                      dot={<CustomDot />}
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-6">
                  {refreshing || loading ? (
                    <>
                      <RefreshCw className="w-12 h-12 mb-3 animate-spin text-blue-500" />
                      <p className="text-sm font-medium text-slate-600">
                        Querying FortyGuard temperature timeline...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <p className="text-base font-semibold text-slate-800">
                        Diurnal Temperature Series Synchronizing
                      </p>
                      <p className="text-xs text-slate-500 mt-1 text-center max-w-md">
                        {temperatureError ||
                          'Hourly microclimate observations will be plotted as observations synchronize.'}
                      </p>
                      <button
                        onClick={handleRefreshData}
                        className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Telemetry Sync
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Shift Tasks (Live FortyGuard Telemetry & ≤ 24h Forecast Window) */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">Active Shift Tasks</h2>
                    {loading || refreshing ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3 h-3 text-purple-600 animate-spin" />
                        Syncing Shift Hazards...
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        Live Forecast Active ({activeForecastTasks.length})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assessed against live FortyGuard satellite microclimate curves &amp; individualized heat hazard scoring
                  </p>
                </div>
              </div>
              {worksiteId && (
                <button
                  onClick={() => navigate(`/add-task/${worksiteId}`)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md text-sm flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              )}
            </div>
            <TaskList
              tasks={activeForecastTasks}
              loading={loading || refreshing}
              emptyTitle="No active shift tasks in the 24h forecast window"
              emptyMessage="Tasks scheduled within the next 24 hours will automatically appear here with live satellite thermal risk analysis."
              onEdit={(task) => navigate(`/edit-task/${worksiteId}/${task.id}`)}
              onDelete={(taskId) => {
                const target = apiTasks.find((t) => t.id === taskId);
                if (target) {
                  setDeleteModalTask(target);
                }
              }}
            />
          </div>

          {/* Upcoming Scheduled Tasks (Awaiting FortyGuard Forecast Window) */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">Upcoming Scheduled Shifts</h2>
                    {loading || refreshing ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                        Syncing Schedule...
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Awaiting Forecast ({awaitingForecastTasks.length})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tasks scheduled &gt; 24 hours in advance. High-resolution FortyGuard satellite forecast unlocks automatically at T-24h.
                  </p>
                </div>
              </div>
            </div>

            <TaskList
              tasks={awaitingForecastTasks}
              loading={loading || refreshing}
              emptyTitle="No upcoming tasks awaiting forecast"
              emptyMessage="Shifts scheduled beyond +12 hours will be organized here until live FortyGuard predictive telemetry unlocks."
              onEdit={(task) => navigate(`/edit-task/${worksiteId}/${task.id}`)}
              onDelete={(taskId) => {
                const target = apiTasks.find((t) => t.id === taskId);
                if (target) {
                  setDeleteModalTask(target);
                }
              }}
            />
          </div>

          {/* AI Recommendations */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-amber-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">
                      AI Safety Engineer Recommendations
                    </h2>
                    {recommendations.length > 0 && !loading && !refreshing && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {recommendations.length} {recommendations.length === 1 ? 'Action' : 'Actions Available'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actionable mitigations grounded in FortyGuard surface heat observations & task microclimate exposures
                  </p>
                </div>
              </div>

              {/* Header Toggle: View All vs Spotlight Carousel */}
              {recommendations.length > 1 && !loading && !refreshing && (
                <button
                  type="button"
                  onClick={() => setShowAllRecs((prev) => !prev)}
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <LayoutList className="w-3.5 h-3.5 text-amber-700" />
                  <span>{showAllRecs ? 'View Spotlight Carousel' : `View All (${recommendations.length})`}</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
                {loading || refreshing ? (
                  <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center gap-3.5 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">
                        Synthesizing FortyGuard Thermal Telemetry & AI Mitigations...
                      </p>
                      <p className="text-xs text-blue-700/80 mt-0.5">
                        Evaluating shift exposures and microclimate risk curves to generate targeted worker safeguards.
                      </p>
                    </div>
                  </div>
                ) : isUnsupported ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Assessment Not Supported at this Location
                      </p>
                      <p className="text-xs text-slate-600">
                        FortyGuard satellite thermal telemetry is not indexed for this location. Heat risk recommendations cannot be computed without verified ambient observations.
                      </p>
                    </div>
                  </div>
                ) : recommendations.length > 0 ? (
                  (() => {
                    const safeRecIndex = Math.min(activeRecIndex, Math.max(0, recommendations.length - 1));
                    const currentRec = recommendations[safeRecIndex];

                    const isCurrentTaskSpecific = currentRec?.category === 'TASK_CONTROL' || Boolean(currentRec?.targetTask);
                    const currentMatchedTaskName = currentRec?.targetTask;

                    return !showAllRecs && currentRec ? (
                      /* Spotlight Single Recommendation Swiper */
                      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-yellow-50/80 rounded-2xl border border-amber-200 shadow-sm transition-all">
                        {/* Card Header Tag & Counter */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {isCurrentTaskSpecific ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5 shadow-sm">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              {currentMatchedTaskName ? `Task Mitigation • ${currentMatchedTaskName}` : 'Task-Tailored Mitigation'}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Site-Wide Hazard Control (OSHA / NIOSH Baseline)
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-600 bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            {safeRecIndex + 1} of {recommendations.length}
                          </span>
                        </div>

                        {/* Main Action Command */}
                        <div className="flex items-start gap-3.5 my-3">
                          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20 mt-0.5">
                            {safeRecIndex + 1}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                            {currentRec.action}
                          </h3>
                        </div>

                        {/* Reasoning Box */}
                        <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 border border-amber-200/60 shadow-sm my-3.5">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-amber-600" /> Grounded Risk Rationale
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {currentRec.reasoning}
                          </p>
                        </div>

                        {/* Expected Impact Pill & 1-Click Simulate Button */}
                        <div className="pt-1 flex items-center justify-between gap-3 flex-wrap">
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200/80 shadow-sm">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span>Expected Impact: <strong>{currentRec.expectedImpact}</strong></span>
                          </div>

                          {isCurrentTaskSpecific && (
                            <button
                              onClick={() => {
                                const q = currentMatchedTaskName ? `?task=${encodeURIComponent(currentMatchedTaskName)}` : '';
                                navigate(`/scenario/${worksiteId}${q}`);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Simulate in What-If →</span>
                            </button>
                          )}
                        </div>

                        {/* Carousel Navigation Footer with Swap Dots */}
                        <div className="flex items-center justify-between border-t border-amber-200/60 pt-4 mt-5">
                          <button
                            onClick={() => setActiveRecIndex((prev) => (prev > 0 ? prev - 1 : recommendations.length - 1))}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/80 text-slate-700 hover:text-slate-900 border border-amber-200 transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold active:scale-95"
                            title="Previous recommendation"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Prev</span>
                          </button>

                          {/* Swap Dots / Expansion Pills */}
                          <div className="flex items-center gap-2">
                            {recommendations.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveRecIndex(idx)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                  idx === safeRecIndex
                                    ? 'w-8 bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/40 ring-2 ring-amber-300/50'
                                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                                }`}
                                title={`Jump to Recommendation ${idx + 1}`}
                              />
                            ))}
                          </div>

                          <button
                            onClick={() => setActiveRecIndex((prev) => (prev < recommendations.length - 1 ? prev + 1 : 0))}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/80 text-slate-700 hover:text-slate-900 border border-amber-200 transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold active:scale-95"
                            title="Next recommendation"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View All List Mode */
                      <div className="space-y-3">
                        {recommendations.map((rec, idx) => {
                          const isTaskSpecific = rec.category === 'TASK_CONTROL' || Boolean(rec.targetTask);
                          const matchedTaskName = rec.targetTask;

                          return (
                            <div
                              key={rec.id}
                              className={`p-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/60 rounded-xl border border-amber-200/80 hover:shadow-md transition-all group ${
                                idx === safeRecIndex ? 'ring-2 ring-amber-400' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold">
                                    {idx + 1}
                                  </span>
                                  {isTaskSpecific ? (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                      <Users className="w-3 h-3 text-blue-600" />
                                      {matchedTaskName ? `Task: ${matchedTaskName}` : 'Task-Specific'}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                      Site-Wide Control (OSHA / NIOSH)
                                    </span>
                                  )}
                                </div>
                                {isTaskSpecific && (
                                  <button
                                    onClick={() => {
                                      const q = matchedTaskName ? `?task=${encodeURIComponent(matchedTaskName)}` : '';
                                      navigate(`/scenario/${worksiteId}${q}`);
                                    }}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 active:scale-95"
                                  >
                                    <Sliders className="w-3 h-3" />
                                    <span>Simulate</span>
                                  </button>
                                )}
                              </div>
                              <p className="font-bold text-slate-900 mb-1 text-sm sm:text-base">
                                {rec.action}
                              </p>
                              <p className="text-xs sm:text-sm text-slate-600 mb-2 leading-relaxed">
                                {rec.reasoning}
                              </p>
                              <p className="text-xs sm:text-sm text-emerald-700 font-semibold flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Impact: {rec.expectedImpact}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 rounded-xl border border-emerald-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Safe Operating Conditions — No Task Mitigations Required
                      </p>
                      <p className="text-xs text-slate-600">
                        All currently scheduled tasks are in safe temperature windows. Tailored mitigation recommendations will generate automatically when an active task encounters elevated heat exposure.
                      </p>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {/* Safety Action & Compliance Cockpit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* What-If Simulator Card */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 rounded-2xl p-5 border border-indigo-100/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Decision Engine
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                    What-If Heat Mitigation Simulator
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Experiment with shift start times, continuous duration limits, OSHA work-rest ratios, and on-site misting/cooling controls.
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleTestWhatIf}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Launch Simulation Cockpit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Export Safety Plan Card */}
            <div className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-white shadow-md shadow-slate-800/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                    Compliance & OSHA
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    Worksite Heat Safety Plan (PDF)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Download an executive PDF safety report with FortyGuard microclimate satellite evidence, task vulnerability risk tables, and emergency protocols.
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleExportSchedule}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Formal PDF Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sleek Task Deletion Warning Modal */}
      {deleteModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Delete Scheduled Task?</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900">"{deleteModalTask.name}"</strong> from the worksite schedule?
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <p>🕒 <strong>Time:</strong> {new Date(deleteModalTask.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} ({deleteModalTask.durationMinutes} mins)</p>
                <p>👥 <strong>Workers:</strong> {deleteModalTask.workerCount || 1} personnel</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalTask(null)}
                disabled={deletingTask}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                disabled={deletingTask}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-sm font-bold shadow-lg shadow-red-500/25 hover:from-red-700 hover:to-rose-800 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {deletingTask ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting Task...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
