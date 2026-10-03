from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "PulseRoute Emergency Backend",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": "production-ready",
        "dataset_mode": "Synthetic Hospital Benchmark (10,035 Records)"
    }
