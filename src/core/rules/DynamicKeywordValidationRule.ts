import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';
import { IKeywordRegistry, KeywordType, KeywordUsageContext } from '../keywords/IKeywordRegistry';

/**
 * Dynamic Keyword Validation Rule
 * Uses the KeywordRegistry to validate all keywords dynamically
 */
export class DynamicKeywordValidationRule implements IValidationRule {
    readonly id = 'dynamic-keyword-validation';
    readonly name = 'Dynamic Keyword Validation';
    readonly description = 'Validates all keywords using the extensible keyword registry';
    readonly category = 'syntax';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.SYNTAX_VALIDATION;
    readonly fileTypes = ['ple', 'fml', 'vml', 'vcf', 'fun', 'blk', 'req', 'tst', 'fma', 'fmc', 'fta', 'itm', 'haz', 'rsk', 'sgl'];
    readonly enabled = true;
    readonly priority = 50; // Run before other validation rules
    readonly configuration: any = {};

    constructor(private keywordRegistry: IKeywordRegistry) {}

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = context.document.getText();
        const lines = text.split('\n');
        
        const extension = this.getFileExtension(context.document);
        let currentParentContext = 'root';
        const contextStack: string[] = ['root'];
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
                continue;
            }
            
            const indentLevel = this.getIndentLevel(line);
            
            // Update context stack based on indentation
            this.updateContextStack(contextStack, indentLevel);
            currentParentContext = contextStack[contextStack.length - 1] || 'root';
            
            // Parse the line to extract keywords and values
            const lineTokens = this.parseLine(line, lineIndex);
            
            for (const token of lineTokens) {
                const usageContext: KeywordUsageContext = {
                    document: context.document,
                    line: lineIndex,
                    character: token.startChar,
                    fileExtension: extension,
                    parentContext: currentParentContext,
                    indentLevel,
                    precedingKeywords: lineTokens.slice(0, lineTokens.indexOf(token)).map(t => t.keyword)
                };
                
                // Validate the keyword using the registry
                const validationResult = this.keywordRegistry.validateKeywordUsage(
                    token.keyword,
                    token.value,
                    usageContext
                );
                
                if (!validationResult.isValid) {
                    // Create diagnostic for invalid keyword
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(lineIndex, token.startChar, lineIndex, token.endChar),
                        validationResult.errors.join('; '),
                        vscode.DiagnosticSeverity.Error
                    ));
                    
                    // Add suggestions if available
                    if (validationResult.suggestions && validationResult.suggestions.length > 0) {
                        const suggestionMsg = `Did you mean: ${validationResult.suggestions.join(', ')}?`;
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(lineIndex, token.startChar, lineIndex, token.endChar),
                            suggestionMsg,
                            vscode.DiagnosticSeverity.Information
                        ));
                    }
                }
                
                // Add warnings
                for (const warning of validationResult.warnings) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(lineIndex, token.startChar, lineIndex, token.endChar),
                        warning,
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
                
                // Update context if this is a definition keyword
                if (token.keyword === 'def' || this.isDefinitionKeyword(token.keyword)) {
                    const defType = this.extractDefinitionType(line);
                    if (defType) {
                        contextStack.push(defType);
                    }
                }
            }
        }
        
        const isValid = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length === 0;
        return this.createResult(isValid, diagnostics, isValid ? [] : ['Keyword validation failed'], startTime);
    }

    supportsContext(context: IRuleValidationContext): boolean {
        const extension = this.getFileExtension(context.document);
        return this.fileTypes.includes(extension.substring(1));
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private getFileExtension(document: vscode.TextDocument): string {
        return '.' + document.fileName.split('.').pop()?.toLowerCase();
    }

    private getIndentLevel(line: string): number {
        let indentLevel = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === ' ') {
                indentLevel++;
            } else if (line[i] === '\t') {
                indentLevel += 2;
            } else {
                break;
            }
        }
        return Math.floor(indentLevel / 2);
    }

    private updateContextStack(contextStack: string[], indentLevel: number): void {
        // Adjust context stack based on indentation level
        while (contextStack.length > indentLevel + 1) {
            contextStack.pop();
        }
    }

    private parseLine(line: string, lineIndex: number): Array<{keyword: string, value: string, startChar: number, endChar: number}> {
        const tokens: Array<{keyword: string, value: string, startChar: number, endChar: number}> = [];
        const trimmedLine = line.trim();
        
        // Handle different line patterns
        
        // 1. Definition lines: "def <type> <identifier>"
        const defMatch = line.match(/^\s*(def)\s+(?:(\w+)\s+)?(\w+)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (defMatch) {
            const [, defKeyword, compound, type, identifier] = defMatch;
            let currentPos = line.indexOf(defKeyword);
            
            tokens.push({
                keyword: defKeyword,
                value: compound ? `${compound} ${type} ${identifier}` : `${type} ${identifier}`,
                startChar: currentPos,
                endChar: currentPos + defKeyword.length
            });
            
            if (compound) {
                currentPos = line.indexOf(compound, currentPos);
                tokens.push({
                    keyword: compound,
                    value: `${type} ${identifier}`,
                    startChar: currentPos,
                    endChar: currentPos + compound.length
                });
            }
            
            currentPos = line.indexOf(type, currentPos);
            tokens.push({
                keyword: type,
                value: identifier,
                startChar: currentPos,
                endChar: currentPos + type.length
            });
            
            return tokens;
        }
        
        // 2. Import lines: "use <type> <identifiers>"
        const importMatch = line.match(/^\s*(use)\s+(\w+)(?:\s+(\w+))?\s+(.+)/);
        if (importMatch) {
            const [, useKeyword, type, subtype, identifiers] = importMatch;
            let currentPos = line.indexOf(useKeyword);
            
            tokens.push({
                keyword: useKeyword,
                value: `${type} ${subtype || ''} ${identifiers}`.trim(),
                startChar: currentPos,
                endChar: currentPos + useKeyword.length
            });
            
            currentPos = line.indexOf(type, currentPos);
            tokens.push({
                keyword: type,
                value: `${subtype || ''} ${identifiers}`.trim(),
                startChar: currentPos,
                endChar: currentPos + type.length
            });
            
            return tokens;
        }
        
        // 3. Property lines: "<keyword> <value>"
        const propertyMatch = line.match(/^\s*(\w+)\s+(.+)/);
        if (propertyMatch) {
            const [, keyword, value] = propertyMatch;
            const startChar = line.indexOf(keyword);
            
            tokens.push({
                keyword,
                value: value.trim(),
                startChar,
                endChar: startChar + keyword.length
            });
            
            // Handle compound properties: "enables feature FeatureName"
            const compoundMatch = value.match(/^(\w+)\s+(.+)/);
            if (compoundMatch) {
                const [, secondaryKeyword, secondaryValue] = compoundMatch;
                const secondaryStartChar = line.indexOf(secondaryKeyword, startChar + keyword.length);
                
                tokens.push({
                    keyword: secondaryKeyword,
                    value: secondaryValue.trim(),
                    startChar: secondaryStartChar,
                    endChar: secondaryStartChar + secondaryKeyword.length
                });
            }
        }
        
        return tokens;
    }

    private isDefinitionKeyword(keyword: string): boolean {
        const definitionKeywords = this.keywordRegistry.getKeywordsOfType(KeywordType.PRIMARY_DEF);
        return definitionKeywords.some(def => def.keyword === keyword);
    }

    private extractDefinitionType(line: string): string | undefined {
        const defMatch = line.match(/^\s*def\s+(?:(\w+)\s+)?(\w+)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (defMatch) {
            const [, compound, type] = defMatch;
            return compound ? `${compound}_${type}` : type;
        }
        return undefined;
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