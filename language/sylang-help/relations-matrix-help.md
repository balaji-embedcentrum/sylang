---
**📚 Sylang Help Documentation | Version 3.0.12**
---

> **Strings:** write single-line text in double quotes, `"like this"`. Use triple quotes `"""..."""` for text that spans several lines or contains a `"`. Both forms are valid in every property.

# Sylang Relations Matrix

## Complete Traceability Reference

This document lists, for each file type, the relations its elements can have and the kinds of element each relation points to, seen from both ends. [Relations by file type](#relations-by-file-type) at the end is generated from the language itself.

The **Multiplicity** column is modelling guidance (a child has one parent, for example); the validator does not count targets.

> 💡 **Best viewing**: help files open in the Sylang Markdown viewer, with a contents outline and live links to your model.

---

## Understanding Incoming vs Outgoing Relations (Ontology-Based)

### Key Concept: **Ontology-Based Classification**

Relations are classified based on **which entity actively references the other**, not just syntax placement:

- **Outgoing Relations (O)**: This entity **actively points to/references** another entity
  - Example: `featureset listedfor productline` → Featureset points to Productline (outgoing from Featureset)
  - Example: `function allocatedto block` → Function points to Block (outgoing from Function)
  - Example: `block decomposesto block` → Block points to its children (outgoing from parent Block)

- **Incoming Relations (I)**: Another entity **points to/references** this entity
  - Example: `feature needs ref operation` → From Operation's perspective, Feature points to it (incoming to Operation)
  - Example: `block implements ref function` → From Function's perspective, Block points to it (incoming to Function)
  - Example: `function decomposedfrom function` → From child's perspective, parent points to it (incoming to child)

### Pattern Recognition

| Relation Type | Direction | Reasoning |
|:--------------|:----------|:----------|
| `listedfor` | **O** | Entity lists itself for another (outgoing) |
| `decomposesto` | **O** | Entity points to its children (outgoing) |
| `decomposedfrom` | **I** | Entity is pointed to by parent (incoming) |
| `allocatedto` | **O** | Entity points to where it's allocated (outgoing) |
| `implementedby` | **O** | Entity points to what implements it (outgoing) |
| `implements` | **I** | Entity is pointed to by implementer (incoming) |
| `needs` / `provides` | **I** | From target's perspective, entity points to it (incoming to target) |
| `performs` | **O** | Feature points to function (outgoing from Feature) |
| `enables` | **O** | Function points to feature (outgoing from Function) |

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
10. [Documentation & Dashboards](#documentation--dashboards)
11. [Relations by file type](#relations-by-file-type)

---

## Product Line & Variability

### Product Line (.ple)

**Outgoing Relations**: None (root of product line hierarchy)

**Incoming Relations**:
| Source Type | Relation | Target Type | Target File | Multiplicity | Description |
|:------------|:---------|:------------|:------------|:------------:|:------------|
| featureset | `listedfor` | productline | `.ple` | Single | Feature set belongs to product line |

### Feature Model (.fml)

**Outgoing Relations** (from Feature/Featureset):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| featureset | `listedfor` | productline | `.ple` | Single | **O** | Feature set belongs to product line |
| feature | `performs` | function | `.fun` | Multiple | **O** | Feature performs functions (functional mapping) |
| feature | `requires` | feature | `.fml` | Multiple | **O** | Feature requires other features (dependencies) |
| feature | `excludes` | feature | `.fml` | Multiple | **O** | Feature excludes other features (mutual exclusion) |
| featureset | `inherits` | featureset | `.fml` | Multiple | **O** | Feature set records that it builds on another feature set (a trace; nothing is copied) |
| feature | `meets` | characteristic | `.blk` | Multiple | **O** | Feature meets product characteristics |

**Incoming Relations** (to Feature/Featureset):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| feature | `needs` | operation | `.ifc` | Multiple | **I** | Feature requires input operations (incoming to Operation) |
| feature | `needs` | signal | `.ifc` | Multiple | **I** | Feature requires input signals (incoming to Signal) |
| feature | `provides` | operation | `.ifc` | Multiple | **I** | Feature provides output operations (incoming to Operation) |
| feature | `provides` | signal | `.ifc` | Multiple | **I** | Feature provides output signals (incoming to Signal) |
| function | `enables` | feature | `.fml` | Multiple | **I** | Function enables features (incoming to Feature) |
| block | `enables` | feature | `.fml` | Multiple | **I** | Block enables features (incoming to Feature) |
| variantset | `extends` | feature | `.fml` | Multiple | **I** | Variant selects features of the feature model (incoming to Feature) |
| config | `basedon` | feature | `.fml` | Single | **I** | Config based on feature selection (incoming to Feature) |

### Variant Model (.vml)

**Outgoing Relations** (from Variantset):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| variantset | `extends` | feature | `.fml` | Multiple | **O** | Variant lists each feature of the feature model, with its flag and whether it is selected |
| variantset | `inherits` | variantset | `.vml` | Multiple | **O** | Variant inherits from other variants |

**Incoming Relations** (to Variantset):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| configset | `generatedfrom` | variantset | `.vml` | Single | **I** | Config generated from variant selection |

### Variant Config (.vcf)

**Outgoing Relations** (from Config/Configset):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| configset | `generatedfrom` | variantset | `.vml` | Single | **O** | Config generated from variant selection |
| config | `basedon` | feature | `.fml` | Single | **O** | Config based on feature selection |
| configset | `inherits` | configset | `.vcf` | Multiple | **O** | Config set records that it builds on another config set (a trace; nothing is copied) |

**Incoming Relations** (to Config/Configset):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| block | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| requirement | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| testcase | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| operation | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| signal | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| failuremode | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| safetymechanism | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| gate | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| transition | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| usecase | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| fragment | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| operatingmode | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |
| situation | `when` | config | `.vcf` | Single | **I** | Conditional visibility based on configuration |

---

## Function Group (.fun)

### 🔥 Core Traceability Relations

**Outgoing Relations** (from Function):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `enables` | feature | `.fml` | Multiple | **O** | Function enables features (reverse of performs) |
| function | `allocatedto` | block | `.blk` | **Single** | **O** | Function allocated to single block |
| function | `decomposesto` | function | `.fun` | Multiple | **O** | Top-down function decomposition |
| function | `derivedfrom` | requirement | `.req` | Multiple | **O** | Function derived from requirements |
| function | `implementedby` | requirement | `.req` | Multiple | **O** | Function implemented by requirements |

**Incoming Relations** (to Function):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `decomposedfrom` | function | `.fun` | **Single** | **I** | Bottom-up function composition (incoming to child) |
| feature | `performs` | function | `.fun` | Multiple | **I** | Feature performs functions (incoming to Function) |
| block | `implements` | function | `.fun` | Multiple | **I** | Block implements functions (incoming to Function) |
| requirement | `implements` | function | `.fun` | Multiple | **I** | Requirement implements function (incoming to Function) |
| safetymechanism | `implementedby` | function | `.fun` | Multiple | **I** | Safety mechanism implemented by functions (incoming to Function) |
| failuremode | `detectedby` | function | `.fun` | Multiple | **I** | Failure detected by functions (incoming to Function) |
| failuremode | `mitigatedby` | function | `.fun` | Multiple | **I** | Failure mitigated by functions (incoming to Function) |
| failuremode | `affects` | function | `.fun` | Multiple | **I** | Failure affects functions (incoming to Function) |
| failuremode | `affects` | block | `.blk` | Multiple | **O** | Failure affects a block |
| hazard | `malfunctionof` | function | `.fun` | Multiple | **I** | Hazard caused by malfunction of function (incoming to Function) |
| boundary | `itemscope` | function | `.fun` | Multiple | **I** | Item scope includes functions (incoming to Function) |
| statemachine | `allocatedto` | block | `.blk` | Multiple | **I** | State machine allocated to blocks (incoming to Block) |

### 🛡️ Safety & Diagnostics

**Outgoing Relations** (from Function):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `detects` | malfunction | `.flr` | Multiple | **O** | Function detects malfunctions (safety diagnostics) |
| function | `detects` | failure | `.flr` | Multiple | **O** | Function detects failure modes (safety diagnostics) |
| function | `detects` | failuremode | `.flr` | Multiple | **O** | Function detects failure modes (alias) |

### 🔌 Interface Relations

**Outgoing Relations** (from Function):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `requires` | parameter | `.ifc` | Multiple | **O** | Function requires parameters |
| function | `meets` | characteristic | `.blk` | Multiple | **O** | Function meets product characteristics |
| function | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Function):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `needs` | operation | `.ifc` | Multiple | **I** | Function needs input operations (incoming to Operation) |
| function | `needs` | signal | `.ifc` | Multiple | **I** | Function needs input signals (incoming to Signal) |
| function | `provides` | operation | `.ifc` | Multiple | **I** | Function provides output operations (incoming to Operation) |
| function | `provides` | signal | `.ifc` | Multiple | **I** | Function provides output signals (incoming to Signal) |

---

## Requirements (.req)

**Outgoing Relations** (from Requirement):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| requirement | `refinedfrom` | requirement | `.req` | Multiple | **O** | Requirement refined from higher-level requirement |
| requirement | `derivedfrom` | requirement | `.req` | Multiple | **O** | Requirement derived from other requirements |
| requirement | `implements` | function | `.fun` | Multiple | **O** | Requirement implements function |
| requirement | `allocatedto` | block | `.blk` | Multiple | **O** | Requirement allocated to blocks |
| requirement | `testedby` | testcase | `.tst` | Multiple | **O** | Requirement tested by test cases |
| requirement | `requires` | parameter | `.ifc` | Multiple | **O** | Requirement requires parameters |
| requirement | `meets` | characteristic | `.blk` | Multiple | **O** | Requirement meets product characteristics |
| requirement | `meets` | safetygoal | `.sgl` | Multiple | **O** | Requirement meets safety goals |
| requirement | `derivedfrom` | safetygoal | `.sgl` | Multiple | **O** | Safety requirement derived from a safety goal (ISO 26262) |
| requirement | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Requirement):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `derivedfrom` | requirement | `.req` | Multiple | **I** | Function derived from requirements (incoming to Requirement) |
| function | `implementedby` | requirement | `.req` | Multiple | **I** | Function implemented by requirements (incoming to Requirement) |
| block | `derivedfrom` | requirement | `.req` | Multiple | **I** | Block derived from requirements (incoming to Requirement) |
| block | `implementedby` | requirement | `.req` | Multiple | **I** | Block implemented by requirements (incoming to Requirement) |
| testcase | `derivedfrom` | requirement | `.req` | Multiple | **I** | Test case derived from requirements (incoming to Requirement) |
| testcase | `satisfies` | requirement | `.req` | Multiple | **I** | Test case satisfies/verifies requirements (incoming to Requirement) |
| operation | `derivedfrom` | requirement | `.req` | Multiple | **I** | Operation derived from requirements (incoming to Requirement) |
| operation | `implementedby` | requirement | `.req` | Multiple | **I** | Operation implemented by requirements (incoming to Requirement) |
| signal | `derivedfrom` | requirement | `.req` | Multiple | **I** | Signal derived from requirements (incoming to Requirement) |
| signal | `implementedby` | requirement | `.req` | Multiple | **I** | Signal implemented by requirements (incoming to Requirement) |
| characteristic | `derivedfrom` | requirement | `.req` | Multiple | **I** | Characteristic derived from requirements (incoming to Requirement) |
| characteristic | `implementedby` | requirement | `.req` | Multiple | **I** | Characteristic implemented by requirements (incoming to Requirement) |
| failuremode | `derivedfrom` | requirement | `.req` | Multiple | **I** | Failure derived from requirements (incoming to Requirement) |
| failuremode | `definedby` | requirement | `.req` | Multiple | **I** | Failure defined by requirements (incoming to Requirement) |
| hazard | `leadsto` | requirement | `.req` | Multiple | **I** | Hazard leads to safety goal (incoming to Requirement) |
| safetymechanism | `satisfies` | requirement | `.req` | Multiple | **I** | Safety mechanism satisfies requirements (incoming to Requirement) |
| statemachine | `implements` | requirement | `.req` | Multiple | **I** | State machine implements requirements (incoming to Requirement) |

---

## Test Cases (.tst)

**Outgoing Relations** (from Testcase):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| testcase | `refinedfrom` | testcase | `.tst` | Multiple | **O** | Test case refined from other test cases |
| testcase | `derivedfrom` | requirement | `.req` | Multiple | **O** | Test case derived from requirements |
| testcase | `satisfies` | requirement | `.req` | Multiple | **O** | Test case satisfies/verifies requirements |
| testcase | `requires` | parameter | `.ifc` | Multiple | **O** | Test case requires parameters |
| testcase | `meets` | characteristic | `.blk` | Multiple | **O** | Test case meets product characteristics |
| testcase | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Testcase):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| requirement | `testedby` | testcase | `.tst` | Multiple | **I** | Requirement tested by test cases (incoming to Testcase) |
| failuremode | `testedby` | testcase | `.tst` | Single | **I** | Failure tested by test case (incoming to Testcase) |
| safetymechanism | `verifiedby` | testcase | `.tst` | Multiple | **I** | Safety mechanism verified by test cases (incoming to Testcase) |
| characteristic | `verifiedby` | testcase | `.tst` | Multiple | **I** | Characteristic verified by test cases (incoming to Testcase) |

