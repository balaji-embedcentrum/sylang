subsystemfunctions SafetySubsystem
  function EmergencyDetectionLogic
    name "Emergency Detection Logic"
    description "Detects emergency conditions and triggers appropriate emergency response procedures."
    owner "Safety Team"
    tags "emergency", "detection", "response"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function ManualReleaseController
    name "Manual Release Controller"
    description "Controls manual emergency release mechanisms and validates manual release operations."
    owner "Safety Team"
    tags "manual", "release", "validation"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function SafetyInterlockManager
    name "Safety Interlock Manager"
    description "Manages safety interlocks and ensures safe operation during emergency procedures."
    owner "Safety Team"
    tags "interlock", "safety", "procedures"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function HazardAnalysisEngine
    name "Hazard Analysis Engine"
    description "Analyzes potential hazards and assesses risk levels for safety-critical operations."
    owner "Safety Team"
    tags "hazard", "analysis", "risk"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function SafetyCriticalPathMonitor
    name "Safety Critical Path Monitor"
    description "Monitors safety-critical execution paths and detects deviations from safe operation."
    owner "Safety Team"
    tags "critical-path", "monitoring", "deviations"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function EmergencyShutdownController
    name "Emergency Shutdown Controller"
    description "Controls emergency system shutdown procedures and safe state transitions."
    owner "Safety Team"
    tags "shutdown", "procedures", "safe-state"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function SafetyViolationDetector
    name "Safety Violation Detector"
    description "Detects safety constraint violations and triggers corrective actions."
    owner "Safety Team"
    tags "violation", "detection", "corrective"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function RiskAssessmentProcessor
    name "Risk Assessment Processor"
    description "Processes risk assessment data and calculates dynamic risk levels."
    owner "Safety Team"
    tags "risk", "assessment", "dynamic"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function SafetyEventLogger
    name "Safety Event Logger"
    description "Logs safety events and maintains audit trails for safety investigations."
    owner "Safety Team"
    tags "logging", "events", "audit"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function FailsafeStateController
    name "Failsafe State Controller"
    description "Controls transition to failsafe states when safety violations are detected."
    owner "Safety Team"
    tags "failsafe", "state", "transition"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function SafetyTestCoordinator
    name "Safety Test Coordinator"
    description "Coordinates safety testing procedures and validates safety mechanism functionality."
    owner "Safety Team"
    tags "testing", "coordination", "validation"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem

  function EmergencyNotificationManager
    name "Emergency Notification Manager"
    description "Manages emergency notifications and alerts to relevant safety personnel."
    owner "Safety Team"
    tags "notification", "alerts", "personnel"
    safetylevel ASIL-B
    compose EmergencyReleaseValve
    performedby SafetySubsystem 