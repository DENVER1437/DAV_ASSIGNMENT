import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
from ..utils.geo import is_valid_coordinate, CITY_CENTROIDS

YES_SET = {"yes", "true", "1", "available", "y"}
NO_SET = {"no", "false", "0", "unavailable", "n", "none", "nan"}

def normalize_yes_no(val) -> str:
    """Normalize inconsistent categorical Yes/No/Available/etc strings."""
    if pd.isna(val):
        return "No"
    s = str(val).strip().lower()
    if s in YES_SET:
        return "Yes"
    if s in NO_SET:
        return "No"
    return "Yes" if "avail" in s or "yes" in s else "No"

def clean_hospital_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Execute end-to-end cleaning pipeline on raw hospital dataframe."""
    df_clean = df.copy()
    stats = {
        "duplicates_removed": 0,
        "missing_values_imputed": 0,
        "invalid_coordinates_handled": 0,
        "outliers_flagged": 0,
        "categorical_values_normalized": 0,
    }

    # 1. Deduplication
    initial_rows = len(df_clean)
    df_clean = df_clean.drop_duplicates(subset=["Hospital_ID"], keep="first")
    stats["duplicates_removed"] = initial_rows - len(df_clean)

    # 2. Normalize categorical boolean flags
    yes_no_cols = [
        "Emergency_Services", "Ambulance_Available", "Trauma_Center",
        "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
        "Gynecology", "24x7_Service"
    ]
    for col in yes_no_cols:
        if col in df_clean.columns:
            original = df_clean[col].copy()
            df_clean[col] = df_clean[col].apply(normalize_yes_no)
            non_standard = (original.astype(str).str.strip().str.lower() != df_clean[col].str.lower()).sum()
            stats["categorical_values_normalized"] += int(non_standard)

    # 3. Handle missing Hospital_Name
    missing_names = df_clean["Hospital_Name"].isna()
    if missing_names.sum() > 0:
        df_clean.loc[missing_names, "Hospital_Name"] = df_clean.loc[missing_names].apply(
            lambda r: f"{r['City']} Emergency Medical Center ({r['Hospital_ID']})", axis=1
        )
        stats["missing_values_imputed"] += int(missing_names.sum())

    # 4. Numeric Bed Imputation & Consistency
    df_clean["Total_Beds"] = pd.to_numeric(df_clean["Total_Beds"], errors="coerce").fillna(50).astype(int)
    df_clean["Occupied_Beds"] = pd.to_numeric(df_clean["Occupied_Beds"], errors="coerce").fillna(25).astype(int)
    
    # Fix outlier where occupied > total
    invalid_beds = df_clean["Occupied_Beds"] > df_clean["Total_Beds"]
    if invalid_beds.sum() > 0:
        df_clean.loc[invalid_beds, "Occupied_Beds"] = df_clean.loc[invalid_beds, "Total_Beds"]
        stats["outliers_flagged"] += int(invalid_beds.sum())

    missing_avail = df_clean["Available_Beds"].isna()
    df_clean.loc[missing_avail, "Available_Beds"] = (
        df_clean.loc[missing_avail, "Total_Beds"] - df_clean.loc[missing_avail, "Occupied_Beds"]
    ).clip(lower=0)
    stats["missing_values_imputed"] += int(missing_avail.sum())
    df_clean["Available_Beds"] = df_clean["Available_Beds"].astype(int)

    # ICU Bed Imputation
    df_clean["ICU_Total_Beds"] = pd.to_numeric(df_clean["ICU_Total_Beds"], errors="coerce").fillna(5).astype(int)
    df_clean["ICU_Occupied_Beds"] = pd.to_numeric(df_clean["ICU_Occupied_Beds"], errors="coerce").fillna(2).astype(int)
    
    invalid_icu = df_clean["ICU_Occupied_Beds"] > df_clean["ICU_Total_Beds"]
    if invalid_icu.sum() > 0:
        df_clean.loc[invalid_icu, "ICU_Occupied_Beds"] = df_clean.loc[invalid_icu, "ICU_Total_Beds"]
        stats["outliers_flagged"] += int(invalid_icu.sum())

    missing_icu_avail = df_clean["ICU_Available_Beds"].isna()
    df_clean.loc[missing_icu_avail, "ICU_Available_Beds"] = (
        df_clean.loc[missing_icu_avail, "ICU_Total_Beds"] - df_clean.loc[missing_icu_avail, "ICU_Occupied_Beds"]
    ).clip(lower=0)
    stats["missing_values_imputed"] += int(missing_icu_avail.sum())
    df_clean["ICU_Available_Beds"] = df_clean["ICU_Available_Beds"].astype(int)

    # 5. Rating & Waiting Time Imputation
    median_rating = float(df_clean["Hospital_Rating"].median()) if not df_clean["Hospital_Rating"].isna().all() else 3.8
    missing_rating = df_clean["Hospital_Rating"].isna()
    df_clean["Hospital_Rating"] = df_clean["Hospital_Rating"].fillna(round(median_rating, 1)).astype(float)
    stats["missing_values_imputed"] += int(missing_rating.sum())

    missing_load = df_clean["Emergency_Load_Pct"].isna()
    computed_load = ((df_clean["Occupied_Beds"] / df_clean["Total_Beds"]) * 100).round(1).clip(0, 100)
    df_clean["Emergency_Load_Pct"] = df_clean["Emergency_Load_Pct"].fillna(computed_load).astype(float)
    stats["missing_values_imputed"] += int(missing_load.sum())

    df_clean["Estimated_Wait_Min"] = pd.to_numeric(df_clean["Estimated_Wait_Min"], errors="coerce").fillna(25).astype(int)
    df_clean["Average_Response_Time_Min"] = pd.to_numeric(df_clean["Average_Response_Time_Min"], errors="coerce").fillna(15).astype(int)
    df_clean["Daily_Emergency_Cases"] = pd.to_numeric(df_clean["Daily_Emergency_Cases"], errors="coerce").fillna(30).astype(int)
    df_clean["Staff_Availability_Pct"] = pd.to_numeric(df_clean["Staff_Availability_Pct"], errors="coerce").fillna(85.0).astype(float)

    # 6. Coordinate Validation & Smart Imputation
    df_clean["Coordinates_Imputed"] = False
    coords_fixed = 0
    for idx, row in df_clean.iterrows():
        lat = row.get("Latitude")
        lon = row.get("Longitude")
        if not is_valid_coordinate(lat, lon):
            coords_fixed += 1
            city = str(row.get("City", "")).strip().lower()
            if city in CITY_CENTROIDS:
                c_lat, c_lon = CITY_CENTROIDS[city]
                # Small deterministic jitter within city radius (0.005 to 0.04 degrees ~ 0.5km to 4km)
                h_hash = hash(str(row.get("Hospital_ID", ""))) % 100
                jitter_lat = ((h_hash % 20) - 10) * 0.003
                jitter_lon = (((h_hash // 20) % 20) - 10) * 0.003
                df_clean.at[idx, "Latitude"] = round(c_lat + jitter_lat, 6)
                df_clean.at[idx, "Longitude"] = round(c_lon + jitter_lon, 6)
                df_clean.at[idx, "Coordinates_Imputed"] = True
            else:
                # Default to fallback center
                df_clean.at[idx, "Latitude"] = 20.5937
                df_clean.at[idx, "Longitude"] = 78.9629
                df_clean.at[idx, "Coordinates_Imputed"] = True

    stats["invalid_coordinates_handled"] = coords_fixed
    df_clean["Latitude"] = df_clean["Latitude"].astype(float)
    df_clean["Longitude"] = df_clean["Longitude"].astype(float)

    return df_clean, stats
