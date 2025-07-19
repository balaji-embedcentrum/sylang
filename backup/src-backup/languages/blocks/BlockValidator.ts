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
        
        // Validate imports - handled by BlockValidator, not SymbolManager
        this.validateImports(document, diagnostics);

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
            case 'port': return ['name', 'description', 'type', 'owner', 'tags', 'safetylevel', 'config'];
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
        const validTypes = ['electrical', 'mechanical', 'data', 'CAN', 'Ethernet', 'hydraulic', 'pneumatic', 'optical', 'thermal', 'audio', 'RF', 'sensor', 'actuator', 'communication'];

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
            if (!this.isImportedSymbolAvailable(id)) {
                // NEW: Check if symbol exists but is grayed out due to config
                const regularSymbol = this.symbolManager.findSymbolInWorkspace(id, '.blk');
                console.log(`[BlockValidator] Port '${id}': regularSymbol=${!!regularSymbol}`);
                
                if (regularSymbol) {
                    // Check if it's grayed out by config
                    const configStateManager = this.symbolManager.getConfigStateManager();
                    console.log(`[BlockValidator] Checking if port '${id}' is grayed out...`);
                    
                    // Try to find config associated with this symbol
                    let isGrayedOut = false;
                    
                    // Check symbol properties for config
                    const configName = regularSymbol.properties.get('config');
                    console.log(`[BlockValidator] Port '${id}' config: '${configName}'`);
                    
                    if (configName) {
                        isGrayedOut = configStateManager.isConfigDisabled(configName);
                        console.log(`[BlockValidator] Config '${configName}' disabled: ${isGrayedOut}`);
                    }
                    
                    if (isGrayedOut) {
                        this.addError(diagnostics, lineIndex, `Port '${id}' is disabled by configuration. Check .vcf file.`);
                        console.log(`[BlockValidator] Added config error for port '${id}'`);
                    } else {
                        this.addError(diagnostics, lineIndex, `Undefined port '${id}' - missing import or definition in another .blk file`);
                        console.log(`[BlockValidator] Added undefined error for port '${id}'`);
                    }
                } else {
                    this.addError(diagnostics, lineIndex, `Undefined port '${id}' - missing import or definition in another .blk file`);
                    console.log(`[BlockValidator] Port '${id}' not found anywhere`);
                }
            } else {
                console.log(`[BlockValidator] Port '${id}' is available through imports`);
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
                if (!this.isImportedSymbolAvailable(identifier)) {
                    // NEW: Check if symbol exists but is grayed out due to config
                    const regularSymbol = this.symbolManager.findSymbolInWorkspace(identifier, '.blk');
                    if (regularSymbol) {
                        this.addError(diagnostics, lineIndex, `${containsType} '${identifier}' is disabled by configuration. Check .vcf file.`);
                    } else {
                        this.addError(diagnostics, lineIndex, `Undefined ${containsType} '${identifier}' - missing 'use block ${containsType} ${identifier}' import or definition`);
                    }
                }
            }
        }
    }

    private validatePartof(diagnostics: vscode.Diagnostic[], lineIndex: number, line: string, blockType: string): void {
        // Try full syntax first: partof <type> <identifier>
        const fullMatch = line.trim().match(/^partof\s+(\w+)\s+([A-Za-z_][A-Za-z0-9_]*)$/);
        // Try simple syntax: partof <identifier>
        const simpleMatch = line.trim().match(/^partof\s+([A-Za-z_][A-Za-z0-9_]*)$/);
        
        let partofType: string;
        let identifier: string;
        
        if (fullMatch) {
            partofType = fullMatch[1];
            identifier = fullMatch[2];
        } else if (simpleMatch) {
            identifier = simpleMatch[1];
            // Infer parent type based on current block type hierarchy
            partofType = this.inferParentType(blockType);
        } else {
            this.addError(diagnostics, lineIndex, 'Invalid partof syntax. Expected format: partof <identifier> or partof <type> <identifier>');
            return;
        }

        // Validate hierarchical relationships (only if we have explicit type)
        if (fullMatch && !this.isValidPartofRelationship(blockType, partofType)) {
            this.addError(diagnostics, lineIndex, `Block type "${blockType}" cannot be part of "${partofType}". ${this.getValidPartofSuggestion(blockType)}`);
            return;
        }

        // Validate identifier format
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addError(diagnostics, lineIndex, `Invalid identifier "${identifier}" in partof - should use PascalCase`);
        } else {
            // Add cross-file validation for partof
            if (!this.isImportedSymbolAvailable(identifier)) {
                // NEW: Check if symbol exists but is grayed out due to config
                const regularSymbol = this.symbolManager.findSymbolInWorkspace(identifier, '.blk');
                if (regularSymbol) {
                    this.addError(diagnostics, lineIndex, `Symbol '${identifier}' is disabled by configuration. Check .vcf file.`);
                } else {
                    this.addError(diagnostics, lineIndex, `Undefined '${identifier}' - missing 'use block ${partofType} ${identifier}' import or definition`);
                }
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
            if (!this.isImportedSymbolAvailable(feature)) {
                // NEW: Check if symbol exists but is grayed out due to config
                const regularSymbol = this.symbolManager.findSymbolInWorkspace(feature, '.blk');
                if (regularSymbol) {
                    this.addError(diagnostics, lineIndex, `Feature '${feature}' is disabled by configuration. Check .vcf file.`);
                } else {
                    this.addError(diagnostics, lineIndex, `Undefined feature '${feature}' - missing 'use featureset ${feature}' import or definition`);
                }
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
            if (!this.isImportedSymbolAvailable(func)) {
                // NEW: Check if symbol exists but is grayed out due to config
                const regularSymbol = this.symbolManager.findSymbolInWorkspace(func, '.blk');
                if (regularSymbol) {
                    this.addError(diagnostics, lineIndex, `Function '${func}' is disabled by configuration. Check .vcf file.`);
                } else {
                    this.addError(diagnostics, lineIndex, `Undefined function '${func}' - missing 'use functiongroup ${func}' import or definition`);
                }
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

    private inferParentType(blockType: string): string {
        // Infer most likely parent type based on hierarchy
        const typeHierarchy: Record<string, string> = {
            'part': 'circuit',
            'circuit': 'assembly', 
            'subassembly': 'assembly',
            'assembly': 'unit',
            'subunit': 'unit',
            'unit': 'module',
            'submodule': 'module', 
            'module': 'component',
            'subcomponent': 'component',
            'component': 'subsystem',
            'subsystem': 'system',
            'system': 'product'
        };
        
        return typeHierarchy[blockType] || 'system'; // Default to system for unknown types
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
        }
        // Note: Port definitions don't need cross-file validation - they are definitions, not references
    }

    private validateImports(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]): void {
        const text = document.getText();
        const lines = text.split('\n');
        const usedSymbols = new Set<string>();
        const imports: Array<{keyword: string, identifier: string, range: vscode.Range, lineIndex: number}> = [];

        // Parse imports and collect used symbols in one pass
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex].trim();
            if (!line || line.startsWith('//')) continue;

            // Parse ANY import: use <keyword> <identifier> or use <keyword> <type> <identifier>
            const useMatch = line.match(/^use\s+(\w+)(?:\s+(\w+))?\s+([A-Za-z_][A-Za-z0-9_]*)$/);
            if (useMatch) {
                const keyword = useMatch[1]; // first keyword (e.g., 'block', 'configset', 'featureset', etc.)
                const type = useMatch[2]; // optional type (e.g., 'system' in 'use block system Foo')
                const identifier = useMatch[3]; // the identifier
                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                imports.push({keyword: type || keyword, identifier, range, lineIndex});
                continue;
            }

            // Collect symbol references
            // partof references
            const partofMatch = line.match(/^partof\s+(?:\w+\s+)?([A-Za-z_][A-Za-z0-9_]*)$/);
            if (partofMatch) {
                usedSymbols.add(partofMatch[1]);
            }

            // contains references
            const containsMatch = line.match(/^contains\s+\w+\s+(.+)$/);
            if (containsMatch) {
                const identifiers = containsMatch[1].split(',').map(s => s.trim());
                identifiers.forEach(id => {
                    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(id)) {
                        usedSymbols.add(id);
                    }
                });
            }

            // port in references
            const portInMatch = line.match(/^port\s+in\s+(.+)$/);
            if (portInMatch) {
                const portList = portInMatch[1].split(',').map(s => s.trim());
                portList.forEach(port => {
                    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(port)) {
                        usedSymbols.add(port);
                    }
                });
            }

            // enables feature references
            const enablesMatch = line.match(/^enables\s+feature\s+(.+)$/);
            if (enablesMatch) {
                const features = enablesMatch[1].split(',').map(s => s.trim());
                features.forEach(feature => {
                    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(feature)) {
                        usedSymbols.add(feature);
                    }
                });
            }

            // implements function references
            const implementsMatch = line.match(/^implements\s+function\s+(.+)$/);
            if (implementsMatch) {
                const functions = implementsMatch[1].split(',').map(s => s.trim());
                functions.forEach(func => {
                    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(func)) {
                        usedSymbols.add(func);
                    }
                });
            }

            // config usage references (e.g., "config c_ConfigName")
            const configMatch = line.match(/^config\s+(c_[A-Za-z0-9_]+)$/);
            if (configMatch) {
                const configName = configMatch[1];
                usedSymbols.add(configName);
            }
        }

        // Validate each import
        for (const importStmt of imports) {
            const blockTypes = ['system', 'subsystem', 'component', 'subcomponent', 'module', 'submodule', 'unit', 'subunit', 'assembly', 'subassembly', 'circuit', 'part', 'product'];
            
            // Check if imported symbol exists
            let symbolExists = false;
            if (blockTypes.includes(importStmt.keyword)) {
                // For block imports: check workspace directly
                symbolExists = this.isSymbolAvailableInWorkspace(importStmt.identifier);
            } else {
                // For configset, featureset, functiongroup, etc.: use SymbolManager system
                symbolExists = this.symbolManager.isSymbolAvailable(importStmt.identifier, this.documentUri);
            }

            if (!symbolExists) {
                this.addError(diagnostics, importStmt.lineIndex, `Import error: '${importStmt.identifier}' not found in workspace`);
                continue;
            }

            // Check if import is used (applies to ALL import types)
            let importIsUsed = false;
            
            if (blockTypes.includes(importStmt.keyword)) {
                // For block imports: check if the block name itself is used
                importIsUsed = usedSymbols.has(importStmt.identifier);
            } else {
                // For header imports (configset, featureset, functiongroup): check if any child symbols are used
                const headerDef = this.symbolManager.getHeaderDefinition(importStmt.identifier);
                if (headerDef && headerDef.childSymbols) {
                    importIsUsed = headerDef.childSymbols.some(childSymbol => usedSymbols.has(childSymbol));
                } else {
                    // Fallback: check if the header name itself is used
                    importIsUsed = usedSymbols.has(importStmt.identifier);
                }
            }

            if (!importIsUsed) {
                const diagnostic = new vscode.Diagnostic(
                    importStmt.range,
                    `Unused import: '${importStmt.identifier}'`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = 'import-warning';
                diagnostics.push(diagnostic);
            }
        }
    }

    private isSymbolAvailableInWorkspace(symbolName: string): boolean {
        // For .blk imports, we check if the symbol exists anywhere in workspace
        // Search ALL .blk files in workspace since cross-file references are allowed
        return this.symbolManager.findSymbolInWorkspace(symbolName, '.blk') !== null;
    }

    private isImportedSymbolAvailable(symbolName: string): boolean {
        // Check if symbol is available through .blk imports or workspace search
        // For .blk files, symbols can be referenced across files in same directory
        return this.symbolManager.isSymbolAvailable(symbolName, this.documentUri) || 
               this.symbolManager.findSymbolInWorkspace(symbolName, '.blk') !== null;
    }

    // ============================================================================
    // NEW: Config-aware validation methods (additive functionality)
    // ============================================================================

    /**
     * NEW: Config-aware version of isImportedSymbolAvailable
     * Excludes grayed out symbols from availability check
     */
    private isImportedSymbolAvailableConfigAware(symbolName: string): boolean {
        // Check if symbol is available and not grayed out
        return this.symbolManager.isSymbolAvailable(symbolName, this.documentUri) || 
               this.symbolManager.findActiveSymbolInWorkspace(symbolName, '.blk') !== null;
    }

    /**
     * NEW: Config-aware version of isSymbolAvailableInWorkspace
     * Excludes grayed out symbols from workspace search
     */
    private isSymbolAvailableInWorkspaceConfigAware(symbolName: string): boolean {
        // For .blk imports, search all .blk files but exclude grayed out symbols
        return this.symbolManager.findActiveSymbolInWorkspace(symbolName, '.blk') !== null;
    }

    /**
     * NEW: Enhanced validation method that includes config awareness
     * This can be called in addition to the existing validate method
     */
    public async validateWithConfigAwareness(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];
        
        console.log(`[BlockValidator] Config-aware validation for: ${document.fileName}`);
        
        // Get all symbols used in this document
        const usedSymbols = this.extractUsedSymbols(document);
        console.log(`[BlockValidator] Found used symbols:`, Array.from(usedSymbols));
        
        // Check each used symbol against config state
        for (const symbolName of usedSymbols) {
            // Check if symbol exists but is grayed out
            const regularSymbol = this.symbolManager.findSymbolInWorkspace(symbolName, '.blk');
            const activeSymbol = this.symbolManager.findActiveSymbolInWorkspace(symbolName, '.blk');
            
            console.log(`[BlockValidator] Symbol '${symbolName}': regular=${!!regularSymbol}, active=${!!activeSymbol}`);
            
            if (regularSymbol && !activeSymbol) {
                // Symbol exists but is grayed out due to config
                console.log(`[BlockValidator] Symbol '${symbolName}' is grayed out - adding error`);
                const lines = document.getText().split('\n');
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];
                    if (line.includes(symbolName)) {
                        this.addError(diagnostics, lineIndex, 
                            `Symbol '${symbolName}' is disabled by configuration. Check .vcf file.`);
                        console.log(`[BlockValidator] Added config error for '${symbolName}' at line ${lineIndex + 1}`);
                        break; // Only report once per symbol
                    }
                }
            }
        }
        
        console.log(`[BlockValidator] Config-aware validation complete: ${diagnostics.length} diagnostics`);
        return diagnostics;
    }

    /**
     * NEW: Extract all symbol references from a document
     * Helper method for config-aware validation
     */
    private extractUsedSymbols(document: vscode.TextDocument): Set<string> {
        const usedSymbols = new Set<string>();
        const text = document.getText();
        const lines = text.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            // Collect symbol references (same patterns as existing validation)
            const partofMatch = trimmedLine.match(/^partof\s+(?:\w+\s+)?([A-Za-z_][A-Za-z0-9_]*)$/);
            if (partofMatch) {
                usedSymbols.add(partofMatch[1]);
            }

            const containsMatch = trimmedLine.match(/^contains\s+\w+\s+(.+)$/);
            if (containsMatch) {
                const identifiers = containsMatch[1].split(',').map(s => s.trim());
                identifiers.forEach(id => {
                    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(id)) {
                        usedSymbols.add(id);
                    }
                });
            }

            const portInMatch = trimmedLine.match(/^port\s+in\s+(.+)$/);
            if (portInMatch) {
                const portList = portInMatch[1].split(',').map(s => s.trim());
                portList.forEach(port => {
                    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(port)) {
                        usedSymbols.add(port);
                    }
                });
            }

            const enablesMatch = trimmedLine.match(/^enables\s+feature\s+(.+)$/);
            if (enablesMatch) {
                const features = enablesMatch[1].split(',').map(s => s.trim());
                features.forEach(feature => {
                    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(feature)) {
                        usedSymbols.add(feature);
                    }
                });
            }

            const implementsMatch = trimmedLine.match(/^implements\s+function\s+(.+)$/);
            if (implementsMatch) {
                const functions = implementsMatch[1].split(',').map(s => s.trim());
                functions.forEach(func => {
                    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(func)) {
                        usedSymbols.add(func);
                    }
                });
            }
        }

        return usedSymbols;
    }


} 