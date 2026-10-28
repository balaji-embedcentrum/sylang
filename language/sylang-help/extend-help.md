---
**📚 Sylang Help Documentation | Version 3.0.12**
---

> **Strings:** write single-line text in double quotes, `"like this"`. Use triple quotes `"""..."""` for text that spans several lines or contains a `"`. Both forms are valid in every property.

# Sylang Extension System (.sylangextend)

## Overview

The Sylang Extension System allows you to add custom properties to existing node types without modifying the core language. This enables ontology-based customization for automotive, aerospace, agile, or any other industry-specific requirements.

**Key Features:**
- ✅ Add custom properties to any node type
- ✅ Define inline enums for controlled values
- ✅ Extend existing built-in enums with new values
- ✅ Type-safe validation (string, number, boolean, enum)
- ✅ Works seamlessly with all Sylang features (dashboards, traceability, doc views)
- ✅ Zero impact on existing files

---

## File Location

Place a `.sylangextend` file in your workspace root:

```
workspace/
  ├── .sylangextend          # Extension definitions
  ├── requirements/
  ├── tests/
  └── features/
```

The extension system automatically discovers and loads `.sylangextend` files when the workspace opens.

---

## Syntax

### Basic Rules

1. **All identifiers must be lowercase**
2. **No symbols** (no hyphens, underscores, special characters)
3. **Only alphanumeric characters** (letters + numbers)
4. **Indentation**: 4 spaces per level
5. **Comments**: Start with `#`

### Extend Node Types

Add custom properties to existing node types. `<nodetype>` is the word after `def` or `hdef` in the model: `requirement`, `testcase`, `function`, `block`, `hazard`, `feature`, `epic`, `story` and so on. A name that is not a node type is accepted but applies to nothing, so `test` does not extend test cases.

```sylang
extend nodetype <nodetype>
    property <name> <type>
    property <name> enum <value1> <value2> ...
```

**Supported Types:**
- `string` - Text values
- `number` - Numeric values
- `boolean` - true/false values
- `enum` - Controlled list of values (inline)

### Extend Enums

Add new values to existing built-in enum properties:

```sylang
extend enum <enumname>
    <value1>
    <value2>
    ...
```

---

## Examples

### Automotive (ISO 26262)

```sylang
# ISO 26262 Automotive Safety Extensions

extend nodetype requirement
    property asil enum qm asila asilb asilc asild
    property faultclass enum transient permanent intermittent
    property diagnosticcoverage number
    property safetymechanism string
    property fmearef string

extend nodetype testcase
    property testtype enum unit integration system
    property coverage number
    property asil enum qm asila asilb asilc asild

extend nodetype hazard
    property severity enum s0 s1 s2 s3
    property exposure enum e0 e1 e2 e3 e4 e5
    property controllability enum c0 c1 c2 c3

# Extend built-in enums
extend enum status
    underreview
    archived

extend enum priority
    showstopper
```

### Aerospace (DO-178C)

```sylang
# DO-178C Aerospace Extensions

extend nodetype requirement
    property dal enum a b c d e
    property certificationevidence string
    property traceability string
    property verificationmethod enum test analysis inspection

extend nodetype testcase
    property dal enum a b c d e
    property coveragetype enum statement decision mcdc
    property coveragepercent number

extend nodetype function
    property partitioning enum os app mixed
    property memoryprotection boolean

extend enum status
    certified
    pendingcertification
```

### Agile/Scrum

```sylang
# Agile/Scrum Extensions

extend nodetype requirement
    property storypoints number
    property sprint string
    property epic string
    property acceptancecriteria string

extend nodetype testcase
    property automationpriority enum high medium low
    property estimatedhours number

extend nodetype epic
    property businessvalue number
    property targetquarter string
    property theme string

extend enum priority
    musthave
    shouldhave
    nicetohave
```

---

## Usage in Sylang Files

Once defined in `.sylangextend`, use extended properties like built-in properties:

### Requirements File (.req)

```sylang
def requirement EPB_REQ_001
    name """Emergency brake activation"""
    description """System shall activate emergency brake when..."""
    
    # Built-in properties
    status approved
    priority high
    
    # Extended properties (from .sylangextend)
    asil asild                    # Automotive
    faultclass permanent          # Automotive
    diagnosticcoverage 99         # Automotive
    safetymechanism """redundancy"""  # Automotive
    storypoints 8                 # Agile
    sprint """Sprint 5"""             # Agile
```

