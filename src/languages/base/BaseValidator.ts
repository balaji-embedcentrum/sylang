import * as vscode from 'vscode';
import { LanguageConfig } from '../../config/LanguageConfigs';
import { SymbolManager } from '../../core/SymbolManager';

export abstract class BaseValidator {
    protected languageConfig: LanguageConfig;
    protected diagnostics: vscode.Diagnostic[] = [];
    protected symbolManager: SymbolManager;

    constructor(languageConfig: LanguageConfig, symbolManager: SymbolManager) {
        this.languageConfig = languageConfig;
        this.symbolManager = symbolManager;
    }

    // Main validation entry point
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const packageJson = require('../../../package.json');
        console.log(`[${this.languageConfig.id}] ===== VALIDATING DOCUMENT (Extension v${packageJson.version}) =====`);
        console.log(`[${this.languageConfig.id}] File: ${document.fileName}`);

        this.diagnostics = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Parse document with imports and get available symbols
        await this.symbolManager.parseDocumentWithImports(document, this.languageConfig);
        const documentUri = document.uri.toString();
        const availableSymbols = this.symbolManager.getAvailableSymbols(documentUri);
        const documentImports = this.symbolManager.getDocumentImports(documentUri);
        console.log(`[${this.languageConfig.id}] Imports:`, documentImports.map(i => `${i.keyword} ${i.identifier}`));
        console.log(`[${this.languageConfig.id}] Total available symbols:`, availableSymbols.length);

        // Validate imports first
        const importValidation = this.symbolManager.validateImports(documentUri);
        if (importValidation.errors.length > 0) {
            console.log(`[${this.languageConfig.id}] Import errors:`, importValidation.errors);
            // Convert import errors to diagnostics
            importValidation.errors.forEach(error => {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(0, 0, 0, 100),
                    error,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'import-error';
                this.diagnostics.push(diagnostic);
            });
        }
        if (importValidation.warnings.length > 0) {
            console.log(`[${this.languageConfig.id}] Import warnings:`, importValidation.warnings);
            // Convert import warnings to diagnostics  
            importValidation.warnings.forEach(warning => {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(0, 0, 0, 100),
                    warning,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = 'import-warning';
                this.diagnostics.push(diagnostic);
            });
        }

