# Sylang Language Architecture

## Overview

Sylang is a domain-specific language (DSL) for systems engineering with a complex hierarchical structure, import system, and configuration-driven visibility. This document outlines the complete architecture required to support syntax highlighting, validation, symbol resolution, and IDE features.

## 1. Language Flow Structure

### 1.1 Primary Development Flow

The language follows a structured development flow with dependencies between file types:

```
.ple (Product Line)
  ↓
.fml (Feature Model)
  ↓  
.vml (Variant Model)
  ↓
.vcf (Variant Config - auto-generated)
  ↓
.fun (Functions)
```

### 1.2 Complete File Type Ecosystem

All 15 file types in the Sylang ecosystem:

**Primary Flow:**
- `.ple` - Product Line (root of everything, no imports)
- `.fml` - Feature Model (imports .ple)
- `.vml` - Variant Model (imports .fml)
- `.vcf` - Variant Configuration (auto-generated, imports .vml)
- `.fun` - Functions (imports .vcf)

**Secondary File Types (Cross-Referenced):**
- `.blk` - Block definitions (system, subsystem, component hierarchies)
- `.req` - Requirements (can reference functions, features, blocks)
- `.tst` - Test specifications (can reference requirements, functions)
- `.fma` - Failure Mode Analysis (can reference functions, blocks)
- `.fmc` - Failure Mode Controls (can reference .fma)
- `.fta` - Fault Tree Analysis (can reference functions, blocks)
- `.itm` - Items/Operational scenarios (can reference blocks, functions)
- `.haz` - Hazard identification (can reference items, functions)
- `.rsk` - Risk assessment (can reference hazards)
- `.sgl` - Safety goals (can reference risks, hazards)

### 1.3 File Constraints

**Unique Files (One per project):**
- `.ple` - Product Line (root of everything)
- `.fml` - Feature Model 
- `.vcf` - Variant Configuration

**Multiple Files Allowed:**
- All other file types can have multiple instances

## 2. Import System Architecture

### 2.1 Import Syntax

All files except `.ple` start with import statements using the `use` keyword:

**Language Conventions:**
- All lowercase letters only
- No dashes, brackets, colons, or braces
- Two spaces (or one tab) for indentation levels
- Strict indentation enforcement

```sylang
use block subsystem ss1, ss2, ss3
use block system sys1
use configset configname
use featureset corefeatures
use functiongroup powermanagement
use reqsection safetyrequirements
use testsuite systemtests
```

### 2.2 Import Types

| Import Type | Syntax | Purpose |
|-------------|--------|---------|
| Block System | `use block system <id>` | Import system-level blocks |
| Block Subsystem | `use block subsystem <id1>, <id2>` | Import subsystem blocks |
| Block Component | `use block component <id>` | Import component blocks |
| Feature Set | `use featureset <id>` | Import feature definitions |
| Function Group | `use functiongroup <id>` | Import function definitions |
| Config Set | `use configset <id>` | Import configuration values |
| Requirements | `use reqsection <id>` | Import requirement sections |

### 2.3 Symbol Resolution Rules

1. **Direct Import**: `use block system SystemA` makes `SystemA` and all its sub-definitions available
2. **Multi-Import**: `use block subsystem ss1, ss2, ss3` imports multiple items of same type
3. **Selective Import**: Future support for `use featureset CoreFeatures.Engine, CoreFeatures.Safety`
4. **Transitive Dependencies**: Imported symbols can reference their own dependencies

## 3. Definition Structure

### 3.1 Property Syntax

Properties follow two distinct patterns:

**String Literal Properties:**
```sylang
name "this is a string literal"
description "component functionality description"
owner "systems engineering team"
```

**Reference Properties (require use statement):**
```sylang
use featureset corefeatures
use functiongroup powerfunctions

enables feature enginecontrol    // references corefeatures.enginecontrol
implements function powercontrol // references powerfunctions.powercontrol
partof system mainsystem        // references imported system
```

