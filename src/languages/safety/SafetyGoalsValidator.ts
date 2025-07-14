import * as vscode from 'vscode';

export class SafetyGoalsValidator {
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let hasSafetyGoals = false;
        let contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            
            const processedLine = line.replace(/\r$/, '');
            const trimmedLine = processedLine.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(processedLine);

            // Adjust context stack for dedent
            while (level < contextStack.length) {
                contextStack.pop();
            }

            // Unexpected indent
            if (level > contextStack.length) {
                this.addError(diagnostics, lineIndex, `Unexpected indentation. Expected level ${contextStack.length}, got ${level}`);
                continue;
            }

            // Root level: def safetygoals
            if (level === 0) {
                if (trimmedLine.startsWith('def safetygoals ')) {
                    const parts = trimmedLine.split(/\s+/);
                    if (parts.length < 3 || !parts[2] || !/^[A-Z][A-Za-z0-9_]*$/.test(parts[2])) {
                        this.addError(diagnostics, lineIndex, 'Invalid safetygoals declaration: "def safetygoals <PascalCaseIdentifier>"');
                    }
                    contextStack = ['safetygoals'];
                    hasSafetyGoals = true;
                } else if (trimmedLine.startsWith('use ')) {
                    // Allow import statements at root level - skip validation for now
                    continue;
                } else {
                    this.addError(diagnostics, lineIndex, '.sgl files must start with "def safetygoals <identifier>" (imports with "use" keyword are allowed before)');
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
                    this.addError(diagnostics, lineIndex, `Invalid def type "${defType || 'undefined'}" in ${currentContext}. Valid types: ${[...validBlockDefs, ...validInlineDefs].join(', ')}`);
                }
            } else {
                const keyword = trimmedLine.split(' ')[0];
                const validContainers = this.getValidContainers(currentContext);
                const validProperties = this.getValidProperties(currentContext);

                // Check for multi-word properties first
                let isMultiWordProperty = false;
                for (const prop of validProperties) {
                    if (prop.includes(' ') && trimmedLine.startsWith(prop + ' ')) {
                        this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, prop);
                        isMultiWordProperty = true;
                        break;
                    }
                }

                if (isMultiWordProperty) {
                    // Already handled above
                } else if (keyword && validContainers.includes(keyword)) {
                    const identified = this.identifyKeyword(keyword);
                    if (identified !== keyword) {
                        this.addWarning(diagnostics, lineIndex, `Possible typo in "${keyword}" - assuming "${identified}"`);
                    }
                    contextStack.push(identified || keyword);
                } else if (keyword && (validProperties.includes(keyword) || this.isIdentifierListContext(currentContext))) {
                    this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, keyword);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid keyword "${keyword || 'undefined'}" in ${currentContext}. Valid: ${[...validContainers, ...validProperties].join(', ')}`);
                }
            }
        }

        // Check required sections
        if (!hasSafetyGoals) this.addError(diagnostics, 0, '.sgl files must contain "def safetygoals <identifier>"');

        return diagnostics;
    }

    private getValidBlockDefs(context: string): string[] {
        switch (context) {
            case 'safetygoals': return ['goal'];
            case 'safetymeasures': return ['measure'];
            default: return [];
        }
    }

    private getValidInlineDefs(context: string): string[] {
        return []; // No inline defs in .sgl sample
    }

    private getValidContainers(context: string): string[] {
        switch (context) {
            case 'safetygoals': return ['safetymeasures'];
            case 'goal': return ['safetymeasures'];
            default: return [];
        }
    }

    private getValidProperties(context: string): string[] {
        switch (context) {
            case 'safetygoals': return ['name', 'description', 'item', 'riskassessment', 'hazardidentification'];
            case 'goal': return ['name', 'description', 'hazard', 'scenario', 'asil'];
            case 'measure': return ['description', 'enabledby function'];
            default: return [];
        }
    }

    private isIdentifierListContext(context: string): boolean {
        return false; // No simple identifier lists, but lists in properties
    }

    private validatePropertyLine(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, context: string, keyword: string): void {
        switch (keyword) {
            case 'name':
            case 'description':
                this.validateQuotedString(diagnostics, lineIndex, line, keyword);
                break;
            case 'item':
            case 'riskassessment':
            case 'hazardidentification':
                this.validateIdentifier(diagnostics, lineIndex, line, keyword);
                break;
            case 'asil':
                this.validateASIL(diagnostics, lineIndex, line, keyword);
                break;
            case 'hazard':
            case 'scenario':
                this.validateIdentifierList(diagnostics, lineIndex, line, keyword);
                break;
            case 'enabledby function':
                this.validateIdentifierList(diagnostics, lineIndex, line, keyword);
                break;
            case 'enabledby':
                this.addError(diagnostics, lineIndex, `Use "enabledby function" instead of "enabledby" to specify functions`);
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

    private validateIdentifier(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+[A-Z][A-Za-z0-9_]+$`))) {
            this.addError(diagnostics, lineIndex, `${keyword} must reference an identifier: ${keyword} IDENTIFIER`);
        }
    }

    private validateASIL(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+[A-D]$`))) {
            this.addError(diagnostics, lineIndex, `${keyword} must be a valid ASIL level: ${keyword} A, B, C, or D`);
        }
    }

    private validateIdentifierList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+[A-Z][A-Za-z0-9_]+(,\\s*[A-Z][A-Za-z0-9_]+)*$`))) {
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
        const validKeywords = ['safetygoals', 'safetymeasures'];
        if (validKeywords.includes(keyword)) return keyword;

        for (const valid of validKeywords) {
            if (this.levenshteinDistance(keyword, valid) <= 2) {
                return valid;
            }
        }
        return keyword;
    }

    private levenshteinDistance(a: string, b: string): number {
        const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) {
            const row = matrix[i];
            if (row) row[0] = i;
        }
        for (let j = 0; j <= b.length; j++) {
            const firstRow = matrix[0];
            if (firstRow) firstRow[j] = j;
        }
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                const currentRow = matrix[i];
                const prevRow = matrix[i - 1];
                if (currentRow && prevRow) {
                    currentRow[j] = Math.min(
                        (prevRow[j] || 0) + 1,
                        (currentRow[j - 1] || 0) + 1,
                        (prevRow[j - 1] || 0) + cost
                );
            }
        }
        }
        const finalRow = matrix[a.length];
        return finalRow ? (finalRow[b.length] || 0) : 0;
    }
}
