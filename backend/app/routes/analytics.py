from fastapi import APIRouter, Query
from typing import Optional, List
from ..services.analytics_service import (
    get_analytics_data,
    get_dataset_overview,
    get_preprocessing_flow,
    get_filtered_analysis,
    get_feature_statistics,
    get_correlation_matrix,
    get_cross_analysis,
)
from ..schemas.analytics import (
    AnalyticsCharts,
    AnalyticsSummary,
    CityDistribution,
    DatasetOverviewStats,
    PreprocessingStageDetail,
    AnalysisFilterRequest,
    AnalysisResponse,
    FeatureStatisticsResponse,
    CorrelationMatrixResponse,
    CrossAnalysisRequest,
    CrossAnalysisResponse,
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Capacity Intelligence"])

# Legacy endpoints (preserved for existing views)
@router.get("/charts", response_model=AnalyticsCharts)
def get_charts():
    """Complete aggregated capacity intelligence, distributions, and city breakdowns."""
    return get_analytics_data()

@router.get("/summary", response_model=AnalyticsSummary)
def get_summary():
    """Core KPI summary for quick dashboard metrics."""
    data = get_analytics_data()
    return data.summary

@router.get("/cities", response_model=List[CityDistribution])
def get_cities():
    """City-level hospital and bed distributions."""
    data = get_analytics_data()
    return data.city_distribution


# Extended endpoints for Data Analysis Page
@router.get("/overview", response_model=DatasetOverviewStats)
def get_overview():
    """High-level dataset summary, raw vs processed attributes, completeness, and quality score."""
    return get_dataset_overview()

@router.get("/preprocessing-flow", response_model=List[PreprocessingStageDetail])
def get_preprocessing_pipeline_flow():
    """Visual step-by-step data cleaning, balance constraint imputation, and spatial validation flow."""
    return get_preprocessing_flow()

@router.post("/analysis", response_model=AnalysisResponse)
def get_analysis(filters: Optional[AnalysisFilterRequest] = None):
    """Dynamically filtered EDA distributions, capacity intelligence, emergency metrics, and insights."""
    return get_filtered_analysis(filters)

@router.get("/statistics", response_model=FeatureStatisticsResponse)
def get_statistics(
    feature: str = Query("Total_Beds", description="Numeric feature attribute name"),
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    hospital_category: Optional[str] = Query(None),
    hospital_care_type: Optional[str] = Query(None),
    emergency_services: Optional[str] = Query(None),
):
    """Univariate descriptive statistics (Mean, Median, Min, Max, Std Dev, Variance, IQR, Skew) & histogram."""
    filter_req = None
    if any([state, city, hospital_category, hospital_care_type, emergency_services]):
        filter_req = AnalysisFilterRequest(
            state=state,
            city=city,
            hospital_category=hospital_category,
            hospital_care_type=hospital_care_type,
            emergency_services=emergency_services,
        )
    return get_feature_statistics(feature, filter_req)

@router.get("/correlation", response_model=CorrelationMatrixResponse)
def get_correlation(
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    hospital_category: Optional[str] = Query(None),
    hospital_care_type: Optional[str] = Query(None),
):
    """Pearson correlation matrix across valid numeric clinical attributes."""
    filter_req = None
    if any([state, city, hospital_category, hospital_care_type]):
        filter_req = AnalysisFilterRequest(
            state=state,
            city=city,
            hospital_category=hospital_category,
            hospital_care_type=hospital_care_type,
        )
    return get_correlation_matrix(filter_req)

@router.post("/cross-analysis", response_model=CrossAnalysisResponse)
def post_cross_analysis(req: CrossAnalysisRequest):
    """Cross-dimensional comparison by dimension & metric with top/bottom facility rankings."""
    return get_cross_analysis(req)
