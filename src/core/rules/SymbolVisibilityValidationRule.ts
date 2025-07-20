import * as vscode from 'vscode';
import {
    IValidationRule,
    IRuleValidationContext,
    IRuleValidationResult,
    ValidationStage
} from '../interfaces/IValidationPipeline';

/**
 * Symbol Visibility Validation Rule
 * Validates that all referenced symbols are visible (imported) in the current document
 * 
 * Key Rule: Child symbols are only visible if their parent symbol is imported via 'use'
 */
export class SymbolVisibilityValidationRule implements IValidationRule {
    public readonly id = 'symbol-visibility-validation';
    public readonly name = 'Symbol Visibility Validation';
    public readonly description = 'Validates that referenced symbols are visible via imports';
    public readonly category = 'reference';
    public readonly severity: 'error' | 'warning' | 'info' = 'error';
    public readonly stage = ValidationStage.SEMANTIC_VALIDATION;
    public readonly fileTypes = ['vml', 'req', 'tst', 'blk'];
    public readonly enabled = true;
    public readonly priority = 200;
    public readonly configuration = {
        id: 'symbol-visibility-validation',
        name: 'Symbol Visibility Validation',
        description: 'Validates that referenced symbols are visible via imports',
        enabled: true,
        priority: 200,
        severity: 'error' as const,
        category: 'reference',
        fileTypes: ['vml', 'req', 'tst', 'blk'],
        stage: ValidationStage.SEMANTIC_VALIDATION,
        parameters: {},
        conditions: []
    };

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const diagnostics: vscode.Diagnostic[] = [];
        const document = context.document;
        const content = document.getText();
        const lines = content.split('\n');

        // Step 1: Extract imported parent symbols
        const importedParents = this.extractImportedParents(lines);
        console.log(`🔍 Symbol Visibility: Found ${importedParents.length} imported parents: ${importedParents.join(', ')}`);

        // Step 2: Extract all visible symbols (imported parents + their children)
        const visibleSymbols = await this.getVisibleSymbols(context, importedParents);
        console.log(`🔍 Symbol Visibility: ${visibleSymbols.length} symbols are visible`);

        // Step 3: Find all symbol references in the document
        const symbolReferences = this.extractSymbolReferences(lines);
        console.log(`🔍 Symbol Visibility: Found ${symbolReferences.length} symbol references`);

        // Step 4: Validate each reference is visible
        for (const ref of symbolReferences) {
            const isVisible = visibleSymbols.some(symbol => symbol.name === ref.symbolName);
            
            if (!isVisible) {
                const range = new vscode.Range(ref.line, ref.startCol, ref.line, ref.endCol);
                diagnostics.push(new vscode.Diagnostic(
                    range,
                    `Symbol '${ref.symbolName}' is not visible. Use 'use' to import its parent symbol.`,
                    vscode.DiagnosticSeverity.Error
                ));
                console.log(`❌ Symbol '${ref.symbolName}' not visible at line ${ref.line + 1}`);
            }
        }

        return {
            isValid: diagnostics.length === 0,
            diagnostics,
            errors: [],
            warnings: [],
            performance: {
                executionTime: 0,
                memoryUsage: 0,
                cacheHitRate: 0
            },
            metadata: {
                ruleName: this.name,
                ruleVersion: '1.0.0',
                validatedElements: symbolReferences.length,
                skippedElements: 0
            }
        };
    }

    supportsContext(context: IRuleValidationContext): boolean {
        const fileName = context.document.fileName;
        const extension = fileName.split('.').pop()?.toLowerCase();
        return this.fileTypes.includes(extension || '');
    }

    /**
     * Extract imported parent symbols from use statements
     */
    private extractImportedParents(lines: string[]): string[] {
        const parents: string[] = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) continue;

            // Match: use <type> <name1>, <name2>, ...
            const useMatch = trimmed.match(/use\s+(?:\w+\s+)?([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
            if (useMatch) {
                const parentNames = useMatch[1]
                    .split(',')
                    .map(name => name.trim())
                    .filter(name => name.length > 0);
                parents.push(...parentNames);
            }
        }
        
        return parents;
    }

    /**
     * Get all visible symbols (imported parents + their children)
     */
    private async getVisibleSymbols(context: IRuleValidationContext, importedParents: string[]): Promise<any[]> {
        const visibleSymbols: any[] = [];
        
        if (!context.symbolManager) {
            console.log(`❌ No symbolManager in context`);
            return visibleSymbols;
        }

        const allSymbols = context.symbolManager.getAllSymbols?.() || [];
        console.log(`🔍 Symbol Visibility: Total symbols in manager: ${allSymbols.length}`);
        console.log(`🔍 Symbol Visibility: Symbol names: ${allSymbols.map(s => s.name).join(', ')}`);
        
        for (const parentName of importedParents) {
            console.log(`🔍 Looking for parent symbol: "${parentName}"`);
            
            // Find the parent symbol
            const parentSymbol = allSymbols.find(symbol => 
                symbol.name === parentName && !symbol.parentSymbol
            );
            
            if (parentSymbol) {
                console.log(`✅ Found parent symbol: ${parentSymbol.name} (ID: ${parentSymbol.id}, Type: ${parentSymbol.type})`);
                
                // Add parent symbol
                visibleSymbols.push(parentSymbol);
                
                // Add all child symbols
                const childSymbols = allSymbols.filter(symbol => 
                    symbol.parentSymbol === parentSymbol.id
                );
                console.log(`🔍 Found ${childSymbols.length} child symbols for parent ${parentName}`);
                console.log(`🔍 Child symbol names: ${childSymbols.map(s => s.name).join(', ')}`);
                
                visibleSymbols.push(...childSymbols);
                
                console.log(`✅ Made visible: ${parentName} + ${childSymbols.length} children`);
            } else {
                console.log(`❌ Parent symbol "${parentName}" NOT FOUND`);
                console.log(`🔍 Available parent symbols: ${allSymbols.filter(s => !s.parentSymbol).map(s => s.name).join(', ')}`);
            }
        }
        
        console.log(`🔍 Total visible symbols: ${visibleSymbols.length} - ${visibleSymbols.map(s => s.name).join(', ')}`);
        return visibleSymbols;
    }

    /**
     * Extract all symbol references from document content
     */
    private extractSymbolReferences(lines: string[]): Array<{symbolName: string, line: number, startCol: number, endCol: number}> {
        const references: Array<{symbolName: string, line: number, startCol: number, endCol: number}> = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) continue;

            // VML: feature <FeatureName> mandatory selected
            const featureMatch = trimmed.match(/feature\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (featureMatch) {
                const symbolName = featureMatch[1];
                const startCol = line.indexOf(symbolName);
                const endCol = startCol + symbolName.length;
                references.push({ symbolName, line: i, startCol, endCol });
                continue;
            }

            // REQ: implements function <FunctionName>
            const implementsMatch = trimmed.match(/implements\s+function\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (implementsMatch) {
                const symbolName = implementsMatch[1];
                const startCol = line.indexOf(symbolName);
                const endCol = startCol + symbolName.length;
                references.push({ symbolName, line: i, startCol, endCol });
                continue;
            }

            // REQ: allocatedto subsystem <SubsystemName>
            const allocatedMatch = trimmed.match(/allocatedto\s+(?:subsystem|component)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (allocatedMatch) {
                const symbolName = allocatedMatch[1];
                const startCol = line.indexOf(symbolName);
                const endCol = startCol + symbolName.length;
                references.push({ symbolName, line: i, startCol, endCol });
                continue;
            }
        }
        
        return references;
    }
} 