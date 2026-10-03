import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Hospital, DispatchPhase } from '../types';
import { Crosshair, Maximize2, Minimize2, Compass, X } from 'lucide-react';

interface HospitalMapProps {
  userLocation?: { lat: number; lon: number } | null;
  hospitals: Hospital[];
  selectedHospitalId?: string | null;
  dispatchedHospital?: Hospital | null;
  hoveredHospitalId?: string | null;
  onSelectHospital: (hospital: Hospital) => void;
  heightClass?: string;
  roadRoute?: [number, number][];
  ambulancePosition?: [number, number] | null;
  dispatchPhase?: DispatchPhase;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  userLocation,
  hospitals,
  selectedHospitalId,
  dispatchedHospital,
  hoveredHospitalId,
  onSelectHospital,
  heightClass = 'h-[520px] lg:h-[calc(100vh-160px)]',
  roadRoute,
  ambulancePosition,
  dispatchPhase = 'en_route_patient',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowRef = useRef<L.Polyline | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userLocation?.lat || (hospitals[0]?.Latitude) || 23.084;
    const initialLon = userLocation?.lon || (hospitals[0]?.Longitude) || 72.549;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 12,
      zoomControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size on full screen toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  // Update User Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-teal-500/25 animate-ping absolute"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white shadow-md relative z-10"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong style="font-family: inherit; font-size: 12px;">📍 You are here</strong>');
      userMarkerRef.current = userMarker;
    }
  }, [userLocation]);

  // Update Hospital Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (hospitals.length === 0) return;

    const bounds = L.latLngBounds([]);
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lon]);

    hospitals.forEach((h) => {
      if (!h.Latitude || !h.Longitude) return;
      bounds.extend([h.Latitude, h.Longitude]);

      const score = h.suitability_score || 70;
      let pinClass = 'bg-teal-600';
      if (score >= 85) {
        pinClass = 'bg-emerald-600';
      } else if (score < 60) {
        pinClass = 'bg-rose-600';
      }

      const isDispatched = h.Hospital_ID === dispatchedHospital?.Hospital_ID;
      const isSelected = isDispatched || h.Hospital_ID === selectedHospitalId;
      const isHovered = h.Hospital_ID === hoveredHospitalId;

      let markerHtml = '';
      if (isDispatched) {
        markerHtml = `
          <div class="relative flex flex-col items-center cursor-pointer z-50">
            <div class="w-6 h-6 rounded-full bg-emerald-500/25 animate-ping absolute -top-1"></div>
            <div class="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-md border border-white ring-2 ring-emerald-400 whitespace-nowrap">
              <span>★ ${score}</span>
              <span class="text-[8px] bg-emerald-800 px-1 py-0.2 rounded font-semibold uppercase">TARGET</span>
            </div>
            <div class="w-1 h-1 bg-emerald-900"></div>
          </div>
        `;
      } else {
        markerHtml = `
          <div class="relative flex flex-col items-center cursor-pointer ${
            isSelected ? 'scale-110 z-40' : isHovered ? 'scale-105 z-30' : 'z-20'
          }">
            <div class="flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${pinClass} text-white font-bold text-[9px] shadow-sm border border-white">
              <span>${score}</span>
            </div>
            <div class="w-1 h-1 bg-slate-800"></div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'hospital-map-marker',
        html: markerHtml,
        iconSize: [48, 22],
        iconAnchor: [24, 20],
      });

      const marker = L.marker([h.Latitude, h.Longitude], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          onSelectHospital(h);
        });

      // Marker Popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 190px; padding: 4px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${h.Hospital_Name}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${h.City} • <strong>${h.distance_km !== undefined ? h.distance_km : 0} km away</strong></div>
          <div style="display: flex; gap: 6px; margin-bottom: 6px; font-size: 11px;">
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">🛏️ Beds: <strong>${h.Available_Beds}</strong></span>
            <span style="background: #eff6ff; padding: 2px 6px; border-radius: 4px; color: #1d4ed8;">🫁 ICU: <strong>${h.ICU_Available_Beds}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <span style="font-size: 11px; color: #0f766e; font-weight: 700;">Suitability: ${score}/100</span>
            <span style="font-size: 10px; color: #64748b;">⏱️ ~${h.Estimated_Wait_Min}m</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      markersRef.current[h.Hospital_ID] = marker;
    });

    // Fit map bounds to view all matching hospitals if no specific hospital is dispatched
    if (!dispatchedHospital && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [hospitals, userLocation, dispatchedHospital, selectedHospitalId, hoveredHospitalId]);

  // 1. Draw Real Road Route Polylines (OSRM road geometry)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous polylines
    if (routeGlowRef.current) {
      routeGlowRef.current.remove();
      routeGlowRef.current = null;
    }
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (dispatchedHospital && roadRoute && roadRoute.length >= 2) {
      // 1. Road glow / corridor halo
      const glow = L.polyline(roadRoute, {
        color: '#10b981',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routeGlowRef.current = glow;

      // 2. Primary road route polyline
      const poly = L.polyline(roadRoute, {
        color: '#059669',
        weight: 4.5,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routePolylineRef.current = poly;

      // Fit map bounds to show complete road route
      const bounds = L.latLngBounds(roadRoute);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [roadRoute, dispatchedHospital]);

  // 2. Real-Time Moving Ambulance Unit Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!dispatchedHospital || !ambulancePosition) {
      if (ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current.remove();
        ambulanceMarkerRef.current = null;
      }
      return;
    }

    // Dynamic marker HTML based on emergency dispatch phase with ambulance logo and unit ID
    const unitId = 'PR-408';
    let iconHtml = '';
    let popupTitle = '';
    let popupDesc = '';

    if (dispatchPhase === 'en_route_patient') {
      iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer select-none">
          <div class="w-8 h-8 rounded-full bg-emerald-500/25 animate-ping absolute"></div>
          <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 text-white font-bold text-[11px] shadow-xl border-2 border-emerald-400 whitespace-nowrap ring-2 ring-emerald-500/30">
            <span class="text-sm leading-none">🚑</span>
            <span class="text-emerald-400 font-extrabold tracking-wide">Unit #${unitId}</span>
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="En Route"></span>
          </div>
        </div>
      `;
      popupTitle = `🚑 Ambulance Unit #${unitId} (ALS)`;
      popupDesc = 'Live GPS Corridor: En Route to Patient • Speed: ~48 km/h';
    } else if (dispatchPhase === 'arrived_patient') {
      iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer select-none">
          <div class="w-8 h-8 rounded-full bg-amber-500/30 animate-ping absolute"></div>
          <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 text-white font-bold text-[11px] shadow-xl border-2 border-amber-400 whitespace-nowrap ring-2 ring-amber-500/30">
            <span class="text-sm leading-none">🚑</span>
            <span class="text-amber-400 font-extrabold tracking-wide">Unit #${unitId}</span>
            <span class="px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[9px] font-bold">On-Scene</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>
      `;
      popupTitle = `🚨 On-Scene: Ambulance Unit #${unitId}`;
      popupDesc = 'Paramedic crew attending to patient • Stabilization & boarding';
    } else if (dispatchPhase === 'transit_hospital') {
      iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer select-none">
          <div class="w-8 h-8 rounded-full bg-blue-500/30 animate-ping absolute"></div>
          <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 text-white font-bold text-[11px] shadow-xl border-2 border-blue-400 whitespace-nowrap ring-2 ring-blue-500/30">
            <span class="text-sm leading-none">🚑</span>
            <span class="text-blue-300 font-extrabold tracking-wide">Unit #${unitId}</span>
            <span class="px-1 py-0.2 rounded bg-blue-500/30 text-blue-200 text-[9px] font-bold">ER Transit</span>
            <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          </div>
        </div>
      `;
      popupTitle = `🚑 Priority ER Transit: Ambulance Unit #${unitId}`;
      popupDesc = 'En route to Hospital ER Bay • Zero-wait ICU bed alerted';
    } else {
      // admitted_complete
      iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer select-none">
          <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 text-white font-bold text-[11px] shadow-xl border-2 border-emerald-500 whitespace-nowrap">
            <span class="text-sm leading-none">🚑</span>
            <span class="text-emerald-400 font-extrabold tracking-wide">Unit #${unitId}</span>
            <span class="px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-200 text-[9px] font-bold">Admitted</span>
          </div>
        </div>
      `;
      popupTitle = `🏥 Intake Completed: Ambulance Unit #${unitId}`;
      popupDesc = 'Patient successfully handed over to Emergency Care';
    }

    const customIcon = L.divIcon({
      className: 'ambulance-live-marker',
      html: iconHtml,
      iconSize: [136, 30],
      iconAnchor: [68, 15],
    });

    if (ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current.setLatLng(ambulancePosition);
      ambulanceMarkerRef.current.setIcon(customIcon);
    } else {
      const ambMarker = L.marker(ambulancePosition, {
        icon: customIcon,
        zIndexOffset: 3000,
      }).addTo(map);

      ambMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 6px; min-width: 190px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 16px;">🚑</span>
            <strong style="color: #059669; font-size: 13px;">${popupTitle}</strong>
          </div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 6px;">${popupDesc}</div>
          <div style="font-size: 11px; background: #ecfdf5; padding: 4px 8px; border-radius: 6px; border: 1px solid #a7f3d0; color: #065f46;">
            Target Facility: <strong>${dispatchedHospital.Hospital_Name}</strong>
          </div>
        </div>
      `);
      ambulanceMarkerRef.current = ambMarker;
    }
  }, [ambulancePosition, dispatchPhase, dispatchedHospital]);

  // Synchronize selection highlight
  useEffect(() => {
    if (!selectedHospitalId) return;
    const marker = markersRef.current[selectedHospitalId];
    const map = mapInstanceRef.current;
    if (marker && map) {
      marker.openPopup();
      map.panTo(marker.getLatLng(), { animate: true, duration: 0.6 });
    }
  }, [selectedHospitalId]);

  const fitBoundsAll = () => {
    const map = mapInstanceRef.current;
    if (!map || hospitals.length === 0) return;
    const bounds = L.latLngBounds([]);
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lon]);
    hospitals.forEach((h) => {
      if (h.Latitude && h.Longitude) bounds.extend([h.Latitude, h.Longitude]);
    });
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const recenterUser = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lon], 13, { animate: true });
    } else if (hospitals.length > 0 && hospitals[0].Latitude && hospitals[0].Longitude) {
      map.setView([hospitals[0].Latitude, hospitals[0].Longitude], 13, { animate: true });
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <div
      className={
        isFullScreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen bg-slate-900 overflow-hidden'
          : `relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-sm`
      }
    >
      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col space-y-2">
        {/* Recenter Pin */}
        <button
          type="button"
          onClick={recenterUser}
          title="Re-center on Your Location"
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <Crosshair className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </button>

        {/* Fit Bounds */}
        <button
          type="button"
          onClick={fitBoundsAll}
          title="Fit All Hospitals on Map"
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </button>

        {/* True Full Screen Toggle */}
        <button
          type="button"
          onClick={toggleFullScreen}
          title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Open Map in Full Screen'}
          className={`p-2.5 rounded-xl shadow-md border transition ${
            isFullScreen
              ? 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {isFullScreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          )}
        </button>
      </div>

      {/* Full-Screen Top Header Bar */}
      {isFullScreen && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center space-x-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            📍 Emergency Map Explorer ({hospitals.length} Hospitals)
          </span>
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Full Screen</span>
          </button>
        </div>
      )}

      {/* Live Ambulance Tracking HUD Chip */}
      {dispatchedHospital && ambulancePosition && (
        <div
          className={`absolute ${
            isFullScreen ? 'top-14 left-3' : 'top-3 left-3'
          } z-[1000] flex items-center space-x-2 bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-xl border border-emerald-500/50 text-xs animate-in fade-in duration-200`}
        >
          <div className="flex items-center space-x-1.5">
            <span className="text-base animate-pulse">🚑</span>
            <span className="font-extrabold text-emerald-400">Unit #PR-408</span>
          </div>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] text-slate-200 font-medium truncate max-w-[180px] sm:max-w-xs">
            {dispatchPhase === 'en_route_patient' && 'En Route to Patient'}
            {dispatchPhase === 'arrived_patient' && 'On-Scene Stabilization'}
            {dispatchPhase === 'transit_hospital' && `ER Transit → ${dispatchedHospital.Hospital_Name}`}
            {dispatchPhase === 'admitted_complete' && 'Emergency Intake Complete'}
          </span>
        </div>
      )}

      {/* Map Legend Strip */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-700 text-[11px] flex items-center space-x-3 text-slate-600 dark:text-slate-300">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>High Match (85+)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span>Good Match (60-84)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Lower Match (&lt;60)</span>
        </div>
      </div>
    </div>
  );
};
