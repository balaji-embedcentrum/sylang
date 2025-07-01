componentfunctions ActuatorManagementUnit
  // ========== ActuatorSelectionLogic Decomposition ==========
  
  function ActuatorTypeResolver
    name "Actuator Type Resolver"
    description "Resolves appropriate actuator type based on vehicle configuration and system requirements"
    owner "Hardware Team"
    tags "actuator", "type", "resolution", "configuration"
    safetylevel ASIL-D
    decomposes ActuatorSelectionLogic
    performedby ActuatorManagementUnit

  function ActuatorCompatibilityValidator
    name "Actuator Compatibility Validator"
    description "Validates actuator compatibility with current system configuration and operational parameters"
    owner "Hardware Team"
    tags "compatibility", "validation", "parameters", "configuration"
    safetylevel ASIL-D
    decomposes ActuatorSelectionLogic
    performedby ActuatorManagementUnit

  function ActuatorSwitchingController
    name "Actuator Switching Controller"
    description "Controls switching between different actuator types during runtime based on conditions"
    owner "Hardware Team"
    tags "switching", "control", "runtime", "conditions"
    safetylevel ASIL-D
    decomposes ActuatorSelectionLogic
    performedby ActuatorManagementUnit

  function ActuatorConfigurationManager
    name "Actuator Configuration Manager"
    description "Manages actuator configuration parameters and maintains configuration consistency"
    owner "Hardware Team"
    tags "configuration", "management", "parameters", "consistency"
    safetylevel ASIL-D
    decomposes ActuatorSelectionLogic
    performedby ActuatorManagementUnit

  // ========== ActuatorCalibrationController Decomposition ==========

  function CalibrationSequenceOrchestrator
    name "Calibration Sequence Orchestrator"
    description "Orchestrates actuator calibration sequences and manages calibration workflow"
    owner "Hardware Team"
    tags "calibration", "sequence", "orchestration", "workflow"
    safetylevel ASIL-D
    decomposes ActuatorCalibrationController
    performedby ActuatorManagementUnit

  function CalibrationParameterCalculator
    name "Calibration Parameter Calculator"
    description "Calculates calibration parameters based on actuator characteristics and measurements"
    owner "Hardware Team"
    tags "calibration", "parameters", "calculation", "characteristics"
    safetylevel ASIL-D
    decomposes ActuatorCalibrationController
    performedby ActuatorManagementUnit

  function CalibrationDataValidator
    name "Calibration Data Validator"
    description "Validates calibration data integrity and verifies calibration quality"
    owner "Hardware Team"
    tags "validation", "data-integrity", "quality", "verification"
    safetylevel ASIL-D
    decomposes ActuatorCalibrationController
    performedby ActuatorManagementUnit

  function CalibrationStorageManager
    name "Calibration Storage Manager"
    description "Manages persistent storage of calibration parameters and calibration history"
    owner "Hardware Team"
    tags "storage", "persistence", "parameters", "history"
    safetylevel ASIL-D
    decomposes ActuatorCalibrationController
    performedby ActuatorManagementUnit

  // ========== BackupActuatorController Decomposition ==========

  function BackupActuatorMonitor
    name "Backup Actuator Monitor"
    description "Monitors backup actuator status and readiness for failover activation"
    owner "Hardware Team"
    tags "backup", "monitoring", "status", "readiness"
    safetylevel ASIL-D
    decomposes BackupActuatorController
    performedby ActuatorManagementUnit

  function FailoverDecisionEngine
    name "Failover Decision Engine"
    description "Makes intelligent failover decisions based on primary actuator health and system state"
    owner "Hardware Team"
    tags "failover", "decision", "intelligence", "health"
    safetylevel ASIL-D
    decomposes BackupActuatorController
    performedby ActuatorManagementUnit

  function BackupActivationController
    name "Backup Activation Controller"
    description "Controls activation sequence for backup actuators during failover events"
    owner "Hardware Team"
    tags "backup", "activation", "sequence", "failover"
    safetylevel ASIL-D
    decomposes BackupActuatorController
    performedby ActuatorManagementUnit

  function FailoverCoordinator
    name "Failover Coordinator"
    description "Coordinates failover process with other subsystems and manages system-wide failover"
    owner "Hardware Team"
    tags "failover", "coordination", "subsystems", "system-wide"
    safetylevel ASIL-D
    decomposes BackupActuatorController
    performedby ActuatorManagementUnit

  // ========== ActuatorWearMonitor Decomposition ==========

  function WearPatternAnalyzer
    name "Wear Pattern Analyzer"
    description "Analyzes actuator wear patterns and identifies abnormal wear characteristics"
    owner "Hardware Team"
    tags "wear", "patterns", "analysis", "characteristics"
    safetylevel ASIL-C
    decomposes ActuatorWearMonitor
    performedby ActuatorManagementUnit

  function LifetimePredictor
    name "Lifetime Predictor"
    description "Predicts actuator remaining lifetime based on wear analysis and usage patterns"
    owner "Hardware Team"
    tags "lifetime", "prediction", "wear-analysis", "usage"
    safetylevel ASIL-C
    decomposes ActuatorWearMonitor
    performedby ActuatorManagementUnit

  function MaintenanceScheduler
    name "Maintenance Scheduler"
    description "Schedules preventive maintenance based on wear monitoring and lifetime predictions"
    owner "Hardware Team"
    tags "maintenance", "scheduling", "preventive", "predictions"
    safetylevel ASIL-C
    decomposes ActuatorWearMonitor
    performedby ActuatorManagementUnit 