        // Validate each line
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0 || trimmedLine.startsWith('//')) continue;

            // Skip import lines (already validated above)
            if (trimmedLine.startsWith('use ')) continue;

            // Validate def keyword requirement
            await this.validateDefKeywordRequirement(lineIndex, trimmedLine);

            // Validate references to definitions (now import-aware)
            await this.validateImportAwareReferences(lineIndex, trimmedLine, document.uri.toString());

            // Common validations
            await this.validateCommonRules(document, lineIndex, line);

            // Language-specific validations (implemented by subclasses)
            await this.validateLanguageSpecificRules(document, lineIndex, line);
        }

        // Document-level validations (implemented by subclasses)
        await this.validateDocumentLevelRules(document);

        console.log(`[${this.languageConfig.id}] ===== VALIDATION COMPLETE =====`);
        console.log(`[${this.languageConfig.id}] Found ${this.diagnostics.length} validation issues`);

        return this.diagnostics;
    }

    // Collect all definitions (only from 'def' lines)
    private collectDefinitions(lines: string[]): Set<string> {
        const definitions = new Set<string>();
        
        for (const line of lines) {
            if (!line) continue;
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0 || trimmedLine.startsWith('//')) continue;
            
            // Only lines starting with 'def' are definitions
            if (trimmedLine.startsWith('def ')) {
                const defMatch = trimmedLine.match(/^def\s+\w+\s+(\w+)/);
                if (defMatch && defMatch[1]) {
                    definitions.add(defMatch[1]);
                }
            }
        }
        
        return definitions;
    }

    // Validate that definitions must start with 'def'
    private async validateDefKeywordRequirement(lineIndex: number, trimmedLine: string): Promise<void> {
        const definitionKeywords = this.getDefinitionKeywords();
        
        for (const keyword of definitionKeywords) {
            if (trimmedLine.startsWith(`${keyword} `) && !trimmedLine.startsWith('def ')) {
                const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Definitions must start with 'def'. Example: 'def ${keyword} Name'`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'missing-def-keyword';
                this.diagnostics.push(diagnostic);
            }
        }
    }

    // Validate references to definitions
    private async validateReferences(lineIndex: number, trimmedLine: string, definitions: Set<string>): Promise<void> {
        // Check for potential constraint patterns (including typos)
        const constraintMatch = trimmedLine.match(/^(\w+)\s+(\w+)\s+(\w+)/);
        if (constraintMatch) {
            const source = constraintMatch[1];
            const constraintKeyword = constraintMatch[2];
            const target = constraintMatch[3];
            
            // Ensure all parts are defined
            if (!source || !constraintKeyword || !target) {
                return;
            }
            
            // Check if it's a valid constraint keyword
            if (['requires', 'excludes'].includes(constraintKeyword)) {
                // Valid constraint - check symbol references
                if (!definitions.has(source)) {
                    const range = new vscode.Range(lineIndex, 0, lineIndex, source.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Reference to undefined symbol: ${source}`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-symbol-reference';
                    this.diagnostics.push(diagnostic);
                }
                
                if (!definitions.has(target)) {
                    const start = trimmedLine.indexOf(target);
                    const range = new vscode.Range(lineIndex, start, lineIndex, start + target.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Reference to undefined symbol: ${target}`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-symbol-reference';
                    this.diagnostics.push(diagnostic);
                }
            } else {
                // Check if it's a typo of a constraint keyword
                const possibleTypos = ['requires', 'excludes'];
                const suggestion = possibleTypos.find(keyword => 
                    this.isLikelyTypo(constraintKeyword, keyword)
                );
                
                if (suggestion) {
                    const start = trimmedLine.indexOf(constraintKeyword);
                    const range = new vscode.Range(lineIndex, start, lineIndex, start + constraintKeyword.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Unknown constraint keyword '${constraintKeyword}'. Did you mean '${suggestion}'?`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'unknown-constraint-keyword';
                    this.diagnostics.push(diagnostic);
                }
            }
        }
    }

    // Import-aware validation of symbol references
    private async validateImportAwareReferences(lineIndex: number, trimmedLine: string, documentUri: string): Promise<void> {
        // Check for potential constraint patterns (including typos)
        const constraintMatch = trimmedLine.match(/^(\w+)\s+(\w+)\s+(\w+)/);
        if (constraintMatch) {
            const source = constraintMatch[1];
            const constraintKeyword = constraintMatch[2];
            const target = constraintMatch[3];
            
            // Ensure all parts are defined
            if (!source || !constraintKeyword || !target) {
                return;
            }
            
            // Check if it's a valid constraint keyword
            if (['requires', 'excludes'].includes(constraintKeyword)) {
                // Valid constraint - check symbol references using import-aware symbol availability
                if (!this.symbolManager.isSymbolAvailable(source, documentUri)) {
                    const range = new vscode.Range(lineIndex, 0, lineIndex, source.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Reference to undefined symbol: ${source}. Make sure it's defined locally or imported.`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-symbol-reference';
                    this.diagnostics.push(diagnostic);
                }
                
                if (!this.symbolManager.isSymbolAvailable(target, documentUri)) {
                    const start = trimmedLine.indexOf(target);
                    const range = new vscode.Range(lineIndex, start, lineIndex, start + target.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Reference to undefined symbol: ${target}. Make sure it's defined locally or imported.`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-symbol-reference';
                    this.diagnostics.push(diagnostic);
                }
            } else {
                // Check if it's a typo of a constraint keyword
                const possibleTypos = ['requires', 'excludes'];
                const suggestion = possibleTypos.find(keyword => 
                    this.isLikelyTypo(constraintKeyword, keyword)
                );
                
                if (suggestion) {
                    const start = trimmedLine.indexOf(constraintKeyword);
                    const range = new vscode.Range(lineIndex, start, lineIndex, start + constraintKeyword.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Unknown constraint keyword '${constraintKeyword}'. Did you mean '${suggestion}'?`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'unknown-constraint-keyword';
                    this.diagnostics.push(diagnostic);
                }
            }
        }
    }

    // Helper method to detect likely typos
    private isLikelyTypo(actual: string, expected: string): boolean {
        // Simple Levenshtein distance check for common typos
        if (Math.abs(actual.length - expected.length) > 2) return false;
        
        // Check for character substitutions, insertions, deletions
        let distance = 0;
        const maxDistance = Math.min(actual.length, expected.length) / 2;
        
        for (let i = 0, j = 0; i < actual.length && j < expected.length; i++, j++) {
            if (actual[i] !== expected[j]) {
                distance++;
                if (distance > maxDistance) return false;
                
                // Try skipping a character in either string
                if (i + 1 < actual.length && actual[i + 1] === expected[j]) {
                    i++; // Skip character in actual
                } else if (j + 1 < expected.length && actual[i] === expected[j + 1]) {
                    j++; // Skip character in expected
                }
            }
        }
        
        return distance <= maxDistance;
    }

    // Common validation rules that apply to all file types
    private async validateCommonRules(document: vscode.TextDocument, lineIndex: number, line: string): Promise<void> {
        const trimmedLine = line.trim();

        // Validate safety levels
        if (trimmedLine.includes('safetylevel')) {
            const safetyLevel = this.extractSafetyLevel(trimmedLine);
            if (safetyLevel && !['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'].includes(safetyLevel)) {
                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Invalid safety level: ${safetyLevel}. Valid values are: ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'invalid-safety-level';
                this.diagnostics.push(diagnostic);
            }
        }

        // Validate string quotes
        if (trimmedLine.includes('description') || trimmedLine.includes('name') || trimmedLine.includes('owner')) {
            if (!this.hasProperQuoting(trimmedLine)) {
                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    'String values should be enclosed in quotes',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = 'missing-quotes';
                this.diagnostics.push(diagnostic);
            }
        }

        // Validate basic indentation (tabs vs spaces)
        this.validateBasicIndentation(line, lineIndex);

        // Validate keyword spelling
        this.validateKeywordSpelling(document, lineIndex, line);
    }

    // Abstract methods that subclasses must implement
    protected abstract validateLanguageSpecificRules(
        document: vscode.TextDocument, 
        lineIndex: number, 
        line: string
    ): Promise<void>;

    protected abstract validateDocumentLevelRules(document: vscode.TextDocument): Promise<void>;

    protected abstract getDefinitionKeywords(): string[];

    // Helper method to add diagnostics
    protected addDiagnostic(lineIndex: number, startChar: number, length: number, message: string, code: string, severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Error): void {
        const range = new vscode.Range(lineIndex, startChar, lineIndex, startChar + length);
        const diagnostic = new vscode.Diagnostic(range, message, severity);
        diagnostic.code = code;
        this.diagnostics.push(diagnostic);
    }

    // Basic indentation validation - accepts both tabs OR 2-space indentation
    protected validateBasicIndentation(line: string, lineIndex: number): void {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0 || trimmedLine.startsWith('//')) return;

        const leadingWhitespace = line.match(/^(\s*)/)?.[1] || '';
        if (leadingWhitespace.length === 0) return; // No indentation to validate
        
        // Check if tabs and spaces are mixed
        if (leadingWhitespace.includes('\t') && leadingWhitespace.includes(' ')) {
            this.addDiagnostic(lineIndex, 0, leadingWhitespace.length, 'Do not mix tabs and spaces for indentation. Use either tabs OR 2-space indentation consistently.', 'mixed-indentation');
            return;
        }
        
        // If using spaces, validate they are in groups of 2
        if (leadingWhitespace.includes(' ') && !leadingWhitespace.includes('\t')) {
            if (leadingWhitespace.length % 2 !== 0) {
                this.addDiagnostic(lineIndex, 0, leadingWhitespace.length, 'When using spaces for indentation, use exactly 2 spaces per indentation level. Tabs are also acceptable.', 'invalid-space-indentation');
            }
        }
        
        // If using tabs, that's fine (no additional validation needed)
    }

    // Common property validation for all file types
    protected isPropertyLine(line: string): boolean {
        const propertyKeywords = [
            'description', 'owner', 'domain', 'compliance', 'firstrelease', 
            'tags', 'safetylevel', 'region', 'name', 'variability', 'assetname'
        ];
        return propertyKeywords.some(keyword => line.startsWith(`${keyword} `));
    }

    // Utility methods
    protected getIndentLevel(line: string): number {
        const leadingWhitespace = line.match(/^(\s*)/)?.[1] || '';
        
        // If using tabs, count them directly
        if (leadingWhitespace.includes('\t') && !leadingWhitespace.includes(' ')) {
            return leadingWhitespace.length; // Each tab = 1 level
        }
        
        // If using spaces, count groups of 2
        if (leadingWhitespace.includes(' ') && !leadingWhitespace.includes('\t')) {
            return Math.floor(leadingWhitespace.length / 2); // Each 2 spaces = 1 level
        }
        
        // Mixed or no indentation
        return 0;
    }

    protected extractSafetyLevel(line: string): string | null {
        const match = line.match(/safetylevel\s+(\S+)/);
        return match && match[1] !== undefined ? match[1] : null;
    }

    protected hasProperQuoting(line: string): boolean {
        const afterColon = line.split(':')[1] || line.split(' ').slice(1).join(' ');
        const trimmed = afterColon.trim();
        return trimmed.startsWith('"') && trimmed.endsWith('"');
    }



    private validateKeywordSpelling(_document: vscode.TextDocument, lineIndex: number, line: string): void {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0 || trimmedLine.startsWith('//')) return;

        const words = trimmedLine.split(/\s+/);
        let keywordToCheck = words[0];
        
        // If line starts with 'def', check the second word as the keyword
        if (keywordToCheck === 'def' && words.length > 1) {
            keywordToCheck = words[1];
            if (keywordToCheck && !this.languageConfig.keywords.includes(keywordToCheck)) {
                const idx = line.indexOf(keywordToCheck);
                if (idx !== -1) {
                    const range = new vscode.Range(lineIndex, idx, lineIndex, idx + keywordToCheck.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Unknown keyword after 'def': '${keywordToCheck}'`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'unknown-keyword';
                    this.diagnostics.push(diagnostic);
                }
            }
            return;
        }

        // Skip identifier lines (they start with identifiers, not keywords)
        // These are constraint lines like "FeatureName requires AnotherFeature"
        if (words.length >= 3 && (words[1] === 'requires' || words[1] === 'excludes' || 
            words.some(word => ['requires', 'excludes'].includes(word)))) {
            return; // This is a constraint line, not a keyword line
        }

        // Check first word if it's supposed to be a keyword
        if (keywordToCheck && !this.languageConfig.keywords.includes(keywordToCheck)) {
            // Only flag as error if this looks like it should be a keyword line
            // (not an identifier at the start of a constraint)
            const isDefinitionKeyword = this.getDefinitionKeywords().some(kw => 
                keywordToCheck && this.isLikelyTypo(keywordToCheck, kw)
            );
            const isLanguageKeyword = this.languageConfig.keywords.some(kw => 
                keywordToCheck && this.isLikelyTypo(keywordToCheck, kw)
            );
            
            if (isDefinitionKeyword || isLanguageKeyword) {
                const idx = line.indexOf(keywordToCheck);
                if (idx !== -1) {
                    const range = new vscode.Range(lineIndex, idx, lineIndex, idx + keywordToCheck.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Unknown keyword '${keywordToCheck}'`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'unknown-keyword';
                    this.diagnostics.push(diagnostic);
                }
            }
        }
    }
} 

