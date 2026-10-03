import pandas as pd
import numpy as np

DERIVED_FIELD_NAMES = [
    "Bed_Occupancy_Pct",
    "ICU_Occupancy_Pct",
    "Bed_Availability_Pct",
    "Emergency_Capacity_Level",
    "ICU_Capacity_Level",
    "Facility_Count",
    "Data_Quality_Score"
]

def engineer_features(df: pd.DataFrame, raw_df: pd.DataFrame = None) -> pd.DataFrame:
    """Generate derived intelligence fields & record data-quality scores."""
    df_feat = df.copy()

    # 1. Bed & ICU Occupancy & Availability Percentages
    total_beds = df_feat["Total_Beds"].replace(0, 1)
    df_feat["Bed_Occupancy_Pct"] = ((df_feat["Occupied_Beds"] / total_beds) * 100).round(1).clip(0, 100)
    df_feat["Bed_Availability_Pct"] = ((df_feat["Available_Beds"] / total_beds) * 100).round(1).clip(0, 100)

    icu_total = df_feat["ICU_Total_Beds"].replace(0, 1)
    df_feat["ICU_Occupancy_Pct"] = ((df_feat["ICU_Occupied_Beds"] / icu_total) * 100).round(1).clip(0, 100)
    df_feat["ICU_Availability_Pct"] = ((df_feat["ICU_Available_Beds"] / icu_total) * 100).round(1).clip(0, 100)

    # 2. Capacity Level Classification
    def classify_emergency_capacity(avail_pct):
        if avail_pct >= 25.0:
            return "High"
        elif avail_pct >= 10.0:
            return "Moderate"
        return "Critical"

    def classify_icu_capacity(icu_avail):
        if icu_avail >= 5:
            return "High"
        elif icu_avail >= 2:
            return "Moderate"
        return "Critical"

    df_feat["Emergency_Capacity_Level"] = df_feat["Bed_Availability_Pct"].apply(classify_emergency_capacity)
    df_feat["ICU_Capacity_Level"] = df_feat["ICU_Available_Beds"].apply(classify_icu_capacity)

    # 3. Facility Count
    fac_cols = [
        "Emergency_Services", "Ambulance_Available", "Trauma_Center",
        "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
        "Gynecology", "24x7_Service"
    ]
    df_feat["Facility_Count"] = 0
    for col in fac_cols:
        if col in df_feat.columns:
            df_feat["Facility_Count"] += (df_feat[col] == "Yes").astype(int)

    # 4. Data Quality Score (0 - 100)
    # Reflects data reliability, completeness, and cleanliness of this hospital record
    score = pd.Series(100.0, index=df_feat.index)

    if "Coordinates_Imputed" in df_feat.columns:
        score -= df_feat["Coordinates_Imputed"].astype(bool) * 20.0

    if raw_df is not None and "Hospital_ID" in raw_df.columns:
        raw_dedup = raw_df.drop_duplicates(subset=["Hospital_ID"]).set_index("Hospital_ID")
        aligned_raw = raw_dedup.reindex(df_feat["Hospital_ID"])

        if "Hospital_Name" in aligned_raw.columns:
            score -= aligned_raw["Hospital_Name"].isna().values * 15.0
        if "Latitude" in aligned_raw.columns and "Longitude" in aligned_raw.columns:
            bad_raw_coords = (aligned_raw["Latitude"].isna() | aligned_raw["Longitude"].isna()).values
            score -= bad_raw_coords * 10.0
        if "Available_Beds" in aligned_raw.columns:
            score -= aligned_raw["Available_Beds"].isna().values * 5.0
        if "ICU_Available_Beds" in aligned_raw.columns:
            score -= aligned_raw["ICU_Available_Beds"].isna().values * 5.0
        if "Hospital_Rating" in aligned_raw.columns:
            score -= aligned_raw["Hospital_Rating"].isna().values * 5.0

    # Rating boundary check
    rating_out_of_bounds = ((df_feat["Hospital_Rating"] < 1.0) | (df_feat["Hospital_Rating"] > 5.0)).values
    score -= rating_out_of_bounds * 10.0

    # Bed count logical consistency
    bed_inconsistent = ((df_feat["Occupied_Beds"] + df_feat["Available_Beds"]) != df_feat["Total_Beds"]).values
    score -= bed_inconsistent * 5.0

    df_feat["Data_Quality_Score"] = score.clip(lower=40.0, upper=100.0).round(1).values
    return df_feat
