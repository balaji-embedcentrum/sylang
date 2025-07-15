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
            'tags', 'safetylevel', 'partof', 'enables', 'allocatedto', 'feature'
        ],
        snippetFile: 'functions.json',
        validationRules: ['required-fields', 'safety-levels', 'function-structure', 'def-keyword'],
        validPropertyValues: {
            'partof': ['product', 'system', 'subsystem', 'component', 'module', 'unit', 'assembly', 'circuit', 'part'],
            'safetylevel': ['QM', 'A', 'B', 'C', 'D', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D']
        }
    },
    'sylang-failuremodeanalysis': {
        id: 'sylang-failuremodeanalysis',
        aliases: ['Sylang Failure Mode Analysis', 'sylang-fma'],
        extensions: ['.fma'],
        keywords: [
            'def', 'failuremodeanalysis', 'failuremode', 'name', 'description', 'in', 'function',
            'severity', 'occurrence', 'detection', 'rpn', 'auto', 'actionpriority', 'safetylevel',
            'causes', 'effects', 'mitigation', 'high', 'medium', 'low'
        ],
        snippetFile: 'failuremodeanalysis.json',
        validationRules: ['required-fields', 'safety-levels', 'failure-mode-structure', 'def-keyword'],
        validPropertyValues: {
            'actionpriority': ['high', 'medium', 'low'],
            'safetylevel': ['QM', 'A', 'B', 'C', 'D', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D']
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
            'maturity', 'safetylevel', 'detectionrating', 'occurrencereduction', 'severityreduction',
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
            'safetylevel': ['QM', 'A', 'B', 'C', 'D', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D']
        }
    },
    'sylang-faulttreeanalysis': {
        id: 'sylang-faulttreeanalysis',
        aliases: ['Sylang Fault Tree Analysis', 'sylang-fta'],
        extensions: ['.fta'],
        keywords: [
            'def', 'faulttreeanalysis', 'faulttree', 'node', 'name', 'description', 'functiongroup',
            'from', 'to', 'targetfta', 'gatetype', 'severity', 'category', 'safetylevel', 'dormancy',
            'OR', 'AND', 'XOR', 'NOT', 'INHIBIT', 'TRANSFER', 'UNDEVELOPED', 'BASIC', 'INTERMEDIATE',
            'owner', 'tags', 'type', 'function', 'interface', 'lambda', 'probability', 'condition',
            'high', 'medium', 'low'
        ],
        snippetFile: 'faulttreeanalysis.json',
        validationRules: ['required-fields', 'safety-levels', 'fault-tree-structure', 'def-keyword'],
        validPropertyValues: {
            'gatetype': ['OR', 'AND', 'XOR', 'NOT', 'INHIBIT', 'TRANSFER', 'UNDEVELOPED', 'BASIC', 'INTERMEDIATE'],
            'severity': ['high', 'medium', 'low'],
            'category': ['high', 'medium', 'low'],
            'dormancy': ['high', 'medium', 'low'],
            'safetylevel': ['QM', 'A', 'B', 'C', 'D', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D'],
            'lambda': ['high', 'medium', 'low'],
            'probability': ['high', 'medium', 'low']
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
            'def', 'variantmodel', 'variant', 'name', 'description', 'owner', 
            'tags', 'safetylevel', 'configuration', 'feature', 'variation', 
            'enables', 'constraints', 'requires', 'excludes'
        ],
        snippetFile: 'variantmodel.json',
        validationRules: [
            'single-variantmodel', 'variant-configuration', 'constraint-rules',
            'duplicate-variants', 'structural-order', 'def-keyword'
        ]
    },
    'sylang-safety': {
        id: 'sylang-safety',
        aliases: ['Sylang Safety', 'sylang-safety'],
        extensions: ['.itm', '.sgl', '.haz', '.rsk'],
        keywords: [
            'def', 'hazardidentification', 'hazard', 'safetygoal', 'goal', 'safetylevel', 
            'riskassessment', 'riskcriteria', 'riskdetermination', 'asildetermination', 
            'asilassessment', 'exposure', 'asilmatrix', 'determination',
            'derivedfrom', 'allocatedto', 'safetylevel', 'productline',
            'functiongroup', 'category', 'consequences', 'controllability', 'severity',
            'cause', 'effect', 'context', 'conditions', 'functions_affected',
            'name', 'description', 'owner', 'tags', 'S1', 'S2', 'S3', 'S4',
            'E1', 'E2', 'E3', 'E4', 'C1', 'C2', 'C3', 'ASIL-A', 'ASIL-B',
            'ASIL-C', 'ASIL-D', 'QM', 'A', 'B', 'C', 'D'
        ],
        snippetFile: 'safety.json',
        validationRules: ['required-fields', 'safety-levels', 'safety-structure', 'def-keyword'],
        validPropertyValues: {
            'severity': ['S1', 'S2', 'S3', 'S4'],
            'exposure': ['E1', 'E2', 'E3', 'E4'],
            'controllability': ['C1', 'C2', 'C3'],
            'safetylevel': ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM', 'A', 'B', 'C', 'D'],
            'category': ['systematic', 'random', 'software', 'hardware', 'human-factor', 'operational', 'environmental']
        }
    },
    'sylang-security': {
        id: 'sylang-security',
        aliases: ['Sylang Security', 'sylang-sec'],
        extensions: ['.tra', '.thr', '.sgo', '.sre', '.ast', '.sec'],
        keywords: [
            'def', 'securityanalysis', 'threat', 'asset', 'vulnerability', 'attack', 
            'threatsource', 'impact', 'likelihood', 'risk', 'securitygoal', 'securityrequirement',
            'safetylevel', 'name', 'description', 'owner', 'tags', 'category', 'tara',
            'cybersecurity', 'confidentiality', 'integrity', 'availability', 'authentication',
            'authorization', 'non-repudiation', 'accountability', 'high', 'medium', 'low',
            'critical', 'major', 'minor', 'negligible', 'certain', 'likely', 'possible',
            'unlikely', 'rare', 'derivedfrom', 'allocatedto', 'functiongroup', 'productline'
        ],
        snippetFile: 'security.json',
        validationRules: ['required-fields', 'security-structure', 'def-keyword'],
        validPropertyValues: {
            'impact': ['critical', 'major', 'minor', 'negligible'],
            'likelihood': ['certain', 'likely', 'possible', 'unlikely', 'rare'],
            'category': ['confidentiality', 'integrity', 'availability', 'authentication', 'authorization', 'non-repudiation', 'accountability']
        }
    },
    'sylang-components': {
        id: 'sylang-components',
        aliases: ['Sylang Components', 'sylang-req'],
        extensions: ['.req'],
        keywords: [
            'def', 'requirementspecification', 'reqsection', 'requirement', 'name', 'description',
            'reqsection', 'requirement', 'source', 'derivedfrom', 'safetylevel',
            'allocatedto', 'functiongroup', 'productline', 'owner', 'tags',
            'priority', 'type', 'status', 'rationale', 'acceptance', 'verification',
            'high', 'medium', 'low', 'functional', 'performance', 'interface', 'design',
            'implementation', 'safety', 'security', 'reliability', 'usability', 'maintainability',
            'portability', 'draft', 'review', 'approved', 'implemented', 'tested', 'customer',
            'user', 'system', 'software', 'hardware', 'derived', 'allocated', 'shall',
            'should', 'may', 'will', 'must', 'can', 'cannot', 'A', 'B', 'C', 'D', 'QM',
            'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'Bidirectional', 'Input', 'Output',
            'Communication', 'Digital', 'Analog', 'SPI', 'I2C', 'CAN', 'LIN', 'CMOS'
        ],
        snippetFile: 'components.json',
        validationRules: ['required-fields', 'safety-levels', 'requirements-structure', 'def-keyword'],
        validPropertyValues: {
            'priority': ['high', 'medium', 'low'],
            'type': ['functional', 'performance', 'interface', 'design', 'implementation', 'safety', 'security', 'reliability', 'usability', 'maintainability', 'portability'],
            'status': ['draft', 'review', 'approved', 'implemented', 'tested'],
            'source': ['customer', 'user', 'system', 'software', 'hardware', 'derived', 'allocated'],
            'safetylevel': ['QM', 'A', 'B', 'C', 'D', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D']
        }
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
            'owner', 'tags', 'safetylevel', 'contains', 'partof', 'enables', 'implements', 'interfaces',
            'feature', 'function', 'use', 'port', 'type', 'electrical', 'mechanical', 'data',
            'CAN', 'Ethernet', 'hydraulic', 'pneumatic', 'optical', 'thermal', 'audio', 'RF', 'sensor', 'actuator'
        ],
        snippetFile: 'blocks.json',
        validationRules: ['required-fields', 'safety-levels', 'block-structure', 'def-keyword'],
        validPropertyValues: {
            'type': ['electrical', 'mechanical', 'data', 'CAN', 'Ethernet', 'hydraulic', 'pneumatic', 'optical', 'thermal', 'audio', 'RF', 'sensor', 'actuator'],
            'safetylevel': ['QM', 'A', 'B', 'C', 'D', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D'],
            'interfaces': ['electrical', 'mechanical', 'data', 'CAN', 'Ethernet', 'hydraulic', 'pneumatic', 'optical', 'thermal', 'audio', 'RF', 'sensor', 'actuator']
        }
    },
    'sylang-test': {
        id: 'sylang-test',
        aliases: ['Sylang Test', 'sylang-tst'],
        extensions: ['.tst'],
        keywords: [
            'def', 'testsuite', 'testcase', 'name', 'description', 'owner', 'tags', 
            'testtype', 'coverage', 'method', 'priority', 'safetylevel', 'verifies', 'requirement',
            'exercises', 'preconditions', 'teststeps', 'step', 'expectedresult', 
            'testresult', 'actualresult', 'executiontime', 'use',
            'integration', 'unit', 'system', 'acceptance', 'regression', 'performance',
            'security', 'safety', 'usability', 'compatibility', 'scalability', 'reliability',
            'statement', 'branch', 'condition', 'mcdc', 'path', 'hil', 'sil', 'mil',
            'manual', 'automated', 'critical', 'high', 'medium', 'low', 'pass', 'fail',
            'blocked', 'skipped', 'pending', 'in-progress', 'A', 'B', 'C', 'D', 'QM', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D'
        ],
        snippetFile: 'test.json',
        validationRules: ['required-fields', 'safety-levels', 'test-structure', 'def-keyword'],
        validPropertyValues: {
            'testtype': ['integration', 'unit', 'system', 'acceptance', 'regression', 'performance', 'security', 'safety', 'usability', 'compatibility', 'scalability', 'reliability'],
            'coverage': ['statement', 'branch', 'condition', 'mcdc', 'path'],
            'method': ['hil', 'sil', 'mil', 'manual', 'automated'],
            'priority': ['critical', 'high', 'medium', 'low'],
            'testresult': ['pass', 'fail', 'blocked', 'skipped', 'pending', 'in-progress'],
            'safetylevel': ['QM', 'A', 'B', 'C', 'D', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D']
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