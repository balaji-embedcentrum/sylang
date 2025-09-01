# Sylang Grammar Specification

Complete grammar specification for the Sylang Domain-Specific Language.

## Core Grammar Structure

```bnf
<sylang_file> ::= <import_statements>? <header_definition> <body_definitions>*

<import_statements> ::= <use_statement>+
<use_statement> ::= "use" <header_def_keyword> <identifier_list>

<header_definition> ::= "hdef" <header_def_keyword> <identifier> <properties_and_relations>*

<body_definitions> ::= <definition>*
<definition> ::= "def" <def_keyword> <identifier> <optional_flag>? <properties_and_relations>*

<properties_and_relations> ::= <property_statement> | <relation_statement>
<property_statement> ::= <property_keyword> <property_value>
<relation_statement> ::= <relation_keyword> "ref" <target_type> <identifier_list>

<identifier_list> ::= <identifier> ("," <identifier>)*
<property_value> ::= <string_literal> | <enum_value> | <string_list>
<string_list> ::= <string_literal> ("," <string_literal>)*
<string_literal> ::= '"' [^"]* '"'
```

## Keywords by File Extension

### .ple (Product Line) Keywords

#### Header Definition Keywords
- `productline` - Product line header definition

#### Property Keywords
- `name` - Product line name
- `description` - Detailed description
- `owner` - Owner/responsible party
- `domain` - Application domains (comma-separated)
- `compliance` - Compliance standards (comma-separated)
- `firstrelease` - First release date (YYYY-MM-DD)
- `tags` - Classification tags (comma-separated)
- `region` - Target regions (comma-separated)

#### Enum Keywords
- `safetylevel` - Safety integrity level enum

#### Special Rules
- No `use` statements allowed in `.ple` files
- Only one `.ple` file per project
- All properties are optional except header definition

### .fml (Feature Model) Keywords

#### Header Definition Keywords
- `featureset` - Feature set header definition

#### Definition Keywords
- `feature` - Feature definition

#### Property Keywords
- `name` - Feature name
- `description` - Feature description
- `owner` - Owner information
- `tags` - Classification tags
- `safetylevel` - Safety level enum

#### Relation Keywords
- `listedfor` - Links to product line
- `inherits` - Inherits from parent feature set
- `enables` - Enables other features
- `requires` - Requires other features
- `excludes` - Mutually exclusive features

#### Optional Flags
- `mandatory` - Must be selected if parent selected
- `optional` - May be selected if parent selected
- `or` - At least one sibling with `or` must be selected
- `alternative` - At most one sibling with `alternative` can be selected

### .vml (Variant Model) Keywords

#### Header Definition Keywords
- `variantset` - Variant set header definition

#### Property Keywords
- `name` - Variant name
- `description` - Variant description
- `owner` - Owner information
- `tags` - Classification tags
- `safetylevel` - Safety level enum

#### Relation Keywords
- `derivedfor` - Links to source feature model
- `inherits` - Inherits from parent variant
- `extends` - Feature selection specification

#### Selection States
- `selected` - Feature is selected
- `deselected` - Feature is not selected

### .blk (Block Definition) Keywords

#### Header Definition Keywords
- `block` - Block header definition

#### Definition Keywords
- `block` - Nested block definition
- `port` - Port definition

#### Property Keywords
- `name` - Block/port name
- `description` - Description
- `owner` - Owner information
- `tags` - Classification tags
- `level` - Hierarchical level enum
- `safetylevel` - Safety level enum
- `datatype` - Port data type

#### Relation Keywords
- `composedof` - Block composition
- `needs` - Port dependencies
- `inherits` - Block inheritance
- `connects` - Port connections
- `implements` - Interface implementation

#### Direction Keywords (for ports)
- `input` - Input port
- `output` - Output port
- `bidirectional` - Bidirectional port

### .fun (Function Group) Keywords

#### Header Definition Keywords
- `functiongroup` - Function group header definition

#### Definition Keywords
- `function` - Function definition

#### Property Keywords
- `name` - Function name
- `description` - Function description
- `owner` - Owner information
- `tags` - Classification tags
- `level` - Hierarchical level enum
- `safetylevel` - Safety level enum
- `input` - Function inputs
- `output` - Function outputs
- `behavior` - Behavior specification

#### Relation Keywords
- `inherits` - Function group inheritance
- `implements` - Interface implementation
- `requires` - Function dependencies
- `enables` - Function enablement
- `calls` - Function invocation

## Enum Definitions