---

## Block Definition (.blk)

### 🔥 Core Traceability Relations

**Outgoing Relations** (from Block):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| block | `decomposesto` | block | `.blk` | Multiple | **O** | Top-down block decomposition |
| block | `implements` | function | `.fun` | Multiple | **O** | Block implements functions |
| block | `enables` | feature | `.fml` | Multiple | **O** | Block enables features |
| block | `derivedfrom` | requirement | `.req` | Multiple | **O** | Block derived from requirements |
| block | `implementedby` | requirement | `.req` | Multiple | **O** | Block implemented by requirements |

**Incoming Relations** (to Block):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| block | `decomposedfrom` | block | `.blk` | **Single** | **I** | Bottom-up block composition (incoming to child) |
| function | `allocatedto` | block | `.blk` | **Single** | **I** | Function allocated to single block (incoming to Block) |
| requirement | `allocatedto` | block | `.blk` | Multiple | **I** | Requirement allocated to blocks (incoming to Block) |
| interfaceset | `allocatedto` | block | `.blk` | **Single** | **I** | Interface allocated to single block (incoming to Block) |
| failuremode | `allocatedto` | block | `.blk` | Multiple | **I** | Failure allocated to blocks (incoming to Block) |
| safetymechanism | `allocatedto` | block | `.blk` | Multiple | **I** | Safety mechanism allocated to blocks (incoming to Block) |
| gate | `allocatedto` | block | `.blk` | Multiple | **I** | Gate allocated to blocks (incoming to Block) |
| failureset | `occursin` | block | `.blk` | Multiple | **I** | Failure occurs in specific blocks (incoming to Block) |
| boundary | `includes` | block | `.blk` | Multiple | **I** | Item boundary includes blocks (incoming to Block) |
| boundary | `excludes` | block | `.blk` | Multiple | **I** | Item boundary excludes blocks (incoming to Block) |
| statemachine | `allocatedto` | block | `.blk` | Multiple | **I** | State machine allocated to blocks (incoming to Block) |

