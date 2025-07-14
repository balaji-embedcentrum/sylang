# Change Log

All notable changes to the "Sylang" extension will be documented in this file.

## [1.0.62] - 2025-01-15

### Changed
- **Streamlined Commands**: Removed unused/redundant commands for cleaner implementation
- Kept only 3 essential commands: `🤖 Create Sylang Rules`, `Validate Workspace`, `Refresh Symbols`
- Removed context menus and obsolete command palette entries
- Cleaned up file extension detection in isSylangDocument() method

### Removed
- `Validate Sylang File` (redundant with real-time validation)
- `Format Sylang File` (redundant with real-time formatting)  
- `🚀 Generate Sylang Project` (unimplemented)
- `📊 Analyze .ple/.fml Files` (unimplemented)
- `✅ Validate All .ple/.fml Files` (unimplemented)
- All context menu entries and submenus

### Technical Details
- Simplified package.json commands section
- Removed obsolete file extensions (.sub, .cmp, .mod, .prt, .ckt, .asm, .fsr)
- Focused implementation on working core features only

## [1.0.61] - 2025-01-14

### Fixed
- **BREAKING: Complete Language Consistency**
  - **Replaced 'asil' with 'safetylevel'**: Updated all validators, syntax highlighting, and sample files to use unified `safetylevel` keyword
  - **Removed 'functionalsafetyrequirements'**: Completely eliminated this keyword from all validators, configs, syntax files, and snippets
  - **Updated Sample Files**: All Inverter example files now use correct `safetylevel ASIL-A/B/C/D/QM` syntax
  - **Fixed Syntax Highlighting**: Updated all .tmGrammar.json files to highlight `safetylevel` instead of `asil`
  - **Validator Updates**: 15+ validator files updated to properly validate `safetylevel` with ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM values
  - **Documentation Updates**: Removed .fsr references and functionalsafetyrequirements from guides

### Enhanced
- **Consistent Safety Level Validation**: All safety levels now use unified ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM format
- **Future-Ready Architecture**: `safetylevel` keyword supports additional safety standards beyond ASIL
- **Cleaner Codebase**: Removed inconsistent keywords and unified language specification

## [1.0.60] - 2025-01-14

### Changed
- **BREAKING: Language Specification Updates**
  - **Unified Safety Levels**: Removed `asil` keyword completely, now only use `safetylevel` with values `ASIL-A`, `ASIL-B`, `ASIL-C`, `ASIL-D`, `QM`
  - **Removed Version Property**: Eliminated `version` keyword from all file types - no longer needed
  - **Consolidated Requirements**: Removed `.fsr` files and `functionalsafetyrequirements` keyword - all requirements now use `.req` files only
  - **Unified Block Definitions**: Eliminated separate `.cmp`, `.sub`, `.mod`, `.prt`, `.ckt`, `.asm` files - all now consolidated into `.blk` files
  - **Removed Interface Keywords**: Eliminated `interface` and `interfaces` keywords - no longer used in any file types
  - **Updated .sylangrules**: Complete language specification file updated to reflect all changes

### Enhanced
- **Simplified Syntax**: More consistent and streamlined language syntax across all file types
- **Future-Ready**: `safetylevel` keyword now supports other safety standards beyond ASIL (e.g., SIL)
- **Reduced Complexity**: Fewer file types and keywords to learn and maintain

## [1.0.59] - 2025-01-14

### Added
- **Create Sylang Rules Command**: New VS Code command `🤖 Create Sylang Rules` for AI-assisted code generation
  - **Comprehensive Language Specification**: Complete .sylangrules file covering all 22+ Sylang file extensions
  - **AI Context File**: Detailed syntax rules, validation requirements, and examples for every file type
  - **Use Case**: Provide .sylangrules as context to AI tools for accurate Sylang code generation
  - **Complete Coverage**: .ple, .fml, .fun, .sgl, .haz, .rsk, .fsr, .itm, .cmp, .sub, .req, .mod, .prt, .ckt, .asm, .blk, .tst, and all other extensions
  - **Smart Overwrite Protection**: Prompts before overwriting existing .sylangrules files
  - **Auto-Open**: Automatically opens the generated file for review

