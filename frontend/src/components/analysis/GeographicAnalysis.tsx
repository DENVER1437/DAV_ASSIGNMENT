import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Globe2, Map, Grid, Info, X } from 'lucide-react';
import { AnalysisResponse } from '../../types';

interface GeographicAnalysisProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
}

export const GeographicAnalysis: React.FC<GeographicAnalysisProps> = ({ analysis, isLoading }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [viewMode, setViewMode] = useState<'map' | 'cluster'>('map');
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);

  // Initialize Leaflet map instance safely
  const initMap = useCallback(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    try {
      // Centered around India coordinates
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
      });

      // 100% Free OpenStreetMap Standard Tiles (No API key, zero watermarks, global high availability)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Ensure crisp render after layout settlements
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 350);
      setTimeout(() => map.invalidateSize(), 700);
    } catch (err) {
      console.error('Leaflet map initialization error:', err);
    }
  }, []);

  // Initialize or invalidate map when container is available or analysis loads
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      initMap();
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, [initMap, isLoading, analysis]);

  // ResizeObserver guarantees map size stays synchronized even on window/tab changes
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Cleanup Leaflet instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update Markers and invalidate size when analysis changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !analysis) return;

    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    map.invalidateSize();

    const points = analysis.map_sample_points || [];
    if (points.length === 0) return;

    const latLngs: L.LatLngExpression[] = [];

    points.forEach((pt) => {
      if (!pt.lat || !pt.lon) return;

      const latLng: [number, number] = [pt.lat, pt.lon];
      latLngs.push(latLng);

      const color =
        pt.capacity_level === 'Critical'
          ? '#ef4444'
          : pt.capacity_level === 'Moderate'
          ? '#f59e0b'
          : '#10b981';

      const circle = L.circleMarker(latLng, {
        radius: 6,
        fillColor: color,
        fillOpacity: 0.85,
        color: '#ffffff',
        weight: 1.5,
      });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <div style="font-weight: 700; font-size: 12px; color: #0f172a; margin-bottom: 2px;">${pt.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${pt.city}, ${pt.state || ''}</div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 5px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <div><strong>Avail Beds:</strong> ${pt.available_beds}</div>
            <div><strong>ICU Avail:</strong> <span style="font-weight:700; color:${pt.icu_available === 0 ? '#ef4444' : '#10b981'};">${pt.icu_available}</span></div>
            <div><strong>Total Beds:</strong> ${pt.total_beds}</div>
            <div><strong>Rating:</strong> ⭐ ${pt.rating}</div>
          </div>
          <div style="margin-top: 6px; font-size: 10px; font-weight: 700; color: ${color};">
            Surge Status: ${pt.capacity_level} Load
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      circle.on('click', () => {
        setSelectedPoint(pt);
      });

      circle.addTo(layerGroup);
    });

    if (latLngs.length > 0) {
      try {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [analysis]);

  // When switching view modes, invalidate size cleanly
  const handleToggleView = (mode: 'map' | 'cluster') => {
    setViewMode(mode);
    if (mode === 'map') {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  };

  const state_distribution = analysis?.state_distribution || [];
  const city_distribution = analysis?.city_distribution || [];
  const map_sample_points = analysis?.map_sample_points || [];

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors h-full flex flex-col justify-between space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Geospatial Cluster Distribution &amp; Regional Inventory
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geographic positioning of facilities with verified coordinates and state healthcare density.
          </p>
        </div>

        {/* View Mode Toggle + Legend */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
            <button
              type="button"
              onClick={() => handleToggleView('map')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Map className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleView('cluster')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition ${
                viewMode === 'cluster'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Clusters</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[10px] text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>&gt;25% Surge</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>10–25% Moderate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>&lt;10% Critical / 0 ICU</span>
            </span>
          </div>
        </div>
      </div>

      {/* Map / Cluster View + State Table Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left: Map or Cluster Density (7 cols) */}
        <div className="lg:col-span-7 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800/60 min-h-[380px] flex flex-col">
          {/* Map Container: always kept mounted in DOM to prevent Leaflet detachment */}
          <div className={`relative w-full h-full min-h-[380px] flex-1 ${viewMode === 'map' ? 'block' : 'hidden'}`}>
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 rounded-xl" />
            <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
              {map_sample_points.length} Coordinates Rendered
            </div>

            {/* Selected point popup card */}
            {selectedPoint && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs z-10 bg-white dark:bg-slate-900 border border-teal-500/50 rounded-xl p-3 shadow-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {selectedPoint.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPoint(null)}
                    className="text-slate-400 hover:text-slate-600 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedPoint.city}, {selectedPoint.state}
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <div>Avail Beds: <strong className="text-emerald-600">{selectedPoint.available_beds}</strong></div>
                  <div>ICU Avail: <strong className={selectedPoint.icu_available === 0 ? 'text-rose-600' : 'text-teal-600'}>{selectedPoint.icu_available}</strong></div>
                  <div>Total Beds: <strong>{selectedPoint.total_beds}</strong></div>
                  <div>Rating: ⭐ <strong>{selectedPoint.rating}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Cluster View Container */}
          <div className={`p-3 overflow-y-auto max-h-[380px] space-y-2 ${viewMode === 'cluster' ? 'block' : 'hidden'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Active Metropolitan Clusters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {city_distribution.slice(0, 10).map((c) => (
                <div
                  key={c.city}
                  className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>{c.city}</span>
                    <span className="text-teal-600 dark:text-teal-400 font-mono">{c.count} Hospitals</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Beds: {c.total_beds.toLocaleString()}</span>
                    <span className="text-emerald-600 font-semibold">{c.available_beds.toLocaleString()} Avail</span>
                    <span className={c.icu_available === 0 ? 'text-rose-600 font-semibold' : 'text-teal-600 font-semibold'}>
                      {c.icu_available} ICU
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: State Distribution Summary Table (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                State Regional Inventory
              </span>
              <span className="text-[10px] text-slate-400">Total &amp; Available Beds</span>
            </div>

            <div className="overflow-y-auto max-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 font-medium">
                    <th className="py-1.5">State</th>
                    <th className="py-1.5 text-right">Facilities</th>
                    <th className="py-1.5 text-right">Total Beds</th>
                    <th className="py-1.5 text-right">Avail Beds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {state_distribution.map((st) => (
                    <tr key={st.state} className="hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition">
                      <td className="py-2 font-medium text-slate-800 dark:text-slate-200">
                        {st.state}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                        {st.count.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                        {st.total_beds.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {st.available_beds.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400">
            Coordinates validated against Indian boundary polygons [8°N–37°N, 68°E–97°E].
          </div>
        </div>
      </div>
    </section>
  );
};
