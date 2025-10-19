# Safety Goals (.sgl)

## Overview

Defines **ISO 26262 Safety Goals** derived from hazard analysis with ASIL classification and safe state definitions. Part of ISO 26262 Part 3 - Concept Phase.

## File Structure

- **ONE** `hdef safetygoalset` per file
- **MULTIPLE** `def safetygoal` statements
- **REFERENCE-HEAVY**: Links to `.haz`, `.itm`, `.req`

## Valid Keywords

```
use, hdef, safetygoalset, def, safetygoal, name, description, owner, 
tags, safetylevel, safestate, faulttoleranttime, emergencyoperationtime, 
derivedfrom, mitigates, leadsto, allocatedto, when, ref, hazard, situation, 
item, requirement
```

## Syntax Structure

```
use hazardanalysis [hazardanalysis-ref]
use itemdefinition [itemdefinition-ref]

hdef safetygoalset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]

  def safetygoal [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
  
    # References to hazard analysis (backward traceability)
    derivedfrom ref hazard [hazard-ref], [hazard-ref], ...
    derivedfrom ref situation [situation-ref], [situation-ref], ...
    mitigates ref hazard [hazard-ref], [hazard-ref], ...
  
    # Safe state definition
    safestate [string-literal]
    faulttoleranttime [numeric-value-ms]
    emergencyoperationtime [numeric-value-ms]
  
    # Forward traceability to requirements
    leadsto ref requirement [requirement-ref], [requirement-ref], ...
  
    # Item scope
    allocatedto ref item [item-ref]
  
    # Conditional visibility
    when ref config [config-ref]
```

## Complete Example

```sylang
use hazardanalysis AutonomousVehicleHazards
use itemdefinition AutonomousVehicleItem

hdef safetygoalset AutonomousVehicleSafetyGoals
  name "Autonomous Vehicle Safety Goals"
  description """
    Complete set of safety goals derived from hazard analysis for 
    Level 3 autonomous vehicle system per ISO 26262 Part 3.
    """
  owner "Functional Safety Manager"
  tags "ISO-26262", "safety-goals", "part-3", "ASIL-D"
  safetylevel ASIL-D

  def safetygoal SG_001_PreventUnintendedAcceleration
    name "Prevent Unintended Vehicle Acceleration"
    description """
      The vehicle SHALL prevent unintended acceleration during autonomous 
      operation to avoid collision with other vehicles, pedestrians, or 
      obstacles. System must detect acceleration faults and transition 
      to safe state within fault tolerant time interval.
      """
    owner "Safety Goals Team"
    tags "acceleration-control", "longitudinal-safety", "collision-avoidance"
    safetylevel ASIL-D
  
    # Backward traceability to hazards
    derivedfrom ref hazard UnintendedAcceleration
    derivedfrom ref situation HighwayUnintendedAcceleration
    derivedfrom ref situation UrbanUnintendedAcceleration
    mitigates ref hazard UnintendedAcceleration
  
    # Safe state definition
    safestate """
      Vehicle transitions to controlled deceleration with hazard lights 
      activated. Target: Safe stop within current lane or emergency lane 
      if available. Driver takeover request issued immediately.
      """
    faulttoleranttime 500          # 500ms max time to detect and react
    emergencyoperationtime 3000    # 3s emergency operation allowed
  
    # Forward traceability to requirements
    leadsto ref requirement REQ_SAFE_ACCEL_001, REQ_SAFE_ACCEL_002, REQ_THROTTLE_MONITOR_001
  
    # Item allocation
    allocatedto ref item AutonomousVehicleItem
  
    # Configuration-based visibility
    when ref config c_CoreAutonomousFeatures

  def safetygoal SG_002_MaintainLateralControl
    name "Maintain Lateral Vehicle Control"
    description """
      The vehicle SHALL maintain lateral control and lane position during 
      autonomous operation. Loss of steering control must be detected and 
      mitigated within fault tolerant time to prevent lane departure or collision.
      """
    safetylevel ASIL-D
  
    # Backward traceability
    derivedfrom ref hazard LossOfLateralControl
    mitigates ref hazard LossOfLateralControl
  
    # Safe state
    safestate """
      Vehicle maintains current trajectory with reduced speed. Emergency 
      steering control activated via redundant steering channel. Driver 
      takeover request with visual/audible/haptic warnings.
      """
    faulttoleranttime 300
    emergencyoperationtime 2000
  
    # Forward traceability
    leadsto ref requirement REQ_SAFE_STEER_001, REQ_STEER_REDUNDANCY_001
  
    allocatedto ref item AutonomousVehicleItem

  def safetygoal SG_003_DetectAndAvoidObstacles
    name "Detect and Avoid Obstacles"
    description """
      The vehicle SHALL detect obstacles in the driving path and execute 
      collision avoidance maneuvers or emergency braking to prevent collision.
      """
    safetylevel ASIL-D
  
    derivedfrom ref hazard FailureToStopAtObstacle
    mitigates ref hazard FailureToStopAtObstacle
  
    safestate """
      Emergency braking activated with maximum deceleration within system 
      limits. Hazard lights activated. If collision unavoidable, minimize 
      impact velocity and protect occupants.
      """
    faulttoleranttime 200
    emergencyoperationtime 5000
  
    leadsto ref requirement REQ_SAFE_STOP_001, REQ_EMERGENCY_BRAKE_001, REQ_COLLISION_AVOID_001
  
    allocatedto ref item AutonomousVehicleItem

  def safetygoal SG_004_DiagnoseSensorFailures
    name "Diagnose Perception Sensor Failures"
    description """
      The system SHALL continuously diagnose perception sensor health and 
      detect sensor failures with sufficient coverage to maintain safety goals.
      """
    safetylevel ASIL-D
  
    derivedfrom ref hazard PerceptionSystemFailure
    mitigates ref hazard PerceptionSystemFailure
  
    safestate """
      Degraded operation mode using remaining functional sensors. If minimum 
      sensor redundancy not available, transition to minimal risk condition 
      with driver takeover request.
      """
    faulttoleranttime 100
    emergencyoperationtime 10000
  
    leadsto ref requirement REQ_SENSOR_DIAG_001, REQ_SENSOR_HEALTH_001, REQ_DIAGNOSTIC_COVERAGE_001
  
    allocatedto ref item AutonomousVehicleItem
```