### Test File (.tst)

```sylang
def testcase EPB_TEST_001
    name """Emergency brake activation test"""
    
    # Built-in properties
    status approved
    method HIL
    
    # Extended properties
    testtype integration          # Automotive
    coverage 95                   # Automotive
    asil asild                    # Automotive
    automationpriority high       # Agile
    estimatedhours 4              # Agile
```

---

## Dashboard Integration

Extended properties work seamlessly in dashboards:

```sylang
# Count requirements by ASIL level
  def metric ASILD_REQUIREMENTS
    name "ASIL-D Requirements"
    type count
    sourcetype requirement
    where asil = asild

  # Chart requirements by fault class
  def chart FAULT_DISTRIBUTION
    name "Requirements by Fault Class"
    type pie
    sourcetype requirement
    groupby faultclass

  # Table of high-priority safety requirements
  def table SAFETY_CRITICAL
    name "Safety-Critical Requirements"
    sourcetype requirement
    where asil in (asild, asilc) and priority = high
    columns name, asil, faultclass, safetymechanism
    orderby asil desc
```

---

## In Sylang Studio

Extended properties behave like built-in ones in the Studio inspector:

- They are listed with the element's other properties, and can be added from the **Property…** menu
- Enum and boolean properties are edited from a menu of their values; numbers get a number field
- Enum values added to a built-in enum (for example a `safetylevel` of `SIL-2`) appear in that enum's menu

---

## Validation

### Valid Examples

```sylang
# ✅ Correct syntax
extend nodetype requirement
    property criticality enum low medium high critical
    property domain string
    property testcoverage number
    property verified boolean

# ✅ Correct enum extension
extend enum status
    underreview
    archived
```

### Invalid Examples

```sylang
# ❌ Uppercase not allowed
extend nodetype Requirement
    property Criticality enum Low Medium High

# ❌ Hyphens not allowed
extend nodetype requirement
    property test-coverage number
    property asil-level enum ASIL-D ASIL-C

# ❌ Underscores not allowed
extend nodetype requirement
    property test_coverage number
    property asil_level enum asil_d asil_c

# ❌ Incorrect indentation
extend nodetype requirement
  property criticality enum low medium high  # Only 2 spaces
```

### Sanitization Suggestions

The extension system provides helpful error messages:

```
❌ "Property 'test-coverage' contains invalid characters. 
    Use lowercase letters and numbers only. 
    Suggestion: 'testcoverage'"

❌ "Enum value 'ASIL-D' contains invalid characters. 
    Use lowercase letters and numbers only. 
    Suggestion: 'asild'"
```

---

## Type Validation

### String Properties

```sylang
property domain string
```

**Usage:**
```sylang
domain """safety"""
domain """powertrain"""
```

**Validation:** Any string value is valid

### Number Properties

```sylang
property testcoverage number
property storypoints number
```

**Usage:**
```sylang
testcoverage 95
testcoverage 99.5
storypoints 8
```

**Validation:** Must be a valid number

**Error:**
```
❌ """Property 'testcoverage' expects a number, got 'high'"""
```

### Boolean Properties

```sylang
property verified boolean
property memoryprotection boolean
```

**Usage:**
```sylang
verified true
verified false
```

**Validation:** Must be `true` or `false`

**Error:**
```
❌ """Property 'verified' expects a boolean (true/false), got 'yes'"""
```

### Enum Properties

```sylang
property criticality enum low medium high critical
```

**Usage:**
```sylang
criticality high
criticality critical
```

**Validation:** Must be one of the defined enum values

**Error:**
```
❌ "Invalid enum value 'superhigh' for property 'criticality'. 
    Valid values: low, medium, high, critical"
```

---

## Extending Built-in Enums

Sylang has built-in enum properties like `status`, `priority`, `reqtype`. You can add new values:

### Built-in Enums

- `status`: draft, review, approved, deprecated, implemented, accepted, rejected, etc.
- `priority`: low, medium, high, critical
- `reqtype`: functional, nonfunctional, system, software, hardware, interface, safety, etc.
- `safetylevel`: ASIL-A, ASIL-B, ASIL-C, ASIL-D, QM, SIL-1, SIL-2, SIL-3, SIL-4
- `method`: MIL, SIL, PIL, HIL, VIL, manual, automated
- `testresult`: pass, fail, intest, notrun, blocked

