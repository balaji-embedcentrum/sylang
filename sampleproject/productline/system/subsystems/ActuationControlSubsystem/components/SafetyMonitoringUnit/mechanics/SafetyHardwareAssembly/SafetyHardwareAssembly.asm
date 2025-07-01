assembly SafetyHardwareAssembly
  name "Safety Hardware Assembly"
  description "Mechanical assembly for safety hardware components, emergency stops, interlocks, and safety mechanism hardware"
  owner "Mechanics Team"
  tags "safety", "hardware", "emergency", "interlock"
  safetylevel ASIL-D
  partof SafetyMonitoringUnit
  
  implements SafetyInterlockManager, EmergencyShutdownController
  
  interfaces
    Emergency_Stop "Emergency stop mechanical interface"
    Safety_Interlock "Safety interlock mechanical interface"
    Safe_State_Hardware "Safe state hardware mechanical interface"
