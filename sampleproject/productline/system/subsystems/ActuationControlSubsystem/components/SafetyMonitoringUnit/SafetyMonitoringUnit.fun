componentfunctions SafetyMonitoringUnit
  // ========== ActuatorSafetyMonitor Decomposition ==========
  
  function SafetyParameterMonitor
    name "Safety Parameter Monitor"
    description "Monitors critical safety parameters including temperature, pressure, and position limits"
    owner "Hardware Team"
    tags "safety", "parameters", "monitoring", "limits"
    safetylevel ASIL-D
    decomposes ActuatorSafetyMonitor
    performedby SafetyMonitoringUnit

  function SafetyThresholdValidator
    name "Safety Threshold Validator"
    description "Validates safety thresholds and triggers protective actions when thresholds are exceeded"
    owner "Hardware Team"
    tags "safety", "thresholds", "validation", "protection"
    safetylevel ASIL-D
    decomposes ActuatorSafetyMonitor
    performedby SafetyMonitoringUnit

  function EmergencyShutdownController
    name "Emergency Shutdown Controller"
    description "Controls emergency shutdown procedures and ensures safe system deactivation"
    owner "Hardware Team"
    tags "emergency", "shutdown", "procedures", "deactivation"
    safetylevel ASIL-D
    decomposes ActuatorSafetyMonitor
    performedby SafetyMonitoringUnit

  function SafetyInterlockManager
    name "Safety Interlock Manager"
    description "Manages safety interlocks and prevents unsafe operations through interlock logic"
    owner "Hardware Team"
    tags "safety", "interlocks", "management", "logic"
    safetylevel ASIL-D
    decomposes ActuatorSafetyMonitor
    performedby SafetyMonitoringUnit

  // ========== ThermalProtectionManager Decomposition ==========

  function TemperatureSensorProcessor
    name "Temperature Sensor Processor"
    description "Processes temperature sensor data and provides accurate temperature measurements"
    owner "Hardware Team"
    tags "temperature", "sensor", "processing", "measurements"
    safetylevel ASIL-C
    decomposes ThermalProtectionManager
    performedby SafetyMonitoringUnit

  function ThermalModelCalculator
    name "Thermal Model Calculator"
    description "Calculates thermal models and predicts temperature rise based on operating conditions"
    owner "Hardware Team"
    tags "thermal", "modeling", "prediction", "conditions"
    safetylevel ASIL-C
    decomposes ThermalProtectionManager
    performedby SafetyMonitoringUnit

  function ThermalLimitEnforcer
    name "Thermal Limit Enforcer"
    description "Enforces thermal limits and reduces actuator power when temperature limits are approached"
    owner "Hardware Team"
    tags "thermal", "limits", "enforcement", "power-reduction"
    safetylevel ASIL-C
    decomposes ThermalProtectionManager
    performedby SafetyMonitoringUnit

  function CoolingSystemController
    name "Cooling System Controller"
    description "Controls active cooling systems and manages cooling strategies for thermal protection"
    owner "Hardware Team"
    tags "cooling", "system", "control", "strategies"
    safetylevel ASIL-C
    decomposes ThermalProtectionManager
    performedby SafetyMonitoringUnit

  // ========== ActuatorDiagnosticProcessor Decomposition ==========

  function SafetyDiagnosticEngine
    name "Safety Diagnostic Engine"
    description "Performs safety-critical diagnostics and identifies potential safety hazards"
    owner "Hardware Team"
    tags "safety", "diagnostics", "hazards", "identification"
    safetylevel ASIL-D
    decomposes ActuatorDiagnosticProcessor
    performedby SafetyMonitoringUnit

  function SafetyFaultClassifier
    name "Safety Fault Classifier"
    description "Classifies detected faults by safety criticality and determines appropriate responses"
    owner "Hardware Team"
    tags "fault", "classification", "criticality", "responses"
    safetylevel ASIL-D
    decomposes ActuatorDiagnosticProcessor
    performedby SafetyMonitoringUnit

  function SafetyDataLogger
    name "Safety Data Logger"
    description "Logs safety-related events and maintains permanent record of safety incidents"
    owner "Hardware Team"
    tags "safety", "logging", "events", "incidents"
    safetylevel ASIL-D
    decomposes ActuatorDiagnosticProcessor
    performedby SafetyMonitoringUnit

  function SafetyReportingAgent
    name "Safety Reporting Agent"
    description "Reports safety violations and communicates safety status to higher-level systems"
    owner "Hardware Team"
    tags "safety", "reporting", "violations", "status"
    safetylevel ASIL-D
    decomposes ActuatorDiagnosticProcessor
    performedby SafetyMonitoringUnit

  // ========== Comprehensive Safety Functions ==========

  function SafetySystemValidator
    name "Safety System Validator"
    description "Validates overall safety system integrity and performs safety system self-tests"
    owner "Hardware Team"
    tags "safety", "validation", "integrity", "self-tests"
    safetylevel ASIL-D
    decomposes ActuatorSafetyMonitor
    performedby SafetyMonitoringUnit

  function RedundancySupervisor
    name "Redundancy Supervisor"
    description "Supervises redundant safety systems and manages redundancy voting and switching"
    owner "Hardware Team"
    tags "redundancy", "supervision", "voting", "switching"
    safetylevel ASIL-D
    decomposes ActuatorSafetyMonitor
    performedby SafetyMonitoringUnit

  function SafeStateController
    name "Safe State Controller"
    description "Controls transition to safe states and maintains safe operation during fault conditions"
    owner "Hardware Team"
    tags "safe-state", "control", "transitions", "fault-conditions"
    safetylevel ASIL-D
    decomposes ActuatorSafetyMonitor
    performedby SafetyMonitoringUnit 