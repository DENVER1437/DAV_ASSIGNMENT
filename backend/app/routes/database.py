from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from ..services.database_service import database_service
from ..schemas.dataset import SqlQueryRequest, SqlQueryResponse, DatabaseStatsResponse

router = APIRouter(prefix="/database", tags=["Database Management & Operations"])

PRESET_QUERIES = [
    {
        "id": "city_capacity_breakdown",
        "title": "City Capacity & Bed Aggregates",
        "description": "Aggregates total hospitals, beds, available beds, and average bed occupancy percentage grouped by city.",
        "query": (
            'SELECT City, COUNT(*) as Total_Hospitals, '
            'SUM(Total_Beds) as Total_Beds, SUM(Available_Beds) as Available_Beds, '
            'ROUND(AVG(Bed_Occupancy_Pct), 1) as Avg_Bed_Occupancy, '
            'SUM(ICU_Available_Beds) as ICU_Beds_Available '
            'FROM hospitals '
            'GROUP BY City '
            'ORDER BY Total_Hospitals DESC;'
        )
    },
    {
        "id": "critical_icu_hospitals",
        "title": "Critical ICU Capacity Shortages",
        "description": "Finds emergency facilities currently experiencing critical ICU bottlenecks (<2 ICU beds available).",
        "query": (
            'SELECT Hospital_ID, Hospital_Name, City, ICU_Total_Beds, ICU_Occupied_Beds, '
            'ICU_Available_Beds, ICU_Capacity_Level, Emergency_Services '
            'FROM hospitals '
            'WHERE ICU_Capacity_Level = "Critical" AND Emergency_Services = "Yes" '
            'ORDER BY ICU_Available_Beds ASC, City ASC '
            'LIMIT 20;'
        )
    },
    {
        "id": "top_rated_trauma_centers",
        "title": "Top-Rated Level-1 Trauma Centers",
        "description": "Queries high-reputation facilities with certified Trauma Centers, fast response times, and high ratings.",
        "query": (
            'SELECT Hospital_ID, Hospital_Name, City, Hospital_Rating, '
            'Estimated_Wait_Min, Staff_Availability_Pct, Available_Beds '
            'FROM hospitals '
            'WHERE Trauma_Center = "Yes" AND Hospital_Rating >= 4.5 '
            'ORDER BY Hospital_Rating DESC, Estimated_Wait_Min ASC '
            'LIMIT 15;'
        )
    },
    {
        "id": "data_quality_audit",
        "title": "Data Quality & Imputation Audit",
        "description": "Audits hospital records with lower data quality scores or imputed coordinates for data governance.",
        "query": (
            'SELECT Hospital_ID, Hospital_Name, City, Data_Quality_Score, '
            'Coordinates_Imputed, Hospital_Category, Hospital_Care_Type '
            'FROM hospitals '
            'WHERE Data_Quality_Score < 90 OR Coordinates_Imputed = 1 '
            'ORDER BY Data_Quality_Score ASC '
            'LIMIT 25;'
        )
    },
    {
        "id": "specialty_coverage_matrix",
        "title": "Clinical Specialty Coverage Analysis",
        "description": "Evaluates availability of Cardiology, Neurology, and Pediatrics emergency departments by city.",
        "query": (
            'SELECT City, '
            'SUM(CASE WHEN Cardiology = "Yes" THEN 1 ELSE 0 END) as Cardiac_Centers, '
            'SUM(CASE WHEN Neurology = "Yes" THEN 1 ELSE 0 END) as Neuro_Centers, '
            'SUM(CASE WHEN Pediatrics = "Yes" THEN 1 ELSE 0 END) as Pediatric_Units '
            'FROM hospitals '
            'GROUP BY City '
            'ORDER BY Cardiac_Centers DESC;'
        )
    }
]

@router.get("/stats", response_model=DatabaseStatsResponse)
def get_database_stats():
    """Retrieve comprehensive real-time database diagnostics, file size, indexes, and PRAGMA status."""
    return database_service.get_database_stats()

@router.post("/query", response_model=SqlQueryResponse)
def execute_sql_query(req: SqlQueryRequest):
    """
    Execute read-only SQL queries against pulseroute.db with sub-millisecond execution timing.
    Safe read-only execution for real-world analytical inspection.
    """
    try:
        return database_service.execute_sql_query(query=req.query, limit=req.limit or 50)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preset-queries")
def get_preset_queries():
    """List curated enterprise healthcare SQL analytical queries."""
    return PRESET_QUERIES

@router.post("/vacuum")
def vacuum_database():
    """Execute VACUUM and PRAGMA optimize to compact database and rebuild B-Trees."""
    try:
        return database_service.vacuum_database()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database vacuum failed: {str(e)}")

@router.get("/audit-logs")
def get_audit_logs(limit: int = Query(default=20, ge=1, le=100)):
    """Retrieve historical pipeline executions and step transaction logs from SQLite."""
    return database_service.get_audit_history(limit=limit)
