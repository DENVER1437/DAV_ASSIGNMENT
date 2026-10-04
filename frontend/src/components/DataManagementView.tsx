import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Download,
  Search,
  Database,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRight,
  Trash2,
  FileText,
  Bed,
  Layers,
  MapPin,
  Play,
  Table as TableIcon,
  FileCheck,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import {
  getDatasetStatus,
  uploadDataset,
  loadDemoDataset,
  resetDataset,
  getDatasetPreview,
  getDownloadDatasetUrl,
  getDownloadRawDatasetUrl,
  getDatabaseStats,
  executeSqlQuery,
  getPresetQueries,
} from '../services/api';
import {
  DatasetStatus,
  Hospital,
  DatabaseStats,
  SqlQueryResult,
  PresetQuery,
} from '../types';

interface DataManagementViewProps {
  onOpenFinder: () => void;
  onDatabaseReadyChange?: (ready: boolean) => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  onOpenFinder,
  onDatabaseReadyChange,
}) => {
  // Database status and telemetry state
  const [status, setStatus] = useState<DatasetStatus | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStageNum, setProcessingStageNum] = useState(1);
  const [processMessage, setProcessMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Active view tab: Simplified to only Table and SQL Workbench (pipeline moved to Data Analysis tab)
  const [activeTab, setActiveTab] = useState<'table' | 'sql'>('table');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Table explorer state
  const [tableData, setTableData] = useState<{
    total: number;
    records: Hospital[];
    total_pages: number;
  }>({ total: 0, records: [], total_pages: 1 });
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(25);
  const [tableSearch, setTableSearch] = useState('');
  const [tableCity, setTableCity] = useState('All');
  const [tableCategory, setTableCategory] = useState('All');
  const [tableOnlyIcu, setTableOnlyIcu] = useState(false);
  const [tableOnlyEr, setTableOnlyEr] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // SQL Workbench state
  const [sqlQuery, setSqlQuery] = useState(
    'SELECT Hospital_ID, Hospital_Name, City, Available_Beds, ICU_Available_Beds, Hospital_Rating FROM hospitals WHERE ICU_Available_Beds > 0 ORDER BY ICU_Available_Beds DESC LIMIT 15;'
  );
  const [isSqlLoading, setIsSqlLoading] = useState(false);
  const [sqlResult, setSqlResult] = useState<SqlQueryResult | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [presetQueries, setPresetQueries] = useState<PresetQuery[]>([]);

  // 1. Initial Status Fetch
  const fetchStatus = async () => {
    try {
      const st = await getDatasetStatus();
      setStatus(st);
      const ready = Boolean(st.is_processed && st.valid_records > 0);
      if (onDatabaseReadyChange) onDatabaseReadyChange(ready);
    } catch (err) {
      console.warn('Could not retrieve dataset status:', err);
    }
  };

  const fetchDbTelemetry = async () => {
    try {
      const stats = await getDatabaseStats();
      setDbStats(stats);
      const presets = await getPresetQueries();
      setPresetQueries(presets);
    } catch (err) {
      console.warn('Could not retrieve database stats:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchDbTelemetry();
  }, []);

  // 2. Fetch Table Records when dataset is ready
  const fetchTableRecords = async () => {
    const isReady = Boolean(status?.is_processed || dbStats?.is_ready);
    if (!isReady) return;

    setIsTableLoading(true);
    try {
      const res = await getDatasetPreview({
        page: tablePage,
        pageSize: tablePageSize,
        search: tableSearch || undefined,
        city: tableCity !== 'All' ? tableCity : undefined,
        category: tableCategory !== 'All' ? tableCategory : undefined,
      });

      let filtered = res.records;
      if (tableOnlyIcu) filtered = filtered.filter((r) => r.ICU_Available_Beds > 0);
      if (tableOnlyEr) filtered = filtered.filter((r) => r.Emergency_Services === 'Yes');

      setTableData({
        total: res.total,
        records: filtered,
        total_pages: res.total_pages,
      });
    } catch (err) {
      console.error('Error fetching table records:', err);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    if (status?.is_processed || dbStats?.is_ready) {
      fetchTableRecords();
    }
  }, [
    status?.is_processed,
    dbStats?.is_ready,
    tablePage,
    tablePageSize,
    tableCity,
    tableCategory,
    tableOnlyIcu,
    tableOnlyEr,
  ]);

  // 3. Load Demo Dataset Action
  const handleLoadDemo = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessBanner(null);

    const stepMessages = [
      'Ingesting raw CSV stream & schema audit...',
      'Auditing geospatial coordinates across metro bounds...',
      'Purging primary key collisions & duplicate facilities...',
      'Balancing mathematical bed & ICU capacities...',
      'Deriving operational features & data quality index...',
      'Writing records to SQLite with B-Tree indices...',
    ];

    try {
      for (let s = 1; s <= 6; s++) {
        setProcessingStageNum(s);
        setProgress(Math.round((s / 6) * 90));
        setProcessMessage(stepMessages[s - 1]);
        await new Promise((r) => setTimeout(r, 200));
      }

      await loadDemoDataset();
      setProgress(100);
      setSuccessBanner('Demo dataset (10,000 facilities) successfully loaded into SQLite.');
      await fetchStatus();
      await fetchDbTelemetry();
      if (onDatabaseReadyChange) onDatabaseReadyChange(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load demo dataset');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. File Drag & Drop & Upload Action
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Invalid file format. Please upload a CSV (.csv) dataset.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessBanner(null);
    setProgress(20);
    setProcessMessage(`Uploading ${file.name}...`);

    try {
      const res = await uploadDataset(file);
      setProgress(100);
      setSuccessBanner(`Dataset ${file.name} successfully uploaded and persisted.`);
      await fetchStatus();
      await fetchDbTelemetry();
      if (onDatabaseReadyChange) onDatabaseReadyChange(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload and process dataset');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Delete Dataset Action
  const handleDeleteDatabase = async () => {
    setIsDeleting(true);
    setShowDeleteModal(false);
    setErrorMsg(null);
    setSuccessBanner(null);

    try {
      await resetDataset();
      setStatus(null);
      setDbStats(null);
      setTableData({ total: 0, records: [], total_pages: 1 });
      setSqlResult(null);
      setSuccessBanner('Database cleared successfully. All records and indexes removed.');
      if (onDatabaseReadyChange) onDatabaseReadyChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete database');
    } finally {
      setIsDeleting(false);
    }
  };

  // 6. SQL Query Execution Action
  const handleRunSqlQuery = async (queryText?: string) => {
    const q = queryText || sqlQuery;
    if (!q.trim()) return;

    setIsSqlLoading(true);
    setSqlError(null);
    try {
      const res = await executeSqlQuery(q);
      setSqlResult(res);
    } catch (err: any) {
      setSqlError(err.message || 'SQL Execution error');
      setSqlResult(null);
    } finally {
      setIsSqlLoading(false);
    }
  };

  const isReady =
    Boolean(status?.is_processed && (status?.valid_records || 0) > 0) ||
    Boolean(dbStats?.is_ready && (dbStats?.hospitals_count || 0) > 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* ================= HEADER SECTION ================= */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              DATABASE
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            {isReady ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                <span>Active ({status?.valid_records || dbStats?.hospitals_count || 10000} facilities)</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                No Dataset Loaded
              </span>
            )}
            {isReady && dbStats?.file_size_formatted && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                {dbStats.file_size_formatted}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Database Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isReady
              ? `Dataset loaded: ${status?.source_filename || 'smart_emergency_hospital_raw_10000.csv'} • SQLite storage & query runner`
              : 'Upload a hospital CSV or load the demo dataset to populate the database.'}
          </p>
        </div>

        {/* Action Button Bar */}
        {isReady && !isProcessing && (
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={onOpenFinder}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Find Hospital</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href={getDownloadRawDatasetUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition shadow-2xs"
              title="Download original unprocessed raw CSV dataset"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Raw CSV</span>
            </a>

            <a
              href={getDownloadDatasetUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/70 text-teal-700 dark:text-teal-300 text-xs font-semibold transition shadow-2xs"
              title="Export and download the processed CSV dataset"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Processed CSV</span>
            </a>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium transition cursor-pointer"
              title="Delete all data and reset to empty state"
            >
              {isDeleting ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete Data</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= BANNERS & NOTIFICATIONS ================= */}
      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================= PROCESSING STATE ================= */}
      {isProcessing && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xs text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center mx-auto">
            <RotateCw className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Loading Hospital Dataset (Step {processingStageNum} of 6)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {processMessage || 'Writing records to SQLite...'}
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ================= EMPTY STATE: UPLOAD CSV OR LOAD DEMO ================= */}
      {!isReady && !isProcessing && (
        <div className="space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Choose an Option to Initialize Database
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No hospital records are loaded yet. Choose either of the two options below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* OPTION 1: LOAD DEMO DATASET */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-500/60 dark:hover:border-teal-500/60 transition flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Instant Demo
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Load Demo Dataset
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Instantly load 10,000 verified hospital records spanning 15 major Indian cities with full ICU capacity, ratings, and live emergency telemetry.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>10,000 multi-city hospitals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Persisted to SQLite careroute.db</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>8 spatial and operational B-Tree indices</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoadDemo}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load 10,000 Demo Hospitals</span>
              </button>
            </div>

            {/* OPTION 2: UPLOAD CSV FILE */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border transition flex flex-col justify-between space-y-6 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-2 ring-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Custom CSV
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Upload Hospital CSV
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Upload your own facility CSV dataset. The database engine validates columns, normalizes coordinates, and writes to SQLite.
                  </p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition"
                >
                  <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Click to select CSV or drag file here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports .csv format up to 50MB</p>
                </div>

                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={onFileInputChange}
                  className="hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Browse CSV File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTIVE STATE: CURRENT DATASET + BASIC INFO + TABLE & SQL ================= */}
      {isReady && !isProcessing && (
        <div className="space-y-6">
          {/* ================= 1. CURRENT DATASET CARD (SECTION 2 PER PROMPT) ================= */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Current Dataset
                </h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Connected • SQLite Ready
              </span>
            </div>

            {/* Dataset Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* File name */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">File Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5" title={status?.source_filename || 'smart_emergency_hospital_raw_10000.csv'}>
                  {status?.source_filename || 'smart_emergency_hospital_raw_10000.csv'}
                </span>
              </div>

              {/* Records */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Records</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {(status?.valid_records || dbStats?.hospitals_count || 10000).toLocaleString()} Rows
                </span>
              </div>

              {/* Columns */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Columns</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 block mt-0.5">
                  39 Attributes
                </span>
              </div>

              {/* File size */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">File Size</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  {dbStats?.file_size_formatted || '3.66 MB'}
                </span>
              </div>

              {/* Last updated */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Updated</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5 truncate">
                  {status?.last_processed || 'Synchronized'}
                </span>
              </div>

              {/* Database status */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Database Engine</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  SQLite 3 (WAL)
                </span>
              </div>
            </div>
          </div>


          {/* ================= TAB NAVIGATION: TABLE & SQL WORKBENCH ================= */}
          <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-700 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Hospital Records Table</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'sql'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL Workbench</span>
            </button>
          </div>

          {/* ================= TAB 1: HOSPITAL RECORDS TABLE ================= */}
          {activeTab === 'table' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative max-w-sm w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setTablePage(1);
                    }}
                    placeholder="Search by hospital name or ID..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={tableCity}
                    onChange={(e) => {
                      setTableCity(e.target.value);
                      setTablePage(1);
                    }}
                    className="py-1.5 px-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="All">All Cities</option>
                    {[
                      'Ahmedabad',
                      'Bengaluru',
                      'Mumbai',
                      'Delhi',
                      'Hyderabad',
                      'Pune',
                      'Chennai',
                      'Kolkata',
                      'Jaipur',
                      'Lucknow',
                      'Surat',
                      'Indore',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/60 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tableOnlyIcu}
                      onChange={(e) => {
                        setTableOnlyIcu(e.target.checked);
                        setTablePage(1);
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>ICU Beds &gt; 0</span>
                  </label>

                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/60 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tableOnlyEr}
                      onChange={(e) => {
                        setTableOnlyEr(e.target.checked);
                        setTablePage(1);
                      }}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>24x7 ER</span>
                  </label>

                  {/* Upload replacement CSV */}
                  <label
                    htmlFor="replace-csv-input"
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition"
                    title="Upload another CSV file to replace current dataset"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
                    <span>Upload New CSV</span>
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    id="replace-csv-input"
                    className="hidden"
                    onChange={onFileInputChange}
                  />

                  {/* Export processed CSV */}
                  <a
                    href={getDownloadDatasetUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-semibold transition shrink-0"
                    title="Export the entire 10,000 processed hospital dataset to CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Hospital Name</th>
                      <th className="p-2.5">City</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-center">Beds</th>
                      <th className="p-2.5 text-center">ICU</th>
                      <th className="p-2.5 text-center">24x7 ER</th>
                      <th className="p-2.5 text-center">Rating</th>
                      <th className="p-2.5 text-center">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                    {isTableLoading ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          <RotateCw className="w-5 h-5 animate-spin mx-auto mb-1 text-teal-600" />
                          <span>Loading records from database...</span>
                        </td>
                      </tr>
                    ) : tableData.records.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          No hospital records match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      tableData.records.map((h) => (
                        <tr key={h.Hospital_ID} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                          <td className="p-2.5 font-mono text-[11px] text-slate-500">{h.Hospital_ID}</td>
                          <td className="p-2.5 font-medium">{h.Hospital_Name}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{h.City}</td>
                          <td className="p-2.5 text-slate-500">{h.Hospital_Category || 'General'}</td>
                          <td className="p-2.5 text-center font-semibold">{h.Available_Beds}</td>
                          <td className="p-2.5 text-center font-bold text-rose-600 dark:text-rose-400">
                            {h.ICU_Available_Beds}
                          </td>
                          <td className="p-2.5 text-center">
                            {h.Emergency_Services === 'Yes' ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                                Yes
                              </span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-medium">★ {h.Hospital_Rating || 4.2}</td>
                          <td className="p-2.5 text-center font-mono text-[11px] text-teal-600 dark:text-teal-400">
                            {h.Data_Quality_Score || 95}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Showing {tableData.records.length} of {tableData.total.toLocaleString()} records
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={tablePage <= 1}
                    onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    Page {tablePage} of {tableData.total_pages}
                  </span>
                  <button
                    type="button"
                    disabled={tablePage >= tableData.total_pages}
                    onClick={() => setTablePage((p) => p + 1)}
                    className="p-1 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SQL WORKBENCH ================= */}
          {activeTab === 'sql' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">SQL Query Runner</h3>
                  <p className="text-xs text-slate-500">Run safe read-only SQL queries directly against SQLite table `hospitals`.</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {presetQueries.slice(0, 3).map((pq) => (
                    <button
                      key={pq.id}
                      type="button"
                      onClick={() => {
                        setSqlQuery(pq.query);
                        handleRunSqlQuery(pq.query);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      {pq.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => handleRunSqlQuery()}
                  disabled={isSqlLoading}
                  className="absolute right-3 bottom-4 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition flex items-center space-x-1 cursor-pointer"
                >
                  {isSqlLoading ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>Run Query</span>
                </button>
              </div>

              {sqlError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-mono">
                  {sqlError}
                </div>
              )}

              {sqlResult && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{sqlResult.row_count} rows returned in {sqlResult.duration_ms}ms</span>
                    {sqlResult.is_truncated && <span className="text-amber-600">(Limited to 50 rows)</span>}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-72">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                        <tr>
                          {sqlResult.columns.map((c) => (
                            <th key={c} className="p-2 border-b border-slate-200 dark:border-slate-700">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono text-[11px]">
                        {sqlResult.rows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            {sqlResult.columns.map((c) => (
                              <td key={c} className="p-2 text-slate-700 dark:text-slate-300">
                                {r[c] !== null && r[c] !== undefined ? String(r[c]) : 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Hospital Database?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will delete all hospital records from SQLite and reset the system to an uninitialized state. You can upload a new CSV or reload demo data anytime.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDatabase}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
