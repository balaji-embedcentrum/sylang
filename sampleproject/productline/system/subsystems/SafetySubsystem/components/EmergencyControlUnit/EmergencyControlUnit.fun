componentfunctions EmergencyControlUnit
  // ========== EmergencyDetectionEngine Decomposition ==========
  
  function HazardousEventDetector
    name "Hazardous Event Detector"
    description "Detects hazardous events and emergency conditions requiring immediate response"
    owner "Safety Team"
    tags "hazardous", "events", "detection", "emergency"
    safetylevel ASIL-D
    decomposes EmergencyDetectionEngine
    performedby EmergencyControlUnit

  function CriticalityAssessmentEngine
    name "Criticality Assessment Engine"
    description "Assesses criticality levels of detected emergency conditions"
    owner "Safety Team"
    tags "criticality", "assessment", "emergency", "conditions"
    safetylevel ASIL-D
    decomposes EmergencyDetectionEngine
    performedby EmergencyControlUnit

  function MultiModalEmergencyDetector
    name "Multi Modal Emergency Detector"
    description "Integrates multiple detection modes for comprehensive emergency identification"
    owner "Safety Team"
    tags "multi-modal", "emergency", "detection", "comprehensive"
    safetylevel ASIL-D
    decomposes EmergencyDetectionEngine
    performedby EmergencyControlUnit

  function FalseAlarmMitigationEngine
    name "False Alarm Mitigation Engine"
    description "Mitigates false alarms while maintaining sensitivity to real emergencies"
    owner "Safety Team"
    tags "false", "alarm", "mitigation", "sensitivity"
    safetylevel ASIL-D
    decomposes EmergencyDetectionEngine
    performedby EmergencyControlUnit

  // ========== SafeStateController Decomposition ==========

  function SafeStateDefinitionManager
    name "Safe State Definition Manager"
    description "Manages definitions of safe states for different operational contexts"
    owner "Safety Team"
    tags "safe", "state", "definition", "contexts"
    safetylevel ASIL-D
    decomposes SafeStateController
    performedby EmergencyControlUnit

  function SafeStateTransitionController
    name "Safe State Transition Controller"
    description "Controls transitions to safe states during emergency situations"
    owner "Safety Team"
    tags "safe", "state", "transition", "emergency"
    safetylevel ASIL-D
    decomposes SafeStateController
    performedby EmergencyControlUnit

  function SystemGracefulDegradation
    name "System Graceful Degradation"
    description "Implements graceful system degradation to maintain partial functionality"
    owner "Safety Team"
    tags "graceful", "degradation", "partial", "functionality"
    safetylevel ASIL-D
    decomposes SafeStateController
    performedby EmergencyControlUnit

  function SafeStateValidationEngine
    name "Safe State Validation Engine"
    description "Validates that achieved states meet safety requirements and constraints"
    owner "Safety Team"
    tags "safe", "state", "validation", "requirements"
    safetylevel ASIL-D
    decomposes SafeStateController
    performedby EmergencyControlUnit

  // ========== EmergencyResponseOrchestrator Decomposition ==========

  function ResponsePriorityManager
    name "Response Priority Manager"
    description "Manages response priorities for multiple simultaneous emergency conditions"
    owner "Safety Team"
    tags "response", "priority", "management", "simultaneous"
    safetylevel ASIL-D
    decomposes EmergencyResponseOrchestrator
    performedby EmergencyControlUnit

  function ActionSequenceController
    name "Action Sequence Controller"
    description "Controls sequence of emergency response actions for optimal safety outcomes"
    owner "Safety Team"
    tags "action", "sequence", "control", "optimal"
    safetylevel ASIL-D
    decomposes EmergencyResponseOrchestrator
    performedby EmergencyControlUnit

  function ResourceAllocationManager
    name "Resource Allocation Manager"
    description "Allocates system resources for emergency response and safety functions"
    owner "Safety Team"
    tags "resource", "allocation", "emergency", "safety"
    safetylevel ASIL-D
    decomposes EmergencyResponseOrchestrator
    performedby EmergencyControlUnit

  function EmergencyTimeoutController
    name "Emergency Timeout Controller"
    description "Controls timeouts for emergency responses and implements fallback actions"
    owner "Safety Team"
    tags "emergency", "timeout", "control", "fallback"
    safetylevel ASIL-D
    decomposes EmergencyResponseOrchestrator
    performedby EmergencyControlUnit

  // ========== FailsafeActivationController Decomposition ==========

  function FailsafeMechanismTrigger
    name "Failsafe Mechanism Trigger"
    description "Triggers failsafe mechanisms when normal safety functions are compromised"
    owner "Safety Team"
    tags "failsafe", "mechanism", "trigger", "compromised"
    safetylevel ASIL-D
    decomposes FailsafeActivationController
    performedby EmergencyControlUnit

  function RedundancyActivationEngine
    name "Redundancy Activation Engine"
    description "Activates redundant systems and backup safety mechanisms"
    owner "Safety Team"
    tags "redundancy", "activation", "backup", "mechanisms"
    safetylevel ASIL-D
    decomposes FailsafeActivationController
    performedby EmergencyControlUnit

  function HardwareFailsafeController
    name "Hardware Failsafe Controller"
    description "Controls hardware-level failsafe mechanisms for ultimate safety protection"
    owner "Safety Team"
    tags "hardware", "failsafe", "ultimate", "protection"
    safetylevel ASIL-D
    decomposes FailsafeActivationController
    performedby EmergencyControlUnit

  function FailsafeStatusMonitor
    name "Failsafe Status Monitor"
    description "Monitors status of failsafe mechanisms and ensures their operational readiness"
    owner "Safety Team"
    tags "failsafe", "status", "monitoring", "readiness"
    safetylevel ASIL-D
    decomposes FailsafeActivationController
    performedby EmergencyControlUnit

  // ========== Advanced Emergency Control ==========

  function PredictiveEmergencyEngine
    name "Predictive Emergency Engine"
    description "Predicts potential emergency situations based on system behavior patterns"
    owner "Safety Team"
    tags "predictive", "emergency", "patterns", "behavior"
    safetylevel ASIL-D
    decomposes EmergencyDetectionEngine
    performedby EmergencyControlUnit

  function EmergencyRecoveryPlanner
    name "Emergency Recovery Planner"
    description "Plans recovery strategies from emergency states to normal operation"
    owner "Safety Team"
    tags "emergency", "recovery", "planning", "strategies"
    safetylevel ASIL-D
    decomposes EmergencyResponseOrchestrator
    performedby EmergencyControlUnit

  function CascadingFailurePreventor
    name "Cascading Failure Preventor"
    description "Prevents cascading failures that could lead to catastrophic system failures"
    owner "Safety Team"
    tags "cascading", "failure", "prevention", "catastrophic"
    safetylevel ASIL-D
    decomposes SafeStateController
    performedby EmergencyControlUnit

  function EmergencyDataRecorder
    name "Emergency Data Recorder"
    description "Records critical data during emergencies for post-incident analysis"
    owner "Safety Team"
    tags "emergency", "data", "recording", "analysis"
    safetylevel ASIL-D
    decomposes EmergencyResponseOrchestrator
    performedby EmergencyControlUnit 