import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
    IKeywordRegistry,
    KeywordDefinition,
    KeywordExtension,
    KeywordType,
    KeywordContext,
    KeywordValidation,
    KeywordValueType,
    KeywordUsageContext,
    KeywordValidationResult,
    KeywordQuery,
    KeywordCategory
} from './IKeywordRegistry';

/**
 * Central registry implementation for managing all Sylang keywords
 */
export class KeywordRegistry implements IKeywordRegistry {
    private keywords = new Map<string, KeywordDefinition>();
    private keywordsByText = new Map<string, KeywordDefinition[]>();
    private keywordsByType = new Map<KeywordType, KeywordDefinition[]>();
    private keywordsByContext = new Map<string, KeywordDefinition[]>();
    private loadedExtensions = new Map<string, KeywordExtension>();
    
    // Events
    private keywordAddedEmitter = new vscode.EventEmitter<KeywordDefinition>();
    private keywordRemovedEmitter = new vscode.EventEmitter<string>();
    private extensionLoadedEmitter = new vscode.EventEmitter<KeywordExtension>();
    
    public readonly onKeywordAdded = this.keywordAddedEmitter.event;
    public readonly onKeywordRemoved = this.keywordRemovedEmitter.event;
    public readonly onExtensionLoaded = this.extensionLoadedEmitter.event;

    constructor() {
        this.initializeCoreKeywords();
    }

    // =============================================================================
    // REGISTRATION METHODS
    // =============================================================================

    registerKeyword(definition: KeywordDefinition): void {
        // Validate definition
        this.validateKeywordDefinition(definition);
        
        // Store in main registry
        this.keywords.set(definition.id, definition);
        
        // Index by text
        const textEntries = this.keywordsByText.get(definition.keyword) || [];
        textEntries.push(definition);
        this.keywordsByText.set(definition.keyword, textEntries);
        
        // Index by type
        const typeEntries = this.keywordsByType.get(definition.type) || [];
        typeEntries.push(definition);
        this.keywordsByType.set(definition.type, typeEntries);
        
        // Index by context
        for (const extension of definition.context.fileExtensions) {
            const contextKey = this.getContextKey(extension, definition.context.parentContexts[0]);
            const contextEntries = this.keywordsByContext.get(contextKey) || [];
            contextEntries.push(definition);
            this.keywordsByContext.set(contextKey, contextEntries);
        }
        
        console.log(`✅ Registered keyword: ${definition.keyword} (${definition.type})`);
        this.keywordAddedEmitter.fire(definition);
    }

    async registerExtension(extension: KeywordExtension): Promise<void> {
        try {
            // Check dependencies
            for (const dep of extension.dependencies || []) {
                if (!this.loadedExtensions.has(dep)) {
                    throw new Error(`Missing dependency: ${dep}`);
                }
            }
            
            // Register all keywords from extension
            for (const keyword of extension.keywords) {
                keyword.definedBy = extension.extensionId;
                this.registerKeyword(keyword);
            }
            
            // Store extension
            this.loadedExtensions.set(extension.extensionId, extension);
            
            console.log(`✅ Loaded keyword extension: ${extension.extensionName} (${extension.keywords.length} keywords)`);
            this.extensionLoadedEmitter.fire(extension);
            
        } catch (error) {
            console.error(`❌ Failed to load extension ${extension.extensionId}:`, error);
            throw error;
        }
    }

    unregisterExtension(extensionId: string): void {
        const extension = this.loadedExtensions.get(extensionId);
        if (!extension) return;
        
        // Remove all keywords from this extension
        for (const keyword of extension.keywords) {
            this.removeKeyword(keyword.id);
        }
        
        this.loadedExtensions.delete(extensionId);
        console.log(`✅ Unloaded extension: ${extensionId}`);
    }

    // =============================================================================
    // RETRIEVAL METHODS
    // =============================================================================

    getKeyword(keywordId: string): KeywordDefinition | undefined {
        return this.keywords.get(keywordId);
    }

