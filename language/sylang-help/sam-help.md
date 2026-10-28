---
**📚 Sylang Help Documentation | Version 3.0.12**
---

> **Strings:** write single-line text in double quotes, `"like this"`. Use triple quotes `"""..."""` for text that spans several lines or contains a `"`. Both forms are valid in every property.

# Safety Mechanisms - ISO 26262 (.sam)

## Overview
Defines **ISO 26262 safety mechanisms** with effectiveness metrics. Part of ISO 26262 Part 4 compliance.

## File Structure
- **ONE** `hdef safetymechanismset` per file
- **MULTIPLE** `def safetymechanism` statements
- Can `use` hazardanalysis, itemdefinition

## Valid Keywords
```
use, hdef, safetymechanismset, name, description, owner, tags, level,
iso26262part, safetylevel, mechanismtype, safetymechanismeffectiveness,
detectiontime, reactiontime, def, safetymechanism, satisfies, mitigates,
allocatedto, implementedby, detects, verifiedby, when, requires, ref,
analysiseffort, deveffort, testeffort
```

## Syntax Structure
```
use hazardanalysis [hazardanalysis-ref]
use itemdefinition [itemdefinition-ref]

hdef safetymechanismset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  iso26262part [string-literal]
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]

  def safetymechanism [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    mechanismtype [redundancy|monitoring|diagnostic|protection|degradation|validation]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    safetymechanismeffectiveness [percentage]
    detectiontime [time-value]
    reactiontime [time-value]
    
    # Relationships
    satisfies ref requirement [requirement-ref], [requirement-ref], ...
    mitigates ref hazard [hazard-ref], [hazard-ref], ...
    mitigates ref failuremode [failuremode-ref], [failuremode-ref], ...
    allocatedto ref block [block-ref]
    implementedby ref function [function-ref], [function-ref], ...
    detects ref failuremode [failuremode-ref], [failuremode-ref], ...
    verifiedby ref testcase [testcase-ref], [testcase-ref], ...
```

## Mechanism Types
```
mechanismtype redundancy   # Redundant channel or supply that takes over (fault tolerance)
mechanismtype monitoring   # Plausibility or range monitoring of signals and states
mechanismtype diagnostic   # Self-test or diagnostic that detects a fault
mechanismtype protection   # Hardware protection that limits a fault (clamp, lockout, current limit)
mechanismtype degradation  # Degraded operation or safe-state reaction
mechanismtype validation   # Cross-check of commands or data against an independent source
```

## Example
```sylang
use hazardanalysis AutonomousVehicleHazards
use itemdefinition AutonomousVehicleItem

hdef safetymechanismset AutonomousVehicleSafetyMechanisms
  name """Autonomous Vehicle Safety Mechanisms"""
  description """Comprehensive safety mechanisms for autonomous vehicle per ISO 26262 Part 4"""
  owner """Safety Mechanisms Team"""
  tags """ISO-26262""", """safety-mechanisms""", """fault-tolerance"""
  iso26262part """Part 4 - Safety Mechanisms"""
  safetylevel ASIL-D

  def safetymechanism RedundantSensorValidation
    name """Redundant Sensor Cross-Validation"""
    description """Continuous cross-validation of perception sensors to detect sensor failures"""
    mechanismtype validation
    safetylevel ASIL-D
    safetymechanismeffectiveness """99.5%"""
    detectiontime """50ms"""
    reactiontime """100ms"""
    
    satisfies ref requirement REQ_SAFE_SENSOR_001
    mitigates ref hazard FailureToStopAtObstacle
    allocatedto ref block PerceptionControlModule
    implementedby ref function SensorFusion
    detects ref failuremode CameraSystemFailure
    verifiedby ref testcase TEST_PERC_003_SENSOR_REDUNDANCY

  def safetymechanism EmergencyBrakingOverride
    name """Emergency Braking Override System"""
    description """Independent emergency braking system that can override autonomous control"""
    mechanismtype degradation
    safetylevel ASIL-D
    safetymechanismeffectiveness """99.9%"""
    detectiontime """20ms"""
    reactiontime """80ms"""
    
    satisfies ref requirement REQ_SAFE_BRAKE_001
    mitigates ref hazard UnintendedAcceleration
    allocatedto ref block VehicleControlModule
    implementedby ref function EmergencyBrakeActivation
    detects ref failuremode ThrottleSystemFailure
    verifiedby ref testcase TEST_BRAKE_OVERRIDE_001

  def safetymechanism SteeringAnglePlausibilityCheck
    name """Steering Angle Plausibility Monitoring"""
    description """Continuous monitoring of steering commands for plausibility"""
    mechanismtype monitoring
    safetylevel ASIL-D
    safetymechanismeffectiveness """98.7%"""
    detectiontime """10ms"""
    reactiontime """50ms"""
    
    satisfies ref requirement REQ_SAFE_STEER_002
    mitigates ref hazard LossOfLateralControl
    allocatedto ref block VehicleControlModule
    implementedby ref function SteeringPlausibilityCheck
    detects ref failuremode SteeringSystemFailure
    verifiedby ref testcase TEST_STEER_PLAUSIBILITY_001

  def safetymechanism DriverTakeoverRequest
    name """Driver Takeover Request System"""
    description """Alert system to request driver takeover when autonomous system reaches limits"""
    mechanismtype degradation
    safetylevel ASIL-B
    safetymechanismeffectiveness """95.0%"""
    detectiontime """100ms"""
    reactiontime """3000ms"""
    
    satisfies ref requirement REQ_SAFE_TAKEOVER_001
    mitigates ref hazard LossOfLateralControl
    allocatedto ref block HumanMachineInterface
    implementedby ref function TakeoverRequest
    verifiedby ref testcase TEST_TAKEOVER_REQUEST_001
```

## Safety Mechanism Properties
- `mechanismtype` - Type of mechanism (redundancy, monitoring, diagnostic, protection, degradation, validation)
- `safetymechanismeffectiveness` - Effectiveness percentage
- `detectiontime` - Time to detect fault (ms)
- `reactiontime` - Time to react to fault (ms)

## Relationships
- `satisfies ref requirement` - Satisfies requirement
- `mitigates ref hazard` - Mitigates hazard
- `allocatedto ref block` - Allocated to block
- `implementedby ref function` - Implemented by function
- `detects ref failuremode` - Detects failure mode
- `verifiedby ref testcase` - Verified by test

---
ISO 26262 Part 4 compliance. Complete safety mechanism specification.

