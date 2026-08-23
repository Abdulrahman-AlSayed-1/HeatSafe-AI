import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Download, RefreshCw, Lightbulb, Calendar, Users, TrendingUp, Shield, Clock } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Task {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
  exposureType: 'high' | 'moderate' | 'low';
  riskStatus: 'safe' | 'at-risk';
  workers: number;
}

interface Recommendation {
  id: number;
  action: string;
  reasoning: string;
  expectedImpact: string;
}

export default function Dashboard() {
  const { worksiteId } = useParams<{ worksiteId: string }>();
  const navigate = useNavigate();
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Mock data for demo
  const worksiteName = worksiteId === '1' ? 'Dubai Marina Construction' : 'Construction Site';
  const riskLevel = 'HIGH';
  const riskScore = 8.5;
  const criticalWindow = '11:00 AM – 3:00 PM';
  const affectedTasks = 2;
  const affectedWorkers = 8;

  const temperatureData = [
    { time: '8 AM', temp: 28, risk: 'safe' },
    { time: '9 AM', temp: 30, risk: 'safe' },
    { time: '10 AM', temp: 32, risk: 'safe' },
    { time: '11 AM', temp: 36, risk: 'critical' },
    { time: '12 PM', temp: 38, risk: 'critical' },
    { time: '1 PM', temp: 42, risk: 'critical' },
    { time: '2 PM', temp: 40, risk: 'critical' },
    { time: '3 PM', temp: 36, risk: 'safe' },
    { time: '4 PM', temp: 34, risk: 'safe' },
    { time: '5 PM', temp: 31, risk: 'safe' },
    { time: '6 PM', temp: 29, risk: 'safe' },
  ];

  const tasks: Task[] = [
    {
      id: '1',
      name: 'Concrete Pouring',
      startTime: '8:00 AM',
      endTime: '10:00 AM',
      duration: '2 hours',
      exposureType: 'high',
      riskStatus: 'safe',
      workers: 4,
    },
    {
      id: '2',
      name: 'Steel Welding',
      startTime: '10:30 AM',
      endTime: '12:30 PM',
      duration: '2 hours',
      exposureType: 'high',
      riskStatus: 'at-risk',
      workers: 4,
    },
    {
      id: '3',
      name: 'Excavation',
      startTime: '1:00 PM',
      endTime: '3:00 PM',
      duration: '2 hours',
      exposureType: 'moderate',
      riskStatus: 'at-risk',
      workers: 4,
    },
    {
      id: '4',
      name: 'Equipment Operation',
      startTime: '3:30 PM',
      endTime: '5:30 PM',
      duration: '2 hours',
      exposureType: 'low',
      riskStatus: 'safe',
      workers: 3,
    },
  ];

  const recommendations: Recommendation[] = [
    {
      id: 1,
      action: 'Move steel welding to 8:00 AM–10:00 AM',
      reasoning: 'Reduces overlap from 2 hours to 0 hours',
      expectedImpact: 'Risk drops from HIGH to MODERATE',
    },
    {
      id: 2,
      action: 'Increase cooling measures for excavation task',
      reasoning: 'Provide shade, water, and 15-min breaks every hour',
      expectedImpact: 'Reduces worker heat stress by 40%',
    },
    {
      id: 3,
      action: 'Consider splitting excavation into two 1-hour sessions',
      reasoning: 'Reduces continuous exposure time',
      expectedImpact: 'Risk drops from HIGH to MODERATE',
    },
  ];

  const handleTestWhatIf = () => {
    navigate(`/scenario/${worksiteId}`);
  };

  const handleExportSchedule = () => {
    alert('Exporting schedule as PDF...');
  };

  const handleRefreshData = () => {
    alert('Refreshing temperature data from FortyGuard API...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 bg-pattern">
      {/* Header */}
      <header>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{worksiteName}</h1>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  August 23, 2026
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full font-semibold shadow-md ${riskLevel === 'HIGH' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-green-500 to-green-600 text-white'}`}>
                {riskLevel} RISK
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Risk Assessment Panel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-900">Risk Assessment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm text-red-600 font-medium">Risk Level</p>
                <p className="text-2xl font-bold text-red-700">{riskLevel}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-600 font-medium">Risk Score</p>
                <p className="text-2xl font-bold text-slate-900">{riskScore}/10</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <p className="text-sm text-orange-600 font-medium">Critical Window</p>
                <p className="text-lg font-bold text-orange-700">{criticalWindow}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Affected Workers
                </p>
                <p className="text-2xl font-bold text-blue-700">{affectedWorkers}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm text-purple-600 font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Affected Tasks
                </p>
                <p className="text-2xl font-bold text-purple-700">{affectedTasks}</p>
              </div>
            </div>
          </div>

          {/* Temperature Timeline Chart */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Temperature Timeline</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temperatureData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value}°C`, 'Temperature']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTemp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Critical Window (11 AM – 3 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Safe Period</span>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Scheduled Tasks</h2>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-5 rounded-xl border transition-all hover:shadow-md ${
                    task.riskStatus === 'at-risk' 
                      ? 'border-red-200 bg-gradient-to-r from-red-50 to-orange-50' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg">{task.name}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {task.startTime} – {task.endTime} ({task.duration})
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                          task.riskStatus === 'at-risk'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        }`}
                      >
                        {task.riskStatus === 'at-risk' ? 'AT RISK' : 'SAFE'}
                      </span>
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1 justify-end">
                        <Users className="w-4 h-4" />
                        {task.workers} workers
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-slate-900">AI Recommendations</h2>
              </div>
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {showRecommendations ? 'Hide' : 'Show'}
              </button>
            </div>
            {showRecommendations && (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow">
                    <p className="font-semibold text-slate-900 mb-2 flex items-start gap-2">
                      <span className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">{rec.id}</span>
                      {rec.action}
                    </p>
                    <p className="text-sm text-slate-600 mb-2 ml-8">{rec.reasoning}</p>
                    <p className="text-sm text-green-700 font-medium ml-8 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {rec.expectedImpact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleTestWhatIf}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              Test What-if Scenario
            </button>
            <button
              onClick={handleExportSchedule}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Schedule
            </button>
            <button
              onClick={handleRefreshData}
              className="flex-1 min-w-[200px] bg-white text-slate-700 px-6 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Data
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
