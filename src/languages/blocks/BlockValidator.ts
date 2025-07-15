import * as vscode from 'vscode';
import { SymbolManager } from '../../core/SymbolManager';
import { getLanguageConfigByExtension } from '../../config/LanguageConfigs';

export class BlockValidator {
    private symbolManager: SymbolManager;
    private documentUri: string = '';

    constructor(symbolManager: SymbolManager) {
        this.symbolManager = symbolManager;
    }

    public async validate(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        this.documentUri = document.uri.toString();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Parse document with imports and get available symbols
        const languageConfig = getLanguageConfigByExtension('.blk');
        if (languageConfig) {
            await this.symbolManager.parseDocumentWithImports(document, languageConfig);
        }
        const documentUri = document.uri.toString();
        
        // Validate imports first
        const importValidation = this.symbolManager.validateImports(documentUri);
        if (importValidation.errors.length > 0) {
            // Convert import errors to diagnostics
            importValidation.errors.forEach(error => {
                const diagnostic = new vscode.Diagnostic(
                    error.range,
                    error.message,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'import-error';
                diagnostics.push(diagnostic);
            });
        }
        if (importValidation.warnings.length > 0) {
            // Convert import warnings to diagnostics  
            importValidation.warnings.forEach(warning => {
                const diagnostic = new vscode.Diagnostic(
                    warning.range,
                    warning.message,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = 'import-warning';
                diagnostics.push(diagnostic);
            });
        }

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
                } else if (trimmedLine.startsWith('use ')) {
                    // Allow import statements at root level - skip validation for now
                    continue;
                } else {
                    this.addError(diagnostics, lineIndex, '.blk files must start with "def block <type> <identifier>" (imports with "use" keyword are allowed before)');
                }
                continue;
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                // Handle def port out definitions
                if (trimmedLine.startsWith('def port out ')) {
                    this.validateDefPortOut(diagnostics, lineIndex, trimmedLine);
                    contextStack.push('port');
                } else {
                    this.addError(diagnostics, lineIndex, 'Only "def port out" definitions are allowed in .blk files. No other nested block definitions allowed.');
                }
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
            case 'block': return ['name', 'description', 'owner', 'tags', 'safetylevel', 'config', 'contains', 'partof', 'enables', 'implements', 'interfaces', 'port'];
            case 'port': return ['name', 'description', 'type', 'owner', 'tags'];
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
            case 'safetylevel':
                this.validateSafetyLevel(diagnostics, lineIndex, line);
                break;
            case 'config':
                this.validateConfigProperty(diagnostics, lineIndex, line);
                break;
            case 'type':
                if (context === 'port') {
                    this.validatePortType(diagnostics, lineIndex, line);
                } else {
                    this.addError(diagnostics, lineIndex, `Property "type" is only valid in port context`);
                }
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
            case 'port':
                this.validatePort(diagnostics, lineIndex, line);
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

    private validatePortType(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^type\s+(\w+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid port type. Expected format: type <Type>');
            return;
        }

        const portType = match[1];
        const validTypes = ['electrical', 'mechanical', 'data', 'CAN', 'Ethernet', 'hydraulic', 'pneumatic', 'optical', 'thermal', 'audio', 'RF', 'sensor', 'actuator'];

        if (!validTypes.includes(portType)) {
            this.addError(diagnostics, lineIndex, `Invalid port type "${portType}". Valid types: ${validTypes.join(', ')}`);
        }
    }

    private validatePort(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        // Handle 'port in' references - port in XXXX, YYYY, ZZZZ
        const portInMatch = line.trim().match(/^port\s+in\s+(.+)$/);
        if (portInMatch) {
            const portList = portInMatch[1];
            const identifiers = portList.split(',').map(id => id.trim());
            
            // Validate identifiers format
            for (const id of identifiers) {
                if (!/^[A-Z][A-Za-z0-9_]*$/.test(id)) {
                    this.addError(diagnostics, lineIndex, `Invalid port identifier "${id}" - should use PascalCase`);
                } else {
                    // Cross-file validation for port references
                    if (!this.symbolManager.isSymbolAvailable(id, this.documentUri)) {
                        this.addError(diagnostics, lineIndex, `Undefined port '${id}' - missing 'use port ${id}' import or definition in another .blk file`);
                    }
                }
            }
            return;
        }

        // If not 'port in', it's an invalid port syntax
        this.addError(diagnostics, lineIndex, 'Invalid port syntax. Expected format: port in <PortList> (port out definitions use "def port out <identifier>")');
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

        // Add cross-file validation for contains
        if (validIdentifiers.length > 0) {
            for (const identifier of validIdentifiers) {
                if (!this.symbolManager.isSymbolAvailable(identifier, this.documentUri)) {
                    this.addError(diagnostics, lineIndex, `Undefined ${containsType} '${identifier}' - missing 'use subsystem ${identifier}' import or definition`);
                }
            }
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
            // Add cross-file validation for partof
            if (!this.symbolManager.isSymbolAvailable(identifier, this.documentUri)) {
                this.addError(diagnostics, lineIndex, `Undefined ${partofType} '${identifier}' - missing 'use ${partofType} ${identifier}' import or definition`);
            }
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

        // Add cross-file validation for features
        for (const feature of features) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(feature)) continue; // Skip invalid features (already reported above)
            if (!this.symbolManager.isSymbolAvailable(feature, this.documentUri)) {
                this.addError(diagnostics, lineIndex, `Undefined feature '${feature}' - missing 'use featureset ${feature}' import or definition`);
            }
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

        // Add cross-file validation for functions
        for (const func of functions) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(func)) continue; // Skip invalid functions (already reported above)
            if (!this.symbolManager.isSymbolAvailable(func, this.documentUri)) {
                this.addError(diagnostics, lineIndex, `Undefined function '${func}' - missing 'use functiongroup ${func}' import or definition`);
            }
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

    private validateSafetyLevel(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^safetylevel\s+(ASIL-[ABCD]|[ABCD]|QM)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid safety level. Expected format: safetylevel <ASIL-A|ASIL-B|ASIL-C|ASIL-D|A|B|C|D|QM>');
        }
    }

    private validateConfigProperty(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^config\s+(c_[A-Za-z0-9_]+)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid config property. Expected format: config c_ConfigName');
            return;
        }

        const configName = match[1];
        if (!configName.startsWith('c_')) {
            this.addError(diagnostics, lineIndex, 'Config names must start with "c_" prefix');
        }
    }

    private validateDefPortOut(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string): void {
        const match = line.trim().match(/^def\s+port\s+out\s+([A-Za-z_][A-Za-z0-9_]*)$/);
        if (!match) {
            this.addError(diagnostics, lineIndex, 'Invalid "def port out" syntax. Expected format: def port out <Identifier>');
            return;
        }

        const identifier = match[1];

        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addError(diagnostics, lineIndex, `Invalid port identifier "${identifier}" - should use PascalCase`);
        } else {
            // Add cross-file validation for port definitions
            if (!this.symbolManager.isSymbolAvailable(identifier, this.documentUri)) {
                this.addError(diagnostics, lineIndex, `Undefined port '${identifier}' - missing 'use port ${identifier}' import or definition in another .blk file`);
            }
        }
    }
} 