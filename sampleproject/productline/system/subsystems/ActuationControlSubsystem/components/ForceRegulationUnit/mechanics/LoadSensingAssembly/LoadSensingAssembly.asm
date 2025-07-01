assembly LoadSensingAssembly
  name "Load Sensing Assembly"
  description "Mechanical assembly for load sensing components, force measurement hardware, and load feedback mechanisms"
  owner "Mechanics Team"
  tags "load", "sensing", "force", "measurement"
  safetylevel ASIL-C
  partof ForceRegulationUnit
  
  implements LoadSensorProcessor
  
  interfaces
    Load_Measurement "Load sensing mechanical interface"
    Force_Feedback "Force feedback measurement interface"
    Load_Calibration "Load sensor calibration interface"
