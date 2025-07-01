componentfunctions VersionManagementUnit
  // ========== VersionControlEngine Decomposition ==========
  
  function SoftwareVersionTracker
    name "Software Version Tracker"
    description "Tracks software versions across all system components and maintains version history"
    owner "System Team"
    tags "software", "version", "tracking", "history"
    safetylevel ASIL-C
    decomposes VersionControlEngine
    performedby VersionManagementUnit

  function HardwareVersionManager
    name "Hardware Version Manager"
    description "Manages hardware version information and component revision tracking"
    owner "System Team"
    tags "hardware", "version", "management", "revision"
    safetylevel ASIL-C
    decomposes VersionControlEngine
    performedby VersionManagementUnit

  function ConfigurationVersionController
    name "Configuration Version Controller"
    description "Controls configuration versions and manages configuration change history"
    owner "System Team"
    tags "configuration", "version", "control", "change"
    safetylevel ASIL-C
    decomposes VersionControlEngine
    performedby VersionManagementUnit

  function VersionCompatibilityValidator
    name "Version Compatibility Validator"
    description "Validates version compatibility between different system components"
    owner "System Team"
    tags "version", "compatibility", "validation", "components"
    safetylevel ASIL-C
    decomposes VersionControlEngine
    performedby VersionManagementUnit

  // ========== UpdateManagementSystem Decomposition ==========

  function UpdatePackageManager
    name "Update Package Manager"
    description "Manages update packages and validates package integrity before installation"
    owner "System Team"
    tags "update", "package", "management", "integrity"
    safetylevel ASIL-C
    decomposes UpdateManagementSystem
    performedby VersionManagementUnit

  function UpdateSchedulingEngine
    name "Update Scheduling Engine"
    description "Schedules system updates and manages update deployment timing"
    owner "System Team"
    tags "update", "scheduling", "deployment", "timing"
    safetylevel ASIL-C
    decomposes UpdateManagementSystem
    performedby VersionManagementUnit

  function RollbackController
    name "Rollback Controller"
    description "Controls system rollback procedures when updates fail or cause issues"
    owner "System Team"
    tags "rollback", "control", "procedures", "issues"
    safetylevel ASIL-C
    decomposes UpdateManagementSystem
    performedby VersionManagementUnit

  function UpdateVerificationEngine
    name "Update Verification Engine"
    description "Verifies successful update installation and validates system functionality"
    owner "System Team"
    tags "update", "verification", "installation", "functionality"
    safetylevel ASIL-C
    decomposes UpdateManagementSystem
    performedby VersionManagementUnit

  // ========== ChangeManagementController Decomposition ==========

  function ChangeRequestProcessor
    name "Change Request Processor"
    description "Processes change requests and manages change approval workflows"
    owner "System Team"
    tags "change", "request", "processing", "approval"
    safetylevel ASIL-C
    decomposes ChangeManagementController
    performedby VersionManagementUnit

  function ImpactAnalysisEngine
    name "Impact Analysis Engine"
    description "Analyzes impact of proposed changes on system functionality and safety"
    owner "System Team"
    tags "impact", "analysis", "changes", "functionality"
    safetylevel ASIL-C
    decomposes ChangeManagementController
    performedby VersionManagementUnit

  function ChangeValidationFramework
    name "Change Validation Framework"
    description "Validates changes against system requirements and safety constraints"
    owner "System Team"
    tags "change", "validation", "requirements", "constraints"
    safetylevel ASIL-C
    decomposes ChangeManagementController
    performedby VersionManagementUnit

  function ChangeAuditTrailManager
    name "Change Audit Trail Manager"
    description "Manages audit trails for all system changes and maintains traceability"
    owner "System Team"
    tags "change", "audit", "trail", "traceability"
    safetylevel ASIL-C
    decomposes ChangeManagementController
    performedby VersionManagementUnit

  // ========== BaselineManager Decomposition ==========

  function BaselineDefinitionEngine
    name "Baseline Definition Engine"
    description "Defines system baselines and manages baseline configurations"
    owner "System Team"
    tags "baseline", "definition", "configurations", "management"
    safetylevel ASIL-C
    decomposes BaselineManager
    performedby VersionManagementUnit

  function BaselineValidationController
    name "Baseline Validation Controller"
    description "Validates baseline integrity and ensures baseline compliance"
    owner "System Team"
    tags "baseline", "validation", "integrity", "compliance"
    safetylevel ASIL-C
    decomposes BaselineManager
    performedby VersionManagementUnit

  function ConfigurationSnapshotEngine
    name "Configuration Snapshot Engine"
    description "Creates configuration snapshots for baseline preservation and recovery"
    owner "System Team"
    tags "configuration", "snapshot", "preservation", "recovery"
    safetylevel ASIL-C
    decomposes BaselineManager
    performedby VersionManagementUnit

  function BaselineComparisonAnalyzer
    name "Baseline Comparison Analyzer"
    description "Compares current system state against established baselines"
    owner "System Team"
    tags "baseline", "comparison", "analysis", "state"
    safetylevel ASIL-C
    decomposes BaselineManager
    performedby VersionManagementUnit

  // ========== Advanced Version Management ==========

  function VersionMigrationEngine
    name "Version Migration Engine"
    description "Manages version migration processes and ensures smooth transitions"
    owner "System Team"
    tags "version", "migration", "processes", "transitions"
    safetylevel ASIL-C
    decomposes UpdateManagementSystem
    performedby VersionManagementUnit

  function LegacyVersionSupport
    name "Legacy Version Support"
    description "Provides support for legacy versions and manages backward compatibility"
    owner "System Team"
    tags "legacy", "version", "support", "compatibility"
    safetylevel ASIL-C
    decomposes VersionControlEngine
    performedby VersionManagementUnit

  function VersionSecurityManager
    name "Version Security Manager"
    description "Manages version security including authentication and integrity verification"
    owner "System Team"
    tags "version", "security", "authentication", "integrity"
    safetylevel ASIL-C
    decomposes UpdateManagementSystem
    performedby VersionManagementUnit

  function AutomatedTestingOrchestrator
    name "Automated Testing Orchestrator"
    description "Orchestrates automated testing during version updates and changes"
    owner "System Team"
    tags "automated", "testing", "orchestration", "updates"
    safetylevel ASIL-C
    decomposes ChangeManagementController
    performedby VersionManagementUnit 