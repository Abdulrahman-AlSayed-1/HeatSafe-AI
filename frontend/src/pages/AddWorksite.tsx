import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Save,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import LocationPicker from '../components/LocationPicker';
import { worksitesApi } from '../api/worksites';
import toast from 'react-hot-toast';

interface USPreset {
  name: string;
  tag: string;
  lat: number;
  lng: number;
  timezone: string;
}

const US_PRESETS: USPreset[] = [
  { name: 'Phoenix, AZ', tag: 'High-Heat Hub', lat: 33.4484, lng: -112.0740, timezone: 'America/Phoenix' },
  { name: 'Las Vegas, NV', tag: 'Desert Infrastructure', lat: 36.1699, lng: -115.1398, timezone: 'America/Los_Angeles' },
  { name: 'Houston, TX', tag: 'Energy Corridor', lat: 29.7604, lng: -95.3698, timezone: 'America/Chicago' },
  { name: 'Dallas, TX', tag: 'Industrial Corridor', lat: 32.7767, lng: -96.7970, timezone: 'America/Chicago' },
  { name: 'Miami, FL', tag: 'Coastal Urban', lat: 25.7617, lng: -80.1918, timezone: 'America/New_York' },
  { name: 'Los Angeles, CA', tag: 'Metro Logistics', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'New York, NY', tag: 'Dense Urban', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
];

import { isLocationInUnitedStates } from '../utils/geoValidation';

export default function AddWorksite() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'HeatSafe AI — Add Worksite';
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: 33.4484,
    longitude: -112.0740,
    timezone: 'America/Phoenix',
  });

  // Precise Validation: Strictly United States (Canada, Mexico & international excluded)
  const isInsideUS = isLocationInUnitedStates(formData.latitude, formData.longitude);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Math.round(lat * 10000) / 10000,
      longitude: Math.round(lng * 10000) / 10000,
    }));
  };

  const applyPreset = (preset: USPreset) => {
    setFormData((prev) => ({
      ...prev,
      latitude: preset.lat,
      longitude: preset.lng,
      timezone: preset.timezone,
      name: prev.name ? prev.name : `${preset.name} Operations Hub`,
    }));
    toast.success(`Selected preset: ${preset.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isInsideUS) {
      toast.error('Worksite coordinates must be within the United States for FortyGuard satellite telemetry.');
      return;
    }

    setSubmitting(true);
    try {
      await worksitesApi.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        timezone: formData.timezone,
      });
      toast.success('Worksite created successfully with FortyGuard coverage!');
      navigate('/worksites');
    } catch (error: any) {
      console.error('Error creating worksite:', error);
      const msg = error.response?.data?.message || 'Failed to create worksite. Please verify coordinates.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/60 to-indigo-50/50 bg-pattern pb-16">
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/worksites')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-slate-600"
                title="Back to Worksites"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Add New Worksite</h1>
                  <p className="text-xs text-slate-500">Configure US facility location & FortyGuard satellite link</p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>FortyGuard US Coverage Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-8">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
          
          {/* Quick-Select US High-Heat Hubs Presets */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Quick-Select Verified US High-Heat Hubs</h3>
              </div>
              <span className="text-[11px] text-slate-500">Click a hub to automatically pin coordinates</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {US_PRESETS.map((preset) => {
                const isSelected =
                  Math.abs(formData.latitude - preset.lat) < 0.05 &&
                  Math.abs(formData.longitude - preset.lng) < 0.05;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{preset.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {preset.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive US Map Location Picker */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold">United States Geographic Coordinate Selection</h2>
                  <p className="text-xs text-blue-100">Click anywhere within the US map or enter coordinates</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Bounded to US Territories</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Live Map */}
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialPosition={[formData.latitude, formData.longitude]}
              />

              {/* Coordinates Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Latitude (°N) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Contiguous US: 24.5°N to 49.4°N (Alaska: up to 71.5°N, Hawaii: 18.8°N)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Longitude (°W) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Contiguous US: -125.0°W to -66.9°W (Alaska & Hawaii: up to -179.0°W)
                  </p>
                </div>
              </div>

              {/* Real-time Validation Status Alert */}
              {isInsideUS ? (
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      ✓ Verified FortyGuard Satellite Coverage Zone (United States)
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Coordinates ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}) qualify for live FortyGuard satellite microclimate raster analytics and ISO 7243 hazard scoring.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50/90 rounded-2xl border border-red-200 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-900">
                      ⚠️ Outside FortyGuard Coverage (United States Only)
                    </p>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      FortyGuard satellite thermal raster models currently support locations within the United States. Please pick a US location or select a quick-select hub above.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Facility Details & Timezone Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-bold">Worksite Information & Operating Schedule</h2>
                <p className="text-xs text-slate-400">Specify facility metadata and local timezone</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  Worksite Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Phoenix Solar & Industrial Center"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900"
                  required
                  minLength={3}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description & Operational Scope
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details regarding work crews, outdoor exposure zones, shift structures..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 resize-none"
                  maxLength={500}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Local US Timezone <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
                >
                  <option value="America/Phoenix">America/Phoenix (Mountain Standard - Arizona, UTC-7)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (Pacific Time, UTC-8)</option>
                  <option value="America/Denver">America/Denver (Mountain Time, UTC-7)</option>
                  <option value="America/Chicago">America/Chicago (Central Time, UTC-6)</option>
                  <option value="America/New_York">America/New_York (Eastern Time, UTC-5)</option>
                  <option value="America/Anchorage">America/Anchorage (Alaska Time, UTC-9)</option>
                  <option value="America/Honolulu">America/Honolulu (Hawaii Time, UTC-10)</option>
                </select>
                <p className="text-[11px] text-slate-500">Aligns worker shift hours with solar peak diurnal curves.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/worksites')}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isInsideUS || submitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Worksite...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Worksite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
