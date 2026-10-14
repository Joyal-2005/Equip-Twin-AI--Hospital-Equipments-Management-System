from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime
from backend.app.models.equipment import DataSource

class TelemetryPayload(BaseModel):
    equipment_id: str = Field(..., description="Target equipment identifier (e.g. VEN-001, DIA-001)")
    data_source: DataSource = Field(default=DataSource.SIMULATED, description="Telemetry origin: SIMULATED or ESP32")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    readings: Dict[str, float] = Field(..., description="Key-value mapping of sensor IDs to numerical readings")
    battery_level: Optional[float] = Field(default=None, description="Optional battery percentage")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class TelemetryRecord(TelemetryPayload):
    received_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    anomaly_detected: bool = False
    anomaly_score: float = 0.0
    risk_level: str = "Normal"
