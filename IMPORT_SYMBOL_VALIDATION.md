# 🔄 **IMPORT SYSTEM & SYMBOL VISIBILITY**
**Complete Implementation of Parent Symbol Imports**

---

## 🎯 **KEY PRINCIPLES**

### **✅ Use Imports Parent Symbols (NOT Files)**
```sylang
// ❌ WRONG - use does NOT import filenames
use "MyFunctions.fun"
use ../subsystems/PowerSubsystem.blk

// ✅ CORRECT - use imports parent symbol names
use functiongroup MyFunctions
use block subsystem PowerSubsystem, ControlSubsystem
use reqsection SafetyRequirements, FunctionalRequirements
```

### **✅ Parent + Children Become Visible**
When you import a parent symbol, **both the parent AND all its children** become visible:

```sylang
// In PowerFunctions.fun:
def functiongroup PowerFunctions
  name "Power Management Functions"
  
  def function ProcessInput
    name "Process Input Power"
    
  def function RegulateVoltage  
    name "Regulate Output Voltage"
    
  def function MonitorTemperature
    name "Monitor System Temperature"
```

```sylang
// In MyRequirements.req:
use functiongroup PowerFunctions  // ← Imports parent symbol

def reqsection MyRequirements
  name "My Requirements"
  
  def requirement REQ_001
    name "Power Processing Requirement" 
    implements function ProcessInput      // ✅ Available (child of imported parent)
    
  def requirement REQ_002
    name "Voltage Regulation Requirement"
    implements function RegulateVoltage   // ✅ Available (child of imported parent)
    
  def requirement REQ_003
    name "Temperature Monitoring Requirement"  
    implements function MonitorTemperature // ✅ Available (child of imported parent)
```

### **✅ Multi-Import Support**
```sylang
// Import multiple parent symbols of same type in one line
use block subsystem ControlSubsystem, PowerSubsystem, SafetySubsystem
use functiongroup CoreFunctions, SafetyFunctions, DiagnosticFunctions
use reqsection FunctionalRequirements, SafetyRequirements, PerformanceRequirements
```

### **❌ No Use = Not Visible**
```sylang
// In MyRequirements.req - NO use statement

def reqsection MyRequirements
  name "My Requirements"
  
  def requirement REQ_001
    name "Bad Requirement"
    implements function ProcessInput      // ❌ ERROR: Symbol 'ProcessInput' is not visible. Use 'use' to import it.
```

---

## 🔧 **IMPLEMENTATION DETAILS**

### **1. Import Statement Parsing**
```typescript
// Format: use <ParentType> <ParentName1>, <ParentName2>, ...
// Examples:
"use functiongroup PowerFunctions"
"use block subsystem ControlSubsystem, PowerSubsystem" 
"use reqsection SafetyRequirements, FunctionalRequirements"

// Parsed into:
{
  keyword: "use",
  parentType: "functiongroup", // or "block", "reqsection"
  subtype: undefined,          // or "subsystem" for block types
  parentNames: ["PowerFunctions"]
}
```

### **2. Parent Symbol Resolution**
```typescript
// ImportManager.findParentSymbol()
// 1. Search all symbols across all documents
// 2. Find symbols with matching type and name
// 3. Verify it's a parent-level symbol (not a child)

findParentSymbol(parentType: string, parentName: string): ISymbolDefinition | undefined {
    const allSymbols = this.symbolManager?.getAllSymbols?.() || [];
    
    return allSymbols.find(symbol => 
        this.isParentSymbolType(symbol.type, parentType) && 
        symbol.name === parentName &&
        !symbol.parentSymbol  // Must be a root-level parent symbol
    );
}
```

### **3. Child Symbol Discovery**
```typescript
// When parent symbol found, get ALL its children
const parentSymbol = this.findParentSymbol("functiongroup", "PowerFunctions");
if (parentSymbol) {
    // Make parent visible
    this.makeSymbolVisible(documentUri, parentSymbol.id);
    
    // Get all child symbols and make them visible too
    const childSymbols = this.getChildSymbols(parentSymbol.id);
    for (const childSymbol of childSymbols) {
        this.makeSymbolVisible(documentUri, childSymbol.id);
    }
}
```

