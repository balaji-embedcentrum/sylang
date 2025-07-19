import * as vscode from 'vscode';
import { ISymbolDefinition, ISymbolReference, IImportInfo, IImportError } from './ISymbolManager';

// =============================================================================
// IMPORT MANAGEMENT INTERFACES
// =============================================================================

/**
 * Import manager interface for processing use statements and dependency resolution
 */
export interface IImportManager {
    // Import parsing and resolution
    parseImportStatement(line: string, document: vscode.TextDocument, lineIndex: number): IImportStatement | undefined;
    resolveImport(importStatement: IImportStatement, context: IImportResolutionContext): Promise<IImportResolutionResult>;
    resolveAllImports(document: vscode.TextDocument): Promise<IDocumentImportResult>;
    
    // Multi-import support (use block subsystem ss1, ss2, ss3)
    parseMultiImport(importStatement: IImportStatement): IMultiImportInfo;
    resolveMultiImport(multiImport: IMultiImportInfo, context: IImportResolutionContext): Promise<IMultiImportResult>;
    
    // Dependency tracking
    getDependencies(documentUri: string): string[];
    getDependents(documentUri: string): string[];
    buildDependencyGraph(): IDependencyGraph;
    detectCircularDependencies(): ICircularDependency[];
    
    // Symbol availability
    getAvailableSymbols(documentUri: string): ISymbolDefinition[];
    getImportedSymbols(documentUri: string): ISymbolDefinition[];
    getExportedSymbols(documentUri: string): ISymbolDefinition[];
    
    // Import validation
    validateImport(importStatement: IImportStatement, context: IImportValidationContext): IImportValidationResult;
    validateAllImports(document: vscode.TextDocument): Promise<IImportValidationResult[]>;
    
    // Import suggestions and fixes
    suggestImports(symbolName: string, documentUri: string): IImportSuggestion[];
    getAutoImportCandidates(documentUri: string): IAutoImportCandidate[];
    generateImportStatement(symbolId: string, targetDocument: string): string | undefined;
    
    // Transitive dependency resolution
    resolveTransitiveDependencies(documentUri: string): ITransitiveDependencyResult;
    getSymbolChain(symbolId: string): ISymbolChain;
    
    // Event handling
    onImportResolved(listener: (event: IImportResolvedEvent) => void): vscode.Disposable;
    onDependencyChanged(listener: (event: IDependencyChangedEvent) => void): vscode.Disposable;
    
    // Cache management
    clearImportCache(documentUri?: string): void;
    refreshImports(documentUri: string): Promise<void>;
    
    // File watching
    watchImportedFiles(documentUri: string): void;
    unwatchImportedFiles(documentUri: string): void;
}

/**
 * Parsed import statement
 */
export interface IImportStatement {
    readonly keyword: string;                // Primary keyword (block, featureset, etc.)
    readonly subkeyword?: string;           // Secondary keyword (system, subsystem, etc.)
    readonly identifiers: string[];          // Imported identifiers
    readonly isMultiImport: boolean;         // Whether this is a multi-import
    readonly location: vscode.Location;      // Statement location
    readonly range: vscode.Range;            // Statement range
    readonly documentUri: string;            // Document containing import
    readonly lineIndex: number;              // Line index in document
    readonly rawText: string;                // Raw import text
    readonly syntax: IImportSyntax;          // Parsed syntax details
}

/**
 * Import syntax details
 */
export interface IImportSyntax {
    readonly useKeywordRange: vscode.Range;  // Range of 'use' keyword
    readonly primaryKeywordRange: vscode.Range; // Range of primary keyword
    readonly subkeywordRange?: vscode.Range; // Range of sub-keyword
    readonly identifierRanges: vscode.Range[]; // Ranges of identifiers
    readonly separatorRanges: vscode.Range[]; // Ranges of separators (commas)
    readonly isValid: boolean;               // Whether syntax is valid
    readonly syntaxErrors: ISyntaxError[];   // Syntax errors
}

/**
 * Syntax error in import statement
 */
export interface ISyntaxError {
    readonly message: string;                // Error message
    readonly range: vscode.Range;            // Error range
    readonly type: 'missing_keyword' | 'invalid_identifier' | 'missing_separator' | 'unexpected_token';
    readonly suggestion?: string;            // Fix suggestion
}

/**
 * Multi-import information
 */
