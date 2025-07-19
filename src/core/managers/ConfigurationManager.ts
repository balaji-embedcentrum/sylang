import * as vscode from 'vscode';
import { 
    IConfigurationManager,
    ILanguageConfiguration,
    IGlobalConfiguration
} from '../interfaces';

// Local interface definitions to avoid import complexity
interface CompoundPropertyDef {
    primaryKeyword: string;
    secondaryKeywords: string[];
    valueType: 'identifier' | 'identifier-list' | 'enum' | 'string';
    syntax: string;
}

interface LanguageConfig {
    id: string;
    keywords: string[];
    extensions: string[];
}

// =============================================================================
// CONFIGURATION MANAGER IMPLEMENTATION
// =============================================================================

/**
 * Comprehensive configuration manager handling .vcf files and visibility rules
 */
export class ConfigurationManager implements IConfigurationManager {
    private readonly languageConfigurations = new Map<string, ILanguageConfiguration>();
    private readonly globalConfiguration: IGlobalConfiguration = this.createDefaultGlobalConfiguration();
    private readonly configurationValues = new Map<string, number>();

    constructor() {
        this.loadDefaultConfigurations();
    }

    // =============================================================================
    // CORE MODULAR PROPERTY VALIDATION METHODS  
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
                        secondaryKeywords: ['system', 'subsystem', 'component', 'subcomponent', 'module', 'unit', 'assembly', 'circuit', 'part'],
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
    // INTERFACE IMPLEMENTATION (SIMPLIFIED)
    // =============================================================================

    async loadConfigurations(): Promise<void> {
        this.loadDefaultConfigurations();
    }

    async reloadConfigurations(): Promise<void> {
        this.loadDefaultConfigurations();
    }

    getConfigurationValue(key: string): number | undefined {
        return this.configurationValues.get(key);
    }

    async setConfigurationValue(key: string, value: number): Promise<void> {
        this.configurationValues.set(key, value);
    }

    getLanguageConfiguration(languageId: string): ILanguageConfiguration | undefined {
        return this.languageConfigurations.get(languageId);
    }

    getPluginConfiguration(pluginId: string): any {
        return undefined; // Simplified
    }

    getGlobalConfiguration(): IGlobalConfiguration {
        return this.globalConfiguration;
    }

    isSymbolEnabled(symbolId: string): boolean {
        return true; // Simplified
    }

    getAffectedSymbols(configKey: string): string[] {
        return []; // Simplified
    }

    async updateSymbolVisibility(configKey: string, value: number): Promise<void> {
        // Simplified
    }

    validateConfigurationReference(configKey: string): any {
        return { isValid: true, errors: [], warnings: [], suggestions: [] };
    }

    validateConfigurationFile(documentUri: string): any[] {
        return [];
    }

    onConfigurationChanged(listener: any): vscode.Disposable {
        return { dispose: () => {} };
    }

    onLanguageConfigurationChanged(listener: any): vscode.Disposable {
        return { dispose: () => {} };
    }

    watchConfigurationFiles(): void {
        // Simplified
    }

    unwatchConfigurationFiles(): void {
        // Simplified
    }

    getConfigurationFiles(): string[] {
        return [];
    }

    getWorkspaceConfiguration(): any {
        return {};
    }

    async applyWorkspaceSettings(): Promise<void> {
        // Simplified
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private loadDefaultConfigurations(): void {
        const languages = [
            'sylang-productline', 'sylang-feature', 'sylang-variantmodel', 'sylang-variantconfig',
            'sylang-function', 'sylang-block', 'sylang-requirement', 'sylang-test'
        ];
        
        for (const languageId of languages) {
            const config: ILanguageConfiguration = {
                id: languageId,
                name: this.getDisplayNameForLanguageId(languageId),
                fileExtensions: [this.getExtensionForLanguageId(languageId)],
                keywords: this.getKeywordsForLanguageId(languageId),
                validationRules: [],
                parsingOptions: {} as any,
                completionOptions: {} as any,
                snippetOptions: {} as any,
                syntaxHighlighting: {} as any
            };
            this.languageConfigurations.set(languageId, config);
        }
    }

    private getDisplayNameForLanguageId(languageId: string): string {
        const names: Record<string, string> = {
            'sylang-requirement': 'Sylang Requirements',
            'sylang-block': 'Sylang Blocks',
            'sylang-function': 'Sylang Functions'
        };
        return names[languageId] || languageId;
    }

    private getExtensionForLanguageId(languageId: string): string {
        const extensions: Record<string, string> = {
            'sylang-requirement': '.req',
            'sylang-block': '.blk', 
            'sylang-function': '.fun'
        };
        return extensions[languageId] || '.txt';
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
            'sylang-test': ['testsuite', 'testcase']
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

    private createDefaultGlobalConfiguration(): IGlobalConfiguration {
        return {
            debugMode: false,
            performanceMode: 'balanced'
        } as IGlobalConfiguration;
    }
} 