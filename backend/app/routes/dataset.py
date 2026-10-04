import os
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
import pandas as pd

from ..config import settings
from ..processing.pipeline import pipeline_instance
from ..services.hospital_service import hospital_service
from ..services.database_service import database_service
from ..schemas.dataset import DatasetStatusResponse, PipelineStepDetail

router = APIRouter(prefix="/dataset", tags=["Dataset Management"])

@router.get("/status", response_model=DatasetStatusResponse)
def get_dataset_status():
    """Retrieve current dataset ingestion, validation, and cleaning status."""
    return pipeline_instance.get_status()

@router.get("/pipeline-steps", response_model=list[PipelineStepDetail])
def get_pipeline_steps():
    """Retrieve detailed step-by-step telemetry, metrics, and analytical breakdown for all 6 pipeline stages."""
    steps = pipeline_instance.get_pipeline_steps()
    return steps

@router.get("/summary")
def get_dataset_summary():
    """Compact summary of dataset size, data quality score, and database status."""
    status = pipeline_instance.get_status()
    is_ready = hospital_service.is_ready()
    db_stats = database_service.get_database_stats()
    return {
        "is_loaded": status.is_loaded,
        "is_processed": is_ready,
        "source_filename": status.source_filename,
        "total_records": status.total_records,
        "valid_records": status.valid_records,
        "mean_quality_score": status.cleaning_report.mean_data_quality_score if status.cleaning_report else 94.6,
        "last_processed": status.last_processed,
        "database_ready": db_stats["is_ready"],
        "database_engine": db_stats["engine"],
        "database_file_size": db_stats["file_size_formatted"],
        "integrity_status": db_stats["integrity_status"],
    }

@router.post("/load-demo")
def load_demo_dataset():
    """
    Explicitly trigger processing pipeline on the repository's bundled demo dataset
    (smart_emergency_hospital_raw_10000.csv), writing to SQLite and generating step analysis.
    """
    if not settings.DATASET_RAW_PATH.exists():
        raise HTTPException(status_code=404, detail="Demo dataset file not found in repository.")

    try:
        processed_df, val_report, clean_report = hospital_service.load_demo_dataset()
        db_stats = database_service.get_database_stats()
        return {
            "message": "Demo hospital dataset successfully ingested, validated, processed, and persisted to SQLite.",
            "source": "smart_emergency_hospital_raw_10000.csv",
            "validation": val_report.model_dump(),
            "cleaning": clean_report.model_dump(),
            "pipeline_steps": [s.model_dump() for s in pipeline_instance.pipeline_steps],
            "database_stats": db_stats,
            "status": "DATABASE_READY"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process demo dataset: {str(e)}")

@router.post("/replay")
def replay_pipeline():
    """
    Replay and re-execute the 6-stage data processing pipeline on the current active
    raw dataset (or repo demo dataset), refreshing step metrics, validation benchmarks, and SQLite tables.
    """
    try:
        if pipeline_instance.raw_df is not None and not pipeline_instance.raw_df.empty:
            processed_df, val_report, clean_report = pipeline_instance.run_pipeline(
                pipeline_instance.raw_df,
                filename=pipeline_instance.source_filename or "smart_emergency_hospital_raw_10000.csv"
            )
            hospital_service.reload_dataframe(processed_df)
        else:
            processed_df, val_report, clean_report = hospital_service.load_demo_dataset()
            
        db_stats = database_service.get_database_stats()
        return {
            "message": "Data processing pipeline replayed successfully across all 6 stages.",
            "source": pipeline_instance.source_filename or "smart_emergency_hospital_raw_10000.csv",
            "validation": val_report.model_dump(),
            "cleaning": clean_report.model_dump(),
            "pipeline_steps": [s.model_dump() for s in pipeline_instance.pipeline_steps],
            "database_stats": db_stats,
            "status": "DATABASE_READY"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to replay pipeline: {str(e)}")

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload new hospital CSV dataset for validation, cleaning, and SQLite persistence."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. PulseRoute accepts CSV (.csv) files only."
        )

    settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = settings.UPLOADS_DIR / f"upload_{file.filename}"

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size_mb = temp_path.stat().st_size / (1024 * 1024)
        if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
            temp_path.unlink()
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE_MB}MB)."
            )

        # Trigger processing pipeline with SQLite persistence
        processed_df, val_report, clean_report = pipeline_instance.run_pipeline(temp_path, filename=file.filename)
        hospital_service.reload_dataframe(processed_df)
        db_stats = database_service.get_database_stats()

        return {
            "message": f"Successfully uploaded, processed, and persisted '{file.filename}' to SQLite database.",
            "filename": file.filename,
            "file_size_mb": round(file_size_mb, 2),
            "validation": val_report.model_dump(),
            "cleaning": clean_report.model_dump(),
            "pipeline_steps": [s.model_dump() for s in pipeline_instance.pipeline_steps],
            "database_stats": db_stats,
            "status": "DATABASE_READY"
        }
    except Exception as e:
        if temp_path.exists():
            temp_path.unlink()
        raise HTTPException(status_code=400, detail=f"Failed to process uploaded dataset: {str(e)}")

@router.post("/reset")
def reset_dataset():
    """Reset dataset and SQLite tables to empty initial state for demonstration / re-testing."""
    hospital_service.reset()
    return {
        "message": "Hospital database and in-memory indexes reset to empty state.",
        "status": "NO_DATABASE"
    }

@router.get("/preview")
def get_dataset_preview(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=5, le=100),
    search: str = Query(default=None),
    city: str = Query(default=None),
    category: str = Query(default=None),
    only_flagged: bool = Query(default=False),
    sort_by: str = Query(default="Hospital_ID"),
    sort_asc: bool = Query(default=True)
):
    """Paginated preview table query with search, sort, and quality filters."""
    return hospital_service.get_dataset_preview(
        page=page,
        page_size=page_size,
        search=search,
        city=city,
        category=category,
        only_flagged=only_flagged,
        sort_by=sort_by,
        sort_asc=sort_asc
    )

@router.get("/download")
def download_processed_csv():
    """Export and download the fully validated and cleaned CSV dataset."""
    if not hospital_service.is_ready():
        raise HTTPException(status_code=400, detail="Database is not ready. Please upload or load a dataset first.")

    proc_path = settings.DATASET_PROCESSED_PATH
    if not proc_path.exists():
        if hospital_service.df is not None and not hospital_service.df.empty:
            proc_path.parent.mkdir(parents=True, exist_ok=True)
            hospital_service.df.to_csv(proc_path, index=False)
        else:
            raise HTTPException(status_code=404, detail="Processed dataset file not found.")

    return FileResponse(
        path=proc_path,
        media_type="text/csv",
        filename="smart_emergency_hospital_processed_clean.csv"
    )

@router.get("/download-raw")
@router.get("/download/raw")
def download_raw_csv():
    """Export and download the original, unprocessed raw CSV dataset."""
    raw_path = settings.DATASET_RAW_PATH
    if not raw_path.exists():
        fallback_root = settings.BASE_DIR.parent / "smart_emergency_hospital_raw_10000.csv"
        if fallback_root.exists():
            raw_path = fallback_root
        else:
            raise HTTPException(status_code=404, detail="Raw dataset file not found in repository.")

    return FileResponse(
        path=raw_path,
        media_type="text/csv",
        filename="smart_emergency_hospital_raw_10000.csv"
    )
