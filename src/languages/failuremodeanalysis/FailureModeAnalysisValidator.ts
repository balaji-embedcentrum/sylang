import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';

export class FailureModeAnalysisValidator extends BaseValidator {
    private readonly SEVERITY_RANGE = { min: 1, max: 10 };
    private readonly OCCURRENCE_RANGE = { min: 1, max: 10 };
    private readonly DETECTION_RANGE = { min: 1, max: 10 };
    private readonly ASIL_LEVELS = ['QM', 'A', 'B', 'C', 'D'];
    private readonly ACTION_PRIORITIES = ['high', 'medium', 'low'];

    constructor(languageConfig: LanguageConfig) {
        super(languageConfig);
    }

    protected getDefinitionKeywords(): string[] {
        return ['failuremodeanalysis', 'failuremode'];
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('//')) return;

        // Validate def failuremodeanalysis syntax
        if (trimmedLine.startsWith('def failuremodeanalysis')) {
            this.validateFailureModeAnalysisDefinition(lineIndex, trimmedLine);
        }
        // Validate def failuremode syntax
        else if (trimmedLine.startsWith('def failuremode')) {
            this.validateFailureModeDefinition(lineIndex, trimmedLine);
        }
        // Validate properties
        else if (trimmedLine.startsWith('name ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'name');
        } else if (trimmedLine.startsWith('description ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'description');
        } else if (trimmedLine.startsWith('in function ')) {
            this.validateInFunction(lineIndex, trimmedLine);
        } else if (trimmedLine.startsWith('severity ')) {
            this.validateNumericProperty(lineIndex, trimmedLine, 'severity', this.SEVERITY_RANGE);
        } else if (trimmedLine.startsWith('occurrence ')) {
            this.validateNumericProperty(lineIndex, trimmedLine, 'occurrence', this.OCCURRENCE_RANGE);
        } else if (trimmedLine.startsWith('detection ')) {
            this.validateDetectionProperty(lineIndex, trimmedLine);
        } else if (trimmedLine.startsWith('rpn ')) {
            this.validateRpn(lineIndex, trimmedLine);
        } else if (trimmedLine.startsWith('actionpriority ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'actionpriority', this.ACTION_PRIORITIES);
        } else if (trimmedLine.startsWith('asil ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'asil', this.ASIL_LEVELS);
        } else if (trimmedLine.startsWith('causes failuremode ')) {
            this.validateFailureModeReferences(lineIndex, trimmedLine, 'causes');
        } else if (trimmedLine.startsWith('effects failuremode ')) {
            this.validateFailureModeReferences(lineIndex, trimmedLine, 'effects');
        } else if (trimmedLine.startsWith('mitigation ')) {
            this.validateIdentifierList(lineIndex, trimmedLine, 'mitigation');
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        const lines = document.getText().split('\n');
        let hasFailureModeAnalysis = false;
        let failureModeAnalysisCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('def failuremodeanalysis')) {
                hasFailureModeAnalysis = true;
                failureModeAnalysisCount++;
                if (failureModeAnalysisCount > 1) {
                    this.addDiagnostic(i, 0, line.length, 
                        'Only one failure mode analysis definition is allowed per file',
                        'multiple-failuremodeanalysis-definitions', vscode.DiagnosticSeverity.Error);
                }
            }
        }

        if (!hasFailureModeAnalysis) {
            this.addDiagnostic(0, 0, 0, 
                'File must contain at least one failure mode analysis definition',
                'no-failuremodeanalysis-found', vscode.DiagnosticSeverity.Error);
        }
    }

    private validateFailureModeAnalysisDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def failuremodeanalysis\s+(\w+)$/);
        if (!match) {
            this.addDiagnostic(lineIndex, 0, trimmedLine.length, 
                'Invalid failure mode analysis definition syntax. Expected: def failuremodeanalysis <identifier>',
                'invalid-failuremodeanalysis-syntax', vscode.DiagnosticSeverity.Error);
        }
    }

