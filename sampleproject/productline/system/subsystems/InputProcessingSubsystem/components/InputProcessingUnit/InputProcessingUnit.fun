componentfunctions InputProcessingUnit
  // ========== InputSignalProcessor Decomposition ==========
  
  function AnalogInputConverter
    name "Analog Input Converter"
    description "Converts analog input signals to digital values with appropriate scaling and calibration"
    owner "Input Team"
    tags "analog", "conversion", "scaling", "calibration"
    safetylevel ASIL-B
    decomposes InputSignalProcessor
    performedby InputProcessingUnit

  function DigitalInputProcessor
    name "Digital Input Processor"
    description "Processes digital input signals and implements input state management"
    owner "Input Team"
    tags "digital", "processing", "state", "management"
    safetylevel ASIL-B
    decomposes InputSignalProcessor
    performedby InputProcessingUnit

  function SignalFilteringEngine
    name "Signal Filtering Engine"
    description "Applies signal filtering algorithms to remove noise and improve signal quality"
    owner "Input Team"
    tags "signal", "filtering", "noise", "quality"
    safetylevel ASIL-B
    decomposes InputSignalProcessor
    performedby InputProcessingUnit

  function InputNormalizationController
    name "Input Normalization Controller"
    description "Normalizes input values to standard ranges and formats for consistent processing"
    owner "Input Team"
    tags "normalization", "standard", "ranges", "consistency"
    safetylevel ASIL-B
    decomposes InputSignalProcessor
    performedby InputProcessingUnit

  // ========== InputValidationEngine Decomposition ==========

  function RangeValidationProcessor
    name "Range Validation Processor"
    description "Validates input values against acceptable ranges and bounds"
    owner "Input Team"
    tags "range", "validation", "bounds", "acceptable"
    safetylevel ASIL-B
    decomposes InputValidationEngine
    performedby InputProcessingUnit

  function ConsistencyCheckEngine
    name "Consistency Check Engine"
    description "Performs consistency checks across multiple related input sources"
    owner "Input Team"
    tags "consistency", "checks", "multiple", "sources"
    safetylevel ASIL-B
    decomposes InputValidationEngine
    performedby InputProcessingUnit

  function PlausibilityAnalyzer
    name "Plausibility Analyzer"
    description "Analyzes input plausibility based on system context and operational constraints"
    owner "Input Team"
    tags "plausibility", "analysis", "context", "constraints"
    safetylevel ASIL-B
    decomposes InputValidationEngine
    performedby InputProcessingUnit

  function InvalidInputHandler
    name "Invalid Input Handler"
    description "Handles invalid inputs and implements fallback strategies for error conditions"
    owner "Input Team"
    tags "invalid", "inputs", "fallback", "errors"
    safetylevel ASIL-B
    decomposes InputValidationEngine
    performedby InputProcessingUnit

  // ========== InputCalibrationManager Decomposition ==========

  function CalibrationParameterController
    name "Calibration Parameter Controller"
    description "Controls calibration parameters and manages calibration data storage"
    owner "Input Team"
    tags "calibration", "parameters", "data", "storage"
    safetylevel ASIL-B
    decomposes InputCalibrationManager
    performedby InputProcessingUnit

  function AutoCalibrationEngine
    name "Auto Calibration Engine"
    description "Performs automatic calibration based on usage patterns and system feedback"
    owner "Input Team"
    tags "auto", "calibration", "patterns", "feedback"
    safetylevel ASIL-B
    decomposes InputCalibrationManager
    performedby InputProcessingUnit

  function ManualCalibrationController
    name "Manual Calibration Controller"
    description "Controls manual calibration procedures and user-initiated calibration"
    owner "Input Team"
    tags "manual", "calibration", "procedures", "user"
    safetylevel ASIL-B
    decomposes InputCalibrationManager
    performedby InputProcessingUnit

  function CalibrationValidationEngine
    name "Calibration Validation Engine"
    description "Validates calibration results and ensures calibration accuracy"
    owner "Input Team"
    tags "calibration", "validation", "results", "accuracy"
    safetylevel ASIL-B
    decomposes InputCalibrationManager
    performedby InputProcessingUnit

  // ========== InputEventManager Decomposition ==========

  function EventGenerationEngine
    name "Event Generation Engine"
    description "Generates input events from processed input signals and state changes"
    owner "Input Team"
    tags "event", "generation", "signals", "changes"
    safetylevel ASIL-B
    decomposes InputEventManager
    performedby InputProcessingUnit

  function EventPriorityController
    name "Event Priority Controller"
    description "Controls event priorities and manages event scheduling based on importance"
    owner "Input Team"
    tags "event", "priority", "scheduling", "importance"
    safetylevel ASIL-B
    decomposes InputEventManager
    performedby InputProcessingUnit

  function EventQueueManager
    name "Event Queue Manager"
    description "Manages event queues and implements event buffering and delivery"
    owner "Input Team"
    tags "event", "queue", "buffering", "delivery"
    safetylevel ASIL-B
    decomposes InputEventManager
    performedby InputProcessingUnit

  function EventTimestampController
    name "Event Timestamp Controller"
    description "Controls precise event timestamping for temporal analysis and correlation"
    owner "Input Team"
    tags "event", "timestamp", "temporal", "correlation"
    safetylevel ASIL-B
    decomposes InputEventManager
    performedby InputProcessingUnit

  // ========== Advanced Input Processing ==========

  function InputFusionEngine
    name "Input Fusion Engine"
    description "Fuses multiple input sources to create comprehensive input understanding"
    owner "Input Team"
    tags "input", "fusion", "multiple", "comprehensive"
    safetylevel ASIL-B
    decomposes InputSignalProcessor
    performedby InputProcessingUnit

  function PredictiveInputEngine
    name "Predictive Input Engine"
    description "Predicts user input patterns and preemptively prepares system responses"
    owner "Input Team"
    tags "predictive", "patterns", "preemptive", "responses"
    safetylevel ASIL-B
    decomposes InputEventManager
    performedby InputProcessingUnit 