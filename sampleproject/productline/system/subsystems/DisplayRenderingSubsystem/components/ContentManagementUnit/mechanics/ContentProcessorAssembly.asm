mechanicsassembly ContentProcessorAssembly
  name "Content Processor Assembly"
  description "Mechanical assembly providing mounting, cooling, and protection for content processing electronics"
  owner "Mechanical Team"
  tags "content-processor", "mounting", "cooling", "protection"
  safetylevel ASIL-B
  partof ContentManagementUnit
  interfaces
    input processor_loads "Mechanical loads and vibration forces on content processing components"
    input thermal_dissipation "Heat dissipation requirements from content processing operations"
    output processor_mount "Secure content processor mounting and mechanical support"
    output cooling_system "Thermal management and heat dissipation for content processing"
    output protection "Physical protection and environmental shielding for electronics"
