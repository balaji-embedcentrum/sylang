import * as vscode from 'vscode';
import { BaseValidator } from '../languages/base/BaseValidator';
import { FeaturesValidator } from '../languages/features/FeaturesValidator';
import { ProductLineValidator } from '../languages/productline/ProductLineValidator';
import { FunctionsValidator } from '../languages/functions/FunctionsValidator';
import { getLanguageConfig } from '../config/LanguageConfigs';

export class ValidationEngine {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private validators: Map<string, BaseValidator> = new Map();

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('sylang');
        this.initializeValidators();
    }

    private initializeValidators(): void {
        // Initialize validators for each file type
        try {
            const featuresConfig = getLanguageConfig('sylang-features');
            if (featuresConfig) {
                this.validators.set('sylang-features', new FeaturesValidator(featuresConfig));
            }

            const productLineConfig = getLanguageConfig('sylang-productline');
            if (productLineConfig) {
                this.validators.set('sylang-productline', new ProductLineValidator(productLineConfig));
            }

            const functionsConfig = getLanguageConfig('sylang-functions');
            if (functionsConfig) {
                this.validators.set('sylang-functions', new FunctionsValidator(functionsConfig));
            }

            console.log('[ValidationEngine] Initialized validators for:', Array.from(this.validators.keys()));
        } catch (error) {
            console.error('[ValidationEngine] Error initializing validators:', error);
        }
    }

    public async validateDocument(document: vscode.TextDocument): Promise<void> {
        try {
            const packageJson = require('../../package.json');
            console.log(`[ValidationEngine] ===== VALIDATION STARTING (Extension v${packageJson.version}) =====`);
            console.log(`[ValidationEngine] Validating: ${document.fileName}`);
            console.log(`[ValidationEngine] Language ID: ${document.languageId}`);

            // Get the appropriate validator for this file type
            const validator = this.validators.get(document.languageId);
            
            if (!validator) {
                console.log(`[ValidationEngine] No validator found for language: ${document.languageId}`);
                this.diagnosticCollection.set(document.uri, []);
                return;
            }

            // Run validation
            console.log(`[ValidationEngine] Running validation with ${validator.constructor.name}`);
            const diagnostics = await validator.validate(document);

            // Set diagnostics
            this.diagnosticCollection.set(document.uri, diagnostics);
            
            console.log(`[ValidationEngine] ===== VALIDATION COMPLETE =====`);
            console.log(`[ValidationEngine] Found ${diagnostics.length} issues for ${document.fileName}`);

        } catch (error) {
            console.error('[ValidationEngine] Error during validation:', error);
            
            // Clear diagnostics on error
            this.diagnosticCollection.set(document.uri, []);
        }
    }

    public async validateWorkspace(): Promise<void> {
        try {
            const sylangFiles = await vscode.workspace.findFiles('**/*.{ple,fml,fun,sub,cmp,req,haz,rsk,fsr,ast,sec,sgo}', '**/node_modules/**');
            
            console.log(`[ValidationEngine] Validating ${sylangFiles.length} Sylang files in workspace`);
            
            for (const fileUri of sylangFiles) {
                const document = await vscode.workspace.openTextDocument(fileUri);
                await this.validateDocument(document);
            }
        } catch (error) {
            console.error('[ValidationEngine] Error validating workspace:', error);
        }
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
        console.log('[ValidationEngine] Disposed');
    }
} 