### Enhanced
- **Command Palette Integration**: Accessible via Ctrl+Shift+P → "Create Sylang Rules"
- **Workspace-Aware**: Creates .sylangrules file in workspace root directory
- **Comprehensive Documentation**: Includes syntax examples, validation rules, best practices, and cross-file reference patterns

## [1.0.58] - 2025-01-14

### Added
- **Test Case File Support (.tst)**: Complete implementation of test case files for safety-critical testing
  - **Test Suite Definitions**: `def testsuite <TestSuiteIdentifier>` with comprehensive test management
  - **Test Case Definitions**: `def testcase <TestCaseIdentifier>` with detailed test specifications
  - **Test Properties**: testtype, coverage, method, priority, asil, verifies requirement, exercises
  - **Test Enums**: Comprehensive enum validation for test types (unit, integration, system), coverage (statement, branch, mcdc), methods (manual, automated, hil, sil), results (pass, fail, pending), priorities (critical, high, medium, low)
  - **Cross-File Validation**: Validates requirement and function references with proper import checking
  - **Test Steps**: Structured test steps with `step STEP_ID "description"` format
  - **Syntax Highlighting**: Complete syntax highlighting for all test keywords and enum values
  - **Code Snippets**: Comprehensive snippets for test suites, test cases, steps, and properties

### Enhanced
- **TestValidator**: New validator with full enum validation, cross-file reference checking, and ISO standards compliance
- **SymbolManager Integration**: Proper import-aware validation for test file dependencies
- **Language Server**: Added test file support to language server with real-time validation

## [1.0.57] - 2025-01-14

### Added
- **Port Support in .blk Files**: Complete implementation of port functionality for system/component interfaces
  - **Port References**: `port in PortA, PortB, PortC` - reference ports from other .blk files (required interfaces)
  - **Port Definitions**: `def port out PortName` - define ports this block provides (provided interfaces)
  - **Port Properties**: name, description, type (enum), owner, asil, tags
  - **Port Types**: electrical, mechanical, data, CAN, Ethernet, hydraulic, pneumatic, optical, thermal, audio, RF, sensor, actuator
  - **Cross-File Validation**: Validates port references against definitions in other .blk files
  - **Syntax Highlighting**: Full syntax highlighting for port keywords and types

### Enhanced
- **Block Validator**: Updated to handle both port references and definitions with proper validation
- **Language Configuration**: Added all port-related keywords and validation rules
- **Type Safety**: Port type enum validation ensures consistent interface specifications

## [1.0.56] - 2025-01-14

### Fixed
- **Functions Validator File Start Logic**: Fixed validation error when `use` statements precede `def functiongroup`
  - **Issue**: Functions files with valid `use featureset` imports at the top were incorrectly flagged as "must start with def functiongroup"
  - **Resolution**: Updated `validateFileStartsWithFunctiongroup` to skip over `use` statements before checking for the first definition
  - **Behavior**: Now properly allows `use` statements, comments, and empty lines before `def functiongroup` declaration
  - **Consistency**: Matches behavior of other validators (BlockValidator, SystemValidator, etc.)

### Enhanced
- **Better Error Message**: Updated error message to clarify that imports with "use" keyword are allowed before `def functiongroup`

## [1.0.55] - 2025-01-14

### Fixed
- **Functions Validator Import Validation**: Fixed missing "use" statement validation in .fun files
  - **Issue**: Functions could reference features without declaring dependencies via `use featureset` statements
  - **Resolution**: Updated FunctionsValidator to use import-aware validation like other validators
  - **Behavior**: Now shows errors like "Undefined feature 'FeatureName' - missing 'use featureset FeatureName' import or definition"
  - **Compliance**: Ensures proper cross-file dependency management and project structure integrity

