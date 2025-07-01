mechanicsassembly GraphicsProcessorAssembly
  name "Graphics Processor Assembly"
  description "Mechanical assembly providing mounting, cooling, and protection for graphics processing units and accelerators"
  owner "Mechanical Team"
  tags "graphics-processor", "mounting", "cooling", "protection"
  safetylevel ASIL-B
  partof GraphicsRenderingUnit
  interfaces
    input processor_loads "Mechanical loads and thermal forces on graphics processors"
    input cooling_requirements "Cooling requirements for high-performance graphics processing"
    output processor_mount "Secure graphics processor mounting and mechanical support"
    output thermal_management "Advanced thermal management and heat dissipation system"
    output protection "Graphics processor protection and electromagnetic shielding"
