from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Index
from datetime import datetime
from .session import Base

class HospitalRecord(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Hospital_ID = Column(String(50), unique=True, index=True)
    Hospital_Name = Column(String(255), index=True)
    City = Column(String(100), index=True)
    State = Column(String(100))
    Latitude = Column(Float, index=True)
    Longitude = Column(Float, index=True)
    Pincode = Column(String(20), index=True)
    Hospital_Category = Column(String(50), index=True)
    Hospital_Care_Type = Column(String(50))
    Hospital_Size = Column(String(50))
    
    Total_Beds = Column(Integer, default=0)
    Occupied_Beds = Column(Integer, default=0)
    Available_Beds = Column(Integer, default=0, index=True)
    ICU_Total_Beds = Column(Integer, default=0)
    ICU_Occupied_Beds = Column(Integer, default=0)
    ICU_Available_Beds = Column(Integer, default=0, index=True)
    
    Emergency_Services = Column(String(10), index=True)
    Ambulance_Available = Column(String(10))
    Trauma_Center = Column(String(10), index=True)
    Cardiology = Column(String(10))
    Neurology = Column(String(10))
    Orthopedics = Column(String(10))
    Pediatrics = Column(String(10))
    Gynecology = Column(String(10))
    Service_24x7 = Column("24x7_Service", String(10))
    
    Emergency_Load_Pct = Column(Float, default=0.0)
    Estimated_Wait_Min = Column(Integer, default=0)
    Average_Response_Time_Min = Column(Integer, default=0)
    Hospital_Rating = Column(Float, default=0.0, index=True)
    Daily_Emergency_Cases = Column(Integer, default=0)
    Staff_Availability_Pct = Column(Float, default=0.0)
    Last_Updated = Column(String(50))
    
    Bed_Occupancy_Pct = Column(Float, default=0.0)
    ICU_Occupancy_Pct = Column(Float, default=0.0)
    Bed_Availability_Pct = Column(Float, default=0.0)
    Emergency_Capacity_Level = Column(String(20), index=True)
    ICU_Capacity_Level = Column(String(20), index=True)
    Facility_Count = Column(Integer, default=0)
    Data_Quality_Score = Column(Float, default=100.0, index=True)
    Coordinates_Imputed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_hospitals_geo", "Latitude", "Longitude"),
        Index("idx_hospitals_city_er", "City", "Emergency_Services"),
        Index("idx_hospitals_beds", "Available_Beds", "ICU_Available_Beds"),
    )

class PipelineAuditLog(Base):
    __tablename__ = "pipeline_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(50), index=True)
    step_id = Column(Integer, index=True)
    step_name = Column(String(100))
    status = Column(String(20), default="COMPLETED")
    records_in = Column(Integer, default=0)
    records_out = Column(Integer, default=0)
    duration_ms = Column(Float, default=0.0)
    metrics_json = Column(Text)
    analysis_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class DatabaseSystemMetric(Base):
    __tablename__ = "database_system_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String(50)) # e.g. "VACUUM", "INTEGRITY_CHECK", "BULK_SYNC", "INDEX_REBUILD"
    duration_ms = Column(Float, default=0.0)
    status = Column(String(20), default="SUCCESS")
    details = Column(String(1000))
    timestamp = Column(DateTime, default=datetime.utcnow)
