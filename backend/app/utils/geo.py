import math
import numpy as np
import pandas as pd
from typing import Optional, Tuple

EARTH_RADIUS_KM = 6371.0

# Known coordinates for Indian cities present in the dataset
CITY_CENTROIDS = {
    "ahmedabad": (23.0225, 72.5714),
    "bengaluru": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "delhi": (28.6139, 77.2090),
    "gandhinagar": (23.2156, 72.6369),
    "hyderabad": (17.3850, 78.4867),
    "indore": (22.7196, 75.8577),
    "jaipur": (26.9124, 75.7873),
    "kolkata": (22.5726, 88.3639),
    "mumbai": (19.0760, 72.8777),
    "nagpur": (21.1458, 79.0882),
    "pune": (18.5204, 73.8567),
    "rajkot": (22.3039, 70.8022),
    "surat": (21.1702, 72.8311),
    "vadodara": (22.3072, 73.1812),
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c

def haversine_vectorized(lat1: float, lon1: float, lat_series: pd.Series, lon_series: pd.Series) -> pd.Series:
    """Calculate distances in km for a vector of hospital coordinates."""
    lat1_rad = np.radians(lat1)
    lon1_rad = np.radians(lon1)
    lat2_rad = np.radians(lat_series.to_numpy(dtype=float))
    lon2_rad = np.radians(lon_series.to_numpy(dtype=float))

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon / 2.0) ** 2
    c = 2.0 * np.arcsin(np.clip(np.sqrt(a), 0, 1))
    return pd.Series(EARTH_RADIUS_KM * c, index=lat_series.index)

def is_valid_coordinate(lat: Optional[float], lon: Optional[float]) -> bool:
    """Validate latitude and longitude ranges."""
    if lat is None or lon is None or pd.isna(lat) or pd.isna(lon):
        return False
    try:
        lat_f = float(lat)
        lon_f = float(lon)
        # Check standard geographic bounds
        if not (-90.0 <= lat_f <= 90.0 and -180.0 <= lon_f <= 180.0):
            return False
        # Optional check for India region bounds (approx 6°N - 38°N, 68°E - 98°E)
        if not (6.0 <= lat_f <= 38.0 and 68.0 <= lon_f <= 98.0):
            return False
        return True
    except (ValueError, TypeError):
        return False

def resolve_location_query(query: str) -> Optional[Tuple[float, float, str]]:
    """Try resolving city name or query into coordinates."""
    cleaned = query.strip().lower()
    for city, coords in CITY_CENTROIDS.items():
        if city in cleaned:
            return coords[0], coords[1], city.title()
    return None
