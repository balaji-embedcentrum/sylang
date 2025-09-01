# Sylang Syntax Specification

This directory contains the complete syntax specification for the Sylang language.

## Files

- `grammar.md` - Complete BNF grammar specification
- `keywords.md` - Reserved keywords and identifiers
- `operators.md` - Operators and expressions
- `comments.md` - Comment syntax and rules
- `indentation.md` - Indentation rules and structure

## Basic Syntax Rules

### Indentation
- Use consistent indentation (2 or 4 spaces recommended)
- Indentation defines block structure
- No mixing of tabs and spaces
- Empty lines don't require indentation

### Comments
```sylang
// Single-line comment

/* Multi-line comment
   can span multiple lines */

/* Nested /* comments */ are not supported */
```

### Identifiers
- Start with letter or underscore
- Can contain letters, numbers, underscores
- Case-sensitive
- No reserved keywords as identifiers

### Basic Structure
```sylang
keyword identifier
    property name: value
    relationship target
        nested_property: nested_value
```

## File Extension Syntax

Each file extension has specific syntax rules:

### `.ple` (Product Line)
```sylang
productline SystemName
    description: "Product line description"
    version: "1.0.0"
    
    stakeholder Customer
        role: "End User"
        requirements: [safety, performance]
```

### `.blk` (Block)
```sylang
block SystemBlock
    description: "System block description"
    
    interface InputInterface
        signal power_in: voltage
        signal data_in: digital
    
    interface OutputInterface  
        signal power_out: voltage
        signal data_out: digital
    
    component Processor
        type: "ARM Cortex-M4"
        frequency: 168MHz
```

### `.fun` (Function)
```sylang
function_group SafetyFunctions
    description: "Safety-critical functions"
    
    function EmergencyStop
        input: emergency_signal
        output: brake_activation
        safety_level: ASIL_D
        
        behavior
            when emergency_signal.active
                set brake_activation.engage
                set system_state.safe_mode
```
