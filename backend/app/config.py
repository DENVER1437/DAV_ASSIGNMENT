import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5180,http://127.0.0.1:5180,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173,*"
        ).split(",")
        if origin.strip()
    ]
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'pulseroute.db'}")
    DATASET_RAW_PATH: Path = BASE_DIR / "data" / "raw" / "smart_emergency_hospital_raw_10000.csv"
    DATASET_PROCESSED_PATH: Path = BASE_DIR / "data" / "processed" / "smart_emergency_hospital_processed.csv"
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))

settings = Settings()

# Ensure runtime directories exist for deployment on Render/Linux
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.DATASET_RAW_PATH.parent, exist_ok=True)
os.makedirs(settings.DATASET_PROCESSED_PATH.parent, exist_ok=True)

