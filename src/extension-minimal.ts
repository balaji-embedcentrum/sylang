import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EXTENSION_VERSION, EXTENSION_NAME, EXTENSION_ID } from './constants';

/**
 * NEW MODULAR SYSTEM - Complete with config graying, import validation, cross-file validation
 */

// =============================================================================
// SYMBOL AND CONFIG MANAGEMENT
// =============================================================================

interface SymbolDefinition {
    id: string;
    name: string;
    type: string;
    fileUri: string;
    isVisible: boolean; // Based on config
    configKey?: string;
    configValue?: number;
}

interface ImportedFile {
    uri: string;
    symbols: Map<string, SymbolDefinition>;
}

class ConfigStateManager {
    private configValues = new Map<string, number>();
    private symbolVisibility = new Map<string, boolean>();

    async updateConfigFromImports(document: vscode.TextDocument): Promise<void> {
        // First check current document for config
        this.updateConfigFromDocument(document);
        
        // Then load config from imported .vcf files
        const text = document.getText();
        const lines = text.split('\n');
        const documentDir = path.dirname(document.uri.fsPath);
        
        // Load explicitly imported config files
        for (const line of lines) {
            const trimmedLine = line.trim();
            // Match: use configset ConfigName or use variantmodel ConfigName
            const importMatch = trimmedLine.match(/use\s+(configset|variantmodel)\s+(\w+)/);
            if (importMatch) {
                const importType = importMatch[1];
                const importName = importMatch[2];
                
                await this.loadConfigFromImportedFile(documentDir, importType, importName);
            }
        }

        // AUTO-SEARCH for config files if none imported explicitly
        if (this.configValues.size === 0) {
            console.log(`🔍 Auto-searching for config files from: ${documentDir}`);
            await this.autoSearchConfigFiles(documentDir);
        }
    }

