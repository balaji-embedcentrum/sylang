componentfunctions CableMonitoringUnit
  // ========== CableIntegrityMonitor Decomposition ==========
  
  function ConductorContinuityTester
    name "Conductor Continuity Tester"
    description "Tests electrical continuity of cable conductors and detects open circuits"
    owner "Sensor Team"
    tags "conductor", "continuity", "testing", "open-circuits"
    safetylevel ASIL-D
    decomposes CableIntegrityMonitor
    performedby CableMonitoringUnit

  function InsulationResistanceAnalyzer
    name "Insulation Resistance Analyzer"
    description "Analyzes cable insulation resistance to detect degradation and potential shorts"
    owner "Sensor Team"
    tags "insulation", "resistance", "degradation", "shorts"
    safetylevel ASIL-D
    decomposes CableIntegrityMonitor
    performedby CableMonitoringUnit

  function CableImpedanceMonitor
    name "Cable Impedance Monitor"
    description "Monitors cable characteristic impedance for signal integrity assessment"
    owner "Sensor Team"
    tags "cable", "impedance", "signal", "integrity"
    safetylevel ASIL-D
    decomposes CableIntegrityMonitor
    performedby CableMonitoringUnit

  function TimedomainReflectometry
    name "Timedomain Reflectometry"
    description "Uses TDR techniques to locate cable faults and measure cable characteristics"
    owner "Sensor Team"
    tags "TDR", "reflectometry", "faults", "characteristics"
    safetylevel ASIL-D
    decomposes CableIntegrityMonitor
    performedby CableMonitoringUnit

  // ========== SignalQualityAnalyzer Decomposition ==========

  function SignalAmplitudeAnalyzer
    name "Signal Amplitude Analyzer"
    description "Analyzes signal amplitude levels and detects amplitude degradation"
    owner "Sensor Team"
    tags "signal", "amplitude", "analysis", "degradation"
    safetylevel ASIL-D
    decomposes SignalQualityAnalyzer
    performedby CableMonitoringUnit

  function NoiseAnalysisEngine
    name "Noise Analysis Engine"
    description "Analyzes signal noise characteristics and identifies noise sources"
    owner "Sensor Team"
    tags "noise", "analysis", "characteristics", "sources"
    safetylevel ASIL-D
    decomposes SignalQualityAnalyzer
    performedby CableMonitoringUnit

  function SignalToNoiseRatioCalculator
    name "Signal To Noise Ratio Calculator"
    description "Calculates signal-to-noise ratios and monitors signal quality metrics"
    owner "Sensor Team"
    tags "signal", "noise", "ratio", "quality"
    safetylevel ASIL-D
    decomposes SignalQualityAnalyzer
    performedby CableMonitoringUnit

  function FrequencyResponseAnalyzer
    name "Frequency Response Analyzer"
    description "Analyzes frequency response characteristics of cable transmission"
    owner "Sensor Team"
    tags "frequency", "response", "characteristics", "transmission"
    safetylevel ASIL-D
    decomposes SignalQualityAnalyzer
    performedby CableMonitoringUnit

  // ========== ConnectionStatusMonitor Decomposition ==========

  function ConnectorContactMonitor
    name "Connector Contact Monitor"
    description "Monitors connector contact integrity and detects loose connections"
    owner "Sensor Team"
    tags "connector", "contact", "integrity", "loose"
    safetylevel ASIL-D
    decomposes ConnectionStatusMonitor
    performedby CableMonitoringUnit

  function ContactResistanceMeasurement
    name "Contact Resistance Measurement"
    description "Measures contact resistance at connection points for degradation detection"
    owner "Sensor Team"
    tags "contact", "resistance", "measurement", "degradation"
    safetylevel ASIL-D
    decomposes ConnectionStatusMonitor
    performedby CableMonitoringUnit

  function VibrationImpactDetector
    name "Vibration Impact Detector"
    description "Detects impact of vibration on cable connections and signal quality"
    owner "Sensor Team"
    tags "vibration", "impact", "detection", "connections"
    safetylevel ASIL-D
    decomposes ConnectionStatusMonitor
    performedby CableMonitoringUnit

  function CorrosionDetectionEngine
    name "Corrosion Detection Engine"
    description "Detects corrosion in connectors and cable terminations"
    owner "Sensor Team"
    tags "corrosion", "detection", "connectors", "terminations"
    safetylevel ASIL-D
    decomposes ConnectionStatusMonitor
    performedby CableMonitoringUnit

  // ========== WireHarnessValidator Decomposition ==========

  function HarnessRoutingValidator
    name "Harness Routing Validator"
    description "Validates wire harness routing and detects routing anomalies"
    owner "Sensor Team"
    tags "harness", "routing", "validation", "anomalies"
    safetylevel ASIL-D
    decomposes WireHarnessValidator
    performedby CableMonitoringUnit

  function BundleTensionMonitor
    name "Bundle Tension Monitor"
    description "Monitors wire bundle tension and stress levels for mechanical integrity"
    owner "Sensor Team"
    tags "bundle", "tension", "stress", "mechanical"
    safetylevel ASIL-D
    decomposes WireHarnessValidator
    performedby CableMonitoringUnit

  function ChafingDetectionSystem
    name "Chafing Detection System"
    description "Detects cable chafing and mechanical wear that could lead to failures"
    owner "Sensor Team"
    tags "chafing", "detection", "mechanical", "wear"
    safetylevel ASIL-D
    decomposes WireHarnessValidator
    performedby CableMonitoringUnit

  function HarnessIdentificationEngine
    name "Harness Identification Engine"
    description "Identifies and validates wire harness configurations and connections"
    owner "Sensor Team"
    tags "harness", "identification", "configuration", "validation"
    safetylevel ASIL-D
    decomposes WireHarnessValidator
    performedby CableMonitoringUnit

  // ========== Advanced Cable Monitoring ==========

  function PredictiveCableMaintenance
    name "Predictive Cable Maintenance"
    description "Predicts cable maintenance needs based on degradation patterns and usage"
    owner "Sensor Team"
    tags "predictive", "cable", "maintenance", "degradation"
    safetylevel ASIL-D
    decomposes CableIntegrityMonitor
    performedby CableMonitoringUnit

  function CableLifecycleTracker
    name "Cable Lifecycle Tracker"
    description "Tracks cable lifecycle metrics including age, usage, and performance history"
    owner "Sensor Team"
    tags "cable", "lifecycle", "tracking", "performance"
    safetylevel ASIL-D
    decomposes CableIntegrityMonitor
    performedby CableMonitoringUnit

  function EnvironmentalImpactAssessor
    name "Environmental Impact Assessor"
    description "Assesses environmental impact on cables including temperature and humidity effects"
    owner "Sensor Team"
    tags "environmental", "impact", "temperature", "humidity"
    safetylevel ASIL-D
    decomposes SignalQualityAnalyzer
    performedby CableMonitoringUnit

  function CableSecurityMonitor
    name "Cable Security Monitor"
    description "Monitors cables for tampering attempts and unauthorized access"
    owner "Sensor Team"
    tags "cable", "security", "tampering", "unauthorized"
    safetylevel ASIL-D
    decomposes ConnectionStatusMonitor
    performedby CableMonitoringUnit 