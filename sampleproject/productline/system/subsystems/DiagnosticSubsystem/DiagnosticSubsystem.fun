subsystemfunctions DiagnosticSubsystem
  function HealthAssessmentEngine
    name "Health Assessment Engine"
    description "Performs comprehensive system health assessment and generates health metrics."
    owner "Diagnostics Team"
    tags "health", "assessment", "metrics"
    safetylevel ASIL-D
    compose SystemHealthSupervisor
    performedby DiagnosticSubsystem

  function FaultClassificationAlgorithm
    name "Fault Classification Algorithm"
    description "Classifies detected faults by severity, type, and impact on system functionality."
    owner "Diagnostics Team"
    tags "fault", "classification", "severity"
    safetylevel ASIL-D
    compose FaultDetectionAlgorithm
    performedby DiagnosticSubsystem

  function DiagnosticDataFormatter
    name "Diagnostic Data Formatter"
    description "Formats diagnostic data for external reporting and ensures data integrity."
    owner "Diagnostics Team"
    tags "formatting", "data", "integrity"
    safetylevel ASIL-C
    compose DiagnosticReportingGateway
    performedby DiagnosticSubsystem

  function PrognosticAnalyzer
    name "Prognostic Analyzer"
    description "Analyzes system trends and predicts potential future failures or maintenance needs."
    owner "Diagnostics Team"
    tags "prognostic", "trends", "prediction"
    safetylevel ASIL-D
    compose SystemHealthSupervisor
    performedby DiagnosticSubsystem

  function FaultHistoryManager
    name "Fault History Manager"
    description "Manages fault history records and tracks fault occurrence patterns over time."
    owner "Diagnostics Team"
    tags "history", "records", "patterns"
    safetylevel ASIL-D
    compose FaultDetectionAlgorithm
    performedby DiagnosticSubsystem

  function SymptomCorrelationEngine
    name "Symptom Correlation Engine"
    description "Correlates symptoms across multiple system components to identify root causes."
    owner "Diagnostics Team"
    tags "correlation", "symptoms", "root-cause"
    safetylevel ASIL-D
    compose FaultDetectionAlgorithm
    performedby DiagnosticSubsystem

  function DiagnosticScheduler
    name "Diagnostic Scheduler"
    description "Schedules and coordinates diagnostic procedures across all system components."
    owner "Diagnostics Team"
    tags "scheduler", "coordination", "procedures"
    safetylevel ASIL-D
    compose SystemHealthSupervisor
    performedby DiagnosticSubsystem

  function PerformanceDegradationDetector
    name "Performance Degradation Detector"
    description "Detects gradual performance degradation and early signs of system aging."
    owner "Diagnostics Team"
    tags "degradation", "performance", "aging"
    safetylevel ASIL-D
    compose SystemHealthSupervisor
    performedby DiagnosticSubsystem

  function DiagnosticDataLogger
    name "Diagnostic Data Logger"
    description "Logs diagnostic events and maintains persistent diagnostic data storage."
    owner "Diagnostics Team"
    tags "logging", "events", "storage"
    safetylevel ASIL-C
    compose DiagnosticReportingGateway
    performedby DiagnosticSubsystem

  function FaultIsolationController
    name "Fault Isolation Controller"
    description "Isolates detected faults to prevent fault propagation and minimize system impact."
    owner "Diagnostics Team"
    tags "isolation", "propagation", "impact"
    safetylevel ASIL-D
    compose FaultDetectionAlgorithm
    performedby DiagnosticSubsystem

  function HealthMetricsCalculator
    name "Health Metrics Calculator"
    description "Calculates quantitative health metrics and system performance indicators."
    owner "Diagnostics Team"
    tags "metrics", "calculation", "indicators"
    safetylevel ASIL-D
    compose SystemHealthSupervisor
    performedby DiagnosticSubsystem

  function DiagnosticReportGenerator
    name "Diagnostic Report Generator"
    description "Generates comprehensive diagnostic reports for maintenance and troubleshooting."
    owner "Diagnostics Team"
    tags "reports", "maintenance", "troubleshooting"
    safetylevel ASIL-C
    compose DiagnosticReportingGateway
    performedby DiagnosticSubsystem

  function AnomalyDetectionEngine
    name "Anomaly Detection Engine"
    description "Detects anomalous behavior patterns that may indicate emerging system issues."
    owner "Diagnostics Team"
    tags "anomaly", "detection", "patterns"
    safetylevel ASIL-D
    compose FaultDetectionAlgorithm
    performedby DiagnosticSubsystem

  function DiagnosticQualityAssurance
    name "Diagnostic Quality Assurance"
    description "Ensures diagnostic quality and validates diagnostic algorithm effectiveness."
    owner "Diagnostics Team"
    tags "quality", "assurance", "validation"
    safetylevel ASIL-D
    compose SystemHealthSupervisor
    performedby DiagnosticSubsystem 