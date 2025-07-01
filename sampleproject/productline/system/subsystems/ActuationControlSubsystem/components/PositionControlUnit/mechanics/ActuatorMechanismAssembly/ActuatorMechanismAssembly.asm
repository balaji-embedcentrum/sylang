assembly ActuatorMechanismAssembly
  name "Actuator Mechanism Assembly"
  description "Mechanical assembly for actuator mechanisms, drive linkages, and positioning hardware"
  owner "Mechanics Team"
  tags "actuator", "mechanism", "linkage", "positioning"
  safetylevel ASIL-D
  partof PositionControlUnit
  
  interfaces
    Actuator_Drive "Actuator drive mechanical interface"
    Mechanism_Linkage "Mechanism linkage mechanical interface"
    Position_Transfer "Position transfer mechanical interface"
