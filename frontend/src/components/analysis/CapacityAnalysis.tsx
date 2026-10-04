import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Bed, AlertOctagon, CheckCircle2, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';
import { AnalysisResponse } from '../../types';

interface CapacityAnalysisProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
}

export const CapacityAnalysis: React.FC<CapacityAnalysisProps> = ({ analysis, isLoading }) => {
  if (isLoading || !analysis) {
    return (
      <div className="h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 animate-pulse" />
    );
  }

  const { kpi, occupancy_by_care_type, top_available_hospitals, top_critical_hospitals, emergency_capacity_levels } =
    analysis;

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Bed className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Bed Capacity & Occupancy Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time hospitalization load ratios, surge headroom thresholds, and facility diversion triage indices.
          </p>
        </div>
      </div>

      {/* KPI Cards: Ratios & Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Overall Occupancy Rate
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {kpi.occupancy_rate_pct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpi.occupied_beds.toLocaleString()} of {kpi.total_beds.toLocaleString()} Inpatient Beds
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Available Surge Margin
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {kpi.available_capacity_pct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpi.available_beds.toLocaleString()} Unoccupied Vacancies
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            ICU-to-Total-Bed Ratio
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {kpi.icu_to_total_beds_ratio_pct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpi.total_icu_beds.toLocaleString()} Total Critical Care Units
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3.5">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            ICU Occupancy Rate
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {kpi.icu_occupancy_pct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpi.available_icu_beds.toLocaleString()} ICU Beds Currently Vacant
          </div>
        </div>
      </div>

      {/* Middle Row: Occupancy by Care Type Bar Chart + Capacity Level Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart: Occupancy Rate by Care Type */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Bed Occupancy Rate by Care Tier
            </h3>
            <span className="text-[10px] text-slate-400">Mean Occupancy (%)</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancy_by_care_type} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="care_type" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Occupancy Rate']}
                />
                <Bar dataKey="occupancy_rate_pct" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capacity Stratification Progress Bars */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              Emergency Surge Stratification
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Distribution of facilities by remaining vacancy headroom
            </p>

            <div className="space-y-3">
              {emergency_capacity_levels.map((lvl) => {
                const color =
                  lvl.level === 'Critical'
                    ? 'bg-rose-500 text-rose-700 dark:text-rose-400'
                    : lvl.level === 'Moderate'
                    ? 'bg-amber-500 text-amber-700 dark:text-amber-400'
                    : 'bg-emerald-500 text-emerald-700 dark:text-emerald-400';

                return (
                  <div key={lvl.level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {lvl.level} Load{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({lvl.level === 'Critical' ? '<10% beds' : lvl.level === 'Moderate' ? '10-25% beds' : '>25% beds'})
                        </span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {lvl.count.toLocaleString()} ({lvl.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          lvl.level === 'Critical'
                            ? 'bg-rose-500'
                            : lvl.level === 'Moderate'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${lvl.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
            Emergency routing engine automatically diverts incoming EMS ambulances from facilities classified as Critical load.
          </div>
        </div>
      </div>

      {/* Facility Tables: Highest Surge Capacity vs Saturated Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Top 5 High Surge Facilities */}
        <div className="border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Top 5 High Surge Capacity Hospitals</span>
            </span>
            <span className="text-[10px] text-slate-400">Optimal Triage Targets</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-medium">
                  <th className="py-1">Hospital</th>
                  <th className="py-1">City</th>
                  <th className="py-1 text-right">Available Beds</th>
                  <th className="py-1 text-right">ICU Avail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {top_available_hospitals.map((h) => (
                  <tr key={h.id}>
                    <td className="py-1.5 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                      {h.name}
                    </td>
                    <td className="py-1.5 text-slate-500">{h.city}</td>
                    <td className="py-1.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {h.available_beds.toLocaleString()}
                    </td>
                    <td className="py-1.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {h.icu_available}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Critical Facilities */}
        <div className="border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Top 5 Saturated Facilities (&gt;100 Beds)</span>
            </span>
            <span className="text-[10px] text-slate-400">Diversion Candidates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-medium">
                  <th className="py-1">Hospital</th>
                  <th className="py-1">City</th>
                  <th className="py-1 text-right">Occupied / Total</th>
                  <th className="py-1 text-right">Occupancy %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {top_critical_hospitals.map((h) => (
                  <tr key={h.id}>
                    <td className="py-1.5 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                      {h.name}
                    </td>
                    <td className="py-1.5 text-slate-500">{h.city}</td>
                    <td className="py-1.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {h.occupied_beds} / {h.total_beds}
                    </td>
                    <td className="py-1.5 text-right font-bold text-rose-600 dark:text-rose-400 font-mono">
                      {h.occupancy_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
