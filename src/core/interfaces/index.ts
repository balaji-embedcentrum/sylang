// =============================================================================
// SYLANG CORE INTERFACES - CENTRAL EXPORT
// =============================================================================

// Plugin and Language Interfaces
export * from './ILanguagePlugin';

// Symbol Management Interfaces
export * from './ISymbolManager';

// Configuration Management Interfaces  
export * from './IConfigurationManager';

// Import Management Interfaces
export * from './IImportManager';

// Cache Management Interfaces
export * from './ICacheManager';

// Validation Pipeline Interfaces
export * from './IValidationPipeline';

// =============================================================================
// CONVENIENCE TYPE ALIASES
// =============================================================================

import { 
    ILanguagePlugin, 
    ILanguageValidator, 
    ILanguageParser, 
    ILanguageProvider 
} from './ILanguagePlugin';

import {
    ISymbolManager,
    ISymbolDefinition,
    ISymbolReference,
    IImportInfo,
    SymbolType,
    ReferenceType
} from './ISymbolManager';

import {
    IConfigurationManager,
    ILanguageConfiguration,
    IGlobalConfiguration
} from './IConfigurationManager';

import {
    IImportManager,
    IImportStatement,
    IDependencyGraph
} from './IImportManager';

import {
    ICacheManager,
    ICacheStats
} from './ICacheManager';

import {
    IValidationPipeline,
    ValidationStage,
    IPipelineResult,
    IValidationRule
} from './IValidationPipeline';

// Core Manager Types
export type CoreManagers = {
    symbolManager: ISymbolManager;
    configurationManager: IConfigurationManager;
    importManager: IImportManager;
    cacheManager: ICacheManager;
    validationPipeline: IValidationPipeline;
};

// Plugin Types
export type PluginComponents = {
    parser: ILanguageParser;
    validator: ILanguageValidator;
    provider: ILanguageProvider;
};

// Symbol Types
export type SymbolTypes = 
    | SymbolType.PRODUCT_LINE
    | SymbolType.FEATURE_SET
    | SymbolType.VARIANT_MODEL
    | SymbolType.CONFIG_SET
    | SymbolType.FUNCTION_GROUP
    | SymbolType.REQ_SECTION
    | SymbolType.TEST_SUITE
    | SymbolType.SAFETY_GOAL
    | SymbolType.HAZARD_IDENTIFICATION
    | SymbolType.RISK_ASSESSMENT
    | SymbolType.FAILURE_MODE_ANALYSIS
    | SymbolType.CONTROL_MEASURE
    | SymbolType.FAULT_TREE_ANALYSIS
    | SymbolType.ITEM_DEFINITION;

// Block Types
export type BlockTypes = 
    | SymbolType.BLOCK_SYSTEM
    | SymbolType.BLOCK_SUBSYSTEM
    | SymbolType.BLOCK_COMPONENT
    | SymbolType.BLOCK_SUBCOMPONENT
    | SymbolType.BLOCK_MODULE
    | SymbolType.BLOCK_UNIT
    | SymbolType.BLOCK_ASSEMBLY
    | SymbolType.BLOCK_CIRCUIT
    | SymbolType.BLOCK_PART;

// Sub-Definition Types
export type SubDefinitionTypes = 
    | SymbolType.FEATURE
    | SymbolType.FUNCTION
    | SymbolType.REQUIREMENT
    | SymbolType.TEST_CASE
    | SymbolType.PORT_OUT
    | SymbolType.PORT_IN
    | SymbolType.SAFETY_GOAL_DEF
    | SymbolType.HAZARD
    | SymbolType.RISK
    | SymbolType.FAILURE_MODE
    | SymbolType.PREVENTION
    | SymbolType.DETECTION
    | SymbolType.MITIGATION
    | SymbolType.NODE
    | SymbolType.ITEM;

