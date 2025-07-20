import * as vscode from 'vscode';
import { ISymbolDefinition, IImportInfo, IImportManager } from '../interfaces';

/**
 * Import Manager for handling parent symbol imports and child symbol visibility
 * Implements the rule: "use imports parent symbols, making parent + children visible"
 */
export class ImportManager implements IImportManager {
    private importsByDocument = new Map<string, IImportInfo[]>();
    private symbolsByParent = new Map<string, ISymbolDefinition[]>();
    private visibleSymbolsByDocument = new Map<string, Set<string>>();
    
    constructor(private symbolManager: any) {
        // Listen for symbol changes to update parent-child relationships
        this.rebuildParentChildIndex();
    }

    // =============================================================================
    // IImportManager INTERFACE IMPLEMENTATION
    // =============================================================================

    parseImportStatement(line: string, document: vscode.TextDocument, lineIndex: number): any {
        return this.processImportStatement(document.uri.toString(), line, lineIndex);
    }

    async resolveImport(importStatement: any, context: any): Promise<any> {
        // Implementation for interface compatibility
        return { resolvedSymbols: [], errors: [], warnings: [] };
    }

    async resolveAllImports(document: vscode.TextDocument): Promise<any> {
        // Implementation for interface compatibility
        return { imports: [], errors: [], warnings: [] };
    }

    parseMultiImport(importStatement: any): any {
        return { identifiers: [], errors: [] };
    }

    async resolveMultiImport(multiImport: any, context: any): Promise<any> {
        return { resolvedSymbols: [], errors: [] };
    }

    getDependencies(documentUri: string): string[] {
        return [];
    }

    getDependents(documentUri: string): string[] {
        return [];
    }

    buildDependencyGraph(): any {
        return { nodes: [], edges: [] };
    }

    detectCircularDependencies(): any[] {
        return [];
    }

    getAvailableSymbols(documentUri: string): ISymbolDefinition[] {
        return this.getVisibleSymbols(documentUri);
    }

    getImportedSymbols(documentUri: string): ISymbolDefinition[] {
        return [];
    }

    getExportedSymbols(documentUri: string): ISymbolDefinition[] {
        return [];
    }

    validateImport(importStatement: any, context: any): any {
        return { isValid: true, errors: [], warnings: [] };
    }

    async validateAllImports(document: vscode.TextDocument): Promise<any[]> {
        return [];
    }

    suggestImports(symbolName: string, documentUri: string): any[] {
        return this.getImportSuggestions(symbolName);
    }

    getAutoImportCandidates(documentUri: string): any[] {
        return [];
    }

    generateImportStatement(symbolId: string, targetDocument: string): string | undefined {
        return undefined;
    }

    resolveTransitiveDependencies(documentUri: string): any {
        return { directDependencies: [], transitiveDependencies: [] };
    }

    getSymbolChain(symbolId: string): any {
        return { rootSymbol: null, chain: [], documents: [] };
    }

    // Add missing methods for IImportManager interface
    onImportResolved: any = undefined;
    onDependencyChanged: any = undefined;
    
    clearImportCache(): void {
        // Clear import cache
    }
    
    refreshImports(documentUri: string): Promise<void> {
        return Promise.resolve();
    }
    
    validateWorkspaceImports(): Promise<any> {
        return Promise.resolve({ isValid: true, errors: [] });
    }
    
    optimizeImportOrder(documentUri: string): string[] {
        return [];
    }
    
    watchImportedFiles(documentUri: string): void {
        // Watch imported files for changes
    }
    
    unwatchImportedFiles(documentUri: string): void {
        // Stop watching imported files
    }

    // =============================================================================
    // CORE IMPORT PROCESSING
    // =============================================================================

