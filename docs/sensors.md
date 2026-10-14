# Sensor Specifications and Telemetry Schema

EquipTwin-AI ingests real-time telemetry from both simulated data generators and hardware microcontrollers (such as ESP32). Every reading is tagged with an explicit `data_source` indicator (`SIMULATED` vs `ESP32`).

---

## 1. VEN-001 (Ventilator)

| Sensor Channel | Description | Typical Unit | Normal Operating Range | Warning / Alert Range |
|---|---|---|---|---|
| `airway_pressure` | Peak Inspiratory Pressure (PIP) | $cmH_2O$ | 15.0 - 25.0 | $< 10.0$ or $> 35.0$ |
| `flow_rate` | Inspiratory Gas Flow Rate | $L/min$ | 25.0 - 55.0 | $< 15.0$ or $> 70.0$ |
| `dht11_temperature`| Internal Chassis / Gas Temp | $^\circ C$ | 20.0 - 28.0 | $> 35.0$ |
| `dht11_humidity` | Gas Blend Relative Humidity | $\%$ | 40.0 - 70.0 | $< 30.0$ or $> 80.0$ |
| `dc_voltage` | Internal PSU DC Voltage | $V$ | 11.8 - 12.4 | $< 11.2$ or $> 13.0$ |

### Sample JSON Telemetry Payload:
```json
{
  "equipment_id": "VEN-001",
  "data_source": "SIMULATED",
  "timestamp": "2026-10-14T12:00:00Z",
  "readings": {
    "airway_pressure": 20.4,
    "flow_rate": 42.1,
    "dht11_temperature": 23.5,
    "dht11_humidity": 55.2,
    "dc_voltage": 12.05
  }
}
```

---

## 2. DIA-001 (Hemodialysis Machine)

| Sensor Channel | Description | Typical Unit | Normal Operating Range | Warning / Alert Range |
|---|---|---|---|---|
| `air_in_blood` | Ultrasonic Bubble Detector | `0` (Clear) / `1` (Bubble) | 0 | 1 (Immediate Alarm) |
| `ds18b20_temperature`| Dialysate Solution Temp | $^\circ C$ | 35.5 - 37.5 | $< 34.5$ or $> 38.5$ |
| `venous_pressure` | Extracorporeal Blood Return | $mmHg$ | 80.0 - 150.0 | $< 50.0$ or $> 220.0$ |
| `conductivity` | Dialysate Ion Concentration | $mS/cm$ | 13.2 - 14.5 | $< 12.8$ or $> 15.2$ |

### Sample JSON Telemetry Payload:
```json
{
  "equipment_id": "DIA-001",
  "data_source": "SIMULATED",
  "timestamp": "2026-10-14T12:00:00Z",
  "readings": {
    "air_in_blood": 0,
    "ds18b20_temperature": 36.8,
    "venous_pressure": 115.0,
    "conductivity": 13.85
  }
}
```
