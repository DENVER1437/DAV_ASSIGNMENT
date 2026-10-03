from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class HospitalBase(BaseModel):
    Hospital_ID: str
    Hospital_Name: str
    City: str
    State: str
    Latitude: float
    Longitude: float
    Pincode: Optional[str] = None
    Hospital_Category: str
    Hospital_Care_Type: str
    Hospital_Size: str
    Total_Beds: int
    Occupied_Beds: int
    Available_Beds: int
    ICU_Total_Beds: int
    ICU_Occupied_Beds: int
    ICU_Available_Beds: int
    Emergency_Services: str
    Ambulance_Available: str
    Trauma_Center: str
    Cardiology: str
    Neurology: str
    Orthopedics: str
    Pediatrics: str
    Gynecology: str
    Service_24x7: str = Field(alias="24x7_Service")
    Emergency_Load_Pct: float
    Estimated_Wait_Min: int
    Average_Response_Time_Min: int
    Hospital_Rating: float
    Daily_Emergency_Cases: int
    Staff_Availability_Pct: float
    Last_Updated: str

class HospitalDerived(BaseModel):
    Bed_Occupancy_Pct: float
    ICU_Occupancy_Pct: float
    Bed_Availability_Pct: float
    Emergency_Capacity_Level: str
    ICU_Capacity_Level: str
    Facility_Count: int
    Data_Quality_Score: float

class ScoreBreakdown(BaseModel):
    distance_score: float
    bed_score: float
    icu_score: float
    capability_score: float
    wait_score: float
    distance_rating: str
    bed_rating: str
    icu_rating: str
    capability_rating: str
    wait_rating: str

class HospitalResult(HospitalBase, HospitalDerived):
    distance_km: Optional[float] = None
    suitability_score: Optional[int] = None
    score_breakdown: Optional[ScoreBreakdown] = None
    why_recommended: Optional[str] = None

    class Config:
        populate_by_name = True
