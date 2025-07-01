componentfunctions HealthAssessmentUnit
  // ========== HealthAssessmentEngine Decomposition ==========
  
  function SystemHealthCalculator
    name "System Health Calculator"
    description "Calculates comprehensive system health scores based on multiple health indicators"
    owner "Diagnostics Team"
    tags "system", "health", "calculation", "indicators"
    safetylevel ASIL-D
    decomposes HealthAssessmentEngine
    performedby HealthAssessmentUnit

  function ComponentHealthEvaluator
    name "Component Health Evaluator"
    description "Evaluates individual component health status and generates health reports"
    owner "Diagnostics Team"
    tags "component", "health", "evaluation", "reports"
    safetylevel ASIL-D
    decomposes HealthAssessmentEngine
    performedby HealthAssessmentUnit

  function HealthMetricsAggregator
    name "Health Metrics Aggregator"
    description "Aggregates health metrics from multiple sources into unified health assessments"
    owner "Diagnostics Team"
    tags "health", "metrics", "aggregation", "unified"
    safetylevel ASIL-D
    decomposes HealthAssessmentEngine
    performedby HealthAssessmentUnit

  function HealthThresholdManager
    name "Health Threshold Manager"
    description "Manages dynamic health thresholds and adapts them based on operating conditions"
    owner "Diagnostics Team"
    tags "health", "thresholds", "dynamic", "adaptation"
    safetylevel ASIL-D
    decomposes HealthAssessmentEngine
    performedby HealthAssessmentUnit

  // ========== PrognosticAnalyzer Decomposition ==========

  function LifetimeEstimationEngine
    name "Lifetime Estimation Engine"
    description "Estimates remaining useful lifetime of system components using prognostic models"
    owner "Diagnostics Team"
    tags "lifetime", "estimation", "prognostic", "models"
    safetylevel ASIL-D
    decomposes PrognosticAnalyzer
    performedby HealthAssessmentUnit

  function DegradationTrendAnalyzer
    name "Degradation Trend Analyzer"
    description "Analyzes component degradation trends to predict future performance decline"
    owner "Diagnostics Team"
    tags "degradation", "trends", "prediction", "performance"
    safetylevel ASIL-D
    decomposes PrognosticAnalyzer
    performedby HealthAssessmentUnit

  function MaintenanceScheduleOptimizer
    name "Maintenance Schedule Optimizer"
    description "Optimizes maintenance schedules based on prognostic analysis and health assessments"
    owner "Diagnostics Team"
    tags "maintenance", "schedule", "optimization", "prognostic"
    safetylevel ASIL-D
    decomposes PrognosticAnalyzer
    performedby HealthAssessmentUnit

  function FailurePredictionAlgorithm
    name "Failure Prediction Algorithm"
    description "Predicts potential component failures using machine learning and statistical models"
    owner "Diagnostics Team"
    tags "failure", "prediction", "machine-learning", "statistical"
    safetylevel ASIL-D
    decomposes PrognosticAnalyzer
    performedby HealthAssessmentUnit

  // ========== HealthMetricsCalculator Decomposition ==========

  function PerformanceMetricsProcessor
    name "Performance Metrics Processor"
    description "Processes performance metrics and calculates performance health indicators"
    owner "Diagnostics Team"
    tags "performance", "metrics", "processing", "indicators"
    safetylevel ASIL-D
    decomposes HealthMetricsCalculator
    performedby HealthAssessmentUnit

  function EfficiencyMetricsAnalyzer
    name "Efficiency Metrics Analyzer"
    description "Analyzes system efficiency metrics and identifies areas for optimization"
    owner "Diagnostics Team"
    tags "efficiency", "metrics", "analysis", "optimization"
    safetylevel ASIL-D
    decomposes HealthMetricsCalculator
    performedby HealthAssessmentUnit

  function ReliabilityIndexCalculator
    name "Reliability Index Calculator"
    description "Calculates system and component reliability indices based on operational data"
    owner "Diagnostics Team"
    tags "reliability", "index", "calculation", "operational"
    safetylevel ASIL-D
    decomposes HealthMetricsCalculator
    performedby HealthAssessmentUnit

  function AvailabilityMetricsEngine
    name "Availability Metrics Engine"
    description "Calculates system availability metrics and uptime performance indicators"
    owner "Diagnostics Team"
    tags "availability", "metrics", "uptime", "performance"
    safetylevel ASIL-D
    decomposes HealthMetricsCalculator
    performedby HealthAssessmentUnit

  // ========== PerformanceDegradationDetector Decomposition ==========

  function BaselineComparisonEngine
    name "Baseline Comparison Engine"
    description "Compares current performance against established baselines to detect degradation"
    owner "Diagnostics Team"
    tags "baseline", "comparison", "performance", "degradation"
    safetylevel ASIL-D
    decomposes PerformanceDegradationDetector
    performedby HealthAssessmentUnit

  function AnomalyDetectionAlgorithm
    name "Anomaly Detection Algorithm"
    description "Detects performance anomalies that may indicate component degradation"
    owner "Diagnostics Team"
    tags "anomaly", "detection", "performance", "degradation"
    safetylevel ASIL-D
    decomposes PerformanceDegradationDetector
    performedby HealthAssessmentUnit

  function GradualChangeDetector
    name "Gradual Change Detector"
    description "Detects gradual performance changes that occur slowly over extended periods"
    owner "Diagnostics Team"
    tags "gradual", "change", "detection", "extended"
    safetylevel ASIL-D
    decomposes PerformanceDegradationDetector
    performedby HealthAssessmentUnit

  function AgingEffectAnalyzer
    name "Aging Effect Analyzer"
    description "Analyzes aging effects on system components and their impact on performance"
    owner "Diagnostics Team"
    tags "aging", "effects", "analysis", "impact"
    safetylevel ASIL-D
    decomposes PerformanceDegradationDetector
    performedby HealthAssessmentUnit

  // ========== Advanced Health Assessment ==========

  function HealthRiskAssessmentEngine
    name "Health Risk Assessment Engine"
    description "Assesses health-related risks and their potential impact on system safety"
    owner "Diagnostics Team"
    tags "health", "risk", "assessment", "safety"
    safetylevel ASIL-D
    decomposes HealthAssessmentEngine
    performedby HealthAssessmentUnit

  function ConditionBasedMaintenanceEngine
    name "Condition Based Maintenance Engine"
    description "Enables condition-based maintenance strategies using real-time health assessments"
    owner "Diagnostics Team"
    tags "condition", "maintenance", "real-time", "strategies"
    safetylevel ASIL-D
    decomposes PrognosticAnalyzer
    performedby HealthAssessmentUnit 