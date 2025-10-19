# Hazard Analysis - ISO 26262 (.haz)

## Overview
Defines **ISO 26262 hazard analysis** with ASIL determination. Part of ISO 26262 Part 3 compliance.

## File Structure
- **ONE** `hdef hazardanalysis` per file
- **MULTIPLE** `def hazard` and `def situation` statements (hierarchical)
- Can `use` itemdefinition

## Valid Keywords
```
use, hdef, hazardanalysis, def, hazard, situation, name, description, owner, 
tags, level, iso26262part, assessmentdate, hazardclass, severity, exposure, 
controllability, asil, speed, environment, trafficdensity, maxacceptabledelay, 
nominalresponsetime, malfunctionof, affects, leadsto, when, ref
```

## Syntax Structure
```
use itemdefinition [item-ref]

hdef hazardanalysis [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  iso26262part [string-literal]
  assessmentdate [YYYY-MM-DD]
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]

  def hazard [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    hazardclass [string-literal]
    malfunctionof ref function [function-ref]
    affects [string-literal]
    
    def situation [identifier]
      name [string-literal]
      description [string-literal]
      severity [S0|S1|S2|S3]
      exposure [E0|E1|E2|E3|E4|E5]
      controllability [C0|C1|C2|C3]
      asil [QM|ASIL-A|ASIL-B|ASIL-C|ASIL-D]
      speed [numeric-value]
      environment [string-literal]
      trafficdensity [low|medium|high]
      maxacceptabledelay [numeric-value]
      nominalresponsetime [numeric-value]
      leadsto ref hazard [hazard-ref]
```

## ASIL Determination
```
severity: S0, S1, S2, S3
exposure: E0, E1, E2, E3, E4, E5
controllability: C0, C1, C2, C3
asil: QM, ASIL-A, ASIL-B, ASIL-C, ASIL-D
```

## Example
```sylang
use itemdefinition AutonomousVehicleItem

hdef hazardanalysis AutonomousVehicleHazards
  name "Autonomous Vehicle Hazard Analysis"
  description "Complete hazard analysis and risk assessment for L3 autonomous vehicle"
  owner "Functional Safety Team"
  tags "ISO-26262", "hazard-analysis", "ASIL-assessment"
  iso26262part "Part 3 - Hazard Analysis"
  assessmentdate "2025-08-18"
  safetylevel ASIL-D

  def hazard UnintendedAcceleration
    name "Unintended Vehicle Acceleration"
    description """
      Vehicle accelerates without driver command or against driver intention 
      during autonomous operation. This hazard can occur due to throttle control 
      system malfunction, sensor misinterpretation, or software algorithm errors.
      """
    hazardclass "Longitudinal Motion"
    severity S3
    exposure E4
    controllability C2
    asil ASIL-D
    
    malfunctionof ref function ThrottleControl
    affects ref feature ControlSystem
    leadsto ref requirement REQ_SAFE_ACCEL_001

    def situation HighwayUnintendedAcceleration
      name "Unintended Acceleration on Highway"
      description "Vehicle accelerates unintentionally during highway autonomous operation"
      speed "60-130 km/h"
      environment "Highway, dry conditions"
      trafficdensity "Medium to high traffic"
      maxacceptabledelay "500ms"
      nominalresponsetime "200ms"
      severity S3
      exposure E4
      controllability C2
      asil ASIL-D

    def situation UrbanUnintendedAcceleration
      name "Unintended Acceleration in Urban Area"
      description "Vehicle accelerates unintentionally in urban environment with pedestrians"
      speed "30-60 km/h"
      environment "Urban streets, intersections"
      trafficdensity "High traffic, pedestrians present"
      maxacceptabledelay "300ms"
      nominalresponsetime "150ms"
      severity S3
      exposure E5
      controllability C3
      asil ASIL-D

  def hazard LossOfLateralControl
    name "Loss of Lateral Vehicle Control"
    description "Vehicle loses ability to maintain lane position or steer appropriately"
    hazardclass "Lateral Motion"
    severity S3
    exposure E4
    controllability C2
    asil ASIL-D
    
    malfunctionof ref function SteeringControl
    affects ref feature ControlSystem
    leadsto ref requirement REQ_SAFE_STEER_001

  def hazard FailureToStopAtObstacle
    name "Failure to Stop at Obstacle"
    description "Vehicle fails to detect obstacle and stop, resulting in collision"
    hazardclass "Longitudinal Motion"
    severity S3
    exposure E4
    controllability C3
    asil ASIL-D
    
    malfunctionof ref function ObjectClassification
    affects ref feature PerceptionSystem
    leadsto ref requirement REQ_SAFE_STOP_001
```

## Hazard Properties
- `hazardclass` - Classification of hazard
- `severity` - Severity rating (S0-S3)
- `exposure` - Exposure probability (E0-E5)
- `controllability` - Controllability by driver (C0-C3)
- `asil` - Determined ASIL level

## Situation Properties
- `speed` - Vehicle speed range
- `environment` - Environmental conditions
- `trafficdensity` - Traffic density description
- `maxacceptabledelay` - Maximum acceptable delay
- `nominalresponsetime` - Nominal response time required

---
ISO 26262 Part 3 compliance. Leads to safety requirements and mechanisms.

