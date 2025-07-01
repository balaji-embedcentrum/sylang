mechanicsassembly ProcessorAssembly
  name "Processor Assembly"
  description "Mechanical assembly providing mounting, cooling, and protection for data processing electronics"
  owner "Mechanical Team"
  tags "processor-housing", "cooling", "protection", "mounting"
  safetylevel ASIL-B
  partof DataOptimizationUnit
  interfaces
    input mounting_forces "Mechanical mounting forces and installation requirements"
    input thermal_load "Heat generation and thermal management requirements"
    output processor_mount "Secure processor mounting and mechanical support"
    output cooling_system "Thermal management and heat dissipation capability"
    output protection "Physical protection and environmental shielding"
