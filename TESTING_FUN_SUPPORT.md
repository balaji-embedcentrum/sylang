# Testing .fun File Support in Sylang Extension v1.0.32

## Overview
This version adds comprehensive support for `.fun` (Functions Definition) files with enhanced validation, auto-completion, and hover documentation.

> **⚠️ Important Change**: As of this version, `systemfunctions` and `subsystemfunctions` have been replaced with the generic `functiongroup` keyword. While legacy syntax may still be supported with deprecation warnings, all new code should use `def functiongroup`.

## Installation
1. Install the VSIX package: `code --install-extension sylang-1.0.32-fun-support.vsix`
2. Reload VS Code
3. Open any `.fun` file to activate the extension

## Test Files

### 1. Basic Function Group (`test-fun-validation.fun`)
```sylang
def functiongroup ActuationControlFunctions
  def function MotorDriveController
    name "Motor Drive Controller"
    description "Controls motor drive circuits and power management for actuator systems."
    owner "Hardware Team"
    tags "motor", "drive", "power"
    asil D
    enables feature ActuationSystemManager

  def function ActuatorSelectionLogic
    name "Actuator Selection Logic"
    description "Implements logic for selecting and switching between different actuator types based on configuration."
    owner "Hardware Team"
    tags "actuator", "selection", "logic"
    asil D
    enables feature ActuatorTypeSelector
```

### 2. System Functions Example (`function-group-test.fun`)
```sylang
def functiongroup InverterSystemFunctions
  def function PowerElectronicsController
    name "Power Electronics Controller"
    description "Main controller for all power electronics operations and switching control"
    owner "Power Electronics Team"
    tags "power-electronics", "controller", "switching"
    asil D
    enables feature PowerConversion, DCBusManagement, IGBTDrivers

  def function MotorControlAlgorithmEngine
    name "Motor Control Algorithm Engine"
    description "Advanced motor control algorithms including field-oriented control"
    owner "Controls Team"
    tags "motor-control", "algorithms", "FOC"
    asil D
    enables feature MotorControl, VectorControl, SpaceVectorPWM
```

### 3. Multiple ASIL Levels Test (`asil-functions-test.fun`)
```sylang
def subsystemfunctions SafetyFunctions
  def function SafetyCriticalFunction
    name "Safety Critical Function"
    description "Function with highest safety requirements"
    owner "Safety Team"
    tags "safety", "critical"
    asil D
    enables feature SafetySystems

  def function QualityManagedFunction
    name "Quality Managed Function"
    description "Function with standard quality requirements"
    owner "Quality Team"
    tags "quality", "standard"
    asil QM
    enables feature BasicOperations

  def function MediumSafetyFunction
    name "Medium Safety Function"
    description "Function with medium safety requirements"
    owner "Safety Team"
    tags "safety", "medium"
    asil B
    enables feature MonitoringSystems
```

## Features to Test

### 1. **Enhanced Validation**
- **Both Containers**: Supports both `def systemfunctions` and `def subsystemfunctions`
- **ASIL Levels**: Validates ASIL levels (QM, A, B, C, D) without "ASIL-" prefix
- **Function Properties**: Validates all function properties (name, description, owner, tags, asil, enables)
- **Enables Format**: Supports both `enables feature FeatureName` and legacy `enables FeatureName`
- **Indentation**: Proper hierarchical indentation validation
- **Single Container**: Only one functions container per file

### 2. **Auto-completion**
- Type `def ` and verify both `systemfunctions` and `subsystemfunctions` appear
- Inside functions container, type `def ` and verify `function` appears
- Inside function definition, verify these completions:
  - `name` → `name "Function Name"`
  - `description` → `description "Function description"`
  - `owner` → `owner "Team Name"`
  - `tags` → `tags "tag1", "tag2"`
  - `asil` → Shows dropdown with QM, A, B, C, D
  - `enables` → `enables feature FeatureName`

### 3. **Template Snippets**
- Type `def systemfunctions` and select template
- Type `def subsystemfunctions` and select template
- Type `def function` and select template
- Verify tab navigation works through all placeholders

### 4. **Hover Documentation**
- Hover over `systemfunctions` → Shows system functions documentation
- Hover over `subsystemfunctions` → Shows subsystem functions documentation
- Hover over `function` → Shows function definition documentation
- Hover over `enables` → Shows enables property documentation with both formats
- Hover over `asil` → Shows ASIL level documentation

