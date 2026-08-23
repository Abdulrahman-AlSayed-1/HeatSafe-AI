import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer, MapPin, Clock, Plus, Building2 } from 'lucide-react';

interface Worksite {
  id: string;
  name: string;
  location: string;
  currentTemp: number;
  lastUpdated: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

export default function WorksiteSelection() {
  const navigate = useNavigate();
  const [worksites] = useState<Worksite[]>([
    {
      id: '1',
      name: 'Dubai Marina Construction',
      location: 'Dubai Marina, UAE',
      currentTemp: 32,
      lastUpdated: '7:00 AM',
      riskLevel: 'HIGH',
    },
    {
      id: '2',
      name: 'Downtown Tower Site',
      location: 'Downtown Dubai, UAE',
      currentTemp: 30,
      lastUpdated: '7:00 AM',
      riskLevel: 'MODERATE',
    },
    {
      id: '3',
      name: 'JBR Beach Project',
      location: 'Jumeirah Beach Residence, UAE',
      currentTemp: 28,
      lastUpdated: '7:00 AM',
      riskLevel: 'LOW',
    },
  ]);

  const handleSelectWorksite = (worksiteId: string) => {
    navigate(`/dashboard/${worksiteId}`);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-500';
      case 'MODERATE': return 'bg-orange-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-50 border-red-200';
      case 'MODERATE': return 'bg-orange-50 border-orange-200';
      case 'LOW': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 bg-pattern">
      {/* Header */}
      <header>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2.5 rounded-xl shadow-lg">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">HeatSafe AI</h1>
                <p className="text-xs text-slate-500">Heat Risk Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Select a Worksite</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose a worksite to view heat risk assessment and manage worker schedules
            </p>
          </div>

          {/* Worksite Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worksites.map((worksite) => (
              <div
                key={worksite.id}
                onClick={() => handleSelectWorksite(worksite.id)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-900">{worksite.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{worksite.location}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getRiskBgColor(worksite.riskLevel)} border`}>
                      <Thermometer className="w-4 h-4" />
                      <span className={`font-semibold text-sm ${worksite.riskLevel === 'HIGH' ? 'text-red-700' : worksite.riskLevel === 'MODERATE' ? 'text-orange-700' : 'text-green-700'}`}>
                        {worksite.currentTemp}°C
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Updated: {worksite.lastUpdated}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getRiskColor(worksite.riskLevel)} text-white`}>
                      {worksite.riskLevel} RISK
                    </span>
                  </div>
                </div>
                <div className={`px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors`}>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    View Dashboard
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Worksite Button */}
          <div className="mt-8">
            <button className="w-full py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
              <Plus className="w-5 h-5" />
              Add New Worksite
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
