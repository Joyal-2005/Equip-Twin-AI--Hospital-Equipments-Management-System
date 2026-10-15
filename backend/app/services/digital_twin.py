from typing import Dict, Any, List, Optional
from datetime import datetime

from backend.app.models.equipment import EquipmentStatus
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
        description=(
            "Preventive maintenance replacement of bacterial filter "
            "and silicone exhalation valve."
        ),
        severity="Medium",
        status="Open",
        created_at=datetime.utcnow().isoformat() + "Z",
        recommended_actions=[
            "Inspect bacterial filter integrity",
            "Perform leak test following assembly",
            "Verify tidal volume compliance",
        ],
    ),
    MaintenanceRequest(
        id="REQ-2026-002",
        equipment_id="DIA-001",
        title="Quarterly Dual Conductivity Cell Recalibration",
        description=(
            "Biannual standard buffer solution calibration "
            "for conductivity and thermistor."
        ),
        severity="Low",
        status="Resolved",
        created_at=datetime.utcnow().isoformat() + "Z",
        recommended_actions=[
            "Flush calibration chamber with distilled solution",
            "Zero out DS18B20 offset",
            "Document test certificate",
        ],
    ),
]


class DigitalTwinService:

    # Equipment is considered offline when no new telemetry
    # has arrived within this period.
    OFFLINE_TIMEOUT_SECONDS = 120.0

    def __init__(self):
        self._maintenance_requests: List[MaintenanceRequest] = list(
            SAMPLE_REQUESTS
        )

    def get_twin_snapshot(
        self,
        equipment_id: str,
    ) -> Optional[Dict[str, Any]]:

        # Retrieve equipment metadata
        metadata = EquipmentService.get_by_id(equipment_id)

        if not metadata:
            return None

        # Retrieve latest telemetry, heartbeat age, and history
        latest_record = telemetry_store.get_latest(equipment_id)

        seconds_ago = telemetry_store.get_seconds_since_heartbeat(
            equipment_id
        )

        history = telemetry_store.get_history(
            equipment_id,
            limit=30,
        )

        # Determine Digital Twin status
        if (
            latest_record is None
            or seconds_ago > self.OFFLINE_TIMEOUT_SECONDS
        ):
            twin_status = EquipmentStatus.OFFLINE

        elif latest_record.risk_level == "Critical":
            twin_status = EquipmentStatus.CRITICAL

        elif latest_record.risk_level == "Warning":
            twin_status = EquipmentStatus.WARNING

        else:
            twin_status = EquipmentStatus.NORMAL

        # Latest readings
        readings = (
            latest_record.readings
            if latest_record is not None
            else {}
        )

        # AI-based maintenance risk assessment
        ai_eval = RiskPredictionModel.calculate_risk(
            equipment_id,
            readings,
        )

        # Format historical chart data
        chart_points = []

        for record in history:
            point = {
                "timestamp": record.timestamp,
                "time_short": (
                    record.timestamp[11:19]
                    if len(record.timestamp) >= 19
                    else record.timestamp
                ),
                **record.readings,
                "anomaly_score": record.anomaly_score,
            }

            chart_points.append(point)

        # Maintenance requests for this equipment
        device_requests = [
            request
            for request in self._maintenance_requests
            if request.equipment_id == equipment_id
        ]

        # Build the Digital Twin response
        return {
            "equipment": metadata.dict(),

            "digital_twin_status": twin_status.value,

            "data_source": (
                latest_record.data_source.value
                if latest_record is not None
                else "SIMULATED"
            ),

            "last_updated": (
                latest_record.timestamp
                if latest_record is not None
                else None
            ),

            "seconds_since_update": round(seconds_ago, 1),

            "is_online": (
                twin_status != EquipmentStatus.OFFLINE
            ),

            "current_readings": readings,

            "ai_risk_assessment": ai_eval,

            "history": chart_points,

            "maintenance_requests": [
                request.dict()
                for request in device_requests
            ],

            "recommended_actions": ai_eval.get(
                "recommended_actions",
                [],
            ),

            "clinical_warning": (
                "CLINICAL DISCLAIMER: EquipTwin-AI is an engineering "
                "digital twin for predictive maintenance and telemetry "
                "risk assessment. It is NOT certified for diagnostic "
                "or clinical therapy."
            ),
        }

    def get_all_twins_overview(self) -> List[Dict[str, Any]]:

        equipments = EquipmentService.list_all()

        overviews = []

        for equipment in equipments:
            snapshot = self.get_twin_snapshot(equipment.id)

            if snapshot:
                overviews.append(snapshot)

        return overviews

    def get_maintenance_requests(
        self,
        equipment_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:

        if equipment_id:
            return [
                request.dict()
                for request in self._maintenance_requests
                if request.equipment_id == equipment_id
            ]

        return [
            request.dict()
            for request in self._maintenance_requests
        ]

    def add_maintenance_request(
        self,
        request: MaintenanceRequest,
    ) -> Dict[str, Any]:

        self._maintenance_requests.insert(0, request)

        return request.dict()


# Shared Digital Twin service instance
digital_twin_service = DigitalTwinService()