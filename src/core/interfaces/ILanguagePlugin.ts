import * as vscode from 'vscode';

// Import types from other interfaces - using type-only imports to avoid circular dependencies
import type { 
    ISymbolManager, 
    ISymbolDefinition, 
    ISymbolReference, 
    ISymbolIndex, 
    IImportInfo,
    IParsingResult,
    ISyntaxTree,
    ISyntaxNode,
    IParsingError
} from './ISymbolManager';
import type { ICacheManager } from './ICacheManager';
import type { IConfigurationManager, ILanguageConfiguration } from './IConfigurationManager';

// =============================================================================
// CORE PLUGIN INTERFACES
// =============================================================================

/**
 * Main interface that all language plugins must implement
 */
export interface ILanguagePlugin {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly fileExtensions: string[];
    readonly languageIds: string[];
    
    // Core components
    getParser(): ILanguageParser;
    getValidator(): ILanguageValidator;
    getProvider(): ILanguageProvider;
    
    // Plugin lifecycle
    initialize(context: IPluginContext): Promise<void>;
    dispose(): Promise<void>;
}

/**
 * Context provided to plugins during initialization
 */
export interface IPluginContext {
    readonly workspaceRoot: string;
    readonly symbolManager: ISymbolManager;
    readonly cacheManager: ICacheManager;
    readonly configurationManager: IConfigurationManager;
    readonly diagnosticCollection: vscode.DiagnosticCollection;
}

// =============================================================================
// VALIDATION INTERFACES
// =============================================================================

/**
 * Language-specific validator interface
 */
export interface ILanguageValidator {
    readonly pluginId: string;
    
    validate(document: vscode.TextDocument, context: IValidationContext): Promise<IValidationResult>;
    validateBatch(documents: vscode.TextDocument[], context: IValidationContext): Promise<IValidationResult[]>;
    supportsDocument(document: vscode.TextDocument): boolean;
}

/**
 * Context passed to validators
 */
export interface IValidationContext {
    readonly symbolManager: ISymbolManager;
    readonly projectSymbols: ISymbolIndex;
    readonly imports: IImportInfo[];
    readonly configuration: ILanguageConfiguration;
    readonly cacheManager: ICacheManager;
}

/**
 * Result from validation operations
 */
export interface IValidationResult {
    readonly documentUri: string;
    readonly diagnostics: vscode.Diagnostic[];
    readonly symbols: ISymbolDefinition[];
    readonly references: ISymbolReference[];
    readonly imports: IImportInfo[];
    readonly metadata: IValidationMetadata;
}

/**
 * Metadata about the validation process
 */
export interface IValidationMetadata {
    readonly executionTime: number;
    readonly cacheHit: boolean;
    readonly validatorVersion: string;
    readonly ruleViolations: IRuleViolation[];
}

/**
 * Information about a validation rule violation
 */
export interface IRuleViolation {
    readonly ruleId: string;
    readonly severity: 'error' | 'warning' | 'info';
    readonly message: string;
    readonly range: vscode.Range;
    readonly fixSuggestions?: IFixSuggestion[];
}

/**
 * Suggested fix for a validation issue
 */
export interface IFixSuggestion {
    readonly title: string;
    readonly description: string;
    readonly edits: vscode.TextEdit[];
}

// =============================================================================
// PARSING INTERFACES
// =============================================================================

/**
 * Language-specific parser interface
 */
export interface ILanguageParser {
    readonly pluginId: string;
    
    parse(document: vscode.TextDocument, context: IParsingContext): Promise<IParsingResult>;
    parseIncremental(document: vscode.TextDocument, changes: vscode.TextDocumentContentChangeEvent[], context: IParsingContext): Promise<IParsingResult>;
    supportsDocument(document: vscode.TextDocument): boolean;
}

/**
 * Context for parsing operations
 */
export interface IParsingContext {
    readonly symbolManager: ISymbolManager;
    readonly configuration: ILanguageConfiguration;
    readonly cacheManager: ICacheManager;
}

// =============================================================================
// LANGUAGE PROVIDER INTERFACES
// =============================================================================

/**
 * Language provider for IDE features (completion, definition, etc.)
 */
export interface ILanguageProvider {
    readonly pluginId: string;
    
    // IDE Features
    provideCompletion?(document: vscode.TextDocument, position: vscode.Position, context: IProviderContext): Promise<vscode.CompletionItem[]>;
    provideDefinition?(document: vscode.TextDocument, position: vscode.Position, context: IProviderContext): Promise<vscode.Location[]>;
    provideReferences?(document: vscode.TextDocument, position: vscode.Position, context: IProviderContext): Promise<vscode.Location[]>;
    provideHover?(document: vscode.TextDocument, position: vscode.Position, context: IProviderContext): Promise<vscode.Hover | undefined>;
    provideRename?(document: vscode.TextDocument, position: vscode.Position, newName: string, context: IProviderContext): Promise<vscode.WorkspaceEdit>;
    
    supportsDocument(document: vscode.TextDocument): boolean;
}

/**
 * Context for provider operations
 */
export interface IProviderContext {
    readonly symbolManager: ISymbolManager;
    readonly projectSymbols: ISymbolIndex;
    readonly configuration: ILanguageConfiguration;
} 