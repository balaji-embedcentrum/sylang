subsystemfunctions AutomationLogicSubsystem
  function AutomationStateMachine
    name "Automation State Machine"
    description "Manages overall automation state transitions and coordinates automatic function activation."
    owner "Software Team"
    tags "state", "machine", "coordination"
    safetylevel ASIL-B
    compose AutomationCoordinator
    performedby AutomationLogicSubsystem

  function HoldConditionEvaluator
    name "Hold Condition Evaluator"
    description "Evaluates vehicle conditions for auto-hold activation and determines hold requirements."
    owner "Software Team"
    tags "hold", "conditions", "evaluation"
    safetylevel ASIL-B
    compose AutoHoldStateMachine
    performedby AutomationLogicSubsystem

  function HillDetectionProcessor
    name "Hill Detection Processor"
    description "Processes vehicle inclination data and determines hill-start assist activation requirements."
    owner "Software Team"
    tags "hill", "detection", "inclination"
    safetylevel ASIL-C
    compose HillAssistLogicController
    performedby AutomationLogicSubsystem

  function AutomationSafetyValidator
    name "Automation Safety Validator"
    description "Validates automation safety conditions and implements safety interlocks for automatic functions."
    owner "Software Team"
    tags "safety", "validation", "interlocks"
    safetylevel ASIL-B
    compose AutomationCoordinator
    performedby AutomationLogicSubsystem

  function ReleaseConditionMonitor
    name "Release Condition Monitor"
    description "Monitors vehicle conditions for automatic release triggers and manages release timing."
    owner "Software Team"
    tags "release", "conditions", "timing"
    safetylevel ASIL-C
    compose HillAssistLogicController
    performedby AutomationLogicSubsystem

  function VehicleSpeedAnalyzer
    name "Vehicle Speed Analyzer"
    description "Analyzes vehicle speed patterns and detects conditions suitable for automation activation."
    owner "Software Team"
    tags "speed", "analysis", "patterns"
    safetylevel ASIL-B
    compose AutoHoldStateMachine
    performedby AutomationLogicSubsystem

  function BrakeForceCalculator
    name "Brake Force Calculator"
    description "Calculates optimal brake force requirements for different automation scenarios."
    owner "Software Team"
    tags "brake", "force", "calculation"
    safetylevel ASIL-B
    compose AutoHoldStateMachine
    performedby AutomationLogicSubsystem

  function SlopeAngleProcessor
    name "Slope Angle Processor"
    description "Processes slope angle measurements and determines slope-based automation strategies."
    owner "Software Team"
    tags "slope", "angle", "strategy"
    safetylevel ASIL-C
    compose HillAssistLogicController
    performedby AutomationLogicSubsystem

  function AutomationArbitrator
    name "Automation Arbitrator"
    description "Arbitrates between different automation requests and resolves conflicts."
    owner "Software Team"
    tags "arbitration", "conflicts", "requests"
    safetylevel ASIL-B
    compose AutomationCoordinator
    performedby AutomationLogicSubsystem

  function DriverIntentPredictor
    name "Driver Intent Predictor"
    description "Predicts driver intentions based on input patterns and vehicle behavior."
    owner "Software Team"
    tags "intent", "prediction", "behavior"
    safetylevel ASIL-B
    compose AutomationCoordinator
    performedby AutomationLogicSubsystem

  function AutoHoldTimerManager
    name "Auto-Hold Timer Manager"
    description "Manages timing functions for auto-hold duration and timeout handling."
    owner "Software Team"
    tags "timer", "duration", "timeout"
    safetylevel ASIL-B
    compose AutoHoldStateMachine
    performedby AutomationLogicSubsystem

  function HillAssistReleaseController
    name "Hill Assist Release Controller"
    description "Controls the precise release sequence for hill-start assist based on vehicle conditions."
    owner "Software Team"
    tags "release", "sequence", "control"
    safetylevel ASIL-C
    compose HillAssistLogicController
    performedby AutomationLogicSubsystem

  function AutomationPerformanceMonitor
    name "Automation Performance Monitor"
    description "Monitors automation performance metrics and optimizes automation algorithms."
    owner "Software Team"
    tags "performance", "metrics", "optimization"
    safetylevel ASIL-B
    compose AutomationCoordinator
    performedby AutomationLogicSubsystem

  function FailsafeActivationController
    name "Failsafe Activation Controller"
    description "Controls failsafe activation when automation systems detect unsafe conditions."
    owner "Software Team"
    tags "failsafe", "activation", "unsafe"
    safetylevel ASIL-B
    compose AutomationCoordinator
    performedby AutomationLogicSubsystem 