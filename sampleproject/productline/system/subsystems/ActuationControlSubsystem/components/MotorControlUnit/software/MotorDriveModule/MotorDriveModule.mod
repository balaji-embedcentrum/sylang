module MotorDriveModule
  name "Motor Drive Control Software Module"
  description "Software module responsible for PWM generation, phase sequencing, drive state management, motor protection, and timing control"
  owner "Software Team"
  tags "motor", "drive", "PWM", "protection"
  safetylevel ASIL-D
  partof MotorControlUnit
  
  implements PWMGenerationController, MotorPhaseSequencer, DriveStateManager, MotorProtectionSupervisor, DriveTimingController
  
  interfaces
    input motor_commands "Motor control commands"
    input system_clock "System timing reference"
    output pwm_signals "Generated PWM drive signals"
    output protection_status "Motor protection status" 