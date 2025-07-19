import * as vscode from 'vscode';
import { 
    ConfigurationManager,
    SymbolManager,
    ImportManager,
    ValidationPipeline
} from './core/managers';
import { PropertyValidationRule } from './core/rules/PropertyValidationRule';
import { VALIDATION_STAGES_ORDER } from './core/interfaces';
import { getSupportedExtensions } from './config/LanguageConfigs';

/**
 * Extension activation - Complete Sylang validation system
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Sylang Extension Activating - FULL VALIDATION SYSTEM...');
    
    // Initialize core managers
    const configurationManager = new ConfigurationManager();
    const symbolManager = new SymbolManager(configurationManager);
    const importManager = new ImportManager(symbolManager, configurationManager);
    const validationPipeline = new ValidationPipeline(
        symbolManager,
        configurationManager, 
        importManager
    );
    
    // Create diagnostic collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('sylang-validation');
    context.subscriptions.push(diagnosticCollection);
    
    // Register validation on file changes
    const validateDocument = async (document: vscode.TextDocument) => {
        if (!isSylangDocument(document)) return;
        
        try {
            console.log(`🔍 VALIDATING ${document.fileName} with FULL VALIDATION PIPELINE`);
            
            // Clear previous diagnostics
            diagnosticCollection.delete(document.uri);
            
            // Create validation context
            const validationContext = {
                workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
                symbolManager,
                configurationManager,
                importManager,
                cacheManager: undefined,
                enabledStages: VALIDATION_STAGES_ORDER,
                validationMode: 'strict' as const,
                maxConcurrency: 5,
                timeout: 10000
            };
            
            // Run complete validation pipeline
            const result = await validationPipeline.validateDocument(document, validationContext);
            
            // Convert validation results to VSCode diagnostics
            const diagnostics: vscode.Diagnostic[] = result.finalDiagnostics || [];
            
            // Set diagnostics
            diagnosticCollection.set(document.uri, diagnostics);
            
            console.log(`✅ Validation complete: ${diagnostics.length} diagnostics`);
            
        } catch (error) {
            console.error('❌ Validation failed:', error);
            // Show critical validation errors
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 1),
                `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = 'sylang-validation';
            diagnosticCollection.set(document.uri, [diagnostic]);
        }
    };
    
    // Validate on document change
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (isSylangDocument(event.document)) {
                // Debounced validation
                setTimeout(() => validateDocument(event.document), 500);
            }
        })
    );
    
    // Validate on document open
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (isSylangDocument(document)) {
                validateDocument(document);
            }
        })
    );
    
    // Validate all open documents on startup
    vscode.workspace.textDocuments.forEach(document => {
        if (isSylangDocument(document)) {
            validateDocument(document);
        }
    });
    
    console.log('✅ Sylang Extension FULLY ACTIVATED with validation pipeline!');
}

/**
 * Check if document is a Sylang file
 */
function isSylangDocument(document: vscode.TextDocument): boolean {
    const supportedExtensions = getSupportedExtensions();
    return supportedExtensions.some(ext => document.fileName.toLowerCase().endsWith(ext));
}

export function deactivate() {
    console.log('🔄 Sylang Extension Deactivated');
} 