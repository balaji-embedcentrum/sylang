import * as vscode from 'vscode';

/**
 * MINIMAL NEW MODULAR SYSTEM - Demonstrates modular property validation
 */

// =============================================================================
// MODULAR PROPERTY CONFIGURATION
// =============================================================================

class ModularPropertyManager {
    /**
     * 🎯 THIS IS WHERE YOU EXTEND SIMPLE (FLAT) KEYWORDS!
     * These are properties that take direct values: name "MyName", description "My description"
     */
    getValidPropertiesForContext(languageId: string, context: string): string[] {
        const contextSpecificProperties: Record<string, Record<string, string[]>> = {
            'sylang-requirement': {
                'reqsection': ['name', 'description'],
                'requirement': [
                    // Simple properties (keyword + direct value)
                    'name', 'description', 'type', 'source', 'derivedfrom', 
                    'safetylevel', 'rationale', 'verificationcriteria', 'status'
                    // 🔧 ADD NEW SIMPLE REQUIREMENT PROPERTIES HERE!
                    // 'priority', 'version', 'category'
                    // NOTE: Don't add compound properties here! Use getCompoundPropertyDefinitions instead.
                ]
            },
            'sylang-block': {
                'block': [
                    // Simple properties (keyword + direct value)  
                    'name', 'description', 'owner', 'tags', 'safetylevel', 'config'
                    // 🔧 ADD NEW SIMPLE BLOCK PROPERTIES HERE!
                    // 'version', 'manufacturer', 'location'
                    // NOTE: Don't add compound properties here! Use getCompoundPropertyDefinitions instead.
                ],
                'port': ['name', 'description', 'type', 'owner', 'tags', 'safetylevel', 'config']
            },
            'sylang-function': {
                'functiongroup': ['name', 'description', 'owner', 'tags', 'safetylevel'],
                'function': [
                    // Simple properties (keyword + direct value)
                    'name', 'description', 'category', 'owner', 'tags', 'safetylevel', 'config'
                    // 🔧 ADD NEW SIMPLE FUNCTION PROPERTIES HERE!
                    // 'complexity', 'performance', 'priority'
                    // NOTE: Don't add compound properties here! Use getCompoundPropertyDefinitions instead.
                ]
            }
            // 🔧 ADD NEW LANGUAGE CONTEXTS HERE!
            // 'sylang-newsystem': {
            //     'newcontext': ['name', 'description', 'your_simple_properties']
            // }
        };
        
        const languageContexts = contextSpecificProperties[languageId];
        if (languageContexts && languageContexts[context]) {
            return languageContexts[context];
        }
        
        return ['name', 'description']; // Fallback
    }

