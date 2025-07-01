import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult,
    Hover,
    // MarkdownString
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
// let hasDiagnosticRelatedInformationCapability = false;

// Modular language configurations for different Sylang types
interface LanguageConfig {
    fileExtensions: string[];
    keywords: string[];
    validators: ((document: TextDocument) => Diagnostic[])[];
}

const languageConfigs: Record<string, LanguageConfig> = {
    'sylang-productline': {
        fileExtensions: ['.ple'],
        keywords: ['productline', 'description', 'owner', 'domain', 'compliance', 'firstrelease', 'tags', 'safetylevel', 'region'],
        validators: [validateProductLine]
    },
    'sylang-functions': {
        fileExtensions: ['.fun'],
        keywords: ['systemfunctions', 'function', 'name', 'description', 'owner', 'tags', 'safetylevel', 'enables'],
        validators: [validateFunctions]
    },
    'sylang-features': {
        fileExtensions: ['.fml'],
        keywords: ['systemfeatures', 'feature', 'mandatory', 'optional', 'alternative', 'or', 'name', 'description', 'owner', 'tags', 'safetylevel'],
        validators: [validateFeatures]
    },
    'sylang-safety': {
        fileExtensions: ['.itm', '.sgl', '.haz', '.rsk', '.fsr'],
        keywords: ['safety', 'hazard', 'risk', 'requirement', 'goal', 'item', 'safetylevel', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'],
        validators: [validateSafety]
    },
    'sylang-security': {
        fileExtensions: ['.tra', '.thr', '.sgo', '.sre', '.ast', '.sec'],
        keywords: ['security', 'threat', 'asset', 'requirement', 'goal', 'TARA', 'cybersecurity'],
        validators: [validateSecurity]
    }
};

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    // hasDiagnosticRelatedInformationCapability = !!(
    //     capabilities.textDocument &&
    //     capabilities.textDocument.publishDiagnostics &&
    //     capabilities.textDocument.publishDiagnostics.relatedInformation
    // );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['"', ' ', '\t']
            },
            hoverProvider: true
        }
    };

    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }

    return result;
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});

// Settings interface
interface SylangSettings {
    maxNumberOfProblems: number;
    enableValidation: boolean;
}

const defaultSettings: SylangSettings = { maxNumberOfProblems: 1000, enableValidation: true };
let globalSettings: SylangSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<SylangSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    } else {
        globalSettings = <SylangSettings>(
            (change.settings.sylang || defaultSettings)
        );
    }

    documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<SylangSettings> {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'sylang'
        });
        documentSettings.set(resource, result);
    }
    return result;
}

documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});

documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    const settings = await getDocumentSettings(textDocument.uri);
    // const text = textDocument.getText();
    
    if (!settings.enableValidation) {
        return;
    }

    const diagnostics: Diagnostic[] = [];
    const languageId = getLanguageIdFromUri(textDocument.uri);
    const config = languageConfigs[languageId];

    if (config) {
        // Run all validators for this language type
        config.validators.forEach(validator => {
            diagnostics.push(...validator(textDocument));
        });
    }

    // Generic validation common to all Sylang types
    diagnostics.push(...validateGeneric(textDocument));

    // Send the computed diagnostics to VSCode
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function getLanguageIdFromUri(uri: string): string {
    const extension = uri.split('.').pop();
    
    for (const [languageId, config] of Object.entries(languageConfigs)) {
        if (config.fileExtensions.some(ext => ext === `.${extension}`)) {
            return languageId;
        }
    }
    
    return 'sylang-productline'; // Default fallback
}

// Generic validation for all Sylang types
function validateGeneric(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const trimmed = line.trim();
        
        if (trimmed.length === 0 || trimmed.startsWith('//')) {
            continue;
        }

        // Validate safety levels
        if (trimmed.includes('safetylevel')) {
            const safetyLevel = extractSafetyLevel(trimmed);
            if (safetyLevel && !isValidSafetyLevel(safetyLevel)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: line!.length }
                    },
                    message: `Invalid safety level: ${safetyLevel}. Valid values are: ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM`,
                    source: 'Sylang'
                });
            }
        }
    }

    return diagnostics;
}

