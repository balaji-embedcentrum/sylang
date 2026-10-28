---
**📚 Sylang Help Documentation | Version 3.0.12**
---

> **Strings:** write single-line text in double quotes, `"like this"`. Use triple quotes `"""..."""` for text that spans several lines or contains a `"`. Both forms are valid in every property.

# Sylang Complete Language Reference

**Version**: 3.0.12

> **Starting or extending a project?** Read [project-guide-help.md](project-guide-help.md) first. It says which file types to use for IT and software, automotive, aerospace, medical and industrial projects, how to structure the folders, and in what order to build the model.

This reference joins the help for all 22 Sylang file types, and for extending the language with `.sylangextend`. Each file type also has its own help file in this folder. The relations between element kinds are listed in [relations-matrix-help.md](relations-matrix-help.md).

> This file is generated from the individual help files; edit those instead.

## Contents

**Product line and variants**
- [Product Line Engineering (.ple)](#product-line-engineering-ple)
- [Feature Model (.fml)](#feature-model-fml)
- [Variant Model (.vml)](#variant-model-vml)
- [Variant Configuration (.vcf)](#variant-configuration-vcf)

**Architecture and design**
- [Block Definition (.blk)](#block-definition-blk)
- [Function Definition (.fun)](#function-definition-fun)
- [Interface Definition (.ifc)](#interface-definition-ifc)

**Requirements and tests**
- [Requirement Definition (.req)](#requirement-definition-req)
- [Test Definition (.tst)](#test-definition-tst)

**Behaviour diagrams**
- [Use Case Diagram (.ucd)](#use-case-diagram-ucd)
- [Sequence Diagram (.seq)](#sequence-diagram-seq)
- [State Machine Diagram (.smd)](#state-machine-diagram-smd)

**Safety and reliability**
- [Item Definition - ISO 26262 (.itm)](#item-definition---iso-26262-itm)
- [Hazard Analysis - ISO 26262 (.haz)](#hazard-analysis---iso-26262-haz)
- [Safety Goals (.sgl)](#safety-goals-sgl)
- [Safety Mechanisms - ISO 26262 (.sam)](#safety-mechanisms---iso-26262-sam)
- [Failure Analysis - FMEA (.flr)](#failure-analysis---fmea-flr)
- [Fault Tree Analysis (.fta)](#fault-tree-analysis-fta)

**Project management**
- [Sprint Planning (.spr)](#sprint-planning-spr)
- [Agent Definition (.agt)](#agent-definition-agt)

**Documents and dashboards**
- [Specification Document (.spec)](#specification-document-spec)
- [Sylang Dashboard (.dash) - Complete Reference](#sylang-dashboard-dash---complete-reference)

**Extending the language**
- [Sylang Extension System (.sylangextend)](#sylang-extension-system-sylangextend)

---

# Product Line Engineering (.ple)

## Overview
The `.ple` file is the **root file** of a Sylang project, defining the product line with no dependencies on other files. It serves as the foundation for all feature modeling, variant management, and system architecture.

## File Structure Rules
- **ONE** `hdef productline` statement per file
- **NO** `use` statements (root file - no imports)
- **NO** `def` statements (only properties under hdef)
- Only property statements are allowed under the header

## Valid Keywords
```
hdef, productline, name, description, owner, domain, compliance,
firstrelease, tags, safetylevel, status, region
```

## Syntax Structure
```
hdef productline [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  domain [string-literal], [string-literal], ...
  compliance [string-literal], [string-literal], ...
  firstrelease [YYYY-MM-DD]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM|SIL-1|SIL-2|SIL-3|SIL-4]
  region [string-literal], [string-literal], ...
```

## Properties

### Required Properties
- `name` - Human-readable product line name
- `description` - Detailed product line description (supports multiline)
- `owner` - Team or person responsible

### Common Properties
- `domain` - Domain areas (comma-separated)
- `compliance` - Standards compliance (e.g., "ISO 26262", "ISO 21448")
- `firstrelease` - Expected first release date (YYYY-MM-DD format)
- `tags` - Searchable tags (comma-separated)
- `safetylevel` - Safety integrity level (ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM, SIL-1, SIL-2, SIL-3, SIL-4)
- `region` - Target regions (comma-separated)

## Complete Example

```sylang
hdef productline AutonomousVehicleProductLine
  name """Autonomous Vehicle Platform Product Line"""
  description """
    Comprehensive autonomous vehicle system covering ADAS, infotainment, 
    powertrain, and safety systems for Level 3 autonomous driving capabilities.
    """
  owner """Vehicle Systems Engineering Team"""
  domain """autonomous-vehicles""", """automotive-safety""", """ADAS""", """connected-mobility"""
  compliance """ISO 26262""", """ISO 21448""", """UN ECE R79""", """SAE J3016"""
  firstrelease """2026-03-01"""
  tags """autonomous-driving""", """L3-automation""", """safety-critical""", """connected-vehicle"""
  safetylevel ASIL-D
  region """Global""", """North America""", """Europe""", """Asia-Pacific"""
```

## Best Practices

### 1. Comprehensive Description
Use multiline strings for detailed descriptions:
```sylang
description """
  This product line covers the complete autonomous vehicle ecosystem
  including perception systems, planning algorithms, vehicle control,
  and human-machine interfaces for safe Level 3 autonomous operation.
  """
```

### 2. Complete Compliance Information
List all relevant standards:
```sylang
compliance """ISO 26262""", """ISO 21448""", """SAE J3016""", """UN ECE R79"""
```

### 3. Accurate Domain Tags
Use specific, searchable domain terms:
```sylang
domain """autonomous-vehicles""", """automotive-safety""", """ADAS""", """sensor-fusion"""
tags """L3-automation""", """safety-critical""", """real-time""", """AI-enabled"""
```

### 4. Proper Safety Level
Specify the highest ASIL level in the product line:
```sylang
safetylevel ASIL-D  # For safety-critical automotive systems
safetylevel QM      # For non-safety systems
```

## Common Patterns

### Automotive Product Line
```sylang
hdef productline AdvancedDriverAssistanceProductLine
  name """Advanced Driver Assistance Systems Product Line"""
  description """ADAS features from basic to Level 3 autonomy"""
  owner """ADAS Engineering Team"""
  domain """automotive-safety""", """ADAS""", """driver-assistance"""
  compliance """ISO 26262""", """UN ECE R79""", """UN ECE R157"""
  safetylevel ASIL-D
  region """Global"""
```

### Medical Device Product Line
```sylang
hdef productline MedicalMonitoringProductLine
  name """Patient Monitoring Systems Product Line"""
  description """Comprehensive patient vital signs monitoring platform"""
  owner """Medical Systems Engineering"""
  domain """medical-devices""", """patient-monitoring""", """healthcare"""
  compliance """IEC 62304""", """ISO 13485""", """ISO 14971"""
  safetylevel SIL-3
  region """North America""", """Europe"""
```

### Industrial Automation Product Line
```sylang
hdef productline IndustrialAutomationProductLine
  name """Smart Factory Automation Product Line"""
  description """Industry 4.0 automation and control systems"""
  owner """Industrial Systems Team"""
  domain """industrial-automation""", """IIoT""", """smart-manufacturing"""
  compliance """IEC 61508""", """ISO 13849"""
  safetylevel SIL-2
  region """Global"""
```

## Relationship to Other Files
The `.ple` file is referenced by `.fml` files:
```sylang
# In FeatureModel.fml
use productline AutonomousVehicleProductLine

hdef featureset AutonomousFeatures
  listedfor ref productline AutonomousVehicleProductLine
  # ... features
```

## Safety Level Reference

### Automotive (ISO 26262)
- `ASIL-A` - Lowest automotive safety integrity level
- `ASIL-B` - Low automotive safety integrity level
- `ASIL-C` - Medium automotive safety integrity level
- `ASIL-D` - Highest automotive safety integrity level
- `QM` - Quality Management (non-safety)

### Industrial/Medical (IEC 61508)
- `SIL-1` - Lowest safety integrity level
- `SIL-2` - Low safety integrity level
- `SIL-3` - Medium safety integrity level
- `SIL-4` - Highest safety integrity level

## Validation Rules
✅ Exactly one `hdef productline` statement  
✅ No `use` statements allowed  
✅ No `def` statements allowed  
✅ Only property statements under hdef  
✅ Multiline strings use `"""` triple quotes  
❌ Cannot reference other files  
❌ Cannot use `when ref config` (config not allowed in .ple)

## File Organization
Place `.ple` file at the **root** of your product line directory:
```
ProductLine/
├── ProductLine.ple          # Root product line definition
├── Features/
│   └── Features.fml         # References the .ple file
├── Architecture/
│   ├── Blocks.blk
│   └── Functions.fun
└── Requirements/
    └── Requirements.req
```

---

**Next Steps**: After creating your `.ple` file, create a `.fml` file to define your feature model.

---

# Feature Model (.fml)

## Overview
The `.fml` file defines a **hierarchical feature model** with variability constraints. It supports mandatory, optional, or, and alternative features with complete traceability to functions and interfaces.

## File Structure Rules
- **ONE** `hdef featureset` statement per file
- **ONE** `.fml` file per folder (strict limitation)
- **MULTIPLE** `def feature` statements (hierarchical)
- Must `use productline` at the top
- Supports `performs`, `needs`, `provides` relations to functions/operations/signals

## Valid Keywords
```
use, hdef, featureset, listedfor, name, description, owner, tags, level,
safetylevel, status, def, feature, mandatory, optional, or, alternative,
requires, excludes, performs, needs, provides, meets, ref, inherits, attach
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
    provides ref operation [operation-ref], [operation-ref], ...
    provides ref signal [signal-ref], [signal-ref], ...
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
- `provides` - Output operations/signals provided

### Relationship Keywords (ASPICE Bilateral Traceability)
- `performs ref function` - Maps to functional implementation (multiple allowed)
- `inherits ref feature` - Inherits from parent feature (multiple allowed)
- `requires ref feature` - Requires other features (cross-dependencies, multiple allowed)
- `excludes ref feature` - Mutually exclusive with other features (multiple allowed)
- `needs ref operation` - Input operation interfaces (multiple allowed)
- `needs ref signal` - Input signal interfaces (multiple allowed)
- `provides ref operation` - Output operation interfaces (multiple allowed)
- `provides ref signal` - Output signal interfaces (multiple allowed)

## Complete Example

```sylang
use productline AutonomousVehicleProductLine

hdef featureset AutonomousVehicleFeatures
  name """Autonomous Vehicle Feature Set"""
  description """
    Comprehensive feature model for autonomous vehicle platform with 
    L3 automation capabilities including perception, planning, and control.
    """
  owner """Product Engineering Team"""
  tags """features""", """autonomous-vehicle""", """L3-automation"""
  listedfor ref productline AutonomousVehicleProductLine

  def feature CoreAutonomousFeatures mandatory
    name """Core Autonomous Driving Features"""
    description """Essential autonomous driving functionality for L3 automation"""
    owner """Autonomous Systems Team"""
    safetylevel ASIL-D
    performs ref function AutonomousDrivingController, PathPlanner
    needs ref operation GetVehicleState, GetEnvironmentData
    needs ref signal VehicleSpeed, SteeringAngle
    provides ref operation SetSteeringAngle, SetBrakePressure
    provides ref signal AutonomousModeActive, SystemReady

    def feature PerceptionSystem mandatory
      name """Environmental Perception System"""
      description """Multi-sensor fusion for environmental awareness"""
      owner """Perception Team"""
      safetylevel ASIL-D

      def feature CameraSystem mandatory
        name """Camera-based Vision System"""
        description """Stereo and mono camera processing"""
        safetylevel ASIL-D

      def feature LidarSystem optional
        name """LiDAR Scanning System"""
        description """3D point cloud processing"""
        safetylevel ASIL-C

      def feature RadarSystem mandatory
        name """Radar Detection System"""
        description """Long and short range radar"""
        safetylevel ASIL-D

    def feature PlanningSystem mandatory
      name """Path Planning and Decision System"""
      safetylevel ASIL-D

      def feature GlobalPlanning mandatory
        name """Global Path Planning"""
        safetylevel ASIL-C

      def feature LocalPlanning mandatory
        name """Local Path Planning"""
        safetylevel ASIL-D

  def feature HumanMachineInterface optional
    name """Human Machine Interface Systems"""
    description """Driver interaction and takeover request"""
    safetylevel ASIL-B

    def feature TakeoverRequest or
      name """Takeover Request System"""
      safetylevel ASIL-B

    def feature StatusDisplay or
      name """Autonomous System Status Display"""
      safetylevel ASIL-A

    def feature VoiceInterface or
      name """Voice Command Interface"""
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
  provides ref operation SetBrakePressure
  provides ref signal BrakeSystemStatus
  
  # Optional: Control port placement with left/right keywords (for decomposition diagrams)
  needs ref signal WheelSpeedSensor right
  provides ref operation SetBrakePressure left
  # Default: needs → left, provides → right. Keywords override defaults.
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
✅ Links to its product line with `use productline` and `listedfor ref productline` (recommended; a project without a `.ple` leaves them out)  
✅ Sibling features must have consistent flags  
✅ Multiline strings use `"""` triple quotes  
✅ Can reference functions via `performs`  
✅ Can reference operations/signals via `needs`/`provides`  
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
- **"Create .vml template"** → Creates `.vml` file
- Then right-click `.vml` and **"Generate variant config (.vcf)"** → Creates `.vcf` file

---

**Next Steps**: Generate `.vml` and `.vcf` files using right-click commands.

---

# Variant Model (.vml)

## Overview
The `.vml` file defines **variant selections** from a feature model. It is **AUTO-GENERATED** from `.fml` files and should never be created manually.

## ⚠️ IMPORTANT: AUTO-GENERATED FILE
**DO NOT CREATE MANUALLY!**  
Use the command: **Right-click `.fml` file → "Create .vml template"**

## File Structure Rules
- **ONE** `hdef variantset` statement per file
- **MULTIPLE** `.vml` files per folder allowed
- **NO** `def` statements - only `extends ref feature` relations
- Must `use featureset` at the top
- Auto-generated with selection states

## Valid Keywords
```
use, hdef, variantset, name, description, owner, tags, level, status, ref,
extends, mandatory, optional, or, alternative, selected, inherits
```

## Syntax Structure
```
use featureset [featureset-ref]

hdef variantset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...

  extends ref feature [feature-ref] [mandatory|optional|or|alternative] [selected]
    extends ref feature [sub-feature] [mandatory|optional|or|alternative] [selected]
      # Hierarchical extension structure mirrors .fml
      
### Selection States:
 - Add 'selected' keyword to include feature in variant
 - Omit 'selected' to exclude feature from variant

### Constraint Rules:
 - mandatory features: MUST be selected
 - optional features: MAY be selected
 - or features: AT LEAST ONE sibling must be selected
 - alternative features: EXACTLY ONE sibling must be selected
```


## Complete Example

```sylang
use featureset AutonomousVehicleFeatures

hdef variantset AutonomousVehicleVariants_Premium
  name """Premium Autonomous Vehicle Configuration"""
  description """
    Premium variant with full sensor suite including LiDAR and 
    advanced HMI features for luxury autonomous vehicles.
    """
  owner """Product Line Engineering"""
  tags """variants""", """premium""", """full-sensor""", """L3-automation"""

  extends ref feature CoreAutonomousFeatures mandatory selected
    extends ref feature PerceptionSystem mandatory selected
      extends ref feature CameraSystem mandatory selected
      extends ref feature LidarSystem optional selected
      extends ref feature RadarSystem mandatory selected
    extends ref feature PlanningSystem mandatory selected  
      extends ref feature GlobalPlanning mandatory selected
      extends ref feature LocalPlanning mandatory selected
    extends ref feature ControlSystem mandatory selected
      extends ref feature SteeringControl mandatory selected
      extends ref feature BrakeControl mandatory selected
      extends ref feature ThrottleControl mandatory selected
      
  extends ref feature SafetyMonitoring mandatory selected
    extends ref feature SystemHealthMonitoring mandatory selected
    extends ref feature FallbackSystem mandatory selected
    extends ref feature RedundantSensors optional selected
    
  extends ref feature HumanMachineInterface optional selected
    extends ref feature TakeoverRequest or selected
    extends ref feature StatusDisplay or
    extends ref feature VoiceInterface or
```

## Variant Examples

### Basic Variant (Minimal Configuration)
```sylang
use featureset AutonomousVehicleFeatures

hdef variantset AutonomousVehicleVariants_Basic
  name """Basic Autonomous Vehicle Configuration"""
  description """Entry-level autonomous configuration with essential sensors"""
  owner """Product Engineering"""
  tags """basic""", """entry-level""", """cost-optimized"""

  extends ref feature CoreAutonomousFeatures mandatory selected
    extends ref feature PerceptionSystem mandatory selected
      extends ref feature CameraSystem mandatory selected
      extends ref feature LidarSystem optional  # NOT selected
      extends ref feature RadarSystem mandatory selected
```

### Sport Variant
```sylang
use featureset VehicleFeatures

hdef variantset SportVariant
  name """Sport Performance Variant"""
  description """Performance-oriented configuration"""
  
  extends ref feature PowertrainType mandatory selected
    extends ref feature ElectricPowertrain alternative selected
    extends ref feature HybridPowertrain alternative  # NOT selected
    
  extends ref feature PerformanceFeatures optional selected
    extends ref feature SportSuspension optional selected
    extends ref feature PerformanceBrakes optional selected
```

## Selection Constraint Rules

### Mandatory Features
```sylang
extends ref feature CoreSafety mandatory selected
# Mandatory features MUST be selected
```

### Optional Features
```sylang
extends ref feature LuxuryPackage optional selected     # Can be selected
extends ref feature TrailerPackage optional             # Can be omitted
```

### OR Features (At Least One)
```sylang
extends ref feature DisplayOptions optional selected
  extends ref feature Display7Inch or selected          # Selected
  extends ref feature Display10Inch or                  # Not selected
  extends ref feature Display12Inch or                  # Not selected
# At least one OR sibling must be selected
```

### Alternative Features (Exactly One)
```sylang
extends ref feature TransmissionType mandatory selected
  extends ref feature ManualTransmission alternative    # Not selected
  extends ref feature AutomaticTransmission alternative selected
  extends ref feature CVTTransmission alternative       # Not selected
# Exactly one ALTERNATIVE sibling must be selected
```

## Validation Rules
✅ Must be generated from `.fml` file  
✅ Exactly one `hdef variantset` per file  
✅ Multiple `.vml` files allowed per folder  
✅ Must include `use featureset` statement  
✅ Must use `extends ref feature` pattern  
✅ Must respect mandatory/optional/or/alternative constraints  
✅ OR features: At least one sibling must be `selected`  
✅ ALTERNATIVE features: Exactly one sibling must be `selected`  
❌ DO NOT create manually - use "Create .vml template" command  
❌ Cannot use `when ref config` (not allowed in .vml)  
❌ No `def` statements allowed

## Generation Workflow

### Step 1: Create Feature Model
```sylang
# ProductFeatures.fml
use productline MyProductLine

hdef featureset ProductFeatures
  def feature CoreFeatures mandatory
    def feature Feature1 mandatory
    def feature Feature2 optional
```

### Step 2: Generate VML
**Right-click `ProductFeatures.fml` → "Create .vml template"**

Result:
```sylang
# ProductFeatures.vml (auto-generated)
use featureset ProductFeatures

hdef variantset ProductFeaturesVariants
  extends ref feature CoreFeatures mandatory selected
    extends ref feature Feature1 mandatory selected
    extends ref feature Feature2 optional selected
```

### Step 3: Customize Selections
Edit the `.vml` file to create your specific variant by adding/removing `selected`:
```sylang
extends ref feature Feature2 optional  # Remove 'selected' to exclude
```

### Step 4: Generate Configuration
**Right-click `.vml` → "Generate variant config (.vcf)"** to create configuration file

## File Organization
```
ProductLine/
├── Features/
│   ├── ProductFeatures.fml           # Source feature model
│   ├── ProductFeatures_Premium.vml   # Premium variant
│   ├── ProductFeatures_Basic.vml     # Basic variant
│   └── ProductFeatures_Sport.vml     # Sport variant
```

## Common Patterns

### Regional Variants
```sylang
# EuropeVariant.vml
hdef variantset EuropeVariant
  extends ref feature EuropeanCompliance mandatory selected
  extends ref feature GDPRFeatures mandatory selected
```

```sylang
# NorthAmericaVariant.vml
hdef variantset NorthAmericaVariant
  extends ref feature FMVSSCompliance mandatory selected
  extends ref feature SAEStandards mandatory selected
```

### Market Segment Variants
```sylang
# LuxuryVariant.vml
hdef variantset LuxuryVariant
  extends ref feature PremiumFeatures optional selected
  extends ref feature AdvancedSafety optional selected
```

```sylang
# EconomyVariant.vml
hdef variantset EconomyVariant
  extends ref feature BasicFeatures mandatory selected
  extends ref feature PremiumFeatures optional  # NOT selected
```

## Error Prevention

### ❌ DO NOT DO THIS
```text
# WRONG - Creating .vml manually
hdef variantset MyVariant
  def feature SomeFeature  # ❌ No def statements!
```

### ✅ CORRECT APPROACH
1. Create `.fml` file with features
2. Right-click `.fml` → "Create .vml template"
3. Edit generated `.vml` to adjust selections
4. Right-click `.vml` → "Generate variant config (.vcf)"

---

**Next Steps**: After generating and customizing your `.vml` file, generate the `.vcf` configuration file.

---

# Variant Configuration (.vcf)

## Overview
The `.vcf` file contains **configuration values** (0 or 1) for each feature in a variant. It is **AUTO-GENERATED** from `.vml` files and should never be created manually.

## ⚠️ IMPORTANT: AUTO-GENERATED FILE
**DO NOT CREATE MANUALLY!**  
Use the command: **Right-click `.vml` file → "Generate variant config (.vcf)"**

## File Structure Rules
- **ONE** `hdef configset` statement per file
- **ONE** `.vcf` file per folder (strict limitation)
- **MULTIPLE** `def config` statements
- Must `use featureset` AND `use variantset` at the top
- Each config uses `basedon ref feature` for traceability

## Valid Keywords
```
use, hdef, configset, generatedfrom, generatedat, name, description, owner,
tags, status, def, config, basedon, inherits
```

## Syntax Structure
```
use featureset [featureset-ref]
use variantset [variantset-ref]

hdef configset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  generatedfrom ref variantset [variantset-ref]
  generatedat [ISO-8601-timestamp]
  tags [string-literal], [string-literal], ...

  def config [config-identifier] [0|1]
    basedon ref feature [feature-ref]
    
  def config [config-identifier] [0|1]
    basedon ref feature [feature-ref]
```

## Config Values
- `1` - Feature is **enabled** (selected in variant)
- `0` - Feature is **disabled** (not selected, will be grayed out)

## Complete Example

```sylang
use featureset AutonomousVehicleFeatures
use variantset AutonomousVehicleVariants_Premium

hdef configset AutonomousVehicleConfig_Premium
  name """Premium Autonomous Vehicle Configuration"""
  description """
    Auto-generated configuration for premium autonomous vehicle variant 
    with full sensor suite and advanced HMI features.
    """
  owner """Product Engineering"""
  generatedfrom ref variantset AutonomousVehicleVariants_Premium
  generatedat """2025-10-01T17:30:45.123Z"""
  tags """variant""", """config""", """auto-generated""", """premium"""

  def config c_CoreAutonomousFeatures 1
    basedon ref feature CoreAutonomousFeatures
    
  def config c_PerceptionSystem 1
    basedon ref feature PerceptionSystem
    
  def config c_CameraSystem 1
    basedon ref feature CameraSystem
    
  def config c_LidarSystem 1
    basedon ref feature LidarSystem
    
  def config c_RadarSystem 1
    basedon ref feature RadarSystem
    
  def config c_PlanningSystem 1
    basedon ref feature PlanningSystem
    
  def config c_GlobalPlanning 1
    basedon ref feature GlobalPlanning
    
  def config c_LocalPlanning 1
    basedon ref feature LocalPlanning
    
  def config c_HumanMachineInterface 1
    basedon ref feature HumanMachineInterface
    
  def config c_TakeoverRequest 1
    basedon ref feature TakeoverRequest
    
  def config c_StatusDisplay 0
    basedon ref feature StatusDisplay
    
  def config c_VoiceInterface 0
    basedon ref feature VoiceInterface
```

## Config Naming Convention
Use prefix `c_` followed by feature name:
```
c_FeatureName
```

Examples:
- `c_CameraSystem`
- `c_LidarSystem` 
- `c_AutomaticEmergencyBraking`

## Config-Based Graying

Configs control visibility in diagrams and documentation:

### In Function Files (.fun)
```sylang
def function AdvancedNavigation
  when ref config c_PremiumNavigation
  # Function is grayed out if config = 0
```

### In Block Files (.blk)
```sylang
def operation LidarProcessing
  when ref config c_LidarSystem
  # Operation is grayed out if config = 0
```

### In Requirement Files (.req)
```sylang
def requirement REQ_LIDAR_001
  when ref config c_LidarSystem
  # Requirement is grayed out if config = 0
```

## Configuration Examples

### Basic Configuration (Minimal Features)
```sylang
use featureset VehicleFeatures
use variantset BasicVariant

hdef configset BasicVehicleConfig
  name """Basic Vehicle Configuration"""
  generatedfrom ref variantset BasicVariant
  generatedat """2025-10-01T10:00:00.000Z"""

  def config c_CoreFeatures 1
    basedon ref feature CoreFeatures
    
  def config c_BasicSafety 1
    basedon ref feature BasicSafety
    
  def config c_PremiumFeatures 0    # Disabled
    basedon ref feature PremiumFeatures
    
  def config c_LuxuryPackage 0      # Disabled
    basedon ref feature LuxuryPackage
```

### Premium Configuration (All Features)
```sylang
use featureset VehicleFeatures
use variantset PremiumVariant

hdef configset PremiumVehicleConfig
  name """Premium Vehicle Configuration"""
  
  def config c_CoreFeatures 1
    basedon ref feature CoreFeatures
    
  def config c_PremiumFeatures 1    # Enabled
    basedon ref feature PremiumFeatures
    
  def config c_LuxuryPackage 1      # Enabled
    basedon ref feature LuxuryPackage
    
  def config c_AdvancedSafety 1     # Enabled
    basedon ref feature AdvancedSafety
```

## Validation Rules
✅ Must be generated from `.vml` file  
✅ Exactly one `hdef configset` per file  
✅ Only ONE `.vcf` file per folder  
✅ Must include both `use featureset` AND `use variantset`  
✅ Config values must be `0` or `1`  
✅ Each config must have `basedon ref feature`  
✅ Has a config for every feature in the `.vml` (the generator writes them; regenerate after changing the `.vml`)  
✅ The validator checks configs against the source `.vml`  
❌ DO NOT create manually - use "Generate variant config (.vcf)" command  
❌ Cannot add configs not derived from `.fml` → `.vml` pipeline  
❌ Cannot have multiple `.vcf` files in same folder

## Why configs are written this way

### 1. Clear Traceability
```sylang
def config c_Feature 1
  basedon ref feature Feature  # Explicit link to source feature
```

### 2. IDE Navigation Support
- Click on `Feature` → Go to definition in `.fml`
- Hover → See feature documentation

### 3. Simplified Naming
Old (hierarchical):
```sylang
def config c_Parent_Child_GrandChild 1  # Complex naming
```

New (flat with traceability):
```sylang
def config c_GrandChild 1               # Simple naming
  basedon ref feature GrandChild        # Explicit reference
```

### 4. Validation Prevention
The `use variantset` reference enables validation:
- Prevents unauthorized config additions
- Ensures all configs trace back to `.fml` → `.vml` pipeline
- The validator checks that each config comes from the variant model

## Generation Workflow

### Step 1: Feature Model
```sylang
# Features.fml
def feature CoreFeatures mandatory
  def feature Feature1 mandatory
  def feature Feature2 optional
```

### Step 2: Generate Variant
**Right-click `.fml` → "Create .vml template"**
```sylang
# Features.vml
extends ref feature CoreFeatures mandatory selected
  extends ref feature Feature1 mandatory selected
  extends ref feature Feature2 optional  # NOT selected
```

### Step 3: Generate Configuration
**Right-click `.vml` → "Generate variant config (.vcf)"**
```sylang
# Features.vcf (auto-generated)
use featureset Features
use variantset FeaturesVariants

hdef configset FeaturesConfig
  generatedfrom ref variantset FeaturesVariants
  
  def config c_CoreFeatures 1
    basedon ref feature CoreFeatures
  def config c_Feature1 1
    basedon ref feature Feature1
  def config c_Feature2 0          # Value 0 (not selected)
    basedon ref feature Feature2
```

## File Organization
```
ProductLine/
├── Features/
│   ├── Features.fml                    # Source
│   ├── Features_Premium.vml            # Variant
│   ├── Features_Premium.vcf            # ONE config per folder
│   └── Features_Basic.vml              # Another variant
└── RegionFeatures/
    ├── RegionFeatures.fml
    ├── RegionFeatures_EU.vml
    └── RegionFeatures_EU.vcf           # ONE config per folder
```

## Common Patterns

### Safety-Critical Configuration
```sylang
def config c_SafetyFeatures 1           # Always enabled
  basedon ref feature SafetyFeatures
  
def config c_ASIL_D_Functions 1         # Safety critical
  basedon ref feature ASIL_D_Functions
  
def config c_RedundantSensors 1         # Safety redundancy
  basedon ref feature RedundantSensors
```

### Optional Add-ons
```sylang
def config c_ComfortFeatures 1          # Enabled
  basedon ref feature ComfortFeatures
  
def config c_HeatedSeats 1              # Enabled
  basedon ref feature HeatedSeats
  
def config c_MassageSeats 0             # Disabled
  basedon ref feature MassageSeats
```

## Error Prevention

### ❌ WRONG - Manual Creation
```sylang
# DON'T DO THIS
hdef configset ManualConfig
  def config c_RandomFeature 1  # ❌ No basedon ref!
```

### ❌ WRONG - Missing variantset
```sylang
# DON'T DO THIS
use featureset Features
# ❌ Missing: use variantset FeaturesVariants

hdef configset Config
  # ...
```

### ✅ CORRECT - Generated with Complete References
```sylang
use featureset Features
use variantset FeaturesVariants          # ✅ Both use statements

hdef configset FeaturesConfig
  generatedfrom ref variantset FeaturesVariants
  
  def config c_Feature 1                 # ✅ With basedon
    basedon ref feature Feature
```

---

**Next Steps**: Use the generated `.vcf` file with `when ref config` statements in `.fun`, `.blk`, `.req`, and other files to control feature visibility.

---

# Block Definition (.blk)

## Overview
The `.blk` file defines **hardware/software blocks** with their product characteristics. It represents architectural elements in your system design with AIAG VDA-compliant characteristics.

## File Structure Rules
- **ONE** `hdef block` statement per file
- **MULTIPLE** `def characteristic` statements (AIAG VDA product characteristics)
- Can `use` configsets, featuresets, functionsets, interfacesets
- Supports `needs` for input interface references at hdef level
- Supports `provides` for output interface references at hdef level
- Block relationships defined at hdef level
- **NOTE**: Operations, signals, parameters, and datatypes are defined in `.ifc` files, not in `.blk` files

## Valid Keywords
```
use, hdef, block, name, description, designrationale, owner, tags, level,
safetylevel, blocktype, status, modelfile, mass, volume, centerofmass,
materialname, density, youngsmodulus, poissonratio, yieldstrength,
ultimatestrength, def, characteristic, chartype, unit, nominalvalue,
upperlimit, lowerlimit, tolerance, controlmethod, measuringequipment,
samplingplan, inspectionfrequency, documentreference, value, decomposedfrom,
decomposesto, implements, enables, derivedfrom, implementedby, needs,
provides, requires, meets, verifiedby, ref, config, when, attach,
analysiseffort, deveffort, testeffort
```

## Syntax Structure
```
use configset [configset-ref]
use featureset [featureset-ref]
use functionset [functionset-ref]
use interfaceset [interfaceset-ref]

hdef block [identifier]
  name [string-literal]
  description [string-literal]
  designrationale [string-literal]
  owner [string-literal]
  level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM|SIL-1|SIL-2|SIL-3|SIL-4]
  tags [string-literal], [string-literal], ...
  blocktype [object|objectelement|buildingblock|component|part]
  
  # Input interfaces (NEEDS - at hdef level)
  needs ref operation [operation-ref], [operation-ref], ...
  needs ref signal [signal-ref], [signal-ref], ...
  
  # Output interfaces (PROVIDES - at hdef level)
  provides ref operation [operation-ref], [operation-ref], ...
  provides ref signal [signal-ref], [signal-ref], ...
  
  # Block relationships (at hdef level)
  decomposedfrom ref block [block-ref]
  decomposesto ref block [block-ref], [block-ref], ...
  implements ref function [function-ref], [function-ref], ...
  enables ref feature [feature-ref], [feature-ref], ...
  derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
  implementedby ref requirement [requirement-ref], [requirement-ref], ...
  when ref config [config-ref]

  # Product Characteristics (AIAG VDA) - ONLY def statements allowed
  def characteristic [identifier]
    name [string-literal]
    description [string-literal]
    chartype [special|critical|significant]
    unit [string-literal]
    nominalvalue [numeric-value]
    upperlimit [numeric-value]
    lowerlimit [numeric-value]
    tolerance [numeric-value]
    controlmethod [string-literal]
    measuringequipment [string-literal]
    samplingplan [string-literal]
    inspectionfrequency [string-literal]
    documentreference [string-literal]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    meets ref requirement [requirement-ref]
    verifiedby ref testcase [testcase-ref]
```

## Complete Example

```sylang
use configset AutonomousVehicleConfig
use featureset AutonomousVehicleFeatures
use functionset PerceptionProcessingFunctions
use interfaceset PerceptionInterfaces

hdef block AdvancedPerceptionControlModule
  name """Advanced Perception Control Module"""
  description """
    Comprehensive perception processing unit for Level 4 autonomous vehicle 
    environmental awareness. Handles multi-sensor data fusion, object detection, 
    tracking, prediction, and environmental model generation.
    """
  designrationale """
    Centralized perception architecture enables optimal sensor fusion and 
    reduces computational redundancy. Hardware-software co-design approach 
    ensures deterministic real-time performance for safety-critical operations.
    """
  owner """Advanced Perception Engineering Team"""
  level module
  safetylevel ASIL-D
  blocktype component
  tags """perception""", """sensor-fusion""", """AI-processing""", """safety-critical"""
  
  # Input interfaces (NEEDS - what this block requires)
  needs ref operation CameraRawData, LidarPointCloud, RadarTargets
  needs ref operation CalibrationParameters, SystemConfiguration
  needs ref signal SystemClockSignal, PowerSupplyStatus
  needs ref signal CalibrationStatus, SystemHeartbeat
  
  # Output interfaces (PROVIDES - what this block offers)
  provides ref operation EnvironmentalModel, ObjectTrackingData, HazardDetection
  provides ref signal ProcessingHeartbeat, SensorHealthStatus
  
  # Block relationships (ASPICE bilateral traceability)
  decomposesto ref block CameraProcessingSubmodule, LidarProcessingSubmodule
  decomposesto ref block FusionProcessingSubmodule, AIInferenceSubmodule
  implements ref function PerceptionProcessing, ObjectDetection
  enables ref feature PerceptionSystem, ObjectDetection
  derivedfrom ref requirement SYS_REQ_001, SYS_REQ_002
  implementedby ref requirement SW_REQ_100, SW_REQ_101
  when ref config c_CoreAutonomousFeatures_PerceptionSystem_L4

  # Product Characteristics (AIAG VDA)
  def characteristic ProcessingLatency
    name """Perception Processing Cycle Latency"""
    description """Maximum time between sensor data input and environmental model output"""
    chartype critical
    unit """milliseconds"""
    nominalvalue 50.0
    upperlimit 75.0
    lowerlimit 30.0
    tolerance 5.0
    controlmethod """Real-time performance monitoring with cycle time measurement"""
    measuringequipment """Oscilloscope with timing analysis software"""
    samplingplan """100% continuous monitoring during operation"""
    inspectionfrequency """Every processing cycle"""
    documentreference """PERC-SPEC-001-v2.3"""
    derivedfrom ref requirement PERF_REQ_010
    implementedby ref requirement SW_REQ_150
    derivedfrom ref requirement PERF_REQ_010
    verifiedby ref testcase TEST_PERF_001
    
  def characteristic DetectionAccuracy
    name """Object Detection Accuracy Rate"""
    description """Percentage of correctly detected and classified objects"""
    chartype critical
    unit """percent"""
    nominalvalue 99.5
    upperlimit 100.0
    lowerlimit 98.0
    tolerance 0.5
    controlmethod """Statistical validation with test datasets"""
    measuringequipment """ML model validation framework"""
    samplingplan """10,000 test scenarios per validation cycle"""
    inspectionfrequency """Monthly validation runs"""
    documentreference """PERC-VALIDATION-001-v1.5"""
    derivedfrom ref requirement SAFETY_REQ_020
    derivedfrom ref requirement SAFETY_REQ_020
    verifiedby ref testcase TEST_DETECTION_001
    
  def characteristic PowerConsumption
    name """Module Power Consumption"""
    description """Electrical power consumption under typical operating conditions"""
    chartype significant
    unit """watts"""
    nominalvalue 45.0
    upperlimit 60.0
    lowerlimit 30.0
    tolerance 5.0
    controlmethod """Power monitoring during HIL testing"""
    measuringequipment """Precision power analyzer"""
    samplingplan """Sample 5 units per production batch"""
    inspectionfrequency """Per batch during production"""
    documentreference """HW-POWER-SPEC-001"""
    derivedfrom ref requirement HW_REQ_030
    
  def characteristic OperatingTemperature
    name """Module Operating Temperature Range"""
    description """Ambient temperature range for normal operation"""
    chartype special
    unit """celsius"""
    nominalvalue 25.0
    upperlimit 85.0
    lowerlimit -40.0
    tolerance 5.0
    controlmethod """Environmental chamber testing"""
    measuringequipment """Calibrated thermocouples"""
    samplingplan """Temperature cycling test for qualification"""
    inspectionfrequency """Design validation and qualification testing"""
    documentreference """ENV-TEST-SPEC-001"""
    derivedfrom ref requirement ENV_REQ_001
```

## Interface Patterns

### NEEDS (Inputs) - At hdef Level
```sylang
hdef block MyBlock
  # What this block needs from others (defined in .ifc files)
  needs ref operation InputOperation1, InputOperation2
  needs ref signal InputSignal1, InputSignal2, InputSignal3
  
  # Optional: Control port placement with left/right keywords
  needs ref operation ActuatorFeedbackOutput right
  needs ref signal VehicleSpeedOutput right, SlopeAngleOutput right
  # Default: needs → left side. Use 'right' keyword to place on right side.
```

### PROVIDES (Outputs) - At hdef Level
```sylang
hdef block MyBlock
  # What this block provides to others (defined in .ifc files)
  provides ref operation OutputOperation1, OutputOperation2
  provides ref signal OutputSignal1, OutputSignal2
  
  # Optional: Control port placement with left/right keywords
  provides ref operation ProcessedVehicleState left, ProcessedDriverCommand
  # Default: provides → right side. Use 'left' keyword to place on left side.
```

**Note**: Operations and signals are defined in `.ifc` files and only *referenced* in `.blk` files via `needs` and `provides`.

### Port Side Placement Control
You can control where ports appear on decomposition diagrams using `left` or `right` keywords:
- **Default behavior**: `needs` → left side, `provides` → right side
- **Override**: Add `left` or `right` keyword after interface name to override default placement
- **Syntax**: `needs ref signal XXXX right, YYYY` or `provides ref operation IIII left`
- **Use cases**: Useful for organizing ports on specific sides for better diagram clarity

## Block Relationships (ASPICE Bilateral Traceability)

### Bottom-Up Composition (decomposedfrom)
```sylang
hdef block ChildBlock
  decomposedfrom ref block ParentBlock
  # Single block only - this block is part of ParentBlock
```

### Top-Down Decomposition (decomposesto)
```sylang
hdef block SystemBlock
  decomposesto ref block SubsystemBlock1, SubsystemBlock2, SubsystemBlock3
  # Multiple blocks allowed - this block decomposes into subsystems
```

### Function Implementation (implements)
```sylang
hdef block ControlModule
  implements ref function SpeedControl, BrakeControl, SteeringControl
  # This block implements these functions
```

### Feature Enablement (enables)
```sylang
hdef block VisionProcessingBlock
  enables ref feature CameraSystem, ObjectDetection
  # This block enables these features
```

### Requirement Traceability (derivedfrom, implementedby)
```sylang
hdef block SafetyController
  derivedfrom ref requirement SYS_REQ_001, SYS_REQ_002
  implementedby ref requirement SW_REQ_100, SW_REQ_101
  # ASPICE bilateral traceability to requirements
```

## Level Hierarchy
```
level product          # Product level
level system           # System level
level subsystem        # Subsystem level
level component        # Component level
level subcomponent     # Subcomponent level
level module           # Module level
level submodule        # Submodule level
level part             # Part level
level subpart          # Subpart level
```

## Common Patterns

### ECU/Controller Block with Characteristics
```sylang
hdef block VehicleControllerECU
  level component
  safetylevel ASIL-D
  blocktype component
  
  needs ref operation VehicleStateData
  needs ref signal SensorInputs
  provides ref operation ControlCommands
  
  decomposesto ref block ProcessorModule, MemoryModule, CommunicationModule
  
  def characteristic ProcessingPower
    name """ECU Processing Power"""
    chartype critical
    unit """MIPS"""
    nominalvalue 2000.0
    upperlimit 2500.0
    lowerlimit 1500.0
```

### Sensor Block with Quality Characteristics
```sylang
hdef block RadarSensor
  level part
  safetylevel ASIL-C
  blocktype component
  
  needs ref operation CalibrationData
  needs ref signal PowerSupply
  provides ref signal RadarTargets
  
  def characteristic DetectionRange
    name """Maximum Detection Range"""
    chartype critical
    unit """meters"""
    nominalvalue 200.0
    upperlimit 250.0
    lowerlimit 150.0
```

### Processing Module with Performance Characteristics
```sylang
hdef block SignalProcessingModule
  level module
  safetylevel ASIL-B
  blocktype component
  
  needs ref signal RawSensorData
  provides ref operation ProcessedData
  
  def characteristic CycleTime
    name """Processing Cycle Time"""
    chartype critical
    unit """milliseconds"""
    nominalvalue 10.0
    upperlimit 15.0
    lowerlimit 5.0
```

## Validation Rules
✅ Exactly one `hdef block` per file  
✅ Multiple `def characteristic` allowed (AIAG VDA)  
✅ `needs` at hdef level for input interfaces  
✅ `provides` at hdef level for output interfaces  
✅ Can use `when ref config` for conditional visibility  
✅ Multiline strings use `"""` triple quotes  
✅ Operations/signals defined in `.ifc` files, referenced here  
❌ NO `def operation/signal/parameter/datatype` in `.blk` files  
❌ Input interfaces via `needs`, not `def`  
❌ Output interfaces via `provides`, not `def`

---

**Next Steps**: 
- Define operations, signals, parameters, and datatypes in `.ifc` files
- Define functions in `.fun` files
- Define requirements in `.req` files

---

# Function Definition (.fun)

## Overview
Defines **functional behavior** and decomposition. Maps features to executable functions with conditional visibility based on configurations.

## File Structure
- **ONE** `hdef functionset` per file
- **MULTIPLE** `def function` statements
- Can `use` featuresets, configsets, interfacesets
- Supports `needs` for input interface references at def function level
- Supports `provides` for output interface references at def function level
- Supports functional decomposition

## Valid Keywords
```
use, hdef, functionset, name, description, owner, tags, level, safetylevel,
functiontype, status, def, function, enables, decomposesto, decomposedfrom,
needs, provides, requires, meets, derivedfrom, implementedby, detects,
allocatedto, ref, config, when, attach, analysiseffort, deveffort,
testeffort
```

## Syntax Structure
```
use featureset [featureset-ref]
use configset [configset-ref]
use interfaceset [interfaceset-ref]

hdef functionset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM|SIL-1|SIL-2|SIL-3|SIL-4]
  level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]

  def function [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    functiontype [solution|function|solutionelement]
    
    # Input interfaces (NEEDS - from .ifc files)
    needs ref operation [operation-ref], [operation-ref], ...
    needs ref signal [signal-ref], [signal-ref], ...
    
    # Output interfaces (PROVIDES - from .ifc files)
    provides ref operation [operation-ref], [operation-ref], ...
    provides ref signal [signal-ref], [signal-ref], ...
    
    # Function relationships
    enables ref feature [feature-ref], [feature-ref], ...
    allocatedto ref block [block-ref]
    decomposedfrom ref function [function-ref]
    decomposesto ref function [function-ref], [function-ref], ...
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    detects ref malfunction [malfunction-ref], [malfunction-ref], ...
    detects ref failure [failure-ref], [failure-ref], ...
    meets ref requirement [requirement-ref]
    when ref config [config-ref]
```

## Complete Example
```sylang
use featureset AutonomousVehicleFeatures
use configset AutonomousVehicleConfig
use interfaceset PerceptionInterfaces

hdef functionset AutonomousPerceptionFunctions
  name """Autonomous Vehicle Perception Functions"""
  description """Core perception functions for environmental awareness"""
  owner """Perception Systems Team"""
  safetylevel ASIL-D
  tags """perception""", """autonomous""", """sensor-fusion"""

  def function CameraImageProcessing
    name """Camera Image Processing Function"""
    description """Real-time processing of stereo and mono camera feeds"""
    owner """Computer Vision Team"""
    level subsystem
    safetylevel ASIL-D
    functiontype function
    
    # Input interfaces (from .ifc)
    needs ref operation CameraRawData, CalibrationParameters
    needs ref signal SystemClockSignal
    
    # Output interfaces (from .ifc)
    provides ref operation ProcessedImageData
    provides ref signal ImageProcessingStatus
    
    # Function relationships
    enables ref feature CameraSystem
    allocatedto ref block VisionProcessingModule
    derivedfrom ref requirement SYS_REQ_010, SYS_REQ_011
    implementedby ref requirement SW_REQ_200, SW_REQ_201
    detects ref malfunction CameraMalfunction
    when ref config c_CameraSystem

  def function LidarPointCloudProcessing
    name """LiDAR Point Cloud Processing Function"""
    description """3D point cloud processing for precise distance measurement"""
    owner """LiDAR Processing Team"""
    level subsystem
    safetylevel ASIL-C
    functiontype function
    
    # Input interfaces
    needs ref operation LidarPointCloud, CalibrationData
    needs ref signal SystemHeartbeat
    
    # Output interfaces
    provides ref operation ProcessedPointCloud
    provides ref signal LidarProcessingStatus
    
    enables ref feature LidarSystem
    allocatedto ref block LidarProcessingModule
    derivedfrom ref requirement SYS_REQ_015
    implementedby ref requirement SW_REQ_210
    detects ref malfunction LidarMalfunction
    safetylevel ASIL-C
    when ref config c_LidarSystem

  def function SensorFusion
    name """Multi-Sensor Fusion Function"""
    description """Fusion of camera, LiDAR, and radar data"""
    owner """Sensor Fusion Team"""
    level system
    safetylevel ASIL-D
    functiontype solution
    
    # Input interfaces
    needs ref operation ProcessedImageData, ProcessedPointCloud, RadarTargets
    needs ref signal ImageProcessingStatus, LidarProcessingStatus
    
    # Output interfaces
    provides ref operation EnvironmentalModel, ObjectTrackingData
    provides ref signal FusionStatus
    
    enables ref feature PerceptionSystem
    allocatedto ref block FusionControlModule
    decomposesto ref function CameraImageProcessing, LidarPointCloudProcessing
    derivedfrom ref requirement SYS_REQ_001, SYS_REQ_002
    implementedby ref requirement SW_REQ_100, SW_REQ_101
    detects ref malfunction CameraMalfunction, LidarMalfunction
    detects ref failure SensorDataLoss
    derivedfrom ref requirement SAFETY_REQ_001
    safetylevel ASIL-D
```

## Function Types
```
functiontype solution         # Solution-level function
functiontype function         # Standard function
functiontype solutionelement  # Solution element function
```

## Interface Relationships
- `needs ref operation` - Input operations required (from .ifc files, multiple allowed)
- `needs ref signal` - Input signals required (from .ifc files, multiple allowed)
- `provides ref operation` - Output operations provided (from .ifc files, multiple allowed)
- `provides ref signal` - Output signals provided (from .ifc files, multiple allowed)

**Note**: Operations and signals are defined in `.ifc` files and referenced here via `needs` and `provides`.

### Port Side Placement Control
You can control port placement in decomposition diagrams using `left` or `right` keywords:
- **Default**: `needs` → left side, `provides` → right side
- **Override**: Add `left` or `right` after interface name (e.g., `needs ref signal XXXX right`)
- **Example**: 
  ```sylang
  needs ref operation VehicleStateOutput, DriverEPBCommandInput
  needs ref operation ActuatorFeedbackOutput right
  needs ref signal VehicleSpeedOutput right, SlopeAngleOutput right
  provides ref operation ProcessedVehicleState left, ProcessedDriverCommand
  ```

## Function Relationships (ASPICE Bilateral Traceability)
- `enables ref feature` - Enables a feature (multiple allowed)
- `allocatedto ref block` - Allocated to a block (single block only)
- `decomposedfrom ref function` - Decomposes from parent function (single only)
- `decomposesto ref function` - Decomposes to child functions (multiple allowed)
- `derivedfrom ref requirement` - Derived from requirements (ASPICE, multiple allowed)
- `implementedby ref requirement` - Implemented by requirements (ASPICE, multiple allowed)
- `detects ref malfunction` - Detects safety malfunctions (multiple allowed)
- `detects ref failure` - Detects failure modes (multiple allowed)
- `meets ref characteristic` - Meets product characteristics or safety goals (multiple allowed)
- `when ref config` - Conditional visibility

## Validation Rules
✅ Exactly one `hdef functionset` per file  
✅ Multiple `def function` allowed  
✅ `needs` and `provides` reference operations/signals from `.ifc` files  
✅ Can use `when ref config` for conditional visibility  
✅ Multiline strings use `"""` triple quotes  
✅ Functions can be hierarchically decomposed  
❌ No `def operation/signal` in `.fun` files (define in `.ifc`)

---

**Next Steps**:
- Define operations and signals in `.ifc` files
- Define features in `.fml` files
- Define blocks in `.blk` files
- Define requirements in `.req` files

---

# Interface Definition (.ifc)

## Overview
The `.ifc` file defines **interface specifications** including operations, signals, datatypes, and parameters. These interfaces are referenced by blocks, functions, and features to define system interactions.

## File Structure Rules
- **ONE** `hdef interfaceset` statement per file
- **MULTIPLE** `def operation`, `def signal`, `def datatype`, `def parameter` statements
- Can `use` configsets for conditional visibility
- Interfaces are referenced by blocks via `needs`/`provides` relations

## Valid Keywords
```
use, hdef, interfaceset, name, description, owner, tags, value, unit,
safetylevel, level, def, operation, signal, datatype, parameter,
decomposedfrom, decomposesto, allocatedto, derivedfrom, implementedby, when,
requires, meets, ref, config, attach, analysiseffort, deveffort, testeffort
```

## Syntax Structure
```
use configset [configset-ref]

hdef interfaceset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM|SIL-1|SIL-2|SIL-3|SIL-4]
  
  # Interface relationships (ASPICE)
  decomposedfrom ref interfaceset [interfaceset-ref]
  decomposesto ref interfaceset [interfaceset-ref], [interfaceset-ref], ...
  allocatedto ref block [block-ref]

  def operation [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    requires ref datatype [datatype-ref]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    when ref config [config-ref]
    
  def signal [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    requires ref datatype [datatype-ref]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    when ref config [config-ref]
    
  def datatype [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
    
  def parameter [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]
    requires ref datatype [datatype-ref]
    value [numeric-value]
    unit [string-literal]
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    implementedby ref requirement [requirement-ref], [requirement-ref], ...
```

## Definition Types

### When to Use Operation vs Signal

Use this table to decide between `operation` and `signal`:

| If...                                        | Use...      |
| -------------------------------------------- | ----------- |
| You *request* something or trigger an action | `operation` |
| You *observe* or *broadcast* information     | `signal`    |
| You *need return codes or acknowledgments*   | `operation` |
| You *need periodic or event updates*         | `signal`    |
| You're *mimicking RTE_Call_*                 | `operation` |
| You're *mimicking RTE_Read/Write_*           | `signal`    |

**Examples:**
- `GetSystemStatus` → **operation** (request with response)
- `SetMotorSpeed` → **operation** (command with acknowledgment)
- `SpeedUpdate` → **signal** (periodic broadcast)
- `EmergencyAlert` → **signal** (event notification)
- `ReadSensorData` → **operation** (query with return value)
- `HeartbeatPulse` → **signal** (periodic status update)

### Operations
Functions or methods provided by an interface:
```sylang
def operation GetSystemStatus
  name """Get System Status"""
  description """Retrieves current system status information"""
  owner """System Team"""
  level solution
  requires ref datatype StatusData
  safetylevel ASIL-D
```

### Signals
Events or data streams:
```sylang
def signal EmergencyAlert
  name """Emergency Alert Signal"""
  description """Signal indicating emergency condition"""
  owner """Safety Team"""
  level solution
  requires ref datatype AlertType
  safetylevel ASIL-D
```

### Datatypes
Data structure definitions:
```sylang
def datatype VehicleStateData
  name """Vehicle State Data"""
  description """Complete vehicle state information"""
  owner """Data Architecture Team"""
  level solution
```

### Parameters
Configurable values:
```sylang
def parameter MaxVelocity
  name """Maximum Velocity"""
  description """Maximum allowed velocity parameter"""
  owner """Control Team"""
  level solution
  requires ref datatype VelocityValue
  value """120.0"""
```

## Complete Example

```sylang
use configset VehicleConfig

hdef interfaceset VehicleControlInterfaces
  name """Vehicle Control Interface Definitions"""
  description """
    Comprehensive interface definitions for vehicle control system including
    operations, signals, datatypes, and parameters for autonomous operation.
    """
  owner """System Architecture Team"""
  tags """vehicle""", """control""", """interfaces""", """autonomous"""
  safetylevel ASIL-B

  def operation GetVehicleState
    name """Get Vehicle State"""
    description """Retrieves current vehicle state information including speed, position, and heading"""
    owner """Control Team"""
    level solution
    requires ref datatype VehicleStateData
    safetylevel ASIL-B
    when ref config c_VehicleControl

  def operation SetVehicleSpeed
    name """Set Vehicle Speed"""
    description """Sets target vehicle speed for autonomous control"""
    owner """Control Team"""
    level solution
    requires ref datatype SpeedValue
    safetylevel ASIL-C

  def operation GetEnvironmentData
    name """Get Environment Data"""
    description """Retrieves environmental perception data from sensors"""
    owner """Perception Team"""
    level solution
    requires ref datatype EnvironmentModelData
    safetylevel ASIL-D
    when ref config c_PerceptionSystem

  def signal VehicleSpeedUpdate
    name """Vehicle Speed Update"""
    description """Signal indicating vehicle speed has changed"""
    owner """Control Team"""
    level solution
    requires ref datatype SpeedValue
    safetylevel ASIL-C

  def signal EmergencyBrakeRequest
    name """Emergency Brake Request"""
    description """Critical signal requesting immediate emergency braking"""
    owner """Safety Team"""
    level solution
    requires ref datatype BrakeRequestData
    safetylevel ASIL-D

  def signal SystemHeartbeat
    name """System Heartbeat"""
    description """Periodic heartbeat signal for system health monitoring"""
    owner """Diagnostic Team"""
    level solution
    requires ref datatype uint32

  def datatype VehicleStateData
    name """Vehicle State Data"""
    description """Complete vehicle state information structure"""
    owner """Data Architecture Team"""
    level solution

  def datatype SpeedValue
    name """Speed Value"""
    description """Data type for vehicle speed values in km/h"""
    owner """Control Team"""
    level solution

  def datatype EnvironmentModelData
    name """Environment Model Data"""
    description """Environmental perception data structure"""
    owner """Perception Team"""
    level solution

  def datatype BrakeRequestData
    name """Brake Request Data"""
    description """Emergency brake request data structure"""
    owner """Safety Team"""
    level solution

  def parameter MaxSpeed
    name """Maximum Speed"""
    description """Maximum allowed vehicle speed parameter"""
    owner """Control Team"""
    level solution
    requires ref datatype SpeedValue
    value """120.0"""

  def parameter EmergencyBrakeThreshold
    name """Emergency Brake Threshold"""
    description """Distance threshold for emergency braking activation"""
    owner """Safety Team"""
    level solution
    requires ref datatype DistanceValue
    value """5.0"""
```

## Usage in Other Files

### In Block Files (.blk)
Blocks reference interfaces via `needs` and `provides`:
```sylang
use interfaceset VehicleControlInterfaces

hdef block ControlModule
  # Input interfaces (what this block needs)
  needs ref operation GetVehicleState
  needs ref signal VehicleSpeedUpdate
  
  # Output interfaces (what this block provides)
  provides ref operation SetVehicleSpeed
```

### In Function Files (.fun)
Functions reference interfaces via `needs` and `provides`:
```sylang
use interfaceset VehicleControlInterfaces

hdef functionset ControlFunctions
  def function SpeedController
    needs ref operation GetVehicleState
    provides ref operation SetVehicleSpeed
```

### In Feature Files (.fml)
Features reference interfaces via `needs` and `provides`:
```sylang
use interfaceset VehicleControlInterfaces

hdef featureset VehicleFeatures
  def feature AutonomousControl mandatory
    needs ref operation GetVehicleState
    needs ref operation GetEnvironmentData
    provides ref operation SetVehicleSpeed
    provides ref signal EmergencyBrakeRequest
```

## Level Hierarchy
```
level product          # Product level
level system           # System level
level subsystem        # Subsystem level
level component        # Component level
level module           # Module level
level solution         # Solution level
level solutionelement  # Solution element level
```

## Common Patterns

### Sensor Interface
```sylang
hdef interfaceset SensorInterfaces
  def operation GetSensorData
    name """Get Sensor Data"""
    requires ref datatype SensorReadingData
    
  def signal SensorFault
    name """Sensor Fault Signal"""
    requires ref datatype FaultCode
    safetylevel ASIL-D
```

### Actuator Interface
```sylang
hdef interfaceset ActuatorInterfaces
  def operation SetActuatorCommand
    name """Set Actuator Command"""
    requires ref datatype ActuatorCommandData
    safetylevel ASIL-C
    
  def signal ActuatorFeedback
    name """Actuator Feedback"""
    requires ref datatype ActuatorStatusData
```

### Diagnostic Interface
```sylang
hdef interfaceset DiagnosticInterfaces
  def operation GetDiagnosticData
    name """Get Diagnostic Data"""
    requires ref datatype DiagnosticReport
    
  def signal DiagnosticTrigger
    name """Diagnostic Trigger"""
    requires ref datatype TriggerType
    
  def parameter DiagnosticTimeout
    name """Diagnostic Timeout"""
    requires ref datatype TimeValue
    value """500"""
```

## Validation Rules
✅ Exactly one `hdef interfaceset` per file  
✅ Multiple `def operation/signal/datatype/parameter` allowed  
✅ Operations and signals can reference datatypes via `requires`  
✅ Parameters can have `value` property  
✅ Can use `when ref config` for conditional visibility  
✅ Interfaces are referenced by blocks via `needs`/`provides`  
✅ Interfaces are referenced by functions via `needs`/`provides`  
✅ Interfaces are referenced by features via `needs`/`provides`  
❌ No hierarchical definitions (flat structure only)

## Relationships

### InterfaceSet Level (hdef interfaceset)
- `decomposedfrom ref interfaceset` - Bottom-up interface composition (single only)
- `decomposesto ref interfaceset` - Top-down interface breakdown (multiple allowed)
- `allocatedto ref block` - Interface allocated to specific block (single only)

### Definition Level (def operation/signal/datatype/parameter)
- `requires ref datatype` - Links operation/signal/parameter to datatype
- `derivedfrom ref requirement` - Requirements traceability (ASPICE)
- `implementedby ref requirement` - Requirements implementation (ASPICE)
- `when ref config` - Conditional visibility based on configuration

### From other files to .ifc
- `.blk` files: `needs ref operation/signal`, `provides ref operation/signal`
- `.fun` files: `needs ref operation/signal`, `provides ref operation/signal`
- `.fml` files: `needs ref operation/signal`, `provides ref operation/signal`

## Best Practices

### 1. Organize by Subsystem
Group related interfaces in one interfaceset:
```sylang
hdef interfaceset PowerManagementInterfaces
  # All power-related operations, signals, datatypes
```

### 2. Define Datatypes First
Define datatypes before operations/signals that use them:
```sylang
def datatype VoltageValue
  # ...
  
def operation GetVoltage
  requires ref datatype VoltageValue
```

### 3. Use Consistent Naming
- Operations: Verb + Noun (GetVehicleState, SetMotorSpeed)
- Signals: Noun + Update/Alert/Status (SpeedUpdate, EmergencyAlert)
- Datatypes: Noun + Data/Value (SpeedValue, StateData)
- Parameters: Adjective + Noun (MaxSpeed, MinVoltage)

### 4. Safety-Critical Interfaces
Always specify safety level for critical interfaces:
```sylang
def operation EmergencyBrake
  safetylevel ASIL-D
```

---

**Next Steps**: Reference these interfaces in `.blk`, `.fun`, and `.fml` files using `needs`/`provides` relations.

---

# Requirement Definition (.req)

## Overview
Defines **system requirements** with complete traceability to functions, blocks, and tests. Supports hierarchical requirement refinement.

## File Structure
- **ONE** `hdef requirementset` per file
- **MULTIPLE** `def requirement` statements (hierarchical)
- Can `use` functionsets, configsets, testsets, parameters

## Valid Keywords
```
use, hdef, requirementset, name, description, owner, tags, level,
safetylevel, def, requirement, infotype, headinglevel, refinedfrom,
derivedfrom, implements, allocatedto, testedby, ref, config, when, requires,
meets, rationale, verificationcriteria, status, reqtype, attach, proposal,
object, feature, nonengineeringfeature, analysiseffort, deveffort,
testeffort
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
  name """Autonomous Vehicle Perception System Requirements"""
  description """Safety and functional requirements for perception system"""
  owner """Perception Safety Engineering Team"""
  safetylevel ASIL-D

  def requirement REQ_PERC_001
    name """Environmental Detection Performance"""
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
      name """Object Classification Accuracy"""
      description """THE system SHALL classify detected objects with ≥95% accuracy within 100ms"""
      rationale """Accurate classification enables appropriate collision avoidance responses"""
      verificationcriteria """ML model validation with annotated test datasets"""
      status approved
      reqtype functional
      safetylevel ASIL-D
      refinedfrom ref requirement REQ_PERC_001
      implements ref function ObjectClassification

  def requirement REQ_PERC_002
    name """Sensor Fusion Latency"""
    description """Fusion algorithm SHALL output environmental model within 50ms"""
    status approved
    reqtype nonfunctional
    safetylevel ASIL-D
    implements ref function SensorFusion
```

## Requirement Types
```
reqtype functional      # Functional requirement
reqtype nonfunctional   # Non-functional requirement
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

---

# Test Definition (.tst)

## Overview
Defines **validation and verification tests** with complete traceability to requirements. Supports multiple test methods (HIL, SIL, VIL, etc.).

## File Structure
- **ONE** `hdef testset` per file
- **MULTIPLE** `def testcase` statements
- Can `use` requirementsets, functionsets, parameters

## Valid Keywords
```
use, hdef, testset, name, description, owner, tags, level, safetylevel,
status, def, testcase, refinedfrom, derivedfrom, satisfies, ref, config,
when, requires, meets, expected, passcriteria, testresult, steps, method,
testlevel, setup, attach, analysiseffort, deveffort, testeffort
```

## Syntax Structure
```
use requirementset [requirementset-ref]
use functionset [functionset-ref]
use parameter [parameter-ref], [parameter-ref], ...

hdef testset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]

  def testcase [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    method [HIL|SIL|VIL|MIL|manual|automated]
    testlevel [unit|integration|system|acceptance]
    setup [string-literal]
    steps [string-literal]
    expected [string-literal]
    passcriteria [string-literal]
    testresult [pass|fail|intest|notrun|blocked]
    safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
    
    # Test relationships
    satisfies ref requirement [requirement-ref], [requirement-ref], ...
    derivedfrom ref requirement [requirement-ref], [requirement-ref], ...
    refinedfrom ref testcase [testcase-ref]
    when ref config [config-ref]
```

## Complete Example
```sylang
use requirementset AutonomousPerceptionRequirements
use functionset AutonomousPerceptionFunctions
use parameter MaxDetectionRange, ConfidenceThreshold

hdef testset PerceptionSystemValidationTests
  name """Autonomous Perception System Validation Test Suite"""
  description """Comprehensive validation tests for perception system"""
  owner """Perception Test Engineering Team"""

  def testcase TEST_PERC_001_OBJECT_DETECTION
    name """Environmental Object Detection Performance Test"""
    description """Validate object detection accuracy and range performance"""
    satisfies ref requirement REQ_PERC_001
    method HIL
    testlevel system
    setup """
      Autonomous vehicle perception system in HIL test bench with 
      radar/camera/LiDAR simulators, calibrated test objects, and 
      environmental chamber with controlled lighting and weather simulation.
      """
    steps """
      1. Initialize perception system and verify all sensors active
      2. Place calibrated test objects at distances 20m, 50m, 100m, 150m, 200m
      3. Execute detection algorithm across all sensor modalities
      4. Verify object detection at each distance with position accuracy ±10cm
      5. Record detection rates and classification confidence scores
      6. Repeat tests in simulated rain (5mm/h, 10mm/h) and fog conditions
      7. Document all failure modes and edge cases encountered
      8. Generate comprehensive test report with statistical analysis
      """
    expected """
      Objects detected with ≥99.9% accuracy at all test distances.
      Classification confidence ≥95% for all object types.
      Consistent performance across all environmental conditions.
      """
    passcriteria """
      Detection accuracy meets specification in ≥98% of test cases.
      Zero tolerance for safety-critical failures (missed pedestrians, vehicles).
      Performance degradation <5% in adverse weather conditions.
      """
    safetylevel ASIL-D
    testresult notrun
    owner """Object Detection Test Team"""

  def testcase TEST_PERC_001_1_CLASSIFICATION_ACCURACY
    name """Object Classification Accuracy Validation"""
    satisfies ref requirement REQ_PERC_001_1
    method VIL
    testlevel integration
    setup """Perception ML model in virtual environment with annotated dataset"""
    steps """
      1. Load pre-trained classification model
      2. Execute classification on test dataset (10,000+ objects)
      3. Measure classification accuracy per object class
      4. Verify processing time ≤100ms per classification
      5. Generate confusion matrix and performance metrics
      """
    expected """Classification accuracy ≥95% per object class, processing time ≤100ms"""
    passcriteria """Accuracy specification met for all object classes"""
    safetylevel ASIL-D
    testresult notrun
```

## Test Methods
```
method MIL       # Model-in-the-Loop
method SIL       # Software-in-the-Loop
method PIL       # Processor-in-the-Loop
method HIL       # Hardware-in-the-Loop
method VIL       # Vehicle-in-the-Loop
method manual    # Manual testing
method automated # Automated testing
```

## Test Levels
```
testlevel unit        # Unit testing
testlevel integration # Integration testing
testlevel system      # System testing
testlevel acceptance  # Acceptance testing
```

## Test Results
```
testresult pass    # Test passed
testresult fail    # Test failed
testresult intest  # Currently in test
testresult notrun  # Not yet run
testresult blocked # Blocked
```

## Traceability
- `satisfies ref requirement` - Satisfies requirement
- `derivedfrom ref requirement` - Derived from requirement
- `refinedfrom ref testcase` - Refinement of another test
- `when ref config` - Conditional visibility

---
Use multiline `"""` for setup, steps, expected, and passcriteria.

---

# Use Case Diagram (.ucd)

## Overview
Defines **actors and use cases** with a flat syntax using from/to/connection relationships.

## File Structure
- **ONE** `hdef usecaseset` per file
- **MULTIPLE** `def actor` and `def usecase` statements
- Clean flat syntax with explicit relationships

## Valid Keywords
```
use, hdef, usecaseset, name, description, owner, tags, level, def, actor,
usecase, actortype, from, to, connection, associated, includes, when,
requires, ref, config
```

## Syntax Structure
```
use functionset [functionset-ref]

hdef usecaseset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  level [product|system|subsystem|component|module|part|externalstakeholder|internalstakeholder|vehicle|sys1|sys2|sys3|sys4|sys5|hwe1|hwe2|hwe3|hwe4|swe1|swe2|swe3|swe4|swe5|swe6]

  def actor [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    actortype [primary|secondary]
    
  def usecase [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    from ref actor [actor-ref] | from ref function [function-ref]
    to ref function [function-ref]
    connection [associated|includes]
```

## Actor Types
```
actortype primary    # Primary actor (initiates use cases)
actortype secondary  # Secondary actor (provides services)
```

## Connection Types
```
connection associated  # Association (actor ↔ function)
connection includes    # Inclusion (function → function)
```

## Validation Rules
- **Primary actors** must be in `from` position
- **Secondary actors** must be in `to` position
- **Functions** can be in both `from` and `to` positions
- `connection includes` only between functions
- `connection associated` between actors and functions

## Example
```sylang
use functionset ChairSystemFunctions

hdef usecaseset ChairSystemUseCases
  name """Height Adjustable Chair Use Cases"""
  description """Use case model describing user interactions with chair system"""
  owner """Systems Engineering Team"""

  def actor ChairUser
    name """Chair User"""
    description """Primary user who interacts with adjustment features"""
    owner """User Experience Team"""
    actortype primary

  def actor ChairControlSystem
    name """Chair Control System"""
    description """Electronic control system managing chair functions"""
    owner """Control Systems Team"""
    actortype secondary

  def usecase UC_001
    name """Initiate Chair System"""
    description """User initiates chair system operation"""
    from ref actor ChairUser
    to ref function InitializeChairSystem
    connection associated

  def usecase UC_002
    name """Execute Pneumatic Height Adjustment"""
    description """User performs height adjustment using pneumatic system"""
    from ref actor ChairUser
    to ref function ExecutePneumaticHeightAdjustment
    connection associated

  def usecase UC_003
    name """Monitor Pneumatic Pressure"""
    description """System monitors gas cylinder pressure during adjustment"""
    from ref function ExecutePneumaticHeightAdjustment
    to ref function MonitorGasCylinderPressure
    connection includes
```

---
See `.fun` for function definitions referenced in use cases.

---

# Sequence Diagram (.seq)

## Overview
Defines **message flow sequences** between blocks with operation/signal flows. Supports fragments for alternative and parallel flows.

## File Structure
- **ONE** `hdef sequenceset` per file
- **MULTIPLE** `def sequence` and `def fragment` statements
- Uses `from/to` refs to blocks and `flow` refs to operations/signals

## Valid Keywords
```
use, hdef, sequenceset, name, description, owner, tags, level, safetylevel,
def, sequence, block, fragment, from, to, flow, fragmenttype, condition,
when, requires, ref
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
use interfaceset AutonomousDrivingInterfaces

hdef sequenceset AutonomousEmergencyBraking
  name """Autonomous Emergency Braking Sequence"""
  description """Message flow sequence for emergency braking scenario"""
  owner """Safety Systems Integration Team"""
  safetylevel ASIL-D
  tags """emergency-braking""", """sequence""", """safety-critical""", """AEB"""
  
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
    condition """Communication timeout > 100ms"""
    
    def sequence SEQ_005
      from ref block VehicleControlModule
      to ref block FallbackControlModule
      flow ref signal SystemFailureAlert
      
  // Parallel status reporting fragment  
  def fragment StatusReporting
    fragmenttype parallel
    condition """All modules must report status concurrently"""
    
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
use interfaceset AutonomousDrivingInterfaces

hdef sequenceset AutonomousDrivingSequence
  name """Autonomous Driving Function Sequence"""
  description """Message flow sequence between autonomous driving functions"""
  owner """AD Systems Team"""
  safetylevel ASIL-D
  tags """autonomous-driving""", """function-sequence""", """safety-critical"""
  
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

---

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
use, hdef, statemachine, name, description, owner, tags, level, safetylevel,
status, allocatedto, implements, def, state, transition, initialstate,
endstate, from, to, condition, call, requires, ref, when, config,
analysiseffort, deveffort, testeffort
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
  status [draft|review|approved|implemented|deprecated]
  allocatedto ref block [block-ref]
  implements ref requirement [requirement-ref]

  def state [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    status [draft|review|approved|implemented|deprecated]
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
  name """Electric Parking Brake State Machine"""
  description """Complete state machine controlling EPB engagement and release operations"""
  owner """Safety Systems Team"""
  safetylevel ASIL-D
  status approved
  allocatedto ref block EPBControlModule
  implements ref requirement EPB_StateMachineReq_001

  def state Idle
    name """Idle State"""
    description """EPB system in idle state, ready to receive commands"""
    owner """Control Systems Team"""
    status implemented
    initialstate true
    implements ref requirement EPB_IdleStateReq_001

  def state Engaging
    name """Engaging State"""
    description """EPB system actively engaging the brake mechanism"""
    owner """Actuator Team"""
    status implemented

  def state Engaged
    name """Engaged State"""
    description """EPB system fully engaged and holding vehicle"""
    owner """Safety Team"""
    status implemented

  def state Releasing
    name """Releasing State"""
    description """EPB system actively releasing the brake"""
    owner """Actuator Team"""
    status implemented

  def state Fault
    name """Fault State"""
    description """EPB system in fault condition requiring diagnostics"""
    owner """Diagnostics Team"""
    status implemented
    endstate true

  def transition EngageCommand
    name """Engage Command Transition"""
    description """Transition from idle to engaging when engage command received"""
    owner """Control Logic Team"""
    status implemented
    from ref state Idle
    to ref state Engaging
    condition """engage_command_received AND brake_pedal_pressed AND vehicle_stationary"""
    call ref function InitiateEngagement

  def transition EngagementComplete
    name """Engagement Complete Transition"""
    description """Transition from engaging to engaged when motor reaches target position"""
    from ref state Engaging
    to ref state Engaged
    condition """engagement_confirmed AND motor_current_stable"""
    call ref function ConfirmEngagement

  def transition ReleaseCommand
    name """Release Command Transition"""
    description """Transition from engaged to releasing when release command received"""
    from ref state Engaged
    to ref state Releasing
    condition """release_command_received AND brake_pedal_pressed"""
    call ref function InitiateRelease

  def transition FaultDetected
    name """Fault Detection Transition"""
    description """Transition to fault state when diagnostic failure detected"""
    from ref state Idle
    to ref state Fault
    condition """system_diagnostic_failure OR motor_overcurrent"""
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

---

# Item Definition - ISO 26262 (.itm)

## Overview
Defines **ISO 26262 item definition** with system boundaries and operating modes. Part of ISO 26262 Part 3 compliance.

## File Structure
- **ONE** `hdef itemdefinition` per file
- **MULTIPLE** `def boundary` and `def operatingmode` statements (hierarchical)
- Can `use` featuresets

## Valid Keywords
```
use, hdef, itemdefinition, name, description, owner, tags, level,
iso26262part, safetylevel, conditions, def, boundary, operatingmode,
includes, excludes, itemscope, when, requires, ref, analysiseffort,
deveffort, testeffort
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
  name """Autonomous Vehicle L3 System Item"""
  description """Complete item definition for Level 3 autonomous vehicle system per ISO 26262"""
  owner """Functional Safety Manager"""
  tags """ISO-26262""", """item-definition""", """L3-autonomous"""
  iso26262part """Part 3 - Item Definition"""
  safetylevel ASIL-D

  def boundary SystemBoundary
    name """Autonomous Vehicle System Boundary"""
    description """Physical and functional boundaries of the autonomous vehicle item"""
    
    includes ref block PerceptionControlModule
    includes ref block PlanningControlModule
    includes ref block VehicleControlModule
    includes ref block HumanMachineInterface
    excludes ref block InfotainmentSystem
    excludes ref block ClimateControlSystem
    
    def boundary SensorBoundary
      name """Sensor System Boundary"""
      description """Boundary definition for all perception sensors"""
      includes ref block CameraSystem
      includes ref block LidarSystem
      includes ref block RadarSystem
      
  def operatingmode HighwayAutonomous
    name """Highway Autonomous Operation"""
    description """Autonomous operation on controlled access highways"""
    conditions """Highway driving, speeds 60-130 km/h, good weather"""
    safetylevel ASIL-D
    
    def operatingmode HighwayEntry
      name """Highway Entry and Merging"""
      description """Autonomous highway entry and merging maneuvers"""
      conditions """Highway on-ramps, merging zones, acceleration lanes"""
      safetylevel ASIL-D
      
    def operatingmode HighwayExit
      name """Highway Exit and Lane Change"""
      description """Autonomous highway exit and lane changing"""
      conditions """Highway off-ramps, lane changes, deceleration zones"""
      safetylevel ASIL-D

  def operatingmode UrbanAutonomous
    name """Urban Autonomous Operation"""
    description """Limited autonomous operation in urban environments"""
    conditions """City streets, speeds 30-60 km/h, traffic lights, pedestrians"""
    safetylevel ASIL-C
    
  def operatingmode ManualFallback
    name """Manual Control Fallback"""
    description """Driver takeover and manual control operation"""
    conditions """System failure, adverse weather, construction zones"""
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

---

# Hazard Analysis - ISO 26262 (.haz)

## Overview
Defines **ISO 26262 hazard analysis** with ASIL determination. Part of ISO 26262 Part 3 compliance.

## File Structure
- **ONE** `hdef hazardanalysis` per file
- **MULTIPLE** `def hazard` and `def situation` statements (hierarchical)
- Can `use` itemdefinition

## Valid Keywords
```
use, hdef, hazardanalysis, name, description, owner, tags, level,
iso26262part, assessmentdate, hazardclass, severity, exposure,
controllability, safetylevel, speed, environment, trafficdensity,
maxacceptabledelay, nominalresponsetime, def, hazard, situation,
malfunctionof, affects, leadsto, when, requires, ref, analysiseffort,
deveffort, testeffort
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
      safetylevel [QM|ASIL-A|ASIL-B|ASIL-C|ASIL-D]
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
safetylevel: QM, ASIL-A, ASIL-B, ASIL-C, ASIL-D
```

## Example
```sylang
use itemdefinition AutonomousVehicleItem

hdef hazardanalysis AutonomousVehicleHazards
  name """Autonomous Vehicle Hazard Analysis"""
  description """Complete hazard analysis and risk assessment for L3 autonomous vehicle"""
  owner """Functional Safety Team"""
  tags """ISO-26262""", """hazard-analysis""", """ASIL-assessment"""
  iso26262part """Part 3 - Hazard Analysis"""
  assessmentdate """2025-08-18"""
  safetylevel ASIL-D

  def hazard UnintendedAcceleration
    name """Unintended Vehicle Acceleration"""
    description """
      Vehicle accelerates without driver command or against driver intention 
      during autonomous operation. This hazard can occur due to throttle control 
      system malfunction, sensor misinterpretation, or software algorithm errors.
      """
    hazardclass """Longitudinal Motion"""
    severity S3
    exposure E4
    controllability C2
    safetylevel ASIL-D
    
    malfunctionof ref function ThrottleControl
    affects ref feature ControlSystem
    leadsto ref requirement REQ_SAFE_ACCEL_001

    def situation HighwayUnintendedAcceleration
      name """Unintended Acceleration on Highway"""
      description """Vehicle accelerates unintentionally during highway autonomous operation"""
      speed """60-130 km/h"""
      environment """Highway, dry conditions"""
      trafficdensity """Medium to high traffic"""
      maxacceptabledelay """500ms"""
      nominalresponsetime """200ms"""
      severity S3
      exposure E4
      controllability C2
      safetylevel ASIL-D

    def situation UrbanUnintendedAcceleration
      name """Unintended Acceleration in Urban Area"""
      description """Vehicle accelerates unintentionally in urban environment with pedestrians"""
      speed """30-60 km/h"""
      environment """Urban streets, intersections"""
      trafficdensity """High traffic, pedestrians present"""
      maxacceptabledelay """300ms"""
      nominalresponsetime """150ms"""
      severity S3
      exposure E5
      controllability C3
      safetylevel ASIL-D

  def hazard LossOfLateralControl
    name """Loss of Lateral Vehicle Control"""
    description """Vehicle loses ability to maintain lane position or steer appropriately"""
    hazardclass """Lateral Motion"""
    severity S3
    exposure E4
    controllability C2
    safetylevel ASIL-D
    
    malfunctionof ref function SteeringControl
    affects ref feature ControlSystem
    leadsto ref requirement REQ_SAFE_STEER_001

  def hazard FailureToStopAtObstacle
    name """Failure to Stop at Obstacle"""
    description """Vehicle fails to detect obstacle and stop, resulting in collision"""
    hazardclass """Longitudinal Motion"""
    severity S3
    exposure E4
    controllability C3
    safetylevel ASIL-D
    
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

---

# Safety Goals (.sgl)

## Overview

Defines **ISO 26262 Safety Goals** derived from hazard analysis with ASIL classification and safe state definitions. Part of ISO 26262 Part 3 - Concept Phase.

## File Structure

- **ONE** `hdef safetygoalset` per file
- **MULTIPLE** `def safetygoal` statements
- **REFERENCE-HEAVY**: Links to `.haz`, `.itm`, `.req`

## Valid Keywords

```
use, hdef, safetygoalset, name, description, owner, tags, level, safetylevel,
def, safetygoal, derivedfrom, mitigates, safestate, safecondition,
faulttoleranttime, emergencyoperationtime, leadsto, allocatedto, when,
requires, ref, analysiseffort, deveffort, testeffort
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
  name """Autonomous Vehicle Safety Goals"""
  description """
    Complete set of safety goals derived from hazard analysis for 
    Level 3 autonomous vehicle system per ISO 26262 Part 3.
    """
  owner """Functional Safety Manager"""
  tags """ISO-26262""", """safety-goals""", """part-3""", """ASIL-D"""
  safetylevel ASIL-D

  def safetygoal SG_001_PreventUnintendedAcceleration
    name """Prevent Unintended Vehicle Acceleration"""
    description """
      The vehicle SHALL prevent unintended acceleration during autonomous 
      operation to avoid collision with other vehicles, pedestrians, or 
      obstacles. System must detect acceleration faults and transition 
      to safe state within fault tolerant time interval.
      """
    owner """Safety Goals Team"""
    tags """acceleration-control""", """longitudinal-safety""", """collision-avoidance"""
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
    name """Maintain Lateral Vehicle Control"""
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
    name """Detect and Avoid Obstacles"""
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
    name """Diagnose Perception Sensor Failures"""
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
  safetylevel ASIL-D

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
1. """Controlled stop in current lane"""
2. """Degraded operation with reduced speed"""
3. """Driver takeover with warning"""
4. """Minimal risk condition with safe stop"""
5. """Emergency operation using redundant systems"""
```

## Validation Rules

✅ Exactly one `hdef safetygoalset` per file
✅ Must `use hazardanalysis` to reference hazards
✅ Each safety goal has `derivedfrom ref hazard` (a goal without one gets a warning)
✅ Each safety goal must have `safestate` definition
✅ `faulttoleranttime` and `emergencyoperationtime` recommended
✅ Its ASIL should be at least the ASIL of the hazards it covers (check this in review; the validator does not compare them)
✅ `leadsto ref requirement` links to `.req` file (multiple allowed)
❌ Do not set a lower ASIL than the source hazard

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

---

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

---

# Failure Analysis - FMEA (.flr)

## Overview
Defines **Failure Mode and Effects Analysis (FMEA)** with temporal properties and complete traceability. Supports both hierarchical (old) and flat (new) syntax patterns.

## File Structure
- **ONE** `hdef failureset` per file
- **MULTIPLE** `def failuremode` statements
- Supports temporal logic with `within` keyword
- Can `use` blocks, functionsets, requirementsets, testsets, parameters

## Valid Keywords
```
use, hdef, failureset, name, description, owner, tags, safetylevel, level,
propagateto, occursin, def, failuremode, failurerate, severity,
detectability, occurrence, actionpriority, timingreference, allocatedto,
affects, probability, rpn, faultdetectiontime, faulttolerancetime,
propagationdelay, recoverytime, causedby, effects, detectedby, mitigatedby,
testedby, derivedfrom, definedby, within, when, requires, meets, ref, attach,
errorcode, dtc, analysiseffort, deveffort, testeffort, diagnosticcoverage
```

## Syntax Structure
```
use block [block-ref]
use functionset [functionset-ref]
use requirementset [requirementset-ref]
use testset [testset-ref]

hdef failureset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  tags [string-literal], [string-literal], ...
  safetylevel [ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM]
  timingreference [ms|us|s]
  propagateto ref failureset [failureset-ref]
  occursin ref block [block-ref]

  def failuremode [identifier]
    name [string-literal]
    description [string-literal]
    owner [string-literal]
    tags [string-literal], [string-literal], ...
    
    # AIAG VDA Quantitative Analysis
    failurerate [numeric-value]
    severity [1-10]
    occurrence [1-10]
    detectability [1-10]
    actionpriority [high|medium|low]
    rpn [numeric-value]
    
    # Temporal Properties
    faultdetectiontime [numeric-value]
    faulttolerancetime [numeric-value]
    propagationdelay [numeric-value]
    recoverytime [numeric-value]
    within [numeric-value]
    
    # Relationships
    causedby ref failuremode [failuremode-ref], [failuremode-ref], ...
    effects ref failuremode [failuremode-ref], [failuremode-ref], ...
    detectedby ref function [function-ref], [function-ref], ...
    mitigatedby ref function [function-ref], [function-ref], ...
    testedby ref testcase [testcase-ref], [testcase-ref], ...
    affects ref block [block-ref], [block-ref], ...
    allocatedto ref block [block-ref]
    derivedfrom ref requirement [requirement-ref]
    when ref config [config-ref]
```

## Complete Example (Flat Syntax - Recommended)
```sylang
use block PowerSupplyBlock
use functionset PowerSupplyFunctions
use requirementset SafetyRequirements
use testset PowerSupplyTests

hdef failureset PowerSupplyFailures
  name """Power Supply Subsystem FMEA"""
  description """Comprehensive FMEA for automotive ECU power supply"""
  owner """Safety Engineering Team"""
  safetylevel ASIL-D
  timingreference ms
  propagateto ref failureset VehicleSystemFailures
  occursin ref block PowerSupplyBlock

  def failuremode VoltageRegulatorFailure
    name """Voltage Regulator Complete Failure"""
    description """Primary voltage regulator stops providing regulated 5V power"""
    owner """Hardware Safety Team"""
    
    // FMEA Quantitative Analysis
    failurerate 1.2e-6        // Failures per million hours
    severity 9                // 1-10 scale
    detectability 3           // 1-10 scale
    occurrence 4              // 1-10 scale
    actionpriority high
    safetylevel ASIL-D
    
    // Temporal Properties (using timingreference=ms)
    faultdetectiontime 5      // Detected within 5ms
    faulttolerancetime 2      // System can tolerate for 2ms
    propagationdelay 10       // Propagates to system failure in 10ms
    recoverytime 500          // 500ms required for recovery
    
    // Failure Causality with Timing (MULTIPLE allowed)
    causedby ref failuremode TransistorBurnout within 50
    causedby ref failuremode CapacitorDegradation within 200
    
    // Failure Effects with Timing (MULTIPLE allowed)
    effects ref failuremode ProcessorPowerLoss within 10
    effects ref failuremode SystemShutdown within 500
    
    // Detection Mechanisms (MULTIPLE allowed)
    detectedby ref function VoltageSensorMonitoring within 5
    detectedby ref function PowerSupplyDiagnostic within 20
    
    // Mitigation Strategies (MULTIPLE allowed)
    mitigatedby ref function RedundantPowerPath within 2
    mitigatedby ref function PowerFailureSafeMode within 100
    
    // Testing and Requirements (SINGLE only)
    testedby ref testcase VoltageRegulatorFailureTest
    derivedfrom ref requirement VoltageRegulationReq

  def failuremode TransistorBurnout
    name """Power Transistor Thermal Burnout"""
    description """Power MOSFET failure due to excessive thermal stress"""
    
    failurerate 0.8e-6
    severity 7
    detectability 5
    occurrence 2
    actionpriority medium
    safetylevel ASIL-C
    
    // This is a root cause (no causes listed)
    effects ref failuremode VoltageRegulatorFailure within 50
    
    detectedby ref function TemperatureSensorMonitoring within 10
    mitigatedby ref function ThermalDerating within 1
    
    testedby ref testcase ThermalStressTest
    derivedfrom ref requirement ThermalManagementReq
```

## Relationship Multiplicity
**MULTIPLE allowed:**
- `causedby` - Multiple causes
- `effects` - Multiple effects
- `detectedby` - Multiple detection mechanisms
- `mitigatedby` - Multiple mitigation strategies

**SINGLE only:**
- `testedby` - One test case
- `derivedfrom` - One requirement

## Reference Constraints
- `causedby` → Can only ref `failuremode`
- `effects` → Can only ref `failuremode`
- `detectedby` → Can only ref `function`
- `mitigatedby` → Can only ref `function`
- `testedby` → Can only ref `testcase`
- `derivedfrom` → Can only ref `requirement`

## Temporal Properties
All timing values use `timingreference` from failureset level:
- `faultdetectiontime` - Time to detect failure
- `faulttolerancetime` - Time system can tolerate
- `propagationdelay` - Time to propagate to next failure
- `recoverytime` - Time required to recover
- `within` - Temporal constraint for relationships (e.g., `within 50` ms)

## Action Priority
```
actionpriority high
actionpriority medium
actionpriority low
```

---
ISO 26262 compliant FMEA with quantitative analysis and temporal logic.

---

# Fault Tree Analysis (.fta)

## Overview
Defines **quantitative fault tree analysis** with hierarchical gate structures. Part of ISO 26262 Part 4 compliance.

## File Structure
- **ONE** `hdef faulttree` per file
- **MULTIPLE** `def gate` statements (hierarchical)
- Can `use` failuresets, hazardanalysis, safetymechanismsets

## Valid Keywords
```
use, hdef, faulttree, name, description, owner, tags, level, safetylevel,
topevent, def, gate, gatetype, input, output, allocatedto, requires, ref,
when, analysiseffort, deveffort, testeffort
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
  name """Vehicle Collision Fault Tree Analysis"""
  description """Complete FTA for vehicle collision scenarios in autonomous operation"""
  owner """Safety Analysis Team"""
  safetylevel ASIL-D
  tags """fault-tree""", """collision-analysis""", """quantitative-fta"""
  
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
```

```sylang
// Block-level FTA - a separate .fta file
hdef faulttree PerceptionModuleFaultTree
  name """Perception Module Fault Tree"""
  description """Detailed fault tree for perception system failures"""
  owner """Perception Safety Team"""
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

---

# Sprint Planning (.spr)

## Overview
Defines **agile sprints, epics, stories, and tasks** with agent assignments and complete traceability.

## File Structure
- **ONE** `hdef sprint` per file
- **MULTIPLE** hierarchical `def epic/story/task`
- Can `use` agentsets

## Valid Keywords
```
use, agentset, hdef, sprint, name, description, owner, level, startdate,
enddate, assignedto, ref, issuestatus, priority, points, outputfile, comment,
def, epic, story, task
```

## Syntax Structure
```
use agentset [agentset-ref]

hdef sprint [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  startdate [YYYY-MM-DD]
  enddate [YYYY-MM-DD]
  comment [string-literal]

  def epic [identifier]
    name [string-literal]
    description [string-literal]
    assignedto ref agent [agent-ref]
    issuestatus [backlog|open|inprogress|blocked|done|canceled]
    priority [critical|high|medium|low]
    comment [string-literal]
    
    def story [identifier]
      name [string-literal]
      description [string-literal]
      assignedto ref agent [agent-ref]
      issuestatus [backlog|open|inprogress|blocked|done|canceled]
      priority [critical|high|medium|low]
      points [numeric-value]
      
      def task [identifier]
        name [string-literal]
        description [string-literal]
        assignedto ref agent [agent-ref]
        issuestatus [backlog|open|inprogress|blocked|done|canceled]
        priority [critical|high|medium|low]
        points [numeric-value]
        outputfile [file-path]
```

## Complete Example
```sylang
use agentset AutonomousVehicleAgents

hdef sprint AutonomousVehicleDevelopmentSprint
  name """Autonomous Vehicle L3 System Development Sprint"""
  description """Complete autonomous vehicle system design and implementation"""
  owner """Autonomous Systems Program Manager"""
  startdate """2025-09-01"""
  enddate """2025-12-15"""
  comment """
    This sprint covers the complete development lifecycle for L3 autonomous 
    vehicle system. Key focus areas include perception, safety validation, 
    and ISO 26262 compliance.
    """

  def epic PerceptionSystemDevelopment
    name """Perception System Architecture and Implementation"""
    description """Design and implement complete perception system"""
    assignedto ref agent PerceptionSystemsAgent
    issuestatus open
    priority critical
    comment """
      Epic focuses on core perception capabilities for autonomous vehicle.
      Includes requirements definition, sensor fusion implementation, and 
      safety validation.
      """

    def story PerceptionRequirements
      name """Perception System Requirements Definition"""
      description """Define comprehensive requirements for perception system"""
      assignedto ref agent SafetyRequirementsAgent
      issuestatus open
      priority critical

      def task PerceptionFunctionalRequirements
        name """Perception Functional Requirements"""
        description """Define functional requirements for object detection and tracking"""
        assignedto ref agent PerceptionSystemsAgent
        issuestatus open
        priority critical
        points """13"""
        outputfile """requirements/PerceptionFunctionalRequirements.req"""

      def task PerceptionSafetyRequirements
        name """Perception Safety Requirements"""
        description """Define ASIL-D safety requirements for perception system"""
        assignedto ref agent SafetyRequirementsAgent
        issuestatus backlog
        priority critical
        points """21"""
        outputfile """requirements/PerceptionSafetyRequirements.req"""
```

## Issue Status
```
issuestatus backlog    # Backlog
issuestatus open       # Open
issuestatus inprogress # In progress
issuestatus blocked    # Blocked
issuestatus canceled   # Canceled
issuestatus done       # Done
```

## Priority
```
priority low       # Low priority
priority medium    # Medium priority
priority high      # High priority
priority critical  # Critical priority
```

---
Use `comment` for multiline descriptions on epics, stories, and tasks.

---

# Agent Definition (.agt)

## Overview
Defines **AI agents** with specialized expertise for systems engineering tasks.

## File Structure
- **ONE** `hdef agentset` per file
- **MULTIPLE** `def agent` statements

## Valid Keywords
```
use, hdef, agentset, name, description, owner, level, def, agent, role,
specialization, expertise, context
```

## Syntax Structure
```
hdef agentset [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]

  def agent [identifier]
    name [string-literal]
    description [string-literal]
    role [string-literal]
    specialization [string-literal]
    expertise [string-literal]
    context [string-literal]
```

## Complete Example
```sylang
hdef agentset AutonomousVehicleAgents
  name """Autonomous Vehicle Engineering Agents"""
  description """Specialized AI agents for autonomous vehicle systems engineering"""
  owner """AI Engineering Team"""

  def agent PerceptionSystemsAgent
    name """Perception Systems Engineering Agent"""
    description """
      Expert in autonomous vehicle perception systems, sensor fusion, and 
      computer vision. Specialized in developing safety-critical perception 
      algorithms for Level 3 autonomous vehicles with deep knowledge of 
      ISO 26262 compliance.
      """
    role """Perception Systems Engineer"""
    specialization """Autonomous Vehicle Perception"""
    expertise """
      Sensor fusion algorithms including Kalman filtering and particle filters
      Computer vision and deep learning for object detection
      Machine learning model optimization for automotive edge computing
      Real-time processing and deterministic system design
      Multi-modal sensor integration (camera, LiDAR, radar)
      Safety-critical software development per ISO 26262
      """
    context """
      Autonomous vehicles and ADAS systems development
      Multi-sensor perception systems for safety-critical applications
      ASIL-D compliance and functional safety requirements
      Object detection and tracking in dynamic environments
      Environmental perception for highway and urban driving scenarios
      """

  def agent FunctionalSafetyAgent
    name """Functional Safety Engineering Agent"""
    description """Specialist in automotive functional safety and ISO 26262"""
    role """Functional Safety Engineer"""
    specialization """Automotive Functional Safety"""
    expertise """ISO 26262""", """Hazard analysis""", """FMEA""", """Fault tree analysis""", """ASIL assessment"""
    context """Automotive safety""", """Risk assessment""", """Safety mechanisms""", """Failure analysis"""

  def agent SafetyRequirementsAgent
    name """Safety Requirements Engineering Agent"""
    description """Expert in safety-critical requirements engineering"""
    role """Safety Requirements Engineer"""
    specialization """Safety Requirements Engineering"""
    expertise """Safety requirements""", """Requirements traceability""", """Verification""", """Validation"""
    context """Safety-critical systems""", """ASIL requirements""", """Requirements validation"""
```

## Agent Properties
- `name` - Human-readable agent name
- `description` - Detailed agent description (multiline supported)
- `role` - Engineering role
- `specialization` - Domain specialization
- `expertise` - Technical expertise areas (multiline supported)
- `context` - Application context (multiline supported)

---
Referenced in `.spr` files with `assignedto ref agent [agent-ref]`

---

# Specification Document (.spec)

## Overview
Defines **specification documents** with hierarchical sections and dynamic content generation. Auto-populates content from requirements, use cases, functions, blocks, tests, and other Sylang artifacts with advanced filtering and sorting.

Specs can embed live dashboards (`def dashboard`).

## File Structure
- **ONE** `hdef specification` per file
- **MULTIPLE** `def section` statements (hierarchical)
- **MULTIPLE** `def spec`, `def diagram`, `def table`, `def dashboard` within sections
- No `use` statements needed - files referenced via `source` property

## Valid Keywords
```
use, hdef, specification, name, description, owner, version, def, section,
spec, diagram, dashboard, table, source, where, groupby, orderby, columns
```

## Syntax Structure
```
hdef specification [identifier]
  name [string-literal]
  description [string-literal]
  owner [string-literal]
  version [string-literal]

  def section [identifier]
    name [string-literal]
    description [string-literal]
    
    def spec [identifier]
      name [string-literal]
      description [string-literal]
      source [filepath]
      where [filter-clause]
      groupby [property]
      orderby [property] [asc|desc]
    
    def diagram [identifier]
      name [string-literal]
      description [string-literal]
      source [filepath]
    
    def table [identifier]
      name [string-literal]
      description [string-literal]
      source [filepath]
      where [filter-clause]
      groupby [property]
      orderby [property] [asc|desc]
      columns [property], [property], ...
    
    def dashboard [identifier]
      name [string-literal]
      description [string-literal]
      source [filepath]
    
    def section [sub-section-id]
      # Nested sections with same structure
```

## Source Property

The `source` property specifies the file(s) to fetch data from. It accepts glob patterns and several files.

### Syntax
```sylang
source [filepath]                                    # Single file
source [filepath1], [filepath2], [filepath3]         # Multiple files
source [glob-pattern]                                # Glob pattern
```

### Single File
```sylang
source """EPB_Requirements.req"""                        # Single file in same directory
source """../features/EPB_Features.fml"""                # Relative path to sibling folder
source """/home/user/project/EPB_Requirements.req"""     # Absolute path
```

### Multiple Files (Comma-Separated)
```sylang
source """EPB_Requirements.req""", """Safety_Requirements.req"""    # Two specific files
source """file1.req""", """file2.req""", """file3.req"""                # Multiple files
source """EPB_Requirements.req""", """../safety/*.req"""            # Mix of single and glob
```

### Glob Patterns
```sylang
# Folder-specific patterns (relative to .spec file)
source """*.req"""                            # All .req files in same directory
source """../safety/*.req"""                  # All .req files in sibling folder
source """requirements/*.req"""               # All .req files in subfolder

# Workspace-wide patterns (starts with **)
source """**/*.req"""                         # ALL .req files in entire workspace
source """**/*.{req,tst}"""                   # ALL .req and .tst files
source """**/epb_*/*.req"""                   # Pattern matching folder names
```

### Path Resolution
- **Relative paths** resolve relative to the `.spec` file directory
- **Absolute paths** use as-is
- **Glob patterns starting with `**`** search entire workspace
- **Glob patterns without `**`** search relative to `.spec` file directory

### Supported File Types
All Sylang file types are supported:
- `.req` (requirements), `.tst` (tests), `.fun` (functions), `.blk` (blocks)
- `.fml` (feature models), `.vml` (variant models), `.ple` (product lines)
- `.ucd` (use cases), `.seq` (sequences), `.smd` (state machines)
- `.flr` (FMEA), `.fta` (fault trees), `.haz` (hazards)
- `.agt` (agents), `.spr` (sprints), `.ifc` (interfaces)
- `.dash` (dashboards)

## Where Clause Syntax
Filter data using logical conditions:

### Operators
- `=` - Equals
- `!=` - Not equals
- `in` - In list (e.g., `reqtype in [functional, safety]`)
- `contains` - Contains substring
- `and` - Logical AND
- `or` - Logical OR
- `()` - Grouping

### Examples
```
where status = approved
where reqtype = functional and safetylevel = ASIL-D
where status in [approved, implemented]
where owner contains """John"""
where (reqtype = functional or reqtype = safety) and status = approved
```

### Valid Properties for Filtering
Common properties across all node types:
```
identifier, name, description, owner, tags, status, level, safetylevel
```

Type-specific properties:
- **requirementset**: reqtype, rationale, verificationcriteria, proposal
- **functionset**: functiontype, enables, decomposesto, allocatedto
- **blockset**: blocktype, chartype, specification, tolerance
- **testcaseset**: testresult, method, testlevel, passcriteria
- **failuremodeset**: severity, detectability, occurrence, rpn
- **sprintset**: issuestatus, priority, startdate, enddate, points

## GroupBy and OrderBy
Organize and sort data:

### GroupBy
Groups items by a property value:
```
groupby reqtype          # Group requirements by type
groupby status           # Group by status
groupby owner            # Group by owner
```

### OrderBy
Sorts items by a property:
```
orderby identifier       # Sort by identifier (ascending, default)
orderby identifier asc   # Sort by identifier (ascending)
orderby priority desc    # Sort by priority (descending)
orderby name             # Sort by name
```

## Columns
Specify which properties to display in tables:
```
columns identifier, name, description, owner, status
columns identifier, name, reqtype, safetylevel, status
columns identifier, name, testresult, method
```

## Multi-Source Examples

### Example 1: Gather Requirements from Multiple Files
```sylang
def section AllRequirements
  name """All System Requirements"""
  
  def table Requirements
    source """EPB_Requirements.req""", """Safety_Requirements.req""", """Performance_Requirements.req"""
    where status = approved
    columns identifier, name, reqtype, status
```

### Example 2: Gather All .req Files in a Folder
```sylang
def section ProjectRequirements
  name """Project Requirements"""
  
  def table AllReqs
    source """../requirements/*.req"""
    groupby reqtype
    orderby identifier asc
    columns identifier, name, status, owner
```

### Example 3: Workspace-Wide Aggregation
```sylang
def section WorkspaceOverview
  name """Entire Workspace Requirements"""
  
  def table AllRequirements
    source """**/*.req"""
    where safetylevel in (ASIL-C, ASIL-D)
    orderby safetylevel desc
    columns identifier, name, safetylevel, owner
```

## Complete Example
```sylang
hdef specification SystemRequirementsSpec
  name """System Requirements Specification"""
  description """Complete system requirements with traceability and metrics"""
  owner """Systems Engineering Team"""
  version """1.0"""

  def section Introduction
    name """Introduction"""
    description """Overview of the system requirements"""
    
    def spec SystemOverview
      name """System Overview"""
      description """High-level system requirements"""
      source """SystemRequirements.req"""
      where level = system
      orderby identifier asc
  
  def section FunctionalRequirements
    name """Functional Requirements"""
    description """Detailed functional requirements"""
    
    def table FunctionalReqTable
      name """Functional Requirements Table"""
      description """All functional requirements with status"""
      source """SystemRequirements.req"""
      where reqtype = functional and status in (approved, implemented)
      orderby identifier asc
      columns identifier, name, description, owner, status, safetylevel
    
    def section SafetyRequirements
      name """Safety-Critical Requirements"""
      description """ASIL-D safety requirements"""
      
      def table SafetyReqTable
        name """Safety Requirements"""
        source """SystemRequirements.req"""
        where reqtype = safety and safetylevel = ASIL-D
        orderby identifier asc
        columns identifier, name, status, owner, verificationcriteria
  
  def section Traceability
    name """Traceability Matrix"""
    description """Requirements to functions to tests"""
    
    def table ReqFunctionTrace
      name """Requirements to Functions"""
      source """SystemFunctions.fun"""
      where status = approved
      orderby identifier asc
      columns identifier, name, implements, allocatedto, status
    
    def table FunctionTestTrace
      name """Functions to Tests"""
      source """SystemTests.tst"""
      where testresult in (pass, intest)
      orderby identifier asc
      columns identifier, name, testresult, method, satisfies
  
  def section Metrics
    name """System Metrics Dashboard"""
    description """Live metrics showing project health"""
    
    def dashboard SystemMetrics
      name """System Dashboard"""
      description """Real-time metrics for requirements, tests, and coverage"""
      source """SystemMetrics.dash"""
```

## Features
- **Hierarchical Sections**: Organize content with nested sections
- **Dynamic Content**: Auto-populate from Sylang artifacts
- **Advanced Filtering**: Complex where clauses with multiple conditions
- **Data Aggregation**: Group and sort data
- **Dashboard Embedding**: Embed live dashboards with metrics and charts
- **Sylang Studio**: Opens as a document in VS Code, in Claude's colours or your VS Code theme
- **HTML Export**: One-click export to HTML for print-to-PDF
- **Tables & Diagrams**: Mix different content types
- **Source Navigation**: Open the source file beside the document

## Rendering
When you open a `.spec` file:
- It opens as a rendered document, with a contents outline and search
- **Source** opens the `.spec` text beside it
- **Export HTML** saves the document as a standalone HTML file
- Click a table row to open that element

## Best Practices
1. **Use Descriptive Names**: Give clear names to sections and content blocks
2. **Filter Appropriately**: Use where clauses to show only relevant data
3. **Organize Hierarchically**: Use nested sections for logical structure
4. **Include Traceability**: Add sections showing relationships between artifacts
5. **Version Control**: Update version property when specification changes
6. **Export Regularly**: Export to HTML for reviews and documentation

## Common Patterns

### Requirements Specification
```sylang
def section Requirements
  def table AllRequirements
    source """MyRequirements.req"""
    where status = approved
    columns identifier, name, reqtype, status, owner
```

### Safety Documentation
```sylang
def section SafetyAnalysis
  def table SafetyRequirements
    source """MyRequirements.req"""
    where safetylevel in (ASIL-C, ASIL-D)
    columns identifier, name, safetylevel, status
  
  def table FailureModes
    source """MyFailures.flr"""
    where severity in (S2, S3)
    columns identifier, name, severity, detectability, rpn
```

### Test Coverage Report
```sylang
def section TestCoverage
  def table AllTests
    source """MyTests.tst"""
    groupby testresult
    columns identifier, name, testresult, method, satisfies
```

### Dashboard Embedding (NEW!)
```sylang
def section Metrics
  name """System Metrics"""
  description """Live dashboard with project health indicators"""
  
  def dashboard ProjectMetrics
    name """Project Dashboard"""
    description """Real-time metrics for requirements, tests, and coverage"""
    source """ProjectMetrics.dash"""
```

## Content Types

### 1. Spec Content (`def spec`)
Display full details of all items from a file.

**Use when**: You want to show complete information with all properties

### 2. Table Content (`def table`)
Display data in tabular format with specific columns.

**Use when**: You want a structured, columnar view of specific properties

### 3. Diagram Content (`def diagram`)
Embed a live diagram of the model elements in its `source`.

**Use when**: You want to include visual diagrams in your spec

### 4. Dashboard Content (`def dashboard`) - NEW!
Embed full interactive dashboards with metrics, charts, and tables.

**Use when**: You want live metrics and visualizations in your spec

## Validation
The extension validates:
- Required `hdef specification` and properties
- File paths in `source` statements (relative or absolute)
- Where clause syntax (operators, parentheses, quotes)
- Column names are valid properties
- Proper keyword usage in context

## Tips
- Use `groupby` to categorize data (e.g., by status, type, owner)
- Use `orderby` to sort data logically (e.g., by identifier, priority)
- Combine `where` clauses with `and`/`or` for complex filtering
- Use `columns` to show only relevant information in tables
- Nest sections to create hierarchical document structure
- Export to HTML and use browser's print-to-PDF for final documents

---

# Sylang Dashboard (.dash) - Complete Reference

## Overview

Sylang Dashboards provide **real-time, interactive visualizations** of your system data. Create custom dashboards with metrics, charts, and tables that query your Sylang model and update as you edit it.

**Key Features:**
- 📊 **Grid-based layout** - Flexible rows × columns configuration
- 📈 **Interactive widgets** - Metrics, charts, and tables
- 🔍 **Powerful queries** - Simple, complex, and very complex query support
- 🔗 **Relationship analysis** - Track broken links, orphans, and coverage
- 🎨 **Sylang Studio** - Opens as a dashboard in VS Code, in Claude's colours or your VS Code theme; charts are bar, line, pie (donut) and gauge

---

## Valid Keywords
```
use, hdef, dashboard, name, description, owner, version, grid, def, metric,
chart, table, type, property, xaxis, yaxis, span, source, where, groupby,
orderby, correlate, analyze, calculate, columns
```

## File Structure

```text
hdef dashboard <identifier>
  name """Dashboard Name"""
  owner """Owner Name"""
  version """1.0"""
  grid <rows>x<columns>

def metric|chart|table <identifier>
  name """Widget Name"""
  type <type>
  sourcetype <nodetype> [where <conditions>]
  [source <file-patterns>]
  [correlate type <nodetype> via <relationship>]
  [analyze <status>]
  [groupby <property>]
  [orderby <property> [asc|desc]]
  [columns <prop1>, <prop2>, ...]
  [span <rows>x<columns>]
```

---

## Header Definition

### Syntax
```text
hdef dashboard <identifier>
  name """Dashboard Name"""
  owner """Owner Name"""
  version """1.0"""
  grid <rows>x<columns>
```

### Properties
| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| `name` | ✅ | Dashboard title | `"EPB System Metrics"` |
| `owner` | ✅ | Dashboard owner | `"Systems Team"` |
| `version` | ✅ | Version string | `"1.0"` |
| `grid` | ✅ | Layout grid (rows×columns) | `3x4` (12 widgets) |

### Example
```sylang
hdef dashboard EPB_METRICS
  name """EPB System Dashboard"""
  owner """Systems Engineering Team"""
  version """1.0"""
  grid 3x4
```

---

## Widget Types

### 1. Metric Widget

Display a single numeric value with optional unit.

**Syntax:**
```sylang
def metric <identifier>
  name """Metric Name"""
  type count|percentage|sum|avg|min|max|gauge
  sourcetype <nodetype> [where <conditions>]
  [source <file-patterns>]
  [property <property_name>]
  [span <rows>x<columns>]
```

**Metric Types:**
- `count` - Count symbols
- `percentage` - Calculate percentage (requires `correlate`)
- `sum` - Sum numeric property
- `avg` - Average numeric property
- `min` - Minimum numeric property
- `max` - Maximum numeric property
- `gauge` - Display as gauge (0-100)

**Examples:**
```sylang
# Simple count
def metric TOTAL_REQUIREMENTS
  name """Total Requirements"""
  type count
  sourcetype requirement

# Count with filter
def metric APPROVED_REQUIREMENTS
  name """Approved Requirements"""
  type count
  sourcetype requirement where status = approved

# Coverage percentage
def metric TEST_COVERAGE
  name """Test Coverage"""
  type percentage
  sourcetype requirement where status = approved
  correlate type testcase via satisfies

# Average (requires property)
def metric AVG_PRIORITY
  name """Average Priority"""
  type avg
  sourcetype requirement
  property priority
```

---

### 2. Chart Widget

Visualize data with various chart types.

**Syntax:**
```sylang
def chart <identifier>
  name """Chart Name"""
  type bar|line|pie|scatter|gauge|sankey
  sourcetype <nodetype> [where <conditions>]
  [source <file-patterns>]
  [correlate type <nodetype> via <relationship>]
  [analyze <status>]
  [groupby <property>]
  [orderby <property> [asc|desc]]
  [xaxis """Label"""]
  [yaxis """Label"""]
  [span <rows>x<columns>]
```

**Chart Types:**
- `bar` - Bar chart
- `line` - Line chart
- `pie` - Pie chart (requires `groupby`)
- `scatter` - Scatter plot
- `gauge` - Gauge chart
- `sankey` - Sankey flow diagram (requires `correlate`)

**Examples:**
```sylang
# Pie chart with groupby
def chart REQ_BY_STATUS
  name """Requirements by Status"""
  type pie
  sourcetype requirement
  groupby status

# Bar chart with filter and sort
def chart REQ_BY_LEVEL
  name """Requirements by Safety Level"""
  type bar
  sourcetype requirement where reqtype = functional
  groupby safetylevel
  orderby safetylevel desc

# Sankey flow (traceability)
def chart TRACEABILITY_FLOW
  name """Traceability Flow"""
  type sankey
  sourcetype requirement
  correlate type function via implements
  correlate type testcase via satisfies
  span 2x2
```

---

### 3. Table Widget

Display data in tabular format.

**Syntax:**
```sylang
def table <identifier>
  name """Table Name"""
  description """Table description"""
  sourcetype <nodetype> [where <conditions>]
  [groupby <property>]
  [orderby <property> [asc|desc]]
  columns <prop1>, <prop2>, <prop3>, ...
  [span <rows>x<columns>]
```

**Examples:**
```sylang
# Simple table
def table APPROVED_REQS
  name """Approved Requirements"""
  sourcetype requirement where status = approved
  orderby name asc
  columns name, reqtype, safetylevel, owner

# Table with analysis
def table ISOLATED_SYMBOLS
  name """Isolated Symbols"""
  description """Symbols with no relationships"""
  sourcetype all
  analyze isolated
  columns symbolName, symbolType, status
  span 2x2
```

---

## Query Syntax

### Source Keyword

Specify the primary data source.

**Syntax:**
```sylang
sourcetype <nodetype> [where <conditions>]
```

**Node Types:**
- `requirement`, `function`, `feature`, `block`, `interface`, `operation`, `signal`
- `testcase`, `failuremode`, `hazard`, `agent`, `usecase`, `state`, `transition`
- `config`, `productline`, `featureset`, `functionset`, etc.
- `all` - All symbols from all files

**Examples:**
```sylang
sourcetype requirement
sourcetype requirement where status = approved
sourcetype all
```

Use `source` to limit which files are queried. It takes file names or glob patterns, relative to the dashboard.

---

### Limiting the files: `source`

Limit which files are searched when querying symbols.

**Syntax:**
```sylang
source <pattern>                                # Single pattern
source <pattern1>, <pattern2>, <pattern3>       # Multiple patterns
source <settype> <SetName>                      # One set, e.g. source requirementset BrakeRequirements
```

**Supported Patterns:**
- Single file: `"EPB_Requirements.req"`
- Multiple files: `"file1.req", "file2.req"`
- Folder glob: `"*.req"`, `"../safety/*.req"`
- Workspace-wide: `"**/*.req"`

**Examples:**
```sylang
# Limit to specific file
def metric TOTAL_EPB_REQUIREMENTS
  name """Total EPB Requirements"""
  type count
  sourcetype requirement
  source "EPB_Requirements.req"

# Limit to folder
def metric SAFETY_REQUIREMENTS
  name """Safety Requirements Count"""
  type count
  sourcetype requirement
  source "../safety/*.req"
  where safetylevel = ASIL-D

# Workspace-wide with pattern
def chart ASIL_D_BY_STATUS
  name """ASIL-D Requirements by Status"""
  type pie
  sourcetype requirement
  source "**/*.req"
  where safetylevel = ASIL-D
  groupby status

# Multiple files
def table MODULE_REQUIREMENTS
  name """Module Requirements"""
  sourcetype requirement
  source "EPB_Requirements.req", "Brake_Requirements.req", "Safety_Requirements.req"
  columns name, reqtype, status, owner
```

**Use Cases:**
- **Project-specific dashboards** - Show metrics for specific modules
- **Folder-based filtering** - Analyze specific directories
- **Multi-project workspaces** - Filter by project folder

---

### Where Clause

Filter source data with boolean expressions.

**Syntax:**
```sylang
where <property> <operator> <value>
where <complex_expression>
```

**Operators:**
| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal (supports wildcards) | `status = approved` |
| `!=` | Not equal (supports wildcards) | `status != rejected` |
| `in` | In list (exact match) | `status in (approved, draft)` |
| `contains` | String contains (supports comma-separated OR) | `tags contains safety` or `tags contains safety, interface` |
| `matches` / `like` | Pattern matching | `tags matches category.*` |
| `and` | Logical AND | `status = approved and reqtype = functional` |
| `or` | Logical OR | `safetylevel = ASIL-D or safetylevel = ASIL-C` |
| `()` | Grouping | `(A or B) and C` |

**Wildcard Patterns:**
- `*` - Matches any characters (zero or more)
- `?` - Matches single character

**Examples:**
```sylang
# Exact match
where status = approved
where reqtype != non-functional

# List matching
where status in (approved, draft, review)

# String contains (single value)
where tags contains safety

# String contains (multiple values - OR logic)
where tags contains safety, interface, blahblah    # Matches if ANY value is found

# Wildcard patterns (automatic with = operator)
where tags = category.*              # Matches category.safety, category.security, etc.
where name = EPB_REQ_*               # Matches EPB_REQ_001, EPB_REQ_002, etc.
where owner = test_?_engineer        # Matches test_1_engineer, test_a_engineer, etc.

# Explicit pattern matching
where tags matches category.*
where name like EPB_*

# Complex expressions
where status = approved and reqtype = functional
where tags = category.* and status = approved
where (safetylevel = ASIL-D or safetylevel = ASIL-C) and status = approved
```

---

### Correlate Keyword (Complex Queries)

Follow relationships across files.

**Syntax:**
```sylang
correlate type <nodetype> via <relationship>
```

**Relationship Keywords:**
- `implements`, `satisfies`, `verifies`, `validates`, `traces`
- `allocatedto`, `enables`, `requires`, `excludes`
- `derivedfrom`, `refinedfrom`, `mitigates`, `composedof`
- `needs`, `assignedto`, `provides`

**Examples:**
```sylang
# Single hop
sourcetype requirement
correlate type testcase via satisfies

# Multi-hop (traceability chain)
sourcetype requirement
correlate type function via implements
correlate type testcase via satisfies
```

---

### Analyze Keyword (Complex Queries)

Aggregate relationship analysis.

**Syntax:**
```sylang
analyze <status>
```

**Analyze Types:**
| Type | Description |
|------|-------------|
| `broken` | Symbols with broken outgoing links |
| `orphan` | Symbols with no incoming links |
| `sink` | Symbols with no outgoing links |
| `isolated` | Symbols with no links at all |
| `connected` | Symbols with valid links |
| `relationships` | All relationship types used |
| `all` | All symbols (for general analysis) |

**Examples:**
```sylang
# Count broken links
def metric BROKEN_LINKS
  name """Broken Links"""
  type count
  sourcetype all
  analyze broken

# Broken links by node type
def chart BROKEN_BY_TYPE
  name """Broken Links by Type"""
  type bar
  sourcetype all
  analyze broken
  groupby nodetype

# Orphaned requirements
def table ORPHANED_REQS
  name """Orphaned Requirements"""
  sourcetype requirement
  analyze orphan
  columns symbolName, symbolType, outgoingCount
```

---

### GroupBy Keyword

Group results by property.

**Syntax:**
```sylang
groupby <property>
```

**Examples:**
```sylang
groupby status
groupby reqtype
groupby safetylevel
groupby nodetype
```

---

### OrderBy Keyword

Sort results by property.

**Syntax:**
```sylang
orderby <property> [asc|desc]
```

**Examples:**
```sylang
orderby name asc
orderby safetylevel desc
orderby status
```

---

### Span Keyword

Control widget size in grid.

**Syntax:**
```sylang
span <rows>x<columns>
```

**Default:** `1x1`

**Examples:**
```sylang
span 1x1  # Single cell
span 2x2  # 2×2 block
span 1x2  # Wide widget
span 2x1  # Tall widget
```

---

## Query Complexity Levels

### Level 1: Simple Queries
- Single `source`
- Optional `where`, `groupby`, `orderby`
- **NO** `correlate` or `analyze`

**Example:**
```sylang
sourcetype requirement where status = approved
groupby reqtype
```

---

### Level 2: Complex Queries
- Single `source`
- **HAS** `correlate` OR `analyze`
- Optional `where`, `groupby`, `orderby`

**Examples:**
```sylang
# Correlation
sourcetype requirement
correlate type testcase via satisfies

# Aggregate analysis
sourcetype all
analyze broken
groupby nodetype
```

---

### Level 3: Very Complex Queries
- Multiple `source` statements
- Custom `calculate` expressions
- Reverse lookup with `forward`/`reverse` keywords

**Examples:**
```sylang
# Multi-source comparison
sourcetype requirement where domain = safety
sourcetype requirement where domain = security

# Custom calculate
sourcetype requirement
correlate type testcase via satisfies
calculate (count(req) * 100) / count(all)

# Reverse lookup
sourcetype requirement
correlate type testcase via satisfies reverse
```

---

## Advanced Features

### Reverse Lookup

Follow relationships in reverse direction (find sources instead of targets).

**Syntax:**
```sylang
correlate type <nodetype> via <relationship> reverse
```

**Use Cases:**
- Find all requirements satisfied by a specific test
- Find all functions that implement requirements
- Impact analysis: "What references this symbol?"

**Examples:**
```sylang
# Forward: Find tests that satisfy requirements
sourcetype requirement
correlate type testcase via satisfies forward  # or just 'forward' (default)

# Reverse: Find requirements that ARE satisfied by tests
sourcetype testcase
correlate type requirement via satisfies reverse
```

**Performance Note:** Reverse lookup scans all symbols, so it may be slower for large projects.

---

### Multi-Source Queries

Compare or merge data from multiple sources.

**Syntax:**
```sylang
sourcetype <nodetype1> [where <conditions>]
sourcetype <nodetype2> [where <conditions>]
sourcetype <nodetype3> [where <conditions>]
```

**Use Cases:**
- Compare coverage across different domains
- Merge requirements from multiple sources
- Cross-domain analysis

**Examples:**
```sylang
# Compare safety vs security requirements
def chart DOMAIN_COMPARISON
  name """Requirements by Domain"""
  type bar
  sourcetype requirement where domain = safety
  sourcetype requirement where domain = security
  groupby status

# Multi-source count
def metric TOTAL_CRITICAL
  name """Total Critical Items"""
  type count
  sourcetype requirement where safetylevel = ASIL-D
  sourcetype hazard where severity = catastrophic
```

---

### Custom Calculate Expressions

Define custom formulas for derived metrics.

**Syntax:**
```sylang
calculate <expression>
```

**Supported Operations:**
- `count(x)` - Count of items
- `+`, `-`, `*`, `/` - Basic math
- `()` - Parentheses for grouping

**Use Cases:**
- Custom coverage formulas
- Weighted scores
- Composite metrics

**Examples:**
```sylang
# Traceability score (0-100%)
def metric TRACEABILITY_SCORE
  name """Traceability Score"""
  type gauge
  sourcetype requirement
  correlate type function via implements
  correlate type testcase via satisfies
  calculate (count(req) * 100) / count(all)

# Weighted coverage
def metric WEIGHTED_COVERAGE
  name """Weighted Coverage"""
  type percentage
  sourcetype requirement where status = approved
  correlate type testcase via satisfies
  calculate (count(req) * 2 + count(test)) / (count(req) * 3)
```

**Note:** Calculate expressions are evaluated after base query execution.

---

## Complete Example

```sylang
hdef dashboard EPB_SYSTEM_METRICS
  name """EPB System Metrics Dashboard"""
  owner """Systems Engineering Team"""
  version """1.0"""
  grid 3x4

  # Row 1: Key Metrics
  def metric TOTAL_REQUIREMENTS
    name """Total Requirements"""
    type count
    sourcetype requirement

  def metric APPROVED_REQUIREMENTS
    name """Approved Requirements"""
    type count
    sourcetype requirement where status = approved

  def metric TEST_COVERAGE
    name """Test Coverage"""
    type percentage
    sourcetype requirement where status = approved
    correlate type testcase via satisfies

  def metric BROKEN_LINKS
    name """Broken Links"""
    type count
    sourcetype all
    analyze broken

  # Row 2: Charts
  def chart REQ_BY_STATUS
    name """Requirements by Status"""
    type pie
    sourcetype requirement
    groupby status
    span 1x2

  def chart REQ_BY_LEVEL
    name """Requirements by Safety Level"""
    type bar
    sourcetype requirement where reqtype = functional
    groupby safetylevel
    orderby safetylevel desc
    span 1x2

  # Row 3: Traceability
  def chart TRACEABILITY_FLOW
    name """Traceability Flow"""
    type sankey
    sourcetype requirement
    correlate type function via implements
    correlate type testcase via satisfies
    span 2x2

  def table ORPHANED_REQS
    name """Orphaned Requirements"""
    sourcetype requirement
    analyze orphan
    columns symbolName, symbolType, outgoingCount, incomingCount
    span 2x2
```

---

## Best Practices

1. **Grid Planning**
   - Plan your grid size based on widget count
   - Use `span` for important widgets
   - Maximum cells = rows × columns

2. **Query Optimization**
   - Use `where` clauses to filter early
   - Avoid overly broad queries (`sourcetype all`)
   - Use specific node types when possible

3. **Widget Naming**
   - Use clear, descriptive names
   - Include metric type in name (e.g., "Test Coverage %")
   - Be consistent across dashboards

4. **Relationship Analysis**
   - Use `analyze` for quick insights
   - Use `correlate` for detailed traceability
   - Combine with `groupby` for breakdowns

5. **Layout Design**
   - Put key metrics at top (Row 1)
   - Use charts for trends (Row 2)
   - Use tables for details (Row 3)
   - Use `span` strategically

---

## Validation & Error Handling

### Common Errors

**Grid Overflow:**
```
Error: Grid overflow: 15 cells used, but grid is 3x4 (12 cells)
Recommendation: Increase grid size or reduce widget spans
```

**Invalid Node Type:**
```
Error: Invalid node type: requiremnt
Recommendation: Valid types: requirement, function, feature, ...
```

**Missing Property:**
```
Error: Metric type 'avg' requires 'property' keyword
Recommendation: Add: property <property_name>
```

**Analyze + Correlate Conflict:**
```
Error: Cannot use both 'analyze' and 'correlate' in same query
Recommendation: Use either analyze OR correlate, not both
```

---

## Tips & Tricks

### 1. Coverage Metrics
```sylang
# Requirements with tests
def metric REQ_WITH_TESTS
  name """Requirements with Tests"""
  type percentage
  sourcetype requirement
  correlate type testcase via satisfies
```

### 2. Safety-Critical Analysis
```sylang
# ASIL-D requirements
def chart ASIL_D_REQS
  name """ASIL-D Requirements"""
  type bar
  sourcetype requirement where safetylevel = ASIL-D
  groupby status
```

### 3. Traceability Gaps
```sylang
# Orphaned requirements (no tests)
def table ORPHANED_REQS
  name """Requirements Without Tests"""
  sourcetype requirement
  analyze orphan
  columns name, reqtype, owner
```

### 4. Multi-Hop Traceability
```sylang
# Req → Func → Test flow
def chart FULL_TRACEABILITY
  name """Full Traceability Chain"""
  type sankey
  sourcetype requirement
  correlate type function via implements
  correlate type testcase via satisfies
  span 2x2
```

---

## See Also

- [Sylang Complete Reference](SYLANG_COMPLETE_REFERENCE.md)
- [Relations Matrix Help](relations-matrix-help.md)
- [Specification Help](spec-help.md)

---

**Version:** 2.29.39  
**Last Updated:** 2025-10-27

---

# Sylang Extension System (.sylangextend)

## Overview

The Sylang Extension System allows you to add custom properties to existing node types without modifying the core language. This enables ontology-based customization for automotive, aerospace, agile, or any other industry-specific requirements.

**Key Features:**
- ✅ Add custom properties to any node type
- ✅ Define inline enums for controlled values
- ✅ Extend existing built-in enums with new values
- ✅ Type-safe validation (string, number, boolean, enum)
- ✅ Works seamlessly with all Sylang features (dashboards, traceability, doc views)
- ✅ Zero impact on existing files

---

## File Location

Place a `.sylangextend` file in your workspace root:

```
workspace/
  ├── .sylangextend          # Extension definitions
  ├── requirements/
  ├── tests/
  └── features/
```

The extension system automatically discovers and loads `.sylangextend` files when the workspace opens.

---

## Syntax

### Basic Rules

1. **All identifiers must be lowercase**
2. **No symbols** (no hyphens, underscores, special characters)
3. **Only alphanumeric characters** (letters + numbers)
4. **Indentation**: 4 spaces per level
5. **Comments**: Start with `#`

### Extend Node Types

Add custom properties to existing node types. `<nodetype>` is the word after `def` or `hdef` in the model: `requirement`, `testcase`, `function`, `block`, `hazard`, `feature`, `epic`, `story` and so on. A name that is not a node type is accepted but applies to nothing, so `test` does not extend test cases.

```sylang
extend nodetype <nodetype>
    property <name> <type>
    property <name> enum <value1> <value2> ...
```

**Supported Types:**
- `string` - Text values
- `number` - Numeric values
- `boolean` - true/false values
- `enum` - Controlled list of values (inline)

### Extend Enums

Add new values to existing built-in enum properties:

```sylang
extend enum <enumname>
    <value1>
    <value2>
    ...
```

---

## Examples

### Automotive (ISO 26262)

```sylang
# ISO 26262 Automotive Safety Extensions

extend nodetype requirement
    property asil enum qm asila asilb asilc asild
    property faultclass enum transient permanent intermittent
    property diagnosticcoverage number
    property safetymechanism string
    property fmearef string

extend nodetype testcase
    property testtype enum unit integration system
    property coverage number
    property asil enum qm asila asilb asilc asild

extend nodetype hazard
    property severity enum s0 s1 s2 s3
    property exposure enum e0 e1 e2 e3 e4 e5
    property controllability enum c0 c1 c2 c3

# Extend built-in enums
extend enum status
    underreview
    archived

extend enum priority
    showstopper
```

### Aerospace (DO-178C)

```sylang
# DO-178C Aerospace Extensions

extend nodetype requirement
    property dal enum a b c d e
    property certificationevidence string
    property traceability string
    property verificationmethod enum test analysis inspection

extend nodetype testcase
    property dal enum a b c d e
    property coveragetype enum statement decision mcdc
    property coveragepercent number

extend nodetype function
    property partitioning enum os app mixed
    property memoryprotection boolean

extend enum status
    certified
    pendingcertification
```

### Agile/Scrum

```sylang
# Agile/Scrum Extensions

extend nodetype requirement
    property storypoints number
    property sprint string
    property epic string
    property acceptancecriteria string

extend nodetype testcase
    property automationpriority enum high medium low
    property estimatedhours number

extend nodetype epic
    property businessvalue number
    property targetquarter string
    property theme string

extend enum priority
    musthave
    shouldhave
    nicetohave
```

---

## Usage in Sylang Files

Once defined in `.sylangextend`, use extended properties like built-in properties:

### Requirements File (.req)

```sylang
def requirement EPB_REQ_001
    name """Emergency brake activation"""
    description """System shall activate emergency brake when..."""
    
    # Built-in properties
    status approved
    priority high
    
    # Extended properties (from .sylangextend)
    asil asild                    # Automotive
    faultclass permanent          # Automotive
    diagnosticcoverage 99         # Automotive
    safetymechanism """redundancy"""  # Automotive
    storypoints 8                 # Agile
    sprint """Sprint 5"""             # Agile
```

### Test File (.tst)

```sylang
def testcase EPB_TEST_001
    name """Emergency brake activation test"""
    
    # Built-in properties
    status approved
    method HIL
    
    # Extended properties
    testtype integration          # Automotive
    coverage 95                   # Automotive
    asil asild                    # Automotive
    automationpriority high       # Agile
    estimatedhours 4              # Agile
```

---

## Dashboard Integration

Extended properties work seamlessly in dashboards:

```sylang
# Count requirements by ASIL level
  def metric ASILD_REQUIREMENTS
    name "ASIL-D Requirements"
    type count
    sourcetype requirement
    where asil = asild

  # Chart requirements by fault class
  def chart FAULT_DISTRIBUTION
    name "Requirements by Fault Class"
    type pie
    sourcetype requirement
    groupby faultclass

  # Table of high-priority safety requirements
  def table SAFETY_CRITICAL
    name "Safety-Critical Requirements"
    sourcetype requirement
    where asil in (asild, asilc) and priority = high
    columns name, asil, faultclass, safetymechanism
    orderby asil desc
```

---

## In Sylang Studio

Extended properties behave like built-in ones in the Studio inspector:

- They are listed with the element's other properties, and can be added from the **Property…** menu
- Enum and boolean properties are edited from a menu of their values; numbers get a number field
- Enum values added to a built-in enum (for example a `safetylevel` of `SIL-2`) appear in that enum's menu

---

## Validation

### Valid Examples

```sylang
# ✅ Correct syntax
extend nodetype requirement
    property criticality enum low medium high critical
    property domain string
    property testcoverage number
    property verified boolean

# ✅ Correct enum extension
extend enum status
    underreview
    archived
```

### Invalid Examples

```sylang
# ❌ Uppercase not allowed
extend nodetype Requirement
    property Criticality enum Low Medium High

# ❌ Hyphens not allowed
extend nodetype requirement
    property test-coverage number
    property asil-level enum ASIL-D ASIL-C

# ❌ Underscores not allowed
extend nodetype requirement
    property test_coverage number
    property asil_level enum asil_d asil_c

# ❌ Incorrect indentation
extend nodetype requirement
  property criticality enum low medium high  # Only 2 spaces
```

### Sanitization Suggestions

The extension system provides helpful error messages:

```
❌ "Property 'test-coverage' contains invalid characters. 
    Use lowercase letters and numbers only. 
    Suggestion: 'testcoverage'"

❌ "Enum value 'ASIL-D' contains invalid characters. 
    Use lowercase letters and numbers only. 
    Suggestion: 'asild'"
```

---

## Type Validation

### String Properties

```sylang
property domain string
```

**Usage:**
```sylang
domain """safety"""
domain """powertrain"""
```

**Validation:** Any string value is valid

### Number Properties

```sylang
property testcoverage number
property storypoints number
```

**Usage:**
```sylang
testcoverage 95
testcoverage 99.5
storypoints 8
```

**Validation:** Must be a valid number

**Error:**
```
❌ """Property 'testcoverage' expects a number, got 'high'"""
```

### Boolean Properties

```sylang
property verified boolean
property memoryprotection boolean
```

**Usage:**
```sylang
verified true
verified false
```

**Validation:** Must be `true` or `false`

**Error:**
```
❌ """Property 'verified' expects a boolean (true/false), got 'yes'"""
```

### Enum Properties

```sylang
property criticality enum low medium high critical
```

**Usage:**
```sylang
criticality high
criticality critical
```

**Validation:** Must be one of the defined enum values

**Error:**
```
❌ "Invalid enum value 'superhigh' for property 'criticality'. 
    Valid values: low, medium, high, critical"
```

---

## Extending Built-in Enums

Sylang has built-in enum properties like `status`, `priority`, `reqtype`. You can add new values:

### Built-in Enums

- `status`: draft, review, approved, deprecated, implemented, accepted, rejected, etc.
- `priority`: low, medium, high, critical
- `reqtype`: functional, nonfunctional, system, software, hardware, interface, safety, etc.
- `safetylevel`: ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM, SIL-1, SIL-2, SIL-3, SIL-4
- `method`: MIL, SIL, PIL, HIL, VIL, manual, automated
- `testresult`: pass, fail, intest, notrun, blocked

### Extending Built-in Enums

```sylang
# Add new status values
extend enum status
    underreview
    archived
    pendingapproval

# Add new priority values
extend enum priority
    showstopper
    blocker

# Add new requirement types
extend enum reqtype
    business
    legal
    regulatory
```

**Usage:**
```sylang
def requirement REQ_001
    status underreview        # New value from extension
    priority showstopper      # New value from extension
    reqtype business          # New value from extension
```

---

## Best Practices

### 1. Use Descriptive Names

```sylang
# ✅ Good
property diagnosticcoverage number
property verificationmethod enum test analysis inspection

# ❌ Avoid abbreviations
property diagcov number
property vermethod enum t a i
```

### 2. Group Related Properties

```sylang
# ✅ Good - group by domain
extend nodetype requirement
    # Safety properties
    property asil enum qm asila asilb asilc asild
    property safetymechanism string
    property fmearef string
    
    # Agile properties
    property storypoints number
    property sprint string
    property epic string
```

### 3. Use Enums for Controlled Values

```sylang
# ✅ Good - use enum for controlled values
property testtype enum unit integration system

# ❌ Avoid string for controlled values
property testtype string  # Allows any value, no validation
```

### 4. Document Your Extensions

```sylang
# ISO 26262 Automotive Safety Extensions
# Compliant with ISO 26262:2018

extend nodetype requirement
    property asil enum qm asila asilb asilc asild  # Automotive Safety Integrity Level
    property faultclass enum transient permanent intermittent  # Fault classification
```

---

## Hot Reload

The extension system automatically reloads when `.sylangextend` files change:

1. **Edit** `.sylangextend` file
2. **Save** the file
3. **Automatic reload** - all open files are revalidated
4. **Diagnostics update** - errors/warnings refresh immediately

---

## Troubleshooting

### Extension Not Loading

**Problem:** Properties not recognized

**Solution:**
1. Check file name is exactly `.sylangextend` (no `.txt` or other extension)
2. Check the file is inside the workspace (every `.sylangextend` in the workspace is loaded)
3. Check VS Code Output panel for errors
4. Reload VS Code window: `Ctrl+Shift+P` → "Reload Window"

### Validation Errors

**Problem:** "Invalid characters" error

**Solution:**
- Use only lowercase letters and numbers
- Remove hyphens: `test-coverage` → `testcoverage`
- Remove underscores: `test_coverage` → `testcoverage`
- Remove uppercase: `TestCoverage` → `testcoverage`

### Property Not Showing in Studio

**Problem:** Extended property doesn't appear in the Studio inspector

**Solution:**
1. Ensure the property is defined in `.sylangextend` for the element's kind (the word after `def`)
2. Save the `.sylangextend` file
3. Close and reopen the Sylang file

---

## FAQ

### Q: Can I create new node types?

**A:** No. The extension system only allows adding properties to existing node types (requirement, testcase, feature, etc.). This maintains architectural consistency.

### Q: Can I create new relationships?

**A:** No. Only properties can be extended. Relationships are part of the core language architecture.

### Q: Can I have multiple `.sylangextend` files?

**A:** Currently, the system loads all `.sylangextend` files in the workspace and merges them. Properties from all files are combined.

### Q: Do extended properties work in all features?

**A:** Yes! Extended properties work in:
- ✅ Validation and diagnostics
- ✅ The Studio inspector (shown, edited and added like built-in properties)
- ✅ Dashboard and spec queries (`where`, `groupby`, `orderby`, `columns`)

They do not create traceability: relations are part of the core language.

### Q: What happens if I remove a property from `.sylangextend`?

**A:** Files using that property will show validation errors. The values stay in the files and are reported as unknown properties until you remove them or define the property again.

### Q: Can I use extended properties in relationships?

**A:** Extended properties are for data only. Relationships use the built-in relationship keywords (satisfies, implements, etc.).

---

## Version

Extension system introduced in **Sylang v2.29.0**

---

## See Also

- [Sylang Language Reference](SYLANG_COMPLETE_REFERENCE.md)
- [Dashboard Help](dash-help.md)
- [Requirements Help](req-help.md)
- [Test Help](tst-help.md)
