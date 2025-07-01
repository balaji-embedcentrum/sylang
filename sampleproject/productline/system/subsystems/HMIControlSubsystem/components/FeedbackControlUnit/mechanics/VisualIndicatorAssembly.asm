mechanicsassembly VisualIndicatorAssembly
  name "Visual Indicator Assembly"
  description "Mechanical assembly providing mounting and protection for LEDs, displays, and visual indicator components"
  owner "Mechanical Team"
  tags "visual-indicators", "leds", "displays", "protection"
  safetylevel ASIL-B
  partof FeedbackControlUnit
  interfaces
    input indicator_forces "Mechanical forces and environmental loads on visual indicators"
    input optical_requirements "Optical clarity and visibility requirements for indicators"
    output indicator_mount "Secure visual indicator mounting and positioning system"
    output optical_protection "Optical protection and clarity maintenance for visual elements"
    output environmental_seal "Environmental sealing and protection from contamination"
