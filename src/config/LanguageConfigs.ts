/**
 * Complete Sylang Language Configurations
 * EXACTLY 15 file extensions - no more, no less
 */

export interface SylangLanguageConfig {
    id: string;
    extension: string;
    primaryKeywords: string[];
    secondaryKeywords: string[];
    compoundProperties: string[];
    headerTypes: string[];
    fileLimit: 'unique' | 'multiple';
    allowedImports: string[];
}

/**
 * Complete registry of EXACTLY 15 Sylang file types
 */
export const SYLANG_LANGUAGES: SylangLanguageConfig[] = [
    // 1. Product Line Engineering (.ple)
    {
        id: 'sylang-productline',
        extension: '.ple',
        primaryKeywords: ['def', 'productline'],
        secondaryKeywords: ['domain', 'compliance', 'safetylevel', 'region'],
        compoundProperties: [],
        headerTypes: ['productline'],
        fileLimit: 'unique',
        allowedImports: []
    },
    
    // 2. Feature Modeling (.fml)
    {
        id: 'sylang-features',
        extension: '.fml',
        primaryKeywords: ['def', 'featureset', 'feature'],
        secondaryKeywords: ['mandatory', 'optional', 'alternative', 'or'],
        compoundProperties: ['enables feature'],
        headerTypes: ['featureset', 'feature'],
        fileLimit: 'unique',
        allowedImports: ['productline']
    },
    
    // 3. Variant Model (.vml)
    {
        id: 'sylang-variantmodel', 
        extension: '.vml',
        primaryKeywords: ['def', 'variantmodel', 'variant'],
        secondaryKeywords: [],
        compoundProperties: ['enables feature', 'includes variant'],
        headerTypes: ['variantmodel', 'variant'],
        fileLimit: 'unique',
        allowedImports: ['featureset']
    },
    
    // 4. Variant Configuration (.vcf)
    {
        id: 'sylang-variantconfig',
        extension: '.vcf',
        primaryKeywords: ['def', 'configset', 'config'],
        secondaryKeywords: [],
        compoundProperties: ['enables feature'],
        headerTypes: ['configset', 'config'],
        fileLimit: 'unique',
        allowedImports: ['variantmodel']
    },
    
    // 5. Functions (.fun)
    {
        id: 'sylang-functions',
        extension: '.fun',
        primaryKeywords: ['def', 'functiongroup', 'function'],
        secondaryKeywords: ['category', 'owner'],
        compoundProperties: ['enables feature', 'implements function', 'allocatedto subsystem'],
        headerTypes: ['functiongroup', 'function'],
        fileLimit: 'multiple',
        allowedImports: ['configset', 'featureset']
    },
    
    // 6. Blocks (.blk)
    {
        id: 'sylang-blocks',
        extension: '.blk',
        primaryKeywords: ['def', 'block', 'system', 'subsystem', 'component'],
        secondaryKeywords: [],
        compoundProperties: ['partof system', 'allocatedto subsystem', 'implements function'],
        headerTypes: ['system', 'subsystem', 'component'],
        fileLimit: 'multiple',
        allowedImports: ['functiongroup']
    },
    
    // 7. Requirements (.req)
    {
        id: 'sylang-requirements',
        extension: '.req',
        primaryKeywords: ['def', 'requirement'],
        secondaryKeywords: ['category', 'priority'],
        compoundProperties: ['satisfies requirement', 'derivedfrom requirement', 'allocatedto component', 'verifies function'],
        headerTypes: ['requirement'],
        fileLimit: 'multiple',
        allowedImports: ['functiongroup', 'block']
    },
    
    // 8. Test Specifications (.tst)
    {
        id: 'sylang-test',
        extension: '.tst',
        primaryKeywords: ['def', 'testsuite', 'testcase', 'step'],
        secondaryKeywords: ['priority', 'category'],
        compoundProperties: ['verifies requirement', 'validates function'],
        headerTypes: ['testsuite', 'testcase'],
        fileLimit: 'multiple',
        allowedImports: ['requirement', 'functiongroup']
    },
    
    // 9. Failure Mode Analysis (.fma)
    {
        id: 'sylang-failuremodeanalysis',
        extension: '.fma',
        primaryKeywords: ['def', 'failuremodeanalysis', 'failuremode'],
        secondaryKeywords: ['severity', 'probability'],
        compoundProperties: ['partof system', 'affects function'],
        headerTypes: ['failuremodeanalysis', 'failuremode'],
        fileLimit: 'multiple',
        allowedImports: ['block', 'functiongroup']
    },
    
    // 10. Failure Mode Controls (.fmc)
    {
        id: 'sylang-failuremodecontrols',
        extension: '.fmc',
        primaryKeywords: ['def', 'controlmeasures', 'control'],
        secondaryKeywords: ['effectiveness'],
        compoundProperties: ['mitigates failuremode', 'implements control'],
        headerTypes: ['controlmeasures', 'control'],
        fileLimit: 'multiple',
        allowedImports: ['failuremodeanalysis']
    },
    
    // 11. Fault Tree Analysis (.fta)
    {
        id: 'sylang-faulttreeanalysis',
        extension: '.fta',
        primaryKeywords: ['def', 'faulttreeanalysis', 'faulttree', 'event'],
        secondaryKeywords: ['probability', 'gate'],
        compoundProperties: ['partof system', 'causes event'],
        headerTypes: ['faulttreeanalysis', 'faulttree', 'event'],
        fileLimit: 'multiple',
        allowedImports: ['block', 'functiongroup']
    },
    
    // 12. Items (.itm)
    {
        id: 'sylang-items',
        extension: '.itm',
        primaryKeywords: ['def', 'itemdefinition', 'item'],
        secondaryKeywords: ['lifecycle', 'operationalmode'],
        compoundProperties: ['partof system', 'uses function'],
        headerTypes: ['itemdefinition', 'item'],
        fileLimit: 'multiple',
        allowedImports: ['block', 'functiongroup']
    },
    
    // 13. Hazards (.haz)
    {
        id: 'sylang-hazards',
        extension: '.haz',
        primaryKeywords: ['def', 'hazardidentification', 'hazard'],
        secondaryKeywords: ['severity', 'category'],
        compoundProperties: ['derivedfrom item', 'affects function'],
        headerTypes: ['hazardidentification', 'hazard'],
        fileLimit: 'multiple',
        allowedImports: ['itemdefinition', 'functiongroup']
    },
    
    // 14. Risk Assessment (.rsk)
    {
        id: 'sylang-risk',
        extension: '.rsk',
        primaryKeywords: ['def', 'riskassessment', 'risk'],
        secondaryKeywords: ['exposure', 'controllability'],
        compoundProperties: ['derivedfrom hazard', 'evaluates risk'],
        headerTypes: ['riskassessment', 'risk'],
        fileLimit: 'multiple',
        allowedImports: ['hazardidentification']
    },
    
    // 15. Safety Goals (.sgl)
    {
        id: 'sylang-safetygoals',
        extension: '.sgl',
        primaryKeywords: ['def', 'safetygoals', 'safetygoal'],
        secondaryKeywords: ['asil', 'category'],
        compoundProperties: ['derivedfrom risk', 'allocatedto function'],
        headerTypes: ['safetygoals', 'safetygoal'],
        fileLimit: 'multiple',
        allowedImports: ['riskassessment']
    }
];

/**
 * Get language config by extension
 */
export function getLanguageConfig(extension: string): SylangLanguageConfig | undefined {
    return SYLANG_LANGUAGES.find(lang => lang.extension === extension);
}

/**
 * Get all supported extensions (EXACTLY 15)
 */
export function getSupportedExtensions(): string[] {
    return SYLANG_LANGUAGES.map(lang => lang.extension);
}

/**
 * Check if compound property is valid for language
 */
export function isValidCompoundProperty(extension: string, property: string): boolean {
    const config = getLanguageConfig(extension);
    return config?.compoundProperties.includes(property) || false;
}

/**
 * Get extendable keyword lists for AI/tooling
 */
export const EXTENDABLE_KEYWORDS = {
    PRIMARY_KEYWORDS: SYLANG_LANGUAGES.flatMap(lang => lang.primaryKeywords),
    SECONDARY_KEYWORDS: SYLANG_LANGUAGES.flatMap(lang => lang.secondaryKeywords),
    COMPOUND_PROPERTIES: SYLANG_LANGUAGES.flatMap(lang => lang.compoundProperties),
    HEADER_TYPES: SYLANG_LANGUAGES.flatMap(lang => lang.headerTypes)
}; 