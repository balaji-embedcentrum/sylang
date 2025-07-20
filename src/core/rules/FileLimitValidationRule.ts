import * as vscode from 'vscode';
import { 
    IValidationRule, 
    IRuleValidationContext, 
    IRuleValidationResult,
    ValidationStage 
} from '../interfaces/IValidationPipeline';
import { SYLANG_LANGUAGES, SylangLanguageConfig } from '../../config/LanguageConfigs';

/**
 * File Limit Validation Rule
 * Enforces that certain file types (.ple, .fml, .vcf) can only have one instance per project
 */
export class FileLimitValidationRule implements IValidationRule {
    readonly id = 'file-limit-validation';
    readonly name = 'File Limit Validation';
    readonly description = 'Enforces unique file limits for .ple, .fml, .vcf extensions';
    readonly category = 'project';
    readonly severity: 'error' | 'warning' | 'info' = 'error';
    readonly stage = ValidationStage.CROSS_FILE_VALIDATION;
    readonly fileTypes = ['ple', 'fml', 'vcf']; // Only unique files
    readonly enabled = true;
    readonly priority = 300;
    readonly configuration: any = {};

    private fileCountCache = new Map<string, number>();
    private lastCacheUpdate = 0;
    private readonly CACHE_DURATION = 30000; // 30 seconds

    async validate(context: IRuleValidationContext): Promise<IRuleValidationResult> {
        const startTime = performance.now();
        const diagnostics: vscode.Diagnostic[] = [];
        
        // Get file extension
        const extension = this.getFileExtension(context.document);
        const langConfig = this.getLanguageConfig(extension);
        
        if (!langConfig || langConfig.fileLimit !== 'unique') {
            // This file type doesn't have unique limit
            return this.createResult(true, diagnostics, [], startTime);
        }

        // Check if there are multiple files of this type in the workspace
        const fileCount = await this.countFilesOfType(extension);
        
        if (fileCount > 1) {
            // Find all files of this type to create specific diagnostics
            const allFiles = await this.findAllFilesOfType(extension);
            const currentFile = context.document.uri.fsPath;
            
            // Check if current file is the "first" one (alphabetically)
            const sortedFiles = allFiles.sort();
            const isFirstFile = sortedFiles[0] === currentFile;
            
            if (!isFirstFile) {
                // This is not the first file, mark it as duplicate
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(0, 0, 0, 1),
                    `Multiple ${extension} files found in workspace. Only one ${extension} file is allowed per project. Consider removing this file or merging with ${sortedFiles[0]}`,
                    vscode.DiagnosticSeverity.Error
                ));
            } else {
                // This is the first file, but warn about duplicates
                const duplicateFiles = sortedFiles.slice(1).map(f => f.split('/').pop()).join(', ');
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(0, 0, 0, 1),
                    `Multiple ${extension} files found in workspace: ${duplicateFiles}. Only one ${extension} file is allowed per project`,
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }
        
        const isValid = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length === 0;
        return this.createResult(isValid, diagnostics, isValid ? [] : ['File limit validation failed'], startTime);
    }

    supportsContext(context: IRuleValidationContext): boolean {
        const extension = this.getFileExtension(context.document);
        return this.fileTypes.includes(extension.substring(1)); // Remove the dot
    }

    private getFileExtension(document: vscode.TextDocument): string {
        return '.' + document.fileName.split('.').pop()?.toLowerCase();
    }

    private getLanguageConfig(extension: string): SylangLanguageConfig | undefined {
        return SYLANG_LANGUAGES.find(lang => lang.extension === extension);
    }

    private async countFilesOfType(extension: string): Promise<number> {
        // Check cache first
        const now = Date.now();
        if (now - this.lastCacheUpdate < this.CACHE_DURATION && this.fileCountCache.has(extension)) {
            return this.fileCountCache.get(extension)!;
        }

        const files = await this.findAllFilesOfType(extension);
        const count = files.length;
        
        // Update cache
        this.fileCountCache.set(extension, count);
        this.lastCacheUpdate = now;
        
        return count;
    }

    private async findAllFilesOfType(extension: string): Promise<string[]> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return [];
        }

        const files: string[] = [];
        
        for (const folder of workspaceFolders) {
            const uris = await vscode.workspace.findFiles(
                new vscode.RelativePattern(folder, `**/*${extension}`),
                '**/node_modules/**'
            );
            
            files.push(...uris.map(uri => uri.fsPath));
        }
        
        return files;
    }

    private createResult(isValid: boolean, diagnostics: vscode.Diagnostic[], errors: string[], startTime: number): IRuleValidationResult {
        return {
            isValid,
            diagnostics,
            errors: errors.map(msg => ({
                code: this.id,
                message: msg,
                range: new vscode.Range(0, 0, 0, 1),
                severity: this.severity as any,
                source: this.id
            })),
            warnings: [],
            performance: {
                executionTime: performance.now() - startTime,
                memoryUsage: 0,
                cacheHitRate: this.fileCountCache.size > 0 ? 0.8 : 0
            },
            metadata: {
                ruleName: this.name,
                ruleVersion: '1.0.0',
                validatedElements: 1,
                skippedElements: 0
            }
        };
    }
} 