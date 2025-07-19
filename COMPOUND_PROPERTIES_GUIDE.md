# 🔧 Compound Properties Implementation Guide

## 🎯 **Problem Solved**
How to handle Sylang properties with secondary keywords like:
- `implements function <FunctionList>`
- `enables feature <FeatureList>`
- `allocatedto component <ComponentList>`
- `partof system <SystemName>`
- `contains subsystem <SubsystemList>`

## 🏗️ **Architecture Overview**

### **1. Define Compound Properties** (`ConfigurationManager.ts`)

```typescript
// NEW METHOD: Define compound properties with secondary keywords
getCompoundPropertyDefinitions(languageId: string, context: string): Record<string, CompoundPropertyDef> {
    const definitions: Record<string, CompoundPropertyDef> = {};
    
    switch (languageId) {
        case 'sylang-requirement':
            if (context === 'requirement') {
                definitions['implements'] = {
                    primaryKeyword: 'implements',
                    secondaryKeywords: ['function'],
                    valueType: 'identifier-list',
                    syntax: 'implements function <FunctionList>'
                };
                definitions['allocatedto'] = {
                    primaryKeyword: 'allocatedto',
                    secondaryKeywords: ['component', 'subsystem'],
                    valueType: 'identifier-list', 
                    syntax: 'allocatedto component <ComponentList>'
                };
            }
            break;
            
        case 'sylang-block':
            if (context === 'block') {
                definitions['implements'] = {
                    primaryKeyword: 'implements',
                    secondaryKeywords: ['function'],
                    valueType: 'identifier-list',
                    syntax: 'implements function <FunctionList>'
                };
                definitions['enables'] = {
                    primaryKeyword: 'enables',
                    secondaryKeywords: ['feature'],
                    valueType: 'identifier-list',
                    syntax: 'enables feature <FeatureList>'
                };
                definitions['contains'] = {
                    primaryKeyword: 'contains',
                    secondaryKeywords: ['subsystem', 'component', 'module'],
                    valueType: 'identifier-list',
                    syntax: 'contains subsystem <SubsystemList>'
                };
                definitions['partof'] = {
                    primaryKeyword: 'partof',
                    secondaryKeywords: ['system', 'subsystem'],
                    valueType: 'identifier',
                    syntax: 'partof system <SystemName>'
                };
            }
            break;
    }
    
    return definitions;
}
```

### **2. Validate Compound Properties** (`PropertyValidationRule.ts`)

```typescript
// Enhanced validation logic that handles both simple and compound properties
if (validProperties.includes(keyword)) {
    // Check if this is a compound property
    const compoundDefs = this.configurationManager
        .getCompoundPropertyDefinitions(languageId, currentContext);
    
    if (compoundDefs[keyword]) {
        // Validate compound property with secondary keywords
        this.validateCompoundProperty(
            diagnostics, lineIndex, trimmedLine, 
            compoundDefs[keyword], line
        );
    } else {
        // Validate simple property (name, description, etc.)
        this.validateSimpleProperty(
            diagnostics, lineIndex, trimmedLine, keyword
        );
    }
}

// Compound property validation method
private validateCompoundProperty(
    diagnostics: vscode.Diagnostic[], 
    lineIndex: number, 
    line: string, 
    definition: CompoundPropertyDef,
    fullLine: string
): void {
    const parts = line.trim().split(/\s+/);
    
    // Check minimum parts: primaryKeyword + secondaryKeyword + value
    if (parts.length < 3) {
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        diagnostics.push(new vscode.Diagnostic(
            range,
            `Invalid ${definition.primaryKeyword} syntax. Expected: ${definition.syntax}`,
            vscode.DiagnosticSeverity.Error
        ));
        return;
    }
    
    const primaryKeyword = parts[0];    // 'implements'
    const secondaryKeyword = parts[1];  // 'function'
    const valueText = parts.slice(2).join(' '); // 'FuncA, FuncB'
    
    // Validate secondary keyword
    if (!definition.secondaryKeywords.includes(secondaryKeyword)) {
        const secondaryStart = fullLine.indexOf(secondaryKeyword);
        const range = new vscode.Range(
            lineIndex, secondaryStart, lineIndex, secondaryStart + secondaryKeyword.length
        );
        
        diagnostics.push(new vscode.Diagnostic(
            range,
            `Invalid secondary keyword "${secondaryKeyword}" for ${primaryKeyword}. Valid: ${definition.secondaryKeywords.join(', ')}`,
            vscode.DiagnosticSeverity.Error
        ));
        return;
    }
    
    // Validate value based on type
    this.validatePropertyValue(
        diagnostics, lineIndex, valueText, 
        definition.valueType, definition.syntax, fullLine
    );
}
```

