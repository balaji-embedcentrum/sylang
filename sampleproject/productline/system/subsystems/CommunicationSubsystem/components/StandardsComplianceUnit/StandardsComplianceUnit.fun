componentfunctions StandardsComplianceUnit
  // ========== CANStandardsCompliance Decomposition ==========
  
  function CANFrameFormatValidator
    name "CAN Frame Format Validator"
    description "Validates CAN frame formats against CAN 2.0A/2.0B and CAN-FD standards"
    owner "Communication Team"
    tags "CAN", "frame", "format", "validation"
    safetylevel ASIL-D
    decomposes CANStandardsCompliance
    performedby StandardsComplianceUnit

  function CANBitrateController
    name "CAN Bitrate Controller"
    description "Controls CAN bitrate settings and ensures compliance with timing requirements"
    owner "Communication Team"
    tags "CAN", "bitrate", "control", "timing"
    safetylevel ASIL-D
    decomposes CANStandardsCompliance
    performedby StandardsComplianceUnit

  function CANErrorHandlingAgent
    name "CAN Error Handling Agent"
    description "Implements CAN error handling mechanisms according to CAN specifications"
    owner "Communication Team"
    tags "CAN", "error", "handling", "specifications"
    safetylevel ASIL-D
    decomposes CANStandardsCompliance
    performedby StandardsComplianceUnit

  function CANArbitrationManager
    name "CAN Arbitration Manager"
    description "Manages CAN bus arbitration and priority handling mechanisms"
    owner "Communication Team"
    tags "CAN", "arbitration", "priority", "management"
    safetylevel ASIL-D
    decomposes CANStandardsCompliance
    performedby StandardsComplianceUnit

  // ========== LINStandardsCompliance Decomposition ==========

  function LINScheduleController
    name "LIN Schedule Controller"
    description "Controls LIN schedule execution and ensures timing compliance"
    owner "Communication Team"
    tags "LIN", "schedule", "control", "timing"
    safetylevel ASIL-C
    decomposes LINStandardsCompliance
    performedby StandardsComplianceUnit

  function LINMasterSlaveCoordinator
    name "LIN Master Slave Coordinator"
    description "Coordinates LIN master-slave communication according to LIN specifications"
    owner "Communication Team"
    tags "LIN", "master", "slave", "coordination"
    safetylevel ASIL-C
    decomposes LINStandardsCompliance
    performedby StandardsComplianceUnit

  function LINChecksumValidator
    name "LIN Checksum Validator"
    description "Validates LIN frame checksums and implements error detection"
    owner "Communication Team"
    tags "LIN", "checksum", "validation", "error-detection"
    safetylevel ASIL-C
    decomposes LINStandardsCompliance
    performedby StandardsComplianceUnit

  function LINWakeupController
    name "LIN Wakeup Controller"
    description "Controls LIN wakeup procedures and sleep mode transitions"
    owner "Communication Team"
    tags "LIN", "wakeup", "control", "sleep"
    safetylevel ASIL-C
    decomposes LINStandardsCompliance
    performedby StandardsComplianceUnit

  // ========== EthernetStandardsCompliance Decomposition ==========

  function EthernetFrameProcessor
    name "Ethernet Frame Processor"
    description "Processes Ethernet frames according to IEEE 802.3 standards"
    owner "Communication Team"
    tags "Ethernet", "frame", "processing", "IEEE"
    safetylevel ASIL-B
    decomposes EthernetStandardsCompliance
    performedby StandardsComplianceUnit

  function AVBStreamManager
    name "AVB Stream Manager"
    description "Manages Audio/Video Bridging streams for deterministic Ethernet communication"
    owner "Communication Team"
    tags "AVB", "stream", "management", "deterministic"
    safetylevel ASIL-B
    decomposes EthernetStandardsCompliance
    performedby StandardsComplianceUnit

  function TSNConfigurationEngine
    name "TSN Configuration Engine"
    description "Configures Time-Sensitive Networking parameters for real-time communication"
    owner "Communication Team"
    tags "TSN", "configuration", "real-time", "networking"
    safetylevel ASIL-B
    decomposes EthernetStandardsCompliance
    performedby StandardsComplianceUnit

  function QoSManagementController
    name "QoS Management Controller"
    description "Manages Quality of Service parameters for Ethernet communication"
    owner "Communication Team"
    tags "QoS", "management", "quality", "service"
    safetylevel ASIL-B
    decomposes EthernetStandardsCompliance
    performedby StandardsComplianceUnit

  // ========== ISO26262ComplianceValidator Decomposition ==========

  function CommunicationSafetyValidator
    name "Communication Safety Validator"
    description "Validates communication safety mechanisms according to ISO 26262"
    owner "Communication Team"
    tags "communication", "safety", "validation", "ISO26262"
    safetylevel ASIL-D
    decomposes ISO26262ComplianceValidator
    performedby StandardsComplianceUnit

  function FaultDetectionCoverageAnalyzer
    name "Fault Detection Coverage Analyzer"
    description "Analyzes fault detection coverage for communication safety mechanisms"
    owner "Communication Team"
    tags "fault", "detection", "coverage", "analysis"
    safetylevel ASIL-D
    decomposes ISO26262ComplianceValidator
    performedby StandardsComplianceUnit

  function SafetyIntegrityValidator
    name "Safety Integrity Validator"
    description "Validates safety integrity levels for communication components"
    owner "Communication Team"
    tags "safety", "integrity", "validation", "levels"
    safetylevel ASIL-D
    decomposes ISO26262ComplianceValidator
    performedby StandardsComplianceUnit

  function HazardousEventAnalyzer
    name "Hazardous Event Analyzer"
    description "Analyzes potential hazardous events in communication systems"
    owner "Communication Team"
    tags "hazardous", "events", "analysis", "communication"
    safetylevel ASIL-D
    decomposes ISO26262ComplianceValidator
    performedby StandardsComplianceUnit

  // ========== Advanced Compliance Functions ==========

  function ComplianceTestOrchestrator
    name "Compliance Test Orchestrator"
    description "Orchestrates automated compliance testing across multiple standards"
    owner "Communication Team"
    tags "compliance", "testing", "orchestration", "standards"
    safetylevel ASIL-C
    decomposes CANStandardsCompliance
    performedby StandardsComplianceUnit

  function StandardsVersionController
    name "Standards Version Controller"
    description "Manages different versions of communication standards and ensures compatibility"
    owner "Communication Team"
    tags "standards", "version", "control", "compatibility"
    safetylevel ASIL-C
    decomposes CANStandardsCompliance
    performedby StandardsComplianceUnit 