from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.app.models.equipment import EquipmentStatus, DataSource
from backend.app.models.incident import MaintenanceRequest
from backend.app.services.equipment_service import EquipmentService
from backend.app.services.telemetry_store import telemetry_store
from backend.app.ai.risk_model import RiskPredictionModel

# Initial sample maintenance requests for hospital operations
SAMPLE_REQUESTS: List[MaintenanceRequest] = [
    MaintenanceRequest(
        id="REQ-2026-001",
        equipment_id="VEN-001",
        title="Periodic Expiratory Valve Diaphragm Replacement",
        description="Preventive maintenance replacement of bacterial filter and silicone exhalation valve.",
        severity="Medium",
        status="Open",
        created_at=(datetime.utcnow()).isoformat() + "Z",
        recommended_actions=[
            "Inspect bacterial filter integrity",
            "Perform leak test following assembly",
            "Verify tidal volume compliance"
        ]
    ),
    MaintenanceRequest(
        id="REQ-2026-002",
        equipment_id="DIA-001",
        title="Quarterly Dual Conductivity Cell Recalibration",
        description="Biannual standard buffer solution calibration for conductivity and thermistor.",
        severity="Low",
        status="Resolved",
        created_at=(datetime.utcnow()).isoformat() + "Z",
        recommended_actions=[
            "Flush calibration chamber with distilled solution",
            "Zero out DS18B20 offset",
            "Document test certificate"
        ]
    )
]

class DigitalTwinService:
    def __init__(self):
        self._maintenance_requests: List[MaintenanceRequest] = list(SAMPLE_REQUESTS)

    def get_twin_snapshot(self, equipment_id: str) -> Optional[Dict[str, Any]]:
        metadata = EquipmentService.get_by_id(equipment_id)
        if not metadata:
            return None

        latest_record = telemetry_store.get_latest(equipment_id)
        seconds_ago = telemetry_store.get_seconds_since_heartbeat(equipment_id)
        history = telemetry_store.get_history(equipment_id, limit=30)

        # Determine Digital Twin Status
        if seconds_ago > 30.0 or not latest_record:
            twin_status = EquipmentStatus.OFFLINE
        elif latest_record.risk_level == "Critical":
            twin_status = EquipmentStatus.CRITICAL
        elif latest_record.risk_level == "Warning":
            twin_status = EquipmentStatus.WARNING
        else:
            twin_status = EquipmentStatus.NORMAL

        readings = latest_record.readings if latest_record else {}
        ai_eval = RiskPredictionModel.calculate_risk(equipment_id, readings)

        # Format historical chart data
        chart_points = []
        for r in history:
            point = {
                "timestamp": r.timestamp,
                "time_short": r.timestamp[11:19] if len(r.timestamp) >= 19 else r.timestamp,
                **r.readings,
                "anomaly_score": r.anomaly_score
            }
            chart_points.append(point)

        # Filter maintenance requests for this device
        dev_requests = [req for req in self._maintenance_requests if req.equipment_id == equipment_id]

        return {
            "equipment": metadata.dict(),
            "digital_twin_status": twin_status.value,
            "data_source": latest_record.data_source.value if latest_record else "SIMULATED",
            "last_updated": latest_record.timestamp if latest_record else None,
            "seconds_since_update": round(seconds_ago, 1),
            "is_online": twin_status != EquipmentStatus.OFFLINE,
            "current_readings": readings,
            "ai_risk_assessment": ai_eval,
            "history": chart_points,
            "maintenance_requests": [req.dict() for req in dev_requests],
            "recommended_actions": ai_eval.get("recommended_actions", []),
            "clinical_warning": (
                "CLINICAL DISCLAIMER: EquipTwin-AI is an engineering digital twin for predictive "
                "maintenance and telemetry risk assessment. It is NOT certified for diagnostic or clinical therapy."
            )
        }

    def get_all_twins_overview(self) -> List[Dict[str, Any]]:
        equipments = EquipmentService.list_all()
        overviews = []
        for eq in equipments:
            snap = self.get_twin_snapshot(eq.id)
            if snap:
                overviews.append(snap)
        return overviews

    def get_maintenance_requests(self, equipment_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if equipment_id:
            return [req.dict() for req in self._maintenance_requests if req.equipment_id == equipment_id]
        return [req.dict() for req in self._maintenance_requests]

    def add_maintenance_request(self, request: MaintenanceRequest) -> Dict[str, Any]:
        self._maintenance_requests.insert(0, request)
        return request.dict()

digital_twin_service = DigitalTwinService()
