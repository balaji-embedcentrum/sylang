import * as vscode from 'vscode';

// Import cache settings from ICacheManager
import type { ICacheSettings } from './ICacheManager';

// =============================================================================
// CONFIGURATION MANAGEMENT INTERFACES
// =============================================================================

/**
 * Configuration manager interface for handling .vcf files and visibility rules
 */
export interface IConfigurationManager {
    // Configuration loading and management
    loadConfigurations(): Promise<void>;
    reloadConfigurations(): Promise<void>;
    getConfigurationValue(key: string): number | undefined;
    setConfigurationValue(key: string, value: number): Promise<void>;
    
    // Language and plugin configurations
    getLanguageConfiguration(languageId: string): ILanguageConfiguration | undefined;
    getPluginConfiguration(pluginId: string): IPluginConfiguration | undefined;
    getGlobalConfiguration(): IGlobalConfiguration;
    
    // Visibility and graying rules
    isSymbolEnabled(symbolId: string): boolean;
    getAffectedSymbols(configKey: string): string[];
    updateSymbolVisibility(configKey: string, value: number): Promise<void>;
    
    // Configuration validation
    validateConfigurationReference(configKey: string): IConfigValidationResult;
    validateConfigurationFile(documentUri: string): IConfigValidationResult[];
    
    // NEW: Modular property validation
    getValidPropertiesForContext(languageId: string, context: string): string[];
    
    // NEW: Compound property definitions
    getCompoundPropertyDefinitions(languageId: string, context: string): Record<string, CompoundPropertyDef>;
    
    // Event handling
    onConfigurationChanged(listener: (event: IConfigurationChangeEvent) => void): vscode.Disposable;
    onLanguageConfigurationChanged(listener: (event: ILanguageConfigChangeEvent) => void): vscode.Disposable;
    
    // File operations
    watchConfigurationFiles(): void;
    unwatchConfigurationFiles(): void;
    getConfigurationFiles(): string[];
    
    // Workspace integration
    getWorkspaceConfiguration(): IWorkspaceConfiguration;
    applyWorkspaceSettings(): Promise<void>;
  }

/**
 * Language-specific configuration
 */
export interface ILanguageConfiguration {
    readonly id: string;                     // Language ID (e.g., 'sylang-function')
    readonly name: string;                   // Display name
    readonly fileExtensions: string[];       // Supported file extensions
    readonly keywords: string[];             // Language keywords
    readonly validationRules: IValidationRuleConfig[]; // Validation rules
    readonly parsingOptions: IParsingOptions; // Parsing configuration
    readonly completionOptions: ICompletionOptions; // Completion configuration
    readonly snippetOptions: ISnippetOptions; // Snippet configuration
    readonly syntaxHighlighting: ISyntaxHighlightingConfig; // Syntax highlighting
}

/**
 * Plugin-specific configuration
 */
export interface IPluginConfiguration {
    readonly pluginId: string;               // Plugin identifier
    readonly enabled: boolean;               // Whether plugin is enabled
    readonly priority: number;               // Plugin priority (higher = more priority)
    readonly customSettings: Record<string, any>; // Custom plugin settings
    readonly dependencies: string[];         // Plugin dependencies
    readonly conflictsWith: string[];       // Conflicting plugins
    readonly version: string;                // Plugin version
    readonly autoLoad: boolean;              // Auto-load on startup
}

/**
 * Global extension configuration
 */
export interface IGlobalConfiguration {
    readonly enableValidation: boolean;      // Enable validation
    readonly enableCompletion: boolean;      // Enable auto-completion
    readonly enableIncrementalParsing: boolean; // Enable incremental parsing
    readonly enableBackgroundValidation: boolean; // Enable background validation
    readonly cacheSettings: ICacheSettings; // Cache configuration
    readonly performanceSettings: IPerformanceSettings; // Performance settings
    readonly debugSettings: IDebugSettings; // Debug configuration
    readonly experimentalFeatures: IExperimentalFeatures; // Experimental features
}

/**
 * Validation rule configuration
 */
