module BrakeControlModule
  name "Brake Control Module"
  description "Software module for speed monitoring, pattern recognition, deceleration analysis, stop detection, and brake force management"
  owner "Software Team"
  tags "brake", "control", "speed", "force"
  safetylevel ASIL-B
  partof AutoHoldControlUnit
  
  implements SpeedThresholdMonitor, SpeedPatternRecognizer, DecelrationTrendAnalyzer, StopDetectionAlgorithm, HoldForceCalculator, GradientForceCompensator, LoadForceAdjuster, ForceReserveManager
  
  interfaces
    Speed_Analysis_Interface "Speed monitoring and analysis interface"
    Force_Calculation_Interface "Brake force calculation interface"
    Stop_Detection_Interface "Vehicle stop detection interface"
    Force_Management_Interface "Brake force management interface" 