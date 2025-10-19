# State Machine Diagram (.smd)

## Overview
Defines **state machines** with states, transitions, and behavioral logic. Requires ONE initialstate=true and ONE endstate=true per file.

## File Structure
- **ONE** `hdef statemachine` per file
- **MULTIPLE** `def state` and `def transition` statements
- ONE state with `initialstate true`
- ONE state with `endstate true`

## Valid Keywords
```
use, hdef, statemachine, def, state, transition, name, description, owner, 
tags, safetylevel, status, allocatedto, implements, initialstate, endstate, 
from, to, condition, call, when, ref
```

## Syntax Structure
```
use functionset [functionset-ref]
use requirementset [requirementset-ref]
use block [block-ref]

hdef statemachine [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
  status [draft|approved|implemented]
  allocatedto ref block [block-ref]
  implements ref requirement [requirement-ref]

  def state [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    status [draft|implemented|verified]
    initialstate [true|false]
    endstate [true|false]
    implements ref requirement [requirement-ref]
    
  def transition [identifier]
    name [string-literal]
    description [string-literal]
    from ref state [state-ref]
    to ref state [state-ref]
    condition [string-literal]
    call ref function [function-ref]
```

## Complete Example
```sylang
use functionset EPBFunctions
use requirementset EPBRequirements
use block EPBControlModule

hdef statemachine ElectricParkingBrakeStateMachine
  name "Electric Parking Brake State Machine"
  description "Complete state machine controlling EPB engagement and release operations"
  owner "Safety Systems Team"
  safetylevel ASIL-D
  status approved
  allocatedto ref block EPBControlModule
  implements ref requirement EPB_StateMachineReq_001

  def state Idle
    name "Idle State"
    description "EPB system in idle state, ready to receive commands"
    owner "Control Systems Team"
    status implemented
    initialstate true
    implements ref requirement EPB_IdleStateReq_001

  def state Engaging
    name "Engaging State"
    description "EPB system actively engaging the brake mechanism"
    owner "Actuator Team"
    status implemented

  def state Engaged
    name "Engaged State"
    description "EPB system fully engaged and holding vehicle"
    owner "Safety Team"
    status implemented

  def state Releasing
    name "Releasing State"
    description "EPB system actively releasing the brake"
    owner "Actuator Team"
    status implemented

  def state Fault
    name "Fault State"
    description "EPB system in fault condition requiring diagnostics"
    owner "Diagnostics Team"
    status implemented
    endstate true

  def transition EngageCommand
    name "Engage Command Transition"
    description "Transition from idle to engaging when engage command received"
    owner "Control Logic Team"
    status implemented
    from ref state Idle
    to ref state Engaging
    condition "engage_command_received AND brake_pedal_pressed AND vehicle_stationary"
    call ref function InitiateEngagement

  def transition EngagementComplete
    name "Engagement Complete Transition"
    description "Transition from engaging to engaged when motor reaches target position"
    from ref state Engaging
    to ref state Engaged
    condition "engagement_confirmed AND motor_current_stable"
    call ref function ConfirmEngagement

  def transition ReleaseCommand
    name "Release Command Transition"
    description "Transition from engaged to releasing when release command received"
    from ref state Engaged
    to ref state Releasing
    condition "release_command_received AND brake_pedal_pressed"
    call ref function InitiateRelease

  def transition FaultDetected
    name "Fault Detection Transition"
    description "Transition to fault state when diagnostic failure detected"
    from ref state Idle
    to ref state Fault
    condition "system_diagnostic_failure OR motor_overcurrent"
    call ref function HandleFault
```

## Required States
- **Initial State**: ONE state with `initialstate true`
- **End State**: ONE state with `endstate true`

## State Properties
- `initialstate true` - Entry point of state machine
- `endstate true` - Exit/fault state
- `status` - Implementation status

## Transition Properties
- `from ref state` - Source state
- `to ref state` - Target state
- `condition` - Guard condition (string expression)
- `call ref function` - Function to execute on transition

---
State machines must have exactly ONE initial state and ONE end state.

