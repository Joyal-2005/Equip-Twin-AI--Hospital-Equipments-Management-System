# EquipTwin-AI

### An AI-Driven Digital Twin Framework for Predictive Maintenance and Risk Management of Hospital Equipment

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> [!WARNING]
> **REGULATORY & CLINICAL DISCLAIMER**: EquipTwin-AI is engineered exclusively for biomedical engineering research, digital twin telemetry modeling, and predictive maintenance triage. It is **NOT** a certified medical diagnostic device and must never be utilized for primary patient clinical diagnosis or therapeutic decisions.

---

## 1. System Overview

**EquipTwin-AI** is a comprehensive IoT-driven hospital equipment digital twin platform. It provides real-time telemetry ingestion, multivariable anomaly detection, AI predictive failure risk scoring, interactive simulation controls, and a configurable enterprise ServiceNow ITSM/ITOM integration layer.

### Key Capabilities
- **Digital Twin State Engine**: Real-time asset lifecycle modeling (`Normal`, `Warning`, `Critical`, `Offline`).
- **Dual Medical Asset Modeling**:
  - **VEN-001 (ICU Mechanical Ventilator)**: Airway pressure ($cmH_2O$), Flow rate ($L/min$), DHT11 Temperature ($^\circ C$), DHT11 Humidity ($\%$), DC Voltage ($V$).
  - **DIA-001 (Hemodialysis Machine)**: Ultrasonic Air-in-blood alarm, DS18B20 Dialysate Temperature ($^\circ C$), Venous Return Pressure ($mmHg$), Conductivity ($mS/cm$).
- **Modular AI Predictive Engine**: Statistical multi-sensor deviation scoring and prototype failure probability estimation with clear non-clinical disclaimers.
- **ServiceNow ITSM Gateway**: Secure, backend-only Table API client for automatic or manual incident ticket dispatch (disabled by default until valid credentials are provided).
- **Explicit Telemetry Origin Tagging**: Strictly isolates simulated data (`SIMULATED`) from physical microcontroller hardware (`ESP32`).
- **Interactive Simulation Triage**: On-demand injection of nominal, warning drift, and critical emergency alarms directly from the UI or command line.

---

## 2. Project Directory Structure

```
EquipTwin-AI/
├── frontend/                     # React + Vite + Tailwind CSS User Interface
│   ├── src/
│   │   ├── components/           # Reusable UI Components
│   │   │   ├── DisclaimerBanner.jsx   # Clinical disclaimer banner
│   │   │   ├── Header.jsx             # Top bar, status indicators, refresh controls
│   │   │   ├── EquipmentCard.jsx      # Asset overview cards (VEN-001 & DIA-001)
│   │   │   ├── SensorReadingCard.jsx  # Individual telemetry cards with units & safe ranges
│   │   │   ├── HistoricalCharts.jsx   # Recharts time-series telemetry trends
│   │   │   ├── RiskAssessmentCard.jsx # AI Risk gauge & prototype failure probability
│   │   │   ├── MaintenanceActions.jsx # Actionable recommendations & ServiceNow ticket logs
│   │   │   ├── EquipmentDetails.jsx   # Technical asset specifications & sensor bounds
│   │   │   ├── SimulationControl.jsx  # In-browser test scenario injection
│   │   │   ├── SettingsModal.jsx      # System health & ServiceNow connection tester
│   │   │   └── StatusBadge.jsx        # Status and SIMULATED vs ESP32 badges
│   │   ├── services/
│   │   │   └── api.js                 # Axios API service client
│   │   ├── App.jsx                    # Primary Dashboard layout & state coordinator
│   │   ├── main.jsx                   # React root entrypoint
│   │   └── index.css                  # Tailwind styles and glassmorphism utilities
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                      # Python FastAPI Core
│   ├── app/
│   │   ├── main.py               # FastAPI application entrypoint & middleware
│   │   ├── config.py             # Pydantic environment settings
│   │   ├── models/               # Pydantic schemas (Equipment, Telemetry, Incidents)
│   │   ├── services/             # Equipment registry, Telemetry circular buffer, Twin engine
│   │   ├── ai/                   # Modular AI anomaly detector & risk prediction model
│   │   ├── servicenow/           # Dedicated ServiceNow REST Table API client
│   │   └── api/routes/           # Health, Equipment, Telemetry, Twin, ServiceNow routes
│   ├── requirements.txt          # Python backend dependencies
│   └── .env.example              # Environment variables template
│
├── sensor_simulator/             # Standalone Sensor Simulator
│   ├── simulator.py              # CLI and daemon IoT simulator
│   ├── sample_data.json          # Pre-recorded test payloads
│   ├── requirements.txt          # Simulator dependencies (httpx)
│   └── README.md                 # Simulator usage instructions
│
├── docs/                         # Technical Documentation
│   ├── architecture.md           # Architecture diagrams & component workflows
│   ├── sensors.md                # Sensor tolerances, units, and payload schemas
│   └── servicenow_integration.md # ServiceNow configuration & REST payload specs
│
├── .gitignore                    # Git version control exclusions
├── .env.example                  # Root environment template
└── README.md                     # Comprehensive project guide
```

