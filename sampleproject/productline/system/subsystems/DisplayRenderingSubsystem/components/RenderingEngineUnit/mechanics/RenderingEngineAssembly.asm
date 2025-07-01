mechanicsassembly RenderingEngineAssembly
  name "Rendering Engine Assembly"
  description "Mechanical assembly providing mounting, cooling, and protection for rendering engine hardware and processing units"
  owner "Mechanical Team"
  tags "rendering-engine", "processing-units", "mounting", "cooling"
  safetylevel ASIL-B
  partof RenderingEngineUnit
  interfaces
    input engine_forces "Mechanical forces and thermal loads on rendering engine components"
    input cooling_demands "Advanced cooling demands for high-performance rendering operations"
    output engine_mount "Secure rendering engine mounting and mechanical stability"
    output advanced_cooling "Advanced thermal management and heat dissipation system"
    output vibration_isolation "Vibration isolation for sensitive rendering hardware"
