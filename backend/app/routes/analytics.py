from fastapi import APIRouter
from ..services.analytics_service import get_analytics_data

router = APIRouter(prefix="/analytics", tags=["Analytics & Capacity Intelligence"])

@router.get("/charts")
def get_charts():
    """Complete aggregated capacity intelligence, distributions, and city breakdowns."""
    return get_analytics_data()

@router.get("/summary")
def get_summary():
    """Core KPI summary for quick dashboard metrics."""
    data = get_analytics_data()
    return data.summary

@router.get("/cities")
def get_cities():
    """City-level hospital and bed distributions."""
    data = get_analytics_data()
    return data.city_distribution
