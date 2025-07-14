import * as vscode from 'vscode';

export class SafetyValidator {
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const fileName = document.fileName;
        const extension = fileName.split('.').pop();

        console.log(`[SafetyValidator] Validating ${extension} file: ${fileName}`);

        if (extension === 'itm') {
            return this.validateItmFile(document);
        } else {
            // For other safety files, just do basic validation
            return this.validateBasicSafety(document);
        }
    }

    private validateItmFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let hasItem = false;
        let hasOperationalScenarios = false;
        let hasOperationalConditions = false;
        let hasVehicleStates = false;
        let hasDriverStates = false;
        let hasEnvironments = false;
        let hasSafetyConcept = false;
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

            // Unexpected indent (too deep)
            if (level > contextStack.length) {
                this.addError(diagnostics, lineIndex, `Unexpected indentation. Expected level ${contextStack.length}, got ${level}`);
                continue;
            }

            // Root level: def item
            if (level === 0) {
                if (trimmedLine.startsWith('def item ')) {
                    const parts = trimmedLine.split(/\s+/);
                    if (parts.length < 3 || !parts[2] || !/^[A-Z][A-Za-z0-9_]*$/.test(parts[2])) {
                        this.addError(diagnostics, lineIndex, 'Invalid item declaration: "def item <PascalCaseIdentifier>"');
                    }
                    contextStack = ['item'];
                    hasItem = true;
                } else if (trimmedLine.match(/^(operationalscenarios|safetyconcept)$/)) {
                    // Top-level sections
                    const keyword = trimmedLine.split(' ')[0];
                    if (keyword) {
                        contextStack = [keyword];
                        if (keyword === 'operationalscenarios') hasOperationalScenarios = true;
                        if (keyword === 'safetyconcept') hasSafetyConcept = true;
                    }
                } else if (trimmedLine.startsWith('use ')) {
                    // Allow import statements at root level - skip validation for now
                    continue;
                } else {
                    this.addError(diagnostics, lineIndex, '.itm files must start with "def item <identifier>" (imports with "use" keyword are allowed before)');
                }
                continue;
            }

            // Process the line at current level (should be == contextStack.length)
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

                // Check if valid def type for current context
                const validBlockDefs = this.getValidBlockDefs(currentContext);
                const validInlineDefs = this.getValidInlineDefs(currentContext);

                if (defType && validInlineDefs.includes(defType)) {
                    if (!hasInlineDesc) {
                        this.addError(diagnostics, lineIndex, `Inline definition must include description: "def ${defType} <identifier> "description""`);
                    } else if (parts.length < 4) {
                        this.addError(diagnostics, lineIndex, `Invalid inline definition: "def ${defType} <identifier> "description""`);
                    }
                    // Do not push
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
                // Non-def lines: properties, containers, or identifiers
                const keyword = trimmedLine.split(' ')[0];
                const validContainers = this.getValidContainers(currentContext);
                const validProperties = this.getValidProperties(currentContext);

                if (keyword && validContainers.includes(keyword)) {
                    const identified = this.identifyKeyword(keyword);
                    if (identified !== keyword) {
                        this.addWarning(diagnostics, lineIndex, `Possible typo in "${keyword}" - assuming "${identified}"`);
                    }
                    contextStack.push(identified || keyword);
                    if (identified === 'operationalscenarios') hasOperationalScenarios = true;
                    if (identified === 'operationalconditions') hasOperationalConditions = true;
                    if (identified === 'vehiclestates') hasVehicleStates = true;
                    if (identified === 'driverstates') hasDriverStates = true;
                    if (identified === 'environments') hasEnvironments = true;
                    if (identified === 'safetyconcept') hasSafetyConcept = true;
                } else if (keyword && (validProperties.includes(keyword) || this.isIdentifierListContext(currentContext))) {
                    this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, keyword);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid keyword "${keyword || 'undefined'}" in ${currentContext}. Valid: ${[...validContainers, ...validProperties].join(', ')}`);
                }
            }
        }

        // Check required sections
        if (!hasItem) this.addError(diagnostics, 0, '.itm files must start with "def item <identifier>"');
        if (!hasOperationalScenarios) this.addError(diagnostics, 0, '.itm files must contain an "operationalscenarios" section');
        if (!hasOperationalConditions) this.addError(diagnostics, 0, '.itm files must contain an "operationalconditions" sub-section');
        if (!hasVehicleStates) this.addError(diagnostics, 0, '.itm files must contain a "vehiclestates" sub-section');
        if (!hasDriverStates) this.addError(diagnostics, 0, '.itm files must contain a "driverstates" sub-section');
        if (!hasEnvironments) this.addError(diagnostics, 0, '.itm files must contain an "environments" sub-section');
        if (!hasSafetyConcept) this.addError(diagnostics, 0, '.itm files must contain a "safetyconcept" section');

        console.log(`[SafetyValidator] Found ${diagnostics.length} issues in .itm file`);
        return diagnostics;
    }

    private getValidBlockDefs(context: string): string[] {
        switch (context) {
            case 'operationalscenarios': return ['scenario'];
            case 'operationalconditions': return ['condition'];
            case 'vehiclestates': return ['vehiclestate'];
            case 'driverstates': return ['drivingstate'];
            case 'environments': return ['environment'];
            case 'safetystrategy': return ['principle'];
            case 'assumptionsofuse': return ['assumption'];
            case 'foreseeablemisuse': return ['misuse'];
            case 'includes': return ['boundary'];
            case 'excludes': return ['boundary'];
            default: return [];
        }
    }

    private getValidInlineDefs(context: string): string[] {
        switch (context) {
            // No inline definitions currently defined
            default: return [];
        }
    }

    private getValidContainers(context: string): string[] {
        switch (context) {
            case 'item': return ['subsystems', 'systemboundaries'];
            case 'systemboundaries': return ['includes', 'excludes'];
            case 'operationalscenarios': return ['operationalconditions', 'vehiclestates', 'driverstates', 'environments'];
            case 'safetyconcept': return ['safetystrategy', 'assumptionsofuse', 'foreseeablemisuse'];
            default: return [];
        }
    }

    private getValidProperties(context: string): string[] {
        switch (context) {
            case 'item': return ['name', 'description', 'owner', 'reviewers', 'productline', 'featureset', 'functiongroup'];
            case 'scenario': return ['description', 'vehiclestate', 'environment', 'driverstate'];
            case 'condition': return ['range', 'impact', 'standard'];
            case 'vehiclestate': return ['description', 'characteristics'];
            case 'drivingstate': return ['description', 'characteristics'];
            case 'environment': return ['description', 'conditions'];
            case 'principle':
            case 'assumption':
            case 'misuse': return ['description'];
            case 'boundary': return ['description'];
            case 'featureset': return ['description'];
            default: return [];
        }
    }

    private isIdentifierListContext(context: string): boolean {
        return ['subsystems'].includes(context);
    }

    private validatePropertyLine(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, context: string, keyword: string): void {
        if (this.isIdentifierListContext(context)) {
            // Identifier list (e.g., under subsystems)
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(line)) {
                this.addError(diagnostics, lineIndex, `Invalid identifier "${line}". Use PascalCase`);
            }
            return;
        }

        // Standard properties
        switch (keyword) {
            case 'name':
            case 'description':
            case 'characteristics':
            case 'range':
            case 'impact':
            case 'standard':
                this.validateQuotedString(diagnostics, lineIndex, line, keyword);
                break;
            case 'owner':
            case 'reviewers':
                this.validateQuotedList(diagnostics, lineIndex, line, keyword);
                break;
            case 'productline':
            case 'functiongroup':
            case 'vehiclestate':
            case 'environment':
            case 'driverstate':
                this.validateIdentifier(diagnostics, lineIndex, line, keyword);
                break;
            case 'conditions':
                if (!line.match(/^conditions\s+[A-Za-z0-9_]+(,\s*[A-Za-z0-9_]+)*$/)) {
                    this.addError(diagnostics, lineIndex, 'conditions must be a comma-separated list of identifiers: conditions ID1, ID2');
                }
                break;
            case 'featureset':
                this.validateQuotedString(diagnostics, lineIndex, line, keyword);
                break;
            default:
                this.addError(diagnostics, lineIndex, `Invalid property "${keyword}" in ${context}`);
        }
    }

    // Helpers (unchanged from previous, but included for completeness)
    private validateQuotedString(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        // Accept both inline format: `keyword "text"` and multiline format: `keyword` followed by quoted text
        const inlinePattern = new RegExp(`^${keyword}\\s+"[^"]*"$`);
        const keywordOnlyPattern = new RegExp(`^${keyword}$`);
        
        if (!inlinePattern.test(line) && !keywordOnlyPattern.test(line)) {
            this.addError(diagnostics, lineIndex, `${keyword} must be a quoted string: ${keyword} "text" or multiline format`);
        }
    }

    private validateQuotedList(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, keyword: string): void {
        if (!line.match(new RegExp(`^${keyword}\\s+"[^"]*"(,\\s*"[^"]*")*$`))) {
            this.addError(diagnostics, lineIndex, `${keyword} must be quoted strings: ${keyword} "Team1", "Team2"`);
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
        return Math.floor(indent / 2); // Assuming 2 spaces per level
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
        const validKeywords = ['operationalscenarios', 'operationalconditions', 'vehiclestates', 'driverstates', 'environments', 'safetyconcept', 'safetystrategy', 'assumptionsofuse', 'foreseeablemisuse', 'subsystems', 'systemboundaries', 'includes', 'excludes'];
        if (validKeywords.includes(keyword)) return keyword;

        for (const valid of validKeywords) {
            if (this.levenshteinDistance(keyword, valid) <= 2) {
                return valid;
            }
        }
        return keyword;
    }

    private levenshteinDistance(a: string, b: string): number {
        // Standard Levenshtein implementation (as before)
        const matrix: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) {
            const row = matrix[i];
            if (row) row[0] = i;
        }
        for (let j = 0; j <= b.length; j++) {
            const cell = matrix[0];
            if (cell) cell[j] = j;
        }
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                const currentRow = matrix[i];
                const prevRow = matrix[i - 1];
                const prevCell = currentRow && currentRow[j - 1];
                const aboveCell = prevRow && prevRow[j];
                const diagCell = prevRow && prevRow[j - 1];
                
                if (currentRow && prevCell !== undefined && aboveCell !== undefined && diagCell !== undefined) {
                    currentRow[j] = Math.min(
                        aboveCell + 1,
                        prevCell + 1,
                        diagCell + cost
                    );
                }
            }
        }
        const finalRow = matrix[a.length];
        return finalRow ? (finalRow[b.length] ?? 0) : 0;
    }

    private validateBasicSafety(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Basic validation for other safety files
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line || !line.trim() || line.trim().startsWith('//')) continue;

            const trimmedLine = line.trim();

            if (trimmedLine.includes('safetylevel') || trimmedLine.includes('asil')) {
                const safetyLevelMatch = trimmedLine.match(/(?:safetylevel|asil)\s+([A-Z-]+)/);
                if (safetyLevelMatch && safetyLevelMatch[1]) {
                    const level = safetyLevelMatch[1];
                    const validLevels = ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM', 'A', 'B', 'C', 'D'];
                    if (!validLevels.includes(level)) {
                        this.addError(diagnostics, lineIndex, `Invalid safety level: ${level}. Valid values are: ${validLevels.join(', ')}`);
                    }
                }
            }

            const quotedProperties = ['name', 'description', 'rationale', 'methodology'];
            for (const prop of quotedProperties) {
                if (trimmedLine.startsWith(`${prop} `) && !trimmedLine.includes(`"${prop} "`)) {
                    this.addWarning(diagnostics, lineIndex, `Property '${prop}' should be a quoted string`);
                }
            }
        }

        console.log(`[SafetyValidator] Found ${diagnostics.length} issues in safety file`);
        return diagnostics;
    }
}