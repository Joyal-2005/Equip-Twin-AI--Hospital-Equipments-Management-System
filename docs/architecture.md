# EquipTwin-AI Architecture Overview

**Project Title**: An AI-Driven Digital Twin Framework for Predictive Maintenance and Risk Management of Hospital Equipment

> [!WARNING]
> **Clinical Disclaimer**: EquipTwin-AI is designed strictly for medical engineering, predictive maintenance, and operational risk monitoring. It is **NOT** a diagnostic medical device and must never be used for clinical decision-making or direct patient care.

---

## 1. System Architecture

```mermaid
graph TD
    subgraph Data Sources
        Sim[Python Sensor Simulator<br/>(SIMULATED)]
        ESP[ESP32 Microcontroller<br/>(Future Hardware)]
    end

    subgraph Backend Core (FastAPI)
        Ingest[Telemetry Ingestion API<br/>/api/v1/telemetry]
        Store[In-Memory / Time-Series Store]
        Twin[Digital Twin Engine<br/>State: Normal/Warning/Critical/Offline]
        AI[Modular AI Risk Engine<br/>- Anomaly Detector<br/>- Failure Probability Estimator]
        SNBridge[ServiceNow Integration Module<br/>(Configurable REST Client)]
    end

    subgraph User Interface (React + Vite)
        Dashboard[Web Dashboard<br/>- Equipment Twin View<br/>- Live Charts<br/>- Telemetry Feeds<br/>- Risk Scores<br/>- ServiceNow Status]
    end

    subgraph External Systems
        SN[(ServiceNow ITOM / ITSM<br/>Incidents & Asset CMDB)]
    end

    Sim -->|HTTP POST JSON| Ingest
    ESP -.->|HTTP/MQTT| Ingest
    Ingest --> Store
    Store --> Twin
    Twin --> AI
    AI -->|Risk Threshold Exceeded| SNBridge
    SNBridge -.->|REST API (when enabled)| SN
    Store --> Dashboard
    Twin --> Dashboard
    AI --> Dashboard
```

---

## 2. Monitored Equipment

### Equipment 1: VEN-001 (ICU Ventilator)
- **Clinical Role**: Mechanical ventilation support for critical patients.
- **Sensors Monitored**:
  1. `airway_pressure`: Airway Pressure ($cmH_2O$)
  2. `flow_rate`: Inspiratory / Expiratory Flow Rate ($L/min$)
  3. `dht11_temperature`: Internal System Ambient Temperature ($^\circ C$)
  4. `dht11_humidity`: Breathing Gas / Ambient Relative Humidity ($\%$)
  5. `dc_voltage`: Internal Power Supply DC Voltage ($V$)

### Equipment 2: DIA-001 (Hemodialysis Machine)
- **Clinical Role**: Extracorporeal blood filtration and dialysate circulation.
- **Sensors Monitored**:
  1. `air_in_blood`: Optical / Ultrasonic Air Bubble Detector (Binary Flag / Pulse Count)
  2. `ds18b20_temperature`: Dialysate Temperature ($^\circ C$)
  3. `venous_pressure`: Extracorporeal Venous Blood Line Pressure ($mmHg$)
  4. `conductivity`: Dialysate Electrolyte Conductivity ($mS/cm$)

---

## 3. Digital Twin State Lifecycle
A Digital Twin maintains a digital mirror of the operational state of each asset:
- **Normal**: All sensor values fall within expected physiological/mechanical tolerances. AI risk score is low ($< 0.35$).
- **Warning**: Sensor drifts detected, high rate of change, or moderate anomaly score ($0.35 \le Risk < 0.70$). Maintenance recommended.
- **Critical**: Vital parameter threshold violated or AI failure probability high ($\ge 0.70$). Immediate technical servicing required. Automated ServiceNow incident ticket generated if configured.
- **Offline**: No telemetry received within the heartbeat window ($> 15$ seconds without ping).
