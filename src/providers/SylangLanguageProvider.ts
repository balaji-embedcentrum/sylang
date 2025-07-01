import * as vscode from 'vscode';

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

// Factory function for creating language providers - makes it easy to add new DSLs
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