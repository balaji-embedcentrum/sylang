import * as vscode from 'vscode';
import { 
    ConfigurationManager,
    SymbolManager,
    ImportManager,
    ValidationPipeline
} from './core/managers';
import { PropertyValidationRule } from './core/rules/PropertyValidationRule';
import { VALIDATION_STAGES_ORDER } from './core/interfaces';

/**
 * Extension activation - New modular ValidationPipeline system
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Sylang Extension Activating (New Modular System)...');
    
    // Initialize core managers
    const configurationManager = new ConfigurationManager();
    const symbolManager = new SymbolManager(configurationManager);
    const importManager = new ImportManager(symbolManager);
    const validationPipeline = new ValidationPipeline(
        symbolManager,
        configurationManager, 
        importManager
    );
    
    // Create diagnostic collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('sylang-modular');
    
    // Register validation on file changes
    const validateDocument = async (document: vscode.TextDocument) => {
        if (!isSylangDocument(document)) return;
        
        try {
            console.log(`🔍 Validating ${document.fileName} with new modular system`);
            
            // Create validation context
            const validationContext = {
                workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
                symbolManager,
                configurationManager,
                importManager,
                cacheManager: undefined, // Optional for now
                enabledStages: VALIDATION_STAGES_ORDER,
                validationMode: 'strict' as const,
                maxConcurrency: 5,
                timeout: 10000
            };
            
            // Run validation
            const result = await validationPipeline.validateDocument(document, validationContext);
            
            // Set diagnostics
            diagnosticCollection.set(document.uri, result.finalDiagnostics);
            
            console.log(`✅ Validation complete: ${result.finalDiagnostics.length} diagnostics`);
            
        } catch (error) {
            console.error('❌ Validation error:', error);
            
            // Clear diagnostics on error to avoid showing stale results
            diagnosticCollection.set(document.uri, []);
        }
    };
    
    // Register event listeners
    context.subscriptions.push(
        // Validate on document change
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            await validateDocument(event.document);
        }),
        
        // Validate on document open
        vscode.workspace.onDidOpenTextDocument(async (document) => {
            await validateDocument(document);
        }),
        
        // Validate on document save
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            await validateDocument(document);
        }),
        
        // Clean up diagnostics when document closes
        vscode.workspace.onDidCloseTextDocument((document) => {
            diagnosticCollection.delete(document.uri);
        }),
        
        // Register diagnostic collection for cleanup
        diagnosticCollection
    );
    
    // Validate currently open documents
    vscode.workspace.textDocuments.forEach(validateDocument);
    
    console.log('✅ Sylang Extension Activated (New Modular System)');
}

export function deactivate() {
    console.log('👋 Sylang Extension Deactivated (New Modular System)');
}

/**
 * Check if document is a Sylang file
 */
function isSylangDocument(document: vscode.TextDocument): boolean {
    const sylangExtensions = [
        '.ple', '.fml', '.vml', '.vcf', '.fun', '.blk', '.req', '.tst',
        '.fma', '.fmc', '.fta', '.itm', '.haz', '.rsk', '.sgl', '.sub', '.sys'
    ];
    
    return sylangExtensions.some(ext => document.fileName.toLowerCase().endsWith(ext));
} 