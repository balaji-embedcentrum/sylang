mechanicsassembly FeedbackActuatorAssembly
  name "Feedback Actuator Assembly"
  description "Mechanical assembly providing mounting and support for feedback actuators, speakers, and haptic devices"
  owner "Mechanical Team"
  tags "feedback-actuators", "speakers", "haptic-devices", "mounting"
  safetylevel ASIL-B
  partof FeedbackControlUnit
  interfaces
    input actuator_forces "Mechanical forces and vibration loads from feedback actuators"
    input acoustic_requirements "Acoustic mounting requirements and sound isolation needs"
    output actuator_mount "Secure feedback actuator mounting and positioning system"
    output acoustic_enclosure "Acoustic enclosure and sound quality optimization"
    output vibration_isolation "Vibration isolation and mechanical decoupling for haptic devices"
