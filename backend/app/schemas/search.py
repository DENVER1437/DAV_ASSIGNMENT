from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class PriorityWeights(BaseModel):
    distance: float = 25.0
    bed_availability: float = 25.0
    icu_availability: float = 25.0
    waiting_time: float = 25.0

class HospitalSearchRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    area_or_pincode: Optional[str] = None
    radius_km: float = Field(default=15.0, ge=1.0, le=100.0)
    emergency_type: Optional[str] = "General Emergency"
    required_facilities: List[str] = Field(default_factory=list)
    priorities: PriorityWeights = Field(default_factory=PriorityWeights)
    min_rating: Optional[float] = None
    max_wait_min: Optional[int] = None
    sort_by: Optional[str] = "suitability" # suitability, distance, wait_time, available_beds
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class HospitalSearchResponse(BaseModel):
    total_matches: int
    radius_km: float
    detected_location: Optional[str] = None
    center_coordinates: Optional[Dict[str, float]] = None
    page: int
    page_size: int
    total_pages: int
    results: List[Dict]
    empty_suggestion: Optional[str] = None
