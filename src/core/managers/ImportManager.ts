import * as vscode from 'vscode';
import {
    IImportManager,
    IImportStatement,
    IImportSyntax,
    ISyntaxError,
    IMultiImportInfo,
    IMultiImportIdentifier,
    IImportResolutionContext,
    IImportResolutionResult,
    IDocumentImportResult,
    IMultiImportResult,
    IImportWarning,
    IDependencyGraph,
    IDependencyNode,
    IDependencyEdge,
    ICircularDependency,
    IImportValidationContext,
    IImportValidationResult,
    IImportValidationError,
    IImportValidationWarning,
    IImportSuggestion,
    IAutoImportCandidate,
    ITransitiveDependencyResult,
    ISymbolConflict,
    ISymbolChain,
    IImportResolvedEvent,
    IDependencyChangedEvent,
    ISymbolDefinition,
    IImportError
} from '../interfaces';

// =============================================================================
// IMPORT MANAGER IMPLEMENTATION
// =============================================================================

/**
 * Comprehensive import manager handling use statements and dependency resolution
 */
export class ImportManager implements IImportManager {
    private readonly documentImports = new Map<string, IImportStatement[]>();
    private readonly resolvedImports = new Map<string, IImportResolutionResult[]>();
    private readonly dependencyGraph = new Map<string, IDependencyNode>();
    private readonly dependencyEdges: IDependencyEdge[] = [];
    private readonly watchedDocuments = new Set<string>();
    private readonly watchers: vscode.FileSystemWatcher[] = [];
    
    private readonly importResolvedEmitter = new vscode.EventEmitter<IImportResolvedEvent>();
    private readonly dependencyChangedEmitter = new vscode.EventEmitter<IDependencyChangedEvent>();
    
    private importCache = new Map<string, IImportResolutionResult>();

    constructor(
        private readonly symbolManager?: any,
        private readonly configurationManager?: any
    ) {}

    // =============================================================================
    // IMPORT PARSING AND RESOLUTION
    // =============================================================================

    parseImportStatement(line: string, document: vscode.TextDocument, lineIndex: number): IImportStatement | undefined {
        const trimmedLine = line.trim();
        
        // Check if it's a use statement
        if (!trimmedLine.startsWith('use ')) {
            return undefined;
        }
        
        // Parse the import statement: use <keyword> [subkeyword] <identifiers>
        const usePattern = /^use\s+(\w+)(?:\s+(\w+))?\s+(.+)$/;
        const match = trimmedLine.match(usePattern);
        
        if (!match) {
            return this.createInvalidImportStatement(line, document, lineIndex, 'Invalid use statement syntax');
        }
        
        const [, keyword, subkeyword, identifiersPart] = match;
        
        // Parse identifiers (comma-separated)
        const identifiers = this.parseIdentifiers(identifiersPart);
        const isMultiImport = identifiers.length > 1;
        
        // Create syntax details
        const syntax = this.parseImportSyntax(line, keyword, subkeyword, identifiers);
        
        return {
            keyword,
            subkeyword,
            identifiers,
            isMultiImport,
            location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
            range: new vscode.Range(lineIndex, 0, lineIndex, line.length),
            documentUri: document.uri.toString(),
            lineIndex,
            rawText: line,
            syntax
        };
    }

    async resolveImport(importStatement: IImportStatement, context: IImportResolutionContext): Promise<IImportResolutionResult> {
        const startTime = performance.now();
        const resolvedSymbols: ISymbolDefinition[] = [];
        const unresolvedIdentifiers: string[] = [];
        const errors: IImportError[] = [];
        const warnings: IImportWarning[] = [];
        
        // Check cache first
        const cacheKey = this.generateCacheKey(importStatement, context);
        const cachedResult = this.importCache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        
        // Resolve each identifier
        for (const identifier of importStatement.identifiers) {
            try {
                const symbol = await this.resolveIdentifier(identifier, importStatement, context);
                if (symbol) {
                    resolvedSymbols.push(symbol);
                } else {
                    unresolvedIdentifiers.push(identifier);
                    errors.push({
                        type: 'unresolved',
                        message: `Cannot resolve identifier '${identifier}'`,
                        range: this.getIdentifierRange(importStatement, identifier),
                        identifier,
                        suggestion: this.suggestSimilarIdentifier(identifier, importStatement.keyword)
                    });
                }
            } catch (error) {
                unresolvedIdentifiers.push(identifier);
                errors.push({
                    type: 'invalid',
                    message: `Error resolving '${identifier}': ${error}`,
                    range: this.getIdentifierRange(importStatement, identifier),
                    identifier
                });
            }
        }
        
        // Check for dependency cycles
        const dependencyChain = this.buildDependencyChain(context.documentUri, resolvedSymbols);
        const circularDeps = this.detectCircularDependenciesInChain(dependencyChain);
        
        if (circularDeps.length > 0) {
            for (const cycle of circularDeps) {
                errors.push({
                    type: 'circular',
                    message: `Circular dependency detected: ${cycle.cycle.join(' -> ')}`,
                    range: importStatement.range
                });
            }
        }
        
        // Generate warnings
        this.generateImportWarnings(importStatement, resolvedSymbols, warnings);
        
        const result: IImportResolutionResult = {
            importStatement,
            resolvedSymbols,
            unresolvedIdentifiers,
            errors,
            warnings,
            isFullyResolved: unresolvedIdentifiers.length === 0 && errors.length === 0,
            resolutionTime: performance.now() - startTime,
            dependencyChain
        };
        
        // Cache the result
        this.importCache.set(cacheKey, result);
        
        return result;
    }