### 🔌 Interface Relations

**Outgoing Relations** (from Block):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| block | `requires` | parameter | `.ifc` | Multiple | **O** | Block requires parameters |
| block | `requires` | datatype | `.ifc` | Multiple | **O** | Block requires datatypes |
| block | `meets` | characteristic | `.blk` | Multiple | **O** | Block meets product characteristics |
| block | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Block):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| block | `needs` | operation | `.ifc` | Multiple | **I** | Block needs input operations (incoming to Operation) |
| block | `needs` | signal | `.ifc` | Multiple | **I** | Block needs input signals (incoming to Signal) |
| block | `provides` | operation | `.ifc` | Multiple | **I** | Block provides output operations (incoming to Operation) |
| block | `provides` | signal | `.ifc` | Multiple | **I** | Block provides output signals (incoming to Signal) |

### 📏 Product Characteristics (AIAG VDA)

**Outgoing Relations** (from Characteristic):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| characteristic | `derivedfrom` | requirement | `.req` | Multiple | **O** | Characteristic derived from requirements (AIAG VDA) |
| characteristic | `implementedby` | requirement | `.req` | Multiple | **O** | Characteristic implemented by requirements (AIAG VDA) |
| characteristic | `meets` | safetygoal | `.sgl` | Multiple | **O** | Characteristic meets safety goals |
| characteristic | `verifiedby` | testcase | `.tst` | Multiple | **O** | Characteristic verified by test cases |

