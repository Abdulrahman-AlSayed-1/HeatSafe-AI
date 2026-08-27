import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Eye,
  EyeOff,
  Thermometer,
  AlertCircle,
  RefreshCw,
  Satellite,
  Map as MapIcon,
  Moon,
  Sliders,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';
import { heatmapApi, HeatmapGeoJSON } from '../api/heatmap';

// Custom Glowing Worksite Beacon Marker
const createBeaconIcon = () => {
  return L.divIcon({
    className: 'custom-worksite-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></div>
        <div class="absolute w-6 h-6 rounded-full bg-blue-600/60 animate-pulse"></div>
        <div class="relative w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

interface HeatmapViewerProps {
  worksiteId: number;
  latitude: number;
  longitude: number;
  worksiteName: string;
}

interface TileHoverData {
  tileId: string;
  avgTemp?: number;
  minTemp?: number;
  maxTemp?: number;
  hoursAbove?: number;
}

// Subcomponent to automatically fit bounds and fly smoothly to worksite
function MapViewUpdater({
  center,
  geoJsonData,
}: {
  center: [number, number];
  geoJsonData: HeatmapGeoJSON | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
      try {
        const geoJsonLayer = L.geoJSON(geoJsonData as any);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
          return;
        }
      } catch (e) {
        console.warn('Could not fit bounds to geojson:', e);
      }
    }
    map.flyTo(center, 15, { duration: 1.2 });
  }, [center, geoJsonData, map]);

  return null;
}