    /**
     * Process use statements and resolve parent symbols
     * Format: "use <parentType> <parentName1>, <parentName2>, ..."
     * CRITICAL RULE: Can ONLY import parent symbols, never child symbols
     */
    processImportStatement(documentUri: string, line: string, lineNumber: number): IImportInfo | null {
        // Parse use statement: "use block subsystem ControlSubsystem, PowerSubsystem"
        const importMatch = line.match(/^\s*use\s+(\w+)\s+(.+)$/);
        if (!importMatch) return null;

        const [, parentType, parentNamesString] = importMatch;
        
        // Split parent names by comma and clean them
        const parentNames = parentNamesString
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        const importInfo: IImportInfo = {
            keyword: 'use',
            subkeyword: parentType,
            identifiers: parentNames,
            range: new vscode.Range(lineNumber, 0, lineNumber, line.length),
            location: new vscode.Location(vscode.Uri.parse(documentUri), new vscode.Range(lineNumber, 0, lineNumber, line.length)),
            resolvedSymbols: [],
            unresolvedIdentifiers: [],
            documentUri,
            isResolved: false,
            errors: []
        };

        // Resolve each parent symbol and validate it's actually a parent
        for (const parentName of parentNames) {
            const foundSymbol = this.findSymbolByName(parentName);
            
            if (foundSymbol) {
                // ✅ CRITICAL VALIDATION: Check if it's actually a parent symbol
                if (foundSymbol.parentSymbol) {
                    // ❌ ERROR: Trying to import a child symbol
                    const parentSymbol = this.symbolManager?.getSymbol?.(foundSymbol.parentSymbol);
                    const actualParentName = parentSymbol ? parentSymbol.name : 'Unknown';
                    const actualParentType = parentSymbol ? this.getParentTypeForImport(parentSymbol.type) : 'unknown';
                    
                    const errorMessage = `Cannot import child symbol '${foundSymbol.name}'. ` +
                        `Use 'use ${actualParentType} ${actualParentName}' to import the parent symbol instead.`;
                    
                    (importInfo.errors as string[]).push(errorMessage);
                    (importInfo.unresolvedIdentifiers as string[]).push(foundSymbol.name);
                    
                    console.error(`❌ Invalid import: '${foundSymbol.name}' is a child symbol, not a parent`);
                    continue;
                }
                
                // ✅ Check if it matches the expected parent type
                if (this.isParentSymbolType(foundSymbol.type, parentType)) {
                    (importInfo.resolvedSymbols as ISymbolDefinition[]).push(foundSymbol);
                    
                    // Make parent and all its children visible in this document
                    this.makeSymbolVisible(documentUri, foundSymbol.id);
                    
                    // Get all child symbols and make them visible too
                    const childSymbols = this.getChildSymbols(foundSymbol.id);
                    for (const childSymbol of childSymbols) {
                        this.makeSymbolVisible(documentUri, childSymbol.id);
                    }
                    
                    console.log(`✅ Imported parent symbol: ${foundSymbol.name} (${foundSymbol.type}) + ${childSymbols.length} children`);
                } else {
                    // ❌ ERROR: Symbol exists but wrong type
                    const errorMessage = `Symbol '${foundSymbol.name}' is type '${foundSymbol.type}' but expected parent type '${parentType}'. ` +
                        `Check the import statement syntax.`;
                    
                    (importInfo.errors as string[]).push(errorMessage);
                    (importInfo.unresolvedIdentifiers as string[]).push(foundSymbol.name);
                    
                    console.error(`❌ Type mismatch: '${foundSymbol.name}' is ${foundSymbol.type}, expected ${parentType}`);
                }
            } else {
                // ❌ ERROR: Symbol not found at all
                (importInfo.unresolvedIdentifiers as string[]).push(parentName);
                (importInfo.errors as string[]).push(`Parent symbol not found: ${parentType} ${parentName}`);
                console.error(`❌ Parent symbol not found: ${parentType} ${parentName}`);
            }
        }

        const isResolved = importInfo.unresolvedIdentifiers.length === 0;
        (importInfo as any).isResolved = isResolved;
        
        // Store the import
        const documentImports = this.importsByDocument.get(documentUri) || [];
        documentImports.push(importInfo);
        this.importsByDocument.set(documentUri, documentImports);

        return importInfo;
    }

    // =============================================================================
    // SYMBOL VISIBILITY MANAGEMENT
    // =============================================================================

