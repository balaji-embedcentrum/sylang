assembly TemperatureSensorAssembly
  name "Temperature Sensor Assembly"
  description "Mechanical assembly for temperature sensors, thermal protection hardware, and temperature monitoring mechanisms"
  owner "Mechanics Team"
  tags "temperature", "sensor", "thermal", "monitoring"
  safetylevel ASIL-C
  partof SafetyMonitoringUnit
  
  implements TemperatureSensorProcessor
  
  interfaces
    Temperature_Sensor "Temperature sensor mechanical interface"
    Thermal_Contact "Thermal contact mechanical interface"
    Sensor_Housing "Temperature sensor housing interface"
