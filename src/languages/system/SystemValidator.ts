import * as vscode from 'vscode';

export class SystemValidator {
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let hasSystem = false;
        let contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex]?.replace(/\r$/, '') || '';
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

            // Root level: def system or use statements
            if (level === 0) {
                if (trimmedLine.startsWith('def system ')) {
                    const parts = trimmedLine.split(/\s+/);
                    if (parts.length < 3 || !parts[2] || !/^[A-Z][A-Za-z0-9_]*$/.test(parts[2])) {
                        this.addError(diagnostics, lineIndex, 'Invalid system declaration: "def system <PascalCaseIdentifier>"');
                    }
                    contextStack = ['system'];
                    hasSystem = true;
                } else if (trimmedLine.startsWith('use ')) {
                    // Allow import statements at root level - skip validation for now
                    continue;
                } else {
                    this.addError(diagnostics, lineIndex, '.sys files must start with "def system <identifier>" (imports with "use" keyword are allowed before)');
                }
                continue;
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                this.addError(diagnostics, lineIndex, `No nested definitions allowed in .sys files`);
            } else {
                const keyword = trimmedLine.split(' ')[0];
                const validProperties = this.getValidProperties(currentContext);

                if (keyword && validProperties.includes(keyword)) {
                    this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, keyword);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid keyword "${keyword || ''}" in ${currentContext}. Valid: ${validProperties.join(', ')}`);
                }
            }
        }

        // Check required sections
        if (!hasSystem) this.addError(diagnostics, 0, '.sys files must contain "def system <identifier>"');

        return diagnostics;
    }

    private getValidProperties(context: string): string[] {
        switch (context) {
            case 'system': return ['name', 'description', 'owner', 'tags', 'safetylevel', 'contains'];
            default: return [];
        }
    }

    private validatePropertyLine(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, context: string, keyword: string): void {
        switch (keyword) {
            case 'name':
            case 'description':
            case 'owner':
                this.validateQuotedString(diagnostics, lineIndex, line, keyword);
                break;
            case 'tags':
                this.validateQuotedList(diagnostics, lineIndex, line, keyword);
                break;
            case 'safetylevel':
                this.validateEnum(diagnostics, lineIndex, line, keyword, ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM']);
                break;
            case 'contains':
                this.validateTypedIdentifierList(diagnostics, lineIndex, line, keyword);
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

    private validateEnum(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string, allowedValues: string[]): void {
        const value = line.substring(keyword.length).trim();
        if (!allowedValues.includes(value)) {
            this.addError(diagnostics, lineIndex, `${keyword} must be one of: ${allowedValues.join(', ')}`);
        }
    }

    private validateTypedIdentifierList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        const value = line.substring(keyword.length).trim();
        const validSecondaryKeywords = ['subsystem', 'component', 'module', 'unit', 'assembly', 'circuit', 'part'];
        
        // Check if it starts with a valid secondary keyword
        const foundKeyword = validSecondaryKeywords.find(sk => value.startsWith(sk + ' '));
        if (!foundKeyword) {
            this.addError(diagnostics, lineIndex, `${keyword} must start with one of: ${validSecondaryKeywords.join(', ')} followed by comma-separated identifiers`);
            return;
        }
        
        // Extract the identifier list after the secondary keyword
        const listPart = value.substring(foundKeyword.length).trim();
        if (!listPart) {
            this.addError(diagnostics, lineIndex, `${keyword} ${foundKeyword} must be followed by comma-separated identifiers`);
            return;
        }
        
        const identifiers = listPart.split(',').map(id => id.trim());
        for (const id of identifiers) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(id)) {
                this.addError(diagnostics, lineIndex, `Invalid identifier in ${keyword} ${foundKeyword} list: "${id}". Use PascalCase`);
            }
        }
    }

    private getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? Math.floor(match[0].replace(/\t/g, '  ').length / 2) : 0;
    }

    private addError(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        diagnostics.push(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error));
    }


} 