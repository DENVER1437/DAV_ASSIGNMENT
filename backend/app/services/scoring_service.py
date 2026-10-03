import math
from typing import Dict, Any, Tuple
from ..schemas.hospital import ScoreBreakdown
from ..schemas.search import PriorityWeights

def calculate_suitability(
    hospital: Dict[str, Any],
    distance_km: float,
    radius_km: float,
    emergency_type: str,
    weights: PriorityWeights
) -> Tuple[int, ScoreBreakdown, str]:
    """
    Calculate an objective, weighted multi-criteria suitability score (0-100).
    Not a medical diagnosis; a decision-support heuristic.
    """
    # Normalize weights to sum to 1.0
    total_w = max(0.01, weights.distance + weights.bed_availability + weights.icu_availability + weights.waiting_time)
    w_dist = weights.distance / total_w
    w_bed = weights.bed_availability / total_w
    w_icu = weights.icu_availability / total_w
    w_wait = weights.waiting_time / total_w

    # 1. Distance Sub-score
    effective_radius = max(radius_km, 5.0)
    if distance_km <= 1.5:
        dist_score = 100.0
    else:
        decay = (distance_km / (effective_radius * 1.1)) ** 0.8
        dist_score = max(10.0, 100.0 * (1.0 - min(0.9, decay)))

    if dist_score >= 80:
        dist_rating = "Strong (Immediate Proximity)"
    elif dist_score >= 50:
        dist_rating = "Moderate Distance"
    else:
        dist_rating = "Extended Travel"

    # 2. Bed Availability Sub-score
    avail_beds = hospital.get("Available_Beds", 0)
    avail_pct = hospital.get("Bed_Availability_Pct", 15.0)
    bed_score = min(100.0, (avail_beds / 35.0) * 60.0 + (avail_pct / 30.0) * 40.0)
    bed_score = max(10.0, bed_score)

    if bed_score >= 75:
        bed_rating = "Strong Bed Availability"
    elif bed_score >= 45:
        bed_rating = "Moderate Bed Availability"
    else:
        bed_rating = "Limited Beds"

    # 3. ICU Availability Sub-score
    icu_avail = hospital.get("ICU_Available_Beds", 0)
    icu_score = min(100.0, (icu_avail / 6.0) * 100.0)
    icu_score = max(10.0, icu_score)

    if icu_score >= 75:
        icu_rating = "Strong ICU Availability"
    elif icu_score >= 35:
        icu_rating = "Limited ICU Capacity"
    else:
        icu_rating = "Critical / Very Low ICU"

    # 4. Waiting Time Sub-score
    wait_min = hospital.get("Estimated_Wait_Min", 25)
    wait_score = max(10.0, min(100.0, 100.0 - (wait_min - 5) * 1.8))

    if wait_score >= 75:
        wait_rating = "Low Wait (< 20 mins)"
    elif wait_score >= 50:
        wait_rating = "Moderate Wait (20-40 mins)"
    else:
        wait_rating = "High ER Wait (> 40 mins)"

    # 5. Emergency Capability Match Sub-score
    capability_points = 30.0  # Base
    if hospital.get("Emergency_Services") == "Yes":
        capability_points += 20.0
    if hospital.get("24x7_Service") == "Yes":
        capability_points += 15.0
    if hospital.get("Ambulance_Available") == "Yes":
        capability_points += 10.0

    # Specific emergency type alignment
    etype = (emergency_type or "").lower()
    if "trauma" in etype or "accident" in etype:
        if hospital.get("Trauma_Center") == "Yes":
            capability_points += 15.0
        if hospital.get("Orthopedics") == "Yes":
            capability_points += 10.0
    elif "cardiac" in etype or "chest" in etype:
        if hospital.get("Cardiology") == "Yes":
            capability_points += 15.0
        if icu_avail > 0:
            capability_points += 10.0
    elif "neuro" in etype or "stroke" in etype:
        if hospital.get("Neurology") == "Yes":
            capability_points += 15.0
        if icu_avail > 0:
            capability_points += 10.0
    elif "pediatric" in etype:
        if hospital.get("Pediatrics") == "Yes":
            capability_points += 25.0
    else:
        capability_points += 15.0

    cap_score = min(100.0, max(20.0, capability_points))
    if cap_score >= 80:
        cap_rating = "Fully Equipped"
    elif cap_score >= 50:
        cap_rating = "Adequate Facilities"
    else:
        cap_rating = "Basic Emergency"

    # Combine weighted score
    priority_component = (
        (w_dist * dist_score) +
        (w_bed * bed_score) +
        (w_icu * icu_score) +
        (w_wait * wait_score)
    )

    final_score = int(round(priority_component * 0.75 + cap_score * 0.25))
    final_score = max(15, min(99, final_score))

    breakdown = ScoreBreakdown(
        distance_score=round(dist_score, 1),
        bed_score=round(bed_score, 1),
        icu_score=round(icu_score, 1),
        capability_score=round(cap_score, 1),
        wait_score=round(wait_score, 1),
        distance_rating=dist_rating,
        bed_rating=bed_rating,
        icu_rating=icu_rating,
        capability_rating=cap_rating,
        wait_rating=wait_rating
    )

    # Human-readable "Why this hospital?" synthesis
    reasons = []
    if dist_score >= 70:
        reasons.append(f"Located only {distance_km:.1f} km away")
    if icu_avail >= 3:
        reasons.append(f"{icu_avail} verified critical ICU beds ready")
    elif avail_beds >= 10:
        reasons.append(f"{avail_beds} available inpatient beds")
    if wait_min <= 20:
        reasons.append(f"rapid estimated intake under {wait_min} mins")
    if hospital.get("Trauma_Center") == "Yes" and ("trauma" in etype or "accident" in etype):
        reasons.append("Level-1 trauma center active")
    if hospital.get("Cardiology") == "Yes" and "cardiac" in etype:
        reasons.append("specialized cardiology & cath-lab team on stand-by")

    if reasons:
        why = f"Recommended for this emergency: {', '.join(reasons)}."
    else:
        why = f"Emergency facility located within {distance_km:.1f} km with {avail_beds} beds and operational emergency triage."

    return final_score, breakdown, why
