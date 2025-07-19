import * as vscode from 'vscode';
import { 
    IConfigurationManager,
    ILanguageConfiguration,
    IGlobalConfiguration
} from '../interfaces';

// =============================================================================
// CONFIGURATION MANAGER IMPLEMENTATION
// =============================================================================

/**
 * Comprehensive configuration manager handling .vcf files and visibility rules
 */
export class ConfigurationManager implements IConfigurationManager {
    private readonly configurationValues = new Map<string, number>();
    private readonly affectedSymbols = new Map<string, string[]>(); // configKey -> symbolIds
    private readonly languageConfigurations = new Map<string, ILanguageConfiguration>();
    private readonly pluginConfigurations = new Map<string, IPluginConfiguration>();
    private readonly configurationFiles = new Set<string>();
    private readonly watchers: vscode.FileSystemWatcher[] = [];
    
    private readonly changeEventEmitter = new vscode.EventEmitter<IConfigurationChangeEvent>();
    private readonly languageChangeEventEmitter = new vscode.EventEmitter<ILanguageConfigChangeEvent>();
    
    private globalConfiguration: IGlobalConfiguration;
    private workspaceConfiguration: IWorkspaceConfiguration;
    private isWatching = false;

    constructor(private readonly symbolManager?: any) {
        this.initializeDefaultConfiguration();
    }

    // =============================================================================
    // CONFIGURATION LOADING AND MANAGEMENT
    // =============================================================================

    async loadConfigurations(): Promise<void> {
        await this.loadWorkspaceConfiguration();
        await this.loadConfigurationFiles();
        await this.loadLanguageConfigurations();
        await this.loadPluginConfigurations();
        
        if (!this.isWatching) {
            this.watchConfigurationFiles();
        }
    }

    async reloadConfigurations(): Promise<void> {
        // Clear existing configurations
        this.configurationValues.clear();
        this.affectedSymbols.clear();
        this.languageConfigurations.clear();
        this.pluginConfigurations.clear();
        this.configurationFiles.clear();
        
        // Reload all configurations
        await this.loadConfigurations();
        
        // Emit global change event
        this.changeEventEmitter.fire({
            type: 'file_updated',
            affectedSymbols: [],
            timestamp: new Date()
        });
    }

    getConfigurationValue(key: string): number | undefined {
        return this.configurationValues.get(key);
    }

    async setConfigurationValue(key: string, value: number): Promise<void> {
        const oldValue = this.configurationValues.get(key);
        this.configurationValues.set(key, value);
        
        // Update affected symbols visibility
        const affectedSymbolIds = this.affectedSymbols.get(key) || [];
        await this.updateSymbolVisibility(key, value);
        
        // Emit change event
        this.changeEventEmitter.fire({
            type: 'value_changed',
            configKey: key,
            oldValue,
            newValue: value,
            affectedSymbols: affectedSymbolIds,
            timestamp: new Date()
        });
    }

    // =============================================================================
    // LANGUAGE AND PLUGIN CONFIGURATIONS
    // =============================================================================

    getLanguageConfiguration(languageId: string): ILanguageConfiguration | undefined {
        return this.languageConfigurations.get(languageId);
    }

    getPluginConfiguration(pluginId: string): IPluginConfiguration | undefined {
        return this.pluginConfigurations.get(pluginId);
    }

    getGlobalConfiguration(): IGlobalConfiguration {
        return this.globalConfiguration;
    }

    // =============================================================================
    // VISIBILITY AND GRAYING RULES
    // =============================================================================

    isSymbolVisible(symbolId: string): boolean {
        if (!this.symbolManager) {
            return true;
        }
        
        const symbol = this.symbolManager.symbols?.get(symbolId);
        if (!symbol) {
            return false;
        }
        
        // Check if symbol has a configuration key
        if (!symbol.configKey) {
            return true; // No config key means always visible
        }
        
        const configValue = this.getConfigurationValue(symbol.configKey);
        return configValue !== 0; // 0 means hidden/grayed out
    }

    isSymbolEnabled(symbolId: string): boolean {
        if (!this.symbolManager) {
            return true;
        }
        
        const symbol = this.symbolManager.symbols?.get(symbolId);
        if (!symbol) {
            return false;
        }
        
        // Check if symbol has a configuration key
        if (!symbol.configKey) {
            return true; // No config key means always enabled
        }
        
        const configValue = this.getConfigurationValue(symbol.configKey);
        return configValue === 1; // 1 means enabled, 0 means disabled/grayed
    }