export interface IValidationRuleConfig {
    readonly id: string;                     // Rule identifier
    readonly name: string;                   // Rule display name
    readonly description: string;            // Rule description
    readonly enabled: boolean;               // Whether rule is enabled
    readonly severity: 'error' | 'warning' | 'info'; // Rule severity
    readonly category: string;               // Rule category
    readonly parameters: Record<string, any>; // Rule parameters
    readonly fileTypes: string[];           // Applicable file types
    readonly conditions: IRuleCondition[];  // Rule conditions
}

/**
 * Rule condition for conditional validation
 */
export interface IRuleCondition {
    readonly type: 'context' | 'symbol' | 'config' | 'file';
    readonly operator: 'equals' | 'contains' | 'matches' | 'exists';
    readonly value: any;                     // Condition value
    readonly negate?: boolean;               // Negate condition
}

/**
 * Parsing options configuration
 */
export interface IParsingOptions {
    readonly skipComments: boolean;          // Skip comment parsing
    readonly preserveWhitespace: boolean;    // Preserve whitespace in AST
    readonly enableErrorRecovery: boolean;   // Enable error recovery
    readonly maxParseTime: number;           // Maximum parse time (ms)
    readonly strictMode: boolean;            // Strict parsing mode
    readonly indentationStyle: 'spaces' | 'tabs'; // Indentation style
    readonly indentationSize: number;        // Indentation size
    readonly lineEnding: 'lf' | 'crlf' | 'auto'; // Line ending style
}

/**
 * Completion options configuration
 */
export interface ICompletionOptions {
    readonly enableSnippets: boolean;        // Enable snippet completion
    readonly enableAutoImport: boolean;      // Enable auto-import suggestions
    readonly maxSuggestions: number;         // Maximum suggestions to show
    readonly caseSensitive: boolean;         // Case-sensitive completion
    readonly fuzzyMatching: boolean;         // Enable fuzzy matching
    readonly showDocumentation: boolean;     // Show documentation in completion
    readonly showTypes: boolean;             // Show symbol types
    readonly showConfigStatus: boolean;      // Show configuration status
    readonly sortBy: 'relevance' | 'alphabetical' | 'type'; // Sort order
}

/**
 * Snippet options configuration
 */
export interface ISnippetOptions {
    readonly enableContextualSnippets: boolean; // Context-aware snippets
    readonly enableConfigurationFiltering: boolean; // Filter by config
    readonly showPlaceholders: boolean;      // Show placeholder descriptions
    readonly enableTabStops: boolean;        // Enable tab stop navigation
    readonly customSnippetPaths: string[];   // Custom snippet directories
}

/**
 * Syntax highlighting configuration
 */
export interface ISyntaxHighlightingConfig {
    readonly enableSemanticHighlighting: boolean; // Semantic highlighting
    readonly enableConfigurationHighlighting: boolean; // Config-based highlighting
    readonly grayedOutOpacity: number;       // Opacity for grayed symbols (0-1)
    readonly errorColor: string;             // Error color
    readonly warningColor: string;           // Warning color
    readonly infoColor: string;              // Info color
    readonly configDisabledColor: string;    // Color for config-disabled symbols
}

/**
 * Configuration validation result
 */
export interface IConfigValidationResult {
    readonly isValid: boolean;               // Whether config is valid
    readonly errors: IConfigValidationError[]; // Validation errors
    readonly warnings: IConfigValidationWarning[]; // Validation warnings
    readonly suggestions: IConfigValidationSuggestion[]; // Improvement suggestions
}

/**
 * Configuration validation error
 */
export interface IConfigValidationError {
    readonly message: string;                // Error message
    readonly range: vscode.Range;            // Error range
    readonly code: string;                   // Error code
    readonly severity: 'error' | 'warning'; // Error severity
    readonly configKey?: string;             // Related config key
    readonly suggestion?: string;            // Fix suggestion
}

/**
 * Configuration validation warning
 */
export interface IConfigValidationWarning {
    readonly message: string;                // Warning message
    readonly range: vscode.Range;            // Warning range
    readonly code: string;                   // Warning code
    readonly configKey?: string;             // Related config key
    readonly suggestion?: string;            // Improvement suggestion
}