export default function HeatmapViewer({
  worksiteId,
  latitude,
  longitude,
  worksiteName,
}: HeatmapViewerProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapGeoJSON | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Basemap style: 'satellite' | 'voyager' | 'dark'
  const [basemap, setBasemap] = useState<'satellite' | 'voyager' | 'dark'>('satellite');
  const [opacity, setOpacity] = useState<number>(0.65);
  const [hoveredTile, setHoveredTile] = useState<TileHoverData | null>(null);

  const fetchHeatmap = () => {
    if (worksiteId) {
      setLoading(true);
      setError(null);
      heatmapApi
        .get(worksiteId)
        .then((res) => {
          setHeatmapData(res.data);
          setError(null);
        })
        .catch((err) => {
          console.warn('FortyGuard heatmap layer unavailable:', err);
          const msg =
            err.response?.data?.message ||
            'FortyGuard satellite thermal tiles unavailable.';
          setError(msg);
          setHeatmapData(null);
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, [worksiteId]);

  const centerPosition: [number, number] = [latitude || 25.08, longitude || 55.14];

  // Basemap tile URLs
  const basemapUrls = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  };

  // Continuous thermal color palette
  const getTileColor = (temp: number) => {
    if (temp >= 44) return '#7f1d1d'; // extreme crimson
    if (temp >= 41) return '#dc2626'; // severe red
    if (temp >= 38) return '#ea580c'; // hot orange
    if (temp >= 35) return '#f59e0b'; // warm amber
    if (temp >= 30) return '#10b981'; // mild emerald
    return '#0284c7'; // cool cyan
  };

  const styleFeature = (feature: any) => {
    const props = feature.properties || {};
    const temp =
      props.average_temperature ??
      props.temperature ??
      props.max_temperature ??
      38.0;

    return {
      fillColor: getTileColor(temp),
      weight: 0.8,
      opacity: 0.6,
      color: 'rgba(255, 255, 255, 0.45)',
      fillOpacity: opacity,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties || {};
    const avg = props.average_temperature ?? props.temperature;
    const min = props.min_temperature;
    const max = props.max_temperature;
    const hours = props.hours_above_threshold;
    const tileId = props.tile_id || 'Thermal Zone';

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 2.5,
          color: '#ffffff',
          fillOpacity: Math.min(opacity + 0.25, 0.95),
        });
        setHoveredTile({
          tileId,
          avgTemp: avg,
          minTemp: min,
          maxTemp: max,
          hoursAbove: hours,
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 0.8,
          color: 'rgba(255, 255, 255, 0.45)',
          fillOpacity: opacity,
        });
      },
    });

    let content = `
      <div style="font-family: Inter, -apple-system, sans-serif; min-width: 170px; padding: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${tileId}</span>
          <span style="font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${getTileColor(avg || 35)}20; color: ${getTileColor(avg || 35)};">
            ${avg !== undefined ? `${Number(avg).toFixed(1)}°C` : ''}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #475569;">
          <div>Min: <b style="color: #0284c7;">${min !== undefined ? `${Number(min).toFixed(1)}°C` : '--'}</b></div>
          <div>Max: <b style="color: #dc2626;">${max !== undefined ? `${Number(max).toFixed(1)}°C` : '--'}</b></div>
        </div>
        ${
          hours !== undefined
            ? `<div style="font-size: 10px; color: #ea580c; margin-top: 4px; font-weight: 500;">
                🔥 ${hours}h &gt; 35°C threshold
              </div>`
            : ''
        }
      </div>
    `;

    layer.bindPopup(content, { closeButton: false, offset: [0, -6] });
  };

  return (
    <div
      className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-4 z-50 p-6 flex flex-col'
          : 'p-6'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                FortyGuard Microclimate Satellite Heatmap
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-semibold border border-indigo-200">
                100m High-Res
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive high-resolution thermal radiance overlay centered on worksite AOI
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Basemap Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setBasemap('satellite')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                basemap === 'satellite'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Satellite Photo Basemap"
            >
              <Satellite className="w-3.5 h-3.5 text-blue-600" />
              Satellite
            </button>
            <button
              onClick={() => setBasemap('voyager')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                basemap === 'voyager'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Clean Vector Street Basemap"
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
              Streets
            </button>
            <button
              onClick={() => setBasemap('dark')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                basemap === 'dark'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dark Thermal Night Mode"
            >
              <Moon className="w-3.5 h-3.5 text-purple-600" />
              Dark
            </button>
          </div>

          {/* Toggle Heatmap Visibility */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showHeatmap
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {showHeatmap ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showHeatmap ? 'Heatmap: On' : 'Heatmap: Off'}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={`space-y-3 ${isFullscreen ? 'flex-1 flex flex-col' : ''}`}>
        {/* Map Container */}
        <div
          className={`w-full rounded-2xl overflow-hidden border border-slate-300/80 shadow-inner relative ${
            isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[440px]'
          }`}
        >
          <MapContainer
            center={centerPosition}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution={basemapUrls[basemap].attribution}
              url={basemapUrls[basemap].url}
              maxZoom={19}
            />

            <Marker position={centerPosition} icon={createBeaconIcon()}>
                <Popup>
                  <div className="font-sans text-xs p-1">
                    <div className="font-bold text-slate-900 text-sm">{worksiteName}</div>
                    <div className="text-slate-500 mt-0.5">
                      Lat: {Number(latitude).toFixed(4)}, Lng: {Number(longitude).toFixed(4)}
                    </div>
                    <div className="text-blue-600 font-semibold mt-1">Worksite Centroid & AOI</div>
                  </div>
                </Popup>
              </Marker>

              {showHeatmap && heatmapData && (
                <GeoJSON
                  key={`${JSON.stringify(heatmapData)}-${opacity}-${basemap}`}
                  data={heatmapData as any}
                  style={styleFeature}
                  onEachFeature={onEachFeature}
                />
              )}

              <MapViewUpdater center={centerPosition} geoJsonData={heatmapData} />
            </MapContainer>

            {/* Floating Top-Left Microclimate Inspector HUD */}
            {hoveredTile && (
              <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-200 text-xs animate-in fade-in slide-in-from-top-2 duration-200 max-w-xs pointer-events-none">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">{hoveredTile.tileId}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: getTileColor(hoveredTile.avgTemp || 35) }}
                  >
                    {hoveredTile.avgTemp != null ? `${Number(hoveredTile.avgTemp).toFixed(1)}°C` : '--'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 text-[11px]">
                  <div>Min: <span className="font-bold text-sky-700">{hoveredTile.minTemp != null ? `${Number(hoveredTile.minTemp).toFixed(1)}°C` : '--'}</span></div>
                  <div>Max: <span className="font-bold text-rose-700">{hoveredTile.maxTemp != null ? `${Number(hoveredTile.maxTemp).toFixed(1)}°C` : '--'}</span></div>
                </div>
                {hoveredTile.hoursAbove != null && (
                  <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    {hoveredTile.hoursAbove} continuous high-heat hours
                  </div>
                )}
              </div>
            )}

            {/* Floating Bottom-Left Layer Controls: Opacity Slider */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Sliders className="w-3.5 h-3.5" />
                <span>Thermal Opacity:</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-24 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <span className="font-bold text-slate-900 w-8 text-right">
                {Math.round(opacity * 100)}%
              </span>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-lg text-xs font-semibold text-slate-700 flex items-center gap-2 z-[1000] border border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                Polling FortyGuard satellite telemetry...
              </div>
            )}

            {/* Error Banner */}
            {error && !loading && (
              <div className="absolute bottom-12 left-3 right-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-amber-300 text-xs z-[1000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="leading-snug">
                    <b>Thermal Heatmap Notice:</b> {error}
                  </span>
                </div>
                <button
                  onClick={fetchHeatmap}
                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Premium Legend & Microclimate Scale */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-slate-100/80 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>Microclimate Surface Thermal Gradient:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-semibold text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#0284c7] shadow-sm"></span>
                <span className="text-slate-600">&lt; 30°C (Cool)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#10b981] shadow-sm"></span>
                <span className="text-slate-600">30–35°C (Mild)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#f59e0b] shadow-sm"></span>
                <span className="text-slate-600">35–38°C (Warm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#ea580c] shadow-sm"></span>
                <span className="text-slate-600">38–41°C (Hot)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#dc2626] shadow-sm"></span>
                <span className="text-slate-600">41–44°C (Severe)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#7f1d1d] shadow-sm"></span>
                <span className="text-slate-600">&gt; 44°C (Extreme)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Hover zone to inspect micro-metrics
            </div>
          </div>
        </div>
    </div>
  );
}
