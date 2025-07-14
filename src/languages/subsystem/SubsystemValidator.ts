import * as vscode from 'vscode';

export class SubsystemValidator {
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let hasSubsystem = false;
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

            // Root level: def subsystem
            if (level === 0) {
                if (trimmedLine.startsWith('def subsystem ')) {
                    const parts = trimmedLine.split(/\s+/);
                    if (parts.length < 3 || !parts[2] || !/^[A-Z][A-Za-z0-9_]*$/.test(parts[2])) {
                        this.addError(diagnostics, lineIndex, 'Invalid subsystem declaration: "def subsystem <PascalCaseIdentifier>"');
                    }
                    contextStack = ['subsystem'];
                    hasSubsystem = true;
                } else {
                    this.addError(diagnostics, lineIndex, '.sub files must start with "def subsystem <identifier>"');
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
                } else if (validProperties.includes(keyword)) {
                    this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, keyword);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid keyword "${keyword}" in ${currentContext}. Valid: ${[...validContainers, ...validProperties].join(', ')}`);
                }
            }
        }

        // Check required sections
        if (!hasSubsystem) this.addError(diagnostics, 0, '.sub files must contain "def subsystem <identifier>"');

        return diagnostics;
    }

    private getValidBlockDefs(context: string): string[] {
        switch (context) {
            case 'subsystem': return []; // No nested block definitions in subsystem
            default: return [];
        }
    }

    private getValidInlineDefs(context: string): string[] {
        switch (context) {
            case 'subsystem': return []; // No inline definitions in subsystem
            default: return [];
        }
    }

    private getValidContainers(context: string): string[] {
        switch (context) {
            case 'subsystem': return []; // No container keywords in subsystem
            default: return [];
        }
    }

    private getValidProperties(context: string): string[] {
        switch (context) {
            case 'subsystem': return ['name', 'description', 'owner', 'tags', 'safetylevel', 'asil', 'enables', 'implements'];
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
                this.validateQuotedStringList(diagnostics, lineIndex, line, keyword);
                break;
            case 'safetylevel':
                this.validateEnum(diagnostics, lineIndex, line, keyword, ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM']);
                break;
            case 'asil':
                this.validateEnum(diagnostics, lineIndex, line, keyword, ['A', 'B', 'C', 'D', 'QM']);
                break;
            case 'enables':
                this.validateEnablesFeature(diagnostics, lineIndex, line);
                break;
            case 'implements':
                this.validateImplementsFunction(diagnostics, lineIndex, line);
                break;
            default:
                this.addError(diagnostics, lineIndex, `Invalid property "${keyword}" in ${context}`);
        }
    }

    private validateQuotedString(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        const pattern = new RegExp(`^\\s*${keyword}\\s+"([^"]*)"\\s*$`);
        if (!pattern.test(line.trim())) {
            this.addError(diagnostics, lineIndex, `Property "${keyword}" must be a quoted string: ${keyword} "value"`);
        }
    }

    private validateQuotedStringList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        const pattern = new RegExp(`^\\s*${keyword}\\s+"([^"]*)"`);
        if (!pattern.test(line.trim())) {
            this.addError(diagnostics, lineIndex, `Property "${keyword}" must be quoted strings: ${keyword} "value1", "value2"`);
        }
    }

    private validateEnum(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string, validValues: string[]): void {
        const match = line.trim().match(new RegExp(`^\\s*${keyword}\\s+(\\S+)`));
        if (!match) {
            this.addError(diagnostics, lineIndex, `Property "${keyword}" must have a value: ${keyword} <value>`);
        } else {
            const value = match[1];
            if (value && !validValues.includes(value)) {
                this.addError(diagnostics, lineIndex, `Invalid value "${value}" for ${keyword}. Valid values: ${validValues.join(', ')}`);
            }
        }
    }

    private validateIdentifierList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        const match = line.trim().match(new RegExp(`^\\s*${keyword}\\s+(.+)`));
        if (!match) {
            this.addError(diagnostics, lineIndex, `Property "${keyword}" must have values: ${keyword} <value1>, <value2>`);
        } else {
            const values = match[1]?.split(',').map(v => v.trim()) || [];
            for (const value of values) {
                if (!/^[A-Z][A-Za-z0-9_]*$/.test(value)) {
                    this.addError(diagnostics, lineIndex, `Invalid identifier "${value}" in ${keyword} - should use PascalCase`);
                }
            }
        }
    }

    private validateEnablesFeature(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^enables\s+feature\s+(.+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid enables syntax. Expected format: enables feature <FeatureList>');
        } else {
            const featuresText = match[1];
            if (featuresText) {
                const features = featuresText.split(',').map(f => f.trim());
                for (const feature of features) {
                    if (!/^[A-Z][A-Za-z0-9_]*$/.test(feature)) {
                        this.addError(diagnostics, lineIndex, `Invalid feature identifier "${feature}" - should use PascalCase`);
                    }
                }
            }
        }
    }

    private validateImplementsFunction(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^implements\s+function\s+(.+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid implements syntax. Expected format: implements function <FunctionList>');
        } else {
            const functionsText = match[1];
            if (functionsText) {
                const functions = functionsText.split(',').map(f => f.trim());
                for (const func of functions) {
                    if (!/^[A-Z][A-Za-z0-9_]*$/.test(func)) {
                        this.addError(diagnostics, lineIndex, `Invalid function identifier "${func}" - should use PascalCase`);
                    }
                }
            }
        }
    }

    private getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        if (!match || !match[1]) return 0;
        return match[1].length / 2; // Assuming 2 spaces per indent level
    }

    private identifyKeyword(keyword: string): string | null {
        // Simple typo correction - extend as needed
        const corrections: { [key: string]: string } = {
            'nam': 'name',
            'desc': 'description',
            'own': 'owner',
            'tag': 'tags',
            'safety': 'safetylevel',
            'enable': 'enables',
            'implement': 'implements'
        };
        return corrections[keyword] || null;
    }

    private addError(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
        diagnostics.push(diagnostic);
    }

    private addWarning(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
        diagnostics.push(diagnostic);
    }
} 