    async resolveAllImports(document: vscode.TextDocument): Promise<IDocumentImportResult> {
        const documentUri = document.uri.toString();
        const importStatements = await this.parseDocumentImports(document);
        const resolutionResults: IImportResolutionResult[] = [];
        const allErrors: IImportError[] = [];
        const allWarnings: IImportWarning[] = [];
        
        const context: IImportResolutionContext = {
            documentUri,
            symbolManager: this.symbolManager,
            configurationManager: this.configurationManager,
            workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
            resolutionMode: 'strict',
            maxDepth: 10
        };
        
        // Resolve each import statement
        for (const importStatement of importStatements) {
            const result = await this.resolveImport(importStatement, context);
            resolutionResults.push(result);
            allErrors.push(...result.errors);
            allWarnings.push(...result.warnings);
        }
        
        // Calculate totals
        let totalSymbols = 0;
        let resolvedSymbols = 0;
        const dependencies: string[] = [];
        
        for (const result of resolutionResults) {
            totalSymbols += result.importStatement.identifiers.length;
            resolvedSymbols += result.resolvedSymbols.length;
            
            for (const symbol of result.resolvedSymbols) {
                if (!dependencies.includes(symbol.fileUri)) {
                    dependencies.push(symbol.fileUri);
                }
            }
        }
        
        // Store imports for this document
        this.documentImports.set(documentUri, importStatements);
        this.resolvedImports.set(documentUri, resolutionResults);
        
        // Update dependency graph
        this.updateDependencyGraph(documentUri, dependencies);
        
        return {
            documentUri,
            importStatements,
            resolutionResults,
            totalSymbols,
            resolvedSymbols,
            errors: allErrors,
            warnings: allWarnings,
            isValid: allErrors.length === 0,
            dependencies
        };
    }

    // =============================================================================
    // MULTI-IMPORT SUPPORT
    // =============================================================================

    parseMultiImport(importStatement: IImportStatement): IMultiImportInfo {
        const identifiers: IMultiImportIdentifier[] = [];
        
        for (const identifier of importStatement.identifiers) {
            const identifierInfo: IMultiImportIdentifier = {
                name: identifier,
                range: this.getIdentifierRange(importStatement, identifier),
                isResolved: false
            };
            
            identifiers.push(identifierInfo);
        }
        
        return {
            baseImport: importStatement,
            identifiers,
            resolvedCount: 0,
            unresolvedCount: identifiers.length
        };
    }

    async resolveMultiImport(multiImport: IMultiImportInfo, context: IImportResolutionContext): Promise<IMultiImportResult> {
        const individualResults: IImportResolutionResult[] = [];
        const warnings: IImportWarning[] = [];
        let successCount = 0;
        let errorCount = 0;
        
        // Create individual import statements for each identifier
        for (const identifier of multiImport.identifiers) {
            const singleImport: IImportStatement = {
                ...multiImport.baseImport,
                identifiers: [identifier.name],
                isMultiImport: false
            };
            
            const result = await this.resolveImport(singleImport, context);
            individualResults.push(result);
            
            if (result.isFullyResolved) {
                successCount++;
                // Update the identifier info
                identifier.isResolved = true;
                identifier.resolvedSymbol = result.resolvedSymbols[0];
            } else {
                errorCount++;
                identifier.error = result.errors[0];
            }
        }
        
        // Update multi-import info
        multiImport.resolvedCount = successCount;
        multiImport.unresolvedCount = errorCount;
        
        // Generate multi-import specific warnings
        if (successCount > 0 && errorCount > 0) {
            warnings.push({
                type: 'inefficient_import',
                message: `Multi-import partially resolved (${successCount}/${successCount + errorCount})`,
                range: multiImport.baseImport.range,
                importStatement: multiImport.baseImport,
                suggestion: 'Consider splitting into separate import statements'
            });
        }
        
        return {
            multiImport,
            individualResults,
            successCount,
            errorCount,
            warnings
        };
    }

    // =============================================================================
    // DEPENDENCY TRACKING
    // =============================================================================

    getDependencies(documentUri: string): string[] {
        const node = this.dependencyGraph.get(documentUri);
        return node ? [...node.dependencies] : [];
    }

    getDependents(documentUri: string): string[] {
        const node = this.dependencyGraph.get(documentUri);
        return node ? [...node.dependents] : [];
    }

    buildDependencyGraph(): IDependencyGraph {
        const cycles = this.detectCircularDependencies();
        const roots = this.findRootDocuments();
        const leaves = this.findLeafDocuments();
        const maxDepth = this.calculateMaxDepth();
        
        return {
            nodes: new Map(this.dependencyGraph),
            edges: [...this.dependencyEdges],
            roots,
            leaves,
            cycles,
            maxDepth
        };
    }

