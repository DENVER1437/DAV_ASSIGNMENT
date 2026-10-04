export interface ScoreBreakdown {
  distance_score: number;
  bed_score: number;
  icu_score: number;
  capability_score: number;
  wait_score: number;
  distance_rating: string;
  bed_rating: string;
  icu_rating: string;
  capability_rating: string;
  wait_rating: string;
}

export interface Hospital {
  Hospital_ID: string;
  Hospital_Name: string;
  City: string;
  State: string;
  Latitude: number;
  Longitude: number;
  Pincode?: string;
  Hospital_Category: string;
  Hospital_Care_Type: string;
  Hospital_Size: string;
  Total_Beds: number;
  Occupied_Beds: number;
  Available_Beds: number;
  ICU_Total_Beds: number;
  ICU_Occupied_Beds: number;
  ICU_Available_Beds: number;
  Emergency_Services: string;
  Ambulance_Available: string;
  Trauma_Center: string;
  Cardiology: string;
  Neurology: string;
  Orthopedics: string;
  Pediatrics: string;
  Gynecology: string;
  '24x7_Service': string;
  Emergency_Load_Pct: number;
  Estimated_Wait_Min: number;
  Average_Response_Time_Min: number;
  Hospital_Rating: number;
  Daily_Emergency_Cases: number;
  Staff_Availability_Pct: number;
  Last_Updated: string;
  
  // Derived fields
  Bed_Occupancy_Pct: number;
  ICU_Occupancy_Pct: number;
  Bed_Availability_Pct: number;
  Emergency_Capacity_Level: 'High' | 'Moderate' | 'Critical';
  ICU_Capacity_Level: 'High' | 'Moderate' | 'Critical';
  Facility_Count: number;
  Data_Quality_Score: number;
  Coordinates_Imputed?: boolean;

  // Search results augmentation
  distance_km?: number;
  suitability_score?: number;
  score_breakdown?: ScoreBreakdown;
  why_recommended?: string;
}

export interface PriorityWeights {
  distance: number;
  bed_availability: number;
  icu_availability: number;
  waiting_time: number;
}

export interface HospitalSearchRequest {
  latitude?: number;
  longitude?: number;
  city?: string;
  area_or_pincode?: string;
  radius_km: number;
  emergency_type?: string;
  required_facilities: string[];
  priorities: PriorityWeights;
  min_rating?: number;
  max_wait_min?: number;
  sort_by?: 'suitability' | 'distance' | 'wait_time' | 'available_beds';
  page: number;
  page_size: number;
}

export interface HospitalSearchResponse {
  total_matches: number;
  radius_km: number;
  detected_location?: string;
  center_coordinates?: { lat: number; lon: number };
  page: number;
  page_size: number;
  total_pages: number;
  results: Hospital[];
  empty_suggestion?: string;
}

export interface ValidationReport {
  total_records: number;
  valid_records: number;
  duplicate_records: number;
  missing_value_counts: Record<string, number>;
  invalid_coordinates_count: number;
  outliers_count: number;
  categorical_inconsistencies: Record<string, number>;
  is_valid: boolean;
  summary_message: string;
}

export interface CleaningReport {
  duplicates_removed: number;
  missing_values_imputed: number;
  invalid_coordinates_handled: number;
  outliers_flagged: number;
  categorical_values_normalized: number;
  derived_fields_generated: string[];
  total_processed_records: number;
  mean_data_quality_score: number;
}

export interface PipelineStepMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface PipelineStepBeforeAfter {
  title: string;
  before: string;
  after: string;
  insight: string;
}

export interface PipelineStepDetail {
  id: number;
  title: string;
  short_desc: string;
  badge: string;
  status: string;
  duration_ms: number;
  headline: string;
  objective: string;
  algorithm: string;
  metrics: PipelineStepMetric[];
  analysis: string;
  before_after: PipelineStepBeforeAfter;
  logs: string[];
}

export interface DatabaseStats {
  engine: string;
  database_file: string;
  file_path: string;
  file_size_bytes: number;
  file_size_kb: number;
  file_size_mb: number;
  file_size_formatted: string;
  total_tables: number;
  table_names: string[];
  hospitals_count: number;
  audit_logs_count: number;
  active_indexes: string[];
  indexes_count: number;
  integrity_check: string;
  integrity_status: string;
  journal_mode: string;
  synchronous: string;
  page_size_bytes: number;
  page_count: number;
  query_benchmark_ms: number;
  is_ready: boolean;
  status: string;
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
  duration_ms: number;
  query_executed: string;
  is_truncated: boolean;
  status: string;
}

export interface PresetQuery {
  id: string;
  title: string;
  description: string;
  query: string;
}

export interface DatasetStatus {
  is_loaded: boolean;
  is_processed: boolean;
  source_filename: string;
  total_records: number;
  valid_records: number;
  last_processed?: string;
  validation_report?: ValidationReport;
  cleaning_report?: CleaningReport;
  pipeline_steps?: PipelineStepDetail[];
  database_ready?: boolean;
  database_size_formatted?: string;
  integrity_status?: string;
}


export interface AnalyticsSummary {
  total_hospitals: number;
  emergency_hospitals: number;
  icu_capable_hospitals: number;
  ambulance_available_hospitals: number;
  trauma_centers: number;
  avg_bed_occupancy_pct: number;
  avg_emergency_load_pct: number;
  avg_response_time_min: number;
  avg_wait_time_min: number;
  avg_data_quality_score: number;
}

export interface CityDistribution {
  city: string;
  hospital_count: number;
  total_beds: number;
  available_beds: number;
  icu_available_beds: number;
  emergency_capable: number;
}

