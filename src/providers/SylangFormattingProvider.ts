import * as vscode from 'vscode';

export class SylangFormattingProvider implements vscode.DocumentFormattingEditProvider {
    
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        
        const edits: vscode.TextEdit[] = [];
        const tabSize = options.tabSize || 2;
        const insertSpaces = options.insertSpaces;
        const indent = insertSpaces ? ' '.repeat(tabSize) : '\t';
        
        let currentIndentLevel = 0;
        const lines = document.getText().split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            const trimmedLine = line.trim();
            
            if (trimmedLine.length === 0) {
                // Keep empty lines as-is
                continue;
            }
            
            if (trimmedLine.startsWith('//')) {
                // Keep comments with proper indentation
                const expectedIndent = indent.repeat(currentIndentLevel);
                if (line !== expectedIndent + trimmedLine) {
                    const range = new vscode.Range(i, 0, i, line!.length);
                    edits.push(vscode.TextEdit.replace(range, expectedIndent + trimmedLine));
                }
                continue;
            }
            
            // Determine if this line should decrease indentation
            if (this.shouldDecreaseIndent(trimmedLine, currentIndentLevel)) {
                currentIndentLevel = Math.max(0, currentIndentLevel - 1);
            }
            
            // Calculate expected indentation
            const expectedIndent = indent.repeat(currentIndentLevel);
            const formattedLine = expectedIndent + trimmedLine;
            
            // Apply formatting if line is different
            if (line !== formattedLine) {
                const range = new vscode.Range(i, 0, i, line!.length);
                edits.push(vscode.TextEdit.replace(range, formattedLine));
            }
            
            // Determine if next line should increase indentation
            if (this.shouldIncreaseIndent(trimmedLine)) {
                currentIndentLevel++;
            }
        }
        
        return edits;
    }
    
    private shouldIncreaseIndent(line: string): boolean {
        const increaseKeywords = [
            'productline',
            'systemfunctions',
            'systemfeatures',
            'function',
            'feature'
        ];
        
        return increaseKeywords.some(keyword => 
            line.startsWith(keyword + ' ') || line === keyword
        );
    }
    
    private shouldDecreaseIndent(line: string, currentLevel: number): boolean {
        // Decrease indent for lines that start at the same level as container keywords
        if (currentLevel === 0) {
            return false;
        }
        
        const containerKeywords = [
            'productline',
            'systemfunctions', 
            'systemfeatures',
            'function',
            'feature'
        ];
        
        return containerKeywords.some(keyword => 
            line.startsWith(keyword + ' ') || line === keyword
        );
    }
    
    public provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        _range: vscode.Range,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        
        // For range formatting, we'll format the entire document to maintain consistency
        return this.provideDocumentFormattingEdits(document, options, token);
    }
} 