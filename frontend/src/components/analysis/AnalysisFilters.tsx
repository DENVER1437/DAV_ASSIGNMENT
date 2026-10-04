import React from 'react';
import { Filter, RotateCcw, X, Building2, MapPin, Activity, Stethoscope, Download } from 'lucide-react';
import { AnalysisFilterRequest } from '../../types';
import { getDownloadRawDatasetUrl } from '../../services/api';

interface AnalysisFiltersProps {
  filters: AnalysisFilterRequest;
  filterOptions: {
    states: string[];
    cities: string[];
    categories: string[];
    care_types: string[];
  };
  onFilterChange: (updated: Partial<AnalysisFilterRequest>) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const AnalysisFilters: React.FC<AnalysisFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
}) => {
  const hasActiveFilters = Boolean(
    (filters.state && filters.state !== 'All') ||
    (filters.city && filters.city !== 'All') ||
    (filters.hospital_category && filters.hospital_category !== 'All') ||
    (filters.hospital_care_type && filters.hospital_care_type !== 'All') ||
    (filters.emergency_services && filters.emergency_services !== 'All') ||
    filters.has_icu !== undefined ||
    filters.min_beds !== undefined
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs transition-colors space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Global Analytical Filters
          </h3>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{filteredCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} facilities
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={getDownloadRawDatasetUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition shadow-2xs"
            title="Download the unprocessed raw CSV dataset without pipeline cleaning"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Download Raw CSV</span>
          </a>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET FILTERS</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Select Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* State Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            State
          </label>
          <select
            value={filters.state || 'All'}
            onChange={(e) => onFilterChange({ state: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All States ({filterOptions.states.length})</option>
            {filterOptions.states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            City
          </label>
          <select
            value={filters.city || 'All'}
            onChange={(e) => onFilterChange({ city: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All Cities ({filterOptions.cities.length})</option>
            {filterOptions.cities.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>

        {/* Hospital Category */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Category
          </label>
          <select
            value={filters.hospital_category || 'All'}
            onChange={(e) => onFilterChange({ hospital_category: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All Categories</option>
            {filterOptions.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Care Type */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Care Type
          </label>
          <select
            value={filters.hospital_care_type || 'All'}
            onChange={(e) => onFilterChange({ hospital_care_type: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All Care Types</option>
            {filterOptions.care_types.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>

        {/* Emergency Services */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Emergency Triage
          </label>
          <select
            value={filters.emergency_services || 'All'}
            onChange={(e) => onFilterChange({ emergency_services: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All Facilities</option>
            <option value="Yes">Emergency Available (Yes)</option>
            <option value="No">No Emergency Department</option>
          </select>
        </div>

        {/* ICU Availability */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            ICU Availability
          </label>
          <select
            value={filters.has_icu === undefined ? 'All' : filters.has_icu ? 'yes' : 'no'}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({
                has_icu: val === 'All' ? undefined : val === 'yes',
              });
            }}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All ICU Tiers</option>
            <option value="yes">Active Vacancy (&gt;0 ICU Beds)</option>
            <option value="no">Zero ICU Vacancies (0 Beds)</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium">Active filters:</span>
          {filters.state && filters.state !== 'All' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              <span>State: {filters.state}</span>
              <button type="button" onClick={() => onFilterChange({ state: 'All' })} className="hover:text-teal-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.city && filters.city !== 'All' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              <span>City: {filters.city}</span>
              <button type="button" onClick={() => onFilterChange({ city: 'All' })} className="hover:text-teal-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.hospital_category && filters.hospital_category !== 'All' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              <span>Category: {filters.hospital_category}</span>
              <button type="button" onClick={() => onFilterChange({ hospital_category: 'All' })} className="hover:text-teal-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.hospital_care_type && filters.hospital_care_type !== 'All' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              <span>Care: {filters.hospital_care_type}</span>
              <button type="button" onClick={() => onFilterChange({ hospital_care_type: 'All' })} className="hover:text-teal-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.emergency_services && filters.emergency_services !== 'All' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              <span>Emergency: {filters.emergency_services}</span>
              <button type="button" onClick={() => onFilterChange({ emergency_services: 'All' })} className="hover:text-teal-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.has_icu !== undefined && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              <span>ICU: {filters.has_icu ? 'Vacancies Available' : 'Zero ICU'}</span>
              <button type="button" onClick={() => onFilterChange({ has_icu: undefined })} className="hover:text-teal-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
