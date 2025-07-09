# Cross-File Navigation Test Guide

## 🚀 **Enhanced Sylang Extension - Cross-File Navigation**

Your Sylang extension now supports **workspace-wide symbol indexing** with **Go to Definition (F12)** and **Find All References (Shift+F12)** across all 22 file types!

## **✅ What's Now Working**

### **1. Component Navigation**
- In `.sgl` files, **F12** on `ActuatorManagementUnit` → jumps to `.cmp` definition
- **Shift+F12** shows all references across workspace

### **2. Symbol Types Indexed**
- **Components**: `component ActuatorManagementUnit` (in .cmp files)
- **Modules**: `module ActuatorControlModule` (in .mod files)  
- **Circuits**: `circuit CommunicationCircuit` (in .ckt files)
- **Assemblies**: `assembly MountingAssembly` (in .asm files)
- **Requirements**: `requirement FSR_EPB_014` (in .fsr files)
- **Safety Goals**: `goal SG_EPB_001` (in .sgl files)
- **Scenarios**: `scenario SCEN_AUT_001_UnintendedActivation`
- **Measures**: `measure SM_004`
- **Hazards**: `hazard H_ACT_002`

### **3. Cross-References Indexed**
- `enabledby VehicleSpeedAnalyzer` → finds component definition
- `allocatedto SystemMonitoringUnit` → jumps to component
- `derivedfrom SG_EPB_001` → navigates to safety goal
- `implements ActuatorSelectionLogic` → finds def function definition
- `partof ActuationControlSubsystem` → jumps to subsystem

## **🧪 Testing Instructions**

### **Step 1: Open Your Sylang Project**
1. Open VSCode in `/Users/balajiboominathan/Documents/sylang-extn/sampleproject/`
2. Extension will **automatically scan all folders** and build symbol index
3. Check **Output Panel → Sylang Language Server** for indexing logs

### **Step 2: Test Go to Definition (F12)**
1. Open `productline/system/safety/EPBSafetyGoals.sgl`
2. Click on `ActuatorManagementUnit` (line 24)
3. Press **F12** → Should jump to the component definition in `.cmp` file
4. Try with `SG_EPB_001`, `SM_004`, `H_ACT_002`

### **Step 3: Test Find All References (Shift+F12)**
1. Place cursor on any component name (e.g., `ActuatorManagementUnit`)
2. Press **Shift+F12** → Shows all files that reference this component
3. See references in safety goals, requirements, implementations

### **Step 4: Cross-File Type Testing**
- **Safety Goals (.sgl) ↔ Components (.cmp)**: Goal references → Component definitions
- **Components (.cmp) ↔ Modules (.mod)**: Component implementations → Module definitions  
- **Requirements (.fsr) ↔ Goals (.sgl)**: Requirement derivations → Safety goal definitions
- **Scenarios ↔ Hazards**: Cross-reference between safety artifacts

## **🎯 Expected Results**

### **Before Enhancement**
❌ F12 only worked within same file  
❌ No cross-file navigation  
❌ Shift+F12 showed no results  

### **After Enhancement**  
✅ **F12** jumps between any file types  
✅ **Shift+F12** finds all workspace references  
✅ **Symbol index** covers entire project  
✅ **22 file extensions** fully supported  

## **🔧 Technical Implementation**

### **Workspace Scanning**
- Extension scans **entire workspace** on startup
- Indexes **all .ple, .fun, .fma, .fml, .sgl, .haz, .rsk, .fsr, .cmp, .sub, .req, .mod, .prt, .ckt, .asm, .itm, .tra, .thr, .sgo, .sre, .ast, .sec** files
- Builds **global symbol index** for instant navigation

### **Smart Symbol Recognition**
- **Definitions**: `component ActuatorManagementUnit`, `goal SG_EPB_001`
- **References**: `enabledby ActuatorManagementUnit`, `derivedfrom SG_EPB_001`
- **Pattern Matching**: Supports requirement IDs, component names, scenario IDs
- **Real-time Updates**: Index updated when files change

### **LSP Integration**
- **Definition Provider**: Implements `onDefinition` handler
- **Reference Provider**: Implements `onReferences` handler  
- **Symbol Index**: Maps symbol names to file locations
- **Cross-File Support**: Works across different file types and folders

## **🐛 Troubleshooting**

### **If Navigation Doesn't Work**
1. **Check LSP Server**: Output Panel → "Sylang Language Server"
2. **Verify Workspace**: Should see "Workspace symbol indexing completed"
3. **Restart Extension**: Reload VSCode window (Cmd+R)
4. **Check File Types**: Ensure files have correct extensions

### **Performance Notes**
- **First Load**: May take 2-3 seconds to index large workspaces
- **File Changes**: Index updates automatically  
- **Memory Usage**: Efficient symbol storage for fast lookups

---

**🎉 Your Sylang workspace now has professional IDE navigation across all 22 file types!** 