import React from 'react';
import {
  FileSpreadsheet,
  Layers,
  Hash,
  Shapes,
  Wrench,
  Trash2,
  CheckCircle,
  MapPin,
  Sparkles,
  Bed,
  Clock,
  Activity,
  Filter,
} from 'lucide-react';
import { DatasetOverviewStats, AnalysisResponse } from '../../types';

interface DatasetOverviewProps {
  overview: DatasetOverviewStats | null;
  analysis?: AnalysisResponse | null;
  isLoading: boolean;
}

export const DatasetOverview: React.FC<DatasetOverviewProps> = ({
  overview,
  analysis,
  isLoading,
}) => {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 animate-pulse"
          >
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-2" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20 mb-1" />
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  // Check if active filters are filtering down the dataset
  const isFiltered = Boolean(
    analysis &&
      analysis.total_filtered !== undefined &&
      analysis.total_unfiltered !== undefined &&
      analysis.total_filtered < analysis.total_unfiltered
  );

  const kpis = isFiltered && analysis
    ? [
        {
          label: 'Filtered Records',
          value: analysis.total_filtered.toLocaleString(),
          subtext: `${((analysis.total_filtered / analysis.total_unfiltered) * 100).toFixed(1)}% of ${analysis.total_unfiltered.toLocaleString()}`,
          icon: Filter,
          highlight: true,
        },
        {
          label: 'Total Capacity',
          value: `${analysis.kpi.total_beds.toLocaleString()} Beds`,
          subtext: `${analysis.kpi.available_beds.toLocaleString()} available`,
          icon: Bed,
        },
        {
          label: 'Occupancy Rate',
          value: `${analysis.kpi.occupancy_rate_pct}%`,
          subtext: `${analysis.kpi.occupied_beds.toLocaleString()} occupied`,
          icon: Activity,
        },
        {
          label: 'ICU Capacity',
          value: `${analysis.kpi.available_icu_beds.toLocaleString()} ICU`,
          subtext: `${analysis.kpi.icu_occupancy_pct}% occupied`,
          icon: Layers,
        },
        {
          label: '24x7 ER Coverage',
          value: `${analysis.kpi.emergency_24x7_pct}%`,
          subtext: `${analysis.kpi.emergency_24x7_count.toLocaleString()} facilities`,
          icon: Clock,
        },
        {
          label: 'Avg Response Time',
          value: `${analysis.kpi.avg_response_time_min} min`,
          subtext: 'Ambulance dispatch speed',
          icon: MapPin,
        },
        {
          label: 'Hospital Rating',
          value: `★ ${analysis.kpi.avg_hospital_rating ?? (analysis.kpi as any).avg_rating ?? 0}`,
          subtext: 'Mean clinical rating',
          icon: Sparkles,
        },
        {
          label: 'Data Quality',
          value: `${analysis.kpi.avg_quality_score}%`,
          subtext: 'Zero null beds',
          icon: CheckCircle,
        },
      ]
    : [
        {
          label: 'Total Records',
          value: overview.total_records.toLocaleString(),
          subtext: `${overview.raw_records.toLocaleString()} raw ingested`,
          icon: FileSpreadsheet,
        },
        {
          label: 'Total Features',
          value: `${overview.total_features} Cols`,
          subtext: `${overview.derived_features_count} derived attributes`,
          icon: Layers,
        },
        {
          label: 'Numeric Attributes',
          value: `${overview.numeric_features.length} Metrics`,
          subtext: 'Continuous & discrete',
          icon: Hash,
        },
        {
          label: 'Categorical Fields',
          value: `${overview.categorical_features.length} Fields`,
          subtext: 'Specialties & tiers',
          icon: Shapes,
        },
        {
          label: 'Missing Handled',
          value: overview.missing_values_handled.toLocaleString(),
          subtext: 'Constraint-balanced',
          icon: Wrench,
        },
        {
          label: 'Duplicates Purged',
          value: `${overview.duplicate_records_purged} Keys`,
          subtext: 'Collisions eliminated',
          icon: Trash2,
        },
        {
          label: 'Completeness',
          value: `${overview.data_completeness_pct}%`,
          subtext: 'Zero unresolved nulls',
          icon: CheckCircle,
        },
        {
          label: 'Geospatial Valid',
          value: `${overview.geographic_conformity_pct}%`,
          subtext: `${overview.valid_geographic_records.toLocaleString()} GPS verified`,
          icon: MapPin,
        },
      ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {isFiltered ? 'Filtered Cohort Profile & Metrics' : 'Dataset Ingestion & Schema Profile'}
          </h2>
          {isFiltered && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Live Filtered ({analysis?.total_filtered.toLocaleString()} of {analysis?.total_unfiltered.toLocaleString()})
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Source: {overview.source_filename}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`border rounded-xl p-3 transition-all hover:shadow-2xs flex flex-col justify-between ${
                kpi.highlight
                  ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 ring-1 ring-teal-400/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-medium truncate ${kpi.highlight ? 'text-teal-900 dark:text-teal-200 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {kpi.label}
                </span>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${kpi.highlight ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
              </div>
              <div>
                <div className={`text-base sm:text-lg font-bold tracking-tight ${kpi.highlight ? 'text-teal-800 dark:text-teal-300' : 'text-slate-900 dark:text-slate-100'}`}>
                  {kpi.value}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {kpi.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