### Extending Built-in Enums

```sylang
# Add new status values
extend enum status
    underreview
    archived
    pendingapproval

# Add new priority values
extend enum priority
    showstopper
    blocker

# Add new requirement types
extend enum reqtype
    business
    legal
    regulatory
```

**Usage:**
```sylang
def requirement REQ_001
    status underreview        # New value from extension
    priority showstopper      # New value from extension
    reqtype business          # New value from extension
```

---

## Best Practices

### 1. Use Descriptive Names

```sylang
# ✅ Good
property diagnosticcoverage number
property verificationmethod enum test analysis inspection

# ❌ Avoid abbreviations
property diagcov number
property vermethod enum t a i
```

### 2. Group Related Properties

```sylang
# ✅ Good - group by domain
extend nodetype requirement
    # Safety properties
    property asil enum qm asila asilb asilc asild
    property safetymechanism string
    property fmearef string
    
    # Agile properties
    property storypoints number
    property sprint string
    property epic string
```

### 3. Use Enums for Controlled Values

```sylang
# ✅ Good - use enum for controlled values
property testtype enum unit integration system

# ❌ Avoid string for controlled values
property testtype string  # Allows any value, no validation
```

### 4. Document Your Extensions

```sylang
# ISO 26262 Automotive Safety Extensions
# Compliant with ISO 26262:2018

extend nodetype requirement
    property asil enum qm asila asilb asilc asild  # Automotive Safety Integrity Level
    property faultclass enum transient permanent intermittent  # Fault classification
```

---

## Hot Reload

The extension system automatically reloads when `.sylangextend` files change:

1. **Edit** `.sylangextend` file
2. **Save** the file
3. **Automatic reload** - all open files are revalidated
4. **Diagnostics update** - errors/warnings refresh immediately

---

## Troubleshooting

### Extension Not Loading

**Problem:** Properties not recognized

**Solution:**
1. Check file name is exactly `.sylangextend` (no `.txt` or other extension)
2. Check the file is inside the workspace (every `.sylangextend` in the workspace is loaded)
3. Check VS Code Output panel for errors
4. Reload VS Code window: `Ctrl+Shift+P` → "Reload Window"

### Validation Errors

**Problem:** "Invalid characters" error

**Solution:**
- Use only lowercase letters and numbers
- Remove hyphens: `test-coverage` → `testcoverage`
- Remove underscores: `test_coverage` → `testcoverage`
- Remove uppercase: `TestCoverage` → `testcoverage`

### Property Not Showing in Studio

**Problem:** Extended property doesn't appear in the Studio inspector

**Solution:**
1. Ensure the property is defined in `.sylangextend` for the element's kind (the word after `def`)
2. Save the `.sylangextend` file
3. Close and reopen the Sylang file

---

## FAQ

### Q: Can I create new node types?

**A:** No. The extension system only allows adding properties to existing node types (requirement, testcase, feature, etc.). This maintains architectural consistency.

### Q: Can I create new relationships?

**A:** No. Only properties can be extended. Relationships are part of the core language architecture.

### Q: Can I have multiple `.sylangextend` files?

**A:** Currently, the system loads all `.sylangextend` files in the workspace and merges them. Properties from all files are combined.

### Q: Do extended properties work in all features?

**A:** Yes! Extended properties work in:
- ✅ Validation and diagnostics
- ✅ The Studio inspector (shown, edited and added like built-in properties)
- ✅ Dashboard and spec queries (`where`, `groupby`, `orderby`, `columns`)

They do not create traceability: relations are part of the core language.

### Q: What happens if I remove a property from `.sylangextend`?

**A:** Files using that property will show validation errors. The values stay in the files and are reported as unknown properties until you remove them or define the property again.

### Q: Can I use extended properties in relationships?

**A:** Extended properties are for data only. Relationships use the built-in relationship keywords (satisfies, implements, etc.).

---

## Version

Extension system introduced in **Sylang v2.29.0**

---

## See Also

- [Sylang Language Reference](SYLANG_COMPLETE_REFERENCE.md)
- [Dashboard Help](dash-help.md)
- [Requirements Help](req-help.md)
- [Test Help](tst-help.md)

