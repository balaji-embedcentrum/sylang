# Testing Variant Config Generation & Visual Graying

## Overview
This document describes how to test the revolutionary variant config generation and visual graying features in Sylang v1.0.66+.

## Test Scenario

### 1. Variant Model (.vml)
File: `test-variant.vml`
- Core features (selected): PowerSupply, BasicControl, AdvancedControl
- Optional features (mixed): FeatureA (selected), FeatureB (not selected), FeatureC (selected)
- PowerManagement (not selected)

### 2. Generate Configuration (.vcf)
1. Right-click on `test-variant.vml` in VS Code Explorer
2. Select "🔧 Generate Variant Config (.vcf)"
3. Should create `test-variant-config.vcf` with:
   - `c_CoreSystem_PowerSystem_PowerSupply 1` (enabled)
   - `c_CoreSystem_PowerSystem_PowerManagement 0` (disabled)
   - `c_CoreSystem_ControlSystem_AdvancedControl 1` (enabled)
   - `c_OptionalFeatures_FeatureB 0` (disabled)

### 3. Test Visual Graying
File: `test-functions.fun`
- **EnabledFunction**: Should be NORMAL (config c_CoreSystem_PowerSystem_PowerSupply = 1)
- **DisabledFunction**: Should be GRAYED OUT (config c_CoreSystem_PowerSystem_PowerManagement = 0)
- **AdvancedFunction**: Should be NORMAL (config c_CoreSystem_ControlSystem_AdvancedControl = 1)
- **FeatureBFunction**: Should be GRAYED OUT (config c_OptionalFeatures_FeatureB = 0)

## Expected Behavior

### Config Generation
```vcf
use variantmodel TestVariant

def configset TestVariantConfigs
    name "TestVariant Configuration Set"
    description "Auto-generated configuration from test-variant.vml variant model selections"
    owner "Product Engineering"
    source "test-variant.vml"
    generated "2025-01-18T17:00:00Z"
    tags "variant", "config", "auto-generated"

    def config c_CoreSystem 1
    def config c_CoreSystem_ControlSystem 1
    def config c_CoreSystem_ControlSystem_AdvancedControl 1
    def config c_CoreSystem_ControlSystem_BasicControl 1
    def config c_CoreSystem_PowerSystem 1
    def config c_CoreSystem_PowerSystem_PowerManagement 0
    def config c_CoreSystem_PowerSystem_PowerSupply 1
    def config c_OptionalFeatures 0
    def config c_OptionalFeatures_FeatureA 1
    def config c_OptionalFeatures_FeatureB 0
    def config c_OptionalFeatures_FeatureC 1
```

### Visual Graying
- Functions with `config` property referencing disabled configs (value = 0) should be grayed out
- Functions with `config` property referencing enabled configs (value = 1) should be normal
- Functions without `config` property should be normal
- Graying should update when .vcf file is modified

## Validation Features

### .vml Validation
- ✅ Single variantmodel per file
- ✅ Feature selection syntax validation
- ✅ Hierarchical indentation (4 spaces)
- ✅ Import statement validation

### .vcf Validation
- ✅ Single configset per file
- ✅ Config naming convention (c_ prefix)
- ✅ Binary values (0/1 only)
- ✅ Single .vcf per workspace
- ✅ Timestamp format validation

### Config Property Validation
- ✅ Config references in .fun files
- ✅ Config references in .req files
- ✅ Config references in .sys files
- ✅ Config naming validation

## Performance Features
- ✅ Intelligent caching of config values
- ✅ Real-time decoration updates
- ✅ Workspace-aware config management
- ✅ Event-driven updates on .vcf changes

## Advanced Testing

### Multiple Variant Models
1. Create multiple .vml files (automotive.vml, aerospace.vml)
2. Generate config from first variant
3. Try to generate from second variant
4. Should prompt to replace existing .vcf file

### Config References
1. Add config properties to various file types
2. Reference both enabled and disabled configs
3. Verify visual graying works across all file types

### Error Handling
1. Try to create .vcf with invalid .vml file
2. Test with malformed config references
3. Test with missing .vcf file

## Success Criteria
- ✅ Right-click command works on .vml files
- ✅ Generated .vcf files have correct hierarchical config names
- ✅ Visual graying works for disabled configs
- ✅ Real-time updates when .vcf changes
- ✅ Single .vcf constraint enforced
- ✅ Complete syntax highlighting and validation
- ✅ Performance remains responsive

This represents the first-ever **real-time variant-driven visual feedback** system for MBSE tools! 