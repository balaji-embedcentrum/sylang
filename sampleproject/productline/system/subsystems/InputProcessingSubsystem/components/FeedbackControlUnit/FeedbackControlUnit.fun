componentfunctions FeedbackControlUnit
  // ========== FeedbackSignalProcessor Decomposition ==========
  
  function FeedbackSignalGenerator
    name "Feedback Signal Generator"
    description "Generates feedback signals based on input processing results and system responses"
    owner "Input Team"
    tags "feedback", "signal", "generation", "responses"
    safetylevel ASIL-B
    decomposes FeedbackSignalProcessor
    performedby FeedbackControlUnit

  function FeedbackModulationController
    name "Feedback Modulation Controller"
    description "Controls feedback signal modulation to convey different types of information"
    owner "Input Team"
    tags "feedback", "modulation", "control", "information"
    safetylevel ASIL-B
    decomposes FeedbackSignalProcessor
    performedby FeedbackControlUnit

  function FeedbackAmplitudeManager
    name "Feedback Amplitude Manager"
    description "Manages feedback signal amplitude based on environmental conditions and user preferences"
    owner "Input Team"
    tags "feedback", "amplitude", "environmental", "preferences"
    safetylevel ASIL-B
    decomposes FeedbackSignalProcessor
    performedby FeedbackControlUnit

  function FeedbackFrequencyController
    name "Feedback Frequency Controller"
    description "Controls feedback signal frequency for optimal user perception and comfort"
    owner "Input Team"
    tags "feedback", "frequency", "perception", "comfort"
    safetylevel ASIL-B
    decomposes FeedbackSignalProcessor
    performedby FeedbackControlUnit

  // ========== TactileFeedbackEngine Decomposition ==========

  function TactilePatternGenerator
    name "Tactile Pattern Generator"
    description "Generates tactile feedback patterns for different types of user interactions"
    owner "Input Team"
    tags "tactile", "patterns", "generation", "interactions"
    safetylevel ASIL-B
    decomposes TactileFeedbackEngine
    performedby FeedbackControlUnit

  function TactileIntensityController
    name "Tactile Intensity Controller"
    description "Controls tactile feedback intensity based on input type and user sensitivity"
    owner "Input Team"
    tags "tactile", "intensity", "control", "sensitivity"
    safetylevel ASIL-B
    decomposes TactileFeedbackEngine
    performedby FeedbackControlUnit

  function TactileTimingManager
    name "Tactile Timing Manager"
    description "Manages tactile feedback timing to ensure appropriate user response coordination"
    owner "Input Team"
    tags "tactile", "timing", "management", "coordination"
    safetylevel ASIL-B
    decomposes TactileFeedbackEngine
    performedby FeedbackControlUnit

  function TactileCalibrationEngine
    name "Tactile Calibration Engine"
    description "Calibrates tactile feedback systems for consistent user experience"
    owner "Input Team"
    tags "tactile", "calibration", "consistent", "experience"
    safetylevel ASIL-B
    decomposes TactileFeedbackEngine
    performedby FeedbackControlUnit

  // ========== AudioFeedbackController Decomposition ==========

  function AudioToneGenerator
    name "Audio Tone Generator"
    description "Generates audio tones and signals for auditory feedback to users"
    owner "Input Team"
    tags "audio", "tone", "generation", "auditory"
    safetylevel ASIL-B
    decomposes AudioFeedbackController
    performedby FeedbackControlUnit

  function AudioVolumeController
    name "Audio Volume Controller"
    description "Controls audio feedback volume based on ambient noise and user preferences"
    owner "Input Team"
    tags "audio", "volume", "control", "ambient"
    safetylevel ASIL-B
    decomposes AudioFeedbackController
    performedby FeedbackControlUnit

  function AudioEffectProcessor
    name "Audio Effect Processor"
    description "Processes audio effects and enhancements for improved feedback quality"
    owner "Input Team"
    tags "audio", "effects", "processing", "quality"
    safetylevel ASIL-B
    decomposes AudioFeedbackController
    performedby FeedbackControlUnit

  function SpatialAudioController
    name "Spatial Audio Controller"
    description "Controls spatial audio positioning for directional feedback information"
    owner "Input Team"
    tags "spatial", "audio", "positioning", "directional"
    safetylevel ASIL-B
    decomposes AudioFeedbackController
    performedby FeedbackControlUnit

  // ========== VisualFeedbackManager Decomposition ==========

  function VisualIndicatorController
    name "Visual Indicator Controller"
    description "Controls visual indicators and status displays for input feedback"
    owner "Input Team"
    tags "visual", "indicators", "status", "displays"
    safetylevel ASIL-B
    decomposes VisualFeedbackManager
    performedby FeedbackControlUnit

  function BrightnessAdaptationEngine
    name "Brightness Adaptation Engine"
    description "Adapts visual feedback brightness based on ambient lighting conditions"
    owner "Input Team"
    tags "brightness", "adaptation", "ambient", "lighting"
    safetylevel ASIL-B
    decomposes VisualFeedbackManager
    performedby FeedbackControlUnit

  function ColorCodingController
    name "Color Coding Controller"
    description "Controls color coding schemes for different types of feedback information"
    owner "Input Team"
    tags "color", "coding", "schemes", "information"
    safetylevel ASIL-B
    decomposes VisualFeedbackManager
    performedby FeedbackControlUnit

  function AnimationSequenceEngine
    name "Animation Sequence Engine"
    description "Generates animation sequences for dynamic visual feedback effects"
    owner "Input Team"
    tags "animation", "sequences", "dynamic", "effects"
    safetylevel ASIL-B
    decomposes VisualFeedbackManager
    performedby FeedbackControlUnit

  // ========== Advanced Feedback Control ==========

  function FeedbackSynchronizationEngine
    name "Feedback Synchronization Engine"
    description "Synchronizes multiple feedback modalities for coherent user experience"
    owner "Input Team"
    tags "feedback", "synchronization", "modalities", "coherent"
    safetylevel ASIL-B
    decomposes FeedbackSignalProcessor
    performedby FeedbackControlUnit

  function AdaptiveFeedbackController
    name "Adaptive Feedback Controller"
    description "Adapts feedback characteristics based on user behavior and response patterns"
    owner "Input Team"
    tags "adaptive", "feedback", "behavior", "patterns"
    safetylevel ASIL-B
    decomposes FeedbackSignalProcessor
    performedby FeedbackControlUnit 