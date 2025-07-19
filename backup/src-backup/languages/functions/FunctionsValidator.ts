import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';
import { SymbolManager } from '../../core/SymbolManager';

export class FunctionsValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig, symbolManager: SymbolManager) {
        super(languageConfig, symbolManager);
    }

    protected getDefinitionKeywords(): string[] {
        return ['functiongroup', 'function'];
    }

    protected override isPropertyLine(trimmedLine: string): boolean {
        const validProperties = [
            'name', 'description', 'owner', 'tags', 'safetylevel', 'category', 
            'enables', 'partof', 'allocatedto', 'config'
        ];
        return validProperties.some(prop => trimmedLine.startsWith(`${prop} `));
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Validate def functiongroup syntax
        if (trimmedLine.startsWith('def functiongroup')) {
            await this.validateFunctiongroupDefinition(lineIndex, trimmedLine);
        }
        // Validate def function syntax (but exclude functiongroup lines)
        else if (trimmedLine.match(/^def\s+function\s+\w+/)) {
            await this.validateFunctionDefinition(lineIndex, trimmedLine);
        }

        // Validate partof property
        if (trimmedLine.startsWith('partof ')) {
            await this.validatePartofProperty(lineIndex, trimmedLine);
        }

        // Validate enables feature cross-file references
        if (trimmedLine.startsWith('enables feature')) {
            await this.validateEnablesFeatureReferences(document, lineIndex, line);
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        // Check that file starts with def functiongroup
        await this.validateFileStartsWithFunctiongroup(document);

        // Check for single functiongroup keyword in file
        await this.validateSingleFunctiongroupKeyword(document);

        // Validate functions-specific hierarchical indentation
        // TEMPORARILY DISABLED DUE TO FALSE POSITIVES
        // await this.validateFunctionsHierarchicalIndentation(document);
    }

    private async validateFunctiongroupDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const functiongroupMatch = trimmedLine.match(/^def\s+functiongroup\s+(\w+)/);
        if (!functiongroupMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid functiongroup syntax. Expected: def functiongroup <FunctiongroupName>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-functiongroup-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const functiongroupName = functiongroupMatch[1] || '';
        
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(functiongroupName)) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Functiongroup name should start with uppercase letter and contain only letters and numbers',
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'invalid-functiongroup-name';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validatePartofProperty(lineIndex: number, trimmedLine: string): Promise<void> {
        const partofMatch = trimmedLine.match(/^partof\s+(.+)$/);
        if (!partofMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid partof property. Expected format: partof <type> <identifier>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-partof-property';
            this.diagnostics.push(diagnostic);
            return;
        }

        const value = partofMatch[1]?.trim();
        if (!value) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'partof value is required',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-partof-value';
            this.diagnostics.push(diagnostic);
            return;
        }

        const validSecondaryKeywords = ['system', 'subsystem', 'component', 'module', 'unit', 'assembly', 'circuit', 'part'];
        
        // Check if it starts with a valid secondary keyword
        const foundKeyword = validSecondaryKeywords.find(sk => value.startsWith(sk + ' '));
        if (!foundKeyword) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `partof must start with one of: ${validSecondaryKeywords.join(', ')} followed by identifier`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-partof-secondary-keyword';
            this.diagnostics.push(diagnostic);
            return;
        }
        
        // Extract the identifier after the secondary keyword
        const identifier = value.substring(foundKeyword.length).trim();
        if (!identifier) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `partof ${foundKeyword} must be followed by identifier`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-partof-identifier';
            this.diagnostics.push(diagnostic);
            return;
        }
        
        // Validate the identifier is PascalCase
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            const identifierStart = trimmedLine.indexOf(identifier);
            const range = new vscode.Range(lineIndex, identifierStart, lineIndex, identifierStart + identifier.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid identifier "${identifier}" in partof ${foundKeyword} - should use PascalCase`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-partof-identifier';
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

    private async validateEnablesFeatureReferences(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();
        
        // Extract features from enables feature line: enables feature FeatureA, FeatureB, FeatureC
        const enablesMatch = trimmedLine.match(/^enables\s+feature\s+(.+)$/);
        if (!enablesMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid enables syntax. Expected format: enables feature <FeatureList>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-enables-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const featuresText = enablesMatch[1];
        if (!featuresText) return;
        
        const features = featuresText.split(',').map(f => f.trim());

        // Validate feature identifiers format
        for (const feature of features) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(feature)) {
                const featureStart = line.indexOf(feature);
                if (featureStart !== -1) {
                    const range = new vscode.Range(lineIndex, featureStart, lineIndex, featureStart + feature.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Invalid feature identifier "${feature}" - should use PascalCase`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'invalid-feature-identifier';
                    this.diagnostics.push(diagnostic);
                }
            }
        }

        // Use import-aware validation for feature references
        for (const feature of features) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(feature)) continue; // Skip invalid features (already reported above)
            if (!this.symbolManager.isSymbolAvailable(feature, document.uri.toString())) {
                const featureStart = line.indexOf(feature);
                if (featureStart !== -1) {
                    const range = new vscode.Range(lineIndex, featureStart, lineIndex, featureStart + feature.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Undefined feature '${feature}' - missing 'use featureset ${feature}' import or definition`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-feature-reference';
                    this.diagnostics.push(diagnostic);
                }
            }
        }
    }

    private async validateFileStartsWithFunctiongroup(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        // Find the first non-empty, non-comment, non-import line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0 || trimmedLine.startsWith('//')) continue;
            
            // Skip import statements (use keyword)
            if (trimmedLine.startsWith('use ')) continue;
            
            // This is the first meaningful definition line
            if (!trimmedLine.startsWith('def functiongroup')) {
                const range = new vscode.Range(i, 0, i, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    'Functions file must start with "def functiongroup" declaration (imports with "use" keyword are allowed before)',
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'file-must-start-with-functiongroup';
                this.diagnostics.push(diagnostic);
            }
            return; // We only check the first meaningful definition line
        }
    }

    private async validateSingleFunctiongroupKeyword(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        let functiongroupCount = 0;
        let firstFunctiongroupLine = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('def functiongroup')) {
                functiongroupCount++;
                if (firstFunctiongroupLine === -1) {
                    firstFunctiongroupLine = i;
                }
            }
        }

        if (functiongroupCount === 0) {
            const range = new vscode.Range(0, 0, 0, 0);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Functions file must contain exactly one "def functiongroup" declaration',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-functiongroup-keyword';
            this.diagnostics.push(diagnostic);
        } else if (functiongroupCount > 1) {
            const firstLine = lines[firstFunctiongroupLine];
            const range = new vscode.Range(firstFunctiongroupLine, 0, firstFunctiongroupLine, firstLine ? firstLine.length : 0);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Multiple "def functiongroup" declarations found (${functiongroupCount}). Only one is allowed per file.`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'multiple-functiongroup-keywords';
            this.diagnostics.push(diagnostic);
        }
    }



    private async validateFunctionsHierarchicalIndentation(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        let functiongroupIndent = -1;
        let inFunctiongroup = false;
        const functionStack: Array<{indentLevel: number, lineIndex: number, name: string}> = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || line.trim().length === 0 || line.trim().startsWith('//')) continue;
            
            const trimmedLine = line.trim();
            const indentLevel = this.getIndentLevel(line);
            
            // Check functiongroup indentation
            if (trimmedLine.startsWith('def functiongroup')) {
                if (indentLevel !== 0) {
                    this.addDiagnostic(i, 0, indentLevel, `functiongroup must start at column 0. Found ${indentLevel} tabs.`, 'invalid-functiongroup-indentation');
                }
                functiongroupIndent = indentLevel;
                inFunctiongroup = true;
                continue;
            }
            
            // Check function definitions
            const functionMatch = trimmedLine.match(/^def\s+function\s+(\w+)/);
            if (functionMatch && functionMatch[1]) {
                const functionName = functionMatch[1];
                
                // Validate function indentation hierarchy
                if (functiongroupIndent === -1) {
                    this.addDiagnostic(i, 0, line.length, 'Function definition found before functiongroup declaration', 'function-before-functiongroup');
                    continue;
                }
                
                // Check if indentation is valid (must be at least 1 tab deeper than functiongroup)
                const expectedMinIndent = functiongroupIndent + 1; // First level functions
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
            
            // Check property indentation (name, description, owner, tags, partof, enables, safetylevel, category)
            const propertyMatch = trimmedLine.match(/^(name|description|owner|tags|partof|enables|safetylevel|category|allocatedto)\s/);
            if (propertyMatch && propertyMatch[1]) {
                // Properties are allowed either:
                // 1. Inside a function definition (functionStack.length > 0)
                // 2. Directly under the functiongroup (inFunctiongroup && functionStack.length === 0)
                const isInsideFunction = functionStack.length > 0;
                const isUnderFunctiongroup = inFunctiongroup && functionStack.length === 0;
                
                if (!isInsideFunction && !isUnderFunctiongroup) {
                    this.addDiagnostic(i, 0, line.length, 'Property found outside of functiongroup or function definition', 'property-outside-scope');
                    continue;
                }
                
                // For properties under functiongroup, expect 1 level deeper than functiongroup
                if (isUnderFunctiongroup) {
                    const expectedIndent = functiongroupIndent + 1;
                    if (indentLevel !== expectedIndent) {
                        this.addDiagnostic(i, 0, indentLevel, `Property '${propertyMatch[1]}' must be indented 1 level deeper than functiongroup. Expected: ${expectedIndent}, found: ${indentLevel}`, 'property-incorrect-indentation');
                    }
                    continue;
                }
                
                // For properties inside function, check against parent function
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