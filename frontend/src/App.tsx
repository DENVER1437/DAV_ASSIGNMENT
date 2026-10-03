import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EmergencyFinderStepper } from './components/EmergencyFinderStepper';
import { ResultsView } from './components/ResultsView';
import { HospitalDrawer } from './components/HospitalDrawer';
import { HospitalCompareModal } from './components/HospitalCompareModal';
import { DispatchModal, PatientDispatchInfo } from './components/DispatchModal';
import { DataManagementView } from './components/DataManagementView';
import { searchHospitals, getDatasetStatus, loadDemoDataset } from './services/api';
import { Hospital, HospitalSearchRequest, HospitalSearchResponse, DatasetStatus } from './types';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'finder' | 'results' | 'database'>('finder');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('careroute_theme') === 'dark' || localStorage.getItem('pulseroute_theme') === 'dark';
  });

  // Database status state
  const [isDatabaseReady, setIsDatabaseReady] = useState<boolean>(false);
  const [totalHospitals, setTotalHospitals] = useState<number>(0);
  const [databaseStatus, setDatabaseStatus] = useState<DatasetStatus | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);

  // User location state
  const [detectedLocality, setDetectedLocality] = useState<string | null>(null);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Search & Results state
  const [searchResponse, setSearchResponse] = useState<HospitalSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchRequest, setCurrentSearchRequest] = useState<HospitalSearchRequest | null>(null);

  // Selected hospital for details drawer
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Dispatched hospital state (active ambulance tracking & pre-allocation)
  const [dispatchedHospital, setDispatchedHospital] = useState<Hospital | null>(null);
  const [patientDispatchInfo, setPatientDispatchInfo] = useState<PatientDispatchInfo | null>(null);
  const [modalHospital, setModalHospital] = useState<Hospital | null>(null);

  // Compared hospitals (up to 3)
  const [comparedHospitals, setComparedHospitals] = useState<Hospital[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Sync dark mode class and color-scheme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('careroute_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('careroute_theme', 'light');
    }
  }, [darkMode]);

  // Check database status on mount
  const refreshDatabaseStatus = async () => {
    try {
      const st = await getDatasetStatus();
      setDatabaseStatus(st);
      const ready = Boolean(st.is_processed && st.valid_records > 0);
      setIsDatabaseReady(ready);
      if (ready) {
        setTotalHospitals(st.valid_records);
      } else {
        setTotalHospitals(0);
      }
    } catch (err) {
      console.warn('Could not check database status on mount:', err);
    }
  };

  useEffect(() => {
    refreshDatabaseStatus();
  }, []);

  // Fast load demo dataset handler
  const handleLoadDemoDataset = async () => {
    try {
      setIsDemoLoading(true);
      await loadDemoDataset();
      await refreshDatabaseStatus();
    } catch (err: any) {
      console.error('Failed to load demo dataset:', err);
      alert(err.message || 'Failed to load demo dataset');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Execute multi-step search
  const executeSearch = async (request: HospitalSearchRequest) => {
    setIsSearching(true);
    setCurrentSearchRequest(request);

    try {
      const response = await searchHospitals(request);
      setSearchResponse(response);
      setCurrentTab('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Search failed:', err);
      alert(err.message || 'Hospital search failed. Please verify your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // Modify / refine active search
  const handleModifyFilters = (updatedFilters: Partial<HospitalSearchRequest>) => {
    const baseReq: HospitalSearchRequest = currentSearchRequest || {
      emergency_type: 'General Emergency',
      latitude: activeCoords?.lat || 23.084,
      longitude: activeCoords?.lon || 72.549,
      city: !activeCoords ? (detectedLocality?.split(',')[0].trim() || 'Ahmedabad') : undefined,
      radius_km: 10,
      required_facilities: [],
      priorities: { distance: 30, bed_availability: 25, icu_availability: 25, waiting_time: 20 },
      page: 1,
      page_size: 25,
      sort_by: 'suitability',
    };
    const newReq: HospitalSearchRequest = {
      ...baseReq,
      ...updatedFilters,
    };
    executeSearch(newReq);
  };

  // Compare toggle
  const handleToggleCompare = (hospital: Hospital) => {
    setComparedHospitals((prev) => {
      const exists = prev.some((h) => h.Hospital_ID === hospital.Hospital_ID);
      if (exists) {
        return prev.filter((h) => h.Hospital_ID !== hospital.Hospital_ID);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 hospitals simultaneously.');
        return prev;
      }
      return [...prev, hospital];
    });
  };

  const handleRemoveCompared = (id: string) => {
    setComparedHospitals((prev) => prev.filter((h) => h.Hospital_ID !== id));
  };

  // Select and dispatch handler: prompts caller name & mobile number validation modal!
  const handleSelectAndDispatch = (hospital: Hospital) => {
    setModalHospital(hospital);
  };

  const handleConfirmDispatch = (info: PatientDispatchInfo) => {
    if (modalHospital) {
      setDispatchedHospital(modalHospital);
      setPatientDispatchInfo(info);
      setModalHospital(null);
      // Smooth scroll to top of results to view active tracking hub
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelDispatch = () => {
    setDispatchedHospital(null);
    setPatientDispatchInfo(null);
  };

  // Guard: if currentTab is results but no search has been executed, stay on finder
  useEffect(() => {
    if (currentTab === 'results' && !searchResponse) {
      setCurrentTab('finder');
    }
  }, [currentTab, searchResponse]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans flex flex-col">
      
      {/* Top Navbar with Working Dark/Light Mode */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        detectedLocality={detectedLocality}
        onDetectLocation={() => {
          setCurrentTab('finder');
          setTimeout(() => {
            const el = document.getElementById('finder-form');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        isDatabaseReady={isDatabaseReady}
        hasSearchResults={Boolean(searchResponse)}
        searchResultCount={searchResponse?.total_matches}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Areas */}
      <main className="flex-1 w-full pb-8">
        {/* ================= TAB 1: FIND HOSPITAL (LANDING + STEPPER) ================= */}
        {currentTab === 'finder' && (
          <div className="space-y-6">
            {/* Landing Hero */}
            <Hero
              onStartSearch={() => {
                const el = document.getElementById('finder-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onGoToDatabase={() => {
                setCurrentTab('database');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isDatabaseReady={isDatabaseReady}
              totalHospitals={totalHospitals}
              onLoadDemoDataset={handleLoadDemoDataset}
              isDemoLoading={isDemoLoading}
              detectedLocality={detectedLocality}
              onDetectLocation={() => {
                const el = document.getElementById('finder-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Progressive Clean Emergency Finder Form */}
            <EmergencyFinderStepper
              onSearch={executeSearch}
              isSearching={isSearching}
              isDatabaseReady={isDatabaseReady}
              isDemoLoading={isDemoLoading}
              onGoToDatabase={() => {
                setCurrentTab('database');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLoadDemoDataset={handleLoadDemoDataset}
              detectedLocality={detectedLocality}
              setDetectedLocality={setDetectedLocality}
              activeCoords={activeCoords}
              setActiveCoords={setActiveCoords}
            />
          </div>
        )}

        {/* ================= TAB 2: HOSPITALS / RESULTS VIEW ================= */}
        {currentTab === 'results' && (
          <div>
            {/* Results Context Banner */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-[1500px] mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('finder')}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                    title="Back to search parameters"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        Emergency Hospital Network
                      </span>
                      {detectedLocality && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          • {detectedLocality}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentSearchRequest?.emergency_type || 'General Emergency'} • {currentSearchRequest?.radius_km || 10} km search perimeter
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('finder')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    Modify Search
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentSearchRequest) executeSearch(currentSearchRequest);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                    title="Refresh results"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Operations Workspace */}
            <div id="results-section">
              <ResultsView
                searchResponse={searchResponse}
                isLoading={isSearching}
                onModifySearch={() => {
                  setCurrentTab('finder');
                  setTimeout(() => {
                    const el = document.getElementById('finder-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                onFilterChange={handleModifyFilters}
                onSelectHospital={(h) => setSelectedHospital(h)}
                selectedHospitalId={selectedHospital?.Hospital_ID || null}
                onOpenCompare={() => setIsCompareOpen(true)}
                comparedHospitalIds={comparedHospitals.map((h) => h.Hospital_ID)}
                onToggleCompare={handleToggleCompare}
                dispatchedHospital={dispatchedHospital}
                patientDispatchInfo={patientDispatchInfo}
                onSelectAndDispatch={handleSelectAndDispatch}
                onCancelDispatch={handleCancelDispatch}
                isDatabaseReady={isDatabaseReady}
                onLoadDemoDataset={handleLoadDemoDataset}
                onGoToDatabase={() => setCurrentTab('database')}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 3: DATABASE CONSOLE ================= */}
        {currentTab === 'database' && (
          <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DataManagementView
              onOpenFinder={() => {
                setCurrentTab('finder');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDatabaseReadyChange={(ready) => {
                setIsDatabaseReady(ready);
                if (ready) {
                  refreshDatabaseStatus();
                } else {
                  setTotalHospitals(0);
                  setSearchResponse(null);
                  setDatabaseStatus(null);
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Hospital Details Slide-over Drawer */}
      <HospitalDrawer
        hospital={selectedHospital}
        onClose={() => setSelectedHospital(null)}
        onShowOnMap={() => {
          setSelectedHospital(null);
          setCurrentTab('results');
          const el = document.getElementById('results-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectAndDispatch={handleSelectAndDispatch}
        isSelected={dispatchedHospital?.Hospital_ID === selectedHospital?.Hospital_ID}
      />

      {/* Patient Name & Mobile Validation Dispatch Modal */}
      {modalHospital && (
        <DispatchModal
          hospital={modalHospital}
          detectedLocality={detectedLocality}
          onConfirm={handleConfirmDispatch}
          onClose={() => setModalHospital(null)}
        />
      )}

      {/* Hospital Comparison Modal */}
      {isCompareOpen && (
        <HospitalCompareModal
          hospitals={comparedHospitals}
          onClose={() => setIsCompareOpen(false)}
          onRemoveHospital={handleRemoveCompared}
          onSelectHospital={(h) => {
            setSelectedHospital(h);
            setIsCompareOpen(false);
          }}
        />
      )}

      {/* Very small, subtle inline notice at the absolute bottom (No large footer) */}
      <div className="py-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
        Demo data is synthetic and for project demonstration only
      </div>

    </div>
  );
}
