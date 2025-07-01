subsystemfunctions ActuationControlSubsystem
  function MotorDriveController
    name "Motor Drive Controller"
    description "Controls motor drive circuits and power management for actuator systems."
    owner "Hardware Team"
    tags "motor", "drive", "power"
    safetylevel ASIL-D
    compose ActuationSystemManager
    performedby ActuationControlSubsystem

  function ActuatorSelectionLogic
    name "Actuator Selection Logic"
    description "Implements logic for selecting and switching between different actuator types based on configuration."
    owner "Hardware Team"
    tags "actuator", "selection", "logic"
    safetylevel ASIL-D
    compose ActuatorTypeSelector
    performedby ActuationControlSubsystem

  function ForceCalculationEngine
    name "Force Calculation Engine"
    description "Calculates required clamping forces and manages force regulation algorithms."
    owner "Hardware Team"
    tags "force", "calculation", "algorithms"
    safetylevel ASIL-C
    compose ForceRegulationModule
    performedby ActuationControlSubsystem

  function ActuatorSafetyMonitor
    name "Actuator Safety Monitor"
    description "Monitors actuator safety parameters and implements emergency shutdown procedures."
    owner "Hardware Team"
    tags "safety", "monitor", "emergency"
    safetylevel ASIL-D
    compose ActuationSystemManager
    performedby ActuationControlSubsystem

  function MotorCurrentController
    name "Motor Current Controller"
    description "Controls motor current levels and implements current limiting for actuator protection."
    owner "Hardware Team"
    tags "current", "control", "protection"
    safetylevel ASIL-D
    compose ActuationSystemManager
    performedby ActuationControlSubsystem

  function TorqueRegulationModule
    name "Torque Regulation Module"
    description "Regulates motor torque output and manages torque-based control strategies."
    owner "Hardware Team"
    tags "torque", "regulation", "control"
    safetylevel ASIL-C
    compose ForceRegulationModule
    performedby ActuationControlSubsystem

  function ActuatorPositionTracker
    name "Actuator Position Tracker"
    description "Tracks actuator position and manages position-based control feedback loops."
    owner "Hardware Team"
    tags "position", "tracking", "feedback"
    safetylevel ASIL-D
    compose ActuationSystemManager
    performedby ActuationControlSubsystem

  function PowerSupplyManager
    name "Power Supply Manager"
    description "Manages power supply distribution and voltage regulation for actuator systems."
    owner "Hardware Team"
    tags "power", "supply", "voltage"
    safetylevel ASIL-D
    compose ActuationSystemManager
    performedby ActuationControlSubsystem

  function ActuatorCalibrationController
    name "Actuator Calibration Controller"
    description "Controls actuator calibration procedures and maintains calibration parameters."
    owner "Hardware Team"
    tags "calibration", "procedures", "parameters"
    safetylevel ASIL-D
    compose ActuatorTypeSelector
    performedby ActuationControlSubsystem

  function ThermalProtectionManager
    name "Thermal Protection Manager"
    description "Monitors actuator temperature and implements thermal protection mechanisms."
    owner "Hardware Team"
    tags "thermal", "protection", "temperature"
    safetylevel ASIL-C
    compose ActuationSystemManager
    performedby ActuationControlSubsystem

  function ActuatorDiagnosticProcessor
    name "Actuator Diagnostic Processor"
    description "Processes actuator diagnostic data and identifies potential actuator issues."
    owner "Hardware Team"
    tags "diagnostic", "processing", "issues"
    safetylevel ASIL-D
    compose ActuationSystemManager
    performedby ActuationControlSubsystem

  function LoadCompensationController
    name "Load Compensation Controller"
    description "Compensates for varying load conditions and maintains consistent actuator performance."
    owner "Hardware Team"
    tags "load", "compensation", "performance"
    safetylevel ASIL-C
    compose ForceRegulationModule
    performedby ActuationControlSubsystem

  function ActuatorWearMonitor
    name "Actuator Wear Monitor"
    description "Monitors actuator wear patterns and predicts maintenance requirements."
    owner "Hardware Team"
    tags "wear", "monitoring", "maintenance"
    safetylevel ASIL-C
    compose ActuationSystemManager
    performedby ActuationControlSubsystem

  function BackupActuatorController
    name "Backup Actuator Controller"
    description "Controls backup actuator systems and manages failover procedures."
    owner "Hardware Team"
    tags "backup", "failover", "redundancy"
    safetylevel ASIL-D
    compose ActuatorTypeSelector
    performedby ActuationControlSubsystem 