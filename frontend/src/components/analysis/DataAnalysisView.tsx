import React, { useState, useEffect, useCallback } from 'react';
import { AnalysisHeader } from './AnalysisHeader';
import { PreprocessingWorkspace } from './PreprocessingWorkspace';
import { AnalysisWorkspace } from './AnalysisWorkspace';
import { VisualizationWorkspace } from './VisualizationWorkspace';
import {
  getAnalysisOverview,
  getPreprocessingFlow,
  getFilteredAnalysis,
  loadDemoDataset,
} from '../../services/api';
import {
  DatasetOverviewStats,
  PreprocessingStageDetail,
  AnalysisResponse,
  AnalysisFilterRequest,
} from '../../types';
import {
  Workflow,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  Database,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface DataAnalysisViewProps {
  onGoToDatabase?: () => void;
}

export const DataAnalysisView: React.FC<DataAnalysisViewProps> = ({ onGoToDatabase }) => {
  // Step Navigation: 'preprocessing' | 'analysis' | 'visualization'
  const [activeStep, setActiveStep] = useState<'preprocessing' | 'analysis' | 'visualization'>('preprocessing');

  // Real backend analytics state
  const [overview, setOverview] = useState<DatasetOverviewStats | null>(null);
  const [stages, setStages] = useState<PreprocessingStageDetail[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  // Global filters
  const [filters, setFilters] = useState<AnalysisFilterRequest>({
    state: 'All',
    city: 'All',
    hospital_category: 'All',
    hospital_care_type: 'All',
    emergency_services: 'All',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial analytics state
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [overviewData, stagesData, analysisData] = await Promise.all([
        getAnalysisOverview(),
        getPreprocessingFlow(),
        getFilteredAnalysis(filters),
      ]);
      setOverview(overviewData);
      setStages(stagesData);
      setAnalysis(analysisData);
    } catch (err: any) {
      console.error('Failed to load analysis dashboard data:', err);
      setError(err.message || 'Unable to connect to analytics services.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle global filter changes
  const handleFilterChange = async (updated: Partial<AnalysisFilterRequest>) => {
    const newFilters = { ...filters, ...updated };
    setFilters(newFilters);

    try {
      setIsFiltering(true);
      const updatedAnalysis = await getFilteredAnalysis(newFilters);
      setAnalysis(updatedAnalysis);
    } catch (err) {
      console.error('Filter execution failed:', err);
    } finally {
      setIsFiltering(false);
    }
  };

  // Reset global filters
  const handleResetFilters = async () => {
    const defaultFilters: AnalysisFilterRequest = {
      state: 'All',
      city: 'All',
      hospital_category: 'All',
      hospital_care_type: 'All',
      emergency_services: 'All',
      has_icu: undefined,
      min_beds: undefined,
      max_beds: undefined,
    };
    setFilters(defaultFilters);

    try {
      setIsFiltering(true);
      const updatedAnalysis = await getFilteredAnalysis(defaultFilters);
      setAnalysis(updatedAnalysis);
    } catch (err) {
      console.error('Reset filters failed:', err);
    } finally {
      setIsFiltering(false);
    }
  };

  // Fast load demo dataset directly from empty state
  const handleLoadDemo = async () => {
    try {
      setIsDemoLoading(true);
      await loadDemoDataset();
      await loadInitialData();
    } catch (err: any) {
      console.error('Failed to load demo dataset:', err);
      alert(err.message || 'Failed to load demo dataset');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const isDatasetReady = Boolean(overview && overview.total_records > 0);

  // Connection Error State
  if (error && !analysis && !isDatasetReady) {
    return (
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Unable to load analysis data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={loadInitialData}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ================= 1. PAGE HEADER (SECTION 4) ================= */}
      <AnalysisHeader
        overview={overview}
        isLoading={isLoading}
        onRefresh={loadInitialData}
      />

      {/* ================= EMPTY STATE IF NO DATASET LOADED ================= */}
      {!isDatasetReady && !isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              No Dataset Loaded for Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Please load the 10,000-facility demo dataset or upload your own CSV in the Database tab to activate preprocessing, analytics, and visualization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleLoadDemo}
              disabled={isDemoLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isDemoLoading ? 'Loading Dataset...' : 'Load 10,000 Demo Hospitals'}</span>
            </button>

            {onGoToDatabase && (
              <button
                type="button"
                onClick={onGoToDatabase}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Go to Database Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. MODERN STEP NAVIGATION (SECTION 3 & 23) ================= */}
      {isDatasetReady && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Step 1: Preprocessing */}
              <button
                type="button"
                onClick={() => setActiveStep('preprocessing')}
                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer select-none text-left ${
                  activeStep === 'preprocessing'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      activeStep === 'preprocessing'
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
                    }`}
                  >
                    01
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      01 Preprocessing
                    </span>
                    <span
                      className={`text-[10px] block truncate ${
                        activeStep === 'preprocessing' ? 'text-teal-100' : 'text-slate-400'
                      }`}
                    >
                      Pipeline &amp; 6 Stages
                    </span>
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      activeStep === 'preprocessing'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    Passed
                  </span>
                </div>
              </button>

              {/* Step 2: Data Analysis */}
              <button
                type="button"
                onClick={() => setActiveStep('analysis')}
                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer select-none text-left ${
                  activeStep === 'analysis'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      activeStep === 'analysis'
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
                    }`}
                  >
                    02
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      02 Data Analysis
                    </span>
                    <span
                      className={`text-[10px] block truncate ${
                        activeStep === 'analysis' ? 'text-teal-100' : 'text-slate-400'
                      }`}
                    >
                      Stats, Capacity &amp; Heatmap
                    </span>
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      activeStep === 'analysis'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {activeStep === 'analysis' ? 'Active' : 'Ready'}
                  </span>
                </div>
              </button>

              {/* Step 3: Visualization */}
              <button
                type="button"
                onClick={() => setActiveStep('visualization')}
                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer select-none text-left ${
                  activeStep === 'visualization'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      activeStep === 'visualization'
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
                    }`}
                  >
                    03
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      03 Visualization
                    </span>
                    <span
                      className={`text-[10px] block truncate ${
                        activeStep === 'visualization' ? 'text-teal-100' : 'text-slate-400'
                      }`}
                    >
                      Dynamic &amp; Gallery Charts
                    </span>
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      activeStep === 'visualization'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {activeStep === 'visualization' ? 'Active' : 'Ready'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* ================= 3. EXCLUSIVE WORKSPACE RENDERING (NO ENDLESS SCROLL!) ================= */}
          <div className="transition-all duration-200">
            {/* WORKSPACE 01: PREPROCESSING */}
            {activeStep === 'preprocessing' && (
              <div className="animate-in fade-in duration-200">
                <PreprocessingWorkspace
                  overview={overview}
                  stages={stages}
                  onPipelineReplayed={loadInitialData}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* WORKSPACE 02: DATA ANALYSIS */}
            {activeStep === 'analysis' && (
              <div className="animate-in fade-in duration-200">
                <AnalysisWorkspace
                  overview={overview}
                  analysis={analysis}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  isLoading={isLoading}
                  isFiltering={isFiltering}
                />
              </div>
            )}

            {/* WORKSPACE 03: DATA VISUALIZATION */}
            {activeStep === 'visualization' && (
              <div className="animate-in fade-in duration-200">
                <VisualizationWorkspace
                  analysis={analysis}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  isLoading={isLoading || isFiltering}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
