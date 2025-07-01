componentfunctions GraphicsRenderingUnit
  // ========== RenderingPipelineManager Decomposition ==========
  
  function GeometryProcessingEngine
    name "Geometry Processing Engine"
    description "Processes geometric data and handles vertex transformations for 3D rendering"
    owner "Display Team"
    tags "geometry", "processing", "vertex", "transformations"
    safetylevel ASIL-B
    decomposes RenderingPipelineManager
    performedby GraphicsRenderingUnit

  function RasterizationController
    name "Rasterization Controller"
    description "Controls rasterization processes and converts vector graphics to pixel data"
    owner "Display Team"
    tags "rasterization", "vector", "pixels", "conversion"
    safetylevel ASIL-B
    decomposes RasterizationPipelineManager
    performedby GraphicsRenderingUnit

  function ShaderProgramManager
    name "Shader Program Manager"
    description "Manages shader programs and handles GPU shader compilation and execution"
    owner "Display Team"
    tags "shader", "programs", "GPU", "compilation"
    safetylevel ASIL-B
    decomposes GraphicsShaderEngine
    performedby GraphicsRenderingUnit

  function RenderStateManager
    name "Render State Manager"
    description "Manages rendering states and optimizes state changes for performance"
    owner "Display Team"
    tags "render", "states", "optimization", "performance"
    safetylevel ASIL-B
    decomposes RenderingPipelineManager
    performedby GraphicsRenderingUnit

  // ========== TextureManagementSystem Decomposition ==========

  function TextureLoadingEngine
    name "Texture Loading Engine"
    description "Loads textures from various sources and manages texture format conversions"
    owner "Display Team"
    tags "texture", "loading", "formats", "conversion"
    safetylevel ASIL-B
    decomposes TextureStreamingEngine
    performedby GraphicsRenderingUnit

  function TextureCompressionProcessor
    name "Texture Compression Processor"
    description "Compresses textures for optimal memory usage and loading performance"
    owner "Display Team"
    tags "texture", "compression", "memory", "performance"
    safetylevel ASIL-B
    decomposes TextureStreamingEngine
    performedby GraphicsRenderingUnit

  function MipmapGenerationEngine
    name "Mipmap Generation Engine"
    description "Generates mipmaps for texture level-of-detail and quality optimization"
    owner "Display Team"
    tags "mipmap", "generation", "level-of-detail", "quality"
    safetylevel ASIL-B
    decomposes TextureStreamingEngine
    performedby GraphicsRenderingUnit

  function TextureCacheController
    name "Texture Cache Controller"
    description "Controls texture caching and manages GPU texture memory efficiently"
    owner "Display Team"
    tags "texture", "cache", "GPU", "memory"
    safetylevel ASIL-B
    decomposes TextureStreamingEngine
    performedby GraphicsRenderingUnit

  // ========== LightingCalculationEngine Decomposition ==========

  function AmbientLightingProcessor
    name "Ambient Lighting Processor"
    description "Processes ambient lighting effects and manages global illumination"
    owner "Display Team"
    tags "ambient", "lighting", "global", "illumination"
    safetylevel ASIL-B
    decomposes LightingEffectsProcessor
    performedby GraphicsRenderingUnit

  function DirectionalLightManager
    name "Directional Light Manager"
    description "Manages directional lighting sources and calculates light direction effects"
    owner "Display Team"
    tags "directional", "lighting", "sources", "effects"
    safetylevel ASIL-B
    decomposes LightingEffectsProcessor
    performedby GraphicsRenderingUnit

  function ShadowMappingEngine
    name "Shadow Mapping Engine"
    description "Implements shadow mapping techniques for realistic shadow rendering"
    owner "Display Team"
    tags "shadow", "mapping", "realistic", "rendering"
    safetylevel ASIL-B
    decomposes LightingEffectsProcessor
    performedby GraphicsRenderingUnit

  function MaterialPropertiesCalculator
    name "Material Properties Calculator"
    description "Calculates material properties and handles surface reflection characteristics"
    owner "Display Team"
    tags "material", "properties", "surface", "reflection"
    safetylevel ASIL-B
    decomposes LightingEffectsProcessor
    performedby GraphicsRenderingUnit

  // ========== AntiAliasingProcessor Decomposition ==========

  function EdgeDetectionAlgorithm
    name "Edge Detection Algorithm"
    description "Detects edges in rendered graphics for anti-aliasing processing"
    owner "Display Team"
    tags "edge", "detection", "anti-aliasing", "processing"
    safetylevel ASIL-B
    decomposes VisualQualityEnhancer
    performedby GraphicsRenderingUnit

  function SupersamplingEngine
    name "Supersampling Engine"
    description "Implements supersampling anti-aliasing for high-quality edge smoothing"
    owner "Display Team"
    tags "supersampling", "anti-aliasing", "edge", "smoothing"
    safetylevel ASIL-B
    decomposes VisualQualityEnhancer
    performedby GraphicsRenderingUnit

  function TemporalAntiAliasingController
    name "Temporal Anti Aliasing Controller"
    description "Controls temporal anti-aliasing techniques for motion-based smoothing"
    owner "Display Team"
    tags "temporal", "anti-aliasing", "motion", "smoothing"
    safetylevel ASIL-B
    decomposes VisualQualityEnhancer
    performedby GraphicsRenderingUnit

  function AdaptiveQualityManager
    name "Adaptive Quality Manager"
    description "Manages adaptive quality settings based on performance requirements"
    owner "Display Team"
    tags "adaptive", "quality", "performance", "requirements"
    safetylevel ASIL-B
    decomposes VisualQualityEnhancer
    performedby GraphicsRenderingUnit

  // ========== Advanced Graphics Features ==========

  function PostProcessingEffectsEngine
    name "Post Processing Effects Engine"
    description "Applies post-processing effects including bloom, tone mapping, and color correction"
    owner "Display Team"
    tags "post-processing", "effects", "bloom", "color-correction"
    safetylevel ASIL-B
    decomposes VisualQualityEnhancer
    performedby GraphicsRenderingUnit

  function PerformanceProfiler
    name "Performance Profiler"
    description "Profiles graphics rendering performance and identifies optimization opportunities"
    owner "Display Team"
    tags "performance", "profiling", "optimization", "opportunities"
    safetylevel ASIL-B
    decomposes RenderingPipelineManager
    performedby GraphicsRenderingUnit 