module CurrentControlModule
  name "Current Control Software Module"
  description "Software module responsible for current sensing, regulation, overcurrent protection, measurement validation, and command processing"
  owner "Software Team"
  tags "current", "sensing", "regulation", "protection"
  safetylevel ASIL-D
  partof MotorControlUnit
  
  implements CurrentSensingProcessor, CurrentRegulationController, OvercurrentProtectionAgent, CurrentMeasurementValidator, CurrentCommandProcessor
  
  interfaces
    input current_sensors "Current measurement inputs"
    input current_commands "Current command inputs"
    output current_control "Current regulation outputs"
    output protection_triggers "Overcurrent protection signals" 