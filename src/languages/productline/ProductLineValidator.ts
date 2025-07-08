import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';

export class ProductLineValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig) {
        super(languageConfig);
    }

    protected getDefinitionKeywords(): string[] {
        return ['productline'];
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Validate def productline syntax
        if (trimmedLine.startsWith('def productline')) {
            await this.validateProductlineDefinition(lineIndex, trimmedLine);
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        // Check for single productline keyword in file
        await this.validateSingleProductlineKeyword(document);

        // Check for single .ple file in workspace
        await this.validateSinglePleFileInWorkspace(document);

        // Validate productline-specific indentation
        await this.validateProductLineIndentation(document);
    }

    private async validateProductlineDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const productlineMatch = trimmedLine.match(/^def\s+productline\s+(\w+)/);
        if (!productlineMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid productline syntax. Expected: def productline <name>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-productline-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const productlineName = productlineMatch[1] || '';
        
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(productlineName)) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Product line name should start with uppercase letter and contain only letters and numbers',
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'invalid-productline-name';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateSingleProductlineKeyword(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        let productlineCount = 0;
        const productlineLines: number[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line && line.trim().startsWith('def productline')) {
                productlineCount++;
                productlineLines.push(i);
            }
        }

        if (productlineCount === 0) {
            const range = new vscode.Range(0, 0, 0, 0);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Product line file must contain exactly one "def productline" declaration',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-productline-keyword';
            this.diagnostics.push(diagnostic);
        } else if (productlineCount > 1) {
            // Mark all productline occurrences except the first as errors
            for (let i = 1; i < productlineLines.length; i++) {
                const lineIndex = productlineLines[i];
                if (lineIndex !== undefined) {
                    const line = lines[lineIndex];
                    if (line) {
                        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            'Only one "def productline" declaration is allowed per .ple file',
                            vscode.DiagnosticSeverity.Error
                        );
                        diagnostic.code = 'multiple-productline-keywords';
                        this.diagnostics.push(diagnostic);
                    }
                }
            }
        }
    }

    private async validateSinglePleFileInWorkspace(document: vscode.TextDocument): Promise<void> {
        try {
            const pleFiles = await vscode.workspace.findFiles('**/*.ple', '**/node_modules/**');
            
            if (pleFiles.length > 1) {
                const currentFileIndex = pleFiles.findIndex(uri => uri.fsPath === document.uri.fsPath);
                
                if (currentFileIndex > 0) {
                    const range = new vscode.Range(0, 0, 0, 0);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Multiple .ple files found in workspace. Only one .ple file is allowed per project. Found: ${pleFiles.map(f => vscode.workspace.asRelativePath(f)).join(', ')}`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    diagnostic.code = 'multiple-ple-files';
                    this.diagnostics.push(diagnostic);
                }
            }
        } catch (error) {
            console.error('[ProductLineValidator] Error checking for multiple .ple files:', error);
        }
    }

    private async validateProductLineIndentation(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        let productLineIndent = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || line.trim().length === 0) continue;

            const trimmedLine = line.trim();
            const indentLevel = this.getIndentLevel(line);

            // Skip comments
            if (trimmedLine.startsWith('//')) continue;

            // Check productline definition indentation
            if (trimmedLine.startsWith('def productline')) {
                if (indentLevel !== 0) {
                    this.addDiagnostic(i, 0, line.length, '"def productline" must start at column 0 (no indentation)', 'invalid-productline-indentation');
                }
                productLineIndent = indentLevel;
                continue;
            }

            // Check properties indentation (description, owner, tags, etc.)
            if (this.isPropertyLine(trimmedLine)) {
                if (productLineIndent === -1) {
                    this.addDiagnostic(i, 0, line.length, 'Properties must come after "def productline" declaration', 'property-before-productline');
                } else {
                    // Properties should be indented exactly 1 tab from productline level
                    const expectedIndent = productLineIndent + 1;
                    if (indentLevel !== expectedIndent) {
                        this.addDiagnostic(i, 0, line.length, `Property must be indented exactly ${expectedIndent} tab(s). Got ${indentLevel}`, 'property-incorrect-indentation');
                    }
                }
            }
        }
    }
} 