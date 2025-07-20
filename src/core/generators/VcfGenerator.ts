import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * VCF (Variant Configuration) Generator
 * Generates .vcf files from .vml (Variant Model) files
 */
export class VcfGenerator {

    /**
     * Generate VCF file from VML file
     */
    async generateVcfFromVml(vmlUri: vscode.Uri): Promise<void> {
        console.log('🔧 VCF Generator: Starting generation from', vmlUri.fsPath);

        try {
            // Parse the VML file
            const vmlContent = fs.readFileSync(vmlUri.fsPath, 'utf8');
            const vmlData = this.parseVmlFile(vmlContent, vmlUri.fsPath);

            if (!vmlData) {
                throw new Error('Failed to parse VML file');
            }

            // Check for existing .vcf files in the workspace
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(vmlUri);
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }

            const existingVcfFiles = await this.findExistingVcfFiles(workspaceFolder.uri.fsPath);
            
            // Prompt for deletion if existing .vcf files found
            if (existingVcfFiles.length > 0) {
                const choice = await vscode.window.showWarningMessage(
                    `Found ${existingVcfFiles.length} existing .vcf file(s). Only one .vcf file is allowed per project. Delete existing files and create new one?`,
                    'Yes, Delete and Create New',
                    'Cancel'
                );

                if (choice !== 'Yes, Delete and Create New') {
                    return;
                }

                // Delete existing .vcf files
                for (const vcfFile of existingVcfFiles) {
                    fs.unlinkSync(vcfFile);
                    console.log('🗑️ Deleted existing VCF file:', vcfFile);
                }
            }

            // Generate VCF content
            const vcfContent = this.generateVcfContent(vmlData);

            // Create new .vcf file
            const vmlDir = path.dirname(vmlUri.fsPath);
            const vcfFileName = `${vmlData.variantModelName}Config.vcf`;
            const vcfPath = path.join(vmlDir, vcfFileName);

            fs.writeFileSync(vcfPath, vcfContent, 'utf8');

            console.log('✅ VCF file generated:', vcfPath);
            vscode.window.showInformationMessage(`VCF file generated successfully: ${vcfFileName}`);

            // Open the generated file
            const vcfDocument = await vscode.workspace.openTextDocument(vcfPath);
            await vscode.window.showTextDocument(vcfDocument);

        } catch (error) {
            console.error('❌ VCF generation error:', error);
            throw error;
        }
    }

    /**
     * Parse VML file to extract variant model data
     */
    private parseVmlFile(vmlContent: string, vmlPath: string): any | null {
        const lines = vmlContent.split('\n');
        let variantModelName = '';
        let importedFeatureset = '';
        const features: Array<{
            name: string;
            variability: string;
            selected: boolean;
            level: number;
            line: number;
            parent?: string;
        }> = [];

        const parentStack: Array<{ name: string, level: number }> = [];

        for (let i = 0; i < lines.length; i++) {
            const originalLine = lines[i];
            const trimmedLine = originalLine.trim();
            if (!trimmedLine || trimmedLine.startsWith('//')) continue;

            // Extract variant model name
            const variantModelMatch = trimmedLine.match(/def\s+variantmodel\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (variantModelMatch) {
                variantModelName = variantModelMatch[1];
                console.log('🔍 VCF: Found variant model:', variantModelName);
                continue;
            }

            // Extract imported featureset
            const useMatch = trimmedLine.match(/use\s+featureset\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (useMatch) {
                importedFeatureset = useMatch[1];
                console.log('🔍 VCF: Found imported featureset:', importedFeatureset);
                continue;
            }

            // Extract feature selections
            const featureMatch = trimmedLine.match(/^feature\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(mandatory|optional|alternative|or)(?:\s+(selected))?\s*$/);
            if (featureMatch) {
                const featureName = featureMatch[1];
                const variability = featureMatch[2];
                const selected = !!featureMatch[3];
                
                // Calculate indentation level
                const actualSpaces = originalLine.length - originalLine.trimStart().length;
                const level = Math.floor((actualSpaces - 2) / 2);

                // Update parent stack
                while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
                    parentStack.pop();
                }

                const parent = parentStack.length > 0 ? parentStack[parentStack.length - 1].name : undefined;

                features.push({
                    name: featureName,
                    variability,
                    selected,
                    level,
                    line: i,
                    parent
                });

                parentStack.push({ name: featureName, level });

                console.log(`🔍 VCF: Feature '${featureName}' - level: ${level}, parent: ${parent}, selected: ${selected}`);
            }
        }

        if (!variantModelName) {
            console.error('❌ VCF: No variant model definition found');
            return null;
        }

        return {
            variantModelName,
            importedFeatureset,
            features,
            sourceFile: path.basename(vmlPath)
        };
    }

    /**
     * Generate VCF file content
     */
    private generateVcfContent(vmlData: any): string {
        const { variantModelName, importedFeatureset, features, sourceFile } = vmlData;
        const timestamp = new Date().toISOString();
        
        // Build feature hierarchy and determine selections
        const configEntries = this.buildConfigEntries(features);

        let vcfContent = '';
        
        // Header with import
        vcfContent += `use variantmodel ${variantModelName}\n\n`;
        
        // ConfigSet definition
        vcfContent += `def configset ${variantModelName}Configs\n`;
        vcfContent += `    name "${variantModelName} Configuration Set"\n`;
        vcfContent += `    description "Auto-generated configuration from ${sourceFile} variant model selections"\n`;
        vcfContent += `    owner "Product Engineering"\n`;
        vcfContent += `    generatedfrom variantmodel ${variantModelName}\n`;
        vcfContent += `    generated "${timestamp}"\n`;
        vcfContent += `    tags "variant", "config", "auto-generated"\n\n`;

        // Config entries (sorted alphabetically)
        const sortedEntries = Array.from(configEntries.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [configPath, value] of sortedEntries) {
            vcfContent += `    def config ${configPath} ${value}\n`;
        }

        return vcfContent;
    }

    /**
     * Build config entries with hierarchical paths and automatic parent selection
     */
    private buildConfigEntries(features: Array<any>): Map<string, number> {
        const configMap = new Map<string, number>();
        const featuresByName = new Map<string, any>();
        const childrenByParent = new Map<string, string[]>();

        // Index features and build parent-child relationships
        for (const feature of features) {
            featuresByName.set(feature.name, feature);
            
            if (feature.parent) {
                if (!childrenByParent.has(feature.parent)) {
                    childrenByParent.set(feature.parent, []);
                }
                childrenByParent.get(feature.parent)!.push(feature.name);
            }
        }

        // Build config paths and determine selections
        for (const feature of features) {
            const configPath = this.buildConfigPath(feature, featuresByName);
            
            // Initially set based on explicit selection
            configMap.set(configPath, feature.selected ? 1 : 0);
        }

        // Apply parent auto-selection logic: if any child is selected, parent must be 1
        this.applyParentAutoSelection(configMap, childrenByParent, featuresByName);

        return configMap;
    }

    /**
     * Build hierarchical config path (c_Parent_Child_GrandChild)
     */
    private buildConfigPath(feature: any, featuresByName: Map<string, any>): string {
        const pathComponents: string[] = [];
        let current = feature;

        // Build path from bottom to top
        while (current) {
            pathComponents.unshift(current.name);
            current = current.parent ? featuresByName.get(current.parent) : null;
        }

        return 'c_' + pathComponents.join('_');
    }

    /**
     * Apply parent auto-selection: if any child is selected, parent must be 1
     */
    private applyParentAutoSelection(
        configMap: Map<string, number>,
        childrenByParent: Map<string, string[]>,
        featuresByName: Map<string, any>
    ): void {
        let changed = true;
        
        // Iterate until no more changes (propagate up the hierarchy)
        while (changed) {
            changed = false;
            
            for (const [parentName, children] of childrenByParent) {
                const parentFeature = featuresByName.get(parentName);
                if (!parentFeature) continue;
                
                const parentConfigPath = this.buildConfigPath(parentFeature, featuresByName);
                
                // Check if any child is selected
                const hasSelectedChild = children.some(childName => {
                    const childFeature = featuresByName.get(childName);
                    if (!childFeature) return false;
                    
                    const childConfigPath = this.buildConfigPath(childFeature, featuresByName);
                    return configMap.get(childConfigPath) === 1;
                });
                
                // If any child is selected and parent is not, set parent to 1
                if (hasSelectedChild && configMap.get(parentConfigPath) !== 1) {
                    configMap.set(parentConfigPath, 1);
                    changed = true;
                    console.log(`🔧 VCF: Auto-selected parent '${parentName}' due to selected children`);
                }
            }
        }
    }

    /**
     * Find existing .vcf files in workspace
     */
    private async findExistingVcfFiles(workspacePath: string): Promise<string[]> {
        const vcfFiles: string[] = [];

        const findVcfFiles = (dir: string) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.')) {
                    findVcfFiles(fullPath);
                } else if (stat.isFile() && item.endsWith('.vcf')) {
                    vcfFiles.push(fullPath);
                }
            }
        };

        try {
            findVcfFiles(workspacePath);
        } catch (error) {
            console.error('❌ Error finding VCF files:', error);
        }

        return vcfFiles;
    }
} 