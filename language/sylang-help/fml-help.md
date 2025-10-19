# Feature Model (.fml)

## Overview
The `.fml` file defines a **hierarchical feature model** with variability constraints. It supports mandatory, optional, or, and alternative features with complete traceability to functions and interfaces.

## File Structure Rules
- **ONE** `hdef featureset` statement per file
- **ONE** `.fml` file per folder (strict limitation)
- **MULTIPLE** `def feature` statements (hierarchical)
- Must `use productline` at the top
- Supports `performs`, `needs`, `offers` relations to functions/operations/signals

## Valid Keywords
```
use, hdef, featureset, listedfor, def, feature, name, description, owner, 
tags, safetylevel, requires, excludes, mandatory, optional, or, alternative, 
performs, needs, offers, ref, operation, signal, function
```

## Syntax Structure
```
use productline [productline-ref]

hdef featureset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  listedfor ref productline [productline-ref]

  def feature [identifier] [mandatory|optional|or|alternative]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    performs ref function [function-ref], [function-ref], ...
    needs ref operation [operation-ref], [operation-ref], ...
    needs ref signal [signal-ref], [signal-ref], ...
    offers ref operation [operation-ref], [operation-ref], ...
    offers ref signal [signal-ref], [signal-ref], ...
    requires ref feature [feature-ref], [feature-ref], ...
    excludes ref feature [feature-ref], [feature-ref], ...

    def feature [sub-feature] [mandatory|optional|or|alternative]
      ... [nested features with same structure]

# Siblings Rule: All siblings must use same constraint type (mandatory/optional, or, or alternative)

# OR Constraint Examples - At least one sibling required
def feature FrontCamera or
def feature FrontLidar or
def feature FrontRadar or
def feature FrontUltrasonic or

def feature Cellular5G or
def feature WiFi6 or
def feature Bluetooth5 or

# ALTERNATIVE Constraint Examples - Exactly one sibling required
def feature L2Advanced alternative
def feature L3Conditional alternative
def feature L4High alternative
def feature L5Full alternative

def feature LithiumIon alternative
def feature SolidState alternative
def feature HydrogenFuelCell alternative

# MANDATORY/OPTIONAL Examples - Independent siblings
def feature CameraSystem mandatory
def feature LidarSystem optional
def feature RadarSystem mandatory
```

## Feature Flags

### Feature Variability
- `mandatory` - Must be included in all variants
- `optional` - May or may not be included
- `or` - At least one sibling must be selected
- `alternative` - Exactly one sibling must be selected

### CRITICAL SIBLING RULES
**Features at the same indentation level MUST have consistent flags:**
- If one sibling is `mandatory`/`optional`, ALL siblings must be `mandatory`/`optional`
- If one sibling is `or`, ALL siblings must be `or`
- If one sibling is `alternative`, ALL siblings must be `alternative`

## Properties

### Feature Properties
- `name` - Human-readable feature name
- `description` - Detailed description (multiline supported)
- `owner` - Team responsible
- `tags` - Searchable tags
- `safetylevel` - ASIL level for safety-critical features
- `performs` - Functions this feature performs
- `needs` - Input operations/signals required
- `offers` - Output operations/signals provided

### Relationship Keywords (ASPICE Bilateral Traceability)
- `performs ref function` - Maps to functional implementation (multiple allowed)
- `inherits ref feature` - Inherits from parent feature (multiple allowed)
- `requires ref feature` - Requires other features (cross-dependencies, multiple allowed)
- `excludes ref feature` - Mutually exclusive with other features (multiple allowed)
- `needs ref operation` - Input operation interfaces (multiple allowed)
- `needs ref signal` - Input signal interfaces (multiple allowed)
- `offers ref operation` - Output operation interfaces (multiple allowed)
- `offers ref signal` - Output signal interfaces (multiple allowed)

## Complete Example

```sylang
use productline AutonomousVehicleProductLine

hdef featureset AutonomousVehicleFeatures
  name "Autonomous Vehicle Feature Set"
  description """
    Comprehensive feature model for autonomous vehicle platform with 
    L3 automation capabilities including perception, planning, and control.
    """
  owner "Product Engineering Team"
  tags "features", "autonomous-vehicle", "L3-automation"
  listedfor ref productline AutonomousVehicleProductLine

  def feature CoreAutonomousFeatures mandatory
    name "Core Autonomous Driving Features"
    description "Essential autonomous driving functionality for L3 automation"
    owner "Autonomous Systems Team"
    safetylevel ASIL-D
    performs ref function AutonomousDrivingController, PathPlanner
    needs ref operation GetVehicleState, GetEnvironmentData
    needs ref signal VehicleSpeed, SteeringAngle
    offers ref operation SetSteeringAngle, SetBrakePressure
    offers ref signal AutonomousModeActive, SystemReady

    def feature PerceptionSystem mandatory
      name "Environmental Perception System"
      description "Multi-sensor fusion for environmental awareness"
      owner "Perception Team"
      safetylevel ASIL-D

      def feature CameraSystem mandatory
        name "Camera-based Vision System"
        description "Stereo and mono camera processing"
        safetylevel ASIL-D

      def feature LidarSystem optional
        name "LiDAR Scanning System"
        description "3D point cloud processing"
        safetylevel ASIL-C

      def feature RadarSystem mandatory
        name "Radar Detection System"
        description "Long and short range radar"
        safetylevel ASIL-D

    def feature PlanningSystem mandatory
      name "Path Planning and Decision System"
      safetylevel ASIL-D

      def feature GlobalPlanning mandatory
        name "Global Path Planning"
        safetylevel ASIL-C

      def feature LocalPlanning mandatory
        name "Local Path Planning"
        safetylevel ASIL-D

  def feature HumanMachineInterface optional
    name "Human Machine Interface Systems"
    description "Driver interaction and takeover request"
    safetylevel ASIL-B

    def feature TakeoverRequest or
      name "Takeover Request System"
      safetylevel ASIL-B

    def feature StatusDisplay or
      name "Autonomous System Status Display"
      safetylevel ASIL-A

    def feature VoiceInterface or
      name "Voice Command Interface"
      safetylevel QM
```

