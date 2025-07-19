# Sylang

[![Version](https://img.shields.io/vscode-marketplace/v/balaji-embedcentrum.sylang.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang)
[![Downloads](https://img.shields.io/vscode-marketplace/d/balaji-embedcentrum.sylang.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang)
[![Rating](https://img.shields.io/vscode-marketplace/r/balaji-embedcentrum.sylang.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang)

**IDE Support for Sylang** - Complete **Model Based Systems Engineering (MBSE)** toolkit with **Agentic AI Instructions** for automatic project generation in Automotive, Aerospace, and Medical industries.

## 🚀 **Features**

### **🤖 Agentic AI & Complete MBSE Toolkit**
- **🤖 Agentic AI Instructions**: Generate complete projects from simple requests using `.sylangrules`
- **15 Sylang file extensions** with professional IDE features and correct syntax
- **Systems Engineering domains**: Safety, Security, Components, Software, Electronics, Mechanics
- **Safety standards compliance**: ISO 26262, DO-178C, IEC 62304, ASPICE
- **Real-time validation** with domain-specific engineering rules
- **🎯 User Intent Recognition**: Advanced pattern recognition for project creation and modification

### **Cross-File Navigation**
- **Go to Definition (F12)** - Navigate to system component definitions across files
- **Find All References (Shift+F12)** - Trace requirements and dependencies throughout workspace  
- **Workspace-wide symbol indexing** with progress feedback
- **Smart identifier recognition** for components, requirements, hazards, safety goals

### **🏗️ Automotive System Templates**
- **EPB Systems**: Electric Parking Brake with ASIL-D safety requirements
- **Inverter Systems**: EV powertrain with motor control and thermal management
- **EPS Systems**: Electric Power Steering with torque assist and manual reversion
- **BBW Systems**: Brake-by-Wire with hydraulic backup and pedal feel simulation
- **HVAC Systems**: Climate control with air quality monitoring and energy management
- **ADAS Systems**: Advanced Driver Assistance with sensor fusion and path planning

### **Industry Focus**
- **Automotive Safety**: ASIL levels, functional safety requirements, hazard analysis, ISO 26262
- **Aerospace Systems**: DO-178C compliance, safety-critical software development
- **Medical Devices**: IEC 62304, risk management, device safety requirements
- **Systems Architecture**: Component hierarchies, interfaces, traceability
- **Requirements Engineering**: EARS format, traceability, verification, validation

## 📋 **Supported Engineering Domains**

Sylang supports **EXACTLY 15 specialized file extensions** for comprehensive systems engineering:

| Extension | Purpose | Keywords | Industry Standards |
|-----------|---------|----------|-------------------|
| **`.ple`** | Product Line Engineering | `productline` | Systems modeling, architecture |
| **`.fml`** | Feature Modeling | `featureset`, `feature` | Variability modeling, product lines |
| **`.vml`** | Variant Modeling | `variantmodel`, `variant` | Product variants, configurations |
| **`.vcf`** | Variant Configuration | `configset`, `config` | Configuration management |
| **`.fun`** | Function Definitions | `functiongroup`, `function` | System functions, behavioral models |
| **`.blk`** | Block Architecture | `system`, `subsystem`, `component` | System architecture, hierarchies |
| **`.req`** | Requirements | `requirement` | Requirements engineering, traceability |
| **`.tst`** | Test Specifications | `testsuite`, `testcase` | Testing, verification, validation |
| **`.fma`** | Failure Mode Analysis | `failuremodeanalysis`, `failuremode` | FMEA, failure analysis |
| **`.fmc`** | Failure Mode Controls | `controlmeasures`, `control` | FMEA controls, mitigation |
| **`.fta`** | Fault Tree Analysis | `faulttreeanalysis`, `faulttree` | FTA, fault analysis |
| **`.itm`** | Items/Operational Scenarios | `itemdefinition`, `item` | Operational scenarios |
| **`.haz`** | Hazard Analysis | `hazardidentification`, `hazard` | ISO 26262, hazard analysis |
| **`.rsk`** | Risk Assessment | `riskassessment`, `risk` | Risk analysis, ASIL |
| **`.sgl`** | Safety Goals | `safetygoals`, `safetygoal` | Safety goals, ASIL allocation |

### **Industry Focus**
- **Automotive Safety**: ASIL levels, functional safety requirements, hazard analysis, ISO 26262
- **Aerospace Systems**: DO-178C compliance, safety-critical software development
- **Medical Devices**: IEC 62304, risk management, device safety requirements
- **Systems Architecture**: Component hierarchies, interfaces, traceability
- **Requirements Engineering**: EARS format, traceability, verification, validation

## 🤖 **Agentic AI Features**

### **Create Sylang Rules (Cmd+Shift+P)**
1. **Press Cmd+Shift+P** and type "Create Sylang Rules"
2. **Generate comprehensive `.sylangrules`** file with agentic AI instructions
3. **Use as AI context** for automatic project generation
4. **Customize for your project** needs and share with team

### **AI-Powered Project Generation**
- **Simple requests** → Complete automotive MBSE projects
- **User intent recognition** for project creation, feature addition, compliance enhancement
- **Intelligent folder structures** with proper MBSE hierarchies
- **Cross-file intelligence** and full traceability
- **Standards compliance** built-in (ISO 26262, ASPICE, DO-178C)

## 🎯 **Quick Start**

### **Installation**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Sylang"
4. Click Install

### **Usage**
1. **Open any Sylang file** - Automatic language detection and syntax highlighting
2. **Start typing** - IntelliSense provides engineering-specific auto-completion
3. **Use F12** - Navigate to component definitions across system architecture
4. **Press Shift+F12** - Trace requirements and dependencies
5. **Check Problems panel** - Real-time validation with safety standards compliance
6. **Create Sylang Rules** - Generate AI context for project generation

## 🔧 **Configuration**

```json
{
  "sylang.lsp.enabled": true,           // Enable Language Server Protocol
  "sylang.validation.enabled": true,    // Enable real-time validation  
  "sylang.treeSitter.enabled": true     // Use Tree-sitter for highlighting
}
```

## 📝 **Example Usage**

### **Safety Goals (ISO 26262)**
```sylang
safetygoal SG_EPB_001
  name "Prevent Unintended Activation"
  description "EPB shall not activate without driver command"
  safetylevel ASIL-C
  allocatedto ActuationControlSubsystem, HMIControlSubsystem
  derivedfrom FSR_EPB_014, FSR_EPB_027
```

### **System Component Architecture**
```sylang
component ActuatorManagementUnit
  description "Controls actuator motor and position feedback"
  safetylevel ASIL-C
  
  interfaces
    interface MotorControl
      type Digital
      direction Output
      protocol SPI
      voltage 3.3V
```

### **Hazard Analysis & Risk Assessment**
```sylang
hazard H_ACT_001
  name "Actuator Motor Runaway"
  description "Motor continues running beyond commanded position"
  cause "Motor controller failure, position feedback loss"
  effect "Excessive clamping force, potential component damage"
  category UnintendedActivation
  functions_affected "MotorDriveController", "ActuatorPositionTracker"
```

## ✨ **Key Benefits**

- **🎯 Professional MBSE Experience** - Complete systems engineering workflow
- **🔍 Cross-System Navigation** - F12 and Shift+F12 across entire system architecture
- **⚡ Standards Compliance** - Real-time validation for ISO 26262, DO-178C, IEC 62304
- **🏗️ Multi-Industry Support** - Automotive, Aerospace, Medical device development
- **📊 Requirement Traceability** - Full traceability from requirements to implementation
- **🔧 Zero Configuration** - Works out of the box with industry best practices

## 🏭 **Industry Applications**

### **Automotive (ISO 26262)**
- Electric vehicle control systems
- Advanced driver assistance systems (ADAS)
- Autonomous driving functions
- Brake and steering systems

### **Aerospace (DO-178C)**
- Flight control systems
- Avionics software
- Navigation systems
- Engine control units

### **Medical Devices (IEC 62304)**
- Patient monitoring systems
- Surgical robots
- Diagnostic equipment
- Implantable devices

## 🛠️ **Development**

### **Requirements**
- VS Code 1.74.0 or higher
- Node.js 16+ for development

### **Building from Source**
```bash
git clone https://github.com/balaji-embedcentrum/sylang.git
cd sylang
npm install
npm run compile
code --install-extension sylang-*.vsix
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](https://github.com/balaji-embedcentrum/sylang/blob/main/CONTRIBUTING.md) for details.

### **Reporting Issues**
- [Bug Reports](https://github.com/balaji-embedcentrum/sylang/issues/new?template=bug_report.md)
- [Feature Requests](https://github.com/balaji-embedcentrum/sylang/issues/new?template=feature_request.md)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 **About**

Developed by [Embed Centrum](https://github.com/balaji-embedcentrum) for professional systems engineers working in safety-critical industries requiring Model Based Systems Engineering (MBSE) approaches and standards compliance.

---

**⭐ If this extension helps your systems engineering workflow, please consider giving it a star on [GitHub](https://github.com/balaji-embedcentrum/sylang)!** 