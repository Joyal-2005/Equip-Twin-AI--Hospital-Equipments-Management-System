#!/usr/bin/env python3
"""
EquipTwin-AI Sensor Simulator
-----------------------------
Simulates real-time IoT sensor telemetry for hospital equipment:
- VEN-001: Mechanical Ventilator (Pressure, Flow, DHT11 Temp/Humidity, DC Voltage)
- DIA-001: Hemodialysis Machine (Air-in-Blood, DS18B20 Temp, Venous Pressure, Conductivity)

All telemetry generated is explicitly labeled with:
    "data_source": "SIMULATED"
"""

import time
import random
import argparse
import logging
from datetime import datetime, timezone
import httpx

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (SIMULATOR): %(message)s"
)
logger = logging.getLogger("EquipTwinSimulator")

DEFAULT_ENDPOINT = "http://127.0.0.1:8000/api/v1/telemetry"

def generate_ventilator_reading(scenario: str = "normal") -> dict:
    """Generates simulated telemetry for VEN-001 (Ventilator)."""
    if scenario == "critical":
        # Simulate severe airway occlusion or power failure
        readings = {
            "airway_pressure": round(random.choice([8.5, 36.2]), 2),   # Out of bound cmH2O
            "flow_rate": round(random.choice([11.2, 74.8]), 2),         # Abnormal flow L/min
            "dht11_temperature": round(random.uniform(34.5, 37.0), 2),  # Overheating
            "dht11_humidity": round(random.uniform(84.0, 92.0), 2),     # Condensation
            "dc_voltage": round(random.uniform(10.2, 10.8), 2)          # Battery droop
        }
    elif scenario == "warning":
        # Simulate filter clogging or slight temperature elevation
        readings = {
            "airway_pressure": round(random.uniform(26.5, 29.0), 2),
            "flow_rate": round(random.uniform(21.0, 24.0), 2),
            "dht11_temperature": round(random.uniform(29.5, 31.8), 2),
            "dht11_humidity": round(random.uniform(71.0, 78.0), 2),
            "dc_voltage": round(random.uniform(11.4, 11.7), 2)
        }
    else:
        # Standard nominal physiological ventilation
        readings = {
            "airway_pressure": round(random.uniform(18.0, 22.0), 2),
            "flow_rate": round(random.uniform(38.0, 48.0), 2),
            "dht11_temperature": round(random.uniform(22.0, 24.5), 2),
            "dht11_humidity": round(random.uniform(48.0, 58.0), 2),
            "dc_voltage": round(random.uniform(11.95, 12.25), 2)
        }

    return {
        "equipment_id": "VEN-001",
        "data_source": "SIMULATED",  # MANDATORY: clearly distinct from hardware
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "readings": readings,
        "battery_level": round(random.uniform(92.0, 99.0), 1),
        "metadata": {
            "simulation_scenario": scenario,
            "simulator_version": "1.0.0"
        }
    }

def generate_dialysis_reading(scenario: str = "normal") -> dict:
    """Generates simulated telemetry for DIA-001 (Hemodialysis Machine)."""
    if scenario == "critical":
        # Simulate venous air bubble alarm or dialysate hyperthermia
        readings = {
            "air_in_blood": 1.0,                                      # Critical air detected!
            "ds18b20_temperature": round(random.choice([34.0, 38.8]), 2), # Thermal trip
            "venous_pressure": round(random.choice([46.0, 225.0]), 2),# Pressure alarm mmHg
            "conductivity": round(random.choice([12.3, 15.5]), 2)     # Electrolyte imbalance
        }
    elif scenario == "warning":
        readings = {
            "air_in_blood": 0.0,
            "ds18b20_temperature": round(random.uniform(37.6, 38.1), 2),
            "venous_pressure": round(random.uniform(155.0, 175.0), 2),
            "conductivity": round(random.uniform(14.6, 14.9), 2)
        }
    else:
        readings = {
            "air_in_blood": 0.0,
            "ds18b20_temperature": round(random.uniform(36.4, 37.1), 2),
            "venous_pressure": round(random.uniform(105.0, 125.0), 2),
            "conductivity": round(random.uniform(13.6, 14.1), 2)
        }

    return {
        "equipment_id": "DIA-001",
        "data_source": "SIMULATED",  # MANDATORY: clearly distinct from hardware
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "readings": readings,
        "battery_level": 100.0,
        "metadata": {
            "simulation_scenario": scenario,
            "simulator_version": "1.0.0"
        }
    }

def run_simulation(endpoint: str, interval: float, scenario: str, count: int = -1):
    logger.info("=" * 65)
    logger.info("EquipTwin-AI Sensor Simulator Started")
    logger.info(f"Target Endpoint: {endpoint}")
    logger.info(f"Simulation Interval: {interval} seconds")
    logger.info(f"Scenario Mode: {scenario.upper()}")
    logger.info("Notice: All generated data is labeled 'SIMULATED'")
    logger.info("=" * 65)

    client = httpx.Client(timeout=5.0)
    iterations = 0

    scenarios_cycle = ["normal", "normal", "warning", "normal", "critical", "normal"]
    cycle_idx = 0

    try:
        while count < 0 or iterations < count:
            iterations += 1
            current_scenario = scenario
            if scenario == "cycle":
                current_scenario = scenarios_cycle[cycle_idx % len(scenarios_cycle)]
                cycle_idx += 1

            # Generate packets for both devices
            ven_payload = generate_ventilator_reading(current_scenario)
            dia_payload = generate_dialysis_reading(current_scenario)

            for payload in [ven_payload, dia_payload]:
                eq_id = payload["equipment_id"]
                try:
                    res = client.post(endpoint, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        risk = data.get("risk_level", "Unknown")
                        anomaly = data.get("anomaly_detected", False)
                        logger.info(
                            f"[{eq_id}] Ingested [SIMULATED] | Scenario: {current_scenario} | "
                            f"Risk: {risk} | Anomaly: {anomaly} | Readings: {payload['readings']}"
                        )
                    else:
                        logger.warning(f"[{eq_id}] Server returned HTTP {res.status_code}: {res.text}")
                except Exception as e:
                    logger.error(f"[{eq_id}] Failed connecting to backend: {e}")

            time.sleep(interval)
    except KeyboardInterrupt:
        logger.info("Simulation interrupted by user. Stopping.")
    finally:
        client.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="EquipTwin-AI Hospital Equipment Sensor Simulator")
    parser.add_argument("--endpoint", type=str, default=DEFAULT_ENDPOINT, help="Telemetry ingestion URL")
    parser.add_argument("--interval", type=float, default=3.0, help="Interval in seconds between packets")
    parser.add_argument("--scenario", type=str, default="normal", choices=["normal", "warning", "critical", "cycle"],
                        help="Operating condition scenario to simulate")
    parser.add_argument("--count", type=int, default=-1, help="Number of cycles to run (-1 for continuous)")
    args = parser.parse_args()

    run_simulation(args.endpoint, args.interval, args.scenario, args.count)
