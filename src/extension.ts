import * as vscode from 'vscode';
import { 
    ConfigurationManager,
    SymbolManager,
    ImportManager
} from './core/managers';
import { ValidationManager } from './core/managers/ValidationManager';
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
    const importManager = new ImportManager(symbolManager);
    
    // Create diagnostic collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('sylang-validation');
    context.subscriptions.push(diagnosticCollection);
    
    const validationManager = new ValidationManager(diagnosticCollection, importManager, symbolManager);
    
    // Validate on document events
    function handleDocumentChange(document: vscode.TextDocument) {
        if (document.languageId.startsWith('sylang-') || 
            document.fileName.endsWith('.ple') || 
            document.fileName.endsWith('.fml') ||
            document.fileName.endsWith('.vml') ||
            document.fileName.endsWith('.vcf')) {
            
            console.log('📄 Document change detected:', document.fileName);
            validationManager.validateDocument(document);
        }
    }
    
    // Validate on document change
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            handleDocumentChange(event.document);
        })
    );
    
    // Validate on document open
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (isSylangDocument(document)) {
                handleDocumentChange(document);
            }
        })
    );
    
    // Validate all open documents on startup
    vscode.workspace.textDocuments.forEach(document => {
        if (isSylangDocument(document)) {
            handleDocumentChange(document);
        }
    });
    
    console.log('✅ Sylang Extension FULLY ACTIVATED with validation pipeline!');
    
    // Register VCF generation command
    const vcfGeneratorCommand = vscode.commands.registerCommand('sylang.generateVariantConfig', async (uri?: vscode.Uri) => {
        try {
            if (!uri) {
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor || !activeEditor.document.fileName.endsWith('.vml')) {
                    vscode.window.showErrorMessage('Please select a .vml file to generate variant config');
                    return;
                }
                uri = activeEditor.document.uri;
            }
            
            // Dynamic import to avoid circular dependencies
            const { VcfGenerator } = await import('./core/generators/VcfGenerator');
            const vcfGenerator = new VcfGenerator();
            await vcfGenerator.generateVcfFromVml(uri);
            
        } catch (error) {
            console.error('❌ VCF generation failed:', error);
            vscode.window.showErrorMessage(`VCF generation failed: ${error}`);
        }
    });
    
    context.subscriptions.push(vcfGeneratorCommand);
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