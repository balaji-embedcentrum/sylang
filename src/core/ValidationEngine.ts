import * as vscode from 'vscode';
import { BaseValidator } from '../languages/base/BaseValidator';
import { FeaturesValidator } from '../languages/features/FeaturesValidator';
import { VariantModelValidator } from '../languages/variantmodel/VariantModelValidator';
import { FunctionsValidator } from '../languages/functions/FunctionsValidator';
import { FailureModeAnalysisValidator } from '../languages/failuremodeanalysis/FailureModeAnalysisValidator';
import { FailureModeControlsValidator } from '../languages/failuremodecontrols/FailureModeControlsValidator';
import { FaultTreeAnalysisValidator } from '../languages/faulttreeanalysis/FaultTreeAnalysisValidator';
import { SafetyValidator } from '../languages/safety/SafetyValidator';
import { HazardValidator } from '../languages/safety/HazardValidator';
import { RiskValidator } from '../languages/safety/RiskValidator';
import { SafetyGoalsValidator } from '../languages/safety/SafetyGoalsValidator';
import { RequirementsValidator } from '../languages/components/RequirementsValidator';
import { SubsystemValidator } from '../languages/subsystem/SubsystemValidator'; // New import
import { SystemValidator } from '../languages/system/SystemValidator'; // New import
import { ProductLineValidator } from '../languages/productline/ProductLineValidator';
import { BlockValidator } from '../languages/blocks/BlockValidator';
import { getLanguageConfig } from '../config/LanguageConfigs';

export class ValidationEngine {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private validators: Map<string, BaseValidator> = new Map();

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('sylang');
        this.initializeValidators();
    }

    private initializeValidators(): void {
        // Initialize validators for each file type using LanguageConfigs
        try {
            const featuresConfig = getLanguageConfig('sylang-features');
            if (featuresConfig) {
                this.validators.set('sylang-features', new FeaturesValidator(featuresConfig));
            }

            const variantModelConfig = getLanguageConfig('sylang-variantmodel');
            if (variantModelConfig) {
                this.validators.set('sylang-variantmodel', new VariantModelValidator(variantModelConfig));
            }

            const productLineConfig = getLanguageConfig('sylang-productline');
            if (productLineConfig) {
                this.validators.set('sylang-productline', new ProductLineValidator(productLineConfig));
            }

            const functionsConfig = getLanguageConfig('sylang-functions');
            if (functionsConfig) {
                this.validators.set('sylang-functions', new FunctionsValidator(functionsConfig));
            }

            const failureModeAnalysisConfig = getLanguageConfig('sylang-failuremodeanalysis');
            if (failureModeAnalysisConfig) {
                this.validators.set('sylang-failuremodeanalysis', new FailureModeAnalysisValidator(failureModeAnalysisConfig));
            }

            const failureModeControlsConfig = getLanguageConfig('sylang-failuremodecontrols');
            if (failureModeControlsConfig) {
                this.validators.set('sylang-failuremodecontrols', new FailureModeControlsValidator(failureModeControlsConfig));
            }

            const faultTreeAnalysisConfig = getLanguageConfig('sylang-faulttreeanalysis');
            if (faultTreeAnalysisConfig) {
                this.validators.set('sylang-faulttreeanalysis', new FaultTreeAnalysisValidator(faultTreeAnalysisConfig));
            }

            // For safety files, we'll handle them separately in validateDocument
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

            let diagnostics: vscode.Diagnostic[] = [];

            // Check if it's a safety or other file (by extension)
            const fileName = document.fileName;
            const extension = fileName.split('.').pop();
            const extensions = ['itm', 'haz', 'rsk', 'sgl', 'fsr', 'ast', 'sec', 'sgo', 'req', 'sub', 'sys', 'blk', 'fma', 'fmc'];
            
            if (extensions.includes(extension || '')) {
                // Use appropriate validator based on extension
                let validator: SafetyValidator | HazardValidator | RiskValidator | SafetyGoalsValidator | RequirementsValidator | SubsystemValidator | SystemValidator | BlockValidator | FailureModeAnalysisValidator | FailureModeControlsValidator;
                if (extension === 'haz') {
                    validator = new HazardValidator();
                    console.log(`[ValidationEngine] Running HazardValidator for .${extension} file`);
                } else if (extension === 'rsk') {
                    validator = new RiskValidator();
                    console.log(`[ValidationEngine] Running RiskValidator for .${extension} file`);
                } else if (extension === 'sgl') {
                    validator = new SafetyGoalsValidator();
                    console.log(`[ValidationEngine] Running SafetyGoalsValidator for .${extension} file`);
                } else if (extension === 'req') {
                    validator = new RequirementsValidator();
                    console.log(`[ValidationEngine] Running RequirementsValidator for .${extension} file`);
                } else if (extension === 'sub') {
                    validator = new SubsystemValidator();
                    console.log(`[ValidationEngine] Running SubsystemValidator for .${extension} file`);
                } else if (extension === 'sys') {
                    validator = new SystemValidator();
                    console.log(`[ValidationEngine] Running SystemValidator for .${extension} file`);
                } else if (extension === 'blk') {
                    validator = new BlockValidator();
                    console.log(`[ValidationEngine] Running BlockValidator for .${extension} file`);
                } else if (extension === 'fma') {
                    const fmaConfig = getLanguageConfig('sylang-failuremodeanalysis');
                    validator = new FailureModeAnalysisValidator(fmaConfig!);
                    console.log(`[ValidationEngine] Running FailureModeAnalysisValidator for .${extension} file`);
                } else if (extension === 'fmc') {
                    const fmcConfig = getLanguageConfig('sylang-failuremodecontrols');
                    validator = new FailureModeControlsValidator(fmcConfig!);
                    console.log(`[ValidationEngine] Running FailureModeControlsValidator for .${extension} file`);
                } else {
                    validator = new SafetyValidator();
                    console.log(`[ValidationEngine] Running SafetyValidator for .${extension} file`);
                }
                diagnostics = await validator.validate(document);
            } else {
                // Get the appropriate validator for this file type
                const validator = this.validators.get(document.languageId);
                
                if (!validator) {
                    console.log(`[ValidationEngine] No validator found for language: ${document.languageId}`);
                    this.diagnosticCollection.set(document.uri, []);
                    return;
                }

                // Run validation
                console.log(`[ValidationEngine] Running validation with ${validator.constructor.name}`);
                diagnostics = await validator.validate(document);
            }

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
            const sylangFiles = await vscode.workspace.findFiles('**/*.{ple,fml,fun,sub,cmp,req,haz,rsk,fsr,itm,sgl,ast,sec,sgo,blk}', '**/node_modules/**');
            
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