componentfunctions ContentManagementUnit
  // ========== ContentOrchestrationEngine Decomposition ==========
  
  function ContentSourceManager
    name "Content Source Manager"
    description "Manages multiple content sources and coordinates content acquisition from various providers"
    owner "Display Team"
    tags "content", "sources", "acquisition", "coordination"
    safetylevel ASIL-B
    decomposes ContentOrchestrationEngine
    performedby ContentManagementUnit

  function ContentPriorityController
    name "Content Priority Controller"
    description "Controls content display priorities and manages content scheduling based on importance"
    owner "Display Team"
    tags "content", "priority", "scheduling", "importance"
    safetylevel ASIL-B
    decomposes ContentOrchestrationEngine
    performedby ContentManagementUnit

  function ContentSynchronizationEngine
    name "Content Synchronization Engine"
    description "Synchronizes content updates across multiple display zones and ensures consistency"
    owner "Display Team"
    tags "content", "synchronization", "consistency", "zones"
    safetylevel ASIL-B
    decomposes ContentOrchestrationEngine
    performedby ContentManagementUnit

  function ContentLifecycleManager
    name "Content Lifecycle Manager"
    description "Manages content lifecycle from creation to deletion including versioning and archival"
    owner "Display Team"
    tags "content", "lifecycle", "versioning", "archival"
    safetylevel ASIL-B
    decomposes ContentOrchestrationEngine
    performedby ContentManagementUnit

  // ========== DisplayContentFormatter Decomposition ==========

  function LayoutCalculationEngine
    name "Layout Calculation Engine"
    description "Calculates optimal layout arrangements for different content types and screen sizes"
    owner "Display Team"
    tags "layout", "calculation", "content-types", "screen-sizes"
    safetylevel ASIL-B
    decomposes DisplayContentFormatter
    performedby ContentManagementUnit

  function TextRenderingProcessor
    name "Text Rendering Processor"
    description "Processes text content for rendering with font management and typography optimization"
    owner "Display Team"
    tags "text", "rendering", "fonts", "typography"
    safetylevel ASIL-B
    decomposes DisplayContentFormatter
    performedby ContentManagementUnit

  function ImageProcessingEngine
    name "Image Processing Engine"
    description "Processes images for display including scaling, format conversion, and optimization"
    owner "Display Team"
    tags "image", "processing", "scaling", "optimization"
    safetylevel ASIL-B
    decomposes DisplayContentFormatter
    performedby ContentManagementUnit

  function VectorGraphicsRenderer
    name "Vector Graphics Renderer"
    description "Renders vector graphics and scalable elements for high-quality display output"
    owner "Display Team"
    tags "vector", "graphics", "scalable", "high-quality"
    safetylevel ASIL-B
    decomposes DisplayContentFormatter
    performedby ContentManagementUnit

  // ========== ContentCacheManager Decomposition ==========

  function ContentCacheOptimizer
    name "Content Cache Optimizer"
    description "Optimizes content caching strategies to minimize load times and improve responsiveness"
    owner "Display Team"
    tags "cache", "optimization", "load-times", "responsiveness"
    safetylevel ASIL-B
    decomposes ContentCacheManager
    performedby ContentManagementUnit

  function PreloadingController
    name "Preloading Controller"
    description "Controls content preloading based on usage patterns and predictive algorithms"
    owner "Display Team"
    tags "preloading", "patterns", "predictive", "algorithms"
    safetylevel ASIL-B
    decomposes ContentCacheManager
    performedby ContentManagementUnit

  function CacheInvalidationEngine
    name "Cache Invalidation Engine"
    description "Manages cache invalidation when content updates to ensure fresh content delivery"
    owner "Display Team"
    tags "cache", "invalidation", "updates", "fresh-content"
    safetylevel ASIL-B
    decomposes ContentCacheManager
    performedby ContentManagementUnit

  function MemoryUsageOptimizer
    name "Memory Usage Optimizer"
    description "Optimizes memory usage for content caching and manages memory allocation efficiently"
    owner "Display Team"
    tags "memory", "optimization", "allocation", "efficiency"
    safetylevel ASIL-B
    decomposes ContentCacheManager
    performedby ContentManagementUnit

  // ========== ThemeManagementSystem Decomposition ==========

  function ThemeSelectionEngine
    name "Theme Selection Engine"
    description "Selects appropriate themes based on user preferences and environmental conditions"
    owner "Display Team"
    tags "theme", "selection", "preferences", "environmental"
    safetylevel ASIL-B
    decomposes ThemeManagementSystem
    performedby ContentManagementUnit

  function ColorSchemeController
    name "Color Scheme Controller"
    description "Controls color schemes and adapts colors for optimal visibility and aesthetics"
    owner "Display Team"
    tags "color", "schemes", "visibility", "aesthetics"
    safetylevel ASIL-B
    decomposes ThemeManagementSystem
    performedby ContentManagementUnit

  function AdaptiveThemeEngine
    name "Adaptive Theme Engine"
    description "Adapts themes dynamically based on ambient light, time of day, and driving conditions"
    owner "Display Team"
    tags "adaptive", "themes", "ambient-light", "conditions"
    safetylevel ASIL-B
    decomposes ThemeManagementSystem
    performedby ContentManagementUnit

  function CustomizationManager
    name "Customization Manager"
    description "Manages user customizations and personalizations for display themes and layouts"
    owner "Display Team"
    tags "customization", "personalization", "themes", "layouts"
    safetylevel ASIL-B
    decomposes ThemeManagementSystem
    performedby ContentManagementUnit 