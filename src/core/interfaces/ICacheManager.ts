import * as vscode from 'vscode';
import { IParsingResult, ISymbolIndex } from './ISymbolManager';
import { IValidationResult } from './ILanguagePlugin';

// =============================================================================
// CACHE MANAGEMENT INTERFACES
// =============================================================================

/**
 * Cache manager interface for performance optimization through intelligent caching
 */
export interface ICacheManager {
    // Document caching
    cacheParsingResult(documentUri: string, result: IParsingResult): Promise<void>;
    getCachedParsingResult(documentUri: string): Promise<IParsingResult | undefined>;
    removeCachedParsingResult(documentUri: string): Promise<void>;
    
    // Validation caching
    cacheValidationResult(documentUri: string, result: IValidationResult): Promise<void>;
    getCachedValidationResult(documentUri: string): Promise<IValidationResult | undefined>;
    removeCachedValidationResult(documentUri: string): Promise<void>;
    
    // Symbol caching
    cacheSymbolIndex(index: ISymbolIndex): Promise<void>;
    getCachedSymbolIndex(): Promise<ISymbolIndex | undefined>;
    removeCachedSymbolIndex(): Promise<void>;
    
    // Completion caching
    cacheCompletionItems(documentUri: string, position: vscode.Position, items: vscode.CompletionItem[]): Promise<void>;
    getCachedCompletionItems(documentUri: string, position: vscode.Position): Promise<vscode.CompletionItem[] | undefined>;
    removeCachedCompletionItems(documentUri: string): Promise<void>;
    
    // Import resolution caching
    cacheImportResolution(documentUri: string, resolution: IImportResolutionCache): Promise<void>;
    getCachedImportResolution(documentUri: string): Promise<IImportResolutionCache | undefined>;
    removeCachedImportResolution(documentUri: string): Promise<void>;
    
    // Configuration caching
    cacheConfiguration(configKey: string, value: IConfigurationCache): Promise<void>;
    getCachedConfiguration(configKey: string): Promise<IConfigurationCache | undefined>;
    removeCachedConfiguration(configKey: string): Promise<void>;
    
    // Dependency caching
    cacheDependencyGraph(graph: IDependencyGraphCache): Promise<void>;
    getCachedDependencyGraph(): Promise<IDependencyGraphCache | undefined>;
    removeCachedDependencyGraph(): Promise<void>;
    
    // Cache management
    invalidateDocument(documentUri: string): Promise<void>;
    invalidateWorkspace(): Promise<void>;
    invalidateAll(): Promise<void>;
    
    // Cache statistics and monitoring
    getStats(): ICacheStats;
    getDetailedStats(): IDetailedCacheStats;
    getMemoryUsage(): ICacheMemoryUsage;
    
    // Cache optimization
    optimizeCache(): Promise<void>;
    compactCache(): Promise<void>;
    cleanupExpiredEntries(): Promise<void>;
    
    // Cache persistence
    saveToDisk(): Promise<void>;
    loadFromDisk(): Promise<void>;
    clearDiskCache(): Promise<void>;
    
    // Cache configuration
    updateCacheSettings(settings: ICacheSettings): Promise<void>;
    getCacheSettings(): ICacheSettings;
    
    // Event handling
    onCacheHit(listener: (event: ICacheHitEvent) => void): vscode.Disposable;
    onCacheMiss(listener: (event: ICacheMissEvent) => void): vscode.Disposable;
    onCacheEviction(listener: (event: ICacheEvictionEvent) => void): vscode.Disposable;
    
    // Cache warming
    warmupCache(documentUris?: string[]): Promise<void>;
    preloadSymbols(): Promise<void>;
    preloadConfigurations(): Promise<void>;
}

/**
 * Import resolution cache entry
 */
export interface IImportResolutionCache {
    readonly documentUri: string;            // Document URI
    readonly imports: IImportCacheEntry[];   // Cached import entries
    readonly dependencies: string[];         // Document dependencies
    readonly lastModified: Date;             // Last modification time
    readonly checksum: string;               // Content checksum
    readonly version: number;                // Cache version
}

/**
 * Import cache entry
 */
export interface IImportCacheEntry {
    readonly importStatement: string;        // Import statement text
    readonly resolvedSymbols: string[];      // Resolved symbol IDs
    readonly errors: string[];               // Error messages
    readonly warnings: string[];             // Warning messages
    readonly resolutionTime: number;         // Resolution time in ms
}

/**
 * Configuration cache entry
 */
