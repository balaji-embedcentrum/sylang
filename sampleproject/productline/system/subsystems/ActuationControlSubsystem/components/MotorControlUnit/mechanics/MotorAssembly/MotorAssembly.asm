assembly MotorAssembly
  name "Motor Assembly"
  description "Mechanical assembly for electric motor components, motor mounts, and rotational drive mechanisms"
  owner "Mechanics Team"
  tags "motor", "drive", "rotational", "electric"
  safetylevel ASIL-D
  partof MotorControlUnit
  
  interfaces
    Motor_Mount "Motor mounting mechanical interface"
    Drive_Output "Motor drive output shaft interface"
    Motor_Cooling "Motor thermal management interface"
