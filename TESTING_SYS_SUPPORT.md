# Testing .sys File Support in Sylang Extension v1.0.31

## Overview
This version adds comprehensive support for `.sys` (System Definition) files with validation, auto-completion, and hover documentation.

## Installation
1. Install the VSIX package: `code --install-extension sylang-1.0.31-sys-support.vsix`
2. Reload VS Code
3. Open any `.sys` file to activate the extension

## Test Files

### 1. Basic System Definition (`test-sys-validation.sys`)
```sylang
def system TestSystem
  name "Test System"
  description "Test system for validation"
  owner "Test Team"
  tags "test", "validation"
  asil D
  contains subsystem TestSubsystem
```

### 2. Complex System Example (`complex-system-test.sys`)
```sylang
def system ComplexInverterSystem
  name "Advanced Power Inverter System"
  description "High-performance electric vehicle inverter with advanced control and safety features"
  owner "Power Electronics Team"
  tags "inverter", "power-conversion", "electric-vehicle", "automotive"
  asil D
  contains subsystem PowerElectronicsSubsystem, ControlSubsystem, ThermalManagementSubsystem, ProtectionSubsystem, CommunicationSubsystem, MonitoringSubsystem, PowerInputSubsystem, PowerOutputSubsystem
```

### 3. Multiple ASIL Levels Test (`asil-levels-test.sys`)
```sylang
def system SafetyTestSystem
  name "Safety Level Test System"
  description "System for testing different ASIL levels"
  owner "Safety Engineering Team"
  tags "safety", "asil", "testing"
  asil QM
  contains subsystem BasicSubsystem

def system MediumSafetySystem
  name "Medium Safety System"
  description "System with medium safety requirements"
  owner "Safety Team"
  tags "safety", "medium"
  asil B
  contains subsystem SafetySubsystem

def system CriticalSafetySystem
  name "Critical Safety System"
  description "System with highest safety requirements"
  owner "Critical Safety Team"
  tags "safety", "critical"
  asil D
  contains subsystem CriticalSubsystem
```

## Features to Test

### 1. **Syntax Highlighting**
- Open any `.sys` file
- Verify keywords (`def`, `system`, `name`, `description`, etc.) are highlighted
- Verify strings are highlighted in different color
- Verify ASIL levels are highlighted as enums

### 2. **Auto-completion**
- Type `def ` and verify `system` appears in completion list
- Inside a system definition, type and verify these completions appear:
  - `name` → `name "System Name"`
  - `description` → `description "System description"`
  - `owner` → `owner "Team Name"`
  - `tags` → `tags "tag1", "tag2"`
  - `asil` → Shows dropdown with QM, A, B, C, D
  - `contains` → `contains subsystem SubsystemName`

### 3. **Template Snippets**
- Type `def system` and select the template
- Verify tab navigation works through all placeholders:
  1. System ID (PascalCase)
  2. Name (quoted string)
  3. Description (quoted string)
  4. Owner (quoted string)
  5. Tags (quoted strings)
  6. ASIL level (dropdown: QM, A, B, C, D)
  7. Subsystem names (comma-separated)

### 4. **Hover Documentation**
- Hover over `system` keyword → Shows system definition documentation
- Hover over `asil` → Shows ASIL level documentation with examples
- Hover over `contains` → Shows contains property documentation
- Hover over any property → Shows relevant documentation

### 5. **Validation**
- **Valid Structure**: System must start with `def system <PascalCaseIdentifier>`
- **Required Properties**: Test missing required properties
- **ASIL Validation**: Try invalid ASIL values (should show error)
- **Quoted Strings**: Test unquoted names/descriptions (should show error)
- **Identifier Validation**: Test invalid system names (should show error)
- **Indentation**: Test incorrect indentation (should show error)

### 6. **Error Testing**
Create files with intentional errors to test validation:

#### Invalid ASIL Level (`error-invalid-asil.sys`)
```sylang
def system ErrorSystem
  name "Error System"
  description "System with invalid ASIL"
  owner "Test Team"
  tags "error", "test"
  asil X  // Should show error: asil must be one of: QM, A, B, C, D
  contains subsystem TestSubsystem
```

#### Missing Quotes (`error-missing-quotes.sys`)
```sylang
def system ErrorSystem
  name Error System  // Should show error: name must be quoted
  description "System with missing quotes"
  owner "Test Team"
  tags "error", "test"
  asil D
  contains subsystem TestSubsystem
```

#### Invalid System Name (`error-invalid-name.sys`)
```sylang
def system error_system  // Should show error: Invalid system declaration
  name "Error System"
  description "System with invalid identifier"
  owner "Test Team"
  tags "error", "test"
  asil D
  contains subsystem TestSubsystem
```

## Expected Behaviors

### ✅ Should Work:
- File extension `.sys` is recognized as Sylang Components
- Syntax highlighting for all keywords
- Auto-completion with tab navigation
- Rich hover documentation
- Validation with helpful error messages
- ASIL level enum completion (QM, A, B, C, D)
- Multiple subsystems on same line
- Proper indentation validation

### ❌ Should Show Errors:
- Missing `def system` at start
- Invalid ASIL levels (anything other than QM, A, B, C, D)
- Unquoted string properties
- Invalid PascalCase identifiers
- Incorrect indentation
- Nested definitions (not allowed in .sys files)

## Integration Testing
1. Test alongside existing `.sub` files
2. Test with `.fml` and `.fun` files for cross-references
3. Verify no conflicts with other Sylang file types
4. Test workspace-wide validation

## Performance Testing
- Open large `.sys` files (>1000 lines)
- Test auto-completion response time
- Test validation performance on save

## Version Information
- **Extension Version**: 1.0.31
- **New Features**: Complete `.sys` file support
- **Files Modified**: 
  - `SystemValidator.ts` (new)
  - `ValidationEngine.ts` (updated)
  - `SylangCompletionProvider.ts` (updated)
  - `SylangHoverProvider.ts` (updated)
  - `package.json` (updated)

## Reporting Issues
If you find any issues during testing, please report:
1. Extension version: 1.0.31
2. VS Code version
3. Operating system
4. Exact steps to reproduce
5. Expected vs actual behavior
6. Sample `.sys` file content if relevant 