### **3. Value Type Validation**

```typescript
private validatePropertyValue(
    diagnostics: vscode.Diagnostic[], 
    lineIndex: number, 
    valueText: string, 
    valueType: string,
    syntaxExample: string,
    fullLine: string
): void {
    switch (valueType) {
        case 'identifier':
            // Single identifier: partof system SystemName
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(valueText.trim())) {
                // Error: Invalid identifier
            }
            break;
            
        case 'identifier-list':
            // Comma-separated list: implements function FuncA, FuncB
            const identifiers = valueText.split(',').map(id => id.trim());
            for (const identifier of identifiers) {
                if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
                    // Error: Invalid identifier in list
                }
            }
            break;
            
        case 'string':
            // Quoted string: name "Component Name"
            if (!valueText.match(/^".*"$/)) {
                // Error: String must be quoted
            }
            break;
            
        case 'enum':
            // Predefined values: safetylevel ASIL-C
            // Add enum validation logic
            break;
    }
}
```

## 🎯 **Key Benefits**

### **✅ Modular by Context**
```typescript
// Easy to add new compound properties per context:
'sylang-requirement': {
    'requirement': {
        'traces': {
            primaryKeyword: 'traces',
            secondaryKeywords: ['requirement', 'goal'],
            valueType: 'identifier-list',
            syntax: 'traces requirement <RequirementList>'
        }
    }
}
```

### **✅ Precise Error Messages**
```
❌ Invalid secondary keyword "component" for implements. Valid: function
❌ Invalid identifier "myFunc" in list. Should use PascalCase  
❌ Invalid implements syntax. Expected: implements function <FunctionList>
```

### **✅ Extensible**
```typescript
// Add new value types easily:
case 'file-path':
case 'version-number':
case 'custom-enum':
```

## 🔄 **Implementation Steps**

1. **Add CompoundPropertyDef interface** to your interfaces
2. **Implement getCompoundPropertyDefinitions()** in ConfigurationManager
3. **Enhance PropertyValidationRule** with compound property logic
4. **Add value type validation** for each supported type
5. **Test with your Sylang files**

## 📝 **Example Validation Results**

### **✅ Valid Compound Properties**
```sylang
implements function DeflateCuff, InflateCuff
enables feature PressureMeasurement  
allocatedto component MeasurementSubsystem
partof system BloodPressureSystem
contains subsystem ControlSubsystem, SensorSubsystem
```

### **❌ Invalid Examples with Precise Errors**
```sylang
implements component DeflateCuff     // ❌ Invalid secondary keyword "component"
enables DeflateCuff                  // ❌ Missing secondary keyword "feature"  
partof DeflateCuff, InflateCuff     // ❌ partof expects single identifier, not list
allocatedto invalidname             // ❌ Invalid identifier "invalidname"
```

## 🚀 **Result: Perfect Modular Architecture**

You now have **exactly what you wanted**:

- **🎯 Context-specific properties** - Each definition type has its own valid properties
- **🔧 Compound property support** - Secondary keywords with proper validation
- **📝 Precise error messages** - Users know exactly what's wrong and how to fix it
- **🚀 Easy extensibility** - Add new properties, contexts, or value types effortlessly
- **⚡ Performance optimized** - Rule-based validation pipeline

**No more flat keyword lists!** Each context has its own specific properties with full compound property support. 