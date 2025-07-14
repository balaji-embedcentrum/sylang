import * as vscode from 'vscode';
import { LanguageConfig } from '../config/LanguageConfigs';

export interface SymbolDefinition {
    name: string;
    kind: string;
    location: vscode.Location;
    container?: string;
    properties: Map<string, string>;
    range: vscode.Range;
}

export interface SymbolReference {
    name: string;
    location: vscode.Location;
    context: string;
    range: vscode.Range;
}

export interface SymbolInfo {
    definitions: SymbolDefinition[];
    references: SymbolReference[];
}

// New interfaces for import system
export interface ImportStatement {
    keyword: string;          // 'featureset', 'functiongroup', etc.
    identifier: string;       // The imported identifier
    selectiveImports?: string[]; // For selective imports: use featureset CoreFeatures.Engine, CoreFeatures.Safety
    location: vscode.Location;
    range: vscode.Range;
}

export interface HeaderDefinition {
    identifier: string;       // The header identifier (e.g., 'CoreFeatures')
    keyword: string;         // The header type (e.g., 'featureset')
    fileUri: string;         // File containing this header
    childSymbols: string[];  // All symbols defined under this header
    location: vscode.Location;
}

export interface WorkspaceIndex {
    headerDefinitions: Map<string, HeaderDefinition>;  // identifier -> HeaderDefinition
    symbolToFile: Map<string, string>;                 // Quick lookup: symbol -> fileUri
    fileToHeaders: Map<string, string[]>;              // fileUri -> header identifiers
}

export class SymbolManager {
    private symbols: Map<string, SymbolInfo> = new Map();
    private workspaceSymbols: Map<string, SymbolDefinition[]> = new Map();
    
    // New properties for import system
    private imports: Map<string, ImportStatement[]> = new Map(); // fileUri -> imports
    private workspaceIndex: WorkspaceIndex = {
        headerDefinitions: new Map(),
        symbolToFile: new Map(),
        fileToHeaders: new Map()
    };
    private indexingInProgress: boolean = false;

