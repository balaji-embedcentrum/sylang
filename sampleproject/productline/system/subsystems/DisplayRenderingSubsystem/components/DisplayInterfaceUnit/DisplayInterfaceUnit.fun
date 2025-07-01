componentfunctions DisplayInterfaceUnit
  // ========== ScreenResolutionController Decomposition ==========
  
  function ResolutionAdaptationEngine
    name "Resolution Adaptation Engine"
    description "Adapts content to different screen resolutions and maintains aspect ratios"
    owner "Display Team"
    tags "resolution", "adaptation", "aspect-ratios", "scaling"
    safetylevel ASIL-B
    decomposes ScreenResolutionController
    performedby DisplayInterfaceUnit

  function DensityCompensationAlgorithm
    name "Density Compensation Algorithm"
    description "Compensates for different pixel densities to ensure consistent visual appearance"
    owner "Display Team"
    tags "density", "compensation", "pixels", "consistency"
    safetylevel ASIL-B
    decomposes ScreenResolutionController
    performedby DisplayInterfaceUnit

  function ViewportManager
    name "Viewport Manager"
    description "Manages viewport configurations and handles display area calculations"
    owner "Display Team"
    tags "viewport", "configuration", "display-area", "calculations"
    safetylevel ASIL-B
    decomposes ScreenResolutionController
    performedby DisplayInterfaceUnit

  function ScalingFactorCalculator
    name "Scaling Factor Calculator"
    description "Calculates appropriate scaling factors for different display configurations"
    owner "Display Team"
    tags "scaling", "factors", "display", "configurations"
    safetylevel ASIL-B
    decomposes ScreenResolutionController
    performedby DisplayInterfaceUnit

  // ========== TouchInterfaceProcessor Decomposition ==========

  function TouchInputDetector
    name "Touch Input Detector"
    description "Detects and processes touch input events with multi-touch support"
    owner "Display Team"
    tags "touch", "input", "detection", "multi-touch"
    safetylevel ASIL-B
    decomposes TouchInterfaceProcessor
    performedby DisplayInterfaceUnit

  function GestureRecognitionEngine
    name "Gesture Recognition Engine"
    description "Recognizes complex gestures and translates them into system commands"
    owner "Display Team"
    tags "gesture", "recognition", "complex", "commands"
    safetylevel ASIL-B
    decomposes TouchInterfaceProcessor
    performedby DisplayInterfaceUnit

  function TouchCalibrationController
    name "Touch Calibration Controller"
    description "Controls touch screen calibration and maintains touch accuracy"
    owner "Display Team"
    tags "touch", "calibration", "accuracy", "maintenance"
    safetylevel ASIL-B
    decomposes TouchInterfaceProcessor
    performedby DisplayInterfaceUnit

  function HapticFeedbackController
    name "Haptic Feedback Controller"
    description "Controls haptic feedback responses to enhance user interaction experience"
    owner "Display Team"
    tags "haptic", "feedback", "interaction", "experience"
    safetylevel ASIL-B
    decomposes TouchInterfaceProcessor
    performedby DisplayInterfaceUnit

  // ========== DisplayDriverInterface Decomposition ==========

  function HardwareAbstractionLayer
    name "Hardware Abstraction Layer"
    description "Provides hardware abstraction for different display driver implementations"
    owner "Display Team"
    tags "hardware", "abstraction", "drivers", "implementations"
    safetylevel ASIL-B
    decomposes DisplayDriverInterface
    performedby DisplayInterfaceUnit

  function PixelLevelController
    name "Pixel Level Controller"
    description "Controls individual pixel operations and low-level display manipulation"
    owner "Display Team"
    tags "pixel", "control", "low-level", "manipulation"
    safetylevel ASIL-B
    decomposes DisplayDriverInterface
    performedby DisplayInterfaceUnit

  function FrameBufferManager
    name "Frame Buffer Manager"
    description "Manages frame buffer operations including double buffering and synchronization"
    owner "Display Team"
    tags "frame", "buffer", "double-buffering", "synchronization"
    safetylevel ASIL-B
    decomposes DisplayDriverInterface
    performedby DisplayInterfaceUnit

  function VideoMemoryController
    name "Video Memory Controller"
    description "Controls video memory allocation and manages GPU memory resources"
    owner "Display Team"
    tags "video", "memory", "allocation", "GPU"
    safetylevel ASIL-B
    decomposes DisplayDriverInterface
    performedby DisplayInterfaceUnit

  // ========== BrightnessController Decomposition ==========

  function AmbientLightSensorProcessor
    name "Ambient Light Sensor Processor"
    description "Processes ambient light sensor data for automatic brightness adjustment"
    owner "Display Team"
    tags "ambient", "light", "sensor", "brightness"
    safetylevel ASIL-B
    decomposes BrightnessController
    performedby DisplayInterfaceUnit

  function AdaptiveBrightnessAlgorithm
    name "Adaptive Brightness Algorithm"
    description "Implements adaptive brightness algorithms based on environmental conditions"
    owner "Display Team"
    tags "adaptive", "brightness", "environmental", "algorithms"
    safetylevel ASIL-B
    decomposes BrightnessController
    performedby DisplayInterfaceUnit

  function UserPreferenceManager
    name "User Preference Manager"
    description "Manages user brightness preferences and personalizes brightness settings"
    owner "Display Team"
    tags "user", "preferences", "brightness", "personalization"
    safetylevel ASIL-B
    decomposes BrightnessController
    performedby DisplayInterfaceUnit

  function PowerConsumptionOptimizer
    name "Power Consumption Optimizer"
    description "Optimizes display power consumption while maintaining visibility requirements"
    owner "Display Team"
    tags "power", "consumption", "optimization", "visibility"
    safetylevel ASIL-B
    decomposes BrightnessController
    performedby DisplayInterfaceUnit

  // ========== Display Configuration Management ==========

  function MultiDisplayCoordinator
    name "Multi Display Coordinator"
    description "Coordinates multiple display outputs and manages extended desktop functionality"
    owner "Display Team"
    tags "multi-display", "coordination", "extended", "desktop"
    safetylevel ASIL-B
    decomposes DisplayDriverInterface
    performedby DisplayInterfaceUnit

  function OrientationController
    name "Orientation Controller"
    description "Controls display orientation changes and handles rotation transformations"
    owner "Display Team"
    tags "orientation", "rotation", "transformations", "control"
    safetylevel ASIL-B
    decomposes ScreenResolutionController
    performedby DisplayInterfaceUnit 