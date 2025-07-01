# Sylang Language Support

[![Version](https://img.shields.io/vscode-marketplace/v/balaji-embedcentrum.sylang-language-support.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang-language-support)
[![Downloads](https://img.shields.io/vscode-marketplace/d/balaji-embedcentrum.sylang-language-support.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang-language-support)
[![Rating](https://img.shields.io/vscode-marketplace/r/balaji-embedcentrum.sylang-language-support.svg)](https://marketplace.visualstudio.com/items?itemName=balaji-embedcentrum.sylang-language-support)

Professional IDE support for **Sylang DSL** - A complete Product Line Engineering toolkit for automotive safety & security development.

## 🚀 **Features**

### **Universal Language Support**
- **22 Sylang file extensions** with full IDE features
- **Syntax highlighting** for all domains: Safety, Security, Components, Software, Electronics, Mechanics
- **Auto-completion** with domain-specific keywords and snippets
- **Real-time validation** with intelligent error detection

### **Cross-File Navigation**
- **Go to Definition (F12)** - Jump to actual symbol definitions across files
- **Find All References (Shift+F12)** - Locate all usages throughout workspace  
- **Workspace-wide symbol indexing** with progress feedback
- **Smart identifier recognition** for components, requirements, hazards, goals

### **Domain Expertise**
- **Automotive Safety**: ASIL levels, functional safety requirements, hazard analysis
- **Cybersecurity**: TARA, threat modeling, security goals  
- **Component Architecture**: Subsystems, interfaces, dependencies
- **Software Engineering**: Modules, algorithms, services, timing analysis
- **Electronics Design**: Circuits, PCBs, signal integrity, power management
- **Mechanical Design**: Assemblies, materials, tolerances, actuators

## 📋 **Supported File Types**

| Domain | Extensions | Description |
|--------|------------|-------------|
| **Product Line** | `.ple` | Product line definitions and configurations |
| **Functions** | `.fun`, `.fma` | System functions and functional models |
| **Features** | `.fml` | Feature models with variability |
| **Safety** | `.sgl`, `.haz`, `.rsk`, `.fsr`, `.itm` | Safety goals, hazards, risks, requirements |
| **Security** | `.sgo`, `.ast`, `.sec`, `.tra`, `.thr`, `.sre` | Security goals, assets, threats |
| **Components** | `.cmp`, `.sub`, `.req` | Components, subsystems, requirements |
| **Software** | `.mod`, `.prt` | Software modules and parts |
| **Electronics** | `.ckt` | Electronic circuits and designs |
| **Mechanics** | `.asm` | Mechanical assemblies and components |

## 🎯 **Quick Start**

### **Installation**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Sylang Language Support"
4. Click Install

### **Usage**
1. **Open any Sylang file** - Automatic language detection and syntax highlighting
2. **Start typing** - IntelliSense provides auto-completion
3. **Use F12** - Navigate to definitions across files
4. **Press Shift+F12** - Find all references in workspace
5. **Check Problems panel** - Real-time validation and error detection

## 🔧 **Configuration**

```json
{
  "sylang.lsp.enabled": true,           // Enable Language Server Protocol
  "sylang.validation.enabled": true,    // Enable real-time validation  
  "sylang.treeSitter.enabled": true     // Use Tree-sitter for highlighting
}
```

## 📝 **Example Usage**

### **Safety Goals (.sgl)**
```sylang
safetygoal SG_EPB_001
  name "Prevent Unintended Activation"
  description "EPB shall not activate without driver command"
  safetylevel ASIL-C
  allocatedto ActuationControlSubsystem, HMIControlSubsystem
  derivedfrom FSR_EPB_014, FSR_EPB_027
```

### **Component Definition (.cmp)**
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

### **Hazard Analysis (.haz)**
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

- **🎯 Professional IDE Experience** - IntelliSense, validation, navigation
- **🔍 Cross-File Navigation** - F12 and Shift+F12 work across entire workspace
- **⚡ Real-Time Feedback** - Instant validation with intelligent error detection
- **🏗️ Domain Expertise** - Automotive-specific keywords and validation rules
- **📊 Workspace Indexing** - Progress feedback and comprehensive symbol tracking
- **🔧 Zero Configuration** - Works out of the box with intelligent defaults

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
code --install-extension sylang-language-support-*.vsix
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](https://github.com/balaji-embedcentrum/sylang/blob/main/CONTRIBUTING.md) for details.

### **Reporting Issues**
- [Bug Reports](https://github.com/balaji-embedcentrum/sylang/issues/new?template=bug_report.md)
- [Feature Requests](https://github.com/balaji-embedcentrum/sylang/issues/new?template=feature_request.md)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 **About**

Developed by [Embed Centrum](https://github.com/balaji-embedcentrum) for professional automotive software development teams working with Product Line Engineering, Functional Safety, and Cybersecurity.

---

**⭐ If this extension helps your development workflow, please consider giving it a star on [GitHub](https://github.com/balaji-embedcentrum/sylang)!** 