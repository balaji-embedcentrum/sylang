import * as vscode from 'vscode';
import { BaseValidator } from '../base/BaseValidator';
import { LanguageConfig } from '../../config/LanguageConfigs';
import { SymbolManager } from '../../core/SymbolManager';

export class TestValidator extends BaseValidator {
    constructor(languageConfig: LanguageConfig, symbolManager: SymbolManager) {
        super(languageConfig, symbolManager);
    }

    protected getDefinitionKeywords(): string[] {
        return ['testsuite', 'testcase'];
    }

    protected async validateLanguageSpecificRules(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();

        // Validate def testsuite syntax
        if (trimmedLine.startsWith('def testsuite')) {
            await this.validateTestsuiteDefinition(lineIndex, trimmedLine);
        }
        // Validate def testcase syntax
        else if (trimmedLine.startsWith('def testcase')) {
            await this.validateTestcaseDefinition(lineIndex, trimmedLine);
        }

        // Validate test-specific enum properties
        if (trimmedLine.startsWith('testtype ')) {
            await this.validateTesttypeProperty(lineIndex, trimmedLine);
        }
        if (trimmedLine.startsWith('coverage ')) {
            await this.validateCoverageProperty(lineIndex, trimmedLine);
        }
        if (trimmedLine.startsWith('method ')) {
            await this.validateMethodProperty(lineIndex, trimmedLine);
        }
        if (trimmedLine.startsWith('testresult ')) {
            await this.validateTestresultProperty(lineIndex, trimmedLine);
        }
        if (trimmedLine.startsWith('priority ')) {
            await this.validatePriorityProperty(lineIndex, trimmedLine);
        }

        // Validate ASIL property (reusing pattern from other validators)
        if (trimmedLine.startsWith('asil ')) {
            await this.validateAsilProperty(lineIndex, trimmedLine);
        }

        // Validate cross-file references
        if (trimmedLine.startsWith('verifies requirement')) {
            await this.validateVerifiesRequirementReferences(document, lineIndex, line);
        }
        if (trimmedLine.startsWith('exercises ')) {
            await this.validateExercisesReferences(document, lineIndex, line);
        }

        // Validate step syntax
        if (trimmedLine.startsWith('step ')) {
            await this.validateStepDefinition(lineIndex, trimmedLine);
        }
    }

    protected async validateDocumentLevelRules(document: vscode.TextDocument): Promise<void> {
        // Check that file starts with def testsuite
        await this.validateFileStartsWithTestsuite(document);
        
        // Check for required testsuite properties
        await this.validateTestsuiteRequiredProperties(document);
    }

    private async validateTestsuiteDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const testsuiteMatch = trimmedLine.match(/^def\s+testsuite\s+([A-Za-z_][A-Za-z0-9_]*)$/);
        if (!testsuiteMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid testsuite definition. Expected format: def testsuite <TestsuiteIdentifier>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-testsuite-definition';
            this.diagnostics.push(diagnostic);
            return;
        }

        const identifier = testsuiteMatch[1];
        
        // Validate PascalCase identifier
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            const identifierStart = trimmedLine.indexOf(identifier);
            const range = new vscode.Range(lineIndex, identifierStart, lineIndex, identifierStart + identifier.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Testsuite identifier "${identifier}" should use PascalCase (e.g., "EPB_IntegrationTests")`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-testsuite-identifier';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateTestcaseDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const testcaseMatch = trimmedLine.match(/^def\s+testcase\s+([A-Za-z_][A-Za-z0-9_]*)$/);
        if (!testcaseMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid testcase definition. Expected format: def testcase <TestcaseIdentifier>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-testcase-definition';
            this.diagnostics.push(diagnostic);
            return;
        }

        const identifier = testcaseMatch[1];
        
        // Validate identifier format (TC_ prefix recommended)
        if (!/^[A-Z][A-Za-z0-9_]*$/.test(identifier)) {
            const identifierStart = trimmedLine.indexOf(identifier);
            const range = new vscode.Range(lineIndex, identifierStart, lineIndex, identifierStart + identifier.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Testcase identifier "${identifier}" should use PascalCase (e.g., "TC_EPB_001")`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-testcase-identifier';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateTesttypeProperty(lineIndex: number, trimmedLine: string): Promise<void> {
        const testtypeMatch = trimmedLine.match(/^testtype\s+(.+)$/);
        if (!testtypeMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid testtype property. Expected format: testtype <type>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-testtype-property';
            this.diagnostics.push(diagnostic);
            return;
        }

        const testtypeValue = testtypeMatch[1]?.trim();
        if (!testtypeValue) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'testtype value is required',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-testtype-value';
            this.diagnostics.push(diagnostic);
            return;
        }

