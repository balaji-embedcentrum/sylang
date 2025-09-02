# Sylang Language Specification

**A Domain-Specific Language for Model-Based Systems Engineering and Digital Twin Development**

Copyright © 2025 Balaji Boominathan

## Overview

Sylang is a specialized domain-specific language designed for AI-assisted systems engineering, following the principle that "AI is the creator and human is the validator" (Andrej Karpathy). This language enables the creation of artifacts for complex safety-critical systems across Automotive, Aerospace, Medical, and Industrial domains.

## Language Philosophy

Sylang and related tools were created for AI to assist in creating artifacts for systems development that satisfies not only generic system design, but also scalable complex safety critical systems. The tailored version can be used in general PC/Web based software solutions as well.

## File Extensions and Structure

Sylang language is represented by various file extensions to differentiate the purpose and focus of the file serving the entire project. The language uses **indentation-based structure** (no braces, brackets, or begin/end keywords) and supports both single-line (`//`) and multi-line (`/* */`) comments.

### Currently Implemented Extensions (v2.0.2)

#### Product Line Management
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.ple` | Product Line Engineering | Only one per project |
| `.fml` | Feature Model Language | Only one per project |
| `.vml` | Variant Model Language | Multiple allowed, derived from `.fml` |
| `.vcf` | Variant Configuration Format | Auto-generated from `.vml`, only one allowed |

#### Systems Engineering
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.blk` | Block Definition Language | Multiple allowed at any hierarchical level |
| `.fun` | Function Group Language | Multiple allowed at various levels |
| `.req` | Requirements Language | Multiple allowed at various levels |
| `.tst` | Test Suite Language | Multiple allowed at various levels |

#### Systems Analysis
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.fma` | Failure Mode Analysis | One per folder allowed |
| `.seq` | Sequence Diagrams | Multiple allowed |
| `.flr` | Failure Analysis | Multiple allowed |

#### Safety Analysis (Planned)
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.itm` | Item Definition Language | One per folder allowed |
| `.haz` | Hazard Analysis Language | One per folder allowed |
| `.rsk` | Risk Assessment Language | One per folder allowed |
| `.sgl` | Safety Goals Language | One per folder allowed |

## Core Grammar Structure

### Basic Grammar
```bnf
<sylang_file> ::= <import_statements>? <header_definition> <body_definitions>*

<import_statements> ::= <use_statement>+
<use_statement> ::= "use" <header_def_keyword> <identifier_list>

<header_definition> ::= "hdef" <header_def_keyword> <identifier> <properties_and_relations>*

<body_definitions> ::= <definition>*
<definition> ::= "def" <def_keyword> <identifier> <optional_flag>? <properties_and_relations>*

<properties_and_relations> ::= <property_statement> | <relation_statement>
<property_statement> ::= <property_keyword> <property_value>
<relation_statement> ::= <relation_keyword> "ref" <target_type> <identifier_list>
```

### Indentation Rules
1. **Consistent indentation** - Use either 2 spaces OR 1 tab per level
2. **No mixing** - Cannot mix tabs and spaces
3. **Logical hierarchy** - Indentation reflects logical structure
4. **Empty lines** - Don't require indentation, don't affect structure

### Comment Syntax
- **Single-line**: `// This is a comment`
- **Multi-line**: `/* This is a multi-line comment */`

## File Extension Specifications

### .ple (Product Line Engineering)

**Purpose**: Define top-level product line structure. Only one `.ple` file allowed per project.

**Keywords**:
- `hdef productline <ProductLineName>` - Header definition
- `name` - Product line name
- `description` - Detailed description
- `owner` - Owner/responsible party
- `domain` - Application domains (comma-separated)
- `compliance` - Compliance standards (comma-separated)
- `firstrelease` - First release date (YYYY-MM-DD)
- `tags` - Classification tags (comma-separated)
- `safetylevel` - Safety integrity level enum
- `region` - Target regions (comma-separated)

