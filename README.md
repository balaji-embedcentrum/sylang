# Sylang

[![Version](https://img.shields.io/vscode-marketplace/v/balaji-embedcentrum.sylang.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang)
[![Downloads](https://img.shields.io/vscode-marketplace/d/balaji-embedcentrum.sylang.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang)
[![Rating](https://img.shields.io/vscode-marketplace/r/balaji-embedcentrum.sylang.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang)

**IDE Support for Sylang** - Systems and Safety Engineering Language for **Model Based Systems Engineering (MBSE)** in complex systems development across Automotive, Aerospace, and Medical industries.

## 🚀 **Features**

### **Complete MBSE Toolkit**
- **22 Sylang file extensions** with professional IDE features
- **Systems Engineering domains**: Safety, Security, Components, Software, Electronics, Mechanics
- **Safety standards compliance**: ISO 26262, DO-178C, IEC 62304
- **Real-time validation** with domain-specific engineering rules

### **Cross-File Navigation**
- **Go to Definition (F12)** - Navigate to system component definitions across files
- **Find All References (Shift+F12)** - Trace requirements and dependencies throughout workspace  
- **Workspace-wide symbol indexing** with progress feedback
- **Smart identifier recognition** for components, requirements, hazards, safety goals

### **Industry Focus**
- **Automotive Safety**: ASIL levels, functional safety requirements, hazard analysis, ISO 26262
- **Aerospace Systems**: DO-178C compliance, safety-critical software development
- **Medical Devices**: IEC 62304, risk management, device safety requirements
- **Systems Architecture**: Component hierarchies, interfaces, traceability
- **Requirements Engineering**: Traceability, verification, validation

## 📋 **Supported Engineering Domains**

| Domain | Extensions | Industry Standards |
|--------|------------|-------------------|
| **Systems Architecture** | `.ple` | Systems modeling, component hierarchies |
| **Functional Design** | `.fun`, `.fma` | System functions, behavioral models |
| **Feature Models** | `.fml` | Variability modeling, product lines |
| **Safety Engineering** | `.sgl`, `.haz`, `.rsk`, `.fsr`, `.itm` | ISO 26262, DO-178C, IEC 62304 |
| **Security Engineering** | `.sgo`, `.ast`, `.sec`, `.tra`, `.thr`, `.sre` | Cybersecurity, threat analysis |
| **Component Engineering** | `.cmp`, `.sub`, `.req` | Component specs, subsystem design |
| **Software Engineering** | `.mod`, `.prt` | Software architecture, modules |
| **Electronics Design** | `.ckt` | Circuit design, signal integrity |
| **Mechanical Design** | `.asm` | Mechanical assemblies, actuators |

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