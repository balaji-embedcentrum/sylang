import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';
import { SYLANG_LANGUAGES, SylangLanguageConfig } from '../../config/LanguageConfigs';

/**
 * Header Definition Validation Rule
 * Enforces the core Sylang rule: exactly one header def per file, sub defs properly nested
 */
export class HeaderDefValidationRule implements IValidationRule {
    readonly id = 'header-def-validation';
    readonly name = 'Header Definition Validation';
    readonly description = 'Enforces one header def per file and proper sub def nesting';
    readonly category = 'structure';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.SYNTAX_VALIDATION;
    readonly fileTypes = ['ple', 'fml', 'vml', 'vcf', 'fun', 'blk', 'req', 'tst', 'fma', 'fmc', 'fta', 'itm', 'haz', 'rsk', 'sgl'];
    readonly enabled = true;
    readonly priority = 200; // Higher priority than property validation
    readonly configuration: any = {};

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = context.document.getText();
        const lines = text.split('\n');
        
        // Get language configuration for this file
        const extension = this.getFileExtension(context.document);
        const langConfig = this.getLanguageConfig(extension);
        
        if (!langConfig) {
            return this.createResult(false, diagnostics, [`Unsupported file extension: ${extension}`], startTime);
        }

        let headerDefFound = false;
        let headerDefLine = -1;
        let headerDefType = '';
        const foundDefs: Array<{line: number, type: string, name: string, indentLevel: number}> = [];
        
        // Track import section (imports must come before header def)
        let inImportSection = true;
        let lastImportLine = -1;
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
                continue;
            }
            
            const indentLevel = this.getIndentLevel(line);
            
            // Check for import statements
            if (trimmedLine.startsWith('use ')) {
                if (!inImportSection) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(lineIndex, 0, lineIndex, line.length),
                        'Import statements must appear before definitions',
                        vscode.DiagnosticSeverity.Error
                    ));
                }
                lastImportLine = lineIndex;
                continue;
            }
            
            // Check for def statements
            const defMatch = line.match(/^\s*def\s+(?:(\w+)\s+)?(\w+)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (defMatch) {
                inImportSection = false; // No more imports allowed after first def
                
                const [, compound, type, name] = defMatch;
                const fullType = compound ? `${compound} ${type}` : type;
                
                foundDefs.push({
                    line: lineIndex,
                    type: fullType,
                    name,
                    indentLevel
                });
                
                // Check if this is a header definition
                if (this.isHeaderDefType(fullType, langConfig)) {
                    if (headerDefFound) {
                        // Multiple header defs found
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(lineIndex, 0, lineIndex, line.length),
                            `Multiple header definitions found. Only one ${langConfig.headerTypes.join(' or ')} definition allowed per file`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    } else {
                        // First header def
                        if (indentLevel !== 0) {
                            diagnostics.push(new vscode.Diagnostic(
                                new vscode.Range(lineIndex, 0, lineIndex, indentLevel * 2),
                                'Header definition must not be indented',
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                        
                        headerDefFound = true;
                        headerDefLine = lineIndex;
                        headerDefType = fullType;
                    }
                } else {
                    // This is a sub def - validate it
                    if (!headerDefFound) {
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(lineIndex, 0, lineIndex, line.length),
                            `Sub definition "${fullType}" found before header definition. File must start with ${langConfig.headerTypes.join(' or ')} definition`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    } else {
                        // Validate sub def indentation
                        if (indentLevel === 0) {
                            diagnostics.push(new vscode.Diagnostic(
                                new vscode.Range(lineIndex, 0, lineIndex, line.length),
                                `Sub definition "${fullType}" must be indented under header definition`,
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                        
                        // Validate sub def type is allowed
                        if (!this.isValidSubDefType(fullType, langConfig)) {
                            diagnostics.push(new vscode.Diagnostic(
                                new vscode.Range(lineIndex, line.indexOf(type), lineIndex, line.indexOf(type) + type.length),
                                `Invalid sub definition type "${fullType}" for ${extension} files`,
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                    }
                }
            }
        }
        
        // Validate that we found exactly one header def
        if (!headerDefFound) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 1),
                `Missing header definition. File must start with ${langConfig.headerTypes.join(' or ')} definition`,
                vscode.DiagnosticSeverity.Error
            ));
        }
        
        const isValid = diagnostics.length === 0;
        return this.createResult(isValid, diagnostics, isValid ? [] : ['Header definition validation failed'], startTime);
    }

    supportsContext(context: IRuleValidationContext): boolean {
        const extension = this.getFileExtension(context.document);
        return this.fileTypes.includes(extension.substring(1)); // Remove the dot
    }

    private getFileExtension(document: vscode.TextDocument): string {
        return '.' + document.fileName.split('.').pop()?.toLowerCase();
    }

    private getLanguageConfig(extension: string): SylangLanguageConfig | undefined {
        return SYLANG_LANGUAGES.find(lang => lang.extension === extension);
    }

    private isHeaderDefType(defType: string, config: SylangLanguageConfig): boolean {
        return config.headerTypes.includes(defType);
    }

    private isValidSubDefType(defType: string, config: SylangLanguageConfig): boolean {
        // Get all valid sub def types for this language
        const validSubDefs = this.getValidSubDefTypes(config);
        return validSubDefs.includes(defType);
    }

    private getValidSubDefTypes(config: SylangLanguageConfig): string[] {
        // Define valid sub def types for each extension
        const subDefMap: Record<string, string[]> = {
            '.ple': [], // No sub defs allowed in .ple files
            '.fml': ['feature'],
            '.vml': ['variant'],
            '.vcf': ['config'],
            '.fun': ['function'],
            '.blk': ['subsystem', 'component', 'subcomponent', 'module', 'unit', 'assembly', 'circuit', 'part'],
            '.req': [], // Requirements are direct defs, no container
            '.tst': ['testcase', 'step'],
            '.fma': ['failuremode'],
            '.fmc': ['control'],
            '.fta': ['faulttree', 'event'],
            '.itm': ['item'],
            '.haz': ['hazard'],
            '.rsk': ['risk'],
            '.sgl': ['safetygoal']
        };
        
        return subDefMap[config.extension] || [];
    }

    private getIndentLevel(line: string): number {
        let indentLevel = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === ' ') {
                indentLevel++;
            } else if (line[i] === '\t') {
                indentLevel += 2; // Tabs count as 2 spaces
            } else {
                break;
            }
        }
        return Math.floor(indentLevel / 2); // 2 spaces per level
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