### Enhanced
- **Consistent Validation**: Functions validator now matches validation behavior of BlockValidator and other validators
- **Better Error Messages**: Clear guidance on required import statements for feature dependencies

## [1.0.54] - 2025-01-14

### Changed
- **Functions Definition Language Update**: Complete transition from `systemfunctions`/`subsystemfunctions` to `functiongroup`
  - **Breaking Change**: `def systemfunctions` → `def functiongroup`
  - **Breaking Change**: `def subsystemfunctions` → `def functiongroup` 
  - **Generic Approach**: Single `functiongroup` keyword replaces hierarchy-specific containers
  - **Backward Compatibility**: Old syntax marked as deprecated with clear migration guidance
  - Updated all validators, providers, and documentation
  - Updated sample files and test cases
  - Enhanced completion templates with modern syntax

### Benefits
- **Simplified Function Organization**: Generic `functiongroup` container works at any hierarchy level
- **Future-Proof Design**: More flexible approach for organizing functions
- **Clear Migration Path**: Deprecation warnings guide users to new syntax
- **Consistent Language**: Aligns with other Sylang container patterns

## [1.0.20] - 2025-01-08

### Changed
- **Simplified .sgl File Structure**: Cleaned up safety goals file structure
  - Changed `safetygoalsdefinition` to `safetygoalsdef` for consistency
  - Removed `requirementsreferences` and `verificationreferences` sections
  - Removed obsolete keywords: `functionalrequirements`, `technicalrequirements`, `verificationplan`, `validationplan`
  - Updated syntax highlighting and code snippets to match simplified structure

### Benefits
- **Cleaner Safety Goals Structure**: Simplified keyword naming for better readability
- **Reduced Complexity**: Removed unnecessary reference sections
- **Consistent Naming**: Shortened keywords for better usability

---

## [1.0.19] - 2025-01-08

### Removed
- **Simplified .rsk File Structure**: Removed unnecessary sections from risk assessment files
  - Removed `risktreatment` and `validationrequirements` sections from .rsk files
  - Removed related keywords: `requirement`, `highestrisk`, `prioritization`
  - Removed "Safety Requirement" snippet from safety.json
  - Cleaned up sample EPBRiskAssessment.rsk file to focus on core S×E×C methodology
  - Updated language configuration and syntax highlighting to remove obsolete keywords

### Benefits
- **Cleaner Risk Assessment Structure**: Focused on essential ISO 26262 S×E×C methodology
- **Reduced Complexity**: Simplified .rsk file structure for better maintainability
- **Consistent Templates**: Updated code snippets to match simplified structure

---

## [1.0.0] - 2024-12-19

### 🚀 **Initial Release - Professional Sylang MBSE IDE Support**

#### ✅ **Complete MBSE Toolkit**
- **22 Sylang file extensions** with professional IDE features for systems engineering
- **Multi-industry support**: Automotive, Aerospace, and Medical device development
- **Safety standards compliance**: ISO 26262, DO-178C, IEC 62304 validation
- **Domain-specific syntax highlighting** for all engineering disciplines

#### ✅ **Cross-System Navigation**
- **Go to Definition (F12)** - Navigate to system component definitions across files  
- **Find All References (Shift+F12)** - Trace requirements and dependencies throughout workspace
- **Workspace-wide symbol indexing** with real-time progress feedback
- **Smart identifier recognition** for components, requirements, hazards, safety goals

#### ✅ **Enhanced Safety & Standards Validation**
- **Real-time standards compliance** checking for automotive, aerospace, and medical
- **ASIL safety level validation** (ASIL-A through ASIL-D, QM) for ISO 26262
- **DO-178C compliance** features for aerospace software development
- **IEC 62304 support** for medical device software lifecycle processes

