from typing import Dict, Any, List
from backend.app.ai.detector import AnomalyDetector
from backend.app.config import settings

class RiskPredictionModel:
    """
    Predictive Maintenance Risk & Failure Probability Engine.
    
    IMPORTANT NOTE / DISCLAIMER:
    This model produces heuristic prototype estimations of failure risk.
    It has NOT undergone clinical device certification and is intended
    exclusively for biomedical engineering prototyping and maintenance triage.
    """

    MODEL_VERSION = "v0.9.2-prototype"

    @classmethod
    def calculate_risk(cls, equipment_id: str, readings: Dict[str, float]) -> Dict[str, Any]:
        eval_result = AnomalyDetector.evaluate(equipment_id, readings)
        anomaly_score = eval_result["anomaly_score"]
        flagged = eval_result["flagged_sensors"]

        # Prototype failure probability estimate (sigmoid-style scaling from anomaly score)
        # Base probability ranges from 0.02 (healthy baseline wear) to 0.98 (severe threshold violation)
        if any(f["severity"] == "CRITICAL" for f in flagged):
            failure_probability = min(0.96, 0.75 + (anomaly_score * 0.22))
        elif any(f["severity"] == "WARNING" for f in flagged):
            failure_probability = min(0.68, 0.35 + (anomaly_score * 0.30))
        else:
            failure_probability = max(0.02, round(anomaly_score * 0.28, 3))

        failure_probability = round(failure_probability, 3)

        # Risk level categorization
        if failure_probability >= 0.70:
            risk_level = "Critical"
        elif failure_probability >= 0.35:
            risk_level = "Warning"
        else:
            risk_level = "Normal"

        # Generate contextual recommended maintenance actions
        recommendations = cls._generate_recommendations(equipment_id, flagged, risk_level)

        return {
            "equipment_id": equipment_id,
            "risk_score": round(failure_probability * 100, 1),
            "risk_level": risk_level,
            "failure_probability": failure_probability,
            "anomaly_detected": eval_result["anomaly_detected"],
            "anomaly_score": anomaly_score,
            "flagged_sensors": flagged,
            "recommended_actions": recommendations,
            "model_metadata": {
                "version": cls.MODEL_VERSION,
                "is_prototype": settings.AI_PROTOTYPE_MODE,
                "confidence_level": 0.82 if settings.AI_PROTOTYPE_MODE else 0.95,
                "label": "PROTOTYPE ESTIMATE (Uncalibrated)",
                "limitation_notice": (
                    "Prototype estimate: Risk calculations are based on synthetic telemetry patterns "
                    "and preliminary laboratory heuristics. Do not make life-critical clinical decisions based on this output."
                )
            }
        }

    @classmethod
    def _generate_recommendations(cls, equipment_id: str, flagged_sensors: List[Dict[str, Any]], risk_level: str) -> List[Dict[str, Any]]:
        actions = []
        flagged_ids = [f["sensor_id"] for f in flagged_sensors]

        if equipment_id == "VEN-001":
            if "airway_pressure" in flagged_ids:
                actions.append({
                    "action_id": "ACT-VEN-01",
                    "priority": "HIGH",
                    "title": "Airway Circuit Inspection & Leak Test",
                    "description": "Inspect patient expiratory valve, breathing hoses, and water traps for condensation or occlusion.",
                    "est_time": "15 mins"
                })
            if "flow_rate" in flagged_ids:
                actions.append({
                    "action_id": "ACT-VEN-02",
                    "priority": "HIGH",
                    "title": "Flow Sensor Zero-Calibration",
                    "description": "Run pneumatic flow sensor calibration and inspect proximal flow transducer diaphragm for particulate residue.",
                    "est_time": "20 mins"
                })
            if "dc_voltage" in flagged_ids:
                actions.append({
                    "action_id": "ACT-VEN-03",
                    "priority": "CRITICAL",
                    "title": "Power Supply & Backup Battery Diagnostics",
                    "description": "Check internal 12V DC power converter output ripple and load test the secondary lithium-ion backup pack.",
                    "est_time": "30 mins"
                })
            if "dht11_temperature" in flagged_ids or "dht11_humidity" in flagged_ids:
                actions.append({
                    "action_id": "ACT-VEN-04",
                    "priority": "MEDIUM",
                    "title": "Active Humidifier Chamber & Fan Servicing",
                    "description": "Verify humidifier heating plate thermistor and clean cooling intake dust filters.",
                    "est_time": "25 mins"
                })

        elif equipment_id == "DIA-001":
            if "air_in_blood" in flagged_ids:
                actions.append({
                    "action_id": "ACT-DIA-01",
                    "priority": "IMMEDIATE",
                    "title": "Ultrasonic Air Detector Inspection & Degassing",
                    "description": "Perform optical cleaning on air bubble sensor clamp, test venous line clamp shutoff, and purge circuit micro-bubbles.",
                    "est_time": "10 mins"
                })
            if "conductivity" in flagged_ids:
                actions.append({
                    "action_id": "ACT-DIA-02",
                    "priority": "HIGH",
                    "title": "Dialysate Proportioning & Conductivity Cell Recalibration",
                    "description": "Inspect bicarbonate and acid concentrate intake wands. Calibrate dual conductivity temperature-compensated cells.",
                    "est_time": "35 mins"
                })
            if "ds18b20_temperature" in flagged_ids:
                actions.append({
                    "action_id": "ACT-DIA-03",
                    "priority": "HIGH",
                    "title": "Dialysate Heater Heat Exchanger Verification",
                    "description": "Verify DS18B20 digital thermal sensor reading against reference calibrated thermometer and check heating element SSR.",
                    "est_time": "25 mins"
                })
            if "venous_pressure" in flagged_ids:
                actions.append({
                    "action_id": "ACT-DIA-04",
                    "priority": "HIGH",
                    "title": "Venous Pressure Transducer Protector Replacement",
                    "description": "Replace hydrophobic venous transducer barrier filter and verify pressure sensor zero point.",
                    "est_time": "15 mins"
                })

        # If no specific sensor is flagged but overall routine maintenance is due
        if not actions:
            if risk_level == "Normal":
                actions.append({
                    "action_id": "ACT-GEN-01",
                    "priority": "ROUTINE",
                    "title": "Routine Sensor Drift Telemetry Audit",
                    "description": "All parameters nominal. Scheduled periodic self-test and visual connection inspection.",
                    "est_time": "10 mins"
                })
            else:
                actions.append({
                    "action_id": "ACT-GEN-02",
                    "priority": "MEDIUM",
                    "title": "Multi-Sensor Diagnostic Sweep",
                    "description": "Moderate multi-variable variation noted. Perform standard calibration diagnostic suite.",
                    "est_time": "30 mins"
                })

        return actions
