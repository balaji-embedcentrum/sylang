mechanicsassembly NetworkRouterAssembly
  name "Network Router Assembly"
  description "Mechanical assembly providing mounting and protection for network routing and switching electronics"
  owner "Mechanical Team"
  tags "network-router", "routing", "switching", "mounting"
  safetylevel ASIL-C
  partof ProtocolManagementUnit
  interfaces
    input router_forces "Mechanical forces and installation requirements for routing hardware"
    input network_environment "Environmental conditions and electromagnetic interference"
    output router_mount "Network router mounting and mechanical support structure"
    output switch_protection "Protection for network switching components and circuits"
    output network_connectors "Network connector mounting and cable management"