// File Extension Mappings
export const FILE_EXTENSIONS = {
    PRODUCT_LINE: '.ple',
    FEATURE_MODEL: '.fml',
    VARIANT_MODEL: '.vml',
    VARIANT_CONFIG: '.vcf',
    FUNCTION: '.fun',
    BLOCK: '.blk',
    REQUIREMENT: '.req',
    TEST: '.tst',
    FAILURE_MODE_ANALYSIS: '.fma',
    FAILURE_MODE_CONTROLS: '.fmc',
    FAULT_TREE_ANALYSIS: '.fta',
    ITEM: '.itm',
    HAZARD: '.haz',
    RISK: '.rsk',
    SAFETY_GOAL: '.sgl'
} as const;

// Language ID Mappings
export const LANGUAGE_IDS = {
    PRODUCT_LINE: 'sylang-productline',
    FEATURE_MODEL: 'sylang-feature',
    VARIANT_MODEL: 'sylang-variantmodel',
    VARIANT_CONFIG: 'sylang-variantconfig',
    FUNCTION: 'sylang-function',
    BLOCK: 'sylang-block',
    REQUIREMENT: 'sylang-requirement',
    TEST: 'sylang-test',
    FAILURE_MODE_ANALYSIS: 'sylang-failuremodeanalysis',
    FAILURE_MODE_CONTROLS: 'sylang-failuremodecontrol',
    FAULT_TREE_ANALYSIS: 'sylang-faulttreeanalysis',
    ITEM: 'sylang-item',
    HAZARD: 'sylang-hazard',
    RISK: 'sylang-risk',
    SAFETY_GOAL: 'sylang-safetygoal'
} as const;

// Validation Stage Order
export const VALIDATION_STAGES_ORDER: ValidationStage[] = [
    ValidationStage.PARSING,
    ValidationStage.IMPORT_RESOLUTION,
    ValidationStage.SYNTAX_VALIDATION,
    ValidationStage.REFERENCE_VALIDATION,
    ValidationStage.CONFIGURATION_VALIDATION,
    ValidationStage.SEMANTIC_VALIDATION
];

// Common Property Names (no plurals)
export const COMMON_PROPERTIES = {
    NAME: 'name',
    DESCRIPTION: 'description',
    OWNER: 'owner',
    SAFETYLEVEL: 'safetylevel',
    CONFIG: 'config',
    TAG: 'tag'
} as const;

// Double Keyword Properties
export const DOUBLE_KEYWORD_PROPERTIES = {
    ENABLES_FEATURE: 'enables feature',
    IMPLEMENTS_FUNCTION: 'implements function',
    SATISFIES_REQUIREMENT: 'satisfies requirement',
    ALLOCATEDTO_COMPONENT: 'allocatedto component',
    DERIVEDFROM_REQUIREMENT: 'derivedfrom requirement',
    PARTOF_SYSTEM: 'partof system',
    CONTAINS_SUBSYSTEM: 'contains subsystem',
    VERIFIES_REQUIREMENT: 'verifies requirement'
} as const;

// Safety Levels
export const SAFETY_LEVEL = {
    QM: 'qm',
    ASIL_A: 'asila',
    ASIL_B: 'asilb', 
    ASIL_C: 'asilc',
    ASIL_D: 'asild'
} as const;

// =============================================================================
// UTILITY TYPES AND HELPERS
// =============================================================================

/**
 * Extract the value type from a readonly array or tuple type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract keys from an object type where the value extends a given type
 */
export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Create a type that requires at least one property from T
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
    Pick<T, Exclude<keyof T, Keys>> & 
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

/**
 * Create a readonly version of an object recursively
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Helper type for plugin factory functions
 */
export type PluginFactory<T extends ILanguagePlugin = ILanguagePlugin> = 
    (config: ILanguageConfiguration) => T;

/**
 * Helper type for manager factory functions
 */
export type ManagerFactory<T> = (dependencies: Partial<CoreManagers>) => T;

/**
 * Type guard for symbol types
 */
export const isSymbolType = (value: any): value is SymbolType => {
    return Object.values(SymbolType).includes(value);
};

/**
 * Type guard for validation stages
 */
export const isValidationStage = (value: any): value is ValidationStage => {
    return Object.values(ValidationStage).includes(value);
};

/**
 * Type guard for reference types
 */
export const isReferenceType = (value: any): value is ReferenceType => {
    return Object.values(ReferenceType).includes(value);
};

