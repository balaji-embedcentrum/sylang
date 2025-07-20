import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';

/**
 * Product Line Engineering (.ple) Validation Rule
 * Validates .ple files according to Sylang product line specifications
 */
export class PleValidationRule implements IValidationRule {
    readonly id = 'ple-validation';
    readonly name = 'Product Line Validation';
    readonly description = 'Validates .ple files for product line engineering syntax and semantics';
    readonly category = 'semantic';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.SEMANTIC_VALIDATION;
    readonly fileTypes = ['ple'];
    readonly enabled = true;
    readonly priority = 100;
    readonly configuration: any = {};

    private readonly validPleKeywords = [
        'def', 'productline', 'name', 'description', 'owner', 'domain', 
        'compliance', 'firstrelease', 'tags', 'safetylevel', 'region'
    ];

    private readonly validAsilLevels = ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'];

    supportsContext(context: IRuleValidationContext): boolean {
        const fileName = context.document.fileName.toLowerCase();
        return fileName.endsWith('.ple');
    }

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = context.document.getText();
        const lines = text.split('\n');

        console.log('🔍 PLE Validation Rule: Validating', context.document.fileName);

        // Check file must start with 'def productline'
        let hasProductLineDef = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('//')) continue;

            // Check for 'def productline' at the start
            if (line.startsWith('def productline') && !hasProductLineDef) {
                hasProductLineDef = true;
                continue;
            }

            // Remove quoted strings from validation
            let lineToCheck = line;
            lineToCheck = lineToCheck.replace(/"[^"]*"/g, '');
            lineToCheck = lineToCheck.replace(/'[^']*'/g, '');

            // Validate keywords
            const words = lineToCheck.split(/\s+/);
            for (const word of words) {
                const cleanWord = word.replace(/[,]/g, '').trim();
                if (!cleanWord || cleanWord.length < 3) continue;

                if (cleanWord.match(/^[a-z][a-z]*$/) && cleanWord.length > 2) {
                    if (!this.validPleKeywords.includes(cleanWord) && 
                        !this.validAsilLevels.includes(cleanWord.toUpperCase()) &&
                        !cleanWord.match(/^[A-Z]/)) {
                        
                        const wordIndex = line.indexOf(cleanWord);
                        if (wordIndex !== -1) {
                            const range = new vscode.Range(i, wordIndex, i, wordIndex + cleanWord.length);
                            diagnostics.push(new vscode.Diagnostic(
                                range,
                                `Invalid .ple keyword '${cleanWord}'. Valid keywords: ${this.validPleKeywords.join(', ')}`,
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

        // Check if file has required 'def productline'
        if (!hasProductLineDef) {
            const range = new vscode.Range(0, 0, 0, 0);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `.ple file must start with 'def productline <identifier>'`,
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