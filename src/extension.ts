import * as vscode from 'vscode';
import { SylangCompletionProvider } from './providers/SylangCompletionProvider';
import { SylangFormattingProvider } from './providers/SylangFormattingProvider';
import { SylangDefinitionProvider } from './providers/SylangDefinitionProvider';
import { SylangReferenceProvider } from './providers/SylangReferenceProvider';
import { SylangRenameProvider } from './providers/SylangRenameProvider';
import { ValidationEngine } from './core/ValidationEngine';
import { SymbolManager } from './core/SymbolManager';
import { getLanguageConfig, getAllLanguageIds } from './config/LanguageConfigs';

class SylangExtension {
    private validationEngine: ValidationEngine | undefined;
    private symbolManager: SymbolManager | undefined;

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        const packageJson = require('../package.json');
        console.log(`[Sylang] ===== SYLANG EXTENSION VERSION ${packageJson.version} ACTIVATING =====`);
        console.log('Sylang Language Support is activating...');

        try {
            // Initialize core services
            this.symbolManager = new SymbolManager();
            this.validationEngine = new ValidationEngine(this.symbolManager);

            // Build workspace index for import resolution
            console.log('[Sylang] Building workspace index for import resolution...');
            await this.symbolManager.buildWorkspaceIndex();
            console.log('[Sylang] Workspace index building completed');

            // Parse symbols for all currently open Sylang documents
            for (const document of vscode.workspace.textDocuments) {
                if (this.isSylangDocument(document)) {
                    const languageConfig = getLanguageConfig(document.languageId);
                    if (languageConfig) {
                        await this.symbolManager.parseDocument(document, languageConfig);
                    }
                }
            }

            // Register language providers for all Sylang file types
            // Use the actual language IDs from LanguageConfigs to ensure consistency
            const sylangLanguageIds = getAllLanguageIds();

            for (const languageId of sylangLanguageIds) {
                // Get language config for this language ID
                const languageConfig = getLanguageConfig(languageId);
                const keywords = languageConfig ? languageConfig.keywords : [];

                // Completion provider
                context.subscriptions.push(
                    vscode.languages.registerCompletionItemProvider(
                        { language: languageId },
                        new SylangCompletionProvider(languageId, keywords, this.symbolManager),
                        ' ', ':', '"'
                    )
                );

                // Formatting provider
                context.subscriptions.push(
                    vscode.languages.registerDocumentFormattingEditProvider(
                        { language: languageId },
                        new SylangFormattingProvider()
                    )
                );

                // Definition provider
                context.subscriptions.push(
                    vscode.languages.registerDefinitionProvider(
                        { language: languageId },
                        new SylangDefinitionProvider(this.symbolManager)
                    )
                );

                // Reference provider
                context.subscriptions.push(
                    vscode.languages.registerReferenceProvider(
                        { language: languageId },
                        new SylangReferenceProvider(this.symbolManager)
                    )
                );

                // Rename provider
                context.subscriptions.push(
                    vscode.languages.registerRenameProvider(
                        { language: languageId },
                        new SylangRenameProvider(this.symbolManager)
                    )
                );
            }

            // Register document change listeners for validation
            context.subscriptions.push(
                vscode.workspace.onDidChangeTextDocument(async (event) => {
                    if (this.isSylangDocument(event.document) && this.validationEngine) {
                        console.log(`[Sylang] Document changed: ${event.document.fileName}`);
                        await this.validationEngine.validateDocument(event.document);
                    }
                })
            );

            context.subscriptions.push(
                vscode.workspace.onDidSaveTextDocument(async (document) => {
                    if (this.isSylangDocument(document) && this.validationEngine) {
                        console.log(`[Sylang] Document saved: ${document.fileName}`);
                        await this.validationEngine.validateDocument(document);
                        // Update symbol manager on save
                        if (this.symbolManager) {
                            const languageConfig = getLanguageConfig(document.languageId);
                            if (languageConfig) {
                                await this.symbolManager.parseDocument(document, languageConfig);
                            }
                        }
                    }
                })
            );

            context.subscriptions.push(
                vscode.workspace.onDidOpenTextDocument(async (document) => {
                    if (this.isSylangDocument(document) && this.validationEngine) {
                        console.log(`[Sylang] Document opened: ${document.fileName}`);
                        await this.validationEngine.validateDocument(document);
                    }
                })
            );

            // Validate all currently open Sylang documents
            for (const editor of vscode.window.visibleTextEditors) {
                if (this.isSylangDocument(editor.document) && this.validationEngine) {
                    await this.validationEngine.validateDocument(editor.document);
                }
            }

            // Register commands
            context.subscriptions.push(
                vscode.commands.registerCommand('sylang.validateWorkspace', async () => {
                    if (this.validationEngine) {
                        console.log('[Sylang] Manual workspace validation triggered');
                        await this.validationEngine.validateWorkspace();
                        vscode.window.showInformationMessage('Workspace validation completed.');
                    }
                })
            );

            context.subscriptions.push(
                vscode.commands.registerCommand('sylang.refreshSymbols', async () => {
                    if (this.symbolManager) {
                        console.log('[Sylang] Manual symbol refresh triggered');
                        // Re-parse all open Sylang documents
                        for (const document of vscode.workspace.textDocuments) {
                            if (this.isSylangDocument(document)) {
                                const languageConfig = getLanguageConfig(document.languageId);
                                if (languageConfig) {
                                    await this.symbolManager.parseDocument(document, languageConfig);
                                }
                            }
                        }
                        vscode.window.showInformationMessage('Symbol cache refreshed.');
                    }
                })
            );

            // Clean up on deactivation
            context.subscriptions.push({
                dispose: () => {
                    if (this.validationEngine) {
                        this.validationEngine.dispose();
                    }
                }
            });

            console.log('Sylang Language Support activated successfully!');

        } catch (error) {
            console.error('Failed to activate Sylang Language Support:', error);
            vscode.window.showErrorMessage(`Failed to activate Sylang extension: ${error}`);
        }
    }

    private isSylangDocument(document: vscode.TextDocument): boolean {
        const languageId = document.languageId;
        console.log(`[Sylang] - Language ID: ${languageId}`);
        console.log(`[Sylang] - Starts with 'sylang-': ${languageId.startsWith('sylang-')}`);
        
        const sylangExtensions = ['.ple', '.fml', '.fun', '.sub', '.cmp', '.req', 
                                 '.haz', '.rsk', '.fsr', '.itm', '.sgl', '.tra', '.thr', '.sgo', 
                                 '.sre', '.ast', '.sec', '.mod', '.prt', '.ckt', '.asm', '.blk'];
        const hasSylangExtension = sylangExtensions.some(ext => document.fileName.endsWith(ext));
        console.log(`[Sylang] - Has Sylang extension: ${hasSylangExtension}`);
        
        const result = languageId.startsWith('sylang-') || hasSylangExtension;
        console.log(`[Sylang] - Result: ${result}`);
        
        return result;
    }

    public deactivate(): void {
        console.log('Sylang Language Support is deactivating...');
        if (this.validationEngine) {
            this.validationEngine.dispose();
        }
    }
}

const extension = new SylangExtension();

export function activate(context: vscode.ExtensionContext): Promise<void> {
    return extension.activate(context);
}

export function deactivate(): void {
    extension.deactivate();
} 