import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { 
    ISymbolManager, 
    ISymbolDefinition, 
    ISymbolReference, 
    ISymbolIndex, 
    ISymbolHierarchy,
    ISymbolChangeEvent,
    ISymbolVisibilityEvent,
    ISymbolMetadata,
    IImportInfo,
    IParsingResult,
    SymbolType,
    ReferenceType
} from '../interfaces';

// =============================================================================
// SYMBOL MANAGER IMPLEMENTATION
// =============================================================================

/**
 * Comprehensive symbol manager with hierarchical relationships and cross-file resolution
 */
export class SymbolManager implements ISymbolManager {
    private readonly symbols = new Map<string, ISymbolDefinition>();
    private readonly symbolsByName = new Map<string, ISymbolDefinition[]>();
    private readonly symbolsByType = new Map<SymbolType, ISymbolDefinition[]>();
    private readonly symbolsByDocument = new Map<string, ISymbolDefinition[]>();
    private readonly references = new Map<string, ISymbolReference[]>();
    private readonly hierarchy = new Map<string, string[]>(); // parentId -> childIds
    private readonly reverseHierarchy = new Map<string, string>(); // childId -> parentId
    private readonly documentImports = new Map<string, IImportInfo[]>();
    private readonly visibilityMap = new Map<string, boolean>();
    
    private readonly changeEventEmitter = new vscode.EventEmitter<ISymbolChangeEvent>();
    private readonly visibilityEventEmitter = new vscode.EventEmitter<ISymbolVisibilityEvent>();
    
    private indexVersion = 0;
    private lastIndexUpdate = new Date();

    constructor(private readonly configurationManager?: any) {}

    // =============================================================================
    // DOCUMENT-LEVEL OPERATIONS
    // =============================================================================

    async indexDocument(document: vscode.TextDocument, result: IParsingResult): Promise<void> {
        const documentUri = document.uri.toString();
        
        // Remove existing symbols for this document
        await this.removeDocument(documentUri);
        
        // Add new symbols
        for (const symbol of result.symbols) {
            this.addSymbol(symbol);
        }
        
        // Add references
        for (const reference of result.references) {
            this.addReference(reference);
        }
        
        // Store imports
        this.documentImports.set(documentUri, result.imports);
        
        // Update index version
        this.indexVersion++;
        this.lastIndexUpdate = new Date();
        
        // Emit change events
        for (const symbol of result.symbols) {
            this.changeEventEmitter.fire({
                type: 'added',
                symbolId: symbol.id,
                symbol,
                documentUri,
                timestamp: new Date()
            });
        }
    }

    async removeDocument(documentUri: string): Promise<void> {
        const existingSymbols = this.symbolsByDocument.get(documentUri) || [];
        
        // Remove symbols
        for (const symbol of existingSymbols) {
            this.removeSymbol(symbol.id);
        }
        
        // Remove document references
        this.symbolsByDocument.delete(documentUri);
        this.documentImports.delete(documentUri);
        
        // Clean up orphaned references
        this.cleanupOrphanedReferences(documentUri);
        
        this.indexVersion++;
    }

    // =============================================================================
    // SYMBOL OPERATIONS
    // =============================================================================

    getSymbol(name: string, documentUri?: string): ISymbolDefinition | undefined {
        const candidates = this.symbolsByName.get(name) || [];
        
        if (!documentUri) {
            return candidates[0]; // Return first match if no document specified
        }
        
        // Prefer symbols from the same document
        const localSymbol = candidates.find(s => s.fileUri === documentUri);
        if (localSymbol) {
            return localSymbol;
        }
        
        // Check for imported symbols
        const availableSymbols = this.getAvailableSymbols(documentUri);
        return availableSymbols.find(s => s.name === name);
    }

    getSymbolsInDocument(documentUri: string): ISymbolDefinition[] {
        return this.symbolsByDocument.get(documentUri) || [];
    }

    getSymbolsByType(symbolType: SymbolType): ISymbolDefinition[] {
        return this.symbolsByType.get(symbolType) || [];
    }

    findReferences(symbolName: string, includeDeclaration = false): ISymbolReference[] {
        const allReferences: ISymbolReference[] = [];
        
        // Get symbol definition
        const symbol = this.getSymbol(symbolName);
        if (!symbol) {
            return [];
        }
        
        // Add declaration if requested
        if (includeDeclaration) {
            allReferences.push({
                id: `${symbol.id}_declaration`,
                name: symbol.name,
                symbolId: symbol.id,
                location: symbol.location,
                range: symbol.range,
                context: 'declaration',
                referenceType: ReferenceType.DECLARATION,
                documentUri: symbol.fileUri
            });
        }
        
        // Get references to this symbol
        const symbolReferences = this.references.get(symbol.id) || [];
        allReferences.push(...symbolReferences);
        
        return allReferences;
    }

