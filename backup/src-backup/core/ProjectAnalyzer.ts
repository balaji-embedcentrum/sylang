import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getLanguageConfigByExtension, getAllExtensions } from '../config/LanguageConfigs';

export interface ProjectStructure {
    productLines: vscode.Uri[];
    features: vscode.Uri[];
    functions: vscode.Uri[];
    safety: vscode.Uri[];
    security: vscode.Uri[];
    components: vscode.Uri[];
    software: vscode.Uri[];
    electronics: vscode.Uri[];
    mechanics: vscode.Uri[];
}

export interface CrossFileReference {
    sourceFile: vscode.Uri;
    sourceLine: number;
    targetFile: vscode.Uri;
    targetElement: string;
    referenceType: 'requires' | 'excludes' | 'allocatedto' | 'derivedfrom' | 'satisfies' | 'implements';
    isValid: boolean;
    error?: string;
}

export interface ProjectAnalysis {
    structure: ProjectStructure;
    crossFileReferences: CrossFileReference[];
    duplicateIdentifiers: Array<{
        identifier: string;
        files: vscode.Uri[];
        lines: number[];
    }>;
    missingReferences: Array<{
        file: vscode.Uri;
        line: number;
        reference: string;
        type: string;
    }>;
    validationIssues: vscode.Diagnostic[];
}

export class ProjectAnalyzer {
    constructor(_workspaceRoot: string) {
        // workspaceRoot is not used
    }

    public async analyzeProject(): Promise<ProjectAnalysis> {
        console.log('[ProjectAnalyzer] Starting project analysis...');
        
        const structure = await this.analyzeProjectStructure();
        const crossFileReferences = await this.analyzeCrossFileReferences(structure);
        const duplicateIdentifiers = await this.findDuplicateIdentifiers(structure);
        const missingReferences = await this.findMissingReferences(crossFileReferences);
        const validationIssues = await this.validateProjectStructure(structure);

        return {
            structure,
            crossFileReferences,
            duplicateIdentifiers,
            missingReferences,
            validationIssues
        };
    }

    private async analyzeProjectStructure(): Promise<ProjectStructure> {
        const structure: ProjectStructure = {
            productLines: [],
            features: [],
            functions: [],
            safety: [],
            security: [],
            components: [],
            software: [],
            electronics: [],
            mechanics: []
        };

        const sylangExtensions = getAllExtensions();
        const pattern = `**/*.{${sylangExtensions.join(',')}}`;
        
        try {
            const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
            
            for (const file of files) {
                const extension = path.extname(file.fsPath);
                const config = getLanguageConfigByExtension(extension);
                
                if (!config) continue;

                switch (config.id) {
                    case 'sylang-productline':
                        structure.productLines.push(file);
                        break;
                    case 'sylang-features':
                        structure.features.push(file);
                        break;
                    case 'sylang-functions':
                        structure.functions.push(file);
                        break;
                    case 'sylang-safety':
                        structure.safety.push(file);
                        break;
                    case 'sylang-security':
                        structure.security.push(file);
                        break;
                    case 'sylang-components':
                        structure.components.push(file);
                        break;
                    case 'sylang-software':
                        structure.software.push(file);
                        break;
                    case 'sylang-electronics':
                        structure.electronics.push(file);
                        break;
                    case 'sylang-mechanics':
                        structure.mechanics.push(file);
                        break;
                }
            }
        } catch (error) {
            console.error('[ProjectAnalyzer] Error finding files:', error);
        }

        console.log(`[ProjectAnalyzer] Found ${structure.productLines.length} product lines, ${structure.features.length} features, ${structure.functions.length} functions`);
        return structure;
    }

    private async analyzeCrossFileReferences(structure: ProjectStructure): Promise<CrossFileReference[]> {
        const references: CrossFileReference[] = [];
        
        // Analyze feature files for cross-file references
        for (const featureFile of structure.features) {
            const fileReferences = await this.analyzeFeatureReferences(featureFile, structure);
            references.push(...fileReferences);
        }

        // Analyze def function files for cross-file references
        for (const functionFile of structure.functions) {
            const fileReferences = await this.analyzeFunctionReferences(functionFile, structure);
            references.push(...fileReferences);
        }

        console.log(`[ProjectAnalyzer] Found ${references.length} cross-file references`);
        return references;
    }

