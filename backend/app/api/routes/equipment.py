from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.services.equipment_service import EquipmentService
from backend.app.models.equipment import EquipmentMetadata

router = APIRouter(prefix="/equipment", tags=["Equipment"])

@router.get("", response_model=List[EquipmentMetadata])
async def list_equipment():
    """Returns metadata for all monitored hospital equipment."""
    return EquipmentService.list_all()

@router.get("/{equipment_id}", response_model=EquipmentMetadata)
async def get_equipment(equipment_id: str):
    """Returns metadata and sensor configuration for a specific equipment ID."""
    eq = EquipmentService.get_by_id(equipment_id)
    if not eq:
        raise HTTPException(status_code=404, detail=f"Equipment '{equipment_id}' not found.")
    return eq