### **4. Symbol Visibility Validation**
```typescript
// SymbolVisibilityValidationRule validates ALL symbol references
validateSymbolReference(documentUri: string, referencedSymbolName: string): {
    isValid: boolean;
    error?: string;
    suggestions?: string[];
} {
    const visibleSymbols = this.getVisibleSymbols(documentUri);
    
    const matchingSymbols = visibleSymbols.filter(symbol => 
        symbol.name === referencedSymbolName
    );

    if (matchingSymbols.length > 0) {
        return { isValid: true };
    }

    return {
        isValid: false,
        error: `Symbol '${referencedSymbolName}' is not visible. Use 'use' to import it.`,
        suggestions: this.getImportSuggestions(referencedSymbolName)
    };
}
```

---

## 💡 **VALIDATION EXAMPLES**

### **✅ Valid Usage**
```sylang
// PowerController.req
use functiongroup PowerFunctions    // Import parent symbol
use block subsystem PowerSubsystem  // Import another parent symbol

def reqsection PowerRequirements
  name "Power Management Requirements"
  
  def requirement REQ_001
    name "Input Processing"
    implements function ProcessInput      // ✅ Valid - child of imported PowerFunctions
    allocatedto subsystem PowerSubsystem // ✅ Valid - imported parent symbol
```

### **❌ Invalid Usage with Precise Errors**
```sylang
// PowerController.req - Missing imports

def reqsection PowerRequirements
  name "Power Management Requirements"
  
  def requirement REQ_001
    name "Input Processing"
    implements function ProcessInput      // ❌ ERROR: Symbol 'ProcessInput' is not visible. Use 'use' to import it.
                                         // ℹ️ INFO: Add import: use functiongroup PowerFunctions
    
  def requirement REQ_002  
    name "Temperature Control"
    implements function TemperatureControl // ❌ ERROR: Symbol 'TemperatureControl' is not visible. Use 'use' to import it.
                                          // ℹ️ INFO: Add import: use functiongroup SafetyFunctions
```

---

## 🔍 **PARENT SYMBOL TYPES**

### **Valid Import Types**
```typescript
const parentTypeMap: Record<string, string[]> = {
    'productline': ['productline'],
    'featureset': ['featureset'], 
    'variantmodel': ['variantmodel'],
    'configset': ['configset'],
    'functiongroup': ['functiongroup'],
    'block': ['system', 'subsystem', 'component'], // block can be system/subsystem/component
    'reqsection': ['reqsection'],
    'testsuite': ['testsuite'],
    'failuremodeanalysis': ['failuremodeanalysis'],
    'controlmeasures': ['controlmeasures'],
    'faulttreeanalysis': ['faulttreeanalysis'],
    'itemdefinition': ['itemdefinition'],
    'hazardidentification': ['hazardidentification'],
    'riskassessment': ['riskassessment'],
    'safetygoals': ['safetygoals']
};
```

### **Import Syntax Patterns**
```sylang
// Simple parent imports
use productline MyProductLine
use featureset CoreFeatures
use functiongroup PowerFunctions

// Compound parent imports (with subtype)
use block system MainSystem
use block subsystem PowerSubsystem, ControlSubsystem  
use block component PowerController

// Multi-import (same parent type)
use functiongroup PowerFunctions, SafetyFunctions, DiagnosticFunctions
```

---

## 🚀 **INTEGRATION WITH VALIDATION PIPELINE**

### **1. Import Processing (First)**
```typescript
// SymbolVisibilityValidationRule.processImportStatements()
// - Parse all "use" statements in document
// - Resolve parent symbols from global symbol table
// - Make parent + children visible in current document
```

### **2. Reference Validation (Second)**
```typescript
// SymbolVisibilityValidationRule.extractSymbolReferences()  
// - Find all symbol references in compound properties
// - Check if each referenced symbol is visible
// - Report errors with import suggestions
```

### **3. Real-time Diagnostics**
```typescript
// Immediate red squiggly lines for:
// ❌ "Symbol 'FunctionName' is not visible"
// ℹ️ "Add import: use functiongroup PowerFunctions"
// ℹ️ "Did you mean: ProcessData, ProcessInput?"
```

---

## ✅ **VERIFICATION CHECKLIST**

- [x] **use imports parent symbols, NOT filenames**
- [x] **Multi-import syntax: `use block subsystem xxx,fff,ddd,eee`**
- [x] **Parent + ALL children become visible after import**
- [x] **No use = symbol not visible (strict enforcement)**
- [x] **Precise error messages with import suggestions**
- [x] **Real-time validation with red squiggly lines**
- [x] **Integration with extensible keyword system**

**🎉 The import system now correctly handles parent symbol imports with full child visibility and strict enforcement!** 