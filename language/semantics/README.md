# Sylang Semantics

This directory contains the semantic rules and validation specifications for Sylang.

## Semantic Categories

### Symbol Resolution
- Cross-file symbol lookup
- Namespace management
- Import/export mechanisms
- Dependency tracking

### Type System
- Property type validation
- Relationship type checking
- Interface compatibility
- Inheritance rules

### Validation Rules
- Structural validation
- Constraint checking
- Consistency verification
- Completeness analysis

## Key Semantic Rules

### Project Structure
1. **Root Marker**: Every project must have `.sylangrules` file
2. **File Limits**: Enforce single-file restrictions (`.ple`, `.fml`, `.vcf`)
3. **Folder Limits**: Enforce folder-level restrictions (`.fma`, `.fmc`, `.fta`)

### Symbol Management
1. **Unique Names**: Symbols must be unique within their scope
2. **Forward References**: Allowed with later resolution
3. **Circular Dependencies**: Detected and reported as errors
4. **Case Sensitivity**: All identifiers are case-sensitive

### Cross-File Validation
1. **Import Resolution**: Validate imported symbols exist
2. **Type Compatibility**: Check interface matching
3. **Dependency Cycles**: Prevent circular file dependencies
4. **Version Compatibility**: Ensure compatible versions

### Indentation Semantics
1. **Consistent Style**: Must use consistent indentation
2. **Logical Structure**: Indentation reflects logical hierarchy
3. **Empty Lines**: Don't affect structure
4. **Mixed Styles**: Tabs and spaces cannot be mixed

## Validation Process

### Phase 1: Lexical Analysis
- Token recognition
- Comment removal
- Indentation analysis
- Basic syntax validation

### Phase 2: Syntactic Analysis
- Grammar rule checking
- Structure validation
- Keyword recognition
- Expression parsing

### Phase 3: Semantic Analysis
- Symbol table construction
- Type checking
- Cross-reference resolution
- Constraint validation

### Phase 4: Project Validation
- File limit enforcement
- Dependency analysis
- Completeness checking
- Consistency verification
