assembly BrakeActuatorAssembly
  name "Brake Actuator Assembly"
  description "Mechanical assembly for brake actuator hardware, force application mechanisms, and auto-hold mechanical components"
  owner "Mechanics Team"
  tags "brake", "actuator", "force", "auto-hold"
  safetylevel ASIL-B
  partof AutoHoldControlUnit
  
  implements HoldForceCalculator
  
  interfaces
    Brake_Force_Application "Brake force application interface"
    Hold_Mechanism_Control "Auto-hold mechanism control interface"
    Actuator_Position_Feedback "Actuator position feedback interface" 