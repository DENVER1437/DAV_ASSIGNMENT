import React, { useState } from 'react';
import {
  Workflow,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Layers,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PreprocessingStageDetail } from '../../types';

interface PreprocessingAnalysisProps {
  stages: PreprocessingStageDetail[];
  isLoading: boolean;
}

export const PreprocessingAnalysis: React.FC<PreprocessingAnalysisProps> = ({
  stages,
  isLoading,
}) => {
  const [expandedStageId, setExpandedStageId] = useState<number | null>(4); // Default expand missing value handling

  if (isLoading || stages.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 animate-pulse space-y-4">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-48" />
        <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs transition-colors space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Workflow className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Data Preprocessing & Transformation Pipeline
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic 8-stage ETL sequence transforming raw unverified telemetry into SQLite relational persistence with mathematical consistency.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" />
            <span>8/8 Stages Completed</span>
          </span>
        </div>
      </div>

      {/* Visual Preprocessing Flow Stepper (Horizontal on desktop, stack on mobile) */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[780px] justify-between gap-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
          {stages.map((stage, idx) => {
            const isExpanded = expandedStageId === stage.id;
            return (
              <React.Fragment key={stage.id}>
                <button
                  type="button"
                  onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                  className={`flex-1 text-left px-2.5 py-2 rounded-md transition-all cursor-pointer ${
                    isExpanded
                      ? 'bg-teal-600 text-white shadow-xs font-semibold'
                      : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-0.5 opacity-80">
                    <span>STAGE {stage.id}</span>
                    <span className="font-mono text-[9px]">{stage.duration_ms}ms</span>
                  </div>
                  <div className="text-[11px] font-bold truncate">
                    {stage.flow_step}
                  </div>
                  <div className="text-[10px] opacity-75 truncate">
                    {stage.badge}
                  </div>
                </button>
                {idx < stages.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stage Details Cards */}
      <div className="space-y-3">
        {stages.map((stage) => {
          const isExpanded = expandedStageId === stage.id;
          return (
            <div
              key={stage.id}
              className={`border rounded-lg transition-all ${
                isExpanded
                  ? 'border-teal-300 dark:border-teal-700 bg-teal-50/20 dark:bg-teal-950/10 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Collapsed Header Bar */}
              <button
                type="button"
                onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isExpanded
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {stage.id}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {stage.stage_name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {stage.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xl">
                      {stage.headline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{stage.duration_ms} ms</span>
                  </div>
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Completed</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3.5">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {stage.explanation}
                  </p>

                  {/* Flow Numbers: Before -> Affected -> After */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Records Before</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {stage.records_before.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Records Affected</div>
                      <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        {stage.records_affected.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Records After</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {stage.records_after.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Execution Speed</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {stage.duration_ms} ms
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {stage.metrics.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="bg-slate-100/70 dark:bg-slate-800/50 rounded p-2 text-xs flex flex-col justify-between"
                      >
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{m.label}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Algorithm & Transformation Sample */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-100/80 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Mathematical / Algorithmic Engine
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                        {stage.algorithm}
                      </p>
                    </div>

                    <div className="bg-slate-100/80 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Record Sample Transformation
                      </span>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono truncate">
                        <strong className="text-slate-500 font-sans">Before:</strong> {stage.sample_before}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                        <strong className="text-slate-500 font-sans">After:</strong> {stage.sample_after}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
