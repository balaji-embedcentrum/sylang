assembly VehicleSensorAssembly
  name "Vehicle Sensor Assembly"
  description "Mechanical assembly for vehicle sensors, speed monitoring hardware, and brake input detection components"
  owner "Mechanics Team"
  tags "sensor", "vehicle", "speed", "detection"
  safetylevel ASIL-B
  partof AutoHoldControlUnit
  
  implements VehicleStateAnalyzer, SpeedThresholdMonitor
  
  interfaces
    Speed_Sensor_Mount "Speed sensor mounting interface"
    Vehicle_State_Sensors "Vehicle state sensor mounting interface"
    Sensor_Protection_Housing "Sensor protection and housing interface" 