import * as vscode from 'vscode';
import { SymbolManager } from '../core/SymbolManager';

export class SylangDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private symbolManager: SymbolManager) {}

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Definition | vscode.DefinitionLink[] | null> {
        try {
            // Get the word at the current position
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) {
                return null;
            }

            const symbolName = document.getText(wordRange);
            
            // Find the definition
            const definition = this.symbolManager.findDefinition(symbolName, document);
            if (!definition) {
                return null;
            }

            return definition.location;
        } catch (error) {
            console.error('Error in provideDefinition:', error);
            return null;
        }
    }
} 