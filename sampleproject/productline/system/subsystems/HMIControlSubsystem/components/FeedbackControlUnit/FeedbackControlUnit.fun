componentfunctions FeedbackControlUnit
  // ========== UserFeedbackManager Decomposition ==========
  
  function FeedbackModalityController
    name "Feedback Modality Controller"
    description "Controls different feedback modalities including visual, auditory, and haptic feedback"
    owner "HMI Team"
    tags "feedback", "modalities", "visual", "auditory", "haptic"
    safetylevel ASIL-B
    decomposes UserFeedbackManager
    performedby FeedbackControlUnit

  function FeedbackTimingController
    name "Feedback Timing Controller"
    description "Controls timing of feedback responses to ensure appropriate user response times"
    owner "HMI Team"
    tags "feedback", "timing", "response", "appropriate"
    safetylevel ASIL-B
    decomposes UserFeedbackManager
    performedby FeedbackControlUnit

  function FeedbackIntensityManager
    name "Feedback Intensity Manager"
    description "Manages feedback intensity levels based on urgency and environmental conditions"
    owner "HMI Team"
    tags "feedback", "intensity", "urgency", "environmental"
    safetylevel ASIL-B
    decomposes UserFeedbackManager
    performedby FeedbackControlUnit

  function AdaptiveFeedbackEngine
    name "Adaptive Feedback Engine"
    description "Adapts feedback patterns based on user behavior and response history"
    owner "HMI Team"
    tags "adaptive", "feedback", "behavior", "history"
    safetylevel ASIL-B
    decomposes UserFeedbackManager
    performedby FeedbackControlUnit

  // ========== VisualIndicatorController Decomposition ==========

  function LEDStatusController
    name "LED Status Controller"
    description "Controls LED status indicators for system state and warning information"
    owner "HMI Team"
    tags "LED", "status", "indicators", "warnings"
    safetylevel ASIL-B
    decomposes VisualIndicatorController
    performedby FeedbackControlUnit

  function IconDisplayManager
    name "Icon Display Manager"
    description "Manages icon displays and symbol rendering for user interface feedback"
    owner "HMI Team"
    tags "icons", "display", "symbols", "interface"
    safetylevel ASIL-B
    decomposes VisualIndicatorController
    performedby FeedbackControlUnit

  function ColorCodingEngine
    name "Color Coding Engine"
    description "Implements color coding schemes for status indication and visual feedback"
    owner "HMI Team"
    tags "color", "coding", "status", "visual"
    safetylevel ASIL-B
    decomposes VisualIndicatorController
    performedby FeedbackControlUnit

  function AnimationController
    name "Animation Controller"
    description "Controls animated visual elements for dynamic feedback and attention direction"
    owner "HMI Team"
    tags "animation", "visual", "dynamic", "attention"
    safetylevel ASIL-B
    decomposes VisualIndicatorController
    performedby FeedbackControlUnit

  // ========== AudioFeedbackProcessor Decomposition ==========

  function ToneGenerationEngine
    name "Tone Generation Engine"
    description "Generates audio tones and beeps for system feedback and alerts"
    owner "HMI Team"
    tags "tone", "generation", "audio", "alerts"
    safetylevel ASIL-B
    decomposes AudioFeedbackProcessor
    performedby FeedbackControlUnit

  function VoicePromptController
    name "Voice Prompt Controller"
    description "Controls voice prompts and speech synthesis for user guidance"
    owner "HMI Team"
    tags "voice", "prompts", "speech", "guidance"
    safetylevel ASIL-B
    decomposes AudioFeedbackProcessor
    performedby FeedbackControlUnit

  function SoundEffectManager
    name "Sound Effect Manager"
    description "Manages sound effects and audio feedback for user interface interactions"
    owner "HMI Team"
    tags "sound", "effects", "audio", "interactions"
    safetylevel ASIL-B
    decomposes AudioFeedbackProcessor
    performedby FeedbackControlUnit

  function VolumeControlEngine
    name "Volume Control Engine"
    description "Controls audio volume levels based on ambient noise and user preferences"
    owner "HMI Team"
    tags "volume", "control", "ambient", "preferences"
    safetylevel ASIL-B
    decomposes AudioFeedbackProcessor
    performedby FeedbackControlUnit

  // ========== HapticResponseController Decomposition ==========

  function VibrationPatternGenerator
    name "Vibration Pattern Generator"
    description "Generates vibration patterns for haptic feedback and tactile communication"
    owner "HMI Team"
    tags "vibration", "patterns", "haptic", "tactile"
    safetylevel ASIL-B
    decomposes HapticResponseController
    performedby FeedbackControlUnit

  function ForceBasedFeedbackEngine
    name "Force Based Feedback Engine"
    description "Provides force-based feedback through steering wheel and pedal resistance"
    owner "HMI Team"
    tags "force", "feedback", "steering", "resistance"
    safetylevel ASIL-B
    decomposes HapticResponseController
    performedby FeedbackControlUnit

  function TextureFeedbackProcessor
    name "Texture Feedback Processor"
    description "Processes texture-based haptic feedback for touch surface interactions"
    owner "HMI Team"
    tags "texture", "feedback", "haptic", "touch"
    safetylevel ASIL-B
    decomposes HapticResponseController
    performedby FeedbackControlUnit

  function HapticCalibrationManager
    name "Haptic Calibration Manager"
    description "Manages haptic feedback calibration for consistent tactile experiences"
    owner "HMI Team"
    tags "haptic", "calibration", "consistent", "tactile"
    safetylevel ASIL-B
    decomposes HapticResponseController
    performedby FeedbackControlUnit

  // ========== Advanced Feedback Features ==========

  function MultiModalSyncController
    name "Multi Modal Sync Controller"
    description "Synchronizes multiple feedback modalities for coherent user experiences"
    owner "HMI Team"
    tags "multi-modal", "synchronization", "coherent", "experiences"
    safetylevel ASIL-B
    decomposes UserFeedbackManager
    performedby FeedbackControlUnit

  function AccessibilityFeedbackEngine
    name "Accessibility Feedback Engine"
    description "Provides specialized feedback for users with accessibility requirements"
    owner "HMI Team"
    tags "accessibility", "specialized", "feedback", "requirements"
    safetylevel ASIL-B
    decomposes UserFeedbackManager
    performedby FeedbackControlUnit 