    // =============================================================================
    // IMPORT OPERATIONS
    // =============================================================================

    resolveImport(importInfo: IImportInfo, fromDocument: string): ISymbolDefinition[] {
        const resolvedSymbols: ISymbolDefinition[] = [];
        
        for (const identifier of importInfo.identifiers) {
            const symbol = this.findImportedSymbol(identifier, importInfo.keyword, importInfo.subkeyword);
            if (symbol && this.isSymbolVisibleFrom(symbol, fromDocument)) {
                // Add the parent symbol itself
                resolvedSymbols.push(symbol);
                
                // Add all child symbols (filtered by config via getChildSymbols)
                // This ensures that when you do "use functiongroup MyFunctions", 
                // all functions in MyFunctions become available (unless grayed out by config)
                const childSymbols = this.getChildSymbols(symbol.id);
                for (const childSymbol of childSymbols) {
                    if (this.isSymbolVisibleFrom(childSymbol, fromDocument)) {
                        resolvedSymbols.push(childSymbol);
                    }
                }
            }
        }
        
        return resolvedSymbols;
    }

    getAvailableSymbols(documentUri: string): ISymbolDefinition[] {
        const availableSymbols: ISymbolDefinition[] = [];
        
        // Add symbols from current document
        const localSymbols = this.getSymbolsInDocument(documentUri);
        availableSymbols.push(...localSymbols);
        
        // Add imported symbols
        const imports = this.documentImports.get(documentUri) || [];
        for (const importInfo of imports) {
            const importedSymbols = this.resolveImport(importInfo, documentUri);
            availableSymbols.push(...importedSymbols);
        }
        
        return this.filterVisibleSymbols(availableSymbols);
    }

    getDocumentImports(documentUri: string): IImportInfo[] {
        return this.documentImports.get(documentUri) || [];
    }

    // =============================================================================
    // HIERARCHY OPERATIONS
    // =============================================================================

    getChildSymbols(parentSymbolId: string): ISymbolDefinition[] {
        const childIds = this.hierarchy.get(parentSymbolId) || [];
        const childSymbols = childIds.map(id => this.symbols.get(id)).filter(Boolean) as ISymbolDefinition[];
        
        // Filter out symbols that are disabled by configuration (config = 0)
        // This ensures that when imports are resolved, grayed-out symbols are not available
        // and existing validation will show "Unknown identifier" errors
        if (this.configurationManager) {
            return childSymbols.filter(symbol => this.configurationManager.isSymbolEnabled(symbol.id));
        }
        
        return childSymbols;
    }

    getParentSymbol(childSymbolId: string): ISymbolDefinition | undefined {
        const parentId = this.reverseHierarchy.get(childSymbolId);
        return parentId ? this.symbols.get(parentId) : undefined;
    }

    getSymbolHierarchy(symbolId: string): ISymbolHierarchy {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) {
            throw new Error(`Symbol not found: ${symbolId}`);
        }
        
        // Find root symbol
        let root = symbol;
        let ancestors: ISymbolDefinition[] = [];
        let current = symbol;
        
        while (current.parentSymbol) {
            const parent = this.symbols.get(current.parentSymbol);
            if (!parent) break;
            ancestors.unshift(parent);
            root = parent;
            current = parent;
        }
        
        // Find all descendants
        const descendants = this.getAllDescendants(symbolId);
        
        // Find siblings
        const siblings = symbol.parentSymbol 
            ? this.getChildSymbols(symbol.parentSymbol).filter(s => s.id !== symbolId)
            : [];
        
