import * as vscode from 'vscode';

export class SylangHoverProvider implements vscode.HoverProvider {
    // private keywords: string[];
    private documentationMap: Map<string, vscode.MarkdownString>;

    constructor(_keywords: string[]) {
        // this.keywords = keywords;
        this.documentationMap = this.createDocumentationMap();
    }

    private createDocumentationMap(): Map<string, vscode.MarkdownString> {
        const map = new Map<string, vscode.MarkdownString>();

        // Comprehensive documentation for Sylang keywords
        const docs = {
            'productline': '**Product Line Definition**\n\nDefines a family of related products with shared and variable features.\n\n*Syntax:* `productline <name>`',
            'systemfunctions': '**System Functions Container**\n\nContainer for defining system-level functions and their relationships.\n\n*Syntax:* `systemfunctions <name>`',
            'systemfeatures': '**System Features Container**\n\nContainer for defining feature models with variability.\n\n*Syntax:* `systemfeatures <name>`',
            'function': '**def function Definition**\n\nDefines a system def function with properties and relationships.\n\n*Properties:* name, description, owner, tags, safetylevel, enables',
            'feature': '**Feature Definition**\n\nDefines a feature in the product line with variability type.\n\n*Types:* mandatory, optional, alternative, or',
            'mandatory': '**Mandatory Feature**\n\nFeature that must be present in all product variants.\n\n*Usage:* `feature <name> mandatory`',
            'optional': '**Optional Feature**\n\nFeature that may or may not be present in product variants.\n\n*Usage:* `feature <name> optional`',
            'alternative': '**Alternative Features**\n\nExactly one feature from the group must be selected.\n\n*Usage:* `feature <name> alternative`',
            'or': '**Or-Features**\n\nAt least one feature from the group must be selected.\n\n*Usage:* `feature <name> or`',
            'name': '**Display Name**\n\nHuman-readable name for the element.\n\n*Format:* `name "Display Name"`',
            'description': '**Description**\n\nDetailed description of the element.\n\n*Format:* `description "Detailed text"`',
            'owner': '**Owner**\n\nTeam or person responsible for the element.\n\n*Format:* `owner "Team Name"`',
            'tags': '**Tags**\n\nCategorization tags for grouping and filtering.\n\n*Format:* `tags "tag1", "tag2", "tag3"`',
            'safetylevel': '**Safety Level**\n\nISO 26262 Automotive Safety Integrity Level.\n\n*Values:* ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM\n\n- **ASIL-D**: Highest integrity level\n- **ASIL-C**: High integrity level\n- **ASIL-B**: Medium integrity level\n- **ASIL-A**: Low integrity level\n- **QM**: Quality Management (no ASIL)',
            'enables': '**Enables Relationship**\n\nDefines what features or functions this element enables.\n\n*Format:* `enables Feature1, Feature2`',
            'domain': '**Domain**\n\nApplication domain or industry sector.\n\n*Examples:* automotive, aerospace, industrial',
            'compliance': '**Compliance Standards**\n\nStandards and regulations this element complies with.\n\n*Examples:* ISO 26262, ASPICE, ISO 21448',
            'firstrelease': '**First Release**\n\nDate of the first release or availability.\n\n*Format:* `firstrelease "YYYY-MM-DD"`',
            'region': '**Region**\n\nGeographic regions where this element applies.\n\n*Examples:* Global, Europe, North America, Asia',
            'ASIL-A': '**ASIL-A (Automotive Safety Integrity Level A)**\n\nLowest automotive safety integrity level according to ISO 26262.\n\n*Risk:* Low risk of harm\n*Requirements:* Basic safety measures',
            'ASIL-B': '**ASIL-B (Automotive Safety Integrity Level B)**\n\nMedium-low automotive safety integrity level according to ISO 26262.\n\n*Risk:* Medium-low risk of harm\n*Requirements:* Enhanced safety measures',
            'ASIL-C': '**ASIL-C (Automotive Safety Integrity Level C)**\n\nMedium-high automotive safety integrity level according to ISO 26262.\n\n*Risk:* Medium-high risk of harm\n*Requirements:* Rigorous safety measures',
            'ASIL-D': '**ASIL-D (Automotive Safety Integrity Level D)**\n\nHighest automotive safety integrity level according to ISO 26262.\n\n*Risk:* High risk of harm\n*Requirements:* Most stringent safety measures',
            'QM': '**QM (Quality Management)**\n\nNo ASIL level required, managed through quality management.\n\n*Risk:* Very low or no safety risk\n*Requirements:* Standard quality processes',
            'item': '**Item Definition**\n\nDefines the system item being analyzed in the hazard analysis.',
            'scenario': '**Operational Scenario**\n\nDefines a specific operational scenario.',
            'condition': '**Operational Condition**\n\nDefines an operational condition.',
            'vehiclestate': '**Vehicle State**\n\nDefines a vehicle state.',
            'drivingstate': '**Driving State**\n\nDefines a driving state.',
            'environment': '**Environment**\n\nDefines an environmental condition.',
            'principle': '**Safety Principle**\n\nDefines a safety principle.',
            'assumption': '**Assumption**\n\nDefines an assumption of use.',
            'misuse': '**Misuse Case**\n\nDefines a foreseeable misuse case.',
            'boundary': '**System Boundary**\n\nDefines a system boundary.',
            'operationalscenarios': '**Operational Scenarios Section**\n\nContainer for operational scenarios.',
            'operationalconditions': '**Operational Conditions Sub-section**\n\nContainer for operational conditions.',
            'vehiclestates': '**Vehicle States Sub-section**\n\nContainer for vehicle states.',
            'driverstates': '**Driver States Sub-section**\n\nContainer for driver states.',
            'environments': '**Environments Sub-section**\n\nContainer for environments.',
            'safetyconcept': '**Safety Concept Section**\n\nContainer for safety concept elements.',
            'safetystrategy': '**Safety Strategy Sub-section**\n\nContainer for safety principles.',
            'assumptionsofuse': '**Assumptions of Use**\n\nContainer for assumptions.',
            'foreseeablemisuse': '**Foreseeable Misuse**\n\nContainer for misuse cases.',
            'subsystems': '**Subsystems**\n\nList of subsystems.',
            'systemboundaries': '**System Boundaries**\n\nContainer for includes/excludes boundaries.',
            'includes': '**Included Boundaries**\n\nContainer for included system boundaries.',
            'excludes': '**Excluded Boundaries**\n\nContainer for excluded system boundaries.',
            'range': '**Range Property**\n\nDefines a range for a condition.',
            'impact': '**Impact Property**\n\nDefines the impact of a condition.',
            'standard': '**Standard Property**\n\nDefines a standard reference.',
            'characteristics': '**Characteristics Property**\n\nDefines characteristics of a state.',
            'conditions': '**Conditions Property**\n\nList of conditions for an environment.',
            'driverstate': '**Driver State Reference**\n\nReferences a driver state.',
            'category': '**Hazard Category**\n\nDefines a hazard category.',
            'hazard': '**Hazard Definition**\n\nDefines a specific hazard.',
            'subsystem': '**Subsystem Reference**\n\nReferences a subsystem for hazards.',
            'methodology': '**Methodology**\n\nDefines methodologies used.',
            'cause': '**Cause**\n\nDescribes the cause of the hazard.',
            'effect': '**Effect**\n\nDescribes the effect of the hazard.',
            'functions': '**Affected Functions**\n\nList of affected functions.',
            'mitigation': '**Mitigation**\n\nDescribes mitigation for the hazard.',
            'severity': '**Severity**\n\nSeverity level of the category.',
            
            // .sgl keywords
            'safetygoals': '**Safety Goals Definition**\n\nDefines the safety goals for the system.\n\n*Usage:* `def safetygoals <identifier>`',
            'goal': '**Goal Definition**\n\nDefines a specific safety goal.\n\n*Properties:* name, description, hazard, scenario, asil',
            'measure': '**Measure Definition**\n\nDefines a safety measure.\n\n*Properties:* description, enabledby function',
            'safetymeasures': '**Safety Measures Section**\n\nContainer for safety measures that implement the safety goal.',
            'enabledby': '**Enabled By Property (deprecated)**\n\nUse "enabledby function" instead to specify functions that enable the measure.',
            'hazardidentification': '**Hazard Identification Reference**\n\nReferences hazard identification analysis.\n\n*Format:* `hazardidentification <HazardID>`',
            'riskassessment': '**Risk Assessment Reference**\n\nReferences risk assessment analysis.\n\n*Format:* `riskassessment <RiskID>`',
            'asil': '**ASIL Level**\n\nAutomotive Safety Integrity Level for the goal.\n\n*Values:* A, B, C, D',
            
            // .req keywords
            'reqsection': '**Requirements Section Definition**\n\nDefines a section of functional safety requirements.\n\n*Usage:* `def reqsection <identifier>`',
            'requirement': '**Requirement Definition**\n\nDefines a functional safety requirement.\n\n*Usage:* `def requirement <identifier>`\n\n*Properties:* name, description, type, source, derivedfrom, asil, rationale, allocatedto, verificationcriteria, status',
            'type': '**Requirement Type**\n\nType of the requirement.\n\n*Valid values:* functionalsafety, functional, non-functional, performance, standards, legal, system, software, electronics, mechanics, test',
            'source': '**Requirement Source**\n\nSource of the requirement.\n\n*Valid values:* stakeholder, internal, supplier, customer',
            'derivedfrom': '**Derived From Property**\n\nLinks to safety goals or other sources.\n\n*Usage:* `derivedfrom safetygoal SG_ID`',
            'rationale': '**Rationale Property**\n\nExplanation for the requirement.\n\n*Usage:* `rationale "explanation text"`',
            'allocatedto': '**Allocated To Property**\n\nAllocation to subsystems or components.\n\n*Usage:* `allocatedto subsystem Component1, Component2`',
            'verificationcriteria': '**Verification Criteria Property**\n\nCriteria for verifying the requirement.\n\n*Usage:* `verificationcriteria "criteria text"`',
            'status': '**Status Property**\n\nStatus of the requirement.\n\n*Valid values:* draft, review, approved',
            
            // Additional subsystem-specific keyword
            'implements': '**Implements Property**\n\nFunctions implemented by the subsystem.\n\n*Usage:* `implements function Function1, Function2`'
        };

        Object.entries(docs).forEach(([keyword, documentation]) => {
            map.set(keyword, new vscode.MarkdownString(documentation));
        });

        // Add special handling for multi-word keywords
        map.set('enabledby function', new vscode.MarkdownString('**Enabled By Function Property**\n\nSpecifies the functions that enable this safety measure.\n\n*Format:* `enabledby function Function1, Function2`\n\n*Example:* `enabledby function PowerElectronicsController, MotorControlAlgorithmEngine`'));

        return map;
    }

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return;
        }

        const word = document.getText(range);
        
        // Check for multi-word keywords like "enabledby function"
        const line = document.lineAt(position.line);
        const lineText = line.text;
        
        // Check if we're hovering over "enabledby" and it's followed by "function"
        if (word === 'enabledby' && lineText.includes('enabledby function')) {
            const enabledbyIndex = lineText.indexOf('enabledby function');
            const wordStartIndex = range.start.character;
            
            // If we're hovering over the "enabledby" part of "enabledby function"
            if (enabledbyIndex === wordStartIndex) {
                const multiWordDoc = this.documentationMap.get('enabledby function');
                if (multiWordDoc) {
                    // Extend range to include "function" word
                    const extendedRange = new vscode.Range(
                        range.start,
                        new vscode.Position(range.end.line, range.end.character + 9) // " function".length
                    );
                    return new vscode.Hover(multiWordDoc, extendedRange);
                }
            }
        }

        const documentation = this.documentationMap.get(word);

        if (documentation) {
            return new vscode.Hover(documentation, range);
        }

        // Check if it's a safety level
        if (['ASIL-A', 'ASIL-B', 'ASIL-C', 'ASIL-D', 'QM'].includes(word)) {
            const safetyDoc = this.documentationMap.get(word);
            if (safetyDoc) {
                return new vscode.Hover(safetyDoc, range);
            }
        }

        return;
    }
}