### 5. **Cross-File Validation**
- **Feature References**: Validates that features in `enables` exist in .fml files
- **Error Messages**: Clear error messages for undefined features
- **Multiple Files**: Warns about multiple .fun files in workspace

### 6. **Error Testing**

#### Invalid Container Type (`error-invalid-container.fun`)
```sylang
def invalidfunctions TestFunctions  // Should show error
  def function TestFunction
    name "Test Function"
    description "Test function"
    owner "Test Team"
    tags "test"
    asil D
    enables feature TestFeature
```

#### Invalid ASIL Level (`error-invalid-asil-fun.fun`)
```sylang
def subsystemfunctions TestFunctions
  def function TestFunction
    name "Test Function"
    description "Test function"
    owner "Test Team"
    tags "test"
    asil X  // Should show error: asil must be one of: QM, A, B, C, D
    enables feature TestFeature
```

#### Missing Properties (`error-missing-properties.fun`)
```sylang
def subsystemfunctions TestFunctions
  def function TestFunction
    // Missing required properties - should show warnings
    enables feature TestFeature
```

#### Invalid Indentation (`error-indentation.fun`)
```sylang
def subsystemfunctions TestFunctions
def function TestFunction  // Should show error: incorrect indentation
  name "Test Function"
  description "Test function"
  owner "Test Team"
  tags "test"
  asil D
  enables feature TestFeature
```

## Key Improvements Over v1.0.31

### ✅ Enhanced Function Support:
- Support for both `systemfunctions` and `subsystemfunctions` containers
- Updated property validation with `asil` instead of `safetylevel`
- Enhanced `enables` validation for `enables feature` format
- Improved error messages and validation rules

### ✅ Better Auto-completion:
- Context-aware completions for .fun files
- Function-specific templates and snippets
- Support for both container types
- ASIL level enum completion

### ✅ Rich Documentation:
- Comprehensive hover documentation for all .fun keywords
- Examples showing proper syntax and usage
- Clear explanations of the enables feature format

### ✅ Cross-file Integration:
- Feature reference validation against .fml files
- Workspace-wide validation support
- Integration with existing Sylang ecosystem

## Expected Behaviors

### ✅ Should Work:
- File extension `.fun` recognized as Sylang Functions
- Both `systemfunctions` and `subsystemfunctions` containers
- Syntax highlighting for all keywords
- Auto-completion with proper context
- Rich hover documentation
- Validation with helpful error messages
- ASIL level support (QM, A, B, C, D)
- Feature reference validation
- Proper indentation validation

### ❌ Should Show Errors:
- Invalid container types (anything other than systemfunctions/subsystemfunctions)
- Invalid ASIL levels (anything other than QM, A, B, C, D)
- Missing required properties
- Invalid indentation
- References to undefined features
- Multiple functions containers in same file

## Integration Testing
1. Test alongside existing `.fml` files for feature cross-references
2. Test with `.sys` and `.sub` files for complete ecosystem validation
3. Verify no conflicts with other Sylang file types
4. Test workspace-wide validation

## Performance Testing
- Open large `.fun` files (>1000 lines)
- Test auto-completion response time
- Test validation performance on save
- Test feature cross-reference lookup performance

## Version Information
- **Extension Version**: 1.0.32
- **New Features**: Enhanced .fun file support with both systemfunctions and subsystemfunctions
- **Files Modified**: 
  - `FunctionsValidator.ts` (enhanced)
  - `SylangCompletionProvider.ts` (updated)
  - `SylangHoverProvider.ts` (updated)
  - `LanguageConfigs.ts` (updated)
  - `package.json` (updated)

## Reporting Issues
If you find any issues during testing, please report:
1. Extension version: 1.0.32
2. VS Code version
3. Operating system
4. Exact steps to reproduce
5. Expected vs actual behavior
6. Sample `.fun` file content if relevant 


sorry, I changed the .fun grammar a bit

its not systemfuncitons subsystemfunctions anymore, just generic like functiongroup as the keyword. Add separate property categoy which is an enum with values product, system, subsystem, component, module, unit, assembly, circuit, part.

also interface in and out.