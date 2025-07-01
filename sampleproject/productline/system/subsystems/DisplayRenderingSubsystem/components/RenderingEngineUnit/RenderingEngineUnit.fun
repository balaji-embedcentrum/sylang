componentfunctions RenderingEngineUnit
  // ========== RenderingFrameworkCore Decomposition ==========
  
  function SceneGraphManager
    name "Scene Graph Manager"
    description "Manages scene graph structures and hierarchical object relationships for rendering"
    owner "Display Team"
    tags "scene", "graph", "hierarchical", "relationships"
    safetylevel ASIL-B
    decomposes RenderingFrameworkCore
    performedby RenderingEngineUnit

  function RenderingContextController
    name "Rendering Context Controller"
    description "Controls rendering contexts and manages multiple rendering surface configurations"
    owner "Display Team"
    tags "rendering", "context", "surfaces", "configurations"
    safetylevel ASIL-B
    decomposes RenderingFrameworkCore
    performedby RenderingEngineUnit

  function DrawCallOptimizer
    name "Draw Call Optimizer"
    description "Optimizes draw calls and minimizes rendering state changes for performance"
    owner "Display Team"
    tags "draw", "calls", "optimization", "performance"
    safetylevel ASIL-B
    decomposes RenderingFrameworkCore
    performedby RenderingEngineUnit

  function CullingEngine
    name "Culling Engine"
    description "Implements frustum and occlusion culling to eliminate non-visible geometry"
    owner "Display Team"
    tags "culling", "frustum", "occlusion", "geometry"
    safetylevel ASIL-B
    decomposes RenderingFrameworkCore
    performedby RenderingEngineUnit

  // ========== FrameRateController Decomposition ==========

  function VSyncController
    name "VSync Controller"
    description "Controls vertical synchronization to prevent screen tearing and maintain smooth rendering"
    owner "Display Team"
    tags "vsync", "synchronization", "screen-tearing", "smooth"
    safetylevel ASIL-B
    decomposes FrameRateController
    performedby RenderingEngineUnit

  function FramePacingEngine
    name "Frame Pacing Engine"
    description "Controls frame pacing and maintains consistent frame delivery timing"
    owner "Display Team"
    tags "frame", "pacing", "consistent", "timing"
    safetylevel ASIL-B
    decomposes FrameRateController
    performedby RenderingEngineUnit

  function AdaptiveFrameRateManager
    name "Adaptive Frame Rate Manager"
    description "Manages adaptive frame rates based on system performance and power constraints"
    owner "Display Team"
    tags "adaptive", "frame-rate", "performance", "power"
    safetylevel ASIL-B
    decomposes FrameRateController
    performedby RenderingEngineUnit

  function FrameDropDetector
    name "Frame Drop Detector"
    description "Detects frame drops and implements recovery strategies for smooth rendering"
    owner "Display Team"
    tags "frame", "drops", "detection", "recovery"
    safetylevel ASIL-B
    decomposes FrameRateController
    performedby RenderingEngineUnit

  // ========== GPUResourceManager Decomposition ==========

  function BufferAllocationController
    name "Buffer Allocation Controller"
    description "Controls GPU buffer allocation and manages vertex/index buffer resources"
    owner "Display Team"
    tags "buffer", "allocation", "vertex", "index"
    safetylevel ASIL-B
    decomposes GPUResourceManager
    performedby RenderingEngineUnit

  function ShaderResourceManager
    name "Shader Resource Manager"
    description "Manages shader resources including uniform buffers and constant data"
    owner "Display Team"
    tags "shader", "resources", "uniforms", "constants"
    safetylevel ASIL-B
    decomposes GPUResourceManager
    performedby RenderingEngineUnit

  function GPUMemoryPool
    name "GPU Memory Pool"
    description "Manages GPU memory pools and implements efficient memory allocation strategies"
    owner "Display Team"
    tags "GPU", "memory", "pools", "allocation"
    safetylevel ASIL-B
    decomposes GPUResourceManager
    performedby RenderingEngineUnit

  function ResourceCacheManager
    name "Resource Cache Manager"
    description "Manages resource caching and implements LRU cache policies for GPU resources"
    owner "Display Team"
    tags "resource", "cache", "LRU", "policies"
    safetylevel ASIL-B
    decomposes GPUResourceManager
    performedby RenderingEngineUnit

  // ========== RenderQueueManager Decomposition ==========

  function RenderJobScheduler
    name "Render Job Scheduler"
    description "Schedules rendering jobs and manages parallel rendering task execution"
    owner "Display Team"
    tags "render", "jobs", "scheduling", "parallel"
    safetylevel ASIL-B
    decomposes RenderQueueManager
    performedby RenderingEngineUnit

  function PriorityQueueController
    name "Priority Queue Controller"
    description "Controls priority-based rendering queues for optimal resource utilization"
    owner "Display Team"
    tags "priority", "queue", "optimal", "utilization"
    safetylevel ASIL-B
    decomposes RenderQueueManager
    performedby RenderingEngineUnit

  function BatchingEngine
    name "Batching Engine"
    description "Batches similar rendering operations to minimize GPU state changes"
    owner "Display Team"
    tags "batching", "operations", "minimize", "state-changes"
    safetylevel ASIL-B
    decomposes RenderQueueManager
    performedby RenderingEngineUnit

  function LoadBalancingController
    name "Load Balancing Controller"
    description "Balances rendering loads across multiple GPU cores and processing units"
    owner "Display Team"
    tags "load", "balancing", "GPU", "cores"
    safetylevel ASIL-B
    decomposes RenderQueueManager
    performedby RenderingEngineUnit

  // ========== Advanced Rendering Engine Features ==========

  function MultiThreadedRenderer
    name "Multi Threaded Renderer"
    description "Implements multi-threaded rendering for improved performance on multi-core systems"
    owner "Display Team"
    tags "multi-threaded", "performance", "multi-core", "systems"
    safetylevel ASIL-B
    decomposes RenderingFrameworkCore
    performedby RenderingEngineUnit

  function RenderingStatisticsCollector
    name "Rendering Statistics Collector"
    description "Collects rendering performance statistics and generates optimization reports"
    owner "Display Team"
    tags "statistics", "performance", "optimization", "reports"
    safetylevel ASIL-B
    decomposes RenderingFrameworkCore
    performedby RenderingEngineUnit

  function ErrorRecoveryEngine
    name "Error Recovery Engine"
    description "Handles rendering errors and implements recovery strategies for robust operation"
    owner "Display Team"
    tags "error", "recovery", "strategies", "robust"
    safetylevel ASIL-B
    decomposes RenderingFrameworkCore
    performedby RenderingEngineUnit

  function DebugVisualizationEngine
    name "Debug Visualization Engine"
    description "Provides debug visualization tools for rendering pipeline analysis"
    owner "Display Team"
    tags "debug", "visualization", "pipeline", "analysis"
    safetylevel ASIL-B
    decomposes RenderingFrameworkCore
    performedby RenderingEngineUnit 