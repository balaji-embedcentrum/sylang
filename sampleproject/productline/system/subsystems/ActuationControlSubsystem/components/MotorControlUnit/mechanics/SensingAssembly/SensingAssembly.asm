assembly SensingAssembly
  name "Motor Sensing Assembly"
  description "Mechanical assembly for motor position sensors, encoder mounts, and feedback mechanism hardware"
  owner "Mechanics Team"
  tags "sensing", "encoder", "position", "feedback"
  safetylevel ASIL-C
  partof MotorControlUnit
  
  implements MotorPositionSensor
  
  interfaces
    Encoder_Mount "Encoder mounting mechanical interface"
    Position_Sensing "Motor position sensing interface"
    Sensor_Protection "Sensor protection housing interface"
