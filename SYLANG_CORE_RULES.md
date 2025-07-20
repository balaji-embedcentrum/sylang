# 🔥 **SYLANG CORE LANGUAGE RULES**
**Comprehensive Specification for All 15 Extensions**

---

## 🎯 **FUNDAMENTAL ARCHITECTURE**

### **1. HEADER DEF vs SUB DEF STRUCTURE**

#### **Header Definition (Parent Symbol)**
- **EXACTLY ONE** per file - the main container definition
- **Creates the parent symbol** that all sub defs belong to
- **Must be the first `def` statement** in the file (after imports)

#### **Sub Definitions (Child Symbols)**  
- **Multiple allowed** - as many as grammar permits
- **Must be nested under header def** with proper indentation
- **Become child symbols** of the header def

#### **Hierarchy Rules:**
```sylang
def functiongroup MyFunctions          // ← HEADER DEF (Parent Symbol)
  name "My Function Group"
  description "Container for functions"
  
  def function ProcessData             // ← SUB DEF (Child Symbol)
    name "Process Data Function"
    enables feature DataProcessing
    
  def function ValidateInput           // ← SUB DEF (Child Symbol)  
    name "Validate Input Function"
    enables feature InputValidation
```

---

## 🔧 **PROPERTY TYPES & SECONDARY KEYWORDS**

### **1. Primary Properties (Simple)**
```sylang
name "Display Name"           // String value
description "Detailed desc"   // String value  
owner "Team Name"            // String value
safetylevel ASIL-D          // Enum value
config myconfig.feature      // Config reference
```

### **2. Secondary Keywords (Compound Properties)**

#### **Type 1: Secondary Keyword is ENUM**
```sylang
safetylevel ASIL-D                    // ASIL-A|ASIL-B|ASIL-C|ASIL-D|QM
category control                      // control|safety|monitoring|etc
priority high                         // high|medium|low
```

#### **Type 2: Secondary Keyword is DEFINITION REFERENCE**
```sylang
implements function ProcessData       // references function def
enables feature DataProcessing        // references feature def
allocatedto component MainProcessor   // references component def
satisfies requirement REQ_001        // references requirement def
```

#### **Type 3: Tertiary Keywords (Definition + Enum)**
```sylang
allocatedto block subsystem ControlSubsystem  // block type + subsystem enum + identifier
partof block system MainSystem               // block type + system enum + identifier
```

---

## 🗂️ **FILE EXTENSION RULES**

### **UNIQUE FILES (Only 1 per project):**
- **`.ple`** - Product Line Engineering
- **`.fml`** - Feature Modeling  
- **`.vcf`** - Variant Configuration

### **MULTIPLE FILES ALLOWED:**
- **`.vml`** - Variant Model
- **`.fun`** - Functions
- **`.blk`** - Blocks
- **`.req`** - Requirements
- **`.tst`** - Test Specifications
- **`.fma`** - Failure Mode Analysis
- **`.fmc`** - Failure Mode Controls
- **`.fta`** - Fault Tree Analysis
- **`.itm`** - Items/Operational Scenarios
- **`.haz`** - Hazard Analysis
- **`.rsk`** - Risk Assessment
- **`.sgl`** - Safety Goals

---

## 📋 **COMPLETE FILE TYPE SPECIFICATIONS**

### **1. `.ple` - Product Line Engineering**
```sylang
def productline MyProductLine                    // HEADER DEF (required)
  name "My Product Line"
  description "Complete product line description"
  domain automotive, aerospace                   // Enum list
  compliance ISO26262, DO178C                   // Enum list
  safetylevel ASIL-D                           // Enum
  region EMEA, APAC                            // Enum list
```
- **Header Types:** `productline` 
- **Sub Defs:** None allowed
- **File Limit:** UNIQUE (1 per project)
- **Imports:** None allowed

### **2. `.fml` - Feature Modeling**
```sylang
def featureset MyFeatures                        // HEADER DEF (required)
  name "My Feature Set"
  description "Complete feature model"
  
  def feature RootFeature mandatory               // SUB DEF
    name "Root Feature"
    description "Main system feature"
    
    def feature ChildFeature optional             // SUB DEF (nested)
      name "Child Feature"
      enables feature ParentFeature               // Compound property
```
- **Header Types:** `featureset`
- **Sub Defs:** `feature` (unlimited nesting)
- **File Limit:** UNIQUE (1 per project)
- **Imports:** `productline`
- **Secondary Keywords:** `mandatory`, `optional`, `alternative`, `or`

### **3. `.vml` - Variant Model**
```sylang
def variantmodel MyVariants                      // HEADER DEF (required)
  name "My Variant Model"
  description "Product variants"
  
  def variant BaseVariant                        // SUB DEF
    name "Base Variant"
    enables feature CoreFeatures                 // Compound property
    includes variant ParentVariant               // Compound property
```
- **Header Types:** `variantmodel`
- **Sub Defs:** `variant`
- **File Limit:** MULTIPLE
- **Imports:** `featureset`