        return {
            root,
            ancestors,
            descendants,
            siblings,
            depth: ancestors.length
        };
    }

    // =============================================================================
    // WORKSPACE OPERATIONS
    // =============================================================================

    async buildWorkspaceIndex(): Promise<void> {
        // Clear existing index
        this.symbols.clear();
        this.symbolsByName.clear();
        this.symbolsByType.clear();
        this.symbolsByDocument.clear();
        this.references.clear();
        this.hierarchy.clear();
        this.reverseHierarchy.clear();
        this.documentImports.clear();
        
        // Find all Sylang files in workspace
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }
        
        const fileExtensions = ['.ple', '.fml', '.vml', '.vcf', '.fun', '.blk', '.req', '.tst', 
                              '.fma', '.fmc', '.fta', '.itm', '.haz', '.rsk', '.sgl'];
        
        for (const folder of workspaceFolders) {
            for (const extension of fileExtensions) {
                const files = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(folder, `**/*${extension}`),
                    '**/node_modules/**'
                );
                
                for (const file of files) {
                    try {
                        const document = await vscode.workspace.openTextDocument(file);
                        // Note: In real implementation, would parse document here
                        // For now, just index the document structure
                        await this.indexDocumentStructure(document);
                    } catch (error) {
                        console.error(`Failed to index ${file.toString()}:`, error);
                    }
                }
            }
        }
        
        this.indexVersion++;
        this.lastIndexUpdate = new Date();
    }

    getWorkspaceSymbols(): ISymbolIndex {
        return {
            symbols: new Map(this.symbolsByName),
            references: new Map(this.references),
            imports: new Map(this.documentImports),
            hierarchy: new Map(this.hierarchy),
            lastUpdated: this.lastIndexUpdate,
            version: this.indexVersion
        };
    }

    async refreshSymbol(symbolId: string): Promise<void> {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) {
            return;
        }
        
        try {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(symbol.fileUri));
            // Note: In real implementation, would re-parse just this symbol
            await this.indexDocumentStructure(document);
        } catch (error) {
            console.error(`Failed to refresh symbol ${symbolId}:`, error);
        }
    }

    // =============================================================================
    // CONFIGURATION INTEGRATION
    // =============================================================================

    updateSymbolVisibility(symbolId: string, isVisible: boolean): void {
        const oldVisibility = this.visibilityMap.get(symbolId) ?? true;
        this.visibilityMap.set(symbolId, isVisible);
        
        if (oldVisibility !== isVisible) {
            const symbol = this.symbols.get(symbolId);
            this.visibilityEventEmitter.fire({
                symbolId,
                isVisible,
                reason: 'configuration',
                configKey: symbol?.configKey,
                timestamp: new Date()
            });
        }
    }

    getVisibleSymbols(documentUri: string): ISymbolDefinition[] {
        const availableSymbols = this.getAvailableSymbols(documentUri);
        return this.filterVisibleSymbols(availableSymbols);
    }

    // =============================================================================
    // EVENT HANDLING
    // =============================================================================

    onSymbolChanged(listener: (event: ISymbolChangeEvent) => void): vscode.Disposable {
        return this.changeEventEmitter.event(listener);
    }

    onSymbolVisibilityChanged(listener: (event: ISymbolVisibilityEvent) => void): vscode.Disposable {
        return this.visibilityEventEmitter.event(listener);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private addSymbol(symbol: ISymbolDefinition): void {
        // Add to main symbol map
        this.symbols.set(symbol.id, symbol);
        
        // Add to name-based index
        const nameList = this.symbolsByName.get(symbol.name) || [];
        nameList.push(symbol);
        this.symbolsByName.set(symbol.name, nameList);
        
        // Add to type-based index
        const typeList = this.symbolsByType.get(symbol.type) || [];
        typeList.push(symbol);
        this.symbolsByType.set(symbol.type, typeList);
        
        // Add to document-based index
        const docList = this.symbolsByDocument.get(symbol.fileUri) || [];
        docList.push(symbol);
        this.symbolsByDocument.set(symbol.fileUri, docList);
        
        // Update hierarchy
        if (symbol.parentSymbol) {
            const children = this.hierarchy.get(symbol.parentSymbol) || [];
            children.push(symbol.id);
            this.hierarchy.set(symbol.parentSymbol, children);
            this.reverseHierarchy.set(symbol.id, symbol.parentSymbol);
        }
        
        // Set initial visibility
        if (this.configurationManager) {
            const isVisible = this.configurationManager.isSymbolVisible(symbol.id);
            this.visibilityMap.set(symbol.id, isVisible);
        } else {
            this.visibilityMap.set(symbol.id, true);
        }
    }

    private removeSymbol(symbolId: string): void {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) {
            return;
        }
        
        // Remove from main map
        this.symbols.delete(symbolId);
        
        // Remove from name-based index
        const nameList = this.symbolsByName.get(symbol.name) || [];
        const nameIndex = nameList.findIndex(s => s.id === symbolId);
        if (nameIndex >= 0) {
            nameList.splice(nameIndex, 1);
            if (nameList.length === 0) {
                this.symbolsByName.delete(symbol.name);
            } else {
                this.symbolsByName.set(symbol.name, nameList);
            }
        }
        
        // Remove from type-based index
        const typeList = this.symbolsByType.get(symbol.type) || [];
        const typeIndex = typeList.findIndex(s => s.id === symbolId);
        if (typeIndex >= 0) {
            typeList.splice(typeIndex, 1);
            if (typeList.length === 0) {
                this.symbolsByType.delete(symbol.type);
            } else {
                this.symbolsByType.set(symbol.type, typeList);
            }
        }
        
        // Remove from document-based index
        const docList = this.symbolsByDocument.get(symbol.fileUri) || [];
        const docIndex = docList.findIndex(s => s.id === symbolId);
        if (docIndex >= 0) {
            docList.splice(docIndex, 1);
            if (docList.length === 0) {
                this.symbolsByDocument.delete(symbol.fileUri);
            } else {
                this.symbolsByDocument.set(symbol.fileUri, docList);
            }
        }
        
        // Remove from hierarchy
        if (symbol.parentSymbol) {
            const children = this.hierarchy.get(symbol.parentSymbol) || [];
            const childIndex = children.indexOf(symbolId);
            if (childIndex >= 0) {
                children.splice(childIndex, 1);
                this.hierarchy.set(symbol.parentSymbol, children);
            }
            this.reverseHierarchy.delete(symbolId);
        }
        
        // Remove children
        const children = this.hierarchy.get(symbolId) || [];
        for (const childId of children) {
            this.removeSymbol(childId);
        }
        this.hierarchy.delete(symbolId);
        
        // Remove references
        this.references.delete(symbolId);
        
        // Remove visibility
        this.visibilityMap.delete(symbolId);
        
        // Emit change event
        this.changeEventEmitter.fire({
            type: 'removed',
            symbolId,
            oldSymbol: symbol,
            documentUri: symbol.fileUri,
            timestamp: new Date()
        });
    }

    private addReference(reference: ISymbolReference): void {
        const refList = this.references.get(reference.symbolId) || [];
        refList.push(reference);
        this.references.set(reference.symbolId, refList);
    }

    private findImportedSymbol(identifier: string, keyword: string, subkeyword?: string): ISymbolDefinition | undefined {
        // Find symbols that match the import criteria
        const candidates = this.symbolsByName.get(identifier) || [];
        
        for (const symbol of candidates) {
            if (this.matchesImportCriteria(symbol, keyword, subkeyword)) {
                return symbol;
            }
        }
        
        return undefined;
    }

    private matchesImportCriteria(symbol: ISymbolDefinition, keyword: string, subkeyword?: string): boolean {
        // Match based on symbol type and import keywords
        switch (keyword) {
            case 'block':
                if (subkeyword === 'system') return symbol.type === SymbolType.BLOCK_SYSTEM;
                if (subkeyword === 'subsystem') return symbol.type === SymbolType.BLOCK_SUBSYSTEM;
                if (subkeyword === 'component') return symbol.type === SymbolType.BLOCK_COMPONENT;
                return symbol.type.toString().startsWith('block.');
            case 'featureset':
                return symbol.type === SymbolType.FEATURE_SET;
            case 'function':
                return symbol.type === SymbolType.FUNCTION_GROUP;
            case 'requirement':
                return symbol.type === SymbolType.REQ_SECTION;
            default:
                return false;
        }
    }

    private isSymbolVisibleFrom(symbol: ISymbolDefinition, fromDocument: string): boolean {
        // Check basic visibility
        const isVisible = this.visibilityMap.get(symbol.id) ?? true;
        if (!isVisible) {
            return false;
        }
        
        // Check if symbol is exported (for cross-file access)
        if (symbol.fileUri !== fromDocument && !symbol.isExported) {
            return false;
        }
        
        return true;
    }

    private filterVisibleSymbols(symbols: ISymbolDefinition[]): ISymbolDefinition[] {
        return symbols.filter(symbol => {
            const isVisible = this.visibilityMap.get(symbol.id) ?? true;
            return isVisible && symbol.isEnabled;
        });
    }

    private getAllDescendants(symbolId: string): ISymbolDefinition[] {
        const descendants: ISymbolDefinition[] = [];
        const childIds = this.hierarchy.get(symbolId) || [];
        
        for (const childId of childIds) {
            const child = this.symbols.get(childId);
            if (child) {
                descendants.push(child);
                descendants.push(...this.getAllDescendants(childId));
            }
        }
        
        return descendants;
    }

    private cleanupOrphanedReferences(documentUri: string): void {
        for (const [symbolId, references] of this.references.entries()) {
            const filteredRefs = references.filter(ref => ref.documentUri !== documentUri);
            if (filteredRefs.length === 0) {
                this.references.delete(symbolId);
            } else if (filteredRefs.length !== references.length) {
                this.references.set(symbolId, filteredRefs);
            }
        }
    }

    private async indexDocumentStructure(document: vscode.TextDocument): Promise<void> {
        // Simplified document indexing for initial structure
        // In real implementation, this would use the appropriate language parser
        
        const documentUri = document.uri.toString();
        const content = document.getText();
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Look for definition lines (simplified pattern matching)
            if (line.startsWith('def ')) {
                // 🎯 HANDLE COMPOUND DEFS: def block subsystem MeasurementSubsystem
                const compoundDefMatch = line.match(/def\s+(\w+)\s+(\w+)\s+(\w+)/);
                if (compoundDefMatch) {
                    const [, defCategory, defType, defName] = compoundDefMatch;
                    console.log(`🎯 Found compound def: def ${defCategory} ${defType} ${defName} at line ${i + 1}`);
                    
                    const symbolType = this.mapCompoundDefTypeToSymbolType(defCategory, defType);
                    if (symbolType) {
                        const symbol: ISymbolDefinition = {
                            id: this.generateSymbolId(documentUri, defName),
                            name: defName, // ✅ Use the actual symbol name, not the type
                            type: symbolType,
                            fileUri: documentUri,
                            location: new vscode.Location(document.uri, new vscode.Position(i, 0)),
                            range: new vscode.Range(i, 0, i, line.length),
                            parentSymbol: undefined,
                            childSymbols: [],
                            isExported: true,
                            isVisible: true,
                            isEnabled: true,
                            properties: new Map(),
                            metadata: {
                                pluginId: 'sylang-core',
                                documentUri,
                                version: 1,
                                lastModified: new Date(),
                                checksum: this.generateChecksum(line),
                                dependencies: [],
                                dependents: []
                            }
                        };
                        
                        this.addSymbol(symbol);
                        continue;
                    }
                }
                
                // 🎯 SIMPLE DEFS: def featureset BloodPressureFeatures
                const simpleDefMatch = line.match(/def\s+(\w+)\s+(\w+)/);
                if (simpleDefMatch) {
                    const [, defType, defName] = simpleDefMatch;
                    
                    const symbolType = this.mapDefTypeToSymbolType(defType);
                    if (symbolType) {
                        const symbol: ISymbolDefinition = {
                            id: this.generateSymbolId(documentUri, defName),
                            name: defName,
                            type: symbolType,
                            fileUri: documentUri,
                            location: new vscode.Location(document.uri, new vscode.Position(i, 0)),
                            range: new vscode.Range(i, 0, i, line.length),
                            parentSymbol: undefined,
                            childSymbols: [],
                            isExported: true,
                            isVisible: true,
                            isEnabled: true,
                            properties: new Map(),
                            metadata: {
                                pluginId: 'sylang-core',
                                documentUri,
                                version: 1,
                                lastModified: new Date(),
                                checksum: this.generateChecksum(line),
                                dependencies: [],
                                dependents: []
                            }
                        };
                        
                        this.addSymbol(symbol);
                    }
                }
            }
        }
    }

    private mapDefTypeToSymbolType(defType: string): SymbolType | undefined {
        switch (defType) {
            case 'productline': return SymbolType.PRODUCT_LINE;
            case 'featureset': return SymbolType.FEATURE_SET;
            case 'variantmodel': return SymbolType.VARIANT_MODEL;
            case 'functiongroup': return SymbolType.FUNCTION_GROUP;
            case 'block': return SymbolType.BLOCK_SYSTEM;
            case 'reqsection': return SymbolType.REQ_SECTION;
            case 'testsuite': return SymbolType.TEST_SUITE;
            default: return undefined;
        }
    }

    private mapCompoundDefTypeToSymbolType(defCategory: string, defType: string): SymbolType | undefined {
        if (defCategory === 'block') {
            switch (defType) {
                case 'system': return SymbolType.BLOCK_SYSTEM;
                case 'subsystem': return SymbolType.BLOCK_SUBSYSTEM;
                case 'component': return SymbolType.BLOCK_COMPONENT;
                default: return undefined;
            }
        }
        // Add other compound categories as needed
        return undefined;
    }

    private generateSymbolId(documentUri: string, name: string): string {
        return crypto.createHash('md5').update(`${documentUri}:${name}`).digest('hex');
    }

    private generateChecksum(content: string): string {
        return crypto.createHash('md5').update(content).digest('hex');
    }
} 