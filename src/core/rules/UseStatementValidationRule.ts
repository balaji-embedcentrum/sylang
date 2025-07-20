import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';
import { ImportManager } from '../managers/ImportManager';

/**
 * Use Statement Validation Rule
 * Enforces strict rules for use statements:
 * 1. Can ONLY import parent symbols (never child symbols)
 * 2. Must use correct syntax: use <parentType> <parentName1>, <parentName2>
 * 3. Parent symbols must exist and be of correct type
 */
export class UseStatementValidationRule implements IValidationRule {
    readonly id = 'use-statement-validation';
    readonly name = 'Use Statement Validation';
    readonly description = 'Validates use statements can only import parent symbols with correct syntax';
    readonly category = 'import';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.IMPORT_RESOLUTION;
    readonly fileTypes = ['fml', 'vml', 'vcf', 'fun', 'blk', 'req', 'tst', 'fma', 'fmc', 'fta', 'itm', 'haz', 'rsk', 'sgl'];
    readonly enabled = true;
    readonly priority = 200; // High priority for import validation
    readonly configuration: any = {};

    constructor(private importManager: ImportManager) {}

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = context.document.getText();
        const lines = text.split('\n');
        const documentUri = context.document.uri.toString();
        
        // Validate all use statements
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Skip non-use lines
            if (!trimmedLine.startsWith('use ')) {
                continue;
            }
            
            // Validate use statement syntax and semantics
            const importResult = this.importManager.processImportStatement(documentUri, line, lineIndex);
            
            if (!importResult) {
                // Invalid syntax
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineIndex, 0, lineIndex, line.length),
                    'Invalid use statement syntax. Expected: use <parentType> <parentName1>, <parentName2>...',
                    vscode.DiagnosticSeverity.Error
                ));
                continue;
            }
            
            // Check for errors from import processing
            for (const error of importResult.errors) {
                // Determine position based on error type
                let errorRange = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                
                // Try to highlight specific identifier if it's a child symbol error
                if (error.includes('child symbol')) {
                    const childSymbolMatch = error.match(/Cannot import child symbol '([^']+)'/);
                    if (childSymbolMatch) {
                        const childSymbolName = childSymbolMatch[1];
                        const startPos = line.indexOf(childSymbolName);
                        if (startPos >= 0) {
                            errorRange = new vscode.Range(
                                lineIndex, 
                                startPos, 
                                lineIndex, 
                                startPos + childSymbolName.length
                            );
                        }
                    }
                }
                
                diagnostics.push(new vscode.Diagnostic(
                    errorRange,
                    error,
                    vscode.DiagnosticSeverity.Error
                ));
            }
            
            // Additional syntax validation
            this.validateUseStatementSyntax(line, lineIndex, diagnostics);
        }
        
        const isValid = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length === 0;
        return this.createResult(isValid, diagnostics, isValid ? [] : ['Use statement validation failed'], startTime);
    }

    supportsContext(context: IRuleValidationContext): boolean {
        const extension = this.getFileExtension(context.document);
        return this.fileTypes.includes(extension.substring(1));
    }

    // =============================================================================
    // PRIVATE VALIDATION METHODS
    // =============================================================================

    private validateUseStatementSyntax(line: string, lineIndex: number, diagnostics: vscode.Diagnostic[]): void {
        const trimmedLine = line.trim();
        
        // Check for common syntax errors
        
        // 1. Empty use statement
        if (trimmedLine === 'use' || trimmedLine === 'use ') {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(lineIndex, 0, lineIndex, line.length),
                'Incomplete use statement. Expected: use <parentType> <parentName>',
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }
        
        // 2. Missing parent type
        const basicMatch = trimmedLine.match(/^use\s+(.+)$/);
        if (basicMatch) {
            const content = basicMatch[1].trim();
            if (!content.includes(' ')) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineIndex, 0, lineIndex, line.length),
                    'Missing parent symbol name. Expected: use <parentType> <parentName>',
                    vscode.DiagnosticSeverity.Error
                ));
                return;
            }
        }
        
        // 3. Check for file path usage (common mistake)
        if (trimmedLine.includes('.') && (trimmedLine.includes('/') || trimmedLine.includes('\\'))) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(lineIndex, 0, lineIndex, line.length),
                'Use statements import symbol names, not file paths. Use: use <parentType> <parentName>',
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }
        
        // 4. Check for quoted strings (another common mistake)
        if (trimmedLine.includes('"') || trimmedLine.includes("'")) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(lineIndex, 0, lineIndex, line.length),
                'Use statements do not use quotes. Use: use <parentType> <parentName>',
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }
        
        // 5. Validate parent type keywords
        const parentTypeMatch = trimmedLine.match(/^use\s+(\w+)/);
        if (parentTypeMatch) {
            const parentType = parentTypeMatch[1];
            const validParentTypes = [
                'productline', 'featureset', 'variantmodel', 'configset', 'functiongroup',
                'block', 'reqsection', 'testsuite', 'failuremodeanalysis', 'controlmeasures',
                'faulttreeanalysis', 'itemdefinition', 'hazardidentification', 'riskassessment', 'safetygoals'
            ];
            
            if (!validParentTypes.includes(parentType)) {
                const suggestions = this.getSimilarParentTypes(parentType, validParentTypes);
                let errorMessage = `Invalid parent type '${parentType}'. Valid types: ${validParentTypes.join(', ')}`;
                
                if (suggestions.length > 0) {
                    errorMessage += `. Did you mean: ${suggestions.join(', ')}?`;
                }
                
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(lineIndex, line.indexOf(parentType), lineIndex, line.indexOf(parentType) + parentType.length),
                    errorMessage,
                    vscode.DiagnosticSeverity.Error
                ));
            }
        }
    }

    private getSimilarParentTypes(input: string, validTypes: string[]): string[] {
        return validTypes
            .filter(type => this.levenshteinDistance(input.toLowerCase(), type.toLowerCase()) <= 2)
            .slice(0, 3);
    }

    private levenshteinDistance(a: string, b: string): number {
        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

        for (let i = 0; i <= a.length; i += 1) {
            matrix[0][i] = i;
        }

        for (let j = 0; j <= b.length; j += 1) {
            matrix[j][0] = j;
        }

        for (let j = 1; j <= b.length; j += 1) {
            for (let i = 1; i <= a.length; i += 1) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }

        return matrix[b.length][a.length];
    }

    private getFileExtension(document: vscode.TextDocument): string {
        return '.' + document.fileName.split('.').pop()?.toLowerCase();
    }

    private createResult(isValid: boolean, diagnostics: vscode.Diagnostic[], errors: string[], startTime: number): IRuleValidationResult {
        return {
            isValid,
            diagnostics,
            errors: errors.map(msg => ({
                code: this.id,
                message: msg,
                range: new vscode.Range(0, 0, 0, 1),
                severity: this.severity as any,
                source: this.id
            })),
            warnings: [],
            performance: {
                executionTime: performance.now() - startTime,
                memoryUsage: 0,
                cacheHitRate: 0
            },
            metadata: {
                ruleName: this.name,
                ruleVersion: '1.0.0',
                validatedElements: diagnostics.length,
                skippedElements: 0
            }
        };
    }
} 