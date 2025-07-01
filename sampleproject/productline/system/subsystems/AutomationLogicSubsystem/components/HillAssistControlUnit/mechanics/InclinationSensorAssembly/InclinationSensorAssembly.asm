assembly InclinationSensorAssembly
  name "Inclination Sensor Assembly"
  description "Mechanical assembly for inclination sensors, slope measurement hardware, and angle detection components"
  owner "Mechanics Team"
  tags "inclination", "sensor", "slope", "measurement"
  safetylevel ASIL-C
  partof HillAssistControlUnit
  
  implements InclinationSensorProcessor, SlopeCalculationAlgorithm
  
  interfaces
    Inclination_Sensor_Mount "Inclination sensor mounting interface"
    Angle_Measurement_Interface "Angle measurement mechanical interface"
    Sensor_Calibration_Interface "Sensor calibration mechanical interface" 