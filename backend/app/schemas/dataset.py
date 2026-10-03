from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class DatasetValidationReport(BaseModel):
    total_records: int
    valid_records: int
    duplicate_records: int
    missing_value_counts: Dict[str, int]
    invalid_coordinates_count: int
    outliers_count: int
    categorical_inconsistencies: Dict[str, int]
    is_valid: bool
    summary_message: str

class DatasetCleaningReport(BaseModel):
    duplicates_removed: int
    missing_values_imputed: int
    invalid_coordinates_handled: int
    outliers_flagged: int
    categorical_values_normalized: int
    derived_fields_generated: List[str]
    total_processed_records: int
    mean_data_quality_score: float

class PipelineStepMetric(BaseModel):
    label: str
    value: str
    hint: Optional[str] = None

class PipelineStepBeforeAfter(BaseModel):
    title: str
    before: str
    after: str
    insight: str

class PipelineStepDetail(BaseModel):
    id: int
    title: str
    short_desc: str
    badge: str
    status: str = "COMPLETED"
    duration_ms: float = 0.0
    headline: str
    objective: str
    algorithm: str
    metrics: List[PipelineStepMetric]
    analysis: str
    before_after: PipelineStepBeforeAfter
    logs: List[str]

class DatasetStatusResponse(BaseModel):
    is_loaded: bool
    is_processed: bool
    source_filename: str
    total_records: int
    valid_records: int
    last_processed: Optional[str] = None
    validation_report: Optional[DatasetValidationReport] = None
    cleaning_report: Optional[DatasetCleaningReport] = None
    pipeline_steps: Optional[List[PipelineStepDetail]] = None
    database_ready: Optional[bool] = False
    database_size_formatted: Optional[str] = None
    integrity_status: Optional[str] = None

class SqlQueryRequest(BaseModel):
    query: str
    limit: Optional[int] = 50

class SqlQueryResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    duration_ms: float
    query_executed: str
    is_truncated: bool
    status: str

class DatabaseStatsResponse(BaseModel):
    engine: str
    database_file: str
    file_path: str
    file_size_bytes: int
    file_size_kb: float
    file_size_mb: float
    file_size_formatted: str
    total_tables: int
    table_names: List[str]
    hospitals_count: int
    audit_logs_count: int
    active_indexes: List[str]
    indexes_count: int
    integrity_check: str
    integrity_status: str
    journal_mode: str
    synchronous: str
    page_size_bytes: int
    page_count: int
    query_benchmark_ms: float
    is_ready: bool
    status: str
