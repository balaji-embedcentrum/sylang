componentfunctions DiagnosticDataUnit
  // ========== DiagnosticDataFormatter Decomposition ==========
  
  function DataStructureFormatter
    name "Data Structure Formatter"
    description "Formats diagnostic data into standardized structures for consistent reporting"
    owner "Diagnostics Team"
    tags "data", "structure", "formatting", "standardization"
    safetylevel ASIL-C
    decomposes DiagnosticDataFormatter
    performedby DiagnosticDataUnit

  function TimeStampManager
    name "Time Stamp Manager"
    description "Manages precise timestamping of diagnostic events for accurate temporal correlation"
    owner "Diagnostics Team"
    tags "timestamp", "events", "temporal", "correlation"
    safetylevel ASIL-C
    decomposes DiagnosticDataFormatter
    performedby DiagnosticDataUnit

  function DataIntegrityValidator
    name "Data Integrity Validator"
    description "Validates diagnostic data integrity using checksums and validation algorithms"
    owner "Diagnostics Team"
    tags "data", "integrity", "validation", "checksums"
    safetylevel ASIL-C
    decomposes DiagnosticDataFormatter
    performedby DiagnosticDataUnit

  function MetadataAttachmentEngine
    name "Metadata Attachment Engine"
    description "Attaches relevant metadata to diagnostic data for enhanced context and analysis"
    owner "Diagnostics Team"
    tags "metadata", "attachment", "context", "analysis"
    safetylevel ASIL-C
    decomposes DiagnosticDataFormatter
    performedby DiagnosticDataUnit

  // ========== DiagnosticDataLogger Decomposition ==========

  function EventLoggingController
    name "Event Logging Controller"
    description "Controls diagnostic event logging with configurable logging levels and filters"
    owner "Diagnostics Team"
    tags "event", "logging", "levels", "filters"
    safetylevel ASIL-C
    decomposes DiagnosticDataLogger
    performedby DiagnosticDataUnit

  function LogRotationManager
    name "Log Rotation Manager"
    description "Manages log file rotation, archiving, and storage optimization"
    owner "Diagnostics Team"
    tags "log", "rotation", "archiving", "storage"
    safetylevel ASIL-C
    decomposes DiagnosticDataLogger
    performedby DiagnosticDataUnit

  function PersistentStorageController
    name "Persistent Storage Controller"
    description "Controls persistent storage of diagnostic data with reliability and durability"
    owner "Diagnostics Team"
    tags "persistent", "storage", "reliability", "durability"
    safetylevel ASIL-C
    decomposes DiagnosticDataLogger
    performedby DiagnosticDataUnit

  function CompressionOptimizer
    name "Compression Optimizer"
    description "Optimizes diagnostic data compression to minimize storage requirements"
    owner "Diagnostics Team"
    tags "compression", "optimization", "storage", "efficiency"
    safetylevel ASIL-C
    decomposes DiagnosticDataLogger
    performedby DiagnosticDataUnit

  // ========== DiagnosticReportGenerator Decomposition ==========

  function ReportTemplateEngine
    name "Report Template Engine"
    description "Generates diagnostic reports using configurable templates and formats"
    owner "Diagnostics Team"
    tags "report", "templates", "generation", "formats"
    safetylevel ASIL-C
    decomposes DiagnosticReportGenerator
    performedby DiagnosticDataUnit

  function DataAggregationProcessor
    name "Data Aggregation Processor"
    description "Aggregates diagnostic data from multiple sources for comprehensive reporting"
    owner "Diagnostics Team"
    tags "data", "aggregation", "sources", "comprehensive"
    safetylevel ASIL-C
    decomposes DiagnosticReportGenerator
    performedby DiagnosticDataUnit

  function VisualizationEngineController
    name "Visualization Engine Controller"
    description "Controls data visualization engines for graphical diagnostic representations"
    owner "Diagnostics Team"
    tags "visualization", "graphical", "representations", "control"
    safetylevel ASIL-C
    decomposes DiagnosticReportGenerator
    performedby DiagnosticDataUnit

  function ExportFormatManager
    name "Export Format Manager"
    description "Manages multiple export formats for diagnostic data compatibility"
    owner "Diagnostics Team"
    tags "export", "formats", "compatibility", "management"
    safetylevel ASIL-C
    decomposes DiagnosticReportGenerator
    performedby DiagnosticDataUnit

  // ========== Advanced Data Management ==========

  function DataRetentionPolicyEngine
    name "Data Retention Policy Engine"
    description "Implements data retention policies and automatic data lifecycle management"
    owner "Diagnostics Team"
    tags "retention", "policies", "lifecycle", "management"
    safetylevel ASIL-C
    decomposes DiagnosticDataLogger
    performedby DiagnosticDataUnit

  function SearchIndexingEngine
    name "Search Indexing Engine"
    description "Creates searchable indexes for fast diagnostic data retrieval and analysis"
    owner "Diagnostics Team"
    tags "search", "indexing", "retrieval", "analysis"
    safetylevel ASIL-C
    decomposes DiagnosticDataFormatter
    performedby DiagnosticDataUnit

  function DataCorrelationEngine
    name "Data Correlation Engine"
    description "Correlates diagnostic data across time, components, and system boundaries"
    owner "Diagnostics Team"
    tags "data", "correlation", "components", "boundaries"
    safetylevel ASIL-C
    decomposes DiagnosticDataFormatter
    performedby DiagnosticDataUnit

  function RealTimeDataProcessor
    name "Real Time Data Processor"
    description "Processes diagnostic data in real-time for immediate analysis and response"
    owner "Diagnostics Team"
    tags "real-time", "processing", "immediate", "analysis"
    safetylevel ASIL-C
    decomposes DiagnosticDataFormatter
    performedby DiagnosticDataUnit 