#### ✅ **Professional IDE Features**
- **IntelliSense** with engineering-specific context-aware suggestions
- **Code snippets** for common MBSE patterns across all domains
- **Document formatting** with systems engineering best practices
- **Hover documentation** for standards and technical terms

#### ✅ **Language Server Protocol (LSP)**
- **Full LSP implementation** for professional systems engineering IDE experience
- **Workspace symbol indexing** with progress notifications
- **Cross-file navigation** with definition prioritization for system architecture
- **Real-time diagnostics** and standards compliance validation

#### ✅ **Supported Engineering Domains**
- **Systems Architecture** (`.ple`) - Systems modeling, component hierarchies
- **Functional Design** (`.fun`, `.fma`) - System functions, behavioral models  
- **Feature Models** (`.fml`) - Variability modeling, product lines
- **Safety Engineering** (`.sgl`, `.haz`, `.rsk`, `.fsr`, `.itm`) - ISO 26262, DO-178C, IEC 62304
- **Security Engineering** (`.sgo`, `.ast`, `.sec`, `.tra`, `.thr`, `.sre`) - Cybersecurity, threat analysis
- **Component Engineering** (`.cmp`, `.sub`, `.req`) - Component specs, subsystem design
- **Software Engineering** (`.mod`, `.prt`) - Software architecture, modules
- **Electronics Design** (`.ckt`) - Circuit design, signal integrity
- **Mechanical Design** (`.asm`) - Mechanical assemblies, actuators

### 🎯 **Key Benefits**
- Zero configuration - works out of the box with industry best practices
- Professional MBSE workflow support for complex systems
- Cross-industry applicability (Automotive, Aerospace, Medical)
- Standards compliance with real-time validation
- Complete requirement traceability and dependency management

### 🔧 **Technical Details**
- Built with TypeScript and Language Server Protocol
- Modular architecture for easy extensibility across engineering domains
- Tree-sitter based syntax highlighting optimized for systems engineering
- Comprehensive test coverage for safety-critical development
- Performance optimized for large, complex system architectures

---

**Full feature documentation available in [README.md](README.md)**

## [1.0.9] - 2024-01-XX

### Fixed
- **Reference Validation Logic**: Fixed issue where defined identifiers like `FeatureName` were incorrectly flagged as "Unknown keyword"
- **Constraint Keyword Validation**: Added typo detection for constraint keywords (e.g., `exckludes` now suggests `excludes`)
- **Improved Keyword Spelling**: Enhanced logic to distinguish between keywords and identifiers in constraint lines
- **Type Safety**: Added proper null checks to prevent TypeScript errors in validation logic

### Changed
- Reference validation now uses broader pattern matching to catch constraint keyword typos
- Keyword spelling validation skips constraint lines to avoid false positives
- Added Levenshtein distance algorithm for better typo suggestions

## [1.0.8] - 2024-01-XX

### Added 

## [1.0.10] - 2024-01-XX

### Added
- **ISO 26580 Sibling Variability Consistency Validation**: Implemented critical safety standard compliance
  - Rule 1: If a feature is `mandatory`, siblings can only be `mandatory` or `optional`
  - Rule 2: If a feature is `optional`, siblings can only be `mandatory` or `optional`
  - Rule 3: If a feature is `or`, all siblings must be `or`
  - Rule 4: If a feature is `alternative`, all siblings must be `alternative`
- **Feature Hierarchy Analysis**: Added indentation-based sibling detection for nested feature models
- **Safety Standard Compliance**: Enforces ISO 26580 feature modeling constraints for automotive safety

### Technical
- Added `FeatureNode` interface for feature hierarchy representation
- Implemented `validateSiblingVariabilityConsistency()` method in FeaturesValidator
- Added sibling grouping algorithm based on indentation levels
- Enhanced document-level validation with safety standard checks

## [1.0.11] - 2024-01-XX