    detectCircularDependencies(): ICircularDependency[] {
        const cycles: ICircularDependency[] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        
        for (const documentUri of this.dependencyGraph.keys()) {
            if (!visited.has(documentUri)) {
                this.detectCyclesDFS(documentUri, visited, recursionStack, [], cycles);
            }
        }
        
        return cycles;
    }

    // =============================================================================
    // SYMBOL AVAILABILITY
    // =============================================================================

    getAvailableSymbols(documentUri: string): ISymbolDefinition[] {
        if (!this.symbolManager) {
            return [];
        }
        
        return this.symbolManager.getAvailableSymbols(documentUri) || [];
    }

    getImportedSymbols(documentUri: string): ISymbolDefinition[] {
        const resolvedImports = this.resolvedImports.get(documentUri) || [];
        const importedSymbols: ISymbolDefinition[] = [];
        
        for (const result of resolvedImports) {
            importedSymbols.push(...result.resolvedSymbols);
        }
        
        return importedSymbols;
    }

    getExportedSymbols(documentUri: string): ISymbolDefinition[] {
        if (!this.symbolManager) {
            return [];
        }
        
        const symbols = this.symbolManager.getSymbolsInDocument(documentUri) || [];
        return symbols.filter(symbol => symbol.isExported);
    }

    // =============================================================================
    // IMPORT VALIDATION
    // =============================================================================