    /**
     * Check if a symbol is visible in a document
     * Rules:
     * 1. All symbols defined in the document are visible
     * 2. Imported parent symbols are visible
     * 3. Children of imported parent symbols are visible
     * 4. NO other symbols are visible
     */
    isSymbolVisible(documentUri: string, symbolId: string): boolean {
        // Always visible if defined in this document
        if (symbolId.startsWith(documentUri + '#')) {
            return true;
        }

        // Check if explicitly made visible through imports
        const visibleSymbols = this.visibleSymbolsByDocument.get(documentUri);
        return visibleSymbols ? visibleSymbols.has(symbolId) : false;
    }

    /**
     * Get all visible symbols for a document
     */
    getVisibleSymbols(documentUri: string): ISymbolDefinition[] {
        const visibleSymbols: ISymbolDefinition[] = [];
        
        // Add all symbols defined in this document
        const documentSymbols = this.symbolManager?.getSymbolsInDocument?.(documentUri) || [];
        visibleSymbols.push(...documentSymbols);
        
        // Add all imported symbols
        const visibleSymbolIds = this.visibleSymbolsByDocument.get(documentUri) || new Set();
        for (const symbolId of visibleSymbolIds) {
            const symbol = this.symbolManager?.getSymbol?.(symbolId);
            if (symbol) {
                visibleSymbols.push(symbol);
            }
        }

        return visibleSymbols;
    }

    /**
     * Get imports for a document
     */
    getDocumentImports(documentUri: string): IImportInfo[] {
        return this.importsByDocument.get(documentUri) || [];
    }

    /**
     * Clear imports for a document (when document is closed/changed)
     */
    clearDocumentImports(documentUri: string): void {
        this.importsByDocument.delete(documentUri);
        this.visibleSymbolsByDocument.delete(documentUri);
    }

    // =============================================================================
    // SYMBOL RESOLUTION
    // =============================================================================

    /**
     * Find any symbol by name (used for validation)
     */
    private findSymbolByName(symbolName: string): ISymbolDefinition | undefined {
        const allSymbols = this.symbolManager?.getAllSymbols?.() || [];
        return allSymbols.find(symbol => symbol.name === symbolName);
    }

    /**
     * Find a parent symbol by type and name across all documents
     * This specifically looks for parent symbols (no parentSymbol property)
     */
    private findParentSymbol(parentType: string, parentName: string): ISymbolDefinition | undefined {
        // Get all symbols from the symbol manager
        const allSymbols = this.symbolManager?.getAllSymbols?.() || [];
        
        // Find parent symbol that matches type, name, and is actually a parent (no parentSymbol)
        return allSymbols.find(symbol => 
            this.isParentSymbolType(symbol.type, parentType) && 
            symbol.name === parentName &&
            !symbol.parentSymbol  // ✅ MUST be a root-level parent symbol
        );
    }

    /**
     * Check if a symbol type matches the expected parent type
     */
    private isParentSymbolType(symbolType: string, expectedParentType: string): boolean {
        // Map parent types to symbol types
        const parentTypeMap: Record<string, string[]> = {
            'productline': ['productline'],
            'featureset': ['featureset'],
            'variantmodel': ['variantmodel'],
            'configset': ['configset'],
            'functiongroup': ['functiongroup'],
            'block': ['system', 'subsystem', 'component'], // block can be system/subsystem/component
            'reqsection': ['reqsection'],
            'testsuite': ['testsuite'],
            'failuremodeanalysis': ['failuremodeanalysis'],
            'controlmeasures': ['controlmeasures'],
            'faulttreeanalysis': ['faulttreeanalysis'],
            'itemdefinition': ['itemdefinition'],
            'hazardidentification': ['hazardidentification'],
            'riskassessment': ['riskassessment'],
            'safetygoals': ['safetygoals']
        };

        const validTypes = parentTypeMap[expectedParentType] || [expectedParentType];
        return validTypes.includes(symbolType);
    }

    /**
     * Get all child symbols of a parent symbol
     */
    private getChildSymbols(parentSymbolId: string): ISymbolDefinition[] {
        return this.symbolsByParent.get(parentSymbolId) || [];
    }

    /**
     * Make a symbol visible in a document
     */
    private makeSymbolVisible(documentUri: string, symbolId: string): void {
        if (!this.visibleSymbolsByDocument.has(documentUri)) {
            this.visibleSymbolsByDocument.set(documentUri, new Set());
        }
        
        this.visibleSymbolsByDocument.get(documentUri)!.add(symbolId);
    }

