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
        extensions: ['.fun'],
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
    'sylang-failuremodeanalysis': {
        id: 'sylang-failuremodeanalysis',
        aliases: ['Sylang Failure Mode Analysis', 'sylang-fma'],
        extensions: ['.fma'],
        keywords: [
            'def', 'failuremodeanalysis', 'failuremode', 'name', 'description', 'in', 'function',
            'severity', 'occurrence', 'detection', 'rpn', 'auto', 'actionpriority', 'asil',
            'causes', 'effects', 'mitigation', 'high', 'medium', 'low'
        ],
        snippetFile: 'failuremodeanalysis.json',
        validationRules: ['required-fields', 'safety-levels', 'failure-mode-structure', 'def-keyword'],
        validPropertyValues: {
            'actionpriority': ['high', 'medium', 'low'],
            'asil': ['QM', 'A', 'B', 'C', 'D']
        }
    },
    'sylang-failuremodecontrols': {
        id: 'sylang-failuremodecontrols',
        aliases: ['Sylang Failure Mode Controls', 'sylang-fmc'],
        extensions: ['.fmc'],
        keywords: [
            'def', 'controlmeasures', 'prevention', 'detection', 'mitigation', 'name', 'description',
            'implementation', 'verification', 'responsibility', 'scope', 'effectiveness', 'cost',
            'complexity', 'frequency', 'detecttime', 'responsetime', 'coverage', 'independence',
            'maturity', 'asil', 'detectionrating', 'occurrencereduction', 'severityreduction',
            'diagnosticcoverage', 'depends', 'measure', 'internal', 'external', 'high', 'medium',
            'low', 'simple', 'moderate', 'complex', 'continuous', 'periodic', 'monthly', 'quarterly',
            'immediate', 'delayed', 'complete', 'partial', 'mature', 'developing', 'research'
        ],
        snippetFile: 'failuremodecontrols.json',
        validationRules: ['required-fields', 'safety-levels', 'control-measures-structure', 'def-keyword'],
        validPropertyValues: {
            'scope': ['internal', 'external'],
            'effectiveness': ['high', 'medium', 'low'],
            'cost': ['low', 'medium', 'high'],
            'complexity': ['simple', 'moderate', 'complex'],
            'frequency': ['continuous', 'periodic', 'monthly', 'quarterly'],
            'detecttime': ['immediate', 'delayed'],
            'responsetime': ['immediate', 'delayed'],
            'coverage': ['complete', 'partial'],
            'independence': ['high', 'medium', 'low'],
            'maturity': ['mature', 'developing', 'research'],
            'asil': ['QM', 'A', 'B', 'C', 'D']
        }
    },
    'sylang-faulttreeanalysis': {
        id: 'sylang-faulttreeanalysis',
        aliases: ['Sylang Fault Tree Analysis', 'sylang-fta'],
        extensions: ['.fta'],
        keywords: [
            'def', 'faulttree', 'topevent', 'intermediateevent', 'basicevent', 'gate', 'transfer',
            'name', 'description', 'owner', 'reviewers', 'standards', 'analysismethod', 'condition',
            'from', 'to', 'targetfta', 'gatetype', 'severity', 'category', 'asil', 'dormancy',
            'probability', 'exposuretime', 'repairtime', 'inputs', 'outputs', 'item',
            'hazardidentification', 'riskassessment', 'safetygoals', 'productline', 'featureset',
            'functiongroup', 'AND', 'OR', 'XOR', 'NAND', 'NOR', 'NOT', 'INHIBIT', 'PRIORITY_AND',
            'VOTING', 'S0', 'S1', 'S2', 'S3', 'systematic', 'random', 'external', 'common_cause',
            'human_error', 'QM', 'A', 'B', 'C', 'D', 'none', 'low', 'medium', 'high'
        ],
        snippetFile: 'faulttreeanalysis.json',
        validationRules: ['required-fields', 'safety-levels', 'fault-tree-structure', 'def-keyword'],
        validPropertyValues: {
            'gatetype': ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'NOT', 'INHIBIT', 'PRIORITY_AND', 'VOTING'],
            'severity': ['S0', 'S1', 'S2', 'S3'],
            'category': ['systematic', 'random', 'external', 'common_cause', 'human_error'],
            'asil': ['QM', 'A', 'B', 'C', 'D'],
            'dormancy': ['none', 'low', 'medium', 'high']
        }
    },
    'sylang-features': {
        id: 'sylang-features',
        aliases: ['Sylang Features', 'sylang-fml'],
        extensions: ['.fml'],
        keywords: [
            'def', 'featureset', 'feature', 'mandatory', 'optional', 'alternative', 
            'or', 'name', 'description', 'owner', 'tags', 'safetylevel', 
            'enables', 'constraints', 'requires', 'excludes'
        ],
        snippetFile: 'features.json',
        validationRules: [
            'single-featureset', 'feature-variability', 'constraint-rules',
            'duplicate-features', 'structural-order', 'def-keyword'
        ]
    },
    'sylang-variantmodel': {
        id: 'sylang-variantmodel',
        aliases: ['Sylang Variant Model', 'sylang-vml'],
        extensions: ['.vml'],
        keywords: [
            'def', 'variantmodel', 'feature', 'mandatory', 'optional', 'alternative', 'selected'
        ],
        snippetFile: 'variantmodel.json',
        validationRules: [
            'single-variantmodel', 'feature-selection-consistency', 'mandatory-selection-validation', 
            'alternative-selection-validation', 'indentation-validation', 'def-keyword'
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
            'featureset', 'functiongroup', 'subsystems',
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
    },
    'sylang-blocks': {
        id: 'sylang-blocks',
        aliases: ['Sylang Blocks', 'sylang-blk'],
        extensions: ['.blk'],
        keywords: [
            'def', 'block', 'system', 'subsystem', 'component', 'subcomponent', 'module', 'submodule',
            'unit', 'subunit', 'assembly', 'subassembly', 'circuit', 'part', 'name', 'description',
            'owner', 'tags', 'asil', 'contains', 'partof', 'enables', 'implements', 'interfaces',
            'feature', 'function', 'use', 'port', 'type', 'electrical', 'mechanical', 'data',
            'CAN', 'Ethernet', 'hydraulic', 'pneumatic', 'optical', 'thermal', 'audio', 'RF', 'sensor', 'actuator'
        ],
        snippetFile: 'blocks.json',
        validationRules: ['required-fields', 'block-structure', 'def-keyword'],
        validPropertyValues: {
            'asil': ['QM', 'A', 'B', 'C', 'D'],
            'type': ['electrical', 'mechanical', 'data', 'CAN', 'Ethernet', 'hydraulic', 'pneumatic', 'optical', 'thermal', 'audio', 'RF', 'sensor', 'actuator']
        }
    },
    'sylang-test': {
        id: 'sylang-test',
        aliases: ['Sylang Test', 'sylang-tst'],
        extensions: ['.tst'],
        keywords: [
            'def', 'testsuite', 'testcase', 'name', 'description', 'owner', 'tags', 
            'testtype', 'coverage', 'method', 'priority', 'asil', 'verifies', 'requirement',
            'exercises', 'preconditions', 'teststeps', 'step', 'expectedresult', 
            'testresult', 'actualresult', 'executiontime', 'use',
            // Enum values
            'unit', 'integration', 'system', 'acceptance', 'regression', 'smoke',
            'statement', 'branch', 'mcdc', 'function',
            'manual', 'automated', 'hil', 'sil', 'mil', 'pil',
            'pass', 'fail', 'pending', 'inconclusive',
            'critical', 'high', 'medium', 'low',
            'QM', 'A', 'B', 'C', 'D'
        ],
        snippetFile: 'test.json',
        validationRules: ['required-fields', 'test-structure', 'def-keyword'],
        validPropertyValues: {
            'testtype': ['unit', 'integration', 'system', 'acceptance', 'regression', 'smoke'],
            'coverage': ['statement', 'branch', 'mcdc', 'requirement', 'function'],
            'method': ['manual', 'automated', 'hil', 'sil', 'mil', 'pil'],
            'testresult': ['pass', 'fail', 'pending', 'inconclusive'],
            'priority': ['critical', 'high', 'medium', 'low'],
            'asil': ['QM', 'A', 'B', 'C', 'D']
        }
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