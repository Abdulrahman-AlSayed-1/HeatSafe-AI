import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Plus,
  Building2,
  Trash2,
  AlertTriangle,
  Shield,
  Search,
  RefreshCw,
  X,
  ArrowRight,
  Thermometer,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { worksitesApi, Worksite } from '../api/worksites';
import { heatRiskApi } from '../api/heatRisk';
import { thermalProfileApi } from '../api/thermalProfile';
import { tasksApi } from '../api/tasks';
import toast from 'react-hot-toast';

interface WorksiteLiveStats {
  riskLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW' | 'SAFE' | 'CALCULATING' | 'UNSUPPORTED';
  riskScore: number | null;
  peakTemp: number | null;
  avgTemp: number | null;
  taskCount: number;
  affectedTaskCount: number;
  loading: boolean;
}

export default function WorksiteSelection() {
  const navigate = useNavigate();
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [statsMap, setStatsMap] = useState<Record<number, WorksiteLiveStats>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Deletion modal state
  const [deleteModalWorksite, setDeleteModalWorksite] = useState<Worksite | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchAllWorksites = async () => {
    setLoading(true);
    try {
      const response = await worksitesApi.getAll();
      const list = Array.isArray(response.data) ? response.data : [];
      setWorksites(list);

      // Initialize loading stats placeholders
      const initialStats: Record<number, WorksiteLiveStats> = {};
      list.forEach((w) => {
        initialStats[w.id] = {
          riskLevel: 'CALCULATING',
          riskScore: null,
          peakTemp: null,
          avgTemp: null,
          taskCount: 0,
          affectedTaskCount: 0,
          loading: true,
        };
      });
      setStatsMap(initialStats);

      // Fetch live telemetry & risk stats concurrently for each worksite
      list.forEach(async (w) => {
        try {
          const [riskRes, thermalRes, tasksRes] = await Promise.allSettled([
            heatRiskApi.assess(w.id),
            thermalProfileApi.get(w.id),
            tasksApi.getAll(w.id),
          ]);

          const riskData = riskRes.status === 'fulfilled' ? riskRes.value.data : null;
          const thermalData = thermalRes.status === 'fulfilled' ? thermalRes.value.data : null;
          const tasksData = tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value.data) ? tasksRes.value.data : [];

          let level: WorksiteLiveStats['riskLevel'] = 'SAFE';
          if (riskData?.riskLevel) {
            const lvl = riskData.riskLevel.toUpperCase();
            if (lvl === 'EXTREME' || lvl === 'HIGH' || lvl === 'MODERATE') {
              level = lvl as any;
            } else {
              level = 'SAFE';
            }
          }

          setStatsMap((prev) => ({
            ...prev,
            [w.id]: {
              riskLevel: level,
              riskScore: riskData?.score ?? null,
              peakTemp: thermalData?.maxTemp ?? null,
              avgTemp: thermalData?.avgTemp ?? null,
              taskCount: tasksData?.length ?? 0,
              affectedTaskCount: riskData?.affectedTasks?.length ?? 0,
              loading: false,
            },
          }));
        } catch {
          setStatsMap((prev) => ({
            ...prev,
            [w.id]: {
              riskLevel: 'SAFE',
              riskScore: null,
              peakTemp: null,
              avgTemp: null,
              taskCount: 0,
              affectedTaskCount: 0,
              loading: false,
            },
          }));
        }
      });
    } catch (error) {
      console.error('Error fetching worksites:', error);
      toast.error('Unable to load worksites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'HeatSafe AI — Worksite Overview';
    fetchAllWorksites();
  }, []);

  const handleDeleteWorksite = async () => {
    if (!deleteModalWorksite) return;
    setDeleting(true);
    try {
      await worksitesApi.delete(deleteModalWorksite.id);
      toast.success(`Worksite "${deleteModalWorksite.name}" removed successfully`);
      setWorksites((prev) => prev.filter((w) => w.id !== deleteModalWorksite.id));
      setDeleteModalWorksite(null);
    } catch (error) {
      console.error('Failed to delete worksite:', error);
      toast.error('Could not delete worksite. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredWorksites = useMemo(() => {
    if (!searchQuery.trim()) return worksites;
    const q = searchQuery.toLowerCase();
    return worksites.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        (w.description && w.description.toLowerCase().includes(q)) ||
        `${w.latitude}, ${w.longitude}`.includes(q)
    );
  }, [worksites, searchQuery]);

  // Metric summaries across all worksites
  const highRiskCount = useMemo(() => {
    return Object.values(statsMap).filter(
      (s) => s.riskLevel === 'EXTREME' || s.riskLevel === 'HIGH'
    ).length;
  }, [statsMap]);

  const totalTasks = useMemo(() => {
    return Object.values(statsMap).reduce((sum, s) => sum + s.taskCount, 0);
  }, [statsMap]);

  const getRiskBadgeStyles = (level: WorksiteLiveStats['riskLevel'] | string) => {
    switch (level) {
      case 'EXTREME':
        return 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-200 border-red-500';
      case 'HIGH':
        return 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-200 border-orange-400';
      case 'MODERATE':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-amber-200 border-amber-400';
      case 'CALCULATING':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200 animate-pulse border-blue-400';
      case 'UNSUPPORTED':
        return 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm';
      default:
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200 border-emerald-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50/40 bg-pattern pb-16">
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo size="md" />

            {/* Top Right Actions: Direct Redesigned Add Worksite Button */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={fetchAllWorksites}
                disabled={loading}
                className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 flex-shrink-0"
                title="Refresh All Worksites"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              <button
                onClick={() => navigate('/add-worksite')}
                className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 active:scale-[0.98] flex-shrink-0"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300 flex-shrink-0" />
                <span className="hidden sm:inline">Add Worksite</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 pt-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Headline & Quick Stats Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-md">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Worksite Operations Hub</h2>
              <p className="text-sm text-slate-600 mt-1">
                Select an active facility to access live microclimate heatmaps, ISO 7243 hazard indices, and AI mitigations.
              </p>
            </div>

            {/* Live Stats Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full md:w-auto flex-shrink-0">
              <div className="px-3.5 py-2 bg-slate-100/90 rounded-xl border border-slate-200 text-xs flex items-center justify-center gap-1.5 text-center whitespace-nowrap shadow-xs">
                <span className="text-slate-500 font-medium">Total Facilities:</span>
                <span className="font-bold text-slate-900">{worksites.length}</span>
              </div>
              <div className="px-3.5 py-2 bg-red-50 rounded-xl border border-red-200 text-xs flex items-center justify-center gap-1.5 text-center whitespace-nowrap shadow-xs">
                <span className="text-red-600 font-medium">High Heat Alerts:</span>
                <span className="font-bold text-red-700">{highRiskCount}</span>
              </div>
              <div className="px-3.5 py-2 bg-blue-50 rounded-xl border border-blue-200 text-xs flex items-center justify-center gap-1.5 text-center whitespace-nowrap shadow-xs sm:col-span-2 lg:col-span-1">
                <span className="text-blue-600 font-medium">Scheduled Tasks:</span>
                <span className="font-bold text-blue-700">{totalTasks}</span>
              </div>
            </div>
          </div>

          {/* Search / Filter Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search worksites by name or coordinates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Worksite Grid */}
          {loading && worksites.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md animate-pulse space-y-4"
                >
                  <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-16 bg-slate-50 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredWorksites.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-lg max-w-lg mx-auto">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {searchQuery ? 'No matching worksites found' : 'No worksites registered yet'}
              </h3>
              <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? `No facilities matched "${searchQuery}". Try searching by another keyword or reset the filter.`
                  : 'Get started by creating your first construction or industrial worksite to monitor microclimate heat hazards.'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => navigate('/add-worksite')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Worksite</span>
                </button>
              )}
            </div>
          ) : (
            /* Worksite Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorksites.map((worksite) => {
                const stats = statsMap[worksite.id] || {
                  riskLevel: 'CALCULATING',
                  riskScore: null,
                  peakTemp: null,
                  avgTemp: null,
                  taskCount: 0,
                  affectedTaskCount: 0,
                  loading: true,
                };

                return (
                  <div
                    key={worksite.id}
                    onClick={() => navigate(`/dashboard/${worksite.id}`)}
                    className="group relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 overflow-hidden cursor-pointer flex flex-col justify-between transform hover:-translate-y-1"
                  >
                    {/* Top Content Area */}
                    <div className="p-6">
                      {/* Header Row: Title + Delete Button */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {worksite.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>
                              {worksite.latitude.toFixed(4)}, {worksite.longitude.toFixed(4)}
                              {worksite.timezone ? ` • ${worksite.timezone}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button with StopPropagation */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModalWorksite(worksite);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 flex-shrink-0"
                          title="Delete Worksite"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Worksite Description */}
                      {worksite.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {worksite.description}
                        </p>
                      )}

                      {/* Real Dynamic Telemetry & Risk Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2.5 my-4">
                        {/* Dynamic Peak Thermal Card */}
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <Thermometer className="w-3.5 h-3.5 text-red-500" />
                            Peak Temp
                          </div>
                          <p className="text-lg font-black text-slate-900 mt-0.5">
                            {stats.loading ? (
                              <span className="text-xs text-blue-600 animate-pulse font-normal">Syncing...</span>
                            ) : stats.peakTemp != null ? (
                              `${stats.peakTemp.toFixed(1)}°C`
                            ) : (
                              '--'
                            )}
                          </p>
                        </div>

                        {/* Real Hazard Index Card */}
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <Shield className="w-3.5 h-3.5 text-indigo-500" />
                            Hazard Index
                          </div>
                          <p className="text-lg font-black text-slate-900 mt-0.5">
                            {stats.loading ? (
                              <span className="text-xs text-blue-600 animate-pulse font-normal">Syncing...</span>
                            ) : stats.riskScore != null ? (
                              `${stats.riskScore.toFixed(1)}/10`
                            ) : (
                              '--'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Operational Status Badges */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {stats.taskCount} {stats.taskCount === 1 ? 'task' : 'tasks'}
                            {stats.taskCount > 0 && (
                              stats.affectedTaskCount > 0 ? (
                                <span className="ml-1.5 text-orange-600 font-bold">
                                  ({stats.affectedTaskCount} at risk)
                                </span>
                              ) : (
                                <span className="ml-1.5 text-emerald-600 font-bold">
                                  (✓ all safe)
                                </span>
                              )
                            )}
                          </span>
                        </div>

                        {/* Real Dynamic Heat Level Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm ${getRiskBadgeStyles(
                            stats.riskLevel
                          )}`}
                        >
                          {stats.riskLevel === 'CALCULATING'
                            ? 'CALCULATING'
                            : stats.riskLevel === 'UNSUPPORTED'
                            ? 'UNSUPPORTED'
                            : `${stats.riskLevel} HEAT`}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="px-6 py-3.5 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/80 group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                      <span>Open Worksite Dashboard</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal for Deleting Worksite */}
      {deleteModalWorksite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Delete Worksite?</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-slate-900">"{deleteModalWorksite.name}"</strong>? All associated worker tasks, schedules, and telemetry history will be permanently deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalWorksite(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWorksite}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-sm font-bold shadow-lg shadow-red-500/25 hover:from-red-700 hover:to-rose-800 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Worksite</span>
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
