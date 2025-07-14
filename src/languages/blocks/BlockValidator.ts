import * as vscode from 'vscode';

export class BlockValidator {
    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let hasBlock = false;
        let contextStack: string[] = [];
        let currentBlockType = '';

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

            // Root level: def block <type> <identifier>
            if (level === 0) {
                if (trimmedLine.startsWith('def block ')) {
                    const blockMatch = trimmedLine.match(/^def\s+block\s+(\w+)\s+([A-Za-z_][A-Za-z0-9_]*)$/);
                    if (!blockMatch) {
                        this.addError(diagnostics, lineIndex, 'Invalid block declaration: "def block <type> <identifier>"');
                        continue;
                    }
                    
                    const blockType = blockMatch[1];
                    const identifier = blockMatch[2];
                    
                    // Validate block type
                    if (!this.isValidBlockType(blockType)) {
                        this.addError(diagnostics, lineIndex, `Invalid block type "${blockType}". Valid types: ${this.getValidBlockTypes().join(', ')}`);
                        continue;
                    }
                    
                    // Validate identifier format
                    if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
                        this.addError(diagnostics, lineIndex, `Block identifier "${identifier}" should use PascalCase`);
                    }
                    
                    contextStack = ['block'];
                    currentBlockType = blockType;
                    hasBlock = true;
                } else {
                    this.addError(diagnostics, lineIndex, '.blk files must start with "def block <type> <identifier>"');
                }
                continue;
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                this.addError(diagnostics, lineIndex, 'No nested block definitions allowed in .blk files');
            } else {
                const keyword = trimmedLine.split(' ')[0];
                const validProperties = this.getValidProperties(currentContext);

                if (keyword && validProperties.includes(keyword)) {
                    this.validatePropertyLine(diagnostics, lineIndex, trimmedLine, currentContext, keyword, currentBlockType);
                } else {
                    this.addError(diagnostics, lineIndex, `Invalid keyword "${keyword || ''}" in ${currentContext}. Valid: ${validProperties.join(', ')}`);
                }
            }
        }

        // Check required sections
        if (!hasBlock) this.addError(diagnostics, 0, '.blk files must contain "def block <type> <identifier>"');

        return diagnostics;
    }

    private getValidBlockTypes(): string[] {
        return ['product', 'system', 'subsystem', 'component', 'subcomponent', 'module', 'submodule', 'unit', 'subunit', 'assembly', 'subassembly', 'circuit', 'part'];
    }

    private isValidBlockType(type: string): boolean {
        return this.getValidBlockTypes().includes(type);
    }

    private getValidProperties(context: string): string[] {
        switch (context) {
            case 'block': return ['name', 'description', 'owner', 'tags', 'asil', 'contains', 'partof', 'enables', 'implements', 'interfaces'];
            default: return [];
        }
    }

    private validatePropertyLine(
        diagnostics: vscode.Diagnostic[], 
        lineIndex: number, 
        line: string, 
        context: string, 
        keyword: string, 
        blockType: string
    ): void {
        switch (keyword) {
            case 'name':
            case 'description':
            case 'owner':
                this.validateQuotedString(diagnostics, lineIndex, line, keyword);
                break;
            case 'tags':
                this.validateQuotedStringList(diagnostics, lineIndex, line, keyword);
                break;
            case 'asil':
                this.validateAsil(diagnostics, lineIndex, line, blockType);
                break;
            case 'contains':
                this.validateContains(diagnostics, lineIndex, line, blockType);
                break;
            case 'partof':
                this.validatePartof(diagnostics, lineIndex, line, blockType);
                break;
            case 'enables':
                this.validateEnablesFeature(diagnostics, lineIndex, line);
                break;
            case 'implements':
                this.validateImplementsFunction(diagnostics, lineIndex, line);
                break;
            case 'interfaces':
                this.validateInterfaces(diagnostics, lineIndex, line);
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

    private validateAsil(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, blockType: string): void {
        const match = line.trim().match(/^asil\s+(\w+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid asil property. Expected format: asil <level>');
            return;
        }

        const asilLevel = match[1];
        const validLevels = ['QM', 'A', 'B', 'C', 'D'];
        
        if (!validLevels.includes(asilLevel)) {
            this.addError(diagnostics, lineIndex, `Invalid asil level "${asilLevel}". Valid levels: ${validLevels.join(', ')}`);
            return;
        }

        // Add note about ASIL inheritance for hierarchical blocks
        if (['component', 'subcomponent', 'module', 'submodule', 'unit', 'subunit', 'assembly', 'subassembly', 'circuit', 'part'].includes(blockType)) {
            this.addInfo(diagnostics, lineIndex, `💡 ASIL Inheritance: Child blocks cannot have higher ASIL level than their parent. Verify parent block ASIL level.`);
        }
    }

    private validateContains(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, blockType: string): void {
        const match = line.trim().match(/^contains\s+(\w+)\s+(.+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid contains syntax. Expected format: contains <type> <IdentifierList>');
            return;
        }

        const containsType = match[1];
        const identifierList = match[2];

        // Validate hierarchical relationships
        if (!this.isValidContainmentRelationship(blockType, containsType)) {
            this.addError(diagnostics, lineIndex, `Block type "${blockType}" cannot contain "${containsType}". ${this.getValidContainmentSuggestion(blockType)}`);
            return;
        }

        // Validate identifiers
        const identifiers = identifierList.split(',').map(id => id.trim());
        let validIdentifiers: string[] = [];
        for (const id of identifiers) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(id)) {
                this.addError(diagnostics, lineIndex, `Invalid identifier "${id}" in contains list - should use PascalCase`);
            } else {
                validIdentifiers.push(id);
            }
        }

        // Add cross-file validation hint for contains
        if (validIdentifiers.length > 0) {
            this.addInfo(diagnostics, lineIndex, `🔗 Cross-file validation: Verify that ${containsType}s [${validIdentifiers.join(', ')}] exist in other .blk files`);
        }
    }

    private validatePartof(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, blockType: string): void {
        const match = line.trim().match(/^partof\s+(\w+)\s+([A-Za-z_][A-Za-z0-9_]*)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid partof syntax. Expected format: partof <type> <identifier>');
            return;
        }

        const partofType = match[1];
        const identifier = match[2];

        // Validate hierarchical relationships
        if (!this.isValidPartofRelationship(blockType, partofType)) {
            this.addError(diagnostics, lineIndex, `Block type "${blockType}" cannot be part of "${partofType}". ${this.getValidPartofSuggestion(blockType)}`);
            return;
        }

        // Validate identifier format
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addError(diagnostics, lineIndex, `Invalid identifier "${identifier}" in partof - should use PascalCase`);
        } else {
            // Add cross-file validation hint for partof
            this.addInfo(diagnostics, lineIndex, `🔗 Cross-file validation: Verify that ${partofType} "${identifier}" exists in another .blk file`);
        }
    }

    private validateEnablesFeature(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^enables\s+feature\s+(.+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid enables syntax. Expected format: enables feature <FeatureList>');
            return;
        }

        const featuresText = match[1];
        const features = featuresText.split(',').map(f => f.trim());
        
        for (const feature of features) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(feature)) {
                this.addError(diagnostics, lineIndex, `Invalid feature identifier "${feature}" - should use PascalCase`);
            }
        }

        // Add cross-file validation hint
        if (features.length > 0) {
            this.addInfo(diagnostics, lineIndex, `🔗 Cross-file validation: Verify that features [${features.join(', ')}] are defined in .fml files`);
        }
    }

    private validateImplementsFunction(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^implements\s+function\s+(.+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid implements syntax. Expected format: implements function <FunctionList>');
            return;
        }

        const functionsText = match[1];
        const functions = functionsText.split(',').map(f => f.trim());
        
        for (const func of functions) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(func)) {
                this.addError(diagnostics, lineIndex, `Invalid function identifier "${func}" - should use PascalCase`);
            }
        }

        // Add cross-file validation hint
        if (functions.length > 0) {
            this.addInfo(diagnostics, lineIndex, `🔗 Cross-file validation: Verify that functions [${functions.join(', ')}] are defined in .fun files`);
        }
    }

    private validateInterfaces(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^interfaces\s+(.+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid interfaces syntax. Expected format: interfaces <InterfaceList>');
            return;
        }

        const interfacesText = match[1];
        const interfaces = interfacesText.split(',').map(i => i.trim());
        
        for (const iface of interfaces) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(iface)) {
                this.addError(diagnostics, lineIndex, `Invalid interface identifier "${iface}" - should use PascalCase`);
            }
        }
    }

    private isValidContainmentRelationship(parentType: string, childType: string): boolean {
        const hierarchy = {
            'product': ['system'],
            'system': ['subsystem'],
            'subsystem': ['component'],
            'component': ['subcomponent', 'module'],
            'subcomponent': ['module'],
            'module': ['submodule', 'unit'],
            'submodule': ['unit'],
            'unit': ['subunit', 'assembly'],
            'subunit': ['assembly'],
            'assembly': ['subassembly', 'circuit'],
            'subassembly': ['circuit'],
            'circuit': ['part'],
            'part': []
        };

        return hierarchy[parentType]?.includes(childType) || false;
    }

    private isValidPartofRelationship(childType: string, parentType: string): boolean {
        return this.isValidContainmentRelationship(parentType, childType);
    }

    private getValidContainmentSuggestion(blockType: string): string {
        const validChildren = {
            'product': 'systems',
            'system': 'subsystems',
            'subsystem': 'components',
            'component': 'subcomponents or modules',
            'subcomponent': 'modules',
            'module': 'submodules or units',
            'submodule': 'units',
            'unit': 'subunits or assemblies',
            'subunit': 'assemblies',
            'assembly': 'subassemblies or circuits',
            'subassembly': 'circuits',
            'circuit': 'parts',
            'part': 'nothing (leaf level)'
        };

        const suggestion = validChildren[blockType] || 'nothing';
        return `💡 "${blockType}" can contain: ${suggestion}\n📚 Full hierarchy: product → system → subsystem → component → [subcomponent] → module → [submodule] → unit → [subunit] → assembly → [subassembly] → circuit → part`;
    }

    private getValidPartofSuggestion(blockType: string): string {
        const validParents = {
            'system': 'product',
            'subsystem': 'system', 
            'component': 'subsystem',
            'subcomponent': 'component',
            'module': 'component or subcomponent',
            'submodule': 'module',
            'unit': 'module or submodule',
            'subunit': 'unit',
            'assembly': 'unit or subunit',
            'subassembly': 'assembly',
            'circuit': 'assembly or subassembly',
            'part': 'circuit'
        };

        const suggestion = validParents[blockType] || 'nothing (top level)';
        return `💡 "${blockType}" can be part of: ${suggestion}\n📚 Reverse hierarchy: part ← circuit ← [subassembly] ← assembly ← [subunit] ← unit ← [submodule] ← module ← [subcomponent] ← component ← subsystem ← system ← product`;
    }

    private getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        if (!match || !match[1]) return 0;
        return match[1].length / 2; // Assuming 2 spaces per indent level
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

    private addInfo(diagnostics: vscode.Diagnostic[], lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Information);
        diagnostics.push(diagnostic);
    }
} 