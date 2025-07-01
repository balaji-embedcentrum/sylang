componentfunctions SystemMonitoringUnit
  // ========== SystemHealthMonitor Decomposition ==========
  
  function ComponentHealthTracker
    name "Component Health Tracker"
    description "Tracks health status of individual system components and subsystems"
    owner "System Team"
    tags "component", "health", "tracking", "subsystems"
    safetylevel ASIL-C
    decomposes SystemHealthMonitor
    performedby SystemMonitoringUnit

  function SystemVitalSignsMonitor
    name "System Vital Signs Monitor"
    description "Monitors critical system vital signs including temperature, voltage, and timing"
    owner "System Team"
    tags "vital", "signs", "temperature", "voltage", "timing"
    safetylevel ASIL-C
    decomposes SystemHealthMonitor
    performedby SystemMonitoringUnit

  function HealthIndicatorAggregator
    name "Health Indicator Aggregator"
    description "Aggregates health indicators from multiple sources into comprehensive health assessments"
    owner "System Team"
    tags "health", "indicators", "aggregation", "comprehensive"
    safetylevel ASIL-C
    decomposes SystemHealthMonitor
    performedby SystemMonitoringUnit

  function DegradationDetectionEngine
    name "Degradation Detection Engine"
    description "Detects system degradation patterns and predicts potential failures"
    owner "System Team"
    tags "degradation", "detection", "patterns", "prediction"
    safetylevel ASIL-C
    decomposes SystemHealthMonitor
    performedby SystemMonitoringUnit

  // ========== PerformanceAnalyzer Decomposition ==========

  function PerformanceMetricsCalculator
    name "Performance Metrics Calculator"
    description "Calculates key performance indicators and system efficiency metrics"
    owner "System Team"
    tags "performance", "metrics", "indicators", "efficiency"
    safetylevel ASIL-C
    decomposes PerformanceAnalyzer
    performedby SystemMonitoringUnit

  function ThroughputAnalysisEngine
    name "Throughput Analysis Engine"
    description "Analyzes system throughput and identifies bottlenecks in data processing"
    owner "System Team"
    tags "throughput", "analysis", "bottlenecks", "processing"
    safetylevel ASIL-C
    decomposes PerformanceAnalyzer
    performedby SystemMonitoringUnit

  function LatencyMeasurementSystem
    name "Latency Measurement System"
    description "Measures system latencies and response times across different operations"
    owner "System Team"
    tags "latency", "measurement", "response", "operations"
    safetylevel ASIL-C
    decomposes PerformanceAnalyzer
    performedby SystemMonitoringUnit

  function PerformanceTrendAnalyzer
    name "Performance Trend Analyzer"
    description "Analyzes performance trends over time and identifies optimization opportunities"
    owner "System Team"
    tags "performance", "trends", "optimization", "opportunities"
    safetylevel ASIL-C
    decomposes PerformanceAnalyzer
    performedby SystemMonitoringUnit

  // ========== ResourceUsageTracker Decomposition ==========

  function CPUUtilizationMonitor
    name "CPU Utilization Monitor"
    description "Monitors CPU utilization across all cores and processing units"
    owner "System Team"
    tags "CPU", "utilization", "monitoring", "cores"
    safetylevel ASIL-C
    decomposes ResourceUsageTracker
    performedby SystemMonitoringUnit

  function MemoryUsageAnalyzer
    name "Memory Usage Analyzer"
    description "Analyzes memory usage patterns and detects memory leaks or fragmentation"
    owner "System Team"
    tags "memory", "usage", "patterns", "leaks"
    safetylevel ASIL-C
    decomposes ResourceUsageTracker
    performedby SystemMonitoringUnit

  function NetworkBandwidthMonitor
    name "Network Bandwidth Monitor"
    description "Monitors network bandwidth utilization and communication patterns"
    owner "System Team"
    tags "network", "bandwidth", "utilization", "communication"
    safetylevel ASIL-C
    decomposes ResourceUsageTracker
    performedby SystemMonitoringUnit

  function StorageResourceTracker
    name "Storage Resource Tracker"
    description "Tracks storage resource usage including disk space and I/O operations"
    owner "System Team"
    tags "storage", "resources", "disk", "I/O"
    safetylevel ASIL-C
    decomposes ResourceUsageTracker
    performedby SystemMonitoringUnit

  // ========== SystemStateAuditor Decomposition ==========

  function StateConsistencyChecker
    name "State Consistency Checker"
    description "Checks state consistency across distributed system components"
    owner "System Team"
    tags "state", "consistency", "distributed", "components"
    safetylevel ASIL-C
    decomposes SystemStateAuditor
    performedby SystemMonitoringUnit

  function ConfigurationAuditor
    name "Configuration Auditor"
    description "Audits system configurations and detects unauthorized changes"
    owner "System Team"
    tags "configuration", "audit", "unauthorized", "changes"
    safetylevel ASIL-C
    decomposes SystemStateAuditor
    performedby SystemMonitoringUnit

  function IntegrityValidationEngine
    name "Integrity Validation Engine"
    description "Validates system integrity and detects tampering or corruption"
    owner "System Team"
    tags "integrity", "validation", "tampering", "corruption"
    safetylevel ASIL-C
    decomposes SystemStateAuditor
    performedby SystemMonitoringUnit

  function ComplianceMonitoringEngine
    name "Compliance Monitoring Engine"
    description "Monitors system compliance with safety and regulatory requirements"
    owner "System Team"
    tags "compliance", "monitoring", "safety", "regulatory"
    safetylevel ASIL-C
    decomposes SystemStateAuditor
    performedby SystemMonitoringUnit

  // ========== Advanced Monitoring Features ==========

  function PredictiveAnalyticsEngine
    name "Predictive Analytics Engine"
    description "Uses predictive analytics to forecast system behavior and potential issues"
    owner "System Team"
    tags "predictive", "analytics", "forecasting", "behavior"
    safetylevel ASIL-C
    decomposes PerformanceAnalyzer
    performedby SystemMonitoringUnit

  function AnomalyCorrelationEngine
    name "Anomaly Correlation Engine"
    description "Correlates anomalies across different system components to identify root causes"
    owner "System Team"
    tags "anomaly", "correlation", "components", "root-causes"
    safetylevel ASIL-C
    decomposes SystemHealthMonitor
    performedby SystemMonitoringUnit 