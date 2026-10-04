import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routes import health, dataset, hospitals, analytics, database
from .database.session import engine, Base


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("careroute")

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        from .services.hospital_service import hospital_service
        hospital_service.is_ready()
    except Exception as e:
        logger.warning(f"Database schema/data init note: {e}")

    yield
    logger.info("CareRoute shutting down gracefully.")


app = FastAPI(
    title="CareRoute API",
    description="Smart Emergency Hospital Finder & Critical Care Network",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration - supports localhost, Vercel deployments, and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_origins=settings.CORS_ORIGINS if "*" not in settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom HTTP exception response
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "Hospital telemetry and routing services encountered an unexpected issue.",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else None
        }
    )

# Include Routers
app.include_router(health.router, prefix="/api")
app.include_router(dataset.router, prefix="/api")
app.include_router(database.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/")
def root():
    return {
        "platform": "PulseRoute",
        "tagline": "Emergency care, closer to you.",
        "status": "Operational",
        "api_documentation": "/docs"
    }
