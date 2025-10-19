# Sylang AI Prompting Strategy

**Version**: 1.0.0  
**Philosophy**: AI creates, humans validate

---

## Overview

This directory contains curated prompts to help users leverage AI tools (GitHub Copilot, ChatGPT, Claude, Cursor AI, etc.) to efficiently create Sylang files. Sylang was built from the ground up with the philosophy that **AI creates, humans validate** - meaning AI assistants excel at generating structured DSL content when given proper context.

---

## General Prompting Strategy

### 1. **Context-First Approach**
Always provide AI with:
- **What you're building**: Product/system domain
- **File type**: Which Sylang extension (.req, .blk, .fml, etc.)
- **Relationships**: Which other files/symbols to reference
- **Standards**: Compliance requirements (ISO 26262, ASPICE, etc.)
- **Scope**: How many items to generate (5 requirements, 10 features, etc.)

### 2. **Iterative Refinement**
- Start with high-level structure
- Let AI generate initial content
- Review and refine specific sections
- Add detailed descriptions and properties
- Validate relationships and traceability

### 3. **Leverage Examples**
- Reference existing Sylang files in your project
- Show AI successful patterns from help files
- Use syntax structures as templates

### 4. **Validation Workflow**
```
AI Generation → Human Review → Refinement Prompts → Validation → Commit
```

---

## Prompt Template Structure

### Basic Template
```
I need help creating a Sylang [FILE_TYPE] file for [DOMAIN/PROJECT].

Context:
- File type: [.req / .blk / .fml / etc.]
- Purpose: [Brief description]
- References: [Other files/symbols to use]
- Standards: [ISO 26262 ASIL-D / ASPICE / etc.]
- Scope: [Number of items to generate]

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]
- [Specific requirement 3]

Please generate the Sylang file with:
1. Proper syntax structure
2. Complete property definitions
3. Traceability relationships
4. Multiline descriptions using """
5. Appropriate safety levels and compliance tags
```

### Advanced Template (with existing context)
```
I'm working on [PROJECT_NAME] and need to extend the following Sylang file:

[PASTE EXISTING FILE CONTENT]

Please add:
- [Specific additions]

Maintain:
- Existing naming conventions
- Current ASIL levels
- Traceability relationships
- Consistent indentation and style

Generate only the new sections to be added.
```

---

## File-Specific Prompt Files

Each `XXXX-prompt.txt` file contains:
1. **Purpose**: What this file type is for
2. **When to use it**: Project phase/context
3. **Key syntax elements**: Must-have keywords
4. **Common patterns**: Typical structures
5. **Example prompts**: 3-5 ready-to-use prompts
6. **Validation checklist**: What to verify after generation

### Available Prompt Files

#### Core Product Line
- `ple-prompt.txt` - Product Line Engineering (root file)
- `fml-prompt.txt` - Feature Model creation
- `vml-prompt.txt` - Variant Model (usually auto-generated)
- `vcf-prompt.txt` - Variant Configuration (auto-generated)

#### Architecture & Design
- `blk-prompt.txt` - Block definitions (hardware/software architecture)
- `fun-prompt.txt` - Function definitions (functional behavior)
- `ifc-prompt.txt` - Interface definitions (operations/signals/datatypes)

#### Requirements & Testing
- `req-prompt.txt` - Requirements with traceability
- `tst-prompt.txt` - Test case definitions

#### Behavioral Modeling
- `ucd-prompt.txt` - Use Case Diagrams
- `seq-prompt.txt` - Sequence Diagrams
- `smd-prompt.txt` - State Machine Diagrams

#### Safety & Reliability (ISO 26262)
- `flr-prompt.txt` - FMEA (Failure Mode and Effects Analysis)
- `itm-prompt.txt` - Item Definition (ISO 26262 Part 3)
- `haz-prompt.txt` - Hazard Analysis (ISO 26262 Part 3)
- `sgl-prompt.txt` - Safety Goals (ISO 26262 Part 3)
- `sam-prompt.txt` - Safety Mechanisms (ISO 26262 Part 4)
- `fta-prompt.txt` - Fault Tree Analysis

#### Project Management
- `spr-prompt.txt` - Sprint Planning (Agile/Scrum)
- `agt-prompt.txt` - AI Agent Definitions

---

## Best Practices

### ✅ DO:
- **Be specific** about domain, scope, and relationships
- **Provide context** from existing project files
- **Reference standards** explicitly (ISO 26262 ASIL-D, etc.)
- **Request multiline descriptions** using triple quotes
- **Ask for complete traceability** (implements, derivedfrom, etc.)
- **Specify safety levels** for automotive/safety-critical systems
- **Request validation-friendly output** (clear identifiers, no duplicates)

### ❌ DON'T:
- Use vague prompts like "create some requirements"
- Skip relationship definitions (use statements)
- Forget to specify safety levels for safety-critical systems
- Mix up file types (e.g., blocks vs functions)
- Request manual .vml or .vcf file creation (these are auto-generated)
- Ignore naming conventions from existing files

---

## AI Tool-Specific Tips