## Sibling Consistency Examples

### ✅ VALID - All siblings are mandatory/optional
```sylang
def feature SensorSuite mandatory
  def feature Camera mandatory
  def feature Radar mandatory
  def feature Lidar optional    # Mixed mandatory/optional is OK
```

### ✅ VALID - All siblings are 'or'
```sylang
def feature DisplayType optional
  def feature LCDDisplay or
  def feature OLEDDisplay or
  def feature LEDDisplay or
```

### ✅ VALID - All siblings are 'alternative'
```sylang
def feature ProcessorType mandatory
  def feature ARMProcessor alternative
  def feature x86Processor alternative
  def feature RISCVProcessor alternative
```

### ❌ INVALID - Mixed 'or' and 'alternative'
```sylang
def feature InvalidFeature mandatory
  def feature Option1 or           # ❌ ERROR
  def feature Option2 alternative  # ❌ Cannot mix or/alternative
```

## Feature Constraints

### Requires (Dependency)
```sylang
def feature AdvancedLanekeeping optional
  requires ref feature CameraSystem, LidarSystem
  # Both Camera and Lidar must be enabled
```

### Excludes (Mutual Exclusion)
```sylang
def feature ManualTransmission optional
  excludes ref feature AutomaticTransmission
  # Cannot have both manual and automatic
```

## Functional Mapping

### Performs (Function Implementation)
```sylang
def feature ObjectDetection mandatory
  performs ref function ObjectClassifier, ObjectTracker
  # Maps to specific functions
```

### Needs/Offers (Interface Definition)
```sylang
def feature BrakeControl mandatory
  needs ref operation GetBrakePedalPosition
  needs ref signal WheelSpeedSensor
  offers ref operation SetBrakePressure
  offers ref signal BrakeSystemStatus
```

## Common Patterns

### Safety-Critical Feature Hierarchy
```sylang
def feature SafetyMonitoring mandatory
  safetylevel ASIL-D
  
  def feature SystemHealthMonitoring mandatory
    safetylevel ASIL-D
  
  def feature FallbackSystem mandatory
    safetylevel ASIL-D
  
  def feature RedundantSensors optional
    safetylevel ASIL-D
```

### Alternative Selection Pattern
```sylang
def feature PowertrainType mandatory
  def feature ElectricPowertrain alternative
  def feature HybridPowertrain alternative
  def feature ICEPowertrain alternative
  # Exactly one must be selected
```

### Optional Add-on Features
```sylang
def feature ComfortFeatures optional
  def feature HeatedSeats optional
  def feature SunRoof optional
  def feature PremiumAudio optional
  # Can select any combination
```

## Validation Rules
✅ Exactly one `hdef featureset` per file  
✅ Only ONE `.fml` file per folder  
✅ Must include `use productline` statement  
✅ Must include `listedfor ref productline`  
✅ Sibling features must have consistent flags  
✅ Multiline strings use `"""` triple quotes  
✅ Can reference functions via `performs`  
✅ Can reference operations/signals via `needs`/`offers`  
❌ Cannot use `when ref config` (not allowed in .fml)  
❌ Cannot have multiple `.fml` files in same folder

## File Organization
```
ProductLine/
├── ProductLine.ple
└── Features/
    └── ProductFeatures.fml    # ONE per folder
```

For hierarchical feature models across multiple folders:
```
ProductLine/
├── ProductLine/
│   └── ProductLine.fml        # Top-level features
├── Systems/
│   ├── ADAS/
│   │   └── ADASFeatures.fml   # ADAS system features
│   └── Powertrain/
│       └── PowertrainFeatures.fml
```

## Generate Variants
After creating `.fml`, right-click and select:
- **"Generate VML from FML"** → Creates `.vml` file
- Then right-click `.vml` and **"Generate VCF from VML"** → Creates `.vcf` file

---

**Next Steps**: Generate `.vml` and `.vcf` files using right-click commands.

