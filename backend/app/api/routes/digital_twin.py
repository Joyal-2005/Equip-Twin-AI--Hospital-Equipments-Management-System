from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.app.services.digital_twin import digital_twin_service
from backend.app.models.incident import MaintenanceRequest
from backend.app.servicenow.client import servicenow_client

router = APIRouter(prefix="/twin", tags=["Digital Twin"])

@router.get("/overview", response_model=List[Dict[str, Any]])
async def get_all_twins_overview():
    """Returns overview cards for both equipment twins (status, risk, latest readings)."""
    return digital_twin_service.get_all_twins_overview()

@router.get("/{equipment_id}")
async def get_twin_snapshot(equipment_id: str):
    """Returns complete Digital Twin state for the requested equipment."""
    snap = digital_twin_service.get_twin_snapshot(equipment_id)
    if not snap:
        raise HTTPException(status_code=404, detail=f"Equipment '{equipment_id}' not found.")
    return snap

@router.get("/{equipment_id}/maintenance", response_model=List[Dict[str, Any]])
async def get_equipment_maintenance(equipment_id: str):
    """Returns maintenance requests and incident history for a specific equipment."""
    return digital_twin_service.get_maintenance_requests(equipment_id)

@router.post("/maintenance", response_model=Dict[str, Any])
async def create_maintenance_request(request: MaintenanceRequest):
    """
    Submits a maintenance request for an equipment.
    If ServiceNow is enabled, dispatches the incident ticket to ServiceNow Table API.
    """
    # Attempt ServiceNow dispatch
    sn_res = await servicenow_client.create_incident(
        equipment_id=request.equipment_id,
        risk_data={"risk_level": request.severity, "failure_probability": 0.8},
        recommended_action=request.title
    )

    if sn_res.get("ticket"):
        request.servicenow_incident_sys_id = sn_res["ticket"].get("sys_id")
        request.servicenow_incident_number = sn_res["ticket"].get("number")

    created = digital_twin_service.add_maintenance_request(request)
    return {
        "success": True,
        "request": created,
        "servicenow_result": sn_res
    }