export interface IMultiImportInfo {
    readonly baseImport: IImportStatement;   // Base import statement
    readonly identifiers: IMultiImportIdentifier[]; // Individual identifiers
    resolvedCount: number;                   // Number of resolved identifiers (mutable)
    unresolvedCount: number;                 // Number of unresolved identifiers (mutable)
}

/**
 * Multi-import identifier
 */
export interface IMultiImportIdentifier {
    readonly name: string;                   // Identifier name
    readonly range: vscode.Range;            // Identifier range
    isResolved: boolean;                     // Whether resolved (mutable)
    resolvedSymbol?: ISymbolDefinition;      // Resolved symbol (mutable)
    error?: IImportError;                    // Resolution error (mutable)
}

/**
 * Import resolution context
 */
export interface IImportResolutionContext {
    readonly documentUri: string;            // Document requesting import
    readonly symbolManager: any;            // Symbol manager reference
    readonly configurationManager: any;     // Configuration manager reference
    readonly workspaceRoot: string;          // Workspace root path
    readonly resolutionMode: 'strict' | 'lenient'; // Resolution mode
    readonly maxDepth: number;               // Maximum resolution depth
}

/**
 * Import resolution result
 */
export interface IImportResolutionResult {
    readonly importStatement: IImportStatement; // Original import statement
    readonly resolvedSymbols: ISymbolDefinition[]; // Successfully resolved symbols
    readonly unresolvedIdentifiers: string[]; // Unresolved identifiers
    readonly errors: IImportError[];         // Resolution errors
    readonly warnings: IImportWarning[];     // Resolution warnings
    readonly isFullyResolved: boolean;       // Whether all identifiers resolved
    readonly resolutionTime: number;         // Resolution time in ms
    readonly dependencyChain: string[];      // Dependency chain
}

/**
 * Document import result
 */
export interface IDocumentImportResult {
    readonly documentUri: string;            // Document URI
    readonly importStatements: IImportStatement[]; // All import statements
    readonly resolutionResults: IImportResolutionResult[]; // Resolution results
    readonly totalSymbols: number;           // Total imported symbols
    readonly resolvedSymbols: number;        // Successfully resolved symbols
    readonly errors: IImportError[];         // All errors
    readonly warnings: IImportWarning[];     // All warnings
    readonly isValid: boolean;               // Whether all imports valid
    readonly dependencies: string[];         // Document dependencies
}

/**
 * Multi-import resolution result
 */
export interface IMultiImportResult {
    readonly multiImport: IMultiImportInfo;  // Original multi-import
    readonly individualResults: IImportResolutionResult[]; // Individual resolution results
    readonly successCount: number;           // Number of successful resolutions
    readonly errorCount: number;             // Number of errors
    readonly warnings: IImportWarning[];     // Warnings
}

/**
 * Import warning
 */
export interface IImportWarning {
    readonly type: 'unused_import' | 'duplicate_import' | 'deprecated_symbol' | 'inefficient_import';
    readonly message: string;                // Warning message
    readonly range: vscode.Range;            // Warning range
    readonly importStatement: IImportStatement; // Related import statement
    readonly suggestion?: string;            // Improvement suggestion
}

/**
 * Dependency graph
 */
export interface IDependencyGraph {
    readonly nodes: Map<string, IDependencyNode>; // Document URI -> Node
    readonly edges: IDependencyEdge[];       // Dependency edges
    readonly roots: string[];                // Root documents (no dependencies)
    readonly leaves: string[];               // Leaf documents (no dependents)
    readonly cycles: ICircularDependency[];  // Circular dependencies
    readonly maxDepth: number;               // Maximum dependency depth
}

/**
 * Dependency graph node
 */
export interface IDependencyNode {
    readonly documentUri: string;            // Document URI
    readonly dependencies: string[];         // Direct dependencies
    readonly dependents: string[];           // Direct dependents
    readonly importCount: number;            // Number of imports
    readonly exportCount: number;            // Number of exports
    readonly lastModified: Date;             // Last modification time
}

/**
 * Dependency graph edge
 */
export interface IDependencyEdge {
    readonly from: string;                   // Source document
    readonly to: string;                     // Target document
    readonly importStatements: IImportStatement[]; // Import statements creating this edge
    readonly symbolCount: number;            // Number of symbols imported
    readonly weight: number;                 // Edge weight (based on symbol count)
}

/**
 * Circular dependency
 */
export interface ICircularDependency {
    readonly cycle: string[];                // Documents in cycle
    readonly entryPoint: string;             // Entry point document
    readonly importStatements: IImportStatement[]; // Statements creating cycle
    readonly severity: 'error' | 'warning'; // Severity level
    readonly suggestion: string;             // Resolution suggestion
}

