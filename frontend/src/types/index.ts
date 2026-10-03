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
