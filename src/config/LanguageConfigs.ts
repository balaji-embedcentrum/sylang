export interface LanguageConfig {
    id: string;
    aliases: string[];
    extensions: string[];
    keywords: string[];
    snippetFile: string;
    validationRules: string[];
    requiredProperties?: string[];
    validPropertyValues?: Record<string, string[]>;
}

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
    'sylang-productline': {
        id: 'sylang-productline',
        aliases: ['Sylang ProductLine', 'sylang-ple'],
        extensions: ['.ple'],
        keywords: [
            'def', 'productline', 'name', 'description', 'owner', 'tags', 'version', 
            'domain', 'compliance', 'firstrelease', 'region', 'safetylevel'
        ],
        snippetFile: 'productline.json',
        validationRules: ['single-productline', 'required-fields', 'safety-levels', 'def-keyword']
    },
    'sylang-functions': {
        id: 'sylang-functions',
        aliases: ['Sylang Functions', 'sylang-fun'],
        extensions: ['.fun', '.fma'],
        keywords: [
            'def', 'functiongroup', 'function', 'name', 'description', 'category', 'owner', 
            'tags', 'asil', 'partof', 'enables', 'allocatedto', 'feature'
        ],
        snippetFile: 'functions.json',
        validationRules: ['required-fields', 'safety-levels', 'function-structure', 'def-keyword'],
        validPropertyValues: {
            'partof': ['product', 'system', 'subsystem', 'component', 'module', 'unit', 'assembly', 'circuit', 'part'],
            'asil': ['QM', 'A', 'B', 'C', 'D']
        }
    },
    'sylang-features': {
        id: 'sylang-features',
        aliases: ['Sylang Features', 'sylang-fml'],
        extensions: ['.fml'],
        keywords: [
            'def', 'systemfeatures', 'feature', 'mandatory', 'optional', 'alternative', 
            'or', 'name', 'description', 'owner', 'tags', 'safetylevel', 
            'enables', 'constraints', 'requires', 'excludes'
        ],
        snippetFile: 'features.json',
        validationRules: [
            'single-systemfeatures', 'feature-variability', 'constraint-rules',
            'duplicate-features', 'structural-order', 'def-keyword'
        ]
    },
    'sylang-safety': {
        id: 'sylang-safety',
        aliases: ['Sylang Safety', 'sylang-safety'],
        extensions: ['.itm', '.sgl', '.haz', '.rsk', '.fsr'],
        keywords: [
            'def', 'hazardanalysis', 'hazardidentification', 'riskassessment', 
            'safetygoals', 'functionalsafetyrequirements', 'goal', 
            'hazard', 'scenario', 'measure', 'criterion', 'category', 'subsystem', 
            'boundary', 'vehiclestate', 'drivingstate', 'environment', 'assumption', 'principle',
            'itemdef', 'operationalscenarios', 'safetyconcept', 
            'hazardcategories', 'subsystemhazards', 'scenarios', 
            'safetygoalsdef', 'safetymeasures', 'verificationcriteria',
            'name', 'description', 'owner', 'tags', 'severity', 'probability', 
            'controllability', 'verification', 'rationale', 'methodology', 
            'context', 'conditions', 'consequences', 'enabledby', 'enabledby function', 'functions_affected',
            'assessment', 'riskcriteria', 'exposure', 'asilmatrix', 'determination',
            'derivedfrom', 'allocatedto', 'safetylevel', 'asil', 'productline', 
            'systemfeatures', 'systemfunctions', 'subsystems',
            'includes', 'excludes', 'operationalconditions', 'condition', 
            'vehiclestates', 'driverstates', 'environments', 'overallsafetystrategy', 
            'assumptionsofuse', 'UnintendedActivation', 'FailureToActivate', 
            'FailureToRelease', 'PartialFailure', 'DelayedResponse', 'MisleadingIndication',
            'FMEA', 'HAZOP', 'STPA', 'FTA', 'ETA', 'S1', 'S2', 'S3', 
            'E1', 'E2', 'E3', 'E4', 'C1', 'C2', 'C3', 'ASIL-A', 'ASIL-B', 
            'ASIL-C', 'ASIL-D', 'QM', 'A', 'B', 'C', 'D'
        ],
        snippetFile: 'safety.json',
        validationRules: ['required-fields', 'safety-levels', 'safety-structure', 'def-keyword', 'iso26262-compliance']
    },
    'sylang-security': {
        id: 'sylang-security',
        aliases: ['Sylang Security', 'sylang-security'],
        extensions: ['.tra', '.thr', '.sgo', '.sre', '.ast', '.sec'],
        keywords: [
            'security', 'threat', 'asset', 'tara', 'cybersecurity', 'name', 
            'description', 'owner', 'tags', 'safetylevel', 'allocatedto', 
            'derivedfrom', 'satisfies', 'implements'
        ],
        snippetFile: 'security.json',
        validationRules: ['required-fields', 'safety-levels', 'security-structure']
    },
    'sylang-components': {
        id: 'sylang-components',
        aliases: ['Sylang Components', 'sylang-cmp'],
        extensions: ['.cmp', '.sub', '.req'],
        keywords: [
            'def', 'component', 'subsystem', 'interface', 'protocol', 'direction', 
            'voltage', 'name', 'description', 'owner', 'tags', 'safetylevel', 
            'partof', 'implements', 'allocatedto', 'type', 'width', 'range', 
            'frequency', 'baudrate', 'resolution',
            // .req file keywords
            'reqsection', 'requirement', 'source', 'derivedfrom', 'asil', 
            'rationale', 'verificationcriteria', 'status', 'safetygoal',
            // .req enum values
            'functionalsafety', 'functional', 'non-functional', 'performance', 
            'standards', 'legal', 'system', 'software', 'electronics', 'mechanics', 
            'test', 'stakeholder', 'internal', 'supplier', 'customer', 
            'QM', 'A', 'B', 'C', 'D', 'draft', 'review', 'approved'
        ],
        snippetFile: 'components.json',
        validationRules: ['required-fields', 'safety-levels', 'component-structure', 'req-structure']
    },
    'sylang-software': {
        id: 'sylang-software',
        aliases: ['Sylang Software', 'sylang-mod'],
        extensions: ['.mod', '.prt'],
        keywords: [
            'module', 'algorithm', 'service', 'execution', 'timing', 'priority', 
            'name', 'description', 'owner', 'tags', 'safetylevel', 'partof', 
            'implements', 'allocatedto', 'runtime', 'memory', 'cpu', 'schedule', 
            'interrupt', 'task', 'thread', 'process'
        ],
        snippetFile: 'software.json',
        validationRules: ['required-fields', 'safety-levels', 'software-structure']
    },
    'sylang-electronics': {
        id: 'sylang-electronics',
        aliases: ['Sylang Electronics', 'sylang-ckt'],
        extensions: ['.ckt'],
        keywords: [
            'circuit', 'voltage', 'current', 'power', 'frequency', 'package', 
            'name', 'description', 'owner', 'tags', 'safetylevel', 'partof', 
            'implements', 'pin', 'signal', 'analog', 'digital', 'ground', 
            'supply', 'reference', 'differential', 'singleended', 'impedance', 
            'capacitance', 'inductance', 'resistance'
        ],
        snippetFile: 'electronics.json',
        validationRules: ['required-fields', 'safety-levels', 'electronics-structure']
    },
    'sylang-mechanics': {
        id: 'sylang-mechanics',
        aliases: ['Sylang Mechanics', 'sylang-asm'],
        extensions: ['.asm'],
        keywords: [
            'assembly', 'part', 'component', 'mechanism', 'actuator', 'sensor', 
            'bracket', 'housing', 'mounting', 'fastener', 'gear', 'spring', 
            'bearing', 'name', 'description', 'owner', 'tags', 'safetylevel', 
            'partof', 'material', 'dimensions', 'weight', 'tolerance', 'finish', 
            'coating', 'hardness', 'strength', 'temperature_range', 'pressure_rating', 
            'lifecycle', 'maintenance', 'steel', 'aluminum', 'plastic', 'rubber', 
            'titanium', 'carbon_fiber', 'stainless', 'anodized', 'painted', 
            'galvanized', 'static', 'dynamic', 'rotating', 'linear'
        ],
        snippetFile: 'mechanics.json',
        validationRules: ['required-fields', 'safety-levels', 'mechanics-structure']
    }
};

export function getLanguageConfig(languageId: string): LanguageConfig | undefined {
    return LANGUAGE_CONFIGS[languageId];
}

export function getLanguageConfigByExtension(extension: string): LanguageConfig | undefined {
    return Object.values(LANGUAGE_CONFIGS).find(config => 
        config.extensions.includes(extension)
    );
}

export function getAllLanguageIds(): string[] {
    return Object.keys(LANGUAGE_CONFIGS);
}

export function getAllExtensions(): string[] {
    return Object.values(LANGUAGE_CONFIGS).flatMap(config => config.extensions);
} 