/**
 * Import validation context
 */
export interface IImportValidationContext {
    readonly documentUri: string;            // Document being validated
    readonly allowCircularDependencies: boolean; // Allow circular deps
    readonly maxDependencyDepth: number;     // Max dependency depth
    readonly requireExplicitImports: boolean; // Require explicit imports
    readonly validateExports: boolean;       // Validate exported symbols
}

/**
 * Import validation result
 */
export interface IImportValidationResult {
    readonly importStatement: IImportStatement; // Validated import
    readonly isValid: boolean;               // Whether import is valid
    readonly errors: IImportValidationError[]; // Validation errors
    readonly warnings: IImportValidationWarning[]; // Validation warnings
    readonly suggestions: IImportSuggestion[]; // Improvement suggestions
}

/**
 * Import validation error
 */
export interface IImportValidationError {
    readonly type: 'syntax' | 'resolution' | 'circular' | 'access' | 'version';
    readonly message: string;                // Error message
    readonly range: vscode.Range;            // Error range
    readonly code: string;                   // Error code
    readonly severity: 'error' | 'warning'; // Error severity
    readonly relatedInformation?: vscode.DiagnosticRelatedInformation[];
}

/**
 * Import validation warning
 */
export interface IImportValidationWarning {
    readonly type: 'unused' | 'duplicate' | 'inefficient' | 'deprecated';
    readonly message: string;                // Warning message
    readonly range: vscode.Range;            // Warning range
    readonly suggestion?: string;            // Improvement suggestion
}

/**
 * Import suggestion
 */
export interface IImportSuggestion {
    readonly type: 'add_import' | 'fix_import' | 'remove_import' | 'optimize_import';
    readonly description: string;            // Suggestion description
    readonly newImportStatement: string;     // Suggested import statement
    readonly range?: vscode.Range;           // Range to replace (if fixing)
    readonly symbolName: string;             // Related symbol name
    readonly confidence: number;             // Suggestion confidence (0-1)
    readonly documentUri: string;            // Source document
}

/**
 * Auto-import candidate
 */
export interface IAutoImportCandidate {
    readonly symbolName: string;             // Symbol name
    readonly symbolType: string;             // Symbol type
    readonly sourceDocument: string;         // Source document
    readonly importStatement: string;        // Generated import statement
    readonly description?: string;           // Symbol description
    readonly isVisible: boolean;             // Whether symbol is visible
    readonly isEnabled: boolean;             // Whether symbol is enabled
}

/**
 * Transitive dependency result
 */
export interface ITransitiveDependencyResult {
    readonly documentUri: string;            // Root document
    readonly directDependencies: string[];   // Direct dependencies
    readonly transitiveDependencies: string[]; // All transitive dependencies
    readonly dependencyLevels: Map<string, number>; // Document -> depth level
    readonly totalSymbols: number;           // Total available symbols
    readonly conflictingSymbols: ISymbolConflict[]; // Symbol conflicts
}

/**
 * Symbol conflict
 */
export interface ISymbolConflict {
    readonly symbolName: string;             // Conflicting symbol name
    readonly conflictingDocuments: string[]; // Documents with conflicts
    readonly conflictType: 'name' | 'type' | 'visibility';
    readonly resolution: 'priority' | 'explicit' | 'error';
    readonly suggestion?: string;            // Resolution suggestion
}

/**
 * Symbol chain (for transitive dependencies)
 */
export interface ISymbolChain {
    readonly rootSymbol: ISymbolDefinition;  // Root symbol
    readonly chain: ISymbolDefinition[];     // Symbol dependency chain
    readonly documents: string[];            // Documents in chain
    readonly isCircular: boolean;            // Whether chain is circular
    readonly depth: number;                  // Chain depth
}

/**
 * Import resolved event
 */
export interface IImportResolvedEvent {
    readonly documentUri: string;            // Document with resolved import
    readonly importStatement: IImportStatement; // Resolved import statement
    readonly resolvedSymbols: ISymbolDefinition[]; // Newly resolved symbols
    readonly timestamp: Date;                // Resolution timestamp
}

/**
 * Dependency changed event
 */
export interface IDependencyChangedEvent {
    readonly type: 'added' | 'removed' | 'modified';
    readonly sourceDocument: string;         // Source document
    readonly targetDocument: string;         // Target document
    readonly affectedSymbols: string[];      // Affected symbol IDs
    readonly timestamp: Date;                // Change timestamp
} 