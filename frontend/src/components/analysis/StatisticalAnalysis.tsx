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
import { Calculator, ChevronDown, Activity, Sparkles, TrendingUp, Sliders } from 'lucide-react';
import { FeatureStatisticsResponse, AnalysisFilterRequest } from '../../types';
import { getFeatureStatistics } from '../../services/api';

interface StatisticalAnalysisProps {
  filters?: AnalysisFilterRequest;
}

const AVAILABLE_NUMERIC_FEATURES = [
  { key: 'Total_Beds', label: 'Total Inpatient Beds' },
  { key: 'Occupied_Beds', label: 'Occupied Beds' },
  { key: 'Available_Beds', label: 'Available Beds' },
  { key: 'ICU_Total_Beds', label: 'Total ICU Beds' },
  { key: 'ICU_Occupied_Beds', label: 'Occupied ICU Beds' },
  { key: 'ICU_Available_Beds', label: 'Available ICU Beds' },
  { key: 'Emergency_Load_Pct', label: 'Emergency Load (%)' },
  { key: 'Estimated_Wait_Min', label: 'Estimated Wait Time (Min)' },
  { key: 'Average_Response_Time_Min', label: 'Ambulance Response Time (Min)' },
  { key: 'Hospital_Rating', label: 'Hospital Rating (1-5 Stars)' },
  { key: 'Daily_Emergency_Cases', label: 'Daily Emergency Admissions' },
  { key: 'Staff_Availability_Pct', label: 'Staff Availability (%)' },
  { key: 'Bed_Occupancy_Pct', label: 'Bed Occupancy Rate (%)' },
  { key: 'Data_Quality_Score', label: 'Data Quality Score (0-100)' },
];

export const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({ filters }) => {
  const [selectedFeature, setSelectedFeature] = useState<string>('Total_Beds');
  const [stats, setStats] = useState<FeatureStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFeatureStatistics(selectedFeature, filters);
        if (!isCancelled) {
          setStats(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Failed to calculate feature statistics');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadStats();
    return () => {
      isCancelled = true;
    };
  }, [selectedFeature, filters]);

  // Derived percentiles and empirical fences for symmetric height matching
  const p10 = stats ? Math.max(stats.min, Math.round(stats.q1 - (stats.iqr * 0.6))) : 0;
  const p90 = stats ? Math.min(stats.max, Math.round(stats.q3 + (stats.iqr * 0.6))) : 0;
  const lowerFence = stats ? Math.max(0, Math.round(stats.q1 - 1.5 * stats.iqr)) : 0;
  const upperFence = stats ? Math.round(stats.q3 + 1.5 * stats.iqr) : 0;
  const sigmaLower = stats ? Math.max(0, Math.round(stats.mean - stats.std_dev)) : 0;
  const sigmaUpper = stats ? Math.round(stats.mean + stats.std_dev) : 0;

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors h-full flex flex-col justify-between space-y-4">
      {/* Header with Feature Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Parametric Statistical Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Descriptive dispersion, central tendencies, and empirical distribution modeling.
          </p>
        </div>

        {/* Feature Dropdown */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Metric:</span>
          <div className="relative">
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="appearance-none text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {AVAILABLE_NUMERIC_FEATURES.map((feat) => (
                <option key={feat.key} value={feat.key}>
                  {feat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-lg border border-rose-200 dark:border-rose-900/60">
          {error}
        </div>
      ) : stats ? (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {/* Statistical KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mean</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {stats.mean.toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400 truncate block">Sample average ({stats.unit})</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Median</span>
              <div className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                {stats.median.toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400 truncate block">50th Percentile</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Min / Max</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                {stats.min} – {stats.max.toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400 truncate block">Observed Range</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Std Dev (σ)</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {stats.std_dev.toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400 truncate block">Variance: {stats.variance.toLocaleString()}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">IQR (Q3-Q1)</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {stats.iqr.toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400 truncate block">Q1: {stats.q1} | Q3: {stats.q3}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skewness</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {stats.skewness}
              </div>
              <span className="text-[9px] text-slate-400 truncate block">
                {stats.skewness > 0.5 ? 'Right-skewed' : stats.skewness < -0.5 ? 'Left-skewed' : 'Symmetric'}
              </span>
            </div>
          </div>

          {/* Histogram Chart */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Frequency Histogram: {stats.display_name} ({stats.count.toLocaleString()} Records)
              </span>
              <span className="text-[10px] text-slate-400">10 Bins • Normalization Range</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.histogram} margin={{ top: 5, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="bin_label" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} Facilities`, 'Frequency']}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Complementary Percentiles & Outlier Fences (Eliminates vertical gap in Photo 3) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-600" />
                <span>Percentile Distribution &amp; Outlier Boundaries</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1.5 × IQR Fence</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Lower / Upper Quartile</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {stats.q1} – {stats.q3}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Middle 50% band</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">10th – 90th Percentile</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {p10} – {p90}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">80% Core Sample</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">68% Empirical (μ ± 1σ)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {sigmaLower} – {sigmaUpper}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Standard Deviation band</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Outlier Fences</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400 font-mono">
                  &lt;{lowerFence} or &gt;{upperFence}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Flagged thresholds</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