**Incoming Relations** (to Characteristic):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| feature | `meets` | characteristic | `.blk` | Multiple | **I** | Feature meets product characteristics (incoming to Characteristic) |
| function | `meets` | characteristic | `.blk` | Multiple | **I** | Function meets product characteristics (incoming to Characteristic) |
| block | `meets` | characteristic | `.blk` | Multiple | **I** | Block meets product characteristics (incoming to Characteristic) |
| requirement | `meets` | characteristic | `.blk` | Multiple | **I** | Requirement meets product characteristics (incoming to Characteristic) |
| testcase | `meets` | characteristic | `.blk` | Multiple | **I** | Test case meets product characteristics (incoming to Characteristic) |
| operation | `meets` | characteristic | `.blk` | Multiple | **I** | Operation meets product characteristics (incoming to Characteristic) |
| signal | `meets` | characteristic | `.blk` | Multiple | **I** | Signal meets product characteristics (incoming to Characteristic) |
| failuremode | `meets` | characteristic | `.blk` | Multiple | **I** | Failure meets product characteristics (incoming to Characteristic) |

---

## Interface Definition (.ifc)

### 🔥 Core Traceability Relations

**Outgoing Relations** (from Interfaceset):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| interfaceset | `decomposesto` | interfaceset | `.ifc` | Multiple | **O** | Top-down interface decomposition |
| interfaceset | `allocatedto` | block | `.blk` | **Single** | **O** | Interface allocated to single block |
| interfaceset | `derivedfrom` | requirement | `.req` | Multiple | **O** | Interface derived from requirements |

**Incoming Relations** (to Interfaceset):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| interfaceset | `decomposedfrom` | interfaceset | `.ifc` | **Single** | **I** | Bottom-up interface composition (incoming to child) |

### 🔌 Operations

**Outgoing Relations** (from Operation):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| operation | `derivedfrom` | requirement | `.req` | Multiple | **O** | Operation derived from requirements |
| operation | `implementedby` | requirement | `.req` | Multiple | **O** | Operation implemented by requirements |
| operation | `requires` | datatype | `.ifc` | Multiple | **O** | Operation requires datatypes |
| operation | `meets` | characteristic | `.blk` | Multiple | **O** | Operation meets product characteristics |
| operation | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Operation):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| feature | `needs` | operation | `.ifc` | Multiple | **I** | Feature requires input operations (incoming to Operation) |
| feature | `provides` | operation | `.ifc` | Multiple | **I** | Feature provides output operations (incoming to Operation) |
| function | `needs` | operation | `.ifc` | Multiple | **I** | Function needs input operations (incoming to Operation) |
| function | `provides` | operation | `.ifc` | Multiple | **I** | Function provides output operations (incoming to Operation) |
| block | `needs` | operation | `.ifc` | Multiple | **I** | Block needs input operations (incoming to Operation) |
| block | `provides` | operation | `.ifc` | Multiple | **I** | Block provides output operations (incoming to Operation) |

### 📡 Signals

**Outgoing Relations** (from Signal):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| signal | `derivedfrom` | requirement | `.req` | Multiple | **O** | Signal derived from requirements |
| signal | `implementedby` | requirement | `.req` | Multiple | **O** | Signal implemented by requirements |
| signal | `requires` | datatype | `.ifc` | Multiple | **O** | Signal requires datatypes |
| signal | `meets` | characteristic | `.blk` | Multiple | **O** | Signal meets product characteristics |
| signal | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Signal):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| feature | `needs` | signal | `.ifc` | Multiple | **I** | Feature requires input signals (incoming to Signal) |
| feature | `provides` | signal | `.ifc` | Multiple | **I** | Feature provides output signals (incoming to Signal) |
| function | `needs` | signal | `.ifc` | Multiple | **I** | Function needs input signals (incoming to Signal) |
| function | `provides` | signal | `.ifc` | Multiple | **I** | Function provides output signals (incoming to Signal) |
| block | `needs` | signal | `.ifc` | Multiple | **I** | Block needs input signals (incoming to Signal) |
| block | `provides` | signal | `.ifc` | Multiple | **I** | Block provides output signals (incoming to Signal) |

