# Requirement Definition (.req)

## Overview
Defines **system requirements** with complete traceability to functions, blocks, and tests. Supports hierarchical requirement refinement.

## File Structure
- **ONE** `hdef requirementset` per file
- **MULTIPLE** `def requirement` statements (hierarchical)
- Can `use` functionsets, configsets, testsets, parameters

## Valid Keywords
```
use, hdef, requirementset, def, requirement, name, description, owner, 
tags, level, rationale, verificationcriteria, status, reqtype, safetylevel, 
refinedfrom, derivedfrom, implements, allocatedto, testedby, when, ref, 
config, testcase, safetygoal, attach, proposal
```

## Syntax Structure
```
use functionset [functionset-ref]
use configset [configset-ref]
use testset [testset-ref]
use parameter [parameter-ref], [parameter-ref], ...

hdef requirementset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM|SIL-1|SIL-2|SIL-3|SIL-4]
  level [system|subsystem|component]

  def requirement [identifier]
    name [string-literal]
    description [string-literal]
    rationale [string-literal]
    verificationcriteria [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    level [product|system|subsystem|component|subcomponent|module|submodule|part|subpart|solution|solutionelement|external|customer|supplier|object|objectelement|buildingblock|function|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    status [draft|review|approved|deprecated|implemented|accepted|rejected|accepted+proposal|notapplicable|unknown]
    reqtype [functional|nonfunctional|system|software|hardware|interface|safety|stakeholder|process|compliance|quality|IT|manufacturing|supplier|program|others]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    proposal [string-literal]
    attach [string-literal]
    
    # Requirement relationships
    refinedfrom ref requirement [requirement-ref]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    derivedfrom ref safetygoal [safetygoal-ref], [safetygoal-ref], ...
    implements ref function [function-ref], [function-ref], ...
    allocatedto ref block [block-ref], [block-ref], ...
    testedby ref testcase [testcase-ref], [testcase-ref], ...
    when ref config [config-ref]
    
    def requirement [sub-requirement-id]
      # Nested requirements with same structure
```

## Complete Example
```sylang
use functionset AutonomousPerceptionFunctions
use configset AutonomousVehicleConfig
use parameter MaxDetectionRange, ConfidenceThreshold

hdef requirementset AutonomousPerceptionRequirements
  name "Autonomous Vehicle Perception System Requirements"
  description "Safety and functional requirements for perception system"
  owner "Perception Safety Engineering Team"
  safetylevel ASIL-D

  def requirement REQ_PERC_001
    name "Environmental Detection Performance"
    description """
      WHEN the perception system is active THE system SHALL detect 
      stationary objects ≥20cm at distances up to 200m with ≥99.9% accuracy.
      """
    rationale """
      Ensures reliable object detection for collision avoidance. Critical
      for ASIL-D compliance and passenger safety in Level 3 autonomous operation.
      """
    verificationcriteria """
      Statistical testing with calibrated test objects at various distances.
      Minimum 10,000 test cases across different environmental scenarios.
      """
    status approved
    reqtype functional
    safetylevel ASIL-D
    implements ref function ObjectClassification

    def requirement REQ_PERC_001_1
      name "Object Classification Accuracy"
      description "THE system SHALL classify detected objects with ≥95% accuracy within 100ms"
      rationale "Accurate classification enables appropriate collision avoidance responses"
      verificationcriteria "ML model validation with annotated test datasets"
      status approved
      reqtype functional
      safetylevel ASIL-D
      refinedfrom ref requirement REQ_PERC_001
      implements ref function ObjectClassification

  def requirement REQ_PERC_002
    name "Sensor Fusion Latency"
    description "Fusion algorithm SHALL output environmental model within 50ms"
    status approved
    reqtype performance
    safetylevel ASIL-D
    implements ref function SensorFusion
```

## Requirement Types
```
reqtype functional      # Functional requirement
reqtype non-functional  # Non-functional requirement
reqtype system          # System requirement
reqtype software        # Software requirement
reqtype hardware        # Hardware requirement
reqtype interface       # Interface requirement
reqtype safety          # Safety requirement
```

## Status Values
```
status draft       # Draft status
status review      # Under review
status approved    # Approved
status deprecated  # Deprecated
status implemented # Implemented
```

## Traceability

### Bilateral Traceability (INCOSE/ASPICE Definition)
**Bilateral (Bidirectional) Traceability** is the ability to trace requirements both **forward** and **backward** throughout the development lifecycle:

- **Forward Traceability**: From parent artifacts to child artifacts (e.g., Safety Goal → Requirements → Design → Implementation → Tests)
- **Backward Traceability**: From child artifacts back to parent artifacts (e.g., Tests → Implementation → Design → Requirements → Safety Goal)

**Purpose**: Ensures all safety goals are implemented, verified, and validated, and that all artifacts are justified by requirements. Critical for ISO 26262 compliance and change impact analysis.

### Traceability Relations
- `refinedfrom ref requirement` - Refinement relationship (parent-child requirements)
- `derivedfrom ref requirement` - Derived from other requirements
- `derivedfrom ref safetygoal` - **Backward traceability to ISO 26262 safety goals (.sgl)**
- `implements ref function` - Implementation link to functions
- `allocatedto ref block` - Allocation to architecture blocks
- `testedby ref testcase` - Link to test cases
- `when ref config` - Conditional visibility

### ISO 26262 Bilateral Traceability Example
```sylang
# In .sgl file (forward):
def safetygoal SG_001_PreventUnintendedAcceleration
  leadsto ref requirement REQ_SAFE_ACCEL_001, REQ_SAFE_ACCEL_002

# In .req file (backward - THIS FILE):
def requirement REQ_SAFE_ACCEL_001
  reqtype safety
  safetylevel ASIL-D
  derivedfrom ref safetygoal SG_001_PreventUnintendedAcceleration  # Backward link
  implements ref function ThrottleControlMonitor
  allocatedto ref block ThrottleControlUnit
  testedby ref testcase TC_ACCEL_SAFETY_001

def requirement REQ_SAFE_ACCEL_002
  reqtype functional
  safetylevel ASIL-D
  derivedfrom ref safetygoal SG_001_PreventUnintendedAcceleration  # Backward link
  implements ref function EmergencyThrottleShutoff
```

**Bilateral Traceability Chain**:
```
.sgl (Safety Goal)
  ↕ leadsto / derivedfrom
.req (Requirements)        ← YOU ARE HERE
  ↕ implements / testedby
.blk/.fun (Architecture)
  ↕ allocatedto
.tst (Test Cases)
```

---
See `.sgl` for safety goals, `.tst` for test cases that verify requirements.

