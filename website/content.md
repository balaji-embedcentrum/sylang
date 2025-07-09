# Sylang

**Systems and Safety Engineering Language**

## Overview

Sylang is a domain-specific language designed for **Model Based Systems Engineering (MBSE)** in safety-critical industries. It provides a unified approach to systems modeling, safety analysis, and requirements engineering across **Automotive**, **Aerospace**, and **Medical** device development.

## Key Features

- **22 specialized file extensions** for different engineering domains
- **Cross-file navigation** and dependency tracking
- **Safety standards compliance** (ISO 26262, DO-178C, IEC 62304)
- **Real-time validation** with domain expertise
- **Requirements traceability** throughout the system lifecycle
- **Professional IDE support** with VS Code extension

## Industry Applications

### Automotive (ISO 26262)

Sylang supports functional safety development for automotive systems:

- Electric vehicle control systems
- Advanced Driver Assistance Systems (ADAS)
- Autonomous driving functions
- Brake and steering systems
- Powertrain control units

### Aerospace (DO-178C)

Safety-critical avionics software development:

- Flight control systems
- Navigation and guidance systems
- Engine control units
- Cockpit display systems
- Communication systems

### Medical Devices (IEC 62304)

Medical device software lifecycle processes:

- Patient monitoring systems
- Surgical robotics
- Diagnostic equipment
- Implantable devices
- Therapeutic devices

## File Types and Domains

### Systems Architecture
- `.ple` - Product line definitions and system configurations
- `.cmp` - Component specifications and interfaces
- `.sub` - Subsystem definitions and hierarchies

### Functional Design
- `.fun` - System def function definitions
- `.fma` - Functional model architectures
- `.fml` - Feature models with variability

### Safety Engineering
- `.sgl` - Safety goals and objectives
- `.haz` - Hazard analysis and assessment
- `.rsk` - Risk analysis and evaluation
- `.fsr` - Functional safety requirements
- `.itm` - Safety items and elements

### Security Engineering
- `.sgo` - Security goals and objectives
- `.ast` - Asset definitions and classifications
- `.sec` - Security specifications
- `.tra` - Threat analysis (TARA)
- `.thr` - Threat definitions
- `.sre` - Security requirements

### Engineering Disciplines
- `.req` - Requirements specifications
- `.mod` - Software modules
- `.prt` - Software parts and components
- `.ckt` - Electronic circuits
- `.asm` - Mechanical assemblies

## Syntax Examples

### Safety Goal Definition

```sylang
safetygoal SG_EPB_001
  name "Prevent Unintended Activation"
  description "EPB shall not activate without driver command"
  safetylevel ASIL-C
  allocatedto ActuationControlSubsystem, HMIControlSubsystem
  derivedfrom FSR_EPB_014, FSR_EPB_027
  
  verificationcriteria VC_SG_001
    criterion "System test demonstrates no unintended activation"
    method "Hardware-in-the-loop simulation"
    coverage "All driving scenarios"
```

### Component Architecture

```sylang
component ActuatorManagementUnit
  description "Controls actuator motor and position feedback"
  safetylevel ASIL-C
  owner "Chassis Systems Team"
  
  interfaces
    interface MotorControl
      type Digital
      direction Output
      protocol SPI
      voltage 3.3V
      width 16
      
    interface PositionFeedback
      type Analog
      direction Input
      voltage 5V
      range "0-4095 ADC counts"
  
  partof ActuationControlSubsystem
  implements FSR_EPB_045, FSR_EPB_067
```

### Hazard Analysis

```sylang
hazard H_ACT_001
  name "Actuator Motor Runaway"
  description "Motor continues running beyond commanded position"
  cause "Motor controller failure, position feedback loss"
  effect "Excessive clamping force, potential component damage"
  category UnintendedActivation
  severity S2
  probability E3
  controllability C2
  
  functions_affected "MotorDriveController", "ActuatorPositionTracker"
  
  safetymeasures
    measure SM_001
      name "Motor Current Limiting"
      description "Hardware current limiter prevents excessive force"
      effectiveness "High"
      
    measure SM_002  
      name "Position Monitoring"
      description "Independent position sensor for feedback validation"
      effectiveness "Medium"
```

### Requirements Specification

```sylang
functionalrequirement FSR_EPB_014
  name "Driver Command Recognition"
  description "System shall recognize valid driver EPB commands"
  rationale "Driver must be able to control EPB operation"
  safetylevel ASIL-C
  
  specification
    "The EPB system shall detect switch activation within 50ms
     of user input under all environmental conditions specified
     in the operating requirements."
  
  verificationcriteria
    criterion "Switch response time measurement"
    method "Automated test with signal analyzer"
    acceptance "Response time < 50ms in 99.9% of tests"
  
  allocatedto HMIControlSubsystem
  satisfies SG_EPB_001
  derivedfrom SysReq_EPB_003
```

### Feature Model

