from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "EquipTwin-AI"
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # AI settings
    AI_MODEL_CONFIDENCE_THRESHOLD: float = 0.75
    AI_PROTOTYPE_MODE: bool = True
    
    # ServiceNow settings
    SERVICENOW_ENABLED: bool = False
    SERVICENOW_INSTANCE_URL: str = ""
    SERVICENOW_USERNAME: str = ""
    SERVICENOW_PASSWORD: str = ""
    SERVICENOW_TABLE_INCIDENT: str = "incident"
    SERVICENOW_TABLE_TELEMETRY: str = "u_hospital_equipment_telemetry"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