export interface AnalyticsCharts {
  summary: AnalyticsSummary;
  city_distribution: CityDistribution[];
  bed_availability_buckets: Record<string, number>;
  icu_availability_buckets: Record<string, number>;
  emergency_service_breakdown: Record<string, number>;
  category_distribution: Record<string, number>;
  quality_score_buckets: Record<string, number>;
}

export type DispatchPhase =
  | 'en_route_patient'
  | 'arrived_patient'
  | 'transit_hospital'
  | 'admitted_complete';

export type SimulationSpeed = 1 | 2 | 5 | 10;

// ==================== Data Analysis Page Types ====================

export interface DatasetOverviewStats {
  total_records: number;
  raw_records: number;
  total_features: number;
  raw_features: number;
  derived_features_count: number;
  derived_features: string[];
  numeric_features: string[];
  categorical_features: string[];
  missing_values_handled: number;
  duplicate_records_purged: number;
  valid_geographic_records: number;
  geographic_conformity_pct: number;
  data_completeness_pct: number;
  mean_data_quality_score: number;
  status: string;
  last_processed?: string;
  source_filename: string;
}

export interface PreprocessingStageDetail {
  id: number;
  stage_name: string;
  flow_step: string;
  badge: string;
  status: string;
  duration_ms: number;
  records_before: number;
  records_after: number;
  records_affected: number;
  algorithm: string;
  headline: string;
  explanation: string;
  metrics: { label: string; value: string; hint?: string }[];
  sample_before: string;
  sample_after: string;
}

export interface AnalysisFilterRequest {
  state?: string;
  city?: string;
  hospital_category?: string;
  hospital_care_type?: string;
  emergency_services?: string;
  has_icu?: boolean;
  min_beds?: number;
  max_beds?: number;
}

export interface AnalysisKPIs {
  total_hospitals: number;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_rate_pct: number;
  available_capacity_pct: number;
  total_icu_beds: number;
  occupied_icu_beds: number;
  available_icu_beds: number;
  icu_occupancy_pct: number;
  icu_to_total_beds_ratio_pct: number;
  emergency_hospitals_count: number;
  emergency_hospitals_pct: number;
  emergency_24x7_count: number;
  emergency_24x7_pct: number;
  ambulance_count: number;
  ambulance_pct: number;
  trauma_centers_count: number;
  trauma_centers_pct: number;
  avg_response_time_min: number;
  avg_wait_time_min: number;
  avg_hospital_rating: number;
  avg_quality_score: number;
  daily_emergency_cases: number;
}

export interface AnalysisResponse {
  total_unfiltered: number;
  total_filtered: number;
  pct_of_total: number;
  kpi: AnalysisKPIs;
  filter_options: {
    states: string[];
    cities: string[];
    categories: string[];
    care_types: string[];
  };
  city_distribution: {
    city: string;
    count: number;
    total_beds: number;
    available_beds: number;
    icu_available: number;
  }[];
  state_distribution: {
    state: string;
    count: number;
    total_beds: number;
    available_beds: number;
  }[];
  category_distribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  care_type_distribution: {
    care_type: string;
    count: number;
    percentage: number;
  }[];
  hospital_size_distribution: {
    size: string;
    count: number;
    percentage: number;
  }[];
  bed_capacity_distribution: {
    bucket: string;
    count: number;
  }[];
  beds_breakdown_by_category: {
    category: string;
    occupied_beds: number;
    available_beds: number;
    total_beds: number;
    occupancy_pct: number;
  }[];
  icu_availability_buckets: {
    bucket: string;
    count: number;
  }[];
  emergency_capacity_levels: {
    level: string;
    count: number;
    percentage: number;
  }[];
  specialties_coverage: {
    specialty: string;
    count: number;
    percentage: number;
  }[];
  occupancy_by_care_type: {
    care_type: string;
    total_beds: number;
    available_beds: number;
    occupancy_rate_pct: number;
  }[];
  top_available_hospitals: {
    id: string;
    name: string;
    city: string;
    state?: string;
    total_beds: number;
    available_beds: number;
    icu_available: number;
    rating: number;
  }[];
  top_critical_hospitals: {
    id: string;
    name: string;
    city: string;
    state?: string;
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
    occupancy_pct: number;
  }[];
  emergency_load_by_city: {
    city: string;
    avg_load_pct: number;
    avg_response_min: number;
    daily_cases: number;
  }[];
  map_sample_points: {
    id: string;
    name: string;
    city: string;
    state?: string;
    lat: number;
    lon: number;
    total_beds: number;
    available_beds: number;
    icu_available: number;
    emergency: string;
    rating: number;
    capacity_level: string;
  }[];
  insights: string[];
}

export interface HistogramBin {
  bin_label: string;
  min_val: number;
  max_val: number;
  count: number;
  percentage: number;
}

export interface FeatureStatisticsResponse {
  feature: string;
  display_name: string;
  unit: string;
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  std_dev: number;
  variance: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  histogram: HistogramBin[];
}

export interface CorrelationMatrixResponse {
  features: string[];
  display_labels: string[];
  matrix: number[][];
  strongest_correlations: {
    feature_a: string;
    feature_b: string;
    label_a: string;
    label_b: string;
    correlation: number;
    relationship: string;
  }[];
}

export interface CrossAnalysisRequest {
  dimension: string;
  metric: string;
  aggregation: string;
  filters?: AnalysisFilterRequest;
}

export interface CrossAnalysisResponse {
  dimension: string;
  metric: string;
  aggregation: string;
  data: {
    dimension: string;
    value: number;
    count: number;
  }[];
  top_10: {
    id: string;
    name: string;
    city: string;
    state: string;
    category: string;
    value: number;
  }[];
  bottom_10: {
    id: string;
    name: string;
    city: string;
    state: string;
    category: string;
    value: number;
  }[];
}
