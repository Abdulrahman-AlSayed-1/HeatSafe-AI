import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, TrendingDown, Clock, Users, Building2 } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
  exposureType: 'high' | 'moderate' | 'low';
  workers: number;
}

export default function ScenarioEditor() {
  const { worksiteId } = useParams<{ worksiteId: string }>();
  const navigate = useNavigate();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('2');
  const [newStartTime, setNewStartTime] = useState<string>('08:00');

  // Mock data for demo
  const worksiteName = worksiteId === '1' ? 'Dubai Marina Construction' : 'Construction Site';
  
  const baselineTasks: Task[] = [
    {
      id: '1',
      name: 'Concrete Pouring',
      startTime: '08:00',
      endTime: '10:00',
      duration: '2 hours',
      exposureType: 'high',
      workers: 4,
    },
    {
      id: '2',
      name: 'Steel Welding',
      startTime: '10:30',
      endTime: '12:30',
      duration: '2 hours',
      exposureType: 'high',
      workers: 4,
    },
    {
      id: '3',
      name: 'Excavation',
      startTime: '13:00',
      endTime: '15:00',
      duration: '2 hours',
      exposureType: 'moderate',
      workers: 4,
    },
    {
      id: '4',
      name: 'Equipment Operation',
      startTime: '15:30',
      endTime: '17:30',
      duration: '2 hours',
      exposureType: 'low',
      workers: 3,
    },
  ];

  const proposedTasks = baselineTasks.map(task => 
    task.id === selectedTaskId 
      ? { ...task, startTime: newStartTime, endTime: calculateEndTime(newStartTime, task.duration) }
      : task
  );

  const baselineRisk = { level: 'HIGH', score: 8.5, affectedWorkers: 8 };
  const proposedRisk = { level: 'MODERATE', score: 5.5, affectedWorkers: 4 };

  function calculateEndTime(startTime: string, duration: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const durationHours = parseInt(duration);
    const endHours = hours + durationHours;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const handleApplyChanges = () => {
    navigate(`/changes-applied/${worksiteId}`);
  };

  const handleCancel = () => {
    navigate(`/dashboard/${worksiteId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 bg-pattern">
      {/* Header */}
      <header>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">What-if Scenario</h1>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {worksiteName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Instructions */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-blue-200">
            <p className="text-blue-800 flex items-start gap-2">
              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">!</span>
              <span><strong>Instructions:</strong> Select a task and change its start time to see how it affects the risk assessment.</span>
            </p>
          </div>

          {/* Task Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Select Task to Reschedule</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baselineTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    selectedTaskId === task.id
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <h3 className="font-semibold text-slate-900 text-lg">{task.name}</h3>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4" />
                    {task.startTime} – {task.endTime} ({task.duration})
                  </p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Users className="w-4 h-4" />
                    {task.workers} workers
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Time Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Set New Start Time</h2>
            <div className="flex items-center gap-4">
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="border-2 border-slate-300 rounded-xl px-5 py-3 text-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
              <span className="text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End time will be: {calculateEndTime(newStartTime, baselineTasks.find(t => t.id === selectedTaskId)?.duration || '2 hours')}
              </span>
            </div>
          </div>

          {/* Comparison View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                Original Schedule (Baseline)
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Risk Level</span>
                  <span className="font-bold text-red-600">{baselineRisk.level}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Risk Score</span>
                  <span className="font-bold text-slate-900">{baselineRisk.score}/10</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Affected Workers
                  </span>
                  <span className="font-bold text-slate-900">{baselineRisk.affectedWorkers}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {baselineTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-slate-100 rounded-lg text-sm">
                    <span className="font-medium">{task.name}</span>: {task.startTime} – {task.endTime}
                  </div>
                ))}
              </div>
            </div>

            {/* Proposed */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-400">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Proposed Schedule
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Risk Level</span>
                  <span className="font-bold text-green-600">{proposedRisk.level}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Risk Score</span>
                  <span className="font-bold text-slate-900">{proposedRisk.score}/10</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Affected Workers
                  </span>
                  <span className="font-bold text-slate-900">{proposedRisk.affectedWorkers}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {proposedTasks.map((task) => (
                  <div key={task.id} className={`p-3 rounded-lg text-sm ${task.id === selectedTaskId ? 'bg-yellow-100 font-medium border border-yellow-300' : 'bg-slate-100'}`}>
                    <span className="font-medium">{task.name}</span>: {task.startTime} – {task.endTime}
                    {task.id === selectedTaskId && <span className="ml-2 text-yellow-700 font-semibold">(changed)</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 p-2 rounded-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">Risk Improvement</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-sm text-green-700 font-medium">Risk Level</p>
                <p className="text-xl font-bold text-green-800">HIGH → MODERATE</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-sm text-green-700 font-medium">Risk Score</p>
                <p className="text-xl font-bold text-green-800">8.5 → 5.5</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-sm text-green-700 font-medium">Affected Workers</p>
                <p className="text-xl font-bold text-green-800">8 → 4</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleApplyChanges}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Apply Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-white text-slate-700 px-6 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
