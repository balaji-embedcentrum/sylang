# Sylang Language Reference

**A Domain-Specific Language for Model-Based Systems Engineering and Digital Twin Development**

Sylang is a specialized language designed for AI-assisted systems engineering, following the principle that "AI is the creator and human is the validator" (Andrej Karpathy). This repository serves as a comprehensive language reference for creating artifacts in complex safety-critical systems across Automotive, Aerospace, Medical, and Industrial domains.

## 🎯 Purpose

This repository provides:
- **Language Reference**: Complete specification and syntax definitions for Sylang
- **Examples**: Practical implementations demonstrating Sylang capabilities
- **Documentation**: Comprehensive guides for language usage and best practices

## 📁 Repository Structure

```
sylang/
├── examples/          # Practical Sylang implementations
│   ├── automotive/    # Automotive systems examples
│   ├── aerospace/     # Aerospace systems examples
│   ├── medical/       # Medical device examples
│   └── industrial/    # Industrial systems examples
├── language/          # Language specification and reference
│   ├── syntax/        # Syntax definitions and grammar
│   ├── semantics/     # Language semantics and rules
│   └── extensions/    # File extension specifications
└── README.md          # This file
```

## 🔧 Language Overview

Sylang uses file extensions to differentiate purpose and focus within a project. The language employs **indentation-based structure** (no braces or brackets) and supports both single-line (`//`) and multi-line (`/* */`) comments.

### File Extensions

#### 📋 Product Line Management
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.ple` | Product Line | Only one per project |
| `.fml` | Feature Model | Only one per project |
| `.vml` | Variant Model | Multiple allowed, derived from `.fml` |
| `.vcf` | Variant Config | Generated from `.vml`, only one allowed |

#### 🏗️ Systems Engineering
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.blk` | Block Definition | Multiple allowed at any hierarchical level |
| `.fun` | Function Group | Multiple allowed at various levels |
| `.req` | Requirements Section | Multiple allowed at various levels |
| `.tst` | Test Suite | Multiple allowed at various levels |

#### 🔍 Systems Analysis (Planned)
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.fma` | Failure Mode Analysis | One per folder |
| `.fmc` | Failure Mode Controls | One per folder |
| `.fta` | Fault Tree Analysis | One per folder |

#### 🛡️ Safety Analysis (Planned)
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.itm` | Item Definition | Multiple allowed |
| `.haz` | Hazard Analysis | Multiple allowed |
| `.rsk` | Risk Assessment | Multiple allowed |
| `.sgl` | Safety Goals | Multiple allowed |

## 🚀 Getting Started

### Project Structure
Every Sylang project should contain a `.sylangrules` file in the parent directory to enable proper symbol resolution and cross-file validation.

### Basic Syntax
- **Indentation-based**: Use consistent indentation to define structure
- **Comments**: 
  - Single-line: `// This is a comment`
  - Multi-line: `/* This is a multi-line comment */`
- **No brackets**: The language avoids begin/end keywords or braces

### Example Project Layout
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
└── functions/
    ├── safety.fun            # Safety functions
    └── operational.fun       # Operational functions
```

## 🌐 Related Resources

- **Official Documentation**: [sylang.dev/docs](https://sylang.dev/docs)
- **VSCode Extension**: Available for syntax highlighting and validation
- **Visual Forge**: Interactive development environment

## 🤝 Contributing

This repository serves as a language reference. For contributions:
1. Follow the established file structure
2. Ensure examples are well-documented
3. Maintain consistency with language specifications
4. Test examples for correctness

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Sylang Official Website](https://sylang.dev)
- [Documentation](https://sylang.dev/docs)
- [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=sylang.sylang-language-support)

---

**Note**: This repository focuses on language reference and examples. For the complete development environment and tooling, refer to the official Sylang ecosystem.