**Double Keyword Properties:**
```sylang
enables feature enginecontrol
implements function powercontrol  
satisfies requirement safereq001
allocatedto component powerunit
derivedfrom requirement parentreq
partof system mainsystem
contains subsystem controlsystem
```

### 3.2 Header Definitions

Primary container definitions that can contain sub-definitions:

```sylang
def productline <identifier>           // .ple files
def featureset <identifier>            // .fml files  
def variantmodel <identifier>          // .vml files
def configset <identifier>             // .vcf files
def functiongroup <identifier>         // .fun files
def reqsection <identifier>            // .req files
def testsuite <identifier>             // .tst files
def safetygoals <identifier>           // .sgl files
def hazardidentification <identifier>  // .haz files
def riskassessment <identifier>        // .rsk files
def failuremodeanalysis <identifier>   // .fma files
def controlmeasures <identifier>       // .fmc files
def faulttreeanalysis <identifier>     // .fta files
def itemdefinition <identifier>        // .itm files
```

### 3.3 Block Definitions (Special Case)

Block definitions use double keywords before identifier:

```sylang
def block system <identifier>          // Top-level systems
def block subsystem <identifier>       // Subsystems  
def block component <identifier>       // Components
def block subcomponent <identifier>    // Sub-components
def block module <identifier>          // Modules
def block unit <identifier>            // Units
def block assembly <identifier>        // Assemblies
def block circuit <identifier>         // Circuits
def block part <identifier>            // Parts
```

### 3.4 Sub-Definitions

Definitions that exist within header or block definitions:

```sylang
def feature <identifier>               // Features within featureset
def function <identifier>              // Functions within functiongroup
def requirement <identifier>           // Requirements within reqsection
def testcase <identifier>             // Test cases within testsuite
def port out <identifier>             // Output ports within blocks
def safetygoal <identifier>           // Safety goals within safetygoals
def hazard <identifier>               // Hazards within hazardidentification
def risk <identifier>                 // Risks within riskassessment
def failuremode <identifier>          // Failure modes within fma
def prevention <identifier>           // Prevention measures within fmc
def detection <identifier>            // Detection measures within fmc
def mitigation <identifier>           // Mitigation measures within fmc
def node <identifier>                 // Fault tree nodes within fta
def item <identifier>                 // Items within itemdefinition
```

## 4. Symbol Hierarchy Architecture

### 4.1 Symbol Types

```typescript
enum SymbolType {
  // Header Symbols (top-level containers)
  PRODUCT_LINE = 'productline',
  FEATURE_SET = 'featureset', 
  VARIANT_MODEL = 'variantmodel',
  CONFIG_SET = 'configset',
  FUNCTION_GROUP = 'functiongroup',
  REQ_SECTION = 'reqsection',
  TEST_SUITE = 'testsuite',
  SAFETY_GOALS = 'safetygoals',
  HAZARD_IDENTIFICATION = 'hazardidentification',
  RISK_ASSESSMENT = 'riskassessment',
  
  // Block Symbols (hierarchical)
  BLOCK_SYSTEM = 'block.system',
  BLOCK_SUBSYSTEM = 'block.subsystem', 
  BLOCK_COMPONENT = 'block.component',
  BLOCK_SUBCOMPONENT = 'block.subcomponent',
  BLOCK_MODULE = 'block.module',
  BLOCK_UNIT = 'block.unit',
  BLOCK_ASSEMBLY = 'block.assembly',
  BLOCK_CIRCUIT = 'block.circuit',
  BLOCK_PART = 'block.part',
  
  // Sub-Definition Symbols
  FEATURE = 'feature',
  FUNCTION = 'function', 
  REQUIREMENT = 'requirement',
  TEST_CASE = 'testcase',
  PORT_OUT = 'port.out',
  PORT_IN = 'port.in',
  SAFETY_GOAL = 'safetygoal',
  HAZARD = 'hazard',
  RISK = 'risk',
  
  // Configuration Symbols
  CONFIG = 'config'
}
```

### 4.2 Symbol Visibility Model

