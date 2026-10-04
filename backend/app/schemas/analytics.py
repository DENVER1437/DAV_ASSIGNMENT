from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional

# Legacy schemas preserved for backward compatibility
class AnalyticsSummary(BaseModel):
    total_hospitals: int
    emergency_hospitals: int
    icu_capable_hospitals: int
    ambulance_available_hospitals: int
    trauma_centers: int
    avg_bed_occupancy_pct: float
    avg_emergency_load_pct: float
    avg_response_time_min: float
    avg_wait_time_min: float
    avg_data_quality_score: float

class CityDistribution(BaseModel):
    city: str
    hospital_count: int
    total_beds: int
    available_beds: int
    icu_available_beds: int
    emergency_capable: int

class AnalyticsCharts(BaseModel):
    summary: AnalyticsSummary
    city_distribution: List[CityDistribution]
    bed_availability_buckets: Dict[str, int]
    icu_availability_buckets: Dict[str, int]
    emergency_service_breakdown: Dict[str, int]
    category_distribution: Dict[str, int]
    quality_score_buckets: Dict[str, int]


# --- Extended Schemas for Comprehensive Data Analysis Page ---

class DatasetOverviewStats(BaseModel):
    total_records: int
    raw_records: int
    total_features: int
    raw_features: int
    derived_features_count: int
    derived_features: List[str]
    numeric_features: List[str]
    categorical_features: List[str]
    missing_values_handled: int
    duplicate_records_purged: int
    valid_geographic_records: int
    geographic_conformity_pct: float
    data_completeness_pct: float
    mean_data_quality_score: float
    status: str
    last_processed: Optional[str] = None
    source_filename: str

class PreprocessingStageDetail(BaseModel):
    id: int
    stage_name: str
    flow_step: str
    badge: str
    status: str
    duration_ms: float
    records_before: int
    records_after: int
    records_affected: int
    algorithm: str
    headline: str
    explanation: str
    metrics: List[Dict[str, Any]]
    sample_before: str
    sample_after: str

class AnalysisFilterRequest(BaseModel):
    state: Optional[str] = None
    city: Optional[str] = None
    hospital_category: Optional[str] = None
    hospital_care_type: Optional[str] = None
    emergency_services: Optional[str] = None
    has_icu: Optional[bool] = None
    min_beds: Optional[int] = None
    max_beds: Optional[int] = None

class AnalysisKPIs(BaseModel):
    total_hospitals: int
    total_beds: int
    occupied_beds: int
    available_beds: int
    occupancy_rate_pct: float
    available_capacity_pct: float
    total_icu_beds: int
    occupied_icu_beds: int
    available_icu_beds: int
    icu_occupancy_pct: float
    icu_to_total_beds_ratio_pct: float
    emergency_hospitals_count: int
    emergency_hospitals_pct: float
    emergency_24x7_count: int
    emergency_24x7_pct: float
    ambulance_count: int
    ambulance_pct: float
    trauma_centers_count: int
    trauma_centers_pct: float
    avg_response_time_min: float
    avg_wait_time_min: float
    avg_hospital_rating: float
    avg_quality_score: float
    daily_emergency_cases: int

class AnalysisResponse(BaseModel):
    total_unfiltered: int
    total_filtered: int
    pct_of_total: float
    kpi: AnalysisKPIs
    filter_options: Dict[str, List[str]]
    city_distribution: List[Dict[str, Any]]
    state_distribution: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    care_type_distribution: List[Dict[str, Any]]
    hospital_size_distribution: List[Dict[str, Any]]
    bed_capacity_distribution: List[Dict[str, Any]]
    beds_breakdown_by_category: List[Dict[str, Any]]
    icu_availability_buckets: List[Dict[str, Any]]
    emergency_capacity_levels: List[Dict[str, Any]]
    specialties_coverage: List[Dict[str, Any]]
    occupancy_by_care_type: List[Dict[str, Any]]
    top_available_hospitals: List[Dict[str, Any]]
    top_critical_hospitals: List[Dict[str, Any]]
    emergency_load_by_city: List[Dict[str, Any]]
    map_sample_points: List[Dict[str, Any]]
    insights: List[str]

class HistogramBin(BaseModel):
    bin_label: str
    min_val: float
    max_val: float
    count: int
    percentage: float

class FeatureStatisticsResponse(BaseModel):
    feature: str
    display_name: str
    unit: str
    count: int
    mean: float
    median: float
    min: float
    max: float
    std_dev: float
    variance: float
    q1: float
    q3: float
    iqr: float
    skewness: float
    histogram: List[HistogramBin]

class CorrelationMatrixResponse(BaseModel):
    features: List[str]
    display_labels: List[str]
    matrix: List[List[float]]
    strongest_correlations: List[Dict[str, Any]]

class CrossAnalysisRequest(BaseModel):
    dimension: str = "City"
    metric: str = "Total_Beds"
    aggregation: str = "sum"
    filters: Optional[AnalysisFilterRequest] = None

class CrossAnalysisResponse(BaseModel):
    dimension: str
    metric: str
    aggregation: str
    data: List[Dict[str, Any]]
    top_10: List[Dict[str, Any]]
    bottom_10: List[Dict[str, Any]]
