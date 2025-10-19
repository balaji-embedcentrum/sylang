# Fault Tree Analysis (.fta)

## Overview
Defines **quantitative fault tree analysis** with hierarchical gate structures. Part of ISO 26262 Part 4 compliance.

## File Structure
- **ONE** `hdef faulttree` per file
- **MULTIPLE** `def gate` statements (hierarchical)
- Can `use` failuresets, hazardanalysis, safetymechanismsets

## Valid Keywords
```
use, hdef, faulttree, def, gate, name, description, owner, tags, 
safetylevel, topevent, gatetype, input, output, allocatedto, when, ref
```

## Syntax Structure
```
use failureset [failureset-ref]
use hazardanalysis [hazardanalysis-ref]
use safetymechanismset [safetymechanismset-ref]

hdef faulttree [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
  topevent ref failuremode [failuremode-ref]

  def gate [identifier]
    name [string-literal]
    description [string-literal]
    gatetype [and|or|xor|inhibit]
    input ref gate [gate-ref], [gate-ref], ...
    input ref failuremode [failuremode-ref], [failuremode-ref], ...
    output ref gate [gate-ref]
    allocatedto ref block [block-ref]
    
    def gate [sub-gate-id]
      # Nested gates with same structure
```

## Gate Types
```
gatetype and     # AND gate (all inputs must occur)
gatetype or      # OR gate (any input can occur)
gatetype xor     # XOR gate (exactly one input)
gatetype inhibit # Inhibit gate (conditional)
```

## Example
```sylang
use failureset PerceptionSystemFailures
use hazardanalysis AutonomousVehicleHazards
use safetymechanismset AutonomousVehicleSafetyMechanisms

hdef faulttree VehicleCollisionFaultTree
  name "Vehicle Collision Fault Tree Analysis"
  description "Complete FTA for vehicle collision scenarios in autonomous operation"
  owner "Safety Analysis Team"
  safetylevel ASIL-D
  tags "fault-tree", "collision-analysis", "quantitative-fta"
  
  // Top event - what we're analyzing
  topevent ref failuremode VehicleCollisionEvent
  
  // System level gate structure
  def gate systemfailure
    gatetype or
    
    // These reference top events from block-level FTA files
    input ref failuremode PerceptionSystemCompleteFail
    input ref failuremode PlanningSystemCompleteFail
    input ref failuremode ControlSystemCompleteFail
    input ref failuremode HumanFactorError
    
    output ref failuremode VehicleCollisionEvent

// Block-level FTA - separate conceptual file
hdef faulttree PerceptionModuleFaultTree
  name "Perception Module Fault Tree"
  description "Detailed fault tree for perception system failures"
  owner "Perception Safety Team"
  allocatedto ref block PerceptionControlModule
  safetylevel ASIL-D
  
  // This is what the system level references
  topevent ref failuremode PerceptionSystemCompleteFail
  
  def gate perceptionfailure
    gatetype or
    
    input ref gate sensorfailures
    input ref gate processingfailures
    input ref gate communicationfailures
    
    output ref failuremode PerceptionSystemCompleteFail

  def gate sensorfailures
    gatetype and  // All sensors must fail (redundancy)
    
    input ref failuremode CameraSystemFailure
    input ref failuremode LidarSystemFailure
    input ref failuremode RadarSystemFailure
    
    output ref gate perceptionfailure

  def gate processingfailures
    gatetype or   // Any processing failure causes perception failure
    
    input ref failuremode SensorFusionFailure
    input ref failuremode ObjectClassificationFailure
    input ref failuremode TrackingAlgorithmFailure
    
    output ref gate perceptionfailure

  def gate communicationfailures
    gatetype xor  // Exclusive failure modes
    
    input ref failuremode CANBusFailure
    input ref failuremode EthernetFailure
    
    output ref gate perceptionfailure
```

## Gate Structure
- `input ref failuremode` - Basic event input
- `input ref gate` - Gate input (hierarchical)
- `output ref failuremode` - Event output
- `output ref gate` - Gate output (hierarchical)

## FTA Hierarchy
**System Level:**
- Top event → System failures → Basic events

**Block Level:**
- Module failures → Subsystem gates → Component failures

---
ISO 26262 Part 4 compliance. Quantitative fault tree analysis.