**Example**:
```sylang
hdef productline BloodPressureProductLine
  name "Digital Blood Pressure Monitor"
  description "Comprehensive digital blood pressure monitoring system for home and clinical use"
  owner "Medical Device Engineering Team"
  domain "medical-devices", "health-monitoring", "connected-health"
  compliance "ISO 14971", "IEC 62304", "ISO 13485", "FDA 21 CFR 820", "EU MDR"
  firstrelease "2025-06-01"
  tags "blood-pressure", "sphygmomanometer", "digital-health", "WiFi"
  safetylevel ASIL-C
  region "Global", "North America", "Europe", "Asia-Pacific"
```

**Rules**:
- No `use` statements allowed
- Only one per project
- All properties are optional except header definition

### .fml (Feature Model Language)

**Purpose**: Define feature structure and relationships. Only one `.fml` file allowed per project.

**Keywords**:
- `hdef featureset <FeatureSetName>` - Header definition
- `def feature <FeatureName> <flag>` - Feature definition
- `listedfor ref productline <ProductLineId>` - Links to product line
- `inherits ref featureset <FeatureSetId>` - Inherits from parent feature set
- `enables ref feature <FeatureId1>, <FeatureId2>` - Enables other features
- `requires ref feature <FeatureId1>, <FeatureId2>` - Requires other features
- `excludes ref feature <FeatureId1>, <FeatureId2>` - Mutually exclusive features

**Feature Flags**:
- `mandatory` - Must be selected if parent is selected
- `optional` - May be selected if parent is selected
- `or` - At least one sibling with `or` flag must be selected
- `alternative` - At most one sibling with `alternative` flag can be selected

**Example**:
```sylang
hdef featureset BloodPressureFeatures
  name "Blood Pressure Monitor Feature Set"
  listedfor ref productline BloodPressureProductLine

  def feature CoreMeasurement mandatory
    name "Core Blood Pressure Measurement"
    
    def feature OscillometricMethod mandatory
      name "Oscillometric Measurement Method"
      
    def feature AuscultationMethod optional
      name "Auscultation Method Support"

  def feature ConnectivityFeatures optional
    name "Connectivity and Data Sharing"
    
    def feature WiFiConnectivity or
      name "WiFi Connectivity"
      
    def feature BluetoothConnectivity or
      name "Bluetooth Low Energy connectivity"
```

### .vml (Variant Model Language)

**Purpose**: Define specific product variants derived from feature models. Multiple `.vml` files allowed per project.

**Keywords**:
- `hdef variantset <VariantSetName>` - Header definition
- `derivedfor ref featureset <FeatureSetId>` - Links to source feature model
- `inherits ref variantset <VariantSetId>` - Inherits from parent variant
- `extends ref feature <FeatureId> <flag> <selection>` - Feature selection

**Selection States**:
- `selected` - Feature is selected in this variant
- `deselected` - Feature is explicitly not selected

**Example**:
```sylang
hdef variantset BloodPressureBasicVariant
  name "Basic Blood Pressure Monitor"
  derivedfor ref featureset BloodPressureFeatures

  extends ref feature CoreMeasurement mandatory selected
    extends ref feature OscillometricMethod mandatory selected
    extends ref feature AuscultationMethod optional deselected

  extends ref feature ConnectivityFeatures optional deselected
    extends ref feature WiFiConnectivity or deselected
    extends ref feature BluetoothConnectivity or deselected
```

### .vcf (Variant Configuration Format)

**Purpose**: Auto-generated configuration files from variant models. Only one `.vcf` file allowed per project.

**Generation**: Right-click `.vml` file → "Generate variant config (.vcf)"

**Keywords**:
- `hdef configset <ConfigSetName>` - Header definition
- `generatedfor ref variantset <VariantSetId>` - Source variant set
- `generatedon "YYYY-MM-DDTHH:MM:SSZ"` - Generation timestamp
- `config feature <FeatureName> <state>` - Feature configuration state

**States**:
- `enabled` - Feature is enabled
- `disabled` - Feature is disabled

### .blk (Block Definition Language)

**Purpose**: Define system architecture and component structure. Multiple `.blk` files allowed per project.