    private async analyzeFeatureReferences(featureFile: vscode.Uri, structure: ProjectStructure): Promise<CrossFileReference[]> {
        const references: CrossFileReference[] = [];
        
        try {
            const document = await vscode.workspace.openTextDocument(featureFile);
            const text = document.getText();
            const lines = text.split('\n');

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                if (!line) continue;
                const trimmedLine = line.trim();

                // Check for constraint references (requires/excludes)
                if (trimmedLine.startsWith('requires') || trimmedLine.startsWith('excludes')) {
                    const reference = this.extractConstraintReference(trimmedLine, lineIndex, featureFile, structure);
                    if (reference) {
                        references.push(reference);
                    }
                }
            }
        } catch (error) {
            console.error(`[ProjectAnalyzer] Error analyzing feature file ${featureFile.fsPath}:`, error);
        }

        return references;
    }

    private async analyzeFunctionReferences(functionFile: vscode.Uri, structure: ProjectStructure): Promise<CrossFileReference[]> {
        const references: CrossFileReference[] = [];
        
        try {
            const document = await vscode.workspace.openTextDocument(functionFile);
            const text = document.getText();
            const lines = text.split('\n');

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                if (!line) continue;
                const trimmedLine = line.trim();

                // Check for allocation references
                if (trimmedLine.includes('allocatedto')) {
                    const reference = this.extractAllocationReference(trimmedLine, lineIndex, functionFile, structure);
                    if (reference) {
                        references.push(reference);
                    }
                }
            }
        } catch (error) {
            console.error(`[ProjectAnalyzer] Error analyzing def function file ${functionFile.fsPath}:`, error);
        }

        return references;
    }

    private extractConstraintReference(
        line: string, 
        lineIndex: number, 
        sourceFile: vscode.Uri, 
        structure: ProjectStructure
    ): CrossFileReference | null {
        const match = line.match(/^(requires|excludes)\s+(\w+)/);
        if (!match || !match[2]) return null;

        const referenceType = match[1] as 'requires' | 'excludes';
        const targetElement = match[2];

        // Look for the target element in feature files
        const targetFile = this.findElementInFiles(targetElement, structure.features);
        
        return {
            sourceFile,
            sourceLine: lineIndex,
            targetFile: targetFile || vscode.Uri.file(''),
            targetElement,
            referenceType,
            isValid: !!targetFile,
            ...(targetFile ? {} : { error: `Feature '${targetElement}' not found in any .fml file` })
        };
    }

    private extractAllocationReference(
        line: string, 
        lineIndex: number, 
        sourceFile: vscode.Uri, 
        structure: ProjectStructure
    ): CrossFileReference | null {
        const match = line.match(/allocatedto\s+(\w+)/);
        if (!match || !match[1]) return null;

        const targetElement = match[1];

        // Look for the target element in component files
        const targetFile = this.findElementInFiles(targetElement, structure.components);
        
        return {
            sourceFile,
            sourceLine: lineIndex,
            targetFile: targetFile || vscode.Uri.file(''),
            targetElement,
            referenceType: 'allocatedto',
            isValid: !!targetFile,
            ...(targetFile ? {} : { error: `Component '${targetElement}' not found in any .cmp file` })
        };
    }

    private findElementInFiles(elementName: string, files: vscode.Uri[]): vscode.Uri | null {
        for (const file of files) {
            try {
                const content = fs.readFileSync(file.fsPath, 'utf8');
                const lines = content.split('\n');
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    // Look for element definitions (feature, component, etc.)
                    if (trimmedLine.match(new RegExp(`\\b(feature|component|subsystem)\\s+${elementName}\\b`))) {
                        return file;
                    }
                }
            } catch (error) {
                console.error(`[ProjectAnalyzer] Error reading file ${file.fsPath}:`, error);
            }
        }
        return null;
    }

    private async findDuplicateIdentifiers(structure: ProjectStructure): Promise<Array<{identifier: string, files: vscode.Uri[], lines: number[]}>> {
        const duplicates: Array<{identifier: string, files: vscode.Uri[], lines: number[]}> = [];
        const identifierMap = new Map<string, Array<{file: vscode.Uri, line: number}>>();

        // Collect all identifiers from all files
        const allFiles = [
            ...structure.productLines,
            ...structure.features,
            ...structure.functions,
            ...structure.safety,
            ...structure.security,
            ...structure.components,
            ...structure.software,
            ...structure.electronics,
            ...structure.mechanics
        ];

        for (const file of allFiles) {
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const text = document.getText();
                const lines = text.split('\n');

                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];
                    if (!line) continue;
                    const trimmedLine = line.trim();

                    // Extract identifiers from different line types
                    const identifier = this.extractIdentifier(trimmedLine);
                    if (identifier) {
                        if (!identifierMap.has(identifier)) {
                            identifierMap.set(identifier, []);
                        }
                        identifierMap.get(identifier)!.push({ file, line: lineIndex });
                    }
                }
            } catch (error) {
                console.error(`[ProjectAnalyzer] Error analyzing file ${file.fsPath}:`, error);
            }
        }

        // Find duplicates
        for (const [identifier, occurrences] of identifierMap.entries()) {
            if (occurrences.length > 1) {
                duplicates.push({
                    identifier,
                    files: occurrences.map(o => o.file),
                    lines: occurrences.map(o => o.line)
                });
            }
        }

        console.log(`[ProjectAnalyzer] Found ${duplicates.length} duplicate identifiers`);
        return duplicates;
    }

    private extractIdentifier(line: string): string | null {
        // Extract identifiers from different line patterns
        const patterns = [
            /^productline\s+(\w+)/,
            /^feature\s+(\w+)/,
            /^function\s+(\w+)/,
            /^component\s+(\w+)/,
            /^subsystem\s+(\w+)/,
            /^module\s+(\w+)/,
            /^circuit\s+(\w+)/,
            /^assembly\s+(\w+)/
        ];

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }

    private async findMissingReferences(crossFileReferences: CrossFileReference[]): Promise<Array<{file: vscode.Uri, line: number, reference: string, type: string}>> {
        const missing: Array<{file: vscode.Uri, line: number, reference: string, type: string}> = [];

        for (const ref of crossFileReferences) {
            if (!ref.isValid) {
                missing.push({
                    file: ref.sourceFile,
                    line: ref.sourceLine,
                    reference: ref.targetElement,
                    type: ref.referenceType
                });
            }
        }

        return missing;
    }

    private async validateProjectStructure(structure: ProjectStructure): Promise<vscode.Diagnostic[]> {
        const diagnostics: vscode.Diagnostic[] = [];

        // Validate that there's exactly one product line file
        if (structure.productLines.length === 0) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                'No product line file (.ple) found in the project',
                vscode.DiagnosticSeverity.Error
            ));
        } else if (structure.productLines.length > 1) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                `Multiple product line files found (${structure.productLines.length}). Only one .ple file is allowed per project.`,
                vscode.DiagnosticSeverity.Error
            ));
        }

        // Validate that features are present if functions are present
        if (structure.functions.length > 0 && structure.features.length === 0) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                'Functions defined but no features found. Functions should be allocated to features.',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        return diagnostics;
    }

    public async getProjectSummary(): Promise<string> {
        const analysis = await this.analyzeProject();
        
        return `
Sylang Project Analysis Summary
===============================

Project Structure:
- Product Lines: ${analysis.structure.productLines.length}
- Features: ${analysis.structure.features.length}
- Functions: ${analysis.structure.functions.length}
- Safety: ${analysis.structure.safety.length}
- Security: ${analysis.structure.security.length}
- Components: ${analysis.structure.components.length}
- Software: ${analysis.structure.software.length}
- Electronics: ${analysis.structure.electronics.length}
- Mechanics: ${analysis.structure.mechanics.length}

Cross-file References: ${analysis.crossFileReferences.length}
- Valid: ${analysis.crossFileReferences.filter(r => r.isValid).length}
- Invalid: ${analysis.crossFileReferences.filter(r => !r.isValid).length}

Issues Found:
- Duplicate Identifiers: ${analysis.duplicateIdentifiers.length}
- Missing References: ${analysis.missingReferences.length}
- Validation Issues: ${analysis.validationIssues.length}
        `.trim();
    }
} 