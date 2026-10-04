import React from 'react';
import { RefreshCw, CheckCircle2, Database, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { DatasetOverviewStats } from '../../types';

interface AnalysisHeaderProps {
  overview: DatasetOverviewStats | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  overview,
  isLoading,
  onRefresh,
}) => {
  const isReady = overview && overview.total_records > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Standard Header per prompt requirement */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              DATA ANALYSIS
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isReady ? 'Real Dataset Telemetry' : 'Uninitialized'}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Dataset Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Prepare, analyze and explore the hospital dataset.
          </p>
        </div>

        {/* Right: Dataset Status Info + Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-auto self-start">
          {isReady ? (
            <>
              {/* Record Count Badge (Real data) */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {overview.total_records.toLocaleString()} Records
                </span>
              </div>

              {/* Attributes Count Badge (Real data) */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {overview.total_features} Attributes
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Processed / Ready</span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-medium text-amber-700 dark:text-amber-300">
              <span>No Dataset Loaded</span>
            </div>
          )}

          {/* Refresh Analysis Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || !isReady}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Recalculate analytics directly from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