**Keywords**:
- `hdef block <BlockName>` - Header definition
- `def port <PortName> <direction>` - Port definition
- `def block <ChildBlockName>` - Nested block definition
- `composedof ref block <BlockId1>, <BlockId2>` - Block composition
- `needs ref port <PortId1>, <PortId2>` - Port dependencies
- `level <LEVEL_ENUM>` - Hierarchical level

**Port Directions**:
- `input` - Input port
- `output` - Output port
- `bidirectional` - Bidirectional port

**Level Enums**:
- `productline`, `system`, `subsystem`, `component`, `module`, `interface`

**Example**:
```sylang
hdef block BloodPressureMonitorSystem
  name "Blood Pressure Monitor System"
  level system
  safetylevel ASIL-C

  def port PowerInput input
    name "Power Input"
    datatype voltage_12V
    
  def port MeasurementOutput output
    name "Measurement Data Output"
    datatype bp_measurement_data

  def block MeasurementSubsystem
    name "Measurement Subsystem"
    level subsystem
    
    def block PressureSensor
      name "Pressure Sensor"
      level component

  composedof ref block MeasurementSubsystem
  needs ref port PowerInput
```

### .fun (Function Group Language)

**Purpose**: Define functional behavior and requirements. Multiple `.fun` files allowed per project.

**Keywords**:
- `hdef functiongroup <FunctionGroupName>` - Header definition
- `def function <FunctionName>` - Function definition
- `input <input_specification>` - Function inputs
- `output <output_specification>` - Function outputs
- `behavior <behavior_specification>` - Behavior specification
- `inherits ref functiongroup <FunctionGroupId>` - Function group inheritance

**Example**:
```sylang
hdef functiongroup BloodPressureFunctions
  name "Blood Pressure Monitor Functions"
  level system
  safetylevel ASIL-C

  def function MeasurementControl
    name "Blood Pressure Measurement Control"
    input user_command, system_state
    output measurement_result, system_status
    safetylevel ASIL-C
    
    behavior
      when user_command.start_measurement
        validate system_ready
        initiate cuff_inflation
        execute oscillometric_analysis
        calculate bp_values
        display results
```

### .req (Requirements Language)

**Purpose**: Define system requirements and traceability. Multiple `.req` files allowed per project.

**Keywords**:
- `hdef requirementset <RequirementSetName>` - Header definition
- `def requirement <RequirementName>` - Requirement definition
- `reqtype <REQUIREMENT_TYPE>` - Type of requirement
- `derivedfrom ref requirement <RequirementId1>, <RequirementId2>` - Parent requirements
- `allocatedto ref block <BlockId>` - Allocated to system block
- `implements ref function <FunctionId>` - Implements specific function
- `rationale "rationale text"` - Justification for requirement
- `verificationcriteria "criteria text"` - How requirement will be verified
- `status <STATUS_ENUM>` - Current requirement status

**Requirement Types**:
- `system`, `functional`, `performance`, `safety`, `security`, `usability`

**Status Enum**:
- `draft`, `review`, `approved`, `deprecated`, `implemented`

### .tst (Test Suite Language)

**Purpose**: Define test cases and validation procedures. Multiple `.tst` files allowed per project.

**Keywords**:
- `hdef testset <TestSetName>` - Header definition
- `def testcase <TestCaseName>` - Test case definition
- `satisfies ref requirement <RequirementId>` - Test validates specific requirement
- `method <TEST_METHOD>` - Test execution method
- `setup "setup description"` - Test setup description
- `steps "execution steps"` - Test execution steps
- `expected "expected results"` - Expected test results
- `passcriteria "pass criteria"` - Criteria for test pass
- `testresult <TEST_RESULT>` - Current test status

**Test Methods**:
- `HIL`, `SIL`, `MIL`, `manual`, `automated`

**Test Results**:
- `pass`, `fail`, `intest`, `blocked`, `notrun`

### .fma (Failure Mode Analysis)

**Purpose**: Structured FMEA capabilities for safety-critical system development. One `.fma` file per folder.

