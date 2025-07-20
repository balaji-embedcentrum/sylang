import * as vscode from 'vscode';
import { ISymbolDefinition, ISymbolIndex } from './ISymbolManager';
import { IValidationResult, IValidationContext } from './ILanguagePlugin';

// Import validation rule interfaces from IConfigurationManager
import type { IValidationRuleConfig, IRuleCondition } from './IConfigurationManager';

// Re-export IValidationRuleConfig for use by ValidationPipeline  
export type { IValidationRuleConfig } from './IConfigurationManager';

// Import dependency and conflict interfaces from IImportManager
import type { ICircularDependency, ISymbolConflict } from './IImportManager';

// =============================================================================
// VALIDATION PIPELINE INTERFACES
// =============================================================================

/**
 * Validation pipeline interface for multi-stage validation orchestration
 */
export interface IValidationPipeline {
    // Pipeline execution
    validateDocument(document: vscode.TextDocument, context: IValidationPipelineContext): Promise<IPipelineResult>;
    validateBatch(documents: vscode.TextDocument[], context: IValidationPipelineContext): Promise<IPipelineResult[]>;
    validateWorkspace(): Promise<IWorkspaceValidationResult>;
    
    // Stage-specific validation
    validateStage(stage: ValidationStage, document: vscode.TextDocument, context: IValidationStageContext): Promise<IStageResult>;
    validateAllStages(document: vscode.TextDocument, context: IValidationPipelineContext): Promise<IStageResult[]>;
    
    // Cross-file validation
    validateCrossFileReferences(documents: vscode.TextDocument[]): Promise<ICrossFileValidationResult>;
    validateDependencies(rootDocument: vscode.TextDocument): Promise<IDependencyValidationResult>;
    validateImportChain(document: vscode.TextDocument): Promise<IImportChainValidationResult>;
    
    // Configuration-aware validation
    validateWithConfiguration(document: vscode.TextDocument, configState: IConfigurationState): Promise<IConfigAwareValidationResult>;
    revalidateAffectedDocuments(configKey: string, newValue: number): Promise<IRevalidationResult>;
    
    // Incremental validation
    validateIncremental(document: vscode.TextDocument, changes: vscode.TextDocumentContentChangeEvent[]): Promise<IIncrementalValidationResult>;
    
    // Validation rules management
    getValidationRules(fileType: string): IValidationRule[];
    enableValidationRule(ruleId: string): void;
    disableValidationRule(ruleId: string): void;
    updateValidationRule(ruleId: string, config: IValidationRuleConfig): void;
    
    // Pipeline configuration
    configurePipeline(config: IPipelineConfiguration): void;
    getPipelineConfiguration(): IPipelineConfiguration;
    
    // Event handling
    onValidationStarted(listener: (event: IValidationStartedEvent) => void): vscode.Disposable;
    onValidationCompleted(listener: (event: IValidationCompletedEvent) => void): vscode.Disposable;
    onStageCompleted(listener: (event: IStageCompletedEvent) => void): vscode.Disposable;
    
    // Performance monitoring
    getPerformanceMetrics(): IValidationPerformanceMetrics;
    getStageMetrics(stage: ValidationStage): IStagePerformanceMetrics;
}

/**
 * Validation stages in the pipeline
 */
export enum ValidationStage {
    PARSING = 'parsing',                     // Stage 1: Parse document structure
    IMPORT_RESOLUTION = 'import_resolution', // Stage 2: Resolve imports
    SYNTAX_VALIDATION = 'syntax_validation', // Stage 3: Validate syntax and structure
    REFERENCE_VALIDATION = 'reference_validation', // Stage 4: Validate cross-references
    CROSS_FILE_VALIDATION = 'cross_file_validation', // Stage 5: Validate cross-file references
    CONFIGURATION_VALIDATION = 'configuration_validation', // Stage 6: Validate configurations
    SEMANTIC_VALIDATION = 'semantic_validation' // Stage 7: Validate semantic rules
}

/**
 * Validation pipeline context
 */
export interface IValidationPipelineContext {
    readonly workspaceRoot: string;          // Workspace root
    readonly symbolManager: any;             // Symbol manager
    readonly configurationManager: any;     // Configuration manager
    readonly importManager: any;             // Import manager
    readonly cacheManager: any;              // Cache manager
    readonly enabledStages: ValidationStage[]; // Enabled validation stages
    readonly validationMode: 'strict' | 'lenient' | 'fast'; // Validation mode
    readonly maxConcurrency: number;         // Maximum concurrent validations
    readonly timeout: number;                // Validation timeout
}

