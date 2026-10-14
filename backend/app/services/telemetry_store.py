from typing import Dict, List, Optional, Any
from collections import deque
from datetime import datetime, timedelta
import random
import threading
from backend.app.models.telemetry import TelemetryPayload, TelemetryRecord
from backend.app.models.equipment import DataSource
from backend.app.ai.risk_model import RiskPredictionModel

MAX_HISTORY_LENGTH = 120

class TelemetryStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._history: Dict[str, deque] = {
            "VEN-001": deque(maxlen=MAX_HISTORY_LENGTH),
            "DIA-001": deque(maxlen=MAX_HISTORY_LENGTH)
        }
        self._latest_telemetry: Dict[str, TelemetryRecord] = {}
        self._last_heartbeat: Dict[str, datetime] = {}
        self._seed_initial_history()

    def _seed_initial_history(self):
        """Pre-seeds 30 points of baseline historical data for rich chart visualization."""
        now = datetime.utcnow()
        with self._lock:
            # Seed VEN-001
            for i in range(30, -1, -1):
                pt_time = (now - timedelta(seconds=i * 5)).isoformat() + "Z"
                readings = {
                    "airway_pressure": round(19.5 + random.uniform(-1.5, 2.0), 2),
                    "flow_rate": round(38.0 + random.uniform(-3.0, 4.0), 2),
                    "dht11_temperature": round(23.2 + random.uniform(-0.4, 0.6), 2),
                    "dht11_humidity": round(52.0 + random.uniform(-2.0, 3.0), 2),
                    "dc_voltage": round(12.08 + random.uniform(-0.08, 0.08), 2)
                }
                rec = TelemetryRecord(
                    equipment_id="VEN-001",
                    data_source=DataSource.SIMULATED,
                    timestamp=pt_time,
                    readings=readings,
                    battery_level=98.0,
                    received_at=pt_time,
                    anomaly_detected=False,
                    anomaly_score=0.04,
                    risk_level="Normal"
                )
                self._history["VEN-001"].append(rec)
            self._latest_telemetry["VEN-001"] = rec
            self._last_heartbeat["VEN-001"] = now

            # Seed DIA-001
            for i in range(30, -1, -1):
                pt_time = (now - timedelta(seconds=i * 5)).isoformat() + "Z"
                readings = {
                    "air_in_blood": 0.0,
                    "ds18b20_temperature": round(36.7 + random.uniform(-0.2, 0.3), 2),
                    "venous_pressure": round(112.0 + random.uniform(-4.0, 5.0), 2),
                    "conductivity": round(13.82 + random.uniform(-0.15, 0.18), 2)
                }
                rec = TelemetryRecord(
                    equipment_id="DIA-001",
                    data_source=DataSource.SIMULATED,
                    timestamp=pt_time,
                    readings=readings,
                    battery_level=100.0,
                    received_at=pt_time,
                    anomaly_detected=False,
                    anomaly_score=0.03,
                    risk_level="Normal"
                )
                self._history["DIA-001"].append(rec)
            self._latest_telemetry["DIA-001"] = rec
            self._last_heartbeat["DIA-001"] = now

    def ingest(self, payload: TelemetryPayload) -> TelemetryRecord:
        eq_id = payload.equipment_id
        now = datetime.utcnow()

        # Run AI evaluation
        ai_result = RiskPredictionModel.calculate_risk(eq_id, payload.readings)

        record = TelemetryRecord(
            equipment_id=eq_id,
            data_source=payload.data_source,
            timestamp=payload.timestamp or (now.isoformat() + "Z"),
            readings=payload.readings,
            battery_level=payload.battery_level,
            metadata=payload.metadata,
            received_at=now.isoformat() + "Z",
            anomaly_detected=ai_result["anomaly_detected"],
            anomaly_score=ai_result["anomaly_score"],
            risk_level=ai_result["risk_level"]
        )

        with self._lock:
            if eq_id not in self._history:
                self._history[eq_id] = deque(maxlen=MAX_HISTORY_LENGTH)
            self._history[eq_id].append(record)
            self._latest_telemetry[eq_id] = record
            self._last_heartbeat[eq_id] = now

        return record

    def get_latest(self, equipment_id: str) -> Optional[TelemetryRecord]:
        with self._lock:
            return self._latest_telemetry.get(equipment_id)

    def get_history(self, equipment_id: str, limit: int = 50) -> List[TelemetryRecord]:
        with self._lock:
            q = self._history.get(equipment_id, deque())
            items = list(q)
            return items[-limit:] if limit > 0 else items

    def get_seconds_since_heartbeat(self, equipment_id: str) -> float:
        with self._lock:
            last = self._last_heartbeat.get(equipment_id)
            if not last:
                return 9999.0
            return (datetime.utcnow() - last).total_seconds()

telemetry_store = TelemetryStore()
