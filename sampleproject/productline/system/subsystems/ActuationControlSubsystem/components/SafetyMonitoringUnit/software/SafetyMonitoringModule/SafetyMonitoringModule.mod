module SafetyMonitoringModule
  name "Safety Monitoring Software Module"
  description "Software module responsible for safety parameter monitoring, threshold validation, emergency shutdown, interlock management, system validation, redundancy supervision, and safe state control"
  owner "Software Team"
  tags "safety", "monitoring", "emergency", "redundancy"
  safetylevel ASIL-D
  partof SafetyMonitoringUnit
  
  implements SafetyParameterMonitor, SafetyThresholdValidator, EmergencyShutdownController, SafetyInterlockManager, SafetySystemValidator, RedundancySupervisor, SafeStateController
  
  interfaces
    input safety_parameters "Critical safety parameter inputs"
    input system_state "Overall system state"
    output safety_status "Safety system status"
    output emergency_actions "Emergency shutdown actions" 