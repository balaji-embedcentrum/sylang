mechanicsassembly SwitchHardwareAssembly
  name "Switch Hardware Assembly"
  description "Mechanical assembly providing mounting, protection, and tactile feedback for physical switches and control interfaces"
  owner "Mechanical Team"
  tags "switch-hardware", "physical-switches", "tactile-feedback", "control-interfaces"
  safetylevel ASIL-B
  partof SwitchManagementUnit
  interfaces
    input switch_forces "Mechanical forces and actuation loads on physical switches"
    input tactile_requirements "Tactile feedback requirements and user interaction forces"
    output switch_mount "Secure switch mounting and positioning system"
    output tactile_mechanism "Tactile feedback mechanism and user interaction enhancement"
    output switch_protection "Switch protection and environmental sealing"