    /**
     * Parse a document and extract all symbol definitions and references
     */
    public async parseDocument(document: vscode.TextDocument, languageConfig: LanguageConfig): Promise<void> {
        let documentSymbols: SymbolDefinition[] = [];
        let documentReferences: SymbolReference[] = [];
        
        // Get file extension for specialized parsing
        const extension = document.fileName.split('.').pop() || '';
        
        if (extension === 'haz') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseHazardDocument(document));
        } else if (extension === 'rsk') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseRiskDocument(document));
        } else if (extension === 'sgl') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseSafetyGoalsDocument(document));
        } else if (extension === 'req') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseRequirementsDocument(document));
        } else if (extension === 'sub') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseSubsystemDocument(document));
        } else if (extension === 'fun' || extension === 'fma') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseFunctionsDocument(document));
        } else if (extension === 'fml') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseFeaturesDocument(document));
        } else if (extension === 'ple') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseProductLineDocument(document));
        } else if (extension === 'sys') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseSystemDocument(document));
        } else if (extension === 'blk') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseBlockDocument(document));
        } else if (languageConfig.id === 'sylang-safety') {
            ({ definitions: documentSymbols, references: documentReferences } = this.parseSafetyDocument(document));
        } else {
            // Existing general parsing for other languages
            const text = document.getText();
            const lines = text.split('\n');
            
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const currentLine = lines[lineIndex];
                if (!currentLine) continue;
                
                const line = currentLine.trim();
                if (!line || line.startsWith('//')) continue;
                
                if (line.startsWith('def ')) {
                    const definition = this.parseDefinition(document, lineIndex, line, languageConfig);
                    if (definition) {
                        documentSymbols.push(definition);
                    }
                } else {
                    const references = this.parseReferences(document, lineIndex, line, languageConfig);
                    documentReferences.push(...references);
                }
            }
        }
        
        // Update workspace symbols
        this.updateWorkspaceSymbols(document.uri.toString(), documentSymbols);
        
        // Update document symbols
        const documentKey = document.uri.toString();
        this.symbols.set(documentKey, {
            definitions: documentSymbols,
            references: documentReferences
        });
    }

    /**
     * Specialized parsing for safety documents (.itm files)
     */
    private parseSafetyDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.replace(/\r$/, '');
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(line);

            // Adjust context stack for dedent
            while (level < contextStack.length) {
                contextStack.pop();
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                // Parse definition
                const parts = trimmedLine.substring(4).trim().split(/\s+/);
                if (parts.length < 2) continue;
                const kind = parts[0];
                const name = parts[1];
                let desc = '';
                if (parts.length > 2 && trimmedLine.endsWith('"')) {
                    desc = trimmedLine.match(/"([^"]*)"$/)?.[1] || '';
                }

                if (!kind || !name) continue;

                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const location = new vscode.Location(document.uri, range);
                const properties = new Map<string, string>();
                if (desc) properties.set('description', desc);

                definitions.push({
                    name,
                    kind,
                    location,
                    container: currentContext,
                    properties,
                    range
                });

                // If it's a block def (no inline desc), push to stack for nested properties
                if (!desc) {
                    contextStack.push(kind);
                }
            } else {
                // Non-def: container/section, property, or identifier list
                const keywordMatch = trimmedLine.split(' ')[0];
                if (!keywordMatch) continue;
                
                const keyword = keywordMatch;

                if (this.isContainerKeyword(keyword)) {
                    contextStack.push(keyword);
                } else if (this.isPropertyKeyword(keyword, currentContext)) {
                    // Parse references in property values
                    const valuePart = trimmedLine.substring(keyword.length).trim();
                    const refRegex = /\b([A-Z][A-Za-z0-9_]*)\b/g;
                    let match;
                    while ((match = refRegex.exec(valuePart)) !== null) {
                        const refName = match[1];
                        if (!refName) continue;
                        
                        const startPos = line.indexOf(refName);
                        const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + refName.length);
                        const location = new vscode.Location(document.uri, range);
                        references.push({
                            name: refName,
                            location,
                            context: trimmedLine,
                            range
                        });
                    }
                } else if (this.isIdentifierListContext(currentContext)) {
                    // Treat indented identifiers as definitions (e.g., subsystems)
                    if (/^[A-Z][A-Za-z0-9_]*$/.test(trimmedLine)) {
                        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                        const location = new vscode.Location(document.uri, range);
                        definitions.push({
                            name: trimmedLine,
                            kind: currentContext, // e.g., 'subsystem'
                            location,
                            properties: new Map(),
                            range
                        });
                    }
                }
            }
        }

        return { definitions, references };
    }

    /**
     * Specialized parsing for hazard documents (.haz files)
     */
    private parseHazardDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.replace(/\r$/, '');
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(line);

            // Adjust context stack for dedent
            while (level < contextStack.length) {
                contextStack.pop();
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                // Parse definition
                const parts = trimmedLine.substring(4).trim().split(/\s+/);
                if (parts.length < 2) continue;
                const kind = parts[0];
                const name = parts[1];
                let desc = '';
                if (parts.length > 2 && trimmedLine.endsWith('"')) {
                    desc = trimmedLine.match(/"([^"]*)"$/)?.[1] || '';
                }

                if (!kind || !name) continue;

                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const location = new vscode.Location(document.uri, range);
                const properties = new Map<string, string>();
                if (desc) properties.set('description', desc);

                definitions.push({
                    name,
                    kind,
                    location,
                    container: currentContext,
                    properties,
                    range
                });

                // Push to stack for nested properties
                contextStack.push(kind);
            } else if (trimmedLine.startsWith('subsystem ')) {
                // Handle subsystem declarations in subsystemhazards
                const subsystemName = trimmedLine.substring(10).trim();
                if (subsystemName && /^[A-Z][A-Za-z0-9_]*$/.test(subsystemName)) {
                    const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                    const location = new vscode.Location(document.uri, range);
                    definitions.push({
                        name: subsystemName,
                        kind: 'subsystem',
                        location,
                        container: currentContext,
                        properties: new Map(),
                        range
                    });
                    contextStack.push('subsystem');
                }
            } else {
                // Non-def: container/section, property, or identifier list
                const keywordMatch = trimmedLine.split(' ')[0];
                if (!keywordMatch) continue;
                
                const keyword = keywordMatch;

                if (this.isHazardContainerKeyword(keyword)) {
                    contextStack.push(keyword);
                } else if (this.isHazardPropertyKeyword(keyword, currentContext)) {
                    // Parse references in property values
                    const valuePart = trimmedLine.substring(keyword.length).trim();
                    
                    // Handle quoted strings and function references
                    if (keyword === 'functions') {
                        // Parse function references separated by commas
                        const functionRefs = valuePart.split(',').map(f => f.trim());
                        functionRefs.forEach(funcRef => {
                            if (funcRef && /^[A-Z][A-Za-z0-9_]*$/.test(funcRef)) {
                                const startPos = line.indexOf(funcRef);
                                if (startPos !== -1) {
                                    const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + funcRef.length);
                                    const location = new vscode.Location(document.uri, range);
                                    references.push({
                                        name: funcRef,
                                        location,
                                        context: trimmedLine,
                                        range
                                    });
                                }
                            }
                        });
                    } else {
                        // Parse other references
                        const refRegex = /\b([A-Z][A-Za-z0-9_]*)\b/g;
                        let match;
                        while ((match = refRegex.exec(valuePart)) !== null) {
                            const refName = match[1];
                            if (!refName) continue;
                            
                            const startPos = line.indexOf(refName);
                            if (startPos !== -1) {
                                const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + refName.length);
                                const location = new vscode.Location(document.uri, range);
                                references.push({
                                    name: refName,
                                    location,
                                    context: trimmedLine,
                                    range
                                });
                            }
                        }
                    }
                }
            }
        }

        return { definitions, references };
    }

    private getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? Math.floor(match[0].replace(/\t/g, '  ').length / 2) : 0;
    }

    private isContainerKeyword(keyword: string): boolean {
        const containers = ['itemdef', 'operationalscenarios', 'operationalconditions', 'vehiclestates', 'driverstates', 'environments', 'safetyconcept', 'subsystems', 'systemboundaries', 'includes', 'excludes', 'safetystrategy', 'assumptionsofuse', 'foreseeablemisuse'];
        return containers.includes(keyword);
    }

    private isPropertyKeyword(keyword: string, context: string): boolean {
        const propertiesByContext: { [key: string]: string[] } = {
            'item': ['name', 'description', 'owner', 'reviewers', 'productline', 'featureset', 'functiongroup'],
            'scenario': ['description', 'vehiclestate', 'environment', 'driverstate'],
            'condition': ['range', 'impact', 'standard'],
            'vehiclestate': ['description', 'characteristics'],
            'drivingstate': ['description', 'characteristics'],
            'environment': ['description', 'conditions'],
            'principle': ['description'],
            'assumption': ['description'],
            'misuse': ['description']
        };
        return (propertiesByContext[context] || []).includes(keyword);
    }

    private isIdentifierListContext(context: string): boolean {
        return ['subsystems'].includes(context);
    }



    /**
     * Parse definition for general languages (non-safety)
     */
    private parseDefinition(document: vscode.TextDocument, lineIndex: number, line: string, languageConfig: LanguageConfig): SymbolDefinition | null {
        try {
            // Extract definition from 'def' line
            const defMatch = line.match(/^def\s+(\w+)\s+(\w+)(?:\s+"([^"]*)")?/);
            if (!defMatch) return null;

            const kind = defMatch[1];
            const name = defMatch[2];
            const description = defMatch[3] || '';

            if (!kind || !name) return null;

            const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
            const location = new vscode.Location(document.uri, range);
            const properties = new Map<string, string>();
            
            if (description) {
                properties.set('description', description);
            }

            return {
                name,
                kind,
                location,
                properties,
                range
            };
        } catch (error) {
            console.error('Error parsing definition:', error);
            return null;
        }
    }

    /**
     * Parse references in a line for general languages (non-safety)
     */
    private parseReferences(document: vscode.TextDocument, lineIndex: number, line: string, languageConfig: LanguageConfig): SymbolReference[] {
        const references: SymbolReference[] = [];
        
        try {
            // Look for identifiers that could be references
            const identifierRegex = /\b([A-Z][A-Za-z0-9_]*)\b/g;
            let match;
            
            while ((match = identifierRegex.exec(line)) !== null) {
                const refName = match[1];
                if (!refName) continue;
                
                const startPos = match.index;
                const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + refName.length);
                const location = new vscode.Location(document.uri, range);
                
                references.push({
                    name: refName,
                    location,
                    context: line.trim(),
                    range
                });
            }
        } catch (error) {
            console.error('Error parsing references:', error);
        }
        
        return references;
    }

    /**
     * Update workspace symbols for a specific document
     */
    private updateWorkspaceSymbols(documentKey: string, symbols: SymbolDefinition[]): void {
        this.workspaceSymbols.set(documentKey, symbols);
    }

    /**
     * Find definition of a symbol
     */
    public findDefinition(symbolName: string, document: vscode.TextDocument): SymbolDefinition | null {
        // First check current document
        const documentKey = document.uri.toString();
        const documentSymbols = this.symbols.get(documentKey);
        
        if (documentSymbols) {
            const definition = documentSymbols.definitions.find(def => def.name === symbolName);
            if (definition) {
                return definition;
            }
        }
        
        // Then check workspace symbols
        for (const [_, symbols] of this.workspaceSymbols) {
            const definition = symbols.find(def => def.name === symbolName);
            if (definition) {
                return definition;
            }
        }
        
        return null;
    }

    /**
     * Find all references to a symbol
     */
    public findReferences(symbolName: string): SymbolReference[] {
        const references: SymbolReference[] = [];
        
        // Search through all documents
        for (const [_, symbolInfo] of this.symbols) {
            const matchingRefs = symbolInfo.references.filter(ref => ref.name === symbolName);
            references.push(...matchingRefs);
        }
        
        return references;
    }

    /**
     * Get all workspace symbols
     */
    public getWorkspaceSymbols(): SymbolDefinition[] {
        const allSymbols: SymbolDefinition[] = [];
        
        for (const [_, symbols] of this.workspaceSymbols) {
            allSymbols.push(...symbols);
        }
        
        return allSymbols;
    }

    /**
     * Clear symbols for a specific document
     */
    public clearDocumentSymbols(documentUri: string): void {
        this.symbols.delete(documentUri);
        this.workspaceSymbols.delete(documentUri);
    }

    /**
     * Clear all symbols
     */
    public clearAllSymbols(): void {
        this.symbols.clear();
        this.workspaceSymbols.clear();
    }

    private isHazardContainerKeyword(keyword: string): boolean {
        const containers = ['hazardcategories', 'subsystemhazards', 'systemlevelhazards', 'environmentalhazards', 'usagehazards'];
        return containers.includes(keyword);
    }

    private isHazardPropertyKeyword(keyword: string, context: string): boolean {
        const propertiesByContext: { [key: string]: string[] } = {
            'hazardidentification': ['name', 'description', 'hazardanalysis', 'methodology'],
            'category': ['description', 'severity'],
            'hazard': ['name', 'description', 'cause', 'effect', 'category', 'functions', 'mitigation'],
            'subsystem': ['name', 'description'] // for subsystem context
        };
        return (propertiesByContext[context] || []).includes(keyword);
    }

    /**
     * Specialized parsing for risk documents (.rsk files)
     */
    private parseRiskDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.replace(/\r$/, '');
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(line);

            // Adjust context stack for dedent
            while (level < contextStack.length) {
                contextStack.pop();
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                // Parse definition
                const parts = trimmedLine.substring(4).trim().split(/\s+/);
                if (parts.length < 2) continue;
                const kind = parts[0];
                const name = parts[1];
                let desc = '';
                if (parts.length > 2 && trimmedLine.endsWith('"')) {
                    desc = trimmedLine.match(/"([^"]*)"$/)?.[1] || '';
                }

                if (!kind || !name) continue;

                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const location = new vscode.Location(document.uri, range);
                const properties = new Map<string, string>();
                if (desc) properties.set('description', desc);

                definitions.push({
                    name,
                    kind,
                    location,
                    container: currentContext,
                    properties,
                    range
                });

                // Push to stack for nested properties
                contextStack.push(kind);
            } else {
                // Non-def: container/section, property, or subsystem
                const keywordMatch = trimmedLine.split(' ')[0];
                if (!keywordMatch) continue;
                
                const keyword = keywordMatch;

                if (this.isRiskContainerKeyword(keyword)) {
                    contextStack.push(keyword);
                } else if (this.isRiskPropertyKeyword(keyword, currentContext)) {
                    // Parse references in property values
                    const valuePart = trimmedLine.substring(keyword.length).trim();
                    const refRegex = /\b([A-Z][A-Za-z0-9_]+)\b/g;
                    let match;
                    while ((match = refRegex.exec(valuePart)) !== null) {
                        const refName = match[1];
                        if (!refName) continue;
                        
                        const startPos = line.indexOf(refName);
                        const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + refName.length);
                        const location = new vscode.Location(document.uri, range);
                        references.push({
                            name: refName,
                            location,
                            context: trimmedLine,
                            range
                        });
                    }
                } else if (keyword === 'subsystem' && currentContext === 'asilassessment') {
                    const subsystemName = trimmedLine.substring(9).trim();
                    if (subsystemName && /^[A-Z][A-Za-z0-9_]*$/.test(subsystemName)) {
                        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                        const location = new vscode.Location(document.uri, range);
                        definitions.push({
                            name: subsystemName,
                            kind: 'subsystem',
                            location,
                            properties: new Map(),
                            range
                        });
                        contextStack.push('subsystem');
                    } else {
                        // Note: diagnostics would be handled by the RiskValidator
                    }
                }
            }
        }

        return { definitions, references };
    }

    private isRiskContainerKeyword(keyword: string): boolean {
        const containers = ['riskcriteria', 'riskdetermination', 'asildetermination', 'asilassessment'];
        return containers.includes(keyword);
    }

    private isRiskPropertyKeyword(keyword: string, context: string): boolean {
        const propertiesByContext: { [key: string]: string[] } = {
            'riskassessment': ['name', 'description', 'hazardanalysis', 'hazardidentification', 'item', 'methodology'],
            'severity': ['description'],
            'exposure': ['description'],
            'controllability': ['description'],
            'risk': ['severity', 'exposure', 'controllability', 'description'],
            'safetylevel': ['risk', 'description'],
            'hazard': ['scenario', 'safetylevel', 'rationale']
        };
        return (propertiesByContext[context] || []).includes(keyword);
    }

    /**
     * Specialized parsing for safety goals documents (.sgl files)
     */
    private parseSafetyGoalsDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.replace(/\r$/, '');
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(line);

            // Adjust context stack for dedent
            while (level < contextStack.length) {
                contextStack.pop();
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                const parts = trimmedLine.substring(4).trim().split(/\s+/);
                if (parts.length < 2) continue;
                const kind = parts[0];
                const name = parts[1];
                let desc = '';
                if (parts.length > 2 && trimmedLine.endsWith('"')) {
                    desc = trimmedLine.match(/"([^"]*)"$/)?.[1] || '';
                }

                if (!kind || !name) continue;

                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const location = new vscode.Location(document.uri, range);
                const properties = new Map<string, string>();
                if (desc) properties.set('description', desc);

                definitions.push({
                    name,
                    kind,
                    location,
                    container: currentContext,
                    properties,
                    range
                });

                // If it's a block def (no inline desc), push to stack for nested properties
                if (!desc) {
                    contextStack.push(kind);
                }
            } else {
                const keyword = trimmedLine.split(' ')[0];
                if (!keyword) continue;

                if (this.isSafetyGoalsContainerKeyword(keyword)) {
                    contextStack.push(keyword);
                } else if (this.isSafetyGoalsPropertyKeyword(keyword, currentContext)) {
                    // Parse references in property values
                    const valuePart = trimmedLine.substring(keyword.length).trim();
                    const refRegex = /\b([A-Z][A-Za-z0-9_]*)\b/g;
                    let match;
                    while ((match = refRegex.exec(valuePart)) !== null) {
                        const refName = match[1];
                        if (!refName) continue;
                        
                        const startPos = line.indexOf(refName);
                        const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + refName.length);
                        const location = new vscode.Location(document.uri, range);
                        references.push({
                            name: refName,
                            location,
                            context: trimmedLine,
                            range
                        });
                    }
                } else if (trimmedLine.startsWith('enabledby function ')) {
                    // Special handling for multi-word property "enabledby function"
                    const valuePart = trimmedLine.substring('enabledby function '.length).trim();
                    const refRegex = /\b([A-Z][A-Za-z0-9_]*)\b/g;
                    let match;
                    while ((match = refRegex.exec(valuePart)) !== null) {
                        const refName = match[1];
                        if (!refName) continue;
                        
                        const startPos = line.indexOf(refName);
                        const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + refName.length);
                        const location = new vscode.Location(document.uri, range);
                        references.push({
                            name: refName,
                            location,
                            context: trimmedLine,
                            range
                        });
                    }
                }
            }
        }

        return { definitions, references };
    }

    private isSafetyGoalsContainerKeyword(keyword: string): boolean {
        const containers = ['safetygoals', 'safetymeasures'];
        return containers.includes(keyword);
    }

    private isSafetyGoalsPropertyKeyword(keyword: string, context: string): boolean {
        const propertiesByContext: { [key: string]: string[] } = {
            'safetygoals': ['name', 'description', 'item', 'riskassessment', 'hazardidentification'],
            'goal': ['name', 'description', 'hazard', 'scenario', 'safetylevel'],
            'measure': ['description'] // Note: 'enabledby function' is handled separately
        };
        return (propertiesByContext[context] || []).includes(keyword);
    }

    /**
     * Specialized parsing for requirements documents (.req files)
     */
    private parseRequirementsDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            const cleanLine = line.replace(/\r$/, '');
            const trimmedLine = cleanLine.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(line);

            // Adjust context stack for dedent
            while (level < contextStack.length) {
                contextStack.pop();
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                const parts = trimmedLine.substring(4).trim().split(/\s+/);
                if (parts.length < 2) continue;
                const kind = parts[0];
                const name = parts[1];
                if (!kind || !name) continue;
                
                let desc = '';
                if (parts.length > 2 && trimmedLine.endsWith('"')) {
                    desc = trimmedLine.match(/"([^"]*)"$/)?.[1] || '';
                }

                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const location = new vscode.Location(document.uri, range);
                const properties = new Map<string, string>();
                if (desc) properties.set('description', desc);

                definitions.push({
                    name,
                    kind,
                    location,
                    container: currentContext,
                    properties,
                    range
                });

                // If it's a block def (no inline desc), push to stack for nested properties
                if (!desc) {
                    contextStack.push(kind);
                }
            } else {
                const keyword = trimmedLine.split(' ')[0];
                if (!keyword) continue;

                if (this.isRequirementsContainerKeyword(keyword)) {
                    contextStack.push(keyword);
                } else if (this.isRequirementsPropertyKeyword(keyword, currentContext)) {
                    // Parse references in property values
                    const valuePart = trimmedLine.substring(keyword.length).trim();
                    const refRegex = /\b([A-Z][A-Za-z0-9_]*)\b/g;
                    let match;
                    while ((match = refRegex.exec(valuePart)) !== null) {
                        const refName = match[1];
                        if (!refName) continue;
                        
                        const startPos = line.indexOf(refName);
                        const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + refName.length);
                        const location = new vscode.Location(document.uri, range);
                        references.push({
                            name: refName,
                            location,
                            context: trimmedLine,
                            range
                        });
                    }
                }
            }
        }

        return { definitions, references };
    }

    private isRequirementsContainerKeyword(keyword: string): boolean {
        return false; // No containers in .req sample
    }

    private isRequirementsPropertyKeyword(keyword: string, context: string): boolean {
        const propertiesByContext: { [key: string]: string[] } = {
            'reqsection': ['name', 'description'],
            'requirement': ['name', 'description', 'type', 'source', 'derivedfrom', 'safetylevel', 'rationale', 'allocatedto', 'verificationcriteria', 'status']
        };
        return (propertiesByContext[context] || []).includes(keyword);
    }

    /**
     * Specialized parsing for subsystem documents (.sub files)
     */
    private parseSubsystemDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            const cleanLine = line.replace(/\r$/, '');
            const trimmedLine = cleanLine.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            const level = this.getIndentLevel(line);

            // Adjust context stack for dedent
            while (level < contextStack.length) {
                contextStack.pop();
            }

            const currentContext = contextStack[contextStack.length - 1] || '';

            if (trimmedLine.startsWith('def ')) {
                const parts = trimmedLine.substring(4).trim().split(/\s+/);
                if (parts.length < 2) continue;
                const kind = parts[0];
                const name = parts[1];
                if (!kind || !name) continue;
                
                let desc = '';
                if (parts.length > 2 && trimmedLine.endsWith('"')) {
                    desc = trimmedLine.match(/"([^"]*)"$/)?.[1] || '';
                }

                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const location = new vscode.Location(document.uri, range);
                const properties = new Map<string, string>();
                if (desc) properties.set('description', desc);

                definitions.push({
                    name,
                    kind,
                    location,
                    container: currentContext,
                    properties,
                    range
                });

                // If it's a block def (no inline desc), push to stack for nested properties
                if (!desc) {
                    contextStack.push(kind);
                }
            } else {
                const keyword = trimmedLine.split(' ')[0];
                if (!keyword) continue;

                if (this.isSubsystemContainerKeyword(keyword)) {
                    contextStack.push(keyword);
                } else if (this.isSubsystemPropertyKeyword(keyword, currentContext)) {
                    // Parse references in property values
                    const valuePart = trimmedLine.substring(keyword.length).trim();
                    const refRegex = /\b([A-Z][A-Za-z0-9_]*)\b/g;
                    let match;
                    while ((match = refRegex.exec(valuePart)) !== null) {
                        const refName = match[1];
                        if (!refName) continue;
                        
                        const startPos = line.indexOf(refName);
                        const range = new vscode.Range(lineIndex, startPos, lineIndex, startPos + refName.length);
                        const location = new vscode.Location(document.uri, range);
                        references.push({
                            name: refName,
                            location,
                            context: trimmedLine,
                            range
                        });
                    }
                }
            }
        }

        return { definitions, references };
    }

    private isSubsystemContainerKeyword(keyword: string): boolean {
        return false; // No containers in .sub sample
    }

    private isSubsystemPropertyKeyword(keyword: string, context: string): boolean {
        const propertiesByContext: { [key: string]: string[] } = {
            'subsystem': ['name', 'description', 'owner', 'tags', 'safetylevel', 'enables', 'implements']
        };
        return (propertiesByContext[context] || []).includes(keyword);
    }

    /**
     * Parse functions document (.fun, .fma files)
     */
    private parseFunctionsDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.trim();
            if (!line || line.startsWith('//')) continue;

            const indentLevel = this.getIndentLevel(currentLine);

            // Update context stack based on indentation
            while (contextStack.length > indentLevel) {
                contextStack.pop();
            }

            // Parse definitions and update context
            if (line.startsWith('def ')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 3) {
                    const keyword = parts[1]; // functiongroup, function
                    const name = parts[2];

                    if (keyword && this.isFunctionsContainerKeyword(keyword)) {
                        // Container definition
                        contextStack[indentLevel] = keyword;
                        if (name) {
                            definitions.push({
                                name: name,
                                kind: keyword,
                                location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
                                container: contextStack.slice(0, indentLevel).join('.'),
                                properties: new Map(),
                                range: new vscode.Range(lineIndex, 0, lineIndex, line.length)
                            });
                        }
                    } else if (keyword === 'function' && name) {
                        // Function definition
                        contextStack[indentLevel] = 'function';
                        definitions.push({
                            name: name,
                            kind: 'function',
                            location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
                            container: contextStack.slice(0, indentLevel).join('.'),
                            properties: new Map(),
                            range: new vscode.Range(lineIndex, 0, lineIndex, line.length)
                        });
                    }
                }
            } else if (this.isFunctionsPropertyKeyword(line.split(/\s+/)[0], contextStack[contextStack.length - 1] || '')) {
                // Property line - look for references in enables
                if (line.startsWith('enables')) {
                    const enablesMatch = line.match(/enables\s+(?:feature\s+)?(.+)/);
                    if (enablesMatch && enablesMatch[1]) {
                        const features = enablesMatch[1].split(',').map(f => f.trim());
                        for (const feature of features) {
                            if (feature) {
                                const startPos = line.indexOf(feature);
                                if (startPos >= 0) {
                                    references.push({
                                        name: feature,
                                        location: new vscode.Location(document.uri, new vscode.Position(lineIndex, startPos)),
                                        context: 'enables',
                                        range: new vscode.Range(lineIndex, startPos, lineIndex, startPos + feature.length)
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return { definitions, references };
    }

    private isFunctionsContainerKeyword(keyword: string): boolean {
        return keyword === 'functiongroup';
    }

    private isFunctionsPropertyKeyword(keyword: string, context: string): boolean {
        const propertiesByContext: { [key: string]: string[] } = {
            'function': ['name', 'description', 'category', 'owner', 'tags', 'safetylevel', 'partof', 'enables', 'allocatedto']
        };
        return (propertiesByContext[context] || []).includes(keyword);
    }

    /**
     * Parse features document (.fml files)
     */
    private parseFeaturesDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const contextStack: string[] = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.trim();
            if (!line || line.startsWith('//')) continue;

            const indentLevel = this.getIndentLevel(currentLine);

            // Update context stack based on indentation
            while (contextStack.length > indentLevel) {
                contextStack.pop();
            }

            // Parse definitions and update context
            if (line.startsWith('def ')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 3) {
                    const keyword = parts[1]; // featureset, feature
                    const name = parts[2];

                    if (keyword === 'featureset') {
                        contextStack[indentLevel] = keyword;
                        definitions.push({
                            name: name,
                            kind: keyword,
                            location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
                            container: contextStack.slice(0, indentLevel).join('.'),
                            properties: new Map(),
                            range: new vscode.Range(lineIndex, 0, lineIndex, line.length)
                        });
                    } else if (keyword === 'feature') {
                        contextStack[indentLevel] = 'feature';
                        definitions.push({
                            name: name,
                            kind: 'feature',
                            location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
                            container: contextStack.slice(0, indentLevel).join('.'),
                            properties: new Map(),
                            range: new vscode.Range(lineIndex, 0, lineIndex, line.length)
                        });
                    }
                }
            }
        }

        return { definitions, references };
    }

    /**
     * Parse product line document (.ple files)
     */
    private parseProductLineDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.trim();
            if (!line || line.startsWith('//')) continue;

            // Parse productline definition
            if (line.startsWith('def productline')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 3) {
                    const name = parts[2];
                    definitions.push({
                        name: name,
                        kind: 'productline',
                        location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
                        container: '',
                        properties: new Map(),
                        range: new vscode.Range(lineIndex, 0, lineIndex, line.length)
                    });
                }
            }
        }

        return { definitions, references };
    }

    /**
     * Parse system document (.sys files)
     */
    private parseSystemDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.trim();
            if (!line || line.startsWith('//')) continue;

            // Parse system definition
            if (line.startsWith('def system')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 3) {
                    const name = parts[2];
                    definitions.push({
                        name: name,
                        kind: 'system',
                        location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
                        container: '',
                        properties: new Map(),
                        range: new vscode.Range(lineIndex, 0, lineIndex, line.length)
                    });
                }
            }
            // Look for contains references
            else if (line.startsWith('contains')) {
                const containsMatch = line.match(/contains\s+(.+)/);
                if (containsMatch) {
                    const systems = containsMatch[1].split(',').map(s => s.trim().replace(/"/g, ''));
                    for (const system of systems) {
                        if (system) {
                            const startPos = line.indexOf(system);
                            references.push({
                                name: system,
                                location: new vscode.Location(document.uri, new vscode.Position(lineIndex, startPos)),
                                context: 'contains',
                                range: new vscode.Range(lineIndex, startPos, lineIndex, startPos + system.length)
                            });
                        }
                    }
                }
            }
        }

        return { definitions, references };
    }

    /**
     * Parse block document (.blk files)
     */
    private parseBlockDocument(document: vscode.TextDocument): { definitions: SymbolDefinition[], references: SymbolReference[] } {
        const definitions: SymbolDefinition[] = [];
        const references: SymbolReference[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const currentLine = lines[lineIndex];
            if (!currentLine) continue;
            
            const line = currentLine.trim();
            if (!line || line.startsWith('//')) continue;

            // Parse block definition: def block <type> <identifier>
            if (line.startsWith('def block')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 4) {
                    const blockType = parts[2]; // subsystem, component, etc.
                    const name = parts[3];      // PowerSubsystem, etc.
                    definitions.push({
                        name: name,
                        kind: blockType,
                        location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
                        container: '',
                        properties: new Map(),
                        range: new vscode.Range(lineIndex, 0, lineIndex, line.length)
                    });
                }
            }
            // Parse contains references: contains subsystem PowerSubsystem, ControlSubsystem
            else if (line.startsWith('contains')) {
                const containsMatch = line.match(/contains\s+\w+\s+(.+)/);
                if (containsMatch) {
                    const identifiers = containsMatch[1].split(',').map(s => s.trim());
                    for (const identifier of identifiers) {
                        if (identifier && /^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
                            const startPos = line.indexOf(identifier);
                            references.push({
                                name: identifier,
                                location: new vscode.Location(document.uri, new vscode.Position(lineIndex, startPos)),
                                context: 'contains',
                                range: new vscode.Range(lineIndex, startPos, lineIndex, startPos + identifier.length)
                            });
                        }
                    }
                }
            }
            // Parse partof references: partof product ElectricVehiclePowerTrain
            else if (line.startsWith('partof')) {
                const partofMatch = line.match(/partof\s+\w+\s+([A-Za-z_][A-Za-z0-9_]*)/);
                if (partofMatch) {
                    const identifier = partofMatch[1];
                    const startPos = line.indexOf(identifier);
                    references.push({
                        name: identifier,
                        location: new vscode.Location(document.uri, new vscode.Position(lineIndex, startPos)),
                        context: 'partof',
                        range: new vscode.Range(lineIndex, startPos, lineIndex, startPos + identifier.length)
                    });
                }
            }
            // Parse enables feature references: enables feature InverterSystem
            else if (line.startsWith('enables feature')) {
                const enablesMatch = line.match(/enables\s+feature\s+(.+)/);
                if (enablesMatch) {
                    const features = enablesMatch[1].split(',').map(s => s.trim());
                    for (const feature of features) {
                        if (feature && /^[A-Za-z_][A-Za-z0-9_]*$/.test(feature)) {
                            const startPos = line.indexOf(feature);
                            references.push({
                                name: feature,
                                location: new vscode.Location(document.uri, new vscode.Position(lineIndex, startPos)),
                                context: 'enables',
                                range: new vscode.Range(lineIndex, startPos, lineIndex, startPos + feature.length)
                            });
                        }
                    }
                }
            }
            // Parse implements function references: implements function PowerConversion, MotorControl
            else if (line.startsWith('implements function')) {
                const implementsMatch = line.match(/implements\s+function\s+(.+)/);
                if (implementsMatch) {
                    const functions = implementsMatch[1].split(',').map(s => s.trim());
                    for (const func of functions) {
                        if (func && /^[A-Za-z_][A-Za-z0-9_]*$/.test(func)) {
                            const startPos = line.indexOf(func);
                            references.push({
                                name: func,
                                location: new vscode.Location(document.uri, new vscode.Position(lineIndex, startPos)),
                                context: 'implements',
                                range: new vscode.Range(lineIndex, startPos, lineIndex, startPos + func.length)
                            });
                        }
                    }
                }
            }
        }

        return { definitions, references };
    }

    // ============================================================================
    // NEW IMPORT SYSTEM METHODS - ADDED WITHOUT MODIFYING EXISTING FUNCTIONALITY
    // ============================================================================

    /**
     * Parse import statements from a document
     */
    private parseImportStatements(document: vscode.TextDocument): ImportStatement[] {
        const imports: ImportStatement[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex].trim();
            
            // Skip empty lines and comments
            if (!line || line.startsWith('#') || line.startsWith('//')) {
                continue;
            }

            // Parse use statements: use keyword identifier1, identifier2, ... OR use keyword identifier.symbol1, identifier.symbol2
            const useMatch = line.match(/^use\s+(\w+)\s+(.+)$/);
            if (useMatch) {
                const keyword = useMatch[1];
                const identifierPart = useMatch[2].trim();
                console.log(`[DEBUG] Parsing import: use ${keyword} ${identifierPart}`);
                
                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const location = new vscode.Location(document.uri, range);

                // Check for selective imports with dots (identifier.symbol1, identifier.symbol2)
                if (identifierPart.includes('.') && identifierPart.split('.').length > 1) {
                    const parts = identifierPart.split('.');
                    const identifier = parts[0];
                    const selectiveImports = parts.slice(1).join('.').split(',').map(s => s.trim());
                    
                    imports.push({
                        keyword,
                        identifier,
                        selectiveImports,
                        location,
                        range
                    });
                } else {
                    // Parse comma-separated identifiers: PowerSubsystem, ControlSubsystem, ...
                    const identifiers = identifierPart.split(',').map(id => id.trim());
                    for (const identifier of identifiers) {
                        if (identifier && /^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
                            console.log(`[DEBUG] Adding import: ${keyword} ${identifier}`);
                            imports.push({
                                keyword,
                                identifier,
                                location,
                                range
                            });
                        }
                    }
                }
            }
        }

        return imports;
    }

    /**
     * Build workspace-wide symbol index
     */
    public async buildWorkspaceIndex(): Promise<void> {
        if (this.indexingInProgress) {
            return;
        }

        this.indexingInProgress = true;
        
        try {
            // Show progress for large workspaces
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
                title: "Building Sylang symbol index...",
                cancellable: false
            }, async (progress) => {
                // Clear existing index
                this.workspaceIndex.headerDefinitions.clear();
                this.workspaceIndex.symbolToFile.clear();
                this.workspaceIndex.fileToHeaders.clear();

                // Find all Sylang files in workspace
                const sylangFiles = await vscode.workspace.findFiles('**/*.{fml,fun,sys,ple,vml,haz,rsk,sgl,req,blk}');
                
                for (let i = 0; i < sylangFiles.length; i++) {
                    const fileUri = sylangFiles[i];
                    progress.report({ 
                        increment: (i / sylangFiles.length) * 100,
                        message: `Processing ${fileUri.fsPath}...`
                    });

                    await this.indexFileHeaders(fileUri);
                }
            });
        } finally {
            this.indexingInProgress = false;
        }
    }

    /**
     * Index header definitions from a specific file
     */
    private async indexFileHeaders(fileUri: vscode.Uri): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(fileUri);
            const text = document.getText();
            const lines = text.split('\n');
            const fileHeaders: string[] = [];
            const childSymbols: string[] = [];

            console.log(`[DEBUG] Processing file: ${fileUri.fsPath} (${lines.length} lines)`);

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const originalLine = lines[lineIndex];
                const line = originalLine.trim();
                
                // Find header definitions (def keyword identifier OR def block type identifier)
                let headerMatch = line.match(/^def\s+(featureset|functiongroup|system|variantmodel|productline|hazardanalysis|riskassessment|safetygoals)\s+([A-Za-z0-9_]+)/);
                let keyword: string = '';
                let identifier: string = '';
                
                if (headerMatch) {
                    // Traditional headers: def featureset CoreFeatures
                    keyword = headerMatch[1];
                    identifier = headerMatch[2];
                } else {
                    // Block headers: def block subsystem PowerSubsystem
                    const blockMatch = line.match(/^def\s+block\s+(system|subsystem|component|subcomponent|module|submodule|unit|subunit|assembly|subassembly|circuit|part)\s+([A-Za-z0-9_]+)/);
                    if (blockMatch) {
                        keyword = blockMatch[1]; // subsystem, component, etc.
                        identifier = blockMatch[2]; // PowerSubsystem, etc.
                    }
                    // NO continue statement - let it fall through to child detection
                }
                
                // Process header if found
                if (keyword && identifier) {
                    console.log(`[DEBUG] Found header '${identifier}' (${keyword}) in file ${fileUri.fsPath}`);
                    
                    const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                    const location = new vscode.Location(fileUri, range);

                    // Check for duplicate identifiers
                    if (this.workspaceIndex.headerDefinitions.has(identifier)) {
                        const existing = this.workspaceIndex.headerDefinitions.get(identifier)!;
                        console.warn(`Duplicate identifier '${identifier}' found in ${fileUri.fsPath} and ${existing.fileUri}`);
                    }

                    const headerDef: HeaderDefinition = {
                        identifier,
                        keyword,
                        fileUri: fileUri.toString(),
                        childSymbols: [], // Will be populated below
                        location
                    };

                    this.workspaceIndex.headerDefinitions.set(identifier, headerDef);
                    this.workspaceIndex.symbolToFile.set(identifier, fileUri.toString());
                    fileHeaders.push(identifier);
                }

                // Find child definitions under headers
                // For traditional files (non-.blk): look for nested def statements
                if (!fileUri.fsPath.endsWith('.blk')) {
                    console.log(`[DEBUG] Checking line ${lineIndex} for child symbols: "${originalLine}"`);
                    // Check for indented def statements (original line, not trimmed)
                    const childMatch = originalLine.match(/^\s+def\s+\w+\s+([A-Za-z0-9_]+)/);
                    if (childMatch) {
                        const childIdentifier = childMatch[1];
                        console.log(`[DEBUG] Found child symbol '${childIdentifier}' in file ${fileUri.fsPath}`);
                        childSymbols.push(childIdentifier);
                        this.workspaceIndex.symbolToFile.set(childIdentifier, fileUri.toString());
                    } else if (line.startsWith('def ') && line.includes('function ')) {
                        // More permissive fallback check for any def function
                        const fallbackMatch = line.match(/^def\s+function\s+([A-Za-z0-9_]+)/);
                        if (fallbackMatch) {
                            const childIdentifier = fallbackMatch[1];
                            console.log(`[DEBUG] Found child symbol (fallback) '${childIdentifier}' in file ${fileUri.fsPath}`);
                            childSymbols.push(childIdentifier);
                            this.workspaceIndex.symbolToFile.set(childIdentifier, fileUri.toString());
                        }
                    }
                } else {
                    console.log(`[DEBUG] Skipping .blk file line ${lineIndex}: "${originalLine}"`);
                }
                // For .blk files: the header identifier IS the symbol (no child symbols)
            }

            // Update child symbols for headers in this file
            for (const headerId of fileHeaders) {
                const headerDef = this.workspaceIndex.headerDefinitions.get(headerId);
                if (headerDef) {
                    headerDef.childSymbols = childSymbols;
                    console.log(`[DEBUG] Updated header '${headerId}' with child symbols:`, childSymbols);
                }
            }

            this.workspaceIndex.fileToHeaders.set(fileUri.toString(), fileHeaders);

        } catch (error) {
            console.error(`Error indexing file ${fileUri.fsPath}:`, error);
        }
    }

    /**
     * Update document parsing to include import tracking
     */
    public async parseDocumentWithImports(document: vscode.TextDocument, languageConfig: LanguageConfig): Promise<void> {
        // Parse imports first
        const importStatements = this.parseImportStatements(document);
        this.imports.set(document.uri.toString(), importStatements);

        // Call existing parseDocument method (unchanged)
        await this.parseDocument(document, languageConfig);

        // Update workspace index for this file
        await this.indexFileHeaders(document.uri);
    }

    /**
     * Get imports for a specific document
     */
    public getDocumentImports(documentUri: string): ImportStatement[] {
        return this.imports.get(documentUri) || [];
    }

    /**
     * Check if a symbol is available in the given document (either defined locally or imported)
     */
    public isSymbolAvailable(symbolName: string, documentUri: string): boolean {
        // STRICT IMPORT SYSTEM: Only check imports, no local workspace fallback
        
        // Check if symbol is imported
        const imports = this.getDocumentImports(documentUri);
        console.log(`[DEBUG] Checking symbol '${symbolName}' with imports:`, imports.map(i => `${i.keyword} ${i.identifier}`));
        
        for (const importStmt of imports) {
            const headerDef = this.workspaceIndex.headerDefinitions.get(importStmt.identifier);
            if (headerDef) {
                console.log(`[DEBUG] Found header '${importStmt.identifier}' with childSymbols:`, headerDef.childSymbols);
                // Check selective imports
                if (importStmt.selectiveImports) {
                    if (importStmt.selectiveImports.includes(symbolName)) {
                        console.log(`[DEBUG] Symbol '${symbolName}' found in selective imports`);
                        return true;
                    }
                } else {
                    // Simple import - check if symbol matches the header identifier OR is in child symbols
                    if (importStmt.identifier === symbolName || headerDef.childSymbols.includes(symbolName)) {
                        console.log(`[DEBUG] Symbol '${symbolName}' available via import '${importStmt.identifier}'`);
                        return true;
                    }
                }
            } else {
                console.log(`[DEBUG] Header '${importStmt.identifier}' not found in workspace index`);
            }
        }

        // Check if symbol is defined locally in THIS document only (for block self-references)
        const localSymbols = this.workspaceSymbols.get(documentUri) || [];
        if (localSymbols.some(sym => sym.name === symbolName && sym.location.uri.toString() === documentUri)) {
            return true;
        }

        return false;
    }

    /**
     * Get available symbols for a document (local + imported)
     */
    public getAvailableSymbols(documentUri: string): SymbolDefinition[] {
        const availableSymbols: SymbolDefinition[] = [];

        // Add local symbols
        const localSymbols = this.workspaceSymbols.get(documentUri) || [];
        availableSymbols.push(...localSymbols);

        // Add imported symbols
        const imports = this.getDocumentImports(documentUri);
        for (const importStmt of imports) {
            const headerDef = this.workspaceIndex.headerDefinitions.get(importStmt.identifier);
            if (headerDef && headerDef.fileUri !== documentUri) {
                const importedFileSymbols = this.workspaceSymbols.get(headerDef.fileUri) || [];
                
                if (importStmt.selectiveImports) {
                    // Add only selective imports
                    const selectiveSymbols = importedFileSymbols.filter(sym => 
                        importStmt.selectiveImports!.includes(sym.name)
                    );
                    availableSymbols.push(...selectiveSymbols);
                } else {
                    // Add all symbols from imported header
                    availableSymbols.push(...importedFileSymbols);
                }
            }
        }

        return availableSymbols;
    }

    /**
     * Validate imports in a document
     */
    public validateImports(documentUri: string): { errors: { message: string; range: vscode.Range }[]; warnings: { message: string; range: vscode.Range }[] } {
        const errors: { message: string; range: vscode.Range }[] = [];
        const warnings: { message: string; range: vscode.Range }[] = [];
        const imports = this.getDocumentImports(documentUri);
        const usedSymbols = new Set<string>();

        // Collect used symbols in document
        const documentSymbols = this.symbols.get(documentUri);
        if (documentSymbols) {
            documentSymbols.references.forEach(ref => usedSymbols.add(ref.name));
        }

        for (const importStmt of imports) {
            // Check if imported header exists
            const headerDef = this.workspaceIndex.headerDefinitions.get(importStmt.identifier);
            if (!headerDef) {
                errors.push({
                    message: `Import error: '${importStmt.identifier}' not found in workspace`,
                    range: importStmt.range
                });
                continue;
            }

            // Check if import is used
            let importUsed = false;
            if (importStmt.selectiveImports) {
                importUsed = importStmt.selectiveImports.some(sym => usedSymbols.has(sym));
            } else {
                // Check if header identifier itself is used OR any child symbols are used
                importUsed = usedSymbols.has(importStmt.identifier) || headerDef.childSymbols.some(sym => usedSymbols.has(sym));
            }

            if (!importUsed) {
                warnings.push({
                    message: `Unused import: '${importStmt.identifier}'`,
                    range: importStmt.range
                });
            }
        }

        return { errors, warnings };
    }

    /**
     * Clear import data for a document
     */
    public clearDocumentImports(documentUri: string): void {
        this.imports.delete(documentUri);
        
        // Also clear from workspace index
        const headers = this.workspaceIndex.fileToHeaders.get(documentUri) || [];
        for (const header of headers) {
            this.workspaceIndex.headerDefinitions.delete(header);
            this.workspaceIndex.symbolToFile.delete(header);
        }
        this.workspaceIndex.fileToHeaders.delete(documentUri);
    }

    /**
     * Get workspace index (for debugging/testing)
     */
    public getWorkspaceIndex(): WorkspaceIndex {
        return this.workspaceIndex;
    }
}