import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';

/**
 * Variant Model Language (.vml) Validation Rule
 * Validates .vml files with feature selections and variant configurations
 * Implements cross-file validation with imported .fml files
 */
export class VmlValidationRule implements IValidationRule {
    readonly id = 'vml-validation';
    readonly name = 'Variant Model Validation';
    readonly description = 'Validates .vml files for variant model syntax, feature selections, and cross-file constraints';
    readonly category = 'semantic';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.SEMANTIC_VALIDATION;
    readonly fileTypes = ['vml'];
    readonly enabled = true;
    readonly priority = 100;
    readonly configuration: any = {};

    private readonly validVmlKeywords = [
        'def', 'variantmodel', 'use', 'featureset', 'feature', 'name', 'description', 'owner', 
        'tags', 'safetylevel', 'variant', 'binding', 'constraint', 'expression', 'config'
    ];

    private readonly validVariabilityTypes = ['mandatory', 'optional', 'alternative', 'or'];
    private readonly validSelectionTypes = ['selected']; // NO 'deselected'
    private readonly validAsilLevels = ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'];

    supportsContext(context: IRuleValidationContext): boolean {
        const fileName = context.document.fileName.toLowerCase();
        return fileName.endsWith('.vml');
    }

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = context.document.getText();
        const lines = text.split('\n');

        console.log('🔍 VML Validation Rule: Validating', context.document.fileName);

        let hasVariantModelDef = false;
        const importedFeaturesets = new Map<string, any>(); // featureset name -> parsed data
        const vmlFeatureSelections = new Map<string, { variability: string, selected: boolean, line: number, indentLevel: number }>();
        
        // Track siblings per parent context, not globally per level
        const parentStack: Array<{ name: string, level: number }> = [];
        const siblingGroupsByParent: { [parentContext: string]: string } = {};
        