    /**
     * Rebuild parent-child symbol index
     */
    private rebuildParentChildIndex(): void {
        this.symbolsByParent.clear();
        
        const allSymbols = this.symbolManager?.getAllSymbols?.() || [];
        
        for (const symbol of allSymbols) {
            if (symbol.parentSymbol) {
                const siblings = this.symbolsByParent.get(symbol.parentSymbol) || [];
                siblings.push(symbol);
                this.symbolsByParent.set(symbol.parentSymbol, siblings);
            }
        }
        
        console.log(`🔄 Rebuilt parent-child index: ${this.symbolsByParent.size} parent symbols`);
    }

    // =============================================================================
    // VALIDATION HELPERS
    // =============================================================================

    /**
     * Validate that a referenced symbol is visible in the current document
     */
    validateSymbolReference(documentUri: string, referencedSymbolName: string, symbolType?: string): {
        isValid: boolean;
        error?: string;
        suggestions?: string[];
    } {
        const visibleSymbols = this.getVisibleSymbols(documentUri);
        
        // Find symbols with matching name
        const matchingSymbols = visibleSymbols.filter(symbol => 
            symbol.name === referencedSymbolName && 
            (!symbolType || symbol.type === symbolType)
        );

        if (matchingSymbols.length > 0) {
            return { isValid: true };
        }

        // Generate suggestions
        const suggestions = visibleSymbols
            .filter(symbol => this.levenshteinDistance(symbol.name, referencedSymbolName) <= 2)
            .map(symbol => symbol.name)
            .slice(0, 3);

        return {
            isValid: false,
            error: `Symbol '${referencedSymbolName}' is not visible. Use 'use' to import it.`,
            suggestions
        };
    }

    /**
     * Get import suggestions for unresolved references
     */
    getImportSuggestions(symbolName: string, symbolType?: string): string[] {
        const allSymbols = this.symbolManager?.getAllSymbols?.() || [];
        
        // Find parent symbols that contain the referenced symbol as a child
        const suggestions: string[] = [];
        
        for (const symbol of allSymbols) {
            if (symbol.name === symbolName && (!symbolType || symbol.type === symbolType)) {
                // This is the symbol we're looking for
                if (symbol.parentSymbol) {
                    const parentSymbol = this.symbolManager?.getSymbol?.(symbol.parentSymbol);
                    if (parentSymbol) {
                        const parentType = this.getParentTypeForImport(parentSymbol.type);
                        if (parentType) {
                            suggestions.push(`use ${parentType} ${parentSymbol.name}`);
                        }
                    }
                }
            }
        }

        return suggestions;
    }

    /**
     * Map symbol type to import parent type
     */
    private getParentTypeForImport(symbolType: string): string | undefined {
        const typeMap: Record<string, string> = {
            'functiongroup': 'functiongroup',
            'featureset': 'featureset',
            'system': 'block',
            'subsystem': 'block',
            'component': 'block',
            'reqsection': 'reqsection',
            'testsuite': 'testsuite',
            'productline': 'productline',
            'variantmodel': 'variantmodel',
            'configset': 'configset',
            'failuremodeanalysis': 'failuremodeanalysis',
            'controlmeasures': 'controlmeasures',
            'faulttreeanalysis': 'faulttreeanalysis',
            'itemdefinition': 'itemdefinition',
            'hazardidentification': 'hazardidentification',
            'riskassessment': 'riskassessment',
            'safetygoals': 'safetygoals'
        };

        return typeMap[symbolType];
    }

    /**
     * Calculate edit distance for suggestions
     */
    private levenshteinDistance(a: string, b: string): number {
        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

        for (let i = 0; i <= a.length; i += 1) {
            matrix[0][i] = i;
        }

        for (let j = 0; j <= b.length; j += 1) {
            matrix[j][0] = j;
        }

        for (let j = 1; j <= b.length; j += 1) {
            for (let i = 1; i <= a.length; i += 1) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }

        return matrix[b.length][a.length];
    }
} 