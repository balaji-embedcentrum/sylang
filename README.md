# Sylang: Systems Engineering Reimagined

**Version**: 0.9.27  
**The Language for Building Tomorrow's Safety-Critical Systems**

---

## 🚀 From Complexity to Clarity

Imagine designing an autonomous vehicle, a flight control system, or a life-saving medical device. You're juggling requirements documents, architecture diagrams, safety analyses, test specifications, and regulatory compliance—all scattered across proprietary tools that don't talk to each other. Every change ripples through dozens of documents. Traceability is a nightmare. Version control? Forget about it.

**There has to be a better way.**

## 💡 Enter Sylang

Sylang is the **first language designed from the ground up for the age of AI-assisted systems engineering**. It's not just another modeling tool—it's a complete paradigm shift in how we design, document, and validate complex safety-critical systems.

### The Vision

What if your entire system—from high-level product features down to individual test cases—lived in **human-readable text files**? What if every requirement automatically knew which tests validated it, which components implemented it, and which safety goals it satisfied? What if AI could help you generate comprehensive FMEA analyses or ISO 26262 documentation in minutes instead of weeks?

**That's Sylang.**

### Why Sylang Changes Everything

🎯 **One Language, Complete Lifecycle**  
23 specialized file types covering product lines, features, architecture, requirements, tests, safety analysis, and behavioral models. Everything speaks the same language.

🔗 **Traceability Without the Pain**  
Built-in bidirectional relationships mean your requirement knows its tests, your tests know their requirements, and your safety goals know everything that implements them. No manual linking. No broken references.

🤖 **AI as Your Co-Engineer**  
Sylang's structured syntax is designed for AI collaboration. Generate requirements from safety goals, create test cases from requirements, or build FMEA analyses from architecture—all with AI assistance. You validate, AI accelerates.

📊 **Git for Systems Engineering**  
Plain text means real version control. Branch your system architecture. Merge safety analyses. Review requirements changes with diffs. Collaborate like software teams do.

🛡️ **Safety by Design**  
Native ISO 26262, DO-178, IEC 62304 support. ASIL levels, hazard analysis, fault trees, safety mechanisms—all first-class citizens. Compliance isn't bolted on; it's built in.

🔄 **Variants Made Simple**  
Feature models automatically generate product variants. One architecture, multiple configurations. From basic to premium, from regional variants to customer-specific builds—all managed declaratively.

### The Problem We're Solving

Traditional systems engineering tools are:
- **Proprietary black boxes** with vendor lock-in
- **Database-driven** making version control nearly impossible
- **Disconnected** requiring manual traceability maintenance
- **AI-resistant** with formats machines can't easily understand
- **Expensive** with per-seat licensing that limits collaboration

Sylang flips this model entirely:
- ✅ Open, text-based format anyone can read
- ✅ Git-native for true version control and branching
- ✅ Automatic traceability through declarative relationships
- ✅ AI-friendly syntax for 10x productivity gains
- ✅ Free and open for unlimited collaboration

## 🌍 Who Can Use Sylang?

Sylang isn't just for traditional embedded systems—it's for **anyone building complex systems** that need structure, traceability, and quality:

### Safety-Critical Industries
- **Automotive Engineers** - ADAS, autonomous driving, powertrain control (ISO 26262, ASPICE)
- **Aerospace Teams** - Flight control, avionics, navigation systems (DO-178C, ARP4754A)
- **Medical Device Companies** - Diagnostic equipment, therapeutic devices, patient monitoring (IEC 62304, ISO 14971)
- **Industrial Automation** - Safety PLCs, robotic systems, process control (IEC 61508, ISO 13849)
- **Railway Systems** - Signaling, train control, platform safety (EN 50128, CENELEC)

### Software & Web Development
- **Enterprise Applications** - Complex business systems requiring CMMI Level 3-5 compliance
- **Financial Systems** - Trading platforms, payment gateways, banking applications
- **E-commerce Platforms** - Multi-tenant systems with variant management needs
- **SaaS Products** - Feature-rich applications with multiple deployment configurations
- **API-First Companies** - Microservices architectures requiring interface documentation and traceability
- **Regulated Software** - Any application requiring audit trails, requirements traceability, and compliance documentation

