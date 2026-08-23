import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Download, Home, Building2, Calendar, TrendingDown, Shield } from 'lucide-react';

export default function ChangesApplied() {
  const { worksiteId } = useParams<{ worksiteId: string }>();
  const navigate = useNavigate();

  const worksiteName = worksiteId === '1' ? 'Dubai Marina Construction' : 'Construction Site';

  const handleReturnToDashboard = () => {
    navigate(`/dashboard/${worksiteId}`);
  };

  const handleExportSchedule = () => {
    alert('Exporting updated schedule as PDF...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 bg-pattern">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleReturnToDashboard} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Changes Applied</h1>
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
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center border border-green-200">
            <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-green-800 mb-3">Schedule Updated Successfully</h2>
            <p className="text-green-700 text-lg">Your task schedule changes have been saved and the risk assessment has been recalculated.</p>
          </div>

          {/* Change Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Change Summary</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                <div>
                  <p className="font-semibold text-slate-900 text-lg">Steel Welding</p>
                  <p className="text-sm text-slate-600">Rescheduled from 10:30 AM to 8:00 AM</p>
                </div>
                <div className="bg-green-500 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* New Risk Assessment */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-slate-900">New Risk Assessment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <p className="text-sm text-green-700 font-medium">Risk Level</p>
                <p className="text-2xl font-bold text-green-600">MODERATE</p>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-600 font-medium">Risk Score</p>
                <p className="text-2xl font-bold text-slate-900">5.5/10</p>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">Affected Workers</p>
                <p className="text-2xl font-bold text-blue-700">4</p>
              </div>
            </div>
            <div className="mt-4 p-5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-700" />
                <p className="text-green-800 font-semibold">Improvements</p>
              </div>
              <p className="text-green-800 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Risk reduced from HIGH to MODERATE
              </p>
              <p className="text-green-800 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Affected workers reduced from 8 to 4
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleReturnToDashboard}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Dashboard
            </button>
            <button
              onClick={handleExportSchedule}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Updated Schedule
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-blue-200">
            <p className="text-blue-800 text-sm flex items-start gap-2">
              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">!</span>
              <span><strong>Next Steps:</strong> Brief your crew on the updated schedule and ensure they are aware of the new timing for the steel welding task. Consider implementing additional cooling measures for the excavation task during the critical window (11 AM – 3 PM).</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
