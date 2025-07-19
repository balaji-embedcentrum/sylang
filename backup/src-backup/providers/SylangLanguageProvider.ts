import * as vscode from 'vscode';
import { SymbolManager } from '../core/SymbolManager';

// Base class for language providers - easily extensible for new DSLs
export abstract class SylangLanguageProvider {
    protected keywords: string[];
    protected fileExtensions: string[];
    protected languageId: string;

    constructor(languageId: string, keywords: string[], fileExtensions: string[]) {
        this.languageId = languageId;
        this.keywords = keywords;
        this.fileExtensions = fileExtensions;
    }

    // Common utility methods that can be used by all language providers
    protected isValidKeyword(word: string): boolean {
        return this.keywords.includes(word);
    }

    protected getFileExtension(document: vscode.TextDocument): string {
        const uri = document.uri;
        const filename = uri.path.split('/').pop() || '';
        const parts = filename.split('.');
        return parts.length > 1 ? '.' + parts.pop() : '';
    }

    protected isFileSupported(document: vscode.TextDocument): boolean {
        const extension = this.getFileExtension(document);
        return this.fileExtensions.includes(extension);
    }

    protected getIndentationLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match && match[1] ? match[1].length : 0;
    }

    protected extractQuotedString(line: string): string | null {
        const match = line.match(/"([^"]*)"/);
        return match && match[1] !== undefined ? match[1] : null;
    }

    protected getWordAtPosition(document: vscode.TextDocument, position: vscode.Position): string {
        const range = document.getWordRangeAtPosition(position);
        return range ? document.getText(range) : '';
    }

    // Abstract methods that must be implemented by specific language providers
    abstract validateSyntax(document: vscode.TextDocument): vscode.Diagnostic[];
    abstract provideCompletions(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[];
    abstract provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null;
}

// Concrete implementation for Sylang
export class ConcreteSylangProvider extends SylangLanguageProvider {
    constructor(languageId: string, keywords: string[], fileExtensions: string[]) {
        super(languageId, keywords, fileExtensions);
    }

    public validateSyntax(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            const trimmed = line.trim();

            if (trimmed.length === 0 || trimmed.startsWith('//')) {
                continue;
            }

            // Basic syntax validation
            if (trimmed.includes('safetylevel')) {
                const safetyLevel = this.extractSafetyLevel(trimmed);
                if (safetyLevel && !this.isValidSafetyLevel(safetyLevel)) {
                    const range = new vscode.Range(i, 0, i, line!.length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Invalid safety level: ${safetyLevel}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }

        return diagnostics;
    }

    public provideCompletions(_document: vscode.TextDocument, _position: vscode.Position): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];
        
        this.keywords.forEach(keyword => {
            const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
            items.push(item);
        });

        return items;
    }

    public provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
        const word = this.getWordAtPosition(document, position);
        
        if (this.isValidKeyword(word)) {
            const documentation = new vscode.MarkdownString(`**${word}**\n\nSylang keyword`);
            return new vscode.Hover(documentation);
        }

        return null;
    }

    private extractSafetyLevel(line: string): string | null {
        const match = line.match(/safetylevel\s+(\S+)/);
        return match && match[1] !== undefined ? match[1] : null;
    }

    private isValidSafetyLevel(level: string): boolean {
        return ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'].includes(level);
    }
}

// Factory def function for creating language providers - makes it easy to add new DSLs
export class LanguageProviderFactory {
    public static createProvider(
        languageId: string, 
        keywords: string[], 
        fileExtensions: string[]
    ): ConcreteSylangProvider {
        return new ConcreteSylangProvider(languageId, keywords, fileExtensions);
    }

    // Method to register a new DSL - useful for future extensions
    public static registerNewDSL(
        languageId: string,
        keywords: string[],
        fileExtensions: string[],
        customValidation?: (document: vscode.TextDocument) => vscode.Diagnostic[]
    ): ConcreteSylangProvider {
        const provider = this.createProvider(languageId, keywords, fileExtensions);
        
        // If custom validation is provided, override the default
        if (customValidation) {
            provider.validateSyntax = customValidation;
        }
        
        return provider;
    }
} 

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