# Sylang Relations Matrix

## Complete Traceability Reference

This document provides a comprehensive view of all **150+ relations** programmed in Sylang, organized by source file type for complete system traceability.

> 💡 **Best Viewing Experience**: Right-click this file → "Open Preview" OR press `Ctrl+Shift+V` (`Cmd+Shift+V` on Mac)

---

## 🎯 Complete Traceability Chain

```
Feature ↔ Function ↔ Block ↔ Interface ↔ Requirement ↔ Test
   ↓         ↓         ↓         ↓          ↓         ↓
Variant   Detection  Characteristic  ---   Safety   Verification
```

---

## 📋 Table of Contents

1. [Product Line & Variability](#product-line--variability)
2. [Feature Model (.fml)](#feature-model-fml)
3. [Function Group (.fun)](#function-group-fun)
4. [Requirements (.req)](#requirements-req)
5. [Test Cases (.tst)](#test-cases-tst)
6. [Block Definition (.blk)](#block-definition-blk)
7. [Interface Definition (.ifc)](#interface-definition-ifc)
8. [Safety & FMEA](#safety--fmea)
9. [Diagrams & Workflows](#diagrams--workflows)
10. [Summary Statistics](#-summary-statistics)

---

## Product Line & Variability

### Product Line (.ple)

No outgoing relations - root of product line hierarchy.

### Feature Model (.fml)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| featureset | `listedfor` | productline | `.ple` | Single | Feature set belongs to product line |
| feature | `performs` | function | `.fun` | Multiple | Feature performs functions (functional mapping) |
| feature | `needs` | operation | `.ifc` | Multiple | Feature requires input operations |
| feature | `needs` | signal | `.ifc` | Multiple | Feature requires input signals |
| feature | `provides` | operation | `.ifc` | Multiple | Feature provides output operations |
| feature | `provides` | signal | `.ifc` | Multiple | Feature provides output signals |
| feature | `requires` | feature | `.fml` | Multiple | Feature requires other features (dependencies) |
| feature | `excludes` | feature | `.fml` | Multiple | Feature excludes other features (mutual exclusion) |
| feature | `inherits` | feature | `.fml` | Multiple | Feature inherits from parent feature |
| feature | `meets` | characteristic | `.blk` | Multiple | Feature meets product characteristics |

### Variant Model (.vml)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| variantset | `extends` | featureset | `.fml` | Single | Variant extends feature model |
| variantset | `inherits` | variantset | `.vml` | Multiple | Variant inherits from other variants |

### Variant Config (.vcf)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| configset | `generatedfrom` | variantset | `.vml` | Single | Config generated from variant selection |
| config | `basedon` | feature | `.fml` | Single | Config based on feature selection |
| config | `inherits` | config | `.vcf` | Multiple | Config inherits from parent config |

---

## Function Group (.fun)

### 🔥 Core Traceability Relations

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| function | `enables` | feature | `.fml` | Multiple | Function enables features (reverse of performs) |
| function | `allocatedto` | block | `.blk` | **Single** | Function allocated to single block |
| function | `decomposedfrom` | function | `.fun` | **Single** | Bottom-up function composition |
| function | `decomposesto` | function | `.fun` | Multiple | Top-down function decomposition |
| function | `derivedfrom` | requirement | `.req` | Multiple | Function derived from requirements |
| function | `implementedby` | requirement | `.req` | Multiple | Function implemented by requirements |

### 🛡️ Safety & Diagnostics

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| function | `detects` | malfunction | `.flr` | Multiple | Function detects malfunctions (safety diagnostics) |
| function | `detects` | failure | `.flr` | Multiple | Function detects failure modes (safety diagnostics) |
| function | `detects` | failuremode | `.flr` | Multiple | Function detects failure modes (alias) |

### 🔌 Interface Relations

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| function | `needs` | operation | `.ifc` | Multiple | Function needs input operations |
| function | `needs` | signal | `.ifc` | Multiple | Function needs input signals |
| function | `provides` | operation | `.ifc` | Multiple | Function provides output operations |
| function | `provides` | signal | `.ifc` | Multiple | Function provides output signals |
| function | `requires` | parameter | `.ifc` | Multiple | Function requires parameters |
| function | `meets` | characteristic | `.blk` | Multiple | Function meets product characteristics |
| function | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

---

## Requirements (.req)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| requirement | `refinedfrom` | requirement | `.req` | Multiple | Requirement refined from higher-level requirement |
| requirement | `derivedfrom` | requirement | `.req` | Multiple | Requirement derived from other requirements |
| requirement | `implements` | function | `.fun` | Multiple | Requirement implements function |
| requirement | `allocatedto` | block | `.blk` | Multiple | Requirement allocated to blocks |
| requirement | `requires` | parameter | `.ifc` | Multiple | Requirement requires parameters |
| requirement | `meets` | characteristic | `.blk` | Multiple | Requirement meets product characteristics |
| requirement | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

---

## Test Cases (.tst)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| testcase | `refinedfrom` | testcase | `.tst` | Multiple | Test case refined from other test cases |
| testcase | `derivedfrom` | requirement | `.req` | Multiple | Test case derived from requirements |
| testcase | `satisfies` | requirement | `.req` | Multiple | Test case satisfies/verifies requirements |
| testcase | `requires` | parameter | `.ifc` | Multiple | Test case requires parameters |
| testcase | `meets` | characteristic | `.blk` | Multiple | Test case meets product characteristics |
| testcase | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

---

## Block Definition (.blk)

### 🔥 Core Traceability Relations

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| block | `decomposedfrom` | block | `.blk` | **Single** | Bottom-up block composition |
| block | `decomposesto` | block | `.blk` | Multiple | Top-down block decomposition |
| block | `implements` | function | `.fun` | Multiple | Block implements functions |
| block | `enables` | feature | `.fml` | Multiple | Block enables features |
| block | `derivedfrom` | requirement | `.req` | Multiple | Block derived from requirements |
| block | `implementedby` | requirement | `.req` | Multiple | Block implemented by requirements |

### 🔌 Interface Relations

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| block | `needs` | operation | `.ifc` | Multiple | Block needs input operations |
| block | `needs` | signal | `.ifc` | Multiple | Block needs input signals |
| block | `provides` | operation | `.ifc` | Multiple | Block provides output operations (via def operation) |
| block | `provides` | signal | `.ifc` | Multiple | Block provides output signals (via def signal) |
| block | `requires` | parameter | `.ifc` | Multiple | Block requires parameters |
| block | `requires` | datatype | `.ifc` | Multiple | Block requires datatypes |
| block | `meets` | characteristic | `.blk` | Multiple | Block meets product characteristics |
| block | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |


### 📏 Product Characteristics (AIAG VDA)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| characteristic | `derivedfrom` | requirement | `.req` | Multiple | Characteristic derived from requirements (AIAG VDA) |
| characteristic | `implementedby` | requirement | `.req` | Multiple | Characteristic implemented by requirements (AIAG VDA) |
| characteristic | `meets` | requirement | `.req` | Multiple | Characteristic meets requirements |
| characteristic | `verifiedby` | testcase | `.tst` | Multiple | Characteristic verified by test cases |

---

## Interface Definition (.ifc)

### 🔥 Core Traceability Relations

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| interfaceset | `decomposedfrom` | interfaceset | `.ifc` | **Single** | Bottom-up interface composition |
| interfaceset | `decomposesto` | interfaceset | `.ifc` | Multiple | Top-down interface decomposition |
| interfaceset | `allocatedto` | block | `.blk` | **Single** | Interface allocated to single block |
| interfaceset | `derivedfrom` | requirement | `.req` | Multiple | Function derived from requirements |

### 🔌 Operations

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| operation | `derivedfrom` | requirement | `.req` | Multiple | Operation derived from requirements |
| operation | `implementedby` | requirement | `.req` | Multiple | Operation implemented by requirements |
| operation | `requires` | datatype | `.ifc` | Multiple | Operation requires datatypes |
| operation | `meets` | characteristic | `.blk` | Multiple | Operation meets product characteristics |
| operation | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |
| operation | `derivedfrom` | requirement | `.req` | Multiple | Function derived from requirements |

### 📡 Signals

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| signal | `derivedfrom` | requirement | `.req` | Multiple | Signal derived from requirements |
| signal | `implementedby` | requirement | `.req` | Multiple | Signal implemented by requirements |
| signal | `requires` | datatype | `.ifc` | Multiple | Signal requires datatypes |
| signal | `meets` | characteristic | `.blk` | Multiple | Signal meets product characteristics |
| signal | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |
| signal | `derivedfrom` | requirement | `.req` | Multiple | Function derived from requirements |

### 📊 Datatypes & Parameters

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| datatype | `derivedfrom` | requirement | `.req` | Multiple | Datatype derived from requirements |
| datatype | `implementedby` | requirement | `.req` | Multiple | Datatype implemented by requirements |
| parameter | `derivedfrom` | requirement | `.req` | Multiple | Parameter derived from requirements |
| parameter | `implementedby` | requirement | `.req` | Multiple | Parameter implemented by requirements |
| parameter | `requires` | datatype | `.ifc` | Multiple | Parameter requires datatypes |

---

## Safety & FMEA

### Failure Analysis (.flr)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| failureset | `propagateto` | failureset | `.flr` | Multiple | Failure propagates to upper-level FMEA |
| failureset | `occursin` | block | `.blk` | Multiple | Failure occurs in specific blocks |
| failuremode | `causedby` | failuremode | `.flr` | Multiple | Failure mode caused by other failure modes |
| failuremode | `effects` | failuremode | `.flr` | Multiple | Failure mode has effects (other failure modes) |
| failuremode | `detectedby` | function | `.fun` | Multiple | Failure detected by functions |
| failuremode | `mitigatedby` | function | `.fun` | Multiple | Failure mitigated by functions |
| failuremode | `testedby` | testcase | `.tst` | Single | Failure tested by test case |
| failuremode | `derivedfrom` | requirement | `.req` | Multiple | Failure derived from requirements |
| failuremode | `definedby` | requirement | `.req` | Multiple | Failure defined by requirements |
| failuremode | `allocatedto` | block | `.blk` | Multiple | Failure allocated to blocks |
| failuremode | `affects` | function | `.fun` | Multiple | Failure affects functions |
| failuremode | `requires` | parameter | `.ifc` | Multiple | Failure requires parameters |
| failuremode | `meets` | characteristic | `.blk` | Multiple | Failure meets product characteristics |
| failuremode | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

### Hazard Analysis (.haz) - ISO 26262

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| hazard | `malfunctionof` | function | `.fun` | Multiple | Hazard caused by malfunction of function |
| hazard | `affects` | feature | `.fml` | Multiple | Hazard affects features |
| hazard | `leadsto` | requirement | `.req` | Multiple | Hazard leads to safety goal (requirement) |
| situation | `requires` | parameter | `.ifc` | Multiple | Operational situation requires parameters |
| situation | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

### Safety Mechanisms (.sam) - ISO 26262

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| safetymechanism | `satisfies` | requirement | `.req` | Multiple | Safety mechanism satisfies requirements |
| safetymechanism | `mitigates` | hazard | `.haz` | Multiple | Safety mechanism mitigates hazards |
| safetymechanism | `allocatedto` | block | `.blk` | Multiple | Safety mechanism allocated to blocks |
| safetymechanism | `implementedby` | function | `.fun` | Multiple | Safety mechanism implemented by functions |
| safetymechanism | `detects` | failuremode | `.flr` | Multiple | Safety mechanism detects failure modes |
| safetymechanism | `verifiedby` | testcase | `.tst` | Multiple | Safety mechanism verified by test cases |
| safetymechanism | `requires` | parameter | `.ifc` | Multiple | Safety mechanism requires parameters |
| safetymechanism | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

### Fault Tree Analysis (.fta)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| faulttree | `topevent` | failuremode | `.flr` | Single | Fault tree top event references failure mode |
| gate | `input` | failuremode | `.flr` | Multiple | Gate input from failure modes |
| gate | `input` | gate | `.fta` | Multiple | Gate input from other gates |
| gate | `output` | failuremode | `.flr` | Single | Gate output to failure mode |
| gate | `output` | gate | `.fta` | Single | Gate output to other gates |
| gate | `allocatedto` | block | `.blk` | Multiple | Gate allocated to blocks |
| gate | `requires` | parameter | `.ifc` | Multiple | Gate requires parameters |
| gate | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

### Item Definition (.itm) - ISO 26262

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| boundary | `includes` | block | `.blk` | Multiple | Item boundary includes blocks |
| boundary | `excludes` | block | `.blk` | Multiple | Item boundary excludes blocks |
| boundary | `itemscope` | function | `.fun` | Multiple | Item scope includes functions |
| operatingmode | `requires` | parameter | `.ifc` | Multiple | Operating mode requires parameters |
| operatingmode | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

---

## Diagrams & Workflows

### Sprint Management (.spr)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| sprint | `assignedto` | agent | `.agt` | Single | Sprint task assigned to agent |

### Use Case Diagram (.ucd)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| usecase | `associated` | actor | `.ucd` | Multiple | Use case associated with actors (legacy syntax) |
| usecase | `includes` | usecase | `.ucd` | Multiple | Use case includes other use cases (legacy syntax) |
| usecase | `from` | actor | `.ucd` | Single | Use case connection from actor (new syntax v2.21.44) |
| usecase | `to` | usecase | `.ucd` | Single | Use case connection to another use case (new syntax) |
| usecase | `requires` | parameter | `.ifc` | Multiple | Use case requires parameters |
| usecase | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

### Sequence Diagram (.seq)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| fragment | `from` | block | `.seq` | Single | Message flow from source block |
| fragment | `to` | block | `.seq` | Single | Message flow to target block |
| fragment | `flow` | operation | `.ifc` | Single | Message carries operation/signal reference |
| fragment | `requires` | parameter | `.ifc` | Multiple | Fragment requires parameters |
| fragment | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

### State Machine Diagram (.smd)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| statemachine | `allocatedto` | block | `.blk` | Multiple | State machine allocated to blocks |
| statemachine | `implements` | requirement | `.req` | Multiple | State machine implements requirements |
| transition | `from` | state | `.smd` | Single | Transition from source state |
| transition | `to` | state | `.smd` | Single | Transition to target state |
| transition | `call` | function | `.fun` | Single | Transition calls function |
| transition | `requires` | parameter | `.ifc` | Multiple | Transition requires parameters |
| transition | `when` | config | `.vcf` | Single | Conditional visibility based on configuration |

---

## 📊 Summary Statistics

### Relations by Category

| Category | Count | Purpose |
|:---------|:-----:|:--------|
| **Product Line & Variability** | 13 | Feature modeling & product line engineering |
| **Function Relations** | 15 | Functional architecture & traceability |
| **Requirements Relations** | 7 | Requirements management |
| **Test Relations** | 6 | Test case management & verification |
| **Block Relations** | 16 | Hardware/software architecture |
| **Interface Relations** | 19 | Interface specifications (MANDATORY for ASPICE) |
| **Safety & FMEA** | 42 | Safety analysis & failure management |
| **Diagrams & Workflows** | 14 | System modeling & project management |
| **TOTAL** | **150+** | **Complete system traceability** |

### Multiplicity Breakdown

| Multiplicity | Count | Notes |
|:-------------|:-----:|:------|
| **Single** | 24 | Critical allocations (function→block, interface→block) |
| **Multiple** | 126+ | Most relations support multiple targets |

### File Type Coverage

| File Extension | Outgoing Relations | Purpose |
|:---------------|:------------------:|:--------|
| `.fml` | 10 | Feature modeling & product line engineering |
| `.fun` | 15 | Functional architecture & traceability |
| `.req` | 7 | Requirements management |
| `.tst` | 6 | Test case management & verification |
| `.blk` | 16 | Hardware/software architecture |
| `.ifc` | 19 | Interface specifications (MANDATORY for ASPICE) |
| `.flr` | 13 | FMEA & failure analysis |
| `.haz` | 3 | ISO 26262 hazard analysis |
| `.sam` | 8 | ISO 26262 safety mechanisms |
| `.fta` | 7 | Fault tree analysis |
| `.ucd` | 6 | Use case diagrams |
| `.seq` | 5 | Sequence diagrams |
| `.smd` | 7 | State machine diagrams |
| `.vml` | 2 | Variant modeling |
| `.vcf` | 3 | Configuration management |
| `.spr` | 1 | Sprint/agile management |
| `.itm` | 4 | ISO 26262 item definition |
| `.agt` | 0 | Agent definitions (no outgoing) |
| `.ple` | 0 | Product line (root node) |

---

## 🎓 Quick Reference: Common Patterns

### Pattern 1: System Decomposition

```
Parent Function
  ├─ decomposesto → Child Function 1
  ├─ decomposesto → Child Function 2
  └─ decomposesto → Child Function 3

Child Function 1
  └─ decomposedfrom → Parent Function (single only)
```

### Pattern 2: Complete Traceability

```
Feature ─performs→ Function ─enables→ Feature
Function ─allocatedto→ Block (single) ─implements→ Function
Function ─derivedfrom→ Requirement ─implements→ Function
```

### Pattern 3: Safety Diagnostics

```
Function ─detects→ Malfunction/Failure
SafetyMechanism ─detects→ FailureMode
FailureMode ─detectedby→ Function
```

### Pattern 4: Interface Mapping (MANDATORY for ASPICE)

```
Block ─needs→ Operation (input)
Block ─provides→ Operation (output via def operation)
Operation ─requires→ Datatype
```

---

**Generated for Sylang v2.26.77**  
**Last Updated: 2025-10-03**

For more information, visit [sylang.dev](https://sylang.dev)

---

## Documentation & Dashboards

### Specification Document (.spec)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| specification | `use` | requirementset | `.req` | Multiple | References requirement sets |
| specification | `use` | functionset | `.fun` | Multiple | References function sets |
| specification | `use` | blockset | `.blk` | Multiple | References block sets |
| specification | `use` | testcaseset | `.tst` | Multiple | References test sets |
| specification | `use` | usecaseset | `.ucd` | Multiple | References use case sets |
| specification | `use` | sequenceset | `.seq` | Multiple | References sequence sets |
| specification | `use` | failuremodeset | `.flr` | Multiple | References failure mode sets |
| specification | `use` | faulttreeset | `.fta` | Multiple | References fault tree sets |
| specification | `use` | hazardset | `.haz` | Multiple | References hazard sets |
| specification | `use` | agentset | `.agt` | Multiple | References agent sets |
| specification | `use` | sprintset | `.spr` | Multiple | References sprint sets |
| specification | `use` | statemachineset | `.smd` | Multiple | References state machine sets |
| specification | `use` | variantset | `.vml` | Multiple | References variant sets |
| specification | `use` | configset | `.vcf` | Multiple | References config sets |
| specification | `use` | interfaceset | `.ifc` | Multiple | References interface sets |
| spec/diagram/table | `source` | requirementset | `.req` | Single | Data source for content |
| spec/diagram/table | `source` | functionset | `.fun` | Single | Data source for content |
| spec/diagram/table | `source` | blockset | `.blk` | Single | Data source for content |
| spec/diagram/table | `source` | testcaseset | `.tst` | Single | Data source for content |
| spec/diagram/table | `source` | usecaseset | `.ucd` | Single | Data source for content |
| spec/diagram/table | `source` | sequenceset | `.seq` | Single | Data source for content |
| spec/diagram/table | `source` | failuremodeset | `.flr` | Single | Data source for content |
| spec/diagram/table | `source` | faulttreeset | `.fta` | Single | Data source for content |
| spec/diagram/table | `source` | hazardset | `.haz` | Single | Data source for content |
| spec/diagram/table | `source` | agentset | `.agt` | Single | Data source for content |
| spec/diagram/table | `source` | sprintset | `.spr` | Single | Data source for content |
| spec/diagram/table | `source` | statemachineset | `.smd` | Single | Data source for content |
| spec/diagram/table | `source` | variantset | `.vml` | Single | Data source for content |
| spec/diagram/table | `source` | configset | `.vcf` | Single | Data source for content |
| spec/diagram/table | `source` | interfaceset | `.ifc` | Single | Data source for content |

**Key Features:**
- Dynamic content generation from any Sylang artifact
- Advanced filtering with `where` clauses
- Data aggregation with `groupby` and `orderby`
- Professional HTML export for documentation
- Hierarchical section organization

### Dashboard (.dash)

| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| dashboard | `use` | requirementset | `.req` | Multiple | References requirement sets |
| dashboard | `use` | functionset | `.fun` | Multiple | References function sets |
| dashboard | `use` | blockset | `.blk` | Multiple | References block sets |
| dashboard | `use` | testcaseset | `.tst` | Multiple | References test sets |
| dashboard | `use` | usecaseset | `.ucd` | Multiple | References use case sets |
| dashboard | `use` | sequenceset | `.seq` | Multiple | References sequence sets |
| dashboard | `use` | failuremodeset | `.flr` | Multiple | References failure mode sets |
| dashboard | `use` | faulttreeset | `.fta` | Multiple | References fault tree sets |
| dashboard | `use` | hazardset | `.haz` | Multiple | References hazard sets |
| dashboard | `use` | agentset | `.agt` | Multiple | References agent sets |
| dashboard | `use` | sprintset | `.spr` | Multiple | References sprint sets |
| dashboard | `use` | statemachineset | `.smd` | Multiple | References state machine sets |
| dashboard | `use` | variantset | `.vml` | Multiple | References variant sets |
| dashboard | `use` | configset | `.vcf` | Multiple | References config sets |
| dashboard | `use` | interfaceset | `.ifc` | Multiple | References interface sets |
| metric/chart/table | `source` | requirementset | `.req` | Single | Data source for widget |
| metric/chart/table | `source` | functionset | `.fun` | Single | Data source for widget |
| metric/chart/table | `source` | blockset | `.blk` | Single | Data source for widget |
| metric/chart/table | `source` | testcaseset | `.tst` | Single | Data source for widget |
| metric/chart/table | `source` | usecaseset | `.ucd` | Single | Data source for widget |
| metric/chart/table | `source` | sequenceset | `.seq` | Single | Data source for widget |
| metric/chart/table | `source` | failuremodeset | `.flr` | Single | Data source for widget |
| metric/chart/table | `source` | faulttreeset | `.fta` | Single | Data source for widget |
| metric/chart/table | `source` | hazardset | `.haz` | Single | Data source for widget |
| metric/chart/table | `source` | agentset | `.agt` | Single | Data source for widget |
| metric/chart/table | `source` | sprintset | `.spr` | Single | Data source for widget |
| metric/chart/table | `source` | statemachineset | `.smd` | Single | Data source for widget |
| metric/chart/table | `source` | variantset | `.vml` | Single | Data source for widget |
| metric/chart/table | `source` | configset | `.vcf` | Single | Data source for widget |
| metric/chart/table | `source` | interfaceset | `.ifc` | Single | Data source for widget |

**Key Features:**
- Real-time metrics (count, percentage, sum, avg, min, max, gauge, trend)
- Interactive Chart.js visualizations (bar, line, pie, scatter, gauge)
- Grid-based layouts with widget spanning
- Advanced filtering and aggregation
- HTML export for sharing

---

## 📊 Updated Summary Statistics

- **Total File Types**: 21 (including .spec and .dash)
- **Total Relation Types**: 170+ (including documentation relations)
- **Traceability Chains**: Complete bilateral traceability
- **Documentation Support**: Dynamic content generation and dashboards