### Why Web Developers Love Sylang
- **CMMI Compliance Made Easy** - Built-in requirements management and traceability for CMMI Levels 2-5
- **API Documentation** - `.ifc` files define contracts between services with full traceability
- **Feature Flags on Steroids** - Feature models (`.fml`) manage complex product variants and A/B testing scenarios
- **Architecture as Code** - Document microservices, databases, and infrastructure in `.blk` files
- **Requirements → Tests → Code** - Full traceability from user stories to test cases to implementation
- **Git-Native Workflow** - Works exactly like your existing development process

### Anyone Who Needs
- ✅ **Traceability** from requirements to implementation to tests
- ✅ **Variant Management** for product lines or multi-tenant systems
- ✅ **Compliance Documentation** for audits and certifications
- ✅ **Architecture Documentation** that stays in sync with code
- ✅ **AI-Assisted Development** to accelerate documentation and analysis
- ✅ **Version Control** for all engineering artifacts, not just code

## 🎨 The Sylang Philosophy

> **"AI creates, humans validate"**

We believe the future of engineering is collaborative intelligence. AI excels at generating structured content, exploring design spaces, and maintaining consistency. Humans excel at judgment, creativity, and validation. Sylang is designed for this partnership.

### What Makes Sylang Different?

It's not just what Sylang does—it's **how it thinks**:

- **Declarative over Imperative**: Describe what your system *is*, not how to build it
- **Relationships over References**: Connect artifacts through semantic meaning, not manual links
- **Text over Binary**: Human-readable, diff-able, merge-able, future-proof
- **Standards over Conventions**: ISO 26262, ASPICE, INCOSE—baked into the language
- **Collaboration over Silos**: Git workflows, code review practices, CI/CD integration

## 🔮 The Future is Readable

In 10 years, we believe all complex systems will be designed in text-based, version-controlled, AI-collaborative languages. Sylang is that future, available today.

Whether you're designing the next generation of autonomous vehicles, building spacecraft that must never fail, or creating medical devices that save lives—Sylang gives you the tools to engineer with confidence, collaborate with ease, and move at the speed of innovation.

**Welcome to the future of systems engineering.**

## 🎯 Purpose

This repository provides:
- **Language Reference**: Complete specification and syntax definitions for Sylang
- **Extension Help Files**: Detailed guides for all 23 Sylang file extensions
- **AI Prompting Strategy**: Curated prompts for AI-assisted Sylang development
- **Examples**: Practical implementations demonstrating Sylang capabilities (coming soon)
- **Documentation**: Comprehensive guides for language usage and best practices

## 📁 Repository Structure

```
sylang/
├── examples/                       # Practical Sylang implementations
│   ├── automotive/                 # Automotive systems examples
│   ├── aerospace/                  # Aerospace systems examples
│   ├── medical/                    # Medical device examples
│   ├── industrial/                 # Industrial systems examples
│   ├── web-development/            # Web application examples
│   └── README.md                   # Examples guide
├── language/                       # Language specification and reference
│   ├── SYLANG_COMPLETE_REFERENCE.md    # Complete language reference
│   └── sylang-help/                # Extension-specific help files
│       ├── README.md               # Help files overview
│       ├── ple-help.md             # Product Line Engineering
│       ├── fml-help.md             # Feature Model
│       ├── vml-help.md             # Variant Model
│       ├── vcf-help.md             # Variant Configuration
│       ├── blk-help.md             # Block Definition
│       ├── fun-help.md             # Function Definition
│       ├── ifc-help.md             # Interface Definition
│       ├── req-help.md             # Requirements
│       ├── tst-help.md             # Test Definition
│       ├── ucd-help.md             # Use Case Diagram
│       ├── seq-help.md             # Sequence Diagram
│       ├── smd-help.md             # State Machine Diagram
│       ├── flr-help.md             # Failure Analysis (FMEA)
│       ├── fta-help.md             # Fault Tree Analysis
│       ├── itm-help.md             # Item Definition (ISO 26262)
│       ├── haz-help.md             # Hazard Analysis
│       ├── sam-help.md             # Safety Mechanisms
│       ├── sgl-help.md             # Safety Goals
│       ├── spr-help.md             # Sprint Planning
│       ├── agt-help.md             # Agent Definition
│       ├── spec-help.md            # Specification Document
│       ├── dash-help.md            # Dashboard
│       ├── relations-matrix-help.md # Traceability matrix
│       └── sylang-prompts/         # AI prompting templates
│           ├── README.md           # Prompting strategy guide
│           └── [23 prompt files]   # Extension-specific prompts
├── LICENSE                         # Apache License 2.0
└── README.md                       # This file
```

