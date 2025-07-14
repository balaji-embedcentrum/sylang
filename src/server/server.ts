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
    Location,
    Range,
    DefinitionParams,
    ReferenceParams,
    Hover
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { SafetyValidator } from '../languages/safety/SafetyValidator';
import { TestValidator } from '../languages/test/TestValidator';
import { SymbolManager } from '../core/SymbolManager';
import { getLanguageConfigByExtension } from '../config/LanguageConfigs';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Initialize validators
const symbolManager = new SymbolManager();
const safetyValidator = new SafetyValidator();
const testValidator = new TestValidator(getLanguageConfigByExtension('.tst')!, symbolManager);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let workspaceRoot: string | null = null;
// let hasDiagnosticRelatedInformationCapability = false;

// Modular language configurations for different Sylang types
interface LanguageConfig {
    fileExtensions: string[];
    keywords: string[];
    validators: ((document: TextDocument) => Diagnostic[] | Promise<Diagnostic[]>)[];
}

const languageConfigs: Record<string, LanguageConfig> = {
    'sylang-productline': {
        fileExtensions: ['.ple'],
        keywords: ['productline', 'description', 'owner', 'domain', 'compliance', 'firstrelease', 'tags', 'safetylevel', 'region'],
        validators: [validateProductLine]
    },
    'sylang-functions': {
        fileExtensions: ['.fun', '.fma'],
        keywords: ['functiongroup', 'function', 'name', 'description', 'owner', 'tags', 'safetylevel', 'enables'],
        validators: [validateFunctions]
    },
    'sylang-features': {
        fileExtensions: ['.fml'],
        keywords: ['featureset', 'feature', 'mandatory', 'optional', 'alternative', 'or', 'name', 'description', 'owner', 'tags', 'safetylevel'],
        validators: [validateFeatures]
    },
    'sylang-safety': {
        fileExtensions: ['.itm', '.sgl', '.haz', '.rsk', '.fsr'],
        keywords: ['safety', 'hazard', 'risk', 'requirement', 'goal', 'item', 'safetylevel', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM', 'safetygoal', 'safetymeasures', 'measure', 'enabledby', 'verificationcriteria', 'criterion', 'scenario', 'derivedfrom', 'allocatedto', 'functionalrequirement', 'safetyfunction', 'rationale', 'verification', 'satisfies', 'implements', 'shall', 'should', 'may', 'will'],
        validators: [validateSafety]
    },
    'sylang-security': {
        fileExtensions: ['.tra', '.thr', '.sgo', '.sre', '.ast', '.sec'],
        keywords: ['security', 'threat', 'asset', 'requirement', 'goal', 'TARA', 'cybersecurity'],
        validators: [validateSecurity]
    },
    'sylang-components': {
        fileExtensions: ['.cmp', '.sub', '.req'],
        keywords: ['component', 'subsystem', 'Subsystem', 'requirement', 'name', 'description', 'owner', 'tags', 'safetylevel', 'aggregatedby', 'partof', 'enables', 'implements', 'interfaces', 'interface', 'type', 'protocol', 'direction', 'voltage', 'width', 'safety_level', 'Communication', 'Digital', 'Analog', 'Input', 'Output', 'Bidirectional', 'SPI', 'I2C', 'CAN', 'LIN', 'UART', 'CMOS', 'TTL', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'],
        validators: [validateComponents]
    },
    'sylang-software': {
        fileExtensions: ['.mod', '.prt'],
        keywords: ['module', 'software', 'part', 'algorithm', 'service', 'task', 'process', 'thread', 'name', 'description', 'owner', 'tags', 'safetylevel', 'partof', 'implements', 'interfaces', 'input', 'output', 'returns', 'parameters', 'execution', 'timing', 'memory', 'cpu_usage', 'priority', 'dependencies', 'version', 'license', 'real-time', 'non-real-time', 'synchronous', 'asynchronous', 'high', 'medium', 'low', 'critical', 'non-critical', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'],
        validators: [validateSoftware]
    },
    'sylang-electronics': {
        fileExtensions: ['.ckt'],
        keywords: ['circuit', 'board', 'chip', 'ic', 'pcb', 'schematic', 'layout', 'trace', 'via', 'pad', 'pin', 'name', 'description', 'owner', 'tags', 'safetylevel', 'partof', 'interfaces', 'voltage', 'current', 'power', 'frequency', 'impedance', 'capacitance', 'resistance', 'inductance', 'tolerance', 'package', 'footprint', 'placement', '3.3V', '5V', '12V', '24V', 'GND', 'VCC', 'VDD', 'VSS', 'CMOS', 'TTL', 'LVDS', 'differential', 'single-ended', 'SMD', 'THT', 'BGA', 'QFP', 'SOIC', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'],
        validators: [validateElectronics]
    },
    'sylang-mechanics': {
        fileExtensions: ['.asm'],
        keywords: ['assembly', 'part', 'component', 'mechanism', 'actuator', 'sensor', 'bracket', 'housing', 'mounting', 'fastener', 'gear', 'spring', 'bearing', 'name', 'description', 'owner', 'tags', 'safetylevel', 'partof', 'material', 'dimensions', 'weight', 'tolerance', 'finish', 'coating', 'hardness', 'strength', 'temperature_range', 'pressure_rating', 'lifecycle', 'maintenance', 'steel', 'aluminum', 'plastic', 'rubber', 'titanium', 'carbon_fiber', 'stainless', 'anodized', 'painted', 'galvanized', 'static', 'dynamic', 'rotating', 'linear', 'ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'],
        validators: [validateMechanics]
    },
    'sylang-test': {
        fileExtensions: ['.tst'],
        keywords: ['def', 'testsuite', 'testcase', 'name', 'description', 'owner', 'tags', 'testtype', 'coverage', 'method', 'priority', 'asil', 'verifies', 'requirement', 'exercises', 'preconditions', 'teststeps', 'step', 'expectedresult', 'testresult', 'actualresult', 'executiontime', 'use', 'unit', 'integration', 'system', 'acceptance', 'regression', 'smoke', 'statement', 'branch', 'mcdc', 'function', 'manual', 'automated', 'hil', 'sil', 'mil', 'pil', 'pass', 'fail', 'pending', 'inconclusive', 'critical', 'high', 'medium', 'low', 'QM', 'A', 'B', 'C', 'D'],
        validators: [validateTest]
    }
};

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Store workspace root path
    if (params.rootUri) {
        workspaceRoot = decodeURIComponent(params.rootUri.replace('file://', ''));
    } else if (params.rootPath) {
        workspaceRoot = params.rootPath;
    }

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
            hoverProvider: true,
            definitionProvider: true,
            referencesProvider: true
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
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }

    // Start workspace indexing
    if (workspaceRoot) {
        connection.console.log('[Sylang] Starting workspace symbol indexing...');
        connection.sendNotification('sylang/indexingStarted');
        
        try {
            scanWorkspaceForSymbols(workspaceRoot);
            connection.console.log('[Sylang] Workspace symbol indexing completed successfully');
            connection.sendNotification('sylang/indexingCompleted');
        } catch (error) {
            connection.console.error(`[Sylang] Workspace indexing failed: ${error}`);
            connection.sendNotification('sylang/indexingFailed', { error: String(error) });
        }
    } else {
        connection.console.log('[Sylang] No workspace root found - skipping workspace indexing');
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
        // Run all validators for this language type (handle both sync and async)
        for (const validator of config.validators) {
            try {
                const result = await validator(textDocument);
                diagnostics.push(...result);
            } catch (error) {
                console.error(`[validateTextDocument] Validator error for ${textDocument.uri}:`, error);
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: Range.create(0, 0, 0, 0),
                    message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    source: 'Sylang Validator'
                });
            }
        }
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
    
    if (!text.includes('functiongroup')) {
        diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
            message: 'Functions file should contain a functiongroup declaration',
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

async function validateSafety(document: TextDocument): Promise<Diagnostic[]> {
    try {
        // Convert TextDocument to vscode.TextDocument format
        const vscodeDocument = {
            uri: { fsPath: document.uri, path: document.uri },
            getText: () => document.getText(),
            lineAt: (line: number) => ({ text: document.getText().split('\n')[line] || '' }),
            lineCount: document.getText().split('\n').length,
            fileName: document.uri,
            languageId: 'sylang'
        } as any;
        
        const vscDiagnostics = await safetyValidator.validate(vscodeDocument);
        
        // Convert vscode diagnostics to language server protocol diagnostics
        return vscDiagnostics.map(diag => ({
            severity: diag.severity as DiagnosticSeverity,
            range: {
                start: { line: diag.range.start.line, character: diag.range.start.character },
                end: { line: diag.range.end.line, character: diag.range.end.character }
            },
            message: diag.message,
            source: diag.source || 'Sylang Safety Validator',
            code: diag.code as string
        }));
    } catch (error) {
        console.error('[validateSafety] Error:', error);
        return [{
            severity: DiagnosticSeverity.Error,
            range: Range.create(0, 0, 0, 0),
            message: `Safety validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            source: 'Sylang Safety Validator'
        }];
    }
}

function validateSecurity(_document: TextDocument): Diagnostic[] {
    // Security-specific validation logic
    return [];
}

function validateComponents(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    lines.forEach((line, lineNumber) => {
        // Validate component/subsystem declarations
        const componentMatch = line.match(/^\s*(component|subsystem|Subsystem)\s+([A-Z][a-zA-Z0-9_]*)/);
        if (componentMatch && componentMatch[2]) {
            const componentName = componentMatch[2];
            if (!/^[A-Z][a-zA-Z0-9_]*$/.test(componentName)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: lineNumber, character: line.indexOf(componentName) },
                        end: { line: lineNumber, character: line.indexOf(componentName) + componentName.length }
                    },
                    message: `Component name '${componentName}' should start with capital letter and use PascalCase`,
                    source: 'sylang'
                });
            }
        }

        // Validate interface types
        const interfaceTypeMatch = line.match(/\btype\s+(Communication|Digital|Analog)\b/);
        if (line.includes('type') && !interfaceTypeMatch) {
            const typeMatch = line.match(/\btype\s+(\w+)/);
            if (typeMatch && typeMatch[1]) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: lineNumber, character: line.indexOf(typeMatch[1]) },
                        end: { line: lineNumber, character: line.indexOf(typeMatch[1]) + typeMatch[1].length }
                    },
                    message: `Invalid interface type '${typeMatch[1]}'. Use Communication, Digital, or Analog`,
                    source: 'sylang'
                });
            }
        }
    });

    return diagnostics;
}

function validateSoftware(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    lines.forEach((line, lineNumber) => {
        // Validate module declarations
        const moduleMatch = line.match(/^\s*(module|software|service)\s+([A-Z][a-zA-Z0-9_]*)/);
        if (moduleMatch && moduleMatch[2]) {
            const moduleName = moduleMatch[2];
            if (!/^[A-Z][a-zA-Z0-9_]*$/.test(moduleName)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: lineNumber, character: line.indexOf(moduleName) },
                        end: { line: lineNumber, character: line.indexOf(moduleName) + moduleName.length }
                    },
                    message: `Module name '${moduleName}' should start with capital letter and use PascalCase`,
                    source: 'sylang'
                });
            }
        }
    });

    return diagnostics;
}

function validateElectronics(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    lines.forEach((line, lineNumber) => {
        // Validate circuit declarations
        const circuitMatch = line.match(/^\s*(circuit|board|pcb)\s+([A-Z][a-zA-Z0-9_]*)/);
        if (circuitMatch && circuitMatch[2]) {
            const circuitName = circuitMatch[2];
            if (!/^[A-Z][a-zA-Z0-9_]*$/.test(circuitName)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: lineNumber, character: line.indexOf(circuitName) },
                        end: { line: lineNumber, character: line.indexOf(circuitName) + circuitName.length }
                    },
                    message: `Circuit name '${circuitName}' should start with capital letter and use PascalCase`,
                    source: 'sylang'
                });
            }
        }
    });

    return diagnostics;
}

function validateMechanics(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    lines.forEach((line, lineNumber) => {
        // Validate assembly declarations
        const assemblyMatch = line.match(/^\s*(assembly|part)\s+([A-Z][a-zA-Z0-9_]*)/);
        if (assemblyMatch && assemblyMatch[2]) {
            const assemblyName = assemblyMatch[2];
            if (!/^[A-Z][a-zA-Z0-9_]*$/.test(assemblyName)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: lineNumber, character: line.indexOf(assemblyName) },
                        end: { line: lineNumber, character: line.indexOf(assemblyName) + assemblyName.length }
                    },
                    message: `Assembly name '${assemblyName}' should start with capital letter and use PascalCase`,
                    source: 'sylang'
                });
            }
        }
    });

    return diagnostics;
}

async function validateTest(document: TextDocument): Promise<Diagnostic[]> {
    try {
        // Convert TextDocument to vscode.TextDocument format
        const vscodeDocument = {
            uri: { fsPath: document.uri, path: document.uri, toString: () => document.uri },
            getText: () => document.getText(),
            lineAt: (line: number) => ({ text: document.getText().split('\n')[line] || '' }),
            lineCount: document.getText().split('\n').length,
            fileName: document.uri,
            languageId: 'sylang-test'
        } as any;
        
        const vscDiagnostics = await testValidator.validate(vscodeDocument);
        
        // Convert vscode diagnostics to language server protocol diagnostics
        return vscDiagnostics.map(diag => ({
            severity: diag.severity as DiagnosticSeverity,
            range: {
                start: { line: diag.range.start.line, character: diag.range.start.character },
                end: { line: diag.range.end.line, character: diag.range.end.character }
            },
            message: diag.message,
            source: diag.source || 'Sylang Test Validator',
            code: diag.code as string
        }));
    } catch (error) {
        console.error('[validateTest] Error:', error);
        return [{
            severity: DiagnosticSeverity.Error,
            range: Range.create(0, 0, 0, 0),
            message: `Test validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            source: 'Sylang Test Validator'
        }];
    }
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
        'functiongroup': '**Function Group Container**\n\nContainer for defining functions regardless of hierarchy level. Replaces systemfunctions/subsystemfunctions.',
        'systemfunctions': '**⚠️ Deprecated - System Functions Container**\n\n*This keyword is deprecated. Use `functiongroup` instead.*\n\nContainer for defining system-level functions and their relationships.',
        'featureset': '**Featureset Container**\n\nContainer for defining feature models with variability.',
        'function': '**Function Definition**\n\nDefines a system function with properties and relationships.',
        'feature': '**Feature Definition**\n\nDefines a feature in the product line with variability type.',
        'safetylevel': '**Safety Level**\n\nISO 26262 Automotive Safety Integrity Level.\n\nValid values: ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM',
        'ASIL-D': '**ASIL-D (Automotive Safety Integrity Level D)**\n\nHighest automotive safety integrity level according to ISO 26262.'
    };

    return docs[word] || null;
}

// Workspace scanning for cross-file navigation
function scanWorkspaceForSymbols(workspacePath: string): void {
    const fs = require('fs');
    const path = require('path');
    
    let fileCount = 0;
    
    function scanDirectory(dirPath: string): void {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    // Skip common directories that don't contain Sylang files
                    if (!['node_modules', '.git', '.vscode', 'dist', 'build', 'out'].includes(entry.name)) {
                        scanDirectory(fullPath);
                    }
                } else if (entry.isFile()) {
                    // Check if it's a Sylang file
                    const ext = path.extname(entry.name);
                    const sylangExtensions = ['.ple', '.fun', '.fma', '.fml', '.sgl', '.haz', '.rsk', '.fsr', 
                                            '.cmp', '.sub', '.req', '.mod', '.prt', '.ckt', '.asm', '.itm', 
                                            '.tra', '.thr', '.sgo', '.sre', '.ast', '.sec'];
                    
                    if (sylangExtensions.includes(ext)) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            const uri = `file://${fullPath}`;
                            
                            // Create a mock document for indexing
                            const document = {
                                uri: uri,
                                getText: () => content,
                                languageId: getLanguageIdFromUri(uri),
                                version: 1
                            };
                            
                            symbolIndex.indexDocument(document as any);
                            fileCount++;
                            
                            if (fileCount % 10 === 0) {
                                connection.console.log(`[Sylang] Indexed ${fileCount} files...`);
                            }
                        } catch (error) {
                            connection.console.warn(`[Sylang] Failed to index file ${fullPath}: ${error}`);
                        }
                    }
                }
            }
        } catch (error) {
            connection.console.warn(`[Sylang] Failed to scan directory ${dirPath}: ${error}`);
        }
    }
    
    connection.console.log(`[Sylang] Scanning workspace: ${workspacePath}`);
    scanDirectory(workspacePath);
    connection.console.log(`[Sylang] Workspace indexing complete. Indexed ${fileCount} Sylang files.`);
}

