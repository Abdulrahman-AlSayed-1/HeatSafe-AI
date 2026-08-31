import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Sun,
  TreePine,
  Home,
  Layers,
  Save,
  AlertCircle,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import { tasksApi, ExposureType } from '../api/tasks';
import toast from 'react-hot-toast';

const exposureTypeOptions = [
  { 
    value: ExposureType.HIGH, 
    label: 'High Exposure', 
    icon: Sun, 
    selectedClasses: 'border-red-500 bg-red-50 ring-2 ring-red-500 ring-offset-2',
    iconSelectedClass: 'text-red-600',
  },
  { 
    value: ExposureType.MODERATE, 
    label: 'Moderate Exposure', 
    icon: TreePine, 
    selectedClasses: 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500 ring-offset-2',
    iconSelectedClass: 'text-yellow-600',
  },
  { 
    value: ExposureType.LOW, 
    label: 'Low Exposure', 
    icon: Layers, 
    selectedClasses: 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-offset-2',
    iconSelectedClass: 'text-green-600',
  },
  { 
    value: ExposureType.INDOOR, 
    label: 'Indoor', 
    icon: Home, 
    selectedClasses: 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2',
    iconSelectedClass: 'text-blue-600',
  },
];

export default function EditTask() {
  const navigate = useNavigate();
  const { worksiteId, taskId } = useParams<{ worksiteId: string; taskId: string }>();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    durationMinutes: 60,
    workerCount: 4,
    exposureType: ExposureType.HIGH,
  });
  const [loading, setLoading] = useState(true);

  const getForecastStatus = (startTime: string) => {
    if (!startTime) return null;
    const taskTime = new Date(startTime).getTime();
    const now = Date.now();
    const diffHours = (taskTime - now) / (1000 * 60 * 60);

    if (diffHours < -0.05) {
      return {
        type: 'PAST_SHIFT',
        title: 'Past Time Selected',
        message: 'Operational tasks cannot be scheduled in the past. Please select an upcoming shift time.',
        buttonText: 'Select Upcoming Time',
        bannerClass: 'bg-red-50/90 border-red-200 text-red-900',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        Icon: AlertCircle,
        iconColor: 'text-red-600',
        isInvalid: true,
      };
    }
    if (diffHours <= 24) {
      return {
        type: 'FORECAST_ACTIVE',
        title: 'Live FortyGuard Forecast Active (+24h Window)',
        message: 'Task is within the next 24 hours. Live satellite microclimate forecast telemetry will analyze this shift.',
        buttonText: 'Update Task (Live Forecast Active)',
        bannerClass: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        Icon: Sparkles,
        iconColor: 'text-emerald-600',
        isInvalid: false,
      };
    }
    return {
      type: 'AWAITING_FORECAST',
      title: 'Scheduled Ahead (Forecast Unlocks at T-24h)',
      message: 'Task scheduled beyond +24 hours. FortyGuard generates predictive microclimate forecasts within 24 hours of the shift. HeatSafe will automatically evaluate heat risk when the shift enters the 24h window.',
      buttonText: 'Save Scheduled Task',
      bannerClass: 'bg-amber-50/90 border-amber-200 text-amber-900',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      Icon: Timer,
      iconColor: 'text-amber-600',
      isInvalid: false,
    };
  };

  const forecastStatus = getForecastStatus(formData.startTime);

  useEffect(() => {
    document.title = 'HeatSafe AI — Edit Shift Task';
    if (worksiteId && taskId) {
      tasksApi.get(parseInt(worksiteId), parseInt(taskId))
        .then(res => {
          const task = res.data;
          setFormData({
            name: task.name,
            description: task.description || '',
            startTime: task.startTime,
            durationMinutes: task.durationMinutes,
            workerCount: task.workerCount || 4,
            exposureType: task.exposureType,
          });
        })
        .catch(error => {
          console.error('Error fetching task:', error);
          toast.error('Failed to load task. Please try again.');
          navigate(`/dashboard/${worksiteId}`);
        })
        .finally(() => setLoading(false));
    }
  }, [worksiteId, taskId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!worksiteId || !taskId) {
      toast.error('Worksite ID and Task ID are required');
      return;
    }

    const taskTime = new Date(formData.startTime).getTime();
    if (taskTime < Date.now() - 5 * 60 * 1000) {
      toast.error('Task start time cannot be in the past. Please choose an upcoming shift.');
      return;
    }

    try {
      await tasksApi.update(parseInt(worksiteId), parseInt(taskId), formData);
      toast.success('Task updated successfully!');
      navigate(`/dashboard/${worksiteId}`);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  const handleCancel = () => {
    if (worksiteId) {
      navigate(`/dashboard/${worksiteId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => worksiteId ? navigate(`/dashboard/${worksiteId}`) : navigate('/')}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Edit Task</h1>
                <p className="text-sm text-slate-500">Update scheduled task parameters</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-200/50 shadow-xl">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading task details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Task Details Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">Task Information</h2>
                        <p className="text-xs text-emerald-100">Update task details and schedule</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Task Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Concrete Pouring - Foundation"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                        required
                        minLength={3}
                      />
                      <p className="text-xs text-slate-500">Minimum 3 characters • Required field</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the task, materials needed, safety considerations..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400 resize-none"
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">Optional field</p>
                        <p className="text-xs text-slate-400">{formData.description.length}/500</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">Schedule & Workforce</h2>
                        <p className="text-xs text-blue-100">Set task time, duration, and assigned personnel</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          min={new Date(Date.now() - 5 * 60 * 1000).toISOString().slice(0, 16)}
                          className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                          Duration (mins) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.durationMinutes}
                          onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 1 })}
                          min="1"
                          className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs"
                          required
                        />
                        <p className="text-[11px] text-slate-500">Duration in minutes</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>Workers Count</span> <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.workerCount}
                          onChange={(e) => setFormData({ ...formData, workerCount: Math.max(1, parseInt(e.target.value) || 1) })}
                          min="1"
                          max="250"
                          className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-xs font-semibold"
                          required
                        />
                        <p className="text-[11px] text-slate-500">Assigned workers</p>
                      </div>
                    </div>

                    {/* Real-Time FortyGuard Temporal Window Indicator */}
                    {forecastStatus && (
                      <div className={`p-4 rounded-2xl border ${forecastStatus.bannerClass} text-xs transition-all flex items-start gap-3 shadow-sm`}>
                        <div className="p-2 rounded-xl bg-white/70 shadow-sm border border-slate-200/50 flex-shrink-0 mt-0.5">
                          <forecastStatus.Icon className={`w-4 h-4 ${forecastStatus.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">{forecastStatus.title}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${forecastStatus.badgeClass}`}>
                              {forecastStatus.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="leading-relaxed opacity-90">{forecastStatus.message}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Timer className="w-4 h-4 text-indigo-600" />
                        <span>Quick Select Duration</span>
                      </label>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[15, 30, 45, 60, 90, 120, 180, 240].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setFormData({ ...formData, durationMinutes: mins })}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                              formData.durationMinutes === mins
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border-transparent ring-2 ring-indigo-400/40'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                            }`}
                          >
                            {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exposure Type Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <Sun className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-white">Exposure Type</h2>
                          <p className="text-xs text-orange-100">Select the working environment</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        {exposureTypeOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = formData.exposureType === option.value;
                          
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, exposureType: option.value })}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? option.selectedClasses
                                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <Icon className={`w-8 h-8 ${isSelected ? option.iconSelectedClass : 'text-slate-400'}`} />
                                <span className={`text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {option.label}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row mt-6 gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forecastStatus?.isInvalid}
                  className={`px-8 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                    forecastStatus?.isInvalid
                      ? 'bg-slate-300 cursor-not-allowed opacity-60 shadow-none'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30 hover:shadow-xl'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {forecastStatus?.buttonText || 'Update Task'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
