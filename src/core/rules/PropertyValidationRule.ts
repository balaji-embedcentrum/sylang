import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';
import { IConfigurationManager } from '../interfaces/IConfigurationManager';

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
                }
            }
        }
        
        return {
            ruleId: this.id,
            isValid: diagnostics.length === 0,
            diagnostics,
            executionTime: performance.now() - startTime,
            metadata: {
                linesProcessed: lines.length,
                contextsFound: contextStack.length,
                errorsFound: diagnostics.length
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
} 