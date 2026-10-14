from typing import Dict, Any, List, Tuple
import math

# Baseline normal operating parameters and warning/critical bounds
SENSOR_BOUNDS = {
    "VEN-001": {
        "airway_pressure": {"min_warn": 12.0, "max_warn": 28.0, "min_crit": 8.0, "max_crit": 35.0, "nominal": 20.0, "unit": "cmH2O"},
        "flow_rate": {"min_warn": 20.0, "max_warn": 60.0, "min_crit": 12.0, "max_crit": 75.0, "nominal": 40.0, "unit": "L/min"},
        "dht11_temperature": {"min_warn": 18.0, "max_warn": 30.0, "min_crit": 15.0, "max_crit": 36.0, "nominal": 23.5, "unit": "°C"},
        "dht11_humidity": {"min_warn": 35.0, "max_warn": 75.0, "min_crit": 25.0, "max_crit": 85.0, "nominal": 55.0, "unit": "%"},
        "dc_voltage": {"min_warn": 11.5, "max_warn": 12.6, "min_crit": 10.8, "max_crit": 13.2, "nominal": 12.0, "unit": "V"}
    },
    "DIA-001": {
        "air_in_blood": {"min_warn": 0.0, "max_warn": 0.0, "min_crit": 0.0, "max_crit": 0.0, "nominal": 0.0, "unit": "alarm_flag"},
        "ds18b20_temperature": {"min_warn": 35.5, "max_warn": 37.8, "min_crit": 34.5, "max_crit": 38.5, "nominal": 36.8, "unit": "°C"},
        "venous_pressure": {"min_warn": 70.0, "max_warn": 160.0, "min_crit": 50.0, "max_crit": 220.0, "nominal": 115.0, "unit": "mmHg"},
        "conductivity": {"min_warn": 13.0, "max_warn": 14.8, "min_crit": 12.6, "max_crit": 15.3, "nominal": 13.85, "unit": "mS/cm"}
    }
}

class AnomalyDetector:
    """
    Modular statistical anomaly detector.
    Evaluates multivariable deviations and returns anomaly score, 
    flagged sensors, and deviation severity.
    """

    @classmethod
    def evaluate(cls, equipment_id: str, readings: Dict[str, float]) -> Dict[str, Any]:
        bounds = SENSOR_BOUNDS.get(equipment_id, {})
        if not bounds:
            return {
                "anomaly_detected": False,
                "anomaly_score": 0.0,
                "flagged_sensors": [],
                "details": "Unknown equipment ID, default nominal baseline applied."
            }

        total_penalty = 0.0
        flagged_sensors = []
        max_possible_penalty = len(bounds) * 2.0  # max 2 per sensor for critical

        for sensor_id, val in readings.items():
            if sensor_id not in bounds:
                continue

            config = bounds[sensor_id]
            val = float(val)

            # Special binary handling for air_in_blood
            if sensor_id == "air_in_blood":
                if val >= 1.0:
                    total_penalty += 2.0
                    flagged_sensors.append({
                        "sensor_id": sensor_id,
                        "severity": "CRITICAL",
                        "reading": val,
                        "message": "Air bubbles detected in extracorporeal dialysis line!"
                    })
                continue

            nominal = config["nominal"]
            min_warn = config["min_warn"]
            max_warn = config["max_warn"]
            min_crit = config["min_crit"]
            max_crit = config["max_crit"]

            # Critical boundary check
            if val < min_crit or val > max_crit:
                total_penalty += 2.0
                flagged_sensors.append({
                    "sensor_id": sensor_id,
                    "severity": "CRITICAL",
                    "reading": val,
                    "message": f"Critical limit breach: {val} {config['unit']} (Range: {min_crit}-{max_crit})"
                })
            # Warning boundary check
            elif val < min_warn or val > max_warn:
                total_penalty += 1.0
                flagged_sensors.append({
                    "sensor_id": sensor_id,
                    "severity": "WARNING",
                    "reading": val,
                    "message": f"Elevated drift detected: {val} {config['unit']} (Warn Range: {min_warn}-{max_warn})"
                })
            else:
                # Slight normalized deviation penalty
                spread = (max_warn - min_warn) / 2.0
                dev = abs(val - nominal) / (spread if spread > 0 else 1.0)
                total_penalty += min(0.3, dev * 0.15)

        # Normalize score between 0.0 and 1.0
        normalized_score = min(1.0, round(total_penalty / max(1.0, max_possible_penalty * 0.5), 3))
        anomaly_detected = normalized_score >= 0.40 or len(flagged_sensors) > 0

        return {
            "anomaly_detected": anomaly_detected,
            "anomaly_score": normalized_score,
            "flagged_sensors": flagged_sensors,
            "details": f"{len(flagged_sensors)} sensor(s) displaying abnormal variance." if flagged_sensors else "Telemetry within normal physiological envelope."
        }
