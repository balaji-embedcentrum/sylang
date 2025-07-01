mechanicsassembly IsolationSwitchAssembly
  name "Isolation Switch Assembly"
  description "Mechanical assembly providing mounting and protection for fault isolation switching and safety barrier components"
  owner "Mechanical Team"
  tags "isolation-switch", "safety-barriers", "mounting", "protection"
  safetylevel ASIL-D
  partof FaultManagementUnit
  interfaces
    input switching_forces "Mechanical forces from isolation switching operations"
    input barrier_loads "Mechanical loads on safety barrier components"
    output switch_mount "Secure isolation switch mounting and operational support"
    output barrier_protection "Safety barrier physical protection and operational integrity"
    output isolation_enclosure "Isolation component enclosure and environmental protection"
