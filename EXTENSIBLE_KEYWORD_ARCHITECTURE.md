# 🚀 **EXTENSIBLE KEYWORD ARCHITECTURE**
**Complete Guide to Dynamic Keyword System for Sylang**

---

## 🎯 **ARCHITECTURE OVERVIEW**

This system completely eliminates hardcoded keywords and provides a fully extensible, configuration-driven approach to keyword management in Sylang.

### **Core Components:**

1. **📋 KeywordRegistry** - Central registry for all keywords
2. **🔧 KeywordDefinition** - Schema for defining keywords with rules
3. **📦 KeywordExtension** - Plugin system for adding keywords
4. **✅ DynamicKeywordValidationRule** - Runtime validation based on registry
5. **📁 JSON Configuration Files** - External keyword definitions

---

## 🏗️ **COMPONENT ARCHITECTURE**

### **1. IKeywordRegistry Interface**

```typescript
export interface IKeywordRegistry {
    // Registration
    registerKeyword(definition: KeywordDefinition): void;
    registerExtension(extension: KeywordExtension): Promise<void>;
    
    // Retrieval
    getKeyword(keywordId: string): KeywordDefinition | undefined;
    getKeywordByText(keyword: string, context?: Partial<KeywordContext>): KeywordDefinition[];
    getKeywordsOfType(type: KeywordType): KeywordDefinition[];
    
    // Validation
    validateKeywordUsage(keyword: string, value: string, context: KeywordUsageContext): KeywordValidationResult;
    
    // Extension Management
    reloadExtensions(): Promise<void>;
    onKeywordAdded: vscode.Event<KeywordDefinition>;
}
```

### **2. Keyword Types System**

```typescript
export enum KeywordType {
    PRIMARY_DEF = 'primary_def',           // def, productline, featureset
    SUB_DEF = 'sub_def',                   // feature, function, requirement
    SIMPLE_PROPERTY = 'simple_property',   // name, description, owner
    COMPOUND_PROPERTY = 'compound_property', // enables feature, implements function
    ENUM_VALUE = 'enum_value',             // ASIL-A, mandatory, high
    IMPORT_KEYWORD = 'import_keyword',     // use
    MODIFIER_KEYWORD = 'modifier_keyword'  // mandatory, optional, alternative
}
```

### **3. Context-Aware Validation**

```typescript
export interface KeywordContext {
    fileExtensions: string[];              // ['.fun', '.req']
    parentContexts: string[];              // ['function', 'requirement']
    allowedDepth: number[];                // [1, 2, 3] - indentation levels
    precedingKeywords?: string[];          // Keywords that can come before
    followingKeywords?: string[];          // Keywords that can come after
}
```

---

## 🔧 **HOW TO EXTEND KEYWORDS**

### **Method 1: JSON Configuration Files**

Create a file in `.sylang/keywords/my-extension.json`:

```json
{
  "extensionId": "my-custom-keywords",
  "extensionName": "My Custom Keywords",
  "version": "1.0.0",
  "keywords": [
    {
      "id": "custom.newkeyword",
      "keyword": "newkeyword",
      "type": "simple_property",
      "context": {
        "fileExtensions": [".fun", ".req"],
        "parentContexts": ["function", "requirement"],
        "allowedDepth": [1, 2, 3]
      },
      "validation": {
        "required": false,
        "valueType": "string"
      },
      "displayName": "New Keyword",
      "description": "My custom keyword for special cases",
      "examples": ["newkeyword \"my value\""],
      "definedBy": "my-custom-keywords",
      "version": "1.0.0",
      "tags": ["custom", "property"]
    }
  ]
}
```

### **Method 2: Runtime API**

```typescript
// Get keyword registry
const keywordRegistry = validationPipeline.getKeywordRegistry();

// Define new keyword
const newKeyword: KeywordDefinition = {
    id: 'runtime.mycustomkeyword',
    keyword: 'mycustomkeyword',
    type: KeywordType.SIMPLE_PROPERTY,
    context: {
        fileExtensions: ['.fun'],
        parentContexts: ['function'],
        allowedDepth: [1, 2]
    },
    validation: {
        required: false,
        valueType: KeywordValueType.ENUM,
        enumValues: ['high', 'medium', 'low']
    },
    displayName: 'My Custom Keyword',
    description: 'Runtime-defined custom keyword',
    examples: ['mycustomkeyword high'],
    definedBy: 'runtime',
    version: '1.0.0'
};

// Register it
keywordRegistry.registerKeyword(newKeyword);
```

