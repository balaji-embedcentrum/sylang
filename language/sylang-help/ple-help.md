---
**📚 Sylang Help Documentation | Version 3.0.16**
---

> **Strings:** write single-line text in double quotes, `"like this"`. Use triple quotes `"""..."""` for text that spans several lines or contains a `"`. Both forms are valid in every property.

# Product Line Engineering (.ple)

## Overview
The `.ple` file is the **root file** of a Sylang project: the first thing a reader opens. It describes the product line and names the two places the model continues: its feature model (`variesby`) and its top-level system block (`realizedby`). Studio and the browser viewer build the model's hierarchy from these links: product line, then features and variants, then the system and everything it decomposes to.

## File Structure Rules
- **ONE** `hdef productline` statement per file
- `use` imports only the feature model and the top-level block: `use featureset …` and `use block …`
- **NO** `def` statements (only properties and the two relations under hdef)

## Valid Keywords
```
use, hdef, productline, name, description, owner, domain, compliance,
firstrelease, tags, safetylevel, status, region, variesby, realizedby
```

## Syntax Structure
```
use featureset [featureset-identifier]
use block [top-level-block-identifier]

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
  variesby ref featureset [featureset-identifier]
  realizedby ref block [top-level-block-identifier]
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

### Relations
- `variesby ref featureset` - The feature model of the product line (the `.fml` file's header).
- `realizedby ref block` - The top-level block: the system the product line is built as. Name the block whose `decomposesto` reaches the subsystems, not context blocks such as the vehicle, the battery or the motor that only sit next to it.

Both are optional, and both may list more than one target (a platform with two systems, say). Without them the viewer guesses: the only feature model, and blocks that nothing decomposes to.

### Compliance views
The `compliance` list decides which compliance views Studio and the viewer compute. A list that mentions ISO 26262 shows the ISO 26262 work products; one that mentions Automotive SPICE (or ASPICE) shows the SPICE processes. A product line that lists neither, such as an IT product with `compliance "SOC 2", "ISO 27001"`, shows no automotive compliance at all. Without a `.ple`, or without a `compliance` property, the views appear only when the model holds ISO 26262 content (an item definition, hazards, safety goals or ASIL ratings).

## Complete Example

```sylang
use featureset AutonomousVehicleFeatures
use block AutonomousVehicleSystem

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
  variesby ref featureset AutonomousVehicleFeatures
  realizedby ref block AutonomousVehicleSystem
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

### IT and Software Product Line
```sylang
use featureset ShopFeatures
use block ShopPlatform

hdef productline ShopPlatformProductLine
  name "Online Shop Platform"
  description "Multi-tenant shop platform with Standard and Enterprise editions"
  owner "Platform Engineering"
  domain "e-commerce", "saas"
  compliance "SOC 2", "ISO 27001", "PCI DSS"
  region "Europe", "North America"
  variesby ref featureset ShopFeatures
  realizedby ref block ShopPlatform
```
No ISO 26262 or Automotive SPICE views appear for this product line, because its `compliance` list names neither.

## Relationship to Other Files
The `.ple` file points down to the feature model and the top-level block:
```sylang
# ProductLine.ple
use featureset AutonomousFeatures
use block AutonomousVehicleSystem

hdef productline AutonomousVehicleProductLine
  variesby ref featureset AutonomousFeatures
  realizedby ref block AutonomousVehicleSystem
```

The feature model points back with `listedfor`:
```sylang
# FeatureModel.fml
use productline AutonomousVehicleProductLine

hdef featureset AutonomousFeatures
  listedfor ref productline AutonomousVehicleProductLine
  # ... features
```

The top-level block decomposes to the subsystems, which is how the hierarchy continues:
```sylang
# System/Vehicle.blk
use block Perception
use block Planning
use block VehicleControl

hdef block AutonomousVehicleSystem
  level system
  decomposesto ref block Perception, Planning, VehicleControl
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
✅ `use` only for the feature model (`use featureset`) and the top-level block (`use block`)  
✅ `variesby` points at a featureset, `realizedby` at a block  
✅ No `def` statements allowed  
✅ Multiline strings use `"""` triple quotes  
❌ Cannot use `when ref config` (config not allowed in .ple)

## File Organization
Place `.ple` file at the **root** of your product line directory:
```
ProductLine/
├── ProductLine.ple          # Root: variesby the feature model, realizedby the system block
├── Features/
│   └── Features.fml         # listedfor the .ple
├── Architecture/
│   ├── Blocks.blk
│   └── Functions.fun
└── Requirements/
    └── Requirements.req
```

---

**Next Steps**: After creating your `.ple` file, create a `.fml` file to define your feature model.

