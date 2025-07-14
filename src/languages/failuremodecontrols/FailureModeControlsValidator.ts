import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';

export class FailureModeControlsValidator extends BaseValidator {
    private readonly EFFECTIVENESS_LEVELS = ['high', 'medium', 'low'];
    private readonly COST_LEVELS = ['low', 'medium', 'high'];
    private readonly COMPLEXITY_LEVELS = ['simple', 'moderate', 'complex'];
    private readonly SCOPE_TYPES = ['internal', 'external'];
    private readonly FREQUENCY_TYPES = ['continuous', 'periodic', 'monthly', 'quarterly'];
    private readonly DETECT_TIME_TYPES = ['immediate', 'delayed'];
    private readonly RESPONSE_TIME_TYPES = ['immediate', 'delayed'];
    private readonly COVERAGE_TYPES = ['complete', 'partial'];
    private readonly INDEPENDENCE_LEVELS = ['high', 'medium', 'low'];
    private readonly MATURITY_LEVELS = ['mature', 'developing', 'research'];
    private readonly ASIL_LEVELS = ['QM', 'A', 'B', 'C', 'D'];
    private readonly DETECTION_RATING_RANGE = { min: 1, max: 10 };
    private readonly PERCENTAGE_RANGE = { min: 0, max: 100 };

    constructor(languageConfig: LanguageConfig) {
        super(languageConfig);
    }

    protected getDefinitionKeywords(): string[] {
        return ['controlmeasures', 'prevention', 'detection', 'mitigation'];
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('//')) return;

        // Validate def controlmeasures syntax
        if (trimmedLine.startsWith('def controlmeasures')) {
            this.validateControlMeasuresDefinition(lineIndex, trimmedLine);
        }
        // Validate def prevention/detection/mitigation syntax
        else if (trimmedLine.startsWith('def prevention')) {
            this.validateMeasureDefinition(lineIndex, trimmedLine, 'prevention');
        } else if (trimmedLine.startsWith('def detection')) {
            this.validateMeasureDefinition(lineIndex, trimmedLine, 'detection');
        } else if (trimmedLine.startsWith('def mitigation')) {
            this.validateMeasureDefinition(lineIndex, trimmedLine, 'mitigation');
        }
        // Validate properties
        else if (trimmedLine.startsWith('name ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'name');
        } else if (trimmedLine.startsWith('description ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'description');
        } else if (trimmedLine.startsWith('implementation ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'implementation');
        } else if (trimmedLine.startsWith('verification ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'verification');
        } else if (trimmedLine.startsWith('responsibility ')) {
            this.validateStringProperty(lineIndex, trimmedLine, 'responsibility');
        } else if (trimmedLine.startsWith('effectiveness ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'effectiveness', this.EFFECTIVENESS_LEVELS);
        } else if (trimmedLine.startsWith('cost ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'cost', this.COST_LEVELS);
        } else if (trimmedLine.startsWith('complexity ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'complexity', this.COMPLEXITY_LEVELS);
        } else if (trimmedLine.startsWith('scope ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'scope', this.SCOPE_TYPES);
        } else if (trimmedLine.startsWith('frequency ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'frequency', this.FREQUENCY_TYPES);
        } else if (trimmedLine.startsWith('detecttime ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'detecttime', this.DETECT_TIME_TYPES);
        } else if (trimmedLine.startsWith('responsetime ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'responsetime', this.RESPONSE_TIME_TYPES);
        } else if (trimmedLine.startsWith('coverage ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'coverage', this.COVERAGE_TYPES);
        } else if (trimmedLine.startsWith('independence ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'independence', this.INDEPENDENCE_LEVELS);
        } else if (trimmedLine.startsWith('maturity ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'maturity', this.MATURITY_LEVELS);
        } else if (trimmedLine.startsWith('asil ')) {
            this.validateEnumProperty(lineIndex, trimmedLine, 'asil', this.ASIL_LEVELS);
        } else if (trimmedLine.startsWith('detectionrating ')) {
            this.validateNumericProperty(lineIndex, trimmedLine, 'detectionrating', this.DETECTION_RATING_RANGE);
        } else if (trimmedLine.startsWith('occurrencereduction ')) {
            this.validateNumericProperty(lineIndex, trimmedLine, 'occurrencereduction', this.PERCENTAGE_RANGE);
        } else if (trimmedLine.startsWith('severityreduction ')) {
            this.validateNumericProperty(lineIndex, trimmedLine, 'severityreduction', this.PERCENTAGE_RANGE);
        } else if (trimmedLine.startsWith('diagnosticcoverage ')) {
            this.validateNumericProperty(lineIndex, trimmedLine, 'diagnosticcoverage', this.PERCENTAGE_RANGE);
        } else if (trimmedLine.startsWith('depends measure ')) {
            this.validateMeasureDependencies(lineIndex, trimmedLine);
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        const lines = document.getText().split('\n');
        let hasControlMeasures = false;
        let controlMeasuresCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('def controlmeasures')) {
                hasControlMeasures = true;
                controlMeasuresCount++;
                if (controlMeasuresCount > 1) {
                    this.addDiagnostic(i, 0, line.length, 
                        'Only one control measures definition is allowed per file',
                        'multiple-controlmeasures-definitions', vscode.DiagnosticSeverity.Error);
                }
            }
        }

        if (!hasControlMeasures) {
            this.addDiagnostic(0, 0, 0, 
                'File must contain at least one control measures definition',
                'no-controlmeasures-found', vscode.DiagnosticSeverity.Error);
        }
    }

    private validateControlMeasuresDefinition(lineIndex: number, trimmedLine: string): void {
        const match = trimmedLine.match(/^def controlmeasures\s+(\w+)$/);
        if (!match) {
            this.addDiagnostic(lineIndex, 0, trimmedLine.length, 
                'Invalid control measures definition syntax. Expected: def controlmeasures <identifier>',
                'invalid-controlmeasures-syntax', vscode.DiagnosticSeverity.Error);
        }
    }

    private validateMeasureDefinition(lineIndex: number, trimmedLine: string, measureType: string): void {
        const match = trimmedLine.match(new RegExp(`^def ${measureType}\\s+(\\w+)$`));
        if (!match) {
            this.addDiagnostic(lineIndex, 0, trimmedLine.length, 
                `Invalid ${measureType} definition syntax. Expected: def ${measureType} <identifier>`,
                `invalid-${measureType}-syntax`, vscode.DiagnosticSeverity.Error);
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

    private validateMeasureDependencies(lineIndex: number, line: string): void {
        const match = line.match(/^depends measure\s+(.+)$/);
        if (!match) {
            this.addDiagnostic(lineIndex, 0, line.length, 
                'Invalid depends measure syntax. Expected: depends measure <identifier_list>',
                'invalid-depends-measure-syntax', vscode.DiagnosticSeverity.Error);
        } else {
            const identifiers = match[1].split(',').map(id => id.trim());
            for (const identifier of identifiers) {
                if (!/^\w+$/.test(identifier)) {
                    this.addDiagnostic(lineIndex, 0, line.length, 
                        `Invalid measure identifier: ${identifier}`,
                        'invalid-measure-identifier', vscode.DiagnosticSeverity.Error);
                } else {
                    // Add reference hint
                    this.addDiagnostic(lineIndex, 0, line.length, 
                        `🔗 Verify measure "${identifier}" exists in .fmc files`,
                        'measure-reference-hint', vscode.DiagnosticSeverity.Information);
                }
            }
        }
    }
} 