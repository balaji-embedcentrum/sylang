import * as vscode from 'vscode';

// =============================================================================
// KEYWORD SYSTEM INTERFACES
// =============================================================================

/**
 * Types of keywords in the Sylang system
 */
export enum KeywordType {
    // Definition keywords
    PRIMARY_DEF = 'primary_def',           // def, header types
    SUB_DEF = 'sub_def',                   // sub definition types
    
    // Property keywords  
    SIMPLE_PROPERTY = 'simple_property',   // name, description, owner
    COMPOUND_PROPERTY = 'compound_property', // enables feature, implements function
    
    // Value keywords
    ENUM_VALUE = 'enum_value',             // ASIL-A, mandatory, high
    REFERENCE_VALUE = 'reference_value',    // identifiers that reference other symbols
    
    // Import keywords
    IMPORT_KEYWORD = 'import_keyword',     // use
    
    // Context keywords
    SECTION_KEYWORD = 'section_keyword',   // operationalscenarios, vehiclestates
    MODIFIER_KEYWORD = 'modifier_keyword'  // mandatory, optional, alternative
}

/**
 * Where a keyword can be used
 */
export interface KeywordContext {
    fileExtensions: string[];              // Which file types support this keyword
    parentContexts: string[];              // Valid parent contexts (e.g., inside 'requirement')
    allowedDepth: number[];                // Valid indentation levels (0 = root level)
    precedingKeywords?: string[];          // Keywords that must/can come before this one
    followingKeywords?: string[];          // Keywords that must/can come after this one
}

/**
 * How a keyword should be validated
 */
export interface KeywordValidation {
    required: boolean;                     // Is this keyword required in its context?
    valueType: KeywordValueType;          // Type of value that follows the keyword
    valuePattern?: string;                 // Regex pattern for value validation
    enumValues?: string[];                 // Valid enum values (for enum types)
    referenceTypes?: string[];             // Types of symbols this can reference
    customValidator?: string;              // Name of custom validation function
}

/**
 * Types of values that can follow keywords
 */
export enum KeywordValueType {
    NONE = 'none',                        // No value (standalone keyword)
    STRING = 'string',                    // Quoted string value
    IDENTIFIER = 'identifier',            // Single identifier (PascalCase)
    IDENTIFIER_LIST = 'identifier_list',  // Comma-separated identifiers
    ENUM = 'enum',                        // Predefined enum value
    NUMBER = 'number',                    // Numeric value
    BOOLEAN = 'boolean',                  // true/false
    REFERENCE = 'reference',              // Reference to another symbol
    REFERENCE_LIST = 'reference_list',    // List of symbol references
    COMPOUND = 'compound'                 // Complex value with secondary keywords
}

/**
 * Complete keyword definition
 */
export interface KeywordDefinition {
    id: string;                           // Unique keyword ID
    keyword: string;                      // The actual keyword text
    type: KeywordType;                    // Type of keyword
    context: KeywordContext;              // Where it can be used
    validation: KeywordValidation;        // How to validate it
    
    // Display and documentation
    displayName: string;                  // Human-readable name
    description: string;                  // What this keyword does
    examples: string[];                   // Usage examples
    
    // Compound keyword support
    secondaryKeywords?: string[];         // Valid secondary keywords (for compound)
    syntaxPattern?: string;               // Full syntax pattern
    
    // Extension metadata
    definedBy: string;                    // Which extension/plugin defined this
    version: string;                      // Version of the definition
    tags?: string[];                      // Classification tags
}

/**
 * Keyword extension for adding new keywords at runtime
 */
export interface KeywordExtension {
    extensionId: string;                  // Unique extension ID
    extensionName: string;                // Display name
    version: string;                      // Extension version
    keywords: KeywordDefinition[];       // Keywords defined by this extension
    dependencies?: string[];              // Required extensions
}

/**
 * Central registry for all keywords
 */
export interface IKeywordRegistry {
    // Core operations
    registerKeyword(definition: KeywordDefinition): void;
    registerExtension(extension: KeywordExtension): Promise<void>;
    unregisterExtension(extensionId: string): void;
    
    // Keyword retrieval
    getKeyword(keywordId: string): KeywordDefinition | undefined;
    getKeywordByText(keyword: string, context?: Partial<KeywordContext>): KeywordDefinition[];
    getKeywordsOfType(type: KeywordType): KeywordDefinition[];
    getKeywordsForContext(fileExtension: string, parentContext?: string): KeywordDefinition[];
    
    // Validation support
    validateKeywordUsage(keyword: string, value: string, context: KeywordUsageContext): KeywordValidationResult;
    getCompoundKeywords(): KeywordDefinition[];
    getEnumValues(enumType: string): string[];
    
    // Extension management
    getLoadedExtensions(): KeywordExtension[];
    reloadExtensions(): Promise<void>;
    
    // Dynamic updates
    onKeywordAdded: vscode.Event<KeywordDefinition>;
    onKeywordRemoved: vscode.Event<string>;
    onExtensionLoaded: vscode.Event<KeywordExtension>;
}

/**
 * Context for keyword usage validation
 */
export interface KeywordUsageContext {
    document: vscode.TextDocument;
    line: number;
    character: number;
    fileExtension: string;
    parentContext?: string;
    indentLevel: number;
    precedingKeywords: string[];
}

/**
 * Result of keyword validation
 */
export interface KeywordValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions?: string[];
    expectedValueType?: KeywordValueType;
    validEnumValues?: string[];
}

/**
 * Keyword lookup query
 */
export interface KeywordQuery {
    text?: string;                        // Keyword text to match
    type?: KeywordType;                   // Type of keyword
    fileExtension?: string;               // Target file extension
    parentContext?: string;               // Parent context
    tags?: string[];                      // Required tags
}

// =============================================================================
// BUILT-IN KEYWORD CATEGORIES
// =============================================================================

/**
 * Categories for organizing keywords
 */
export enum KeywordCategory {
    CORE = 'core',                        // Core language keywords (def, use)
    STRUCTURE = 'structure',              // Structural keywords (header types, sub types)
    PROPERTIES = 'properties',            // Property keywords (name, description)
    RELATIONSHIPS = 'relationships',      // Relationship keywords (enables, implements)
    SAFETY = 'safety',                    // Safety-related keywords (safetylevel, ASIL)
    LIFECYCLE = 'lifecycle',              // Lifecycle keywords (mandatory, optional)
    INDUSTRY = 'industry',                // Industry-specific keywords
    CUSTOM = 'custom'                     // User-defined keywords
}

/**
 * Keyword scope - where keywords apply
 */
export enum KeywordScope {
    GLOBAL = 'global',                    // Available everywhere
    FILE_TYPE = 'file_type',              // Available in specific file types
    CONTEXT = 'context',                  // Available in specific contexts
    PARENT = 'parent'                     // Available under specific parents
} 