// Symbol Index for Go to Definition and Find References
interface SymbolInfo {
    name: string;
    location: Location;
    type: 'requirement' | 'component' | 'goal' | 'feature' | 'function' | 'module' | 'circuit' | 'assembly' | 'hazard';
    isDefinition: boolean; // New field to distinguish definitions from references
}

class SylangSymbolIndex {
    private symbols: Map<string, SymbolInfo[]> = new Map();

    addSymbol(symbol: SymbolInfo): void {
        const existing = this.symbols.get(symbol.name) || [];
        existing.push(symbol);
        this.symbols.set(symbol.name, existing);
    }

    findDefinition(symbolName: string): Location | null {
        const symbolList = this.symbols.get(symbolName);
        if (!symbolList || symbolList.length === 0) {
            return null;
        }
        
        // Prioritize actual definitions over references
        const definitions = symbolList.filter(s => s.isDefinition);
        if (definitions.length > 0) {
            return definitions[0]!.location; // Return first definition found
        }
        
        // Fallback to first occurrence if no explicit definitions found
        return symbolList[0]!.location;
    }

    findReferences(symbolName: string): Location[] {
        const symbolList = this.symbols.get(symbolName);
        return symbolList ? symbolList.map(s => s.location) : [];
    }

    clear(): void {
        this.symbols.clear();
    }