### 📊 Datatypes & Parameters

**Outgoing Relations** (from Datatype/Parameter):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| datatype | `derivedfrom` | requirement | `.req` | Multiple | **O** | Datatype derived from requirements |
| datatype | `implementedby` | requirement | `.req` | Multiple | **O** | Datatype implemented by requirements |
| parameter | `derivedfrom` | requirement | `.req` | Multiple | **O** | Parameter derived from requirements |
| parameter | `implementedby` | requirement | `.req` | Multiple | **O** | Parameter implemented by requirements |
| parameter | `requires` | datatype | `.ifc` | Multiple | **O** | Parameter requires datatypes |

**Incoming Relations** (to Datatype/Parameter):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `requires` | parameter | `.ifc` | Multiple | **I** | Function requires parameters (incoming to Parameter) |
| block | `requires` | parameter | `.ifc` | Multiple | **I** | Block requires parameters (incoming to Parameter) |
| requirement | `requires` | parameter | `.ifc` | Multiple | **I** | Requirement requires parameters (incoming to Parameter) |
| testcase | `requires` | parameter | `.ifc` | Multiple | **I** | Test case requires parameters (incoming to Parameter) |
| operation | `requires` | datatype | `.ifc` | Multiple | **I** | Operation requires datatypes (incoming to Datatype) |
| signal | `requires` | datatype | `.ifc` | Multiple | **I** | Signal requires datatypes (incoming to Datatype) |
| parameter | `requires` | datatype | `.ifc` | Multiple | **I** | Parameter requires datatypes (incoming to Datatype) |
| failuremode | `requires` | parameter | `.ifc` | Multiple | **I** | Failure requires parameters (incoming to Parameter) |
| safetymechanism | `requires` | parameter | `.ifc` | Multiple | **I** | Safety mechanism requires parameters (incoming to Parameter) |
| gate | `requires` | parameter | `.ifc` | Multiple | **I** | Gate requires parameters (incoming to Parameter) |
| transition | `requires` | parameter | `.ifc` | Multiple | **I** | Transition requires parameters (incoming to Parameter) |
| usecase | `requires` | parameter | `.ifc` | Multiple | **I** | Use case requires parameters (incoming to Parameter) |
| fragment | `requires` | parameter | `.ifc` | Multiple | **I** | Fragment requires parameters (incoming to Parameter) |
| operatingmode | `requires` | parameter | `.ifc` | Multiple | **I** | Operating mode requires parameters (incoming to Parameter) |
| situation | `requires` | parameter | `.ifc` | Multiple | **I** | Operational situation requires parameters (incoming to Parameter) |

---

## Safety & FMEA

### Failure Analysis (.flr)

**Outgoing Relations** (from Failureset/Failuremode):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| failureset | `propagateto` | failureset | `.flr` | Multiple | **O** | Failure propagates to upper-level FMEA |
| failureset | `occursin` | block | `.blk` | Multiple | **O** | Failure occurs in specific blocks |
| failuremode | `causedby` | failuremode | `.flr` | Multiple | **O** | Failure mode caused by other failure modes |
| failuremode | `effects` | failuremode | `.flr` | Multiple | **O** | Failure mode has effects (other failure modes) |
| failuremode | `detectedby` | function | `.fun` | Multiple | **O** | Failure detected by functions |
| failuremode | `mitigatedby` | function | `.fun` | Multiple | **O** | Failure mitigated by functions |
| failuremode | `testedby` | testcase | `.tst` | Single | **O** | Failure tested by test case |
| failuremode | `derivedfrom` | requirement | `.req` | Multiple | **O** | Failure derived from requirements |
| failuremode | `definedby` | requirement | `.req` | Multiple | **O** | Failure defined by requirements |
| failuremode | `allocatedto` | block | `.blk` | Multiple | **O** | Failure allocated to blocks |
| failuremode | `affects` | function | `.fun` | Multiple | **O** | Failure affects functions |
| failuremode | `requires` | parameter | `.ifc` | Multiple | **O** | Failure requires parameters |
| failuremode | `meets` | characteristic | `.blk` | Multiple | **O** | Failure meets product characteristics |
| failuremode | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Failureset/Failuremode):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| function | `detects` | malfunction | `.flr` | Multiple | **I** | Function detects malfunctions (incoming to Malfunction) |
| function | `detects` | failure | `.flr` | Multiple | **I** | Function detects failure modes (incoming to Failuremode) |
| function | `detects` | failuremode | `.flr` | Multiple | **I** | Function detects failure modes (incoming to Failuremode) |
| safetymechanism | `detects` | failuremode | `.flr` | Multiple | **I** | Safety mechanism detects failure modes (incoming to Failuremode) |
| safetymechanism | `mitigates` | failuremode | `.flr` | Multiple | **I** | Safety mechanism prevents or controls failure modes (incoming to Failuremode) |
| faulttree | `topevent` | failuremode | `.flr` | Single | **I** | Fault tree top event references failure mode (incoming to Failuremode) |
| gate | `input` | failuremode | `.flr` | Multiple | **I** | Gate input from failure modes (incoming to Failuremode) |
| gate | `output` | failuremode | `.flr` | Single | **I** | Gate output to failure mode (incoming to Failuremode) |

