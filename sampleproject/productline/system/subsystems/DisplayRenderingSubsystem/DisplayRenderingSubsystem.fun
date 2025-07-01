subsystemfunctions DisplayRenderingSubsystem
  function InstrumentInterfaceDriver
    name "Instrument Interface Driver"
    description "Low-level driver for instrument cluster communication and display control."
    owner "HMI Team"
    tags "instrument", "driver", "interface"
    safetylevel ASIL-B
    compose InstrumentClusterInterface
    performedby DisplayRenderingSubsystem

  function LayoutCalculationEngine
    name "Layout Calculation Engine"
    description "Calculates optimal display layouts and manages screen real estate allocation."
    owner "HMI Team"
    tags "layout", "calculation", "allocation"
    safetylevel QM
    compose DisplayLayoutEngine
    performedby DisplayRenderingSubsystem

  function WarningGraphicsRenderer
    name "Warning Graphics Renderer"
    description "Renders warning graphics and manages warning display animations and effects."
    owner "HMI Team"
    tags "warning", "graphics", "animations"
    safetylevel QM
    compose WarningAreaRenderer
    performedby DisplayRenderingSubsystem

  function StatusBarManager
    name "Status Bar Manager"
    description "Manages status bar content, updates, and priority-based information display."
    owner "HMI Team"
    tags "status", "bar", "priority"
    safetylevel QM
    compose StatusBarController
    performedby DisplayRenderingSubsystem

  function DisplayCoordinationService
    name "Display Coordination Service"
    description "Coordinates multiple display elements and manages display synchronization."
    owner "HMI Team"
    tags "coordination", "synchronization", "display"
    safetylevel ASIL-B
    compose InstrumentClusterInterface
    performedby DisplayRenderingSubsystem

  function PixelLevelRenderer
    name "Pixel Level Renderer"
    description "Handles low-level pixel rendering and graphics primitive operations."
    owner "HMI Team"
    tags "pixel", "rendering", "primitives"
    safetylevel QM
    compose DisplayLayoutEngine
    performedby DisplayRenderingSubsystem

  function FontRenderingEngine
    name "Font Rendering Engine"
    description "Renders fonts and text elements with anti-aliasing and scaling support."
    owner "HMI Team"
    tags "font", "text", "scaling"
    safetylevel QM
    compose StatusBarController
    performedby DisplayRenderingSubsystem

  function AnimationController
    name "Animation Controller"
    description "Controls display animations, transitions, and visual effects timing."
    owner "HMI Team"
    tags "animation", "transitions", "timing"
    safetylevel QM
    compose WarningAreaRenderer
    performedby DisplayRenderingSubsystem

  function DisplayBufferManager
    name "Display Buffer Manager"
    description "Manages display buffers, double buffering, and screen refresh operations."
    owner "HMI Team"
    tags "buffer", "refresh", "operations"
    safetylevel QM
    compose DisplayLayoutEngine
    performedby DisplayRenderingSubsystem

  function ColorSpaceConverter
    name "Color Space Converter"
    description "Converts between different color spaces and manages color calibration."
    owner "HMI Team"
    tags "color", "conversion", "calibration"
    safetylevel QM
    compose InstrumentClusterInterface
    performedby DisplayRenderingSubsystem

  function DisplayHealthMonitor
    name "Display Health Monitor"
    description "Monitors display hardware health and detects display malfunctions."
    owner "HMI Team"
    tags "health", "monitoring", "malfunctions"
    safetylevel ASIL-B
    compose InstrumentClusterInterface
    performedby DisplayRenderingSubsystem

  function ContentPriorityManager
    name "Content Priority Manager"
    description "Manages content priority and resolves display conflicts between different information sources."
    owner "HMI Team"
    tags "priority", "conflicts", "sources"
    safetylevel ASIL-B
    compose StatusBarController
    performedby DisplayRenderingSubsystem

  function DisplayConfigurationManager
    name "Display Configuration Manager"
    description "Manages display configuration settings and adaptive display parameters."
    owner "HMI Team"
    tags "configuration", "adaptive", "parameters"
    safetylevel QM
    compose DisplayLayoutEngine
    performedby DisplayRenderingSubsystem

  function GraphicsAccelerationController
    name "Graphics Acceleration Controller"
    description "Controls graphics acceleration hardware and optimizes rendering performance."
    owner "HMI Team"
    tags "acceleration", "hardware", "performance"
    safetylevel QM
    compose WarningAreaRenderer
    performedby DisplayRenderingSubsystem 