import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';
import { IConfigurationManager } from '../interfaces/IConfigurationManager';

// Local definition to avoid complex imports
interface CompoundPropertyDef {
    primaryKeyword: string;
    secondaryKeywords: string[];
    valueType: 'identifier' | 'identifier-list' | 'enum' | 'string';
    syntax: string;
}

/**
 * Context-aware property validation rule
 * Uses ConfigurationManager.getValidPropertiesForContext() for modular validation
 */
export class PropertyValidationRule implements IValidationRule {
    readonly id = 'property-validation';
    readonly name = 'Property Validation';
    readonly description = 'Validates properties are valid in their context (requirement, block, etc.)';
    readonly category = 'syntax';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.SYNTAX_VALIDATION;
    readonly fileTypes = ['req', 'blk', 'fun', 'sub', 'sys', 'tst']; // All file types with contexts
    readonly enabled = true;
    readonly priority = 100;
    readonly configuration: any = {};

    constructor(
        private configurationManager: IConfigurationManager
    ) {}

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = context.document.getText();
        const lines = text.split('\n');
        
        // Get language ID from document
        const languageId = this.getLanguageIdFromDocument(context.document);
        let currentContext = '';
        let contextStack: string[] = [];
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;
            
            // Skip import lines
            if (trimmedLine.startsWith('use ')) continue;
            
            // Track context changes with def statements
            if (trimmedLine.startsWith('def ')) {
                const context = this.extractContextFromDefLine(trimmedLine);
                if (context) {
                    contextStack.push(context);
                    currentContext = context;
                }
                continue;
            }
            
            // Handle indentation level changes (entering/exiting contexts)
            const indentLevel = this.getIndentLevel(line);
            this.updateContextStackByIndent(contextStack, indentLevel);
            currentContext = contextStack[contextStack.length - 1] || '';
            
            // Validate properties in current context
            const keyword = trimmedLine.split(' ')[0];
            if (keyword && currentContext) {
                const validProperties = this.configurationManager
                    .getValidPropertiesForContext(languageId, currentContext);
                
                if (validProperties.length > 0 && !validProperties.includes(keyword)) {
                    // Check if this might be a container keyword instead
                    const isContainer = this.isContainerKeyword(keyword, languageId);
                    
                    if (!isContainer) {
                        const range = new vscode.Range(
                            lineIndex, 
                            line.indexOf(keyword), 
                            lineIndex, 
                            line.indexOf(keyword) + keyword.length
                        );
                        
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `Invalid keyword "${keyword}" in ${currentContext}. Valid: ${validProperties.join(', ')}`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                } else if (validProperties.includes(keyword)) {
                    // Validate compound properties (with secondary keywords)
                    const compoundDefs = this.configurationManager
                        .getCompoundPropertyDefinitions(languageId, currentContext);
                    
                    if (compoundDefs[keyword]) {
                        this.validateCompoundProperty(
                            diagnostics, lineIndex, trimmedLine, 
                            compoundDefs[keyword], line
                        );
                    } else {
                        // Validate simple properties (name, description, etc.)
                        this.validateSimpleProperty(
                            diagnostics, lineIndex, trimmedLine, keyword
                        );
                    }
                }
            }
        }
        
        const isValid = diagnostics.length === 0;
        return {
            isValid,
            diagnostics,
            errors: [],
            warnings: [],
            performance: {
                executionTime: performance.now() - startTime,
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

    supportsContext(context: IRuleValidationContext): boolean {
        const extension = context.document.fileName.split('.').pop()?.toLowerCase();
        return this.fileTypes.includes(extension || '');
    }

    private getLanguageIdFromDocument(document: vscode.TextDocument): string {
        const extension = document.fileName.split('.').pop()?.toLowerCase();
        const mapping: Record<string, string> = {
            'req': 'sylang-requirement',
            'blk': 'sylang-block', 
            'fun': 'sylang-function',
            'sub': 'sylang-subsystem',
            'sys': 'sylang-system',
            'tst': 'sylang-test',
            'ple': 'sylang-productline',
            'fml': 'sylang-feature',
            'vml': 'sylang-variantmodel',
            'vcf': 'sylang-variantconfig'
        };
        return mapping[extension || ''] || 'sylang-unknown';
    }

    private extractContextFromDefLine(line: string): string | null {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2 && parts[0] === 'def') {
            return parts[1]; // 'requirement', 'block', 'function', etc.
        }
        return null;
    }

    private getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }

    private updateContextStackByIndent(contextStack: string[], currentIndent: number): void {
        // This is a simplified approach - in a real implementation you'd want
        // more sophisticated context tracking based on indentation levels
        // For now, we assume each def creates a new context
    }

    private isContainerKeyword(keyword: string, languageId: string): boolean {
        // Check if this keyword is a container type that creates new contexts
        const containerKeywords: Record<string, string[]> = {
            'sylang-requirement': ['requirement'],
            'sylang-block': ['block'],
            'sylang-function': ['function'],
            'sylang-test': ['testcase']
        };
        
        const containers = containerKeywords[languageId] || [];
        return containers.includes(keyword);
    }

    private validateCompoundProperty(
        diagnostics: vscode.Diagnostic[], 
        lineIndex: number, 
        line: string, 
        definition: CompoundPropertyDef, // CompoundPropertyDef type
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
        
        const primaryKeyword = parts[0];
        const secondaryKeyword = parts[1];
        const valueText = parts.slice(2).join(' ');
        
        // Validate secondary keyword
        if (!definition.secondaryKeywords.includes(secondaryKeyword)) {
            const secondaryStart = fullLine.indexOf(secondaryKeyword);
            const range = new vscode.Range(
                lineIndex, 
                secondaryStart, 
                lineIndex, 
                secondaryStart + secondaryKeyword.length
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

    private validateSimpleProperty(
        diagnostics: vscode.Diagnostic[], 
        lineIndex: number, 
        line: string, 
        keyword: string
    ): void {
        // Basic validation for simple properties like "name", "description"
        const parts = line.trim().split(/\s+/, 2);
        
        if (parts.length < 2) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `Property "${keyword}" requires a value`,
                vscode.DiagnosticSeverity.Error
            ));
        }
        
        // Additional validation based on keyword type could be added here
        // e.g., name/description should be quoted strings, safetylevel should be enum
    }

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
                if (!/^[A-Z][A-Za-z0-9_]*$/.test(valueText.trim())) {
                    const valueStart = fullLine.indexOf(valueText);
                    const range = new vscode.Range(
                        lineIndex, valueStart, lineIndex, valueStart + valueText.length
                    );
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Invalid identifier "${valueText}". Should use PascalCase`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
                break;
                
            case 'identifier-list':
                const identifiers = valueText.split(',').map(id => id.trim());
                for (const identifier of identifiers) {
                    if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
                        const idStart = fullLine.indexOf(identifier);
                        const range = new vscode.Range(
                            lineIndex, idStart, lineIndex, idStart + identifier.length
                        );
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `Invalid identifier "${identifier}" in list. Should use PascalCase`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                }
                break;
                
            case 'string':
                if (!valueText.match(/^".*"$/)) {
                    const valueStart = fullLine.indexOf(valueText);
                    const range = new vscode.Range(
                        lineIndex, valueStart, lineIndex, valueStart + valueText.length
                    );
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `String value must be quoted: "${valueText}"`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
                break;
                
            case 'enum':
                // Could add enum validation here if needed
                break;
        }
    }
} 