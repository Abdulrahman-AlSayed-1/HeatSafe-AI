import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import {
  ArrowRight,
  ShieldCheck,
  Flame,
  Cpu,
  Sliders,
  Sparkles,
  CheckCircle2,
  Activity,
  Clock,
  FileText,
  ChevronRight,
  Globe,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handleLaunchApp = () => {
    navigate('/worksites');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-orange-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-cyan-600/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1600px] left-0 w-[600px] h-[600px] bg-orange-600/10 blur-3xl pointer-events-none -z-10" />

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo size="md" showSubtitle={true} showBadge={true} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                FortyGuard TCM Telemetry Live
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Core Capabilities</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#simulator" className="hover:text-white transition-colors">What-If Engine</a>
            <a href="#standards" className="hover:text-white transition-colors">OSHA & ISO 7243</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchApp}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:-translate-y-0.5"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-900/90 text-orange-400 border border-orange-500/30 shadow-inner">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Built for FortyGuard Hackathon '26 • Industrial & Enterprise Track</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Precision Microclimate Intelligence.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              Zero Heat Casualties.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            The autonomous workforce heat-health operating system. Combining{' '}
            <strong className="text-white font-semibold">FortyGuard 100m satellite thermal telemetry</strong> with{' '}
            <strong className="text-white font-semibold">ISO 7243 & OSHA physiological standards</strong> to predict, simulate, and eliminate occupational heat strain before shifts start.
          </p>

          {/* Dual CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLaunchApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-base text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <Sliders className="w-5 h-5 text-orange-400" />
              <span>Explore What-If Simulator</span>
            </a>
          </div>

          {/* Micro Telemetry Ticker */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>FortyGuard 100m Spatial Grid</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>24h Diurnal Predictive Horizon</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ISO 7243 & OSHA Certified Logic</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Dual-Engine Gemini AI</span>
            </div>
          </div>
        </div>

        {/* 3. Floating Interactive Cockpit Preview */}
        <div className="mt-14 relative mx-auto max-w-5xl rounded-3xl p-3 bg-gradient-to-b from-slate-700/40 via-slate-800/20 to-slate-900/40 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
          <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Phoenix Industrial Operations Hub</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      HIGH WORKFORCE RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Location: 33.4484°N, -112.0740°W • FortyGuard TCM Activity Active
                  </p>
                </div>
              </div>
              <button
                onClick={handleLaunchApp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-colors"
              >
                <span>Live Telemetry View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics Showcase Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs font-medium text-slate-400">Peak Thermal Exposure</p>
                <p className="text-2xl sm:text-3xl font-black text-orange-400 mt-1">41.5°C</p>
                <p className="text-[11px] text-slate-500 mt-0.5">FortyGuard Satellite Peak</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs font-medium text-slate-400">Workforce Risk Index</p>
                <p className="text-2xl sm:text-3xl font-black text-red-400 mt-1">8.2<span className="text-sm font-normal text-slate-400">/10</span></p>
                <p className="text-[11px] text-red-400/80 mt-0.5">Exceeds OSHA Threshold</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs font-medium text-slate-400">Exposed Personnel</p>
                <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">28</p>
                <p className="text-[11px] text-slate-500 mt-0.5">3 Critical Midday Shifts</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs font-medium text-slate-400">Mandated OSHA Rest</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">30m/30m</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">ISO 7243 Auto-Prescribed</p>
              </div>
            </div>

            {/* Shift Heat Warning Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-orange-950/30 to-amber-950/30 border border-orange-500/30 flex items-start gap-3 text-xs">
              <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-orange-200">
                  Critical Solar Peak Window (12:00 – 17:00): Concrete Pouring & Steel Welding Exposed
                </p>
                <p className="text-slate-300 leading-relaxed">
                  AI Recommendation: Shift heavy continuous tasks to early morning (07:00) or enforce 30m work / 30m active shade rest rotation to reduce workforce strain from 8.2 to 4.1.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities Pillars */}
      <section id="features" className="py-24 bg-slate-900/60 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">Enterprise Value Drivers</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Engineered for Extreme Industrial Climates
            </h2>
            <p className="text-base sm:text-lg text-slate-400">
              Unlike generic weather apps that report airport readings 20 miles away, HeatSafe AI computes surface microclimates directly at your job site's exact GPS coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-orange-500/40 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">FortyGuard Satellite TCM</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dynamic 0.01° × 0.01° AOI polygon generation and asynchronous raster polling delivering 100m spatial thermal heatmaps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-orange-500/40 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">ISO 7243 & OSHA Logic</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Computes continuous metabolic workload, environmental exposure types, and WBGT to enforce compliant work-rest protocols.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-orange-500/40 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4-Lever What-If Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Simulate shift time shifts, duration cutbacks, mandatory rest intervals, and active cooling stations with 1-click schedule commit.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-orange-500/40 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dual-Engine Gemini AI</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generates natural language safety plans via Google Gemini 2.0 Flash with deterministic physiological fallback if offline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 3-Step Interactive Architecture */}
      <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">End-to-End Workflow</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              From Satellite Pass to Shift Safety in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-sm border border-orange-500/30">
                01
              </div>
              <h3 className="text-xl font-bold text-white">Spatial Telemetry Ingestion</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                When a worksite is selected, HeatSafe AI generates an Area of Interest (AOI) bounding box and queries FortyGuard’s TCM Satellite API for surface temperature rasters and daily diurnal curves.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-orange-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Sub-second cached raster retrieval</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/30">
                02
              </div>
              <h3 className="text-xl font-bold text-white">Workforce Metabolic Correlation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our ISO 7243 calculation engine overlays planned employee shifts (e.g. Concrete Pouring, Steel Welding) on FortyGuard’s thermal curve to calculate integrated thermal dose and crew strain scores.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-amber-400">
                <Activity className="w-3.5 h-3.5" />
                <span>Separates physical weather from task risk</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                03
              </div>
              <h3 className="text-xl font-bold text-white">Mitigation & Compliance Export</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Safety supervisors run What-If simulations to test earlier start times and rest rotations, commit updates directly to the live shift schedule, and export branded OSHA heat-safety plan PDFs.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
                <FileText className="w-3.5 h-3.5" />
                <span>1-Click Executive PDF Plan Export</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. What-If Simulator Deep-Dive */}
      <section id="simulator" className="py-24 bg-slate-900/80 border-t border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">Operational Simulation</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test & Validate Mitigations Before Exposing Crews
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Industrial heat safety cannot rely on guesswork. The HeatSafe AI What-If Simulator empowers site supervisors to model operational adjustments and instantly see their physiological impact on workforce strain.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300"><strong className="text-white">Shift Start Time Lever:</strong> Reschedule high-exertion tasks away from the 12:00–17:00 solar peak into cool dawn hours.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300"><strong className="text-white">Continuous Duration Lever:</strong> Restrict sustained exposure windows from 120m down to safe 60m blocks.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300"><strong className="text-white">OSHA Work-Rest Cycles:</strong> Test 45/15, 30/30, or 15/45 mandatory shade/hydration rotations.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300"><strong className="text-white">Active Cooling Stations:</strong> Model the physiological benefits of misting fans, electrolyte stations, and cooling vests.</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLaunchApp}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
              >
                <span>Try What-If Simulator on Live Worksite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simulator Mock Visual */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-white">Live Mitigation Simulator</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                -50% Strain Drop
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Shift Start Time:</span>
                  <span className="text-emerald-400">07:00 AM (Early Morning)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[35%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Work-Rest Protocol:</span>
                  <span className="text-orange-400">30m Work / 30m Rest</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-[50%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Engineering Mitigations:</span>
                  <span className="text-cyan-400">Hydration + Misting Tents</span>
                </div>
              </div>

              {/* Before vs After Impact Box */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-center">
                  <p className="text-[11px] text-slate-400">Baseline Risk</p>
                  <p className="text-xl font-black text-red-400 mt-0.5">8.2 / 10</p>
                  <p className="text-[10px] text-red-400/80">CRITICAL STRAIN</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                  <p className="text-[11px] text-slate-400">Simulated Risk</p>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">4.1 / 10</p>
                  <p className="text-[10px] text-emerald-400/80">SAFE WORKFORCE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Industry Metrics & Impact Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-4xl sm:text-5xl font-extrabold text-orange-400">100m</p>
            <p className="text-sm text-slate-400 mt-2 font-medium">Spatial Telemetry Precision</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-4xl sm:text-5xl font-extrabold text-emerald-400">-38%</p>
            <p className="text-sm text-slate-400 mt-2 font-medium">Projected Incident Reduction</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-4xl sm:text-5xl font-extrabold text-cyan-400">24h</p>
            <p className="text-sm text-slate-400 mt-2 font-medium">Diurnal Predictive Horizon</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-4xl sm:text-5xl font-extrabold text-purple-400">100%</p>
            <p className="text-sm text-slate-400 mt-2 font-medium">OSHA & ISO 7243 Compliant</p>
          </div>
        </div>
      </section>

      {/* 8. Call To Action Footer Banner */}
      <section className="py-20 bg-gradient-to-b from-slate-900/80 to-slate-950 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Protect Your Industrial Workforce?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Experience the live operational platform on real-world industrial sites in Phoenix, Houston, and Miami with FortyGuard satellite microclimate intelligence.
          </p>
          <div className="pt-2">
            <button
              onClick={handleLaunchApp}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-2xl shadow-orange-500/30 transition-all transform hover:-translate-y-1"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. Platform Footer */}
      <footer className="py-12 border-t border-slate-800/80 text-xs text-slate-500 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showSubtitle={false} showBadge={false} />
            <span className="text-slate-400 font-medium">
              HeatSafe AI • FortyGuard Hackathon '26 (Industrial & Enterprise Track)
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Abdulrahman-AlSayed-1/HeatSafe-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://heatsafe-ai-a730d.containers.snapdeploy.app/health"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span>API Health Status</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleLaunchApp}
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              Launch Live App →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
