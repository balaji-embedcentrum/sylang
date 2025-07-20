import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';

/**
 * Feature Model Language (.fml) Validation Rule
 * Validates .fml files with variability type rules and constraints
 */
export class FmlValidationRule implements IValidationRule {
    readonly id = 'fml-validation';
    readonly name = 'Feature Model Validation';
    readonly description = 'Validates .fml files for feature model syntax, variability types, and constraints';
    readonly category = 'semantic';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.SEMANTIC_VALIDATION;
    readonly fileTypes = ['fml'];
    readonly enabled = true;
    readonly priority = 100;
    readonly configuration: any = {};

    private readonly validFmlKeywords = [
        'def', 'featureset', 'feature', 'name', 'description', 'owner', 
        'tags', 'safetylevel', 'requires', 'excludes'
    ];

    private readonly validVariabilityTypes = ['mandatory', 'optional', 'alternative', 'or'];
    private readonly validAsilLevels = ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'];

    supportsContext(context: IRuleValidationContext): boolean {
        const fileName = context.document.fileName.toLowerCase();
        return fileName.endsWith('.fml');
    }

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = context.document.getText();
        const lines = text.split('\n');

        console.log('🔍 FML Validation Rule: Validating', context.document.fileName);

        let constraintsFound = false;
        let hasFeaturesetDef = false;
        let siblingVariabilityTypes: { [level: number]: string } = {};
        
        // Track siblings per parent context, not globally per level
        const parentStack: Array<{ name: string, level: number }> = [];
        const siblingGroupsByParent: { [parentContext: string]: string } = {};
        
        // COLLECT ALL DEFINED FEATURES IN THE FILE
        const definedFeatures = new Set<string>();

