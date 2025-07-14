import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';

export class FunctionsValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig) {
        super(languageConfig);
    }

    protected getDefinitionKeywords(): string[] {
        return ['functiongroup', 'function'];
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

        // Validate asil property
        if (trimmedLine.startsWith('asil ')) {
            await this.validateAsilProperty(lineIndex, trimmedLine);
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
        await this.validateFunctionsHierarchicalIndentation(document);
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

    private async validateAsilProperty(lineIndex: number, trimmedLine: string): Promise<void> {
        const asilMatch = trimmedLine.match(/^asil\s+(.+)$/);
        if (!asilMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid asil property. Expected format: asil <level>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-asil-property';
            this.diagnostics.push(diagnostic);
            return;
        }

        const asilValue = asilMatch[1]?.trim();
        if (!asilValue) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'asil value is required',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-asil-value';
            this.diagnostics.push(diagnostic);
            return;
        }

        // Define valid ASIL levels
        const validAsilValues = ['A', 'B', 'C', 'D', 'QM'];
        
        if (!validAsilValues.includes(asilValue)) {
            const range = new vscode.Range(lineIndex, trimmedLine.indexOf(asilValue), lineIndex, trimmedLine.indexOf(asilValue) + asilValue.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid asil value '${asilValue}'. Valid values are: ${validAsilValues.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-asil-value';
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

    private async validateFileStartsWithFunctiongroup(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        // Find the first non-empty, non-comment line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0 || trimmedLine.startsWith('//')) continue;
            
            // This is the first meaningful line
            if (!trimmedLine.startsWith('def functiongroup')) {
                const range = new vscode.Range(i, 0, i, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    'Functions file must start with "def functiongroup" declaration',
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'file-must-start-with-functiongroup';
                this.diagnostics.push(diagnostic);
            }
            return; // We only check the first meaningful line
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
        
        let systemfunctionsIndent = -1;
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
                systemfunctionsIndent = indentLevel;
                continue;
            }
            
            // Check function definitions
            const functionMatch = trimmedLine.match(/^def\s+function\s+(\w+)/);
            if (functionMatch && functionMatch[1]) {
                const functionName = functionMatch[1];
                
                // Validate function indentation hierarchy
                if (systemfunctionsIndent === -1) {
                    this.addDiagnostic(i, 0, line.length, 'Function definition found before functiongroup declaration', 'function-before-functiongroup');
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
            
            // Check property indentation (name, description, owner, tags, partof, asil, enables)
            const propertyMatch = trimmedLine.match(/^(name|description|owner|tags|partof|asil|enables)\s/);
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