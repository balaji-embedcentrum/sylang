assembly ControlHardwareAssembly
  name "Automation Control Hardware Assembly"
  description "Mechanical assembly for automation control hardware, mounting brackets, and physical interfaces"
  owner "Mechanics Team"
  tags "control", "hardware", "mounting", "interfaces"
  safetylevel ASIL-B
  partof AutomationCoordinationUnit
  
  interfaces
    Control_Unit_Mount "Control unit mounting interface"
    Hardware_Protection "Control hardware protection housing"
    Interface_Connectors "Physical interface connector mounting" 