    private async loadConfigFromImportedFile(documentDir: string, importType: string, importName: string): Promise<void> {
        try {
            const extension = importType === 'configset' ? '.vcf' : '.vml';
            const possiblePaths = [
                path.join(documentDir, `${importName}${extension}`),
                path.join(documentDir, '..', 'platform-engineering', `${importName}${extension}`),
                path.join(documentDir, '..', 'system-engineering', `${importName}${extension}`),
                // Try with -Config suffix for generated config files
                path.join(documentDir, `${importName}-Config.vcf`),
                path.join(documentDir, '..', 'platform-engineering', `${importName}-Config.vcf`)
            ];

            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath)) {
                    console.log(`🔧 Loading config v${EXTENSION_VERSION}: ${filePath}`);
                    const content = fs.readFileSync(filePath, 'utf8');
                    this.parseConfigFromContent(content);
                    break;
                }
            }
        } catch (error) {
            console.warn(`⚠️ Failed to load config ${importName}:`, error);
        }
    }

    private async autoSearchConfigFiles(documentDir: string): Promise<void> {
        // Search patterns for config files
        const searchDirs = [
            documentDir,
            path.join(documentDir, '..', 'platform-engineering'),
            path.join(documentDir, '..', 'system-engineering'),
            path.join(documentDir, '..')
        ];

        for (const searchDir of searchDirs) {
            try {
                if (fs.existsSync(searchDir)) {
                    const files = fs.readdirSync(searchDir);
                    
                    // Look for .vcf files (config files)
                    const configFiles = files.filter(file => 
                        file.endsWith('.vcf') || 
                        file.endsWith('-Config.vcf') ||
                        file.includes('Config') && file.endsWith('.vcf')
                    );
                    
                    for (const configFile of configFiles) {
                        const configPath = path.join(searchDir, configFile);
                        console.log(`🔧 Auto-loading config v${EXTENSION_VERSION}: ${configPath}`);
                        
                        const content = fs.readFileSync(configPath, 'utf8');
                        this.parseConfigFromContent(content);
                    }
                    
                    if (configFiles.length > 0) {
                        console.log(`📋 Found ${configFiles.length} config files in ${searchDir}`);
                        break; // Stop searching once we find config files
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Failed to search directory ${searchDir}:`, error);
            }
        }
    }

    private parseConfigFromContent(content: string): void {
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            // Match: def config c_Something 0
            const configMatch = trimmedLine.match(/def\s+config\s+(\w+)\s+([01])/);
            if (configMatch) {
                const configKey = configMatch[1];
                const configValue = parseInt(configMatch[2]);
                this.configValues.set(configKey, configValue);
                console.log(`🔧 Config v${EXTENSION_VERSION}: ${configKey} = ${configValue} (from imported file)`);
            }
        }
    }

    updateConfigFromDocument(document: vscode.TextDocument): void {
        const text = document.getText();
        this.parseConfigFromContent(text);
    }

    isSymbolVisible(configKey: string): boolean {
        const value = this.configValues.get(configKey);
        const visible = value === undefined || value === 1; // Default visible if not found
        console.log(`👁️ Check visibility v${EXTENSION_VERSION}: ${configKey} = ${value} → visible: ${visible}`);
        return visible;
    }

    getConfigValue(configKey: string): number | undefined {
        return this.configValues.get(configKey);
    }
}

class SymbolResolver {
    private symbols = new Map<string, SymbolDefinition>();
    public imports = new Map<string, ImportedFile>(); // Made public for child symbol access

    async resolveImportsForDocument(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        const documentDir = path.dirname(document.uri.fsPath);
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            // Match: use functiongroup MyFunctions
            const importMatch = trimmedLine.match(/use\s+(\w+)\s+(\w+)/);
            if (importMatch) {
                const importType = importMatch[1]; // functiongroup, featureset, etc.
                const importName = importMatch[2]; // MyFunctions
                
                await this.loadImportedSymbols(documentDir, importType, importName);
            }
        }
    }

    private async loadImportedSymbols(documentDir: string, importType: string, importName: string): Promise<void> {
        try {
            // Find the file based on import type
            const extension = this.getExtensionForImportType(importType);
            
            // 🎯 FIND PROJECT ROOT BY LOOKING FOR .sylangrules FILE!
            const projectRoot = this.findProjectRoot(documentDir);
            if (!projectRoot) {
                console.warn(`⚠️ Could not find .sylangrules file in parent directories of ${documentDir}`);
                return;
            }
            
            console.log(`🔍 v${EXTENSION_VERSION}: Project root found at: ${projectRoot}`);
            console.log(`🔍 Searching for ${importName}${extension} in ALL subdirectories...`);
            
            // Search ALL subdirectories in the project root recursively
            const searchPattern = `**/${importName}${extension}`;
            const files = await vscode.workspace.findFiles(
                new vscode.RelativePattern(projectRoot, searchPattern), 
                '**/node_modules/**'
            );
            
            console.log(`🔍 Found ${files.length} files matching pattern: ${searchPattern}`);
            
            for (const file of files) {
                const filePath = file.fsPath;
                console.log(`📦 Checking file: ${filePath}`);
                
                if (fs.existsSync(filePath)) {
                    console.log(`📦 Loading v${EXTENSION_VERSION}: ${filePath}`);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const symbols = this.parseSymbolsFromContent(content, filePath);
                    
                    // Check if the symbol we're looking for actually exists in this file
                    if (symbols.has(importName)) {
                        console.log(`✅ Found symbol '${importName}' in ${filePath}`);
                        this.imports.set(importName, {
                            uri: filePath,
                            symbols: symbols
                        });
                        return; // Found it!
                    } else {
                        console.log(`❌ Symbol '${importName}' not found in ${filePath}, has: ${Array.from(symbols.keys()).join(', ')}`);
                    }
                }
            }
            
            console.warn(`⚠️ Symbol '${importName}' not found in any ${extension} files in project root ${projectRoot}`);
        } catch (error) {
            console.warn(`⚠️ Failed to load import ${importName}:`, error);
        }
    }

    private findProjectRoot(startDir: string): string | null {
        let currentDir = startDir;
        
        // Walk up the directory tree looking for .sylangrules file
        while (currentDir !== path.dirname(currentDir)) { // Stop at filesystem root
            const sylangRulesPath = path.join(currentDir, '.sylangrules');
            if (fs.existsSync(sylangRulesPath)) {
                console.log(`📋 Found .sylangrules at: ${sylangRulesPath}`);
                return currentDir;
            }
            currentDir = path.dirname(currentDir);
        }
        
        return null; // No .sylangrules found
    }

    private getExtensionForImportType(importType: string): string {
        // Map import types to file extensions - support ALL def types
        const extensionMap: Record<string, string> = {
            // Container types
            'featureset': '.fml',
            'functiongroup': '.fun', 
            'configset': '.vcf',
            'variantmodel': '.vml',
            'productline': '.ple',
            
            // Block types (all can be imported)
            'system': '.blk',
            'subsystem': '.blk', 
            'component': '.blk',
            'subcomponent': '.blk',
            'module': '.blk',
            'unit': '.blk',
            'assembly': '.blk',
            'circuit': '.blk',
            'part': '.blk',
            'block': '.blk', // Generic block
            
            // Individual types
            'function': '.fun',
            'requirement': '.req',
            'test': '.tst',
            'testcase': '.tst',
            'feature': '.fml',
            
            // Safety types
            'hazard': '.haz',
            'safetygoal': '.sgl',
            'risk': '.rsk',
            'failuremode': '.fma',
            'control': '.fmc',
            'faulttree': '.fta',
            'item': '.itm'
        };
        
        return extensionMap[importType] || '.txt'; // Default fallback
    }

    private parseSymbolsFromContent(content: string, filePath: string): Map<string, SymbolDefinition> {
        const symbols = new Map<string, SymbolDefinition>();
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Match ALL definition types: def <type> <name>
            const defMatch = line.match(/def\s+(\w+)\s+(\w+)/);
            if (defMatch) {
                const defType = defMatch[1]; // featureset, configset, function, subsystem, component, etc.
                const defName = defMatch[2]; // BloodPressureFeatures, DeflateCuff, MeasurementSubsystem, etc.
                let configKey: string | undefined;
                
                // Look for config in ALL def types (not just functions!)
                for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
                    const configLine = lines[j].trim();
                    const configMatch = configLine.match(/config\s+(\w+)/);
                    if (configMatch) {
                        configKey = configMatch[1];
                        break;
                    }
                    // Stop if we hit another def
                    if (configLine.startsWith('def ')) break;
                }
                
                symbols.set(defName, {
                    id: defName,
                    name: defName,
                    type: defType, // featureset, configset, function, subsystem, component, etc.
                    fileUri: filePath,
                    isVisible: true, // Will be updated based on config
                    configKey: configKey
                });
                
                console.log(`🔍 Found symbol v${EXTENSION_VERSION}: ${defName} (type: ${defType}, config: ${configKey})`);
            }
        }
        
        return symbols;
    }

    getSymbol(symbolName: string): SymbolDefinition | undefined {
        // Check direct symbols first
        if (this.symbols.has(symbolName)) {
            return this.symbols.get(symbolName);
        }
        
        // Check imported symbols
        for (const importedFile of this.imports.values()) {
            if (importedFile.symbols.has(symbolName)) {
                return importedFile.symbols.get(symbolName);
            }
        }
        
        return undefined;
    }

    updateSymbolVisibility(configManager: ConfigStateManager): void {
        for (const importedFile of this.imports.values()) {
            for (const symbol of importedFile.symbols.values()) {
                if (symbol.configKey) {
                    symbol.isVisible = configManager.isSymbolVisible(symbol.configKey);
                    console.log(`👁️ Symbol v${EXTENSION_VERSION}: ${symbol.name} visibility: ${symbol.isVisible} (config: ${symbol.configKey})`);
                }
            }
        }
    }
}

// =============================================================================
// MODULAR PROPERTY CONFIGURATION
// =============================================================================

class ModularPropertyManager {
    /**
     * 🎯 THIS IS WHERE YOU EXTEND SIMPLE (FLAT) KEYWORDS!
     * These are properties that take direct values: name "MyName", description "My description"
     */
    getValidPropertiesForContext(languageId: string, context: string): string[] {
        const contextSpecificProperties: Record<string, Record<string, string[]>> = {
            'sylang-requirement': {
                'reqsection': ['name', 'description'],
                'requirement': [
                    // Simple properties (keyword + direct value)
                    'name', 'description', 'type', 'source', 'derivedfrom', 
                    'safetylevel', 'rationale', 'verificationcriteria', 'status'
                    // 🔧 ADD NEW SIMPLE REQUIREMENT PROPERTIES HERE!
                    // 'priority', 'version', 'category'
                    // NOTE: Don't add compound properties here! Use getCompoundPropertyDefinitions instead.
                ]
            },
            'sylang-block': {
                'block': [
                    // Simple properties (keyword + direct value)  
                    'name', 'description', 'owner', 'tags', 'safetylevel', 'config'
                    // 🔧 ADD NEW SIMPLE BLOCK PROPERTIES HERE!
                    // 'version', 'manufacturer', 'location'
                    // NOTE: Don't add compound properties here! Use getCompoundPropertyDefinitions instead.
                ],
                'port': ['name', 'description', 'type', 'owner', 'tags', 'safetylevel', 'config']
            },
            'sylang-function': {
                'functiongroup': ['name', 'description', 'owner', 'tags', 'safetylevel'],
                'function': [
                    // Simple properties (keyword + direct value)  
                    'name', 'description', 'category', 'owner', 'tags', 'safetylevel', 'config'
                    // 🔧 ADD NEW SIMPLE FUNCTION PROPERTIES HERE!
                    // 'version', 'algorithm', 'performance'
                    // NOTE: Don't add compound properties here! Use getCompoundPropertyDefinitions instead.
                ]
            }
            // 🔧 ADD NEW LANGUAGE CONTEXTS HERE!
            // 'sylang-newsystem': {
            //     'newcontext': ['name', 'description', 'your_simple_properties']
            // }
        };
        
        const languageContexts = contextSpecificProperties[languageId];
        if (languageContexts && languageContexts[context]) {
            return languageContexts[context];
        }
        
        return ['name', 'description']; // Fallback
    }

    /**
     * 🎯 THIS IS WHERE YOU DEFINE COMPOUND PROPERTIES WITH SECONDARY KEYWORDS!
     * These are properties that require secondary keywords: implements function, enables feature, etc.
     */
    getCompoundPropertyDefinitions(languageId: string, context: string): Record<string, CompoundPropertyDef> {
        const definitions: Record<string, CompoundPropertyDef> = {};
        
        switch (languageId) {
            case 'sylang-requirement':
                if (context === 'requirement') {
                    definitions['implements'] = {
                        primaryKeyword: 'implements',
                        secondaryKeywords: ['function'],
                        valueType: 'identifier-list',
                        syntax: 'implements function <FunctionList>'
                    };
                    definitions['allocatedto'] = {
                        primaryKeyword: 'allocatedto',
                        secondaryKeywords: ['component', 'subsystem'],
                        valueType: 'identifier-list',
                        syntax: 'allocatedto component <ComponentList>'
                    };
                    // 🔧 ADD NEW COMPOUND REQUIREMENT PROPERTIES HERE!
                    // definitions['traces'] = {
                    //     primaryKeyword: 'traces',
                    //     secondaryKeywords: ['requirement', 'goal'],
                    //     valueType: 'identifier-list',
                    //     syntax: 'traces requirement <RequirementList>'
                    // };
                }
                break;
                
            case 'sylang-block':
                if (context === 'block') {
                    definitions['implements'] = {
                        primaryKeyword: 'implements',
                        secondaryKeywords: ['function'],
                        valueType: 'identifier-list',
                        syntax: 'implements function <FunctionList>'
                    };
                    definitions['enables'] = {
                        primaryKeyword: 'enables',
                        secondaryKeywords: ['feature'],
                        valueType: 'identifier-list',
                        syntax: 'enables feature <FeatureList>'
                    };
                    definitions['contains'] = {
                        primaryKeyword: 'contains',
                        secondaryKeywords: ['subsystem', 'component', 'module'],
                        valueType: 'identifier-list',
                        syntax: 'contains subsystem <SubsystemList>'
                    };
                    definitions['partof'] = {
                        primaryKeyword: 'partof',
                        secondaryKeywords: ['system', 'subsystem'],
                        valueType: 'identifier',
                        syntax: 'partof system <SystemName>'
                    };
                    // 🔧 ADD NEW COMPOUND BLOCK PROPERTIES HERE!
                    // definitions['connects'] = {
                    //     primaryKeyword: 'connects',
                    //     secondaryKeywords: ['port', 'interface'],
                    //     valueType: 'identifier-list',
                    //     syntax: 'connects port <PortList>'
                    // };
                }
                break;
                
            case 'sylang-function':
                if (context === 'function') {
                    definitions['enables'] = {
                        primaryKeyword: 'enables',
                        secondaryKeywords: ['feature'],
                        valueType: 'identifier-list',
                        syntax: 'enables feature <FeatureList>'
                    };
                    definitions['partof'] = {
                        primaryKeyword: 'partof',
                        secondaryKeywords: ['system', 'subsystem', 'component', 'subcomponent', 'module', 'unit', 'assembly', 'circuit', 'part'],
                        valueType: 'identifier',
                        syntax: 'partof component <ComponentName>'
                    };
                    definitions['allocatedto'] = {
                        primaryKeyword: 'allocatedto',
                        secondaryKeywords: ['system', 'subsystem', 'component', 'subcomponent', 'module', 'unit', 'assembly', 'circuit', 'part'],
                        valueType: 'identifier-list',
                        syntax: 'allocatedto component <ComponentList>'
                    };
                }
                break;
        }
        
        return definitions;
    }
}

// =============================================================================
// MODULAR PROPERTY VALIDATION
// =============================================================================

interface CompoundPropertyDef {
    primaryKeyword: string;
    secondaryKeywords: string[];
    valueType: 'identifier' | 'identifier-list' | 'enum' | 'string';
    syntax: string;
}

class ModularPropertyValidator {
    constructor(
        private propertyManager: ModularPropertyManager,
        private configManager: ConfigStateManager,
        private symbolResolver: SymbolResolver
    ) {}

    async validateDocument(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];
        const languageId = this.getLanguageIdFromDocument(document);
        const text = document.getText();
        const lines = text.split('\n');
        
        // First, resolve imports and update config FROM IMPORTED FILES
        await this.configManager.updateConfigFromImports(document);
        await this.symbolResolver.resolveImportsForDocument(document);
        this.symbolResolver.updateSymbolVisibility(this.configManager);
        
        let currentContext = '';
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;
            
            // Validate import statements
            if (trimmedLine.startsWith('use ')) {
                this.validateImportStatement(diagnostics, lineIndex, trimmedLine, line, document);
                continue;
            }
            
            // Track context changes
            if (trimmedLine.startsWith('def ')) {
                const parts = trimmedLine.split(/\s+/);
                if (parts.length >= 2) {
                    currentContext = parts[1]; // 'requirement', 'block', 'function', etc.
                }
                continue;
            }
            
            // Validate properties in current context
            const keyword = trimmedLine.split(' ')[0];
            if (keyword && currentContext) {
                const validSimpleProperties = this.propertyManager.getValidPropertiesForContext(languageId, currentContext);
                const compoundDefs = this.propertyManager.getCompoundPropertyDefinitions(languageId, currentContext);
                
                // Check if this is a compound property
                if (compoundDefs[keyword]) {
                    // Validate compound property syntax
                    this.validateCompoundProperty(diagnostics, lineIndex, trimmedLine, compoundDefs[keyword], line);
                } else if (validSimpleProperties.includes(keyword)) {
                    // Valid simple property - could add value validation here
                    // For now, just accept it as valid
                } else {
                    // Invalid property - show both simple and compound options
                    const allValidKeywords = [
                        ...validSimpleProperties,
                        ...Object.keys(compoundDefs)
                    ].sort();
                    
                    const range = new vscode.Range(
                        lineIndex, 
                        line.indexOf(keyword), 
                        lineIndex, 
                        line.indexOf(keyword) + keyword.length
                    );
                    
                    const compoundSyntaxHints = Object.values(compoundDefs)
                        .map(def => def.syntax)
                        .join(', ');
                    
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `🎯 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Invalid keyword "${keyword}" in ${currentContext}.\n` +
                        `Simple properties: ${validSimpleProperties.join(', ')}\n` +
                        `Compound properties: ${compoundSyntaxHints}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }
        
        return diagnostics;
    }

    private validateImportStatement(
        diagnostics: vscode.Diagnostic[], 
        lineIndex: number, 
        trimmedLine: string, 
        fullLine: string,
        document: vscode.TextDocument
    ): void {
        // Only restriction: .ple files cannot use imports
        if (document.fileName.endsWith('.ple')) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, fullLine.length);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `🎯 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Product line files (.ple) should not use import statements`,
                vscode.DiagnosticSeverity.Warning
            ));
            return;
        }

        const importMatch = trimmedLine.match(/use\s+(\w+)\s+(\w+)/);
        if (!importMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, fullLine.length);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `🎯 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Invalid import syntax. Expected: use <type> <name>`,
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }

        const importType = importMatch[1]; // featureset, configset, block, etc.
        const importName = importMatch[2]; // BloodPressureFeatures, etc.
        
        // ✅ UNRESTRICTED TYPE: Allow any import type (no type validation)
        console.log(`✅ ${EXTENSION_NAME} v${EXTENSION_VERSION}: Accepting import type: ${importType}`);
        
        // ✅ VALIDATE SYMBOL EXISTS: Check if the imported symbol actually exists
        const symbol = this.symbolResolver.getSymbol(importName);
        if (!symbol) {
            const symbolStart = fullLine.indexOf(importName);
            const range = new vscode.Range(
                lineIndex, symbolStart, lineIndex, symbolStart + importName.length
            );
            
            diagnostics.push(new vscode.Diagnostic(
                range,
                `🎯 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Symbol "${importName}" not found. Check if '${importType} ${importName}' is defined.`,
                vscode.DiagnosticSeverity.Error
            ));
        } else {
            // ✅ SHOW CHILD SYMBOLS: List what's available in this import
            const childSymbols = this.getChildSymbolsForImport(symbol);
            if (childSymbols.length > 0) {
                console.log(`📋 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Imported "${importName}" provides: ${childSymbols.join(', ')}`);
            }
        }
    }

    private getChildSymbolsForImport(symbol: SymbolDefinition): string[] {
        // For container symbols (featureset, functiongroup, etc.), find child symbols in the same file
        const childSymbols: string[] = [];
        
        for (const importedFile of this.symbolResolver.imports.values()) {
            if (importedFile.uri === symbol.fileUri) {
                for (const childSymbol of importedFile.symbols.values()) {
                    if (childSymbol.name !== symbol.name) { // Don't include the container itself
                        childSymbols.push(childSymbol.name);
                    }
                }
            }
        }
        
        return childSymbols;
    }

    private validateCompoundProperty(
        diagnostics: vscode.Diagnostic[], 
        lineIndex: number, 
        line: string, 
        definition: CompoundPropertyDef,
        fullLine: string
    ): void {
        const parts = line.trim().split(/\s+/);
        
        if (parts.length < 3) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `🎯 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Invalid ${definition.primaryKeyword} syntax. Expected: ${definition.syntax}`,
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }
        
        const secondaryKeyword = parts[1];
        if (!definition.secondaryKeywords.includes(secondaryKeyword)) {
            const secondaryStart = fullLine.indexOf(secondaryKeyword);
            const range = new vscode.Range(
                lineIndex, secondaryStart, lineIndex, secondaryStart + secondaryKeyword.length
            );
            
            diagnostics.push(new vscode.Diagnostic(
                range,
                `🎯 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Invalid secondary keyword "${secondaryKeyword}" for ${definition.primaryKeyword}. Valid: ${definition.secondaryKeywords.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }

        // Validate referenced symbols (for function references)
        if (definition.primaryKeyword === 'implements' && secondaryKeyword === 'function') {
            const symbolNames = parts.slice(2).join(' ').split(',').map(s => s.trim());
            
            for (const symbolName of symbolNames) {
                if (symbolName) {
                    const symbol = this.symbolResolver.getSymbol(symbolName);
                    
                    if (!symbol) {
                        // Symbol not found
                        const symbolStart = fullLine.indexOf(symbolName);
                        const range = new vscode.Range(
                            lineIndex, symbolStart, lineIndex, symbolStart + symbolName.length
                        );
                        
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `🎯 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Function "${symbolName}" not found. Check imports.`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    } else if (!symbol.isVisible) {
                        // Symbol found but hidden by config
                        const symbolStart = fullLine.indexOf(symbolName);
                        const range = new vscode.Range(
                            lineIndex, symbolStart, lineIndex, symbolStart + symbolName.length
                        );
                        
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `🎯 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Function "${symbolName}" is disabled by configuration (${symbol.configKey} = 0)`,
                            vscode.DiagnosticSeverity.Warning
                        ));
                    }
                }
            }
        }
    }

    private getLanguageIdFromDocument(document: vscode.TextDocument): string {
        const extension = document.fileName.split('.').pop()?.toLowerCase();
        const mapping: Record<string, string> = {
            'req': 'sylang-requirement',
            'blk': 'sylang-block',
            'fun': 'sylang-function'
        };
        return mapping[extension || ''] || 'sylang-unknown';
    }
}

// =============================================================================
// VISUAL DECORATION FOR CONFIG GRAYING
// =============================================================================

class ConfigDecorationProvider {
    private grayDecorationType = vscode.window.createTextEditorDecorationType({
        opacity: '0.5',
        color: '#888888'
    });

    async updateDecorations(
        editor: vscode.TextEditor, 
        configManager: ConfigStateManager,
        symbolResolver: SymbolResolver
    ): Promise<void> {
        const document = editor.document;
        if (!isSylangDocument(document)) return;

        // Update config from imported files (this is the key fix!)
        await configManager.updateConfigFromImports(document);
        await symbolResolver.resolveImportsForDocument(document);
        symbolResolver.updateSymbolVisibility(configManager);

        const grayRanges: vscode.Range[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        // Parse functions and their configs
        const functions: Array<{name: string, startLine: number, endLine: number, configKey?: string}> = [];
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Found function definition
            const functionMatch = trimmedLine.match(/def\s+function\s+(\w+)/);
            if (functionMatch) {
                const functionName = functionMatch[1];
                const startLine = lineIndex;
                
                // Find the end of this function (next 'def' or end of file)
                let endLine = lines.length - 1;
                for (let j = lineIndex + 1; j < lines.length; j++) {
                    if (lines[j].trim().startsWith('def ')) {
                        endLine = j - 1;
                        break;
                    }
                }
                
                // Look for config within this function
                let configKey: string | undefined;
                for (let j = startLine; j <= endLine; j++) {
                    const configMatch = lines[j].trim().match(/config\s+(\w+)/);
                    if (configMatch) {
                        configKey = configMatch[1];
                        break;
                    }
                }
                
                functions.push({
                    name: functionName,
                    startLine,
                    endLine,
                    configKey
                });
                
                console.log(`🔍 Function v${EXTENSION_VERSION}: ${functionName} (lines ${startLine}-${endLine}, config: ${configKey})`);
            }
        }
        
        // Apply graying to functions with disabled configs
        for (const func of functions) {
            if (func.configKey && !configManager.isSymbolVisible(func.configKey)) {
                console.log(`👁️ Graying out function ${func.name} lines ${func.startLine}-${func.endLine} (config: ${func.configKey})`);
                
                for (let i = func.startLine; i <= func.endLine; i++) {
                    grayRanges.push(new vscode.Range(i, 0, i, lines[i].length));
                }
            }
        }

        // Apply gray decorations
        editor.setDecorations(this.grayDecorationType, grayRanges);
        console.log(`🎨 Applied ${grayRanges.length} gray decorations v${EXTENSION_VERSION}`);
    }

    dispose(): void {
        this.grayDecorationType.dispose();
    }
}

// =============================================================================
// EXTENSION ACTIVATION - NEW MODULAR SYSTEM
// =============================================================================

export function activate(context: vscode.ExtensionContext) {
    console.log(`🚀 ${EXTENSION_NAME} v${EXTENSION_VERSION} ACTIVATED! Config graying, import validation, cross-file validation included.`);
    
    const propertyManager = new ModularPropertyManager();
    const configManager = new ConfigStateManager();
    const symbolResolver = new SymbolResolver();
    const validator = new ModularPropertyValidator(propertyManager, configManager, symbolResolver);
    const decorationProvider = new ConfigDecorationProvider();
    const diagnosticCollection = vscode.languages.createDiagnosticCollection(EXTENSION_ID);
    
    const validateDocument = async (document: vscode.TextDocument) => {
        if (isSylangDocument(document)) {
            console.log(`🔍 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Validating ${document.fileName}`);
            const diagnostics = await validator.validateDocument(document);
            diagnosticCollection.set(document.uri, diagnostics);
            console.log(`✅ ${EXTENSION_NAME} v${EXTENSION_VERSION}: Found ${diagnostics.length} diagnostics`);
        }
    };

    const updateDecorations = async (editor: vscode.TextEditor) => {
        if (editor && isSylangDocument(editor.document)) {
            await decorationProvider.updateDecorations(editor, configManager, symbolResolver);
        }
    };
    
    // Register event listeners
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(async event => {
            await validateDocument(event.document);
            const editor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
            if (editor) {
                await updateDecorations(editor);
            }
        }),
        vscode.workspace.onDidOpenTextDocument(validateDocument),
        vscode.workspace.onDidSaveTextDocument(validateDocument),
        vscode.window.onDidChangeActiveTextEditor(async editor => {
            if (editor) {
                await updateDecorations(editor);
            }
        }),
        diagnosticCollection,
        decorationProvider
    );
    
    // Validate currently open documents and apply decorations
    vscode.workspace.textDocuments.forEach(validateDocument);
    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }
    
    console.log(`✅ ${EXTENSION_NAME} v${EXTENSION_VERSION}: Ready with config graying, import validation, and cross-file validation!`);
}

export function deactivate() {
    console.log(`👋 ${EXTENSION_NAME} v${EXTENSION_VERSION}: Deactivated`);
}

function isSylangDocument(document: vscode.TextDocument): boolean {
    const sylangExtensions = ['.req', '.blk', '.fun', '.sub', '.sys', '.tst'];
    return sylangExtensions.some(ext => document.fileName.toLowerCase().endsWith(ext));
} 