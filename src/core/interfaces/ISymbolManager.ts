import * as vscode from 'vscode';

// =============================================================================
// SYMBOL MANAGEMENT INTERFACES
// =============================================================================

/**
 * Symbol manager interface for global symbol table and cross-file resolution
 */
export interface ISymbolManager {
    // Document-level operations
    indexDocument(document: vscode.TextDocument, result: IParsingResult): Promise<void>;
    removeDocument(documentUri: string): Promise<void>;
    
    // Symbol operations
    getSymbol(name: string, documentUri?: string): ISymbolDefinition | undefined;
    getSymbolsInDocument(documentUri: string): ISymbolDefinition[];
    getSymbolsByType(symbolType: SymbolType): ISymbolDefinition[];
    findReferences(symbolName: string, includeDeclaration?: boolean): ISymbolReference[];
    
    // Import operations
    resolveImport(importInfo: IImportInfo, fromDocument: string): ISymbolDefinition[];
    getAvailableSymbols(documentUri: string): ISymbolDefinition[];
    getDocumentImports(documentUri: string): IImportInfo[];
    
    // Hierarchy operations
    getChildSymbols(parentSymbolId: string): ISymbolDefinition[];
    getParentSymbol(childSymbolId: string): ISymbolDefinition | undefined;
    getSymbolHierarchy(symbolId: string): ISymbolHierarchy;
    
    // Workspace operations
    buildWorkspaceIndex(): Promise<void>;
    getWorkspaceSymbols(): ISymbolIndex;
    refreshSymbol(symbolId: string): Promise<void>;
    
    // Configuration integration
    updateSymbolVisibility(symbolId: string, isVisible: boolean): void;
    getVisibleSymbols(documentUri: string): ISymbolDefinition[];
    
    // Event handling
    onSymbolChanged(listener: (event: ISymbolChangeEvent) => void): vscode.Disposable;
    onSymbolVisibilityChanged(listener: (event: ISymbolVisibilityEvent) => void): vscode.Disposable;
}

/**
 * Symbol index for efficient lookups
 */
export interface ISymbolIndex {
    readonly symbols: Map<string, ISymbolDefinition[]>;
    readonly references: Map<string, ISymbolReference[]>;
    readonly imports: Map<string, IImportInfo[]>;
    readonly hierarchy: Map<string, string[]>; // parentId -> childIds
    readonly lastUpdated: Date;
    version: number;                         // Version (mutable)
}

/**
 * Symbol definition with complete metadata
 */
export interface ISymbolDefinition {
    readonly id: string;                    // Unique identifier
    readonly name: string;                  // Display name
    readonly type: SymbolType;              // Symbol type
    readonly fileUri: string;               // Defining file
    readonly location: vscode.Location;     // Definition location
    readonly range: vscode.Range;           // Definition range
    
    // Hierarchy
    readonly parentSymbol?: string;         // Parent symbol ID (for sub-definitions)
    readonly childSymbols: string[];        // Child symbol IDs
    readonly containerSymbol?: string;      // Container symbol (for nested definitions)
    
    // Import/Export
    readonly isExported: boolean;           // Available to importing files
    readonly importedFrom?: string;         // Source file if imported
    readonly importStatement?: IImportInfo; // Original import statement
    
    // Configuration
    readonly configKey?: string;            // Configuration key if configurable
    readonly isVisible: boolean;            // Current visibility based on config
    readonly isEnabled: boolean;            // Whether symbol is enabled (not grayed)
    
    // Properties and metadata
    readonly properties: Map<string, any>;  // Symbol properties
    readonly safetylevel?: string;          // ASIL level if applicable
    readonly description?: string;          // Description if available
    readonly owner?: string;                // Owner if specified
    readonly tags?: string[];               // Tags if specified
    readonly metadata: ISymbolMetadata;     // Symbol metadata
}

/**
 * Symbol reference with context
 */
export interface ISymbolReference {
    readonly id: string;                    // Unique reference ID
    readonly name: string;                  // Referenced symbol name
    readonly symbolId: string;              // Referenced symbol ID
    readonly location: vscode.Location;     // Reference location
    readonly range: vscode.Range;           // Reference range
    readonly context: string;               // Reference context
    readonly referenceType: ReferenceType; // Type of reference
    readonly property?: string;             // Property name if property reference
    readonly documentUri: string;           // Document containing reference
}

/**
 * Import information with resolution details
 */
export interface IImportInfo {
    readonly keyword: string;               // 'block', 'featureset', etc.
    readonly subkeyword?: string;          // 'system', 'subsystem', etc.
    readonly identifiers: string[];         // Imported identifiers
    readonly location: vscode.Location;     // Import statement location
    readonly range: vscode.Range;           // Import statement range
    readonly resolvedSymbols: string[];     // Resolved symbol IDs
    readonly unresolvedIdentifiers: string[]; // Unresolved identifiers
    readonly documentUri: string;           // Document containing import
    readonly isResolved: boolean;           // Whether import is fully resolved
    readonly errors: IImportError[];        // Import resolution errors
}

/**
 * Symbol metadata
 */
export interface ISymbolMetadata {
    readonly pluginId: string;              // Plugin that created symbol
    readonly documentUri: string;           // Document containing symbol
    readonly version: number;               // Symbol version
    readonly lastModified: Date;            // Last modification time
    readonly checksum: string;              // Content checksum
    readonly dependencies: string[];        // Symbol dependencies
    readonly dependents: string[];          // Symbols depending on this
}

/**
 * Symbol hierarchy information
 */
export interface ISymbolHierarchy {
    readonly root: ISymbolDefinition;       // Root symbol
    readonly ancestors: ISymbolDefinition[]; // Ancestor symbols
    readonly descendants: ISymbolDefinition[]; // Descendant symbols
    readonly siblings: ISymbolDefinition[];  // Sibling symbols
    readonly depth: number;                 // Hierarchy depth
}