// Specific validators for each Sylang type
function validateProductLine(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();
    
    if (!text.includes('productline')) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
            message: 'Product line file must contain a productline declaration',
            source: 'Sylang'
        });
    }

    return diagnostics;
}

function validateFunctions(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();
    
    if (!text.includes('systemfunctions')) {
        diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
            message: 'Functions file should contain a systemfunctions declaration',
            source: 'Sylang'
        });
    }

    return diagnostics;
}

function validateFeatures(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i];
        if (!lineText) continue;
        const line = lineText.trim();
        
        if (line.startsWith('feature') && !line.includes('mandatory') && !line.includes('optional') && !line.includes('alternative') && !line.includes('or')) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: { start: { line: i, character: 0 }, end: { line: i, character: line.length } },
                message: 'Feature must specify variability type: mandatory, optional, alternative, or or',
                source: 'Sylang'
            });
        }
    }

    return diagnostics;
}

function validateSafety(_document: TextDocument): Diagnostic[] {
    // Safety-specific validation logic
    return [];
}

function validateSecurity(_document: TextDocument): Diagnostic[] {
    // Security-specific validation logic
    return [];
}

// Helper functions
function extractSafetyLevel(line: string): string | null {
    const match = line.match(/safetylevel\s+(\S+)/);
    return match && match[1] !== undefined ? match[1] : null;
}

function isValidSafetyLevel(level: string): boolean {
    return ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'].includes(level);
}

// Completion provider
connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    const uri = textDocumentPosition.textDocument.uri;
    const languageId = getLanguageIdFromUri(uri);
    const config = languageConfigs[languageId];
    
    if (!config) {
        return [];
    }

    const completions: CompletionItem[] = [];

    // Add keywords for this language type
    config.keywords.forEach((keyword, index) => {
        completions.push({
            label: keyword,
            kind: CompletionItemKind.Keyword,
            data: index + 1
        });
    });

    // Add safety levels
    ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'].forEach((level, index) => {
        completions.push({
            label: level,
            kind: CompletionItemKind.EnumMember,
            data: config.keywords.length + index + 1
        });
    });

    return completions;
});

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
    // Add documentation for completion items
    if (item.label === 'productline') {
        item.detail = 'Product Line Definition';
        item.documentation = 'Defines a family of related products with shared and variable features.';
    } else if (item.label === 'safetylevel') {
        item.detail = 'Safety Level';
        item.documentation = 'ISO 26262 Automotive Safety Integrity Level (ASIL-A, ASIL-B, ASIL-C, ASIL-D, or QM)';
    }
    
    return item;
});

// Hover provider
connection.onHover((params: TextDocumentPositionParams): Hover | null => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }

    const position = params.position;
    const line = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line + 1, character: 0 }
    });

    const wordRange = getWordRangeAtPosition(line, position.character);
    if (!wordRange) {
        return null;
    }

    const word = line.substring(wordRange.start, wordRange.end);
    const documentation = getKeywordDocumentation(word);

    if (documentation) {
        return {
            contents: {
                kind: 'markdown',
                value: documentation
            }
        };
    }

    return null;
});

function getWordRangeAtPosition(line: string, character: number): { start: number; end: number } | null {
    const wordRegex = /\b\w+\b/g;
    let match;
    
    while ((match = wordRegex.exec(line)) !== null) {
        if (match.index <= character && character <= match.index + match[0].length) {
            return {
                start: match.index,
                end: match.index + match[0].length
            };
        }
    }
    
    return null;
}

function getKeywordDocumentation(word: string): string | null {
    const docs: Record<string, string> = {
        'productline': '**Product Line Definition**\n\nDefines a family of related products with shared and variable features.',
        'systemfunctions': '**System Functions Container**\n\nContainer for defining system-level functions and their relationships.',
        'systemfeatures': '**System Features Container**\n\nContainer for defining feature models with variability.',
        'function': '**Function Definition**\n\nDefines a system function with properties and relationships.',
        'feature': '**Feature Definition**\n\nDefines a feature in the product line with variability type.',
        'safetylevel': '**Safety Level**\n\nISO 26262 Automotive Safety Integrity Level.\n\nValid values: ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM',
        'ASIL-D': '**ASIL-D (Automotive Safety Integrity Level D)**\n\nHighest automotive safety integrity level according to ISO 26262.'
    };

    return docs[word] || null;
}

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen(); 