### **Method 3: Extension Plugins**

```typescript
const extension: KeywordExtension = {
    extensionId: 'automotive-safety-extension',
    extensionName: 'Automotive Safety Keywords',
    version: '2.0.0',
    keywords: [
        // ISO 26262 specific keywords
        {
            id: 'iso26262.hazardclassification',
            keyword: 'hazardclassification',
            type: KeywordType.COMPOUND_PROPERTY,
            context: {
                fileExtensions: ['.haz'],
                parentContexts: ['hazard'],
                allowedDepth: [1, 2]
            },
            validation: {
                required: true,
                valueType: KeywordValueType.COMPOUND
            },
            secondaryKeywords: ['severity', 'exposure', 'controllability'],
            syntaxPattern: 'hazardclassification severity <S0-S3> exposure <E0-E4> controllability <C0-C3>',
            displayName: 'Hazard Classification',
            description: 'ISO 26262 hazard classification parameters',
            examples: ['hazardclassification severity S3 exposure E4 controllability C1'],
            definedBy: 'automotive-safety-extension',
            version: '2.0.0',
            tags: ['iso26262', 'safety', 'hara']
        }
    ]
};

await keywordRegistry.registerExtension(extension);
```

---

## 🎯 **KEYWORD VALUE TYPES**

### **1. Simple Values**

```typescript
// STRING - Quoted strings
name "My Product Line"
description "Detailed description"

// IDENTIFIER - PascalCase identifiers
enables feature PowerConversion

// ENUM - Predefined values
safetylevel ASIL-D
priority high

// NUMBER - Numeric values
weight 150.5
count 42
```

### **2. Complex Values**

```typescript
// COMPOUND - Multi-part keywords
enables feature PowerConversion
implements function ProcessData
allocatedto component PowerController

// REFERENCE - Symbol references
derivedfrom requirement REQ_001
satisfies safetygoal SG_001

// REFERENCE_LIST - Multiple symbol references
implements function ProcessData, ValidateInput, MonitorStatus
```

---

## ⚡ **VALIDATION RULES**

### **1. Context Validation**

```typescript
// Keywords are validated based on:
// - File extension (.fun, .req, etc.)
// - Parent context (inside 'function', 'requirement', etc.)
// - Indentation level (0=root, 1=nested, etc.)
// - Preceding/following keywords

// ✅ Valid - 'enables' is allowed in function context
def function ProcessData
  enables feature PowerConversion    // ✅ Valid

// ❌ Invalid - 'enables' not allowed in productline context  
def productline MyProduct
  enables feature PowerConversion    // ❌ Error: Invalid keyword 'enables' in productline context
```

### **2. Value Type Validation**

```typescript
// ✅ Valid enum value
safetylevel ASIL-D

// ❌ Invalid enum value
safetylevel ASIL-E    // ❌ Error: Invalid enum value. Valid values: ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM

// ✅ Valid string
name "My Function"

// ❌ Invalid string (missing quotes)
name My Function      // ❌ Error: String value must be quoted

// ✅ Valid identifier
enables feature PowerConversion

// ❌ Invalid identifier (lowercase)
enables feature powerConversion  // ❌ Error: Identifier must use PascalCase
```

### **3. Compound Property Validation**

```typescript
// ✅ Valid compound property
implements function ProcessData

// ❌ Missing secondary keyword
implements ProcessData           // ❌ Error: Missing secondary keyword 'function'

// ❌ Invalid secondary keyword  
implements requirement ProcessData   // ❌ Error: Invalid secondary keyword 'requirement' for implements. Valid: function
```

---

## 🚀 **INTEGRATION WITH VALIDATION PIPELINE**

### **1. Dynamic Rule Registration**

