componentfunctions AutomationCoordinationUnit
  // ========== AutomationStateMachine Decomposition ==========
  
  function StateTransitionController
    name "State Transition Controller"
    description "Controls state transitions in the automation state machine and validates transition conditions"
    owner "Software Team"
    tags "state", "transition", "control", "validation"
    safetylevel ASIL-B
    decomposes AutomationStateMachine
    performedby AutomationCoordinationUnit

  function StateValidationEngine
    name "State Validation Engine"
    description "Validates automation states and ensures state consistency across the system"
    owner "Software Team"
    tags "state", "validation", "consistency", "system"
    safetylevel ASIL-B
    decomposes AutomationStateMachine
    performedby AutomationCoordinationUnit

  function ActivationSequencer
    name "Activation Sequencer"
    description "Sequences automation activation across different subsystems and components"
    owner "Software Team"
    tags "activation", "sequencing", "subsystems", "coordination"
    safetylevel ASIL-B
    decomposes AutomationStateMachine
    performedby AutomationCoordinationUnit

  function DeactivationOrchestrator
    name "Deactivation Orchestrator"
    description "Orchestrates automation deactivation and ensures safe system shutdown"
    owner "Software Team"
    tags "deactivation", "orchestration", "safe", "shutdown"
    safetylevel ASIL-B
    decomposes AutomationStateMachine
    performedby AutomationCoordinationUnit

  // ========== AutomationSafetyValidator Decomposition ==========

  function SafetyConditionChecker
    name "Safety Condition Checker"
    description "Checks safety conditions before allowing automation activation or operation"
    owner "Software Team"
    tags "safety", "conditions", "checking", "validation"
    safetylevel ASIL-B
    decomposes AutomationSafetyValidator
    performedby AutomationCoordinationUnit

  function InterlockLogicProcessor
    name "Interlock Logic Processor"
    description "Processes safety interlock logic and prevents unsafe automation operations"
    owner "Software Team"
    tags "interlock", "logic", "processing", "safety"
    safetylevel ASIL-B
    decomposes AutomationSafetyValidator
    performedby AutomationCoordinationUnit

  function ConflictResolutionEngine
    name "Conflict Resolution Engine"
    description "Resolves conflicts between safety requirements and automation requests"
    owner "Software Team"
    tags "conflict", "resolution", "safety", "automation"
    safetylevel ASIL-B
    decomposes AutomationSafetyValidator
    performedby AutomationCoordinationUnit

  function SafetyOverrideController
    name "Safety Override Controller"
    description "Controls safety overrides that can disable automation for safety reasons"
    owner "Software Team"
    tags "safety", "override", "control", "disable"
    safetylevel ASIL-B
    decomposes AutomationSafetyValidator
    performedby AutomationCoordinationUnit

  // ========== AutomationArbitrator Decomposition ==========

  function RequestPriorityManager
    name "Request Priority Manager"
    description "Manages priority of different automation requests and schedules execution"
    owner "Software Team"
    tags "request", "priority", "management", "scheduling"
    safetylevel ASIL-B
    decomposes AutomationArbitrator
    performedby AutomationCoordinationUnit

  function ResourceAllocationController
    name "Resource Allocation Controller"
    description "Controls allocation of system resources to different automation functions"
    owner "Software Team"
    tags "resource", "allocation", "control", "functions"
    safetylevel ASIL-B
    decomposes AutomationArbitrator
    performedby AutomationCoordinationUnit

  function ConflictArbitrationEngine
    name "Conflict Arbitration Engine"
    description "Arbitrates conflicts between competing automation requests"
    owner "Software Team"
    tags "conflict", "arbitration", "competing", "requests"
    safetylevel ASIL-B
    decomposes AutomationArbitrator
    performedby AutomationCoordinationUnit

  function DecisionHistoryLogger
    name "Decision History Logger"
    description "Logs arbitration decisions for analysis and system optimization"
    owner "Software Team"
    tags "decision", "history", "logging", "optimization"
    safetylevel ASIL-B
    decomposes AutomationArbitrator
    performedby AutomationCoordinationUnit

  // ========== DriverIntentPredictor Decomposition ==========

  function InputPatternAnalyzer
    name "Input Pattern Analyzer"
    description "Analyzes driver input patterns to predict driver intentions"
    owner "Software Team"
    tags "input", "patterns", "analysis", "prediction"
    safetylevel ASIL-B
    decomposes DriverIntentPredictor
    performedby AutomationCoordinationUnit

  function BehaviorModelProcessor
    name "Behavior Model Processor"
    description "Processes driver behavior models to understand driving intent"
    owner "Software Team"
    tags "behavior", "models", "processing", "intent"
    safetylevel ASIL-B
    decomposes DriverIntentPredictor
    performedby AutomationCoordinationUnit

  function IntentConfidenceCalculator
    name "Intent Confidence Calculator"
    description "Calculates confidence levels for predicted driver intentions"
    owner "Software Team"
    tags "intent", "confidence", "calculation", "levels"
    safetylevel ASIL-B
    decomposes DriverIntentPredictor
    performedby AutomationCoordinationUnit

  function PredictionValidationEngine
    name "Prediction Validation Engine"
    description "Validates intent predictions against subsequent driver actions"
    owner "Software Team"
    tags "prediction", "validation", "actions", "driver"
    safetylevel ASIL-B
    decomposes DriverIntentPredictor
    performedby AutomationCoordinationUnit

  // ========== System Performance Functions ==========

  function PerformanceMetricsCalculator
    name "Performance Metrics Calculator"
    description "Calculates automation performance metrics and system effectiveness"
    owner "Software Team"
    tags "performance", "metrics", "calculation", "effectiveness"
    safetylevel ASIL-B
    decomposes AutomationPerformanceMonitor
    performedby AutomationCoordinationUnit

  function FailsafeConditionMonitor
    name "Failsafe Condition Monitor"
    description "Monitors conditions that require failsafe activation"
    owner "Software Team"
    tags "failsafe", "conditions", "monitoring", "activation"
    safetylevel ASIL-B
    decomposes FailsafeActivationController
    performedby AutomationCoordinationUnit 