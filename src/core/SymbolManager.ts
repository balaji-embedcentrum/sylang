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
        const documentSymbols: SymbolDefinition[] = [];
        const documentReferences: SymbolReference[] = [];
        
        const text = document.getText();
        const lines = text.split('\n');
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('//') || trimmedLine.length === 0) {
                continue;
            }
            
            // Check for definitions (lines starting with 'def')
            if (trimmedLine.startsWith('def ')) {
                const definition = this.parseDefinition(document, lineIndex, trimmedLine, languageConfig);
                if (definition) {
                    documentSymbols.push(definition);
                }
            } else {
                // Check for references (identifiers that are not definitions)
                const references = this.parseReferences(document, lineIndex, trimmedLine, languageConfig);
                documentReferences.push(...references);
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
     * Parse a definition line (starts with 'def')
     */
    private parseDefinition(
        document: vscode.TextDocument, 
        lineIndex: number, 
        line: string, 
        languageConfig: LanguageConfig
    ): SymbolDefinition | null {
        // Remove 'def ' prefix
        const content = line.substring(4).trim();
        
        // Parse based on language type
        if (languageConfig.id === 'sylang-productline') {
            return this.parseProductLineDefinition(document, lineIndex, content);
        } else if (languageConfig.id === 'sylang-features') {
            return this.parseFeatureDefinition(document, lineIndex, content);
        } else if (languageConfig.id === 'sylang-functions') {
            return this.parseFunctionDefinition(document, lineIndex, content);
        }
        
        return null;
    }

    /**
     * Parse product line definition
     */
    private parseProductLineDefinition(
        document: vscode.TextDocument, 
        lineIndex: number, 
        content: string
    ): SymbolDefinition | null {
        const match = content.match(/^productline\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (!match || !match[1]) return null;
        
        const name = match[1];
        const range = new vscode.Range(lineIndex, 0, lineIndex, content.length);
        const location = new vscode.Location(document.uri, range);
        
        return {
            name,
            kind: 'productline',
            location,
            properties: new Map(),
            range
        };
    }

    /**
     * Parse feature definition
     */
    private parseFeatureDefinition(
        document: vscode.TextDocument, 
        lineIndex: number, 
        content: string
    ): SymbolDefinition | null {
        // Match: feature <name> [mandatory|optional|alternative|or]
        const match = content.match(/^(systemfeatures|feature)\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(mandatory|optional|alternative|or))?/);
        if (!match || !match[1] || !match[2]) return null;
        
        const keyword = match[1];
        const name = match[2];
        const variability = match[3] || '';
        
        const range = new vscode.Range(lineIndex, 0, lineIndex, content.length);
        const location = new vscode.Location(document.uri, range);
        
        const properties = new Map<string, string>();
        if (variability) {
            properties.set('variability', variability);
        }
        
        return {
            name,
            kind: keyword,
            location,
            properties,
            range
        };
    }

    /**
     * Parse def function definition
     */
    private parseFunctionDefinition(
        document: vscode.TextDocument, 
        lineIndex: number, 
        content: string
    ): SymbolDefinition | null {
        // Match: systemfunctions <name> or def function <name>
        const match = content.match(/^(systemfunctions|function)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (!match || !match[1] || !match[2]) return null;
        
        const keyword = match[1];
        const name = match[2];
        
        const range = new vscode.Range(lineIndex, 0, lineIndex, content.length);
        const location = new vscode.Location(document.uri, range);
        
        return {
            name,
            kind: keyword,
            location,
            properties: new Map(),
            range
        };
    }

    /**
     * Parse references in a line (identifiers that are not definitions)
     */
    private parseReferences(
        document: vscode.TextDocument, 
        lineIndex: number, 
        line: string, 
        languageConfig: LanguageConfig
    ): SymbolReference[] {
        const references: SymbolReference[] = [];
        
        // Find all potential identifiers (words that could be references)
        const identifierRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
        let match;
        
        while ((match = identifierRegex.exec(line)) !== null) {
            const identifier = match[1];
            if (!identifier) continue;
            const startPos = match.index;
            const endPos = startPos + identifier.length;
            
            // Skip if it's a keyword
            if (languageConfig.keywords.includes(identifier)) {
                continue;
            }
            
            // Skip if it's a property value (after colon or equals)
            const beforeMatch = line.substring(0, startPos);
            if (beforeMatch.includes(':') || beforeMatch.includes('=')) {
                continue;
            }
            
            // This is a potential reference
            const range = new vscode.Range(lineIndex, startPos, lineIndex, endPos);
            const location = new vscode.Location(document.uri, range);
            
            references.push({
                name: identifier,
                location,
                context: line.trim(),
                range
            });
        }
        
        return references;
    }

    /**
     * Find definition for a symbol
     */
    public findDefinition(symbolName: string, document?: vscode.TextDocument): SymbolDefinition | null {
        // First check in the current document
        if (document) {
            const documentKey = document.uri.toString();
            const documentSymbols = this.symbols.get(documentKey);
            if (documentSymbols) {
                const definition = documentSymbols.definitions.find(d => d.name === symbolName);
                if (definition) {
                    return definition;
                }
            }
        }
        
        // Then check in workspace symbols
        for (const [_, definitions] of this.workspaceSymbols) {
            const definition = definitions.find(d => d.name === symbolName);
            if (definition) {
                return definition;
            }
        }
        
        return null;
    }

    /**
     * Find all references for a symbol
     */
    public findReferences(symbolName: string): SymbolReference[] {
        const references: SymbolReference[] = [];
        
        for (const [_, symbolInfo] of this.symbols) {
            const symbolRefs = symbolInfo.references.filter(r => r.name === symbolName);
            references.push(...symbolRefs);
        }
        
        return references;
    }

    /**
     * Get all definitions in the workspace
     */
    public getAllDefinitions(): SymbolDefinition[] {
        const allDefinitions: SymbolDefinition[] = [];
        
        for (const [_, definitions] of this.workspaceSymbols) {
            allDefinitions.push(...definitions);
        }
        
        return allDefinitions;
    }

    /**
     * Update workspace symbols when a document changes
     */
    private updateWorkspaceSymbols(documentUri: string, definitions: SymbolDefinition[]): void {
        this.workspaceSymbols.set(documentUri, definitions);
    }

    /**
     * Clear symbols for a document (when it's deleted or closed)
     */
    public clearDocumentSymbols(documentUri: string): void {
        this.symbols.delete(documentUri);
        this.workspaceSymbols.delete(documentUri);
    }

    /**
     * Get symbol information for a document
     */
    public getDocumentSymbols(documentUri: string): SymbolInfo | undefined {
        return this.symbols.get(documentUri);
    }
} 