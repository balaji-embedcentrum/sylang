# Inverter

A Sylang project for Systems & Safety Engineering using Model-Based Systems Engineering (MBSE) principles.

## Overview

This project uses Sylang - a domain-specific language for safety-critical systems engineering in automotive, aerospace, and medical device industries.

## Project Structure

```
Inverter/
├── .cursorrules                  # Cursor AI configuration
├── .github/
│   └── copilot-instructions.md   # GitHub Copilot instructions
├── .windsurf/
│   └── config.json              # Windsurf AI configuration
├── .vscode/
│   └── settings.json            # VS Code settings
├── src/                         # Your Sylang source files
└── README.md                    # This file
```

## AI Assistant Configuration

This project includes pre-configured AI context for:

- **Cursor AI**: `.cursorrules` with comprehensive Sylang syntax and examples
- **GitHub Copilot**: `.github/copilot-instructions.md` with domain knowledge  
- **Windsurf**: `.windsurf/config.json` with project configuration
- **VS Code**: Optimized settings for Sylang development

## Safety Standards Supported

- **ISO 26262** (Automotive) - ASIL A/B/C/D levels
- **DO-178C** (Aerospace) - DAL A/B/C/D/E levels  
- **IEC 62304** (Medical Devices) - Safety Classes A/B/C

## Sylang File Extensions

| Extension | Domain | Description |
|-----------|--------|-------------|
| .ple | Product Line | Product Line definitions |
| .fun/.fma | Functions | System functions and functional architecture |
| .fml | Features | Feature models |
| .sgl | Safety | Safety goals |
| .haz | Safety | Hazard analysis |
| .rsk | Safety | Risk assessment |
| .fsr | Safety | Functional safety requirements |
| .itm | Safety | Items |
| .sec/.thr/.ast | Security | Security analysis, threats, assets |
| .cmp | Components | Component definitions |
| .sub | Components | Subsystems |
| .req | Requirements | Requirements specifications |
| .mod/.prt | Software | Modules and partitions |
| .ckt | Electronics | Circuits |
| .asm | Mechanics | Assemblies |

## Getting Started

1. **Install Sylang Extension**: Get it from the VS Code Marketplace
2. **AI Ready**: Your AI assistants are pre-configured with Sylang knowledge
3. **Start Coding**: Create `.ple`, `.fun`, or `.cmp` files in the `src/` directory
4. **Use Auto-completion**: Type keywords like `productline`, `component`, `functiongroup` and let auto-completion guide you

## Example Usage

Create a product line definition (`.ple` file):

```sylang
productline MyAutomotiveSystem
  description "Electronic control system for automotive safety applications"
  owner "Systems Engineering", "Safety Team"
  domain "automotive", "safety"
  compliance "ISO 26262", "ASPICE"
  tags "ECU", "safety", "control"
  safetylevel ASIL-C
  region "Global"
```

Create system functions (`.fun` file):

```sylang
def functiongroup MySystemFunctions
  def function SafetyController
    name "Safety Controller"
    description "Main safety control function"
    owner "Safety Team"
    tags "safety", "controller"
    safetylevel ASIL-C
```

## Development Tips

1. Use VS Code auto-completion for correct syntax
2. Always specify safety levels (ASIL-A/B/C/D, DAL-A/B/C/D/E, QM)
3. Include proper owner assignments and tags
4. Reference related elements using `enables`, `implements`, `allocatedto`
5. Let AI assistants help with domain-specific content generation

## Support

- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=your-publisher.sylang)
- [Documentation](https://sylang.dev)
- [GitHub Issues](https://github.com/your-repo/sylang-extension/issues)

---

Generated with Sylang Extension v1.0.0 | AI-Enhanced Development Ready