    /**
     * 🎯 THIS IS WHERE YOU DEFINE COMPOUND PROPERTIES WITH SECONDARY KEYWORDS!
     * These are properties that require secondary keywords: implements function, enables feature, etc.
     */
    getCompoundPropertyDefinitions(languageId: string, context: string): Record<string, CompoundPropertyDef> {
        const definitions: Record<string, CompoundPropertyDef> = {};
        
        switch (languageId) {
            case 'sylang-requirement':
                if (context === 'requirement') {
                    definitions['implements'] = {
                        primaryKeyword: 'implements',
                        secondaryKeywords: ['function'],
                        valueType: 'identifier-list',
                        syntax: 'implements function <FunctionList>'
                    };
                    definitions['allocatedto'] = {
                        primaryKeyword: 'allocatedto',
                        secondaryKeywords: ['component', 'subsystem'],
                        valueType: 'identifier-list',
                        syntax: 'allocatedto component <ComponentList>'
                    };
                    // 🔧 ADD NEW COMPOUND REQUIREMENT PROPERTIES HERE!
                    // definitions['traces'] = {
                    //     primaryKeyword: 'traces',
                    //     secondaryKeywords: ['requirement', 'goal'],
                    //     valueType: 'identifier-list',
                    //     syntax: 'traces requirement <RequirementList>'
                    // };
                }
                break;
                
            case 'sylang-block':
                if (context === 'block') {
                    definitions['implements'] = {
                        primaryKeyword: 'implements',
                        secondaryKeywords: ['function'],
                        valueType: 'identifier-list',
                        syntax: 'implements function <FunctionList>'
                    };
                    definitions['enables'] = {
                        primaryKeyword: 'enables',
                        secondaryKeywords: ['feature'],
                        valueType: 'identifier-list',
                        syntax: 'enables feature <FeatureList>'
                    };
                    definitions['contains'] = {
                        primaryKeyword: 'contains',
                        secondaryKeywords: ['subsystem', 'component', 'module'],
                        valueType: 'identifier-list',
                        syntax: 'contains subsystem <SubsystemList>'
                    };
                    definitions['partof'] = {
                        primaryKeyword: 'partof',
                        secondaryKeywords: ['system', 'subsystem'],
                        valueType: 'identifier',
                        syntax: 'partof system <SystemName>'
                    };
                    // 🔧 ADD NEW COMPOUND BLOCK PROPERTIES HERE!
                    // definitions['connects'] = {
                    //     primaryKeyword: 'connects',
                    //     secondaryKeywords: ['port', 'interface'],
                    //     valueType: 'identifier-list',
                    //     syntax: 'connects port <PortList>'
                    // };
                }
                break;
                
            case 'sylang-function':
                if (context === 'function') {
                    definitions['enables'] = {
                        primaryKeyword: 'enables',
                        secondaryKeywords: ['feature'],
                        valueType: 'identifier-list',
                        syntax: 'enables feature <FeatureList>'
                    };
                    definitions['partof'] = {
                        primaryKeyword: 'partof',
                        secondaryKeywords: ['system', 'subsystem', 'component'],
                        valueType: 'identifier',
                        syntax: 'partof component <ComponentName>'
                    };
                    definitions['allocatedto'] = {
                        primaryKeyword: 'allocatedto',
                        secondaryKeywords: ['component', 'module'],
                        valueType: 'identifier-list',
                        syntax: 'allocatedto component <ComponentList>'
                    };
                    // 🔧 ADD NEW COMPOUND FUNCTION PROPERTIES HERE!
                    // definitions['calls'] = {
                    //     primaryKeyword: 'calls',
                    //     secondaryKeywords: ['function', 'service'],
                    //     valueType: 'identifier-list',
                    //     syntax: 'calls function <FunctionList>'
                    // };
                }
                break;
        }
        
        return definitions;
    }
}

// =============================================================================
// MODULAR PROPERTY VALIDATION
// =============================================================================

interface CompoundPropertyDef {
    primaryKeyword: string;
    secondaryKeywords: string[];
    valueType: 'identifier' | 'identifier-list' | 'enum' | 'string';
    syntax: string;
}

class ModularPropertyValidator {
    constructor(private propertyManager: ModularPropertyManager) {}

    validateDocument(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const languageId = this.getLanguageIdFromDocument(document);
        const text = document.getText();
        const lines = text.split('\n');
        
        let currentContext = '';
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('use ')) continue;
            
            // Track context changes
            if (trimmedLine.startsWith('def ')) {
                const parts = trimmedLine.split(/\s+/);
                if (parts.length >= 2) {
                    currentContext = parts[1]; // 'requirement', 'block', 'function', etc.
                }
                continue;
            }
            
