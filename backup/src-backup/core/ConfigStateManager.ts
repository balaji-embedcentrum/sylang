import * as vscode from 'vscode';

export interface ConfigState {
    name: string;
    value: number; // 0 = disabled, 1 = enabled
    fileUri: string;
}

export class ConfigStateManager {
    private configStates: Map<string, ConfigState> = new Map();
    private changeEventEmitter = new vscode.EventEmitter<void>();
    public readonly onConfigChanged = this.changeEventEmitter.event;

    constructor() {
        // Initialize config states
        this.refreshConfigStates();
        
        // Watch for .vcf file changes (reuse existing pattern)
        vscode.workspace.onDidSaveTextDocument(document => {
            if (document.fileName.endsWith('.vcf')) {
                this.refreshConfigStates();
            }
        });
    }

    /**
     * Refresh config states from .vcf files (reuses existing parsing logic)
     */
    public async refreshConfigStates(): Promise<void> {
        this.configStates.clear();

        if (!vscode.workspace.workspaceFolders) {
            console.log('[ConfigStateManager] No workspace folders found');
            return;
        }

        // Find .vcf files in workspace (same as existing implementation)
        const vcfFiles = await vscode.workspace.findFiles('**/*.vcf');
        console.log(`[ConfigStateManager] Found ${vcfFiles.length} .vcf files:`, vcfFiles.map(f => f.toString()));
        
        if (vcfFiles.length === 0) {
            console.log('[ConfigStateManager] No .vcf files found in workspace');
            return;
        }

        // Parse each .vcf file (reuse existing parsing logic)
        for (const vcfFile of vcfFiles) {
            console.log(`[ConfigStateManager] Parsing config file: ${vcfFile.toString()}`);
            await this.parseConfigFile(vcfFile);
        }

        console.log(`[ConfigStateManager] Total configs loaded: ${this.configStates.size}`);
        for (const [name, config] of this.configStates.entries()) {
            console.log(`[ConfigStateManager] Config: ${name} = ${config.value}`);
        }

        // Notify listeners that config changed
        this.changeEventEmitter.fire();
    }

    /**
     * Parse a single .vcf file (same logic as SylangConfigDecorationProvider)
     */
    private async parseConfigFile(vcfFile: vscode.Uri): Promise<void> {
        try {
            const vcfDocument = await vscode.workspace.openTextDocument(vcfFile);
            const text = vcfDocument.getText();
            const lines = text.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();
                const configMatch = trimmedLine.match(/^def\s+config\s+(c_[A-Za-z0-9_]+)\s+([01])$/);
                if (configMatch) {
                    const [, configName, value] = configMatch;
                    const configState: ConfigState = {
                        name: configName,
                        value: parseInt(value, 10),
                        fileUri: vcfFile.toString()
                    };
                    this.configStates.set(configName, configState);
                }
            }
        } catch (error) {
            console.error(`[Sylang] Error parsing config file ${vcfFile.toString()}:`, error);
        }
    }

    /**
     * Check if a config is enabled (value = 1)
     */
    public isConfigEnabled(configName: string): boolean {
        const config = this.configStates.get(configName);
        return config ? config.value === 1 : true; // Default to enabled if not found
    }

    /**
     * Check if a config is disabled (value = 0)
     */
    public isConfigDisabled(configName: string): boolean {
        const config = this.configStates.get(configName);
        return config ? config.value === 0 : false; // Default to enabled if not found
    }

    /**
     * Get all config states
     */
    public getAllConfigs(): Map<string, ConfigState> {
        return new Map(this.configStates);
    }

    /**
     * Get config value (0 or 1)
     */
    public getConfigValue(configName: string): number | null {
        const config = this.configStates.get(configName);
        return config ? config.value : null;
    }

    /**
     * Check if a symbol should be grayed out based on its config
     */
    public isSymbolGrayedOut(symbolConfigName?: string): boolean {
        if (!symbolConfigName) {
            console.log(`[ConfigStateManager] No config name provided - symbol is active`);
            return false; // No config = always active
        }
        const disabled = this.isConfigDisabled(symbolConfigName);
        console.log(`[ConfigStateManager] Config '${symbolConfigName}' disabled=${disabled}`);
        return disabled;
    }

    public dispose(): void {
        this.changeEventEmitter.dispose();
    }
} 