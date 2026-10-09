import React, { useState } from 'react';
import { 
  FileCode2, 
  LayoutDashboard, 
  Workflow, 
  Activity, 
  ArrowRight, 
  Layers, 
  Database, 
  CheckCircle2, 
  Info, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface AssignmentOverviewProps {
  onNavigateTab?: (tab: 'analysis' | 'tableau' | 'knime' | 'finder') => void;
  className?: string;
}

export const AssignmentOverview: React.FC<AssignmentOverviewProps> = ({ 
  onNavigateTab,
  className = '' 
}) => {
  const [activeComponent, setActiveComponent] = useState<'python' | 'tableau' | 'knime' | 'careroute'>('tableau');

  return (
    <section className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-slate-800/70">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
              <Sparkles className="w-3 h-3 mr-1 text-teal-600 dark:text-teal-400" />
              DAV Coursework Integration
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Data Analysis & Visualization
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            Comprehensive Healthcare Intelligence Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            This project unifies four essential analytical pillars to turn raw emergency healthcare data into actionable clinical intelligence and real-time emergency routing.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            4 Cohesive Pillars
          </span>
        </div>
      </div>

      {/* ================= ARCHITECTURE DIAGRAM ================= */}
      <div className="my-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Project Data Flow & Analytical Relationship
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Responsive Pipeline Diagram
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="min-w-[700px] flex items-center justify-between gap-3 text-xs">
            
            {/* Step 1: Raw Hospital Data */}
            <div className="flex-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-1.5 font-bold">
                <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Raw Hospital Data</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">10,035 Records</p>
              <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-900/50">
                Duplicates & Missing Values
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />

            {/* Step 2: KNIME Pipeline */}
            <div 
              onClick={() => setActiveComponent('knime')}
              className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs text-center ${
                activeComponent === 'knime'
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="w-7 h-7 mx-auto rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-1.5 font-bold">
                <Workflow className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-bold text-slate-900 dark:text-slate-100">KNIME Pipeline</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">15 Connected Nodes</p>
              <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/40 px-1.5 py-0.5 rounded font-medium">
                Rule Engine & k-Means
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />

            {/* Step 3: Cleaned Dataset */}
            <div className="flex-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/80 shadow-2xs text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Cleaned Dataset</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">40 Curated Features</p>
              <div className="mt-2 text-[10px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded font-semibold border border-teal-200 dark:border-teal-800">
                100% Valid Records
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />

            {/* Step 4: Tri-Pillar Output */}
            <div className="flex-[1.8] flex flex-col gap-2">
              {/* Python Analysis */}
              <div 
                onClick={() => setActiveComponent('python')}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                  activeComponent === 'python'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-1 ring-blue-400/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileCode2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Python Analytics (EDA)</span>
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Statistical Models</span>
              </div>

              {/* Tableau Visualization */}
              <div 
                onClick={() => setActiveComponent('tableau')}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                  activeComponent === 'tableau'
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-400/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Tableau Dashboards</span>
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">4 Dashboards & 6 KPIs</span>
              </div>

              {/* CareRoute Web Application */}
              <div 
                onClick={() => setActiveComponent('careroute')}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                  activeComponent === 'careroute'
                    ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 ring-1 ring-teal-400/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">CareRoute Web Platform</span>
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Live Hospital Matcher</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= 4 ARCHITECTURE CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Python Data Analysis */}
        <div 
          onClick={() => setActiveComponent('python')}
          className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeComponent === 'python'
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/80 shadow-xs ring-1 ring-blue-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                <FileCode2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                Core Analytics
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Python Data Analysis</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Implemented in Python FastAPI with Pandas & Scikit-learn. Handles missing-value imputation, feature engineering, multivariate correlations, statistical distributions, and interactive Recharts.
            </p>
            <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>3-stage pipeline telemetry</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Pearson correlation matrix</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Parametric & non-parametric tests</span>
              </li>
            </ul>
          </div>

          {onNavigateTab && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('analysis');
              }}
              className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
            >
              <span>Explore Python Analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Card 2: Tableau Visualization */}
        <div 
          onClick={() => setActiveComponent('tableau')}
          className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeComponent === 'tableau'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700/80 shadow-xs ring-1 ring-indigo-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                Executive BI
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Tableau Visualization</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Built in Tableau Desktop as <code className="text-indigo-600 dark:text-indigo-300 font-mono text-[11px]">Book3.twb</code>. Features 4 comprehensive dashboards and 19 worksheets communicating hospital capacity, response delays, and spatial risk.
            </p>
            <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>4 dashboards (1440×960 px)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>6 executive KPI scorecards</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Geographic & risk matrix views</span>
              </li>
            </ul>
          </div>

          {onNavigateTab && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('tableau');
              }}
              className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
            >
              <span>View Tableau Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Card 3: KNIME Analytics Workflow */}
        <div 
          onClick={() => setActiveComponent('knime')}
          className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeComponent === 'knime'
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 shadow-xs ring-1 ring-amber-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <Workflow className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                Data Pipeline
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">KNIME Analytics Workflow</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Constructed in KNIME Analytics Platform (<code className="text-amber-700 dark:text-amber-300 font-mono text-[11px]">.knwf</code>) with 15 nodes. Executes deterministic data sanitization, mathematical profiling, and unsupervised k-Means clustering.
            </p>
            <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>15 modular visual nodes</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Rule Engine & Normalizer</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>k-Means clustering evaluation</span>
              </li>
            </ul>
          </div>

          {onNavigateTab && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('knime');
              }}
              className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition"
            >
              <span>Inspect KNIME Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Card 4: CareRoute Clinical Web Application */}
        <div 
          onClick={() => setActiveComponent('careroute')}
          className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeComponent === 'careroute'
              ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700/80 shadow-xs ring-1 ring-teal-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                End-User App
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">CareRoute Application</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              A responsive healthcare application providing emergency triage, Haversine geospatial proximity routing, multi-criteria suitability scoring (0–100), and hospital comparison.
            </p>
            <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Real-time hospital matching</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Interactive Leaflet maps</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Active patient dispatch hub</span>
              </li>
            </ul>
          </div>

          {onNavigateTab && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab('finder');
              }}
              className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition"
            >
              <span>Launch Hospital Finder</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Integration Notice / Methodology Transparency */}
      <div className="mt-6 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">Analytical Independence & Synchronization Notice: </strong>
          Each component is tailored to its specific domain in the Data Analysis and Visualization curriculum. KNIME executes offline visual data pipelining, Tableau communicates executive business intelligence dashboards, Python provides backend data modeling, and CareRoute delivers the operational clinical interface. They share identical dataset definitions without requiring synchronized live database writes.
        </div>
      </div>
    </section>
  );
};
