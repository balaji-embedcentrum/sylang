import * as vscode from 'vscode';

export class SylangCompletionProvider implements vscode.CompletionItemProvider {
    private keywords: string[];
    private completionItems: vscode.CompletionItem[];

    constructor(keywords: string[]) {
        this.keywords = keywords;
        this.completionItems = this.createCompletionItems();
    }

    private createCompletionItems(): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        // Safety levels - common across all Sylang types
        const safetyLevels = ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'];
        safetyLevels.forEach(level => {
            const item = new vscode.CompletionItem(level, vscode.CompletionItemKind.EnumMember);
            item.detail = `Safety Level: ${level}`;
            item.documentation = new vscode.MarkdownString(`ISO 26262 safety integrity level: **${level}**`);
            items.push(item);
        });

        // Keywords with descriptions
        const keywordDescriptions: Record<string, string> = {
            'productline': 'Define a product line with features and variants',
            'systemfunctions': 'Define system functions container',
            'systemfeatures': 'Define system features container',
            'function': 'Define a system function',
            'feature': 'Define a feature in the product line',
            'mandatory': 'Feature is required in all variants',
            'optional': 'Feature is optional',
            'alternative': 'Exactly one feature from the group must be selected',
            'or': 'At least one feature from the group must be selected',
            'name': 'Human-readable name',
            'description': 'Detailed description',
            'owner': 'Team or person responsible',
            'tags': 'Categorization tags',
            'safetylevel': 'ISO 26262 safety integrity level',
            'enables': 'Features or functions this enables',
            'domain': 'Application domain',
            'compliance': 'Standards compliance',
            'firstrelease': 'First release date',
            'region': 'Geographic regions'
        };

        this.keywords.forEach(keyword => {
            const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
            item.detail = keywordDescriptions[keyword] || `Sylang keyword: ${keyword}`;
            item.documentation = new vscode.MarkdownString(`**${keyword}**\n\n${keywordDescriptions[keyword] || 'Sylang language keyword'}`);
            
            // Add snippets for complex keywords
            if (keyword === 'productline') {
                item.insertText = new vscode.SnippetString('productline ${1:ProductLineName}\n  description "${2:Description}"\n  owner "${3:Team}"\n  domain "${4:automotive}"\n  safetylevel ${5|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}');
                item.kind = vscode.CompletionItemKind.Snippet;
            } else if (keyword === 'function') {
                item.insertText = new vscode.SnippetString('function ${1:FunctionName}\n  name "${2:Display Name}"\n  description "${3:Function description}"\n  owner "${4:Team}"\n  safetylevel ${5|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}');
                item.kind = vscode.CompletionItemKind.Snippet;
            } else if (keyword === 'feature') {
                item.insertText = new vscode.SnippetString('feature ${1:FeatureName} ${2|mandatory,optional,alternative|}\n  name "${3:Display Name}"\n  description "${4:Feature description}"\n  owner "${5:Team}"\n  safetylevel ${6|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}');
                item.kind = vscode.CompletionItemKind.Snippet;
            }
            
            items.push(item);
        });

        return items;
    }

    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        
        const lineText = document.lineAt(position).text;
        const linePrefix = lineText.substring(0, position.character);

        // Context-aware completions
        if (linePrefix.includes('safetylevel')) {
            return this.completionItems.filter(item => 
                item.label.toString().startsWith('ASIL') || item.label === 'QM'
            );
        }

        // Return all completion items
        return this.completionItems;
    }

    public resolveCompletionItem(
        item: vscode.CompletionItem,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CompletionItem> {
        return item;
    }
} 