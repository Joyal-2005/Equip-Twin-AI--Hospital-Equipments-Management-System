from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from enum import Enum

class EquipmentStatus(str, Enum):
    NORMAL = "Normal"
    WARNING = "Warning"
    CRITICAL = "Critical"
    OFFLINE = "Offline"

class DataSource(str, Enum):
    SIMULATED = "SIMULATED"
    ESP32 = "ESP32"

class SensorMeta(BaseModel):
    id: str
    name: str
    unit: str
    normal_min: float
    normal_max: float
    critical_min: Optional[float] = None
    critical_max: Optional[float] = None
    description: str

class EquipmentMetadata(BaseModel):
    id: str
    name: str
    department: str
    model: str
    serial_number: str
    location: str
    installed_date: str
    last_serviced_date: str
    sensors: List[SensorMeta]
    clinical_disclaimer: str = (
        "NOTICE: Equipment monitoring is intended solely for biomedical engineering "
        "and predictive maintenance. It is NOT for clinical diagnosis or primary patient life-support."
    )
