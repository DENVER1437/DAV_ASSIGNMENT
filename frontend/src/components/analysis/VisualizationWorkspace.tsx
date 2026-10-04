import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart2,
  Sliders,
  Filter,
  Eye,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { AnalysisResponse, AnalysisFilterRequest } from '../../types';

interface VisualizationWorkspaceProps {
  analysis: AnalysisResponse | null;
  filters: AnalysisFilterRequest;
  onFilterChange: (updated: Partial<AnalysisFilterRequest>) => void;
  onResetFilters: () => void;
  isLoading: boolean;
}

const CATEGORY_COLORS = ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

export const VisualizationWorkspace: React.FC<VisualizationWorkspaceProps> = ({
  analysis,
  filters,
  onFilterChange,
  onResetFilters,
  isLoading,
}) => {
  // Dynamic Chart Controls
  const [selectedDimension, setSelectedDimension] = useState<string>('City');
  const [selectedMetric, setSelectedMetric] = useState<string>('count');
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'area' | 'pie'>('bar');

  // Compute dynamic chart data based on selected dimension & metric
  const dynamicChartData = useMemo(() => {
    if (!analysis) return [];

    if (selectedDimension === 'City') {
      return analysis.city_distribution.slice(0, 10).map((c) => ({
        label: c.city,
        value:
          selectedMetric === 'total_beds'
            ? c.total_beds
            : selectedMetric === 'available_beds'
            ? c.available_beds
            : selectedMetric === 'icu_available'
            ? c.icu_available
            : c.count,
      }));
    }

    if (selectedDimension === 'State') {
      return analysis.state_distribution.slice(0, 10).map((s) => ({
        label: s.state,
        value:
          selectedMetric === 'total_beds'
            ? s.total_beds
            : selectedMetric === 'available_beds'
            ? s.available_beds
            : s.count,
      }));
    }

    if (selectedDimension === 'Category') {
      return analysis.category_distribution.map((cat) => ({
        label: cat.category,
        value: cat.count,
      }));
    }

    if (selectedDimension === 'CareType') {
      return analysis.care_type_distribution.map((ct) => ({
        label: ct.care_type,
        value: ct.count,
      }));
    }

    if (selectedDimension === 'HospitalSize') {
      return analysis.hospital_size_distribution.map((sz) => ({
        label: sz.size,
        value: sz.count,
      }));
    }

    return analysis.city_distribution.slice(0, 8).map((c) => ({ label: c.city, value: c.count }));
  }, [analysis, selectedDimension, selectedMetric]);

  const metricLabel =
    selectedMetric === 'total_beds'
      ? 'Total Inpatient Beds'
      : selectedMetric === 'available_beds'
      ? 'Available Beds'
      : selectedMetric === 'icu_available'
      ? 'Available ICU Beds'
      : 'Facility Count';

  if (isLoading || !analysis) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const {
    city_distribution,
    category_distribution,
    care_type_distribution,
    beds_breakdown_by_category,
    icu_availability_buckets,
    specialties_coverage = [],
    emergency_load_by_city = [],
    occupancy_by_care_type = [],
    kpi,
  } = analysis;

  const hasActiveFilters = Boolean(
    (filters.state && filters.state !== 'All') ||
    (filters.city && filters.city !== 'All') ||
    (filters.hospital_category && filters.hospital_category !== 'All') ||
    (filters.hospital_care_type && filters.hospital_care_type !== 'All') ||
    (filters.emergency_services && filters.emergency_services !== 'All')
  );

  return (
    <div className="space-y-6">
      {/* 1. Interactive Visualization Controls Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Interactive Visual Explorer
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize dimension, clinical metric, and rendering format to inspect structural distributions.
            </p>
          </div>

          {/* Quick Filter Reset */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Control Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dimension Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Primary Dimension
            </label>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="City">Metropolitan City</option>
              <option value="State">State / Region</option>
              <option value="Category">Hospital Category (Private, Trust...)</option>
              <option value="CareType">Care Type (Super Speciality...)</option>
              <option value="HospitalSize">Facility Size</option>
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Aggregation Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="count">Hospital Facilities Count</option>
              <option value="total_beds">Total Inpatient Beds</option>
              <option value="available_beds">Available Beds</option>
              <option value="icu_available">Available ICU Beds</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Chart Representation
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedChartType('bar')}
                className={`py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  selectedChartType === 'bar'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Bar Chart
              </button>
              <button
                type="button"
                onClick={() => setSelectedChartType('area')}
                className={`py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  selectedChartType === 'area'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Area Chart
              </button>
              <button
                type="button"
                onClick={() => setSelectedChartType('pie')}
                className={`py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  selectedChartType === 'pie'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Donut / Pie
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Render Canvas */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {metricLabel} across {selectedDimension}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Live Rendering • {dynamicChartData.length} Bins
            </span>
          </div>

          <div className="h-64 w-full bg-slate-50/50 dark:bg-slate-800/20 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChartType === 'bar' ? (
                <BarChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="label" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any) => [Number(val).toLocaleString(), metricLabel]}
                  />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : selectedChartType === 'area' ? (
                <AreaChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="label" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any) => [Number(val).toLocaleString(), metricLabel]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0d9488" fill="#0d9488" fillOpacity={0.25} />
                </AreaChart>
              ) : (
                <PieChart>
                  <Pie
                    data={dynamicChartData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {dynamicChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any, name?: any) => [Number(val).toLocaleString(), String(name || '')]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Structured Visualization Gallery (Responsive Grid of Exploratory Cards) */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Exploratory Analytical Gallery
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Metropolitan Cluster Density */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Metropolitan Facility Density
              </h4>
              <p className="text-[11px] text-slate-500">
                Top urban healthcare concentrations across 15 major cities
              </p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={city_distribution.slice(0, 6)} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="city" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any) => [`${val} Hospitals`, 'Facilities']}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Bed Allocation (Occupied vs Available) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Bed Allocation: Occupied vs. Available
              </h4>
              <p className="text-[11px] text-slate-500">
                Occupancy versus emergency surge headroom by category
              </p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={beds_breakdown_by_category} margin={{ top: 5, right: 5, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any, name?: any) => [`${Number(val).toLocaleString()} Beds`, name === 'occupied_beds' ? 'Occupied' : 'Available']}
                  />
                  <Bar dataKey="occupied_beds" fill="#ef4444" radius={[3, 3, 0, 0]} name="occupied_beds" />
                  <Bar dataKey="available_beds" fill="#10b981" radius={[3, 3, 0, 0]} name="available_beds" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: 24x7 Emergency Triage Coverage */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Emergency 24x7 Triage Coverage
              </h4>
              <p className="text-[11px] text-slate-500">
                Proportion of centers maintaining 24-hour rapid casualty care
              </p>
            </div>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '24x7 Active', value: kpi.emergency_24x7_count },
                      { name: 'Standard Hours', value: kpi.total_hospitals - kpi.emergency_24x7_count },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    <Cell fill="#0d9488" />
                    <Cell fill="#94a3b8" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any, name?: any) => [`${Number(val).toLocaleString()} Hospitals`, String(name || '')]}
                  />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 4: Clinical Care Type Composition */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Clinical Care Specialization
              </h4>
              <p className="text-[11px] text-slate-500">
                Super Speciality, Speciality, General, and Multispeciality
              </p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={care_type_distribution} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="care_type" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any) => [`${val} Hospitals`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 5: ICU Vacancy Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                ICU Vacancy Stratification
              </h4>
              <p className="text-[11px] text-slate-500">
                Distribution of immediately available Intensive Care Unit beds
              </p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={icu_availability_buckets} margin={{ top: 5, right: 5, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any) => [`${val} Facilities`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#0284c7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 6: Hospital Category Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Ownership Category Breakdown
              </h4>
              <p className="text-[11px] text-slate-500">
                Private, Trust, Government, and Charitable distributions
              </p>
            </div>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_distribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {category_distribution.map((_, index) => (
                      <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any, name?: any) => [`${Number(val).toLocaleString()} Facilities`, String(name || '')]}
                  />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 7: Clinical Specialization Spectrum */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Clinical Specialization Spectrum
              </h4>
              <p className="text-[11px] text-slate-500">
                Proportion of cohort equipped with critical clinical specialties
              </p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    specialties_coverage.filter((s) =>
                      ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Trauma Centers'].includes(s.specialty)
                    ).length > 0
                      ? specialties_coverage.filter((s) =>
                          ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Trauma Centers'].includes(s.specialty)
                        )
                      : specialties_coverage.slice(0, 6)
                  }
                  margin={{ top: 5, right: 5, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="specialty" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any) => [`${val}% Coverage`, 'Facilities Equipped']}
                  />
                  <Bar dataKey="percentage" fill="#ec4899" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 8: Emergency Response Latency */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Ambulance Dispatch Latency
              </h4>
              <p className="text-[11px] text-slate-500">
                Average emergency response transit time across top cities
              </p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergency_load_by_city.slice(0, 6)} margin={{ top: 5, right: 5, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="city" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} unit="m" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any) => [`${val} mins`, 'Avg Response Time']}
                  />
                  <Bar dataKey="avg_response_min" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 9: Bed Occupancy Saturation by Care Type */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Bed Occupancy Saturation by Tier
              </h4>
              <p className="text-[11px] text-slate-500">
                Inpatient bed utilization rate across healthcare facility categories
              </p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancy_by_care_type} margin={{ top: 5, right: 5, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="care_type" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                    formatter={(val: any) => [`${val}% Occupancy`, 'Utilization Rate']}
                  />
                  <Bar dataKey="occupancy_rate_pct" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