```typescript
interface SymbolDefinition {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: SymbolType;              // Symbol type
  fileUri: string;               // Defining file
  location: Location;            // Definition location
  
  // Hierarchy
  parentSymbol?: string;         // Parent symbol ID (for sub-definitions)
  childSymbols: string[];        // Child symbol IDs
  
  // Import/Export
  isExported: boolean;           // Available to importing files
  importedFrom?: string;         // Source file if imported
  
  // Configuration
  configKey?: string;            // Configuration key if configurable
  isVisible: boolean;            // Current visibility based on config
  
  // Properties
  properties: Map<string, any>;  // Symbol properties
  safetylevel?: string;          // ASIL level if applicable
}
```

### 4.3 Import Resolution Architecture

```typescript
interface ImportStatement {
  keyword: string;               // 'block', 'featureset', etc.
  subkeyword?: string;          // 'system', 'subsystem', etc. 
  identifiers: string[];         // Imported identifiers
  location: Location;            // Import statement location
  resolvedSymbols: string[];     // Resolved symbol IDs
}

interface ImportResolution {
  success: boolean;
  resolvedSymbols: SymbolDefinition[];
  unresolvedIdentifiers: string[];
  errors: ImportError[];
  warnings: ImportWarning[];
}
```

## 5. Configuration System Architecture

### 5.1 Configuration-Driven Visibility

The configuration system controls symbol visibility:

1. **Config Definition**: Configurations defined in `.vcf` files
2. **Config Reference**: Any definition can reference config: `config MyConfig.featureFlag`
3. **Visibility Rules**:
   - Config value `0` → **Entire sub-definition block grayed out/disabled** (not just config line)
   - Header definition config `0` → Entire file invisible to imports
   - Visual rendering: Disabled blocks shown with reduced opacity/grayed styling

### 5.2 Configuration Architecture

```typescript
interface ConfigurationValue {
  key: string;                   // Configuration key
  value: number;                 // Configuration value (0 = disabled)
  sourceFile: string;            // .vcf file containing config
  appliedTo: string[];           // Symbol IDs using this config
}

interface ConfigurationManager {
  // Load configurations from .vcf files
  loadConfigurations(): Promise<void>;
  
  // Get configuration value
  getConfigValue(key: string): number | undefined;
  
  // Check if symbol is visible based on config
  isSymbolVisible(symbolId: string): boolean;
  
  // Get all symbols affected by a config
  getAffectedSymbols(configKey: string): string[];
  
  // Update configuration and notify affected symbols
  updateConfiguration(key: string, value: number): void;
}
```

## 6. Validation Architecture Requirements

### 6.1 Multi-Level Validation

The validation system must handle multiple interdependent validation levels:

1. **Syntax Validation**: Correct language syntax per file type
2. **Import Validation**: Valid import statements and resolvable symbols
3. **Symbol Validation**: Valid symbol definitions and references
4. **Cross-File Validation**: Dependencies between files respected
5. **Configuration Validation**: Config references are valid
6. **Semantic Validation**: Business logic and constraints

### 6.2 Validation Pipeline Architecture

```typescript
interface ValidationPipeline {
  // Stage 1: Parse and extract symbols
  parseDocument(document: TextDocument): ParseResult;
  
  // Stage 2: Resolve imports and build symbol table  
  resolveImports(parseResult: ParseResult): ImportResolution;
  
  // Stage 3: Validate syntax and structure
  validateSyntax(document: TextDocument, symbols: SymbolTable): Diagnostic[];
  
  // Stage 4: Validate cross-references
  validateReferences(document: TextDocument, symbols: SymbolTable): Diagnostic[];
  
  // Stage 5: Validate configurations
  validateConfigurations(document: TextDocument, symbols: SymbolTable): Diagnostic[];
  
  // Stage 6: Validate semantic rules
  validateSemantics(document: TextDocument, symbols: SymbolTable): Diagnostic[];
}
```

### 6.3 Language-Specific Validation

Each file type requires specialized validation rules:

