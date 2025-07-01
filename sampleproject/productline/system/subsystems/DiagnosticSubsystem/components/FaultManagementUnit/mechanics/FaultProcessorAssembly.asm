mechanicsassembly FaultProcessorAssembly
  name "Fault Processor Assembly"
  description "Mechanical assembly providing mounting, cooling, and protection for fault management processing electronics"
  owner "Mechanical Team"
  tags "fault-processor", "mounting", "cooling", "protection"
  safetylevel ASIL-D
  partof FaultManagementUnit
  interfaces
    input processor_loads "Mechanical loads and vibration forces on fault processing components"
    input thermal_dissipation "Heat dissipation requirements from fault analysis processing"
    output processor_mount "Secure fault processor mounting and mechanical stability"
    output cooling_system "Thermal management and heat dissipation for fault processing"
    output protection "Physical protection and environmental shielding for critical electronics"
