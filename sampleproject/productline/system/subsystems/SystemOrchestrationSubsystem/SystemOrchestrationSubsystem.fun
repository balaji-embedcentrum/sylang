subsystemfunctions SystemOrchestrationSubsystem
  function SystemInitializationManager
    name "System Initialization Manager"
    description "Manages system startup sequence and coordinates subsystem initialization."
    owner "Systems Engineering"
    tags "initialization", "startup", "coordination"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function ResourceAllocationController
    name "Resource Allocation Controller"
    description "Controls system resource allocation and manages resource conflicts between subsystems."
    owner "Systems Engineering"
    tags "resource", "allocation", "conflicts"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function InterSubsystemCoordinator
    name "Inter-Subsystem Coordinator"
    description "Coordinates communication and data exchange between different subsystems."
    owner "Systems Engineering"
    tags "coordination", "communication", "exchange"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function SystemModeManager
    name "System Mode Manager"
    description "Manages system operating modes and coordinates mode transitions across subsystems."
    owner "Systems Engineering"
    tags "modes", "transitions", "coordination"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function ConfigurationManager
    name "Configuration Manager"
    description "Manages system-wide configuration parameters and configuration validation."
    owner "Systems Engineering"
    tags "configuration", "parameters", "validation"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function TaskSchedulingEngine
    name "Task Scheduling Engine"
    description "Schedules and prioritizes system tasks across all subsystems for optimal performance."
    owner "Systems Engineering"
    tags "scheduling", "prioritization", "performance"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function SystemHealthOrchestrator
    name "System Health Orchestrator"
    description "Orchestrates system-wide health monitoring and coordinates health-related activities."
    owner "Systems Engineering"
    tags "health", "orchestration", "activities"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function LoadBalancingController
    name "Load Balancing Controller"
    description "Controls load balancing across subsystems and manages computational load distribution."
    owner "Systems Engineering"
    tags "load-balancing", "distribution", "computational"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function SystemVersionManager
    name "System Version Manager"
    description "Manages system versioning, compatibility checks, and version synchronization."
    owner "Systems Engineering"
    tags "versioning", "compatibility", "synchronization"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function EventOrchestrationEngine
    name "Event Orchestration Engine"
    description "Orchestrates system-wide event handling and manages event propagation patterns."
    owner "Systems Engineering"
    tags "event", "orchestration", "propagation"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function SystemRecoveryManager
    name "System Recovery Manager"
    description "Manages system recovery procedures and coordinates recovery across subsystems."
    owner "Systems Engineering"
    tags "recovery", "procedures", "coordination"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function PerformanceMonitoringService
    name "Performance Monitoring Service"
    description "Monitors system-wide performance metrics and identifies performance bottlenecks."
    owner "Systems Engineering"
    tags "performance", "monitoring", "bottlenecks"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem

  function SystemIntegrityValidator
    name "System Integrity Validator"
    description "Validates system integrity and ensures consistent operation across all subsystems."
    owner "Systems Engineering"
    tags "integrity", "validation", "consistency"
    safetylevel ASIL-D
    compose CoreSystemOrchestrator
    performedby SystemOrchestrationSubsystem 