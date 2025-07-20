import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';

/**
 * Variant Configuration (.vcf) Validation Rule
 * Validates .vcf files for configuration syntax and compound properties
 */
export class VcfValidationRule implements IValidationRule {
    readonly id = 'vcf-validation';
    readonly name = 'Variant Configuration Validation';
    readonly description = 'Validates .vcf files for configuration syntax, use statements, and compound properties';
    readonly category = 'semantic';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.SEMANTIC_VALIDATION;
    readonly fileTypes = ['vcf'];
    readonly enabled = true;
    readonly priority = 100;
    readonly configuration: any = {};

    private readonly validVcfKeywords = [
        'def', 'configset', 'config', 'use', 'variantmodel', 'name', 'description', 'owner', 
        'tags', 'generated', 'generatedfrom'
    ];

    private readonly validAsilLevels = ['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'];

    supportsContext(context: IRuleValidationContext): boolean {
        const fileName = context.document.fileName.toLowerCase();
        return fileName.endsWith('.vcf');
    }

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        const text = context.document.getText();
        const lines = text.split('\n');

        console.log('🔍 VCF Validation Rule: Validating', context.document.fileName);

        let hasConfigsetDef = false;
        let generatedfromVariantModel = '';
        let generatedfromLine = -1;

        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i];
            const line = originalLine.trim();
            if (!line || line.startsWith('//')) continue;

            // Check for 'def configset' 
            if (line.startsWith('def configset') && !hasConfigsetDef) {
                hasConfigsetDef = true;
                continue;
            }

            // VALIDATE COMPOUND PROPERTIES
            const generatedfromMatch = line.match(/^\s*(generatedfrom)\s+(variantmodel)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
            if (generatedfromMatch) {
                const keyword = generatedfromMatch[1];
                const secondaryKeyword = generatedfromMatch[2];
                const identifier = generatedfromMatch[3];
                
                generatedfromVariantModel = identifier;
                generatedfromLine = i;
                
                console.log(`🔍 VCF: Found compound property: ${keyword} ${secondaryKeyword} ${identifier}`);
                continue;
            }

            // VALIDATE CONFIG DEFINITIONS
            const configMatch = line.match(/^\s*def\s+config\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(0|1)\s*$/);
            if (configMatch) {
                const configName = configMatch[1];
                const configValue = configMatch[2];
                
                // Validate config name starts with c_
                if (!configName.startsWith('c_')) {
                    const range = new vscode.Range(i, line.indexOf(configName), i, line.indexOf(configName) + configName.length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Config name '${configName}' must start with 'c_'`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
                continue;
            }

            // Remove quoted strings from keyword validation
            let lineToCheck = line;
            lineToCheck = lineToCheck.replace(/"[^"]*"/g, '');
            lineToCheck = lineToCheck.replace(/'[^']*'/g, '');

            // VALIDATE KEYWORDS
            const words = lineToCheck.split(/\s+/);
            for (const word of words) {
                const cleanWord = word.replace(/[,]/g, '').trim();
                if (!cleanWord || cleanWord.length < 2) continue;

                // Skip numbers and identifiers starting with uppercase
                if (cleanWord.match(/^\d+$/) || cleanWord.match(/^[A-Z]/)) continue;

                if (cleanWord.match(/^[a-z][a-z]*$/) && cleanWord.length > 1) {
                    if (!this.validVcfKeywords.includes(cleanWord) && 
                        !this.validAsilLevels.includes(cleanWord.toUpperCase())) {
                        
                        const wordIndex = line.indexOf(cleanWord);
                        if (wordIndex !== -1) {
                            const range = new vscode.Range(i, wordIndex, i, wordIndex + cleanWord.length);
                            diagnostics.push(new vscode.Diagnostic(
                                range,
                                `Invalid .vcf keyword '${cleanWord}'. Valid keywords: ${this.validVcfKeywords.join(', ')}`,
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                    }
                }
            }

            // Validate ASIL levels
            if (lineToCheck.includes('safetylevel')) {
                const asilMatch = lineToCheck.match(/safetylevel\s+([A-Z-]+)/);
                if (asilMatch && !this.validAsilLevels.includes(asilMatch[1])) {
                    const range = new vscode.Range(i, line.indexOf(asilMatch[1]), i, line.indexOf(asilMatch[1]) + asilMatch[1].length);
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `Invalid ASIL level '${asilMatch[1]}'. Valid levels: ${this.validAsilLevels.join(', ')}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }

        // Check if file has required 'def configset'
        if (!hasConfigsetDef) {
            const range = new vscode.Range(0, 0, 0, 0);
            diagnostics.push(new vscode.Diagnostic(
                range,
                `.vcf file must have 'def configset <identifier>'`,
                vscode.DiagnosticSeverity.Error
            ));
        }

        const endTime = performance.now();
        
        return {
            isValid: diagnostics.length === 0,
            diagnostics,
            errors: [],
            warnings: [],
            performance: {
                executionTime: endTime - startTime,
                memoryUsage: 0,
                cacheHitRate: 0
            },
            metadata: {
                ruleName: this.name,
                ruleVersion: '1.0.0',
                validatedElements: lines.length,
                skippedElements: 0
            }
        };
    }
} 