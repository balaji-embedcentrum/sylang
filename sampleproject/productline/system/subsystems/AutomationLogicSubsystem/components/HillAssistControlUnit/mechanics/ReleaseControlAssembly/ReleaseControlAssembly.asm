assembly ReleaseControlAssembly
  name "Release Control Assembly"
  description "Mechanical assembly for hill assist release mechanisms, brake release hardware, and rollback prevention components"
  owner "Mechanics Team"
  tags "release", "control", "brake", "rollback"
  safetylevel ASIL-C
  partof HillAssistControlUnit
  
  implements GradualReleaseController, RollbackPreventionSystem
  
  interfaces
    Release_Mechanism_Interface "Release mechanism mechanical interface"
    Brake_Release_Interface "Brake release mechanical interface"
    Rollback_Prevention_Interface "Rollback prevention mechanical interface"