/**
 * Validation stage context
 */
export interface IValidationStageContext {
    readonly stage: ValidationStage;         // Current stage
    readonly document: vscode.TextDocument;  // Document being validated
    readonly previousResults: IStageResult[]; // Results from previous stages
    readonly symbolIndex: ISymbolIndex;     // Available symbols
    readonly configuration: any;            // Configuration state
    readonly imports: any[];                 // Resolved imports
}

/**
 * Pipeline validation result
 */
export interface IPipelineResult {
    readonly documentUri: string;            // Validated document
    readonly stageResults: IStageResult[];   // Results from all stages
    readonly finalDiagnostics: vscode.Diagnostic[]; // Final diagnostics
    readonly isValid: boolean;               // Overall validity
    readonly metadata: IPipelineMetadata;    // Pipeline metadata
    readonly performance: IPipelinePerformance; // Performance metrics
}

/**
 * Stage validation result
 */
export interface IStageResult {
    readonly stage: ValidationStage;         // Validation stage
    readonly documentUri: string;            // Document URI
    readonly diagnostics: vscode.Diagnostic[]; // Stage diagnostics
    readonly symbols: ISymbolDefinition[];   // Extracted/validated symbols
    readonly isValid: boolean;               // Stage validity
    readonly executionTime: number;          // Execution time in ms
    readonly cacheHit: boolean;              // Whether result was cached
    readonly errors: IValidationError[];     // Stage errors
    readonly warnings: IValidationWarning[]; // Stage warnings
    readonly metadata: IStageMetadata;       // Stage metadata
}

/**
 * Workspace validation result
 */
export interface IWorkspaceValidationResult {
    readonly totalDocuments: number;         // Total documents validated
    readonly validDocuments: number;         // Valid documents
    readonly invalidDocuments: number;       // Invalid documents
    readonly totalDiagnostics: number;       // Total diagnostics
    readonly documentResults: IPipelineResult[]; // Individual document results
    readonly crossFileIssues: ICrossFileIssue[]; // Cross-file issues
    readonly performanceMetrics: IWorkspacePerformanceMetrics; // Performance metrics
    readonly validationTime: number;         // Total validation time
}

/**
 * Cross-file validation result
 */
export interface ICrossFileValidationResult {
    readonly documentUris: string[];         // Validated documents
    readonly unresolvedReferences: IUnresolvedReference[]; // Unresolved references
    readonly circularDependencies: ICircularDependency[]; // Circular dependencies
    readonly conflictingSymbols: ISymbolConflict[]; // Symbol conflicts
    readonly orphanedImports: IOrphanedImport[]; // Orphaned imports
    readonly diagnostics: vscode.Diagnostic[]; // Cross-file diagnostics
    readonly isValid: boolean;               // Overall validity
}

/**
 * Dependency validation result
 */
export interface IDependencyValidationResult {
    readonly rootDocument: string;           // Root document
    readonly dependencyChain: string[];      // Dependency chain
    readonly validDependencies: string[];    // Valid dependencies
    readonly invalidDependencies: string[];  // Invalid dependencies
    readonly missingDependencies: string[];  // Missing dependencies
    readonly circularDependencies: ICircularDependency[]; // Circular dependencies
    readonly diagnostics: vscode.Diagnostic[]; // Dependency diagnostics
}

/**
 * Import chain validation result
 */
export interface IImportChainValidationResult {
    readonly documentUri: string;            // Document URI
    readonly importChain: IImportChainNode[]; // Import chain nodes
    readonly unresolvedImports: string[];    // Unresolved imports
    readonly invalidImports: string[];       // Invalid imports
    readonly deprecatedImports: string[];    // Deprecated imports
    readonly diagnostics: vscode.Diagnostic[]; // Import chain diagnostics
}

/**
 * Import chain node
 */
export interface IImportChainNode {
    readonly documentUri: string;            // Document URI
    readonly importStatement: string;        // Import statement
    readonly resolvedSymbols: string[];      // Resolved symbols
    readonly depth: number;                  // Chain depth
    readonly isValid: boolean;               // Node validity
}

/**
 * Configuration-aware validation result
 */
export interface IConfigAwareValidationResult {
    readonly documentUri: string;            // Document URI
    readonly configState: IConfigurationState; // Configuration state
    readonly enabledSymbols: string[];       // Enabled symbols
    readonly disabledSymbols: string[];      // Disabled symbols
    readonly conditionalDiagnostics: vscode.Diagnostic[]; // Config-dependent diagnostics
    readonly visibilityIssues: IVisibilityIssue[]; // Visibility issues
}