### Added
- **Comprehensive Hierarchical Indentation Validation**: Strict enforcement of indentation rules for feature hierarchies
  - `systemfeatures` must start at column 0
  - Features use 2-space increments from their parent level
  - Properties (name, description, owner, tags, safetylevel) must be exactly 2 spaces deeper than their parent feature
  - `constraints` section must be 2 spaces from systemfeatures
  - Constraint rules must be 2 spaces deeper than constraints section
- **Parent-Child Relationship Enforcement**: Validates proper nesting structure based on indentation
- **Property Positioning Validation**: Ensures all properties are correctly positioned relative to their parent feature

### Error Types Added
- `invalid-systemfeatures-indentation`: systemfeatures not at column 0
- `feature-before-systemfeatures`: Feature defined before systemfeatures declaration
- `feature-indentation-too-shallow`: Feature indentation below minimum required
- `feature-indentation-not-2-space-increment`: Feature not following 2-space increment rule
- `property-outside-feature`: Property found outside any feature definition
- `property-incorrect-indentation`: Property not indented correctly relative to parent
- `constraints-before-systemfeatures`: Constraints section before systemfeatures
- `constraints-incorrect-indentation`: Constraints section indentation incorrect
- `constraint-rule-incorrect-indentation`: Constraint rules indentation incorrect

## [1.0.12] - 2024-01-XX

### Changed
- **Tab-Based Indentation**: Switched from 2-space to 1-tab indentation for better flexibility
  - Each indentation level is now 1 tab (users can configure tab width: 2 spaces, 4 spaces, etc.)
  - `systemfeatures` starts at column 0
  - Features use 1-tab increments from their parent level
  - Properties are 1 tab deeper than their parent feature
  - `constraints` section is 1 tab from systemfeatures
  - Constraint rules are 1 tab deeper than constraints section

### Error Types Updated
- `spaces-not-allowed`: Now requires tabs instead of spaces for indentation
- `mixed-indentation`: Detects and prevents mixing of tabs and spaces
- All indentation error messages updated to reference tabs instead of spaces

### Benefits
- **User Flexibility**: Tab width can be configured per user preference (2, 4, or 8 spaces)
- **Consistency**: Enforces pure tab-based indentation throughout
- **Accessibility**: Better support for different visual preferences and accessibility needs

## [1.0.14] - 2025-01-08

### Added
- **Updated Safety File Examples**: Enhanced all sample safety files with proper `def` keyword usage
  - Updated `EPBSafety.itm` with structured hazard analysis definitions
  - Enhanced `EPBHazards.haz` with comprehensive hazard identification structure
  - Improved `EPBRiskAssessment.rsk` with ISO 26262 S×E×C methodology
  - Updated `EPBSafetyGoals.sgl` with proper ASIL-aligned safety goals
  - Enhanced `EPBFunctionalSafetyRequirements.fsr` with traceable requirements

### Improved
- **Consistent Syntax Structure**: All safety files now follow consistent `def` keyword patterns
- **Cross-File References**: Safety files properly reference .ple, .fml, and .fun identifiers
- **ISO 26262 Compliance**: Enhanced sample files with proper ASIL levels and S×E×C assessments

### Technical Updates
- Safety validator framework prepared for comprehensive validation
- Enhanced syntax highlighting for safety-specific keywords
- Improved snippet templates for all safety file types

---

## [1.0.13] - 2025-01-07

### Fixed
- **Constraints Validation Conflict**: Fixed issue where tab-indented `constraints` section was incorrectly flagged as error
  - Removed obsolete space-based `validateConstraintsSection` method
  - Unified all indentation validation under `validateHierarchicalIndentation` 
  - Tab-based constraints validation now works correctly

### Technical
- Eliminated duplicate constraint indentation validation
- Simplified validation pipeline by removing redundant space-based checks
- All indentation validation now consistently uses tab-based logic

