# Sylang Language Reference

Welcome to the Sylang Model-Based Systems Engineering Language reference documentation. This guide provides comprehensive information about all Sylang file extensions, syntax rules, and best practices.

## Quick Navigation

### Core Product Line Engineering
- [**PLE** - Product Line Engineering](ple-help.md) - Root product line definition
- [**FML** - Feature Model](fml-help.md) - Feature hierarchy and constraints
- [**VML** - Variant Model](vml-help.md) - Variant selection (auto-generated)
- [**VCF** - Variant Configuration](vcf-help.md) - Configuration values (auto-generated)

### System Architecture & Design
- [**BLK** - Block Definition](blk-help.md) - Hardware/software blocks and interfaces
- [**FUN** - Function Definition](fun-help.md) - Functional behavior specifications
- [**IFC** - Interface Definition](ifc-help.md) - Operations, signals, datatypes, and parameters
- [**REQ** - Requirement Definition](req-help.md) - System requirements with traceability
- [**TST** - Test Definition](tst-help.md) - Validation and verification tests

### Behavioral Modeling
- [**UCD** - Use Case Diagram](ucd-help.md) - Actor and use case interactions
- [**SEQ** - Sequence Diagram](seq-help.md) - Message flow sequences
- [**SMD** - State Machine Diagram](smd-help.md) - State-based behavior

### Safety & Reliability (ISO 26262)
- [**FLR** - Failure Analysis (FMEA)](flr-help.md) - Failure modes and effects analysis
- [**ITM** - Item Definition](itm-help.md) - ISO 26262 item definition
- [**HAZ** - Hazard Analysis](haz-help.md) - Hazard analysis and ASIL assessment
- [**SAM** - Safety Mechanisms](sam-help.md) - Safety mechanism specifications
- [**FTA** - Fault Tree Analysis](fta-help.md) - Quantitative fault tree analysis

### Project Management
- [**SPR** - Sprint Planning](spr-help.md) - Agile sprint and task management
- [**AGT** - Agent Definition](agt-help.md) - AI agent specifications

## Key Concepts

### File Structure
Every Sylang file follows a consistent structure:
1. **Import statements** (`use` keyword) - Reference external symbols
2. **Header definition** (`hdef` keyword) - ONE per file, defines the main container
3. **Symbol definitions** (`def` keyword) - Multiple allowed (varies by extension)
4. **Properties** - Indented under parent symbols
5. **Relations** - Cross-file references using `ref` keyword

### Traceability
Sylang provides complete bidirectional traceability through relationship keywords:
- `implements` - Function/block implements requirement
- `satisfies` - Test satisfies requirement
- `allocatedto` - Allocation to architectural elements
- `derivedfrom` - Requirement derivation
- `refinedfrom` - Requirement refinement

### Configuration Management
- **Config-based graying**: Use `when ref config` to conditionally show/hide elements
- **Variant selection**: `.fml` → `.vml` → `.vcf` pipeline for product variants
- **Version control**: Git-based configuration management (superior to database approaches)

### Safety Standards Compliance
- **ISO 26262**: Complete Part 3 & 4 compliance with `.itm`, `.haz`, `.sam`, `.fta` extensions
- **ASIL support**: Full ASIL-A through ASIL-D with QM (Quality Management)
- **ASPICE**: Automotive SPICE compliance through structured requirements and traceability

## Language Version
**Current Version**: 2.26.41

## Getting Started
1. Start with `.ple` file to define your product line
2. Create `.fml` file to define features
3. Generate `.vml` and `.vcf` files using right-click commands
4. Define architecture using `.blk` and `.fun` files
5. Specify requirements in `.req` files
6. Create test cases in `.tst` files
7. Conduct safety analysis using `.flr`, `.haz`, `.sam`, `.fta` files

## Important Notes
- **One `.fml` per folder**: Only one feature model allowed per directory
- **One `.vcf` per folder**: Only one configuration file allowed per directory
- **Multiple `.vml` per folder**: Multiple variant definitions allowed
- **Multiline strings**: Use `"""` triple quotes for multiline content
- **Auto-generation**: Never manually create `.vml` or `.vcf` files - use right-click commands

## Standards Coverage
✅ **ASPICE/Automotive SPICE** - Full traceability and process compliance  
✅ **INCOSE Systems Engineering** - Complete SE lifecycle support  
✅ **ISO 26262 Functional Safety** - Part 3 & 4 complete implementation  
✅ **DO-178 Aviation** - Requirements and test coverage support  
✅ **Medical Device Standards** - Risk management and design control traceability

---

For detailed information about each extension, click on the links above or browse the individual help files.

