import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';

interface FeatureNode {
    name: string;
    variabilityType: 'mandatory' | 'optional' | 'alternative' | 'or';
    indentLevel: number;
    lineIndex: number;
    line: string;
}

export class FeaturesValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig) {
        super(languageConfig);
    }

    protected getDefinitionKeywords(): string[] {
        return ['systemfeatures', 'feature'];
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Validate def systemfeatures syntax
        if (trimmedLine.startsWith('def systemfeatures')) {
            await this.validateSystemfeaturesDefinition(lineIndex, trimmedLine);
        }

        // Validate def feature syntax
        if (trimmedLine.startsWith('def feature')) {
            await this.validateFeatureDefinition(lineIndex, trimmedLine);
        }

        // Note: Constraints section indentation is now handled by validateHierarchicalIndentation()
        // in document-level validation for comprehensive tab-based hierarchy validation

        // Validate constraint rules (requires/excludes)
        if (trimmedLine.startsWith('requires') || trimmedLine.startsWith('excludes')) {
            await this.validateConstraintRule(document, lineIndex, line);
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        // Check for single systemfeatures keyword in file
        await this.validateSingleSystemfeaturesKeyword(document);

        // Check for single .fml file in workspace
        await this.validateSingleFmlFileInWorkspace(document);

        // Validate constraint references
        await this.validateConstraintReferences(document);

        // Validate ISO 26580 sibling variability consistency
        await this.validateSiblingVariabilityConsistency(document);

        // Validate features-specific hierarchical indentation
        await this.validateFeaturesHierarchicalIndentation(document);
    }

    private async validateSystemfeaturesDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const systemfeaturesMatch = trimmedLine.match(/^def\s+systemfeatures\s+(\w+)/);
        if (!systemfeaturesMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid systemfeatures syntax. Expected: def systemfeatures <name>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-systemfeatures-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const systemfeaturesName = systemfeaturesMatch[1] || '';
        
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(systemfeaturesName)) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'System features name should start with uppercase letter and contain only letters and numbers',
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'invalid-systemfeatures-name';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateFeatureDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const featureMatch = trimmedLine.match(/^def\s+feature\s+(\w+)\s+(mandatory|optional|alternative|or)/);
        if (!featureMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid feature syntax. Expected: def feature <name> <variability_type>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-feature-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const featureName = featureMatch[1] || '';
        const variabilityType = featureMatch[2] || '';

        if (!/^[A-Z][a-zA-Z0-9]*$/.test(featureName)) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Feature name should start with uppercase letter and contain only letters and numbers',
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'invalid-feature-name';
            this.diagnostics.push(diagnostic);
        }

        const validVariabilityTypes = ['mandatory', 'optional', 'alternative', 'or'];
        if (!validVariabilityTypes.includes(variabilityType)) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid variability type: ${variabilityType}. Valid types are: ${validVariabilityTypes.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-variability-type';
            this.diagnostics.push(diagnostic);
        }
    }



    private async validateConstraintRule(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();
        
        const constraintMatch = trimmedLine.match(/^(requires|excludes)\s+(\w+)/);
        if (!constraintMatch || !constraintMatch[2]) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid constraint syntax. Expected: requires <feature_name> or excludes <feature_name>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-constraint-syntax';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateSingleSystemfeaturesKeyword(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        let systemfeaturesCount = 0;
        let firstSystemfeaturesLine = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('def systemfeatures')) {
                systemfeaturesCount++;
                if (firstSystemfeaturesLine === -1) {
                    firstSystemfeaturesLine = i;
                }
            }
        }

        if (systemfeaturesCount === 0) {
            const range = new vscode.Range(0, 0, 0, 0);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Features file must contain exactly one "def systemfeatures" declaration',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-systemfeatures-keyword';
            this.diagnostics.push(diagnostic);
        } else if (systemfeaturesCount > 1) {
            const firstLine = lines[firstSystemfeaturesLine];
            const range = new vscode.Range(firstSystemfeaturesLine, 0, firstSystemfeaturesLine, firstLine ? firstLine.length : 0);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Multiple "def systemfeatures" declarations found (${systemfeaturesCount}). Only one is allowed per file.`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'multiple-systemfeatures-keywords';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateSingleFmlFileInWorkspace(document: vscode.TextDocument): Promise<void> {
        try {
            const files = await vscode.workspace.findFiles('**/*.fml', '**/node_modules/**');
            const currentFile = document.uri.fsPath;
            
            const otherFmlFiles = files.filter(file => file.fsPath !== currentFile);
            
            if (otherFmlFiles.length > 0) {
                const range = new vscode.Range(0, 0, 0, 0);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Multiple .fml files found in workspace. Only one features file is allowed per project. Found: ${otherFmlFiles.map(f => f.fsPath.split('/').pop()).join(', ')}`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'multiple-fml-files';
                this.diagnostics.push(diagnostic);
            }
        } catch (error) {
            console.error('[FeaturesValidator] Error checking for multiple .fml files:', error);
        }
    }

    private async validateConstraintReferences(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');

        // Extract all defined features (only from 'def feature' lines)
        const definedFeatures = new Set<string>();
        for (const line of lines) {
            if (!line) continue;
            const trimmedLine = line.trim();
            const featureMatch = trimmedLine.match(/^def\s+feature\s+(\w+)/);
            if (featureMatch && featureMatch[1]) {
                definedFeatures.add(featureMatch[1]);
            }
        }

        // Check constraint references
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            
            const trimmedLine = line.trim();
            const constraintMatch = trimmedLine.match(/^(requires|excludes)\s+(\w+)/);
            if (constraintMatch && constraintMatch[2]) {
                const referencedFeature = constraintMatch[2];
                if (!definedFeatures.has(referencedFeature)) {
                    const range = new vscode.Range(i, 0, i, line.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Feature '${referencedFeature}' referenced in constraint but not defined`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-feature-reference';
                    this.diagnostics.push(diagnostic);
                }
            }
        }
    }

    private async validateSiblingVariabilityConsistency(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        // Parse feature hierarchy with indentation levels
        const features: FeatureNode[] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            
            const trimmedLine = line.trim();
            const featureMatch = trimmedLine.match(/^def\s+feature\s+(\w+)\s+(mandatory|optional|alternative|or)/);
            
            if (featureMatch) {
                const featureName = featureMatch[1];
                const variabilityType = featureMatch[2] as 'mandatory' | 'optional' | 'alternative' | 'or';
                const indentLevel = this.getIndentLevel(line);
                
                // Ensure featureName is defined
                if (!featureName) continue;
                
                features.push({
                    name: featureName,
                    variabilityType,
                    indentLevel,
                    lineIndex: i,
                    line: trimmedLine
                });
            }
        }
        
        // Group features by parent (same indentation level means siblings)
        const siblingGroups = this.groupSiblingFeatures(features);
        
        // Validate each sibling group
        for (const siblings of siblingGroups) {
            if (siblings.length <= 1) continue; // No siblings to validate
            
            await this.validateSiblingGroupConsistency(siblings);
        }
    }

    private groupSiblingFeatures(features: FeatureNode[]): FeatureNode[][] {
        const groups: FeatureNode[][] = [];
        const processedFeatures = new Set<number>();
        
        for (let i = 0; i < features.length; i++) {
            if (processedFeatures.has(i)) continue;
            
            const currentFeature = features[i];
            if (!currentFeature) continue;
            
            const siblings: FeatureNode[] = [currentFeature];
            processedFeatures.add(i);
            
            // Find all features that are siblings (same indentation, consecutive under same parent)
            for (let j = i + 1; j < features.length; j++) {
                const nextFeature = features[j];
                if (!nextFeature) continue;
                
                // Stop if we encounter a feature at a lower indentation (went to different parent/level)
                if (nextFeature.indentLevel < currentFeature.indentLevel) {
                    break;
                }
                
                // If higher indentation, it's a child - skip it
                if (nextFeature.indentLevel > currentFeature.indentLevel) {
                    continue;
                }
                
                // Same indentation level = sibling under same parent
                if (nextFeature.indentLevel === currentFeature.indentLevel) {
                    siblings.push(nextFeature);
                    processedFeatures.add(j);
                }
            }
            
            // Only add groups with multiple siblings for validation
            if (siblings.length > 1) {
                groups.push(siblings);
            }
        }
        
        return groups;
    }

    private async validateSiblingGroupConsistency(siblings: FeatureNode[]): Promise<void> {
        if (siblings.length <= 1) return;
        
        const firstSibling = siblings[0];
        if (!firstSibling) return;
        
        const firstVariabilityType = firstSibling.variabilityType;
        
        // ISO 26262 Feature Variability Rules:
        // 1. mandatory/optional: Can be mixed (individual feature selection)
        // 2. or: ALL siblings must be 'or' (group constraint: one or more selected)  
        // 3. alternative: ALL siblings must be 'alternative' (group constraint: exactly one selected)
        
        const compatibilityRules: Record<string, string[]> = {
            'mandatory': ['mandatory', 'optional'],
            'optional': ['mandatory', 'optional'],
            'or': ['or'],
            'alternative': ['alternative']
        };
        
        const allowedTypes = compatibilityRules[firstVariabilityType];
        if (!allowedTypes) return;
        
        // Check each sibling for compatibility
        for (let i = 1; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (!sibling) continue;
            
            if (!allowedTypes.includes(sibling.variabilityType)) {
                const range = new vscode.Range(sibling.lineIndex, 0, sibling.lineIndex, sibling.line.length);
                
                // Create specific error messages for common violations
                let errorMessage = '';
                if (firstVariabilityType === 'or' && sibling.variabilityType === 'alternative') {
                    errorMessage = `ISO 26262 Violation: Cannot mix 'or' and 'alternative' siblings. Feature '${sibling.name}' is 'alternative' but sibling '${firstSibling.name}' is 'or'. All siblings must be 'or'.`;
                } else if (firstVariabilityType === 'alternative' && sibling.variabilityType === 'or') {
                    errorMessage = `ISO 26262 Violation: Cannot mix 'alternative' and 'or' siblings. Feature '${sibling.name}' is 'or' but sibling '${firstSibling.name}' is 'alternative'. All siblings must be 'alternative'.`;
                } else {
                    errorMessage = `ISO 26262 Violation: Sibling feature '${sibling.name}' has variability '${sibling.variabilityType}' but first sibling '${firstSibling.name}' has '${firstVariabilityType}'. Allowed sibling types: ${allowedTypes.join(', ')}`;
                }
                
                const diagnostic = new vscode.Diagnostic(
                    range,
                    errorMessage,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'iso26262-sibling-variability-violation';
                this.diagnostics.push(diagnostic);
            }
        }
    }

    private async validateFeaturesHierarchicalIndentation(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        let systemfeaturesIndent = -1;
        const featureStack: Array<{indentLevel: number, lineIndex: number, name: string}> = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || line.trim().length === 0 || line.trim().startsWith('//')) continue;
            
            const trimmedLine = line.trim();
            const indentLevel = this.getIndentLevel(line);
            
            // Check systemfeatures indentation
            if (trimmedLine.startsWith('def systemfeatures')) {
                if (indentLevel !== 0) {
                    this.addDiagnostic(i, 0, indentLevel, `systemfeatures must start at column 0. Found ${indentLevel} tabs.`, 'invalid-systemfeatures-indentation');
                }
                systemfeaturesIndent = indentLevel;
                continue;
            }
            
            // Check feature definitions
            const featureMatch = trimmedLine.match(/^def\s+feature\s+(\w+)\s+(mandatory|optional|alternative|or)/);
            if (featureMatch && featureMatch[1]) {
                const featureName = featureMatch[1];
                
                // Validate feature indentation hierarchy
                if (systemfeaturesIndent === -1) {
                    this.addDiagnostic(i, 0, line.length, 'Feature definition found before systemfeatures declaration', 'feature-before-systemfeatures');
                    continue;
                }
                
                // Check if indentation is valid (must be at least 1 tab deeper than systemfeatures)
                const expectedMinIndent = systemfeaturesIndent + 1; // First level features
                if (indentLevel < expectedMinIndent) {
                    this.addDiagnostic(i, 0, indentLevel, `Feature '${featureName}' indentation too shallow. Minimum expected: ${expectedMinIndent} tabs, found: ${indentLevel} tabs.`, 'feature-indentation-too-shallow');
                    continue;
                }
                
                // Update feature stack (remove features at same or deeper level)
                while (featureStack.length > 0) {
                    const lastFeature = featureStack[featureStack.length - 1];
                    if (!lastFeature || lastFeature.indentLevel < indentLevel) break;
                    featureStack.pop();
                }
                
                // Add current feature to stack
                featureStack.push({indentLevel, lineIndex: i, name: featureName});
                continue;
            }
            
            // Check property indentation (name, description, owner, tags, safetylevel)
            const propertyMatch = trimmedLine.match(/^(name|description|owner|tags|safetylevel)\s/);
            if (propertyMatch && propertyMatch[1]) {
                if (featureStack.length === 0) {
                    this.addDiagnostic(i, 0, line.length, 'Property found outside of any feature definition', 'property-outside-feature');
                    continue;
                }
                
                const parentFeature = featureStack[featureStack.length - 1];
                if (!parentFeature) continue;
                
                const expectedPropertyIndent = parentFeature.indentLevel + 1;
                
                if (indentLevel !== expectedPropertyIndent) {
                    this.addDiagnostic(i, 0, indentLevel, `Property '${propertyMatch[1]}' must be indented 1 tab deeper than its parent feature '${parentFeature.name}'. Expected: ${expectedPropertyIndent} tabs, found: ${indentLevel} tabs.`, 'property-incorrect-indentation');
                }
                continue;
            }
            
            // Check constraints section indentation (FEATURES-SPECIFIC)
            if (trimmedLine === 'constraints') {
                if (systemfeaturesIndent === -1) {
                    this.addDiagnostic(i, 0, line.length, 'Constraints section found before systemfeatures declaration', 'constraints-before-systemfeatures');
                    continue;
                }
                
                const expectedConstraintsIndent = systemfeaturesIndent + 1;
                if (indentLevel !== expectedConstraintsIndent) {
                    this.addDiagnostic(i, 0, indentLevel, `Constraints section must be indented 1 tab from systemfeatures. Expected: ${expectedConstraintsIndent} tabs, found: ${indentLevel} tabs.`, 'constraints-incorrect-indentation');
                }
                continue;
            }
            
            // Check constraint rule indentation (FEATURES-SPECIFIC: requires/excludes lines)
            const constraintRuleMatch = trimmedLine.match(/^(\w+)\s+(requires|excludes)\s+(\w+)/);
            if (constraintRuleMatch) {
                if (systemfeaturesIndent === -1) continue;
                
                const expectedConstraintRuleIndent = systemfeaturesIndent + 2; // 1 more than constraints
                if (indentLevel !== expectedConstraintRuleIndent) {
                    this.addDiagnostic(i, 0, indentLevel, `Constraint rules must be indented 1 tab deeper than constraints section. Expected: ${expectedConstraintRuleIndent} tabs, found: ${indentLevel} tabs.`, 'constraint-rule-incorrect-indentation');
                }
                continue;
            }
        }
    }

} 