mechanicsassembly LINTransceiverAssembly
  name "LIN Transceiver Assembly"
  description "Mechanical assembly providing mounting, protection, and connector interface for LIN transceiver electronics"
  owner "Mechanical Team"
  tags "LIN-transceiver", "mounting", "protection", "connector-interface"
  safetylevel ASIL-C
  partof StandardsComplianceUnit
  interfaces
    input lin_connector_forces "LIN connector insertion forces and mechanical stresses"
    input emi_fields "Electromagnetic interference fields and environmental conditions"
    output lin_connector "LIN bus connector interface and cable termination"
    output transceiver_mount "LIN transceiver mounting and mechanical support"
    output emi_shielding "Electromagnetic interference shielding and signal protection"
