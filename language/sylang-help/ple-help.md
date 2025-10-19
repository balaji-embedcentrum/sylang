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
firstrelease, tags, safetylevel, region
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
  name "Autonomous Vehicle Platform Product Line"
  description """
    Comprehensive autonomous vehicle system covering ADAS, infotainment, 
    powertrain, and safety systems for Level 3 autonomous driving capabilities.
    """
  owner "Vehicle Systems Engineering Team"
  domain "autonomous-vehicles", "automotive-safety", "ADAS", "connected-mobility"
  compliance "ISO 26262", "ISO 21448", "UN ECE R79", "SAE J3016"
  firstrelease "2026-03-01"
  tags "autonomous-driving", "L3-automation", "safety-critical", "connected-vehicle"
  safetylevel ASIL-D
  region "Global", "North America", "Europe", "Asia-Pacific"
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
compliance "ISO 26262", "ISO 21448", "SAE J3016", "UN ECE R79"
```

### 3. Accurate Domain Tags
Use specific, searchable domain terms:
```sylang
domain "autonomous-vehicles", "automotive-safety", "ADAS", "sensor-fusion"
tags "L3-automation", "safety-critical", "real-time", "AI-enabled"
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
  name "Advanced Driver Assistance Systems Product Line"
  description "ADAS features from basic to Level 3 autonomy"
  owner "ADAS Engineering Team"
  domain "automotive-safety", "ADAS", "driver-assistance"
  compliance "ISO 26262", "UN ECE R79", "UN ECE R157"
  safetylevel ASIL-D
  region "Global"
```

### Medical Device Product Line
```sylang
hdef productline MedicalMonitoringProductLine
  name "Patient Monitoring Systems Product Line"
  description "Comprehensive patient vital signs monitoring platform"
  owner "Medical Systems Engineering"
  domain "medical-devices", "patient-monitoring", "healthcare"
  compliance "IEC 62304", "ISO 13485", "ISO 14971"
  safetylevel SIL-3
  region "North America", "Europe"
```

### Industrial Automation Product Line
```sylang
hdef productline IndustrialAutomationProductLine
  name "Smart Factory Automation Product Line"
  description "Industry 4.0 automation and control systems"
  owner "Industrial Systems Team"
  domain "industrial-automation", "IIoT", "smart-manufacturing"
  compliance "IEC 61508", "ISO 13849"
  safetylevel SIL-2
  region "Global"
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

