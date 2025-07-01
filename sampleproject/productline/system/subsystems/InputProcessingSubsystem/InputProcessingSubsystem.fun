subsystemfunctions InputProcessingSubsystem
  function PushPullSwitchDriver
    name "Push-Pull Switch Driver"
    description "Low-level driver for push-pull switch hardware interface and signal processing."
    owner "HMI Team"
    tags "push-pull", "driver", "signal"
    safetylevel ASIL-B
    compose PushPullInputDriver
    performedby InputProcessingSubsystem

  function RockerSwitchController
    name "Rocker Switch Controller"
    description "Controls rocker switch operations and manages rocker switch state transitions."
    owner "HMI Team"
    tags "rocker", "controller", "transitions"
    safetylevel ASIL-B
    compose RockerInputDriver
    performedby InputProcessingSubsystem

  function ToggleSwitchProcessor
    name "Toggle Switch Processor"
    description "Processes toggle switch inputs and manages toggle state persistence."
    owner "HMI Team"
    tags "toggle", "processor", "persistence"
    safetylevel ASIL-B
    compose ToggleInputDriver
    performedby InputProcessingSubsystem

  function SwitchIlluminationController
    name "Switch Illumination Controller"
    description "Controls switch illumination patterns and manages illumination sequences."
    owner "HMI Team"
    tags "illumination", "patterns", "sequences"
    safetylevel QM
    compose IlluminationControlService
    performedby InputProcessingSubsystem

  function FeedbackGenerationEngine
    name "Feedback Generation Engine"
    description "Generates haptic and audible feedback patterns for switch operations."
    owner "HMI Team"
    tags "feedback", "generation", "patterns"
    safetylevel QM
    compose HapticFeedbackEngine
    performedby InputProcessingSubsystem

  function InputValidationProcessor
    name "Input Validation Processor"
    description "Validates input signals and filters invalid or noisy input conditions."
    owner "HMI Team"
    tags "validation", "filtering", "noise"
    safetylevel ASIL-B
    compose PushPullInputDriver
    performedby InputProcessingSubsystem

  function GestureRecognitionEngine
    name "Gesture Recognition Engine"
    description "Recognizes complex input gestures and multi-touch patterns on advanced switches."
    owner "HMI Team"
    tags "gesture", "recognition", "multi-touch"
    safetylevel ASIL-B
    compose RockerInputDriver
    performedby InputProcessingSubsystem

  function InputTimingAnalyzer
    name "Input Timing Analyzer"
    description "Analyzes input timing patterns and detects rapid or prolonged input sequences."
    owner "HMI Team"
    tags "timing", "analysis", "sequences"
    safetylevel ASIL-B
    compose ToggleInputDriver
    performedby InputProcessingSubsystem

  function SwitchWearDetector
    name "Switch Wear Detector"
    description "Detects switch wear patterns and predicts switch replacement needs."
    owner "HMI Team"
    tags "wear", "detection", "replacement"
    safetylevel ASIL-B
    compose PushPullInputDriver
    performedby InputProcessingSubsystem

  function InputContextProcessor
    name "Input Context Processor"
    description "Processes input context and adapts input behavior based on system state."
    owner "HMI Team"
    tags "context", "adaptation", "state"
    safetylevel ASIL-B
    compose RockerInputDriver
    performedby InputProcessingSubsystem

  function FeedbackCustomizationManager
    name "Feedback Customization Manager"
    description "Manages user customization of haptic and audio feedback preferences."
    owner "HMI Team"
    tags "customization", "preferences", "user"
    safetylevel QM
    compose HapticFeedbackEngine
    performedby InputProcessingSubsystem

  function InputSecurityValidator
    name "Input Security Validator"
    description "Validates input security and prevents unauthorized or malicious input attempts."
    owner "HMI Team"
    tags "security", "validation", "malicious"
    safetylevel ASIL-B
    compose ToggleInputDriver
    performedby InputProcessingSubsystem

  function MultiModalInputFusion
    name "Multi-Modal Input Fusion"
    description "Fuses inputs from multiple input modalities to improve input recognition accuracy."
    owner "HMI Team"
    tags "fusion", "modalities", "accuracy"
    safetylevel ASIL-B
    compose IlluminationControlService
    performedby InputProcessingSubsystem

  function InputPerformanceOptimizer
    name "Input Performance Optimizer"
    description "Optimizes input processing performance and reduces input latency."
    owner "HMI Team"
    tags "performance", "optimization", "latency"
    safetylevel ASIL-B
    compose PushPullInputDriver
    performedby InputProcessingSubsystem 