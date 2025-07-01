module TorqueControlModule
  name "Torque Control Software Module"
  description "Software module responsible for torque calculation, control loops, limit supervision, feedback processing, and command validation"
  owner "Software Team"
  tags "torque", "calculation", "control", "limits"
  safetylevel ASIL-C
  partof MotorControlUnit
  
  implements TorqueCalculationEngine, TorqueControlLoop, TorqueLimitSupervisor, TorqueFeedbackProcessor, TorqueCommandValidator
  
  interfaces
    input torque_commands "Torque command inputs"
    input motor_parameters "Motor characteristic parameters"
    output torque_control "Torque control outputs"
    output torque_estimates "Calculated torque values" 