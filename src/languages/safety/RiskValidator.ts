import * as vscode from 'vscode';

export class RiskValidator {
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const fileName = document.fileName;
        console.log(`[RiskValidator] Validating .rsk file: ${fileName}`);

        return this.validateRiskFile(document);
    }

    private validateRiskFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let hasRiskAssessment = false;
        let hasRiskCriteria = false;
        let hasRiskDetermination = false;
        let hasAsilDetermination = false;
        let hasAsilAssessment = false;
        let contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            
            const processedLine = line.replace(/\r$/, '');
            const trimmedLine = processedLine.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(processedLine);

            // Adjust context stack for current level
            while (contextStack.length > level) {
                contextStack.pop();
            }

            // Validate indentation (should not skip levels)
            if (level > contextStack.length) {
                this.addError(diagnostics, lineIndex, `Unexpected indentation. Expected level ${contextStack.length}, got ${level}`);
                continue;
            }

            // Process by level
            if (level === 0) {
                // Root level: must be def riskassessment
                if (trimmedLine.startsWith('def riskassessment ')) {
                    const parts = trimmedLine.split(/\s+/);
                    if (parts.length < 3 || !parts[2] || !/^[A-Z][A-Za-z0-9_]*$/.test(parts[2])) {
                        this.addError(diagnostics, lineIndex, 'Invalid riskassessment declaration: "def riskassessment <PascalCaseIdentifier>"');
                    }
                    contextStack = ['riskassessment'];
                    hasRiskAssessment = true;
                } else if (trimmedLine.startsWith('use ')) {
                    // Allow import statements at root level - skip validation for now
                    continue;
                } else {
                    this.addError(diagnostics, lineIndex, '.rsk files must start with "def riskassessment <identifier>" (imports with "use" keyword are allowed before)');
                }
                continue;
            }

            // Get current context
            const currentContext = contextStack[contextStack.length - 1] || '';

            // Handle def statements
            if (trimmedLine.startsWith('def ')) {
                const parts = trimmedLine.split(/\s+/);
                const defType = parts[1];
                const identifier = parts[2];

                // Validate identifier
                if (identifier && !/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
                    this.addError(diagnostics, lineIndex, `Identifier "${identifier}" should use PascalCase`);
                }

                // Check if valid def type for current context
                const validDefs = this.getValidDefs(currentContext);
                if (defType && validDefs.includes(defType)) {
                    if (parts.length < 3) {
                        this.addError(diagnostics, lineIndex, `Definition must have an identifier: "def ${defType} <identifier>"`);
                    }
                    contextStack.push(defType);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid def type "${defType || 'undefined'}" in ${currentContext}. Valid types: ${validDefs.join(', ')}`);
                }
            } else {
                // Handle properties, containers, and special keywords
                const keyword = trimmedLine.split(' ')[0];
                const validContainers = this.getValidContainers(currentContext);
                const validProperties = this.getValidProperties(currentContext);

                if (keyword && validContainers.includes(keyword)) {
                    // Container/section keywords
                    contextStack.push(keyword);
                    if (keyword === 'riskcriteria') hasRiskCriteria = true;
                    if (keyword === 'riskdetermination') hasRiskDetermination = true;
                    if (keyword === 'asildetermination') hasAsilDetermination = true;
                    if (keyword === 'asilassessment') hasAsilAssessment = true;
                } else if (keyword === 'subsystem' && currentContext === 'asilassessment') {
                    // Special handling for subsystem
                    const subsystemName = trimmedLine.substring(9).trim();
                    if (!subsystemName || !/^[A-Z][A-Za-z0-9_]*$/.test(subsystemName)) {
                        this.addError(diagnostics, lineIndex, `Invalid subsystem name "${subsystemName}". Use PascalCase`);
                    }
                    contextStack.push('subsystem');
                } else if (keyword === 'hazard' && currentContext === 'subsystem') {
                    // Special handling for hazard
                    const hazardName = trimmedLine.substring(6).trim();
                    if (!hazardName || !/^[A-Z][A-Za-z0-9_]*$/.test(hazardName)) {
                        this.addError(diagnostics, lineIndex, `Invalid hazard name "${hazardName}". Use PascalCase`);
                    }
                    contextStack.push('hazard');
                } else if (keyword && validProperties.includes(keyword)) {
                    // Property validation
                    this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, keyword);
                } else {
                    // Invalid keyword
                    const allValid = [...validContainers, ...validProperties];
                    if (currentContext === 'asilassessment') allValid.push('subsystem');
                    if (currentContext === 'subsystem') allValid.push('hazard');
                    this.addError(diagnostics, lineIndex, `Invalid keyword "${keyword || 'undefined'}" in ${currentContext}. Valid: ${allValid.join(', ')}`);
                }
            }
        }

        // Check required sections
        if (!hasRiskAssessment) {
            this.addError(diagnostics, 0, '.rsk files must start with "def riskassessment <identifier>"');
        }
        if (!hasRiskCriteria) {
            this.addError(diagnostics, 0, '.rsk files must contain a "riskcriteria" section');
        }
        if (!hasRiskDetermination) {
            this.addError(diagnostics, 0, '.rsk files must contain a "riskdetermination" section');
        }
        if (!hasAsilDetermination) {
            this.addError(diagnostics, 0, '.rsk files must contain an "asildetermination" section');
        }
        if (!hasAsilAssessment) {
            this.addError(diagnostics, 0, '.rsk files must contain an "asilassessment" section');
        }

        console.log(`[RiskValidator] Found ${diagnostics.length} issues in .rsk file`);
        return diagnostics;
    }

    private getValidDefs(currentContext: string): string[] {
        switch (currentContext) {
            case 'riskcriteria': return ['severity', 'exposure', 'controllability'];
            case 'riskdetermination': return ['risk'];
            case 'asildetermination': return ['safetylevel'];
            default: return [];
        }
    }

    private getValidContainers(currentContext: string): string[] {
        switch (currentContext) {
            case 'riskassessment': return ['riskcriteria', 'riskdetermination', 'asildetermination', 'asilassessment'];
            default: return [];
        }
    }

    private getValidProperties(currentContext: string): string[] {
        switch (currentContext) {
            case 'riskassessment': return ['name', 'description', 'hazardanalysis', 'hazardidentification', 'item', 'methodology'];
            case 'severity': return ['description'];
            case 'exposure': return ['description'];
            case 'controllability': return ['description'];
            case 'risk': return ['severity', 'exposure', 'controllability', 'description'];
            case 'safetylevel': return ['risk', 'description'];
            case 'hazard': return ['scenario', 'safetylevel', 'rationale'];
            default: return [];
        }
    }

    private validatePropertyLine(diagnostics: vscode.Diagnostic[], lineIndex: number, trimmedLine: string, currentContext: string, keyword: string): void {
        const value = trimmedLine.substring(keyword.length).trim();

        if (!value) {
            this.addError(diagnostics, lineIndex, `Property "${keyword}" requires a value`);
            return;
        }

        // Validate property format based on keyword
        switch (keyword) {
            case 'name':
            case 'description':
            case 'methodology':
            case 'rationale':
                this.validateQuotedString(diagnostics, lineIndex, trimmedLine, keyword);
                break;
            case 'hazardanalysis':
            case 'hazardidentification':
            case 'item':
            case 'severity':
            case 'exposure':
            case 'controllability':
            case 'safetylevel':
                this.validateIdentifier(diagnostics, lineIndex, trimmedLine, keyword);
                break;
            case 'risk':
            case 'scenario':
                this.validateIdentifierList(diagnostics, lineIndex, trimmedLine, keyword);
                break;
            default:
                // Generic validation
                break;
        }
    }

    private validateQuotedString(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        const match = line.match(/^[a-zA-Z]+\s+"([^"]*)"$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, `Property "${keyword}" must be quoted: ${keyword} "value"`);
        }
    }

    private validateIdentifier(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        const parts = line.split(' ');
        const value = parts[1];
        if (!value || !/^[A-Z][A-Za-z0-9_]*$/.test(value)) {
            this.addError(diagnostics, lineIndex, `Property "${keyword}" must be a valid PascalCase identifier`);
        }
    }

    private validateIdentifierList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        const value = line.substring(keyword.length).trim();
        const identifiers = value.split(',').map(id => id.trim());
        
        for (const id of identifiers) {
            if (!id || !/^[A-Z][A-Za-z0-9_]*$/.test(id)) {
                this.addError(diagnostics, lineIndex, `Property "${keyword}" contains invalid identifier "${id}". Use PascalCase`);
            }
        }
    }

    private getIndentLevel(line: string): number {
        let level = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '\t') {
                level++;
            } else if (line[i] === ' ') {
                // Handle spaces as well (4 spaces = 1 level)
                let spaceCount = 0;
                while (i < line.length && line[i] === ' ') {
                    spaceCount++;
                    i++;
                }
                level += Math.floor(spaceCount / 4);
                i--; // Adjust for the loop increment
            } else {
                break;
            }
        }
        return level;
    }

    private addError(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        diagnostics.push(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error));
    }
}