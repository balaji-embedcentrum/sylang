# Sylang Language Support for VSCode

A comprehensive VSCode extension providing language support for **Sylang** - a domain-specific language for Product Line Engineering in automotive systems.

## 🚀 Features

### ✅ **Multi-File Type Support**
- **Product Lines** (`.ple`) - Define product families and variants
- **Functions** (`.fun`) - System function definitions
- **Features** (`.fml`) - Feature modeling with variability
- **Safety** (`.itm`, `.sgl`, `.haz`, `.rsk`, `.fsr`) - Safety analysis and requirements
- **Security** (`.tra`, `.thr`, `.sgo`, `.sre`, `.ast`, `.sec`) - Security analysis and requirements

### ✅ **Language Server Protocol (LSP)**
- Real-time syntax validation
- Intelligent auto-completion
- Hover documentation
- Error diagnostics

### ✅ **Syntax Highlighting**
- Keywords highlighting (`productline`, `function`, `feature`, etc.)
- Safety levels (`ASIL-A`, `ASIL-B`, `ASIL-C`, `ASIL-D`, `QM`)
- Variability types (`mandatory`, `optional`, `alternative`, `or`)
- String literals and comments

### ✅ **IntelliSense & Auto-completion**
- Context-aware suggestions
- Code snippets for common patterns
- Safety level suggestions
- Property auto-completion

### ✅ **Code Snippets**
- **Product Line templates** - Complete product line definitions
- **Function templates** - System function patterns
- **Feature templates** - Feature model structures
- **Safety templates** - Safety goals, hazards, risks
- **Security templates** - Threats, assets, requirements

### ✅ **Validation & Diagnostics**
- Syntax error detection
- Safety level validation
- Feature variability type checking
- Indentation consistency
- Required field validation

### ✅ **Formatting**
- Automatic code formatting
- Consistent indentation
- Structure beautification

## 📦 Installation

### Method 1: From VSIX (Recommended)
1. Download the `.vsix` file from releases
2. Open VSCode
3. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
4. Type "Extensions: Install from VSIX"
5. Select the downloaded `.vsix` file

### Method 2: Development Installation
```bash
# Clone the repository
git clone <repo-url>
cd sylang-extn

# Install dependencies
npm install

# Compile the extension
npm run compile

# Open in VSCode
code .

# Press F5 to launch Extension Development Host
```

## 🎯 Quick Start

### 1. Create a Product Line File
Create a new file with `.ple` extension:

```sylang
productline ElectricParkingBrakeSystem
  description "A family of electronic parking brake systems for automotive applications"
  owner "Chassis Team", "Braking Systems Group"
  domain "automotive", "safety"
  compliance "ISO 26262", "ASPICE"
  safetylevel ASIL-D
  region "Global", "Europe", "North America"
```

### 2. Define System Functions
Create a `.fun` file:

```sylang
systemfunctions EPBFunctions
    function CoreSystemOrchestrator
        name "Core System Orchestrator"
        description "Main orchestration engine for the entire EPB system"
        owner "Systems Engineering"
        safetylevel ASIL-D
        enables EPBSystem
```

### 3. Model Features
Create a `.fml` file:

```sylang
systemfeatures EPBFeatures
  feature EPBSystem mandatory
    name "EPB System"
    description "The root feature for the entire Electric Parking Brake system"
    safetylevel ASIL-D

    feature UserInterface mandatory
      name "User Interface"
      description "Driver interaction with the EPB system"
      safetylevel ASIL-B

      feature SwitchType alternative
        name "Switch Type"
        description "Physical switch type (exactly one must be chosen)"
        
        feature PushPullSwitch alternative
          name "Push-Pull Switch"
          description "Push to release, pull to apply"
          
        feature RockerSwitch alternative
          name "Rocker Switch"
          description "Rocker-style switch for apply/release"
```

## 🔧 Configuration

The extension can be configured through VSCode settings:

```json
{
  "sylang.lsp.enabled": true,
  "sylang.validation.enabled": true,
  "sylang.treeSitter.enabled": true
}
```

### Available Settings:
- `sylang.lsp.enabled` - Enable/disable Language Server Protocol
- `sylang.validation.enabled` - Enable/disable real-time validation
- `sylang.treeSitter.enabled` - Enable/disable Tree-sitter syntax highlighting

## 📝 Supported File Types

