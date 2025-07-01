componentfunctions MotorControlUnit
  // ========== MotorDriveController Decomposition ==========
  
  function PWMGenerationController
    name "PWM Generation Controller"
    description "Generates precise PWM signals for motor phase control with deadtime management and frequency control"
    owner "Hardware Team"
    tags "PWM", "generation", "phase-control", "deadtime"
    safetylevel ASIL-D
    decomposes MotorDriveController
    performedby MotorControlUnit

  function MotorPhaseSequencer
    name "Motor Phase Sequencer"
    description "Controls motor phase sequencing and commutation for brushless motor operation"
    owner "Hardware Team"
    tags "phase", "sequencing", "commutation", "brushless"
    safetylevel ASIL-D
    decomposes MotorDriveController
    performedby MotorControlUnit

  function DriveStateManager
    name "Drive State Manager"
    description "Manages motor drive operational states and coordinates state transitions safely"
    owner "Hardware Team"
    tags "state", "management", "transitions", "coordination"
    safetylevel ASIL-D
    decomposes MotorDriveController
    performedby MotorControlUnit

  function MotorProtectionSupervisor
    name "Motor Protection Supervisor"
    description "Provides comprehensive motor protection including thermal, electrical, and mechanical protection"
    owner "Hardware Team"
    tags "protection", "thermal", "electrical", "mechanical"
    safetylevel ASIL-D
    decomposes MotorDriveController
    performedby MotorControlUnit

  function DriveTimingController
    name "Drive Timing Controller"
    description "Controls precise timing for motor drive operations and synchronization with system clock"
    owner "Hardware Team"
    tags "timing", "synchronization", "precision", "clock"
    safetylevel ASIL-D
    decomposes MotorDriveController
    performedby MotorControlUnit

  // ========== MotorCurrentController Decomposition ==========

  function CurrentSensingProcessor
    name "Current Sensing Processor"
    description "Processes motor current measurements from multiple current sensors with high accuracy and noise filtering"
    owner "Hardware Team"
    tags "current", "sensing", "measurement", "filtering"
    safetylevel ASIL-D
    decomposes MotorCurrentController
    performedby MotorControlUnit

  function CurrentRegulationController
    name "Current Regulation Controller"
    description "Implements closed-loop current control with PI/PID regulation for precise current control"
    owner "Hardware Team"
    tags "current", "regulation", "control-loop", "PID"
    safetylevel ASIL-D
    decomposes MotorCurrentController
    performedby MotorControlUnit

  function OvercurrentProtectionAgent
    name "Overcurrent Protection Agent"
    description "Provides fast overcurrent protection with multiple threshold levels and recovery mechanisms"
    owner "Hardware Team"
    tags "overcurrent", "protection", "threshold", "recovery"
    safetylevel ASIL-D
    decomposes MotorCurrentController
    performedby MotorControlUnit

  function CurrentMeasurementValidator
    name "Current Measurement Validator"
    description "Validates current measurements for accuracy, plausibility, and sensor health assessment"
    owner "Hardware Team"
    tags "validation", "plausibility", "sensor-health", "accuracy"
    safetylevel ASIL-D
    decomposes MotorCurrentController
    performedby MotorControlUnit

  function CurrentCommandProcessor
    name "Current Command Processor"
    description "Processes and validates incoming current commands with rate limiting and safety bounds checking"
    owner "Hardware Team"
    tags "command", "processing", "validation", "rate-limiting"
    safetylevel ASIL-D
    decomposes MotorCurrentController
    performedby MotorControlUnit

  // ========== TorqueRegulationModule Decomposition ==========

  function TorqueCalculationEngine
    name "Torque Calculation Engine"
    description "Calculates motor torque based on current measurements, motor parameters, and operating conditions"
    owner "Hardware Team"
    tags "torque", "calculation", "motor-parameters", "conditions"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby MotorControlUnit

  function TorqueControlLoop
    name "Torque Control Loop"
    description "Implements closed-loop torque control with feedforward and feedback compensation"
    owner "Hardware Team"
    tags "torque", "control-loop", "feedforward", "feedback"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby MotorControlUnit

  function TorqueLimitSupervisor
    name "Torque Limit Supervisor"
    description "Supervises torque limits based on operating conditions, temperature, and safety requirements"
    owner "Hardware Team"
    tags "torque", "limits", "supervision", "safety"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby MotorControlUnit

  function TorqueFeedbackProcessor
    name "Torque Feedback Processor"
    description "Processes torque feedback signals and estimates actual motor torque for control loop closure"
    owner "Hardware Team"
    tags "torque", "feedback", "estimation", "control-loop"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby MotorControlUnit

  function TorqueCommandValidator
    name "Torque Command Validator"
    description "Validates incoming torque commands for safety, feasibility, and system protection"
    owner "Hardware Team"
    tags "torque", "command", "validation", "safety"
    safetylevel ASIL-C
    decomposes TorqueRegulationModule
    performedby MotorControlUnit 