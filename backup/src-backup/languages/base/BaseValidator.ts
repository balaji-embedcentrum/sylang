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
            console.log(`[${this.languageConfig.id}] Import errors:`, importValidation.errors.map(e => e.message));
            // Convert import errors to diagnostics
            importValidation.errors.forEach(error => {
                const diagnostic = new vscode.Diagnostic(
                    error.range,
                    error.message,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'import-error';
                this.diagnostics.push(diagnostic);
            });
        }
        if (importValidation.warnings.length > 0) {
            console.log(`[${this.languageConfig.id}] Import warnings:`, importValidation.warnings.map(w => w.message));
            // Convert import warnings to diagnostics  
            importValidation.warnings.forEach(warning => {
                const diagnostic = new vscode.Diagnostic(
                    warning.range,
                    warning.message,
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

        // Validate single header def keyword per file
        await this.validateSingleHeaderDefKeywordInternal(document);

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
        // Skip definition lines (they start with 'def')
        if (trimmedLine.startsWith('def ')) {
            return;
        }
        
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
        // Skip definition lines (they start with 'def')
        if (trimmedLine.startsWith('def ')) {
            return;
        }
        
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

    // Validate that header def keywords appear only once per file
    private async validateSingleHeaderDefKeywordInternal(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        const headerKeywordCounts: { [key: string]: number[] } = {};
        
        // Get header keywords for this file type
        const headerKeywords = this.getHeaderDefKeywords();
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0 || trimmedLine.startsWith('//')) continue;
            
            // Check for header def patterns
            for (const keyword of headerKeywords) {
                if (trimmedLine.startsWith(`def ${keyword} `)) {
                    if (!headerKeywordCounts[keyword]) {
                        headerKeywordCounts[keyword] = [];
                    }
                    headerKeywordCounts[keyword].push(i);
                }
            }
        }
        
        // Check for multiple occurrences
        for (const [keyword, lineIndices] of Object.entries(headerKeywordCounts)) {
            if (lineIndices.length > 1) {
                // Mark all occurrences after the first as errors
                for (let i = 1; i < lineIndices.length; i++) {
                    const lineIndex = lineIndices[i];
                    const line = lines[lineIndex];
                    if (line) {
                        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            `Only one 'def ${keyword}' declaration is allowed per file`,
                            vscode.DiagnosticSeverity.Error
                        );
                        diagnostic.code = 'multiple-header-definitions';
                        this.diagnostics.push(diagnostic);
                    }
                }
            }
        }
    }

    // Get header def keywords for each file type
    protected getHeaderDefKeywords(): string[] {
        const fileExtension = this.languageConfig.extensions[0];
        switch (fileExtension) {
            case '.ple': return ['productline'];
            case '.fun': return ['functiongroup'];
            case '.fml': return ['featureset'];
            case '.vml': return ['variantmodel'];
            case '.vcf': return ['configset'];
            case '.req': return ['reqsection'];
            case '.blk': return ['block'];
            case '.tst': return ['testsuite'];
            case '.fma': return ['failuremodeanalysis'];
            case '.fmc': return ['controlmeasures'];
            case '.fta': return ['faulttreeanalysis'];
            case '.itm': case '.sgl': case '.haz': return ['hazardidentification', 'safetygoal', 'hazard'];
            case '.rsk': return ['riskassessment'];
            default: return [];
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

        // Validate use keyword restrictions for specific file types
        if (trimmedLine.startsWith('use ')) {
            const fileExtension = this.languageConfig.extensions[0];
            if (fileExtension === '.ple' || fileExtension === '.fml') {
                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `'use' keyword is not allowed in ${fileExtension} files. These files can only start with 'def'.`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'use-not-allowed';
                this.diagnostics.push(diagnostic);
            }
        }

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

        // Validate string quotes - TEMPORARILY DISABLED to fix false positives
        // TODO: Fix quote validation logic
        /*
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
        */

        // Validate basic indentation (tabs vs spaces)
        this.validateBasicIndentation(line, lineIndex);

        // Validate keyword spelling
        this.validateKeywordSpelling(document, lineIndex, line);

        // Validate config property syntax
        const indent = this.getIndentLevel(line);
        if (trimmedLine.startsWith('config ')) {
            const configMatch = trimmedLine.match(/^config\s+(c_[A-Za-z0-9_]+)$/);
            if (!configMatch) {
                this.addDiagnostic(
                    lineIndex,
                    indent,
                    trimmedLine.length,
                    'Config property must reference a valid config name (c_FeatureName)',
                    'invalid-config-reference'
                );
            } else {
                const configName = configMatch[1];
                if (!configName.startsWith('c_')) {
                    this.addDiagnostic(
                        lineIndex,
                        indent,
                        configName.length,
                        'Config names must start with "c_" prefix',
                        'invalid-config-name'
                    );
                }
            }
        }
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
        
        // If using spaces, validate they are consistent (2 or 4 spaces per level)
        if (leadingWhitespace.includes(' ') && !leadingWhitespace.includes('\t')) {
            const spaceCount = leadingWhitespace.length;
            if (spaceCount > 0 && spaceCount % 2 !== 0) {
                this.addDiagnostic(lineIndex, 0, leadingWhitespace.length, 'Use consistent indentation (2 or 4 spaces per level, or tabs).', 'inconsistent-indentation');
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
            // Count the number of tab characters
            return (leadingWhitespace.match(/\t/g) || []).length;
        }
        
        // If using spaces, be flexible - accept both 2 and 4 space indentation
        if (leadingWhitespace.includes(' ') && !leadingWhitespace.includes('\t')) {
            // Try 4 spaces first, then 2 spaces
            if (leadingWhitespace.length % 4 === 0) {
                return leadingWhitespace.length / 4; // 4 spaces = 1 level
            } else if (leadingWhitespace.length % 2 === 0) {
                return leadingWhitespace.length / 2; // 2 spaces = 1 level
            } else {
                return Math.floor(leadingWhitespace.length / 2); // Fallback to 2-space logic
            }
        }
        
        // Mixed or no indentation
        return 0;
    }

    protected extractSafetyLevel(line: string): string | null {
        const match = line.match(/safetylevel\s+(\S+)/);
        return match && match[1] !== undefined ? match[1] : null;
    }

    protected hasProperQuoting(line: string): boolean {
        // Skip validation for lines that are properly structured property declarations
        const trimmedLine = line.trim();
        
        // Check for property pattern: property "value" or property "value1", "value2"
        const propertyMatch = trimmedLine.match(/^(description|name|owner|tags|domain|compliance|region|firstrelease)\s+(.+)$/);
        if (!propertyMatch) {
            return true; // Not a property line, skip validation
        }
        
        const propertyValue = propertyMatch[2].trim();
        
        // Check if all string values are properly quoted
        // Match all quoted strings in the line
        const quotedStrings = propertyValue.match(/"[^"]*"/g);
        if (!quotedStrings) {
            // No quoted strings found, but there should be some for these properties
            return false;
        }
        
        // Remove all quoted strings and check if there's anything significant left
        let remaining = propertyValue;
        quotedStrings.forEach(quoted => {
            remaining = remaining.replace(quoted, '');
        });
        
        // Remove commas and whitespace
        remaining = remaining.replace(/[,\s]/g, '');
        
        // If there's anything left (unquoted text), it's invalid
        return remaining.length === 0;
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

        // Check first word if it's supposed to be a keyword - FLAG ALL INVALID KEYWORDS IMMEDIATELY
        if (keywordToCheck && !this.languageConfig.keywords.includes(keywordToCheck)) {
            // Skip identifier lines (constraint lines like "FeatureName requires AnotherFeature")
            if (words.length >= 3 && (words[1] === 'requires' || words[1] === 'excludes')) {
                return; // This is a constraint line, not a keyword line
            }
            
            // Skip lines that are clearly identifiers/values (like quoted strings after properties)
            if (keywordToCheck.match(/^[A-Z][a-zA-Z0-9_]*$/) && words.length === 1) {
                return; // Single identifier, likely a reference
            }
            
            // Flag as error - ANY unrecognized keyword should be flagged immediately
                const idx = line.indexOf(keywordToCheck);
                if (idx !== -1) {
                    const range = new vscode.Range(lineIndex, idx, lineIndex, idx + keywordToCheck.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                    `Invalid keyword '${keywordToCheck}' for ${this.languageConfig.id} files. Check valid keywords.`,
                        vscode.DiagnosticSeverity.Error
                    );
                diagnostic.code = 'invalid-keyword';
                    this.diagnostics.push(diagnostic);
            }
        }
    }
} 

