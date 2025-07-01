mechanicsassembly NetworkInterfaceAssembly
  name "Network Interface Assembly"
  description "Mechanical assembly providing mounting and protection for network interface electronics and connectors"
  owner "Mechanical Team"
  tags "network-interface", "connectors", "protection", "mounting"
  safetylevel ASIL-B
  partof DataOptimizationUnit
  interfaces
    input connector_forces "Connector insertion forces and mechanical stresses"
    input emi_environment "Electromagnetic interference and environmental conditions"
    output network_mount "Network interface mounting and mechanical support"
    output connector_protection "Connector protection and durability enhancement"
    output emi_shielding "Electromagnetic interference shielding and protection"