| File Type | Primary Validations |
|-----------|-------------------|
| `.ple` | Single per project, no imports, productline structure |
| `.fml` | Single per project, imports .ple, feature hierarchy |
| `.vml` | Single per project, imports .fml, variant selections |
| `.vcf` | Auto-generated, configuration values, imports .vml |
| `.fun` | Imports config, function definitions, safety levels |
| `.blk` | Block hierarchy, port definitions, contains/partof |
| `.req` | Requirements structure, traceability, ASIL levels |
| `.tst` | Test structure, verification links, coverage |
| Safety files | ASIL levels, hazard analysis, risk assessment |

## 7. IDE Features Architecture

### 7.1 IntelliSense Requirements

- **Auto-completion**: Context-aware symbol suggestions based on imports
- **Go to Definition**: Navigate to symbol definitions across files
- **Find References**: Find all usages of symbols across project
- **Hover Information**: Show symbol details, properties, configuration status
- **Rename Refactoring**: Rename symbols across all references

### 7.2 Visual Indicators

- **Grayed Out Symbols**: When config value is 0
- **Error Squiggles**: Syntax, import, and semantic errors
- **Warning Underlines**: Import warnings, deprecated usage
- **Configuration Status**: Visual indicators for configurable symbols

## 8. Performance Requirements

### 8.1 Scalability Constraints

- **Large Projects**: 1000+ files, 10000+ symbols
- **Real-time Validation**: Sub-200ms response for document changes
- **Incremental Updates**: Only revalidate affected files/symbols
- **Memory Efficiency**: Symbol tables and caches must be memory-efficient

### 8.2 Caching Strategy

- **Symbol Index Cache**: Global symbol table with file dependencies
- **Import Resolution Cache**: Cached import resolutions per file
- **Configuration Cache**: Cached configuration values and affected symbols
- **Validation Cache**: Cached validation results with dependency tracking

## 9. Implementation Strategy

### 9.1 Modular Plugin Architecture

Each file type should be implemented as a plugin with:

1. **Parser**: Extract symbols and structure from text
2. **Validator**: File-specific validation rules
3. **Provider**: IDE features (completion, definition, etc.)
4. **Configuration**: Language-specific settings

### 9.2 Core Services

- **Symbol Manager**: Global symbol table and resolution
- **Import Manager**: Import statement parsing and resolution  
- **Configuration Manager**: Configuration loading and visibility
- **Validation Engine**: Orchestrates multi-stage validation
- **Cache Manager**: Performance optimization through caching

### 9.3 Plugin Registration

Plugins should be automatically discovered and registered based on:
- File extension mappings
- Language ID associations
- Dependency declarations
- Priority ordering

## 10. Enum System Architecture

### 10.1 Enum Definition Structure

Enums should be defined in dedicated files or sections:

```sylang
def enumset safetylevel
  enum asila, asilb, asilc, asild, qm

def enumset porttype  
  enum electrical, mechanical, data, can, ethernet, hydraulic

def enumset testresult
  enum pass, fail, blocked, skipped, pending
```

### 10.2 Enum Usage and Validation

```sylang
def function safetyfunction
  name "critical safety function"
  safetylevel asilc        // references safetylevel enum
  
def port out powerport
  type electrical          // references porttype enum
  
def testcase testcase1
  testresult pass          // references testresult enum
```

### 10.3 Enum Architecture

```typescript
interface EnumDefinition {
  name: string;              // Enum set name
  values: string[];          // Valid enum values
  fileUri: string;           // Defining file
  location: Location;        // Definition location
  description?: string;      // Optional description
}

interface EnumManager {
  // Load enum definitions from files
  loadEnums(): Promise<void>;
  
  // Get enum definition
  getEnum(name: string): EnumDefinition | undefined;
  
  // Validate enum value
  isValidEnumValue(enumName: string, value: string): boolean;
  
  // Get all values for an enum
  getEnumValues(enumName: string): string[];
  
  // Get enum suggestions for completion
  getEnumSuggestions(enumName: string): CompletionItem[];
}
```

## 11. Extensible Keyword Architecture

### 11.1 Keyword Definition System

Instead of hardcoding keywords, define them in configuration:

