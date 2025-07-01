module ThermalProtectionModule
  name "Thermal Protection Software Module"
  description "Software module responsible for temperature sensor processing, thermal modeling, limit enforcement, and cooling system control"
  owner "Software Team"
  tags "thermal", "temperature", "protection", "cooling"
  safetylevel ASIL-C
  partof SafetyMonitoringUnit
  
  implements TemperatureSensorProcessor, ThermalModelCalculator, ThermalLimitEnforcer, CoolingSystemController
  
  interfaces
    input temperature_sensors "Temperature sensor measurements"
    input thermal_conditions "Operating thermal conditions"
    output thermal_status "Thermal protection status"
    output cooling_commands "Cooling system control commands" 