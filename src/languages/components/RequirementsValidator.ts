import * as vscode from 'vscode';

export class RequirementsValidator {
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let hasReqSection = false;
        let contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            const cleanLine = line.replace(/\r$/, '');
            const trimmedLine = cleanLine.trim();
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

            // Root level: def reqsection
            if (level === 0) {
                if (trimmedLine.startsWith('def reqsection ')) {
                    const parts = trimmedLine.split(/\s+/);
                    if (parts.length < 3 || !parts[2] || !/^[A-Z][A-Za-z0-9_]*$/.test(parts[2])) {
                        this.addError(diagnostics, lineIndex, 'Invalid reqsection declaration: "def reqsection <PascalCaseIdentifier>"');
                    }
                    contextStack = ['reqsection'];
                    hasReqSection = true;
                } else if (trimmedLine.startsWith('use ')) {
                    // Allow import statements at root level - skip validation for now
                    continue;
                } else {
                    this.addError(diagnostics, lineIndex, '.req files must start with "def reqsection <identifier>" (imports with "use" keyword are allowed before)');
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

                // Check if defType is valid
                if (!defType) {
                    this.addError(diagnostics, lineIndex, 'Invalid def statement: missing type');
                    continue;
                }

                const validBlockDefs = this.getValidBlockDefs(currentContext);
                const validInlineDefs = this.getValidInlineDefs(currentContext);

                if (validInlineDefs.includes(defType)) {
                    if (!hasInlineDesc) {
                        this.addError(diagnostics, lineIndex, `Inline definition must include description: "def ${defType} <identifier> "description""`);
                    } else if (parts.length < 4) {
                        this.addError(diagnostics, lineIndex, `Invalid inline definition: "def ${defType} <identifier> "description""`);
                    }
                } else if (validBlockDefs.includes(defType)) {
                    if (hasInlineDesc) {
                        this.addError(diagnostics, lineIndex, `Block definition should not include inline description; use indented 'description' property`);
                    } else if (parts.length < 3) {
                        this.addError(diagnostics, lineIndex, `Definition must have an identifier: "def ${defType} <identifier>"`);
                    }
                    contextStack.push(defType);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid def type "${defType}" in ${currentContext}. Valid types: ${[...validBlockDefs, ...validInlineDefs].join(', ')}`);
                }
            } else {
                const keyword = trimmedLine.split(' ')[0];
                if (!keyword) continue;
                
                const validContainers = this.getValidContainers(currentContext);
                const validProperties = this.getValidProperties(currentContext);

                if (validContainers.includes(keyword)) {
                    const identified = this.identifyKeyword(keyword);
                    if (identified !== keyword) {
                        this.addWarning(diagnostics, lineIndex, `Possible typo in "${keyword}" - assuming "${identified}"`);
                    }
                    contextStack.push(identified || keyword);
                } else if (validProperties.includes(keyword) || this.isIdentifierListContext(currentContext)) {
                    this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, keyword);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid keyword "${keyword}" in ${currentContext}. Valid: ${[...validContainers, ...validProperties].join(', ')}`);
                }
            }
        }

        // Check required sections
        if (!hasReqSection) this.addError(diagnostics, 0, '.req files must contain "def reqsection <identifier>"');

        return diagnostics;
    }

    private getValidBlockDefs(context: string): string[] {
        switch (context) {
            case 'reqsection': return ['requirement'];
            default: return [];
        }
    }

    private getValidInlineDefs(context: string): string[] {
        return []; // No inline defs in .req sample
    }

    private getValidContainers(context: string): string[] {
        return []; // No containers in .req sample beyond def
    }

    private getValidProperties(context: string): string[] {
        switch (context) {
            case 'reqsection': return ['name', 'description'];
            case 'requirement': return ['name', 'description', 'type', 'source', 'derivedfrom', 'safetylevel', 'rationale', 'allocatedto', 'verificationcriteria', 'status'];
            default: return [];
        }
    }

    private isIdentifierListContext(context: string): boolean {
        return false; // Lists are handled in properties
    }

    private validatePropertyLine(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, context: string, keyword: string): void {
        switch (keyword) {
            case 'name':
            case 'description':
            case 'rationale':
            case 'verificationcriteria':
                this.validateQuotedString(diagnostics, lineIndex, line, keyword);
                break;
            case 'type':
                this.validateEnum(diagnostics, lineIndex, line, keyword, ['functional', 'non-functional', 'performance', 'standards', 'legal', 'system', 'software', 'electronics', 'mechanics', 'test', 'functionalsafety']);
                break;
            case 'source':
                this.validateEnum(diagnostics, lineIndex, line, keyword, ['stakeholder', 'internal', 'supplier', 'customer']);
                break;
            case 'safetylevel':
                this.validateEnum(diagnostics, lineIndex, line, keyword, ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM']);
                break;
            case 'status':
                this.validateEnum(diagnostics, lineIndex, line, keyword, ['draft', 'review', 'approved']);
                break;
            case 'derivedfrom':
            case 'allocatedto':
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

    private validateEnum(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string, allowedValues: string[]): void {
        const value = line.substring(keyword.length).trim();
        if (!allowedValues.includes(value)) {
            this.addError(diagnostics, lineIndex, `${keyword} must be one of: ${allowedValues.join(', ')}`);
        }
    }

    private validateIdentifierList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        const pattern = keyword === 'derivedfrom' ? 
            `^${keyword}\\s+(safetygoal\\s+)?[A-Z][A-Za-z0-9_]+(,\\s*[A-Z][A-Za-z0-9_]+)*$` :
            `^${keyword}\\s+(subsystem\\s+)?[A-Z][A-Za-z0-9_]+(,\\s*[A-Z][A-Za-z0-9_]+)*$`;
        
        if (!line.match(new RegExp(pattern))) {
            this.addError(diagnostics, lineIndex, `${keyword} must be a comma-separated list of identifiers: ${keyword} ID1, ID2`);
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
        const validKeywords: string[] = [];
        if (validKeywords.includes(keyword)) return keyword;

        for (const valid of validKeywords) {
            if (this.levenshteinDistance(keyword, valid) <= 2) {
                return valid;
            }
        }
        return keyword;
    }

    private levenshteinDistance(a: string, b: string): number {
        // Simple implementation that avoids TypeScript null checking issues
        if (a === b) return 0;
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        // Use a simple character-by-character comparison
        let distance = 0;
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) {
                distance++;
            }
        }
        distance += Math.abs(a.length - b.length);
        
        return distance;
    }
} 