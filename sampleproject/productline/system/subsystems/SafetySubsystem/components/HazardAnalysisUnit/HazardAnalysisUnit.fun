componentfunctions HazardAnalysisUnit
  // ========== HARAProcessor Decomposition ==========
  
  function HazardIdentificationEngine
    name "Hazard Identification Engine"
    description "Identifies potential hazards through systematic analysis of system functions and failures"
    owner "Safety Team"
    tags "hazard", "identification", "systematic", "analysis"
    safetylevel ASIL-D
    decomposes HARAProcessor
    performedby HazardAnalysisUnit

  function RiskAssessmentCalculator
    name "Risk Assessment Calculator"
    description "Calculates risk levels using Severity, Exposure, and Controllability parameters"
    owner "Safety Team"
    tags "risk", "assessment", "severity", "exposure", "controllability"
    safetylevel ASIL-D
    decomposes HARAProcessor
    performedby HazardAnalysisUnit

  function ASILDeterminationEngine
    name "ASIL Determination Engine"
    description "Determines Automotive Safety Integrity Levels based on risk assessment results"
    owner "Safety Team"
    tags "ASIL", "determination", "safety", "integrity"
    safetylevel ASIL-D
    decomposes HARAProcessor
    performedby HazardAnalysisUnit

  function SafetyGoalGenerator
    name "Safety Goal Generator"
    description "Generates safety goals based on identified hazards and ASIL requirements"
    owner "Safety Team"
    tags "safety", "goals", "generation", "requirements"
    safetylevel ASIL-D
    decomposes HARAProcessor
    performedby HazardAnalysisUnit

  // ========== FaultTreeAnalyzer Decomposition ==========

  function FaultTreeConstructor
    name "Fault Tree Constructor"
    description "Constructs fault trees for systematic analysis of failure modes and causes"
    owner "Safety Team"
    tags "fault", "tree", "construction", "failure-modes"
    safetylevel ASIL-D
    decomposes FaultTreeAnalyzer
    performedby HazardAnalysisUnit

  function FailureModeAnalyzer
    name "Failure Mode Analyzer"
    description "Analyzes failure modes and their effects on system safety and functionality"
    owner "Safety Team"
    tags "failure", "modes", "analysis", "effects"
    safetylevel ASIL-D
    decomposes FaultTreeAnalyzer
    performedby HazardAnalysisUnit

  function CutSetCalculator
    name "Cut Set Calculator"
    description "Calculates minimal cut sets for fault tree analysis and reliability assessment"
    owner "Safety Team"
    tags "cut", "sets", "calculation", "reliability"
    safetylevel ASIL-D
    decomposes FaultTreeAnalyzer
    performedby HazardAnalysisUnit

  function ProbabilityCalculationEngine
    name "Probability Calculation Engine"
    description "Calculates failure probabilities and system reliability metrics"
    owner "Safety Team"
    tags "probability", "calculation", "reliability", "metrics"
    safetylevel ASIL-D
    decomposes FaultTreeAnalyzer
    performedby HazardAnalysisUnit

  // ========== SafetyRequirementsGenerator Decomposition ==========

  function FunctionalSafetyRequirementsEngine
    name "Functional Safety Requirements Engine"
    description "Generates functional safety requirements from safety goals and hazard analysis"
    owner "Safety Team"
    tags "functional", "safety", "requirements", "generation"
    safetylevel ASIL-D
    decomposes SafetyRequirementsGenerator
    performedby HazardAnalysisUnit

  function TechnicalSafetyRequirementsEngine
    name "Technical Safety Requirements Engine"
    description "Derives technical safety requirements from functional safety requirements"
    owner "Safety Team"
    tags "technical", "safety", "requirements", "derivation"
    safetylevel ASIL-D
    decomposes SafetyRequirementsGenerator
    performedby HazardAnalysisUnit

  function SafetyMechanismSpecifier
    name "Safety Mechanism Specifier"
    description "Specifies safety mechanisms required to meet safety requirements"
    owner "Safety Team"
    tags "safety", "mechanisms", "specification", "requirements"
    safetylevel ASIL-D
    decomposes SafetyRequirementsGenerator
    performedby HazardAnalysisUnit

  function RequirementsTraceabilityManager
    name "Requirements Traceability Manager"
    description "Manages traceability between hazards, safety goals, and safety requirements"
    owner "Safety Team"
    tags "requirements", "traceability", "hazards", "goals"
    safetylevel ASIL-D
    decomposes SafetyRequirementsGenerator
    performedby HazardAnalysisUnit

  // ========== ComplianceValidator Decomposition ==========

  function ISO26262ComplianceChecker
    name "ISO 26262 Compliance Checker"
    description "Validates compliance with ISO 26262 functional safety standard requirements"
    owner "Safety Team"
    tags "ISO26262", "compliance", "validation", "standard"
    safetylevel ASIL-D
    decomposes ComplianceValidator
    performedby HazardAnalysisUnit

  function SafetyProcessValidator
    name "Safety Process Validator"
    description "Validates that safety processes are followed according to safety standards"
    owner "Safety Team"
    tags "safety", "process", "validation", "standards"
    safetylevel ASIL-D
    decomposes ComplianceValidator
    performedby HazardAnalysisUnit

  function DocumentationCompletenessChecker
    name "Documentation Completeness Checker"
    description "Checks completeness and consistency of safety documentation"
    owner "Safety Team"
    tags "documentation", "completeness", "consistency", "safety"
    safetylevel ASIL-D
    decomposes ComplianceValidator
    performedby HazardAnalysisUnit

  function AuditTrailManager
    name "Audit Trail Manager"
    description "Manages audit trails for safety analysis activities and decisions"
    owner "Safety Team"
    tags "audit", "trail", "management", "decisions"
    safetylevel ASIL-D
    decomposes ComplianceValidator
    performedby HazardAnalysisUnit

  // ========== Advanced Safety Analysis ==========

  function QuantitativeRiskAnalyzer
    name "Quantitative Risk Analyzer"
    description "Performs quantitative risk analysis using statistical and probabilistic methods"
    owner "Safety Team"
    tags "quantitative", "risk", "analysis", "statistical"
    safetylevel ASIL-D
    decomposes HARAProcessor
    performedby HazardAnalysisUnit

  function DependencyAnalysisEngine
    name "Dependency Analysis Engine"
    description "Analyzes dependencies between system components for safety impact assessment"
    owner "Safety Team"
    tags "dependency", "analysis", "components", "impact"
    safetylevel ASIL-D
    decomposes FaultTreeAnalyzer
    performedby HazardAnalysisUnit 