    private validateFailureModeDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def failuremode\s+(\w+)$/);
        if (!match) {
            this.addDiagnostic(lineIndex, 0, trimmedLine.length, 
                'Invalid failure mode definition syntax. Expected: def failuremode <identifier>',
                'invalid-failuremode-syntax', vscode.DiagnosticSeverity.Error);
        }
    }

    private validateStringProperty(lineIndex: number, line: string, property: string): void {
        const match = line.match(new RegExp(`^${property}\\s+"([^"]*)"$`));
        if (!match) {
            this.addDiagnostic(lineIndex, 0, line.length, 
                `Invalid ${property} syntax. Expected: ${property} "string value"`,
                `invalid-${property}-syntax`, vscode.DiagnosticSeverity.Error);
        } else if (match[1].trim() === '') {
            this.addDiagnostic(lineIndex, 0, line.length, 
                `${property} cannot be empty`,
                `empty-${property}`, vscode.DiagnosticSeverity.Warning);
        }
    }

    private validateInFunction(lineIndex: number, line: string): void {
        const match = line.match(/^in function\s+(\w+)$/);
        if (!match) {
            this.addDiagnostic(lineIndex, 0, line.length, 
                'Invalid "in function" syntax. Expected: in function <identifier>',
                'invalid-in-function-syntax', vscode.DiagnosticSeverity.Error);
        } else {
            // Add reference hint
            this.addDiagnostic(lineIndex, 0, line.length, 
                `🔗 Verify function "${match[1]}" exists in .fun files`,
                'function-reference-hint', vscode.DiagnosticSeverity.Information);
        }
    }

    private validateNumericProperty(lineIndex: number, line: string, property: string, range: { min: number, max: number }): void {
        const match = line.match(new RegExp(`^${property}\\s+(\\d+)$`));
        if (!match) {
            this.addDiagnostic(lineIndex, 0, line.length, 
                `Invalid ${property} syntax. Expected: ${property} <number>`,
                `invalid-${property}-syntax`, vscode.DiagnosticSeverity.Error);
        } else {
            const value = parseInt(match[1]);
            if (value < range.min || value > range.max) {
                this.addDiagnostic(lineIndex, 0, line.length, 
                    `${property} must be between ${range.min} and ${range.max}`,
                    `${property}-out-of-range`, vscode.DiagnosticSeverity.Error);
            }
        }
    }

    private validateDetectionProperty(lineIndex: number, line: string): void {
        const detectionMatch = line.match(/^detection\s+(.+)$/);
        if (detectionMatch) {
            const value = detectionMatch[1].trim();
            // Check if it's a numeric value or identifier list
            if (/^\d+$/.test(value)) {
                this.validateNumericProperty(lineIndex, line, 'detection', this.DETECTION_RANGE);
            } else {
                this.validateIdentifierList(lineIndex, line, 'detection');
            }
        } else {
            this.addDiagnostic(lineIndex, 0, line.length, 
                'Invalid detection syntax. Expected: detection <number> or detection <identifier_list>',
                'invalid-detection-syntax', vscode.DiagnosticSeverity.Error);
        }
    }

    private validateRpn(lineIndex: number, line: string): void {
        const match = line.match(/^rpn\s+(.+)$/);
        if (!match) {
            this.addDiagnostic(lineIndex, 0, line.length, 
                'Invalid rpn syntax. Expected: rpn <number> or rpn auto',
                'invalid-rpn-syntax', vscode.DiagnosticSeverity.Error);
        } else {
            const value = match[1].trim();
            if (value !== 'auto' && !/^\d+$/.test(value)) {
                this.addDiagnostic(lineIndex, 0, line.length, 
                    'RPN must be either "auto" or a numeric value',
                    'invalid-rpn-value', vscode.DiagnosticSeverity.Error);
            }
        }
    }

    private validateEnumProperty(lineIndex: number, line: string, property: string, validValues: string[]): void {
        const match = line.match(new RegExp(`^${property}\\s+(.+)$`));
        if (!match) {
            this.addDiagnostic(lineIndex, 0, line.length, 
                `Invalid ${property} syntax. Expected: ${property} <value>`,
                `invalid-${property}-syntax`, vscode.DiagnosticSeverity.Error);
        } else {
            const value = match[1].trim();
            if (!validValues.includes(value)) {
                this.addDiagnostic(lineIndex, 0, line.length, 
                    `Invalid ${property} value: ${value}. Valid values: ${validValues.join(', ')}`,
                    `invalid-${property}-value`, vscode.DiagnosticSeverity.Error);
            }
        }
    }

    private validateFailureModeReferences(lineIndex: number, line: string, property: string): void {
        const match = line.match(new RegExp(`^${property} failuremode\\s+(.+)$`));
        if (!match) {
            this.addDiagnostic(lineIndex, 0, line.length, 
                `Invalid ${property} syntax. Expected: ${property} failuremode <identifier_list>`,
                `invalid-${property}-syntax`, vscode.DiagnosticSeverity.Error);
        } else {
            const identifiers = match[1].split(',').map(id => id.trim());
            for (const identifier of identifiers) {
                if (!/^\w+$/.test(identifier)) {
                    this.addDiagnostic(lineIndex, 0, line.length, 
                        `Invalid failure mode identifier: ${identifier}`,
                        'invalid-failuremode-identifier', vscode.DiagnosticSeverity.Error);
                } else {
                    // Add reference hint
                    this.addDiagnostic(lineIndex, 0, line.length, 
                        `🔗 Verify failure mode "${identifier}" exists in .fma files`,
                        'failuremode-reference-hint', vscode.DiagnosticSeverity.Information);
                }
            }
        }
    }

    private validateIdentifierList(lineIndex: number, line: string, property: string): void {
        const match = line.match(new RegExp(`^${property}\\s+(.+)$`));
        if (!match) {
            this.addDiagnostic(lineIndex, 0, line.length, 
                `Invalid ${property} syntax. Expected: ${property} <identifier_list>`,
                `invalid-${property}-syntax`, vscode.DiagnosticSeverity.Error);
        } else {
            const identifiers = match[1].split(',').map(id => id.trim());
            for (const identifier of identifiers) {
                if (!/^\w+$/.test(identifier)) {
                    this.addDiagnostic(lineIndex, 0, line.length, 
                        `Invalid identifier: ${identifier}`,
                        'invalid-identifier', vscode.DiagnosticSeverity.Error);
                } else if (property === 'detection' || property === 'mitigation') {
                    // Add reference hint for controls
                    this.addDiagnostic(lineIndex, 0, line.length, 
                        `🔗 Verify control "${identifier}" exists in .fmc files`,
                        'control-reference-hint', vscode.DiagnosticSeverity.Information);
                }
            }
        }
    }
} 