    getAffectedSymbols(configKey: string): string[] {
        return this.affectedSymbols.get(configKey) || [];
    }

    async updateSymbolVisibility(configKey: string, value: number): Promise<void> {
        const affectedSymbolIds = this.getAffectedSymbols(configKey);
        
        if (this.symbolManager) {
            for (const symbolId of affectedSymbolIds) {
                const isVisible = value !== 0;
                this.symbolManager.updateSymbolVisibility(symbolId, isVisible);
            }
        }
        
        // Update decorations for affected documents
        await this.updateDocumentDecorations(affectedSymbolIds);
    }

    // =============================================================================
    // CONFIGURATION VALIDATION
    // =============================================================================

    validateConfigurationReference(configKey: string): IConfigValidationResult {
        const errors: any[] = [];
        const warnings: any[] = [];
        const suggestions: any[] = [];
        
        // Check if configuration key exists
        if (!this.configurationValues.has(configKey)) {
            errors.push({
                message: `Configuration key '${configKey}' is not defined`,
                range: new vscode.Range(0, 0, 0, 0),
                code: 'CONFIG_NOT_FOUND',
                severity: 'error' as const
            });
        }
        
        // Check if configuration key has affected symbols
        const affectedSymbols = this.getAffectedSymbols(configKey);
        if (affectedSymbols.length === 0) {
            warnings.push({
                message: `Configuration key '${configKey}' does not affect any symbols`,
                range: new vscode.Range(0, 0, 0, 0),
                code: 'CONFIG_UNUSED',
                configKey
            });
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }

    validateConfigurationFile(documentUri: string): IConfigValidationResult[] {
        const results: IConfigValidationResult[] = [];
        
        try {
            const document = vscode.workspace.textDocuments.find(doc => 
                doc.uri.toString() === documentUri
            );
            
            if (!document) {
                return results;
            }
            
            const content = document.getText();
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Parse configuration lines (simplified)
                const configMatch = line.match(/(\w+)\s*=\s*(\d+)/);
                if (configMatch) {
                    const [, configKey, value] = configMatch;
                    const result = this.validateConfigurationReference(configKey);
                    results.push(result);
                }
            }
        } catch (error) {
            console.error(`Failed to validate configuration file ${documentUri}:`, error);
        }
        
        return results;
    }

    // =============================================================================
    // EVENT HANDLING
    // =============================================================================

    onConfigurationChanged(listener: (event: IConfigurationChangeEvent) => void): vscode.Disposable {
        return this.changeEventEmitter.event(listener);
    }

    onLanguageConfigurationChanged(listener: (event: ILanguageConfigChangeEvent) => void): vscode.Disposable {
        return this.languageChangeEventEmitter.event(listener);
    }

    // =============================================================================
    // FILE OPERATIONS
    // =============================================================================

    watchConfigurationFiles(): void {
        if (this.isWatching) {
            return;
        }
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }
        
        // Watch for .vcf files
        for (const folder of workspaceFolders) {
            const watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(folder, '**/*.vcf')
            );
            
            watcher.onDidCreate(async (uri) => {
                await this.handleConfigurationFileChanged(uri, 'created');
            });
            
            watcher.onDidChange(async (uri) => {
                await this.handleConfigurationFileChanged(uri, 'changed');
            });
            
            watcher.onDidDelete(async (uri) => {
                await this.handleConfigurationFileChanged(uri, 'deleted');
            });
            