**Keywords**:
- `hdef failureset <FailureSetName>` - Header definition
- `def failuremode <FailureModeName>` - Failure mode definition
- `failurerate <FLOAT_VALUE>` - Quantitative failure rate (FIT)
- `severity <1-10>` - Impact level
- `detectability <1-10>` - Detection capability
- `occurrence <1-10>` - Frequency rating
- `actionpriority <PRIORITY_ENUM>` - Priority for corrective action
- `causes ref failuremode <Id> within <TIME>` - Causal relationships with timing
- `effects ref failuremode <Id> within <TIME>` - Effect relationships with timing
- `detectedby ref function <Id>` - Functions that detect this failure
- `mitigatedby ref function <Id>` - Functions that prevent/handle this failure

**Time Units**:
- `within 500us`, `within 100ms`, `within 2s`, `within 5min`, `within 24h`

### .seq (Sequence Diagrams)

**Purpose**: Define temporal interactions between system components. Multiple `.seq` files allowed per project.

**Keywords**:
- `hdef sequenceset <SequenceSetName>` - Header definition
- `def participant <ParticipantName>` - Participant definition
- `call ref function <FunctionId>` - Function call
- `sequence <NUMBER>` - Sequence number for ordering
- `from ref block <BlockId>` - Source participant
- `to ref block <BlockId>` - Target participant
- `content "function_call_details"` - Function call details
- `def fragment <FragmentName>` - Fragment definition
- `fragmenttype <FRAGMENT_TYPE>` - Type of fragment
- `condition "fragment_condition"` - Execution condition

**Fragment Types**:
- `alt`, `else`, `parallel`, `loop`, `opt`

## Safety Level Enums

### Automotive (ISO 26262)
- `ASIL-A`, `ASIL-B`, `ASIL-C`, `ASIL-D` - Automotive Safety Integrity Levels
- `QM` - Quality Management (non-safety-critical)

### Industrial (IEC 61508)
- `SIL-1`, `SIL-2`, `SIL-3`, `SIL-4` - Safety Integrity Levels

### Aerospace (DO-178C)
- `DAL-A`, `DAL-B`, `DAL-C`, `DAL-D`, `DAL-E` - Design Assurance Levels

## Cross-File References

All extensions support cross-file references using:
- `ref productline <identifier>`
- `ref featureset <identifier>`
- `ref variantset <identifier>`
- `ref configset <identifier>`
- `ref block <identifier>`
- `ref functiongroup <identifier>`
- `ref feature <identifier>`
- `ref function <identifier>`
- `ref port <identifier>`
- `ref requirement <identifier>`
- `ref testcase <identifier>`
- `ref failuremode <identifier>`

## Project Structure

### .sylangrules File
Every Sylang project must contain a `.sylangrules` file in the parent directory to enable proper symbol resolution and cross-file validation.

**Example**:
```sylang
# Sylang Project Rules
project_name: "Blood Pressure Monitor System"
version: "1.0.0"
description: "Medical device blood pressure monitoring system"

rules:
  - enforce_file_limits: true
  - validate_cross_references: true
  - check_symbol_resolution: true
  - indentation_validation: true

extensions:
  product_line: [".ple", ".fml", ".vml", ".vcf"]
  systems_engineering: [".blk", ".fun", ".req", ".tst"]
  systems_analysis: [".fma", ".seq", ".flr"]
  safety_analysis: [".itm", ".haz", ".rsk", ".sgl"]
```

### Recommended Project Layout
```
my-project/
├── .sylangrules              # Project marker file
├── system.ple                # Product line definition
├── features.fml              # Feature model
├── variants/
│   ├── variant-a.vml         # Variant model A
│   └── variant-b.vml         # Variant model B
├── architecture/
│   ├── main-system.blk       # Main system block
│   └── subsystems/
│       ├── control.blk       # Control subsystem
│       └── monitoring.blk    # Monitoring subsystem
├── functions/
│   ├── safety.fun            # Safety functions
│   └── operational.fun       # Operational functions
├── requirements/
│   └── system.req            # System requirements
├── tests/
│   └── validation.tst        # Test suites
└── analysis/
    ├── failures.fma          # Failure mode analysis
    └── sequences.seq         # Sequence diagrams
```