/**
 * Symbol change event
 */
export interface ISymbolChangeEvent {
    readonly type: 'added' | 'updated' | 'removed';
    readonly symbolId: string;
    readonly symbol?: ISymbolDefinition;
    readonly oldSymbol?: ISymbolDefinition;
    readonly documentUri: string;
    readonly timestamp: Date;
}

/**
 * Symbol visibility change event
 */
export interface ISymbolVisibilityEvent {
    readonly symbolId: string;
    readonly isVisible: boolean;
    readonly reason: 'configuration' | 'import' | 'manual';
    readonly configKey?: string;
    readonly timestamp: Date;
}

/**
 * Import error information
 */
export interface IImportError {
    readonly type: 'unresolved' | 'circular' | 'invalid' | 'not_exported';
    readonly message: string;
    readonly range: vscode.Range;
    readonly identifier?: string;
    readonly suggestion?: string;
}

/**
 * Parsing result from language plugins
 */
export interface IParsingResult {
    readonly documentUri: string;
    readonly symbols: ISymbolDefinition[];
    readonly references: ISymbolReference[];
    readonly imports: IImportInfo[];
    readonly syntax: ISyntaxTree;
    readonly errors: IParsingError[];
    readonly metadata: IParsingMetadata;
}

/**
 * Syntax tree representation
 */
export interface ISyntaxTree {
    readonly root: ISyntaxNode;
    readonly nodes: ISyntaxNode[];
    readonly version: number;
    readonly documentUri: string;
}

/**
 * Individual syntax node
 */
export interface ISyntaxNode {
    readonly id: string;                    // Unique node ID
    readonly type: string;                  // Node type
    readonly range: vscode.Range;           // Node range
    readonly text: string;                  // Node text
    readonly children: ISyntaxNode[];       // Child nodes
    readonly parent?: ISyntaxNode;          // Parent node
    readonly properties: Record<string, any>; // Node properties
    readonly metadata: Record<string, any>; // Node metadata
}

/**
 * Parsing error information
 */
export interface IParsingError {
    readonly id: string;                    // Unique error ID
    readonly type: 'syntax' | 'semantic' | 'import' | 'reference';
    readonly message: string;               // Error message
    readonly range: vscode.Range;           // Error range
    readonly severity: 'error' | 'warning' | 'info';
    readonly code?: string;                 // Error code
    readonly source?: string;               // Error source
    readonly relatedInformation?: vscode.DiagnosticRelatedInformation[];
}

/**
 * Parsing metadata
 */
export interface IParsingMetadata {
    readonly parserId: string;              // Parser ID
    readonly version: string;               // Parser version
    readonly parseTime: number;             // Parse time in ms
    readonly symbolCount: number;           // Number of symbols parsed
    readonly referenceCount: number;        // Number of references parsed
    readonly importCount: number;           // Number of imports parsed
    readonly errorCount: number;            // Number of errors
    readonly warningCount: number;          // Number of warnings
}

/**
 * Symbol kinds (complete enumeration for all Sylang types)
 */
export enum SymbolType {
    // Header Symbols (top-level containers)
    PRODUCT_LINE = 'productline',
    FEATURE_SET = 'featureset', 
    VARIANT_MODEL = 'variantmodel',
    CONFIG_SET = 'configset',
    FUNCTION_GROUP = 'functiongroup',
    REQ_SECTION = 'reqsection',
    TEST_SUITE = 'testsuite',
    SAFETY_GOAL = 'safetygoal',
    HAZARD_IDENTIFICATION = 'hazardidentification',
    RISK_ASSESSMENT = 'riskassessment',
    FAILURE_MODE_ANALYSIS = 'failuremodeanalysis',
    CONTROL_MEASURE = 'controlmeasure',
    FAULT_TREE_ANALYSIS = 'faulttreeanalysis',
    ITEM_DEFINITION = 'itemdefinition',
    
    // Block Symbols (hierarchical)
    BLOCK_SYSTEM = 'block.system',
    BLOCK_SUBSYSTEM = 'block.subsystem', 
    BLOCK_COMPONENT = 'block.component',
    BLOCK_SUBCOMPONENT = 'block.subcomponent',
    BLOCK_MODULE = 'block.module',
    BLOCK_UNIT = 'block.unit',
    BLOCK_ASSEMBLY = 'block.assembly',
    BLOCK_CIRCUIT = 'block.circuit',
    BLOCK_PART = 'block.part',
    
    // Sub-Definition Symbols
    FEATURE = 'feature',
    FUNCTION = 'function', 
    REQUIREMENT = 'requirement',
    TEST_CASE = 'testcase',
    PORT_OUT = 'port.out',
    PORT_IN = 'port.in',
    SAFETY_GOAL_DEF = 'safetygoal.def',
    HAZARD = 'hazard',
    RISK = 'risk',
    FAILURE_MODE = 'failuremode',
    PREVENTION = 'prevention',
    DETECTION = 'detection',
    MITIGATION = 'mitigation',
    NODE = 'node',
    ITEM = 'item',
    
    // Configuration Symbols
    CONFIG = 'config',
    ENUM_SET = 'enumset',
    ENUM_VALUE = 'enumvalue',
    
    // Property Symbols
    PROPERTY = 'property',
    INTERFACE = 'interface'
}

/**
 * Reference types
 */
export enum ReferenceType {
    DECLARATION = 'declaration',
    READ = 'read',
    WRITE = 'write',
    IMPORT = 'import',
    INHERITANCE = 'inheritance',
    IMPLEMENTATION = 'implementation',
    CONFIGURATION = 'configuration',
    PROPERTY_REFERENCE = 'property_reference'
} 