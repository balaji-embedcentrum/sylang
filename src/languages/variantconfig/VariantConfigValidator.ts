import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';
import { SymbolManager } from '../../core/SymbolManager';

export class VariantConfigValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig, symbolManager: SymbolManager) {
        super(languageConfig, symbolManager);
    }

    protected getDefinitionKeywords(): string[] {
        return ['configset', 'config'];
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            return;
        }

        // Validate import statements
        if (trimmedLine.startsWith('use ')) {
            await this.validateImportSyntax(lineIndex, trimmedLine);
        }
        // Validate def configset syntax
        else if (trimmedLine.startsWith('def configset')) {
            await this.validateConfigsetDefinition(lineIndex, trimmedLine);
        }
        // Validate def config syntax
        else if (trimmedLine.startsWith('def config')) {
            await this.validateConfigDefinition(lineIndex, trimmedLine);
        }
        // Validate standard properties
        else if (this.isPropertyLine(trimmedLine)) {
            await this.validatePropertySyntax(lineIndex, line, trimmedLine);
        }
        else {
            this.addDiagnostic(
                lineIndex,
                0,
                trimmedLine.length,
                'Invalid line. Expected import, configset definition, config definition, property, or comment.',
                'invalid-line'
            );
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        await this.validateSingleConfigsetKeyword(document);
        await this.validateFileStartsWithConfigset(document);
        await this.validateConfigNamingConvention(document);
        await this.validateSingleVcfInWorkspace(document);
    }

    private async validateImportSyntax(lineIndex: number, trimmedLine: string): Promise<void> {
        const importMatch = trimmedLine.match(/^use\s+(variantmodel)\s+([A-Z][A-Za-z0-9_]*)$/);
        
        if (!importMatch) {
            this.addDiagnostic(
                lineIndex,
                0,
                trimmedLine.length,
                'Invalid import syntax. Expected: use variantmodel <PascalCaseIdentifier>',
                'invalid-import-syntax'
            );
        }
    }

    private async validateConfigsetDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const configsetMatch = trimmedLine.match(/^def\s+configset\s+([A-Z][A-Za-z0-9_]*)$/);
        
        if (!configsetMatch) {
            this.addDiagnostic(
                lineIndex,
                0,
                trimmedLine.length,
                'Invalid configset syntax. Expected: def configset <PascalCaseIdentifier>',
                'invalid-configset-syntax'
            );
            return;
        }

        const [, identifier] = configsetMatch;
        
        // Validate identifier naming convention (PascalCase)
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            const identifierStartPos = trimmedLine.indexOf(identifier);
            this.addDiagnostic(
                lineIndex,
                identifierStartPos,
                identifier.length,
                'Configset identifier should use PascalCase naming',
                'identifier-naming',
                vscode.DiagnosticSeverity.Warning
            );
        }
    }

    private async validateConfigDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const configMatch = trimmedLine.match(/^def\s+config\s+(c_[A-Za-z0-9_]+)\s+([01])$/);
        
        if (!configMatch) {
            this.addDiagnostic(
                lineIndex,
                0,
                trimmedLine.length,
                'Invalid config syntax. Expected: def config c_ConfigName <0|1>',
                'invalid-config-syntax'
            );
            return;
        }

        const [, configName, configValue] = configMatch;
        
        // Validate config name starts with c_
        if (!configName.startsWith('c_')) {
            const configStartPos = trimmedLine.indexOf(configName);
            this.addDiagnostic(
                lineIndex,
                configStartPos,
                configName.length,
                'Config name must start with "c_" prefix',
                'config-naming-prefix'
            );
        }

        // Validate config value is 0 or 1
        if (configValue !== '0' && configValue !== '1') {
            const valueStartPos = trimmedLine.lastIndexOf(configValue);
            this.addDiagnostic(
                lineIndex,
                valueStartPos,
                configValue.length,
                'Config value must be 0 (disabled) or 1 (enabled)',
                'invalid-config-value'
            );
        }
    }

    private async validateSingleConfigsetKeyword(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        let configsetCount = 0;
        let firstConfigsetLine = -1;
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const trimmedLine = lines[lineIndex].trim();
            if (trimmedLine.startsWith('def configset')) {
                configsetCount++;
                if (firstConfigsetLine === -1) {
                    firstConfigsetLine = lineIndex;
                }
            }
        }
        
        if (configsetCount === 0) {
            this.addDiagnostic(
                0,
                0,
                0,
                'Variant config file must contain exactly one "def configset" declaration',
                'missing-configset-declaration'
            );
        } else if (configsetCount > 1) {
            this.addDiagnostic(
                firstConfigsetLine,
                0,
                lines[firstConfigsetLine].length,
                `Multiple "def configset" declarations found (${configsetCount}). Only one is allowed per file.`,
                'multiple-configset-declarations'
            );
        }
    }

    private async validateFileStartsWithConfigset(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        // Find first non-empty, non-comment, non-import line
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const trimmedLine = lines[lineIndex].trim();
            if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('use ')) {
                if (!trimmedLine.startsWith('def configset')) {
                    this.addDiagnostic(
                        lineIndex,
                        0,
                        trimmedLine.length,
                        'Variant config file must start with "def configset <identifier>" after imports',
                        'missing-configset-header'
                    );
                }
                break;
            }
        }
    }

    private async validateConfigNamingConvention(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const trimmedLine = lines[lineIndex].trim();
            const configMatch = trimmedLine.match(/^def\s+config\s+(c_[A-Za-z0-9_]+)\s+[01]$/);
            
            if (configMatch) {
                const configName = configMatch[1];
                
                // Check for proper hierarchical naming (contains underscores)
                if (!configName.includes('_', 2)) { // Skip the c_ prefix
                    this.addDiagnostic(
                        lineIndex,
                        trimmedLine.indexOf(configName),
                        configName.length,
                        'Config names should use hierarchical naming with underscores (e.g., c_System_Subsystem_Feature)',
                        'config-naming-convention',
                        vscode.DiagnosticSeverity.Information
                    );
                }
            }
        }
    }

    private async validateSingleVcfInWorkspace(document: vscode.TextDocument): Promise<void> {
        if (!vscode.workspace.workspaceFolders) return;
        
        const pattern = '**/*.vcf';
        const vcfFiles = await vscode.workspace.findFiles(pattern);
        
        if (vcfFiles.length > 1) {
            const currentFile = document.uri.fsPath;
            const otherFiles = vcfFiles
                .filter(file => file.fsPath !== currentFile)
                .map(file => file.fsPath.split('/').pop())
                .join(', ');
                
            this.addDiagnostic(
                0,
                0,
                0,
                `Multiple .vcf files found in workspace: ${otherFiles}. Only one active variant config is allowed.`,
                'multiple-vcf-files',
                vscode.DiagnosticSeverity.Warning
            );
        }
    }

    protected override isPropertyLine(trimmedLine: string): boolean {
        const validProperties = ['name', 'description', 'owner', 'tags', 'source', 'generated'];
        return validProperties.some(prop => trimmedLine.startsWith(`${prop} `));
    }

    private async validatePropertySyntax(lineIndex: number, line: string, trimmedLine: string): Promise<void> {
        const indent = this.getIndentLevel(line);
        
        // Properties must be indented
        if (indent === 0) {
            this.addDiagnostic(
                lineIndex,
                0,
                trimmedLine.length,
                'Properties must be indented under a definition',
                'property-not-indented'
            );
            return;
        }

        // Validate property syntax
        if (trimmedLine.startsWith('name ') || trimmedLine.startsWith('description ') || 
            trimmedLine.startsWith('owner ') || trimmedLine.startsWith('source ')) {
            const stringMatch = trimmedLine.match(/^(name|description|owner|source)\s+"([^"]+)"$/);
            if (!stringMatch) {
                this.addDiagnostic(
                    lineIndex,
                    indent,
                    trimmedLine.length,
                    'Property value must be a quoted string',
                    'invalid-property-value'
                );
            }
        } else if (trimmedLine.startsWith('tags ')) {
            const tagsMatch = trimmedLine.match(/^tags\s+"([^"]+)"(?:\s*,\s*"([^"]+)")*$/);
            if (!tagsMatch) {
                this.addDiagnostic(
                    lineIndex,
                    indent,
                    trimmedLine.length,
                    'Tags must be comma-separated quoted strings',
                    'invalid-tags-format'
                );
            }
        } else if (trimmedLine.startsWith('generated ')) {
            const dateMatch = trimmedLine.match(/^generated\s+"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)"$/);
            if (!dateMatch) {
                this.addDiagnostic(
                    lineIndex,
                    indent,
                    trimmedLine.length,
                    'Generated timestamp must be in ISO format: "YYYY-MM-DDTHH:mm:ssZ"',
                    'invalid-generated-format'
                );
            }
        }
    }

    protected override getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }
} 