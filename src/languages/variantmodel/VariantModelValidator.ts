import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';

interface FeatureNode {
    name: string;
    variabilityType: 'mandatory' | 'optional' | 'alternative';
    selected: boolean;
    indentLevel: number;
    lineIndex: number;
    line: string;
}

export class VariantModelValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig) {
        super(languageConfig);
    }

    protected getDefinitionKeywords(): string[] {
        return ['feature'];
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

        // Validate feature line syntax
        if (trimmedLine.startsWith('feature ')) {
            await this.validateFeatureDefinition(lineIndex, trimmedLine);
        } else {
            this.addDiagnostic(
                lineIndex,
                0,
                trimmedLine.length,
                'Invalid line. Expected feature definition or comment.',
                'invalid-line'
            );
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        await this.validateSelectionConsistency(document);
        await this.validateIndentationConsistency(document);
    }

    private async validateFeatureDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const featureMatch = trimmedLine.match(/^feature\s+(\w+)\s+(mandatory|optional|alternative)\s*(selected)?$/);
        
        if (!featureMatch) {
            this.addDiagnostic(
                lineIndex,
                0,
                trimmedLine.length,
                'Invalid feature syntax. Expected: feature FeatureName variability_type [selected]',
                'invalid-feature-syntax'
            );
            return;
        }

        const [, featureName, variabilityType, selectedKeyword] = featureMatch;
        
        // Validate feature name (should start with uppercase)
        if (!/^[A-Z]/.test(featureName)) {
            const featureStartPos = trimmedLine.indexOf(featureName);
            this.addDiagnostic(
                lineIndex,
                featureStartPos,
                featureName.length,
                'Feature name should start with uppercase letter',
                'feature-naming',
                vscode.DiagnosticSeverity.Warning
            );
        }
    }

    private async validateSelectionConsistency(document: vscode.TextDocument): Promise<void> {
        const features = this.parseFeatures(document);
        const featureMap = new Map<string, FeatureNode>();
        const alternativeGroups = new Map<string, FeatureNode[]>();
        
        // Build feature map and alternative groups
        for (const feature of features) {
            featureMap.set(feature.name, feature);
            
            if (feature.variabilityType === 'alternative') {
                const parentFeature = this.findParentFeature(feature, features);
                if (parentFeature) {
                    if (!alternativeGroups.has(parentFeature.name)) {
                        alternativeGroups.set(parentFeature.name, []);
                    }
                    alternativeGroups.get(parentFeature.name)!.push(feature);
                }
            }
        }

        // Validate mandatory features are selected
        for (const feature of features) {
            if (feature.variabilityType === 'mandatory' && !feature.selected) {
                this.addDiagnostic(
                    feature.lineIndex,
                    feature.line.indexOf(feature.name),
                    feature.name.length,
                    `Mandatory feature '${feature.name}' must be selected`,
                    'mandatory-not-selected'
                );
            }
        }

        // Validate alternative groups (exactly one must be selected)
        for (const [parentName, alternatives] of alternativeGroups) {
            const selectedAlternatives = alternatives.filter(alt => alt.selected);
            
            if (selectedAlternatives.length === 0) {
                const parentFeature = featureMap.get(parentName);
                if (parentFeature) {
                    this.addDiagnostic(
                        parentFeature.lineIndex,
                        parentFeature.line.indexOf(parentFeature.name),
                        parentFeature.name.length,
                        `Alternative group under '${parentName}' must have exactly one feature selected`,
                        'alternative-none-selected'
                    );
                }
            } else if (selectedAlternatives.length > 1) {
                for (const selectedAlt of selectedAlternatives) {
                    this.addDiagnostic(
                        selectedAlt.lineIndex,
                        selectedAlt.line.indexOf(selectedAlt.name),
                        selectedAlt.name.length,
                        `Alternative group under '${parentName}' can only have one feature selected`,
                        'alternative-multiple-selected'
                    );
                }
            }
        }
    }

    private async validateIndentationConsistency(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }
            
            const indent = this.getIndentLevel(line);
            
            // Validate indentation is multiples of 4
            if (indent % 4 !== 0) {
                this.addDiagnostic(
                    lineIndex,
                    0,
                    indent,
                    'Indentation should be multiples of 4 spaces',
                    'invalid-indentation',
                    vscode.DiagnosticSeverity.Warning
                );
            }
        }
    }

    private parseFeatures(document: vscode.TextDocument): FeatureNode[] {
        const features: FeatureNode[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();
            
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }
            
            const featureMatch = trimmedLine.match(/^feature\s+(\w+)\s+(mandatory|optional|alternative)\s*(selected)?$/);
            if (featureMatch) {
                const [, featureName, variabilityType, selectedKeyword] = featureMatch;
                
                features.push({
                    name: featureName,
                    variabilityType: variabilityType as 'mandatory' | 'optional' | 'alternative',
                    selected: selectedKeyword === 'selected',
                    indentLevel: this.getIndentLevel(line),
                    lineIndex: lineIndex,
                    line: line
                });
            }
        }
        
        return features;
    }

    private findParentFeature(feature: FeatureNode, features: FeatureNode[]): FeatureNode | null {
        for (let i = features.length - 1; i >= 0; i--) {
            const candidate = features[i];
            if (candidate.lineIndex < feature.lineIndex && 
                candidate.indentLevel < feature.indentLevel) {
                return candidate;
            }
        }
        return null;
    }

    protected override getIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }
} 