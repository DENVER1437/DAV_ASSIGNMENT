import React from 'react';
import { AnalysisFilters } from './AnalysisFilters';
import { DatasetOverview } from './DatasetOverview';
import { StatisticalAnalysis } from './StatisticalAnalysis';
import { CapacityAnalysis } from './CapacityAnalysis';
import { EmergencyAnalysis } from './EmergencyAnalysis';
import { CorrelationAnalysis } from './CorrelationAnalysis';
import { GeographicAnalysis } from './GeographicAnalysis';
import { CrossAnalysis } from './CrossAnalysis';
import {
  DatasetOverviewStats,
  AnalysisResponse,
  AnalysisFilterRequest,
} from '../../types';

interface AnalysisWorkspaceProps {
  overview: DatasetOverviewStats | null;
  analysis: AnalysisResponse | null;
  filters: AnalysisFilterRequest;
  onFilterChange: (updated: Partial<AnalysisFilterRequest>) => void;
  onResetFilters: () => void;
  isLoading: boolean;
  isFiltering: boolean;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  overview,
  analysis,
  filters,
  onFilterChange,
  onResetFilters,
  isLoading,
  isFiltering,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Global Filter System */}
      <AnalysisFilters
        filters={filters}
        filterOptions={
          analysis?.filter_options || {
            states: [],
            cities: [],
            categories: [],
            care_types: [],
          }
        }
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        filteredCount={analysis?.total_filtered || 0}
        totalCount={analysis?.total_unfiltered || 10000}
      />

      {/* 2. Real Metrics Dataset Overview KPIs */}
      <div>
        <DatasetOverview overview={overview} analysis={analysis} isLoading={isLoading} />
      </div>

      {/* 3. Dashboard 2-Column Grid Layout (Prevents endless vertical scrolling and uneven gaps) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Panel 1: Statistical Analysis */}
        <div className="w-full">
          <StatisticalAnalysis filters={filters} />
        </div>

        {/* Panel 2: Capacity Analysis */}
        <div className="w-full">
          <CapacityAnalysis
            analysis={analysis}
            isLoading={isLoading || isFiltering}
          />
        </div>

        {/* Panel 3: Emergency Analysis */}
        <div className="w-full">
          <EmergencyAnalysis
            analysis={analysis}
            isLoading={isLoading || isFiltering}
          />
        </div>

        {/* Panel 4: Correlation Analysis */}
        <div className="w-full">
          <CorrelationAnalysis filters={filters} />
        </div>

        {/* Panel 5: Geographical Analysis */}
        <div className="w-full">
          <GeographicAnalysis
            analysis={analysis}
            isLoading={isLoading || isFiltering}
          />
        </div>

        {/* Panel 6: Cross Analysis & Hospital Rankings */}
        <div className="w-full">
          <CrossAnalysis filters={filters} />
        </div>
      </div>
    </div>
  );
};
