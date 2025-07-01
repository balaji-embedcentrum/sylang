import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
// import { SylangLanguageProvider } from './providers/SylangLanguageProvider';
import { SylangValidationProvider } from './providers/SylangValidationProvider';
import { SylangFormattingProvider } from './providers/SylangFormattingProvider';
import { SylangHoverProvider } from './providers/SylangHoverProvider';
import { SylangCompletionProvider } from './providers/SylangCompletionProvider';

// Modular extension class for easy extensibility
export class SylangExtension {
    private languageClient: LanguageClient | undefined;
    private providers: vscode.Disposable[] = [];
    
    // Sylang language configurations - easily extensible for new DSLs
    private readonly languageConfigs = {
        'sylang-productline': {
            fileExtensions: ['.ple'],
            keywords: ['productline', 'description', 'owner', 'domain', 'compliance', 'firstrelease', 'tags', 'safetylevel', 'region'],
            snippetFile: 'productline.json'
        },
        'sylang-functions': {
            fileExtensions: ['.fun'],
            keywords: ['systemfunctions', 'function', 'name', 'description', 'owner', 'tags', 'safetylevel', 'enables'],
            snippetFile: 'functions.json'
        },
        'sylang-features': {
            fileExtensions: ['.fml'],
            keywords: ['systemfeatures', 'feature', 'mandatory', 'optional', 'alternative', 'or', 'name', 'description', 'owner', 'tags', 'safetylevel'],
            snippetFile: 'features.json'
        },
        'sylang-safety': {
            fileExtensions: ['.itm', '.sgl', '.haz', '.rsk', '.fsr'],
            keywords: ['safety', 'hazard', 'risk', 'requirement', 'goal', 'item', 'safetylevel', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM', 'functionalsafetyrequirements', 'derivedfrom', 'asil', 'allocatedto', 'verification', 'rationale'],
            snippetFile: 'safety.json'
        },
        'sylang-security': {
            fileExtensions: ['.tra', '.thr', '.sgo', '.sre', '.ast', '.sec'],
            keywords: ['security', 'threat', 'asset', 'requirement', 'goal', 'TARA', 'cybersecurity'],
            snippetFile: 'security.json'
        }
    };

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        console.log('Sylang Language Support is activating...');

        // Register modular language providers for all Sylang types
        this.registerLanguageProviders(context);

        // Start LSP server if enabled
        const lspEnabled = vscode.workspace.getConfiguration('sylang').get('lsp.enabled', true);
        if (lspEnabled) {
            await this.startLanguageServer(context);
        }

        // Register commands
        this.registerCommands(context);

        console.log('Sylang Language Support activated successfully');
    }

    private registerLanguageProviders(_context: vscode.ExtensionContext): void {
        Object.entries(this.languageConfigs).forEach(([languageId, config]) => {
            // Completion provider
            const completionProvider = new SylangCompletionProvider(config.keywords);
            this.providers.push(
                vscode.languages.registerCompletionItemProvider(languageId, completionProvider, '"', "'", ' ')
            );

            // Hover provider
            const hoverProvider = new SylangHoverProvider(config.keywords);
            this.providers.push(
                vscode.languages.registerHoverProvider(languageId, hoverProvider)
            );

            // Validation provider
            const validationProvider = new SylangValidationProvider(languageId, config.keywords);
            this.providers.push(validationProvider);

            // Formatting provider
            const formattingProvider = new SylangFormattingProvider();
            this.providers.push(
                vscode.languages.registerDocumentFormattingEditProvider(languageId, formattingProvider)
            );
        });
    }

    private async startLanguageServer(context: vscode.ExtensionContext): Promise<void> {
        // LSP server setup - modular and extensible
        const serverModule = context.asAbsolutePath('out/server/server.js');
        const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

        const serverOptions: ServerOptions = {
            run: { module: serverModule, transport: TransportKind.ipc },
            debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
        };

        const clientOptions: LanguageClientOptions = {
            documentSelector: [
                { scheme: 'file', language: 'sylang-productline' },
                { scheme: 'file', language: 'sylang-functions' },
                { scheme: 'file', language: 'sylang-features' },
                { scheme: 'file', language: 'sylang-safety' },
                { scheme: 'file', language: 'sylang-security' }
            ],
            synchronize: {
                fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{ple,fun,fml,itm,sgl,haz,rsk,fsr,tra,thr,sgo,sre,ast,sec}')
            }
        };

        this.languageClient = new LanguageClient('sylangLanguageServer', 'Sylang Language Server', serverOptions, clientOptions);
        await this.languageClient.start();
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        // Validation command
        const validateCommand = vscode.commands.registerCommand('sylang.validate', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const validator = new SylangValidationProvider(document.languageId, this.getKeywordsForLanguage(document.languageId));
                await validator.validateDocument(document);
            }
        });

        // Format command
        const formatCommand = vscode.commands.registerCommand('sylang.format', async () => {
            await vscode.commands.executeCommand('editor.action.formatDocument');
        });

        context.subscriptions.push(validateCommand, formatCommand);
    }

    private getKeywordsForLanguage(languageId: string): string[] {
        return this.languageConfigs[languageId as keyof typeof this.languageConfigs]?.keywords || [];
    }

    public deactivate(): Thenable<void> | undefined {
        // Clean up providers
        this.providers.forEach(provider => provider.dispose());
        
        // Stop language client
        if (this.languageClient) {
            return this.languageClient.stop();
        }
        return undefined;
    }
}

// Extension entry points
let extensionInstance: SylangExtension;

export function activate(context: vscode.ExtensionContext): Promise<void> {
    extensionInstance = new SylangExtension();
    return extensionInstance.activate(context);
}

export function deactivate(): Thenable<void> | undefined {
    return extensionInstance?.deactivate();
} 