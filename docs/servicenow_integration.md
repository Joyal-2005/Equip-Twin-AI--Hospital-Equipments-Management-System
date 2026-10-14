# ServiceNow Integration Guide

EquipTwin-AI provides a modular integration layer with ServiceNow ITSM / ITOM via Table API REST endpoints.

## 1. Security & Configuration
- **Zero Frontend Exposure**: ServiceNow credentials, tokens, and instance URLs are strictly handled by the FastAPI backend server. The React frontend interacts only with local backend proxy endpoints (`/api/v1/servicenow/status` and `/api/v1/servicenow/sync`).
- **Feature Flagging**: The integration is disabled by default (`SERVICENOW_ENABLED=false`). When disabled, all backend systems function smoothly without errors, marking ServiceNow status as "Disabled / Standby".
- **Configurable Tables**: Standard table is `incident`. Custom tables can be defined via `SERVICENOW_TABLE_TELEMETRY` (e.g., `u_hospital_equipment_telemetry`).

## 2. Environment Variables
Add these to your `backend/.env` or root `.env`:
```env
SERVICENOW_ENABLED=true
SERVICENOW_INSTANCE_URL=https://devXXXXX.service-now.com
SERVICENOW_USERNAME=admin
SERVICENOW_PASSWORD=your_secure_password
SERVICENOW_TABLE_INCIDENT=incident
SERVICENOW_TABLE_TELEMETRY=u_hospital_equipment_telemetry
```

## 3. Incident Creation Payload
When an equipment twin enters **Critical** risk or an anomaly is confirmed, an Incident can be dispatched to ServiceNow:

```json
{
  "short_description": "CRITICAL PREDICTIVE ALERT: VEN-001 High Failure Risk (0.87)",
  "description": "Equipment VEN-001 (ICU Ventilator) triggered critical threshold.\nAnomaly details: DC Voltage dropped below safe threshold (10.9V) and flow rate fluctuating.\nRecommended action: Replace auxiliary battery and calibrate flow sensor.\nSource: EquipTwin-AI Digital Twin Engine.",
  "urgency": "1",
  "impact": "1",
  "category": "Equipment Maintenance",
  "correlation_id": "VEN-001-20261014-120000"
}
```

## 4. Manual Verification
You can test the connectivity in the Settings page of the EquipTwin-AI dashboard:
1. Navigate to Settings.
2. View current ServiceNow integration status: `Enabled` vs `Disabled`, last synchronization timestamp, and test connection button.
