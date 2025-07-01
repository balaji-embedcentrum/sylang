componentfunctions AutoHoldControlUnit
  // ========== HoldConditionEvaluator Decomposition ==========
  
  function VehicleStateAnalyzer
    name "Vehicle State Analyzer"
    description "Analyzes vehicle state parameters to determine auto-hold activation conditions"
    owner "Software Team"
    tags "vehicle", "state", "analysis", "activation"
    safetylevel ASIL-B
    decomposes HoldConditionEvaluator
    performedby AutoHoldControlUnit

  function BrakeInputProcessor
    name "Brake Input Processor"
    description "Processes brake pedal input signals and determines brake application intent"
    owner "Software Team"
    tags "brake", "input", "processing", "intent"
    safetylevel ASIL-B
    decomposes HoldConditionEvaluator
    performedby AutoHoldControlUnit

  function HoldTriggerDetector
    name "Hold Trigger Detector"
    description "Detects specific conditions that trigger auto-hold activation"
    owner "Software Team"
    tags "hold", "trigger", "detection", "activation"
    safetylevel ASIL-B
    decomposes HoldConditionEvaluator
    performedby AutoHoldControlUnit

  function ConditionPriorityManager
    name "Condition Priority Manager"
    description "Manages priority of different hold conditions and resolves conflicts"
    owner "Software Team"
    tags "conditions", "priority", "management", "conflicts"
    safetylevel ASIL-B
    decomposes HoldConditionEvaluator
    performedby AutoHoldControlUnit

  // ========== VehicleSpeedAnalyzer Decomposition ==========

  function SpeedThresholdMonitor
    name "Speed Threshold Monitor"
    description "Monitors vehicle speed against predefined thresholds for auto-hold activation"
    owner "Software Team"
    tags "speed", "threshold", "monitoring", "activation"
    safetylevel ASIL-B
    decomposes VehicleSpeedAnalyzer
    performedby AutoHoldControlUnit

  function SpeedPatternRecognizer
    name "Speed Pattern Recognizer"
    description "Recognizes speed patterns that indicate suitable conditions for auto-hold"
    owner "Software Team"
    tags "speed", "patterns", "recognition", "conditions"
    safetylevel ASIL-B
    decomposes VehicleSpeedAnalyzer
    performedby AutoHoldControlUnit

  function DecelrationTrendAnalyzer
    name "Deceleration Trend Analyzer"
    description "Analyzes deceleration trends to predict vehicle stopping behavior"
    owner "Software Team"
    tags "deceleration", "trends", "analysis", "prediction"
    safetylevel ASIL-B
    decomposes VehicleSpeedAnalyzer
    performedby AutoHoldControlUnit

  function StopDetectionAlgorithm
    name "Stop Detection Algorithm"
    description "Implements algorithms to accurately detect when vehicle has stopped"
    owner "Software Team"
    tags "stop", "detection", "algorithms", "accuracy"
    safetylevel ASIL-B
    decomposes VehicleSpeedAnalyzer
    performedby AutoHoldControlUnit

  // ========== BrakeForceCalculator Decomposition ==========

  function HoldForceCalculator
    name "Hold Force Calculator"
    description "Calculates optimal brake force required to maintain auto-hold"
    owner "Software Team"
    tags "hold", "force", "calculation", "optimal"
    safetylevel ASIL-B
    decomposes BrakeForceCalculator
    performedby AutoHoldControlUnit

  function GradientForceCompensator
    name "Gradient Force Compensator"
    description "Compensates brake force based on road gradient and vehicle orientation"
    owner "Software Team"
    tags "gradient", "force", "compensation", "orientation"
    safetylevel ASIL-B
    decomposes BrakeForceCalculator
    performedby AutoHoldControlUnit

  function LoadForceAdjuster
    name "Load Force Adjuster"
    description "Adjusts brake force based on vehicle load and weight distribution"
    owner "Software Team"
    tags "load", "force", "adjustment", "distribution"
    safetylevel ASIL-B
    decomposes BrakeForceCalculator
    performedby AutoHoldControlUnit

  function ForceReserveManager
    name "Force Reserve Manager"
    description "Manages brake force reserves to ensure reliable hold under varying conditions"
    owner "Software Team"
    tags "force", "reserves", "management", "reliability"
    safetylevel ASIL-B
    decomposes BrakeForceCalculator
    performedby AutoHoldControlUnit

  // ========== AutoHoldTimerManager Decomposition ==========

  function HoldDurationController
    name "Hold Duration Controller"
    description "Controls auto-hold duration and manages hold timeout functionality"
    owner "Software Team"
    tags "hold", "duration", "control", "timeout"
    safetylevel ASIL-B
    decomposes AutoHoldTimerManager
    performedby AutoHoldControlUnit

  function TimeoutWarningGenerator
    name "Timeout Warning Generator"
    description "Generates warnings when auto-hold timeout is approaching"
    owner "Software Team"
    tags "timeout", "warning", "generation", "approaching"
    safetylevel ASIL-B
    decomposes AutoHoldTimerManager
    performedby AutoHoldControlUnit

  function ExtensionRequestHandler
    name "Extension Request Handler"
    description "Handles requests to extend auto-hold duration beyond default timeout"
    owner "Software Team"
    tags "extension", "request", "handling", "timeout"
    safetylevel ASIL-B
    decomposes AutoHoldTimerManager
    performedby AutoHoldControlUnit

  function PeriodicHoldVerifier
    name "Periodic Hold Verifier"
    description "Periodically verifies auto-hold effectiveness and adjusts as needed"
    owner "Software Team"
    tags "periodic", "verification", "effectiveness", "adjustment"
    safetylevel ASIL-B
    decomposes AutoHoldTimerManager
    performedby AutoHoldControlUnit 