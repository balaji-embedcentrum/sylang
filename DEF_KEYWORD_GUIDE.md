# Sylang `def` Keyword Enhancement Guide

## Overview

The `def` keyword has been added to Sylang to make definitions explicit and enable advanced IDE features like **Go to Definition**, **Find All References**, and **Rename Symbol**.

## Benefits

### 1. **Clear Distinction Between Definitions and References**
- **Before**: Ambiguous parsing - is `EPB_Controller` a new definition or a reference?
- **After**: `def def function EPB_Controller` clearly indicates a definition, while `allocatedto EPB_Controller` is clearly a reference

### 2. **Enhanced IDE Features**
- **Go to Definition**: Ctrl+Click (or Cmd+Click) on any reference to jump to its definition
- **Find All References**: Right-click → "Find All References" to see everywhere a symbol is used
- **Rename Symbol**: F2 to safely rename a definition and update all references
- **Symbol Highlighting**: Hover over a definition to highlight all its references

### 3. **Better Code Navigation**
- Easier to understand code structure
- Faster refactoring and maintenance
- Reduced errors from manual renaming

## New Syntax

### Product Line Files (.ple)
```sylang
def productline ElectricParkingBrakeSystem
  description "A family of electronic parking brake systems..."
  owner "Chassis Team"
  domain "automotive", "safety"
  # ... other properties
```

### Feature Files (.fml)
```sylang
def systemfeatures EPBFeatures
  def feature EPBSystem mandatory
    name "EPB System"
    description "The root feature..."
    
    def feature UserInterface mandatory
      name "User Interface"
      # ... nested features
```

### def function Files (.fun, .fma)
```sylang
def functiongroup EPB_Functions
  description "Electronic Parking Brake System Functions"
```

## Migration Guide

### Automatic Migration
The extension will automatically detect and suggest adding `def` keywords to existing files.

### Manual Migration Steps
1. **Product Line Files**: Add `def` before `productline`
2. **Feature Files**: Add `def` before `systemfeatures` and each `feature`
3. **def function Files**: Add `def` before `functiongroup` and each `function`

### Example Migration
**Before:**
```sylang
productline MySystem
  description "My system"

systemfeatures MyFeatures
  feature RootFeature mandatory
    name "Root Feature"
```

**After:**
```sylang
def productline MySystem
  description "My system"

def systemfeatures MyFeatures
  def feature RootFeature mandatory
    name "Root Feature"
```

## IDE Features

### Go to Definition
- **Shortcut**: Ctrl+Click (Windows/Linux) or Cmd+Click (Mac)
- **Action**: Jump from any reference to its definition
- **Example**: Click on `EPB_Controller` in `allocatedto EPB_Controller` to go to its definition

### Find All References
- **Shortcut**: Shift+F12 or Right-click → "Find All References"
- **Action**: Show all places where a symbol is used
- **Example**: Find all references to `EPBSystem` across the project

### Rename Symbol
- **Shortcut**: F2
- **Action**: Rename a definition and update all references
- **Example**: Rename `EPBSystem` to `ElectricParkingBrakeSystem` and update all references

### Symbol Highlighting
- **Action**: Hover over a definition to highlight all its references
- **Visual**: All references are highlighted in the editor

## Technical Implementation

### Symbol Manager
- **File**: `src/core/SymbolManager.ts`
- **Purpose**: Tracks all definitions and references across the workspace
- **Features**: 
  - Real-time parsing of documents
  - Cross-file symbol resolution
  - Incremental updates on document changes

### Language Providers
- **Definition Provider**: `src/providers/SylangDefinitionProvider.ts`
- **Reference Provider**: `src/providers/SylangReferenceProvider.ts`
- **Rename Provider**: `src/providers/SylangRenameProvider.ts`

### Syntax Highlighting
- **File**: `syntaxes/sylang-*.tmGrammar.json`
- **Feature**: `def` keyword is highlighted as a special definition keyword

## Validation Rules

### New Validation Rules
- **def-keyword**: Ensures definitions use the `def` keyword
- **definition-consistency**: Checks that all definitions are properly marked
- **reference-validity**: Validates that references point to existing definitions

### Error Messages
- **Missing def**: "Definition should start with 'def' keyword"
- **Invalid reference**: "Reference to undefined symbol"
- **Duplicate definition**: "Symbol already defined"

## Performance Considerations

### Caching
- Symbol information is cached per document
- Incremental updates on document changes
- Workspace-wide symbol index for cross-file features

### Memory Usage
- Symbol data is lightweight (name, location, type)
- Automatic cleanup when documents are closed
- Efficient storage using Maps and Sets

## Future Enhancements

### Planned Features
1. **Symbol Browser**: Tree view of all definitions in the workspace
2. **Call Hierarchy**: Show what calls a def function and what it calls
3. **Type Checking**: Validate that references match expected types
4. **Import/Export**: Support for importing symbols from other files

### Advanced Features
1. **Symbol Search**: Global search for symbols by name or type
2. **Dependency Graph**: Visual representation of symbol dependencies
3. **Refactoring Tools**: Extract method, inline symbol, etc.
4. **Code Generation**: Generate code from symbol definitions

## Troubleshooting

### Common Issues
1. **Symbols not found**: Ensure the document is saved and parsed
2. **Slow performance**: Check for large files or many open documents
3. **Incorrect references**: Verify symbol names match exactly

### Debug Information
- Enable "Sylang: Debug Mode" in settings
- Check Output panel for symbol parsing logs
- Use Developer Tools to inspect symbol data

## Conclusion

The `def` keyword enhancement significantly improves the developer experience in Sylang by providing:
- **Clarity**: Clear distinction between definitions and references
- **Navigation**: Powerful code navigation features
- **Refactoring**: Safe and efficient refactoring tools
- **Maintainability**: Easier code maintenance and understanding

This enhancement makes Sylang more professional and aligns it with modern IDE expectations while maintaining backward compatibility. 