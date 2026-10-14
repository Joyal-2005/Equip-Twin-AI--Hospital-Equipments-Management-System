from typing import Dict, List, Optional
from backend.app.models.equipment import EquipmentMetadata, SensorMeta

EQUIPMENT_REGISTRY: Dict[str, EquipmentMetadata] = {
    "VEN-001": EquipmentMetadata(
        id="VEN-001",
        name="ICU Mechanical Ventilator",
        department="Intensive Care Unit (ICU Pod B)",
        model="RespiraCare Pro 5000",
        serial_number="RC-2024-V9942",
        location="Room 304 - Bed 2",
        installed_date="2024-03-15",
        last_serviced_date="2026-08-10",
        sensors=[
            SensorMeta(
                id="airway_pressure",
                name="Airway Pressure Sensor",
                unit="cmH2O",
                normal_min=15.0,
                normal_max=25.0,
                critical_min=8.0,
                critical_max=35.0,
                description="Peak Inspiratory Pressure (PIP) transducer monitoring patient breathing loop."
            ),
            SensorMeta(
                id="flow_rate",
                name="Flow Sensor",
                unit="L/min",
                normal_min=25.0,
                normal_max=55.0,
                critical_min=12.0,
                critical_max=75.0,
                description="Bidirectional inspiratory & expiratory gas flow sensor."
            ),
            SensorMeta(
                id="dht11_temperature",
                name="DHT11 Temperature Channel",
                unit="°C",
                normal_min=20.0,
                normal_max=28.0,
                critical_min=15.0,
                critical_max=36.0,
                description="Internal equipment enclosure and humidified gas temp."
            ),
            SensorMeta(
                id="dht11_humidity",
                name="DHT11 Humidity Channel",
                unit="%",
                normal_min=40.0,
                normal_max=70.0,
                critical_min=25.0,
                critical_max=85.0,
                description="Breathing gas relative humidity conditioning channel."
            ),
            SensorMeta(
                id="dc_voltage",
                name="DC Voltage Sensor",
                unit="V",
                normal_min=11.8,
                normal_max=12.4,
                critical_min=10.8,
                critical_max=13.2,
                description="Internal 12V DC power distribution and backup battery bus voltage."
            ),
        ]
    ),
    "DIA-001": EquipmentMetadata(
        id="DIA-001",
        name="Hemodialysis Machine",
        department="Nephrology & Dialysis Ward",
        model="HemoPure UltraDial 880",
        serial_number="HD-2023-D4411",
        location="Dialysis Station 4",
        installed_date="2023-11-20",
        last_serviced_date="2026-07-02",
        sensors=[
            SensorMeta(
                id="air_in_blood",
                name="Air-in-Blood Detector",
                unit="flag",
                normal_min=0.0,
                normal_max=0.0,
                critical_min=0.0,
                critical_max=0.0,
                description="Ultrasonic bubble sensor on the venous blood return tubing."
            ),
            SensorMeta(
                id="ds18b20_temperature",
                name="DS18B20 Temperature Sensor",
                unit="°C",
                normal_min=35.5,
                normal_max=37.5,
                critical_min=34.5,
                critical_max=38.5,
                description="High-precision digital probe for dialysate fluid temperature."
            ),
            SensorMeta(
                id="venous_pressure",
                name="Venous Pressure Sensor",
                unit="mmHg",
                normal_min=80.0,
                normal_max=150.0,
                critical_min=50.0,
                critical_max=220.0,
                description="Venous blood return pressure monitor."
            ),
            SensorMeta(
                id="conductivity",
                name="Conductivity Sensor",
                unit="mS/cm",
                normal_min=13.2,
                normal_max=14.5,
                critical_min=12.6,
                critical_max=15.3,
                description="Electrolyte concentration conductivity cell measuring dialysate."
            ),
        ]
    )
}

class EquipmentService:
    @classmethod
    def list_all(cls) -> List[EquipmentMetadata]:
        return list(EQUIPMENT_REGISTRY.values())

    @classmethod
    def get_by_id(cls, equipment_id: str) -> Optional[EquipmentMetadata]:
        return EQUIPMENT_REGISTRY.get(equipment_id)
