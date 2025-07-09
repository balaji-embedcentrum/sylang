# ITM File Validation Rules

This document describes the comprehensive validation rules implemented for `.itm` (Safety Items) files in the Sylang VS Code extension.

## Overview

`.itm` files are used for Hazard Analysis and Risk Assessment (HARA) documentation in accordance with ISO 26262. The validator enforces proper syntax, structure, and safety engineering best practices.

## File Structure Requirements

### 1. File Header
- **MUST** start with: `def hazardanalysis <identifier>`
- Identifier must use PascalCase naming (e.g., `InverterSafety`)
- Example: `def hazardanalysis InverterSafety`

### 2. Required Properties
Must include these properties with quoted values:
- `name "Display Name"`
- `description "Detailed description"`
- `owner "Team Name"`
- `reviewers "Team1", "Team2", ...`

### 3. Required Sections
The following sections are mandatory:

#### itemdef
Defines the item scope and boundaries:
```sylang
itemdef
  productline <ProductLineName>
  systemfeatures <SystemFeaturesName>
  systemfunctions <SystemFunctionsName>
  subsystems
    <SubsystemName1>
    <SubsystemName2>
  systemboundaries
    includes
      def boundary <ID> "Description"
    excludes
      def boundary <ID> "Description"
```

#### operationalscenarios
Defines operational scenarios:
```sylang
operationalscenarios
  def scenario <SCEN_ID>
    description "Scenario description"
    vehiclestate <StateName>
    environment <EnvName>
    driverstate <DriverStateName>
```

#### vehiclestates
Defines vehicle operational states:
```sylang
vehiclestates
  def vehiclestate <StateName>
    description "State description"
    characteristics "State characteristics"
```

#### safetyconcept
Defines safety strategy and principles:
```sylang
safetyconcept
  def overallsafetystrategy <ID>
    principle <PRIN_ID> "Safety principle"
  def assumptionsofuse <ID>
    assumption <ASSUMP_ID> "Assumption description"
  def foreseesablemisuse <ID>
    misuse <MISUSE_ID> "Misuse case description"
```

## Validation Rules

### Syntax Rules
1. **def Keyword**: All definitions must use `def` keyword
2. **Identifiers**: Must use PascalCase (start with capital letter)
3. **Indentation**: Consistent 2-space or tab indentation
4. **Quoted Properties**: Description, name, range, impact, etc. must be quoted

### Structure Rules
1. **Section Order**: Sections can appear in any order but all required ones must be present
2. **Nesting**: Proper indentation levels for nested elements
3. **Cross-References**: Referenced states and environments should be defined

### Content Rules
1. **Valid Keywords**: Only recognized keywords allowed in each section
2. **Property Validation**: Each definition type has specific required properties
3. **Naming Conventions**: Consistent naming patterns for IDs and references

## Error Types

### Critical Errors (Red Underlines)
- Missing `def hazardanalysis` at file start
- Missing required sections (itemdef, operationalscenarios, vehiclestates, safetyconcept)
- Invalid def types or keywords
- Malformed identifiers

### Warnings (Yellow Underlines)
- Unquoted property values
- Style guide violations
- Optional but recommended sections missing

## Valid def Types

The following def types are recognized in .itm files:
- `scenario` - Operational scenarios
- `vehiclestate` - Vehicle operational states
- `drivingstate` - Driver states
- `environment` - Environmental conditions
- `boundary` - System boundaries
- `overallsafetystrategy` - Safety strategy
- `assumptionsofuse` - Usage assumptions
- `foreseesablemisuse` - Foreseeable misuse cases

## Valid Section Keywords

### itemdef Section
- `productline` - Reference to product line
- `systemfeatures` - Reference to feature model
- `systemfunctions` - Reference to functions
- `subsystems` - List of subsystems
- `systemboundaries` - System boundaries
- `includes` - Included boundaries
- `excludes` - Excluded boundaries

### operationalscenarios Section
- `def scenario` - Scenario definition
- `description` - Scenario description
- `vehiclestate` - Associated vehicle state
- `environment` - Environmental conditions
- `driverstate` - Driver state

### vehiclestates Section
- `def vehiclestate` - Vehicle state definition
- `description` - State description
- `characteristics` - State characteristics

### driverstates Section
- `def drivingstate` - Driver state definition
- `description` - State description
- `characteristics` - Driver characteristics

### environments Section
- `def environment` - Environment definition
- `description` - Environment description
- `conditions` - Environmental conditions

### safetyconcept Section
- `def overallsafetystrategy` - Safety strategy
- `def assumptionsofuse` - Usage assumptions
- `def foreseesablemisuse` - Misuse cases

## Example Valid .itm File

```sylang
def hazardanalysis InverterSafety
  name "Automotive Electric Vehicle Inverter - Hazard Analysis and Risk Assessment"
  description "Comprehensive HARA documentation for the automotive inverter system"
  owner "Functional Safety Team"
  reviewers "Systems Engineering", "Safety Engineering"
  
  itemdef
    productline AutomotiveInverter
    systemfeatures InverterFeatures
    systemfunctions InverterFunctions
    subsystems
      PowerConversion
      MotorControl
      ThermalManagement
    
    systemboundaries
      includes
        def boundary INV_BOUND_001 "Power electronics switching circuits"
      excludes
        def boundary INV_EXCL_001 "Vehicle traction battery system"
  
  operationalscenarios
    def scenario SCEN_001_NormalDriving
      description "Standard electric vehicle operation"
      vehiclestate DriveMode
      environment ENV_NORMAL
      driverstate AttentiveDriver
  
  vehiclestates
    def vehiclestate DriveMode
      description "Vehicle in normal driving operation"
      characteristics "Motor providing propulsion, inverter active control"
  
  driverstates
    def drivingstate AttentiveDriver
      description "Alert driver with full attention on driving"
      characteristics "Proper training, no impairment"
  
  environments
    def environment ENV_NORMAL
      description "Normal weather and operating conditions"
      conditions TEMP_RANGE_001, VOLTAGE_RANGE_001
  
  safetyconcept
    def overallsafetystrategy STRATEGY_001
      principle PRIN_001 "Prevention of uncontrolled torque output"
    
    def assumptionsofuse ASSUMPTIONS_001
      assumption ASSUMP_001 "Driver is trained in electric vehicle operation"
    
    def foreseesablemisuse MISUSE_001
      misuse MISUSE_CASE_001 "Operating inverter beyond rated power continuously"
```

## Testing

To test the validation:

1. Open any `.itm` file in VS Code
2. The validator will automatically check syntax and structure
3. Errors and warnings will appear as red/yellow underlines
4. Hover over underlines to see specific error messages
5. Use "Problems" panel to see all validation issues

## Integration

The .itm validator is part of the broader Sylang safety validation framework and integrates with:
- Syntax highlighting for safety keywords
- Code completion for safety structures
- Cross-file symbol navigation
- ISO 26262 compliance checking 