assembly TorqueRegulationAssembly
  name "Torque Regulation Assembly"
  description "Mechanical assembly for torque regulation components, torque limiters, and rotational force control mechanisms"
  owner "Mechanics Team"
  tags "torque", "regulation", "rotational", "limiter"
  safetylevel ASIL-D
  partof ForceRegulationUnit
  
  implements TorqueLimitController
  
  interfaces
    Torque_Input "Torque input mechanical interface"
    Torque_Regulation "Torque regulation mechanical interface"
    Torque_Limiting "Torque limiting mechanical interface"
