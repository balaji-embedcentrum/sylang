assembly ProtectionAssembly
  name "Power Protection Assembly"
  description "Mechanical assembly for power protection components, fuses, circuit breakers, and safety protection hardware"
  owner "Mechanics Team"
  tags "protection", "fuse", "circuit-breaker", "safety"
  safetylevel ASIL-D
  partof PowerManagementUnit
  
  implements PowerProtectionAgent
  
  interfaces
    Protection_Input "Protection circuit input interface"
    Safety_Disconnect "Safety disconnect mechanical interface"
    Emergency_Cutoff "Emergency power cutoff interface"