```json
// language-keywords.json
{
  "keywords": {
    "definition": {
      "def": {
        "type": "definition_starter",
        "followedBy": ["keyword", "identifier"] 
      }
    },
    "containers": {
      "productline": { "fileTypes": [".ple"], "unique": true },
      "featureset": { "fileTypes": [".fml"], "unique": true },
      "variantmodel": { "fileTypes": [".vml"], "unique": true },
      "configset": { "fileTypes": [".vcf"], "unique": true },
      "functiongroup": { "fileTypes": [".fun"], "multiple": true },
      "reqsection": { "fileTypes": [".req"], "multiple": true },
      "testsuite": { "fileTypes": [".tst"], "multiple": true },
      "safetygoals": { "fileTypes": [".sgl"], "multiple": true },
      "hazardidentification": { "fileTypes": [".haz"], "multiple": true },
      "riskassessment": { "fileTypes": [".rsk"], "multiple": true },
      "failuremodeanalysis": { "fileTypes": [".fma"], "multiple": true },
      "controlmeasures": { "fileTypes": [".fmc"], "multiple": true },
      "faulttreeanalysis": { "fileTypes": [".fta"], "multiple": true },
      "itemdefinition": { "fileTypes": [".itm"], "multiple": true },
      "block": { 
        "fileTypes": [".blk"], 
        "subkeywords": ["system", "subsystem", "component", "subcomponent", "module", "unit", "assembly", "circuit", "part"],
        "multiple": true 
      }
    },
    "properties": {
      "singleKeyword": {
        "name": { "valueType": "string", "required": true },
        "description": { "valueType": "string", "required": true },
        "owner": { "valueType": "string", "required": false },
        "safetylevel": { "valueType": "enum", "enumSet": "safetylevel" },
        "config": { "valueType": "configreference" }
      },
      "doubleKeyword": {
        "enables feature": { "valueType": "reference", "requiresImport": true },
        "implements function": { "valueType": "reference", "requiresImport": true },
        "satisfies requirement": { "valueType": "reference", "requiresImport": true },
        "allocatedto component": { "valueType": "reference", "requiresImport": true },
        "derivedfrom requirement": { "valueType": "reference", "requiresImport": true },
        "partof system": { "valueType": "reference", "requiresImport": true },
        "contains subsystem": { "valueType": "reference", "requiresImport": true },
        "verifies requirement": { "valueType": "reference", "requiresImport": true }
      }
    },
    "imports": {
      "use": {
        "type": "import_starter",
        "syntax": "use <keyword> [<subkeyword>] <identifier>[, <identifier>...]"
      }
    }
  }
}
```

### 11.2 Dynamic Keyword Loading

```typescript
interface KeywordDefinition {
  name: string;
  type: 'container' | 'property' | 'subdefinition' | 'import';
  valueType?: 'string' | 'number' | 'enum' | 'identifier' | 'configReference';
  enumSet?: string;         // For enum properties
  required?: boolean;       // For properties
  fileTypes?: string[];     // Applicable file types
  subkeywords?: string[];   // For compound keywords like 'block system'
  multiple?: boolean;       // Can appear multiple times
  unique?: boolean;         // Only one per project
}

interface KeywordManager {
  // Load keyword definitions from configuration
  loadKeywords(): Promise<void>;
  
  // Get keyword definition
  getKeyword(name: string): KeywordDefinition | undefined;
  
  // Get keywords for file type
  getKeywordsForFileType(fileType: string): KeywordDefinition[];
  
  // Validate keyword usage
  validateKeywordUsage(keyword: string, context: ValidationContext): ValidationResult;
  
  // Get completion suggestions
  getKeywordSuggestions(context: CompletionContext): CompletionItem[];
}
```

## 12. Core Component Responsibilities

### 12.1 Symbol Manager
**Primary Responsibility**: Global symbol table and cross-file resolution

- **Symbol Registration**: Register symbols from all parsed files
- **Hierarchy Management**: Parent-child relationships (header → sub-definitions)  
- **Import Resolution**: Resolve `use` statements to actual symbols
- **Visibility Calculation**: Apply configuration rules to determine symbol visibility
- **Cross-Reference**: Track symbol usage across files

