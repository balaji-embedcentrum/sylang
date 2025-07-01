assembly ForceActuatorAssembly
  name "Force Actuator Assembly"
  description "Mechanical assembly for force actuator components, force application mechanisms, and actuation hardware"
  owner "Mechanics Team"
  tags "force", "actuator", "actuation", "mechanism"
  safetylevel ASIL-D
  partof ForceRegulationUnit
  
  interfaces
    Force_Application "Force application mechanical interface"
    Actuator_Mount "Force actuator mounting interface"
    Force_Transmission "Force transmission mechanical interface"