        const validTesttypeValues = ['unit', 'integration', 'system', 'acceptance', 'regression', 'smoke'];
        
        if (!validTesttypeValues.includes(testtypeValue)) {
            const range = new vscode.Range(lineIndex, trimmedLine.indexOf(testtypeValue), lineIndex, trimmedLine.indexOf(testtypeValue) + testtypeValue.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid testtype value '${testtypeValue}'. Valid values are: ${validTesttypeValues.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-testtype-value';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateCoverageProperty(lineIndex: number, trimmedLine: string): Promise<void> {
        const coverageMatch = trimmedLine.match(/^coverage\s+(.+)$/);
        if (!coverageMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid coverage property. Expected format: coverage <type>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-coverage-property';
            this.diagnostics.push(diagnostic);
            return;
        }

        const coverageValue = coverageMatch[1]?.trim();
        if (!coverageValue) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'coverage value is required',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-coverage-value';
            this.diagnostics.push(diagnostic);
            return;
        }

        const validCoverageValues = ['statement', 'branch', 'mcdc', 'requirement', 'function'];
        
        if (!validCoverageValues.includes(coverageValue)) {
            const range = new vscode.Range(lineIndex, trimmedLine.indexOf(coverageValue), lineIndex, trimmedLine.indexOf(coverageValue) + coverageValue.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid coverage value '${coverageValue}'. Valid values are: ${validCoverageValues.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-coverage-value';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateMethodProperty(lineIndex: number, trimmedLine: string): Promise<void> {
        const methodMatch = trimmedLine.match(/^method\s+(.+)$/);
        if (!methodMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid method property. Expected format: method <type>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-method-property';
            this.diagnostics.push(diagnostic);
            return;
        }

        const methodValue = methodMatch[1]?.trim();
        if (!methodValue) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'method value is required',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-method-value';
            this.diagnostics.push(diagnostic);
            return;
        }

        const validMethodValues = ['manual', 'automated', 'hil', 'sil', 'mil', 'pil'];
        
        if (!validMethodValues.includes(methodValue)) {
            const range = new vscode.Range(lineIndex, trimmedLine.indexOf(methodValue), lineIndex, trimmedLine.indexOf(methodValue) + methodValue.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid method value '${methodValue}'. Valid values are: ${validMethodValues.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-method-value';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateTestresultProperty(lineIndex: number, trimmedLine: string): Promise<void> {
        const testresultMatch = trimmedLine.match(/^testresult\s+(.+)$/);
        if (!testresultMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid testresult property. Expected format: testresult <result>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-testresult-property';
            this.diagnostics.push(diagnostic);
            return;
        }

        const testresultValue = testresultMatch[1]?.trim();
        if (!testresultValue) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'testresult value is required',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-testresult-value';
            this.diagnostics.push(diagnostic);
            return;
        }

        const validTestresultValues = ['pass', 'fail', 'pending', 'inconclusive'];
        
        if (!validTestresultValues.includes(testresultValue)) {
            const range = new vscode.Range(lineIndex, trimmedLine.indexOf(testresultValue), lineIndex, trimmedLine.indexOf(testresultValue) + testresultValue.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid testresult value '${testresultValue}'. Valid values are: ${validTestresultValues.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-testresult-value';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validatePriorityProperty(lineIndex: number, trimmedLine: string): Promise<void> {
        const priorityMatch = trimmedLine.match(/^priority\s+(.+)$/);
        if (!priorityMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid priority property. Expected format: priority <level>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-priority-property';
            this.diagnostics.push(diagnostic);
            return;
        }

        const priorityValue = priorityMatch[1]?.trim();
        if (!priorityValue) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'priority value is required',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-priority-value';
            this.diagnostics.push(diagnostic);
            return;
        }

        const validPriorityValues = ['critical', 'high', 'medium', 'low'];
        
        if (!validPriorityValues.includes(priorityValue)) {
            const range = new vscode.Range(lineIndex, trimmedLine.indexOf(priorityValue), lineIndex, trimmedLine.indexOf(priorityValue) + priorityValue.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid priority value '${priorityValue}'. Valid values are: ${validPriorityValues.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-priority-value';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateAsilProperty(lineIndex: number, trimmedLine: string): Promise<void> {
        const asilMatch = trimmedLine.match(/^asil\s+(.+)$/);
        if (!asilMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid asil property. Expected format: asil <level>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-asil-property';
            this.diagnostics.push(diagnostic);
            return;
        }

        const asilValue = asilMatch[1]?.trim();
        if (!asilValue) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'asil value is required',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'missing-asil-value';
            this.diagnostics.push(diagnostic);
            return;
        }

        const validAsilValues = ['A', 'B', 'C', 'D', 'QM'];
        
        if (!validAsilValues.includes(asilValue)) {
            const range = new vscode.Range(lineIndex, trimmedLine.indexOf(asilValue), lineIndex, trimmedLine.indexOf(asilValue) + asilValue.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Invalid asil value '${asilValue}'. Valid values are: ${validAsilValues.join(', ')}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-asil-value';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateVerifiesRequirementReferences(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();
        
        const verifiesMatch = trimmedLine.match(/^verifies\s+requirement\s+(.+)$/);
        if (!verifiesMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid verifies syntax. Expected format: verifies requirement <RequirementList>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-verifies-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const requirementsText = verifiesMatch[1];
        if (!requirementsText) return;
        
        const requirements = requirementsText.split(',').map(r => r.trim());

        // Validate requirement identifiers format and cross-file references
        for (const requirement of requirements) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(requirement)) {
                const requirementStart = line.indexOf(requirement);
                if (requirementStart !== -1) {
                    const range = new vscode.Range(lineIndex, requirementStart, lineIndex, requirementStart + requirement.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Invalid requirement identifier "${requirement}" - should use PascalCase`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'invalid-requirement-identifier';
                    this.diagnostics.push(diagnostic);
                }
            }

            // Use import-aware validation for requirement references
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(requirement)) continue;
            if (!this.symbolManager.isSymbolAvailable(requirement, document.uri.toString())) {
                const requirementStart = line.indexOf(requirement);
                if (requirementStart !== -1) {
                    const range = new vscode.Range(lineIndex, requirementStart, lineIndex, requirementStart + requirement.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Undefined requirement '${requirement}' - missing 'use requirements ${requirement}' import or definition`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-requirement-reference';
                    this.diagnostics.push(diagnostic);
                }
            }
        }
    }

    private async validateExercisesReferences(
        document: vscode.TextDocument,
        lineIndex: number,
        line: string
    ): Promise<void> {
        const trimmedLine = line.trim();
        
        const exercisesMatch = trimmedLine.match(/^exercises\s+(.+)$/);
        if (!exercisesMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid exercises syntax. Expected format: exercises <FunctionList>',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-exercises-syntax';
            this.diagnostics.push(diagnostic);
            return;
        }

        const functionsText = exercisesMatch[1];
        if (!functionsText) return;
        
        const functions = functionsText.split(',').map(f => f.trim());

        // Validate function identifiers format and cross-file references
        for (const func of functions) {
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(func)) {
                const funcStart = line.indexOf(func);
                if (funcStart !== -1) {
                    const range = new vscode.Range(lineIndex, funcStart, lineIndex, funcStart + func.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Invalid function identifier "${func}" - should use PascalCase`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'invalid-function-identifier';
                    this.diagnostics.push(diagnostic);
                }
            }

            // Use import-aware validation for function references
            if (!/^[A-Z][A-Za-z0-9_]*$/.test(func)) continue;
            if (!this.symbolManager.isSymbolAvailable(func, document.uri.toString())) {
                const funcStart = line.indexOf(func);
                if (funcStart !== -1) {
                    const range = new vscode.Range(lineIndex, funcStart, lineIndex, funcStart + func.length);
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Undefined function '${func}' - missing 'use functiongroup ${func}' import or definition`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'undefined-function-reference';
                    this.diagnostics.push(diagnostic);
                }
            }
        }
    }

    private async validateStepDefinition(lineIndex: number, trimmedLine: string): Promise<void> {
        const stepMatch = trimmedLine.match(/^step\s+([A-Za-z0-9_]+)\s+"(.+)"$/);
        if (!stepMatch) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Invalid step definition. Expected format: step <StepId> "description"',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'invalid-step-definition';
            this.diagnostics.push(diagnostic);
            return;
        }

        const stepId = stepMatch[1];
        const stepDescription = stepMatch[2];

        // Validate step identifier format
        if (!/^[A-Z][A-Z0-9_]*$/.test(stepId)) {
            const stepIdStart = trimmedLine.indexOf(stepId);
            const range = new vscode.Range(lineIndex, stepIdStart, lineIndex, stepIdStart + stepId.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Step identifier "${stepId}" should use ALL_CAPS format (e.g., "STEP_001")`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'step-identifier-style';
            this.diagnostics.push(diagnostic);
        }

        // Validate step description is not empty
        if (!stepDescription || stepDescription.trim().length === 0) {
            const range = new vscode.Range(lineIndex, 0, lineIndex, trimmedLine.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Step description cannot be empty',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'empty-step-description';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateFileStartsWithTestsuite(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const lines = text.split('\n');
        
        // Skip use statements, comments, and empty lines
        let foundNonImportLine = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('//') || line.startsWith('/*')) {
                continue; // Skip empty lines and comments
            }
            
            if (line.startsWith('use ')) {
                continue; // Skip import statements
            }
            
            foundNonImportLine = true;
            
            if (!line.startsWith('def testsuite')) {
                const range = new vscode.Range(i, 0, i, lines[i].length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    'Test files must start with "def testsuite <identifier>" (after any use statements)',
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'missing-testsuite-definition';
                this.diagnostics.push(diagnostic);
            }
            break;
        }
        
        if (!foundNonImportLine) {
            const range = new vscode.Range(0, 0, 0, 0);
            const diagnostic = new vscode.Diagnostic(
                range,
                'Test files must contain a testsuite definition',
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = 'empty-test-file';
            this.diagnostics.push(diagnostic);
        }
    }

    private async validateTestsuiteRequiredProperties(document: vscode.TextDocument): Promise<void> {
        const text = document.getText();
        const requiredProperties = ['name', 'description', 'owner', 'testtype', 'coverage', 'method'];
        const foundProperties = new Set<string>();

        const lines = text.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            for (const prop of requiredProperties) {
                if (trimmedLine.startsWith(`${prop} `)) {
                    foundProperties.add(prop);
                }
            }
        }

        for (const requiredProp of requiredProperties) {
            if (!foundProperties.has(requiredProp)) {
                const range = new vscode.Range(0, 0, 0, 0);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Missing required testsuite property: ${requiredProp}`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.code = 'missing-required-property';
                this.diagnostics.push(diagnostic);
            }
        }
    }
} 