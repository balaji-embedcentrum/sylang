import * as vscode from 'vscode';

interface CompletionContext {
    type: 'top-level' | 'after-systemfeatures' | 'after-productline' | 'inside-feature' | 'inside-itm' | 'inside-def' | 'inside-haz' | 'inside-rsk' | 'inside-sgl' | 'inside-req' | 'inside-sub' | 'inside-sys' | 'inside-fun';
    parentKeyword: string | null;
    indentLevel: number;
}

export class SylangCompletionProvider implements vscode.CompletionItemProvider {
    private templates: Map<string, vscode.CompletionItem> = new Map();
    private keywords: string[];
    private languageId: string;

    constructor(languageId: string, keywords: string[]) {
        this.languageId = languageId;
        this.keywords = keywords;
        this.createTemplates();
    }

    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        
        const line = document.lineAt(position);
        const linePrefix = line.text.substring(0, position.character);
        const trimmedPrefix = linePrefix.trim();
        
        // Get context from current line and previous lines
        const currentContext = this.getCompletionContext(document, position);
        
        // Get Sylang-specific completions based on context
        const completions = this.getSylangCompletions(trimmedPrefix, currentContext);
        
        // Prioritize snippet completions for tab navigation
        completions.forEach(item => {
            if (item.insertText instanceof vscode.SnippetString) {
                item.kind = vscode.CompletionItemKind.Snippet;
                // Ensure snippets appear first
                if (!item.sortText || !item.sortText.startsWith('0_')) {
                    item.sortText = `0_${item.label}`;
                }
            }
        });
        
