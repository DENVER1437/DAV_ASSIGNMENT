import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SlidersHorizontal, ArrowUpDown, Award, AlertCircle, ChevronDown } from 'lucide-react';
import { CrossAnalysisResponse, AnalysisFilterRequest } from '../../types';
import { getCrossAnalysis } from '../../services/api';

interface CrossAnalysisProps {
  filters?: AnalysisFilterRequest;
}

const DIMENSIONS = [
  { key: 'City', label: 'Metropolitan City' },
  { key: 'State', label: 'State / Territory' },
  { key: 'Hospital_Category', label: 'Hospital Category' },
  { key: 'Hospital_Care_Type', label: 'Care Type' },
  { key: 'Hospital_Size', label: 'Facility Size' },
];

const METRICS = [
  { key: 'Total_Beds', label: 'Total Inpatient Beds' },
  { key: 'Available_Beds', label: 'Available Beds' },
  { key: 'ICU_Available_Beds', label: 'Available ICU Beds' },
  { key: 'Bed_Occupancy_Pct', label: 'Bed Occupancy Rate (%)' },
  { key: 'Hospital_Rating', label: 'Hospital Rating (Stars)' },
  { key: 'Average_Response_Time_Min', label: 'Response Time (Min)' },
  { key: 'Daily_Emergency_Cases', label: 'Daily Emergency Admissions' },
];

export const CrossAnalysis: React.FC<CrossAnalysisProps> = ({ filters }) => {
  const [dimension, setDimension] = useState<string>('Hospital_Category');
  const [metric, setMetric] = useState<string>('Total_Beds');
  const [aggregation, setAggregation] = useState<string>('mean');
  const [result, setResult] = useState<CrossAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rankingTab, setRankingTab] = useState<'top' | 'bottom'>('top');

  useEffect(() => {
    let isCancelled = false;
    const fetchCross = async () => {
      try {
        setIsLoading(true);
        const res = await getCrossAnalysis({
          dimension,
          metric,
          aggregation,
          filters,
        });
        if (!isCancelled) {
          setResult(res);
        }
      } catch (err) {
        console.error('Failed to load cross-dimensional analysis:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchCross();
    return () => {
      isCancelled = true;
    };
  }, [dimension, metric, aggregation, filters]);

  const metricLabel = METRICS.find((m) => m.key === metric)?.label || metric;

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors h-full flex flex-col justify-between space-y-4">
      {/* Header & Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Interactive Cross-Dimensional Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare clinical indicators dynamically across organizational, geographic, and facility dimensions.
          </p>
        </div>

        {/* Dynamic Controls: Dimension, Metric, Aggregation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dimension Selector */}
          <div>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {DIMENSIONS.map((d) => (
                <option key={d.key} value={d.key}>
                  By: {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {METRICS.map((m) => (
                <option key={m.key} value={m.key}>
                  Metric: {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation Selector */}
          <div>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="mean">Average (Mean)</option>
              <option value="sum">Aggregate (Sum)</option>
              <option value="count">Count of Facilities</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Dynamic Bar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {metricLabel} by {dimension.replace(/_/g, ' ')} ({aggregation.toUpperCase()})
              </span>
              <span className="text-[10px] text-slate-400">Dynamic Aggregation</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.data} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="dimension" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [Number(val).toLocaleString(), metricLabel]}
                  />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Top / Bottom Hospitals Ranking Table (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              {/* Ranking Tabs */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Facility Ranking by Metric
                </span>
                <div className="flex items-center space-x-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setRankingTab('top')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                      rankingTab === 'top'
                        ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Top 10
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingTab('bottom')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                      rankingTab === 'bottom'
                        ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Bottom 10
                  </button>
                </div>
              </div>

              {/* Ranking Table */}
              <div className="overflow-y-auto max-h-[220px]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-medium">
                      <th className="py-1">#</th>
                      <th className="py-1">Hospital</th>
                      <th className="py-1">City</th>
                      <th className="py-1 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(rankingTab === 'top' ? result.top_10 : result.bottom_10).map((h, i) => (
                      <tr key={h.id}>
                        <td className="py-1 font-mono text-slate-400 text-[10px]">{i + 1}</td>
                        <td className="py-1 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                          {h.name}
                        </td>
                        <td className="py-1 text-slate-500 text-[11px] truncate max-w-[70px]">{h.city}</td>
                        <td className="py-1 text-right font-bold text-teal-600 dark:text-teal-400 font-mono">
                          {h.value.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500">
              Sorted by {metricLabel} ({rankingTab === 'top' ? 'Descending' : 'Ascending'}).
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