/**
 * Configuration validation suggestion
 */
export interface IConfigValidationSuggestion {
    readonly message: string;                // Suggestion message
    readonly configKey: string;              // Target config key
    readonly suggestedValue: number;         // Suggested value
    readonly reason: string;                 // Reason for suggestion
}

/**
 * Configuration change event
 */
export interface IConfigurationChangeEvent {
    readonly type: 'value_changed' | 'file_added' | 'file_removed' | 'file_updated';
    readonly configKey?: string;             // Changed config key
    readonly oldValue?: number;              // Old value
    readonly newValue?: number;              // New value
    readonly fileUri?: string;               // Changed file URI
    readonly affectedSymbols: string[];      // Affected symbol IDs
    readonly timestamp: Date;                // Change timestamp
}

/**
 * Language configuration change event
 */
export interface ILanguageConfigChangeEvent {
    readonly languageId: string;             // Changed language ID
    readonly changeType: 'keywords' | 'rules' | 'options' | 'syntax';
    readonly oldConfig: ILanguageConfiguration; // Old configuration
    readonly newConfig: ILanguageConfiguration; // New configuration
    readonly timestamp: Date;                // Change timestamp
}



/**
 * Performance settings
 */
export interface IPerformanceSettings {
    readonly maxConcurrentValidations: number; // Max concurrent validations
    readonly validationTimeout: number;        // Validation timeout (ms)
    readonly parsingTimeout: number;           // Parsing timeout (ms)
    readonly debounceMs: number;               // Debounce time for changes
    readonly batchSize: number;                // Batch size for operations
    readonly enableProfiling: boolean;         // Enable performance profiling
    readonly profileThreshold: number;         // Profiling threshold (ms)
}

/**
 * Debug settings
 */
export interface IDebugSettings {
    readonly enableLogging: boolean;           // Enable debug logging
    readonly logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    readonly logToFile: boolean;               // Log to file
    readonly logFilePath?: string;             // Log file path
    readonly enableTracing: boolean;           // Enable operation tracing
    readonly traceValidation: boolean;         // Trace validation operations
    readonly traceParsing: boolean;            // Trace parsing operations
    readonly traceCompletion: boolean;         // Trace completion operations
}

/**
 * Experimental features
 */
export interface IExperimentalFeatures {
    readonly enableAICompletion: boolean;      // AI-powered completion
    readonly enableSmartRefactoring: boolean;  // Smart refactoring
    readonly enableCrossFileAnalysis: boolean; // Advanced cross-file analysis
    readonly enableConfigurationUI: boolean;   // Visual configuration editor
    readonly enablePerformanceMonitoring: boolean; // Performance monitoring
}

/**
 * Workspace configuration
 */
export interface IWorkspaceConfiguration {
    readonly workspaceRoot: string;            // Workspace root path
    readonly configurationFiles: string[];    // Found configuration files
    readonly languageFiles: Map<string, string[]>; // Language ID -> file paths
    readonly projectSettings: IProjectSettings; // Project-specific settings
    readonly defaultConfigurations: Map<string, number>; // Default config values
}

/**
 * Project-specific settings
 */
export interface IProjectSettings {
    readonly projectName?: string;             // Project name
    readonly projectVersion?: string;          // Project version
    readonly defaultSafetyLevel?: string;      // Default safety level
    readonly defaultOwner?: string;            // Default owner
    readonly customKeywords: string[];         // Custom keywords
    readonly customEnums: Record<string, string[]>; // Custom enums
    readonly validationProfile: string;        // Validation profile
}

/**
 * Compound property definition for properties with secondary keywords
 */
export interface CompoundPropertyDef {
    readonly primaryKeyword: string;          // Primary keyword (e.g., 'implements')
    readonly secondaryKeywords: string[];     // Valid secondary keywords (e.g., ['function'])
    readonly valueType: 'identifier' | 'identifier-list' | 'enum' | 'string';
    readonly syntax: string;                  // Example syntax for error messages
} 