# Sylang Language Specification

This directory contains the complete language specification for Sylang, including syntax definitions, semantic rules, and extension specifications.

## 📁 Directory Structure

- `syntax/` - Grammar definitions and syntax rules
- `semantics/` - Language semantics and validation rules  
- `extensions/` - File extension specifications and usage guidelines

## 📚 Language Documentation

### Core Principles

1. **Indentation-Based Structure**: No braces, brackets, or begin/end keywords
2. **File Extension Semantics**: Different extensions serve specific purposes
3. **Cross-File Validation**: Symbol resolution across project files
4. **AI-First Design**: Optimized for AI generation and human validation

### Syntax Overview

```sylang
// Single-line comment
/* Multi-line
   comment */

// Indentation defines structure
system MainSystem
    subsystem ControlUnit
        component Processor
            property clock_speed: 100MHz
            property cores: 4
        
        component Memory
            property size: 8GB
            property type: DDR4
    
    subsystem PowerUnit
        component Battery
            property voltage: 12V
            property capacity: 100Ah
```

### File Extensions

#### Product Line Management
- **`.ple`** - Product Line Engineering definitions
- **`.fml`** - Feature Model specifications  
- **`.vml`** - Variant Model configurations
- **`.vcf`** - Variant Configuration files

#### Systems Engineering
- **`.blk`** - Block definitions and system architecture
- **`.fun`** - Function group specifications
- **`.req`** - Requirements documentation
- **`.tst`** - Test suite definitions

#### Analysis & Safety (Future)
- **`.fma`** - Failure Mode Analysis
- **`.fmc`** - Failure Mode Controls
- **`.fta`** - Fault Tree Analysis
- **`.itm`** - Item definitions
- **`.haz`** - Hazard analysis
- **`.rsk`** - Risk assessment
- **`.sgl`** - Safety goals

## 🔧 Language Rules

### Project Structure
- Every project must have a `.sylangrules` file in the root
- File extension limits are enforced (e.g., only one `.ple` per project)
- Cross-file symbol resolution requires proper project structure

### Syntax Rules
- Consistent indentation (spaces or tabs, not mixed)
- No trailing whitespace on empty lines
- Comments can appear anywhere but don't affect structure
- Keywords are case-sensitive

### Semantic Rules
- Symbol definitions must be unique within scope
- Cross-references must resolve to valid symbols
- Type checking for properties and relationships
- Hierarchical validation for system structures

## 📖 Reference Materials

For detailed specifications, see individual files in the subdirectories:
- `syntax/grammar.md` - Complete grammar specification
- `semantics/validation.md` - Validation rules and error handling
- `extensions/file-types.md` - Detailed file extension documentation
