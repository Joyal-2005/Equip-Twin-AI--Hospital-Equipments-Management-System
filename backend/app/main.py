import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.routes import (
    health_router,
    equipment_router,
    telemetry_router,
    digital_twin_router,
    servicenow_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("EquipTwin-AI")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "An AI-Driven Digital Twin Framework for Predictive Maintenance "
        "and Risk Management of Hospital Equipment.\n\n"
        "**CLINICAL NOTICE**: This platform is designed solely for biomedical equipment "
        "engineering and predictive maintenance. It is not intended for clinical diagnosis."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
api_prefix = settings.API_V1_PREFIX
app.include_router(health_router, prefix=api_prefix)
app.include_router(equipment_router, prefix=api_prefix)
app.include_router(telemetry_router, prefix=api_prefix)
app.include_router(digital_twin_router, prefix=api_prefix)
app.include_router(servicenow_router, prefix=api_prefix)

@app.on_event("startup")
async def startup_event():
    logger.info("EquipTwin-AI FastAPI Backend successfully initialized.")
    logger.info(f"API Prefix: {api_prefix} | Docs available at: http://{settings.BACKEND_HOST}:{settings.BACKEND_PORT}/docs")
    logger.info(f"ServiceNow Integration Enabled: {settings.SERVICENOW_ENABLED}")
    logger.info("Clinical Notice: Biomedical maintenance monitoring only. Not for clinical diagnosis.")

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "title": "An AI-Driven Digital Twin Framework for Predictive Maintenance and Risk Management of Hospital Equipment",
        "version": "1.0.0",
        "api_docs": "/docs",
        "health_check": f"{api_prefix}/health",
        "equipment_overview": f"{api_prefix}/twin/overview",
        "clinical_disclaimer": "This system provides predictive engineering telemetry and is NOT a medical diagnostic device."
    }
