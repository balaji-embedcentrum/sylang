mechanicsassembly EthernetPhyAssembly
  name "Ethernet PHY Assembly"
  description "Mechanical assembly providing mounting, protection, and connector interface for Ethernet PHY electronics"
  owner "Mechanical Team"
  tags "Ethernet-PHY", "mounting", "protection", "connector-interface"
  safetylevel ASIL-B
  partof StandardsComplianceUnit
  interfaces
    input ethernet_connector_forces "Ethernet connector insertion forces and mechanical stresses"
    input emi_fields "Electromagnetic interference fields and environmental conditions"
    output ethernet_connector "Ethernet connector interface and cable management"
    output phy_mount "Ethernet PHY mounting and mechanical support structure"
    output emi_shielding "Electromagnetic interference shielding and signal integrity protection"