## 🔧 Language Overview

Sylang uses file extensions to differentiate purpose and focus within a project. The language employs **indentation-based structure** (no braces or brackets) and supports both single-line (`//`) and multi-line (`/* */`) comments.

### File Extensions (23 Total)

#### 📋 Product Line Management
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.ple` | Product Line Engineering | Only one per project (root file) |
| `.fml` | Feature Model | Only one per folder |
| `.vml` | Variant Model | Multiple allowed (auto-generated) |
| `.vcf` | Variant Configuration | Only one per folder (auto-generated) |

#### 🏗️ Architecture & Design
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.blk` | Block Definition | Multiple allowed (hardware/software blocks) |
| `.fun` | Function Definition | Multiple allowed (functional behavior) |
| `.ifc` | Interface Definition | Multiple allowed (operations/signals/datatypes) |

#### 📝 Requirements & Testing
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.req` | Requirement Definition | Multiple allowed (with traceability) |
| `.tst` | Test Definition | Multiple allowed (validation/verification) |

#### 📊 Behavioral Modeling
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.ucd` | Use Case Diagram | Multiple allowed (actor interactions) |
| `.seq` | Sequence Diagram | Multiple allowed (message flows) |
| `.smd` | State Machine Diagram | Multiple allowed (state-based behavior) |

#### 🛡️ Safety & Reliability (ISO 26262)
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.flr` | Failure Analysis (FMEA) | Multiple allowed (AIAG VDA FMEA) |
| `.fta` | Fault Tree Analysis | Multiple allowed (quantitative FTA) |
| `.itm` | Item Definition | Multiple allowed (ISO 26262 Part 3) |
| `.haz` | Hazard Analysis | Multiple allowed (HARA with ASIL) |
| `.sam` | Safety Mechanisms | Multiple allowed (ISO 26262 Part 4) |
| `.sgl` | Safety Goals | Multiple allowed (derived from hazards) |

#### 📅 Project Management
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.spr` | Sprint Planning | Multiple allowed (Agile/Scrum) |
| `.agt` | Agent Definition | Multiple allowed (AI agent specs) |

#### 📄 Documentation & Dashboards
| Extension | Description | Usage Rule |
|-----------|-------------|------------|
| `.spec` | Specification Document | Multiple allowed (technical specs) |
| `.dash` | Dashboard | Multiple allowed (metrics/KPIs) |

## 🚀 Getting Started

### Project Structure
Sylang projects use a structured directory layout to organize different types of artifacts (architecture, requirements, tests, safety analysis, etc.).

### Basic Syntax
- **Indentation-based**: Use consistent indentation to define structure (2 or 4 spaces)
- **Comments**: 
  - Single-line: `// This is a comment`
  - Multi-line: `/* This is a multi-line comment */`
- **No brackets**: The language avoids begin/end keywords or braces
- **Multiline strings**: Use `"""` triple quotes for multiline descriptions
- **Keywords**: `hdef`, `def`, `use`, `ref`, and relationship keywords

### File Structure Pattern
Every Sylang file follows this structure:
1. **Import statements** (`use` keyword) - Reference external symbols
2. **Header definition** (`hdef` keyword) - ONE per file, defines main container
3. **Symbol definitions** (`def` keyword) - Multiple allowed (varies by extension)
4. **Properties** - Indented under parent symbols
5. **Relations** - Cross-file references using `ref` keyword

