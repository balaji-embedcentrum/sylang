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
        
        // Test validation removed
        
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

        // Check for keyword typos (but only outside string literals)
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

        // Get valid keywords for this language type
        const validKeywords = this.getValidKeywords();
        
        // Extract the non-quoted parts of the line for keyword validation
        const nonQuotedText = this.extractNonQuotedText(trimmedLine);
        
        // Split by spaces and punctuation, but keep word positions
        const words = nonQuotedText.split(/\s+/);
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (!word) continue;
            
            // Clean the word - remove punctuation but keep letters/numbers
            const cleanWord = word.replace(/[^\w]/g, '');
            
            // Skip if word is too short, is a number, or is an identifier/constant
            if (cleanWord.length <= 2 || /^\d+$/.test(cleanWord) || /^[A-Z_]+$/.test(cleanWord)) {
                continue;
            }
            
            // Skip identifier patterns (requirement IDs, component names, etc.)
            if (this.isValidIdentifier(cleanWord)) {
                continue;
            }
            
            // Skip common structural words that aren't keywords
            const structuralWords = ['true', 'false', 'yes', 'no'];
            if (structuralWords.includes(cleanWord.toLowerCase())) {
                continue;
            }
            
            // Check if word is a valid keyword
            if (!validKeywords.includes(cleanWord.toLowerCase())) {
                // Find the position of the word in the original line
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
                        `Invalid keyword '${cleanWord}'. Check Sylang syntax.`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'invalid-keyword';
                    diagnostic.source = 'Sylang';
                    diagnostics.push(diagnostic);
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
            
            // Handle quote characters (not escaped)
            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                insideQuotes = !insideQuotes;
                result += ' '; // Replace quote with space to maintain word separation
            } else if (!insideQuotes) {
                // Only include characters that are outside quotes
                result += char;
            } else {
                // Replace quoted content with spaces to maintain character positions
                result += ' ';
            }
            i++;
        }
        
        return result.trim();
    }

    private isValidIdentifier(word: string): boolean {
        // Patterns for valid identifiers in Sylang
        
        // 1. Requirement/Goal IDs: FSR_EPB_014, SG_EPB_002, etc.
        if (/^[A-Z]{2,4}_[A-Z]{2,4}_\d{3}$/.test(word)) {
            return true;
        }
        
        // 2. PascalCase component/class names: VehicleSpeedAnalyzer, AutomationSafetyValidator
        if (/^[A-Z][a-zA-Z0-9]*$/.test(word) && word.length > 3) {
            return true;
        }
        
        // 3. camelCase identifiers: functionName, variableName
        if (/^[a-z][a-zA-Z0-9]*$/.test(word) && word.length > 3) {
            return true;
        }
        
        // 4. Technical identifiers with numbers: EPB, ASIL-D, km/h (already handled by other patterns)
        
        return false;
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

    private getValidKeywords(): string[] {
        // Core Sylang keywords that are valid in all file types
        const coreKeywords = [
            'name', 'description', 'owner', 'tags', 'version', 'type', 'safetylevel'
        ];
        
        // Safety level values
        const safetyLevels = ['asil', 'qm'];
        
        const safetyKeywords = [
            // Main safety keywords
            'functionalsafetyrequirements', 'requirement', 'safety', 'hazard', 'risk', 'goal', 'item',
            'safetygoal', 'safetymeasures', 'measure', 'scenario', 'functionalrequirement', 'safetyfunction',
            // Safety properties
            'severity', 'probability', 'controllability', 'verification', 'rationale', 'enabledby',
            'verificationcriteria', 'criterion',
            // Safety references
            'derivedfrom', 'allocatedto', 'satisfies', 'implements',
            // Requirement modals
            'shall', 'should', 'may', 'will'
        ];
        
        const securityKeywords = [
            'security', 'threat', 'asset', 'tara', 'cybersecurity'
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

        const componentKeywords = [
            'component', 'subsystem', 'requirement', 'aggregatedby', 'partof', 'enables', 'implements',
            'interfaces', 'interface', 'protocol', 'direction', 'voltage', 'width', 'safety_level',
            // Interface types
            'communication', 'digital', 'analog', 'mechanical', 'software',
            // Direction values
            'input', 'output', 'bidirectional',
            // Protocols
            'spi', 'i2c', 'can', 'lin', 'uart',
            // Voltage/Signal types
            'cmos', 'ttl'
        ];

        const softwareKeywords = [
            'module', 'software', 'part', 'algorithm', 'service', 'task', 'process', 'thread',
            'parameters', 'execution', 'timing', 'memory', 'cpu_usage', 'priority', 'dependencies',
            'license', 'returns',
            // Execution types
            'real-time', 'non-real-time', 'synchronous', 'asynchronous',
            // Priority levels
            'high', 'medium', 'low', 'critical', 'non-critical'
        ];

        const electronicsKeywords = [
            'circuit', 'board', 'chip', 'ic', 'pcb', 'schematic', 'layout', 'trace', 'via', 'pad', 'pin',
            'current', 'power', 'frequency', 'impedance', 'capacitance', 'resistance', 'inductance',
            'tolerance', 'package', 'footprint', 'placement',
            // Voltage values
            '3v3', '5v', '12v', '24v', 'gnd', 'vcc', 'vdd', 'vss',
            // Signal types
            'lvds', 'differential', 'single-ended',
            // Package types
            'smd', 'tht', 'bga', 'qfp', 'soic'
        ];

        const mechanicsKeywords = [
            'assembly', 'part', 'component', 'mechanism', 'actuator', 'sensor', 'bracket',
            'housing', 'mounting', 'fastener', 'gear', 'spring', 'bearing',
            'material', 'dimensions', 'weight', 'tolerance', 'finish', 'coating',
            'hardness', 'strength', 'temperature_range', 'pressure_rating', 'lifecycle', 'maintenance',
            // Materials
            'steel', 'aluminum', 'plastic', 'rubber', 'titanium', 'carbon_fiber', 'stainless',
            // Finishes
            'anodized', 'painted', 'galvanized',
            // Motion types
            'static', 'dynamic', 'rotating', 'linear'
        ];

        // Return valid keywords based on language type
        switch (this.languageId) {
            case 'sylang-safety':
                return [...coreKeywords, ...safetyLevels, ...safetyKeywords];
            case 'sylang-security':
                return [...coreKeywords, ...safetyLevels, ...securityKeywords];
            case 'sylang-features':
                return [...coreKeywords, ...safetyLevels, ...featureKeywords];
            case 'sylang-functions':
                return [...coreKeywords, ...safetyLevels, ...functionKeywords];
            case 'sylang-productline':
                return [...coreKeywords, ...safetyLevels, ...productlineKeywords];
            case 'sylang-components':
                return [...coreKeywords, ...safetyLevels, ...componentKeywords];
            case 'sylang-software':
                return [...coreKeywords, ...safetyLevels, ...softwareKeywords];
            case 'sylang-electronics':
                return [...coreKeywords, ...safetyLevels, ...electronicsKeywords];
            case 'sylang-mechanics':
                return [...coreKeywords, ...safetyLevels, ...mechanicsKeywords];
            default:
                return [...coreKeywords, ...safetyLevels, ...this.keywords];
        }
    }



    public dispose(): void {
        this.diagnosticCollection.dispose();
    }
} 