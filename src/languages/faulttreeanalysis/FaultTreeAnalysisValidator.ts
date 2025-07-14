import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';
import { SymbolManager } from '../../core/SymbolManager';

export class FaultTreeAnalysisValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig, symbolManager: SymbolManager) {
        super(languageConfig, symbolManager);
    }

    protected getDefinitionKeywords(): string[] {
        return ['faulttree', 'topevent', 'intermediateevent', 'basicevent', 'gate', 'transfer'];
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('//')) return;

        // Validate def faulttree syntax
        if (trimmedLine.startsWith('def faulttree')) {
            this.validateFaultTreeDefinition(lineIndex, trimmedLine);
        }
        // Validate def topevent syntax
        else if (trimmedLine.startsWith('def topevent')) {
            this.validateTopEventDefinition(lineIndex, trimmedLine);
        }
        // Validate def intermediateevent syntax
        else if (trimmedLine.startsWith('def intermediateevent')) {
            this.validateIntermediateEventDefinition(lineIndex, trimmedLine);
        }
        // Validate def basicevent syntax
        else if (trimmedLine.startsWith('def basicevent')) {
            this.validateBasicEventDefinition(lineIndex, trimmedLine);
        }
        // Validate def gate syntax
        else if (trimmedLine.startsWith('def gate')) {
            this.validateGateDefinition(lineIndex, trimmedLine);
        }
        // Validate def transfer syntax
        else if (trimmedLine.startsWith('def transfer')) {
            this.validateTransferDefinition(lineIndex, trimmedLine);
        }
        // Validate string properties
        else if (trimmedLine.startsWith('name ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'name');
        }
        else if (trimmedLine.startsWith('description ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'description');
        }
        else if (trimmedLine.startsWith('owner ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'owner');
        }
        else if (trimmedLine.startsWith('reviewers ')) {
            this.validateStringListProperty(lineIndex, trimmedLine, 'reviewers');
        }
        else if (trimmedLine.startsWith('standards ')) {
            this.validateStringListProperty(lineIndex, trimmedLine, 'standards');
        }
        else if (trimmedLine.startsWith('analysismethod ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'analysismethod');
        }
        else if (trimmedLine.startsWith('condition ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'condition');
        }
        else if (trimmedLine.startsWith('from ')) {
            this.validateIdentifierProperty(lineIndex, trimmedLine, 'from');
        }
        else if (trimmedLine.startsWith('to ')) {
            this.validateIdentifierProperty(lineIndex, trimmedLine, 'to');
        }
        else if (trimmedLine.startsWith('targetfta ')) {
            this.validateIdentifierProperty(lineIndex, trimmedLine, 'targetfta');
        }
        // Validate enum properties
        else if (trimmedLine.startsWith('gatetype ')) {
            this.validateGateTypeProperty(lineIndex, trimmedLine);
        }
        else if (trimmedLine.startsWith('severity ')) {
            this.validateSeverityProperty(lineIndex, trimmedLine);
        }
        else if (trimmedLine.startsWith('category ')) {
            this.validateCategoryProperty(lineIndex, trimmedLine);
        }
        else if (trimmedLine.startsWith('asil ')) {
            this.validateAsilProperty(lineIndex, trimmedLine);
        }
        else if (trimmedLine.startsWith('dormancy ')) {
            this.validateDormancyProperty(lineIndex, trimmedLine);
        }
        // Validate numeric properties
        else if (trimmedLine.startsWith('probability ')) {
            this.validateProbabilityProperty(lineIndex, trimmedLine);
        }
        else if (trimmedLine.startsWith('exposuretime ')) {
            this.validateNumericProperty(lineIndex, trimmedLine, 'exposuretime');
        }
        else if (trimmedLine.startsWith('repairtime ')) {
            this.validateNumericProperty(lineIndex, trimmedLine, 'repairtime');
        }
        // Validate list properties
        else if (trimmedLine.startsWith('inputs ')) {
            this.validateIdentifierListProperty(lineIndex, trimmedLine, 'inputs');
        }
        else if (trimmedLine.startsWith('outputs ')) {
            this.validateIdentifierListProperty(lineIndex, trimmedLine, 'outputs');
        }
        // Validate cross-references
        else if (trimmedLine.startsWith('item ')) {
            this.validateCrossReferenceProperty(lineIndex, trimmedLine, 'item', '.itm');
        }
        else if (trimmedLine.startsWith('hazardidentification ')) {
            this.validateCrossReferenceProperty(lineIndex, trimmedLine, 'hazardidentification', '.haz');
        }
        else if (trimmedLine.startsWith('riskassessment ')) {
            this.validateCrossReferenceProperty(lineIndex, trimmedLine, 'riskassessment', '.rsk');
        }
        else if (trimmedLine.startsWith('safetygoals ')) {
            this.validateCrossReferenceProperty(lineIndex, trimmedLine, 'safetygoals', '.sgl');
        }
        else if (trimmedLine.startsWith('productline ')) {
            this.validateCrossReferenceProperty(lineIndex, trimmedLine, 'productline', '.ple');
        }
        else if (trimmedLine.startsWith('featureset ')) {
            this.validateCrossReferenceProperty(lineIndex, trimmedLine, 'featureset', '.fml');
        }
        else if (trimmedLine.startsWith('functiongroup ')) {
            this.validateCrossReferenceProperty(lineIndex, trimmedLine, 'functiongroup', '.fun');
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        await this.validateSingleFaultTreeDefinition(document);
        await this.validateRequiredSections(document);
        await this.validateEventHierarchy(document);
        await this.validateGateConnections(document);
        await this.validateTransferReferences(document);
    }

    // Validation methods for definitions
    private validateFaultTreeDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def\s+faulttree\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid faulttree syntax. Expected: def faulttree <identifier>');
            return;
        }

        const identifier = match[1];
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addWarning(lineIndex, 'Fault tree identifier should use PascalCase');
        }
    }

    private validateTopEventDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def\s+topevent\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid topevent syntax. Expected: def topevent <identifier>');
            return;
        }

        const identifier = match[1];
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addWarning(lineIndex, 'Top event identifier should use PascalCase');
        }
    }

    private validateIntermediateEventDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def\s+intermediateevent\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid intermediateevent syntax. Expected: def intermediateevent <identifier>');
            return;
        }

        const identifier = match[1];
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addWarning(lineIndex, 'Intermediate event identifier should use PascalCase');
        }
    }

    private validateBasicEventDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def\s+basicevent\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid basicevent syntax. Expected: def basicevent <identifier>');
            return;
        }

        const identifier = match[1];
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addWarning(lineIndex, 'Basic event identifier should use PascalCase');
        }
    }

    private validateGateDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def\s+gate\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid gate syntax. Expected: def gate <identifier>');
            return;
        }

        const identifier = match[1];
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addWarning(lineIndex, 'Gate identifier should use PascalCase');
        }
    }

    private validateTransferDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def\s+transfer\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid transfer syntax. Expected: def transfer <identifier>');
            return;
        }

        const identifier = match[1];
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addWarning(lineIndex, 'Transfer identifier should use PascalCase');
        }
    }

    // Validation methods for properties
    private validateStringProperty(lineIndex: number, trimmedLine: string, propertyName: string): void {
        const match = trimmedLine.match(new RegExp(`^${propertyName}\\s+"(.+)"$`));
        if (!match) {
            this.addError(lineIndex, `Invalid ${propertyName} syntax. Expected: ${propertyName} "string value"`);
            return;
        }

        const value = match[1];
        if (value.length === 0) {
            this.addError(lineIndex, `${propertyName} cannot be empty`);
        }
    }

    private validateStringListProperty(lineIndex: number, trimmedLine: string, propertyName: string): void {
        const match = trimmedLine.match(new RegExp(`^${propertyName}\\s+"(.+)"(?:\\s*,\\s*"(.+)")*$`));
        if (!match) {
            this.addError(lineIndex, `Invalid ${propertyName} syntax. Expected: ${propertyName} "item1", "item2", ...`);
            return;
        }
    }

    private validateIdentifierProperty(lineIndex: number, trimmedLine: string, propertyName: string): void {
        const match = trimmedLine.match(new RegExp(`^${propertyName}\\s+(\\w+)$`));
        if (!match) {
            this.addError(lineIndex, `Invalid ${propertyName} syntax. Expected: ${propertyName} <identifier>`);
            return;
        }

        const identifier = match[1];
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addWarning(lineIndex, `${propertyName} identifier should use PascalCase`);
        }
    }

    private validateIdentifierListProperty(lineIndex: number, trimmedLine: string, propertyName: string): void {
        const match = trimmedLine.match(new RegExp(`^${propertyName}\\s+(.+)$`));
        if (!match) {
            this.addError(lineIndex, `Invalid ${propertyName} syntax. Expected: ${propertyName} <identifier1>, <identifier2>, ...`);
            return;
        }

        const identifiers = match[1].split(',').map(id => id.trim());
        for (const identifier of identifiers) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
                this.addWarning(lineIndex, `${propertyName} identifier "${identifier}" should use PascalCase`);
            }
        }
    }

    private validateCrossReferenceProperty(lineIndex: number, trimmedLine: string, propertyName: string, expectedExtension: string): void {
        const match = trimmedLine.match(new RegExp(`^${propertyName}\\s+(\\w+)$`));
        if (!match) {
            this.addError(lineIndex, `Invalid ${propertyName} syntax. Expected: ${propertyName} <identifier>`);
            return;
        }

        const identifier = match[1];
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            this.addWarning(lineIndex, `${propertyName} identifier should use PascalCase`);
        }

        // Add cross-file validation hint
        this.addInfo(lineIndex, `🔗 Cross-file validation: Verify that ${identifier} is defined in ${expectedExtension} files`);
    }

    private validateGateTypeProperty(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^gatetype\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid gatetype syntax. Expected: gatetype <type>');
            return;
        }

        const gateType = match[1];
        const validGateTypes = ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'NOT', 'INHIBIT', 'PRIORITY_AND', 'VOTING'];
        if (!validGateTypes.includes(gateType)) {
            this.addError(lineIndex, `Invalid gate type "${gateType}". Valid types: ${validGateTypes.join(', ')}`);
        }
    }

    private validateSeverityProperty(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^severity\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid severity syntax. Expected: severity <level>');
            return;
        }

        const severity = match[1];
        const validSeverities = ['S0', 'S1', 'S2', 'S3'];
        if (!validSeverities.includes(severity)) {
            this.addError(lineIndex, `Invalid severity "${severity}". Valid severities: ${validSeverities.join(', ')}`);
        }
    }

    private validateCategoryProperty(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^category\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid category syntax. Expected: category <type>');
            return;
        }

        const category = match[1];
        const validCategories = ['systematic', 'random', 'external', 'common_cause', 'human_error'];
        if (!validCategories.includes(category)) {
            this.addError(lineIndex, `Invalid category "${category}". Valid categories: ${validCategories.join(', ')}`);
        }
    }

    private validateAsilProperty(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^asil\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid asil syntax. Expected: asil <level>');
            return;
        }

        const asil = match[1];
        const validAsils = ['QM', 'A', 'B', 'C', 'D'];
        if (!validAsils.includes(asil)) {
            this.addError(lineIndex, `Invalid ASIL level "${asil}". Valid levels: ${validAsils.join(', ')}`);
        }
    }

    private validateDormancyProperty(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^dormancy\s+(\w+)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid dormancy syntax. Expected: dormancy <factor>');
            return;
        }

        const dormancy = match[1];
        const validDormancies = ['none', 'low', 'medium', 'high'];
        if (!validDormancies.includes(dormancy)) {
            this.addError(lineIndex, `Invalid dormancy factor "${dormancy}". Valid factors: ${validDormancies.join(', ')}`);
        }
    }

    private validateProbabilityProperty(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^probability\s+([0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)$/);
        if (!match) {
            this.addError(lineIndex, 'Invalid probability syntax. Expected: probability <number> (e.g., 1.0e-6)');
            return;
        }

        const probability = parseFloat(match[1]);
        if (probability < 0 || probability > 1) {
            this.addError(lineIndex, 'Probability must be between 0 and 1');
        }
    }

    private validateNumericProperty(lineIndex: number, trimmedLine: string, propertyName: string): void {
        const match = trimmedLine.match(new RegExp(`^${propertyName}\\s+([0-9]*\\.?[0-9]+)$`));
        if (!match) {
            this.addError(lineIndex, `Invalid ${propertyName} syntax. Expected: ${propertyName} <number>`);
            return;
        }

        const value = parseFloat(match[1]);
        if (value < 0) {
            this.addError(lineIndex, `${propertyName} must be non-negative`);
        }
    }

    // Document-level validation methods
    private async validateSingleFaultTreeDefinition(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        let faultTreeCount = 0;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('def faulttree')) {
                faultTreeCount++;
            }
        }

        if (faultTreeCount === 0) {
            this.addError(0, '.fta files must contain exactly one "def faulttree" definition');
        } else if (faultTreeCount > 1) {
            this.addError(0, '.fta files must contain exactly one "def faulttree" definition');
        }
    }

    private async validateRequiredSections(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        let hasTopEvent = false;
        let hasName = false;
        let hasDescription = false;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('def topevent')) {
                hasTopEvent = true;
            }
            if (trimmedLine.startsWith('name ')) {
                hasName = true;
            }
            if (trimmedLine.startsWith('description ')) {
                hasDescription = true;
            }
        }

        if (!hasTopEvent) {
            this.addError(0, '.fta files must contain at least one "def topevent" definition');
        }
        if (!hasName) {
            this.addError(0, '.fta files must contain a "name" property');
        }
        if (!hasDescription) {
            this.addError(0, '.fta files must contain a "description" property');
        }
    }

    private async validateEventHierarchy(document: vscode.TextDocument): Promise<void> {
        // Validate that events are properly connected in the fault tree hierarchy
        const text = document.getText();
        const lines = text.split('\n');
        const events = new Set<string>();
        const gates = new Set<string>();
        const transfers = new Set<string>();

        // Collect all event, gate, and transfer identifiers
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('def topevent ') || 
                trimmedLine.startsWith('def intermediateevent ') || 
                trimmedLine.startsWith('def basicevent ')) {
                const match = trimmedLine.match(/def\s+\w+\s+(\w+)/);
                if (match) {
                    events.add(match[1]);
                }
            } else if (trimmedLine.startsWith('def gate ')) {
                const match = trimmedLine.match(/def\s+gate\s+(\w+)/);
                if (match) {
                    gates.add(match[1]);
                }
            } else if (trimmedLine.startsWith('def transfer ')) {
                const match = trimmedLine.match(/def\s+transfer\s+(\w+)/);
                if (match) {
                    transfers.add(match[1]);
                }
            }
        }

        // Additional hierarchy validation logic can be added here
        // For now, we just provide informational feedback
        if (events.size === 0) {
            this.addWarning(0, 'No events defined in fault tree');
        }
        if (gates.size === 0 && events.size > 1) {
            this.addInfo(0, 'Consider adding logic gates to connect multiple events');
        }
    }

    private async validateGateConnections(document: vscode.TextDocument): Promise<void> {
        // Validate that gates have proper input/output connections
        const text = document.getText();
        const lines = text.split('\n');
        let currentGate = '';
        let gateHasInputs = false;
        let gateHasOutputs = false;

        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            
            if (trimmedLine.startsWith('def gate ')) {
                // Check previous gate if any
                if (currentGate && (!gateHasInputs || !gateHasOutputs)) {
                    this.addWarning(i - 1, `Gate ${currentGate} should have both inputs and outputs defined`);
                }
                
                const match = trimmedLine.match(/def\s+gate\s+(\w+)/);
                currentGate = match ? match[1] : '';
                gateHasInputs = false;
                gateHasOutputs = false;
            } else if (trimmedLine.startsWith('inputs ')) {
                gateHasInputs = true;
            } else if (trimmedLine.startsWith('outputs ')) {
                gateHasOutputs = true;
            }
        }

        // Check last gate
        if (currentGate && (!gateHasInputs || !gateHasOutputs)) {
            this.addWarning(lines.length - 1, `Gate ${currentGate} should have both inputs and outputs defined`);
        }
    }

    private async validateTransferReferences(document: vscode.TextDocument): Promise<void> {
        // Validate that transfer references are properly defined
        const text = document.getText();
        const lines = text.split('\n');
        const transfers = new Set<string>();
        const transferReferences = new Map<string, number>();

        // Collect transfer definitions and references
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            
            if (trimmedLine.startsWith('def transfer ')) {
                const match = trimmedLine.match(/def\s+transfer\s+(\w+)/);
                if (match) {
                    transfers.add(match[1]);
                }
            } else if (trimmedLine.startsWith('targetfta ')) {
                const match = trimmedLine.match(/targetfta\s+(\w+)/);
                if (match) {
                    transferReferences.set(match[1], i);
                }
            }
        }

        // Validate that all transfer references are defined
        for (const [ref, lineIndex] of transferReferences) {
            if (!transfers.has(ref)) {
                this.addError(lineIndex, `Transfer reference "${ref}" is not defined`);
            }
        }
    }

    // Helper methods
    private addError(lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
        diagnostic.source = 'sylang-fta';
        this.diagnostics.push(diagnostic);
    }

    private addWarning(lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
        diagnostic.source = 'sylang-fta';
        this.diagnostics.push(diagnostic);
    }

    private addInfo(lineIndex: number, message: string): void {
        const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Information);
        diagnostic.source = 'sylang-fta';
        this.diagnostics.push(diagnostic);
    }
} 