module ActuatorControlModule
  name "Actuator Control Software Module"
  description "Software module responsible for actuator type selection, compatibility validation, switching control, and configuration management"
  owner "Software Team"
  tags "control", "selection", "configuration", "switching"
  safetylevel ASIL-D
  partof ActuatorManagementUnit
  
  implements ActuatorTypeResolver, ActuatorCompatibilityValidator, ActuatorSwitchingController, ActuatorConfigurationManager
  
  interfaces
    input vehicle_configuration "Vehicle configuration parameters"
    input system_requirements "System operational requirements"
    output actuator_selection "Selected actuator type and configuration"
    output switching_commands "Actuator switching control commands" 