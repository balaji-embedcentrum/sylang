assembly PositionSensorAssembly
  name "Position Sensor Assembly"
  description "Mechanical assembly for position sensors, encoder hardware, and sensor mounting mechanisms"
  owner "Mechanics Team"
  tags "position", "sensor", "encoder", "mounting"
  safetylevel ASIL-C
  partof PositionControlUnit
  
  implements PositionSensorProcessor
  
  interfaces
    Sensor_Mount "Position sensor mounting interface"
    Encoder_Interface "Encoder mechanical interface"
    Sensor_Protection "Sensor protection housing interface"
