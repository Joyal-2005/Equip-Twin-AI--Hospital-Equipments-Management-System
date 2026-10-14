from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
from datetime import datetime
import random
from backend.app.models.telemetry import TelemetryPayload, TelemetryRecord
from backend.app.models.equipment import DataSource
from backend.app.services.telemetry_store import telemetry_store

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post("", response_model=TelemetryRecord)
async def ingest_telemetry(payload: TelemetryPayload):
    """
    Ingests live or simulated sensor telemetry.
    Computes AI anomaly detection, updates circular buffer,
    and updates the active Digital Twin state.
    """
    if payload.equipment_id not in ["VEN-001", "DIA-001"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported equipment_id '{payload.equipment_id}'. Allowed: VEN-001, DIA-001."
        )

    record = telemetry_store.ingest(payload)
    return record

@router.get("/{equipment_id}/latest", response_model=TelemetryRecord)
async def get_latest_telemetry(equipment_id: str):
    """Returns the most recent telemetry packet for the specified equipment."""
    rec = telemetry_store.get_latest(equipment_id)
    if not rec:
        raise HTTPException(status_code=404, detail=f"No telemetry available for '{equipment_id}'.")
    return rec

@router.get("/{equipment_id}/history", response_model=List[TelemetryRecord])
async def get_telemetry_history(equipment_id: str, limit: int = Query(default=30, ge=1, le=120)):
    """Returns historical time-series telemetry records for charting."""
    return telemetry_store.get_history(equipment_id, limit=limit)

@router.post("/simulate/{equipment_id}")
async def trigger_simulated_packet(
    equipment_id: str,
    scenario: str = Query(default="normal", pattern="^(normal|warning|critical)$")
):
    """
    Generates and ingests a sample simulated packet on demand.
    Allows dashboard users to test state transitions (Normal, Warning, Critical).
    All data is clearly tagged as data_source: SIMULATED.
    """
    now_iso = datetime.utcnow().isoformat() + "Z"

    if equipment_id == "VEN-001":
        if scenario == "critical":
            readings = {
                "airway_pressure": round(random.choice([7.2, 36.8]), 2),  # Critical breach
                "flow_rate": round(random.choice([10.5, 76.2]), 2),
                "dht11_temperature": round(random.uniform(34.0, 37.5), 2),
                "dht11_humidity": round(random.uniform(82.0, 90.0), 2),
                "dc_voltage": round(random.uniform(10.2, 10.7), 2)  # Low voltage critical
            }
        elif scenario == "warning":
            readings = {
                "airway_pressure": round(random.uniform(26.0, 29.5), 2),  # Warning drift
                "flow_rate": round(random.uniform(21.0, 23.5), 2),
                "dht11_temperature": round(random.uniform(29.0, 31.5), 2),
                "dht11_humidity": round(random.uniform(72.0, 78.0), 2),
                "dc_voltage": round(random.uniform(11.4, 11.6), 2)
            }
        else:
            readings = {
                "airway_pressure": round(random.uniform(18.0, 22.0), 2),
                "flow_rate": round(random.uniform(35.0, 45.0), 2),
                "dht11_temperature": round(random.uniform(22.0, 25.0), 2),
                "dht11_humidity": round(random.uniform(48.0, 58.0), 2),
                "dc_voltage": round(random.uniform(11.9, 12.2), 2)
            }

    elif equipment_id == "DIA-001":
        if scenario == "critical":
            readings = {
                "air_in_blood": 1.0,  # CRITICAL AIR BUBBLE IN BLOOD
                "ds18b20_temperature": round(random.choice([34.1, 38.9]), 2),
                "venous_pressure": round(random.choice([45.0, 228.0]), 2),
                "conductivity": round(random.choice([12.2, 15.6]), 2)
            }
        elif scenario == "warning":
            readings = {
                "air_in_blood": 0.0,
                "ds18b20_temperature": round(random.uniform(37.6, 38.0), 2),
                "venous_pressure": round(random.uniform(155.0, 175.0), 2),
                "conductivity": round(random.uniform(14.6, 14.9), 2)
            }
        else:
            readings = {
                "air_in_blood": 0.0,
                "ds18b20_temperature": round(random.uniform(36.5, 37.1), 2),
                "venous_pressure": round(random.uniform(105.0, 125.0), 2),
                "conductivity": round(random.uniform(13.6, 14.1), 2)
            }
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported equipment '{equipment_id}'")

    payload = TelemetryPayload(
        equipment_id=equipment_id,
        data_source=DataSource.SIMULATED,
        timestamp=now_iso,
        readings=readings,
        battery_level=95.0,
        metadata={"simulation_scenario": scenario, "triggered_by": "on_demand_api"}
    )

    record = telemetry_store.ingest(payload)
    return {
        "message": f"Simulated {scenario.upper()} packet generated and ingested for {equipment_id}",
        "data_source": "SIMULATED",
        "record": record
    }