### Example Project Layout
```
my-project/
├── system.ple                      # Product line definition (root file)
├── features.fml                    # Feature model
├── variants/
│   ├── variant-a.vml               # Variant model A (auto-generated)
│   ├── variant-b.vml               # Variant model B (auto-generated)
│   └── config.vcf                  # Configuration (auto-generated)
├── architecture/
│   ├── main-system.blk             # Main system block
│   ├── interfaces.ifc              # Interface definitions
│   └── subsystems/
│       ├── control.blk             # Control subsystem
│       └── monitoring.blk          # Monitoring subsystem
├── functions/
│   ├── safety.fun                  # Safety functions
│   └── operational.fun             # Operational functions
├── requirements/
│   ├── system-req.req              # System requirements
│   └── safety-req.req              # Safety requirements
├── tests/
│   └── integration-tests.tst       # Test definitions
├── safety/                         # ISO 26262 artifacts
│   ├── item-definition.itm         # Item definition
│   ├── hazard-analysis.haz         # HARA
│   ├── safety-goals.sgl            # Safety goals
│   ├── safety-mechanisms.sam       # Safety mechanisms
│   ├── fmea.flr                    # FMEA analysis
│   └── fault-tree.fta              # FTA analysis
└── diagrams/
    ├── use-cases.ucd               # Use case diagrams
    ├── sequences.seq               # Sequence diagrams
    └── state-machines.smd          # State machine diagrams
```

## 📚 Documentation & Help

### Complete Language Reference
- **[SYLANG_COMPLETE_REFERENCE.md](language/SYLANG_COMPLETE_REFERENCE.md)** - Comprehensive reference for all 23 extensions
- **[sylang-help/](language/sylang-help/)** - Individual help files for each extension
- **[sylang-prompts/](language/sylang-help/sylang-prompts/)** - AI prompting templates and strategies

### Quick Links by Topic
- **Getting Started**: [sylang-help/README.md](language/sylang-help/README.md)
- **Product Line Engineering**: [ple-help.md](language/sylang-help/ple-help.md), [fml-help.md](language/sylang-help/fml-help.md)
- **Architecture**: [blk-help.md](language/sylang-help/blk-help.md), [fun-help.md](language/sylang-help/fun-help.md), [ifc-help.md](language/sylang-help/ifc-help.md)
- **Requirements & Testing**: [req-help.md](language/sylang-help/req-help.md), [tst-help.md](language/sylang-help/tst-help.md)
- **ISO 26262 Safety**: [itm-help.md](language/sylang-help/itm-help.md), [haz-help.md](language/sylang-help/haz-help.md), [sgl-help.md](language/sylang-help/sgl-help.md)
- **AI-Assisted Development**: [sylang-prompts/README.md](language/sylang-help/sylang-prompts/README.md)

## 🤖 AI-Assisted Development

Sylang is designed with the philosophy **"AI creates, humans validate"**. The language is optimized for AI-assisted development:

- **Structured Prompts**: Pre-built prompts for each extension type
- **Context-Aware Generation**: AI tools can generate complete files with proper syntax
- **Traceability**: Automatic relationship generation between artifacts
- **Validation**: Human review and refinement of AI-generated content

See [sylang-prompts/README.md](language/sylang-help/sylang-prompts/README.md) for detailed prompting strategies.

## 🏭 Standards Compliance

Sylang provides complete support for industry standards:

- ✅ **ISO 26262** (Automotive Functional Safety) - Parts 3 & 4
- ✅ **ASPICE/Automotive SPICE** - Full traceability and process compliance
- ✅ **INCOSE Systems Engineering** - Complete SE lifecycle support
- ✅ **DO-178** (Aviation Software) - Requirements and test coverage
- ✅ **IEC 62304** (Medical Device Software) - Risk management and design control
- ✅ **AIAG VDA FMEA** - Failure mode and effects analysis

## 🔑 Key Features

- **Indentation-based syntax** - Clean, readable structure without braces
- **Bidirectional traceability** - Complete relationship tracking across artifacts
- **Variant management** - Feature models with automatic variant generation
- **Safety analysis** - Built-in ISO 26262 compliance artifacts
- **Behavioral modeling** - UML-style diagrams (use case, sequence, state machine)
- **AI-optimized** - Designed for AI-assisted content generation
- **Git-friendly** - Text-based format for version control

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
5. Update help files when adding new features

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Sylang Official Website](https://sylang.dev)
- [Documentation](https://sylang.dev/docs)
- [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=sylang.sylang-language-support)
- [GitHub Repository](https://github.com/balaji-embedcentrum/sylang)

---

**Note**: This repository focuses on language reference and examples. For the complete development environment and tooling, refer to the official Sylang ecosystem.

**Version**: 0.9.27 | **Last Updated**: October 2025
