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
            'function': '**Function Definition**\n\nDefines a system function with properties and relationships.\n\n*Properties:* name, description, owner, tags, safetylevel, enables',
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
            'QM': '**QM (Quality Management)**\n\nNo ASIL level required, managed through quality management.\n\n*Risk:* Very low or no safety risk\n*Requirements:* Standard quality processes'
        };

        Object.entries(docs).forEach(([keyword, documentation]) => {
            map.set(keyword, new vscode.MarkdownString(documentation));
        });

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