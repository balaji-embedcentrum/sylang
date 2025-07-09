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

        let hasHazardAnalysis = false;
        let hasItemDef = false;
        let hasOperationalScenarios = false;
        let hasOperationalConditions = false;
        let hasVehicleStates = false;
        let hasSafetyConcept = false;
        let currentSection = '';
        let insideItemDef = false;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('//')) {
                continue;
            }

            // Check first non-empty line must start with def hazardanalysis
            if (lineIndex === 0 || (!hasHazardAnalysis && trimmedLine.length > 0)) {
                if (!trimmedLine.startsWith('def hazardanalysis ')) {
                    this.addError(diagnostics, lineIndex, '.itm files must start with "def hazardanalysis <identifier>"');
                } else {
                    hasHazardAnalysis = true;
                    const parts = trimmedLine.split(' ');
                    if (parts.length < 3) {
                        this.addError(diagnostics, lineIndex, 'hazardanalysis must have an identifier: "def hazardanalysis <identifier>"');
                    } else if (parts[2] && !/^[A-Za-z][A-Za-z0-9_]*$/.test(parts[2])) {
                        this.addError(diagnostics, lineIndex, `Invalid identifier "${parts[2]}". Use PascalCase (e.g., InverterSafety)`);
                    }
                }
                continue;
            }

            // Check indentation and track sections
            const currentIndent = this.getIndentLevel(line);
            
            if (currentIndent === 0 && trimmedLine.startsWith('def item ')) {
                hasItemDef = true;
                currentSection = 'itemdef';
                insideItemDef = true;
            } else if (currentIndent === 0 && insideItemDef) {
                insideItemDef = false;
                // Validate section headers and catch typos
                const validSections = ['operationalscenarios', 'operationalconditions', 'vehiclestates', 'driverstates', 'environments', 'safetyconcept'];
                if (validSections.includes(trimmedLine)) {
                    if (trimmedLine === 'operationalscenarios') {
                        hasOperationalScenarios = true;
                        currentSection = 'operationalscenarios';
                    } else if (trimmedLine === 'operationalconditions') {
                        hasOperationalConditions = true;
                        currentSection = 'operationalconditions';
                    } else if (trimmedLine === 'vehiclestates') {
                        hasVehicleStates = true;
                        currentSection = 'vehiclestates';
                    } else if (trimmedLine === 'driverstates') {
                        currentSection = 'driverstates';
                    } else if (trimmedLine === 'environments') {
                        currentSection = 'environments';
                    } else if (trimmedLine === 'safetyconcept') {
                        hasSafetyConcept = true;
                        currentSection = 'safetyconcept';
                    }
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid section "${trimmedLine}". Valid sections: ${validSections.join(', ')}`);
                }
            } else if (currentIndent === 1 && insideItemDef) {
                const firstWord = trimmedLine.split(' ')[0];
                if (firstWord && ['name', 'description', 'owner', 'reviewers'].includes(firstWord)) {
                    // Validate quoted properties
                    this.validatePropertyQuoting(diagnostics, lineIndex, trimmedLine);
                }
            }

            // Only validate section content if we're in a known section
            if (currentSection) {
                this.validateItmSectionContent(diagnostics, lineIndex, trimmedLine, currentSection, currentIndent);
            }

            // General def keyword validation
            if (line.includes('def ')) {
                const defMatch = line.match(/def\s+(\w+)\s+([A-Za-z0-9_]+)/);
                if (defMatch) {
                    const defType = defMatch[1];
                    const identifier = defMatch[2];
                    
                    // Validate identifier naming
                    if (identifier && !/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
                        this.addError(diagnostics, lineIndex, `Identifier "${identifier}" should use PascalCase`);
                    }

                    // Validate def types for .itm files
                    const validDefTypes = ['item', 'scenario', 'condition', 'vehiclestate', 'drivingstate', 'environment', 'boundary', 'overallsafetystrategy', 'principle', 'assumptionsofuse', 'foreseesablemisuse'];
                    if (defType && !validDefTypes.includes(defType)) {
                        this.addError(diagnostics, lineIndex, `Invalid def type "${defType}". Valid types: ${validDefTypes.join(', ')}`);
                    }
                }
            }
        }

        // Check for required sections
        if (!hasItemDef) {
            this.addError(diagnostics, 0, '.itm files must contain a "def item <identifier>" declaration');
        }
        if (!hasOperationalScenarios) {
            this.addError(diagnostics, 0, '.itm files must contain an "operationalscenarios" section');
        }
        if (!hasOperationalConditions) {
            this.addError(diagnostics, 0, '.itm files must contain an "operationalconditions" section');
        }
        if (!hasVehicleStates) {
            this.addError(diagnostics, 0, '.itm files must contain a "vehiclestates" section');
        }
        if (!hasSafetyConcept) {
            this.addError(diagnostics, 0, '.itm files must contain a "safetyconcept" section');
        }

        console.log(`[SafetyValidator] Found ${diagnostics.length} issues in .itm file`);
        return diagnostics;
    }

    private validateItmSectionContent(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, section: string, indentLevel: number): void {
        switch (section) {
            case 'itemdef':
                this.validateItemDefSection(diagnostics, lineIndex, line, indentLevel);
                break;
            case 'operationalscenarios':
                this.validateOperationalScenariosSection(diagnostics, lineIndex, line, indentLevel);
                break;
            case 'operationalconditions':
                this.validateOperationalConditionsSection(diagnostics, lineIndex, line, indentLevel);
                break;
            case 'vehiclestates':
                this.validateVehicleStatesSection(diagnostics, lineIndex, line, indentLevel);
                break;
            case 'driverstates':
                this.validateDriverStatesSection(diagnostics, lineIndex, line, indentLevel);
                break;
            case 'environments':
                this.validateEnvironmentsSection(diagnostics, lineIndex, line, indentLevel);
                break;
            case 'safetyconcept':
                this.validateSafetyConceptSection(diagnostics, lineIndex, line, indentLevel);
                break;
        }
    }

    private validateItemDefSection(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, indentLevel: number): void {
        const trimmed = line.trim();
        
        if (indentLevel === 0 && trimmed.startsWith('def item ')) {
            const parts = trimmed.split(' ');
            if (parts.length < 3) {
                this.addError(diagnostics, lineIndex, 'Item must have an identifier: "def item <identifier>"');
            }
        } else if (indentLevel === 1) {
            this.validateItemProperty(diagnostics, lineIndex, trimmed);
        } else if (indentLevel === 2) {
            const keyword = trimmed.split(' ')[0];
            const validSubKeywords = ['includes', 'excludes'];
            if (keyword && !validSubKeywords.includes(keyword) && !trimmed.startsWith('def boundary')) {
                this.addError(diagnostics, lineIndex, `Invalid item sub-property "${keyword}". Valid sub-properties: ${validSubKeywords.join(', ')} or "def boundary"`);
            }
        }
    }

    private validateItemProperty(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const keyword = line.split(' ')[0];
        
        switch (keyword) {
            case 'name':
            case 'description':
                if (!line.match(/^(name|description)\s+"[^"]*"$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must be a quoted string: ${keyword} "text"`);
                }
                break;
            case 'owner':
            case 'reviewers':
                if (!line.match(/^(owner|reviewers)\s+"[^"]*"(,\s*"[^"]*")*$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must be quoted strings: ${keyword} "Team1", "Team2"`);
                }
                break;
            case 'productline':
            case 'systemfeatures':
            case 'systemfunctions':
                if (!line.match(/^(productline|systemfeatures|systemfunctions)\s+[A-Za-z0-9_]+$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must reference an identifier: ${keyword} IDENTIFIER`);
                }
                break;
            case 'subsystems':
            case 'systemboundaries':
                // These are container keywords, no validation needed here
                break;
            default:
                const validProps = ['name', 'description', 'owner', 'reviewers', 'productline', 'systemfeatures', 'systemfunctions', 'subsystems', 'systemboundaries'];
                this.addError(diagnostics, lineIndex, `Invalid item property "${keyword}". Valid properties: ${validProps.join(', ')}`);
        }
    }

    private validateOperationalScenariosSection(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, indentLevel: number): void {
        const trimmed = line.trim();
        
        if (indentLevel === 1 && trimmed.startsWith('def scenario ')) {
            const parts = trimmed.split(' ');
            if (parts.length < 3) {
                this.addError(diagnostics, lineIndex, 'Scenario must have an identifier: "def scenario <identifier>"');
            }
        } else if (indentLevel === 1 && trimmed.startsWith('def ') && !trimmed.startsWith('def scenario ')) {
            // This def belongs to another section, ignore it
            return;
        } else if (indentLevel === 2) {
            this.validateScenarioProperty(diagnostics, lineIndex, trimmed);
        }
    }

    private validateScenarioProperty(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const keyword = line.split(' ')[0];
        
        switch (keyword) {
            case 'description':
                if (!line.match(/^description\s+"[^"]*"$/)) {
                    this.addError(diagnostics, lineIndex, 'description must be a quoted string: description "text"');
                }
                break;
            case 'vehiclestate':
            case 'environment':  
            case 'driverstate':
                if (!line.match(/^(vehiclestate|environment|driverstate)\s+[A-Za-z0-9_]+$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must reference an identifier: ${keyword} IDENTIFIER`);
                }
                break;
            default:
                const validProps = ['description', 'vehiclestate', 'environment', 'driverstate'];
                this.addError(diagnostics, lineIndex, `Invalid scenario property "${keyword}". Valid properties: ${validProps.join(', ')}`);
        }
    }

    private validateOperationalConditionsSection(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, indentLevel: number): void {
        const trimmed = line.trim();
        
        if (indentLevel === 1 && trimmed.startsWith('def condition ')) {
            const parts = trimmed.split(' ');
            if (parts.length < 3) {
                this.addError(diagnostics, lineIndex, 'Condition must have an identifier: "def condition <identifier>"');
            }
        } else if (indentLevel === 1 && trimmed.startsWith('def ') && !trimmed.startsWith('def condition ')) {
            // This def belongs to another section, ignore it
            return;
        } else if (indentLevel === 2) {
            this.validateConditionProperty(diagnostics, lineIndex, trimmed);
        }
    }

    private validateConditionProperty(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const keyword = line.split(' ')[0];
        
        switch (keyword) {
            case 'description':
            case 'range':
            case 'impact':
            case 'standard':
                if (!line.match(/^(description|range|impact|standard)\s+"[^"]*"$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must be a quoted string: ${keyword} "text"`);
                }
                break;
            default:
                const validProps = ['description', 'range', 'impact', 'standard'];
                this.addError(diagnostics, lineIndex, `Invalid condition property "${keyword}". Valid properties: ${validProps.join(', ')}`);
        }
    }

    private validateVehicleStatesSection(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, indentLevel: number): void {
        const trimmed = line.trim();
        
        if (indentLevel === 1 && trimmed.startsWith('def vehiclestate ')) {
            const parts = trimmed.split(' ');
            if (parts.length < 3) {
                this.addError(diagnostics, lineIndex, 'Vehicle state must have an identifier: "def vehiclestate <identifier>"');
            }
        } else if (indentLevel === 1 && trimmed.startsWith('def ') && !trimmed.startsWith('def vehiclestate ')) {
            // This def belongs to another section, ignore it
            return;
        } else if (indentLevel === 2) {
            this.validateVehicleStateProperty(diagnostics, lineIndex, trimmed);
        }
    }

    private validateVehicleStateProperty(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const keyword = line.split(' ')[0];
        
        switch (keyword) {
            case 'description':
            case 'characteristics':
                if (!line.match(/^(description|characteristics)\s+"[^"]*"$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must be a quoted string: ${keyword} "text"`);
                }
                break;
            default:
                const validProps = ['description', 'characteristics'];
                this.addError(diagnostics, lineIndex, `Invalid vehicle state property "${keyword}". Valid properties: ${validProps.join(', ')}`);
        }
    }

    private validateDriverStatesSection(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, indentLevel: number): void {
        const trimmed = line.trim();
        
        if (indentLevel === 1 && trimmed.startsWith('def drivingstate ')) {
            const parts = trimmed.split(' ');
            if (parts.length < 3) {
                this.addError(diagnostics, lineIndex, 'Driving state must have an identifier: "def drivingstate <identifier>"');
            }
        } else if (indentLevel === 1 && trimmed.startsWith('def ') && !trimmed.startsWith('def drivingstate ')) {
            // This def belongs to another section, ignore it
            return;
        } else if (indentLevel === 2) {
            this.validateDriverStateProperty(diagnostics, lineIndex, trimmed);
        }
    }

    private validateDriverStateProperty(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const keyword = line.split(' ')[0];
        
        switch (keyword) {
            case 'description':
            case 'characteristics':
                if (!line.match(/^(description|characteristics)\s+"[^"]*"$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must be a quoted string: ${keyword} "text"`);
                }
                break;
            default:
                const validProps = ['description', 'characteristics'];
                this.addError(diagnostics, lineIndex, `Invalid driving state property "${keyword}". Valid properties: ${validProps.join(', ')}`);
        }
    }

    private validateEnvironmentsSection(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, indentLevel: number): void {
        const trimmed = line.trim();
        
        if (indentLevel === 1 && trimmed.startsWith('def environment ')) {
            const parts = trimmed.split(' ');
            if (parts.length < 3) {
                this.addError(diagnostics, lineIndex, 'Environment must have an identifier: "def environment <identifier>"');
            }
        } else if (indentLevel === 1 && trimmed.startsWith('def ') && !trimmed.startsWith('def environment ')) {
            // This def belongs to another section, ignore it
            return;
        } else if (indentLevel === 2) {
            this.validateEnvironmentProperty(diagnostics, lineIndex, trimmed);
        }
    }

    private validateEnvironmentProperty(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const keyword = line.split(' ')[0];
        
        switch (keyword) {
            case 'description':
                if (!line.match(/^description\s+"[^"]*"$/)) {
                    this.addError(diagnostics, lineIndex, 'description must be a quoted string: description "text"');
                }
                break;
            case 'conditions':
                if (!line.match(/^conditions\s+[A-Za-z0-9_,\s]+$/)) {
                    this.addError(diagnostics, lineIndex, 'conditions must be a list of identifiers: conditions ID1, ID2, ID3');
                }
                break;
            default:
                const validProps = ['description', 'conditions'];
                this.addError(diagnostics, lineIndex, `Invalid environment property "${keyword}". Valid properties: ${validProps.join(', ')}`);
        }
    }

    private validateSafetyConceptSection(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, indentLevel: number): void {
        const trimmed = line.trim();
        
        if (indentLevel === 1) {
            // Check for def statements 
            if (trimmed.startsWith('def ')) {
                const defTypes = ['overallsafetystrategy', 'principle', 'assumptionsofuse', 'foreseesablemisuse'];
                const hasValidDef = defTypes.some(type => trimmed.startsWith(`def ${type} `));
                if (!hasValidDef) {
                    this.addError(diagnostics, lineIndex, `Invalid safety concept definition. Valid def types: ${defTypes.join(', ')}`);
                }
            } else if (trimmed.startsWith('principle ')) {
                // Handle principle declarations (not def statements)
                const parts = trimmed.split(' ');
                if (parts.length < 2) {
                    this.addError(diagnostics, lineIndex, 'Principle must have an identifier');
                }
            } else if (trimmed.startsWith('assumption ')) {
                // Handle assumption declarations (not def statements)
                const parts = trimmed.split(' ');
                if (parts.length < 2) {
                    this.addError(diagnostics, lineIndex, 'Assumption must have an identifier');
                }
            } else if (trimmed.startsWith('misuse ')) {
                // Handle misuse declarations (not def statements)
                const parts = trimmed.split(' ');
                if (parts.length < 2) {
                    this.addError(diagnostics, lineIndex, 'Misuse must have an identifier');
                }
            } else {
                // Check for safety concept keywords (not def statements)
                const keyword = trimmed.split(' ')[0];
                const validSafetyConceptKeywords = ['methodology', 'approach', 'strategy', 'measures'];
                if (keyword && !validSafetyConceptKeywords.includes(keyword)) {
                    this.addError(diagnostics, lineIndex, `Invalid safety concept keyword "${keyword}". Valid keywords: ${validSafetyConceptKeywords.join(', ')}`);
                }
            }
        } else if (indentLevel === 2) {
            // Properties within safety concept definitions
            this.validateSafetyConceptProperty(diagnostics, lineIndex, trimmed);
        }
    }

    private validateSafetyConceptProperty(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const keyword = line.split(' ')[0];
        
        switch (keyword) {
            case 'name':
            case 'description':
            case 'methodology':
                if (!line.match(/^(name|description|methodology)\s+"[^"]*"$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must be a quoted string: ${keyword} "text"`);
                }
                break;
            case 'layers':
            case 'assumptions':
            case 'scenarios':
                if (!line.match(/^(layers|assumptions|scenarios)\s+[A-Za-z0-9_,\s]+$/)) {
                    this.addError(diagnostics, lineIndex, `${keyword} must be a list of identifiers: ${keyword} ID1, ID2, ID3`);
                }
                break;
            default:
                const validProps = ['name', 'description', 'methodology', 'layers', 'assumptions', 'scenarios'];
                this.addError(diagnostics, lineIndex, `Invalid safety concept property "${keyword}". Valid properties: ${validProps.join(', ')}`);
        }
    }

    private validatePropertyQuoting(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const quotedProperties = ['name', 'description', 'rationale', 'methodology', 'range', 'impact', 'standard', 'characteristics'];
        for (const prop of quotedProperties) {
            if (line.startsWith(`${prop} `) && !line.includes(`${prop} "`)) {
                this.addWarning(diagnostics, lineIndex, `Property '${prop}' should be a quoted string`);
            }
        }
    }

    private validateBasicSafety(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Basic validation for other safety files
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line || line.trim().length === 0 || line.trim().startsWith('//')) {
                continue;
            }

            const trimmedLine = line.trim();

            // Basic safety level validation
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

            // Basic quoting validation
            const quotedProperties = ['name', 'description', 'rationale', 'methodology'];
            for (const prop of quotedProperties) {
                if (trimmedLine.includes(`${prop} `) && !trimmedLine.includes(`${prop} "`)) {
                    this.addWarning(diagnostics, lineIndex, `Property '${prop}' should be a quoted string`);
                }
            }
        }

        console.log(`[SafetyValidator] Found ${diagnostics.length} issues in safety file`);
        return diagnostics;
    }

    private getIndentLevel(line: string): number {
        let level = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '\t') {
                level++;
            } else if (line[i] === ' ') {
                // Two spaces = 1 level
                if (i + 1 < line.length && line[i + 1] === ' ') {
                    level++;
                    i++; // Skip next space
                }
            } else {
                break;
            }
        }
        return level;
    }

    private addError(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(
            range,
            message,
            vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = 'Sylang Safety';
        diagnostics.push(diagnostic);
    }

    private addWarning(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(
            range,
            message,
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'Sylang Safety';
        diagnostics.push(diagnostic);
    }
} 