/**
 * Configuration state
 */
export interface IConfigurationState {
    readonly configValues: Map<string, number>; // Configuration values
    readonly affectedDocuments: string[];    // Affected documents
    readonly lastModified: Date;             // Last modification
    readonly version: number;                // Configuration version
}

/**
 * Visibility issue
 */
export interface IVisibilityIssue {
    readonly symbolId: string;               // Symbol ID
    readonly issue: 'hidden' | 'disabled' | 'conditional'; // Issue type
    readonly configKey: string;              // Related config key
    readonly configValue: number;            // Config value
    readonly suggestion: string;             // Fix suggestion
}

/**
 * Revalidation result
 */
export interface IRevalidationResult {
    readonly configKey: string;              // Changed configuration key
    readonly oldValue: number;               // Old value
    readonly newValue: number;               // New value
    readonly affectedDocuments: string[];    // Affected documents
    readonly revalidatedDocuments: IPipelineResult[]; // Revalidation results
    readonly newDiagnostics: vscode.Diagnostic[]; // New diagnostics
    readonly resolvedDiagnostics: vscode.Diagnostic[]; // Resolved diagnostics
}

/**
 * Incremental validation result
 */
export interface IIncrementalValidationResult {
    readonly documentUri: string;            // Document URI
    readonly changes: vscode.TextDocumentContentChangeEvent[]; // Changes
    readonly affectedStages: ValidationStage[]; // Affected stages
    readonly invalidatedCache: string[];     // Invalidated cache entries
    readonly partialResults: IStageResult[]; // Partial stage results
    readonly fullValidationRequired: boolean; // Whether full validation needed
}

/**
 * Validation rule interface
 */
export interface IValidationRule {
    readonly id: string;                     // Rule ID
    readonly name: string;                   // Rule name
    readonly description: string;            // Rule description
    readonly category: string;               // Rule category
    readonly severity: 'error' | 'warning' | 'info'; // Rule severity
    readonly stage: ValidationStage;         // Applicable stage
    readonly fileTypes: string[];            // Applicable file types
    readonly enabled: boolean;               // Whether rule is enabled
    readonly priority: number;               // Rule priority
    readonly configuration: IValidationRuleConfig; // Rule configuration
    
    // Rule execution
    validate(context: IRuleValidationContext): Promise<IRuleValidationResult>;
    supportsContext(context: IRuleValidationContext): boolean;
}



/**
 * Rule suppression
 */
export interface IRuleSuppression {
    readonly type: 'file' | 'line' | 'symbol' | 'range';
    readonly pattern: string;                // Suppression pattern
    readonly reason?: string;                // Suppression reason
}

/**
 * Rule validation context
 */
export interface IRuleValidationContext {
    readonly document: vscode.TextDocument;  // Document being validated
    readonly symbols: ISymbolDefinition[];   // Available symbols
    readonly symbolIndex: ISymbolIndex;     // Symbol index
    readonly configuration: any;            // Configuration state
    readonly imports: any[];                 // Imports
    readonly stage: ValidationStage;         // Current stage
    readonly symbolManager?: any;           // Optional symbol manager for parent symbol registration
}

/**
 * Validation result from a single rule execution
 */
export interface IRuleValidationResult {
    isValid: boolean;
    diagnostics: vscode.Diagnostic[];
    errors: IValidationError[];
    warnings: IValidationWarning[];
    performance: IValidationPerformanceMetrics;
    metadata: IValidationMetadata;
}

/**
 * Pipeline configuration
 */
export interface IPipelineConfiguration {
    readonly enabledStages: ValidationStage[]; // Enabled stages
    readonly stageTimeouts: Map<ValidationStage, number>; // Stage timeouts
    readonly enabledRules: string[];         // Enabled rule IDs
    readonly disabledRules: string[];        // Disabled rule IDs
    readonly maxConcurrency: number;         // Max concurrent validations
    readonly cacheEnabled: boolean;          // Enable result caching
    readonly incrementalValidation: boolean; // Enable incremental validation
    readonly crossFileValidation: boolean;   // Enable cross-file validation
}

/**
 * Pipeline metadata
 */
export interface IPipelineMetadata {
    readonly pipelineVersion: string;        // Pipeline version
    readonly documentVersion: number;        // Document version
    readonly timestamp: Date;                // Validation timestamp
    readonly triggeredBy: 'user' | 'auto' | 'config_change' | 'import_change';
    readonly enabledRules: string[];         // Applied rules
    readonly configurationSnapshot: Record<string, any>; // Config snapshot
}