## Safety Goal Properties

### Required Properties

- `name` - Concise safety goal statement
- `description` - Detailed safety goal (use triple quotes for multiline)
- `safetylevel` - ASIL level inherited from hazard
- `derivedfrom ref hazard` - Source hazard(s) (multiple allowed)
- `safestate` - Safe state description (multiline supported)

### Timing Properties (ISO 26262 Part 3)

- `faulttoleranttime` - Maximum time to detect and react (milliseconds)
- `emergencyoperationtime` - Time system can operate in degraded mode (milliseconds)

### Traceability

- **Backward**: `derivedfrom ref hazard/situation`, `mitigates ref hazard`
- **Forward**: `leadsto ref requirement` (links to `.req` file, multiple allowed)
- **Scope**: `allocatedto ref item` (links to `.itm` file)

## Relationship Rules

### From `.haz` (Hazard Analysis) → `.sgl` (Safety Goals)

```sylang
### In .haz file:
def hazard UnintendedAcceleration
  severity S3
  exposure E4
  controllability C2
  asil ASIL-D

### In .sgl file:
def safetygoal SG_001_PreventUnintendedAcceleration
  derivedfrom ref hazard UnintendedAcceleration
  safetylevel ASIL-D  # Inherited from hazard
```

### From `.sgl` (Safety Goals) → `.req` (Requirements) - Bilateral Traceability

```sylang
### In .sgl file:
def safetygoal SG_001_PreventUnintendedAcceleration
  leadsto ref requirement REQ_SAFE_ACCEL_001, REQ_SAFE_ACCEL_002

### In .req file (bilateral traceability):
def requirement REQ_SAFE_ACCEL_001
  reqtype safety
  safetylevel ASIL-D
  derivedfrom ref safetygoal SG_001_PreventUnintendedAcceleration
  # ... requirement details
  
def requirement REQ_SAFE_ACCEL_002
  reqtype functional
  safetylevel ASIL-D
  derivedfrom ref safetygoal SG_001_PreventUnintendedAcceleration
  # ... requirement details
```

**Note**: `.req` files must use `derivedfrom ref safetygoal` to establish bilateral traceability.

## ASIL Inheritance

Safety goals inherit ASIL level from their source hazards:

- Hazard ASIL-D → Safety Goal ASIL-D
- Hazard ASIL-C → Safety Goal ASIL-C
- Multiple hazards → Highest ASIL applies

## Safe State Types (Examples)

```
1. "Controlled stop in current lane"
2. "Degraded operation with reduced speed"
3. "Driver takeover with warning"
4. "Minimal risk condition with safe stop"
5. "Emergency operation using redundant systems"
```

## Validation Rules

✅ Exactly one `hdef safetygoalset` per file
✅ Must `use hazardanalysis` to reference hazards
✅ Each safety goal must have `derivedfrom ref hazard`
✅ Each safety goal must have `safestate` definition
✅ `faulttoleranttime` and `emergencyoperationtime` recommended
✅ ASIL level must match or be higher than source hazard
✅ `leadsto ref requirement` links to `.req` file (multiple allowed)
❌ Cannot create safety goals without source hazards
❌ Cannot lower ASIL level from source hazard

## ISO 26262 Compliance Notes

- **Part 3, Clause 6**: Safety goals derived from hazard analysis
- **Part 3, Clause 7**: Safe state definition required
- **Part 3, Clause 8**: FTTI (Fault Tolerant Time Interval) specification
- **Part 3, Clause 9**: Forward traceability to safety requirements

## File Organization

```
ISO26262/
├── Part3_Concept/
│   ├── ItemDefinition.itm              # System boundaries
│   ├── HazardAnalysis.haz              # Hazards with ASIL
│   └── SafetyGoals.sgl                 # THIS FILE - Safety goals
└── Requirements/
    └── SafetyRequirements.req          # Safety requirements (reqtype=safety)
```

---

**Next Steps**:

- Create safety requirements in `.req` files with `reqtype safety`
- Link requirements back with `derivedfrom ref safetygoal`
- Generate ISO 26262 Part 3 documentation report

**See also**: `.haz` (hazard analysis), `.itm` (item definition), `.req` (requirements)
