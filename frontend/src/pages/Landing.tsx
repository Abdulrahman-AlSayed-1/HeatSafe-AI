import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  Sliders,
  Sparkles,
  Activity,
  Clock,
  ChevronRight,
  ExternalLink,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handleLaunchApp = () => {
    navigate('/worksites');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50/40 bg-pattern text-slate-800 font-sans selection:bg-blue-600 selection:text-white pb-16 sm:pb-20 overflow-x-hidden">
      {/* 1. Responsive Header Navigation Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <BrandLogo
              size="md"
              showSubtitle={true}
              showBadge={true}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
            <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-slate-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                FortyGuard TCM Telemetry Connected
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600 flex-shrink-0">
            <a href="#features" className="hover:text-blue-600 transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#simulator" className="hover:text-blue-600 transition-colors">What-If Engine</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={handleLaunchApp}
              className="group inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200"
            >
              <span className="hidden xs:inline">Launch Platform</span>
              <span className="xs:hidden">Launch</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Responsive Hero Section */}
      <section className="container mx-auto px-4 pt-8 sm:pt-14 pb-10 sm:pb-16 max-w-5xl text-center space-y-4 sm:space-y-6">
        {/* Hackathon Pill */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs max-w-full truncate">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="truncate">FortyGuard Hackathon '26 • Industrial Track</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-[40px] font-extrabold text-slate-900 tracking-tight leading-snug break-words max-w-3xl mx-auto">
          Precision Microclimate Intelligence.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
            Zero Heat Casualties.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal px-1">
          The autonomous workforce heat-health operating system. Combining{' '}
          <strong className="text-slate-800 font-semibold">FortyGuard 100m satellite microclimate telemetry</strong> with{' '}
          <strong className="text-slate-800 font-semibold">ISO 7243 & OSHA physiological standards</strong> to predict, simulate, and eliminate occupational heat strain before shifts start.
        </p>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-sm sm:max-w-none mx-auto">
          <button
            onClick={handleLaunchApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5"
          >
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#simulator"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold text-sm text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all"
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Explore What-If Simulator</span>
          </a>
        </div>

        {/* Responsive Telemetry Badges */}
        <div className="pt-2 sm:pt-4 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-5 text-[11px] sm:text-xs text-slate-600 font-medium max-w-md sm:max-w-none mx-auto">
          <div className="p-2 sm:p-0 rounded-lg bg-white/60 sm:bg-transparent border border-slate-200/60 sm:border-0 flex items-center justify-center sm:justify-start gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">FortyGuard 100m Grid</span>
          </div>
          <div className="p-2 sm:p-0 rounded-lg bg-white/60 sm:bg-transparent border border-slate-200/60 sm:border-0 flex items-center justify-center sm:justify-start gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span className="truncate">24h Diurnal Horizon</span>
          </div>
          <div className="p-2 sm:p-0 rounded-lg bg-white/60 sm:bg-transparent border border-slate-200/60 sm:border-0 flex items-center justify-center sm:justify-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">OSHA & ISO 7243</span>
          </div>
          <div className="p-2 sm:p-0 rounded-lg bg-white/60 sm:bg-transparent border border-slate-200/60 sm:border-0 flex items-center justify-center sm:justify-start gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span className="truncate">Dual Gemini AI</span>
          </div>
        </div>

        {/* 3. Responsive Cockpit Preview Card */}
        <div className="pt-4 sm:pt-6 text-left">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-100">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">Phoenix Industrial Operations Hub</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0">
                      HIGH WORKFORCE STRAIN
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Location: 33.4484°N, -112.0740°W • FortyGuard TCM Synchronized
                  </p>
                </div>
              </div>

              <button
                onClick={handleLaunchApp}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto flex-shrink-0"
              >
                <span>Live View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Responsive Metrics 4-Box Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Satellite Peak Temp</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">41.5°C</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">FortyGuard Midday</p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <p className="text-[11px] sm:text-xs font-semibold text-amber-800 truncate">Workforce Risk Index</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">8.2<span className="text-xs sm:text-sm font-normal text-slate-500">/10</span></p>
                <p className="text-[10px] sm:text-[11px] text-amber-700/80 mt-0.5 truncate">Critical Strain</p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Active Crew</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">28</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">3 Midday Shifts</p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <p className="text-[11px] sm:text-xs font-semibold text-emerald-800 truncate">OSHA Rest Cycle</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">30m/30m</p>
                <p className="text-[10px] sm:text-[11px] text-emerald-600 mt-0.5 truncate">Shade Rotation</p>
              </div>
            </div>

            {/* Shift Advisory Pill */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50 border border-blue-200/70 flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-900 font-semibold">AI Advisory:</strong> Heavy shift intersects FortyGuard’s 12:00–17:00 solar peak. Shifting to 07:00 AM or enforcing 30m/30m shade rotations reduces workforce strain from 8.2 to 4.1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities (Responsive 3 Columns) */}
      <section id="features" className="container mx-auto px-4 py-10 sm:py-16 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Value Drivers</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Industrial Heat Safety
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Replacing generic airport weather reports with high-resolution microclimate observations directly at your facility coordinates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">FortyGuard Satellite TCM</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamic 0.01° × 0.01° AOI polygon generation and asynchronous raster polling delivering 100m spatial thermal heatmaps and 24-hour diurnal curves.
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ISO 7243 & OSHA Composite</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Models continuous metabolic workloads, environmental exposure types, and WBGT to enforce compliant work-rest rotations and hydration mandates.
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">4-Lever What-If Simulator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulate start time shifts, duration cutbacks, mandatory rest intervals, and active cooling stations with 1-click schedule commit and PDF export.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works (Responsive Clean Card) */}
      <section id="architecture" className="container mx-auto px-4 py-10 sm:py-16 max-w-5xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              From Satellite Pass to Shift Safety in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="space-y-2 p-3 sm:p-0 rounded-xl bg-slate-50/50 sm:bg-transparent">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Spatial Telemetry Ingestion</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates an Area of Interest (AOI) bounding box and queries FortyGuard’s TCM Satellite API for surface temperature rasters and daily diurnal curves.
              </p>
            </div>

            <div className="space-y-2 p-3 sm:p-0 rounded-xl bg-slate-50/50 sm:bg-transparent">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Workforce Metabolic Correlation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Overlays scheduled tasks and crew workloads on FortyGuard’s thermal curve to calculate integrated thermal dose and individualized hazard scores.
              </p>
            </div>

            <div className="space-y-2 p-3 sm:p-0 rounded-xl bg-slate-50/50 sm:bg-transparent">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Mitigation & PDF Export</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Run What-If simulations to test early start times, commit changes to live schedules, and export high-resolution executive safety plan PDFs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. What-If Simulator Section */}
      <section id="simulator" className="container mx-auto px-4 py-10 sm:py-16 max-w-5xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Interactive Simulation</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Test Operational Mitigations Before Exposing Crews
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tune shift hours, reduce continuous exposure, apply OSHA 30m/30m shade rotations, and pre-stage active misting stations to eliminate critical strain before workers step on site.
            </p>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Shift start time slider &amp; fast diurnal presets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>OSHA 45/15, 30/30, and 15/45 work-rest rotations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>1-Click live commit to production schedule</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={handleLaunchApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Try Simulator on Live Worksite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Responsive Comparison Box */}
          <div className="bg-slate-50/90 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2.5 border-b border-slate-200">
              <span>Simulation Comparison</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px]">
                -50% Strain Reduction
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-center">
              <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-red-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Baseline</p>
                <p className="text-lg sm:text-xl font-black text-red-600 mt-0.5">8.2 / 10</p>
                <p className="text-[10px] text-red-600 font-medium">Critical Strain</p>
              </div>

              <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-emerald-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">With Mitigations</p>
                <p className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">4.1 / 10</p>
                <p className="text-[10px] text-emerald-600 font-medium">Safe Status</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-normal">
              Concrete Pouring shifted to 07:00 AM + 30m/30m shade rotation.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Footer Banner */}
      <section className="container mx-auto px-4 pt-6 sm:pt-10 pb-12 sm:pb-16 max-w-3xl text-center space-y-4 sm:space-y-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ready to Protect Your Industrial Workforce?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto px-2">
          Explore live industrial facilities across the United States with real-time FortyGuard satellite microclimate intelligence.
        </p>
        <div className="pt-1">
          <button
            onClick={handleLaunchApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 8. Responsive Footer */}
      <footer className="border-t border-slate-200/80 pt-6 sm:pt-8 text-xs text-slate-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <BrandLogo size="sm" showSubtitle={false} showBadge={false} />
            <span className="text-[11px] sm:text-xs whitespace-nowrap">HeatSafe&nbsp;AI • FortyGuard Hackathon '26</span>
          </div>

          <div className="flex items-center gap-4 font-medium text-[11px] sm:text-xs">
            <a
              href="https://github.com/Abdulrahman-AlSayed-1/HeatSafe-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://heatsafe-ai-a730d.containers.snapdeploy.app/health"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 transition-colors inline-flex items-center gap-1"
            >
              <span>API Health</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