        // FIRST PASS: Collect imports and parse imported .fml files
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('//')) continue;

            // Check for 'def variantmodel' at the start
            if (line.startsWith('def variantmodel') && !hasVariantModelDef) {
                hasVariantModelDef = true;
                
                // 🔧 EXTRACT AND REGISTER VARIANTMODEL: Extract variantmodel name and register as parent symbol
                const variantModelMatch = line.match(/def\s+variantmodel\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
                if (variantModelMatch && context.symbolManager) {
                    const variantModelName = variantModelMatch[1];
                    const variantModelSymbol = {
                        id: `${variantModelName}_variantmodel`,
                        name: variantModelName,
                        type: 'variantmodel' as any,
                        kind: 1, // SymbolKind.File
                        fileUri: context.document.uri.toString(),
                        range: new vscode.Range(i, 0, i, line.length),
                        selectionRange: new vscode.Range(i, line.indexOf(variantModelName), i, line.indexOf(variantModelName) + variantModelName.length),
                        detail: `Variant model definition`,
                        parentSymbol: undefined, // This IS a parent symbol
                        childSymbols: [],
                        isVisible: true,
                        metadata: { 
                            definedIn: context.document.uri.toString(),
                            line: i
                        }
                    };
                    
                    // Store the symbol so ImportManager can find it
                    context.symbolManager.registerSymbol(variantModelSymbol);
                    console.log(`✅ Registered variantmodel parent symbol: ${variantModelName} in SymbolManager`);
                }
                continue;
            }

            // Extract and parse imported featuresets
            const useMatch = line.match(/use\s+featureset\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (useMatch) {
                const featuresetName = useMatch[1];
                const fmlData = await this.parseFmlFile(context.document.fileName, featuresetName);
                if (fmlData) {
                    importedFeaturesets.set(featuresetName, fmlData);
                    console.log(`🔍 Parsed imported featureset: ${featuresetName} (${Object.keys(fmlData.features).length} features)`);
                    
                    // 🔧 REGISTER PARENT SYMBOL: Register the featureset as a parent symbol in SymbolManager
                    if (context.symbolManager) {
                        const fmlPath = require('path').join(require('path').dirname(context.document.fileName), `${featuresetName}.fml`);
                        const parentSymbol = {
                            id: `${featuresetName}_featureset`,
                            name: featuresetName,
                            type: 'featureset' as any,
                            kind: 1, // SymbolKind.File
                            fileUri: vscode.Uri.file(fmlPath).toString(),
                            range: new vscode.Range(0, 0, 0, featuresetName.length),
                            selectionRange: new vscode.Range(0, 0, 0, featuresetName.length),
                            detail: `Featureset with ${Object.keys(fmlData.features).length} features`,
                            parentSymbol: undefined, // This IS a parent symbol
                            childSymbols: Object.keys(fmlData.features),
                            isVisible: true,
                            metadata: { 
                                featureCount: Object.keys(fmlData.features).length,
                                importedIn: [context.document.uri.toString()]
                            }
                        };
                        
                        // Store the symbol so ImportManager can find it
                        context.symbolManager.registerSymbol(parentSymbol);
                        console.log(`✅ Registered parent symbol: ${featuresetName} in SymbolManager`);
                        
                        // 🔧 REGISTER CHILD FEATURES: Register each individual feature as a child symbol
                        let childCount = 0;
                        for (const [featureName, featureData] of Object.entries(fmlData.features)) {
                            const feature = featureData as any; // Cast to bypass type checking
                            const childSymbol = {
                                id: `${featureName}_feature`,
                                name: featureName,
                                type: 'feature' as any,
                                kind: 2, // SymbolKind.Method (for child symbols)
                                fileUri: vscode.Uri.file(fmlPath).toString(),
                                range: new vscode.Range(feature.line || 0, 0, feature.line || 0, featureName.length),
                                selectionRange: new vscode.Range(feature.line || 0, 0, feature.line || 0, featureName.length),
                                detail: `Feature: ${feature.variability}`,
                                parentSymbol: parentSymbol.id, // ✅ Link to parent symbol
                                childSymbols: [],
                                isVisible: true,
                                metadata: { 
                                    variability: feature.variability,
                                    parentFeatureset: featuresetName,
                                    line: feature.line || 0
                                }
                            };
                            
                            // Register the child feature
                            context.symbolManager.registerSymbol(childSymbol);
                            childCount++;
                        }
                        console.log(`✅ Registered ${childCount} child features for parent ${featuresetName}`);
                    }
                } else {
                    const range = new vscode.Range(i, line.indexOf(featuresetName), i, line.indexOf(featuresetName) + featuresetName.length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Cannot find or parse featureset '${featuresetName}.fml'`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }

        // SECOND PASS: Collect VML feature selections
        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i]; // Keep original line for indentation calculation
            const trimmedLine = originalLine.trim();
            if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('use ')) continue;

            // Extract feature selections with indentation
            const featureMatch = trimmedLine.match(/^feature\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(mandatory|optional|alternative|or)(?:\s+(selected))?\s*$/);
            if (featureMatch) {
                const featureName = featureMatch[1];
                const variabilityType = featureMatch[2];
                const hasSelected = !!featureMatch[3];
                // FIXED: Use original untrimmed line for indentation calculation
                const actualSpaces = originalLine.length - originalLine.trimStart().length;
                const indentLevel = Math.floor((actualSpaces - 2) / 2); // Features start at 2 spaces (level 0)

                vmlFeatureSelections.set(featureName, {
                    variability: variabilityType,
                    selected: hasSelected,
                    line: i,
                    indentLevel: indentLevel
                });

                console.log(`🔍 VML Feature: '${featureName}' - level: ${indentLevel}, variability: ${variabilityType}, selected: ${hasSelected}`);
            }
        }

        console.log(`🔍 VML Feature Selections:`, Array.from(vmlFeatureSelections.entries()));

        // THIRD PASS: Full validation
        const vmlParentStack: Array<{ name: string, level: number }> = [];
        const vmlSiblingGroupsByParent: { [parentContext: string]: string } = {};

        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i]; // Keep original line for indentation calculation
            const line = originalLine.trim();
            if (!line || line.startsWith('//')) continue;

            // VALIDATE USE STATEMENTS
            if (line.startsWith('use ')) {
                const useMatch = line.match(/^use\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
                if (!useMatch) {
                    const range = new vscode.Range(i, 0, i, line.length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Invalid use statement syntax. Expected: use <parentType> <parentName>`,
                        vscode.DiagnosticSeverity.Error
                    ));
                } else {
                    const parentType = useMatch[1];
                    if (parentType !== 'featureset') {
                        const range = new vscode.Range(i, line.indexOf(parentType), i, line.indexOf(parentType) + parentType.length);
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `Invalid parent type '${parentType}'. VML files can only import 'featureset'`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                }
                continue;
            }

            // VALIDATE FEATURE SELECTIONS
            const featureSelectionMatch = line.match(/^feature\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(mandatory|optional|alternative|or)(?:\s+(selected))?\s*$/);
            if (featureSelectionMatch) {
                const featureName = featureSelectionMatch[1];
                const variabilityType = featureSelectionMatch[2];
                const hasSelected = !!featureSelectionMatch[3];
                
                // FIXED: Use original untrimmed line for indentation calculation
                const actualSpaces = originalLine.length - originalLine.trimStart().length;
                const indentLevel = Math.floor((actualSpaces - 2) / 2);

                // PARENT CONTEXT TRACKING FOR VML
                while (vmlParentStack.length > 0 && vmlParentStack[vmlParentStack.length - 1].level >= indentLevel) {
                    vmlParentStack.pop();
                }

                const parentContext = vmlParentStack.length > 0 ? vmlParentStack[vmlParentStack.length - 1].name : 'root';
                const siblingGroupKey = `${parentContext}:${indentLevel}`;

                console.log(`🔍 VML PARENT CONTEXT: Feature '${featureName}' at level ${indentLevel} under parent '${parentContext}'`);

                // VALIDATE FEATURE EXISTS IN IMPORTED .FML
                let featureExists = false;
                let fmlFeatureData = null;
                for (const [featuresetName, fmlData] of importedFeaturesets) {
                    if (fmlData.features[featureName]) {
                        featureExists = true;
                        fmlFeatureData = fmlData.features[featureName];
                        break;
                    }
                }

                if (!featureExists) {
                    const range = new vscode.Range(i, line.indexOf(featureName), i, line.indexOf(featureName) + featureName.length);
                    const availableFeatures = Array.from(importedFeaturesets.values())
                        .flatMap(fmlData => Object.keys(fmlData.features));
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Feature '${featureName}' not found in imported featureset(s). Available: ${availableFeatures.join(', ')}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                    continue;
                }

                // VALIDATE VARIABILITY TYPE MATCHES .FML
                if (fmlFeatureData && fmlFeatureData.variability !== variabilityType) {
                    const range = new vscode.Range(i, line.indexOf(variabilityType), i, line.indexOf(variabilityType) + variabilityType.length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Feature '${featureName}' has variability '${fmlFeatureData.variability}' in .fml, but '${variabilityType}' in .vml`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }

                // VALIDATE SIBLING VARIABILITY GROUP CONSISTENCY
                if (vmlSiblingGroupsByParent[siblingGroupKey]) {
                    const firstSiblingType = vmlSiblingGroupsByParent[siblingGroupKey];
                    let isValidCombination = false;
                    let expectedGroup = '';

                    console.log(`🔍 VML SIBLING CHECK: Level ${indentLevel} under '${parentContext}' - First sibling: '${firstSiblingType}', Current: '${variabilityType}'`);

                    // VALIDATE VARIABILITY GROUP CONSISTENCY
                    if ((firstSiblingType === 'mandatory' || firstSiblingType === 'optional') &&
                        (variabilityType === 'mandatory' || variabilityType === 'optional')) {
                        isValidCombination = true;
                    } else if (firstSiblingType === 'mandatory' || firstSiblingType === 'optional') {
                        expectedGroup = 'mandatory/optional group';
                    }
                    else if (firstSiblingType === 'or' && variabilityType === 'or') {
                        isValidCombination = true;
                    } else if (firstSiblingType === 'or') {
                        expectedGroup = 'or group';
                    }
                    else if (firstSiblingType === 'alternative' && variabilityType === 'alternative') {
                        isValidCombination = true;
                    } else if (firstSiblingType === 'alternative') {
                        expectedGroup = 'alternative group';
                    }

                    if (!isValidCombination) {
                        const range = new vscode.Range(i, line.indexOf(variabilityType), i, line.indexOf(variabilityType) + variabilityType.length);
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `VML Variability group mismatch: All siblings under '${parentContext}' must be in the same group. First sibling '${firstSiblingType}' requires ${expectedGroup}, but found '${variabilityType}'`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                } else {
                    // First feature at this level under this parent
                    vmlSiblingGroupsByParent[siblingGroupKey] = variabilityType;
                    console.log(`🔍 VML FIRST SIBLING: Level ${indentLevel} under '${parentContext}' - Set first sibling to '${variabilityType}'`);
                }

                // VALIDATE SELECTION RULES
                if (variabilityType === 'mandatory' && !hasSelected) {
                    const range = new vscode.Range(i, line.indexOf(variabilityType), i, line.length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Mandatory feature '${featureName}' must be marked as 'selected'`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }

                // Add current feature to parent stack
                vmlParentStack.push({ name: featureName, level: indentLevel });

                continue;
            }

            // Remove quoted strings from keyword validation
            let lineToCheck = line;
            lineToCheck = lineToCheck.replace(/"[^"]*"/g, '');
            lineToCheck = lineToCheck.replace(/'[^']*'/g, '');

            // VALIDATE KEYWORDS
            const words = lineToCheck.split(/\s+/);
            for (const word of words) {
                const cleanWord = word.replace(/[,]/g, '').trim();
                if (!cleanWord || cleanWord.length < 3) continue;

                if (cleanWord.match(/^[a-z][a-z]*$/) && cleanWord.length > 2) {
                    if (!this.validVmlKeywords.includes(cleanWord) && 
                        !this.validVariabilityTypes.includes(cleanWord) &&
                        !this.validSelectionTypes.includes(cleanWord) &&
                        !this.validAsilLevels.includes(cleanWord.toUpperCase()) &&
                        !cleanWord.match(/^[A-Z]/)) {
                        
                        const wordIndex = line.indexOf(cleanWord);
                        if (wordIndex !== -1) {
                            const range = new vscode.Range(i, wordIndex, i, wordIndex + cleanWord.length);
                            diagnostics.push(new vscode.Diagnostic(
                                range,
                                `Invalid .vml keyword '${cleanWord}'. Valid keywords: ${this.validVmlKeywords.concat(this.validVariabilityTypes, this.validSelectionTypes).join(', ')}`,
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                    }
                }
            }

            // Validate ASIL levels
            if (lineToCheck.includes('safetylevel')) {
                const asilMatch = lineToCheck.match(/safetylevel\s+([A-Z-]+)/);
                if (asilMatch && !this.validAsilLevels.includes(asilMatch[1])) {
                    const range = new vscode.Range(i, line.indexOf(asilMatch[1]), i, line.indexOf(asilMatch[1]) + asilMatch[1].length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Invalid ASIL level '${asilMatch[1]}'. Valid levels: ${this.validAsilLevels.join(', ')}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }

        // VALIDATE SIBLING SELECTION RULES
        this.validateSiblingSelectionRules(vmlFeatureSelections, diagnostics);

        // VALIDATE REQUIRES/EXCLUDES CONSTRAINTS
        this.validateRequiresExcludesConstraints(vmlFeatureSelections, importedFeaturesets, diagnostics);

        // Check if file has required 'def variantmodel'
        if (!hasVariantModelDef) {
            const range = new vscode.Range(0, 0, 0, 0);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `.vml file must start with 'def variantmodel <identifier>'`,
                vscode.DiagnosticSeverity.Error
            ));
        }

        const endTime = performance.now();
        
        return {
            isValid: diagnostics.length === 0,
            diagnostics,
            errors: [],
            warnings: [],
            performance: {
                executionTime: endTime - startTime,
                memoryUsage: 0,
                cacheHitRate: 0
            },
            metadata: {
                ruleName: this.name,
                ruleVersion: '1.0.0',
                validatedElements: lines.length,
                skippedElements: 0
            }
        };
    }

    /**
     * Parse .fml file to extract feature definitions, variability types, and constraints
     */
    private async parseFmlFile(vmlFilePath: string, featuresetName: string): Promise<any | null> {
        try {
            const vmlDir = path.dirname(vmlFilePath);
            const fmlPath = path.join(vmlDir, `${featuresetName}.fml`);
            
            if (!fs.existsSync(fmlPath)) {
                console.warn(`🔍 FML file not found: ${fmlPath}`);
                return null;
            }

            const fmlContent = fs.readFileSync(fmlPath, 'utf8');
            const lines = fmlContent.split('\n');
            
            const features: any = {};
            let currentFeature: string | null = null;
            let currentIndentLevel = -1;

            for (let i = 0; i < lines.length; i++) {
                const originalLine = lines[i];
                const trimmedLine = originalLine.trim();
                if (!trimmedLine || trimmedLine.startsWith('//')) continue;

                const actualSpaces = originalLine.length - originalLine.trimStart().length;
                const indentLevel = Math.floor((actualSpaces - 2) / 2);

                // Parse feature definitions
                const featureMatch = trimmedLine.match(/def\s+feature\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(mandatory|optional|alternative|or)/);
                if (featureMatch) {
                    const [, featureName, variability] = featureMatch;
                    features[featureName] = { 
                        variability, 
                        requires: [], 
                        excludes: [],
                        line: i,
                        indentLevel: indentLevel
                    };
                    currentFeature = featureName;
                    currentIndentLevel = indentLevel;
                    console.log(`🔍 FML parsed feature: ${featureName} (${variability}) at level ${indentLevel}`);
                    continue;
                }

                // Parse requires/excludes as feature properties (must be under a feature)
                if (currentFeature && indentLevel > currentIndentLevel) {
                    const requiresMatch = trimmedLine.match(/requires\s+feature\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
                    if (requiresMatch) {
                        const targetFeature = requiresMatch[1];
                        features[currentFeature].requires.push(targetFeature);
                        console.log(`🔍 FML parsed requires: ${currentFeature} requires ${targetFeature}`);
                        continue;
                    }

                    const excludesMatch = trimmedLine.match(/excludes\s+feature\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
                    if (excludesMatch) {
                        const targetFeature = excludesMatch[1];
                        features[currentFeature].excludes.push(targetFeature);
                        console.log(`🔍 FML parsed excludes: ${currentFeature} excludes ${targetFeature}`);
                        continue;
                    }
                }

                // Reset current feature if we're back to a higher level
                if (currentFeature && indentLevel <= currentIndentLevel) {
                    currentFeature = null;
                    currentIndentLevel = -1;
                }
            }

            const totalRequires = Object.values(features).reduce((sum: number, f: any) => sum + f.requires.length, 0);
            const totalExcludes = Object.values(features).reduce((sum: number, f: any) => sum + f.excludes.length, 0);
            
            console.log(`🔍 Parsed ${fmlPath}: ${Object.keys(features).length} features, ${totalRequires} requires, ${totalExcludes} excludes`);
            return { features };

        } catch (error) {
            console.error(`🔍 Error parsing FML file ${featuresetName}.fml:`, error);
            return null;
        }
    }

    /**
     * Validate sibling selection rules based on variability types and parent context
     */
    private validateSiblingSelectionRules(
        selections: Map<string, { variability: string, selected: boolean, line: number, indentLevel: number }>,
        diagnostics: vscode.Diagnostic[]
    ): void {
        // Group features by parent context and indentation level
        const siblingGroupsByParentAndLevel = new Map<string, Array<{ name: string, data: any }>>();
        
        // Build parent stack to determine contexts
        const parentStack: Array<{ name: string, level: number }> = [];
        const sortedFeatures = Array.from(selections.entries()).sort((a, b) => a[1].line - b[1].line);
        
        for (const [featureName, data] of sortedFeatures) {
            // Update parent stack based on indentation
            while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= data.indentLevel) {
                parentStack.pop();
            }
            
            const parentContext = parentStack.length > 0 ? parentStack[parentStack.length - 1].name : 'root';
            const siblingGroupKey = `${parentContext}:${data.indentLevel}`;
            
            if (!siblingGroupsByParentAndLevel.has(siblingGroupKey)) {
                siblingGroupsByParentAndLevel.set(siblingGroupKey, []);
            }
            siblingGroupsByParentAndLevel.get(siblingGroupKey)!.push({ name: featureName, data });
            
            // Add to parent stack
            parentStack.push({ name: featureName, level: data.indentLevel });
        }

        // Validate each sibling group
        for (const [siblingGroupKey, siblings] of siblingGroupsByParentAndLevel) {
            if (siblings.length < 2) continue; // Need at least 2 siblings for rules

            const selectedSiblings = siblings.filter(s => s.data.selected);
            const variabilityTypes = new Set(siblings.map(s => s.data.variability));
            const [parentContext, level] = siblingGroupKey.split(':');

            console.log(`🔍 VML SELECTION VALIDATION: Group '${siblingGroupKey}' - ${siblings.length} siblings, ${selectedSiblings.length} selected`);

            // VALIDATE VARIABILITY GROUP CONSISTENCY (should already be done, but double-check)
            const hasMandatoryOptional = variabilityTypes.has('mandatory') || variabilityTypes.has('optional');
            const hasOr = variabilityTypes.has('or');
            const hasAlternative = variabilityTypes.has('alternative');
            const groupCount = [hasMandatoryOptional, hasOr, hasAlternative].filter(Boolean).length;

            if (groupCount > 1) {
                // Mixed groups already reported in main validation
                continue;
            }

            // ALTERNATIVE GROUP: Only one can be selected
            if (hasAlternative) {
                if (selectedSiblings.length > 1) {
                    for (const sibling of selectedSiblings.slice(1)) { // All except first
                        const range = new vscode.Range(sibling.data.line, 0, sibling.data.line, 999);
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `Alternative group under '${parentContext}': only one sibling can be selected. '${selectedSiblings[0].name}' is already selected`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                }
            }

            // OR GROUP: At least one must be selected
            if (hasOr) {
                if (selectedSiblings.length === 0) {
                    // Only warn for the first sibling to avoid duplicate warnings
                    const firstSibling = siblings[0];
                    const range = new vscode.Range(firstSibling.data.line, 0, firstSibling.data.line, 999);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `OR group under '${parentContext}': at least one sibling must be selected (${siblings.map(s => s.name).join(', ')})`,
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
                // NO warnings if at least one is selected - that's correct behavior
            }

            // MANDATORY/OPTIONAL GROUP: Individual mandatory features must be selected (already validated above)
            // Optional features can be selected or not
        }
    }

    /**
     * Validate requires/excludes constraints from imported .fml files
     */
    private validateRequiresExcludesConstraints(
        selections: Map<string, { variability: string, selected: boolean, line: number, indentLevel: number }>,
        importedFeaturesets: Map<string, any>,
        diagnostics: vscode.Diagnostic[]
    ): void {
        console.log('🔍 VML: Validating requires/excludes constraints...');

        // Get all selected features
        const selectedFeatures = new Set<string>();
        for (const [featureName, data] of selections) {
            if (data.selected) {
                selectedFeatures.add(featureName);
            }
        }

        console.log(`🔍 VML Selected features: ${Array.from(selectedFeatures).join(', ')}`);

        // Check constraints for each selected feature
        for (const [featureName, selectionData] of selections) {
            if (!selectionData.selected) continue; // Only check selected features

            // Find the feature in imported .fml files
            let fmlFeatureData = null;
            for (const [featuresetName, fmlData] of importedFeaturesets) {
                if (fmlData.features[featureName]) {
                    fmlFeatureData = fmlData.features[featureName];
                    break;
                }
            }

            if (!fmlFeatureData) continue; // Feature not found (already reported elsewhere)

            // VALIDATE REQUIRES CONSTRAINTS
            if (fmlFeatureData.requires && fmlFeatureData.requires.length > 0) {
                for (const requiredFeature of fmlFeatureData.requires) {
                    if (!selectedFeatures.has(requiredFeature)) {
                        const range = new vscode.Range(selectionData.line, 0, selectionData.line, 999);
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `Feature '${featureName}' is selected but requires '${requiredFeature}' which is not selected`,
                            vscode.DiagnosticSeverity.Error
                        ));
                        console.log(`🔍 VML REQUIRES violation: ${featureName} requires ${requiredFeature}`);
                    }
                }
            }

            // VALIDATE EXCLUDES CONSTRAINTS
            if (fmlFeatureData.excludes && fmlFeatureData.excludes.length > 0) {
                for (const excludedFeature of fmlFeatureData.excludes) {
                    if (selectedFeatures.has(excludedFeature)) {
                        const range = new vscode.Range(selectionData.line, 0, selectionData.line, 999);
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `Feature '${featureName}' is selected but excludes '${excludedFeature}' which is also selected`,
                            vscode.DiagnosticSeverity.Error
                        ));
                        console.log(`🔍 VML EXCLUDES violation: ${featureName} excludes ${excludedFeature}`);
                    }
                }
            }
        }
    }
} 