    indexDocument(document: TextDocument): void {
        const text = document.getText();
        const lines = text.split('\n');
        const uri = document.uri;

        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber];
            if (!line) continue;

            // Index component definitions: component ActuatorManagementUnit
            const componentMatch = line.match(/^\s*(component|Subsystem|subsystem)\s+([A-Z][a-zA-Z0-9_]*)/);
            if (componentMatch && componentMatch[2]) {
                const symbolName = componentMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, line.indexOf(symbolName), lineNumber, line.indexOf(symbolName) + symbolName.length)),
                    type: 'component',
                    isDefinition: true
                });
            }

            // Index module definitions: module ActuatorControlModule
            const moduleMatch = line.match(/^\s*(module|software|service)\s+([A-Z][a-zA-Z0-9_]*)/);
            if (moduleMatch && moduleMatch[2]) {
                const symbolName = moduleMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, line.indexOf(symbolName), lineNumber, line.indexOf(symbolName) + symbolName.length)),
                    type: 'module',
                    isDefinition: true
                });
            }

            // Index circuit definitions: circuit CommunicationCircuit
            const circuitMatch = line.match(/^\s*(circuit|board|pcb)\s+([A-Z][a-zA-Z0-9_]*)/);
            if (circuitMatch && circuitMatch[2]) {
                const symbolName = circuitMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, line.indexOf(symbolName), lineNumber, line.indexOf(symbolName) + symbolName.length)),
                    type: 'circuit',
                    isDefinition: true
                });
            }

            // Index assembly definitions: assembly MountingAssembly
            const assemblyMatch = line.match(/^\s*(assembly|part)\s+([A-Z][a-zA-Z0-9_]*)/);
            if (assemblyMatch && assemblyMatch[2]) {
                const symbolName = assemblyMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, line.indexOf(symbolName), lineNumber, line.indexOf(symbolName) + symbolName.length)),
                    type: 'assembly',
                    isDefinition: true
                });
            }

            // Index function definitions: def function VehicleSpeedAnalyzer
            const functionMatch = line.match(/^\s*(function)\s+([A-Z][a-zA-Z0-9_]*)/);
            if (functionMatch && functionMatch[2]) {
                const symbolName = functionMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, line.indexOf(symbolName), lineNumber, line.indexOf(symbolName) + symbolName.length)),
                    type: 'function',
                    isDefinition: true
                });
            }

            // Index requirement definitions: requirement FSR_EPB_014
            const reqMatch = line.match(/\b(requirement|functionalrequirement)\s+([A-Z_]{2,20}\d{3})\b/);
            if (reqMatch && reqMatch[2] && reqMatch.index !== undefined) {
                const symbolName = reqMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, reqMatch.index + reqMatch[1]!.length + 1, lineNumber, reqMatch.index + reqMatch[0]!.length)),
                    type: 'requirement',
                    isDefinition: true
                });
            }

            // Index goal definitions: goal SG_EPB_002
            const goalMatch = line.match(/\b(goal|safetygoal)\s+([A-Z_]{2,20}\d{3})\b/);
            if (goalMatch && goalMatch[2] && goalMatch.index !== undefined) {
                const symbolName = goalMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, goalMatch.index + goalMatch[1]!.length + 1, lineNumber, goalMatch.index + goalMatch[0]!.length)),
                    type: 'goal',
                    isDefinition: true
                });
            }

            // Index hazard definitions: hazard H_ACT_001
            const hazardDefMatch = line.match(/^\s*(hazard)\s+(H_[A-Z]{2,4}_\d{3})\b/);
            if (hazardDefMatch && hazardDefMatch[2]) {
                const symbolName = hazardDefMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, line.indexOf(symbolName), lineNumber, line.indexOf(symbolName) + symbolName.length)),
                    type: 'hazard',
                    isDefinition: true
                });
            }

            // Index scenario definitions: scenario SCEN_AUT_001_UnintendedActivation
            const scenarioMatch = line.match(/\b(scenario)\s+([A-Z_][a-zA-Z0-9_]*)/);
            if (scenarioMatch && scenarioMatch[2]) {
                const symbolName = scenarioMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, line.indexOf(symbolName), lineNumber, line.indexOf(symbolName) + symbolName.length)),
                    type: 'requirement',
                    isDefinition: true
                });
            }

            // Index measure definitions: measure SM_004
            const measureMatch = line.match(/\b(measure)\s+([A-Z]{1,3}_\d{3})/);
            if (measureMatch && measureMatch[2]) {
                const symbolName = measureMatch[2];
                this.addSymbol({
                    name: symbolName,
                    location: Location.create(uri, Range.create(lineNumber, line.indexOf(symbolName), lineNumber, line.indexOf(symbolName) + symbolName.length)),
                    type: 'requirement',
                    isDefinition: true
                });
            }

            // Index component references: allocatedto VehicleSpeedAnalyzer, AutomationSafetyValidator
            const allocMatch = line.match(/\b(allocatedto|enabledby|implements|partof|aggregatedby)\s+([A-Z][a-zA-Z0-9,\s]*)/);
            if (allocMatch && allocMatch[2]) {
                const components = allocMatch[2].split(',').map(c => c.trim());
                components.forEach(comp => {
                    if (comp && /^[A-Z][a-zA-Z0-9_]*$/.test(comp)) {
                        this.addSymbol({
                            name: comp,
                            location: Location.create(uri, Range.create(lineNumber, line.indexOf(comp), lineNumber, line.indexOf(comp) + comp.length)),
                            type: 'component',
                            isDefinition: false
                        });
                    }
                });
            }

            // Index derivedfrom/satisfies references: derivedfrom SG_EPB_002, SG_EPB_004
            const derivedMatch = line.match(/\b(derivedfrom|satisfies)\s+([A-Z_0-9,\s]*)/);
            if (derivedMatch && derivedMatch[2]) {
                const refs = derivedMatch[2].split(',').map(r => r.trim());
                refs.forEach(ref => {
                    if (ref && /^[A-Z_]{2,20}\d{3}$/.test(ref)) {
                        this.addSymbol({
                            name: ref,
                            location: Location.create(uri, Range.create(lineNumber, line.indexOf(ref), lineNumber, line.indexOf(ref) + ref.length)),
                            type: 'requirement',
                            isDefinition: false
                        });
                    }
                });
            }

            // Index hazard references in functions_affected: functions_affected "MotorDriveController", "ActuatorPositionTracker"
            const functionsAffectedMatch = line.match(/\bfunctions_affected\s+"([^"]+)"/g);
            if (functionsAffectedMatch) {
                functionsAffectedMatch.forEach(match => {
                    const functionNameMatch = match.match(/"([^"]+)"/);
                    if (functionNameMatch && functionNameMatch[1]) {
                        const functionName = functionNameMatch[1];
                        this.addSymbol({
                            name: functionName,
                            location: Location.create(uri, Range.create(lineNumber, line.indexOf(functionName), lineNumber, line.indexOf(functionName) + functionName.length)),
                            type: 'function',
                            isDefinition: false
                        });
                    }
                });
            }

            // Index hazard references in comma-separated lists: hazard H_ACT_002, H_ACT_003
            const hazardRefMatch = line.match(/\b(hazard)\s+([A-Z_0-9,\s]*)/);
            if (hazardRefMatch && hazardRefMatch[2] && !line.match(/^\s*hazard\s+H_/)) { // Exclude definitions
                const hazards = hazardRefMatch[2].split(',').map(h => h.trim());
                hazards.forEach(haz => {
                    if (haz && /^H_[A-Z]{2,4}_\d{3}$/.test(haz)) {
                        this.addSymbol({
                            name: haz,
                            location: Location.create(uri, Range.create(lineNumber, line.indexOf(haz), lineNumber, line.indexOf(haz) + haz.length)),
                            type: 'hazard',
                            isDefinition: false
                        });
                    }
                });
            }
        }
    }
}

const symbolIndex = new SylangSymbolIndex();

// Rebuild symbol index when documents change
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
    symbolIndex.indexDocument(change.document);
});

documents.onDidOpen(params => {
    symbolIndex.indexDocument(params.document);
});

// Definition provider - Go to Definition (F12)
connection.onDefinition((params: DefinitionParams): Location | null => {
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
    
    // Look for definition in symbol index
    return symbolIndex.findDefinition(word);
});

// References provider - Find All References (Shift+F12)
connection.onReferences((params: ReferenceParams): Location[] => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }

    const position = params.position;
    const line = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line + 1, character: 0 }
    });

    const wordRange = getWordRangeAtPosition(line, position.character);
    if (!wordRange) {
        return [];
    }

    const word = line.substring(wordRange.start, wordRange.end);
    
    // Find all references in symbol index
    return symbolIndex.findReferences(word);
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen(); 