### Safety Level Enums
```sylang
safetylevel_enum ::= "ASIL-A" | "ASIL-B" | "ASIL-C" | "ASIL-D" |
                     "SIL-1" | "SIL-2" | "SIL-3" | "SIL-4" |
                     "DAL-A" | "DAL-B" | "DAL-C" | "DAL-D" | "DAL-E"
```

### Level Enums
```sylang
level_enum ::= "productline" | "system" | "subsystem" | 
               "component" | "module" | "interface"
```

### Priority Enums
```sylang
priority_enum ::= "critical" | "high" | "medium" | "low"
```

## Indentation Rules

### Basic Rules
1. **Consistent indentation** - Use either 2 spaces OR 1 tab per level
2. **No mixing** - Cannot mix tabs and spaces
3. **Logical hierarchy** - Indentation reflects logical structure
4. **Empty lines** - Don't require indentation, don't affect structure

### Indentation Examples
```sylang
hdef productline ExampleProduct
  name "Example Product"
  description "Product description"
  
  def feature MainFeature mandatory
    name "Main Feature"
    
    def feature SubFeature optional
      name "Sub Feature"
      description "Nested feature"
```

## Comment Syntax

### Single-line Comments
```sylang
// This is a single-line comment
hdef productline MyProduct  // Comment at end of line
```

### Multi-line Comments
```sylang
/* This is a multi-line comment
   that can span multiple lines
   and provide detailed explanations */
hdef productline MyProduct
```

### Comment Rules
1. **Single-line**: `//` to end of line
2. **Multi-line**: `/* ... */` (no nesting)
3. **Placement**: Can appear anywhere except within string literals
4. **Structure**: Comments don't affect indentation structure

## Identifier Rules

### Valid Identifiers
```bnf
<identifier> ::= <letter> (<letter> | <digit> | "_")*
<letter> ::= [a-zA-Z]
<digit> ::= [0-9]
```

### Naming Conventions
- **PascalCase** for definitions: `BloodPressureMonitor`
- **camelCase** for properties: `safetylevel`
- **snake_case** for complex identifiers: `emergency_brake_system`
- **Descriptive names** reflecting purpose
- **No reserved keywords** as identifiers

### Reserved Keywords
Cannot be used as identifiers:
```
hdef, def, use, ref, mandatory, optional, or, alternative, 
selected, deselected, input, output, bidirectional,
productline, featureset, variantset, configset, block, 
functiongroup, feature, function, port, requirement, 
testcase, name, description, owner, tags, level, safetylevel
```

## Cross-File References

### Reference Syntax
```sylang
<relation_keyword> ref <target_type> <identifier_list>
```

### Valid Target Types
- `productline` - References product line
- `featureset` - References feature set
- `variantset` - References variant set
- `configset` - References configuration set
- `block` - References block definition
- `functiongroup` - References function group
- `feature` - References feature
- `function` - References function
- `port` - References port
- `requirement` - References requirement
- `testcase` - References test case

### Reference Examples
```sylang
listedfor ref productline MyProductLine
inherits ref featureset BaseFeatures
composedof ref block ControlUnit, PowerUnit
enables ref feature WiFiConnectivity, BluetoothConnectivity
```

## Validation Rules

### Structural Validation
1. **File extension compliance** - Keywords must match file extension
2. **Indentation consistency** - Must use consistent indentation style
3. **Header definition required** - Every file must have exactly one `hdef`
4. **Definition nesting** - `def` statements only allowed under `hdef`

### Semantic Validation
1. **Symbol uniqueness** - Symbols must be unique within scope
2. **Cross-reference validity** - Referenced symbols must exist
3. **Type compatibility** - References must match target types
4. **Circular dependency detection** - Prevent circular references

### File-Specific Rules
1. **`.ple` files** - No `use` statements, only one per project
2. **`.fml` files** - Only one per project, feature flags required
3. **`.vcf` files** - Auto-generated only, only one per project
4. **Multiple file types** - `.vml`, `.blk`, `.fun`, `.req`, `.tst` allow multiple files

## Error Handling

### Syntax Errors
- **Invalid keywords** - Keywords not allowed for file extension
- **Malformed statements** - Incorrect grammar structure
- **Indentation errors** - Inconsistent or invalid indentation
- **Unterminated strings** - Missing closing quotes

### Semantic Errors
- **Undefined references** - Referenced symbols don't exist
- **Duplicate definitions** - Multiple definitions with same name
- **Type mismatches** - Incompatible reference types
- **Constraint violations** - Feature selection constraint violations

### Project-Level Errors
- **File limit violations** - Too many files of restricted types
- **Missing dependencies** - Required files not present
- **Circular dependencies** - Circular reference chains
- **Inconsistent safety levels** - Child exceeds parent safety level