/**
 * Pipeline performance metrics
 */
export interface IPipelinePerformance {
    readonly totalTime: number;              // Total execution time
    readonly stageTimings: Map<ValidationStage, number>; // Stage timings
    readonly cacheHits: number;              // Cache hits
    readonly cacheMisses: number;            // Cache misses
    readonly memoryUsage: number;            // Memory usage
    readonly documentSize: number;           // Document size
}

/**
 * Cross-file issue
 */
export interface ICrossFileIssue {
    readonly type: 'unresolved_reference' | 'circular_dependency' | 'symbol_conflict' | 'orphaned_import';
    readonly sourceDocument: string;         // Source document
    readonly targetDocument?: string;        // Target document
    readonly symbolName: string;             // Related symbol
    readonly message: string;                // Issue message
    readonly severity: 'error' | 'warning';  // Issue severity
    readonly range: vscode.Range;            // Issue range
}

/**
 * Unresolved reference
 */
export interface IUnresolvedReference {
    readonly symbolName: string;             // Unresolved symbol
    readonly sourceDocument: string;         // Source document
    readonly range: vscode.Range;            // Reference range
    readonly context: string;                // Reference context
    readonly suggestions: string[];          // Fix suggestions
}



/**
 * Orphaned import
 */
export interface IOrphanedImport {
    readonly importStatement: string;        // Import statement
    readonly documentUri: string;            // Document URI
    readonly range: vscode.Range;            // Import range
    readonly reason: 'unused' | 'unresolvable' | 'circular';
}

/**
 * Validation error
 */
export interface IValidationError {
    readonly code: string;                   // Error code
    readonly message: string;                // Error message
    readonly range: vscode.Range;            // Error range
    readonly severity: 'error' | 'warning' | 'info';
    readonly source: string;                 // Error source
    readonly relatedInformation?: vscode.DiagnosticRelatedInformation[];
}

/**
 * Validation warning
 */
export interface IValidationWarning {
    readonly code: string;                   // Warning code
    readonly message: string;                // Warning message
    readonly range: vscode.Range;            // Warning range
    readonly suggestion?: string;            // Improvement suggestion
}

/**
 * Stage metadata
 */
export interface IStageMetadata {
    readonly stageVersion: string;           // Stage version
    readonly appliedRules: string[];         // Applied rules
    readonly skippedRules: string[];         // Skipped rules
    readonly ruleExecutionTimes: Map<string, number>; // Rule timings
}

/**
 * Validation performance metrics
 */
export interface IValidationPerformanceMetrics {
    executionTime: number;
    memoryUsage: number;
    cacheHitRate: number;
    totalValidations?: number;
    averageValidationTime?: number;
    fastestValidation?: number;
    slowestValidation?: number;
    stageMetrics?: Map<any, any>;
}

/**
 * Stage performance metrics
 */
export interface IStagePerformanceMetrics {
    readonly stage: ValidationStage;         // Stage
    readonly executionCount: number;         // Execution count
    readonly averageTime: number;            // Average execution time
    readonly minTime: number;                // Minimum time
    readonly maxTime: number;                // Maximum time
    readonly cacheHitRate: number;           // Cache hit rate for stage
}

/**
 * Workspace performance metrics
 */
export interface IWorkspacePerformanceMetrics {
    readonly totalDocuments: number;         // Total documents
    readonly totalValidationTime: number;    // Total validation time
    readonly averageDocumentTime: number;    // Average per document
    readonly concurrentValidations: number;  // Concurrent validations
    readonly memoryUsage: number;            // Memory usage
}

/**
 * Validation events
 */
export interface IValidationStartedEvent {
    readonly documentUri: string;            // Document URI
    readonly stages: ValidationStage[];      // Stages to execute
    readonly timestamp: Date;                // Start timestamp
}

export interface IValidationCompletedEvent {
    readonly documentUri: string;            // Document URI
    readonly result: IPipelineResult;        // Validation result
    readonly timestamp: Date;                // Completion timestamp
}

export interface IStageCompletedEvent {
    readonly documentUri: string;            // Document URI
    readonly stage: ValidationStage;         // Completed stage
    readonly result: IStageResult;           // Stage result
    readonly timestamp: Date;                // Completion timestamp
} 

// Add missing interface before IRuleValidationResult
export interface IValidationMetadata {
    ruleName: string;
    ruleVersion: string;
    validatedElements: number;
    skippedElements: number;
} 