### 12.2 Configuration Manager  
**Primary Responsibility**: Configuration-driven visibility and behavior

- **Config Loading**: Parse `.vcf` files for configuration values
- **Visibility Rules**: Apply config=0 → gray-out rules to symbols/blocks
- **Real-time Updates**: Notify when configurations change
- **Config Validation**: Ensure config references are valid
- **Visual State**: Manage grayed-out vs normal rendering states

### 12.3 Import Manager
**Primary Responsibility**: Import statement processing and dependency resolution

- **Import Parsing**: Parse `use` statements with multi-import support
- **Symbol Lookup**: Find imported symbols in global symbol table
- **Dependency Tracking**: Track file dependencies for incremental updates
- **Error Reporting**: Report unresolved imports and circular dependencies
- **Transitive Resolution**: Handle symbol chains (A imports B, B imports C)

### 12.4 Enum Manager
**Primary Responsibility**: Enum definition and validation

- **Enum Loading**: Parse enum definitions from dedicated files/sections
- **Value Validation**: Validate enum usage against defined values
- **Completion Support**: Provide enum value suggestions
- **Type Checking**: Ensure properties use correct enum types
- **Extension Support**: Allow new enums without core changes

### 12.5 Keyword Manager
**Primary Responsibility**: Extensible keyword system

- **Dynamic Loading**: Load keyword definitions from JSON configuration
- **Syntax Rules**: Define valid keyword combinations and usage patterns
- **Validation Logic**: Validate keyword usage based on context and file type
- **Completion**: Provide context-aware keyword suggestions
- **Extensibility**: Support new keywords without code changes

### 12.6 Plugin Registry
**Primary Responsibility**: Language plugin discovery and lifecycle management

- **Auto-Discovery**: Find and load plugins for each file type
- **Lifecycle Management**: Initialize, register, and dispose plugins
- **File Type Mapping**: Map file extensions to appropriate plugins
- **Plugin Communication**: Coordinate between plugins for cross-file features
- **Error Handling**: Graceful handling of plugin failures

## 13. Implementation Phases

### Phase 1: Core Infrastructure
1. **Symbol Manager**: Basic symbol registration and lookup
2. **Import Manager**: Simple import resolution
3. **Configuration Manager**: Basic config loading and visibility
4. **Plugin Registry**: Auto-discovery and registration

### Phase 2: Language Features  
1. **Validation Pipeline**: Multi-stage validation system
2. **IDE Providers**: Completion, definition, references
3. **Visual Features**: Grayed-out rendering for disabled symbols
4. **Error Reporting**: Comprehensive diagnostic system

### Phase 3: Advanced Features
1. **Enum Manager**: Full enum support and validation
2. **Keyword Manager**: Extensible keyword system
3. **Performance**: Caching and incremental updates
4. **Configuration UI**: Visual configuration management

### Phase 4: Enhancement & Polish
1. **Advanced IDE Features**: Rename refactoring, hover information
2. **Performance Optimization**: Large project support
3. **Plugin Ecosystem**: Third-party plugin support
4. **Documentation**: Comprehensive developer documentation

## 14. Key Architecture Benefits

### 14.1 Extensibility
- **New File Types**: Add new languages without core changes
- **New Keywords**: Extend language through configuration
- **New Enums**: Define domain-specific enumerations
- **Custom Validation**: Plugin-specific validation rules

### 14.2 Performance
- **Incremental Updates**: Only reprocess changed files and dependencies
- **Intelligent Caching**: Cache symbol tables, validation results, import resolutions
- **Lazy Loading**: Load plugins and configurations on-demand
- **Background Processing**: Non-blocking validation and indexing

### 14.3 Maintainability  
- **Clear Separation**: Each component has single responsibility
- **Plugin Isolation**: Language-specific logic contained in plugins
- **Configuration-Driven**: Behavior controlled by configuration, not code
- **Testability**: Each component can be unit tested independently