```typescript
export class ValidationPipeline {
    private keywordRegistry: KeywordRegistry;
    
    constructor() {
        // Initialize keyword registry
        this.keywordRegistry = new KeywordRegistry();
        
        // Register dynamic keyword validation rule
        const dynamicRule = new DynamicKeywordValidationRule(this.keywordRegistry);
        this.registerRule(dynamicRule);
    }
    
    // Expose keyword registry for extensions
    getKeywordRegistry(): KeywordRegistry {
        return this.keywordRegistry;
    }
}
```

### **2. Real-time Validation**

```typescript
// The DynamicKeywordValidationRule automatically:
// 1. Parses each line to extract keywords
// 2. Looks up keyword definitions in registry
// 3. Validates context and value types
// 4. Provides suggestions for typos
// 5. Shows appropriate error messages

export class DynamicKeywordValidationRule implements IValidationRule {
    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        // Parse line to get keywords
        const tokens = this.parseLine(line);
        
        for (const token of tokens) {
            // Validate using registry
            const result = this.keywordRegistry.validateKeywordUsage(
                token.keyword,
                token.value,
                usageContext
            );
            
            if (!result.isValid) {
                // Create diagnostic with specific error
                diagnostics.push(new vscode.Diagnostic(
                    range,
                    result.errors.join('; '),
                    vscode.DiagnosticSeverity.Error
                ));
            }
        }
    }
}
```

---

## 📁 **FILE ORGANIZATION**

```
sylang-extn/
├── src/core/keywords/
│   ├── IKeywordRegistry.ts          # Interface definitions
│   ├── KeywordRegistry.ts           # Implementation
│   └── index.ts                     # Exports
├── src/core/rules/
│   ├── DynamicKeywordValidationRule.ts  # Dynamic validation
│   ├── HeaderDefValidationRule.ts      # Structure validation
│   └── FileLimitValidationRule.ts      # File limit validation
├── keywords/                        # Extension directory
│   ├── sylang-core-extensions.json     # Core extensions
│   ├── automotive-extensions.json      # Automotive keywords
│   ├── aerospace-extensions.json       # Aerospace keywords
│   └── medical-extensions.json         # Medical device keywords
└── .sylang/keywords/               # User extensions (in workspace)
    ├── my-custom-keywords.json
    └── project-specific-keywords.json
```

---

## 🎯 **BENEFITS OF THIS ARCHITECTURE**

### **✅ Extensibility**
- Add new keywords without code changes
- Support industry-specific terminologies
- Enable project-specific vocabularies

### **✅ Maintainability**
- No hardcoded keyword lists
- Single source of truth for all keywords
- Version-controlled keyword definitions

### **✅ Flexibility**
- Context-aware validation
- Multiple validation rules per keyword
- Dynamic loading and reloading

### **✅ User Experience**
- Precise error messages
- Smart suggestions for typos
- Auto-completion based on context
- Rich hover information

### **✅ Industry Support**
- Automotive (ISO 26262) extensions
- Aerospace (DO-178C) extensions  
- Medical (IEC 62304) extensions
- Custom industry vocabularies

---

## 🚀 **GETTING STARTED**

### **1. Basic Usage (No Changes Needed)**
The system comes with core Sylang keywords pre-loaded. Existing files work without changes.

### **2. Add Custom Keywords**
Create `.sylang/keywords/my-keywords.json` in your workspace:

```json
{
  "extensionId": "my-project-keywords",
  "extensionName": "My Project Keywords", 
  "version": "1.0.0",
  "keywords": [
    {
      "id": "project.priority",
      "keyword": "priority",
      "type": "simple_property",
      "context": {
        "fileExtensions": [".req", ".fun"],
        "parentContexts": ["requirement", "function"],
        "allowedDepth": [1, 2, 3]
      },
      "validation": {
        "required": false,
        "valueType": "enum",
        "enumValues": ["critical", "high", "medium", "low"]
      },
      "displayName": "Priority Level",
      "description": "Specifies the priority level for requirements and functions",
      "examples": ["priority critical", "priority high"],
      "definedBy": "my-project-keywords",
      "version": "1.0.0",
      "tags": ["priority", "classification"]
    }
  ]
}
```

### **3. Reload Extensions**
Extensions are automatically loaded on workspace startup, or manually reload:

```typescript
await validationPipeline.reloadKeywordExtensions();
```

---

**🎉 This architecture provides unlimited extensibility while maintaining strict validation and excellent developer experience!** 