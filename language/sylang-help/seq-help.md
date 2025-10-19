# Sequence Diagram (.seq)

## Overview
Defines **message flow sequences** between blocks with operation/signal flows. Supports fragments for alternative and parallel flows.

## File Structure
- **ONE** `hdef sequenceset` per file
- **MULTIPLE** `def sequence` and `def fragment` statements
- Uses `from/to` refs to blocks and `flow` refs to operations/signals

## Valid Keywords
```
use, hdef, sequenceset, functionset, def, sequence, fragment, name, description, 
owner, tags, level, safetylevel, from, to, flow, fragmenttype, 
condition, when, ref, block, function, operation, signal
```

## Syntax Structure
```
use block [block-ref], [block-ref], ...
use functionset [functionset-ref], [functionset-ref], ...
use function [function-ref], [function-ref], ...
use operation [operation-ref], [operation-ref], ...
use signal [signal-ref], [signal-ref], ...

hdef sequenceset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
  level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]

  def sequence [identifier]
    from ref block [block-ref]
    to ref block [block-ref]
    flow ref operation [operation-ref]
    
  def sequence [identifier]
    from ref block [block-ref]
    to ref block [block-ref]
    flow ref signal [signal-ref]
    
  def sequence [identifier]
    from ref function [function-ref]
    to ref function [function-ref]
    flow ref operation [operation-ref]
    
  def fragment [identifier]
    name [string-literal]
    description [string-literal]
    fragmenttype [alt|else|parallel|loop]
    condition [string-literal]
```

## Fragment Types
```
fragmenttype alt      # Alternative flow
fragmenttype else     # Else branch
fragmenttype parallel # Parallel execution
fragmenttype loop     # Loop iteration
```

## Example with Blocks
```sylang
use block PerceptionControlModule
use block PlanningControlModule
use block VehicleControlModule
use operation EnvironmentModelUpdate
use operation PathPlanningRequest
use signal EmergencyStopSignal

hdef sequenceset AutonomousEmergencyBraking
  name "Autonomous Emergency Braking Sequence"
  description "Message flow sequence for emergency braking scenario"
  owner "Safety Systems Integration Team"
  safetylevel ASIL-D
  tags "emergency-braking", "sequence", "safety-critical", "AEB"
  
  // Main emergency braking sequence
  def sequence SEQ_001
    from ref block PerceptionControlModule
    to ref block PlanningControlModule
    flow ref operation EnvironmentModelUpdate
    
  def sequence SEQ_002
    from ref block PlanningControlModule
    to ref block VehicleControlModule
    flow ref operation PathPlanningRequest
    
  def sequence SEQ_003
    from ref block VehicleControlModule
    to ref block BrakeControlModule
    flow ref signal EmergencyStopSignal
    
  def sequence SEQ_004
    from ref block BrakeControlModule
    to ref block PerceptionControlModule
    flow ref signal BrakeEngagementConfirmation
    
  // Error handling fragment
  def fragment CommunicationFailure
    fragmenttype alt
    condition "Communication timeout > 100ms"
    
    def sequence SEQ_005
      from ref block VehicleControlModule
      to ref block FallbackControlModule
      flow ref signal SystemFailureAlert
      
  // Parallel status reporting fragment  
  def fragment StatusReporting
    fragmenttype parallel
    condition "All modules must report status concurrently"
    
    def sequence SEQ_006
      from ref block PerceptionControlModule
      to ref block SystemHealthMonitor
      flow ref signal PerceptionSystemStatus
      
    def sequence SEQ_007
      from ref block PlanningControlModule
      to ref block SystemHealthMonitor
      flow ref signal PlanningSystemStatus
```

## Example with Functions
```sylang
use functionset AutonomousDrivingFunctions
use function PerceptionProcessing
use function PathPlanning
use function MotionControl
use operation ComputeObstacleMap
use operation PlanTrajectory
use operation ExecuteManeuver

hdef sequenceset AutonomousDrivingSequence
  name "Autonomous Driving Function Sequence"
  description "Message flow sequence between autonomous driving functions"
  owner "AD Systems Team"
  safetylevel ASIL-D
  tags "autonomous-driving", "function-sequence", "safety-critical"
  
  // Function-to-function sequence
  def sequence SEQ_001
    from ref function PerceptionProcessing
    to ref function PathPlanning
    flow ref operation ComputeObstacleMap
    
  def sequence SEQ_002
    from ref function PathPlanning
    to ref function MotionControl
    flow ref operation PlanTrajectory
    
  def sequence SEQ_003
    from ref function MotionControl
    to ref function VehicleController
    flow ref operation ExecuteManeuver
```

---
See `.blk` for block and operation/signal definitions.
See `.fun` for functionset and function definitions.

