# Variant Configuration (.vcf)

## Overview
The `.vcf` file contains **configuration values** (0 or 1) for each feature in a variant. It is **AUTO-GENERATED** from `.vml` files and should never be created manually.

## ⚠️ IMPORTANT: AUTO-GENERATED FILE
**DO NOT CREATE MANUALLY!**  
Use the command: **Right-click `.vml` file → "Generate VCF from VML"**

## File Structure Rules (NEW SYNTAX v2.21.85)
- **ONE** `hdef configset` statement per file
- **ONE** `.vcf` file per folder (strict limitation)
- **MULTIPLE** `def config` statements
- Must `use featureset` AND `use variantset` at the top
- Each config uses `basedon ref feature` for traceability

## Valid Keywords
```
use, hdef, configset, def, config, name, description, owner, tags,
generatedfrom, generatedat, basedon, ref, feature, featureset, variantset
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

## Complete Example (NEW SYNTAX)

```sylang
use featureset AutonomousVehicleFeatures
use variantset AutonomousVehicleVariants_Premium

hdef configset AutonomousVehicleConfig_Premium
  name "Premium Autonomous Vehicle Configuration"
  description """
    Auto-generated configuration for premium autonomous vehicle variant 
    with full sensor suite and advanced HMI features.
    """
  owner "Product Engineering"
  generatedfrom ref variantset AutonomousVehicleVariants_Premium
  generatedat "2025-10-01T17:30:45.123Z"
  tags "variant", "config", "auto-generated", "premium"

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
  name "Basic Vehicle Configuration"
  generatedfrom ref variantset BasicVariant
  generatedat "2025-10-01T10:00:00.000Z"

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
  name "Premium Vehicle Configuration"
  
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
✅ All features from `.vml` must have corresponding configs  
✅ Symbol manager validates configs against source `.vml`  
❌ DO NOT create manually - use "Generate VCF from VML" command  
❌ Cannot add configs not derived from `.fml` → `.vml` pipeline  
❌ Cannot have multiple `.vcf` files in same folder

## NEW SYNTAX Benefits (v2.21.85)

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
- Symbol manager validates config legitimacy

## Generation Workflow

### Step 1: Feature Model
```sylang
# Features.fml
def feature CoreFeatures mandatory
  def feature Feature1 mandatory
  def feature Feature2 optional
```

### Step 2: Generate Variant
**Right-click `.fml` → "Generate VML from FML"**
```sylang
# Features.vml
extends ref feature CoreFeatures mandatory selected
  extends ref feature Feature1 mandatory selected
  extends ref feature Feature2 optional  # NOT selected
```

### Step 3: Generate Configuration
**Right-click `.vml` → "Generate VCF from VML"**
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

