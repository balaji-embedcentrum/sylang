import * as vscode from 'vscode';

export class HazardValidator {
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let hasHazardIdentification = false;
        let hasHazardCategories = false;
        let hasSubsystemHazards = false;
        let contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.replace(/\r$/, '');
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(line);

            // Adjust context stack for dedent
            while (level < contextStack.length) {
                contextStack.pop();
            }

            // Unexpected indent
            if (level > contextStack.length) {
                this.addError(diagnostics, lineIndex, `Unexpected indentation. Expected level ${contextStack.length}, got ${level}`);
                continue;
            }

            // Root level: def hazardidentification
            if (level === 0) {
                if (trimmedLine.startsWith('def hazardidentification ')) {
                    const parts = trimmedLine.split(/\s+/);
                    if (parts.length < 3 || !parts[2] || !/^[A-Z][A-Za-z0-9_]*$/.test(parts[2])) {
                        this.addError(diagnostics, lineIndex, 'Invalid hazardidentification declaration: "def hazardidentification <PascalCaseIdentifier>"');
                    }
                    contextStack = ['hazardidentification'];
                    hasHazardIdentification = true;
                } else if (trimmedLine.startsWith('use ')) {
                    // Allow import statements at root level - skip validation for now
                    continue;
                } else {
                    this.addError(diagnostics, lineIndex, '.haz files must start with "def hazardidentification <identifier>" (imports with "use" keyword are allowed before)');
                }
                continue;
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                const parts = trimmedLine.split(/\s+/);
                const defType = parts[1];
                const identifier = parts[2];
                const hasInlineDesc = trimmedLine.match(/\s+"[^"]*"$/) != null;

                // Validate identifier
                if (identifier && !/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
                    this.addError(diagnostics, lineIndex, `Identifier "${identifier}" should use PascalCase`);
                }

                const validBlockDefs = this.getValidBlockDefs(currentContext);
                const validInlineDefs = this.getValidInlineDefs(currentContext);

                if (defType && validInlineDefs.includes(defType)) {
                    if (!hasInlineDesc) {
                        this.addError(diagnostics, lineIndex, `Inline definition must include description: "def ${defType} <identifier> "description""`);
                    } else if (parts.length < 4) {
                        this.addError(diagnostics, lineIndex, `Invalid inline definition: "def ${defType} <identifier> "description""`);
                    }
                } else if (defType && validBlockDefs.includes(defType)) {
                    if (hasInlineDesc) {
                        this.addError(diagnostics, lineIndex, `Block definition should not include inline description; use indented 'description' property`);
                    } else if (parts.length < 3) {
                        this.addError(diagnostics, lineIndex, `Definition must have an identifier: "def ${defType} <identifier>"`);
                    }
                    contextStack.push(defType);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid def type "${defType}" in ${currentContext}. Valid types: ${[...validBlockDefs, ...validInlineDefs].join(', ')}`);
                }
            } else if (trimmedLine.startsWith('subsystem ')) {
                // Handle subsystem declarations in subsystemhazards section
                if (currentContext === 'subsystemhazards') {
                    const subsystemName = trimmedLine.substring(10).trim();
                    if (!subsystemName || !/^[A-Z][A-Za-z0-9_]*$/.test(subsystemName)) {
                        this.addError(diagnostics, lineIndex, `Invalid subsystem name "${subsystemName}". Use PascalCase`);
                    } else {
                        contextStack.push('subsystem');
                    }
                } else {
                    this.addError(diagnostics, lineIndex, `"subsystem" keyword can only be used in "subsystemhazards" section`);
                }
            } else {
                const keywordMatch = trimmedLine.split(' ')[0];
                if (!keywordMatch) continue;
                
                const keyword = keywordMatch;
                const validContainers = this.getValidContainers(currentContext);
                const validProperties = this.getValidProperties(currentContext);

                if (validContainers.includes(keyword)) {
                    const identified = this.identifyKeyword(keyword);
                    if (identified !== keyword) {
                        this.addWarning(diagnostics, lineIndex, `Possible typo in "${keyword}" - assuming "${identified}"`);
                    }
                    contextStack.push(identified || keyword);
                    if (identified === 'hazardcategories') hasHazardCategories = true;
                    if (identified === 'subsystemhazards') hasSubsystemHazards = true;
                } else if (validProperties.includes(keyword) || this.isIdentifierListContext(currentContext)) {
                    this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, keyword);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid keyword "${keyword}" in ${currentContext}. Valid: ${[...validContainers, ...validProperties].join(', ')}`);
                }
            }
        }

        // Check required sections
        if (!hasHazardIdentification) this.addError(diagnostics, 0, '.haz files must contain "def hazardidentification <identifier>"');
        if (!hasHazardCategories) this.addError(diagnostics, 0, '.haz files must contain a "hazardcategories" section');
        if (!hasSubsystemHazards) this.addError(diagnostics, 0, '.haz files must contain a "subsystemhazards" section');

        return diagnostics;
    }

    private getValidBlockDefs(context: string): string[] {
        switch (context) {
            case 'hazardcategories': return ['category'];
            case 'subsystemhazards': return ['hazard'];
            case 'subsystem': return ['hazard']; // Allow hazards inside subsystems
            case 'systemlevelhazards': return ['hazard'];
            case 'environmentalhazards': return ['hazard'];
            case 'usagehazards': return ['hazard'];
            default: return [];
        }
    }

    private getValidInlineDefs(context: string): string[] {
        return []; // No inline defs in .haz sample
    }

    private getValidContainers(context: string): string[] {
        switch (context) {
            case 'hazardidentification': return ['hazardcategories', 'subsystemhazards', 'systemlevelhazards', 'environmentalhazards', 'usagehazards'];
            default: return [];
        }
    }

    private getValidProperties(context: string): string[] {
        switch (context) {
            case 'hazardidentification': return ['name', 'description', 'hazardanalysis', 'methodology'];
            case 'category': return ['description', 'severity'];
            case 'hazard': return ['name', 'description', 'cause', 'effect', 'category', 'function', 'mitigation'];
            case 'subsystem': return []; // Subsystems only contain hazard definitions
            default: return [];
        }
    }

    private isIdentifierListContext(context: string): boolean {
        return false; // No identifier lists in .haz sample
    }

    private validatePropertyLine(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, context: string, keyword: string): void {

        switch (keyword) {
            case 'name':
            case 'description':
            case 'cause':
            case 'effect':
            case 'severity':
            case 'mitigation':
                this.validateQuotedString(diagnostics, lineIndex, line, keyword);
                break;
            case 'methodology':
                this.validateQuotedList(diagnostics, lineIndex, line, keyword);
                break;
            case 'function':
                this.validateFunctionsList(diagnostics, lineIndex, line, keyword);
                break;
            case 'hazardanalysis':
                this.validateIdentifier(diagnostics, lineIndex, line, keyword);
                break;
            case 'category':
                this.validateIdentifierList(diagnostics, lineIndex, line, keyword);
                break;
            default:
                this.addError(diagnostics, lineIndex, `Invalid property "${keyword}" in ${context}`);
        }
    }

    private validateQuotedString(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+"[^"]*"$`))) {
            this.addError(diagnostics, lineIndex, `${keyword} must be a quoted string: ${keyword} "text"`);
        }
    }

    private validateQuotedList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+"[^"]*"(,\\s*"[^"]*")*$`))) {
            this.addError(diagnostics, lineIndex, `${keyword} must be quoted strings: ${keyword} "Item1", "Item2"`);
        }
    }

    private validateFunctionsList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+[A-Z][A-Za-z0-9_]+(,\\s*[A-Z][A-Za-z0-9_]+)*$`))) {
            this.addError(diagnostics, lineIndex, `${keyword} must be PascalCase identifiers: ${keyword} IDENTIFIER1, IDENTIFIER2`);
        }
    }

    private validateIdentifierList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+[A-Z][A-Za-z0-9_]+(,\\s*[A-Z][A-Za-z0-9_]+)*$`))) {
            this.addError(diagnostics, lineIndex, `${keyword} must be PascalCase identifiers: ${keyword} IDENTIFIER1, IDENTIFIER2`);
        }
    }

    private validateIdentifier(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+[A-Z][A-Za-z0-9_]+$`))) {
            this.addError(diagnostics, lineIndex, `${keyword} must reference a PascalCase identifier: ${keyword} IDENTIFIER`);
        }
    }

    private getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        if (!match) return 0;
        const indent = match[0].replace(/\t/g, '  ').length;
        return Math.floor(indent / 2);
    }

    private addError(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        diagnostics.push(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error));
    }

    private addWarning(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        diagnostics.push(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning));
    }

    private identifyKeyword(keyword: string): string {
        const validKeywords = ['hazardcategories', 'subsystemhazards', 'systemlevelhazards', 'environmentalhazards', 'usagehazards'];
        if (validKeywords.includes(keyword)) return keyword;

        for (const valid of validKeywords) {
            if (this.levenshteinDistance(keyword, valid) <= 2) {
                return valid;
            }
        }
        return keyword;
    }

    private levenshteinDistance(a: string, b: string): number {
        // Simple string similarity check for typo detection
        if (a === b) return 0;
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        // Use a simpler approach to avoid TypeScript matrix issues
        let changes = 0;
        const maxLen = Math.max(a.length, b.length);
        
        for (let i = 0; i < maxLen; i++) {
            if (a[i] !== b[i]) {
                changes++;
            }
        }
        
        return changes;
    }
}