            // Validate properties in current context
            const keyword = trimmedLine.split(' ')[0];
            if (keyword && currentContext) {
                const validSimpleProperties = this.propertyManager.getValidPropertiesForContext(languageId, currentContext);
                const compoundDefs = this.propertyManager.getCompoundPropertyDefinitions(languageId, currentContext);
                
                // Check if this is a compound property
                if (compoundDefs[keyword]) {
                    // Validate compound property syntax
                    this.validateCompoundProperty(diagnostics, lineIndex, trimmedLine, compoundDefs[keyword], line);
                } else if (validSimpleProperties.includes(keyword)) {
                    // Valid simple property - could add value validation here
                    // For now, just accept it as valid
                } else {
                    // Invalid property - show both simple and compound options
                    const allValidKeywords = [
                        ...validSimpleProperties,
                        ...Object.keys(compoundDefs)
                    ].sort();
                    
                    const range = new vscode.Range(
                        lineIndex, 
                        line.indexOf(keyword), 
                        lineIndex, 
                        line.indexOf(keyword) + keyword.length
                    );
                    
                    const compoundSyntaxHints = Object.values(compoundDefs)
                        .map(def => def.syntax)
                        .join(', ');
                    
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `🎯 NEW MODULAR SYSTEM: Invalid keyword "${keyword}" in ${currentContext}.\n` +
                        `Simple properties: ${validSimpleProperties.join(', ')}\n` +
                        `Compound properties: ${compoundSyntaxHints}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }
        
        return diagnostics;
    }

    private validateCompoundProperty(
        diagnostics: vscode.Diagnostic[], 
        lineIndex: number, 
        line: string, 
        definition: CompoundPropertyDef,
        fullLine: string
    ): void {
        const parts = line.trim().split(/\s+/);
        
        if (parts.length < 3) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `🎯 NEW MODULAR SYSTEM: Invalid ${definition.primaryKeyword} syntax. Expected: ${definition.syntax}`,
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }
        
        const secondaryKeyword = parts[1];
        if (!definition.secondaryKeywords.includes(secondaryKeyword)) {
            const secondaryStart = fullLine.indexOf(secondaryKeyword);
            const range = new vscode.Range(
                lineIndex, secondaryStart, lineIndex, secondaryStart + secondaryKeyword.length
            );
            
            diagnostics.push(new vscode.Diagnostic(
                range,
                `🎯 NEW MODULAR SYSTEM: Invalid secondary keyword "${secondaryKeyword}" for ${definition.primaryKeyword}. Valid: ${definition.secondaryKeywords.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    private getLanguageIdFromDocument(document: vscode.TextDocument): string {
        const extension = document.fileName.split('.').pop()?.toLowerCase();
        const mapping: Record<string, string> = {
            'req': 'sylang-requirement',
            'blk': 'sylang-block',
            'fun': 'sylang-function'
        };
        return mapping[extension || ''] || 'sylang-unknown';
    }
}

// =============================================================================
// EXTENSION ACTIVATION - NEW MODULAR SYSTEM
// =============================================================================

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 NEW MODULAR SYSTEM ACTIVATED! This is the new architecture.');
    
    const propertyManager = new ModularPropertyManager();
    const validator = new ModularPropertyValidator(propertyManager);
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('sylang-new-modular');
    
    const validateDocument = (document: vscode.TextDocument) => {
        if (isSylangDocument(document)) {
            console.log(`🔍 NEW MODULAR SYSTEM: Validating ${document.fileName}`);
            const diagnostics = validator.validateDocument(document);
            diagnosticCollection.set(document.uri, diagnostics);
            console.log(`✅ NEW MODULAR SYSTEM: Found ${diagnostics.length} diagnostics`);
        }
    };
    
    // Register event listeners
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => validateDocument(event.document)),
        vscode.workspace.onDidOpenTextDocument(validateDocument),
        vscode.workspace.onDidSaveTextDocument(validateDocument),
        diagnosticCollection
    );
    
    // Validate currently open documents
    vscode.workspace.textDocuments.forEach(validateDocument);
    
    console.log('✅ NEW MODULAR SYSTEM: Ready to validate Sylang files with modular properties!');
}

export function deactivate() {
    console.log('👋 NEW MODULAR SYSTEM: Deactivated');
}

function isSylangDocument(document: vscode.TextDocument): boolean {
    const sylangExtensions = ['.req', '.blk', '.fun', '.sub', '.sys', '.tst'];
    return sylangExtensions.some(ext => document.fileName.toLowerCase().endsWith(ext));
} 