import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  HeartPulse,
  Brain,
  Baby,
  Activity,
  AlertCircle,
  Check,
  Loader2,
  Database,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  Compass,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HospitalSearchRequest } from '../types';
import { reverseGeocode } from '../services/api';

interface EmergencyFinderProps {
  onSearch: (request: HospitalSearchRequest) => Promise<void>;
  isSearching: boolean;
  isDatabaseReady: boolean;
  isDemoLoading?: boolean;
  onGoToDatabase: () => void;
  onLoadDemoDataset: () => Promise<void>;
  detectedLocality: string | null;
  setDetectedLocality: (loc: string) => void;
  activeCoords: { lat: number; lon: number } | null;
  setActiveCoords: (coords: { lat: number; lon: number } | null) => void;
}

const EMERGENCY_CATEGORIES = [
  {
    id: 'Cardiac Emergency',
    title: 'Cardiac Arrest / STEMI',
    tag: 'Code Red • Primary PCI',
    desc: 'Cath Lab, Interventional Cardiology, ECG',
    icon: HeartPulse,
    defaultFac: ['ICU', 'Cardiology', '24x7 Service'],
  },
  {
    id: 'Accident / Trauma',
    title: 'Accident / Severe Trauma',
    tag: 'Level-1 Trauma ER',
    desc: 'Resuscitation Bay, Ortho Trauma, Blood Bank',
    icon: AlertTriangle,
    defaultFac: ['Trauma Center', 'Ambulance'],
  },
  {
    id: 'Neurological Emergency',
    title: 'Neurological / Stroke',
    tag: 'Golden Hour • tPA',
    desc: 'CT Angio, Neuro-ICU, Thrombolysis',
    icon: Brain,
    defaultFac: ['ICU', 'Neurology'],
  },
  {
    id: 'Pediatric Emergency',
    title: 'Pediatric Critical',
    tag: 'PICU / Neonatal',
    desc: 'Pediatric ICU, Neonatal, Child ER',
    icon: Baby,
    defaultFac: ['Pediatrics'],
  },
  {
    id: 'General Emergency',
    title: 'General Urgent Care',
    tag: 'Urgent Care 24x7',
    desc: 'Multi-specialty ER, Sepsis, Severe Illness',
    icon: Activity,
    defaultFac: ['Emergency Department'],
  },
];

const FACILITY_CHIPS = [
  'ICU',
  'Trauma Center',
  'Ambulance',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  '24x7 Service',
];

const PRESET_LOCALITIES = [
  { name: 'Gota, Ahmedabad', lat: 23.084, lon: 72.549, city: 'Ahmedabad' },
  { name: 'Indiranagar, Bengaluru', lat: 12.978, lon: 77.640, city: 'Bengaluru' },
  { name: 'Andheri West, Mumbai', lat: 19.119, lon: 72.846, city: 'Mumbai' },
  { name: 'Connaught Place, Delhi', lat: 28.632, lon: 77.219, city: 'Delhi' },
  { name: 'Banjara Hills, Hyderabad', lat: 17.415, lon: 78.435, city: 'Hyderabad' },
  { name: 'Kothrud, Pune', lat: 18.507, lon: 73.807, city: 'Pune' },
];

const SEARCHING_STAGES = [
  'Searching emergency network...',
  'Analyzing distance & travel horizons...',
  'Checking real-time bed & ICU availability...',
  'Matching specialized clinical facilities...',
];

