import * as vscode from 'vscode';

export class SylangValidationProvider implements vscode.Disposable {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private languageId: string;
    private keywords: string[];

    constructor(languageId: string, keywords: string[]) {
        this.languageId = languageId;
        this.keywords = keywords;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection(`sylang-${languageId}`);
        
        // Listen for document changes
        vscode.workspace.onDidChangeTextDocument(this.onDocumentChanged, this);
        vscode.workspace.onDidOpenTextDocument(this.onDocumentOpened, this);
    }

    private onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
        if (event.document.languageId === this.languageId) {
            this.validateDocument(event.document);
        }
    }

    private onDocumentOpened(document: vscode.TextDocument): void {
        if (document.languageId === this.languageId) {
            this.validateDocument(document);
        }
    }

    public async validateDocument(document: vscode.TextDocument): Promise<void> {
        console.log(`[Sylang] Validating document: ${document.fileName}, languageId: ${document.languageId}`);
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (!line) continue;
            const trimmedLine = line.trim();
            
            if (trimmedLine.length === 0 || trimmedLine.startsWith('//')) {
                continue; // Skip empty lines and comments
            }

            // Validate syntax based on language type
            this.validateLineSyntax(document, lineIndex, line!, diagnostics);
        }

        console.log(`[Sylang] Found ${diagnostics.length} validation issues`);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private validateLineSyntax(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string,
        diagnostics: vscode.Diagnostic[]
    ): void {
        const trimmedLine = line.trim();
        
        // Simple test: flag any line containing "test" as a warning
        if (trimmedLine.toLowerCase().includes('test')) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Test validation is working - remove this line to test other features',
                vscode.DiagnosticSeverity.Information
            );
            diagnostic.code = 'test-validation';
            diagnostic.source = 'Sylang';
            diagnostics.push(diagnostic);
        }
        
        // Check for missing quotes in string values
        if (trimmedLine.includes('description') || trimmedLine.includes('name') || trimmedLine.includes('owner')) {
            if (!this.hasProperQuoting(trimmedLine)) {
                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    'String values should be enclosed in quotes',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = 'missing-quotes';
                diagnostics.push(diagnostic);
            }
        }

        // Validate safety levels
        if (trimmedLine.includes('safetylevel')) {
            const safetyLevel = this.extractSafetyLevel(trimmedLine);
            if (safetyLevel && !['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'].includes(safetyLevel)) {
                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Invalid safety level: ${safetyLevel}. Valid values are: ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'invalid-safety-level';
                diagnostics.push(diagnostic);
            }
        }

        // Check indentation consistency
        const indentLevel = this.getIndentLevel(line);
        if (indentLevel % 2 !== 0) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, indentLevel);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Inconsistent indentation. Use 2 spaces per level.',
                vscode.DiagnosticSeverity.Information
            );
            diagnostic.code = 'inconsistent-indent';
            diagnostics.push(diagnostic);
        }

        // Validate feature variability types
        if (this.languageId === 'sylang-features' && trimmedLine.startsWith('feature')) {
            this.validateFeatureVariability(trimmedLine, lineIndex, line, diagnostics);
        }

        // Validate required fields
        this.validateRequiredFields(document, lineIndex, trimmedLine, diagnostics);

        // Check for keyword typos
        this.validateKeywordSpelling(document, lineIndex, line, diagnostics);
    }

    private hasProperQuoting(line: string): boolean {
        const afterColon = line.split(':')[1] || line.split(' ').slice(1).join(' ');
        const trimmed = afterColon.trim();
        return trimmed.startsWith('"') && trimmed.endsWith('"');
    }

    private extractSafetyLevel(line: string): string | null {
        const match = line.match(/safetylevel\s+(\S+)/);
        return match && match[1] !== undefined ? match[1] : null;
    }

    private getIndentLevel(line: string): number {
        return line.length - line.trimStart().length;
    }

    private validateFeatureVariability(line: string, lineIndex: number, fullLine: string, diagnostics: vscode.Diagnostic[]): void {
        const variabilityTypes = ['mandatory', 'optional', 'alternative', 'or'];
        const hasValidType = variabilityTypes.some(type => line.includes(type));
        
        if (!hasValidType && line.includes('feature') && !line.trim().endsWith('{')) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, fullLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Feature must specify variability type: mandatory, optional, alternative, or or',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-variability-type';
            diagnostics.push(diagnostic);
        }
    }

    private validateRequiredFields(_document: vscode.TextDocument, _lineIndex: number, line: string, _diagnostics: vscode.Diagnostic[]): void {
        // Check for required fields based on element type
        if (line.startsWith('productline') || line.startsWith('function') || line.startsWith('feature')) {
            // This would need more sophisticated parsing to check if required fields are present
            // For now, just a basic check
        }
    }

    private validateKeywordSpelling(
        _document: vscode.TextDocument,
        lineIndex: number,
        line: string,
        diagnostics: vscode.Diagnostic[]
    ): void {
        // Skip comments and empty lines
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0 || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
            return;
        }

        // Extended keyword list based on language type
        const allKeywords = this.getExtendedKeywords();
        
        // Extract the non-quoted parts of the line for keyword validation
        const nonQuotedText = this.extractNonQuotedText(trimmedLine);
        
        // More robust word extraction - split by spaces and clean
        const words = nonQuotedText.split(/\s+/);
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (!word) continue;
            
            // Clean the word - remove quotes, colons, etc.
            const cleanWord = word.replace(/[^\w]/g, '');
            
            // Skip if word is too short, is a number, or looks like a constant
            if (cleanWord.length <= 2 || /^\d+$/.test(cleanWord) || /^[A-Z_]+$/.test(cleanWord)) {
                continue;
            }
            
            // Check if it's a potential keyword that's misspelled
            if (this.couldBeKeyword(cleanWord)) {
                const suggestion = this.findClosestKeyword(cleanWord, allKeywords);
                if (suggestion && suggestion !== cleanWord.toLowerCase()) {
                    // Find the position of the word in the original line (not the filtered text)
                    const wordStart = line.indexOf(word);
                    const cleanWordStart = line.indexOf(cleanWord, wordStart >= 0 ? wordStart : 0);
                    
                    if (cleanWordStart !== -1 && !this.isInsideStringLiteral(line, cleanWordStart)) {
                        const range = new vscode.Range(
                            lineIndex, 
                            cleanWordStart, 
                            lineIndex, 
                            cleanWordStart + cleanWord.length
                        );
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            `Unknown keyword '${cleanWord}'. Did you mean '${suggestion}'?`,
                            vscode.DiagnosticSeverity.Error
                        );
                        diagnostic.code = 'keyword-typo';
                        diagnostic.source = 'Sylang';
                        diagnostics.push(diagnostic);
                    }
                }
            }
        }
    }

    private extractNonQuotedText(line: string): string {
        let result = '';
        let insideQuotes = false;
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                insideQuotes = !insideQuotes;
                result += ' '; // Replace quote with space to maintain word separation
            } else if (!insideQuotes) {
                result += char;
            } else {
                result += ' '; // Replace quoted content with spaces to maintain positions
            }
            i++;
        }
        
        return result;
    }

    private isInsideStringLiteral(line: string, position: number): boolean {
        let insideQuotes = false;
        
        for (let i = 0; i < position && i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                insideQuotes = !insideQuotes;
            }
        }
        
        return insideQuotes;
    }

    private couldBeKeyword(word: string): boolean {
        // More lenient check - words that look like they could be keywords
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(word)) {
            return false;
        }
        
        // Keywords are usually lowercase or camelCase
        const hasLowercase = /[a-z]/.test(word);
        return hasLowercase;
    }

    private getExtendedKeywords(): string[] {
        const safetyKeywords = [
            // Main keywords
            'functionalsafetyrequirements', 'requirement', 'safety', 'hazard', 'risk', 'goal', 'item',
            // Property keywords  
            'name', 'description', 'owner', 'tags', 'safetylevel', 'severity', 'probability', 'controllability', 
            'verification', 'rationale',
            // Reference keywords (both cases)
            'derivedfrom', 'derivedFrom', 'allocatedto', 'allocatedTo', 'asil', 'ASIL',
            // Common misspellings to catch
            'requiremnt', 'descrition', 'alloctedto', 'raionale'
        ];
        
        const securityKeywords = [
            'security', 'threat', 'asset', 'TARA', 'cybersecurity'
        ];
        
        const featureKeywords = [
            'feature', 'mandatory', 'optional', 'alternative', 'or', 'systemfeatures'
        ];
        
        const functionKeywords = [
            'systemfunctions', 'function', 'enables'
        ];
        
        const productlineKeywords = [
            'productline', 'domain', 'compliance', 'firstrelease', 'region'
        ];

        // Return relevant keywords based on language type
        switch (this.languageId) {
            case 'sylang-safety':
                return [...this.keywords, ...safetyKeywords];
            case 'sylang-security':
                return [...this.keywords, ...securityKeywords];
            case 'sylang-features':
                return [...this.keywords, ...featureKeywords];
            case 'sylang-functions':
                return [...this.keywords, ...functionKeywords];
            case 'sylang-productline':
                return [...this.keywords, ...productlineKeywords];
            default:
                return this.keywords;
        }
    }

    private findClosestKeyword(word: string, keywords: string[]): string | null {
        let bestMatch = null;
        let bestDistance = Infinity;
        
        // Direct mapping for common typos
        const commonTypos: { [key: string]: string } = {
            'requiremnt': 'requirement',
            'descrition': 'description', 
            'alloctedto': 'allocatedto',
            'raionale': 'rationale',
            'derivedfrom': 'derivedfrom', // Accept this as valid
            'allocatedto': 'allocatedto'  // Accept this as valid
        };
        
        const lowerWord = word.toLowerCase();
        if (commonTypos[lowerWord]) {
            return commonTypos[lowerWord]!;
        }
        
        for (const keyword of keywords) {
            const distance = this.levenshteinDistance(lowerWord, keyword.toLowerCase());
            if (distance < bestDistance && distance <= 2) { // Allow up to 2 character differences
                bestDistance = distance;
                bestMatch = keyword;
            }
        }
        
        return bestMatch;
    }

    private levenshteinDistance(a: string, b: string): number {
        const matrix: number[][] = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0));
        
        for (let i = 0; i <= a.length; i += 1) {
            matrix[0]![i] = i;
        }
        
        for (let j = 0; j <= b.length; j += 1) {
            matrix[j]![0] = j;
        }
        
        for (let j = 1; j <= b.length; j += 1) {
            for (let i = 1; i <= a.length; i += 1) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j]![i] = Math.min(
                    matrix[j]![i - 1]! + 1, // deletion
                    matrix[j - 1]![i]! + 1, // insertion
                    matrix[j - 1]![i - 1]! + indicator // substitution
                );
            }
        }
        
        return matrix[b.length]![a.length]!;
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
    }
} 