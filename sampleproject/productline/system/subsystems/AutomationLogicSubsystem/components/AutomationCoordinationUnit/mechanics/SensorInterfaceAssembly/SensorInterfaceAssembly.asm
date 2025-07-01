assembly SensorInterfaceAssembly
  name "Sensor Interface Assembly"
  description "Mechanical assembly for sensor interface hardware, signal conditioning mounts, and sensor protection"
  owner "Mechanics Team"
  tags "sensor", "interface", "conditioning", "protection"
  safetylevel ASIL-B
  partof AutomationCoordinationUnit
  
  implements InputPatternAnalyzer
  
  interfaces
    Sensor_Mount_Interface "Sensor mounting mechanical interface"
    Signal_Conditioning_Mount "Signal conditioning hardware mount"
    Sensor_Protection_Housing "Sensor protection mechanical housing" 