### Hazard Analysis (.haz) - ISO 26262

**Outgoing Relations** (from Hazard/Situation):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| hazard | `malfunctionof` | function | `.fun` | Multiple | **O** | Hazard caused by malfunction of function |
| hazard | `affects` | feature | `.fml` | Multiple | **O** | Hazard affects features |
| hazard | `leadsto` | requirement | `.req` | Multiple | **O** | Hazard leads to safety goal (requirement) |
| situation | `requires` | parameter | `.ifc` | Multiple | **O** | Operational situation requires parameters |
| situation | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Hazard):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| safetymechanism | `mitigates` | hazard | `.haz` | Multiple | **I** | Safety mechanism mitigates hazards (incoming to Hazard) |

### Safety Goals (.sgl) - ISO 26262

**Outgoing Relations** (from Safetygoal):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| safetygoal | `derivedfrom` | hazard | `.haz` | Multiple | **O** | Safety goal derived from hazards |
| safetygoal | `derivedfrom` | situation | `.haz` | Multiple | **O** | Safety goal derived from hazardous situations |
| safetygoal | `mitigates` | hazard | `.haz` | Multiple | **O** | Safety goal mitigates hazards |
| safetygoal | `leadsto` | requirement | `.req` | Multiple | **O** | Safety goal leads to safety requirements |
| safetygoal | `allocatedto` | item | `.itm` | Multiple | **O** | Safety goal allocated to the item (`ref item`, the item definition) |
| safetygoal | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Safetygoal):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| requirement | `derivedfrom` | safetygoal | `.sgl` | Multiple | **I** | Safety requirement derived from a safety goal (incoming to Safetygoal) |
| requirement | `meets` | safetygoal | `.sgl` | Multiple | **I** | Requirement meets a safety goal (incoming to Safetygoal) |

### Safety Mechanisms (.sam) - ISO 26262

**Outgoing Relations** (from Safetymechanism):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| safetymechanism | `satisfies` | requirement | `.req` | Multiple | **O** | Safety mechanism satisfies requirements |
| safetymechanism | `mitigates` | hazard | `.haz` | Multiple | **O** | Safety mechanism mitigates hazards |
| safetymechanism | `mitigates` | failuremode | `.flr` | Multiple | **O** | Safety mechanism prevents or controls failure modes |
| safetymechanism | `allocatedto` | block | `.blk` | Multiple | **O** | Safety mechanism allocated to blocks |
| safetymechanism | `implementedby` | function | `.fun` | Multiple | **O** | Safety mechanism implemented by functions |
| safetymechanism | `detects` | failuremode | `.flr` | Multiple | **O** | Safety mechanism detects failure modes |
| safetymechanism | `verifiedby` | testcase | `.tst` | Multiple | **O** | Safety mechanism verified by test cases |
| safetymechanism | `requires` | parameter | `.ifc` | Multiple | **O** | Safety mechanism requires parameters |
| safetymechanism | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

### Fault Tree Analysis (.fta)

**Outgoing Relations** (from Faulttree/Gate):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| faulttree | `topevent` | failuremode | `.flr` | Single | **O** | Fault tree top event references failure mode |
| gate | `input` | failuremode | `.flr` | Multiple | **O** | Gate input from failure modes |
| gate | `input` | gate | `.fta` | Multiple | **O** | Gate input from other gates |
| gate | `output` | failuremode | `.flr` | Single | **O** | Gate output to failure mode |
| gate | `output` | gate | `.fta` | Single | **O** | Gate output to other gates |
| gate | `allocatedto` | block | `.blk` | Multiple | **O** | Gate allocated to blocks |
| gate | `requires` | parameter | `.ifc` | Multiple | **O** | Gate requires parameters |
| gate | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Gate):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| gate | `input` | gate | `.fta` | Multiple | **I** | Gate input from other gates (incoming to Gate) |
| gate | `output` | gate | `.fta` | Single | **I** | Gate output to other gates (incoming to Gate) |

### Item Definition (.itm) - ISO 26262

**Outgoing Relations** (from Boundary/Operatingmode):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| boundary | `includes` | block | `.blk` | Multiple | **O** | Item boundary includes blocks |
| boundary | `includes` | function | `.fun` | Multiple | **O** | Item boundary includes functions |
| boundary | `excludes` | block | `.blk` | Multiple | **O** | Item boundary excludes blocks |
| boundary | `excludes` | function | `.fun` | Multiple | **O** | Item boundary excludes functions |
| boundary | `itemscope` | function | `.fun` | Multiple | **O** | Item scope includes functions |
| boundary | `itemscope` | feature | `.fml` | Multiple | **O** | Item scope includes features |
| operatingmode | `requires` | parameter | `.ifc` | Multiple | **O** | Operating mode requires parameters |
| operatingmode | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

---

## Diagrams & Workflows

### Sprint Management (.spr)

**Outgoing Relations** (from Sprint):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| sprint | `assignedto` | agent | `.agt` | Single | **O** | Sprint task assigned to agent |

**Incoming Relations** (to Agent):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| sprint | `assignedto` | agent | `.agt` | Single | **I** | Sprint task assigned to agent (incoming to Agent) |