    validateImport(importStatement: IImportStatement, context: IImportValidationContext): IImportValidationResult {
        const errors: IImportValidationError[] = [];
        const warnings: IImportValidationWarning[] = [];
        const suggestions: IImportSuggestion[] = [];
        
        // Validate syntax
        if (!importStatement.syntax.isValid) {
            for (const syntaxError of importStatement.syntax.syntaxErrors) {
                errors.push({
                    type: 'syntax',
                    message: syntaxError.message,
                    range: syntaxError.range,
                    code: 'INVALID_SYNTAX',
                    severity: 'error'
                });
            }
        }
        
        // Validate identifiers exist
        for (const identifier of importStatement.identifiers) {
            if (!this.symbolExists(identifier, importStatement.keyword, importStatement.subkeyword)) {
                errors.push({
                    type: 'resolution',
                    message: `Symbol '${identifier}' not found`,
                    range: this.getIdentifierRange(importStatement, identifier),
                    code: 'SYMBOL_NOT_FOUND',
                    severity: 'error'
                });
                
                // Suggest similar symbols
                const suggestion = this.suggestSimilarIdentifier(identifier, importStatement.keyword);
                if (suggestion) {
                    suggestions.push({
                        type: 'fix_import',
                        description: `Did you mean '${suggestion}'?`,
                        newImportStatement: importStatement.rawText.replace(identifier, suggestion),
                        range: this.getIdentifierRange(importStatement, identifier),
                        symbolName: identifier,
                        confidence: 0.8,
                        documentUri: context.documentUri
                    });
                }
            }
        }
        
        // Check for circular dependencies
        if (!context.allowCircularDependencies) {
            const potentialCycles = this.findPotentialCycles(importStatement, context.documentUri);
            for (const cycle of potentialCycles) {
                errors.push({
                    type: 'circular',
                    message: `Import would create circular dependency: ${cycle.join(' -> ')}`,
                    range: importStatement.range,
                    code: 'CIRCULAR_DEPENDENCY',
                    severity: 'error'
                });
            }
        }
        
        // Check for unused imports (if symbols are not referenced)
        if (this.isImportUnused(importStatement, context.documentUri)) {
            warnings.push({
                type: 'unused',
                message: `Import '${importStatement.identifiers.join(', ')}' is not used`,
                range: importStatement.range,
                suggestion: 'Remove unused import'
            });
        }
        
        // Check for duplicate imports
        const duplicates = this.findDuplicateImports(importStatement, context.documentUri);
        if (duplicates.length > 0) {
            warnings.push({
                type: 'duplicate',
                message: `Duplicate import of '${duplicates.join(', ')}'`,
                range: importStatement.range,
                suggestion: 'Remove duplicate import'
            });
        }
        
        return {
            importStatement,
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }

    async validateAllImports(document: vscode.TextDocument): Promise<IImportValidationResult[]> {
        const documentUri = document.uri.toString();
        const importStatements = this.documentImports.get(documentUri) || [];
        const results: IImportValidationResult[] = [];
        
        const context: IImportValidationContext = {
            documentUri,
            allowCircularDependencies: false,
            maxDependencyDepth: 10,
            requireExplicitImports: true,
            validateExports: true
        };
        
        for (const importStatement of importStatements) {
            const result = this.validateImport(importStatement, context);
            results.push(result);
        }
        
        return results;
    }

    // =============================================================================
    // IMPORT SUGGESTIONS AND FIXES
    // =============================================================================

    suggestImports(symbolName: string, documentUri: string): IImportSuggestion[] {
        const suggestions: IImportSuggestion[] = [];
        
        if (!this.symbolManager) {
            return suggestions;
        }
        
        // Find all symbols with matching name
        const allSymbols = this.symbolManager.getWorkspaceSymbols();
        const matchingSymbols = allSymbols.symbols.get(symbolName) || [];
        
        for (const symbol of matchingSymbols) {
            if (symbol.fileUri !== documentUri && symbol.isExported) {
                const importStatement = this.generateImportStatement(symbol.id, documentUri);
                if (importStatement) {
                    suggestions.push({
                        type: 'add_import',
                        description: `Import '${symbolName}' from ${this.getRelativePath(symbol.fileUri, documentUri)}`,
                        newImportStatement: importStatement,
                        symbolName,
                        confidence: 1.0,
                        documentUri: symbol.fileUri
                    });
                }
            }
        }
        
        return suggestions;
    }

    getAutoImportCandidates(documentUri: string): IAutoImportCandidate[] {
        const candidates: IAutoImportCandidate[] = [];
        
        if (!this.symbolManager) {
            return candidates;
        }
        
        const exportedSymbols = this.getAllExportedSymbols();
        const currentImports = this.getImportedSymbols(documentUri);
        const currentImportNames = new Set(currentImports.map(s => s.name));
        
        for (const symbol of exportedSymbols) {
            if (symbol.fileUri !== documentUri && !currentImportNames.has(symbol.name)) {
                const importStatement = this.generateImportStatement(symbol.id, documentUri);
                if (importStatement) {
                    candidates.push({
                        symbolName: symbol.name,
                        symbolType: symbol.type.toString(),
                        sourceDocument: symbol.fileUri,
                        importStatement,
                        description: symbol.description,
                        isVisible: this.configurationManager ? this.configurationManager.isSymbolVisible(symbol.id) : true,
                        isEnabled: this.configurationManager ? this.configurationManager.isSymbolEnabled(symbol.id) : true
                    });
                }
            }
        }
        
        return candidates;
    }

    generateImportStatement(symbolId: string, targetDocument: string): string | undefined {
        if (!this.symbolManager) {
            return undefined;
        }
        
        const symbol = this.symbolManager.symbols?.get(symbolId);
        if (!symbol) {
            return undefined;
        }
        
        const keyword = this.getImportKeywordForSymbol(symbol);
        const subkeyword = this.getImportSubkeywordForSymbol(symbol);
        
        if (keyword) {
            const parts = ['use', keyword];
            if (subkeyword) {
                parts.push(subkeyword);
            }
            parts.push(symbol.name);
            
            return parts.join(' ');
        }
        
        return undefined;
    }

    // =============================================================================
    // TRANSITIVE DEPENDENCY RESOLUTION
    // =============================================================================

    resolveTransitiveDependencies(documentUri: string): ITransitiveDependencyResult {
        const directDeps = this.getDependencies(documentUri);
        const transitiveDeps = new Set<string>();
        const dependencyLevels = new Map<string, number>();
        const conflictingSymbols: ISymbolConflict[] = [];
        
        // Build transitive dependencies
        this.buildTransitiveDependencies(documentUri, transitiveDeps, dependencyLevels, 0, new Set());
        
        // Remove direct dependencies from transitive set
        for (const directDep of directDeps) {
            transitiveDeps.delete(directDep);
        }
        
        // Count total available symbols
        let totalSymbols = 0;
        if (this.symbolManager) {
            for (const dep of [...directDeps, ...transitiveDeps]) {
                const symbols = this.symbolManager.getSymbolsInDocument(dep) || [];
                totalSymbols += symbols.filter(s => s.isExported).length;
            }
        }
        
        // Detect symbol conflicts
        this.detectSymbolConflicts([...directDeps, ...transitiveDeps], conflictingSymbols);
        
        return {
            documentUri,
            directDependencies: directDeps,
            transitiveDependencies: Array.from(transitiveDeps),
            dependencyLevels,
            totalSymbols,
            conflictingSymbols
        };
    }

    getSymbolChain(symbolId: string): ISymbolChain {
        if (!this.symbolManager) {
            throw new Error('Symbol manager not available');
        }
        
        const symbol = this.symbolManager.symbols?.get(symbolId);
        if (!symbol) {
            throw new Error(`Symbol not found: ${symbolId}`);
        }
        
        const chain: ISymbolDefinition[] = [symbol];
        const documents = [symbol.fileUri];
        let isCircular = false;
        let depth = 0;
        
        // Build dependency chain by following imports
        let currentDoc = symbol.fileUri;
        const visited = new Set<string>();
        
        while (true) {
            if (visited.has(currentDoc)) {
                isCircular = true;
                break;
            }
            
            visited.add(currentDoc);
            const deps = this.getDependencies(currentDoc);
            
            if (deps.length === 0) {
                break; // No more dependencies
            }
            
            // Take the first dependency (simplified)
            const nextDoc = deps[0];
            if (!documents.includes(nextDoc)) {
                documents.push(nextDoc);
                depth++;
                
                // Find a symbol from that document
                const nextSymbols = this.symbolManager.getSymbolsInDocument(nextDoc) || [];
                if (nextSymbols.length > 0) {
                    chain.push(nextSymbols[0]);
                }
            }
            
            currentDoc = nextDoc;
        }
        
        return {
            rootSymbol: symbol,
            chain,
            documents,
            isCircular,
            depth
        };
    }

    // =============================================================================
    // EVENT HANDLING
    // =============================================================================

    onImportResolved(listener: (event: IImportResolvedEvent) => void): vscode.Disposable {
        return this.importResolvedEmitter.event(listener);
    }

    onDependencyChanged(listener: (event: IDependencyChangedEvent) => void): vscode.Disposable {
        return this.dependencyChangedEmitter.event(listener);
    }

    // =============================================================================
    // CACHE MANAGEMENT
    // =============================================================================

    clearImportCache(documentUri?: string): void {
        if (documentUri) {
            // Clear cache entries for specific document
            for (const [key, _] of this.importCache.entries()) {
                if (key.includes(documentUri)) {
                    this.importCache.delete(key);
                }
            }
        } else {
            this.importCache.clear();
        }
    }

    async refreshImports(documentUri: string): Promise<void> {
        // Clear cached imports for this document
        this.clearImportCache(documentUri);
        this.documentImports.delete(documentUri);
        this.resolvedImports.delete(documentUri);
        
        // Re-parse and resolve imports
        try {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(documentUri));
            await this.resolveAllImports(document);
        } catch (error) {
            console.error(`Failed to refresh imports for ${documentUri}:`, error);
        }
    }