### GitHub Copilot / Cursor AI (in-editor)
- Use inline comments with context: `// Create 5 ASIL-D requirements for brake control`
- Select existing code for context
- Use Chat feature for complex generation
- Leverage workspace context automatically

### ChatGPT / Claude (external)
- Paste full help files or syntax structures for context
- Use multi-turn conversations for iterative refinement
- Export generated content and paste into VSCode
- Validate using Sylang extension diagnostics

### Prompt Engineering Tips
1. **Chain of Thought**: Ask AI to think step-by-step
2. **Few-Shot Learning**: Provide 1-2 examples before asking for generation
3. **Constraint-Based**: Specify "must have X, must not have Y"
4. **Role Assignment**: "You are a functional safety engineer..."
5. **Output Format**: "Generate valid Sylang .req file with proper syntax"

---

## Example Workflow: Creating Requirements from Scratch

### Step 1: High-Level Structure
```
Create a Sylang .req file for autonomous emergency braking (AEB) system.
- ASIL-D safety level
- Reference existing PerceptionSystem block
- Create 10 functional requirements
- Include requirement hierarchy (parent-child)
- Add traceability to safety goals
```

### Step 2: Detailed Requirements
```
For requirement REQ_AEB_001, expand with:
- Detailed description using multiline strings
- Rationale explaining safety criticality
- Verification criteria with measurable metrics
- Derivation from safety goal SG_COLLISION_AVOIDANCE
- Allocation to PerceptionControlModule block
```

### Step 3: Add Test Traceability
```
Add "testedby" relationships to each requirement:
- Link to test cases TC_AEB_001 through TC_AEB_010
- Ensure bidirectional traceability
```

### Step 4: Validate
- Run Sylang validation (automatic in VSCode)
- Check for missing relationships
- Verify ASIL level consistency
- Confirm all references resolve

---

## Traceability Prompt Patterns

### Forward Traceability (Top-Down)
```
Generate requirements that:
- Derive from safety goal SG_001
- Implement function EmergencyBraking
- Allocate to block BrakeControlModule
- Test via testcase TC_EB_001

Include all traceability relationships.
```

### Backward Traceability (Bottom-Up)
```
I have test case TC_BRAKE_001. Generate:
- Requirement it satisfies
- Safety goal that requirement derives from
- Hazard that safety goal mitigates

Create complete bilateral traceability chain.
```

### Cross-Cutting Traceability
```
Create a feature model for adaptive cruise control that traces to:
- Requirements in SafetyRequirements.req
- Blocks in VehicleControl.blk
- Tests in ADASTests.tst

Generate use statements and ref relationships for all connections.
```

---

## ISO 26262 Specific Prompts

### Hazard Analysis to Safety Goals
```
Given this hazard analysis (paste .haz file):
[CONTENT]

Generate safety goals (.sgl file) with:
- Derived from each ASIL-D hazard
- Safe state definitions
- FTTI (Fault Tolerant Time Interval) values
- Emergency operation times
- Forward traceability to requirements
```

### Safety Goals to Requirements
```
From safety goal SG_UNINTENDED_ACCELERATION:
- Generate 5 functional safety requirements
- ASIL-D level inheritance
- derivedfrom ref safetygoal relationship
- Allocated to throttle control blocks
```

### FMEA Generation
```
For VehicleControl.blk, generate AIAG VDA FMEA (.flr file):
- Failure modes for each critical component
- Effects analysis (local, next level, end effect)
- Current controls (detection, prevention)
- Risk assessment (Severity, Occurrence, Detection)
- Action Priority (AP) calculations
- Recommended actions
```

---

## Quick Reference: Relationship Keywords

| Keyword | Usage | Example |
|---------|-------|---------|
| `use` | Import symbols | `use block BrakeController` |
| `ref` | Reference symbol | `allocatedto ref block BrakeController` |
| `implements` | Implement requirement/function | `implements ref function EmergencyBraking` |
| `derivedfrom` | Derive from requirement/safety goal | `derivedfrom ref requirement REQ_001` |
| `allocatedto` | Allocate to block/item | `allocatedto ref block BrakeECU` |
| `testedby` | Tested by testcase | `testedby ref testcase TC_001` |
| `satisfies` | Satisfy requirement | `satisfies ref requirement REQ_001` |
| `leadsto` | Lead to requirement | `leadsto ref requirement REQ_001` |
| `mitigates` | Mitigate hazard | `mitigates ref hazard UnintendedAcceleration` |

---

## Community Contributions

We welcome community-contributed prompts! To contribute:
1. Create a new `XXXX-prompt.txt` file
2. Follow the template structure
3. Include 3-5 example prompts
4. Add validation checklist
5. Submit PR to sylangvscode2.0 repository

---

## Support

- **Documentation**: See individual help files in `sylang-help/`
- **Complete Reference**: `SYLANG_COMPLETE_REFERENCE.md`
- **Issues**: Report on GitHub
- **Community**: Join Sylang Discord/Forums

---

**Remember**: AI creates, humans validate. Use AI to accelerate creation, but always review for correctness, completeness, and compliance.
