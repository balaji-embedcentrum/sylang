softwaremodule HapticFeedbackModule
  name "Haptic Feedback Module"
  description "Software module responsible for vibration pattern generation, force-based feedback, texture feedback processing, and haptic calibration management"
  owner "HMI Team"
  tags "haptic-feedback", "vibration-patterns", "force-feedback", "texture-feedback"
  safetylevel ASIL-B
  partof FeedbackControlUnit
  implements VibrationPatternGenerator, ForceBasedFeedbackEngine, TextureFeedbackProcessor, HapticCalibrationManager
  interfaces
    input haptic_commands "Haptic feedback commands and tactile interaction requirements"
    input calibration_data "Haptic calibration data and tactile response parameters"
    output vibration_generator "Vibration pattern generation and tactile communication control"
    output force_engine "Force-based feedback control for steering and pedal resistance"
    output texture_processor "Texture feedback processing for touch surface interactions"
    output calibration_manager "Haptic calibration management and consistent tactile experience"
