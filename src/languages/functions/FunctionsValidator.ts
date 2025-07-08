import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';

export class FunctionsValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig) {
        super(languageConfig);
    }

    protected getDefinitionKeywords(): string[] {
        return ['systemfunctions', 'function'];
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Validate def systemfunctions syntax
        if (trimmedLine.startsWith('def systemfunctions')) {
            await this.validateSystemfunctionsDefinition(lineIndex, trimmedLine);
        }

        // Validate def function syntax
        if (trimmedLine.startsWith('def function')) {
            await this.validateFunctionDefinition(lineIndex, trimmedLine);
        }

        // Validate enables cross-file references to features
        if (trimmedLine.includes('enables')) {
            await this.validateEnablesReferences(document, lineIndex, line);
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        // Check for single systemfunctions keyword in file
        await this.validateSingleSystemfunctionsKeyword(document);

        // Check for single .fun file in workspace
        await this.validateSingleFunFileInWorkspace(document);

        // Validate functions-specific hierarchical indentation
        await this.validateFunctionsHierarchicalIndentation(document);
    }

    private async validateSystemfunctionsDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const systemfunctionsMatch = trimmedLine.match(/^def\s+systemfunctions\s+(\w+)/);
        if (!systemfunctionsMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid systemfunctions syntax. Expected: def systemfunctions <SystemName>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-systemfunctions-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const systemfunctionsName = systemfunctionsMatch[1] || '';
        
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(systemfunctionsName)) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'System functions name should start with uppercase letter and contain only letters and numbers',
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'invalid-systemfunctions-name';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateFunctionDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const functionMatch = trimmedLine.match(/^def\s+function\s+(\w+)/);
        if (!functionMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid function syntax. Expected: def function <FunctionName>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-function-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const functionName = functionMatch[1] || '';

        if (!/^[A-Z][a-zA-Z0-9]*$/.test(functionName)) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Function name should start with uppercase letter and contain only letters and numbers',
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'invalid-function-name';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateEnablesReferences(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();
        
        // Extract features from enables line: enables FeatureA, FeatureB, FeatureC
        const enablesMatch = trimmedLine.match(/^enables\s+(.+)$/);
        if (!enablesMatch) return;

        const featuresText = enablesMatch[1];
        if (!featuresText) return;
        
        const features = featuresText.split(',').map(f => f.trim());

        // Get all defined features from .fml files in workspace
        const definedFeatures = await this.getAllDefinedFeatures();

        for (const feature of features) {
            if (feature && !definedFeatures.includes(feature)) {
                const featureStart = line.indexOf(feature);
                if (featureStart !== -1) {
                    const range = new vscode.Range(lineIndex, featureStart, lineIndex, featureStart + feature.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Feature '${feature}' is not defined in any .fml file. Functions can only enable features defined in feature models.`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-feature-reference';
                    this.diagnostics.push(diagnostic);
                }
            }
        }
    }

    private async getAllDefinedFeatures(): Promise<string[]> {
        const features: string[] = [];
        
        try {
            // Find all .fml files in workspace
            const fmlFiles = await vscode.workspace.findFiles('**/*.fml', '**/node_modules/**');
            
            for (const fileUri of fmlFiles) {
                const document = await vscode.workspace.openTextDocument(fileUri);
                const text = document.getText();
                const lines = text.split('\n');
                
                for (const line of lines) {
                    if (!line) continue;
                    const trimmed = line.trim();
                    
                    // Look for def feature definitions
                    const featureMatch = trimmed.match(/^def\s+feature\s+(\w+)/);
                    if (featureMatch && featureMatch[1]) {
                        features.push(featureMatch[1]);
                    }
                }
            }
        } catch (error) {
            console.error('[FunctionsValidator] Error reading feature definitions:', error);
        }
        
        return features;
    }

    private async validateSingleSystemfunctionsKeyword(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        let systemfunctionsCount = 0;
        let firstSystemfunctionsLine = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('def systemfunctions')) {
                systemfunctionsCount++;
                if (firstSystemfunctionsLine === -1) {
                    firstSystemfunctionsLine = i;
                }
            }
        }

        if (systemfunctionsCount === 0) {
            const range = new vscode.Range(0, 0, 0, 0);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Functions file must contain exactly one "def systemfunctions" declaration',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-systemfunctions-keyword';
            this.diagnostics.push(diagnostic);
        } else if (systemfunctionsCount > 1) {
            const firstLine = lines[firstSystemfunctionsLine];
            const range = new vscode.Range(firstSystemfunctionsLine, 0, firstSystemfunctionsLine, firstLine ? firstLine.length : 0);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Multiple "def systemfunctions" declarations found (${systemfunctionsCount}). Only one is allowed per file.`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'multiple-systemfunctions-keywords';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateSingleFunFileInWorkspace(document: vscode.TextDocument): Promise<void> {
        try {
            const files = await vscode.workspace.findFiles('**/*.fun', '**/node_modules/**');
            const currentFile = document.uri.fsPath;
            
            if (files.length > 1) {
                const otherFiles = files.filter(uri => uri.fsPath !== currentFile);
                if (otherFiles.length > 0) {
                    const range = new vscode.Range(0, 0, 0, 0);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Multiple .fun files found in workspace. Only one .fun file is recommended per project. Found: ${files.map(f => vscode.workspace.asRelativePath(f)).join(', ')}`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    diagnostic.code = 'multiple-fun-files';
                    this.diagnostics.push(diagnostic);
                }
            }
        } catch (error) {
            console.error('[FunctionsValidator] Error checking for multiple .fun files:', error);
        }
    }

    private async validateFunctionsHierarchicalIndentation(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        let systemfunctionsIndent = -1;
        const functionStack: Array<{indentLevel: number, lineIndex: number, name: string}> = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || line.trim().length === 0 || line.trim().startsWith('//')) continue;
            
            const trimmedLine = line.trim();
            const indentLevel = this.getIndentLevel(line);
            
            // Check systemfunctions indentation
            if (trimmedLine.startsWith('def systemfunctions')) {
                if (indentLevel !== 0) {
                    this.addDiagnostic(i, 0, indentLevel, `systemfunctions must start at column 0. Found ${indentLevel} tabs.`, 'invalid-systemfunctions-indentation');
                }
                systemfunctionsIndent = indentLevel;
                continue;
            }
            
            // Check function definitions
            const functionMatch = trimmedLine.match(/^def\s+function\s+(\w+)/);
            if (functionMatch && functionMatch[1]) {
                const functionName = functionMatch[1];
                
                // Validate function indentation hierarchy
                if (systemfunctionsIndent === -1) {
                    this.addDiagnostic(i, 0, line.length, 'Function definition found before systemfunctions declaration', 'function-before-systemfunctions');
                    continue;
                }
                
                // Check if indentation is valid (must be at least 1 tab deeper than systemfunctions)
                const expectedMinIndent = systemfunctionsIndent + 1; // First level functions
                if (indentLevel < expectedMinIndent) {
                    this.addDiagnostic(i, 0, indentLevel, `Function '${functionName}' indentation too shallow. Minimum expected: ${expectedMinIndent} tabs, found: ${indentLevel} tabs.`, 'function-indentation-too-shallow');
                    continue;
                }
                
                // Update function stack (remove functions at same or deeper level)
                while (functionStack.length > 0) {
                    const lastFunction = functionStack[functionStack.length - 1];
                    if (!lastFunction || lastFunction.indentLevel < indentLevel) break;
                    functionStack.pop();
                }
                
                // Add current function to stack
                functionStack.push({indentLevel, lineIndex: i, name: functionName});
                continue;
            }
            
            // Check property indentation (name, description, owner, tags, safetylevel, enables)
            const propertyMatch = trimmedLine.match(/^(name|description|owner|tags|safetylevel|enables)\s/);
            if (propertyMatch && propertyMatch[1]) {
                if (functionStack.length === 0) {
                    this.addDiagnostic(i, 0, line.length, 'Property found outside of any function definition', 'property-outside-function');
                    continue;
                }
                
                const parentFunction = functionStack[functionStack.length - 1];
                if (!parentFunction) continue;
                
                const expectedPropertyIndent = parentFunction.indentLevel + 1;
                
                if (indentLevel !== expectedPropertyIndent) {
                    this.addDiagnostic(i, 0, indentLevel, `Property '${propertyMatch[1]}' must be indented 1 tab deeper than its parent function '${parentFunction.name}'. Expected: ${expectedPropertyIndent} tabs, found: ${indentLevel} tabs.`, 'property-incorrect-indentation');
                }
                continue;
            }
        }
    }
} 