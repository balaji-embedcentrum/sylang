# Sylang Extension Testing Instructions (Updated)

## Installation

The updated Sylang VS Code extension has been packaged into a VSIX file with **FIXED** go-to-definition and find-references functionality.

### Install the Updated Version
```bash
code --install-extension sylang-1.0.20.vsix
```

Or via VS Code UI:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)  
3. Click the three dots menu (...) → "Install from VSIX..."
4. Select the `sylang-1.0.20.vsix` file

## 🔧 What Was Fixed

### Missing Commands Issue
- ✅ Added `sylang.refreshSymbols` command to package.json
- ✅ Added `sylang.validateWorkspace` command to package.json
- ✅ Both commands now appear in Command Palette

### Go-to-Definition & Find References
- ✅ `SylangDefinitionProvider` and `SylangReferenceProvider` properly registered
- ✅ `SymbolManager` configured for all Sylang file types
- ✅ Language ID detection working for `.fml`, `.fun`, `.ple` files

## 🧪 Testing Steps

### 1. Test Command Availability
Open Command Palette (`Ctrl+Shift+P`) and search for:
- `Sylang: Refresh Symbols` ✅ Should appear now
- `Sylang: Validate Workspace` ✅ Should appear now

### 2. Test Go-to-Definition (F12)
In your `Inverter.fml` file:
1. Find a line with `enables` keyword (e.g., `enables PowerConversion`)
2. Place cursor on `PowerConversion`
3. Press **F12** or right-click → "Go to Definition"
4. **Expected**: Should jump to `def feature PowerConversion` in the same or related file

### 3. Test Find References (Shift+F12)
1. Place cursor on any feature name like `PowerConversion`
2. Press **Shift+F12** or right-click → "Find All References"
3. **Expected**: Shows all places where `PowerConversion` is used

### 4. Test Cross-File Navigation
1. Open `EPBFunctions.fun` 
2. Find a function with `enables` (e.g., `enables EPBSystem`)
3. Press **F12** on `EPBSystem`
4. **Expected**: Should jump to `def feature EPBSystem` in `EPBFeatures.fml`

## 🐛 Debugging If Still Not Working

### Check Extension Activation
1. Open VS Code Developer Console: `Help` → `Toggle Developer Tools` → `Console`
2. Look for Sylang activation messages:
   ```
   [Sylang] ===== SYLANG EXTENSION VERSION 1.0.20 ACTIVATING =====
   [Sylang] - Language ID: sylang-features
   [Sylang] - Has Sylang extension: true
   ```

### Check Language Detection
In the Developer Console, when you open a `.fml` file, you should see:
```
[Sylang] - Language ID: sylang-features
[Sylang] - Starts with 'sylang-': true
[Sylang] - Has Sylang extension: true
[Sylang] - Result: true
```

### Force Symbol Refresh
If go-to-definition still doesn't work:
1. Run: `Ctrl+Shift+P` → `Sylang: Refresh Symbols`
2. Wait for "Symbol cache refreshed" message
3. Try F12 again

### Check File Association
In VS Code, look at the bottom-right corner - it should show:
- For `.fml` files: `Sylang Features`
- For `.fun` files: `Sylang Functions`
- For `.ple` files: `Sylang ProductLine`

## 📋 Expected Working Features

✅ **Syntax Highlighting** for all Sylang files  
✅ **Code Snippets** with auto-completion  
✅ **Go to Definition (F12)** for symbols  
✅ **Find References (Shift+F12)** for symbols  
✅ **Cross-file navigation** via `enables` keyword  
✅ **Basic validation** with error highlighting  
✅ **Commands in palette** (Refresh Symbols, Validate Workspace)

## 🔄 If Issues Persist

1. **Restart VS Code** after installing the extension
2. **Check file extensions** - ensure files end with `.fml`, `.fun`, `.ple`
3. **Run symbol refresh** command
4. **Check console logs** for error messages
5. **Verify language mode** in bottom-right corner of VS Code

The core navigation functionality should now work correctly with this updated version!

## Testing the Extension

### 1. Safety Validation Features
The extension includes basic safety validation for Sylang safety files:

- **File Extensions Supported**: `.haz`, `.rsk`, `.sgl`, `.itm`, `.fsr`
- **Basic Validation**: 
  - `def` keyword requirement
  - Safety level validation (ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM)
  - Quoted string validation for properties

### 2. Test Files Available
You can test with the example files in the repository:

**Safety Files in `Inverter/safety-engineering/`:**
- `InverterHazards.haz` - Hazard identification
- `InverterOperationalScenarios.itm` - Hazard analysis scenarios  
- `InverterSafetyGoals.sgl` - Safety goals
- `InverterFunctionalSafetyRequirements.fsr` - Safety requirements

**Platform Engineering Files:**
- `Inverter/platform-engineering/inverter.ple` - Product line definition
- `Inverter/platform-engineering/inverter.fml` - Feature model (rename to .fml)
- `Inverter/platform-engineering/inverter.fun` - Functions

### 3. Features to Test

#### Syntax Highlighting
- Open any `.ple`, `.fml`, `.fun`, `.haz`, `.rsk`, `.sgl`, `.itm`, or `.fsr` file
- Verify that keywords like `def`, `name`, `description`, `safetylevel` are highlighted

#### Code Snippets  
- In a safety file, type `defhazard` and press Tab to see snippet expansion
- Try other snippets like `defsafetygoal`, `defrequirement`

#### Basic Validation
- Open a safety file
- Try adding an invalid safety level like `safetylevel INVALID`
- You should see error highlighting

#### Commands
- Open Command Palette (Ctrl+Shift+P)
- Look for Sylang commands:
  - "Sylang: Validate Sylang File"
  - "Sylang: Format Sylang File"

### 4. Known Limitations in Test Version

This test version has simplified safety validation. The full safety validators with advanced cross-file reference checking, ISO 26262 compliance validation, and detailed safety analysis are temporarily disabled to create a working test package.

### 5. Creating Test Files

Create a new file with a safety extension (e.g., `test.haz`) and try this content:

```sylang
def hazardidentification InverterHazards
  name "Inverter System Hazard Analysis"
  description "Hazard identification for automotive inverter system"
  owner "Safety Team"
  methodology "HAZOP, FMEA"

  def hazard H_PWR_001
    name "Unintended Power Output"
    description "Inverter provides unexpected power output to motor"
    cause "Control system malfunction"
    effect "Vehicle acceleration without driver input"
    safetylevel ASIL-D
```

### 6. Feedback

When testing, please note:
- Any syntax highlighting issues
- Validation errors or warnings
- Performance issues
- Missing features
- Crashes or unexpected behavior

## Uninstalling

To uninstall the extension:
1. Go to Extensions in VS Code
2. Find "Sylang" in the installed extensions
3. Click the gear icon and select "Uninstall"

## Next Steps

After testing, the complex safety validators can be re-enabled and refined based on your feedback. The goal is to provide comprehensive MBSE support for automotive, aerospace, and medical system engineering with full ISO 26262 compliance. 