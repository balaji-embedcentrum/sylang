assembly CoolingAssembly
  name "Power Cooling Assembly"
  description "Mechanical assembly for power cooling components, heat sinks, thermal pads, and thermal management hardware"
  owner "Mechanics Team"
  tags "cooling", "thermal", "heat-sink", "thermal-management"
  safetylevel ASIL-C
  partof PowerManagementUnit
  
  implements ThermalManagementController
  
  interfaces
    Heat_Dissipation "Heat dissipation mechanical interface"
    Thermal_Coupling "Thermal coupling mechanical interface"
    Cooling_Airflow "Cooling airflow mechanical interface"
