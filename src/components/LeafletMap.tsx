import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Hospital } from '../types';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Search, 
  Building2, 
  Calendar, 
  Crosshair, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface LeafletMapProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  selectedState?: string;
  selectedDistrict?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  hospitals,
  onSelectHospital,
  selectedState = 'All States',
  selectedDistrict = 'All Districts',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<{ [key: string]: L.Marker }>({});

  const [mapSearchLocation, setMapSearchLocation] = useState('');
  const [selectedHospitalCard, setSelectedHospitalCard] = useState<Hospital | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Filtered hospitals based on state, district and local map search
  const visibleHospitals = hospitals.filter((h) => {
    const matchState =
      selectedState === 'All States' || h.state.toLowerCase() === selectedState.toLowerCase();
    const matchDistrict =
      selectedDistrict === 'All Districts' ||
      h.district.toLowerCase().includes(selectedDistrict.toLowerCase());

    const q = mapSearchLocation.toLowerCase().trim();
    const matchSearch =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.district.toLowerCase().includes(q) ||
      h.state.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.pincode.includes(q);

    return matchState && matchDistrict && matchSearch;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when hospitals or search changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    markersMapRef.current = {};

    visibleHospitals.forEach((hospital) => {
      const isGovt = hospital.type === 'Government' || hospital.type === 'Autonomous Institute';
      const markerColor = isGovt ? '#059669' : '#2563eb';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px;">
            +
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([hospital.coordinates.lat, hospital.coordinates.lng], {
        icon: customIcon,
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px; min-width: 200px;">
          <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">${hospital.name}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">📍 ${hospital.city}, ${hospital.state}</div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
            <span>ICU: <strong style="color: #059669">${hospital.availableIcuBeds} Open</strong></span>
            <span>Beds: <strong>${hospital.availableBeds} / ${hospital.totalBeds}</strong></span>
          </div>
          <div style="font-size: 10px; color: #475569; font-weight: 600;">24/7 ER: ${hospital.emergencyPhone}</div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedHospitalCard(hospital);
      });

      markersLayerRef.current?.addLayer(marker);
      markersMapRef.current[hospital.id] = marker;
    });

    // Auto-fit bounds if we have visible hospitals
    if (visibleHospitals.length > 0 && mapInstanceRef.current) {
      if (visibleHospitals.length === 1) {
        mapInstanceRef.current.setView(
          [visibleHospitals[0].coordinates.lat, visibleHospitals[0].coordinates.lng],
          13
        );
      } else {
        const bounds = L.latLngBounds(
          visibleHospitals.map((h) => [h.coordinates.lat, h.coordinates.lng])
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }
  }, [visibleHospitals.length, selectedState, selectedDistrict]);

  // Center on hospital from side block click
  const focusHospitalOnMap = (hospital: Hospital) => {
    setSelectedHospitalCard(hospital);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([hospital.coordinates.lat, hospital.coordinates.lng], 14, {
        duration: 1.2,
      });
      const marker = markersMapRef.current[hospital.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Real GPS Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.5 });

          // Add pulsing user GPS pin
          const userIcon = L.divIcon({
            className: 'user-location-pin',
            html: `
              <div style="position: relative; width: 20px; height: 20px;">
                <div style="position: absolute; width: 100%; height: 100%; background: #3b82f6; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="width: 14px; height: 14px; background: #2563eb; border: 2px solid white; border-radius: 50%; margin: 3px;"></div>
              </div>
            `,
            iconSize: [20, 20],
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<strong>📍 You Are Here</strong><br/>Scanning nearest hospitals...')
            .openPopup();
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err.message);
        alert('Could not retrieve GPS location. Please check browser permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
      {/* Top Map Location Search & Controls Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-b border-teal-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Hospital Radar & Area Locator</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                {visibleHospitals.length} Found
              </span>
            </h3>
            <span className="text-[11px] text-teal-200">
              Search any place, district, or hospital name to instantly locate on map
            </span>
          </div>
        </div>

        {/* Location Search Bar + GPS Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={mapSearchLocation}
              onChange={(e) => setMapSearchLocation(e.target.value)}
              placeholder="Search place, city, district (e.g. Hyderabad, Guntur, Delhi)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800/90 text-white placeholder-slate-400 text-xs rounded-xl border border-teal-700/50 focus:outline-hidden focus:ring-2 focus:ring-teal-400"
            />
            {mapSearchLocation && (
              <button
                onClick={() => setMapSearchLocation('')}
                className="absolute right-2.5 top-2 text-[11px] text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
            title="Locate nearest hospitals using GPS"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'GPS Radar'}</span>
          </button>
        </div>
      </div>

      {/* Side-By-Side Grid: Map (Left/Center) + Hospitals in Selected Area Block (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* MAP CONTAINER (8 Columns on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 relative h-[380px] lg:h-auto min-h-[380px]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

          {/* Quick Map Legend */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-[11px] flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-2xs"></span>
              <span className="font-semibold text-slate-700">Govt / AIIMS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-2xs"></span>
              <span className="font-semibold text-slate-700">Private / NABH</span>
            </div>
          </div>
        </div>

        {/* MAP PAKANA BLOCK (Hospitals in Selected Area Panel - 4 or 5 Columns) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-50/70 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-[560px] overflow-hidden">
          {/* Block Header */}
          <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-700" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hospitals in This Location
              </h4>
            </div>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {visibleHospitals.length} Available
            </span>
          </div>

          {/* Hospitals List in Selected Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-transparent">
            {visibleHospitals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium">No hospitals matching &quot;{mapSearchLocation}&quot;</p>
                <p className="text-[11px] text-slate-400">
                  Try searching for state, district, or landmark name.
                </p>
                <button
                  onClick={() => setMapSearchLocation('')}
                  className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-100"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              visibleHospitals.map((hospital) => {
                const isSelected = selectedHospitalCard?.id === hospital.id;
                const isGovt =
                  hospital.type === 'Government' || hospital.type === 'Autonomous Institute';

                return (
                  <div
                    key={hospital.id}
                    onClick={() => focusHospitalOnMap(hospital)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isGovt
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {hospital.type}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            ★ {hospital.rating}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 truncate leading-snug" title={hospital.name}>
                          {hospital.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          📍 {hospital.district}, {hospital.state}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          focusHospitalOnMap(hospital);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-teal-50 text-slate-500 hover:text-teal-700 rounded-lg shrink-0"
                        title="View on Map"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bed Census Stats */}
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-xl text-[10px] border border-slate-100">
                      <div>
                        <span className="text-slate-400 block font-semibold uppercase">ICU Beds</span>
                        <strong className="text-emerald-700 font-mono text-xs">
                          {hospital.availableIcuBeds} Open
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold uppercase">Total Census</span>
                        <strong className="text-slate-800 font-mono text-xs">
                          {hospital.availableBeds} / {hospital.totalBeds}
                        </strong>
                      </div>
                    </div>

                    {/* Actions: Direct Book Appointment & Emergency Call */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={`tel:${hospital.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-teal-700 font-medium"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        <span>Call</span>
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHospital(hospital);
                        }}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Book Slot</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Footer */}
          <div className="p-2.5 bg-white border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
            💡 Click any card to fly and center on map • Live 24/7 ICU tracking
          </div>
        </div>
      </div>
    </div>
  );
};
