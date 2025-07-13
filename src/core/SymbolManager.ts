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

export class SymbolManager {
    private symbols: Map<string, SymbolInfo> = new Map();
    private workspaceSymbols: Map<string, SymbolDefinition[]> = new Map();

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
            'item': ['name', 'description', 'owner', 'reviewers', 'productline', 'systemfeatures', 'systemfunctions'],
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
            'asil': ['risk', 'description'],
            'hazard': ['scenario', 'asil', 'rationale']
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
            'goal': ['name', 'description', 'hazard', 'scenario', 'asil'],
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
            'requirement': ['name', 'description', 'type', 'source', 'derivedfrom', 'asil', 'rationale', 'allocatedto', 'verificationcriteria', 'status']
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
            'subsystem': ['name', 'description', 'owner', 'tags', 'safetylevel', 'asil', 'enables', 'implements']
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
            'function': ['name', 'description', 'category', 'owner', 'tags', 'asil', 'partof', 'enables', 'allocatedto']
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
                    const keyword = parts[1]; // systemfeatures, feature
                    const name = parts[2];

                    if (keyword === 'systemfeatures') {
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
}