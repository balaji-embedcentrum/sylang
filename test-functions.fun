use featureset TestFeatures

def functiongroup TestFunctions
    name "Test Function Group"
    description "Functions for testing config-based visual graying"
    owner "Test Team"
    tags "test", "functions"
    safetylevel ASIL-C

    # This should be visible (config = 1)
    def function EnabledFunction
        name "Enabled Function"
        description "This function should be visible when config is enabled"
        owner "Test Team"
        tags "enabled", "visible"
        safetylevel ASIL-C
        category "control"
        config c_CoreSystem_PowerSystem_PowerSupply

    # This should be grayed out (config = 0)
    def function DisabledFunction
        name "Disabled Function"
        description "This function should be grayed out when config is disabled"
        owner "Test Team"
        tags "disabled", "grayed"
        safetylevel ASIL-B
        category "control"
        config c_CoreSystem_PowerSystem_PowerManagement

    # This should be visible (config = 1)
    def function AdvancedFunction
        name "Advanced Function"
        description "This function should be visible for advanced control"
        owner "Test Team"
        tags "advanced", "control"
        safetylevel ASIL-C
        category "control"
        config c_CoreSystem_ControlSystem_AdvancedControl

    # This should be grayed out (config = 0)
    def function FeatureBFunction
        name "Feature B Function"
        description "This function should be grayed out when Feature B is not selected"
        owner "Test Team"
        tags "feature-b", "optional"
        safetylevel ASIL-B
        category "control"
        config c_OptionalFeatures_FeatureB 