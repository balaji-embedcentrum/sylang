def functiongroup EPB_Functions
  def function ApplyParkingBrake
    description "Apply parking brake when requested"
    safetylevel ASIL-D
    allocatedto EPB_Controller
    enables VehicleStability

  def function ReleaseParkingBrake
    description "Release parking brake when safe conditions met"
    safetylevel ASIL-D
    allocatedto EPB_Controller
    enables VehicleMobility

  def function MonitorBrakeStatus
    description "Continuously monitor brake application status"
    safetylevel ASIL-B
    allocatedto EPB_Sensor
    enables SafetyMonitoring 