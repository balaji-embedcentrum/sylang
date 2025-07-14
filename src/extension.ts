import * as vscode from 'vscode';
import { SylangCompletionProvider } from './providers/SylangCompletionProvider';
import { SylangFormattingProvider } from './providers/SylangFormattingProvider';
import { SylangDefinitionProvider } from './providers/SylangDefinitionProvider';
import { SylangReferenceProvider } from './providers/SylangReferenceProvider';
import { SylangRenameProvider } from './providers/SylangRenameProvider';
import { ValidationEngine } from './core/ValidationEngine';
import { SymbolManager } from './core/SymbolManager';
import { getLanguageConfig, getAllLanguageIds } from './config/LanguageConfigs';

class SylangExtension {
    private validationEngine: ValidationEngine | undefined;
    private symbolManager: SymbolManager | undefined;

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        const packageJson = require('../package.json');
        console.log(`[Sylang] ===== SYLANG EXTENSION VERSION ${packageJson.version} ACTIVATING =====`);
        console.log('Sylang Language Support is activating...');

        try {
            // Initialize core services
            this.symbolManager = new SymbolManager();
            this.validationEngine = new ValidationEngine(this.symbolManager);

            // Build workspace index for import resolution
            console.log('[Sylang] Building workspace index for import resolution...');
            await this.symbolManager.buildWorkspaceIndex();
            console.log('[Sylang] Workspace index building completed');

            // Parse symbols for all currently open Sylang documents
            for (const document of vscode.workspace.textDocuments) {
                if (this.isSylangDocument(document)) {
                    const languageConfig = getLanguageConfig(document.languageId);
                    if (languageConfig) {
                        await this.symbolManager.parseDocument(document, languageConfig);
                    }
                }
            }

            // Register language providers for all Sylang file types
            // Use the actual language IDs from LanguageConfigs to ensure consistency
            const sylangLanguageIds = getAllLanguageIds();

            for (const languageId of sylangLanguageIds) {
                // Get language config for this language ID
                const languageConfig = getLanguageConfig(languageId);
                const keywords = languageConfig ? languageConfig.keywords : [];

                // Completion provider
                context.subscriptions.push(
                    vscode.languages.registerCompletionItemProvider(
                        { language: languageId },
                        new SylangCompletionProvider(languageId, keywords, this.symbolManager),
                        ' ', ':', '"'
                    )
                );

                // Formatting provider
                context.subscriptions.push(
                    vscode.languages.registerDocumentFormattingEditProvider(
                        { language: languageId },
                        new SylangFormattingProvider()
                    )
                );

                // Definition provider
                context.subscriptions.push(
                    vscode.languages.registerDefinitionProvider(
                        { language: languageId },
                        new SylangDefinitionProvider(this.symbolManager)
                    )
                );

                // Reference provider
                context.subscriptions.push(
                    vscode.languages.registerReferenceProvider(
                        { language: languageId },
                        new SylangReferenceProvider(this.symbolManager)
                    )
                );

                // Rename provider
                context.subscriptions.push(
                    vscode.languages.registerRenameProvider(
                        { language: languageId },
                        new SylangRenameProvider(this.symbolManager)
                    )
                );
            }

            // Register document change listeners for validation
            context.subscriptions.push(
                vscode.workspace.onDidChangeTextDocument(async (event) => {
                    if (this.isSylangDocument(event.document) && this.validationEngine) {
                        console.log(`[Sylang] Document changed: ${event.document.fileName}`);
                        await this.validationEngine.validateDocument(event.document);
                    }
                })
            );

            context.subscriptions.push(
                vscode.workspace.onDidSaveTextDocument(async (document) => {
                    if (this.isSylangDocument(document) && this.validationEngine) {
                        console.log(`[Sylang] Document saved: ${document.fileName}`);
                        await this.validationEngine.validateDocument(document);
                        // Update symbol manager on save
                        if (this.symbolManager) {
                            const languageConfig = getLanguageConfig(document.languageId);
                            if (languageConfig) {
                                await this.symbolManager.parseDocument(document, languageConfig);
                            }
                        }
                    }
                })
            );

            context.subscriptions.push(
                vscode.workspace.onDidOpenTextDocument(async (document) => {
                    if (this.isSylangDocument(document) && this.validationEngine) {
                        console.log(`[Sylang] Document opened: ${document.fileName}`);
                        await this.validationEngine.validateDocument(document);
                    }
                })
            );

            // Validate all currently open Sylang documents
            for (const editor of vscode.window.visibleTextEditors) {
                if (this.isSylangDocument(editor.document) && this.validationEngine) {
                    await this.validationEngine.validateDocument(editor.document);
                }
            }

            // Register commands
            context.subscriptions.push(
                vscode.commands.registerCommand('sylang.validateWorkspace', async () => {
                    if (this.validationEngine) {
                        console.log('[Sylang] Manual workspace validation triggered');
                        await this.validationEngine.validateWorkspace();
                        vscode.window.showInformationMessage('Workspace validation completed.');
                    }
                })
            );

            context.subscriptions.push(
                vscode.commands.registerCommand('sylang.refreshSymbols', async () => {
                    if (this.symbolManager) {
                        console.log('[Sylang] Manual symbol refresh triggered');
                        // Re-parse all open Sylang documents
                        for (const document of vscode.workspace.textDocuments) {
                            if (this.isSylangDocument(document)) {
                                const languageConfig = getLanguageConfig(document.languageId);
                                if (languageConfig) {
                                    await this.symbolManager.parseDocument(document, languageConfig);
                                }
                            }
                        }
                        vscode.window.showInformationMessage('Symbol cache refreshed.');
                    }
                })
            );

            context.subscriptions.push(
                vscode.commands.registerCommand('sylang.createRules', async () => {
                    try {
                        const workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders || workspaceFolders.length === 0) {
                            vscode.window.showErrorMessage('No workspace folder is open. Please open a workspace to create .sylangrules file.');
                            return;
                        }

                        const rootPath = workspaceFolders[0].uri.fsPath;
                        const rulesFilePath = vscode.Uri.file(`${rootPath}/.sylangrules`);
                        
                        // Check if file already exists
                        try {
                            await vscode.workspace.fs.stat(rulesFilePath);
                            const overwrite = await vscode.window.showQuickPick(
                                ['Yes', 'No'], 
                                { placeHolder: '.sylangrules file already exists. Overwrite it?' }
                            );
                            if (overwrite !== 'Yes') {
                                return;
                            }
                        } catch {
                            // File doesn't exist, proceed
                        }

                        // Read the comprehensive rules content
                        const rulesContent = await this.getSylangRulesContent();
                        
                        // Write the file
                        await vscode.workspace.fs.writeFile(rulesFilePath, Buffer.from(rulesContent, 'utf8'));
                        
                        // Show success message and open the file
                        vscode.window.showInformationMessage('✅ .sylangrules file created successfully! Use this as AI context for Sylang code generation.');
                        
                        // Open the file for review
                        const document = await vscode.workspace.openTextDocument(rulesFilePath);
                        await vscode.window.showTextDocument(document);
                        
                    } catch (error) {
                        console.error('[Sylang] Error creating .sylangrules file:', error);
                        vscode.window.showErrorMessage(`Failed to create .sylangrules file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                })
            );

            // Clean up on deactivation
            context.subscriptions.push({
                dispose: () => {
                    if (this.validationEngine) {
                        this.validationEngine.dispose();
                    }
                }
            });

            console.log('Sylang Language Support activated successfully!');

        } catch (error) {
            console.error('Failed to activate Sylang Language Support:', error);
            vscode.window.showErrorMessage(`Failed to activate Sylang extension: ${error}`);
        }
    }

    private isSylangDocument(document: vscode.TextDocument): boolean {
        const languageId = document.languageId;
        console.log(`[Sylang] - Language ID: ${languageId}`);
        console.log(`[Sylang] - Starts with 'sylang-': ${languageId.startsWith('sylang-')}`);
        
        const sylangExtensions = ['.ple', '.fml', '.fun', '.sub', '.cmp', '.req', 
                                 '.haz', '.rsk', '.fsr', '.itm', '.sgl', '.tra', '.thr', '.sgo', 
                                 '.sre', '.ast', '.sec', '.mod', '.prt', '.ckt', '.asm', '.blk', '.tst'];
        const hasSylangExtension = sylangExtensions.some(ext => document.fileName.endsWith(ext));
        console.log(`[Sylang] - Has Sylang extension: ${hasSylangExtension}`);
        
        const result = languageId.startsWith('sylang-') || hasSylangExtension;
        console.log(`[Sylang] - Result: ${result}`);
        
        return result;
    }

    private async getSylangRulesContent(): Promise<string> {
        // Read the comprehensive rules file from the extension
        const extensionPath = vscode.extensions.getExtension('balaji-embedcentrum.sylang')?.extensionPath;
        if (!extensionPath) {
            throw new Error('Unable to locate Sylang extension path');
        }

        const rulesFilePath = vscode.Uri.file(`${extensionPath}/.sylangrules`);
        try {
            const rulesFileContent = await vscode.workspace.fs.readFile(rulesFilePath);
            return Buffer.from(rulesFileContent).toString('utf8');
        } catch (error) {
            console.log('[Sylang] .sylangrules file not found in extension, using embedded content');
            // Fallback: return embedded content
            return this.getEmbeddedSylangRulesContent();
        }
    }

    private getEmbeddedSylangRulesContent(): string {
        return `# SYLANG LANGUAGE SPECIFICATION
# Complete Grammar and Syntax Rules for AI Code Generation
# Version 1.0.58 - January 2025

## OVERVIEW
Sylang is a family of domain-specific languages for Model Based Systems Engineering (MBSE) in safety-critical industries (Automotive, Aerospace, Medical). This specification covers all 22+ file extensions with complete syntax, validation rules, and examples.

## UNIVERSAL SYNTAX RULES

### 1. INDENTATION
- **CRITICAL**: Exactly 2 spaces per indentation level, NO TABS
- Consistent hierarchy: child elements exactly one level deeper than parent
- NO mixing of tabs and spaces

### 2. COMMENTS
\`\`\`sylang
// Single-line comment
/* Multi-line
   comment */
\`\`\`

### 3. STRING LITERALS
- Always use double quotes: \`"This is a string"\`
- Escape sequences: \`"Line 1\\nLine 2"\`
- Multi-value lists: \`"value1", "value2", "value3"\`

### 4. IDENTIFIERS
- **PascalCase**: Start with uppercase letter (ElectricParkingBrakeSystem, TestCase_001)
- **ALL_CAPS**: For step IDs (STEP_001, STEP_002)
- **Valid characters**: Letters, numbers, underscores
- **Pattern**: \`^[A-Z][A-Za-z0-9_]*$\`

### 5. SAFETY LEVELS
- **Unquoted keywords**: \`ASIL-A\`, \`ASIL-B\`, \`ASIL-C\`, \`ASIL-D\`, \`QM\`
- **Simplified format**: \`A\`, \`B\`, \`C\`, \`D\`, \`QM\`

### 6. IMPORTS (ALL FILES)
\`\`\`sylang
use productline MyProductLine
use featureset MyFeatures  
use functiongroup MyFunctions
use requirements MyRequirements
use safetygoals MySafetyGoals
\`\`\`

### 7. CORE PROPERTIES (ALL DEFINITIONS)
\`\`\`sylang
name "Human-readable display name"
description "Detailed description of purpose and scope"
owner "Responsible team or person"
tags "tag1", "tag2", "tag3"
safetylevel ASIL-C
\`\`\`

## FILE EXTENSIONS AND SPECIFICATIONS

### 1. PRODUCT LINE ENGINEERING (.ple)

**Purpose**: Define product line architecture and metadata
**Top-level keyword**: \`productline\`
**File limit**: ONE per workspace

**Complete Syntax**:
\`\`\`sylang
productline ProductLineName
  name "Product Line Display Name"
  description "Product line purpose and scope"
  owner "Systems Engineering Team"
  version "1.0.0"
  domain "automotive", "safety-critical"
  compliance "ISO 26262", "ASPICE", "DO-178C"
  firstrelease "2025-01-01"
  tags "product", "safety", "automotive"
  safetylevel ASIL-D
  region "Global", "Europe", "North America"
\`\`\`

**Required Properties**: name, description, owner, domain, compliance, firstrelease, safetylevel
**Property Order**: name → description → owner → domain → compliance → firstrelease → tags → safetylevel → region
**Validation**: Single productline per file, valid date format (YYYY-MM-DD), valid safety levels

### 2. FEATURE MODELING (.fml)

**Purpose**: Define feature models and variability
**Top-level keyword**: \`featureset\`
**File limit**: ONE per workspace

**Complete Syntax**:
\`\`\`sylang
featureset FeatureSetName
  name "Feature Set Display Name"
  description "Feature model description"
  owner "Product Management"
  tags "features", "variability"
  safetylevel ASIL-C

  def feature RootFeature mandatory
    name "Root Feature"
    description "Top-level feature"
    owner "Systems Engineering"
    tags "root", "mandatory"
    safetylevel ASIL-C

    def feature SubFeature1 optional
      name "Optional Sub-Feature"
      description "Optional feature description"
      owner "Feature Team"
      tags "optional"
      safetylevel ASIL-B
\`\`\`

**Variability Types**:
- \`mandatory\`: Required feature (must be included)
- \`optional\`: Optional feature (may be included)
- \`alternative\`: Exactly one from group must be selected
- \`or\`: One or more from group can be selected

### 3. FUNCTION DEFINITIONS (.fun)

**Purpose**: Define system functions and their relationships
**Top-level keyword**: \`functiongroup\`
**File limit**: ONE per workspace

**Complete Syntax**:
\`\`\`sylang
use featureset MyFeatures

functiongroup FunctionGroupName
  name "Function Group Display Name"
  description "Function group purpose"
  owner "Systems Engineering"
  tags "functions", "system"
  safetylevel ASIL-C

  def function CoreFunction
    name "Core System Function"
    description "Primary system function"
    owner "Development Team"
    tags "core", "critical"
    safetylevel ASIL-D
    category "control"
    enables feature FeatureA, FeatureB
    partof subsystem
    allocatedto ComponentName
\`\`\`

**Required Properties**: name, description, owner, enables feature
**Cross-references**: Must reference valid features (requires use featureset)
**Categories**: control, safety, diagnostic, communication, user-interface

### 4. TEST CASE FILES (.tst)

**Purpose**: Test case specifications and execution
**Top-level keyword**: \`testsuite\`

**Complete Syntax**:
\`\`\`sylang
use functiongroup MyFunctions
use requirements MyRequirements
use safetygoals MySafetyGoals

def testsuite TestSuiteName
  name "Test Suite Display Name"
  description "Test suite purpose and scope"
  owner "Test Team"
  tags "integration", "safety", "validation"
  testtype integration
  asil C
  coverage mcdc
  method hil
  
  def testcase TC_001
    name "Test Case Name"
    description "Test case objective"
    priority critical
    asil C
    method hil
    verifies requirement FSR_001, FSR_002
    exercises FunctionA, FunctionB
    
    preconditions
      "System initialized and operational"
      "Test environment configured"
      "All prerequisites met"
      
    teststeps
      step STEP_001 "Initialize test setup"
      step STEP_002 "Execute test scenario"
      step STEP_003 "Verify expected behavior"
      step STEP_004 "Clean up test environment"
      
    expectedresult "System responds within specification limits"
    testresult pass
    actualresult "Test executed successfully with expected results"
    executiontime "2023-12-15T10:30:00Z"
\`\`\`

**Test Types**: unit, integration, system, acceptance, regression, smoke
**Coverage Types**: statement, branch, mcdc, requirement, function
**Test Methods**: manual, automated, hil, sil, mil, pil
**Priority Levels**: critical, high, medium, low
**Test Results**: pass, fail, pending, inconclusive
**Step Format**: \`step STEP_ID "description"\` (ID in ALL_CAPS)

### 5. SAFETY GOALS (.sgl)

**Complete Syntax**:
\`\`\`sylang
use productline MyProductLine
use functiongroup MyFunctions

safetygoals SafetyGoalsName
  name "Safety Goals Collection"
  description "System safety goals"
  owner "Safety Engineering"
  productline MyProductLine
  functiongroup MyFunctions
  tags "safety", "goals"
  
  def goal SG_001
    name "Prevent Unintended Activation"
    description "System shall not activate without explicit user command"
    owner "Safety Team"
    tags "activation", "safety"
    safetylevel ASIL-C
    allocatedto ComponentA, ComponentB
    derivedfrom HighLevelRequirement
    
    def measure SM_001
      name "Safety Measure 001"
      description "Implement redundant activation confirmation"
      enabledby function SafetyFunction
      
    def criterion VC_001
      name "Verification Criterion 001"
      description "Test unintended activation scenarios"
      method "Hardware-in-the-loop testing"
      coverage "All operational scenarios"
\`\`\`

### 6. HAZARD ANALYSIS (.haz)

**Complete Syntax**:
\`\`\`sylang
use productline MyProductLine
use functiongroup MyFunctions

hazardidentification HazardAnalysisName
  name "System Hazard Analysis"
  description "Comprehensive hazard identification"
  owner "Safety Engineering"
  methodology "FMEA", "HAZOP", "STPA"
  productline MyProductLine
  functiongroup MyFunctions
  
  def hazard H_001
    name "Power Supply Failure"
    description "Loss of electrical power to critical systems"
    category "electrical"
    cause "Component failure, wiring fault, power source loss"
    effect "System shutdown, loss of functionality"
    functions_affected CoreFunction, MonitoringFunction
    context "All operational modes"
    conditions "Normal operation, degraded operation"
    consequences "System unavailable, potential safety risk"
\`\`\`

### 7. BLOCK DIAGRAMS (.blk)

**Complete Syntax**:
\`\`\`sylang
use functiongroup MyFunctions
use featureset MyFeatures

def block system SystemName
  name "System Block Name"
  description "System functionality"
  owner "Systems Team"
  tags "system", "top-level"
  asil C
  contains SubsystemA, SubsystemB
  enables feature FeatureA, FeatureB
  implements FunctionA, FunctionB
  
  port in RequiredPortA, RequiredPortB
  
  def port out ProvidedPort
    name "Provided Port Name"
    description "Port functionality"
    type electrical
    owner "Interface Team"
    asil C
    tags "power", "interface"

def block component ComponentName
  name "Component Block Name"
  description "Component functionality"
  owner "Component Team"
  asil B
  partof SystemName
  
  interfaces
    InterfaceA
    InterfaceB
\`\`\`

**Block Types**: system, subsystem, component, subcomponent, module, submodule, unit, subunit, assembly, subassembly, circuit, part
**Port Types**: electrical, mechanical, data, CAN, Ethernet, hydraulic, pneumatic, optical, thermal, audio, RF, sensor, actuator
**Port Directions**: \`port in\` (required), \`def port out\` (provided)

## VALIDATION RULES

### 1. UNIVERSAL RULES
- All definitions must start with \`def\` keyword
- Unique identifiers across project scope
- Required properties must be present
- Safety levels must be valid (QM, A, B, C, D, ASIL-A, ASIL-B, ASIL-C, ASIL-D)
- Exactly 2 spaces indentation, no tabs
- String values in double quotes

### 2. FILE-SPECIFIC RULES
- One top-level definition per file (.ple, .fml, .fun)
- Cross-file references require import statements
- Identifier naming conventions (PascalCase)
- Property ordering where specified
- Enum value validation

### 3. CROSS-FILE DEPENDENCIES
- \`use\` statements must precede definitions
- Referenced symbols must exist or be imported
- Import-aware validation prevents undefined references
- Circular dependencies not allowed

## BEST PRACTICES

### 1. NAMING CONVENTIONS
- **Files**: descriptive, lowercase with extensions
- **Identifiers**: PascalCase, descriptive names
- **Requirements**: REQ_, FSR_, SG_ prefixes
- **Test Cases**: TC_ prefix with numbers
- **Steps**: STEP_ prefix with zero-padded numbers

### 2. SAFETY COMPLIANCE
- Always specify ASIL levels for safety-critical items
- Maintain traceability from goals to requirements to tests
- Document safety rationale and verification methods
- Use appropriate safety levels for components

### 3. STRUCTURE ORGANIZATION
- Group related items logically
- Use consistent indentation and formatting
- Provide meaningful descriptions
- Maintain clear ownership assignments

### 4. CROSS-REFERENCES
- Import all dependencies explicitly
- Use descriptive identifiers for references
- Maintain bidirectional traceability
- Validate all cross-file references

This specification enables AI to generate complete, validated, and standards-compliant Sylang code across all domains and file types.`;
    }

    public deactivate(): void {
        console.log('Sylang Language Support is deactivating...');
        if (this.validationEngine) {
            this.validationEngine.dispose();
        }
    }
}

const extension = new SylangExtension();

export function activate(context: vscode.ExtensionContext): Promise<void> {
    return extension.activate(context);
}

export function deactivate(): void {
    extension.deactivate();
} 