    // =============================================================================
    // FILE WATCHING
    // =============================================================================

    watchImportedFiles(documentUri: string): void {
        if (this.watchedDocuments.has(documentUri)) {
            return;
        }
        
        const dependencies = this.getDependencies(documentUri);
        
        for (const depUri of dependencies) {
            const watcher = vscode.workspace.createFileSystemWatcher(depUri);
            
            watcher.onDidChange(async () => {
                await this.handleDependencyChanged(documentUri, depUri, 'modified');
            });
            
            watcher.onDidDelete(async () => {
                await this.handleDependencyChanged(documentUri, depUri, 'removed');
            });
            
            this.watchers.push(watcher);
        }
        
        this.watchedDocuments.add(documentUri);
    }

    unwatchImportedFiles(documentUri: string): void {
        // In a real implementation, would track watchers per document
        // For now, just remove from watched set
        this.watchedDocuments.delete(documentUri);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private parseIdentifiers(identifiersPart: string): string[] {
        return identifiersPart
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0);
    }

    private parseImportSyntax(line: string, keyword: string, subkeyword: string | undefined, identifiers: string[]): IImportSyntax {
        const useKeywordIndex = line.indexOf('use');
        const keywordIndex = line.indexOf(keyword, useKeywordIndex + 3);
        const subkeywordIndex = subkeyword ? line.indexOf(subkeyword, keywordIndex + keyword.length) : -1;
        
        const syntaxErrors: ISyntaxError[] = [];
        const identifierRanges: vscode.Range[] = [];
        const separatorRanges: vscode.Range[] = [];
        
        // Calculate ranges (simplified)
        let currentIndex = subkeywordIndex >= 0 ? subkeywordIndex + (subkeyword?.length || 0) : keywordIndex + keyword.length;
        
        for (let i = 0; i < identifiers.length; i++) {
            const identifier = identifiers[i];
            const startIndex = line.indexOf(identifier, currentIndex);
            if (startIndex >= 0) {
                identifierRanges.push(new vscode.Range(0, startIndex, 0, startIndex + identifier.length));
                currentIndex = startIndex + identifier.length;
                
                // Look for separator after this identifier
                if (i < identifiers.length - 1) {
                    const commaIndex = line.indexOf(',', currentIndex);
                    if (commaIndex >= 0) {
                        separatorRanges.push(new vscode.Range(0, commaIndex, 0, commaIndex + 1));
                        currentIndex = commaIndex + 1;
                    }
                }
            }
        }
        
        return {
            useKeywordRange: new vscode.Range(0, useKeywordIndex, 0, useKeywordIndex + 3),
            primaryKeywordRange: new vscode.Range(0, keywordIndex, 0, keywordIndex + keyword.length),
            subkeywordRange: subkeyword && subkeywordIndex >= 0 ? 
                new vscode.Range(0, subkeywordIndex, 0, subkeywordIndex + subkeyword.length) : undefined,
            identifierRanges,
            separatorRanges,
            isValid: syntaxErrors.length === 0,
            syntaxErrors
        };
    }

