# The Sylang Language Guide
## Complete Reference for Systems and Safety Engineering

**Version 1.0 | January 2025**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Core Concepts](#2-core-concepts)
3. [Language Architecture](#3-language-architecture)
4. [File Types and Extensions](#4-file-types-and-extensions)
5. [Syntax Fundamentals](#5-syntax-fundamentals)
6. [Product Line Engineering (.ple)](#6-product-line-engineering-ple)
7. [Feature Modeling (.fml)](#7-feature-modeling-fml)
8. [Function Definitions (.fun, .fma)](#8-function-definitions-fun-fma)
9. [Safety Engineering (.sgl, .haz, .rsk, .fsr, .itm)](#9-safety-engineering-sgl-haz-rsk-fsr-itm)
10. [Security Engineering (.tra, .thr, .sgo, .sre, .ast, .sec)](#10-security-engineering-tra-thr-sgo-sre-ast-sec)
11. [Component Engineering (.req)](#11-component-engineering-req)
12. [Software Engineering (.mod, .prt)](#12-software-engineering-mod-prt)
13. [Electronics Engineering (.ckt)](#13-electronics-engineering-ckt)
14. [Mechanics Engineering (.asm)](#14-mechanics-engineering-asm)
15. [Cross-File References](#15-cross-file-references)
16. [Validation Rules](#16-validation-rules)
17. [Industry Standards Compliance](#17-industry-standards-compliance)
18. [Best Practices](#18-best-practices)
19. [Complete Examples](#19-complete-examples)
20. [Appendices](#20-appendices)

---

## 1. Introduction

### What is Sylang?

Sylang (Systems and Safety Engineering Language) is a family of domain-specific languages designed for **Model Based Systems Engineering (MBSE)** in safety-critical industries. It provides a unified approach to systems modeling, safety analysis, and requirements engineering across **Automotive**, **Aerospace**, and **Medical** device development.

### Key Features

- **22 specialized file extensions** for different engineering domains
- **Cross-file navigation** and dependency tracking
- **Safety standards compliance** (ISO 26262, DO-178C, IEC 62304)
- **Real-time validation** with domain expertise
- **Requirements traceability** throughout the system lifecycle
- **Professional IDE support** with VS Code extension

### Industry Applications

#### Automotive (ISO 26262)
- Electric vehicle control systems
- Advanced Driver Assistance Systems (ADAS)
- Autonomous driving functions
- Brake and steering systems
- Powertrain control units

#### Aerospace (DO-178C)
- Flight control systems
- Navigation and guidance systems
- Engine control units
- Cockpit display systems
- Communication systems

#### Medical Devices (IEC 62304)
- Patient monitoring systems
- Surgical robotics
- Diagnostic equipment
- Implantable devices
- Therapeutic devices

---

## 2. Core Concepts

### Fundamental Principles

1. **Definition-First Approach**: All elements must be explicitly defined using the `def` keyword
2. **Unique Global Identifiers**: All identifiers must be unique across the entire project
3. **Cross-File References**: Elements can reference each other across different files
4. **Hierarchical Structure**: Support for nested definitions and inheritance
5. **Safety-First Design**: Built-in safety level tracking and compliance

### Key Concepts

#### Definitions
Every element in Sylang must be defined using the `def` keyword:
```sylang
def productline MySystem
def feature MyFeature mandatory
def function MyFunction
```

#### Identifiers
- Must be unique across the entire project
- Use PascalCase convention
- Should be descriptive and meaningful

#### Properties
Common properties across all file types:
- `name`: Human-readable display name
- `description`: Detailed explanation
- `owner`: Team or person responsible
- `tags`: Classification tags for organization
- `safetylevel`: ASIL level (ASIL-A, ASIL-B, ASIL-C, ASIL-D) or QM

#### Cross-References
- `enables`: Functions enable features
- `implements`: Components implement functions
- `allocatedto`: Requirements allocated to components
- `derivedfrom`: Safety requirements derived from goals

---

## 3. Language Architecture

### File Type Categories

| Category | Purpose | Extensions |
|----------|---------|------------|
| **Systems Architecture** | System structure and hierarchy | `.ple`, `.blk` |
| **Functional Design** | Functions and features | `.fun`, `.fma`, `.fml` |
| **Safety Engineering** | Safety analysis and requirements | `.sgl`, `.haz`, `.rsk`, `.fsr`, `.itm` |
| **Security Engineering** | Security analysis and threats | `.tra`, `.thr`, `.sgo`, `.sre`, `.ast`, `.sec` |
| **Engineering Domains** | Specialized implementations | `.mod`, `.prt`, `.ckt`, `.asm` |
| **Requirements** | Requirements specifications | `.req` |

### Language Hierarchy

```
Sylang Language Family
├── Product Line Engineering (.ple)
├── Feature Modeling (.fml)
├── Function Definitions (.fun, .fma)
├── Safety Engineering
│   ├── Safety Goals (.sgl)
│   ├── Hazard Analysis (.haz)
│   ├── Risk Assessment (.rsk)
│   ├── Functional Safety Requirements (.fsr)
│   └── Safety Items (.itm)
├── Security Engineering
│   ├── Threat Analysis (.tra)
│   ├── Threats (.thr)
│   ├── Security Goals (.sgo)
│   ├── Security Requirements (.sre)
│   ├── Assets (.ast)
│   └── Security (.sec)
├── Component Engineering (.req)
├── Software Engineering (.mod, .prt)
├── Electronics Engineering (.ckt)
└── Mechanics Engineering (.asm)
```

---

## 4. File Types and Extensions

### Complete File Extension Reference

| Extension | Language ID | Purpose | Top-level Keyword |
|-----------|-------------|---------|-------------------|
| `.ple` | sylang-productline | Product line definitions | `productline` |
| `.fml` | sylang-features | Feature models | `systemfeatures` |
| `.fun` | sylang-functions | System functions | `functiongroup` |
| `.fma` | sylang-functions | Function architectures | `functiongroup` |
| `.sgl` | sylang-safety | Safety goals | `safetygoals` |
| `.haz` | sylang-safety | Hazard analysis | `hazards` |
| `.rsk` | sylang-safety | Risk assessment | `risks` |
| `.fsr` | sylang-safety | Functional safety requirements | `functionalsafetyrequirements` |
| `.itm` | sylang-safety | Safety items | `safetyitems` |
| `.tra` | sylang-security | Threat analysis | `threatanalysis` |
| `.thr` | sylang-security | Threats | `threats` |
| `.sgo` | sylang-security | Security goals | `securitygoals` |
| `.sre` | sylang-security | Security requirements | `securityrequirements` |
| `.ast` | sylang-security | Assets | `assets` |
| `.sec` | sylang-security | Security models | `security` |
| `.cmp` | sylang-components | Components | `component` |
| `.req` | sylang-components | Requirements | `requirement` |
| `.mod` | sylang-software | Software modules | `module` |
| `.prt` | sylang-software | Software parts | `part` |
| `.ckt` | sylang-electronics | Electronic circuits | `circuit` |
| `.asm` | sylang-mechanics | Mechanical assemblies | `assembly` |

---

## 5. Syntax Fundamentals

### Universal Syntax Rules

#### 1. Indentation
- **Exactly 2 spaces** per indentation level
- **No tabs allowed**
- Consistent indentation throughout the file

#### 2. Comments
```sylang
// Single-line comment
/* Multi-line
   comment */
```

#### 3. String Literals
- Always use double quotes: `"This is a string"`
- Escape sequences supported: `"Line 1\nLine 2"`

#### 4. Lists
- Comma-separated values in quotes
- Example: `"tag1", "tag2", "tag3"`

#### 5. Keywords
All Sylang files use specific keywords:
- `def`: Definition keyword (required for all definitions)
- `name`: Human-readable name
- `description`: Detailed description
- `owner`: Responsible team/person
- `tags`: Classification tags
- `safetylevel`: Safety level (ASIL-A/B/C/D or QM)

#### 6. Safety Levels
Valid safety levels:
- `ASIL-D`: Highest safety integrity level
- `ASIL-C`: High safety integrity level
- `ASIL-B`: Medium safety integrity level
- `ASIL-A`: Low safety integrity level
- `QM`: Quality Management (no safety requirements)

#### 7. Identifiers
- Must start with uppercase letter (PascalCase)
- Can contain letters, numbers, and underscores
- Must be unique across entire project
- Examples: `MySystem`, `PowerControlUnit`, `SafetyGoal_001`

---

## 6. Product Line Engineering (.ple)

### Purpose
Product line files define the top-level system architecture, metadata, and organizational information for a product family.

### Syntax Structure
```sylang
def productline <UniqueProductLineIdentifier>
  name "<Display Name>"
  description "<Detailed description>"
  owner "<Team1>", "<Team2>"
  domain "<domain1>", "<domain2>"
  compliance "<Standard1>", "<Standard2>"
  firstrelease "<YYYY-MM-DD>"
  tags "<tag1>", "<tag2>", "<tag3>"
  safetylevel <ASIL-Level>
  region "<Region1>", "<Region2>"
```

### Required Properties
- `name`: Human-readable product line name
- `description`: Detailed product line description
- `owner`: Responsible teams (comma-separated)
- `domain`: Application domains
- `safetylevel`: Required safety integrity level

### Optional Properties
- `compliance`: Applicable standards
- `firstrelease`: Planned release date
- `tags`: Classification tags
- `region`: Target markets/regions

### Complete Example
```sylang
def productline ElectricParkingBrakeSystem
  name "Electric Parking Brake System Family"
  description "A family of electronic parking brake systems for automotive applications. Provides electronic actuation, safety, and integration with vehicle features."
  owner "Chassis Team", "Braking Systems Group"
  domain "automotive", "safety"
  compliance "ISO 26262", "ASPICE"
  firstrelease "2025-01-01"
  tags "EPB", "brake", "electronic", "safety"
  safetylevel ASIL-D
  region "Global", "Europe", "North America"
```

### Validation Rules
1. Only one `productline` definition per file
2. All required properties must be present
3. Safety level must be valid ASIL level or QM
4. Date format must be YYYY-MM-DD
5. All string values must be quoted

---

## 7. Feature Modeling (.fml)

### Purpose
Feature model files define the variability and optional/mandatory features of a system using hierarchical feature trees.

### Syntax Structure
```sylang
def systemfeatures <UniqueSystemIdentifier>
  def feature <UniqueFeatureIdentifier> <VariabilityType>
    name "<Display Name>"
    description "<Detailed description>"
    owner "<Team Name>"
    tags "<tag1>", "<tag2>"
    safetylevel <ASIL-Level>
    
    def feature <UniqueSubFeatureIdentifier> <VariabilityType>
      name "<Sub Feature Name>"
      description "<Sub feature description>"
      owner "<Team Name>"
      tags "<tag1>", "<tag2>"
      safetylevel <ASIL-Level>
```

### Variability Types
- `mandatory`: Feature must be included
- `optional`: Feature may be included
- `alternative`: Exactly one sub-feature must be selected
- `or`: One or more sub-features must be selected

### Feature Constraints
```sylang
def constraints
  requires <FeatureA>, <FeatureB>  // FeatureA requires FeatureB
  excludes <FeatureC>, <FeatureD>  // FeatureC excludes FeatureD
```

### Complete Example
```sylang
def systemfeatures EPBFeatures
  def feature EPBSystem mandatory
    name "EPB System"
    description "The root feature for the entire Electric Parking Brake system."
    owner "Systems Engineering"
    tags "EPB", "root"
    safetylevel ASIL-D

    def feature UserInterface mandatory
      name "User Interface"
      description "Features related to how the driver interacts with the EPB system."
      owner "HMI Team"
      tags "HMI", "interface"
      safetylevel ASIL-B

      def feature SwitchType alternative
        name "Switch Type"
        description "The physical switch used by the driver. Exactly one type must be chosen."
        owner "HMI Team"
        tags "switch", "input"
        safetylevel ASIL-B

        def feature PushPullSwitch alternative
          name "Push-Pull Switch"
          description "A switch that is pushed to release and pulled to apply."
          owner "HMI Team"
          tags "switch", "push-pull"
          safetylevel ASIL-B

        def feature RockerSwitch alternative
          name "Rocker Switch"
          description "A rocker-style switch for apply and release actions."
          owner "HMI Team"
          tags "switch", "rocker"
          safetylevel ASIL-B

    def feature AutomaticFunctions optional
      name "Automatic Functions"
      description "Optional features that provide automatic control of the parking brake."
      owner "Software Team"
      tags "automation", "optional"
      safetylevel ASIL-C

  def constraints
    requires AutomaticFunctions, UserInterface
    excludes PushPullSwitch, RockerSwitch
```

### Validation Rules
1. Only one `systemfeatures` definition per file
2. Feature hierarchy must be properly nested
3. Variability types must be valid keywords
4. Alternative features must have at least 2 sub-features
5. All feature identifiers must be unique across project

---

## 8. Function Definitions (.fun, .fma)

### Purpose
Function files define the system functions that implement features and provide system capabilities.

### Syntax Structure
```sylang
def functiongroup <UniqueSystemIdentifier>
  def function <UniqueFunctionIdentifier>
    name "<Display Name>"
    description "<Detailed description>"
    owner "<Team Name>"
    tags "<tag1>", "<tag2>"
    safetylevel <ASIL-Level>
    enables <UniqueFeatureIdentifier>, <AnotherFeatureIdentifier>
    allocatedto <ComponentIdentifier>
```

### Required Properties
- `name`: Human-readable function name
- `description`: Detailed function description
- `owner`: Responsible team
- `safetylevel`: Required safety integrity level
- `enables`: Features that this function enables (comma-separated)

### Optional Properties
- `tags`: Classification tags
- `allocatedto`: Component that implements this function

### Complete Example
```sylang
def functiongroup EPBFunctions
  def function CoreSystemOrchestrator
    name "Core System Orchestrator"
    description "Main orchestration engine for the entire EPB system architecture and coordination."
    owner "Systems Engineering"
    tags "orchestration", "system", "architecture"
    safetylevel ASIL-D
    enables EPBSystem

  def function HMIInterfaceProcessor
    name "HMI Interface Processor"
    description "Central processor for all human-machine interface operations and user interactions."
    owner "HMI Team"  
    tags "HMI", "processor", "interface"
    safetylevel ASIL-B
    enables UserInterface, StatusDisplay

  def function ActuationSystemManager
    name "Actuation System Manager"
    description "High-level manager for all physical actuation mechanisms and hardware coordination."
    owner "Hardware Team"
    tags "actuation", "system", "manager"
    safetylevel ASIL-D
    enables ActuatorSystem, ActuatorType
    allocatedto ActuationControlSubsystem
```

### Function-Feature Relationship
Functions MUST reference features using the `enables` keyword:
```sylang
def function MyFunction
  enables MyFeature, AnotherFeature
```

### Validation Rules
1. Only one `functiongroup` definition per file
2. All functions must have `enables` property
3. Referenced features must exist in .fml files
4. Function identifiers must be unique across project
5. Safety levels must be consistent with enabled features

---

## 9. Safety Engineering (.sgl, .haz, .rsk, .fsr, .itm)

Safety engineering files implement ISO 26262 functional safety processes.

### 9.1 Safety Goals (.sgl)

#### Purpose
Define top-level safety goals derived from hazard analysis and risk assessment.

#### Syntax Structure
```sylang
def safetygoals <SafetyGoalsIdentifier>  
  name "<Display Name>"
  description "<Description>"
  hazardanalysis <HazardAnalysisReference>
  riskassessment <RiskAssessmentReference>
  hazardidentification <HazardReference>
  
  safetygoalsdef
    methodology "<Methodology description>"
    principle "<Safety principle>"
    asilassignment "<ASIL assignment method>"
    verification "<Verification approach>"

  safetygoals
    def goal <GoalIdentifier>
      name "<Goal Name>"
      description "<Goal Description>"
      hazard <HazardList>
      scenario <ScenarioList>
      asil <ASIL-Level>
      safetymeasures
        def measure <MeasureId> "<Measure Description>"
          enabledby <FunctionList>
      verificationcriteria
        criterion "<Verification Criterion>"
```

#### Complete Example
```sylang
def safetygoals EPBSafetyGoals  
  name "EPB System - Safety Goals and Requirements"
  description "Safety goals derived from HARA and functional safety requirements per ISO 26262"
  hazardanalysis EPBSafety
  riskassessment EPBRiskAssessment
  hazardidentification EPBHazards
  
  safetygoalsdef
    methodology "Derived from HARA results per ISO 26262-3"
    principle "One safety goal per hazardous event at vehicle level"
    asilassignment "Based on risk assessment S×E×C determination"
    verification "Each goal must be verifiable and measurable"

  safetygoals
    def goal SG_EPB_001
      name "Prevention of Vehicle Rollaway"
      description "The EPB system shall prevent unintended vehicle movement when the vehicle is intended to be stationary"
      hazard H_ACT_002, H_ACT_003, H_ACT_004
      scenario SCEN_ACT_002_ActuatorSeizure, SCEN_PWR_001_PowerLoss
      asil D
      safetymeasures
        def measure SM_001 "Redundant actuation and position sensing systems"
          enabledby ActuationControlManager, SensorFusionEngine
        def measure SM_002 "Independent force monitoring and verification" 
          enabledby SafetyMonitoringProcessor, ActuationControlManager
      verificationcriteria
        criterion "ASIL D integrity requirements per ISO 26262"
        criterion "Target failure rate ≤ 10^-8 per hour for rollaway events"
```

### 9.2 Hazard Analysis (.haz)

#### Purpose
Document hazards identified during hazard analysis and risk assessment (HARA).

#### Syntax Structure
```sylang
def hazards <HazardIdentifier>
  name "<Hazard Analysis Name>"
  description "<Description>"
  methodology "<HARA Methodology>"
  
  def hazard <HazardId>
    name "<Hazard Name>"
    description "<Hazard Description>"
    category "<Hazard Category>"
    source "<Hazard Source>"
    operationalscenario "<Scenario>"
    severity <S-Value>
    exposure <E-Value>
    controllability <C-Value>
    asil <ASIL-Level>
```

### 9.3 Risk Assessment (.rsk)

#### Purpose
Document risk assessment results and ASIL determination.

#### Syntax Structure
```sylang
def risks <RiskIdentifier>
  name "<Risk Assessment Name>"
  description "<Description>"
  methodology "<Risk Assessment Method>"
  
  def risk <RiskId>
    name "<Risk Name>"
    description "<Risk Description>"
    hazard <HazardReference>
    severity <S0|S1|S2|S3>
    exposure <E0|E1|E2|E3|E4>
    controllability <C0|C1|C2|C3>
    asil <QM|ASIL-A|ASIL-B|ASIL-C|ASIL-D>
    rationale "<Justification>"
```

### 9.4 Functional Safety Requirements (.fsr)

#### Purpose
Define technical safety requirements derived from safety goals.

#### Syntax Structure
```sylang
def functionalsafetyrequirements <RequirementsIdentifier>
  name "<FSR Name>"
  description "<Description>"
  safetygoals <SafetyGoalsReference>
  
  def requirement <RequirementId>
    name "<Requirement Name>"
    description "<Requirement Description>"
    derivedfrom <SafetyGoalReference>
    allocatedto <ComponentReference>
    asil <ASIL-Level>
    verification "<Verification Method>"
    rationale "<Justification>"
```

### 9.5 Safety Items (.itm)

#### Purpose
Define safety-related items and their operational scenarios.

#### Syntax Structure
```sylang
def safetyitems <ItemsIdentifier>
  name "<Safety Items Name>"
  description "<Description>"
  
  def item <ItemId>
    name "<Item Name>"
    description "<Item Description>"
    category "<Item Category>"
    operationalscenarios "<Scenarios>"
    safetylevel <ASIL-Level>
```

---

## 10. Security Engineering (.tra, .thr, .sgo, .sre, .ast, .sec)

Security engineering files implement cybersecurity analysis per ISO/SAE 21434.

### 10.1 Threat Analysis (.tra)

#### Syntax Structure
```sylang
def threatanalysis <AnalysisIdentifier>
  name "<Threat Analysis Name>"
  description "<Description>"
  methodology "<TARA Methodology>"
  
  def threat <ThreatId>
    name "<Threat Name>"
    description "<Threat Description>"
    asset <AssetReference>
    impact <Impact-Level>
    feasibility <Feasibility-Level>
    cybersecuritylevel <CAL-Level>
```

### 10.2 Security Goals (.sgo)

#### Syntax Structure
```sylang
def securitygoals <GoalsIdentifier>
  name "<Security Goals Name>"
  description "<Description>"
  threatanalysis <ThreatAnalysisReference>
  
  def goal <GoalId>
    name "<Goal Name>"
    description "<Goal Description>"
    threat <ThreatReference>
    cybersecuritylevel <CAL-Level>
    securitymeasures
      def measure <MeasureId> "<Measure Description>"
        enabledby <FunctionList>
```

### 10.3 Assets (.ast)

#### Syntax Structure
```sylang
def assets <AssetsIdentifier>
  name "<Assets Name>"
  description "<Description>"
  
  def asset <AssetId>
    name "<Asset Name>"
    description "<Asset Description>"
    type "<Asset Type>"
    value "<Asset Value>"
    owner "<Asset Owner>"
```

---

## 11. Component Engineering (.req)

### 11.1 Components (.cmp)

#### Purpose
Define system components with their interfaces and properties.

#### Syntax Structure
```sylang
def component <ComponentIdentifier>
  name "<Component Name>"
  description "<Component Description>"
  owner "<Team Name>"
  tags "<tag1>", "<tag2>"
  safetylevel <ASIL-Level>
  partof <SubsystemReference>
  implements <FunctionList>
  interfaces
    def interface <InterfaceId>
      name "<Interface Name>"
      type "<Interface Type>"
      protocol "<Protocol>"
      direction <Input|Output|Bidirectional>
      voltage "<Voltage Level>"
      safetylevel <ASIL-Level>
```

### 11.2 Requirements (.req)

#### Purpose
Define detailed requirements specifications.

#### Syntax Structure
```sylang
def requirement <RequirementIdentifier>
  name "<Requirement Name>"
  description "<Requirement Description>"
  type "<Requirement Type>"
  priority "<Priority Level>"
  owner "<Team Name>"
  safetylevel <ASIL-Level>
  allocatedto <ComponentReference>
  derivedfrom <ParentRequirement>
  satisfies <GoalReference>
  verification "<Verification Method>"
```

---

## 12. Software Engineering (.mod, .prt)

### 12.1 Software Modules (.mod)

#### Purpose
Define software modules, algorithms, and services.

#### Syntax Structure
```sylang
def module <ModuleIdentifier>
  name "<Module Name>"
  description "<Module Description>"
  owner "<Team Name>"
  tags "<tag1>", "<tag2>"
  safetylevel <ASIL-Level>
  type <algorithm|service|task|process|thread>
  partof <SystemReference>
  implements <FunctionList>
  interfaces
    input "<InputParameters>"
    output "<OutputParameters>"
    returns "<ReturnType>"
  execution
    timing "<ExecutionTiming>"
    memory "<MemoryRequirements>"
    cpu_usage "<CPUUsage>"
    priority <high|medium|low>
  dependencies "<Dependencies>"
  version "<VersionNumber>"
  license "<LicenseType>"
```

### 12.2 Software Parts (.prt)

#### Purpose
Define software parts and components within modules.

#### Syntax Structure
```sylang
def part <PartIdentifier>
  name "<Part Name>"
  description "<Part Description>"
  owner "<Team Name>"
  safetylevel <ASIL-Level>
  partof <ModuleReference>
  type <algorithm|service|task>
  interfaces
    input "<InputInterface>"
    output "<OutputInterface>"
  parameters "<Parameters>"
```

---

## 13. Electronics Engineering (.ckt)

### Purpose
Define electronic circuits, boards, and hardware components.

### Syntax Structure
```sylang
def circuit <CircuitIdentifier>
  name "<Circuit Name>"
  description "<Circuit Description>"
  owner "<Team Name>"
  tags "<tag1>", "<tag2>"
  safetylevel <ASIL-Level>
  type <board|chip|ic|pcb|schematic>
  partof <SystemReference>
  interfaces
    def interface <InterfaceId>
      voltage "<VoltageLevel>"
      current "<CurrentRating>"
      power "<PowerConsumption>"
      frequency "<OperatingFrequency>"
      protocol <SPI|I2C|CAN|LIN|UART>
  specifications
    package "<PackageType>"
    footprint "<FootprintType>"
    placement "<PlacementInfo>"
    tolerance "<ToleranceValue>"
```

---

## 14. Mechanics Engineering (.asm)

### Purpose
Define mechanical assemblies, parts, and components.

### Syntax Structure
```sylang
def assembly <AssemblyIdentifier>
  name "<Assembly Name>"
  description "<Assembly Description>"
  owner "<Team Name>"
  tags "<tag1>", "<tag2>"
  safetylevel <ASIL-Level>
  type <assembly|part|component|mechanism>
  partof <SystemReference>
  material "<MaterialType>"
  specifications
    dimensions "<Dimensions>"
    weight "<WeightValue>"
    tolerance "<ToleranceValue>"
    finish "<SurfaceFinish>"
    hardness "<HardnessValue>"
    strength "<StrengthValue>"
    temperature_range "<TemperatureRange>"
    pressure_rating "<PressureRating>"
  lifecycle
    maintenance "<MaintenanceRequirements>"
```

---

## 15. Cross-File References

### Reference Keywords

#### enables
Functions enable features:
```sylang
def function MyFunction
  enables FeatureA, FeatureB
```

#### implements
Components implement functions:
```sylang
def component MyComponent
  implements FunctionA, FunctionB
```

#### allocatedto
Requirements allocated to components:
```sylang
def requirement MyRequirement
  allocatedto ComponentA
```

#### derivedfrom
Requirements derived from higher-level requirements:
```sylang
def requirement DetailedRequirement
  derivedfrom HighLevelRequirement
```

#### satisfies
Requirements satisfy goals:
```sylang
def requirement MyRequirement
  satisfies SafetyGoal_001
```

#### partof
Components part of larger systems:
```sylang
def component MyComponent
  partof MySubsystem
```

### Navigation Examples

1. **Feature to Function**: Find which functions enable a feature
2. **Function to Component**: Find which components implement a function
3. **Component to Requirements**: Find requirements allocated to a component
4. **Safety Goal to Requirements**: Find requirements that satisfy a safety goal

---

## 16. Validation Rules

### Universal Rules
1. **def keyword**: All definitions must start with `def`
2. **Unique identifiers**: All identifiers must be unique across the project
3. **Required properties**: All required properties must be present
4. **Safety levels**: Must be valid ASIL levels (A, B, C, D) or QM
5. **Indentation**: Exactly 2 spaces per level, no tabs
6. **String formatting**: All string values in double quotes

### File-Specific Rules

#### Product Line (.ple)
- Only one `productline` definition per file
- Date format must be YYYY-MM-DD
- All required properties must be present

#### Features (.fml)
- Only one `systemfeatures` definition per file
- Variability types must be valid
- Feature hierarchy must be properly nested
- Alternative features need at least 2 sub-features

#### Functions (.fun)
- Only one `functiongroup` definition per file
- All functions must have `enables` property
- Referenced features must exist

#### Safety Files
- ASIL levels must be consistent
- References to hazards, risks must be valid
- Traceability must be maintained

### Cross-File Validation
- Referenced identifiers must exist
- Safety levels must be consistent
- Traceability relationships must be valid

---

## 17. Industry Standards Compliance

### ISO 26262 (Automotive)

#### Safety Lifecycle Support
- Hazard Analysis and Risk Assessment (HARA)
- Safety goals and functional safety requirements
- ASIL decomposition and allocation
- Verification and validation requirements

#### Required Elements
```sylang
safetylevel ASIL-D
asil D
severity S3
exposure E4
controllability C3
```

### DO-178C (Aerospace)

#### Software Levels
- DAL A (highest)
- DAL B
- DAL C
- DAL D
- DAL E (lowest)

### IEC 62304 (Medical Devices)

#### Software Safety Classes
- Class A: Non-safety software
- Class B: Non-life-threatening software
- Class C: Life-threatening software

---

## 18. Best Practices

### 1. Naming Conventions
- Use PascalCase for identifiers
- Be descriptive and meaningful
- Include domain prefixes when helpful
- Examples: `EPBSystem`, `SafetyGoal_001`, `ActuationController`

### 2. File Organization
```
project/
├── productline/
│   └── MySystem.ple
├── system/
│   ├── features/
│   │   └── MyFeatures.fml
│   ├── functions/
│   │   └── MyFunctions.fun
│   ├── safety/
│   │   ├── SafetyGoals.sgl
│   │   ├── Hazards.haz
│   │   └── Requirements.fsr
│   └── components/
│       ├── subsystems/
│       └── components/
```

### 3. Safety Level Assignment
- Start with highest required level
- Apply ASIL decomposition carefully
- Maintain traceability throughout
- Document rationale for level assignment

### 4. Cross-Reference Management
- Maintain consistent naming
- Use meaningful identifiers
- Document relationships clearly
- Validate references regularly

### 5. Documentation
- Provide comprehensive descriptions
- Include rationale for decisions
- Reference applicable standards
- Maintain version control

---

## 19. Complete Examples

### 19.1 Electric Parking Brake System

#### Project Structure
```
EPB_System/
├── ElectricParkingBrakeSystem.ple
├── system/
│   ├── EPBFeatures.fml
│   ├── EPBFunctions.fun
│   ├── safety/
│   │   ├── EPBSafetyGoals.sgl
│   │   ├── EPBHazards.haz
│   │   └── EPBRequirements.fsr
│   └── subsystems/
```

#### Complete Product Line Definition
```sylang
def productline ElectricParkingBrakeSystem
  name "Electric Parking Brake System Family"
  description "A family of electronic parking brake systems for automotive applications providing electronic actuation, safety monitoring, and vehicle integration capabilities."
  owner "Chassis Team", "Braking Systems Group"
  domain "automotive", "safety-critical"
  compliance "ISO 26262", "ASPICE", "ISO 26262-3"
  firstrelease "2025-03-01"
  tags "EPB", "brake", "electronic", "safety", "ASIL-D"
  safetylevel ASIL-D
  region "Global", "Europe", "North America", "Asia"
```

### 19.2 Autonomous Vehicle ADAS System

#### ADAS Product Line
```sylang
def productline AutonomousVehicleADAS
  name "Autonomous Vehicle Advanced Driver Assistance System"
  description "Level 3+ autonomous driving system with comprehensive sensor fusion and decision-making capabilities."
  owner "ADAS Team", "Autonomous Driving Group"
  domain "automotive", "autonomous-driving"
  compliance "ISO 26262", "ISO 21448", "UN-R157"
  firstrelease "2025-12-01"
  tags "ADAS", "autonomous", "L3", "sensor-fusion"
  safetylevel ASIL-D
  region "Europe", "North America"
```

#### ADAS Features
```sylang
def systemfeatures ADASFeatures
  def feature AutonomousDriving mandatory
    name "Autonomous Driving System"
    description "Core autonomous driving capabilities"
    owner "ADAS Team"
    safetylevel ASIL-D
    
    def feature PerceptionSystem mandatory
      name "Perception System"
      description "Environmental perception and object detection"
      owner "Perception Team"
      safetylevel ASIL-D
      
      def feature SensorFusion alternative
        name "Sensor Fusion Technology"
        description "Method for combining multiple sensor inputs"
        
        def feature CameraBased alternative
          name "Camera-Based Perception"
          safetylevel ASIL-C
          
        def feature LidarBased alternative
          name "LiDAR-Based Perception"
          safetylevel ASIL-D
          
        def feature RadarBased alternative
          name "Radar-Based Perception"
          safetylevel ASIL-B
```

### 19.3 Medical Device Example

#### Insulin Pump System
```sylang
def productline InsulinPumpSystem
  name "Smart Insulin Delivery System"
  description "Automated insulin pump with continuous glucose monitoring and closed-loop control."
  owner "Medical Device Team", "Software Team"
  domain "medical", "diabetes-care"
  compliance "IEC 62304", "ISO 14971", "FDA 21 CFR 820"
  firstrelease "2025-06-01"
  tags "insulin", "pump", "medical", "Class-C"
  safetylevel ASIL-D
  region "US", "Europe", "Canada"
```

---

## 20. Appendices

### Appendix A: Complete Keyword Reference

#### Universal Keywords
- `def` - Definition keyword (required)
- `name` - Human-readable name
- `description` - Detailed description
- `owner` - Responsible team/person
- `tags` - Classification tags
- `safetylevel` - Safety integrity level

#### Relationship Keywords
- `enables` - Function enables feature
- `implements` - Component implements function
- `allocatedto` - Requirement allocated to component
- `derivedfrom` - Derived from parent element
- `satisfies` - Requirement satisfies goal
- `partof` - Part of larger system

#### Safety Keywords
- `asil` - ASIL level assignment
- `severity` - Severity classification (S0-S3)
- `exposure` - Exposure classification (E0-E4)
- `controllability` - Controllability (C0-C3)
- `hazard` - Hazard reference
- `risk` - Risk reference

#### Variability Keywords (Features)
- `mandatory` - Must be included
- `optional` - May be included
- `alternative` - Exactly one must be selected
- `or` - One or more must be selected

### Appendix B: Safety Level Guidelines

#### ASIL Level Selection
| ASIL Level | Severity | Exposure | Controllability | Applications |
|------------|----------|----------|-----------------|--------------|
| QM | S0-S1 | Any | Any | Non-safety functions |
| ASIL-A | S1 | E1-E2 | C1-C3 | Light injury potential |
| ASIL-B | S2 | E2-E3 | C2-C3 | Moderate injury potential |
| ASIL-C | S2-S3 | E3-E4 | C2-C3 | Severe injury potential |
| ASIL-D | S3 | E4 | C1-C3 | Life-threatening potential |

### Appendix C: File Extension Summary

| Extension | Purpose | Industry | Standards |
|-----------|---------|----------|-----------|
| `.ple` | Product Line | All | ISO 26262, DO-178C |
| `.fml` | Features | All | ISO 26262 |
| `.fun` | Functions | All | ISO 26262 |
| `.sgl` | Safety Goals | Automotive | ISO 26262 |
| `.haz` | Hazards | All | ISO 26262, ISO 14971 |
| `.rsk` | Risks | All | ISO 26262, ISO 14971 |
| `.itm` | Safety Items | All | ISO 26262, ISO 14971 |
| `.cmp` | Components | All | Various |

### Appendix D: Validation Checklist

#### Before File Submission
- [ ] All required properties present
- [ ] Indentation uses 2 spaces (no tabs)
- [ ] All identifiers are unique
- [ ] Safety levels are valid
- [ ] Cross-references are valid
- [ ] Descriptions are meaningful
- [ ] Owner teams are specified

#### Cross-File Validation
- [ ] All `enables` references exist
- [ ] All `implements` references exist
- [ ] All `allocatedto` references exist
- [ ] Safety levels are consistent
- [ ] Traceability is maintained

---

## Conclusion

This guide provides comprehensive coverage of the Sylang language family for systems and safety engineering. By following these syntax rules, validation guidelines, and best practices, engineers can create robust, traceable, and standards-compliant system models for safety-critical applications across automotive, aerospace, and medical device industries.

For additional support and updates, visit the official Sylang documentation and community resources.

---

**Document Information:**
- Version: 1.0
- Date: January 2025
- Status: Complete Reference Guide
- Target Audience: Systems Engineers, Safety Engineers, Software Engineers
- Standards: ISO 26262, DO-178C, IEC 62304, ISO/SAE 21434 