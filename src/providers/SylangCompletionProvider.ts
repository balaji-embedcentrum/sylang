import * as vscode from 'vscode';

interface CompletionContext {
    type: 'top-level' | 'after-systemfeatures' | 'after-productline' | 'inside-feature';
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

    private getTopLevelCompletions(): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];
        
        // Add main templates based on language type
        if (this.languageId === 'sylang-productline') {
            items.push(this.templates.get('productline')!);
        }
        if (this.languageId === 'sylang-features') {
            items.push(this.createSystemfeaturesCompletion());
        }
        
        return items.filter(item => item !== undefined);
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
            default:
                return this.keywords;
        }
    }

    private getIndentLevel(line: string): number {
        return line.length - line.trimStart().length;
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