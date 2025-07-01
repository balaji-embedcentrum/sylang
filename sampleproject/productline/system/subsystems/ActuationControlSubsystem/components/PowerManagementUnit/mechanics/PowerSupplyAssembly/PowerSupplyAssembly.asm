assembly PowerSupplyAssembly
  name "Power Supply Assembly"
  description "Mechanical assembly for power supply components, voltage regulators, and power conversion hardware"
  owner "Mechanics Team"
  tags "power", "supply", "voltage", "conversion"
  safetylevel ASIL-D
  partof PowerManagementUnit
  
  interfaces
    Power_Input "Power input mechanical interface"
    Power_Output "Power output distribution interface"
    Thermal_Management "Power supply thermal management interface"
