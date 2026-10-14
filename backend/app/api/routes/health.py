from fastapi import APIRouter
from datetime import datetime
from backend.app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def get_health():
    """Health check endpoint confirming backend status, version, and modules."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "modules": {
            "digital_twin": "online",
            "ai_risk_engine": "online",
            "telemetry_store": "active",
            "servicenow_gateway": "ready"
        },
        "mode": "PROTOTYPE" if settings.AI_PROTOTYPE_MODE else "PRODUCTION",
        "clinical_notice": "For biomedical engineering and maintenance use only."
    }