| Extension | Language Type | Description |
|-----------|---------------|-------------|
| `.ple` | Product Line | Product line definitions and variants |
| `.fun` | Functions | System function specifications |
| `.fml` | Features | Feature models with variability |
| `.itm` | Safety Items | Safety item definitions |
| `.sgl` | Safety Goals | Safety goal specifications |
| `.haz` | Hazards | Hazard analysis and assessment |
| `.rsk` | Risk | Risk assessment and analysis |
| `.fsr` | Safety Requirements | Functional safety requirements |
| `.tra` | TARA | Threat Assessment and Risk Analysis |
| `.thr` | Threats | Security threat definitions |
| `.sgo` | Security Goals | Security goal specifications |
| `.sre` | Security Requirements | Security requirements |
| `.ast` | Assets | Security asset definitions |
| `.sec` | Security | General security specifications |

## 🏗️ Modular Architecture

This extension is designed with modularity in mind, making it easy to extend for other DSLs:

### Core Components:
- **Language Providers** - Modular providers for completion, hover, validation
- **LSP Server** - Extensible Language Server Protocol implementation
- **Grammar System** - TextMate grammars for syntax highlighting
- **Snippet System** - Organized snippet collections per language type
- **Validation Engine** - Pluggable validation rules

### Adding New DSLs:
```typescript
// Easy extension for new languages
const newDSLConfig = {
  languageId: 'my-dsl',
  keywords: ['keyword1', 'keyword2'],
  fileExtensions: ['.mydsl'],
  validators: [myCustomValidator]
};

LanguageProviderFactory.registerNewDSL(
  newDSLConfig.languageId,
  newDSLConfig.keywords,
  newDSLConfig.fileExtensions,
  newDSLConfig.validators
);
```

## 🔥 Performance Features

- **Incremental compilation** for fast development
- **Lazy loading** of language features
- **Efficient grammar parsing** with TextMate
- **Optimized LSP communication** with minimal overhead
- **Modular provider system** for scalability

## 🎨 Syntax Highlighting Examples

### Product Line
```sylang
productline MyProductLine  // Keyword highlighting
  description "Product description"  // String highlighting
  safetylevel ASIL-D  // Safety level highlighting
  // Comment highlighting
```

### Features with Variability
```sylang
systemfeatures MyFeatures
  feature RootFeature mandatory    // Variability type highlighting
    feature Option1 alternative    // Alternative highlighting
    feature Option2 alternative    // Alternative highlighting
    feature OptionalFeature optional  // Optional highlighting
```

### Safety Elements
```sylang
hazard BrakingFailure
  severity S3        // Safety parameter highlighting
  probability E4     // Safety parameter highlighting
  safetylevel ASIL-D // Safety level highlighting
```

## 🚧 Commands

The extension provides several commands accessible via the Command Palette (`Ctrl+Shift+P`):

- **Sylang: Validate File** - Manually validate current Sylang file
- **Sylang: Format File** - Format current Sylang file
- **Sylang: Show Language Info** - Display language information

## 🔍 Validation Rules

The extension validates:
- ✅ **Safety Levels** - Must be valid ASIL-A/B/C/D or QM
- ✅ **Feature Variability** - Features must specify variability type
- ✅ **String Formatting** - Proper quotation marks for string values
- ✅ **Indentation** - Consistent 2-space indentation
- ✅ **Required Fields** - Essential properties for each element type
- ✅ **Syntax Structure** - Valid keyword usage and structure

## 📚 Documentation

### Safety Levels (ISO 26262)
- **ASIL-D** - Highest integrity level (life-threatening risks)
- **ASIL-C** - High integrity level (severe risks)
- **ASIL-B** - Medium integrity level (moderate risks) 
- **ASIL-A** - Low integrity level (minor risks)
- **QM** - Quality Management (no ASIL classification)

### Feature Variability Types
- **mandatory** - Must be present in all variants
- **optional** - May or may not be present
- **alternative** - Exactly one from the group must be selected
- **or** - At least one from the group must be selected

## 🛠️ Development

### Prerequisites
- Node.js 16+ 
- VSCode 1.74+
- TypeScript 4.9+

### Build Commands
```bash
npm install          # Install dependencies
npm run compile      # Compile TypeScript
npm run watch        # Watch for changes
npm run package      # Create VSIX package
```

### Testing
```bash
npm test            # Run unit tests
npm run integration # Run integration tests
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines:
1. Follow the modular architecture patterns
2. Add tests for new features
3. Update documentation
4. Ensure compatibility with existing file types

## 📞 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Documentation**: [Wiki](link-to-wiki)
- **Discussions**: [GitHub Discussions](link-to-discussions)

## 🎯 Future Enhancements

- [ ] Tree-sitter grammar implementation
- [ ] Real-time collaboration features
- [ ] Visual feature model diagrams
- [ ] Export to other formats (JSON, XML)
- [ ] Integration with automotive toolchains
- [ ] Advanced refactoring tools
- [ ] Code generation capabilities

---

**Made with ❤️ for the automotive software engineering community** 