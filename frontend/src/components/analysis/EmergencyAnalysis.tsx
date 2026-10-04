import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Siren, Clock, Ambulance, HeartPulse, ShieldAlert, Activity } from 'lucide-react';
import { AnalysisResponse } from '../../types';

interface EmergencyAnalysisProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
}

export const EmergencyAnalysis: React.FC<EmergencyAnalysisProps> = ({ analysis, isLoading }) => {
  if (isLoading || !analysis) {
    return (
      <div className="h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 animate-pulse" />
    );
  }

  const { kpi, emergency_load_by_city, specialties_coverage } = analysis;

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Siren className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Emergency Readiness & Rapid Response Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational triage readiness, ambulance fleet availability, trauma facility coverage, and dispatch latency.
          </p>
        </div>
      </div>

      {/* Emergency KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>24x7 Emergency Coverage</span>
            <Clock className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {kpi.emergency_24x7_pct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpi.emergency_24x7_count.toLocaleString()} of {kpi.total_hospitals.toLocaleString()} Hospitals
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Ambulance Availability</span>
            <Ambulance className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {kpi.ambulance_pct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpi.ambulance_count.toLocaleString()} Active Ambulance Fleets
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Trauma Center Coverage</span>
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {kpi.trauma_centers_pct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpi.trauma_centers_count.toLocaleString()} Certified Trauma Centers
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Emergency Response Time</span>
            <Activity className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400 font-mono">
            {kpi.avg_response_time_min} min
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Avg Wait Time: {kpi.avg_wait_time_min} min
          </div>
        </div>
      </div>

      {/* Middle Row: Emergency Load by City Chart & Clinical Specialties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* City Emergency Load Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Average Emergency Room Load (%) by City
            </h3>
            <span className="text-[10px] text-slate-400">Top 10 Metros</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emergency_load_by_city.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="city" angle={-30} textAnchor="end" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Avg ER Load']}
                />
                <Bar dataKey="avg_load_pct" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical Specialty Penetration */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              Clinical Discipline Availability
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Specialized treatment capability across active healthcare facilities
            </p>

            <div className="grid grid-cols-2 gap-2">
              {specialties_coverage.map((spec) => (
                <div
                  key={spec.specialty}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs flex items-center justify-between"
                >
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate">
                    {spec.specialty}
                  </span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-[11px]">
                    {spec.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Daily Emergency Patient Admissions:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {kpi.daily_emergency_cases.toLocaleString()} cases/day
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