### Use Case Diagram (.ucd)

**Outgoing Relations** (from Usecase):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| usecase | `associated` | actor | `.ucd` | Multiple | **O** | Use case associated with actors (legacy syntax) |
| usecase | `associated` | function | `.fun` | Multiple | **O** | Use case associated with functions (legacy syntax) |
| usecase | `includes` | function | `.fun` | Multiple | **O** | Use case includes functions (legacy syntax) |
| usecase | `from` | actor | `.ucd` | Single | **O** | Use case connection from an actor |
| usecase | `from` | function | `.fun` | Single | **O** | Use case connection from a function |
| usecase | `to` | function | `.fun` | Single | **O** | Use case connection to a function |
| usecase | `to` | actor | `.ucd` | Single | **O** | Use case connection to an actor |
| usecase | `requires` | parameter | `.ifc` | Multiple | **O** | Use case requires parameters |
| usecase | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Usecase):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| usecase | `to` | actor | `.ucd` | Single | **I** | Use case connection to an actor (incoming to Actor) |

### Sequence Diagram (.seq)

**Outgoing Relations** (from Fragment):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| fragment | `from` | block | `.blk` | Single | **O** | Message flow from a block |
| fragment | `from` | function | `.fun` | Single | **O** | Message flow from a function |
| fragment | `to` | block | `.blk` | Single | **O** | Message flow to a block |
| fragment | `to` | function | `.fun` | Single | **O** | Message flow to a function |
| fragment | `flow` | operation | `.ifc` | Single | **O** | Message carries an operation |
| fragment | `flow` | signal | `.ifc` | Single | **O** | Message carries a signal |
| fragment | `requires` | parameter | `.ifc` | Multiple | **O** | Fragment requires parameters |
| fragment | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Fragment):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| fragment | `to` | block | `.blk` | Single | **I** | Message flow to a block (incoming to Block) |

### State Machine Diagram (.smd)

**Outgoing Relations** (from Statemachine/Transition):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| statemachine | `allocatedto` | block | `.blk` | Multiple | **O** | State machine allocated to blocks |
| statemachine | `implements` | requirement | `.req` | Multiple | **O** | State machine implements requirements |
| transition | `from` | state | `.smd` | Single | **O** | Transition from source state |
| transition | `to` | state | `.smd` | Single | **O** | Transition to target state |
| transition | `call` | function | `.fun` | Single | **O** | Transition calls function |
| transition | `requires` | parameter | `.ifc` | Multiple | **O** | Transition requires parameters |
| transition | `when` | config | `.vcf` | Single | **O** | Conditional visibility based on configuration |

**Incoming Relations** (to Statemachine/Transition):
| Source Type | Relation | Target Type | Target File | Multiplicity | Direction | Description |
|:------------|:---------|:------------|:------------|:------------:|:----------:|:------------|
| transition | `to` | state | `.smd` | Single | **I** | Transition to target state (incoming to State) |
| transition | `call` | function | `.fun` | Single | **I** | Transition calls function (incoming to Function) |

---

## 🎓 Quick Reference: Common Patterns

### Pattern 1: System Decomposition

```
Parent Function
  ├─ decomposesto → Child Function 1  (O - outgoing from parent)
  ├─ decomposesto → Child Function 2  (O - outgoing from parent)
  └─ decomposesto → Child Function 3  (O - outgoing from parent)

Child Function 1
  └─ decomposedfrom → Parent Function (I - incoming to child)
```

### Pattern 2: Complete Traceability

```
Feature ─performs→ Function  (O from Feature, I to Function)
Function ─enables→ Feature  (O from Function, I to Feature)
Function ─allocatedto→ Block (O from Function, I to Block)
Block ─implements→ Function  (O from Block, I to Function)
Function ─derivedfrom→ Requirement (O from Function, I to Requirement)
Requirement ─implements→ Function (O from Requirement, I to Function)
```

### Pattern 3: Safety Diagnostics

```
Function ─detects→ Malfunction/Failure  (O from Function, I to Failuremode)
SafetyMechanism ─detects→ FailureMode   (O from Safetymechanism, I to Failuremode)
FailureMode ─detectedby→ Function        (O from Failuremode, I to Function)
```

### Pattern 4: Interface Mapping (MANDATORY for ASPICE)

```
Block ─needs→ Operation (O from Block, I to Operation)
Block ─provides→ Operation (O from Block, I to Operation)
Operation ─requires→ Datatype (O from Operation, I to Datatype)
```

---

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
- Charts: bar, line, pie (donut) and gauge
- Grid-based layouts with widget spanning
- Advanced filtering and aggregation
- HTML export for sharing

---

## Relations by file type

Generated from the language: every relation each file type accepts, and the element kinds it may point to.

<!-- generated:relations -->
### Product Line (.ple)

No relations: the file only describes itself.

### Feature Model (.fml)

| Relation | Points at |
|:--|:--|
| `listedfor` | productline |
| `requires` | feature, datatype, parameter |
| `excludes` | feature |
| `performs` | function |
| `needs` | operation, signal |
| `provides` | operation, signal |
| `meets` | characteristic, safetygoal |
| `inherits` | featureset, variantset, configset |

### Variant Model (.vml)

