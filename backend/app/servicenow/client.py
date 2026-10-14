import httpx
from typing import Dict, Any, Optional
from datetime import datetime
from backend.app.config import settings

class ServiceNowClient:
    """
    Dedicated ServiceNow REST API Integration Module.
    
    Reads credentials from environment variables.
    Configurable and safely disabled by default.
    Never exposes credentials to frontend consumers.
    """

    def __init__(self):
        self.enabled = settings.SERVICENOW_ENABLED
        self.instance_url = settings.SERVICENOW_INSTANCE_URL.rstrip('/')
        self.username = settings.SERVICENOW_USERNAME
        self.password = settings.SERVICENOW_PASSWORD
        self.table_incident = settings.SERVICENOW_TABLE_INCIDENT
        self.table_telemetry = settings.SERVICENOW_TABLE_TELEMETRY

    def get_status(self) -> Dict[str, Any]:
        """Returns safe status without exposing passwords."""
        has_url = bool(self.instance_url and not self.instance_url.startswith("https://dev00000"))
        has_auth = bool(self.username and self.password and self.password != "your_servicenow_password_here")
        
        is_ready = self.enabled and has_url and has_auth
        
        return {
            "enabled": self.enabled,
            "configured": bool(has_url and has_auth),
            "status": "Connected" if is_ready else ("Standby (Config Needed)" if self.enabled else "Disabled (Manual Sync Mode)"),
            "instance_host": self.instance_url.replace("https://", "").replace("http://", "") if self.instance_url else "Not Configured",
            "table_incident": self.table_incident,
            "table_telemetry": self.table_telemetry,
            "safe_username": (self.username[:3] + "***") if len(self.username) > 3 else ("Set" if self.username else "Not Set"),
            "note": "ServiceNow integration is safely gated. Enable and provide instance credentials in backend/.env to dispatch real incidents."
        }

    async def test_connection(self) -> Dict[str, Any]:
        """Tests connectivity to the configured ServiceNow instance."""
        if not self.enabled:
            return {
                "success": False,
                "message": "ServiceNow integration is currently DISABLED in backend configuration (SERVICENOW_ENABLED=false)."
            }

        if not self.instance_url or not self.username or not self.password:
            return {
                "success": False,
                "message": "ServiceNow instance URL or credentials are incomplete in environment variables."
            }

        endpoint = f"{self.instance_url}/api/now/table/{self.table_incident}?sysparm_limit=1"
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    endpoint,
                    auth=(self.username, self.password),
                    headers={"Accept": "application/json"}
                )
                if res.status_code == 200:
                    return {
                        "success": True,
                        "status_code": res.status_code,
                        "message": "Successfully authenticated with ServiceNow instance."
                    }
                else:
                    return {
                        "success": False,
                        "status_code": res.status_code,
                        "message": f"ServiceNow returned HTTP {res.status_code}: {res.text[:200]}"
                    }
        except Exception as e:
            return {
                "success": False,
                "message": f"Network error contacting ServiceNow: {str(e)}"
            }

    async def create_incident(self, equipment_id: str, risk_data: Dict[str, Any], recommended_action: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates an incident ticket in ServiceNow table if enabled.
        If disabled, logs a simulated local ticket dispatch.
        """
        correlation_id = f"{equipment_id}-{int(datetime.utcnow().timestamp())}"
        short_desc = f"EQUIPTWIN ALERT: {equipment_id} Elevated Risk ({risk_data.get('risk_level', 'Warning')})"
        
        description = (
            f"EquipTwin-AI Telemetry Alert for {equipment_id}\n"
            f"Risk Level: {risk_data.get('risk_level')}\n"
            f"Failure Probability (Prototype): {risk_data.get('failure_probability')}\n"
            f"Flagged Sensors: {risk_data.get('flagged_sensors')}\n"
            f"Recommended Maintenance Action: {recommended_action or 'Investigate device logs'}\n"
            f"Generated At: {datetime.utcnow().isoformat()}Z\n"
            f"Note: Dispatch triggered from EquipTwin Digital Twin state transition."
        )

        if not self.enabled:
            # Safe simulated ticket record for testing & local development
            return {
                "dispatched": False,
                "simulated": True,
                "message": "ServiceNow disabled. Created local mock maintenance record.",
                "ticket": {
                    "sys_id": f"mock_sys_{correlation_id}",
                    "number": f"INC-SIM-{correlation_id[-6:]}",
                    "short_description": short_desc,
                    "correlation_id": correlation_id,
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
            }

        endpoint = f"{self.instance_url}/api/now/table/{self.table_incident}"
        payload = {
            "short_description": short_desc,
            "description": description,
            "urgency": "1" if risk_data.get("risk_level") == "Critical" else "2",
            "impact": "1" if risk_data.get("risk_level") == "Critical" else "2",
            "category": "Medical Equipment",
            "correlation_id": correlation_id
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    endpoint,
                    auth=(self.username, self.password),
                    json=payload,
                    headers={"Accept": "application/json", "Content-Type": "application/json"}
                )
                if res.status_code in [200, 201]:
                    data = res.json().get("result", {})
                    return {
                        "dispatched": True,
                        "simulated": False,
                        "ticket": {
                            "sys_id": data.get("sys_id"),
                            "number": data.get("number"),
                            "short_description": short_desc,
                            "correlation_id": correlation_id
                        }
                    }
                else:
                    return {
                        "dispatched": False,
                        "error": f"ServiceNow API returned {res.status_code}: {res.text[:200]}"
                    }
        except Exception as e:
            return {
                "dispatched": False,
                "error": f"Failed to send incident to ServiceNow: {str(e)}"
            }

servicenow_client = ServiceNowClient()
