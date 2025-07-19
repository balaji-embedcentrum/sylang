import * as vscode from 'vscode';

/**
 * MINIMAL NEW MODULAR SYSTEM - Demonstrates modular property validation
 */

// =============================================================================
// MODULAR PROPERTY CONFIGURATION
// =============================================================================

class ModularPropertyManager {
    /**
     * 🎯 THIS IS WHERE YOU EXTEND KEYWORDS IN THE NEW SYSTEM!
     */
    getValidPropertiesForContext(languageId: string, context: string): string[] {
        const contextSpecificProperties: Record<string, Record<string, string[]>> = {
            'sylang-requirement': {
                'reqsection': ['name', 'description'],
                'requirement': [
                    'name', 'description', 'type', 'source', 'derivedfrom', 
                    'safetylevel', 'rationale', 'allocatedto', 'verificationcriteria', 
                    'status', 'implements'
                    // 🔧 ADD NEW REQUIREMENT PROPERTIES HERE!
                    // 'traces', 'version', 'your_new_property'
                ]
            },
            'sylang-block': {
                'block': [
                    'name', 'description', 'owner', 'tags', 'safetylevel', 'config', 
                    'contains', 'partof', 'enables', 'implements', 'interfaces', 'port'
                    // 🔧 ADD NEW BLOCK PROPERTIES HERE!
                    // 'version', 'manufacturer', 'your_new_property'
                ],
                'port': ['name', 'description', 'type', 'owner', 'tags', 'safetylevel', 'config']
            },
            'sylang-function': {
                'functiongroup': ['name', 'description', 'owner', 'tags', 'safetylevel'],
                'function': [
                    'name', 'description', 'category', 'owner', 'tags', 'safetylevel', 
                    'enables', 'partof', 'allocatedto', 'config'
                    // 🔧 ADD NEW FUNCTION PROPERTIES HERE!
                    // 'complexity', 'performance', 'your_new_property'
                ]
            }
            // 🔧 ADD NEW LANGUAGE CONTEXTS HERE!
            // 'sylang-newsystem': {
            //     'newcontext': ['name', 'description', 'your_properties']
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
                    // 🔧 ADD NEW COMPOUND PROPERTIES HERE!
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
                    // 🔧 ADD NEW BLOCK COMPOUND PROPERTIES HERE!
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
                const validProperties = this.propertyManager.getValidPropertiesForContext(languageId, currentContext);
                
                if (validProperties.length > 0 && !validProperties.includes(keyword)) {
                    const range = new vscode.Range(
                        lineIndex, 
                        line.indexOf(keyword), 
                        lineIndex, 
                        line.indexOf(keyword) + keyword.length
                    );
                    
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `🎯 NEW MODULAR SYSTEM: Invalid keyword "${keyword}" in ${currentContext}. Valid: ${validProperties.join(', ')}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                } else if (validProperties.includes(keyword)) {
                    // Validate compound properties
                    const compoundDefs = this.propertyManager.getCompoundPropertyDefinitions(languageId, currentContext);
                    if (compoundDefs[keyword]) {
                        this.validateCompoundProperty(diagnostics, lineIndex, trimmedLine, compoundDefs[keyword], line);
                    }
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