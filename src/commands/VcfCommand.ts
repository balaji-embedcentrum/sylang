import * as vscode from 'vscode';
import { VcfGenerator } from '../core/generators/VcfGenerator';

/**
 * VCF Generation Command
 */
export class VcfCommand {
    private vcfGenerator: VcfGenerator;

    constructor() {
        this.vcfGenerator = new VcfGenerator();
    }

    /**
     * Register VCF generation command
     */
    static register(context: vscode.ExtensionContext): void {
        const vcfCommand = new VcfCommand();
        
        const generateVcfCommand = vscode.commands.registerCommand(
            'sylang.generateVariantConfig', 
            async (uri?: vscode.Uri) => {
                try {
                    if (!uri) {
                        const activeEditor = vscode.window.activeTextEditor;
                        if (!activeEditor || !activeEditor.document.fileName.endsWith('.vml')) {
                            vscode.window.showErrorMessage('Please select a .vml file to generate variant config');
                            return;
                        }
                        uri = activeEditor.document.uri;
                    }
                    await vcfCommand.vcfGenerator.generateVcfFromVml(uri);
                } catch (error) {
                    console.error('❌ VCF generation failed:', error);
                    vscode.window.showErrorMessage(`VCF generation failed: ${error}`);
                }
            }
        );

        context.subscriptions.push(generateVcfCommand);
        console.log('✅ VCF generation command registered');
    }
} 