subsystemfunctions SensorMonitoringSubsystem
  function SensorDataAcquisition
    name "Sensor Data Acquisition"
    description "Acquires raw sensor data from position sensors and performs initial signal conditioning."
    owner "Hardware Team"
    tags "sensor", "acquisition", "conditioning"
    safetylevel ASIL-D
    compose PositionSensorInterface
    performedby SensorMonitoringSubsystem

  function CableHealthAnalyzer
    name "Cable Health Analyzer"
    description "Analyzes cable tension patterns and detects cable wear or degradation conditions."
    owner "Hardware Team"
    tags "cable", "health", "analysis"
    safetylevel ASIL-C
    compose CableHealthMonitor
    performedby SensorMonitoringSubsystem

  function SensorCalibrationManager
    name "Sensor Calibration Manager"
    description "Manages sensor calibration procedures and maintains calibration data integrity."
    owner "Hardware Team"
    tags "calibration", "management", "integrity"
    safetylevel ASIL-D
    compose PositionSensorInterface
    performedby SensorMonitoringSubsystem

  function MonitoringDataProcessor
    name "Monitoring Data Processor"
    description "Processes monitoring data and generates health status reports for system components."
    owner "Hardware Team"
    tags "processing", "health", "reports"
    safetylevel ASIL-C
    compose CableHealthMonitor
    performedby SensorMonitoringSubsystem

  function PositionAccuracyValidator
    name "Position Accuracy Validator"
    description "Validates position sensor accuracy and detects sensor drift or calibration errors."
    owner "Hardware Team"
    tags "accuracy", "validation", "drift"
    safetylevel ASIL-D
    compose PositionSensorInterface
    performedby SensorMonitoringSubsystem

  function SensorSignalFilter
    name "Sensor Signal Filter"
    description "Filters sensor signals to remove noise and electromagnetic interference."
    owner "Hardware Team"
    tags "filter", "noise", "interference"
    safetylevel ASIL-D
    compose PositionSensorInterface
    performedby SensorMonitoringSubsystem

  function CableTensionAnalyzer
    name "Cable Tension Analyzer"
    description "Analyzes cable tension measurements and detects abnormal tension conditions."
    owner "Hardware Team"
    tags "tension", "analysis", "abnormal"
    safetylevel ASIL-C
    compose CableHealthMonitor
    performedby SensorMonitoringSubsystem

  function SensorFusionProcessor
    name "Sensor Fusion Processor"
    description "Fuses data from multiple sensors to improve measurement accuracy and reliability."
    owner "Hardware Team"
    tags "fusion", "accuracy", "reliability"
    safetylevel ASIL-D
    compose PositionSensorInterface
    performedby SensorMonitoringSubsystem

  function EnvironmentalCompensator
    name "Environmental Compensator"
    description "Compensates sensor readings for environmental factors like temperature and humidity."
    owner "Hardware Team"
    tags "environmental", "compensation", "temperature"
    safetylevel ASIL-C
    compose PositionSensorInterface
    performedby SensorMonitoringSubsystem

  function SensorRedundancyManager
    name "Sensor Redundancy Manager"
    description "Manages redundant sensor configurations and handles sensor failover procedures."
    owner "Hardware Team"
    tags "redundancy", "failover", "configuration"
    safetylevel ASIL-D
    compose PositionSensorInterface
    performedby SensorMonitoringSubsystem

  function CableWearPredictor
    name "Cable Wear Predictor"
    description "Predicts cable wear progression and estimates remaining cable life."
    owner "Hardware Team"
    tags "wear", "prediction", "life"
    safetylevel ASIL-C
    compose CableHealthMonitor
    performedby SensorMonitoringSubsystem

  function SensorDiagnosticAgent
    name "Sensor Diagnostic Agent"
    description "Performs comprehensive sensor diagnostics and health assessment procedures."
    owner "Hardware Team"
    tags "diagnostic", "health", "assessment"
    safetylevel ASIL-D
    compose PositionSensorInterface
    performedby SensorMonitoringSubsystem

  function MonitoringAlertManager
    name "Monitoring Alert Manager"
    description "Manages monitoring alerts and notifications for sensor and cable health issues."
    owner "Hardware Team"
    tags "alerts", "notifications", "issues"
    safetylevel ASIL-C
    compose CableHealthMonitor
    performedby SensorMonitoringSubsystem 