### **4. `.vcf` - Variant Configuration**
```sylang
def configset MyConfig                          // HEADER DEF (required)
  name "My Configuration"
  description "Specific configuration"
  
  def config FeatureToggle                      // SUB DEF
    enables feature DataProcessing              // Compound property
    value 1                                     // Numeric value
```
- **Header Types:** `configset`
- **Sub Defs:** `config`
- **File Limit:** UNIQUE (1 per project)
- **Imports:** `variantmodel`

### **5. `.fun` - Functions**
```sylang
def functiongroup MyFunctions                   // HEADER DEF (required)
  name "My Function Group"
  description "System functions"
  
  def function ProcessData                      // SUB DEF
    name "Process Data"
    category control                            // Enum secondary keyword
    enables feature DataProcessing              // Compound property
    implements function ParentFunction          // Compound property
    allocatedto subsystem ProcessingSubsystem   // Tertiary keywords
```
- **Header Types:** `functiongroup`
- **Sub Defs:** `function`
- **File Limit:** MULTIPLE
- **Imports:** `configset`, `featureset`

### **6. `.blk` - Blocks**
```sylang
def block system MySystem                       // HEADER DEF (compound)
  name "My System"
  description "Main system"
  
  def subsystem ControlSubsystem                // SUB DEF
    name "Control Subsystem"
    partof system MySystem                      // Compound property
    implements function ControlFunctions        // Compound property
    
  def component MainProcessor                   // SUB DEF
    name "Main Processor"
    partof subsystem ControlSubsystem          // Compound property
```
- **Header Types:** `system`, `subsystem`, `component`
- **Sub Defs:** `subsystem`, `component` (hierarchical)
- **File Limit:** MULTIPLE
- **Imports:** `functiongroup`

### **7. `.req` - Requirements**
```sylang
def requirement REQ_001                         // HEADER DEF (no container)
  name "System Requirement 001"
  description "The system shall..."
  category functional                           // Enum secondary keyword
  priority high                                 // Enum secondary keyword
  satisfies requirement PARENT_REQ              // Compound property
  derivedfrom requirement SOURCE_REQ            // Compound property
  allocatedto component MainProcessor           // Compound property
  verifies function ProcessData                 // Compound property
```
- **Header Types:** `requirement` (direct, no container)
- **Sub Defs:** None
- **File Limit:** MULTIPLE
- **Imports:** `functiongroup`, `block`

### **8. `.tst` - Test Specifications**
```sylang
def testsuite MyTests                          // HEADER DEF (required)
  name "My Test Suite"
  description "System tests"
  
  def testcase TEST_001                         // SUB DEF
    name "Test Case 001"
    priority high                               // Enum secondary keyword
    verifies requirement REQ_001                // Compound property
    validates function ProcessData              // Compound property
```
- **Header Types:** `testsuite`
- **Sub Defs:** `testcase`, `step`
- **File Limit:** MULTIPLE
- **Imports:** `requirement`, `functiongroup`

### **9. `.fma` - Failure Mode Analysis**
```sylang
def failuremodeanalysis MyFMA                  // HEADER DEF (required)
  name "My Failure Mode Analysis"
  description "FMEA analysis"
  
  def failuremode FM_001                        // SUB DEF
    name "Failure Mode 001"
    severity high                               // Enum secondary keyword
    probability low                             // Enum secondary keyword
    partof system MainSystem                    // Compound property
    affects function ProcessData                // Compound property
```
- **Header Types:** `failuremodeanalysis`
- **Sub Defs:** `failuremode`
- **File Limit:** MULTIPLE
- **Imports:** `block`, `functiongroup`

### **10. `.fmc` - Failure Mode Controls**
```sylang
def controlmeasures MyControls                 // HEADER DEF (required)
  name "My Control Measures"
  description "FMEA controls"
  
  def control CTRL_001                          // SUB DEF
    name "Control 001"
    effectiveness high                          // Enum secondary keyword
    mitigates failuremode FM_001               // Compound property
    implements control PARENT_CTRL             // Compound property
```
- **Header Types:** `controlmeasures`
- **Sub Defs:** `control`
- **File Limit:** MULTIPLE
- **Imports:** `failuremodeanalysis`

### **11. `.fta` - Fault Tree Analysis**
```sylang
def faulttreeanalysis MyFTA                   // HEADER DEF (required)
  name "My Fault Tree Analysis"
  description "FTA analysis"
  
  def faulttree FT_001                         // SUB DEF
    name "Fault Tree 001"
    
  def event EVT_001                            // SUB DEF
    name "Event 001"
    probability low                            // Enum secondary keyword
    gate AND                                   // Enum secondary keyword
    partof system MainSystem                   // Compound property
    causes event PARENT_EVT                    // Compound property
```
- **Header Types:** `faulttreeanalysis`
- **Sub Defs:** `faulttree`, `event`
- **File Limit:** MULTIPLE
- **Imports:** `block`, `functiongroup`

