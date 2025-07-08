import * as vscode from 'vscode';
import { SymbolManager } from '../core/SymbolManager';

export class SylangRenameProvider implements vscode.RenameProvider {
    constructor(private symbolManager: SymbolManager) {}

    async provideRenameEdits(
        document: vscode.TextDocument,
        position: vscode.Position,
        newName: string,
        _token: vscode.CancellationToken
    ): Promise<vscode.WorkspaceEdit | null> {
        try {
            // Get the word at the current position
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) {
                return null;
            }

            const symbolName = document.getText(wordRange);
            
            // Validate new name
            if (!this.isValidIdentifier(newName)) {
                throw new Error('Invalid identifier name');
            }

            // Find all references and the definition
            const references = this.symbolManager.findReferences(symbolName);
            const definition = this.symbolManager.findDefinition(symbolName, document);
            
            if (references.length === 0 && !definition) {
                return null;
            }

            const workspaceEdit = new vscode.WorkspaceEdit();

            // Add the definition edit
            if (definition) {
                workspaceEdit.replace(definition.location.uri, definition.range, newName);
            }

            // Add all reference edits
            for (const reference of references) {
                workspaceEdit.replace(reference.location.uri, reference.range, newName);
            }

            return workspaceEdit;
        } catch (error) {
            console.error('Error in provideRenameEdits:', error);
            return null;
        }
    }

    async prepareRename(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Range | { range: vscode.Range; placeholder: string } | null> {
        try {
            // Get the word at the current position
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) {
                return null;
            }

            const symbolName = document.getText(wordRange);
            
            // Check if this is a valid symbol to rename
            const definition = this.symbolManager.findDefinition(symbolName, document);
            const references = this.symbolManager.findReferences(symbolName);
            
            if (!definition && references.length === 0) {
                return null;
            }

            return {
                range: wordRange,
                placeholder: symbolName
            };
        } catch (error) {
            console.error('Error in prepareRename:', error);
            return null;
        }
    }

    private isValidIdentifier(name: string): boolean {
        // Check if the name is a valid identifier
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
    }
} 