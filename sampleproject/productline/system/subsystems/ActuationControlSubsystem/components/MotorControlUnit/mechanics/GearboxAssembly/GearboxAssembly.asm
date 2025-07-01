assembly GearboxAssembly
  name "Gearbox Assembly"
  description "Mechanical assembly for gear reduction components, transmission gears, and torque multiplication mechanisms"
  owner "Mechanics Team"
  tags "gearbox", "transmission", "reduction", "torque"
  safetylevel ASIL-C
  partof MotorControlUnit
  
  interfaces
    Gear_Input "Gearbox input shaft interface"
    Gear_Output "Gearbox output shaft interface"
    Lubrication "Gear lubrication mechanical interface"