        // FIRST PASS: Collect all feature definitions
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('//')) continue;

            // Extract feature definitions
            const featureDefMatch = line.match(/def\s+feature\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (featureDefMatch) {
                const featureName = featureDefMatch[1];
                definedFeatures.add(featureName);
                console.log(`🔍 Found feature definition: ${featureName}`);
            }
        }

        console.log(`🔍 Total features defined: ${Array.from(definedFeatures).join(', ')}`);

        // SECOND PASS: Validate everything including feature property references
        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i]; // Keep original line for indentation calculation
            const line = originalLine.trim();
            if (!line || line.startsWith('//')) continue;

            // Check for 'def featureset' at the start
            if (line.startsWith('def featureset') && !hasFeaturesetDef) {
                hasFeaturesetDef = true;
                
                // 🔧 EXTRACT AND REGISTER FEATURESET: Extract featureset name and register as parent symbol
                const featuresetMatch = line.match(/def\s+featureset\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
                if (featuresetMatch && context.symbolManager) {
                    const featuresetName = featuresetMatch[1];
                    const featuresetSymbol = {
                        id: `${featuresetName}_featureset`,
                        name: featuresetName,
                        type: 'featureset' as any,
                        kind: 1, // SymbolKind.File
                        fileUri: context.document.uri.toString(),
                        range: new vscode.Range(i, 0, i, line.length),
                        selectionRange: new vscode.Range(i, line.indexOf(featuresetName), i, line.indexOf(featuresetName) + featuresetName.length),
                        detail: `Feature set definition`,
                        parentSymbol: undefined, // This IS a parent symbol
                        childSymbols: [],
                        isVisible: true,
                        metadata: { 
                            definedIn: context.document.uri.toString(),
                            line: i
                        }
                    };
                    
                    // Store the symbol so ImportManager can find it
                    context.symbolManager.registerSymbol(featuresetSymbol);
                    console.log(`✅ Registered featureset parent symbol: ${featuresetName} in SymbolManager`);
                }
                continue;
            }

            // Check if constraints keyword appears
            if (line.startsWith('constraints')) {
                constraintsFound = true;
                continue;
            }

            // ERROR: No 'def feature' allowed after constraints
            if (constraintsFound && line.includes('def feature')) {
                const range = new vscode.Range(i, 0, i, line.length);
                diagnostics.push(new vscode.Diagnostic(
                    range,
                    `Error: No 'def feature' allowed after 'constraints' keyword`,
                    vscode.DiagnosticSeverity.Error
                ));
            }

            // VALIDATE REQUIRES/EXCLUDES FEATURE REFERENCES
            const requiresMatch = line.match(/^\s*(requires|excludes)\s+feature\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
            if (requiresMatch) {
                const operation = requiresMatch[1];
                const targetFeature = requiresMatch[2];

                console.log(`🔍 Validating ${operation} feature: ${targetFeature}`);

                // Check if target feature exists
                if (!definedFeatures.has(targetFeature)) {
                    const range = new vscode.Range(i, line.indexOf(targetFeature), i, line.indexOf(targetFeature) + targetFeature.length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Feature '${targetFeature}' is not defined. Available features: ${Array.from(definedFeatures).join(', ')}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }

            // Remove quoted strings from validation
            let lineToCheck = line;
            lineToCheck = lineToCheck.replace(/"[^"]*"/g, '');
            lineToCheck = lineToCheck.replace(/'[^']*'/g, '');

            // VARIABILITY TYPE SIBLING RULES - Fixed Logic
            const featureMatch = lineToCheck.match(/def\s+feature\s+(\w+)\s+(mandatory|optional|alternative|or)/);
            if (featureMatch) {
                // FIXED: Use original untrimmed line for indentation calculation
                const actualSpaces = originalLine.length - originalLine.trimStart().length;
                const indentLevel = Math.floor((actualSpaces - 2) / 2); // Features start at 2 spaces (level 0)
                const variabilityType = featureMatch[2];
                const featureName = featureMatch[1];

                console.log(`🔍 INDENT DEBUG: Feature '${featureName}' - actualSpaces: ${actualSpaces}, indentLevel: ${indentLevel}, variability: ${variabilityType}`);

                // Update parent stack based on indentation
                while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= indentLevel) {
                    parentStack.pop();
                }

                // Determine parent context
                const parentContext = parentStack.length > 0 ? parentStack[parentStack.length - 1].name : 'root';
                const siblingGroupKey = `${parentContext}:${indentLevel}`;

                console.log(`🔍 PARENT CONTEXT: Feature '${featureName}' at level ${indentLevel} under parent '${parentContext}'`);

                if (siblingGroupsByParent[siblingGroupKey]) {
                    const firstSiblingType = siblingGroupsByParent[siblingGroupKey];
                    let isValidCombination = false;
                    let expectedGroup = '';

                    console.log(`🔍 SIBLING CHECK: Level ${indentLevel} under '${parentContext}' - First sibling: '${firstSiblingType}', Current: '${variabilityType}'`);

                    // FIXED RULE: All siblings must be in the SAME variability group
                    // Group 1: mandatory/optional only
                    if ((firstSiblingType === 'mandatory' || firstSiblingType === 'optional') &&
                        (variabilityType === 'mandatory' || variabilityType === 'optional')) {
                        isValidCombination = true;
                    } else if (firstSiblingType === 'mandatory' || firstSiblingType === 'optional') {
                        expectedGroup = 'mandatory/optional group';
                    }

                    // Group 2: OR only
                    else if (firstSiblingType === 'or' && variabilityType === 'or') {
                        isValidCombination = true;
                    } else if (firstSiblingType === 'or') {
                        expectedGroup = 'or group';
                    }

                    // Group 3: alternative only  
                    else if (firstSiblingType === 'alternative' && variabilityType === 'alternative') {
                        isValidCombination = true;
                    } else if (firstSiblingType === 'alternative') {
                        expectedGroup = 'alternative group';
                    }

                    if (!isValidCombination) {
                        const range = new vscode.Range(i, line.indexOf(variabilityType), i, line.indexOf(variabilityType) + variabilityType.length);
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `Variability group mismatch: All siblings under '${parentContext}' must be in the same group. First sibling '${firstSiblingType}' requires ${expectedGroup}, but found '${variabilityType}'`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                } else {
                    // First feature at this level under this parent - record its variability type
                    siblingGroupsByParent[siblingGroupKey] = variabilityType;
                    console.log(`🔍 FIRST SIBLING: Level ${indentLevel} under '${parentContext}' - Set first sibling to '${variabilityType}'`);
                }

                // Add current feature to parent stack
                parentStack.push({ name: featureName, level: indentLevel });
            }

            // Validate keywords
            const words = lineToCheck.split(/\s+/);
            for (const word of words) {
                const cleanWord = word.replace(/[,]/g, '').trim();
                if (!cleanWord || cleanWord.length < 3) continue;

                if (cleanWord.match(/^[a-z][a-z]*$/) && cleanWord.length > 2) {
                    if (!this.validFmlKeywords.includes(cleanWord) && 
                        !this.validVariabilityTypes.includes(cleanWord) &&
                        !this.validAsilLevels.includes(cleanWord.toUpperCase()) &&
                        !cleanWord.match(/^[A-Z]/)) {
                        
                        const wordIndex = line.indexOf(cleanWord);
                        if (wordIndex !== -1) {
                            const range = new vscode.Range(i, wordIndex, i, wordIndex + cleanWord.length);
                            diagnostics.push(new vscode.Diagnostic(
                                range,
                                `Invalid .fml keyword '${cleanWord}'. Valid keywords: ${this.validFmlKeywords.concat(this.validVariabilityTypes).join(', ')}`,
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

        // Check if file has required 'def featureset'
        if (!hasFeaturesetDef) {
            const range = new vscode.Range(0, 0, 0, 0);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `.fml file must start with 'def featureset <identifier>'`,
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
} 