### **12. `.itm` - Items/Operational Scenarios**
```sylang
def itemdefinition MyItems                     // HEADER DEF (required)
  name "My Item Definition"
  description "Operational items"
  
  def item ITM_001                             // SUB DEF
    name "Item 001"
    lifecycle operational                       // Enum secondary keyword
    operationalmode normal                      // Enum secondary keyword
    partof system MainSystem                   // Compound property
    uses function ProcessData                   // Compound property
```
- **Header Types:** `itemdefinition`
- **Sub Defs:** `item`
- **File Limit:** MULTIPLE
- **Imports:** `block`, `functiongroup`

### **13. `.haz` - Hazard Analysis**
```sylang
def hazardidentification MyHazards             // HEADER DEF (required)
  name "My Hazard Identification"
  description "System hazards"
  
  def hazard HAZ_001                           // SUB DEF
    name "Hazard 001"
    severity high                              // Enum secondary keyword
    category operational                       // Enum secondary keyword  
    derivedfrom item ITM_001                  // Compound property
    affects function ProcessData               // Compound property
```
- **Header Types:** `hazardidentification`
- **Sub Defs:** `hazard`
- **File Limit:** MULTIPLE
- **Imports:** `itemdefinition`, `functiongroup`

### **14. `.rsk` - Risk Assessment**
```sylang
def riskassessment MyRisks                     // HEADER DEF (required)
  name "My Risk Assessment"
  description "Risk analysis"
  
  def risk RSK_001                             // SUB DEF
    name "Risk 001"
    exposure high                              // Enum secondary keyword
    controllability low                        // Enum secondary keyword
    derivedfrom hazard HAZ_001                // Compound property
    evaluates risk PARENT_RSK                 // Compound property
```
- **Header Types:** `riskassessment`
- **Sub Defs:** `risk`
- **File Limit:** MULTIPLE
- **Imports:** `hazardidentification`

### **15. `.sgl` - Safety Goals**
```sylang
def safetygoals MySafetyGoals                  // HEADER DEF (required)
  name "My Safety Goals"
  description "System safety goals"
  
  def safetygoal SG_001                        // SUB DEF
    name "Safety Goal 001"
    asil ASIL-D                                // Enum secondary keyword
    category functional                        // Enum secondary keyword
    derivedfrom risk RSK_001                  // Compound property
    allocatedto function ProcessData           // Compound property
```
- **Header Types:** `safetygoals`
- **Sub Defs:** `safetygoal`
- **File Limit:** MULTIPLE
- **Imports:** `riskassessment`

---

## ⚡ **VALIDATION RULES TO IMPLEMENT**

### **1. HEADER DEF VALIDATION**
- ✅ **One header def per file** - Enforce exactly one parent symbol
- ✅ **Header def must be first** - After imports, before any sub defs
- ✅ **Correct header type** - Must match file extension expectations

### **2. SUB DEF VALIDATION**
- ✅ **Proper nesting** - Sub defs must be indented under header def
- ✅ **Valid sub def types** - Only allowed sub def types for each file type
- ✅ **Parent-child relationships** - Proper symbol hierarchy

### **3. KEYWORD AVAILABILITY VALIDATION**
- ✅ **Primary keywords exist** - `def`, header types, sub def types
- ✅ **Secondary keywords exist** - Enum values, definition types
- ✅ **Tertiary keywords exist** - For complex compound properties
- ✅ **Context-appropriate** - Keywords valid in current context

### **4. PROPERTY VALIDATION**
- ✅ **Required properties present** - `name`, `description` etc.
- ✅ **Compound property syntax** - Primary + secondary + value
- ✅ **Reference validation** - Referenced symbols must exist
- ✅ **Enum validation** - Enum values must be valid

### **5. FILE LIMIT VALIDATION**
- ✅ **Unique file enforcement** - Only one `.ple`, `.fml`, `.vcf` per project
- ✅ **Multiple file allowance** - All other extensions can have multiple files

### **6. IMPORT VALIDATION**
- ✅ **Valid import sources** - Can only import allowed file types
- ✅ **Symbol accessibility** - Imported symbols must be available
- ✅ **Circular dependency detection** - Prevent import cycles

---

## 🎯 **IMPLEMENTATION STATUS**

### **✅ CURRENTLY IMPLEMENTED:**
- Basic def statement parsing
- Some compound property validation
- Partial keyword validation
- Symbol hierarchy tracking (parentSymbol/childSymbols)

### **❌ NEEDS IMPLEMENTATION:**
- **Header def vs sub def enforcement**
- **File limit validation (unique files)**
- **Complete keyword availability checking**
- **Comprehensive compound property validation for all 15 extensions**
- **Parent-child symbol relationship validation**
- **Real-time red squiggly line validation**

### **🔧 NEXT STEPS:**
1. **Implement header/sub def validation**
2. **Complete keyword availability checking**
3. **Add file limit enforcement**
4. **Enhance compound property validation**
5. **Test with all 15 extensions**

---

**This document serves as the complete specification for Sylang core rules across all 15 extensions.** 