/**
 * Helper to get file extension for symbol type
 */
export const getFileExtensionForSymbolType = (symbolType: SymbolType): string => {
    switch (symbolType) {
        case SymbolType.PRODUCT_LINE: return FILE_EXTENSIONS.PRODUCT_LINE;
        case SymbolType.FEATURE_SET: return FILE_EXTENSIONS.FEATURE_MODEL;
        case SymbolType.VARIANT_MODEL: return FILE_EXTENSIONS.VARIANT_MODEL;
        case SymbolType.CONFIG_SET: return FILE_EXTENSIONS.VARIANT_CONFIG;
        case SymbolType.FUNCTION_GROUP: return FILE_EXTENSIONS.FUNCTION;
        case SymbolType.BLOCK_SYSTEM:
        case SymbolType.BLOCK_SUBSYSTEM:
        case SymbolType.BLOCK_COMPONENT: return FILE_EXTENSIONS.BLOCK;
        case SymbolType.REQ_SECTION: return FILE_EXTENSIONS.REQUIREMENT;
        case SymbolType.TEST_SUITE: return FILE_EXTENSIONS.TEST;
        case SymbolType.FAILURE_MODE_ANALYSIS: return FILE_EXTENSIONS.FAILURE_MODE_ANALYSIS;
        case SymbolType.CONTROL_MEASURE: return FILE_EXTENSIONS.FAILURE_MODE_CONTROLS;
        case SymbolType.FAULT_TREE_ANALYSIS: return FILE_EXTENSIONS.FAULT_TREE_ANALYSIS;
        case SymbolType.ITEM_DEFINITION: return FILE_EXTENSIONS.ITEM;
        case SymbolType.HAZARD_IDENTIFICATION: return FILE_EXTENSIONS.HAZARD;
        case SymbolType.RISK_ASSESSMENT: return FILE_EXTENSIONS.RISK;
        case SymbolType.SAFETY_GOAL: return FILE_EXTENSIONS.SAFETY_GOAL;
        default: return '.unknown';
    }
};

/**
 * Helper to get language ID for file extension
 */
export const getLanguageIdForExtension = (extension: string): string => {
    switch (extension) {
        case FILE_EXTENSIONS.PRODUCT_LINE: return LANGUAGE_IDS.PRODUCT_LINE;
        case FILE_EXTENSIONS.FEATURE_MODEL: return LANGUAGE_IDS.FEATURE_MODEL;
        case FILE_EXTENSIONS.VARIANT_MODEL: return LANGUAGE_IDS.VARIANT_MODEL;
        case FILE_EXTENSIONS.VARIANT_CONFIG: return LANGUAGE_IDS.VARIANT_CONFIG;
        case FILE_EXTENSIONS.FUNCTION: return LANGUAGE_IDS.FUNCTION;
        case FILE_EXTENSIONS.BLOCK: return LANGUAGE_IDS.BLOCK;
        case FILE_EXTENSIONS.REQUIREMENT: return LANGUAGE_IDS.REQUIREMENT;
        case FILE_EXTENSIONS.TEST: return LANGUAGE_IDS.TEST;
        case FILE_EXTENSIONS.FAILURE_MODE_ANALYSIS: return LANGUAGE_IDS.FAILURE_MODE_ANALYSIS;
        case FILE_EXTENSIONS.FAILURE_MODE_CONTROLS: return LANGUAGE_IDS.FAILURE_MODE_CONTROLS;
        case FILE_EXTENSIONS.FAULT_TREE_ANALYSIS: return LANGUAGE_IDS.FAULT_TREE_ANALYSIS;
        case FILE_EXTENSIONS.ITEM: return LANGUAGE_IDS.ITEM;
        case FILE_EXTENSIONS.HAZARD: return LANGUAGE_IDS.HAZARD;
        case FILE_EXTENSIONS.RISK: return LANGUAGE_IDS.RISK;
        case FILE_EXTENSIONS.SAFETY_GOAL: return LANGUAGE_IDS.SAFETY_GOAL;
        default: return 'sylang-unknown';
    }
}; 