    getKeywordByText(keyword: string, context?: Partial<KeywordContext>): KeywordDefinition[] {
        const candidates = this.keywordsByText.get(keyword) || [];
        
        if (!context) return candidates;
        
        return candidates.filter(def => this.matchesContext(def, context));
    }

    getKeywordsOfType(type: KeywordType): KeywordDefinition[] {
        return this.keywordsByType.get(type) || [];
    }

    getKeywordsForContext(fileExtension: string, parentContext?: string): KeywordDefinition[] {
        const contextKey = this.getContextKey(fileExtension, parentContext);
        return this.keywordsByContext.get(contextKey) || [];
    }

    // =============================================================================
    // VALIDATION METHODS
    // =============================================================================

    validateKeywordUsage(keyword: string, value: string, context: KeywordUsageContext): KeywordValidationResult {
        const definitions = this.getKeywordByText(keyword, {
            fileExtensions: [context.fileExtension],
            parentContexts: context.parentContext ? [context.parentContext] : [],
            allowedDepth: [context.indentLevel]
        });

        if (definitions.length === 0) {
            return {
                isValid: false,
                errors: [`Unknown keyword '${keyword}' in this context`],
                warnings: [],
                suggestions: this.getSuggestions(keyword, context)
            };
        }

        // Use the most specific definition
        const definition = definitions[0];
        
        return this.validateValue(value, definition.validation, context);
    }

    getCompoundKeywords(): KeywordDefinition[] {
        return this.getKeywordsOfType(KeywordType.COMPOUND_PROPERTY);
    }

    getEnumValues(enumType: string): string[] {
        // Look for enum definitions
        const enumKeywords = this.keywords.values();
        for (const keyword of enumKeywords) {
            if (keyword.type === KeywordType.ENUM_VALUE && keyword.tags?.includes(enumType)) {
                return keyword.validation.enumValues || [];
            }
        }
        return [];
    }

    // =============================================================================
    // EXTENSION MANAGEMENT
    // =============================================================================

    getLoadedExtensions(): KeywordExtension[] {
        return Array.from(this.loadedExtensions.values());
    }