---

## 3. Quick Start Guide

### Prerequisites
- **Node.js** (v18 or newer)
- **Python** (v3.10 or newer)

---

### Step 1: Run the FastAPI Backend

1. Open a terminal in the project root:
   ```bash
   cd "d:\Final Year Projects Works\EquipTwin-AI"
   ```

2. Activate the virtual environment (or create one):
   ```powershell
   # Windows PowerShell:
   .\backend\.venv\Scripts\Activate.ps1
   ```
   *(If creating a new virtual environment: `python -m venv backend/.venv` and then `pip install -r backend/requirements.txt`)*

3. Start the FastAPI development server:
   ```powershell
   $env:PYTHONPATH = "d:\Final Year Projects Works\EquipTwin-AI"
   & ".\backend\.venv\Scripts\uvicorn.exe" backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```

4. Verify backend endpoints:
   - Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

### Step 2: Run the React Dashboard

1. Open a second terminal window:
   ```bash
   cd "d:\Final Year Projects Works\EquipTwin-AI\frontend"
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

### Step 3: Run the Sensor Simulator (Optional Background Telemetry)

While the dashboard has built-in one-click simulation buttons, you can also run the continuous Python IoT simulator:

1. Open a third terminal:
   ```powershell
   cd "d:\Final Year Projects Works\EquipTwin-AI\sensor_simulator"
   & "..\backend\.venv\Scripts\python.exe" simulator.py --scenario cycle --interval 3.0
   ```

---

## 4. ServiceNow Integration Configuration

The ServiceNow module connects EquipTwin-AI to your ServiceNow instance (ITSM `incident` or custom `u_hospital_equipment_telemetry` tables).

> [!NOTE]
> **Security Guarantee**: Credentials are **never** exposed to the React frontend. Frontend users can only view connection status or trigger safe backend test dispatches.

To enable live ServiceNow incident syncing:
1. Copy `backend/.env.example` to `backend/.env`.
2. Update the credentials:
   ```env
   SERVICENOW_ENABLED=true
   SERVICENOW_INSTANCE_URL=https://devXXXXX.service-now.com
   SERVICENOW_USERNAME=admin
   SERVICENOW_PASSWORD=your_secure_password
   SERVICENOW_TABLE_INCIDENT=incident
   SERVICENOW_TABLE_TELEMETRY=u_hospital_equipment_telemetry
   ```
3. Restart the FastAPI server.
4. Click the **Settings** icon on the React dashboard to run the live connection test.

---

## 5. First Development Phase Completed Checklist

- [x] Project folders and modular architecture created.
- [x] React dashboard UI built with Vite, Tailwind CSS, and Recharts.
- [x] FastAPI backend health and telemetry endpoints built.
- [x] Simulated-data endpoint and live circular buffer implemented.
- [x] Dashboard connected to backend via Axios service module.
- [x] Tested simulated data display on both VEN-001 and DIA-001.
- [x] ServiceNow integration module prepared with zero credential leakage.
- [x] Clear clinical disclaimers and prototype estimation notices integrated.
- [x] GitHub version control ready with `.gitignore` and documentation.
