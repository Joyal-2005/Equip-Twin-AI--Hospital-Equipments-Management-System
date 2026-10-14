from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class IncidentSeverity(str):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class MaintenanceRequest(BaseModel):
    id: str
    equipment_id: str
    title: str
    description: str
    severity: str
    status: str = "Open"  # Open, In Progress, Resolved
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    servicenow_incident_sys_id: Optional[str] = None
    servicenow_incident_number: Optional[str] = None
    recommended_actions: List[str] = Field(default_factory=list)

class MaintenanceActionRecommendation(BaseModel):
    equipment_id: str
    action_type: str  # Preventive, Corrective, Urgent Calibration
    urgency: str
    title: str
    description: str
    est_duration_minutes: int
    required_parts: List[str]
    confidence_score: float