export interface IConfigurationCache {
    readonly configKey: string;              // Configuration key
    readonly value: number;                  // Configuration value
    readonly affectedSymbols: string[];      // Affected symbol IDs
    readonly sourceFile: string;             // Source configuration file
    readonly lastModified: Date;             // Last modification time
    readonly dependencies: string[];         // Configuration dependencies
}

/**
 * Dependency graph cache
 */
export interface IDependencyGraphCache {
    readonly version: number;                // Graph version
    readonly nodes: ICachedDependencyNode[]; // Cached nodes
    readonly edges: ICachedDependencyEdge[]; // Cached edges
    readonly lastBuilt: Date;                // Last build time
    readonly buildTime: number;              // Build time in ms
    readonly checksum: string;               // Graph checksum
}

/**
 * Cached dependency node
 */
export interface ICachedDependencyNode {
    readonly documentUri: string;            // Document URI
    readonly dependencies: string[];         // Dependencies
    readonly dependents: string[];           // Dependents
    readonly lastModified: Date;             // Last modification
    readonly symbolCount: number;            // Symbol count
}

/**
 * Cached dependency edge
 */
export interface ICachedDependencyEdge {
    readonly from: string;                   // Source document
    readonly to: string;                     // Target document
    readonly symbolCount: number;            // Imported symbol count
    readonly weight: number;                 // Edge weight
}

/**
 * Cache statistics
 */
export interface ICacheStats {
    readonly totalEntries: number;           // Total cache entries
    readonly hitRate: number;                // Cache hit rate (0-1)
    readonly missRate: number;               // Cache miss rate (0-1)
    readonly memoryUsage: number;            // Memory usage in bytes
    readonly diskUsage: number;              // Disk usage in bytes
    readonly lastCleanup: Date;              // Last cleanup time
    readonly cacheAge: number;               // Average cache age in ms
    readonly evictions: number;              // Number of evictions
}

/**
 * Detailed cache statistics
 */
export interface IDetailedCacheStats {
    readonly parsing: ICacheTypeStats;       // Parsing cache stats
    readonly validation: ICacheTypeStats;    // Validation cache stats
    readonly symbols: ICacheTypeStats;       // Symbol cache stats
    readonly completion: ICacheTypeStats;    // Completion cache stats
    readonly imports: ICacheTypeStats;       // Import cache stats
    readonly configuration: ICacheTypeStats; // Configuration cache stats
    readonly dependencies: ICacheTypeStats;  // Dependency cache stats
    readonly overall: ICacheStats;           // Overall stats
}

/**
 * Cache type statistics
 */
export interface ICacheTypeStats {
    readonly entries: number;                // Number of entries
    readonly hits: number;                   // Number of hits
    readonly misses: number;                 // Number of misses
    readonly hitRate: number;                // Hit rate (0-1)
    readonly memoryUsage: number;            // Memory usage in bytes
    readonly averageSize: number;            // Average entry size
    readonly maxSize: number;                // Maximum entry size
    readonly oldestEntry: Date;              // Oldest entry timestamp
    readonly newestEntry: Date;              // Newest entry timestamp
}

/**
 * Cache memory usage breakdown
 */
export interface ICacheMemoryUsage {
    readonly totalMemory: number;            // Total memory usage
    readonly parsing: number;                // Parsing cache memory
    readonly validation: number;             // Validation cache memory
    readonly symbols: number;                // Symbol cache memory
    readonly completion: number;             // Completion cache memory
    readonly imports: number;                // Import cache memory
    readonly configuration: number;          // Configuration cache memory
    readonly dependencies: number;           // Dependency cache memory
    readonly overhead: number;               // Cache overhead
    readonly available: number;              // Available memory
    readonly threshold: number;              // Memory threshold
}

/**
 * Cache settings configuration
 */
export interface ICacheSettings {
    readonly maxMemoryMB: number;            // Maximum memory usage
    readonly maxAge: number;                 // Maximum entry age in ms
    readonly enablePersistentCache: boolean; // Enable disk cache
    readonly cleanupInterval: number;        // Cleanup interval in ms
    readonly compressionEnabled: boolean;    // Enable compression
    readonly compressionLevel: number;       // Compression level (1-9)
    
    // Cache type specific settings
    readonly parsing: ICacheTypeSettings;    // Parsing cache settings
    readonly validation: ICacheTypeSettings; // Validation cache settings
    readonly symbols: ICacheTypeSettings;    // Symbol cache settings
    readonly completion: ICacheTypeSettings; // Completion cache settings
    readonly imports: ICacheTypeSettings;    // Import cache settings
    readonly configuration: ICacheTypeSettings; // Configuration cache settings
    readonly dependencies: ICacheTypeSettings; // Dependency cache settings
    
