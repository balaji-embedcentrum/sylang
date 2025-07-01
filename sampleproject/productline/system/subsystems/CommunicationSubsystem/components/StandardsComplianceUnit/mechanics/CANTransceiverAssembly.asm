mechanicsassembly CANTransceiverAssembly
  name "CAN Transceiver Assembly"
  description "Mechanical assembly providing mounting, protection, and connector interface for CAN transceiver electronics"
  owner "Mechanical Team"
  tags "CAN-transceiver", "mounting", "protection", "connector-interface"
  safetylevel ASIL-D
  partof StandardsComplianceUnit
  interfaces
    input can_connector_forces "CAN connector insertion forces and mechanical stresses"
    input emi_fields "Electromagnetic interference fields and environmental conditions"
    output can_connector "CAN bus connector interface and cable termination"
    output transceiver_mount "CAN transceiver mounting and mechanical support"
    output emi_shielding "Electromagnetic interference shielding and signal protection"
