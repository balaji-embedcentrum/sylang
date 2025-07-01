mechanicsassembly HealthMonitoringAssembly
  name "Health Monitoring Assembly"
  description "Mechanical assembly providing mounting, protection, and environmental control for health monitoring and assessment electronics"
  owner "Mechanical Team"
  tags "health-monitoring", "mounting", "protection", "environmental-control"
  safetylevel ASIL-D
  partof HealthAssessmentUnit
  interfaces
    input monitoring_forces "Mechanical forces and environmental loads on monitoring equipment"
    input sensor_environment "Environmental conditions affecting health monitoring sensors"
    output monitoring_mount "Secure health monitoring equipment mounting and support"
    output sensor_protection "Health monitoring sensor protection and environmental shielding"
    output calibration_stability "Mechanical stability for accurate health monitoring and calibration"
