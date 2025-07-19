import * as vscode from 'vscode';
import { SymbolManager } from '../core/SymbolManager';

export class SylangConfigDecorationProvider {
    private grayedOutDecoration: vscode.TextEditorDecorationType;
    private symbolManager: SymbolManager;
    private disposables: vscode.Disposable[] = [];

    constructor(symbolManager: SymbolManager) {
        this.symbolManager = symbolManager;
        
        // Create decoration type for grayed out sections
        this.grayedOutDecoration = vscode.window.createTextEditorDecorationType({
            opacity: '0.5',
            fontStyle: 'italic',
            color: '#888888',
            backgroundColor: 'rgba(128, 128, 128, 0.1)'
        });

        // Register event handlers
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) {
                    this.updateDecorations(editor);
                }
            }),
            vscode.workspace.onDidChangeTextDocument(event => {
                const editor = vscode.window.activeTextEditor;
                if (editor && event.document === editor.document) {
                    this.updateDecorations(editor);
                }
            }),
            vscode.workspace.onDidSaveTextDocument(document => {
                if (document.fileName.endsWith('.vcf')) {
                    // Config file changed, update all open editors
                    vscode.window.visibleTextEditors.forEach(editor => {
                        this.updateDecorations(editor);
                    });
                }
            })
        );
    }

    public async updateDecorations(editor: vscode.TextEditor): Promise<void> {
        if (!this.isSylangFile(editor.document)) {
            return;
        }

        try {
            const configs = await this.getActiveConfigs();
            const grayedRanges = await this.findGrayedRanges(editor.document, configs);
            
            editor.setDecorations(this.grayedOutDecoration, grayedRanges);
        } catch (error) {
            console.error('[Sylang] Error updating decorations:', error);
        }
    }

    private isSylangFile(document: vscode.TextDocument): boolean {
        const sylangExtensions = ['.fun', '.req', '.sys', '.blk', '.tst'];
        return sylangExtensions.some(ext => document.fileName.endsWith(ext));
    }

    private async getActiveConfigs(): Promise<Map<string, number>> {
        const configs = new Map<string, number>();
        
        if (!vscode.workspace.workspaceFolders) {
            return configs;
        }

        // Find .vcf file in workspace
        const vcfFiles = await vscode.workspace.findFiles('**/*.vcf');
        if (vcfFiles.length === 0) {
            return configs; // No config file, nothing to gray out
        }

        // Parse first .vcf file (only one allowed)
        const vcfDocument = await vscode.workspace.openTextDocument(vcfFiles[0]);
        const text = vcfDocument.getText();
        const lines = text.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            const configMatch = trimmedLine.match(/^def\s+config\s+(c_[A-Za-z0-9_]+)\s+([01])$/);
            if (configMatch) {
                const [, configName, value] = configMatch;
                configs.set(configName, parseInt(value, 10));
            }
        }

        return configs;
    }

    private async findGrayedRanges(document: vscode.TextDocument, configs: Map<string, number>): Promise<vscode.Range[]> {
        const grayedRanges: vscode.Range[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let currentDefinition: { start: number; configName?: string } | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            if (!trimmedLine || trimmedLine.startsWith('//')) {
                continue;
            }

            // Check for definition start
            if (trimmedLine.startsWith('def ')) {
                // End previous definition if it was grayed out
                if (currentDefinition && currentDefinition.configName) {
                    const configValue = configs.get(currentDefinition.configName);
                    if (configValue === 0) {
                        const startPos = new vscode.Position(currentDefinition.start, 0);
                        const endPos = new vscode.Position(i - 1, lines[i - 1].length);
                        grayedRanges.push(new vscode.Range(startPos, endPos));
                    }
                }

                // Start new definition
                currentDefinition = { start: i };
                continue;
            }

            // Check for config property
            if (currentDefinition && trimmedLine.startsWith('config ')) {
                const configMatch = trimmedLine.match(/^config\s+(c_[A-Za-z0-9_]+)$/);
                if (configMatch) {
                    currentDefinition.configName = configMatch[1];
                }
            }
        }

        // Handle last definition
        if (currentDefinition && currentDefinition.configName) {
            const configValue = configs.get(currentDefinition.configName);
            if (configValue === 0) {
                const startPos = new vscode.Position(currentDefinition.start, 0);
                const endPos = new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
                grayedRanges.push(new vscode.Range(startPos, endPos));
            }
        }

        return grayedRanges;
    }

    public dispose(): void {
        this.grayedOutDecoration.dispose();
        this.disposables.forEach(d => d.dispose());
    }
} 