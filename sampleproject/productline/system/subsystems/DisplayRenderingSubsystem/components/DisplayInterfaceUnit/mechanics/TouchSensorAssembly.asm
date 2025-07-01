mechanicsassembly TouchSensorAssembly
  name "Touch Sensor Assembly"
  description "Mechanical assembly providing mounting and protection for touch sensors, haptic actuators, and calibration components"
  owner "Mechanical Team"
  tags "touch-sensors", "haptic-actuators", "mounting", "protection"
  safetylevel ASIL-B
  partof DisplayInterfaceUnit
  interfaces
    input sensor_forces "Mechanical forces and touch interaction loads on sensors"
    input haptic_vibrations "Haptic vibration forces and actuator mechanical loads"
    output sensor_mount "Secure touch sensor mounting and positioning system"
    output haptic_support "Haptic actuator support and vibration isolation"
    output calibration_stability "Mechanical stability for accurate touch calibration"