    private createInvalidImportStatement(line: string, document: vscode.TextDocument, lineIndex: number, errorMessage: string): IImportStatement {
        return {
            keyword: '',
            identifiers: [],
            isMultiImport: false,
            location: new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)),
            range: new vscode.Range(lineIndex, 0, lineIndex, line.length),
            documentUri: document.uri.toString(),
            lineIndex,
            rawText: line,
            syntax: {
                useKeywordRange: new vscode.Range(0, 0, 0, 0),
                primaryKeywordRange: new vscode.Range(0, 0, 0, 0),
                identifierRanges: [],
                separatorRanges: [],
                isValid: false,
                syntaxErrors: [{
                    message: errorMessage,
                    range: new vscode.Range(lineIndex, 0, lineIndex, line.length),
                    type: 'invalid_identifier'
                }]
            }
        };
    }

    private async parseDocumentImports(document: vscode.TextDocument): Promise<IImportStatement[]> {
        const imports: IImportStatement[] = [];
        const content = document.getText();
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().startsWith('use ')) {
                const importStatement = this.parseImportStatement(line, document, i);
                if (importStatement) {
                    imports.push(importStatement);
                }
            }
        }
        
        return imports;
    }

    private async resolveIdentifier(identifier: string, importStatement: IImportStatement, context: IImportResolutionContext): Promise<ISymbolDefinition | undefined> {
        if (!this.symbolManager) {
            return undefined;
        }
        
        // Find symbols matching the identifier and import criteria
        const candidates = this.symbolManager.symbolsByName?.get(identifier) || [];
        
        for (const symbol of candidates) {
            if (this.matchesImportCriteria(symbol, importStatement.keyword, importStatement.subkeyword)) {
                // Check if symbol is visible and accessible
                if (this.isSymbolAccessible(symbol, context.documentUri)) {
                    return symbol;
                }
            }
        }
        
        return undefined;
    }

    private matchesImportCriteria(symbol: ISymbolDefinition, keyword: string, subkeyword?: string): boolean {
        // Implementation depends on symbol types and import keywords
        // This is a simplified version
        switch (keyword) {
            case 'block':
                return symbol.type.toString().startsWith('block.');
            case 'featureset':
                return symbol.type.toString() === 'featureset';
            case 'function':
                return symbol.type.toString() === 'functiongroup';
            default:
                return false;
        }
    }

    private isSymbolAccessible(symbol: ISymbolDefinition, fromDocument: string): boolean {
        // Check if symbol is exported
        if (!symbol.isExported) {
            return false;
        }
        
        // Check configuration-based visibility
        if (this.configurationManager) {
            return this.configurationManager.isSymbolVisible(symbol.id);
        }
        
        return true;
    }

    private generateCacheKey(importStatement: IImportStatement, context: IImportResolutionContext): string {
        return `${context.documentUri}:${importStatement.keyword}:${importStatement.subkeyword || ''}:${importStatement.identifiers.join(',')}`;
    }

    private getIdentifierRange(importStatement: IImportStatement, identifier: string): vscode.Range {
        const index = importStatement.identifiers.indexOf(identifier);
        if (index >= 0 && index < importStatement.syntax.identifierRanges.length) {
            return importStatement.syntax.identifierRanges[index];
        }
        return importStatement.range;
    }

    private suggestSimilarIdentifier(identifier: string, keyword: string): string | undefined {
        if (!this.symbolManager) {
            return undefined;
        }
        
        // Simple similarity matching (in a real implementation, would use fuzzy matching)
        const allSymbols = this.symbolManager.getWorkspaceSymbols();
        for (const [name, symbols] of allSymbols.symbols.entries()) {
            if (name.toLowerCase().includes(identifier.toLowerCase()) || 
                identifier.toLowerCase().includes(name.toLowerCase())) {
                // Check if any symbol matches the import criteria
                for (const symbol of symbols) {
                    if (this.matchesImportCriteria(symbol, keyword)) {
                        return name;
                    }
                }
            }
        }
        
        return undefined;
    }

    private buildDependencyChain(documentUri: string, symbols: ISymbolDefinition[]): string[] {
        const chain: string[] = [documentUri];
        const uniqueDeps = new Set<string>();
        
        for (const symbol of symbols) {
            if (symbol.fileUri !== documentUri) {
                uniqueDeps.add(symbol.fileUri);
            }
        }
        
        chain.push(...uniqueDeps);
        return chain;
    }

    private detectCircularDependenciesInChain(chain: string[]): ICircularDependency[] {
        const cycles: ICircularDependency[] = [];
        const seen = new Set<string>();
        
        for (const doc of chain) {
            if (seen.has(doc)) {
                const cycleStart = chain.indexOf(doc);
                const cycle = chain.slice(cycleStart);
                cycles.push({
                    cycle,
                    entryPoint: doc,
                    importStatements: [], // Would be populated with actual import statements
                    severity: 'error',
                    suggestion: 'Restructure imports to remove circular dependency'
                });
            }
            seen.add(doc);
        }
        
        return cycles;
    }

    private generateImportWarnings(importStatement: IImportStatement, resolvedSymbols: ISymbolDefinition[], warnings: IImportWarning[]): void {
        // Check for deprecated symbols
        for (const symbol of resolvedSymbols) {
            if (symbol.metadata.version < 1) { // Simplified deprecation check
                warnings.push({
                    type: 'deprecated_symbol',
                    message: `Symbol '${symbol.name}' is deprecated`,
                    range: this.getIdentifierRange(importStatement, symbol.name),
                    importStatement
                });
            }
        }
        
        // Check for inefficient imports
        if (importStatement.isMultiImport && resolvedSymbols.length < importStatement.identifiers.length) {
            warnings.push({
                type: 'inefficient_import',
                message: 'Multi-import partially resolved',
                range: importStatement.range,
                importStatement,
                suggestion: 'Consider splitting into separate import statements'
            });
        }
    }

    private updateDependencyGraph(documentUri: string, dependencies: string[]): void {
        // Update or create dependency node
        const existingNode = this.dependencyGraph.get(documentUri);
        const newNode: IDependencyNode = {
            documentUri,
            dependencies,
            dependents: existingNode?.dependents || [],
            importCount: dependencies.length,
            exportCount: this.getExportedSymbols(documentUri).length,
            lastModified: new Date()
        };
        
        this.dependencyGraph.set(documentUri, newNode);
        
        // Update reverse dependencies
        for (const dep of dependencies) {
            const depNode = this.dependencyGraph.get(dep);
            if (depNode) {
                if (!depNode.dependents.includes(documentUri)) {
                    depNode.dependents.push(documentUri);
                }
            }
        }
        
        // Update dependency edges
        this.updateDependencyEdges(documentUri, dependencies);
    }

    private updateDependencyEdges(fromDocument: string, toDocuments: string[]): void {
        // Remove existing edges from this document
        this.dependencyEdges.splice(0, this.dependencyEdges.length, 
            ...this.dependencyEdges.filter(edge => edge.from !== fromDocument));
        
        // Add new edges
        for (const toDocument of toDocuments) {
            const importStatements = this.documentImports.get(fromDocument) || [];
            const relatedImports = importStatements.filter(imp => 
                this.getImportedSymbols(fromDocument).some(sym => sym.fileUri === toDocument));
            
            const symbolCount = this.getImportedSymbols(fromDocument)
                .filter(sym => sym.fileUri === toDocument).length;
            
            this.dependencyEdges.push({
                from: fromDocument,
                to: toDocument,
                importStatements: relatedImports,
                symbolCount,
                weight: symbolCount
            });
        }
    }

    private detectCyclesDFS(node: string, visited: Set<string>, recursionStack: Set<string>, path: string[], cycles: ICircularDependency[]): void {
        visited.add(node);
        recursionStack.add(node);
        path.push(node);
        
        const dependencies = this.getDependencies(node);
        for (const dep of dependencies) {
            if (!visited.has(dep)) {
                this.detectCyclesDFS(dep, visited, recursionStack, path, cycles);
            } else if (recursionStack.has(dep)) {
                // Found a cycle
                const cycleStart = path.indexOf(dep);
                const cycle = [...path.slice(cycleStart), dep];
                
                cycles.push({
                    cycle,
                    entryPoint: dep,
                    importStatements: [], // Would be populated with actual imports
                    severity: 'error',
                    suggestion: 'Restructure dependencies to remove cycle'
                });
            }
        }
        
        recursionStack.delete(node);
        path.pop();
    }

    private findRootDocuments(): string[] {
        const roots: string[] = [];
        for (const [documentUri, node] of this.dependencyGraph.entries()) {
            if (node.dependencies.length === 0) {
                roots.push(documentUri);
            }
        }
        return roots;
    }

    private findLeafDocuments(): string[] {
        const leaves: string[] = [];
        for (const [documentUri, node] of this.dependencyGraph.entries()) {
            if (node.dependents.length === 0) {
                leaves.push(documentUri);
            }
        }
        return leaves;
    }

    private calculateMaxDepth(): number {
        let maxDepth = 0;
        const roots = this.findRootDocuments();
        
        for (const root of roots) {
            const depth = this.calculateDepthFromRoot(root, new Set());
            maxDepth = Math.max(maxDepth, depth);
        }
        
        return maxDepth;
    }

    private calculateDepthFromRoot(node: string, visited: Set<string>): number {
        if (visited.has(node)) {
            return 0; // Avoid infinite recursion in cycles
        }
        
        visited.add(node);
        const dependencies = this.getDependencies(node);
        let maxChildDepth = 0;
        
        for (const dep of dependencies) {
            const childDepth = this.calculateDepthFromRoot(dep, new Set(visited));
            maxChildDepth = Math.max(maxChildDepth, childDepth);
        }
        
        return maxChildDepth + 1;
    }

    private symbolExists(identifier: string, keyword: string, subkeyword?: string): boolean {
        if (!this.symbolManager) {
            return false;
        }
        
        const candidates = this.symbolManager.symbolsByName?.get(identifier) || [];
        return candidates.some(symbol => this.matchesImportCriteria(symbol, keyword, subkeyword));
    }

    private findPotentialCycles(importStatement: IImportStatement, documentUri: string): string[][] {
        const cycles: string[][] = [];
        
        // Simplified cycle detection for potential imports
        for (const identifier of importStatement.identifiers) {
            if (!this.symbolManager) continue;
            
            const symbols = this.symbolManager.symbolsByName?.get(identifier) || [];
            for (const symbol of symbols) {
                if (this.matchesImportCriteria(symbol, importStatement.keyword, importStatement.subkeyword)) {
                    // Check if adding this dependency would create a cycle
                    const targetDoc = symbol.fileUri;
                    if (this.wouldCreateCycle(documentUri, targetDoc)) {
                        const path = this.findPathBetween(targetDoc, documentUri);
                        if (path.length > 0) {
                            cycles.push([...path, documentUri]);
                        }
                    }
                }
            }
        }
        
        return cycles;
    }

    private wouldCreateCycle(fromDoc: string, toDoc: string): boolean {
        // Check if toDoc has a path back to fromDoc
        return this.hasPath(toDoc, fromDoc, new Set());
    }

    private hasPath(from: string, to: string, visited: Set<string>): boolean {
        if (from === to) {
            return true;
        }
        
        if (visited.has(from)) {
            return false;
        }
        
        visited.add(from);
        const dependencies = this.getDependencies(from);
        
        for (const dep of dependencies) {
            if (this.hasPath(dep, to, visited)) {
                return true;
            }
        }
        
        return false;
    }

    private findPathBetween(from: string, to: string): string[] {
        const queue: string[][] = [[from]];
        const visited = new Set<string>();
        
        while (queue.length > 0) {
            const path = queue.shift()!;
            const current = path[path.length - 1];
            
            if (current === to) {
                return path;
            }
            
            if (visited.has(current)) {
                continue;
            }
            
            visited.add(current);
            const dependencies = this.getDependencies(current);
            
            for (const dep of dependencies) {
                if (!visited.has(dep)) {
                    queue.push([...path, dep]);
                }
            }
        }
        
        return [];
    }

    private isImportUnused(importStatement: IImportStatement, documentUri: string): boolean {
        // In a real implementation, would check if imported symbols are referenced
        // This is a simplified version
        return false;
    }

    private findDuplicateImports(importStatement: IImportStatement, documentUri: string): string[] {
        const allImports = this.documentImports.get(documentUri) || [];
        const duplicates: string[] = [];
        
        for (const otherImport of allImports) {
            if (otherImport !== importStatement && 
                otherImport.keyword === importStatement.keyword &&
                otherImport.subkeyword === importStatement.subkeyword) {
                
                // Check for overlapping identifiers
                for (const identifier of importStatement.identifiers) {
                    if (otherImport.identifiers.includes(identifier)) {
                        duplicates.push(identifier);
                    }
                }
            }
        }
        
        return duplicates;
    }

    private getAllExportedSymbols(): ISymbolDefinition[] {
        if (!this.symbolManager) {
            return [];
        }
        
        const allSymbols: ISymbolDefinition[] = [];
        const workspaceSymbols = this.symbolManager.getWorkspaceSymbols();
        
        for (const symbols of workspaceSymbols.symbols.values()) {
            allSymbols.push(...symbols.filter(s => s.isExported));
        }
        
        return allSymbols;
    }

    private getImportKeywordForSymbol(symbol: ISymbolDefinition): string | undefined {
        const symbolType = symbol.type.toString();
        
        if (symbolType.startsWith('block.')) {
            return 'block';
        } else if (symbolType === 'featureset') {
            return 'featureset';
        } else if (symbolType === 'functiongroup') {
            return 'function';
        } else if (symbolType === 'reqsection') {
            return 'requirement';
        }
        
        return undefined;
    }

    private getImportSubkeywordForSymbol(symbol: ISymbolDefinition): string | undefined {
        const symbolType = symbol.type.toString();
        
        if (symbolType === 'block.system') {
            return 'system';
        } else if (symbolType === 'block.subsystem') {
            return 'subsystem';
        } else if (symbolType === 'block.component') {
            return 'component';
        }
        
        return undefined;
    }

    private getRelativePath(fromPath: string, toPath: string): string {
        // Simplified relative path calculation
        return fromPath.split('/').pop() || fromPath;
    }

    private buildTransitiveDependencies(documentUri: string, transitive: Set<string>, levels: Map<string, number>, currentLevel: number, visited: Set<string>): void {
        if (visited.has(documentUri)) {
            return; // Avoid infinite recursion
        }
        
        visited.add(documentUri);
        const dependencies = this.getDependencies(documentUri);
        
        for (const dep of dependencies) {
            if (!levels.has(dep) || levels.get(dep)! > currentLevel + 1) {
                levels.set(dep, currentLevel + 1);
            }
            
            transitive.add(dep);
            this.buildTransitiveDependencies(dep, transitive, levels, currentLevel + 1, new Set(visited));
        }
    }

    private detectSymbolConflicts(dependencies: string[], conflicts: ISymbolConflict[]): void {
        if (!this.symbolManager) {
            return;
        }
        
        const symbolMap = new Map<string, string[]>();
        
        // Collect symbols from all dependencies
        for (const dep of dependencies) {
            const symbols = this.symbolManager.getSymbolsInDocument(dep) || [];
            for (const symbol of symbols) {
                if (symbol.isExported) {
                    const existing = symbolMap.get(symbol.name) || [];
                    existing.push(dep);
                    symbolMap.set(symbol.name, existing);
                }
            }
        }
        
        // Find conflicts
        for (const [symbolName, docs] of symbolMap.entries()) {
            if (docs.length > 1) {
                conflicts.push({
                    symbolName,
                    conflictingDocuments: docs,
                    conflictType: 'name',
                    resolution: 'priority'
                });
            }
        }
    }

    private async handleDependencyChanged(documentUri: string, dependencyUri: string, changeType: 'modified' | 'removed'): Promise<void> {
        // Refresh imports for the document
        await this.refreshImports(documentUri);
        
        // Emit dependency change event
        this.dependencyChangedEmitter.fire({
            type: changeType,
            sourceDocument: documentUri,
            targetDocument: dependencyUri,
            affectedSymbols: [], // Would be populated based on actual changes
            timestamp: new Date()
        });
    }
} 