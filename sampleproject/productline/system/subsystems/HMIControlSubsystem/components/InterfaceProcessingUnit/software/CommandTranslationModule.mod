softwaremodule CommandTranslationModule
  name "Command Translation Module"
  description "Software module responsible for input mapping, contextual command resolution, command parameter extraction, and macro expansion"
  owner "HMI Team"
  tags "command-translation", "input-mapping", "contextual-resolution", "macro-expansion"
  safetylevel ASIL-B
  partof InterfaceProcessingUnit
  implements InputMappingController, ContextualCommandResolver, CommandParameterExtractor, MacroExpansionEngine
  interfaces
    input mapped_inputs "Mapped input events and system command requirements"
    input context_data "System context data and operational mode information"
    output mapping_controller "Input mapping control and command function assignment"
    output command_resolver "Contextual command resolution and mode-based processing"
    output parameter_extractor "Command parameter extraction and parameterized input processing"
    output macro_engine "Macro expansion and shortcut command sequence generation"
