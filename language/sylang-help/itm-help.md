# Item Definition - ISO 26262 (.itm)

## Overview
Defines **ISO 26262 item definition** with system boundaries and operating modes. Part of ISO 26262 Part 3 compliance.

## File Structure
- **ONE** `hdef itemdefinition` per file
- **MULTIPLE** `def boundary` and `def operatingmode` statements (hierarchical)
- Can `use` featuresets

## Valid Keywords
```
use, hdef, itemdefinition, def, boundary, operatingmode, name, description, 
owner, tags, level, iso26262part, safetylevel, conditions, includes, 
excludes, itemscope, when, ref
```

## Syntax Structure
```
use featureset [featureset-ref]

hdef itemdefinition [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  iso26262part [string-literal]
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]

  def boundary [identifier]
    name [string-literal]
    description [string-literal]
    includes ref block [block-ref], [block-ref], ...
    excludes ref block [block-ref], [block-ref], ...
    
    def boundary [sub-boundary-id]
      # Nested boundaries with same structure
      
  def operatingmode [identifier]
    name [string-literal]
    description [string-literal]
    conditions [string-literal]
    itemscope [string-literal]
```

## Complete Example
```sylang
use featureset AutonomousVehicleFeatures

hdef itemdefinition AutonomousVehicleItem
  name "Autonomous Vehicle L3 System Item"
  description "Complete item definition for Level 3 autonomous vehicle system per ISO 26262"
  owner "Functional Safety Manager"
  tags "ISO-26262", "item-definition", "L3-autonomous"
  iso26262part "Part 3 - Item Definition"
  safetylevel ASIL-D

  def boundary SystemBoundary
    name "Autonomous Vehicle System Boundary"
    description "Physical and functional boundaries of the autonomous vehicle item"
    
    includes ref block PerceptionControlModule
    includes ref block PlanningControlModule
    includes ref block VehicleControlModule
    includes ref block HumanMachineInterface
    excludes ref block InfotainmentSystem
    excludes ref block ClimateControlSystem
    
    def boundary SensorBoundary
      name "Sensor System Boundary"
      description "Boundary definition for all perception sensors"
      includes ref block CameraSystem
      includes ref block LidarSystem
      includes ref block RadarSystem
      
  def operatingmode HighwayAutonomous
    name "Highway Autonomous Operation"
    description "Autonomous operation on controlled access highways"
    conditions "Highway driving, speeds 60-130 km/h, good weather"
    safetylevel ASIL-D
    
    def operatingmode HighwayEntry
      name "Highway Entry and Merging"
      description "Autonomous highway entry and merging maneuvers"
      conditions "Highway on-ramps, merging zones, acceleration lanes"
      safetylevel ASIL-D
      
    def operatingmode HighwayExit
      name "Highway Exit and Lane Change"
      description "Autonomous highway exit and lane changing"
      conditions "Highway off-ramps, lane changes, deceleration zones"
      safetylevel ASIL-D

  def operatingmode UrbanAutonomous
    name "Urban Autonomous Operation"
    description "Limited autonomous operation in urban environments"
    conditions "City streets, speeds 30-60 km/h, traffic lights, pedestrians"
    safetylevel ASIL-C
    
  def operatingmode ManualFallback
    name "Manual Control Fallback"
    description "Driver takeover and manual control operation"
    conditions "System failure, adverse weather, construction zones"
    safetylevel QM

  itemscope ref function AutonomousPerceptionFunctions
  itemscope ref feature CoreAutonomousFeatures
```

## Boundary Relationships
- `includes ref block` - Blocks included in boundary
- `excludes ref block` - Blocks excluded from boundary
- Hierarchical boundaries supported

## Operating Mode Properties
- `conditions` - Operating conditions (string)
- `safetylevel` - ASIL level for this mode
- Hierarchical modes supported

---
ISO 26262 Part 3 compliance. Followed by `.haz` for hazard analysis.

