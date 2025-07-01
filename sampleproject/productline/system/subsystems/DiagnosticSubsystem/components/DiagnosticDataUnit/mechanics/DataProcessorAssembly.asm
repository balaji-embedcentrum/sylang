mechanicsassembly DataProcessorAssembly
  name "Data Processor Assembly"
  description "Mechanical assembly providing mounting, cooling, and protection for diagnostic data processing electronics"
  owner "Mechanical Team"
  tags "data-processor", "mounting", "cooling", "protection"
  safetylevel ASIL-C
  partof DiagnosticDataUnit
  interfaces
    input processor_forces "Mechanical forces and vibration loads on data processing components"
    input thermal_loads "Heat generation from data processing operations and electronics"
    output processor_mount "Secure data processor mounting and mechanical support"
    output cooling_system "Thermal management and heat dissipation for data processing"
    output protection "Physical protection and environmental shielding for electronics"