    async reloadExtensions(): Promise<void> {
        // Clear all extensions except core
        const coreKeywords = Array.from(this.keywords.values()).filter(k => k.definedBy === 'core');
        
        this.keywords.clear();
        this.keywordsByText.clear();
        this.keywordsByType.clear();
        this.keywordsByContext.clear();
        this.loadedExtensions.clear();
        
        // Re-register core keywords
        for (const keyword of coreKeywords) {
            this.registerKeyword(keyword);
        }
        
        // Load extensions from configuration directory
        await this.loadExtensionsFromDirectory();
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private initializeCoreKeywords(): void {
        // Load core Sylang keywords
        const coreExtension: KeywordExtension = {
            extensionId: 'sylang-core',
            extensionName: 'Sylang Core Keywords',
            version: '1.0.0',
            keywords: this.defineCoreKeywords()
        };
        
        this.registerExtension(coreExtension);
    }

    private defineCoreKeywords(): KeywordDefinition[] {
        return [
            // Core definition keyword
            {
                id: 'core.def',
                keyword: 'def',
                type: KeywordType.PRIMARY_DEF,
                context: {
                    fileExtensions: ['.ple', '.fml', '.vml', '.vcf', '.fun', '.blk', '.req', '.tst', '.fma', '.fmc', '.fta', '.itm', '.haz', '.rsk', '.sgl'],
                    parentContexts: ['root'],
                    allowedDepth: [0, 1, 2, 3, 4]
                },
                validation: {
                    required: true,
                    valueType: KeywordValueType.COMPOUND
                },
                displayName: 'Definition',
                description: 'Defines a new symbol (productline, feature, function, etc.)',
                examples: ['def productline MyProduct', 'def function MyFunction'],
                definedBy: 'core',
                version: '1.0.0',
                tags: ['core', 'definition']
            },
            
            // Import keyword - UPDATED to handle parent symbol imports
            {
                id: 'core.use',
                keyword: 'use',
                type: KeywordType.IMPORT_KEYWORD,
                context: {
                    fileExtensions: ['.fml', '.vml', '.vcf', '.fun', '.blk', '.req', '.tst', '.fma', '.fmc', '.fta', '.itm', '.haz', '.rsk', '.sgl'],
                    parentContexts: ['root'],
                    allowedDepth: [0]
                },
                validation: {
                    required: false,
                    valueType: KeywordValueType.COMPOUND
                },
                displayName: 'Import Parent Symbols',
                description: 'Imports parent symbols and their children from other files (NOT filenames)',
                examples: [
                    'use productline MyProductLine',
                    'use functiongroup PowerFunctions, SafetyFunctions',
                    'use block subsystem ControlSubsystem, PowerSubsystem',
                    'use reqsection SafetyRequirements, FunctionalRequirements'
                ],
                secondaryKeywords: [
                    // Primary def types that can be imported
                    'productline', 'featureset', 'variantmodel', 'configset', 'functiongroup',
                    'block', 'reqsection', 'testsuite', 'failuremodeanalysis', 'controlmeasures',
                    'faulttreeanalysis', 'itemdefinition', 'hazardidentification', 'riskassessment', 'safetygoals'
                ],
                syntaxPattern: 'use <ParentSymbolType> <ParentSymbolName>[, <ParentSymbolName>...]',
                definedBy: 'core',
                version: '1.0.0',
                tags: ['core', 'import', 'parent-symbols']
            },
            
            // Common properties
            {
                id: 'core.name',
                keyword: 'name',
                type: KeywordType.SIMPLE_PROPERTY,
                context: {
                    fileExtensions: ['.ple', '.fml', '.vml', '.vcf', '.fun', '.blk', '.req', '.tst', '.fma', '.fmc', '.fta', '.itm', '.haz', '.rsk', '.sgl'],
                    parentContexts: ['*'],
                    allowedDepth: [1, 2, 3, 4]
                },
                validation: {
                    required: true,
                    valueType: KeywordValueType.STRING
                },
                displayName: 'Name',
                description: 'Human-readable display name',
                examples: ['name "My Product Line"', 'name "Main Function"'],
                definedBy: 'core',
                version: '1.0.0',
                tags: ['core', 'property', 'required']
            },
            
            {
                id: 'core.description',
                keyword: 'description',
                type: KeywordType.SIMPLE_PROPERTY,
                context: {
                    fileExtensions: ['.ple', '.fml', '.vml', '.vcf', '.fun', '.blk', '.req', '.tst', '.fma', '.fmc', '.fta', '.itm', '.haz', '.rsk', '.sgl'],
                    parentContexts: ['*'],
                    allowedDepth: [1, 2, 3, 4]
                },
                validation: {
                    required: true,
                    valueType: KeywordValueType.STRING
                },
                displayName: 'Description',
                description: 'Detailed description of purpose and functionality',
                examples: ['description "Complete product line architecture"'],
                definedBy: 'core',
                version: '1.0.0',
                tags: ['core', 'property', 'required']
            },
            
            // Safety levels
            {
                id: 'core.safetylevel',
                keyword: 'safetylevel',
                type: KeywordType.SIMPLE_PROPERTY,
                context: {
                    fileExtensions: ['.ple', '.fml', '.fun', '.req', '.sgl'],
                    parentContexts: ['*'],
                    allowedDepth: [1, 2, 3, 4]
                },
                validation: {
                    required: false,
                    valueType: KeywordValueType.ENUM,
                    enumValues: ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM']
                },
                displayName: 'Safety Level',
                description: 'ASIL safety level according to ISO 26262',
                examples: ['safetylevel ASIL-D', 'safetylevel QM'],
                definedBy: 'core',
                version: '1.0.0',
                tags: ['core', 'property', 'safety']
            }
        ];
    }

    private validateKeywordDefinition(definition: KeywordDefinition): void {
        if (!definition.id || !definition.keyword) {
            throw new Error('Keyword definition must have id and keyword');
        }
        
        if (this.keywords.has(definition.id)) {
            throw new Error(`Keyword ID already exists: ${definition.id}`);
        }
    }

    private removeKeyword(keywordId: string): void {
        const definition = this.keywords.get(keywordId);
        if (!definition) return;
        
        // Remove from all indexes
        this.keywords.delete(keywordId);
        
        const textEntries = this.keywordsByText.get(definition.keyword) || [];
        this.keywordsByText.set(definition.keyword, textEntries.filter(d => d.id !== keywordId));
        
        const typeEntries = this.keywordsByType.get(definition.type) || [];
        this.keywordsByType.set(definition.type, typeEntries.filter(d => d.id !== keywordId));
        
        this.keywordRemovedEmitter.fire(keywordId);
    }

    private matchesContext(definition: KeywordDefinition, context: Partial<KeywordContext>): boolean {
        if (context.fileExtensions && 
            !context.fileExtensions.some(ext => definition.context.fileExtensions.includes(ext))) {
            return false;
        }
        
        if (context.parentContexts && 
            !context.parentContexts.some(ctx => 
                definition.context.parentContexts.includes(ctx) || 
                definition.context.parentContexts.includes('*'))) {
            return false;
        }
        
        return true;
    }

    private getContextKey(fileExtension: string, parentContext?: string): string {
        return `${fileExtension}:${parentContext || 'root'}`;
    }

    private validateValue(value: string, validation: KeywordValidation, context: KeywordUsageContext): KeywordValidationResult {
        const result: KeywordValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        switch (validation.valueType) {
            case KeywordValueType.STRING:
                if (!value.match(/^".*"$/)) {
                    result.isValid = false;
                    result.errors.push('String value must be quoted');
                }
                break;
                
            case KeywordValueType.IDENTIFIER:
                if (!value.match(/^[A-Z][A-Za-z0-9_]*$/)) {
                    result.isValid = false;
                    result.errors.push('Identifier must use PascalCase');
                }
                break;
                
            case KeywordValueType.ENUM:
                if (validation.enumValues && !validation.enumValues.includes(value)) {
                    result.isValid = false;
                    result.errors.push(`Invalid enum value. Valid values: ${validation.enumValues.join(', ')}`);
                    result.validEnumValues = validation.enumValues;
                }
                break;
        }

        return result;
    }

    private getSuggestions(keyword: string, context: KeywordUsageContext): string[] {
        // Find similar keywords based on edit distance
        const allKeywords = Array.from(this.keywordsByText.keys());
        return allKeywords
            .filter(k => this.levenshteinDistance(keyword, k) <= 2)
            .slice(0, 5);
    }

    private levenshteinDistance(a: string, b: string): number {
        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

        for (let i = 0; i <= a.length; i += 1) {
            matrix[0][i] = i;
        }

        for (let j = 0; j <= b.length; j += 1) {
            matrix[j][0] = j;
        }

        for (let j = 1; j <= b.length; j += 1) {
            for (let i = 1; i <= a.length; i += 1) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }

        return matrix[b.length][a.length];
    }

    private async loadExtensionsFromDirectory(): Promise<void> {
        try {
            // Load from workspace .sylang/keywords/ directory
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) return;
            
            const keywordsDir = path.join(workspaceRoot, '.sylang', 'keywords');
            if (!fs.existsSync(keywordsDir)) return;
            
            const files = fs.readdirSync(keywordsDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const filePath = path.join(keywordsDir, file);
                        const content = fs.readFileSync(filePath, 'utf8');
                        const extension: KeywordExtension = JSON.parse(content);
                        await this.registerExtension(extension);
                    } catch (error) {
                        console.error(`Failed to load keyword extension ${file}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load keyword extensions:', error);
        }
    }
} 