    // Performance settings
    readonly maxConcurrentOperations: number; // Max concurrent cache ops
    readonly batchSize: number;              // Batch size for operations
    readonly enablePreloading: boolean;      // Enable cache preloading
    readonly enableOptimization: boolean;    // Enable cache optimization
}

/**
 * Cache type specific settings
 */
export interface ICacheTypeSettings {
    readonly enabled: boolean;               // Whether cache type is enabled
    readonly maxEntries: number;             // Maximum number of entries
    readonly maxSize: number;                // Maximum size per entry
    readonly ttl: number;                    // Time to live in ms
    readonly priority: number;               // Cache priority (1-10)
    readonly evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'random'; // Eviction policy
}

/**
 * Cache hit event
 */
export interface ICacheHitEvent {
    readonly cacheType: string;              // Type of cache
    readonly key: string;                    // Cache key
    readonly size: number;                   // Entry size in bytes
    readonly age: number;                    // Entry age in ms
    readonly accessCount: number;            // Number of accesses
    readonly timestamp: Date;                // Hit timestamp
}

/**
 * Cache miss event
 */
export interface ICacheMissEvent {
    readonly cacheType: string;              // Type of cache
    readonly key: string;                    // Cache key
    readonly reason: 'not_found' | 'expired' | 'invalid' | 'evicted'; // Miss reason
    readonly cost: number;                   // Cost to recreate in ms
    readonly timestamp: Date;                // Miss timestamp
}

/**
 * Cache eviction event
 */
export interface ICacheEvictionEvent {
    readonly cacheType: string;              // Type of cache
    readonly key: string;                    // Evicted key
    readonly reason: 'memory_pressure' | 'expired' | 'manual' | 'invalid'; // Eviction reason
    readonly size: number;                   // Evicted entry size
    readonly age: number;                    // Entry age in ms
    readonly accessCount: number;            // Number of accesses
    readonly timestamp: Date;                // Eviction timestamp
}

/**
 * Cache entry metadata
 */
export interface ICacheEntryMetadata {
    readonly key: string;                    // Cache key
    readonly size: number;                   // Entry size in bytes
    readonly created: Date;                  // Creation timestamp
    lastAccessed: Date;                      // Last access timestamp (mutable)
    accessCount: number;                     // Number of accesses (mutable)
    readonly checksum: string;               // Entry checksum
    readonly dependencies: string[];         // Entry dependencies
    readonly tags: string[];                 // Entry tags
}

/**
 * Cache warming options
 */
export interface ICacheWarmupOptions {
    readonly includeValidation: boolean;     // Include validation cache
    readonly includeParsing: boolean;        // Include parsing cache
    readonly includeSymbols: boolean;        // Include symbol cache
    readonly includeCompletion: boolean;     // Include completion cache
    readonly includeImports: boolean;        // Include import cache
    readonly includeConfiguration: boolean;  // Include configuration cache
    readonly includeDependencies: boolean;   // Include dependency cache
    readonly maxConcurrency: number;         // Maximum concurrent operations
    readonly progressCallback?: (progress: number) => void; // Progress callback
}

/**
 * Cache compression options
 */
export interface ICacheCompressionOptions {
    readonly algorithm: 'gzip' | 'lz4' | 'brotli'; // Compression algorithm
    readonly level: number;                  // Compression level
    readonly threshold: number;              // Minimum size to compress
    readonly enableForTypes: string[];       // Cache types to compress
}

/**
 * Cache backup and restore
 */
export interface ICacheBackupRestore {
    backup(path: string): Promise<void>;
    restore(path: string): Promise<void>;
    export(path: string, options?: ICacheExportOptions): Promise<void>;
    import(path: string, options?: ICacheImportOptions): Promise<void>;
}

/**
 * Cache export options
 */
export interface ICacheExportOptions {
    readonly includeExpired: boolean;        // Include expired entries
    readonly compress: boolean;              // Compress export
    readonly format: 'json' | 'binary';     // Export format
    readonly filter?: (key: string) => boolean; // Entry filter
}

/**
 * Cache import options
 */
export interface ICacheImportOptions {
    readonly overwrite: boolean;             // Overwrite existing entries
    readonly validateChecksums: boolean;     // Validate entry checksums
    readonly skipInvalid: boolean;           // Skip invalid entries
    readonly merge: boolean;                 // Merge with existing cache
} 