componentfunctions PositionControlUnit
  // ========== ActuatorPositionTracker Decomposition ==========
  
  function PositionSensorProcessor
    name "Position Sensor Processor"
    description "Processes position sensor signals and performs sensor fusion for accurate position determination"
    owner "Hardware Team"
    tags "position", "sensor", "processing", "fusion"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function PositionEstimationAlgorithm
    name "Position Estimation Algorithm"
    description "Estimates actuator position using sensor data and system models for enhanced accuracy"
    owner "Hardware Team"
    tags "position", "estimation", "algorithms", "accuracy"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function PositionValidationEngine
    name "Position Validation Engine"
    description "Validates position measurements for plausibility and detects position sensor failures"
    owner "Hardware Team"
    tags "position", "validation", "plausibility", "failure-detection"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function PositionReferenceCalculator
    name "Position Reference Calculator"
    description "Calculates target position references based on system commands and operational requirements"
    owner "Hardware Team"
    tags "position", "reference", "calculation", "targets"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  // ========== Position Control Core Functions ==========

  function PositionControlLoop
    name "Position Control Loop"
    description "Implements closed-loop position control with PID regulation and trajectory planning"
    owner "Hardware Team"
    tags "position", "control-loop", "PID", "trajectory"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function TrajectoryGenerator
    name "Trajectory Generator"
    description "Generates smooth position trajectories with velocity and acceleration constraints"
    owner "Hardware Team"
    tags "trajectory", "generation", "smooth", "constraints"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function PositionFeedforwardController
    name "Position Feedforward Controller"
    description "Implements feedforward control to improve position tracking performance and reduce lag"
    owner "Hardware Team"
    tags "feedforward", "control", "tracking", "performance"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function PositionLimitSupervisor
    name "Position Limit Supervisor"
    description "Supervises position limits and prevents actuator over-travel in both directions"
    owner "Hardware Team"
    tags "position", "limits", "supervision", "over-travel"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  // ========== Position Feedback Management ==========

  function PositionFeedbackFilter
    name "Position Feedback Filter"
    description "Filters position feedback signals to remove noise and improve control stability"
    owner "Hardware Team"
    tags "feedback", "filtering", "noise", "stability"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function VelocityEstimator
    name "Velocity Estimator"
    description "Estimates actuator velocity from position measurements for velocity feedback control"
    owner "Hardware Team"
    tags "velocity", "estimation", "feedback", "control"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function AccelerationCompensator
    name "Acceleration Compensator"
    description "Compensates for acceleration effects in position control and improves dynamic response"
    owner "Hardware Team"
    tags "acceleration", "compensation", "dynamics", "response"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function PositionErrorAnalyzer
    name "Position Error Analyzer"
    description "Analyzes position tracking errors and optimizes control parameters for better performance"
    owner "Hardware Team"
    tags "error", "analysis", "optimization", "performance"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  // ========== Advanced Position Functions ==========

  function StictionCompensator
    name "Stiction Compensator"
    description "Compensates for actuator stiction effects and improves low-speed position control"
    owner "Hardware Team"
    tags "stiction", "compensation", "low-speed", "control"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function BacklashCompensator
    name "Backlash Compensator"
    description "Compensates for mechanical backlash in actuator mechanisms for precise positioning"
    owner "Hardware Team"
    tags "backlash", "compensation", "mechanical", "precision"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit

  function PositionStabilityController
    name "Position Stability Controller"
    description "Controls position stability and prevents oscillations during position holding"
    owner "Hardware Team"
    tags "stability", "control", "oscillations", "holding"
    safetylevel ASIL-D
    decomposes ActuatorPositionTracker
    performedby PositionControlUnit 