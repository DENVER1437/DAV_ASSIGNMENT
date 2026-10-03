import React, { useState, useEffect } from 'react';
import {
  Filter,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  Map,
  List,
  Sparkles,
  MapPin,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hospital, HospitalSearchResponse, HospitalSearchRequest, DispatchPhase, SimulationSpeed } from '../types';
import { HospitalCard } from './HospitalCard';
import { HospitalMap } from './HospitalMap';
import { ActiveDispatchHub } from './ActiveDispatchHub';
import { PatientDispatchInfo } from './DispatchModal';
import { fetchRoadRoute } from '../services/routing';

interface ResultsViewProps {
  searchResponse: HospitalSearchResponse | null;
  isLoading: boolean;
  onModifySearch: () => void;
  onFilterChange: (filters: Partial<HospitalSearchRequest>) => void;
  onSelectHospital: (hospital: Hospital) => void;
  selectedHospitalId: string | null;
  onOpenCompare: () => void;
  comparedHospitalIds: string[];
  onToggleCompare: (hospital: Hospital) => void;
  dispatchedHospital?: Hospital | null;
  patientDispatchInfo?: PatientDispatchInfo | null;
  onSelectAndDispatch?: (hospital: Hospital) => void;
  onCancelDispatch?: () => void;
  isDatabaseReady?: boolean;
  onLoadDemoDataset?: () => Promise<void>;
  onGoToDatabase?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  searchResponse,
  isLoading,
  onModifySearch,
  onFilterChange,
  onSelectHospital,
  selectedHospitalId,
  onOpenCompare,
  comparedHospitalIds,
  onToggleCompare,
  dispatchedHospital,
  patientDispatchInfo,
  onSelectAndDispatch,
  onCancelDispatch,
  isDatabaseReady = true,
  onLoadDemoDataset,
  onGoToDatabase,
}) => {
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [hoveredHospitalId, setHoveredHospitalId] = useState<string | null>(null);

  // Quick filter states
  const [sortBy, setSortBy] = useState<'suitability' | 'distance' | 'wait_time' | 'available_beds'>('suitability');
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [onlyIcu, setOnlyIcu] = useState(false);
  const [onlyTrauma, setOnlyTrauma] = useState(false);
  const [onlyAmbulance, setOnlyAmbulance] = useState(false);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as any;
    setSortBy(val);
    onFilterChange({ sort_by: val });
  };

  const handleToggleIcu = () => {
    const next = !onlyIcu;
    setOnlyIcu(next);
    const facilities: string[] = [];
    if (next) facilities.push('ICU');
    if (onlyTrauma) facilities.push('Trauma Center');
    if (onlyAmbulance) facilities.push('Ambulance');
    onFilterChange({ required_facilities: facilities });
  };

  const handleToggleTrauma = () => {
    const next = !onlyTrauma;
    setOnlyTrauma(next);
    const facilities: string[] = [];
    if (onlyIcu) facilities.push('ICU');
    if (next) facilities.push('Trauma Center');
    if (onlyAmbulance) facilities.push('Ambulance');
    onFilterChange({ required_facilities: facilities });
  };

  const handleToggleAmbulance = () => {
    const next = !onlyAmbulance;
    setOnlyAmbulance(next);
    const facilities: string[] = [];
    if (onlyIcu) facilities.push('ICU');
    if (onlyTrauma) facilities.push('Trauma Center');
    if (next) facilities.push('Ambulance');
    onFilterChange({ required_facilities: facilities });
  };

  const hospitals = searchResponse?.results || [];
  const userLoc = searchResponse?.center_coordinates
    ? { lat: searchResponse.center_coordinates.lat, lon: searchResponse.center_coordinates.lon }
    : null;

  const activeFocusHospitalId = dispatchedHospital?.Hospital_ID || selectedHospitalId;

  // Real-time dispatch road simulation state
  const [dispatchPhase, setDispatchPhase] = useState<DispatchPhase>('en_route_patient');
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [simulationSpeed, setSimulationSpeed] = useState<SimulationSpeed>(5);
  const [roadRoute, setRoadRoute] = useState<[number, number][]>([]);
  const [ambulancePosition, setAmbulancePosition] = useState<[number, number] | null>(null);
  // totalPhaseSecs: total seconds budgeted for the current phase (used to derive timer from progress)
  const [totalPhaseSecs, setTotalPhaseSecs] = useState<number>(480);

  // Timer is always derived from progress so they stay in perfect sync
  const secondsRemaining = dispatchPhase === 'admitted_complete'
    ? 0
    : Math.round(totalPhaseSecs * Math.max(0, 1 - progressRatio));

  // Fetch real road route on dispatch
  useEffect(() => {
    if (!dispatchedHospital || !userLoc) {
      setRoadRoute([]);
      setAmbulancePosition(null);
      setDispatchPhase('en_route_patient');
      setProgressRatio(0);
      return;
    }

    const initialSecs = Math.max(180, (dispatchedHospital.Estimated_Wait_Min || 8) * 60);
    setTotalPhaseSecs(initialSecs);
    setDispatchPhase('en_route_patient');
    setProgressRatio(0);

    let isCancelled = false;
    fetchRoadRoute(
      dispatchedHospital.Latitude,
      dispatchedHospital.Longitude,
      userLoc.lat,
      userLoc.lon
    ).then((res) => {
      if (isCancelled) return;
      setRoadRoute(res.coordinates);
      if (res.coordinates.length > 0) {
        setAmbulancePosition(res.coordinates[0]);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [dispatchedHospital?.Hospital_ID, userLoc?.lat, userLoc?.lon]);

  // Real-time animation ticker — progress drives BOTH ambulance position AND timer
  useEffect(() => {
    if (!dispatchedHospital || roadRoute.length === 0) return;
    if (dispatchPhase === 'admitted_complete') return;

    const interval = setInterval(() => {
      const stepDelta = 0.00065 * simulationSpeed;

      if (dispatchPhase === 'en_route_patient') {
        setProgressRatio((prev) => {
          const next = prev + stepDelta;
          if (next >= 1) {
            setDispatchPhase('arrived_patient');
            setAmbulancePosition(roadRoute[roadRoute.length - 1] || null);
            return 1;
          }
          const idx = Math.min(
            roadRoute.length - 1,
            Math.floor(next * (roadRoute.length - 1))
          );
          setAmbulancePosition(roadRoute[idx] || null);
          return next;
        });
      } else if (dispatchPhase === 'transit_hospital') {
        setProgressRatio((prev) => {
          const next = prev + stepDelta;
          if (next >= 1) {
            setDispatchPhase('admitted_complete');
            setAmbulancePosition(roadRoute[0] || null);
            return 1;
          }
          const revIdx = Math.max(
            0,
            Math.floor((1 - next) * (roadRoute.length - 1))
          );
          setAmbulancePosition(roadRoute[revIdx] || null);
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [dispatchedHospital, roadRoute, dispatchPhase, simulationSpeed]);

  useEffect(() => {
    if (dispatchPhase !== 'arrived_patient') return;
    const dwellMs = Math.max(2000, 8000 / simulationSpeed);
    const timer = setTimeout(() => {
      const transitSecs = Math.max(120, Math.round(((dispatchedHospital?.Estimated_Wait_Min || 6) * 60) * 0.75));
      setTotalPhaseSecs(transitSecs);
      setDispatchPhase('transit_hospital');
      setProgressRatio(0);
    }, dwellMs);
    return () => clearTimeout(timer);
  }, [dispatchPhase, simulationSpeed, dispatchedHospital]);

  const handleAdvanceToTransit = () => {
    const transitSecs = Math.max(120, Math.round(((dispatchedHospital?.Estimated_Wait_Min || 6) * 60) * 0.75));
    setTotalPhaseSecs(transitSecs);
    setDispatchPhase('transit_hospital');
    setProgressRatio(0);
  };

  const handleCompleteAdmission = () => {
    setDispatchPhase('en_route_patient');
    setProgressRatio(0);
    setTotalPhaseSecs(480);
    setAmbulancePosition(null);
    setRoadRoute([]);
    if (onCancelDispatch) onCancelDispatch();
  };

  const locationName = searchResponse?.detected_location || 'Selected Area';

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      
      {/* ================= TOP SEARCH SUMMARY & CONTROLS ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-2xs border border-slate-200/90 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Emergency hospitals near {locationName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span><strong>{searchResponse?.total_matches || 0}</strong> hospitals found</span>
              <span>•</span>
              <span>Search radius: <strong>{searchResponse?.radius_km || 10} km</strong></span>
              <span>•</span>
              <span>Incident location: <strong>{locationName}</strong></span>
            </p>
          </div>

          {/* Action Controls & Mobile Switcher */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setMobileTab('list')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                  mobileTab === 'list'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List ({hospitals.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                  mobileTab === 'map'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="suitability">Sort: Suitability Score</option>
                <option value="distance">Sort: Distance (Closest)</option>
                <option value="wait_time">Sort: Shortest Wait Time</option>
                <option value="available_beds">Sort: Most Available Beds</option>
              </select>
            </div>

            {/* Modify Triage */}
            <button
              type="button"
              onClick={onModifySearch}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-teal-600" />
              <span>Modify</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Bar (Radius, Clinical Priorities, Rating) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Radius Selector */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Radius:</span>
            {[5, 10, 20, 50].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  if (hospitals.length === 0) {
                    setOnlyIcu(false);
                    setOnlyTrauma(false);
                    setOnlyAmbulance(false);
                    setMinRating(undefined);
                    onFilterChange({ radius_km: r, required_facilities: [], min_rating: undefined });
                  } else {
                    onFilterChange({ radius_km: r });
                  }
                }}
                className={`px-2 py-0.5 rounded-md font-semibold text-xs transition cursor-pointer ${
                  (searchResponse?.radius_km === r) || (!searchResponse && r === 10)
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Clinical Priority Checkboxes */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={onlyIcu}
                onChange={handleToggleIcu}
                className="rounded text-teal-600 focus:ring-teal-500 w-3 h-3 cursor-pointer"
              />
              <span className="font-medium text-[11px]">ICU Beds &gt; 0</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={onlyTrauma}
                onChange={handleToggleTrauma}
                className="rounded text-teal-600 focus:ring-teal-500 w-3 h-3 cursor-pointer"
              />
              <span className="font-medium text-[11px]">Trauma Center</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={onlyAmbulance}
                onChange={handleToggleAmbulance}
                className="rounded text-teal-600 focus:ring-teal-500 w-3 h-3 cursor-pointer"
              />
              <span className="font-medium text-[11px]">Ambulance</span>
            </label>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 text-[11px] font-medium mr-0.5">Rating:</span>
            {[0, 3.5, 4.0, 4.5].map((rt) => (
              <button
                key={rt}
                type="button"
                onClick={() => {
                  setMinRating(rt === 0 ? undefined : rt);
                  onFilterChange({ min_rating: rt === 0 ? undefined : rt });
                }}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                  minRating === rt || (rt === 0 && minRating === undefined)
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {rt === 0 ? 'All' : `${rt}★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ACTIVE DISPATCH TRACKING HUB ================= */}
      {dispatchedHospital && (
        <ActiveDispatchHub
          hospital={dispatchedHospital}
          emergencyType="Emergency Care"
          patientInfo={patientDispatchInfo}
          dispatchPhase={dispatchPhase}
          secondsRemaining={secondsRemaining}
          simulationSpeed={simulationSpeed}
          onChangeSpeed={(spd) => setSimulationSpeed(spd)}
          onAdvanceToTransit={handleAdvanceToTransit}
          onCompleteAdmission={handleCompleteAdmission}
          onCancelDispatch={handleCompleteAdmission}
          onFocusOnMap={() => {
            onSelectHospital(dispatchedHospital);
            setMobileTab('map');
          }}
          onOpenDetails={() => onSelectHospital(dispatchedHospital)}
          onChangeHospital={onModifySearch}
        />
      )}

      {/* ================= MAIN SPLIT-VIEW (DISPATCH CONSOLE) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT PANE: HOSPITAL RESULTS LIST */}
        <div className={`lg:col-span-7 xl:col-span-8 flex flex-col ${mobileTab === 'map' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Verified Emergency Facilities ({hospitals.length})</span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400">
              Live capacity &amp; proximity sorted
            </span>
          </div>

          {/* Cards Container with Scroll */}
          <div className="overflow-y-auto pr-1 pb-6 max-h-[calc(100vh-210px)] min-h-[500px] space-y-3">
            {isLoading ? (
              /* SKELETON LOADERS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 animate-pulse"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5 w-3/4">
                        <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </div>
                      <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isDatabaseReady ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Hospital Dataset Not Initialized
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    Initialize the dataset with 10,000 demo hospitals to start searching and routing.
                  </p>
                </div>
                {onLoadDemoDataset && (
                  <button
                    type="button"
                    onClick={onLoadDemoDataset}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load 10,000 Demo Hospitals</span>
                  </button>
                )}
              </div>
            ) : hospitals.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No hospitals matched within {searchResponse?.radius_km || 10} km
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Try expanding your search perimeter or adjusting facility criteria.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOnlyIcu(false);
                      setOnlyTrauma(false);
                      setOnlyAmbulance(false);
                      setMinRating(undefined);
                      onFilterChange({ radius_km: 20, required_facilities: [], min_rating: undefined });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Expand to 20 km
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOnlyIcu(false);
                      setOnlyTrauma(false);
                      setOnlyAmbulance(false);
                      setMinRating(undefined);
                      onFilterChange({ radius_km: 50, required_facilities: [], min_rating: undefined });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
                  >
                    Expand to 50 km
                  </button>
                  <button
                    type="button"
                    onClick={onModifySearch}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Modify Triage Criteria
                  </button>
                </div>
              </div>
            ) : (
              /* Staggered Hospital Card Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hospitals.map((hospital, idx) => (
                  <motion.div
                    key={hospital.Hospital_ID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(idx * 0.05, 0.4),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <HospitalCard
                      hospital={hospital}
                      isSelected={hospital.Hospital_ID === selectedHospitalId}
                      isDispatched={dispatchedHospital?.Hospital_ID === hospital.Hospital_ID}
                      hasActiveDispatch={Boolean(dispatchedHospital)}
                      isHovered={hospital.Hospital_ID === hoveredHospitalId}
                      isCompared={comparedHospitalIds.includes(hospital.Hospital_ID)}
                      onSelect={onSelectHospital}
                      onSelectAndDispatch={(h) => onSelectAndDispatch && onSelectAndDispatch(h)}
                      onShowOnMap={(h) => {
                        onSelectHospital(h);
                        setMobileTab('map');
                      }}
                      onToggleCompare={onToggleCompare}
                      onHover={(id) => setHoveredHospitalId(id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Pinned Interactive Leaflet Map */}
        <div className={`lg:col-span-5 xl:col-span-4 ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-18 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs">
            <HospitalMap
              userLocation={userLoc}
              hospitals={hospitals}
              selectedHospitalId={activeFocusHospitalId}
              dispatchedHospital={dispatchedHospital}
              hoveredHospitalId={hoveredHospitalId}
              roadRoute={roadRoute}
              ambulancePosition={ambulancePosition}
              dispatchPhase={dispatchPhase}
              onSelectHospital={onSelectHospital}
              heightClass="h-[500px] lg:h-[calc(100vh-210px)]"
            />
          </div>
        </div>

      </div>

      {/* Floating Compare Drawer Trigger (when 1-3 hospitals selected) */}
      {comparedHospitalIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white dark:bg-slate-800/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-3 animate-in slide-in-from-bottom duration-200">
          <span className="text-xs font-medium">
            {comparedHospitalIds.length} hospital{comparedHospitalIds.length > 1 ? 's' : ''} in comparison
          </span>
          <button
            type="button"
            onClick={onOpenCompare}
            className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Compare Now
          </button>
        </div>
      )}

    </div>
  );
};
