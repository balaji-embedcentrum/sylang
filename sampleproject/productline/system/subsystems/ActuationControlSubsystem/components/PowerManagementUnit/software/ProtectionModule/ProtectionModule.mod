module ProtectionModule
  name "Power Protection Software Module"
  description "Software module responsible for overvoltage/undervoltage protection, thermal protection, fault detection, and emergency power control"
  owner "Software Team"
  tags "protection", "fault", "emergency", "thermal"
  safetylevel ASIL-D
  partof PowerManagementUnit
  
  implements OvervoltageProtectionAgent, UndervoltageProtectionAgent, ThermalPowerProtection, PowerFaultDetector, EmergencyPowerController
  
  interfaces
    input voltage_measurements "Voltage monitoring inputs"
    input thermal_sensors "Thermal sensor inputs"
    output protection_actions "Protection trigger outputs"
    output emergency_control "Emergency power control"
endmodule 