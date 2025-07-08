import * as vscode from 'vscode';

export class SafetyValidator {
    private diagnostics: vscode.Diagnostic[] = [];

    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        this.diagnostics = [];
        const text = document.getText();
        const lines = text.split('\n');
        const extension = document.fileName.split('.').pop();

        console.log(`[SafetyValidator] Validating ${extension} file: ${document.fileName}`);

        // Basic validation for all safety files
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line || line.trim().length === 0 || line.trim().startsWith('//')) {
                continue;
            }

            this.validateLine(lineIndex, line, extension || '');
        }

        console.log(`[SafetyValidator] Found ${this.diagnostics.length} validation issues`);
        return this.diagnostics;
    }

    private validateLine(lineIndex: number, line: string, extension: string): void {
        const trimmedLine = line.trim();

        // Basic def keyword validation
        this.validateDefKeyword(lineIndex, trimmedLine, extension);
        
        // Basic safety level validation
        this.validateSafetyLevels(lineIndex, trimmedLine);
        
        // Basic quoting validation
        this.validateQuoting(lineIndex, trimmedLine);
    }

    private validateDefKeyword(lineIndex: number, line: string, extension: string): void {
        const definitionKeywords = this.getDefinitionKeywordsByExtension(extension);
        
        for (const keyword of definitionKeywords) {
            if (line.startsWith(`${keyword} `) && !line.startsWith('def ')) {
                this.addError(lineIndex, `Definitions must start with 'def'. Example: 'def ${keyword} Name'`);
            }
        }
    }

    private validateSafetyLevels(lineIndex: number, line: string): void {
        if (line.includes('safetylevel') || line.includes('asil')) {
            const safetyLevelMatch = line.match(/(?:safetylevel|asil)\s+([A-Z-]+)/);
            if (safetyLevelMatch && safetyLevelMatch[1]) {
                const level = safetyLevelMatch[1];
                const validLevels = ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM', 'A', 'B', 'C', 'D'];
                if (!validLevels.includes(level)) {
                    this.addError(lineIndex, `Invalid safety level: ${level}. Valid values are: ${validLevels.join(', ')}`);
                }
            }
        }
    }

    private validateQuoting(lineIndex: number, line: string): void {
        // Validate that properties like name, description are quoted
        const quotedProperties = ['name', 'description', 'rationale', 'methodology'];
        for (const prop of quotedProperties) {
            if (line.includes(`${prop} `) && !line.includes(`${prop} "`)) {
                this.addWarning(lineIndex, `Property '${prop}' should be a quoted string`);
            }
        }
    }

    private getDefinitionKeywordsByExtension(extension: string): string[] {
        switch (extension) {
            case 'haz':
                return ['hazardidentification', 'hazard', 'category'];
            case 'rsk':
                return ['riskassessment', 'severity', 'exposure', 'controllability'];
            case 'sgl':
                return ['safetygoals', 'goal', 'measure'];
            case 'itm':
                return ['hazardanalysis', 'scenario', 'condition', 'strategy', 'principle'];
            case 'fsr':
                return ['functionalsafetyrequirements', 'requirement'];
            default:
                return ['def'];
        }
    }

    private addError(lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(
            range,
            message,
            vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = 'Sylang Safety';
        this.diagnostics.push(diagnostic);
    }

    private addWarning(lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(
            range,
            message,
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'Sylang Safety';
        this.diagnostics.push(diagnostic);
    }
} 