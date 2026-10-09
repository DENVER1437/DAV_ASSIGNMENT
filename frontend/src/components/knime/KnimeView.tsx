import React, { useState } from 'react';
import { 
  Workflow, 
  Download, 
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  Cpu,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface KnimeViewProps {
  onNavigateTab?: (tab: 'analysis' | 'tableau' | 'knime' | 'finder') => void;
}

export const KnimeView: React.FC<KnimeViewProps> = ({ onNavigateTab: _onNavigateTab }) => {
  const knwfDownloadPath = '/assets/Healthcare_Emergency_Analytics.knwf';
  const workflowSvgPath = '/assets/workflow.svg?v=4';

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'clean' | 'feature' | 'ml' | 'view'>('all');
  const [expandedNodeId, setExpandedNodeId] = useState<number | null>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = knwfDownloadPath;
    link.download = 'Healthcare_Emergency_Analytics.knwf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // All 15 Nodes Explained in Small (concise, clear, all green executed)
  const allNodesSmall = [
    {
      id: 1,
      name: 'CSV Reader (#1)',
      category: 'clean',
      stage: 'Ingestion',
      dot: 'green',
      input: 'Local File System',
      output: '10,035 Records Table',
      desc: 'Reads raw hospital emergency records from smart_emergency_hospital_raw_10000.csv with automatic delimiter and schema detection.'
    },
    {
      id: 2,
      name: 'Duplicate Row Filter (#2)',
      category: 'clean',
      stage: 'Sanitization',
      dot: 'green',
      input: 'Raw CSV Table',
      output: 'Deduplicated Table',
      desc: 'Scans Hospital_ID and coordinate signatures to remove duplicate entries, ensuring clean downstream calculations.'
    },
    {
      id: 3,
      name: 'Missing Value (#3)',
      category: 'clean',
      stage: 'Sanitization',
      dot: 'green',
      input: 'Deduplicated Table',
      output: 'Imputed Table',
      desc: 'Imputes missing bed counts, coordinate centroids, and standardizes Yes/No categorical values.'
    },
    {
      id: 4,
      name: 'Column Filter (#4)',
      category: 'clean',
      stage: 'Pruning',
      dot: 'green',
      input: 'Imputed Table',
      output: '40 Filtered Columns',
      desc: 'Selects the 40 essential clinical, geographic, and operational telemetry columns, dropping unneeded raw headers.'
    },
    {
      id: 7,
      name: 'Math Formula (#7)',
      category: 'feature',
      stage: 'Feature Engineering',
      dot: 'green',
      input: '40 Columns Table',
      output: 'Engineered Ratios Table',
      desc: 'Computes Bed_Occupancy_Pct = (Occupied_Beds / Total_Beds) * 100 and ICU occupancy proportions across all facilities.'
    },
    {
      id: 14,
      name: 'Statistics View (#14)',
      category: 'view',
      stage: 'Profiling',
      dot: 'green',
      input: 'Engineered Table',
      output: 'Summary Stats View',
      desc: 'Generates mean, median, standard deviation, and quartile distributions for waiting times and occupancy levels.'
    },
    {
      id: 6,
      name: 'GroupBy (#6)',
      category: 'feature',
      stage: 'Aggregation',
      dot: 'green',
      input: 'Engineered Table',
      output: 'Grouped Summary',
      desc: 'Aggregates capacity metrics by State and Hospital Category to calculate regional bed totals and average load.'
    },
    {
      id: 11,
      name: 'Bar Chart (#11)',
      category: 'view',
      stage: 'Visualization',
      dot: 'green',
      input: 'Grouped Summary',
      output: 'Bar Chart View',
      desc: 'Renders category-wise comparative bar charts of bed capacities and emergency caseloads.'
    },
    {
      id: 15,
      name: 'Linear Correlation (#15)',
      category: 'feature',
      stage: 'Correlation',
      dot: 'green',
      input: 'Engineered Table',
      output: 'Correlation Matrix',
      desc: 'Calculates Pearson correlation coefficients between waiting time, response time, emergency load, and rating.'
    },
    {
      id: 5,
      name: 'Rule Engine (#5)',
      category: 'ml',
      stage: 'Triage Logic',
      dot: 'green',
      input: 'Engineered Table',
      output: 'Rule Classified Table',
      desc: 'Classifies facilities into Critical (>85% load), High (70–85%), and Moderate (<70%) emergency capacity tiers.'
    },
    {
      id: 8,
      name: 'Normalizer (#8)',
      category: 'ml',
      stage: 'Scaling',
      dot: 'green',
      input: 'Rule Classified Table',
      output: 'Normalized [0, 1] Table',
      desc: 'Applies Min-Max scaling to numerical attributes to equalize feature weightings prior to clustering.'
    },
    {
      id: 9,
      name: 'k-Means (#9)',
      category: 'ml',
      stage: 'Clustering',
      dot: 'green',
      input: 'Normalized Table',
      output: 'Clustered Dataset',
      desc: 'Unsupervised machine learning model partitioning hospitals into 4 operational emergency readiness cluster cohorts.'
    },
    {
      id: 10,
      name: 'Table View (#10)',
      category: 'view',
      stage: 'Evaluation',
      dot: 'green',
      input: 'Clustered Dataset',
      output: 'Interactive Table View',
      desc: 'Interactive visual data table verifying individual hospital records, assigned cluster IDs, and distances.'
    },
    {
      id: 12,
      name: 'Scatter Plot (#12)',
      category: 'view',
      stage: 'Evaluation',
      dot: 'green',
      input: 'Clustered Dataset',
      output: '2D Scatter Plot',
      desc: 'Plots Estimated Wait Min vs Emergency Load Pct color-coded by cluster to visually validate cluster boundaries.'
    },
    {
      id: 13,
      name: 'CSV Writer (#13)',
      category: 'clean',
      stage: 'Output Export',
      dot: 'green',
      input: 'Clustered Dataset',
      output: 'CSV File on Disk',
      desc: 'Writes the finalized smart_emergency_hospital_processed_clean.csv used directly by Tableau and the website.'
    }
  ];

  const filteredNodes = allNodesSmall.filter(n => {
    if (selectedFilter === 'all') return true;
    return n.category === selectedFilter;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 animate-in fade-in duration-200">
      
      {/* ================= COMPACT HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Workflow className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />
              KNIME Analytics Platform
            </span>
            <span className="text-xs text-slate-500 font-mono">Healthcare_Emergency_Analytics.knwf • 15 Nodes</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              All Nodes Green
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
            KNIME Analytics Workflow
          </h1>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0 cursor-pointer shadow-xs active:scale-98"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{downloadSuccess ? 'Downloaded .knwf!' : 'Download Workflow (.knwf)'}</span>
        </button>
      </div>

      {/* ================= PIPELINE METRICS SUMMARY BANNER ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-0.5">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Ingestion Volume</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">10,035 Records</div>
          <div className="text-[11px] text-slate-500">Raw Healthcare Telemetry</div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-0.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Connected Pipeline</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">15 Nodes</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fully Executed (Green)
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Engineered Features</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">40 Attributes</div>
          <div className="text-[11px] text-slate-500">Ratios & Capacity Scores</div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-0.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">ML Clustering</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">4 Clusters</div>
          <div className="text-[11px] text-slate-500">k-Means Triage Readiness</div>
        </div>
      </div>

      {/* ================= WORKFLOW DIAGRAM FLOW VIEWER (ALL GREEN DOTS) ================= */}
      <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Visual Pipeline Flow (15 Connected Nodes)
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              All Nodes Executed (Green)
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-semibold px-2 text-slate-600 dark:text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.0, Number((z + 0.2).toFixed(1))))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-5 bg-slate-100/50 dark:bg-slate-950/70">
          <div 
            className={`w-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center p-3 sm:p-5 transition-all ${
              isFullscreen 
                ? 'fixed inset-4 z-50 p-6 shadow-2xl bg-white dark:bg-slate-900 max-h-[92vh]' 
                : 'min-h-[280px] max-h-[420px]'
            }`}
          >
            <div 
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              className="transition-transform duration-150 inline-block"
            >
              <img
                src={workflowSvgPath}
                alt="KNIME Healthcare Analytics Pipeline Vector Diagram"
                className="max-w-none w-auto h-auto rounded select-none shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= ALL 15 NODES EXPLAINED ================= */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              All 15 Workflow Nodes Explained
            </h2>
            <p className="text-xs text-slate-500">
              Click any node for small input/output and parameter details.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All (15)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('clean')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedFilter === 'clean'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Cleaning & I/O (4)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('feature')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedFilter === 'feature'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Features & Math (3)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('ml')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedFilter === 'ml'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              ML & Rules (3)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('view')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedFilter === 'view'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Charts & Views (5)
            </button>
          </div>
        </div>

        {/* Small Node Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredNodes.map((node) => {
            const isExpanded = expandedNodeId === node.id;
            return (
              <div
                key={node.id}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isExpanded
                    ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                onClick={() => setExpandedNodeId(isExpanded ? null : node.id)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2 min-w-0 pr-1">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900/60"
                      title="Executed (Green Traffic Light)"
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {node.name}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {node.stage}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  {node.desc}
                </p>

                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1 text-slate-500">
                    <div className="flex justify-between">
                      <span>Input Port:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{node.input}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output Port:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{node.output}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
