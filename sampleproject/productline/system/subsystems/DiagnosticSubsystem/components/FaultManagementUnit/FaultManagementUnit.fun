componentfunctions FaultManagementUnit
  // ========== FaultClassificationAlgorithm Decomposition ==========
  
  function SeverityAssessmentEngine
    name "Severity Assessment Engine"
    description "Assesses fault severity levels based on impact analysis and safety implications"
    owner "Diagnostics Team"
    tags "severity", "assessment", "impact", "safety"
    safetylevel ASIL-D
    decomposes FaultClassificationAlgorithm
    performedby FaultManagementUnit

  function FaultCategoryClassifier
    name "Fault Category Classifier"
    description "Classifies faults into predefined categories for systematic fault management"
    owner "Diagnostics Team"
    tags "fault", "category", "classification", "systematic"
    safetylevel ASIL-D
    decomposes FaultClassificationAlgorithm
    performedby FaultManagementUnit

  function CausalityAnalysisEngine
    name "Causality Analysis Engine"
    description "Analyzes fault causality chains and identifies root causes of system failures"
    owner "Diagnostics Team"
    tags "causality", "analysis", "root-cause", "failures"
    safetylevel ASIL-D
    decomposes FaultClassificationAlgorithm
    performedby FaultManagementUnit

  function ImpactPredictionAlgorithm
    name "Impact Prediction Algorithm"
    description "Predicts potential impact of detected faults on system functionality"
    owner "Diagnostics Team"
    tags "impact", "prediction", "functionality", "system"
    safetylevel ASIL-D
    decomposes FaultClassificationAlgorithm
    performedby FaultManagementUnit

  // ========== FaultHistoryManager Decomposition ==========

  function FaultRecordingSystem
    name "Fault Recording System"
    description "Records fault occurrences with detailed context and environmental conditions"
    owner "Diagnostics Team"
    tags "fault", "recording", "context", "conditions"
    safetylevel ASIL-D
    decomposes FaultHistoryManager
    performedby FaultManagementUnit

  function PatternRecognitionEngine
    name "Pattern Recognition Engine"
    description "Recognizes fault patterns and recurring issues across system components"
    owner "Diagnostics Team"
    tags "pattern", "recognition", "recurring", "components"
    safetylevel ASIL-D
    decomposes FaultHistoryManager
    performedby FaultManagementUnit

  function TrendAnalysisProcessor
    name "Trend Analysis Processor"
    description "Analyzes fault trends over time to identify system degradation patterns"
    owner "Diagnostics Team"
    tags "trend", "analysis", "degradation", "patterns"
    safetylevel ASIL-D
    decomposes FaultHistoryManager
    performedby FaultManagementUnit

  function HistoricalDataComparator
    name "Historical Data Comparator"
    description "Compares current faults with historical data for similarity analysis"
    owner "Diagnostics Team"
    tags "historical", "comparison", "similarity", "analysis"
    safetylevel ASIL-D
    decomposes FaultHistoryManager
    performedby FaultManagementUnit

  // ========== SymptomCorrelationEngine Decomposition ==========

  function MultiSourceCorrelator
    name "Multi Source Correlator"
    description "Correlates symptoms from multiple system sources to identify fault relationships"
    owner "Diagnostics Team"
    tags "multi-source", "correlation", "relationships", "symptoms"
    safetylevel ASIL-D
    decomposes SymptomCorrelationEngine
    performedby FaultManagementUnit

  function TemporalCorrelationAnalyzer
    name "Temporal Correlation Analyzer"
    description "Analyzes temporal relationships between symptoms for fault sequence identification"
    owner "Diagnostics Team"
    tags "temporal", "correlation", "sequence", "identification"
    safetylevel ASIL-D
    decomposes SymptomCorrelationEngine
    performedby FaultManagementUnit

  function SpatialCorrelationEngine
    name "Spatial Correlation Engine"
    description "Identifies spatial correlations between symptoms across system components"
    owner "Diagnostics Team"
    tags "spatial", "correlation", "components", "symptoms"
    safetylevel ASIL-D
    decomposes SymptomCorrelationEngine
    performedby FaultManagementUnit

  function CorrelationConfidenceCalculator
    name "Correlation Confidence Calculator"
    description "Calculates confidence levels for symptom correlations and fault hypotheses"
    owner "Diagnostics Team"
    tags "correlation", "confidence", "hypotheses", "calculation"
    safetylevel ASIL-D
    decomposes SymptomCorrelationEngine
    performedby FaultManagementUnit

  // ========== FaultIsolationController Decomposition ==========

  function IsolationDecisionEngine
    name "Isolation Decision Engine"
    description "Makes intelligent decisions on fault isolation strategies and implementation"
    owner "Diagnostics Team"
    tags "isolation", "decisions", "strategies", "implementation"
    safetylevel ASIL-D
    decomposes FaultIsolationController
    performedby FaultManagementUnit

  function SafetyBarrierController
    name "Safety Barrier Controller"
    description "Controls safety barriers to prevent fault propagation across system boundaries"
    owner "Diagnostics Team"
    tags "safety", "barriers", "propagation", "boundaries"
    safetylevel ASIL-D
    decomposes FaultIsolationController
    performedby FaultManagementUnit

  function ComponentDisconnectionManager
    name "Component Disconnection Manager"
    description "Manages safe disconnection of faulty components from the system"
    owner "Diagnostics Team"
    tags "disconnection", "management", "faulty", "components"
    safetylevel ASIL-D
    decomposes FaultIsolationController
    performedby FaultManagementUnit

  function RedundancyActivationController
    name "Redundancy Activation Controller"
    description "Activates redundant systems when primary components are isolated due to faults"
    owner "Diagnostics Team"
    tags "redundancy", "activation", "primary", "isolated"
    safetylevel ASIL-D
    decomposes FaultIsolationController
    performedby FaultManagementUnit

  // ========== Advanced Fault Management ==========

  function PredictiveFaultAnalyzer
    name "Predictive Fault Analyzer"
    description "Analyzes system behavior to predict potential faults before they occur"
    owner "Diagnostics Team"
    tags "predictive", "analysis", "potential", "prevention"
    safetylevel ASIL-D
    decomposes FaultClassificationAlgorithm
    performedby FaultManagementUnit

  function RecoveryStrategySelector
    name "Recovery Strategy Selector"
    description "Selects optimal recovery strategies based on fault characteristics and system state"
    owner "Diagnostics Team"
    tags "recovery", "strategy", "selection", "optimal"
    safetylevel ASIL-D
    decomposes FaultIsolationController
    performedby FaultManagementUnit 