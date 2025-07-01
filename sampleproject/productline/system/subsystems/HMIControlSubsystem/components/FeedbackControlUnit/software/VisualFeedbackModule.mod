softwaremodule VisualFeedbackModule
  name "Visual Feedback Module"
  description "Software module responsible for LED status control, icon display management, color coding, and animation control"
  owner "HMI Team"
  tags "visual-feedback", "led-control", "icon-display", "color-coding"
  safetylevel ASIL-B
  partof FeedbackControlUnit
  implements LEDStatusController, IconDisplayManager, ColorCodingEngine, AnimationController
  interfaces
    input visual_commands "Visual feedback commands and display requirements"
    input status_information "System status information and warning indicators"
    output led_controller "LED status control and indicator management"
    output icon_manager "Icon display management and symbol rendering"
    output color_engine "Color coding control and visual status indication"
    output animation_controller "Animation control for dynamic visual feedback"