            this.watchers.push(watcher);
        }
        
        this.isWatching = true;
    }

    unwatchConfigurationFiles(): void {
        for (const watcher of this.watchers) {
            watcher.dispose();
        }
        this.watchers.length = 0;
        this.isWatching = false;
    }

    getConfigurationFiles(): string[] {
        return Array.from(this.configurationFiles);
    }

    // =============================================================================
    // WORKSPACE INTEGRATION
    // =============================================================================

    getWorkspaceConfiguration(): IWorkspaceConfiguration {
        return this.workspaceConfiguration;
    }

    async applyWorkspaceSettings(): Promise<void> {
        const settings = vscode.workspace.getConfiguration('sylang');
        
        // Apply global settings
        this.globalConfiguration = {
            ...this.globalConfiguration,
            enableValidation: settings.get('enableValidation', true),
            enableCompletion: settings.get('enableCompletion', true),
            enableIncrementalParsing: settings.get('enableIncrementalParsing', true),
            enableBackgroundValidation: settings.get('enableBackgroundValidation', true)
        };
        
        // Apply language-specific settings
        for (const [languageId, config] of this.languageConfigurations.entries()) {
            const langSettings = settings.get(`languages.${languageId}`, {});
            const updatedConfig: ILanguageConfiguration = {
                ...config,
                ...langSettings
            };
            
            this.languageConfigurations.set(languageId, updatedConfig);
        }
        
        // Emit language configuration change events
        for (const [languageId, config] of this.languageConfigurations.entries()) {
            this.languageChangeEventEmitter.fire({
                languageId,
                changeType: 'options',
                oldConfig: config,
                newConfig: config,
                timestamp: new Date()
            });
        }
    }

    // =============================================================================
    // MODULAR PROPERTY VALIDATION SYSTEM
    // =============================================================================

    getValidPropertiesForContext(languageId: string, context: string): string[] {
        const baseProperties = ['name', 'description', 'owner', 'safetylevel', 'config'];
        
        const contextSpecificProperties: Record<string, Record<string, string[]>> = {
            'sylang-requirement': {
                'reqsection': ['name', 'description'],
                'requirement': [
                    'name', 'description', 'type', 'source', 'derivedfrom', 
                    'safetylevel', 'rationale', 'allocatedto', 'verificationcriteria', 
                    'status', 'implements'
                ]
            },
            'sylang-block': {
                'block': [
                    'name', 'description', 'owner', 'tags', 'safetylevel', 'config', 
                    'contains', 'partof', 'enables', 'implements', 'interfaces', 'port'
                ],
                'port': ['name', 'description', 'type', 'owner', 'tags', 'safetylevel', 'config']
            },
            'sylang-function': {
                'functiongroup': ['name', 'description', 'owner', 'tags', 'safetylevel'],
                'function': [
                    'name', 'description', 'category', 'owner', 'tags', 'safetylevel', 
                    'enables', 'partof', 'allocatedto', 'config'
                ]
            }
            // Add more as needed...
        };
        
        const languageContexts = contextSpecificProperties[languageId];
        if (languageContexts && languageContexts[context]) {
            return languageContexts[context];
        }
        
        return baseProperties; // Fallback to base properties
    }

    // NEW: Get compound property definitions with secondary keywords
    getCompoundPropertyDefinitions(languageId: string, context: string): Record<string, CompoundPropertyDef> {
        const definitions: Record<string, CompoundPropertyDef> = {};
        
        // Define compound properties by context
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
                        secondaryKeywords: ['system', 'subsystem', 'component'],
                        valueType: 'identifier',
                        syntax: 'partof component <ComponentName>'
                    };
                }
                break;
        }
        
        return definitions;
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private initializeDefaultConfiguration(): void {
        this.globalConfiguration = {
            enableValidation: true,
            enableCompletion: true,
            enableIncrementalParsing: true,
            enableBackgroundValidation: true,
            cacheSettings: this.getDefaultCacheSettings(),
            performanceSettings: this.getDefaultPerformanceSettings(),
            debugSettings: this.getDefaultDebugSettings(),
            experimentalFeatures: this.getDefaultExperimentalFeatures()
        };
        
        this.workspaceConfiguration = {
            workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
            configurationFiles: [],
            languageFiles: new Map(),
            projectSettings: this.getDefaultProjectSettings(),
            defaultConfigurations: new Map()
        };
    }

    private async loadWorkspaceConfiguration(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }
        
        // Find all language files
        const languageFiles = new Map<string, string[]>();
        const fileExtensions = ['.ple', '.fml', '.vml', '.vcf', '.fun', '.blk', '.req', '.tst', 
                              '.fma', '.fmc', '.fta', '.itm', '.haz', '.rsk', '.sgl'];
        
        for (const folder of workspaceFolders) {
            for (const extension of fileExtensions) {
                const files = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(folder, `**/*${extension}`),
                    '**/node_modules/**'
                );
                
                const languageId = this.getLanguageIdForExtension(extension);
                const existingFiles = languageFiles.get(languageId) || [];
                existingFiles.push(...files.map(f => f.fsPath));
                languageFiles.set(languageId, existingFiles);
            }
        }
        
        this.workspaceConfiguration = {
            ...this.workspaceConfiguration,
            languageFiles
        };
    }

    private async loadConfigurationFiles(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }
        
        // Find all .vcf files
        for (const folder of workspaceFolders) {
            const vcfFiles = await vscode.workspace.findFiles(
                new vscode.RelativePattern(folder, '**/*.vcf'),
                '**/node_modules/**'
            );
            
            for (const file of vcfFiles) {
                await this.loadConfigurationFile(file.fsPath);
            }
        }
    }

    private async loadConfigurationFile(filePath: string): Promise<void> {
        try {
            this.configurationFiles.add(filePath);
            
            const content = await fs.promises.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('//')) {
                    // Parse configuration line: key = value
                    const configMatch = trimmedLine.match(/(\w+)\s*=\s*(\d+)/);
                    if (configMatch) {
                        const [, configKey, value] = configMatch;
                        this.configurationValues.set(configKey, parseInt(value, 10));
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to load configuration file ${filePath}:`, error);
        }
    }

    private async loadLanguageConfigurations(): Promise<void> {
        // Load built-in language configurations
        const languageIds = [
            'sylang-productline', 'sylang-feature', 'sylang-variantmodel', 'sylang-variantconfig',
            'sylang-function', 'sylang-block', 'sylang-requirement', 'sylang-test',
            'sylang-failuremodeanalysis', 'sylang-failuremodecontrol', 'sylang-faulttreeanalysis',
            'sylang-item', 'sylang-hazard', 'sylang-risk', 'sylang-safetygoal'
        ];
        
        for (const languageId of languageIds) {
            const config = this.createDefaultLanguageConfiguration(languageId);
            this.languageConfigurations.set(languageId, config);
        }
    }

    private async loadPluginConfigurations(): Promise<void> {
        // Load plugin configurations (simplified)
        const defaultPlugins = [
            'sylang-core', 'sylang-parser', 'sylang-validator', 'sylang-completion'
        ];
        
        for (const pluginId of defaultPlugins) {
            const config: IPluginConfiguration = {
                pluginId,
                enabled: true,
                priority: 100,
                customSettings: {},
                dependencies: [],
                conflictsWith: [],
                version: '1.0.0',
                autoLoad: true
            };
            
            this.pluginConfigurations.set(pluginId, config);
        }
    }

    private createDefaultLanguageConfiguration(languageId: string): ILanguageConfiguration {
        const extension = this.getExtensionForLanguageId(languageId);
        
        return {
            id: languageId,
            name: this.getDisplayNameForLanguageId(languageId),
            fileExtensions: [extension],
            keywords: this.getKeywordsForLanguageId(languageId),
            validationRules: [],
            parsingOptions: this.getDefaultParsingOptions(),
            completionOptions: this.getDefaultCompletionOptions(),
            snippetOptions: this.getDefaultSnippetOptions(),
            syntaxHighlighting: this.getDefaultSyntaxHighlightingConfig()
        };
    }

    private async handleConfigurationFileChanged(uri: vscode.Uri, changeType: 'created' | 'changed' | 'deleted'): Promise<void> {
        const filePath = uri.fsPath;
        
        switch (changeType) {
            case 'created':
            case 'changed':
                await this.loadConfigurationFile(filePath);
                this.changeEventEmitter.fire({
                    type: 'file_updated',
                    fileUri: uri.toString(),
                    affectedSymbols: [], // Would be populated based on file content
                    timestamp: new Date()
                });
                break;
                
            case 'deleted':
                this.configurationFiles.delete(filePath);
                // Remove configurations from this file
                // In real implementation, would track which configs came from which file
                this.changeEventEmitter.fire({
                    type: 'file_removed',
                    fileUri: uri.toString(),
                    affectedSymbols: [],
                    timestamp: new Date()
                });
                break;
        }
    }

    private async updateDocumentDecorations(affectedSymbolIds: string[]): Promise<void> {
        // This would integrate with the decoration provider to update visual styling
        // For symbols that are grayed out due to configuration changes
        
        if (!this.symbolManager) {
            return;
        }
        
        const documentsToUpdate = new Set<string>();
        
        for (const symbolId of affectedSymbolIds) {
            const symbol = this.symbolManager.symbols?.get(symbolId);
            if (symbol) {
                documentsToUpdate.add(symbol.fileUri);
            }
        }
        
        // Trigger decoration updates for affected documents
        for (const documentUri of documentsToUpdate) {
            // Would emit event to decoration provider
            console.log(`Update decorations for ${documentUri}`);
        }
    }

    private getLanguageIdForExtension(extension: string): string {
        const mapping: Record<string, string> = {
            '.ple': 'sylang-productline',
            '.fml': 'sylang-feature',
            '.vml': 'sylang-variantmodel',
            '.vcf': 'sylang-variantconfig',
            '.fun': 'sylang-function',
            '.blk': 'sylang-block',
            '.req': 'sylang-requirement',
            '.tst': 'sylang-test',
            '.fma': 'sylang-failuremodeanalysis',
            '.fmc': 'sylang-failuremodecontrol',
            '.fta': 'sylang-faulttreeanalysis',
            '.itm': 'sylang-item',
            '.haz': 'sylang-hazard',
            '.rsk': 'sylang-risk',
            '.sgl': 'sylang-safetygoal'
        };
        
        return mapping[extension] || 'sylang-unknown';
    }

    private getExtensionForLanguageId(languageId: string): string {
        const mapping: Record<string, string> = {
            'sylang-productline': '.ple',
            'sylang-feature': '.fml',
            'sylang-variantmodel': '.vml',
            'sylang-variantconfig': '.vcf',
            'sylang-function': '.fun',
            'sylang-block': '.blk',
            'sylang-requirement': '.req',
            'sylang-test': '.tst',
            'sylang-failuremodeanalysis': '.fma',
            'sylang-failuremodecontrol': '.fmc',
            'sylang-faulttreeanalysis': '.fta',
            'sylang-item': '.itm',
            'sylang-hazard': '.haz',
            'sylang-risk': '.rsk',
            'sylang-safetygoal': '.sgl'
        };
        
        return mapping[languageId] || '.unknown';
    }

    private getDisplayNameForLanguageId(languageId: string): string {
        const mapping: Record<string, string> = {
            'sylang-productline': 'Sylang Product Line',
            'sylang-feature': 'Sylang Feature Model',
            'sylang-variantmodel': 'Sylang Variant Model',
            'sylang-variantconfig': 'Sylang Variant Configuration',
            'sylang-function': 'Sylang Function',
            'sylang-block': 'Sylang Block',
            'sylang-requirement': 'Sylang Requirement',
            'sylang-test': 'Sylang Test',
            'sylang-failuremodeanalysis': 'Sylang Failure Mode Analysis',
            'sylang-failuremodecontrol': 'Sylang Failure Mode Control',
            'sylang-faulttreeanalysis': 'Sylang Fault Tree Analysis',
            'sylang-item': 'Sylang Item',
            'sylang-hazard': 'Sylang Hazard',
            'sylang-risk': 'Sylang Risk',
            'sylang-safetygoal': 'Sylang Safety Goal'
        };
        
        return mapping[languageId] || 'Unknown Sylang Language';
    }

    private getKeywordsForLanguageId(languageId: string): string[] {
        // Base keywords common to all Sylang languages (truly universal)
        const baseKeywords = ['def', 'use', 'name', 'description', 'owner', 'safetylevel', 'config'];
        
        // Language-specific keywords (definition containers and structure)
        const specificKeywords: Record<string, string[]> = {
            'sylang-productline': ['productline'],
            'sylang-feature': ['featureset', 'feature'],
            'sylang-variantmodel': ['variantmodel'],
            'sylang-variantconfig': ['configset'],
            'sylang-function': ['functiongroup', 'function'],
            'sylang-block': ['block', 'system', 'subsystem', 'component'],
            'sylang-requirement': ['reqsection', 'requirement'],
            'sylang-test': ['testsuite', 'testcase'],
            'sylang-failuremodeanalysis': ['failuremode'],
            'sylang-failuremodecontrol': ['prevention', 'detection', 'mitigation'],
            'sylang-faulttreeanalysis': ['node'],
            'sylang-item': ['itemdefinition', 'item'],
            'sylang-hazard': ['hazardidentification', 'hazard'],
            'sylang-risk': ['riskassessment', 'risk'],
            'sylang-safetygoal': ['safetygoal']
        };
        
        // Context-specific properties (what should be modular!)
        const contextProperties = this.getContextualProperties(languageId);
        
        return [...baseKeywords, ...(specificKeywords[languageId] || []), ...contextProperties];
    }

    private getContextualProperties(languageId: string): string[] {
        // This should return ALL possible properties for this language
        // The actual validation of which properties are valid in which context
        // should be handled by a separate property validation system
        switch (languageId) {
            case 'sylang-requirement':
                return ['type', 'source', 'derivedfrom', 'rationale', 'allocatedto', 'verificationcriteria', 'status', 'implements'];
            case 'sylang-block':
                return ['tags', 'contains', 'partof', 'enables', 'implements', 'interfaces', 'port'];
            case 'sylang-function':
                return ['category', 'enables', 'partof', 'allocatedto'];
            case 'sylang-test':
                return ['verifies', 'procedure', 'method'];
            default:
                return [];
        }
    }

    private getDefaultCacheSettings(): ICacheSettings {
        return {
            maxMemoryMB: 100,
            maxAge: 300000, // 5 minutes
            enablePersistentCache: true,
            cleanupInterval: 60000, // 1 minute
            compressionEnabled: false,
            compressionLevel: 6,
            parsing: {
                enabled: true,
                maxEntries: 500,
                maxSize: 1024 * 1024,
                ttl: 600000, // 10 minutes
                priority: 8,
                evictionPolicy: 'lru'
            },
            validation: {
                enabled: true,
                maxEntries: 1000,
                maxSize: 512 * 1024,
                ttl: 300000, // 5 minutes
                priority: 9,
                evictionPolicy: 'lru'
            },
            symbols: {
                enabled: true,
                maxEntries: 10,
                maxSize: 5 * 1024 * 1024,
                ttl: 1800000, // 30 minutes
                priority: 10,
                evictionPolicy: 'lru'
            },
            completion: {
                enabled: true,
                maxEntries: 2000,
                maxSize: 256 * 1024,
                ttl: 60000, // 1 minute
                priority: 6,
                evictionPolicy: 'lru'
            },
            imports: {
                enabled: true,
                maxEntries: 500,
                maxSize: 512 * 1024,
                ttl: 600000, // 10 minutes
                priority: 7,
                evictionPolicy: 'lru'
            },
            configuration: {
                enabled: true,
                maxEntries: 100,
                maxSize: 64 * 1024,
                ttl: 1800000, // 30 minutes
                priority: 9,
                evictionPolicy: 'lru'
            },
            dependencies: {
                enabled: true,
                maxEntries: 10,
                maxSize: 2 * 1024 * 1024,
                ttl: 900000, // 15 minutes
                priority: 8,
                evictionPolicy: 'lru'
            },
            maxConcurrentOperations: 10,
            batchSize: 50,
            enablePreloading: true,
            enableOptimization: true
        };
    }

    private getDefaultPerformanceSettings(): IPerformanceSettings {
        return {
            maxConcurrentValidations: 4,
            validationTimeout: 5000, // 5 seconds
            parsingTimeout: 3000, // 3 seconds
            debounceMs: 300,
            batchSize: 10,
            enableProfiling: false,
            profileThreshold: 100
        };
    }

    private getDefaultDebugSettings(): IDebugSettings {
        return {
            enableLogging: false,
            logLevel: 'error',
            logToFile: false,
            enableTracing: false,
            traceValidation: false,
            traceParsing: false,
            traceCompletion: false
        };
    }

    private getDefaultExperimentalFeatures(): IExperimentalFeatures {
        return {
            enableAICompletion: false,
            enableSmartRefactoring: false,
            enableCrossFileAnalysis: true,
            enableConfigurationUI: false,
            enablePerformanceMonitoring: false
        };
    }

    private getDefaultProjectSettings(): IProjectSettings {
        return {
            customKeywords: [],
            customEnums: {},
            validationProfile: 'default'
        };
    }

    private getDefaultParsingOptions(): IParsingOptions {
        return {
            skipComments: false,
            preserveWhitespace: false,
            enableErrorRecovery: true,
            maxParseTime: 3000,
            strictMode: false,
            indentationStyle: 'spaces',
            indentationSize: 2,
            lineEnding: 'auto'
        };
    }

    private getDefaultCompletionOptions(): ICompletionOptions {
        return {
            enableSnippets: true,
            enableAutoImport: true,
            maxSuggestions: 50,
            caseSensitive: false,
            fuzzyMatching: true,
            showDocumentation: true,
            showTypes: true,
            showConfigStatus: true,
            sortBy: 'relevance'
        };
    }

    private getDefaultSnippetOptions(): ISnippetOptions {
        return {
            enableContextualSnippets: true,
            enableConfigurationFiltering: true,
            showPlaceholders: true,
            enableTabStops: true,
            customSnippetPaths: []
        };
    }

    private getDefaultSyntaxHighlightingConfig(): ISyntaxHighlightingConfig {
        return {
            enableSemanticHighlighting: true,
            enableConfigurationHighlighting: true,
            grayedOutOpacity: 0.5,
            errorColor: '#ff0000',
            warningColor: '#ffaa00',
            infoColor: '#0080ff',
            configDisabledColor: '#808080'
        };
    }
} 