| Relation | Points at |
|:--|:--|
| `extends` | feature |
| `inherits` | featureset, variantset, configset |

### Variant Config (.vcf)

| Relation | Points at |
|:--|:--|
| `generatedfrom` | variantset |
| `basedon` | feature |
| `inherits` | featureset, variantset, configset |

### Block (.blk)

| Relation | Points at |
|:--|:--|
| `decomposedfrom` | block |
| `decomposesto` | block |
| `implements` | function |
| `enables` | feature |
| `derivedfrom` | requirement |
| `implementedby` | requirement |
| `needs` | operation, signal |
| `provides` | operation, signal |
| `requires` | feature, datatype, parameter |
| `meets` | characteristic, safetygoal |
| `verifiedby` | testcase |
| `when` | config |

### Function Group (.fun)

| Relation | Points at |
|:--|:--|
| `enables` | feature |
| `decomposesto` | function |
| `decomposedfrom` | function |
| `needs` | operation, signal |
| `provides` | operation, signal |
| `requires` | feature, datatype, parameter |
| `meets` | characteristic, safetygoal |
| `derivedfrom` | requirement |
| `implementedby` | requirement |
| `detects` | malfunction, failure, failuremode |
| `allocatedto` | block |
| `when` | config |

### Interface Definition (.ifc)

| Relation | Points at |
|:--|:--|
| `decomposedfrom` | interfaceset |
| `decomposesto` | interfaceset |
| `allocatedto` | block |
| `derivedfrom` | requirement |
| `implementedby` | requirement |
| `when` | config |
| `requires` | feature, datatype, parameter |
| `meets` | characteristic, safetygoal |

### Requirements (.req)

| Relation | Points at |
|:--|:--|
| `refinedfrom` | requirement |
| `derivedfrom` | requirement, safetygoal |
| `implements` | function, requirement |
| `allocatedto` | block |
| `testedby` | testcase |
| `when` | config |
| `requires` | feature, datatype, parameter |
| `meets` | characteristic, safetygoal |

### Test Suite (.tst)

| Relation | Points at |
|:--|:--|
| `refinedfrom` | testcase, requirement |
| `derivedfrom` | requirement |
| `satisfies` | requirement |
| `when` | config |
| `requires` | feature, datatype, parameter |
| `meets` | characteristic, safetygoal |

### Use Case Diagram (.ucd)

| Relation | Points at |
|:--|:--|
| `from` | block, actor, function |
| `to` | block, actor, function |
| `associated` | function, actor |
| `includes` | function |
| `when` | config |
| `requires` | feature, datatype, parameter |

### Sequence Diagram (.seq)

| Relation | Points at |
|:--|:--|
| `from` | block, function |
| `to` | block, function |
| `flow` | operation, signal |
| `when` | config |
| `requires` | feature, datatype, parameter |

### State Machine Diagram (.smd)

| Relation | Points at |
|:--|:--|
| `allocatedto` | block |
| `implements` | function, requirement |
| `from` | state |
| `to` | state |
| `call` | function |
| `requires` | feature, datatype, parameter |
| `when` | config |

### Item Definition (ISO 26262) (.itm)

| Relation | Points at |
|:--|:--|
| `includes` | function, block |
| `excludes` | function, block |
| `itemscope` | function, feature |
| `when` | config |
| `requires` | feature, datatype, parameter |

### Hazard Analysis (ISO 26262) (.haz)

| Relation | Points at |
|:--|:--|
| `malfunctionof` | function |
| `affects` | feature, function, block |
| `leadsto` | requirement |
| `when` | config |
| `requires` | feature, datatype, parameter |

### Safety Goals (ISO 26262) (.sgl)

| Relation | Points at |
|:--|:--|
| `derivedfrom` | hazard, situation |
| `mitigates` | hazard |
| `leadsto` | requirement |
| `allocatedto` | item |
| `when` | config |
| `requires` | feature, datatype, parameter |

### Safety Mechanisms (ISO 26262) (.sam)

| Relation | Points at |
|:--|:--|
| `satisfies` | requirement |
| `mitigates` | hazard, failuremode |
| `allocatedto` | block |
| `implementedby` | function |
| `detects` | failuremode |
| `verifiedby` | testcase |
| `when` | config |
| `requires` | feature, datatype, parameter |

### Failure Analysis (.flr)

| Relation | Points at |
|:--|:--|
| `propagateto` | failureset |
| `occursin` | block |
| `allocatedto` | block |
| `affects` | feature, function, block |
| `causedby` | failuremode |
| `effects` | failuremode |
| `detectedby` | function |
| `mitigatedby` | function |
| `testedby` | testcase |
| `derivedfrom` | requirement |
| `definedby` | requirement |
| `when` | config |
| `requires` | feature, datatype, parameter |
| `meets` | characteristic, safetygoal |

### Fault Tree Analysis (.fta)

| Relation | Points at |
|:--|:--|
| `topevent` | failuremode |
| `input` | failuremode, gate |
| `output` | failuremode, gate |
| `allocatedto` | block |
| `requires` | feature, datatype, parameter |
| `when` | config |

### Sprint (.spr)

| Relation | Points at |
|:--|:--|
| `assignedto` | agent |

### Agent (.agt)

No relations: the file only describes itself.

<!-- /generated:relations -->

