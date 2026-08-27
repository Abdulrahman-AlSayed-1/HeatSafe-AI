import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { Satellite, Map as MapIcon, Moon, Crosshair } from 'lucide-react';
import { isLocationInUnitedStates } from '../utils/geoValidation';

// Custom Glowing Worksite Beacon Marker
const createBeaconIcon = () => {
  return L.divIcon({
    className: 'custom-location-picker-marker',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <div class="absolute w-9 h-9 rounded-full bg-blue-500/35 animate-ping"></div>
        <div class="absolute w-6 h-6 rounded-full bg-blue-600/60 animate-pulse"></div>
        <div class="relative w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-blue-600"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
};

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
}

// US Geographic Bounding Limits
const US_BOUNDS: L.LatLngBoundsLiteral = [
  [15.0, -180.0], // Southwest (Hawaii / Pacific)
  [75.0, -60.0],  // Northeast (Alaska / Maine / Atlantic)
];

// Basemap Tile Providers
const BASEMAP_PROVIDERS = {
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

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      if (!isLocationInUnitedStates(lat, lng)) {
        toast.error('Selected point is outside the United States. Canada, Mexico & international regions are not supported by FortyGuard.');
        return;
      }
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Subcomponent to smoothly animate/recenter map when coordinates change externally
function MapCenterUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom() < 8 ? 10 : map.getZoom(), { duration: 1.0 });
  }, [position, map]);
  return null;
}

export default function LocationPicker({
  onLocationSelect,
  initialPosition = [33.4484, -112.0740], // Default: Phoenix, Arizona
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [basemap, setBasemap] = useState<'satellite' | 'voyager' | 'dark'>('satellite');

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition[0], initialPosition[1]]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner relative group">
      {/* Floating Basemap Switcher Toolbar (Top-Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setBasemap('satellite')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
            basemap === 'satellite'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Satellite Imagery"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>

        <button
          type="button"
          onClick={() => setBasemap('voyager')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
            basemap === 'voyager'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Vector Streets"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Streets</span>
        </button>

        <button
          type="button"
          onClick={() => setBasemap('dark')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
            basemap === 'dark'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Dark Night Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
      </div>

      {/* Floating Precision Info (Top-Left) */}
      <div className="absolute top-3 left-3 z-[1000] hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-medium border border-white/10 shadow-md pointer-events-none">
        <Crosshair className="w-3.5 h-3.5 text-blue-400" />
        <span>Click anywhere to position worksite centroid</span>
      </div>

      {/* Interactive Map */}
      <MapContainer
        center={position}
        zoom={10}
        minZoom={3}
        maxBounds={US_BOUNDS}
        maxBoundsViscosity={0.9}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={basemap}
          attribution={BASEMAP_PROVIDERS[basemap].attribution}
          url={BASEMAP_PROVIDERS[basemap].url}
          maxZoom={19}
        />
        <Marker position={position} icon={createBeaconIcon()} />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        <MapCenterUpdater position={position} />
      </MapContainer>
    </div>
  );
}
