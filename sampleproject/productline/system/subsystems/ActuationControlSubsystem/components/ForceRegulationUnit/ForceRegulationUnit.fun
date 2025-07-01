componentfunctions ForceRegulationUnit
  // ========== ForceCalculationEngine Decomposition ==========
  
  function ClampingForceCalculator
    name "Clamping Force Calculator"
    description "Calculates optimal clamping force based on vehicle parameters and environmental conditions"
    owner "Hardware Team"
    tags "clamping", "force", "calculation", "optimization"
    safetylevel ASIL-C
    decomposes ForceCalculationEngine
    performedby ForceRegulationUnit

  function LoadForceEstimator
    name "Load Force Estimator"
    description "Estimates vehicle load forces and weight distribution for force calculations"
    owner "Hardware Team"
    tags "load", "estimation", "weight", "distribution"
    safetylevel ASIL-C
    decomposes ForceCalculationEngine
    performedby ForceRegulationUnit

  function ForceRequirementProcessor
    name "Force Requirement Processor"
    description "Processes force requirement inputs from different sources and prioritizes demands"
    owner "Hardware Team"
    tags "force", "requirements", "processing", "prioritization"
    safetylevel ASIL-C
    decomposes ForceCalculationEngine
    performedby ForceRegulationUnit

  function ForceOptimizationAlgorithm
    name "Force Optimization Algorithm"
    description "Optimizes force distribution and minimizes energy consumption while maintaining performance"
    owner "Hardware Team"
    tags "optimization", "distribution", "energy", "performance"
    safetylevel ASIL-C
    decomposes ForceCalculationEngine
    performedby ForceRegulationUnit

  // ========== TorqueRegulationModule Decomposition ==========

  function TorqueForceConverter
    name "Torque Force Converter"
    description "Converts torque commands to force commands and manages torque-force relationships"
    owner "Hardware Team"
    tags "torque", "force", "conversion", "relationships"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby ForceRegulationUnit

  function TorqueDistributionController
    name "Torque Distribution Controller"
    description "Controls torque distribution across multiple actuators for balanced force application"
    owner "Hardware Team"
    tags "torque", "distribution", "balance", "actuators"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby ForceRegulationUnit

  function TorqueFeedbackProcessor
    name "Torque Feedback Processor"
    description "Processes torque feedback signals and closes torque regulation control loops"
    owner "Hardware Team"
    tags "torque", "feedback", "processing", "control-loops"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby ForceRegulationUnit

  function TorqueLimitEnforcer
    name "Torque Limit Enforcer"
    description "Enforces torque limits based on safety requirements and actuator capabilities"
    owner "Hardware Team"
    tags "torque", "limits", "enforcement", "safety"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby ForceRegulationUnit

  // ========== LoadCompensationController Decomposition ==========

  function LoadVariationDetector
    name "Load Variation Detector"
    description "Detects load variations and changes in vehicle loading conditions"
    owner "Hardware Team"
    tags "load", "variation", "detection", "conditions"
    safetylevel ASIL-C
    decomposes LoadCompensationController
    performedby ForceRegulationUnit

  function CompensationStrategy Selector
    name "Compensation Strategy Selector"
    description "Selects appropriate compensation strategy based on load conditions and system state"
    owner "Hardware Team"
    tags "compensation", "strategy", "selection", "conditions"
    safetylevel ASIL-C
    decomposes LoadCompensationController
    performedby ForceRegulationUnit

  function AdaptiveCompensationController
    name "Adaptive Compensation Controller"
    description "Implements adaptive compensation algorithms that learn from load patterns"
    owner "Hardware Team"
    tags "adaptive", "compensation", "learning", "patterns"
    safetylevel ASIL-C
    decomposes LoadCompensationController
    performedby ForceRegulationUnit

  function CompensationEffectivenessMonitor
    name "Compensation Effectiveness Monitor"
    description "Monitors compensation effectiveness and adjusts compensation parameters"
    owner "Hardware Team"
    tags "compensation", "effectiveness", "monitoring", "adjustment"
    safetylevel ASIL-C
    decomposes LoadCompensationController
    performedby ForceRegulationUnit

  // ========== Force Regulation Core Functions ==========

  function ForceControlLoop
    name "Force Control Loop"
    description "Implements closed-loop force control with PID regulation and feedforward compensation"
    owner "Hardware Team"
    tags "force", "control-loop", "PID", "feedforward"
    safetylevel ASIL-C
    decomposes ForceCalculationEngine
    performedby ForceRegulationUnit

  function ForceFeedbackValidator
    name "Force Feedback Validator"
    description "Validates force feedback signals for accuracy and detects sensor malfunctions"
    owner "Hardware Team"
    tags "force", "feedback", "validation", "sensors"
    safetylevel ASIL-C
    decomposes ForceCalculationEngine
    performedby ForceRegulationUnit

  function ForceRateLimiter
    name "Force Rate Limiter"
    description "Limits force rate of change to prevent abrupt force transitions and system shock"
    owner "Hardware Team"
    tags "force", "rate-limiting", "transitions", "protection"
    safetylevel ASIL-C
    decomposes ForceCalculationEngine
    performedby ForceRegulationUnit 