```sylang
systemfeatures EPBFeatures
  feature EPBSystem mandatory
    name "EPB System"
    description "The root feature for Electric Parking Brake system"
    safetylevel ASIL-D
    
    feature UserInterface mandatory
      name "User Interface"
      description "Driver interaction with EPB system"
      safetylevel ASIL-B
      
      feature SwitchType alternative
        name "Switch Type"
        description "Physical switch type selection"
        
        feature PushPullSwitch alternative
          name "Push-Pull Switch"
          description "Push to release, pull to apply"
          
        feature RockerSwitch alternative
          name "Rocker Switch"  
          description "Rocker-style switch"
          
        feature ButtonSwitch alternative
          name "Button Switch"
          description "Single button with mode detection"
    
    feature AutomationLevel optional
      name "Automation Level"
      description "Automated EPB functions"
      
      feature AutoHold optional
        name "Auto Hold"
        description "Automatic brake hold at stops"
        safetylevel ASIL-B
        
      feature HillStart optional
        name "Hill Start Assist"
        description "Prevents rollback on inclines"
        safetylevel ASIL-C
```

## Getting Started

### 1. Install VS Code Extension

The easiest way to start with Sylang is through the VS Code extension:

```bash
# Install from VS Code Marketplace
ext install balaji-embedcentrum.sylang

# Or search for "Sylang" in the Extensions panel
```

### 2. Create Your First Sylang File

Create a new file with a `.ple` extension for your product line:

```sylang
productline ElectricParkingBrakeSystem
  description "Family of EPB systems for automotive applications"
  owner "Chassis Engineering Team"
  domain "automotive", "safety-critical"
  compliance "ISO 26262", "ASPICE"
  safetylevel ASIL-D
  
  firstrelease "2024-Q1"
  region "Global", "Europe", "North America"
  
  tags "epb", "brake-systems", "actuation"
```

### 3. Define System Functions

Create a `.fun` file for your system functions:

```sylang
systemfunctions EPBFunctions
  def function CoreSystemOrchestrator
    name "Core System Orchestrator"
    description "Main orchestration engine for EPB system"
    owner "Systems Architecture Team"
    safetylevel ASIL-D
    enables EPBSystem
```

### 4. Model Safety Goals

Create safety goals in a `.sgl` file:

```sylang
safetygoals EPBSafetyGoals
  goal SG_EPB_001
    name "Prevent Unintended Activation"
    description "EPB shall not activate without driver command"
    safetylevel ASIL-C
```

## VS Code Extension Features

- **Syntax Highlighting** - Professional highlighting for all 22 file types
- **Auto-completion** - Domain-specific IntelliSense with 200+ keywords
- **Real-time Validation** - Standards compliance checking as you type
- **Cross-file Navigation** - F12 to jump to definitions, Shift+F12 for references
- **Workspace Indexing** - Full symbol indexing across entire project
- **Error Detection** - Smart validation with engineering domain expertise

## Standards Compliance

### ISO 26262 (Automotive)

- ASIL level validation (A, B, C, D, QM)
- Hazard analysis and risk assessment
- Safety goal decomposition
- Verification and validation criteria

### DO-178C (Aerospace)

- Software level validation (A, B, C, D, E)
- Requirements traceability
- Verification procedures
- Configuration management

### IEC 62304 (Medical Devices)

- Safety classification (A, B, C)
- Software lifecycle processes
- Risk management procedures
- Documentation requirements

## Best Practices

### Project Structure

```
my-system/
├── productline/
│   └── SystemDefinition.ple
├── functions/
│   ├── SystemFunctions.fun
│   └── FunctionalModels.fma
├── features/
│   └── FeatureModels.fml
├── safety/
│   ├── SafetyGoals.sgl
│   ├── HazardAnalysis.haz
│   ├── RiskAssessment.rsk
│   └── SafetyRequirements.fsr
├── security/
│   ├── SecurityGoals.sgo
│   ├── ThreatAnalysis.tra
│   └── SecurityRequirements.sre
├── components/
│   ├── SystemComponents.cmp
│   ├── Subsystems.sub
│   └── Requirements.req
└── implementation/
    ├── software/
    │   ├── Modules.mod
    │   └── Parts.prt
    ├── electronics/
    │   └── Circuits.ckt
    └── mechanics/
        └── Assemblies.asm
```

### Naming Conventions

- **Safety Goals**: `SG_[SYSTEM]_[NUMBER]` (e.g., `SG_EPB_001`)
- **Requirements**: `FSR_[SYSTEM]_[NUMBER]` (e.g., `FSR_EPB_014`)
- **Hazards**: `H_[SUBSYSTEM]_[NUMBER]` (e.g., `H_ACT_001`)
- **Components**: PascalCase (e.g., `ActuatorManagementUnit`)
- **Functions**: PascalCase (e.g., `MotorDriveController`)

### Traceability

Always establish clear traceability links:

```sylang
requirement FSR_EPB_014
  derivedfrom SysReq_EPB_003
  satisfies SG_EPB_001
  allocatedto ActuatorManagementUnit
  implements SafetyMeasure_SM_001
```

## Community

- **GitHub**: [github.com/balaji-embedcentrum/sylang](https://github.com/balaji-embedcentrum/sylang)
- **VS Code Marketplace**: [Sylang Extension](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang)
- **Issues & Support**: [GitHub Issues](https://github.com/balaji-embedcentrum/sylang/issues)

## License

Sylang is open source and available under the MIT License.

---

*Developed by [Embed Centrum](https://github.com/balaji-embedcentrum) for professional systems engineers working in safety-critical industries.* 