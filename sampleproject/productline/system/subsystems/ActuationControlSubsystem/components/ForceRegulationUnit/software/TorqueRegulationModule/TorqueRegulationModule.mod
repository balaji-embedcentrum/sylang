module TorqueRegulationModule
  name "Torque Regulation Software Module"
  description "Software module responsible for torque-force conversion, distribution control, feedback processing, and limit enforcement"
  owner "Software Team"
  tags "torque", "regulation", "distribution", "limits"
  safetylevel ASIL-C
  partof ForceRegulationUnit
  
  implements TorqueForceConverter, TorqueDistributionController, TorqueFeedbackProcessor, TorqueLimitEnforcer
  
  interfaces
    input torque_commands "Torque command inputs"
    input torque_feedback "Torque feedback measurements"
    output force_outputs "Converted force commands"
    output distribution_control "Torque distribution commands" 