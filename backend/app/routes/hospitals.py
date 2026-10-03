from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from ..services.hospital_service import hospital_service
from ..services.scoring_service import calculate_suitability
from ..schemas.search import HospitalSearchRequest, HospitalSearchResponse, PriorityWeights
from ..schemas.hospital import HospitalResult
from ..utils.geo import haversine_distance, CITY_CENTROIDS

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

class NearbySearchBody(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = Field(default=10.0, ge=1.0, le=100.0)
    emergency_type: Optional[str] = "General Emergency"
    facilities: List[str] = Field(default_factory=list)
    sort_by: Optional[str] = "suitability"

@router.post("/search", response_model=HospitalSearchResponse)
def search_hospitals(req: HospitalSearchRequest):
    """
    Search hospitals using Haversine geolocation, capacity constraints,
    facility requirements, and multi-factor suitability scoring.
    """
    try:
        return hospital_service.search_hospitals(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search execution failed: {str(e)}")

@router.post("/nearby", response_model=HospitalSearchResponse)
def search_nearby_post(req: NearbySearchBody):
    """
    Direct nearby hospital search with lat/lon and facilities (Consumer-first endpoint).
    """
    search_req = HospitalSearchRequest(
        latitude=req.latitude,
        longitude=req.longitude,
        radius_km=req.radius_km,
        emergency_type=req.emergency_type,
        required_facilities=req.facilities,
        page=1,
        page_size=25,
        sort_by=req.sort_by or "suitability"
    )
    return hospital_service.search_hospitals(search_req)

@router.get("/nearby")
def get_nearby_hospitals(
    lat: float = Query(...),
    lon: float = Query(...),
    radius_km: float = Query(default=10.0),
    emergency_type: str = Query(default="General Emergency"),
    limit: int = Query(default=15)
):
    """Quick GET endpoint for nearby emergency hospitals."""
    req = HospitalSearchRequest(
        latitude=lat,
        longitude=lon,
        radius_km=radius_km,
        emergency_type=emergency_type,
        page=1,
        page_size=limit
    )
    return hospital_service.search_hospitals(req)

@router.get("")
def list_hospitals(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    city: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """Paginated list of registered hospitals with basic filters."""
    if not hospital_service.is_ready():
        return {
            "database_ready": false,
            "total": 0,
            "page": 1,
            "page_size": page_size,
            "total_pages": 0,
            "results": []
        }

    df = hospital_service.get_df().copy()
    if search:
        s = search.lower()
        df = df[df["Hospital_Name"].astype(str).str.lower().str.contains(s) | df["Hospital_ID"].astype(str).str.lower().str.contains(s)]
    if city and city.lower() != "all":
        df = df[df["City"].str.lower() == city.lower()]
    if category and category.lower() != "all":
        df = df[df["Hospital_Category"].str.lower() == category.lower()]

    total = len(df)
    start = (page - 1) * page_size
    end = start + page_size
    records = df.iloc[start:end].to_dict(orient="records")

    return {
        "database_ready": True,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
        "results": records
    }

@router.get("/reverse-geocode")
def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    """
    Offline-first reverse geocoding: matches user coordinates to nearest metro area.
    """
    closest_city = "Detected Location"
    min_dist = float("inf")
    for city, coords in CITY_CENTROIDS.items():
        d = haversine_distance(lat, lon, coords[0], coords[1])
        if d < min_dist:
            min_dist = d
            closest_city = city.title()

    locality = f"{closest_city} Metropolitan Area" if min_dist < 40.0 else f"Near ({lat:.3f}, {lon:.3f})"
    return {
        "city": closest_city if min_dist < 60.0 else "Other",
        "locality": locality,
        "distance_to_center_km": round(min_dist, 1)
    }

@router.get("/{hospital_id}")
def get_hospital_details(hospital_id: str):
    """Retrieve full operational telemetry and capacity metrics for a specific hospital."""
    record = hospital_service.get_hospital_by_id(hospital_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Hospital with ID '{hospital_id}' was not found in the verified dataset."
        )
    return record

@router.get("/{hospital_id}/explanation")
def get_hospital_explanation(
    hospital_id: str,
    distance_km: float = Query(default=5.0),
    emergency_type: str = Query(default="General Emergency")
):
    """Detailed algorithmic scoring breakdown and rationale for emergency admission."""
    record = hospital_service.get_hospital_by_id(hospital_id)
    if not record:
        raise HTTPException(status_code=404, detail="Hospital not found.")

    score, breakdown, why = calculate_suitability(
        hospital=record,
        distance_km=distance_km,
        radius_km=max(distance_km * 1.5, 15.0),
        emergency_type=emergency_type,
        weights=PriorityWeights()
    )

    return {
        "hospital_id": hospital_id,
        "hospital_name": record.get("Hospital_Name"),
        "suitability_score": score,
        "breakdown": breakdown.model_dump(),
        "explanation": why,
        "disclaimer": "PulseRoute provides decision-support routing based on hospital capacity telemetry and does not replace medical advice."
    }