## [1.0.16] - 2025-01-08

### Fixed
- **Go to Definition & Find References for Safety Files**: Fixed missing navigation features in safety files (.itm, .haz, .rsk, .sgl, .fsr)
  - Added 'sylang-safety' to language provider registration in extension.ts
  - Replaced hardcoded language IDs with programmatic configuration to ensure consistency
  - Go to Definition (F12) and Find All References (Shift+F12) now work in all safety files

### Technical
- **Language Provider Registration**: Now uses `getAllLanguageIds()` from LanguageConfigs to ensure all configured languages get navigation features
- **Consistent Language Support**: Extension automatically includes all language IDs defined in LanguageConfigs.ts

---

## [1.0.15] - 2025-01-08

### Fixed
- **Corrected `def` Keyword Usage**: Fixed safety files to only use `def` with identifiers
  - Removed `def` from structural sections without identifiers (itemdefinition, operationalscenarios, hazardcategories, etc.)
  - Kept `def` for definitions with identifiers (hazardanalysis EPBSafety, scenario SCEN_001, etc.)
  - Aligned with Sylang syntax rules: `def` only for definitions with identifiers

### Improved
- **Better Syntax Consistency**: All safety files now follow proper Sylang syntax patterns
- **Cleaner Structure**: Structural keywords and definitions are clearly distinguished

---

## [1.0.14] - 2025-01-08

### Added
- **Updated Safety File Examples**: Enhanced all sample safety files with proper `def` keyword usage
  - Updated `EPBSafety.itm` with structured hazard analysis definitions
  - Enhanced `EPBHazards.haz` with comprehensive hazard identification structure
  - Improved `EPBRiskAssessment.rsk` with ISO 26262 S×E×C methodology
  - Updated `EPBSafetyGoals.sgl` with proper ASIL-aligned safety goals
  - Enhanced `EPBFunctionalSafetyRequirements.fsr` with traceable requirements

### Improved
- **Consistent Syntax Structure**: All safety files now follow consistent `def` keyword patterns
- **Cross-File References**: Safety files properly reference .ple, .fml, and .fun identifiers
- **ISO 26262 Compliance**: Enhanced sample files with proper ASIL levels and S×E×C assessments

### Technical Updates
- Safety validator framework prepared for comprehensive validation
- Enhanced syntax highlighting for safety-specific keywords
- Improved snippet templates for all safety file types

---

## [1.0.9] - 2024-01-XX 

## [1.0.17] - 2025-01-08

### Changed
- **Updated .itm File Keywords**: Simplified and standardized keywords for item definition files
  - `itemdefinition` → `itemdef` (shorter, more concise)
  - Removed `drivingmodes` structural keyword (scenarios now directly under operationalscenarios)
  - `state` → `vehiclestate` and `drivingstate` (more specific and descriptive)
  - Added `operationalconditions` as heading before condition definitions
  - Kept standards methodology keywords (FMEA, HAZOP, STPA, FTA, ETA) for reference

### Improved
- **Enhanced Syntax Highlighting**: Updated patterns for new .itm keywords including operationalconditions
- **Better Code Snippets**: Updated safety templates with new keyword structure
- **Structured Conditions**: Added operationalconditions section for better organization

### Fixed
- **Corrected .haz File Structure**: Fixed subsystem references in hazard identification files
  - Removed `def` keyword from subsystem entries (subsystems are references, not definitions)
  - Removed `reference` keyword as it's unnecessary for cross-file references
  - Subsystems will be defined in .sub files, referenced by name in .haz files

### Technical
- **Language Configuration**: Updated `sylang-safety` keywords in LanguageConfigs.ts
- **Syntax Grammar**: Updated sylang-safety.tmGrammar.json for new keywords and removed 'reference'
- **Snippet Templates**: Enhanced safety.json with corrected .haz structure

---

## [1.0.16] - 2025-01-08 