        // Return as completion list to override other providers
        return new vscode.CompletionList(completions, false);
    }

    private getCompletionContext(document: vscode.TextDocument, position: vscode.Position): CompletionContext {
        const line = document.lineAt(position);
        
        // Check if we're after a top-level keyword
        if (position.line > 0) {
            for (let i = position.line - 1; i >= 0; i--) {
                const prevLine = document.lineAt(i);
                const prevText = prevLine.text.trim();
                
                if (prevText.length === 0 || prevText.startsWith('//')) {
                    continue; // Skip empty lines and comments
                }
                
                // Check for systemfeatures context
                if (prevText.startsWith('systemfeatures') && this.getIndentLevel(line.text) > 0) {
                    return { 
                        type: 'after-systemfeatures',
                        parentKeyword: 'systemfeatures',
                        indentLevel: this.getIndentLevel(line.text)
                    };
                }
                
                // Check for productline context
                if (prevText.startsWith('productline') && this.getIndentLevel(line.text) > 0) {
                    return { 
                        type: 'after-productline',
                        parentKeyword: 'productline',
                        indentLevel: this.getIndentLevel(line.text)
                    };
                }
                
                // Check for feature context
                if (prevText.startsWith('feature') && this.getIndentLevel(line.text) > this.getIndentLevel(prevLine.text)) {
                    return { 
                        type: 'inside-feature',
                        parentKeyword: 'feature',
                        indentLevel: this.getIndentLevel(line.text)
                    };
                }

                // Check for .itm specific contexts
                if (this.languageId === 'sylang-safety') {
                    if (prevText.startsWith('def ') && this.getIndentLevel(line.text) > this.getIndentLevel(prevLine.text)) {
                        const defType = prevText.split(' ')[1];
                        return {
                            type: 'inside-def',
                            parentKeyword: defType || null,
                            indentLevel: this.getIndentLevel(line.text)
                        };
                    }
                    
                    // Add for .haz files
                    if (document.fileName.endsWith('.haz')) {
                        if (['hazardcategories', 'subsystemhazards', 'systemlevelhazards', 'environmentalhazards', 'usagehazards'].includes(prevText) && this.getIndentLevel(line.text) > 0) {
                            return {
                                type: 'inside-haz',
                                parentKeyword: prevText,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                    }

                    // Add for .rsk files
                    if (document.fileName.endsWith('.rsk')) {
                        if (['riskcriteria', 'riskdetermination', 'asildetermination', 'asilassessment'].includes(prevText) && this.getIndentLevel(line.text) > 0) {
                            return {
                                type: 'inside-rsk',
                                parentKeyword: prevText,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                        if (prevText === 'subsystem' && this.getIndentLevel(line.text) > 0) {
                            return {
                                type: 'inside-rsk',
                                parentKeyword: 'subsystem',
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                    }

                    // Add for .sgl files
                    if (document.fileName.endsWith('.sgl')) {
                        if (prevText.startsWith('def ') && this.getIndentLevel(line.text) > this.getIndentLevel(prevLine.text)) {
                            const defType = prevText.split(' ')[1] || null;
                            return {
                                type: 'inside-def',
                                parentKeyword: defType,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                        if (['safetygoals', 'safetymeasures'].includes(prevText) && this.getIndentLevel(line.text) > 0) {
                            return {
                                type: 'inside-sgl',
                                parentKeyword: prevText,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                    }

                    // Add for .req files
                    if (document.fileName.endsWith('.req')) {
                        if (prevText.startsWith('def ') && this.getIndentLevel(line.text) > this.getIndentLevel(prevLine.text)) {
                            const defType = prevText.split(' ')[1] || null;
                            return {
                                type: 'inside-def',
                                parentKeyword: defType,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                        if (prevText === 'reqsection' && this.getIndentLevel(line.text) > 0) {
                            return {
                                type: 'inside-req',
                                parentKeyword: prevText,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                    }

                    // Add for .sub files
                    if (document.fileName.endsWith('.sub')) {
                        if (prevText.startsWith('def ') && this.getIndentLevel(line.text) > this.getIndentLevel(prevLine.text)) {
                            const defType = prevText.split(' ')[1] || null;
                            return {
                                type: 'inside-sub',
                                parentKeyword: defType,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                    }

                    // Add for .sys files
                    if (document.fileName.endsWith('.sys')) {
                        if (prevText.startsWith('def ') && this.getIndentLevel(line.text) > this.getIndentLevel(prevLine.text)) {
                            const defType = prevText.split(' ')[1] || null;
                            return {
                                type: 'inside-sys',
                                parentKeyword: defType,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                    }

                    // Add for .fun files
                    if (document.fileName.endsWith('.fun')) {
                        if (prevText.startsWith('def ') && this.getIndentLevel(line.text) > this.getIndentLevel(prevLine.text)) {
                            const defType = prevText.split(' ')[1] || null;
                            return {
                                type: 'inside-fun',
                                parentKeyword: defType,
                                indentLevel: this.getIndentLevel(line.text)
                            };
                        }
                    }
                    
                    if (['operationalscenarios', 'safetyconcept', 'systemboundaries', 'subsystems', 'includes', 'excludes', 'safetystrategy', 'assumptionsofuse', 'foreseeablemisuse'].includes(prevText) && this.getIndentLevel(line.text) > 0) {
                        return {
                            type: 'inside-itm',
                            parentKeyword: prevText,
                            indentLevel: this.getIndentLevel(line.text)
                        };
                    }
                }
                
                // Stop at same or lesser indentation (different scope)
                if (this.getIndentLevel(prevLine.text) <= this.getIndentLevel(line.text) && prevText.length > 0) {
                    break;
                }
            }
        }
        
        return { type: 'top-level', parentKeyword: null, indentLevel: 0 };
    }

    private getSylangCompletions(linePrefix: string, context: CompletionContext): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        const snippetKeywords = new Set<string>(); // Track which keywords have snippet versions
        
        // Context-specific completions
        switch (context.type) {
            case 'after-systemfeatures':
                // After systemfeatures, suggest feature template and properties
                if (context.indentLevel === 2) { // Direct children
                    completions.push(this.createFeatureCompletion());
                    snippetKeywords.add('feature'); // Mark feature as having a snippet
                    completions.push(...this.getPropertyCompletions());
                    // Mark property keywords as having snippets
                    ['name', 'description', 'owner', 'tags', 'safetylevel'].forEach(k => snippetKeywords.add(k));
                }
                break;
                
            case 'after-productline':
                // After productline, suggest productline properties
                if (context.indentLevel === 2) { // Direct children
                    completions.push(...this.getProductlinePropertyCompletions());
                    // Mark property keywords as having snippets
                    ['name', 'description', 'owner', 'domain', 'compliance', 'firstrelease', 'tags', 'safetylevel', 'region'].forEach(k => snippetKeywords.add(k));
                }
                break;
                
            case 'inside-feature':
                // Inside feature, suggest feature properties
                completions.push(...this.getFeaturePropertyCompletions());
                // Mark property keywords as having snippets
                ['name', 'description', 'owner', 'tags', 'safetylevel'].forEach(k => snippetKeywords.add(k));
                break;
                
            case 'inside-def':
                // Inside a def in .itm, suggest properties based on def type
                if (this.languageId === 'sylang-safety') {
                    completions.push(...this.getItmDefPropertyCompletions(context.parentKeyword || ''));
                    // Mark .itm property keywords
                    this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                }
                break;

            case 'inside-itm':
                // Inside .itm sections/containers
                if (this.languageId === 'sylang-safety') {
                    completions.push(...this.getItmSectionCompletions(context.parentKeyword || ''));
                    this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                }
                break;

            case 'inside-haz':
                // Inside .haz sections/containers
                if (this.languageId === 'sylang-safety') {
                    completions.push(...this.getHazSectionCompletions(context.parentKeyword || ''));
                    this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                }
                break;

            case 'inside-rsk':
                // Inside .rsk sections/containers
                if (this.languageId === 'sylang-safety') {
                    completions.push(...this.getRskSectionCompletions(context.parentKeyword || ''));
                    this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                }
                break;

            case 'inside-sgl':
                // Inside .sgl sections/containers
                if (this.languageId === 'sylang-safety') {
                    completions.push(...this.getSglSectionCompletions(context.parentKeyword || ''));
                    this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                }
                break;

            case 'inside-req':
                // Inside .req sections/containers
                completions.push(...this.getReqSectionCompletions(context.parentKeyword || ''));
                this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                break;
                
            case 'inside-sub':
                // Inside .sub sections/containers
                completions.push(...this.getSubSectionCompletions(context.parentKeyword || ''));
                this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                break;

            case 'inside-sys':
                // Inside .sys sections/containers
                completions.push(...this.getSysSectionCompletions(context.parentKeyword || ''));
                this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                break;

            case 'inside-fun':
                // Inside .fun sections/containers
                completions.push(...this.getFunSectionCompletions(context.parentKeyword || ''));
                this.getRelevantKeywords(context).forEach(k => snippetKeywords.add(k));
                break;

            case 'top-level':
                // Top level - suggest main templates
                const topLevelCompletions = this.getTopLevelCompletions();
                completions.push(...topLevelCompletions);
                // Mark top-level keywords as having snippets
                topLevelCompletions.forEach(item => {
                    const label = item.label;
                    if (typeof label === 'string' && label.length > 0) {
                        const keyword = label.split(' ')[0];
                        if (keyword) {
                            snippetKeywords.add(keyword);
                        }
                    }
                });
                break;
        }
        
        // Add keyword completions ONLY for keywords that don't have snippet versions
        const keywordCompletions = this.getFilteredKeywordCompletions(linePrefix, context, snippetKeywords);
        completions.push(...keywordCompletions);
        
        return completions;
    }

    private createFeatureCompletion(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('feature (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'feature ${1:FeatureName} ${2|mandatory,optional,alternative,or|}',
            '  name "${3:Feature Name}"',
            '  description "${4:Description of the feature}"',
            '  owner "${5:Team Name}"',
            '  tags "${6:tag1}", "${7:tag2}"',
            '  safetylevel ${8|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Feature Definition Template';
        item.documentation = new vscode.MarkdownString('**Feature Template**\n\nInserts a complete feature with variability type and tab navigation.');
        item.filterText = 'feature'; // Still matches when typing "feature"
        item.sortText = '0_feature';
        return item;
    }

    private getPropertyCompletions(): vscode.CompletionItem[] {
        return [
            this.createPropertyCompletion('name', 'name "${1:Display Name}"', 'Name property'),
            this.createPropertyCompletion('description', 'description "${1:Description}"', 'Description property'),
            this.createPropertyCompletion('owner', 'owner "${1:Team Name}"', 'Owner property'),
            this.createPropertyCompletion('tags', 'tags "${1:tag1}", "${2:tag2}"', 'Tags property'),
            this.createPropertyCompletion('safetylevel', 'safetylevel ${1|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}', 'Safety level property')
        ];
    }

    private getProductlinePropertyCompletions(): vscode.CompletionItem[] {
        return [
            this.createPropertyCompletion('name', 'name "${1:Product Name}"', 'Product line name'),
            this.createPropertyCompletion('description', 'description "${1:Product description}"', 'Product line description'),
            this.createPropertyCompletion('owner', 'owner "${1:Team Name}", "${2:Department}"', 'Product line owner'),
            this.createPropertyCompletion('domain', 'domain "${1:automotive}", "${2:safety}"', 'Application domain'),
            this.createPropertyCompletion('compliance', 'compliance "${1:ISO 26262}", "${2:ASPICE}"', 'Compliance standards'),
            this.createPropertyCompletion('firstrelease', 'firstrelease "${1:2025-Q1}"', 'First release date'),
            this.createPropertyCompletion('tags', 'tags "${1:tag1}", "${2:tag2}"', 'Tags'),
            this.createPropertyCompletion('safetylevel', 'safetylevel ${1|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}', 'Safety level'),
            this.createPropertyCompletion('region', 'region "${1:Global}", "${2:Europe}"', 'Geographic regions')
        ];
    }

    private getFeaturePropertyCompletions(): vscode.CompletionItem[] {
        return this.getPropertyCompletions();
    }

    private getItmDefPropertyCompletions(defType: string): vscode.CompletionItem[] {
        const propertiesByDef: { [key: string]: string[] } = {
            'item': ['name', 'description', 'owner', 'reviewers', 'productline', 'systemfeatures', 'systemfunctions', 'subsystems', 'systemboundaries'],
            'scenario': ['description', 'vehiclestate', 'environment', 'driverstate'],
            'condition': ['range', 'impact', 'standard'],
            'vehiclestate': ['description', 'characteristics'],
            'drivingstate': ['description', 'characteristics'],
            'environment': ['description', 'conditions'],
            'principle': ['description'],
            'assumption': ['description'],
            'misuse': ['description'],
            'boundary': [] // Inline desc, no indented properties
        };

        const props = propertiesByDef[defType] || [];
        return props.map(prop => this.createPropertyCompletion(prop, `${prop} "\${1}"`, `${prop.charAt(0).toUpperCase() + prop.slice(1)} property`));
    }

    private getItmSectionCompletions(section: string): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        switch (section) {
            case 'subsystems':
                // Suggest subsystem identifier (but since it's list, no template, just keyword)
                break;
            case 'systemboundaries':
                return [
                    this.createSimpleCompletion('includes'),
                    this.createSimpleCompletion('excludes')
                ];
            case 'includes':
            case 'excludes':
                completions.push(this.createBoundaryTemplate());
                break;
            case 'operationalscenarios':
                completions.push(this.createScenarioTemplate());
                completions.push(this.createSimpleCompletion('operationalconditions'));
                completions.push(this.createSimpleCompletion('vehiclestates'));
                completions.push(this.createSimpleCompletion('driverstates'));
                completions.push(this.createSimpleCompletion('environments'));
                break;
            case 'operationalconditions':
                completions.push(this.createConditionTemplate());
                break;
            case 'vehiclestates':
                completions.push(this.createVehiclestateTemplate());
                break;
            case 'driverstates':
                completions.push(this.createDrivingstateTemplate());
                break;
            case 'environments':
                completions.push(this.createEnvironmentTemplate());
                break;
            case 'safetyconcept':
                completions.push(this.createSimpleCompletion('safetystrategy'));
                completions.push(this.createAssumptionsofuseTemplate());
                completions.push(this.createForeseeablemisuseTemplate());
                break;
            case 'safetystrategy':
                completions.push(this.createPrincipleTemplate());
                break;
            case 'assumptionsofuse':
                completions.push(this.createAssumptionTemplate());
                break;
            case 'foreseeablemisuse':
                completions.push(this.createMisuseTemplate());
                break;
        }
        return completions;
    }

    private getHazSectionCompletions(section: string): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        switch (section) {
            case 'hazardcategories':
                completions.push(this.createCategoryTemplate());
                break;
            case 'subsystemhazards':
                completions.push(this.createSubsystemTemplate());
                completions.push(this.createHazardTemplate());
                break;
            case 'systemlevelhazards':
            case 'environmentalhazards':
            case 'usagehazards':
                completions.push(this.createHazardTemplate());
                break;
        }
        return completions;
    }

    private createBoundaryTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def boundary (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString('def boundary ${1:BOUND_ID} "${2:Description}"');
        item.detail = 'Boundary Definition Template';
        item.documentation = new vscode.MarkdownString('**Boundary Template**\n\nDefines a system boundary with ID and description.');
        item.filterText = 'def boundary';
        item.sortText = '0_def_boundary';
        return item;
    }

    private createScenarioTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def scenario (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def scenario ${1:SCEN_ID}',
            '  description "${2:Scenario description}"',
            '  vehiclestate ${3:StateID}',
            '  environment ${4:EnvID}',
            '  driverstate ${5:DriverID}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Scenario Definition Template';
        item.documentation = new vscode.MarkdownString('**Scenario Template**\n\nDefines an operational scenario.');
        item.filterText = 'def scenario';
        item.sortText = '0_def_scenario';
        return item;
    }

    private createConditionTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def condition (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def condition ${1:COND_ID}',
            '  range "${2:Range value}"',
            '  impact "${3:Impact description}"',
            '  standard "${4:Standard reference}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Condition Definition Template';
        item.documentation = new vscode.MarkdownString('**Condition Template**\n\nDefines an operational condition.');
        item.filterText = 'def condition';
        item.sortText = '0_def_condition';
        return item;
    }

    private createVehiclestateTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def vehiclestate (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def vehiclestate ${1:STATE_ID}',
            '  description "${2:State description}"',
            '  characteristics "${3:Characteristics}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Vehicle State Definition Template';
        item.documentation = new vscode.MarkdownString('**Vehicle State Template**\n\nDefines a vehicle state.');
        item.filterText = 'def vehiclestate';
        item.sortText = '0_def_vehiclestate';
        return item;
    }

    private createDrivingstateTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def drivingstate (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def drivingstate ${1:STATE_ID}',
            '  description "${2:State description}"',
            '  characteristics "${3:Characteristics}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Driving State Definition Template';
        item.documentation = new vscode.MarkdownString('**Driving State Template**\n\nDefines a driving state.');
        item.filterText = 'def drivingstate';
        item.sortText = '0_def_drivingstate';
        return item;
    }

    private createEnvironmentTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def environment (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def environment ${1:ENV_ID}',
            '  description "${2:Environment description}"',
            '  conditions ${3:COND_ID}, ${4:COND_ID2}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Environment Definition Template';
        item.documentation = new vscode.MarkdownString('**Environment Template**\n\nDefines an environment.');
        item.filterText = 'def environment';
        item.sortText = '0_def_environment';
        return item;
    }

    private createPrincipleTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def principle (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def principle ${1:PRIN_ID}',
            '  description "${2:Principle description}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Principle Definition Template';
        item.documentation = new vscode.MarkdownString('**Principle Template**\n\nDefines a safety principle.');
        item.filterText = 'def principle';
        item.sortText = '0_def_principle';
        return item;
    }

    private createAssumptionsofuseTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def assumptionsofuse (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def assumptionsofuse ${1:ASSUMPTIONS_ID}',
            '  name "${2:Assumptions Name}"',
            '  description "${3:Description}"',
            '  methodology "${4:Methodology}"',
            '  assumption ${5:ASSUMP_ID} "${6:Assumption text}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Assumptions of Use Template';
        item.documentation = new vscode.MarkdownString('**Assumptions of Use Template**\n\nDefines assumptions of use.');
        item.filterText = 'def assumptionsofuse';
        item.sortText = '0_def_assumptionsofuse';
        return item;
    }

    private createForeseeablemisuseTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def foreseeablemisuse (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def foreseeablemisuse ${1:MISUSE_ID}',
            '  name "${2:Misuse Name}"',
            '  description "${3:Description}"',
            '  methodology "${4:Methodology}"',
            '  misuse ${5:MISUSE_CASE_ID} "${6:Misuse text}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Foreseeable Misuse Template';
        item.documentation = new vscode.MarkdownString('**Foreseeable Misuse Template**\n\nDefines foreseeable misuse.');
        item.filterText = 'def foreseeablemisuse';
        item.sortText = '0_def_foreseeablemisuse';
        return item;
    }

    private createAssumptionTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('assumption (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString('assumption ${1:ASSUMP_ID} "${2:Assumption text}"');
        item.detail = 'Assumption Template';
        item.documentation = new vscode.MarkdownString('**Assumption**\n\nDefines an assumption.');
        item.filterText = 'assumption';
        item.sortText = '0_assumption';
        return item;
    }

    private createMisuseTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def misuse (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def misuse ${1:MisuseID}',
            '  description "${2:Description of potential misuse}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Misuse Template';
        return item;
    }

    private createCategoryTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def category (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def category ${1:CategoryID}',
            '  description "${2:Description}"',
            '  severity "${3:Severity}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Hazard Category Template';
        item.documentation = new vscode.MarkdownString('**Hazard Category**\n\nDefines a category of hazards with description and severity.');
        item.filterText = 'def category';
        item.sortText = '0_def_category';
        return item;
    }

    private createSubsystemTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('subsystem (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString('subsystem ${1:SubsystemName}');
        item.detail = 'Subsystem Reference';
        item.documentation = new vscode.MarkdownString('**Subsystem**\n\nReferences a subsystem for hazard analysis.');
        item.filterText = 'subsystem';
        item.sortText = '0_subsystem';
        return item;
    }

    private createHazardTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def hazard (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def hazard ${1:H_ID}',
            '  name "${2:Name}"',
            '  description "${3:Description}"',
            '  cause "${4:Cause}"',
            '  effect "${5:Effect}"',
            '  category ${6:CategoryID}',
            '  function ${7:Func1}, ${8:Func2}',
            '  mitigation "${9:Mitigation}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Hazard Definition Template';
        item.documentation = new vscode.MarkdownString('**Hazard Definition**\n\nComplete hazard with cause, effect, and mitigation.');
        item.filterText = 'def hazard';
        item.sortText = '0_def_hazard';
        return item;
    }

    private createHazardidentificationTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def hazardidentification (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def hazardidentification ${1:ID}',
            '  name "${2:Name}"',
            '  description "${3:Description}"',
            '  hazardanalysis ${4:ReferenceID}',
            '  methodology "${5:FMEA}", "${6:HAZOP}"',
            '  ',
            '  hazardcategories',
            '    def category ${7:CategoryID}',
            '      description "${8:Desc}"',
            '      severity "${9:Severity}"',
            '  ',
            '  subsystemhazards',
            '    subsystem ${10:SubsystemName}',
            '      def hazard ${11:H_ID}',
            '        name "${12:Name}"',
            '        description "${13:Desc}"',
            '        cause "${14:Cause}"',
                    '        effect "${15:Effect}"',
        '        category ${16:CategoryID}',
        '        function ${17:Func1}, ${18:Func2}',
        '  ${0}'
        ].join('\n'));
        item.detail = 'Hazard Identification Template';
        item.documentation = new vscode.MarkdownString('**Hazard Identification**\n\nFull template for .haz file.');
        item.filterText = 'def hazardidentification';
        item.sortText = '0_def_hazardidentification';
        return item;
    }

    private getRskSectionCompletions(section: string): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        switch (section) {
            case 'riskcriteria':
                completions.push(this.createSeverityTemplate());
                completions.push(this.createExposureTemplate());
                completions.push(this.createControllabilityTemplate());
                break;
            case 'riskdetermination':
                completions.push(this.createRiskTemplate());
                break;
            case 'asildetermination':
                completions.push(this.createAsilTemplate());
                break;
            case 'asilassessment':
                completions.push(this.createSubsystemRiskTemplate());
                completions.push(this.createHazardRiskTemplate());
                break;
            case 'subsystem':
                completions.push(this.createHazardRiskTemplate());
                break;
        }
        return completions;
    }

    private getSglSectionCompletions(section: string): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        switch (section) {
            case 'safetygoals':
                completions.push(this.createGoalTemplate());
                break;
            case 'safetymeasures':
                completions.push(this.createMeasureTemplate());
                break;
            case 'goal':
                completions.push(this.createSafetymeasuresTemplate());
                break;
        }
        return completions;
    }

    private getReqSectionCompletions(section: string): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        switch (section) {
            case 'reqsection':
                completions.push(this.createRequirementTemplate());
                break;
        }
        return completions;
    }

    private getSubSectionCompletions(section: string): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        switch (section) {
            case 'subsystem':
                // No nested defs, so properties only via keywords
                break;
        }
        return completions;
    }

    private getSysSectionCompletions(section: string): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        switch (section) {
            case 'system':
                // System properties
                completions.push(this.createPropertyCompletion('name', 'name "System Name"', 'System name'));
                completions.push(this.createPropertyCompletion('description', 'description "System description"', 'System description'));
                completions.push(this.createPropertyCompletion('owner', 'owner "Team Name"', 'System owner'));
                completions.push(this.createPropertyCompletion('tags', 'tags "tag1", "tag2"', 'System tags'));
                completions.push(this.createPropertyCompletion('asil', 'asil D', 'ASIL level'));
                completions.push(this.createPropertyCompletion('contains', 'contains subsystem SubsystemName', 'Contains subsystems'));
                break;
        }
        return completions;
    }

    private getFunSectionCompletions(section: string): vscode.CompletionItem[] {
        const completions: vscode.CompletionItem[] = [];
        switch (section) {
            case 'functiongroup':
                // Functions container - suggest function definitions
                completions.push(this.createFunctionDefinitionTemplate());
                break;
            case 'function':
                // Function properties
                completions.push(this.createPropertyCompletion('name', 'name "Function Name"', 'Function name'));
                completions.push(this.createPropertyCompletion('description', 'description "Function description"', 'Function description'));
                completions.push(this.createPropertyCompletion('category', 'category ${1|product,system,subsystem,component,module,unit,assembly,circuit,part|}', 'Function category'));
                completions.push(this.createPropertyCompletion('owner', 'owner "Team Name"', 'Function owner'));
                completions.push(this.createPropertyCompletion('tags', 'tags "tag1", "tag2"', 'Function tags'));
                completions.push(this.createPropertyCompletion('asil', 'asil ${1|QM,A,B,C,D|}', 'ASIL level'));
                completions.push(this.createPropertyCompletion('partof', 'partof ${1|product,system,subsystem,component,module,unit,assembly,circuit,part|}', 'Part of hierarchy'));
                completions.push(this.createPropertyCompletion('enables', 'enables feature FeatureName', 'Enables features'));
                break;
        }
        return completions;
    }

    private createRequirementTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def requirement (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def requirement ${1:FSR_ID}',
            '\tname "${2:Name}"',
            '\tdescription "${3:Description}"',
            '\ttype ${4:functionalsafety}',
            '\tsource ${5:stakeholder}',
            '\tderivedfrom ${6:safetygoal SG_ID}',
            '\tasil ${7:D}',
            '\trationale "${8:Rationale}"',
            '\tallocatedto ${9:subsystem Component1}, ${10:Component2}',
            '\tverificationcriteria "${11:Criteria}"',
            '\tstatus ${12:draft}',
            '\t${0}'
        ].join('\n'));
        item.detail = 'Requirement Definition Template';
        item.documentation = new vscode.MarkdownString('**Requirement Definition**\n\nComplete template for a functional safety requirement.');
        item.filterText = 'def requirement';
        item.sortText = '0_def_requirement';
        return item;
    }

    private createSubsystemDefinitionTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def subsystem (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def subsystem ${1:ID}',
            '  name "${2:Name}"',
            '  description "${3:Description}"',
            '  owner "${4:Owner}"',
            '  tags "${5:Tag1}", "${6:Tag2}"',
            '  safetylevel ${7|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}',
            '  enables feature ${8:Feature1}, ${9:Feature2}',
            '  implements function ${10:Function1}, ${11:Function2}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Subsystem Template';
        item.documentation = new vscode.MarkdownString('**Subsystem**\n\nFull template for .sub file.');
        item.filterText = 'def subsystem';
        item.sortText = '0_def_subsystem';
        return item;
    }

    private createSystemTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def system (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def system ${1:ID}',
            '  name "${2:Name}"',
            '  description "${3:Description}"',
            '  owner "${4:Owner}"',
            '  tags "${5:Tag1}", "${6:Tag2}"',
            '  asil ${7|QM,A,B,C,D|}',
            '  contains subsystem ${8:Subsystem1}, ${9:Subsystem2}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'System Template';
        item.documentation = new vscode.MarkdownString('**System**\n\nFull template for .sys file.');
        item.filterText = 'def system';
        item.sortText = '0_def_system';
        return item;
    }

    private createFunctionDefinitionTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def function (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def function ${1:FunctionName}',
            '  name "${2:Function Name}"',
            '  description "${3:Function description}"',
            '  owner "${4:Team Name}"',
            '  tags "${5:tag1}", "${6:tag2}"',
            '  asil ${7|QM,A,B,C,D|}',
            '  enables feature ${8:FeatureName}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Function Definition Template';
        item.documentation = new vscode.MarkdownString('**Function Definition**\n\nComplete template for function definition in .fun files.');
        item.filterText = 'def function';
        item.sortText = '0_def_function';
        return item;
    }

    private createSystemfunctionsTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def systemfunctions (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def systemfunctions ${1:SystemName}',
            '  def function ${2:FunctionName}',
            '    name "${3:Function Name}"',
            '    description "${4:Function description}"',
            '    owner "${5:Team Name}"',
            '    tags "${6:tag1}", "${7:tag2}"',
            '    asil ${8|QM,A,B,C,D|}',
            '    enables feature ${9:FeatureName}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'System Functions Template';
        item.documentation = new vscode.MarkdownString('**System Functions**\n\nComplete template for .fun file with systemfunctions container.');
        item.filterText = 'def systemfunctions';
        item.sortText = '0_def_systemfunctions';
        return item;
    }

    private createSubsystemfunctionsTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def subsystemfunctions (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def subsystemfunctions ${1:SubsystemName}',
            '  def function ${2:FunctionName}',
            '    name "${3:Function Name}"',
            '    description "${4:Function description}"',
            '    owner "${5:Team Name}"',
            '    tags "${6:tag1}", "${7:tag2}"',
            '    asil ${8|QM,A,B,C,D|}',
            '    enables feature ${9:FeatureName}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Subsystem Functions Template';
        item.documentation = new vscode.MarkdownString('**Subsystem Functions**\n\nComplete template for .fun file with subsystemfunctions container.');
        item.filterText = 'def subsystemfunctions';
        item.sortText = '0_def_subsystemfunctions';
        return item;
    }

    private createRiskassessmentTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def riskassessment (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def riskassessment ${1:ID}',
            '  name "${2:Name}"',
            '  description "${3:Description}"',
            '  hazardanalysis ${4:ReferenceID}',
            '  hazardidentification ${5:ReferenceID}',
            '  item ${6:ItemID}',
            '  methodology "${7:ISO 26262 S×E×C}"',
            '  ',
            '  riskcriteria',
            '    def severity ${8:S0}',
            '      description "${9:Description}"',
            '    def exposure ${10:E0}',
            '      description "${11:Description}"',
            '    def controllability ${12:C0}',
            '      description "${13:Description}"',
            '  riskdetermination',
            '    def risk ${14:S1E1C1}',
            '      severity ${15:S1}',
            '      exposure ${16:E1}',
            '      controllability ${17:C1}',
            '      description "${18:S1E1C1}"',
            '  asildetermination',
            '    def asil ${19:QM}',
            '      risk ${20:S1E1C1}, ${21:S1E1C2}',
            '      description "${22:QM}"',
            '  asilassessment',
            '    subsystem ${23:SubsystemName}',
            '      hazard ${24:H_ID}',
            '        scenario ${25:SCEN_ID}, ${26:SCEN_ID2}',
            '        asil ${27:D}',
            '        rationale "${28:Rationale}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Risk Assessment Template';
        item.documentation = new vscode.MarkdownString('**Risk Assessment**\n\nFull template for .rsk file.');
        item.filterText = 'def riskassessment';
        item.sortText = '0_def_riskassessment';
        return item;
    }

    private createSeverityTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def severity (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def severity ${1:S0}',
            '  description "${2:Description}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Severity Definition Template';
        return item;
    }

    private createExposureTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def exposure (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def exposure ${1:E0}',
            '  description "${2:Description}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Exposure Definition Template';
        return item;
    }

    private createControllabilityTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def controllability (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def controllability ${1:C0}',
            '  description "${2:Description}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Controllability Definition Template';
        return item;
    }

    private createRiskTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def risk (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def risk ${1:S1E1C1}',
            '  severity ${2:S1}',
            '  exposure ${3:E1}',
            '  controllability ${4:C1}',
            '  description "${5:S1E1C1}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Risk Definition Template';
        return item;
    }

    private createAsilTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def asil (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def asil ${1:QM}',
            '  risk ${2:S1E1C1}, ${3:S1E1C2}',
            '  description "${4:QM}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'ASIL Definition Template';
        return item;
    }

    private createHazardRiskTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('hazard (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'hazard ${1:H_ID}',
            '  scenario ${2:SCEN_ID}, ${3:SCEN_ID2}',
            '  asil ${4:D}',
            '  rationale "${5:Rationale}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Hazard Assessment Template';
        return item;
    }

    private createSubsystemRiskTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('subsystem (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString('subsystem ${1:Name}');
        item.detail = 'Subsystem Reference Template';
        return item;
    }

    private createSafetygoalsTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def safetygoals (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def safetygoals ${1:ID}',
            '\tname "${2:Name}"',
            '\tdescription "${3:Description}"',
            '\titem ${4:ItemID}',
            '\triskassessment ${5:RiskID}',
            '\thazardidentification ${6:HazID}',
            '\t',
            '\tsafetygoals',
            '\t\tdef goal ${7:SG_ID}',
            '\t\t\tname "${8:Name}"',
            '\t\t\tdescription "${9:Description}"',
            '\t\t\thazard ${10:H_ID1}, ${11:H_ID2}',
            '\t\t\tscenario ${12:SCEN_ID1}, ${13:SCEN_ID2}',
            '\t\t\tasil ${14:D}',
            '\t\t\tsafetymeasures',
            '\t\t\t\tdef measure ${15:SM_ID}',
            '\t\t\t\t\tdescription "${16:Description}"',
            '\t\t\t\t\tenabledby function ${17:Component1}, ${18:Component2}',
            '\t${0}'
        ].join('\n'));
        item.detail = 'Safety Goals Template';
        item.documentation = new vscode.MarkdownString('**Safety Goals**\n\nFull template for .sgl file.');
        item.filterText = 'def safetygoals';
        item.sortText = '0_def_safetygoals';
        return item;
    }

    private createGoalTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def goal (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def goal ${1:SG_ID}',
            '\tname "${2:Name}"',
            '\tdescription "${3:Description}"',
            '\thazard ${4:H_ID1}, ${5:H_ID2}',
            '\tscenario ${6:SCEN_ID1}, ${7:SCEN_ID2}',
            '\tasil ${8:D}',
            '\tsafetymeasures',
            '\t\tdef measure ${9:SM_ID}',
            '\t\t\tdescription "${10:Description}"',
            '\t\t\tenabledby function ${11:Component1}, ${12:Component2}',
            '\t${0}'
        ].join('\n'));
        item.detail = 'Goal Definition Template';
        return item;
    }

    private createSafetymeasuresTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('safetymeasures (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'safetymeasures',
            '\tdef measure ${1:SM_ID}',
            '\t\tdescription "${2:Description}"',
            '\t\tenabledby function ${3:Component1}, ${4:Component2}',
            '\t${0}'
        ].join('\n'));
        item.detail = 'Safety Measures Section Template';
        return item;
    }

    private createMeasureTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def measure (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def measure ${1:SM_ID}',
            '\tdescription "${2:Description}"',
            '\tenabledby function ${3:Component1}, ${4:Component2}',
            '\t${0}'
        ].join('\n'));
        item.detail = 'Measure Definition Template';
        return item;
    }

    private createSimpleCompletion(keyword: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
        item.insertText = keyword;
        item.detail = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Section`;
        item.sortText = `1_${keyword}`;
        return item;
    }

    private getTopLevelCompletions(): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];
        
        if (this.languageId === 'sylang-features') {
            items.push(this.createSystemfeaturesCompletion());
        }
        if (this.languageId === 'sylang-safety') {
            items.push(this.createItemTemplate());
            items.push(this.createHazardidentificationTemplate());
            items.push(this.createRiskassessmentTemplate());
            items.push(this.createSafetygoalsTemplate());
        }
        if (this.languageId === 'sylang-components') {
            items.push(this.createSubsystemDefinitionTemplate());
            items.push(this.createSystemTemplate());
        }
        if (this.languageId === 'sylang-functions') {
            items.push(this.createSystemfunctionsTemplate());
            items.push(this.createSubsystemfunctionsTemplate());
        }
        
        return items.filter(item => item !== undefined);
    }

    private createItemTemplate(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('def item (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'def item ${1:ItemID}',
            '  name "${2:Name}"',
            '  description "${3:Description}"',
            '  owner "${4:Owner}"',
            '  reviewers "${5:Reviewer1}", "${6:Reviewer2}"',
            '  ',
            '  productline ${7:ProductLineID}',
            '  systemfeatures ${8:FeaturesID}',
            '  systemfunctions ${9:FunctionsID}',
            '  subsystems',
            '    ${10:Subsystem1}',
            '    ${11:Subsystem2}',
            '  systemboundaries',
            '    includes',
            '      def boundary ${12:BOUND_ID}',
            '        description "${13:Description}"',
            '    excludes',
            '      def boundary ${14:EXCL_ID}',
            '        description "${15:Description}"',
            '',
            'operationalscenarios',
            '  def scenario ${16:SCEN_ID}',
            '    description "${17:Scenario desc}"',
            '    vehiclestate ${18:StateID}',
            '    environment ${19:EnvID}',
            '    driverstate ${20:DriverID}',
            '  operationalconditions',
            '    def condition ${21:COND_ID}',
            '      range "${22:Range}"',
            '      impact "${23:Impact}"',
            '  vehiclestates',
            '    def vehiclestate ${24:STATE_ID}',
            '      description "${25:State desc}"',
            '      characteristics "${26:Chars}"',
            '  driverstates',
            '    def drivingstate ${27:DRIVER_ID}',
            '      description "${28:Driver desc}"',
            '      characteristics "${29:Chars}"',
            '  environments',
            '    def environment ${30:ENV_ID}',
            '      description "${31:Env desc}"',
            '      conditions ${32:COND_ID}',
            '',
            'safetyconcept',
            '  safetystrategy',
            '    def principle ${33:PRIN_ID}',
            '      description "${34:Principle desc}"',
            '  assumptionsofuse',
            '    def assumption ${35:ASSUMP_ID}',
            '      description "${36:Assumption desc}"',
            '  foreseeablemisuse',
            '    def misuse ${37:MISUSE_ID}',
            '      description "${38:Misuse desc}"',
            '  ${0}'
        ].join('\n'));
        item.detail = 'Item Template';
        item.documentation = new vscode.MarkdownString('**Item Definition**\n\nFull template for .itm file.');
        item.filterText = 'def item';
        item.sortText = '0_def_item';
        return item;
    }

    private createSystemfeaturesCompletion(): vscode.CompletionItem {
        const item = new vscode.CompletionItem('systemfeatures (template)', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString([
            'systemfeatures ${1:ContainerName}',
            '  ${0}'
        ].join('\n'));
        item.detail = 'System Features Container Template';
        item.documentation = new vscode.MarkdownString('**System Features Template**\n\nCreates a systemfeatures container with tab navigation.');
        item.filterText = 'systemfeatures'; // Still matches when typing "systemfeatures"
        item.sortText = '0_systemfeatures';
        return item;
    }

    private createPropertyCompletion(keyword: string, insertText: string, detail: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString(insertText);
        item.detail = detail;
        item.sortText = `0_${keyword}`; // Higher priority for snippets
        return item;
    }

    private getFilteredKeywordCompletions(linePrefix: string, context: CompletionContext, excludeKeywords: Set<string> = new Set()): vscode.CompletionItem[] {
        // Only include keywords relevant to the current context
        const relevantKeywords = this.getRelevantKeywords(context);
        
        return relevantKeywords
            .filter(keyword => 
                !excludeKeywords.has(keyword) && // Don't include keywords that have snippet versions
                (keyword.startsWith(linePrefix.toLowerCase()) || linePrefix.trim() === '')
            )
            .map(keyword => {
                const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                item.sortText = `2_${keyword}`;
                return item;
            });
    }

    private getRelevantKeywords(context: CompletionContext): string[] {
        switch (context.type) {
            case 'after-systemfeatures':
                return ['feature', 'name', 'description', 'owner', 'tags', 'safetylevel'];
            case 'after-productline':
                return ['name', 'description', 'owner', 'domain', 'compliance', 'firstrelease', 'tags', 'safetylevel', 'region'];
            case 'inside-feature':
                return ['name', 'description', 'owner', 'tags', 'safetylevel'];
            case 'inside-def':
            case 'inside-itm':
                return ['def', 'name', 'description', 'owner', 'reviewers', 'productline', 'systemfeatures', 'systemfunctions', 'subsystems', 'systemboundaries', 'includes', 'excludes', 'boundary', 'operationalscenarios', 'scenario', 'vehiclestate', 'environment', 'driverstate', 'operationalconditions', 'condition', 'range', 'impact', 'standard', 'vehiclestates', 'drivingstate', 'characteristics', 'environments', 'conditions', 'safetyconcept', 'safetystrategy', 'principle', 'assumptionsofuse', 'assumption', 'foreseeablemisuse', 'misuse'];
            case 'inside-haz':
                return ['def', 'name', 'description', 'hazardanalysis', 'methodology', 'category', 'subsystem', 'hazard', 'cause', 'effect', 'function', 'mitigation', 'severity'];
            case 'inside-rsk':
                return ['def', 'name', 'description', 'hazardanalysis', 'hazardidentification', 'item', 'methodology', 'severity', 'exposure', 'controllability', 'risk', 'asil', 'scenario', 'rationale'];
            case 'inside-sgl':
                return ['def', 'name', 'description', 'item', 'riskassessment', 'hazardidentification', 'hazard', 'scenario', 'asil', 'enabledby function'];
            case 'inside-req':
                return ['def', 'name', 'description', 'type', 'source', 'derivedfrom', 'asil', 'rationale', 'allocatedto', 'verificationcriteria', 'status'];
            case 'inside-sub':
                return ['name', 'description', 'owner', 'tags', 'safetylevel', 'asil', 'enables', 'implements'];
            case 'inside-sys':
                return ['name', 'description', 'owner', 'tags', 'asil', 'contains'];
            case 'inside-fun':
                return ['name', 'description', 'owner', 'tags', 'asil', 'enables'];
            default:
                return this.keywords;
        }
    }

    private getIndentLevel(line: string): number {
        const leadingWhitespace = line.match(/^(\s*)/)?.[1] || '';
        
        // If using tabs, count them directly
        if (leadingWhitespace.includes('\t') && !leadingWhitespace.includes(' ')) {
            return leadingWhitespace.length; // Each tab = 1 level
        }
        
        // If using spaces, count groups of 2
        if (leadingWhitespace.includes(' ') && !leadingWhitespace.includes('\t')) {
            return Math.floor(leadingWhitespace.length / 2); // Each 2 spaces = 1 level
        }
        
        // Mixed or no indentation
        return 0;
    }

    private createTemplates(): void {
        // Product Line Template
        const productlineTemplate = new vscode.CompletionItem('productline (template)', vscode.CompletionItemKind.Snippet);
        productlineTemplate.insertText = new vscode.SnippetString([
            'productline ${1:ProductLineName}',
            '  name "${2:ProductLineName}"',
            '  description "${3:A comprehensive description of the product line}"',
            '  owner "${4:Team Name}", "${5:Department}"',
            '  domain "${6:automotive}", "${7:safety-critical}"',
            '  compliance "${8:ISO 26262}", "${9:ASPICE}"',
            '  firstrelease "${10:2024-Q1}"',
            '  tags "${11:epb}", "${12:brake-systems}", "${13:actuation}"',
            '  safetylevel ${14|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}',
            '  region "${15:Global}", "${16:Europe}", "${17:North America}"',
            '  ${0}'
        ].join('\n'));
        productlineTemplate.detail = 'Complete Product Line Template';
        productlineTemplate.documentation = new vscode.MarkdownString('**Product Line Definition**\n\nInserts a complete product line template with all standard properties.');
        productlineTemplate.filterText = 'productline';
        productlineTemplate.sortText = '0_productline_template';
        this.templates.set('productline', productlineTemplate);

        // Safety Goal Template  
        const safetygoalTemplate = new vscode.CompletionItem('safetygoal (template)', vscode.CompletionItemKind.Snippet);
        safetygoalTemplate.insertText = new vscode.SnippetString([
            'safetygoal ${1:SG_SYSTEM_001}',
            '  name "${2:Prevent Unintended Activation}"',
            '  description "${3:System shall not activate without valid driver command}"',
            '  safetylevel ${4|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}',
            '  allocatedto ${5:SubsystemName}',
            '  derivedfrom ${6:FSR_SYSTEM_001}',
            '  ',
            '  verificationcriteria ${7:VC_SG_001}',
            '    criterion "${8:System test demonstrates no unintended activation}"',
            '    method "${9:Hardware-in-the-loop simulation}"',
            '    coverage "${10:All driving scenarios}"',
            '    ${0}'
        ].join('\n'));
        safetygoalTemplate.detail = 'Complete Safety Goal Template';
        safetygoalTemplate.documentation = new vscode.MarkdownString('**Safety Goal Definition**\n\nISO 26262 compliant safety goal with verification criteria.');
        safetygoalTemplate.filterText = 'safetygoal';
        safetygoalTemplate.sortText = '0_safetygoal_template';
        this.templates.set('safetygoal', safetygoalTemplate);

        // Hazard Analysis Template
        const hazardTemplate = new vscode.CompletionItem('hazard (template)', vscode.CompletionItemKind.Snippet);
        hazardTemplate.insertText = new vscode.SnippetString([
            'hazard ${1:H_ACT_001}',
            '  name "${2:Actuator Motor Runaway}"',
            '  description "${3:Motor continues running beyond commanded position}"',
            '  cause "${4:Motor controller failure, position feedback loss}"',
            '  effect "${5:Excessive clamping force, potential component damage}"',
            '  category ${6|UnintendedActivation,FailureToActivate,FailureToRelease,PartialFailure,DelayedResponse,MisleadingIndication|}',
            '  severity ${7|S0,S1,S2,S3|}',
            '  probability ${8|E0,E1,E2,E3,E4|}',
            '  controllability ${9|C0,C1,C2,C3|}',
            '  ',
            '  functions_affected "${10:MotorDriveController}", "${11:ActuatorPositionTracker}"',
            '  ',
            '  safetymeasures',
            '    measure ${12:SM_001}',
            '      name "${13:Motor Current Limiting}"',
            '      description "${14:Hardware current limiter prevents excessive force}"',
            '      effectiveness "${15:High}"',
            '      ${0}'
        ].join('\n'));
        hazardTemplate.detail = 'Complete Hazard Analysis Template';
        hazardTemplate.documentation = new vscode.MarkdownString('**Hazard Analysis**\n\nISO 26262 HARA template with safety measures.');
        hazardTemplate.filterText = 'hazard';
        hazardTemplate.sortText = '0_hazard_template';
        this.templates.set('hazard', hazardTemplate);

        // Component Template
        const componentTemplate = new vscode.CompletionItem('component (template)', vscode.CompletionItemKind.Snippet);
        componentTemplate.insertText = new vscode.SnippetString([
            'component ${1:ActuatorManagementUnit}',
            '  description "${2:Controls actuator motor and position feedback}"',
            '  safetylevel ${3|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}',
            '  owner "${4:Chassis Systems Team}"',
            '  ',
            '  interfaces',
            '    interface ${5:MotorControl}',
            '      type ${6|Digital,Analog,CAN,LIN,FlexRay,Ethernet|}',
            '      direction ${7|Input,Output,Bidirectional|}',
            '      protocol ${8|SPI,I2C,CAN,LIN,PWM,Analog|}',
            '      voltage ${9|3.3V,5V,12V,24V|}',
            '      ${10}',
            '  ',
            '  partof ${11:ActuationControlSubsystem}',
            '  implements ${12:FSR_EPB_045}, ${13:FSR_EPB_067}',
            '  ${0}'
        ].join('\n'));
        componentTemplate.detail = 'Complete Component Template';
        componentTemplate.documentation = new vscode.MarkdownString('**Component Definition**\n\nSystem component with interfaces and properties.');
        componentTemplate.filterText = 'component';
        componentTemplate.sortText = '0_component_template';
        this.templates.set('component', componentTemplate);

        // def function Template
        const functionTemplate = new vscode.CompletionItem('def function (template)', vscode.CompletionItemKind.Snippet);
        functionTemplate.insertText = new vscode.SnippetString([
            'def function ${1:CoreSystemOrchestrator}',
            '  name "${2:Core System Orchestrator}"',
            '  description "${3:Main orchestration engine for the system}"',
            '  owner "${4:Systems Architecture Team}"',
            '  safetylevel ${5|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}',
            '  enables ${6:SystemFeature}',
            '  allocatedto ${7:SystemComponent}',
            '  ${0}'
        ].join('\n'));
        functionTemplate.detail = 'Complete def function Template';
        functionTemplate.documentation = new vscode.MarkdownString('**def function Definition**\n\nSystem def function with allocation and enablement.');
        functionTemplate.filterText = 'function';
        functionTemplate.sortText = '0_function_template';
        this.templates.set('function', functionTemplate);

        // Feature Template
        const featureTemplate = new vscode.CompletionItem('feature (template)', vscode.CompletionItemKind.Snippet);
        featureTemplate.insertText = new vscode.SnippetString([
            'feature ${1:FeatureName} ${2|mandatory,optional,alternative,or|}',
            '  name "${3:Feature Name}"',
            '  description "${4:Description of the feature}"',
            '  owner "${5:Team Name}"',
            '  tags "${6:tag1}", "${7:tag2}"',
            '  safetylevel ${8|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}',
            '  ${0}'
        ].join('\n'));
        featureTemplate.detail = 'Feature Definition Template';
        featureTemplate.documentation = new vscode.MarkdownString('**Feature Definition**\n\nInserts a complete feature template with variability type and standard properties.');
        featureTemplate.filterText = 'feature';
        featureTemplate.sortText = '0_feature_template';
        this.templates.set('feature', featureTemplate);

        // Functional Requirement Template
        const requirementTemplate = new vscode.CompletionItem('functionalrequirement (template)', vscode.CompletionItemKind.Snippet);
        requirementTemplate.insertText = new vscode.SnippetString([
            'functionalrequirement ${1:FSR_SYSTEM_001}',
            '  name "${2:Driver Command Recognition}"',
            '  description "${3:System shall recognize valid driver commands}"',
            '  rationale "${4:Driver must be able to control system operation}"',
            '  safetylevel ${5|ASIL-A,ASIL-B,ASIL-C,ASIL-D,QM|}',
            '  ',
            '  specification',
            '    "${6:The system shall detect user input within 50ms',
            '     of activation under all environmental conditions.}"',
            '  ',
            '  verificationcriteria',
            '    criterion "${7:Response time measurement}"',
            '    method "${8:Automated test with signal analyzer}"',
            '    acceptance "${9:Response time < 50ms in 99.9% of tests}"',
            '  ',
            '  allocatedto ${10:ComponentName}',
            '  satisfies ${11:SG_SYSTEM_001}',
            '  derivedfrom ${12:SysReq_SYSTEM_001}',
            '  ${0}'
        ].join('\n'));
        requirementTemplate.detail = 'Complete Functional Requirement Template';
        requirementTemplate.documentation = new vscode.MarkdownString('**Functional Safety Requirement**\n\nISO 26262 functional requirement with verification.');
        requirementTemplate.filterText = 'functionalrequirement';
        requirementTemplate.sortText = '0_functionalrequirement_template';
        this.templates.set('functionalrequirement', requirementTemplate);
    }

    public resolveCompletionItem(
        item: vscode.CompletionItem,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CompletionItem> {
        return item;
    }
}