### 14.4 User Experience
- **Real-time Feedback**: Immediate validation and error reporting
- **Context-Aware Features**: Import-aware completion and navigation
- **Visual Clarity**: Clear indication of disabled/grayed symbols
- **Cross-File Navigation**: Seamless navigation across file boundaries

## 15. Complete Sylang Language Specification Summary

### 15.1 Language Conventions (Strict Rules)
- **All lowercase letters only** - no uppercase, no dashes, no brackets, no colons, no braces
- **Indentation**: Exactly 2 spaces or 1 tab per level, strictly enforced
- **String literals**: Always in double quotes `"string value"`
- **Comments**: Use `//` for line comments

### 15.2 Complete File Type Ecosystem (All 15 Types)

**Primary Flow (Ordered Dependencies):**
1. `.ple` → `.fml` → `.vml` → `.vcf` → `.fun`

**Secondary Types (Cross-Referenced):**
- `.blk` (blocks), `.req` (requirements), `.tst` (tests)
- `.fma` (failure analysis), `.fmc` (failure controls), `.fta` (fault trees)  
- `.itm` (items), `.haz` (hazards), `.rsk` (risks), `.sgl` (safety goals)

### 15.3 Import System
```sylang
use block system sys1, sys2
use functiongroup powermanagement  
use featureset corefeatures
use reqsection safetyrequirements
```

### 15.4 Property Syntax Patterns

**String Literals:**
```sylang
name "string value"
description "functionality description"
```

**Single Keywords:**
```sylang
safetylevel asilc
config myconfig.feature
```

**Double Keywords (Reference Properties):**
```sylang
enables feature enginecontrol
implements function powercontrol
satisfies requirement safereq001
allocatedto component powerunit
derivedfrom requirement parentreq
partof system mainsystem
contains subsystem controlsystem
verifies requirement testreq
```

### 15.5 Configuration-Driven Visibility (Corrected)

**When `config = 0`:**
- **Entire sub-definition block** becomes grayed out (not just config line)
- Block excluded from auto-completion
- Visual rendering with reduced opacity

**When header definition has `config = 0`:**
- Entire file becomes invisible to imports
- No symbols exported from that file

### 15.6 Cross-File Reference Matrix

| Source File | Can Reference | Example |
|-------------|---------------|---------|
| `.fun` | `.vcf`, `.fml`, `.ple` | `use configset myconfig` |
| `.blk` | `.fun`, `.fml` | `implements function powercontrol` |
| `.req` | `.fun`, `.blk`, `.fml` | `allocatedto component powerunit` |
| `.tst` | `.req`, `.fun` | `verifies requirement safereq001` |
| `.fma` | `.fun`, `.blk` | `partof system mainsystem` |
| `.fmc` | `.fma` | `use failuremodeanalysis enginefma` |
| `.fta` | `.fun`, `.blk` | `partof system mainsystem` |
| `.itm` | `.blk`, `.fun` | `partof system mainsystem` |
| `.haz` | `.itm`, `.fun` | `derivedfrom item operationalitem` |
| `.rsk` | `.haz` | `derivedfrom hazard safetyhazard` |
| `.sgl` | `.rsk`, `.haz` | `derivedfrom risk criticalsafetyrisk` |

### 15.7 Extensibility Architecture

**New Keywords:** Define in `language-keywords.json` without code changes
**New Enums:** Define in enum files with auto-validation  
**New File Types:** Add as plugins with auto-discovery
**New Properties:** Configure via JSON without core modifications

### 15.8 Architecture Benefits for Sylang Complexity

✅ **Handles 15 file types** with individual validation rules  
✅ **Complex cross-references** with import-aware resolution  
✅ **Configuration visibility** with block-level graying  
✅ **Double keyword properties** with reference validation  
✅ **Strict language conventions** enforced automatically  
✅ **Extensible design** for future language evolution  
✅ **Performance optimized** for large projects (1000+ files)

This architecture provides the foundation for a robust, scalable, and maintainable Sylang language server that can handle the complete complexity of the 15-file-type ecosystem, configuration-driven visibility, cross-file references, double keyword properties, and strict language conventions while remaining performant and user-friendly. 