## Validation Rules

### Structural Validation
1. **File extension compliance** - Keywords must match file extension
2. **Indentation consistency** - Must use consistent indentation style
3. **Header definition required** - Every file must have exactly one `hdef`
4. **Definition nesting** - `def` statements only allowed under `hdef`

### Semantic Validation
1. **Symbol uniqueness** - Symbols must be unique within scope
2. **Cross-reference validity** - Referenced symbols must exist
3. **Type compatibility** - References must match target types
4. **Circular dependency detection** - Prevent circular references

### File-Specific Rules
1. **`.ple` files** - No `use` statements, only one per project
2. **`.fml` files** - Only one per project, feature flags required
3. **`.vcf` files** - Auto-generated only, only one per project
4. **`.fma` files** - One per folder allowed
5. **Multiple file types** - `.vml`, `.blk`, `.fun`, `.req`, `.tst`, `.seq` allow multiple files

## VSCode Extension Features

### Syntax Highlighting
- Complete syntax highlighting for all file extensions
- Keyword recognition and validation
- Comment highlighting
- Error highlighting for invalid syntax

### Cross-File Validation
- Symbol resolution across project files
- Reference validation
- Dependency tracking
- Import statement validation

### Code Completion
- Keyword auto-completion
- Symbol reference completion
- Property and relation suggestions
- Enum value completion

### Diagnostics
- Real-time error detection
- Warning for potential issues
- File limit validation
- Indentation validation

### Commands
- Generate variant config (.vcf) from variant models
- Validate project structure
- Symbol navigation
- Reference finding

## Standards Compliance

### Automotive Standards
- **ISO 26262** - Functional Safety for Road Vehicles
- **ASPICE** - Automotive SPICE Process Assessment
- **AUTOSAR** - Automotive Open System Architecture

### Medical Device Standards
- **ISO 14971** - Risk Management for Medical Devices
- **IEC 62304** - Medical Device Software Life Cycle
- **ISO 13485** - Quality Management Systems for Medical Devices
- **FDA 21 CFR 820** - Quality System Regulation
- **EU MDR** - European Medical Device Regulation

### Industrial Standards
- **IEC 61508** - Functional Safety of Electrical/Electronic Systems
- **IEC 61800-5-1** - Variable Speed Drives Safety Requirements
- **UL 508C** - Power Conversion Equipment

### Aerospace Standards
- **DO-178C** - Software Considerations in Airborne Systems
- **DO-254** - Design Assurance Guidance for Airborne Electronic Hardware

## AI Integration Philosophy

Sylang is designed with AI-first principles:

1. **AI as Creator** - Language optimized for AI code generation
2. **Human as Validator** - Humans validate and refine AI-generated artifacts
3. **Structured Output** - Consistent, parseable language structure
4. **Domain Knowledge** - Built-in safety and compliance knowledge
5. **Cross-Domain** - Applicable across multiple engineering domains

## Installation and Usage

### VSCode Extension
1. Install the Sylang extension from VSCode marketplace
2. Create a new project with `.sylangrules` file
3. Start creating Sylang files with appropriate extensions
4. Use auto-completion and validation features

### Language Server
- Real-time syntax checking
- Cross-file symbol resolution
- Intelligent code completion
- Error diagnostics and suggestions

## Version History

### v2.0.2 (Current)
- **Fully Implemented**: `.ple`, `.fml`, `.vml`, `.vcf`, `.blk`, `.fun`, `.req`, `.tst`
- **Systems Analysis**: `.fma`, `.seq`, `.flr`
- Cross-file validation and symbol management
- Configuration-based feature graying
- Advanced VSCode integration

### Planned Features
- **Safety Analysis**: `.itm`, `.haz`, `.rsk`, `.sgl`
- **Additional Analysis**: `.fmc`, `.fta`
- Enhanced diagram generation
- Improved AI integration tools

---

**Copyright © 2025 Balaji Boominathan**  
**Licensed under Apache License 2.0**
