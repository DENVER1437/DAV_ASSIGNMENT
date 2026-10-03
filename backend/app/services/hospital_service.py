import os
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

from ..config import settings
from ..schemas.search import HospitalSearchRequest, HospitalSearchResponse, PriorityWeights
from ..schemas.hospital import HospitalResult
from ..utils.geo import (
    haversine_distance,
    haversine_vectorized,
    resolve_location_query,
    CITY_CENTROIDS
)
from ..processing.pipeline import pipeline_instance
from .scoring_service import calculate_suitability

from .database_service import database_service

class HospitalService:
    def __init__(self):
        self._df: Optional[pd.DataFrame] = None

    def is_ready(self) -> bool:
        """Check if hospital database has been uploaded and processed, or explicitly loaded."""
        if self._df is not None and not self._df.empty:
            return True
        if pipeline_instance.processed_df is not None and not pipeline_instance.processed_df.empty:
            self._df = pipeline_instance.processed_df
            return True
        return False

    def get_df(self) -> pd.DataFrame:
        """Get processed dataframe if ready, otherwise return empty DataFrame."""
        if self._df is not None and not self._df.empty:
            return self._df
        if pipeline_instance.processed_df is not None and not pipeline_instance.processed_df.empty:
            self._df = pipeline_instance.processed_df
            return self._df
        return pd.DataFrame()

    def load_demo_dataset(self) -> Tuple[pd.DataFrame, Any, Any]:
        """Explicitly process and load the bundled synthetic project dataset into memory and SQLite."""
        if not settings.DATASET_RAW_PATH.exists():
            raise FileNotFoundError("Raw demo dataset file not found on server.")
        df_proc, val_rep, clean_rep = pipeline_instance.run_pipeline(
            settings.DATASET_RAW_PATH,
            filename="smart_emergency_hospital_raw_10000.csv"
        )
        self._df = df_proc
        return df_proc, val_rep, clean_rep

    def reload_dataframe(self, df: pd.DataFrame):
        """Update active dataset in memory and ensure SQLite persistence."""
        self._df = df.copy()
        pipeline_instance.processed_df = df.copy()
        database_service.sync_dataframe_to_db(df)

    def reset(self):
        """Reset in-memory dataset and SQLite tables to uninitialized state."""
        self._df = None
        pipeline_instance.reset()
        database_service.reset_database()


    def search_hospitals(self, req: HospitalSearchRequest) -> HospitalSearchResponse:
        if not self.is_ready():
            return HospitalSearchResponse(
                total_matches=0,
                radius_km=req.radius_km,
                detected_location="Database not loaded",
                center_coordinates=None,
                page=1,
                page_size=req.page_size,
                total_pages=0,
                results=[],
                empty_suggestion="Upload and process a hospital database to start."
            )

        df = self.get_df().copy()
        
        # 1. Resolve search center
        center_lat: Optional[float] = req.latitude
        center_lon: Optional[float] = req.longitude
        detected_loc: Optional[str] = None

        if (center_lat is None or center_lon is None) and (req.city or req.area_or_pincode):
            query_str = f"{req.city or ''} {req.area_or_pincode or ''}".strip()
            resolved = resolve_location_query(query_str)
            if resolved:
                center_lat, center_lon, detected_loc = resolved
            else:
                matching_city = df[df["City"].str.lower().str.contains((req.city or req.area_or_pincode).lower().strip())]
                if not matching_city.empty:
                    center_lat = float(matching_city["Latitude"].median())
                    center_lon = float(matching_city["Longitude"].median())
                    detected_loc = str(matching_city.iloc[0]["City"])

        # Fallback if no location provided at all
        if center_lat is None or center_lon is None:
            center_lat, center_lon = 12.9716, 77.5946
            detected_loc = "Bengaluru (Default)"
        elif not detected_loc:
            detected_loc = f"{center_lat:.4f}, {center_lon:.4f}"

        # 2. Distance calculation via Haversine formula
        df["distance_km"] = haversine_vectorized(center_lat, center_lon, df["Latitude"], df["Longitude"]).round(2)
        
        # Radius filter
        mask = df["distance_km"] <= req.radius_km
        filtered_df = df[mask].copy()

        # 3. Facility requirements filter
        facility_col_map = {
            "icu": "ICU_Available_Beds",
            "emergency department": "Emergency_Services",
            "emergency": "Emergency_Services",
            "ambulance": "Ambulance_Available",
            "trauma center": "Trauma_Center",
            "trauma": "Trauma_Center",
            "cardiology": "Cardiology",
            "neurology": "Neurology",
            "orthopedics": "Orthopedics",
            "pediatrics": "Pediatrics",
            "gynecology": "Gynecology",
            "24x7 service": "24x7_Service",
            "24x7": "24x7_Service",
        }

        for fac in req.required_facilities:
            key = fac.strip().lower()
            col = facility_col_map.get(key)
            if col and col in filtered_df.columns:
                if col == "ICU_Available_Beds":
                    filtered_df = filtered_df[filtered_df[col] > 0]
                else:
                    filtered_df = filtered_df[filtered_df[col] == "Yes"]

        # Rating & wait time filters
        if req.min_rating:
            filtered_df = filtered_df[filtered_df["Hospital_Rating"] >= req.min_rating]
        if req.max_wait_min:
            filtered_df = filtered_df[filtered_df["Estimated_Wait_Min"] <= req.max_wait_min]

        total_matches = len(filtered_df)
        empty_suggestion = None

        if total_matches == 0:
            broader_count = len(df[df["distance_km"] <= (req.radius_km * 2.0)])
            if broader_count > 0 and len(req.required_facilities) > 0:
                empty_suggestion = f"No hospitals match all {len(req.required_facilities)} requirements within {req.radius_km:.0f} km. Consider expanding radius to {req.radius_km * 2:.0f} km ({broader_count} facilities exist) or removing optional filters."
            else:
                empty_suggestion = f"No facilities found within {req.radius_km:.0f} km. Try increasing search radius to 20 km or 50 km."

        # 4. Calculate suitability scores & explanations
        results_list = []
        for _, row in filtered_df.iterrows():
            row_dict = row.to_dict()
            dist = float(row["distance_km"])
            score, breakdown, why = calculate_suitability(
                hospital=row_dict,
                distance_km=dist,
                radius_km=req.radius_km,
                emergency_type=req.emergency_type or "General Emergency",
                weights=req.priorities
            )
            row_dict["suitability_score"] = score
            row_dict["score_breakdown"] = breakdown.model_dump()
            row_dict["why_recommended"] = why
            results_list.append(row_dict)

        # 5. Sorting
        sort_by = (req.sort_by or "suitability").lower()
        if sort_by == "distance":
            results_list.sort(key=lambda x: x["distance_km"])
        elif sort_by == "wait_time":
            results_list.sort(key=lambda x: x["Estimated_Wait_Min"])
        elif sort_by == "available_beds":
            results_list.sort(key=lambda x: x["Available_Beds"], reverse=True)
        else: # default suitability
            results_list.sort(key=lambda x: (x["suitability_score"], -x["distance_km"]), reverse=True)

        # 6. Pagination
        start = (req.page - 1) * req.page_size
        end = start + req.page_size
        paged_results = results_list[start:end]
        total_pages = max(1, (total_matches + req.page_size - 1) // req.page_size)

        return HospitalSearchResponse(
            total_matches=total_matches,
            radius_km=req.radius_km,
            detected_location=detected_loc,
            center_coordinates={"lat": center_lat, "lon": center_lon} if center_lat and center_lon else None,
            page=req.page,
            page_size=req.page_size,
            total_pages=total_pages,
            results=paged_results,
            empty_suggestion=empty_suggestion
        )

    def get_hospital_by_id(self, hospital_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_ready():
            return None
        df = self.get_df()
        matches = df[df["Hospital_ID"] == hospital_id]
        if matches.empty:
            return None
        return matches.iloc[0].to_dict()

    def get_dataset_preview(
        self,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        city: Optional[str] = None,
        category: Optional[str] = None,
        only_flagged: bool = False,
        sort_by: str = "Hospital_ID",
        sort_asc: bool = True
    ) -> Dict[str, Any]:
        """Paginated dataset query for the Data Management console."""
        if not self.is_ready():
            return {
                "total": 0,
                "page": 1,
                "page_size": page_size,
                "total_pages": 0,
                "records": [],
            }

        df = self.get_df().copy()

        if search:
            s = search.lower().strip()
            df = df[
                df["Hospital_Name"].astype(str).str.lower().str.contains(s) |
                df["Hospital_ID"].astype(str).str.lower().str.contains(s) |
                df["City"].astype(str).str.lower().str.contains(s) |
                df["Pincode"].astype(str).str.contains(s)
            ]

        if city and city.lower() != "all":
            df = df[df["City"].str.lower() == city.lower()]

        if category and category.lower() != "all":
            df = df[df["Hospital_Category"].str.lower() == category.lower()]

        if only_flagged:
            if "Coordinates_Imputed" in df.columns:
                df = df[df["Coordinates_Imputed"] | (df["Data_Quality_Score"] < 90)]
            else:
                df = df[df["Data_Quality_Score"] < 90]

        total = len(df)

        if sort_by in df.columns:
            df = df.sort_values(by=sort_by, ascending=sort_asc)

        start = (page - 1) * page_size
        end = start + page_size
        paged = df.iloc[start:end].to_dict(orient="records")

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
            "records": paged,
        }

hospital_service = HospitalService()
