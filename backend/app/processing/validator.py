import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from ..schemas.dataset import DatasetValidationReport
from ..utils.geo import is_valid_coordinate

REQUIRED_COLUMNS = [
    "Hospital_ID", "Hospital_Name", "City", "State", "Latitude", "Longitude",
    "Pincode", "Hospital_Category", "Hospital_Care_Type", "Hospital_Size",
    "Total_Beds", "Occupied_Beds", "Available_Beds", "ICU_Total_Beds",
    "ICU_Occupied_Beds", "ICU_Available_Beds", "Emergency_Services",
    "Ambulance_Available", "Trauma_Center", "Cardiology", "Neurology",
    "Orthopedics", "Pediatrics", "Gynecology", "24x7_Service",
    "Emergency_Load_Pct", "Estimated_Wait_Min", "Average_Response_Time_Min",
    "Hospital_Rating", "Daily_Emergency_Cases", "Staff_Availability_Pct",
    "Last_Updated"
]

def validate_raw_dataset(df: pd.DataFrame) -> Tuple[DatasetValidationReport, Dict[str, Any]]:
    """Thoroughly audit raw hospital dataset for structural & data quality anomalies."""
    total_records = len(df)
    
    # 1. Schema check
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Uploaded CSV is missing mandatory columns: {', '.join(missing_cols)}")
    
    # 2. Duplicate detection
    exact_duplicates = int(df.duplicated().sum())
    id_duplicates = int(df.duplicated(subset=["Hospital_ID"]).sum())
    duplicate_records = max(exact_duplicates, id_duplicates)
    
    # 3. Missing values per column
    missing_counts = df.isnull().sum()
    missing_dict = {col: int(count) for col, count in missing_counts.items() if count > 0}
    
    # 4. Coordinate validation
    invalid_coords = 0
    for _, row in df.iterrows():
        lat = row.get("Latitude")
        lon = row.get("Longitude")
        if not is_valid_coordinate(lat, lon):
            invalid_coords += 1
            
    # 5. Categorical inconsistencies
    cat_inconsistencies = {}
    yes_no_cols = [
        "Emergency_Services", "Ambulance_Available", "Trauma_Center",
        "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
        "Gynecology", "24x7_Service"
    ]
    for col in yes_no_cols:
        if col in df.columns:
            non_standard = df[~df[col].astype(str).str.strip().isin(["Yes", "No", "nan"])][col].count()
            if non_standard > 0:
                cat_inconsistencies[col] = int(non_standard)
                
    # 6. Numeric outliers
    outliers_count = 0
    # Plausible operational limits
    if "Total_Beds" in df.columns:
        outliers_count += int((df["Total_Beds"] > 2500).sum())
    if "Estimated_Wait_Min" in df.columns:
        outliers_count += int((df["Estimated_Wait_Min"] > 180).sum())
    if "Occupied_Beds" in df.columns and "Total_Beds" in df.columns:
        outliers_count += int((df["Occupied_Beds"] > df["Total_Beds"]).sum())
        
    valid_records = max(0, total_records - duplicate_records - invalid_coords)
    
    report = DatasetValidationReport(
        total_records=total_records,
        valid_records=valid_records,
        duplicate_records=duplicate_records,
        missing_value_counts=missing_dict,
        invalid_coordinates_count=invalid_coords,
        outliers_count=outliers_count,
        categorical_inconsistencies=cat_inconsistencies,
        is_valid=True,
        summary_message=f"Validation completed: {total_records} ingested, {duplicate_records} duplicates, {invalid_coords} invalid coordinates, {sum(missing_dict.values())} missing values detected."
    )
    
    details = {
        "missing_columns": missing_cols,
        "exact_duplicates": exact_duplicates,
        "id_duplicates": id_duplicates,
    }
    
    return report, details
