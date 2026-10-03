from pydantic import BaseModel
from typing import Dict, List, Any

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
