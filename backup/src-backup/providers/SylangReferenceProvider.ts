import * as vscode from 'vscode';
import { SymbolManager } from '../core/SymbolManager';

export class SylangReferenceProvider implements vscode.ReferenceProvider {
    constructor(private symbolManager: SymbolManager) {}

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext,
        _token: vscode.CancellationToken
    ): Promise<vscode.Location[] | null> {
        try {
            // Get the word at the current position
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) {
                return null;
            }

            const symbolName = document.getText(wordRange);
            
            // Find all references
            const references = this.symbolManager.findReferences(symbolName);
            if (references.length === 0) {
                return null;
            }

            // Convert to locations
            const locations = references.map(ref => ref.location);
            
            // If includeDeclaration is true, also include the definition
            if (context.includeDeclaration) {
                const definition = this.symbolManager.findDefinition(symbolName, document);
                if (definition) {
                    locations.unshift(definition.location);
                }
            }

            return locations;
        } catch (error) {
            console.error('Error in provideReferences:', error);
            return null;
        }
    }
} 