from fastapi import APIRouter
from typing import Dict, Any
from backend.app.servicenow.client import servicenow_client

router = APIRouter(prefix="/servicenow", tags=["ServiceNow Integration"])

@router.get("/status")
async def get_servicenow_status():
    """Returns the current ServiceNow integration status without exposing credentials."""
    return servicenow_client.get_status()

@router.post("/test")
async def test_servicenow_connection():
    """Performs an active reachability test against the configured ServiceNow instance."""
    return await servicenow_client.test_connection()

@router.post("/sync/{equipment_id}")
async def sync_equipment_incident(equipment_id: str):
    """Dispatches a test incident for the equipment into ServiceNow or logs mock."""
    return await servicenow_client.create_incident(
        equipment_id=equipment_id,
        risk_data={"risk_level": "Warning", "failure_probability": 0.55, "flagged_sensors": []},
        recommended_action="Manual synchronization test initiated from dashboard."
    )
