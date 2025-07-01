subsystemfunctions HMIControlSubsystem
  function UserInputHandler
    name "User Input Handler"
    description "Handles raw user input events from physical switches and translates them to system commands."
    owner "HMI Team"
    tags "input", "handler", "events"
    safetylevel ASIL-B
    compose HMIInterfaceProcessor
    performedby HMIControlSubsystem

  function SwitchConfigurationManager
    name "Switch Configuration Manager"
    description "Manages configuration and initialization of different switch types and their properties."
    owner "HMI Team"
    tags "switch", "configuration", "management"
    safetylevel ASIL-B
    compose InputDeviceController
    performedby HMIControlSubsystem

  function VisualStateController
    name "Visual State Controller"
    description "Controls the visual state representation and coordinates display updates across all feedback systems."
    owner "HMI Team"
    tags "visual", "state", "control"
    safetylevel ASIL-B
    compose VisualFeedbackManager
    performedby HMIControlSubsystem

  function InterfaceEventDispatcher
    name "Interface Event Dispatcher"
    description "Dispatches interface events to appropriate handlers and manages event routing."
    owner "HMI Team"
    tags "event", "dispatcher", "routing"
    safetylevel ASIL-B
    compose HMIInterfaceProcessor
    performedby HMIControlSubsystem

  function InputSignalDebouncer
    name "Input Signal Debouncer"
    description "Filters and debounces input signals to eliminate noise and false triggers."
    owner "HMI Team"
    tags "debounce", "filter", "noise"
    safetylevel ASIL-B
    compose InputDeviceController
    performedby HMIControlSubsystem

  function SwitchStateManager
    name "Switch State Manager"
    description "Manages and tracks the current state of all physical switches in the system."
    owner "HMI Team"
    tags "state", "management", "tracking"
    safetylevel ASIL-B
    compose InputDeviceController
    performedby HMIControlSubsystem

  function HMICommandTranslator
    name "HMI Command Translator"
    description "Translates high-level HMI commands into low-level hardware control signals."
    owner "HMI Team"
    tags "translation", "commands", "signals"
    safetylevel ASIL-B
    compose HMIInterfaceProcessor
    performedby HMIControlSubsystem

  function UserPreferenceManager
    name "User Preference Manager"
    description "Manages user preferences for interface behavior and customization settings."
    owner "HMI Team"
    tags "preferences", "customization", "settings"
    safetylevel QM
    compose HMIInterfaceProcessor
    performedby HMIControlSubsystem

  function FeedbackCoordinator
    name "Feedback Coordinator"
    description "Coordinates all types of user feedback including visual, audible, and haptic responses."
    owner "HMI Team"
    tags "feedback", "coordination", "response"
    safetylevel ASIL-B
    compose VisualFeedbackManager
    performedby HMIControlSubsystem

  function InterfaceHealthMonitor
    name "Interface Health Monitor"
    description "Monitors the health and responsiveness of all interface components."
    owner "HMI Team"
    tags "health", "monitoring", "responsiveness"
    safetylevel ASIL-B
    compose HMIInterfaceProcessor
    performedby HMIControlSubsystem

  function AccessibilityManager
    name "Accessibility Manager"
    description "Manages accessibility features and adaptive interface behaviors for different user needs."
    owner "HMI Team"
    tags "accessibility", "adaptive", "features"
    safetylevel QM
    compose VisualFeedbackManager
    performedby HMIControlSubsystem

  function InterfaceErrorHandler
    name "Interface Error Handler"
    description "Handles interface errors and implements recovery procedures for HMI malfunctions."
    owner "HMI Team"
    tags "error", "recovery", "malfunction"
    safetylevel ASIL-B
    compose HMIInterfaceProcessor
    performedby HMIControlSubsystem

  function SwitchDiagnosticAgent
    name "Switch Diagnostic Agent"
    description "Performs diagnostic tests on switch hardware and reports switch health status."
    owner "HMI Team"
    tags "diagnostic", "testing", "health"
    safetylevel ASIL-B
    compose InputDeviceController
    performedby HMIControlSubsystem

  function VisualThemeManager
    name "Visual Theme Manager"
    description "Manages visual themes, color schemes, and display appearance configurations."
    owner "HMI Team"
    tags "theme", "color", "appearance"
    safetylevel QM
    compose VisualFeedbackManager
    performedby HMIControlSubsystem 