export const EmergencyFinderStepper: React.FC<EmergencyFinderProps> = ({
  onSearch,
  isSearching,
  isDatabaseReady,
  isDemoLoading = false,
  onGoToDatabase,
  onLoadDemoDataset,
  detectedLocality,
  setDetectedLocality,
  activeCoords,
  setActiveCoords,
}) => {
  // Stepper Stage (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'denied'>('idle');
  const [showManualInput, setShowManualInput] = useState(false);
  
  // Structured address state
  const [manualCity, setManualCity] = useState('Ahmedabad');
  const [manualLocality, setManualLocality] = useState('');
  const [manualPincode, setManualPincode] = useState('');
  const [manualLandmark, setManualLandmark] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);

  // Form State
  const [selectedEmergency, setSelectedEmergency] = useState('Cardiac Emergency');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['ICU', 'Cardiology']);
  const [radiusKm, setRadiusKm] = useState(10);
  const [priorityDistance, setPriorityDistance] = useState(30);
  const [priorityBeds, setPriorityBeds] = useState(25);
  const [priorityIcu, setPriorityIcu] = useState(25);
  const [priorityWait, setPriorityWait] = useState(20);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Cycling search loading message
  const [searchStageIdx, setSearchStageIdx] = useState(0);

  useEffect(() => {
    if (!isSearching) return;
    const interval = setInterval(() => {
      setSearchStageIdx((prev) => (prev + 1) % SEARCHING_STAGES.length);
    }, 450);
    return () => clearInterval(interval);
  }, [isSearching]);

  // Handle GPS detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }

    setGpsStatus('locating');
    setShowManualInput(false);
    setValidationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setActiveCoords({ lat: latitude, lon: longitude });
        setGpsStatus('success');

        try {
          const rev = await reverseGeocode(latitude, longitude);
          setDetectedLocality(rev.locality || `${rev.city} Area`);
          setManualCity(rev.city || 'Ahmedabad');
          setManualLocality(rev.locality || '');
        } catch {
          setDetectedLocality(`GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
        }
      },
      (err) => {
        console.warn('Geolocation denied or error:', err);
        setGpsStatus('denied');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectPresetLocality = (preset: typeof PRESET_LOCALITIES[0]) => {
    setActiveCoords({ lat: preset.lat, lon: preset.lon });
    setDetectedLocality(preset.name);
    setManualCity(preset.city);
    setManualLocality(preset.name.split(',')[0].trim());
    setGpsStatus('success');
    setShowManualInput(false);
    setValidationError(null);
    setAddressError(null);
  };

  const handleStructuredAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    const locality = manualLocality.trim();
    const city = manualCity.trim();
    const pincode = manualPincode.trim();
    const landmark = manualLandmark.trim();

    if (!locality) {
      setAddressError('Please enter a locality or area name (e.g. Gota, Indiranagar).');
      return;
    }

    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      setAddressError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    let formattedAddress = locality;
    if (landmark) formattedAddress += `, Near ${landmark}`;
    formattedAddress += `, ${city}`;
    if (pincode) formattedAddress += ` - ${pincode}`;

    setDetectedLocality(formattedAddress);
    setManualCity(city);

    const lowerCity = city.toLowerCase();
    const lowerLoc = locality.toLowerCase();
    const presetMatch = PRESET_LOCALITIES.find(
      (p) => p.name.toLowerCase().includes(lowerLoc) || p.city.toLowerCase() === lowerCity
    );

    if (presetMatch) {
      setActiveCoords({ lat: presetMatch.lat, lon: presetMatch.lon });
    } else {
      const cityMap: { [c: string]: { lat: number; lon: number } } = {
        ahmedabad: { lat: 23.084, lon: 72.549 },
        bengaluru: { lat: 12.978, lon: 77.640 },
        mumbai: { lat: 19.119, lon: 72.846 },
        delhi: { lat: 28.632, lon: 77.219 },
        hyderabad: { lat: 17.415, lon: 78.435 },
        pune: { lat: 18.507, lon: 73.807 },
        chennai: { lat: 13.0827, lon: 80.2707 },
        kolkata: { lat: 22.5726, lon: 88.3639 },
      };
      setActiveCoords(cityMap[lowerCity] || null);
    }

    setGpsStatus('success');
    setShowManualInput(false);
    setValidationError(null);
  };

  const handleSelectEmergency = (typeId: string) => {
    setSelectedEmergency(typeId);
    const cat = EMERGENCY_CATEGORIES.find((c) => c.id === typeId);
    if (cat) {
      setSelectedFacilities((prev) => Array.from(new Set([...prev, ...cat.defaultFac])));
    }
  };

  const handleToggleFacility = (chip: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(chip) ? prev.filter((f) => f !== chip) : [...prev, chip]
    );
  };

  const handleFindHospitals = () => {
    if (!isDatabaseReady) {
      setValidationError('Please upload or load the hospital database first.');
      return;
    }

    if (!detectedLocality && !activeCoords && !manualCity) {
      setValidationError('Please detect or enter an incident location before searching.');
      setCurrentStep(2);
      return;
    }

    setValidationError(null);

    onSearch({
      latitude: activeCoords?.lat,
      longitude: activeCoords?.lon,
      city: !activeCoords ? manualCity : undefined,
      radius_km: radiusKm,
      emergency_type: selectedEmergency,
      required_facilities: selectedFacilities,
      priorities: {
        distance: priorityDistance,
        bed_availability: priorityBeds,
        icu_availability: priorityIcu,
        waiting_time: priorityWait,
      },
      page: 1,
      page_size: 25,
      sort_by: 'suitability',
    });
  };

  // If Database NOT ready, display clean initialization prompt
  if (!isDatabaseReady) {
    return (
      <div id="finder-form" className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <span>Healthcare Network Initialization</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Activate Facility Database
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified hospital records are required to calculate clinical triage, bed balance, and spatial routing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Option 1: 10,000 multi-city benchmark */}
          <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-500/50 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  Recommended • Instant
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Load 10,000 Verified Hospitals
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ingests and indexes benchmark dataset spanning 15 Indian metropolitan zones with real-time bed balance and ICU readiness.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLoadDemoDataset}
              disabled={isDemoLoading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {isDemoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Benchmark Records...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Load 10,000 Facilities Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Option 2: Custom CSV */}
          <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upload Custom Healthcare CSV
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Provide custom registry dataset (.csv). Automatically audits schema, coordinates, and creates indexed SQLite tables.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoToDatabase}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Open Database Console</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const STEPS_NAV = [
    { num: 1, label: 'Emergency Type', short: 'Triage' },
    { num: 2, label: 'Location', short: 'Incident' },
    { num: 3, label: 'Required Facilities', short: 'Facilities' },
    { num: 4, label: 'Priority & Radius', short: 'Perimeter' },
    { num: 5, label: 'Review & Route', short: 'Confirm' },
  ];

  return (
    <div id="finder-form" className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      
      {/* ================= STEPPER PROGRESS BAR & NAVIGATION ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Step Tabs Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
            {STEPS_NAV.map((step) => {
              const isCurrent = currentStep === step.num;
              const isDone = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isCurrent
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 font-bold'
                      : isDone
                      ? 'text-emerald-700 dark:text-emerald-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-teal-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : `0${step.num}`}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.short}</span>
                </button>
              );
            })}
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              Step {currentStep} of 5
            </span>
          </div>
        </div>

        {/* Dynamic Progress Line */}
        <div className="h-0.5 bg-slate-100 dark:bg-slate-800 w-full">
          <motion.div
            className="h-full bg-teal-600 dark:bg-teal-500"
            initial={false}
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
        </div>

        {/* Stepper Body Container with Smooth Transition */}
        <div className="p-5 sm:p-7">
          <AnimatePresence mode="wait">
            
            {/* ================= STEP 01: EMERGENCY TYPE ================= */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">
                    Step 01 of 05
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Select Emergency Triage Category
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Identifies required clinical specialization, golden-hour window, and equipment readiness.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {EMERGENCY_CATEGORIES.map((cat) => {
                    const isSelected = selectedEmergency === cat.id;
                    const IconComp = cat.icon;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectEmergency(cat.id)}
                        className={`p-4 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between space-y-3 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                            }`}
                          >
                            {cat.tag}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {cat.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {cat.desc}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="flex items-center space-x-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 pt-1">
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                            <span>Selected for Clinical Triage</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ================= STEP 02: INCIDENT LOCATION ================= */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">
                    Step 02 of 05
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Incident Origin &amp; Patient Location
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Detect your live location or enter your neighborhood/pincode to calculate travel time.
                  </p>
                </div>

                {detectedLocality && !showManualInput ? (
                  <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {detectedLocality}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Location Set
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {activeCoords
                            ? `GPS Coordinates: ${activeCoords.lat.toFixed(4)}, ${activeCoords.lon.toFixed(4)}`
                            : `Metro Zone: ${manualCity}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={gpsStatus === 'locating'}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        {gpsStatus === 'locating' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5 text-teal-600" />
                        )}
                        <span>Re-detect GPS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManualInput(true)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        Edit Address
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={gpsStatus === 'locating'}
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                      >
                        {gpsStatus === 'locating' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Detecting coordinates...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Detect My Live Location</span>
                          </>
                        )}
                      </button>

                      <span className="text-xs text-slate-400">or enter details manually:</span>
                    </div>

                    <form onSubmit={handleStructuredAddressSubmit} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Metropolitan City *
                          </label>
                          <select
                            value={manualCity}
                            onChange={(e) => {
                              setManualCity(e.target.value);
                              setAddressError(null);
                            }}
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                          >
                            <option value="Ahmedabad">Ahmedabad (Gujarat)</option>
                            <option value="Bengaluru">Bengaluru (Karnataka)</option>
                            <option value="Mumbai">Mumbai (Maharashtra)</option>
                            <option value="Delhi">Delhi (NCR)</option>
                            <option value="Hyderabad">Hyderabad (Telangana)</option>
                            <option value="Pune">Pune (Maharashtra)</option>
                            <option value="Chennai">Chennai (Tamil Nadu)</option>
                            <option value="Kolkata">Kolkata (West Bengal)</option>
                            <option value="Jaipur">Jaipur (Rajasthan)</option>
                            <option value="Surat">Surat (Gujarat)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-5 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Locality / Area / Sector *
                          </label>
                          <input
                            type="text"
                            value={manualLocality}
                            onChange={(e) => {
                              setManualLocality(e.target.value);
                              setAddressError(null);
                            }}
                            placeholder="e.g. Gota, Indiranagar, Andheri West"
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            PIN Code (6 digits)
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={manualPincode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setManualPincode(val);
                              setAddressError(null);
                            }}
                            placeholder="e.g. 380060"
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        {detectedLocality && (
                          <button
                            type="button"
                            onClick={() => setShowManualInput(false)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          Confirm Address
                        </button>
                      </div>

                      {addressError && (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                          <span>{addressError}</span>
                        </div>
                      )}
                    </form>

                    {/* Preset corridor buttons */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Or select quick demo corridor:
                      </span>
                      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
                        {PRESET_LOCALITIES.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleSelectPresetLocality(p)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition shrink-0 font-medium flex items-center space-x-1.5 cursor-pointer ${
                              detectedLocality?.includes(p.name)
                                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-300 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <MapPin className="w-3 h-3 text-teal-600" />
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ================= STEP 03: REQUIRED FACILITIES ================= */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">
                    Step 03 of 05
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Required Clinical Capabilities &amp; Facilities
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Facilities pre-aligned with triage acuity. Toggle required departments for emergency intake.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {FACILITY_CHIPS.map((chip) => {
                    const isActive = selectedFacilities.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleFacility(chip)}
                        className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                          isActive
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span>{chip}</span>
                        {isActive ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ================= STEP 04: PRIORITY & PERIMETER ================= */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">
                    Step 04 of 05
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Search Radius &amp; Priority Weights
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure travel horizon bounds and suitability scoring balance.
                  </p>
                </div>

                {/* Radius Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Search Perimeter Bounds:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { r: 5, est: '~6-8 min', label: 'Immediate Radius' },
                      { r: 10, est: '~12-15 min', label: 'Standard Metro' },
                      { r: 20, est: '~22-28 min', label: 'Extended Metro' },
                      { r: 50, est: '~45-60 min', label: 'Regional Corridor' },
                    ].map(({ r, est, label }) => {
                      const isSelected = radiusKm === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRadiusKm(r)}
                          className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="text-sm sm:text-base font-extrabold leading-none">{r} km</div>
                          <div className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                            {est} • {label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Sliders */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                      <Sliders className="w-3.5 h-3.5 mr-1 text-teal-600" />
                      Suitability Scoring Priorities
                    </span>
                    <span className="text-[10px] text-slate-400">Heuristic weighting</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between font-medium">
                        <span>Distance Proximity</span>
                        <span className="font-bold">{priorityDistance}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={priorityDistance}
                        onChange={(e) => setPriorityDistance(Number(e.target.value))}
                        className="w-full accent-teal-600 mt-1 cursor-pointer"
                      />
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between font-medium">
                        <span>ICU &amp; Critical Beds</span>
                        <span className="font-bold">{priorityIcu}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={priorityIcu}
                        onChange={(e) => setPriorityIcu(Number(e.target.value))}
                        className="w-full accent-teal-600 mt-1 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 05: REVIEW & EXECUTE ================= */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">
                    Step 05 of 05
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Review Intake Summary &amp; Find Hospitals
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Confirm your emergency parameters to initiate real-time hospital dispatch and routing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Triage Acuity</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{selectedEmergency}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Incident Location</span>
                      <strong className="text-slate-900 dark:text-white font-bold truncate block">
                        {detectedLocality || manualCity}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Search Radius</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{radiusKm} km</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Facilities Filter</span>
                      <strong className="text-slate-900 dark:text-white font-bold">
                        {selectedFacilities.length > 0 ? selectedFacilities.join(', ') : 'All Emergency Facilities'}
                      </strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Validation Alert */}
          {validationError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Navigation Controls Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-xs transition transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFindHospitals}
                  disabled={isSearching}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{SEARCHING_STAGES[searchStageIdx]}</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4" />
                      <span>Find Hospitals</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
