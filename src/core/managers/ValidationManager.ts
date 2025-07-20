import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';
import { PleValidationRule } from '../rules/PleValidationRule';
import { FmlValidationRule } from '../rules/FmlValidationRule';
import { VmlValidationRule } from '../rules/VmlValidationRule';
import { VcfValidationRule } from '../rules/VcfValidationRule';
import { UseStatementValidationRule } from '../rules/UseStatementValidationRule';
import { SymbolVisibilityValidationRule } from '../rules/SymbolVisibilityValidationRule';
import { ImportManager } from './ImportManager';
import { SymbolManager } from './SymbolManager';

/**
 * Central Validation Manager
 * Orchestrates validation rules for different file types
 */
export class ValidationManager {
    private validationRules: Map<string, IValidationRule[]> = new Map();
    private diagnosticCollection: vscode.DiagnosticCollection;
    private symbolManager: SymbolManager;

    constructor(diagnosticCollection: vscode.DiagnosticCollection, importManager: ImportManager, symbolManager: SymbolManager) {
        this.diagnosticCollection = diagnosticCollection;
        this.symbolManager = symbolManager;
        this.initializeValidationRules(importManager);
    }

    private initializeValidationRules(importManager: ImportManager): void {
        console.log('🔧 Initializing modular validation rules...');

        // Use Statement Validation (shared across all file types)
        const useStatementRule = new UseStatementValidationRule(importManager);
        const symbolVisibilityRule = new SymbolVisibilityValidationRule();

        // Initialize .ple validation rules
        const pleRule = new PleValidationRule();
        this.validationRules.set('ple', [pleRule, useStatementRule]);

        // Initialize .fml validation rules  
        const fmlRule = new FmlValidationRule();
        this.validationRules.set('fml', [fmlRule, useStatementRule]);

        // Initialize .vml validation rules
        const vmlRule = new VmlValidationRule();
        this.validationRules.set('vml', [vmlRule, useStatementRule, symbolVisibilityRule]);

        // Initialize .vcf validation rules
        const vcfRule = new VcfValidationRule();
        this.validationRules.set('vcf', [vcfRule, useStatementRule]);

        // Add symbol visibility for other file types that use compound properties
        this.validationRules.set('req', [useStatementRule, symbolVisibilityRule]);
        this.validationRules.set('tst', [useStatementRule, symbolVisibilityRule]);
        this.validationRules.set('blk', [useStatementRule, symbolVisibilityRule]);

        console.log('✅ Validation rules initialized for:', Array.from(this.validationRules.keys()).join(', '));
    }

    /**
     * Validate a document using appropriate file-specific rules
     */
    async validateDocument(document: vscode.TextDocument): Promise<void> {
        const fileExtension = this.getFileExtension(document);
        
        if (!this.validationRules.has(fileExtension)) {
            console.log(`⚠️ No validation rules for extension: ${fileExtension}`);
            return;
        }

        console.log(`🔍 Validating ${fileExtension} file:`, document.fileName);

        const rules = this.validationRules.get(fileExtension)!;
        const allDiagnostics: vscode.Diagnostic[] = [];

        // Create validation context
        const context: IRuleValidationContext = {
            document,
            symbols: [],
            symbolIndex: {} as any, // TODO: Provide proper symbol index
            configuration: {},
            imports: [],
            stage: ValidationStage.SEMANTIC_VALIDATION,
            symbolManager: this.symbolManager
        };

        // Run all validation rules for this file type
        for (const rule of rules) {
            if (!rule.enabled) continue;

            try {
                const result = await rule.validate(context);
                allDiagnostics.push(...result.diagnostics);
                
                console.log(`✅ Rule '${rule.name}' completed: ${result.diagnostics.length} diagnostics, ${result.performance.executionTime.toFixed(2)}ms`);
            } catch (error) {
                console.error(`❌ Rule '${rule.name}' failed:`, error);
            }
        }

        // Update diagnostics in VSCode
        this.diagnosticCollection.set(document.uri, allDiagnostics);
        console.log(`📊 Total diagnostics for ${document.fileName}: ${allDiagnostics.length}`);
    }

    private getFileExtension(document: vscode.TextDocument): string {
        const fileName = document.fileName.toLowerCase();
        const match = fileName.match(/\.([^.]+)$/);
        return match ? match[1] : '';
    }

    /**
     * Get available validation rules for a file type
     */
    getValidationRules(fileExtension: string): IValidationRule[] {
        return this.validationRules.get(fileExtension) || [];
    }

    /**
     * Add a validation rule for a specific file type
     */
    addValidationRule(fileExtension: string, rule: IValidationRule): void {
        if (!this.validationRules.has(fileExtension)) {
            this.validationRules.set(fileExtension, []);
        }
        this.validationRules.get(fileExtension)!.push(rule);
        console.log(`➕ Added validation rule '${rule.name}' for .${fileExtension} files`);
    }

    /**
     * Remove a validation rule
     */
    removeValidationRule(fileExtension: string, ruleId: string): void {
        const rules = this.validationRules.get(fileExtension);
        if (rules) {
            const index = rules.findIndex(rule => rule.id === ruleId);
            if (index !== -1) {
                rules.splice(index, 1);
                console.log(`➖ Removed validation rule '${ruleId}' from .${fileExtension} files`);
            }
        }
    }
} 