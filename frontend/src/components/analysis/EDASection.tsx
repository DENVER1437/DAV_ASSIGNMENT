import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Layers, Bed, Activity } from 'lucide-react';
import { AnalysisResponse } from '../../types';

interface EDASectionProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
}

const CATEGORY_COLORS = ['#0d9488', '#0284c7', '#6366f1', '#f59e0b'];
const CARE_TYPE_COLORS = ['#0f766e', '#0369a1', '#4f46e5', '#d97706'];

export const EDASection: React.FC<EDASectionProps> = ({ analysis, isLoading }) => {
  if (isLoading || !analysis) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
        <div className="h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4" />
        <div className="h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4" />
      </div>
    );
  }

  const {
    city_distribution,
    category_distribution,
    care_type_distribution,
    bed_capacity_distribution,
    beds_breakdown_by_category,
    icu_availability_buckets,
  } = analysis;

  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-2">
        <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Exploratory Data Analysis (EDA)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Hospital Count by Major City (Top 10) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Hospital Distribution by Metropolitan City
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Facility volumes and bed reserves across top urban centers
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Top 10 Cities
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={city_distribution.slice(0, 10)} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis
                  dataKey="city"
                  angle={-30}
                  textAnchor="end"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any, name?: any) => [
                    Number(val).toLocaleString(),
                    name === 'count' ? 'Facilities' : name === 'available_beds' ? 'Available Beds' : 'Total Beds',
                  ]}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Composition (Donut) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Hospital Category Composition
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ownership breakdown: Private, Trust, Government, and Charitable
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {category_distribution.length} Categories
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_distribution}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {category_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any, name?: any) => [
                    `${Number(val).toLocaleString()} facilities`,
                    String(name || ''),
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val, entry: any) => (
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      {val} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Bed Capacity Distribution Histogram */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Facility Scale: Bed Capacity Distribution
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Stratification of hospital size from primary clinics to medical centers
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Capacity Buckets
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bed_capacity_distribution} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} Facilities`, 'Count']}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Occupied vs Available Beds by Category (Grouped Bar) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Occupied vs. Available Inpatient Beds by Category
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Current patient load vs. remaining emergency surge margin
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Bed Ratios
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beds_breakdown_by_category} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any, name?: any) => [
                    `${Number(val).toLocaleString()} beds`,
                    name === 'occupied_beds' ? 'Occupied Beds' : 'Available Beds',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(val) => (
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      {val === 'occupied_beds' ? 'Occupied Beds' : 'Available Beds'}
                    </span>
                  )}
                />
                <Bar dataKey="occupied_beds" fill="#ef4444" radius={[4, 4, 0, 0]} name="occupied_beds" />
                <Bar dataKey="available_beds" fill="#10b981" radius={[4, 4, 0, 0]} name="available_beds" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
