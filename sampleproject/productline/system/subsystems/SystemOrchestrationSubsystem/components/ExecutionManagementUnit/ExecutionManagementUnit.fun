componentfunctions ExecutionManagementUnit
  // ========== TaskExecutionController Decomposition ==========
  
  function TaskDispatcher
    name "Task Dispatcher"
    description "Dispatches tasks to appropriate system components and manages task distribution"
    owner "System Team"
    tags "task", "dispatch", "distribution", "components"
    safetylevel ASIL-C
    decomposes TaskExecutionController
    performedby ExecutionManagementUnit

  function ExecutionContextManager
    name "Execution Context Manager"
    description "Manages execution contexts and maintains context isolation between tasks"
    owner "System Team"
    tags "execution", "context", "isolation", "tasks"
    safetylevel ASIL-C
    decomposes TaskExecutionController
    performedby ExecutionManagementUnit

  function TaskLifecycleManager
    name "Task Lifecycle Manager"
    description "Manages task lifecycle from creation to completion and cleanup"
    owner "System Team"
    tags "task", "lifecycle", "creation", "completion"
    safetylevel ASIL-C
    decomposes TaskExecutionController
    performedby ExecutionManagementUnit

  function ExecutionStateTracker
    name "Execution State Tracker"
    description "Tracks execution state of all running tasks and system operations"
    owner "System Team"
    tags "execution", "state", "tracking", "operations"
    safetylevel ASIL-C
    decomposes TaskExecutionController
    performedby ExecutionManagementUnit

  // ========== ProcessScheduler Decomposition ==========

  function SchedulingAlgorithmEngine
    name "Scheduling Algorithm Engine"
    description "Implements scheduling algorithms for optimal task execution ordering"
    owner "System Team"
    tags "scheduling", "algorithms", "optimal", "ordering"
    safetylevel ASIL-C
    decomposes ProcessScheduler
    performedby ExecutionManagementUnit

  function PriorityQueueManager
    name "Priority Queue Manager"
    description "Manages priority queues for different task categories and urgency levels"
    owner "System Team"
    tags "priority", "queue", "categories", "urgency"
    safetylevel ASIL-C
    decomposes ProcessScheduler
    performedby ExecutionManagementUnit

  function DeadlineMonitoringEngine
    name "Deadline Monitoring Engine"
    description "Monitors task deadlines and implements deadline violation handling"
    owner "System Team"
    tags "deadline", "monitoring", "violation", "handling"
    safetylevel ASIL-C
    decomposes ProcessScheduler
    performedby ExecutionManagementUnit

  function AdaptiveSchedulingController
    name "Adaptive Scheduling Controller"
    description "Adapts scheduling strategies based on system load and performance metrics"
    owner "System Team"
    tags "adaptive", "scheduling", "load", "performance"
    safetylevel ASIL-C
    decomposes ProcessScheduler
    performedby ExecutionManagementUnit

  // ========== ExecutionMonitoringEngine Decomposition ==========

  function PerformanceMetricsCollector
    name "Performance Metrics Collector"
    description "Collects performance metrics from executing tasks and system components"
    owner "System Team"
    tags "performance", "metrics", "collection", "components"
    safetylevel ASIL-C
    decomposes ExecutionMonitoringEngine
    performedby ExecutionManagementUnit

  function ExecutionAnomalyDetector
    name "Execution Anomaly Detector"
    description "Detects execution anomalies and performance deviations"
    owner "System Team"
    tags "execution", "anomaly", "detection", "deviations"
    safetylevel ASIL-C
    decomposes ExecutionMonitoringEngine
    performedby ExecutionManagementUnit

  function ResourceConsumptionMonitor
    name "Resource Consumption Monitor"
    description "Monitors resource consumption of executing tasks and identifies inefficiencies"
    owner "System Team"
    tags "resource", "consumption", "monitoring", "inefficiencies"
    safetylevel ASIL-C
    decomposes ExecutionMonitoringEngine
    performedby ExecutionManagementUnit

  function ExecutionProfiler
    name "Execution Profiler"
    description "Profiles task execution patterns and identifies optimization opportunities"
    owner "System Team"
    tags "execution", "profiling", "patterns", "optimization"
    safetylevel ASIL-C
    decomposes ExecutionMonitoringEngine
    performedby ExecutionManagementUnit

  // ========== ExecutionRecoveryManager Decomposition ==========

  function FailureDetectionEngine
    name "Failure Detection Engine"
    description "Detects task execution failures and system component malfunctions"
    owner "System Team"
    tags "failure", "detection", "execution", "malfunctions"
    safetylevel ASIL-C
    decomposes ExecutionRecoveryManager
    performedby ExecutionManagementUnit

  function RecoveryStrategySelector
    name "Recovery Strategy Selector"
    description "Selects appropriate recovery strategies based on failure type and system state"
    owner "System Team"
    tags "recovery", "strategy", "selection", "failure"
    safetylevel ASIL-C
    decomposes ExecutionRecoveryManager
    performedby ExecutionManagementUnit

  function TaskRestartController
    name "Task Restart Controller"
    description "Controls task restart procedures and implements restart policies"
    owner "System Team"
    tags "task", "restart", "procedures", "policies"
    safetylevel ASIL-C
    decomposes ExecutionRecoveryManager
    performedby ExecutionManagementUnit

  function RollbackMechanismEngine
    name "Rollback Mechanism Engine"
    description "Implements rollback mechanisms for failed operations and state recovery"
    owner "System Team"
    tags "rollback", "mechanisms", "failed", "recovery"
    safetylevel ASIL-C
    decomposes ExecutionRecoveryManager
    performedby ExecutionManagementUnit

  // ========== Advanced Execution Management ==========

  function ConcurrencyController
    name "Concurrency Controller"
    description "Controls concurrent task execution and prevents race conditions"
    owner "System Team"
    tags "concurrency", "control", "race", "conditions"
    safetylevel ASIL-C
    decomposes TaskExecutionController
    performedby ExecutionManagementUnit

  function ExecutionOptimizer
    name "Execution Optimizer"
    description "Optimizes execution strategies for improved system performance and efficiency"
    owner "System Team"
    tags "execution", "optimization", "performance", "efficiency"
    safetylevel ASIL-C
    decomposes ProcessScheduler
    performedby ExecutionManagementUnit 