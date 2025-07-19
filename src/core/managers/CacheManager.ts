import * as vscode from 'vscode';
import * as crypto from 'crypto';
import {
    ICacheManager,
    IParsingResult,
    ISymbolIndex,
    IValidationResult,
    IImportResolutionCache,
    IConfigurationCache,
    IDependencyGraphCache,
    ICacheStats,
    IDetailedCacheStats,
    ICacheMemoryUsage,
    ICacheSettings,
    ICacheTypeSettings,
    ICacheHitEvent,
    ICacheMissEvent,
    ICacheEvictionEvent,
    ICacheEntryMetadata,
    ICacheWarmupOptions
} from '../interfaces';

// =============================================================================
// CACHE MANAGER IMPLEMENTATION
// =============================================================================

/**
 * Comprehensive cache manager with intelligent caching strategies
 */
export class CacheManager implements ICacheManager {
    // Cache storage maps
    private readonly parsingCache = new Map<string, IParsingResult>();
    private readonly validationCache = new Map<string, IValidationResult>();
    private readonly symbolCache = new Map<string, ISymbolIndex>();
    private readonly completionCache = new Map<string, vscode.CompletionItem[]>();
    private readonly importCache = new Map<string, IImportResolutionCache>();
    private readonly configurationCache = new Map<string, IConfigurationCache>();
    private readonly dependencyCache = new Map<string, IDependencyGraphCache>();
    
    // Cache metadata
    private readonly entryMetadata = new Map<string, ICacheEntryMetadata>();
    private readonly accessTimes = new Map<string, Date>();
    private readonly accessCounts = new Map<string, number>();
    
    // Event emitters
    private readonly hitEventEmitter = new vscode.EventEmitter<ICacheHitEvent>();
    private readonly missEventEmitter = new vscode.EventEmitter<ICacheMissEvent>();
    private readonly evictionEventEmitter = new vscode.EventEmitter<ICacheEvictionEvent>();
    
    // Statistics
    private stats = {
        totalHits: 0,
        totalMisses: 0,
        totalEvictions: 0,
        memoryUsage: 0
    };
    
    private settings: ICacheSettings;
    private cleanupTimer?: NodeJS.Timer;

    constructor(settings?: Partial<ICacheSettings>) {
        this.settings = this.mergeWithDefaults(settings);
        this.startCleanupTimer();
    }

    // =============================================================================
    // DOCUMENT CACHING
    // =============================================================================

    async cacheParsingResult(documentUri: string, result: IParsingResult): Promise<void> {
        const key = this.generateCacheKey('parsing', documentUri);
        
        if (this.shouldCache('parsing', result)) {
            this.parsingCache.set(key, result);
            this.trackCacheEntry(key, 'parsing', this.calculateSize(result));
        }
    }

    async getCachedParsingResult(documentUri: string): Promise<IParsingResult | undefined> {
        const key = this.generateCacheKey('parsing', documentUri);
        const result = this.parsingCache.get(key);
        
        if (result && this.isCacheEntryValid(key)) {
            this.recordCacheHit('parsing', key);
            return result;
        } else {
            this.recordCacheMiss('parsing', key, result ? 'expired' : 'not_found');
            if (result) {
                this.parsingCache.delete(key);
                this.cleanupCacheEntry(key);
            }
            return undefined;
        }
    }

    async removeCachedParsingResult(documentUri: string): Promise<void> {
        const key = this.generateCacheKey('parsing', documentUri);
        if (this.parsingCache.delete(key)) {
            this.cleanupCacheEntry(key);
        }
    }

    // =============================================================================
    // VALIDATION CACHING
    // =============================================================================

    async cacheValidationResult(documentUri: string, result: IValidationResult): Promise<void> {
        const key = this.generateCacheKey('validation', documentUri);
        
        if (this.shouldCache('validation', result)) {
            this.validationCache.set(key, result);
            this.trackCacheEntry(key, 'validation', this.calculateSize(result));
        }
    }

    async getCachedValidationResult(documentUri: string): Promise<IValidationResult | undefined> {
        const key = this.generateCacheKey('validation', documentUri);
        const result = this.validationCache.get(key);
        
        if (result && this.isCacheEntryValid(key)) {
            this.recordCacheHit('validation', key);
            return result;
        } else {
            this.recordCacheMiss('validation', key, result ? 'expired' : 'not_found');
            if (result) {
                this.validationCache.delete(key);
                this.cleanupCacheEntry(key);
            }
            return undefined;
        }
    }

    async removeCachedValidationResult(documentUri: string): Promise<void> {
        const key = this.generateCacheKey('validation', documentUri);
        if (this.validationCache.delete(key)) {
            this.cleanupCacheEntry(key);
        }
    }

    // =============================================================================
    // SYMBOL CACHING
    // =============================================================================

    async cacheSymbolIndex(index: ISymbolIndex): Promise<void> {
        const key = this.generateCacheKey('symbols', 'workspace');
        
        if (this.shouldCache('symbols', index)) {
            this.symbolCache.set(key, index);
            this.trackCacheEntry(key, 'symbols', this.calculateSize(index));
        }
    }

    async getCachedSymbolIndex(): Promise<ISymbolIndex | undefined> {
        const key = this.generateCacheKey('symbols', 'workspace');
        const result = this.symbolCache.get(key);
        
        if (result && this.isCacheEntryValid(key)) {
            this.recordCacheHit('symbols', key);
            return result;
        } else {
            this.recordCacheMiss('symbols', key, result ? 'expired' : 'not_found');
            if (result) {
                this.symbolCache.delete(key);
                this.cleanupCacheEntry(key);
            }
            return undefined;
        }
    }

    async removeCachedSymbolIndex(): Promise<void> {
        const key = this.generateCacheKey('symbols', 'workspace');
        if (this.symbolCache.delete(key)) {
            this.cleanupCacheEntry(key);
        }
    }

    // =============================================================================
    // COMPLETION CACHING
    // =============================================================================

    async cacheCompletionItems(documentUri: string, position: vscode.Position, items: vscode.CompletionItem[]): Promise<void> {
        const key = this.generateCacheKey('completion', `${documentUri}:${position.line}:${position.character}`);
        
        if (this.shouldCache('completion', items)) {
            this.completionCache.set(key, items);
            this.trackCacheEntry(key, 'completion', this.calculateSize(items));
        }
    }

    async getCachedCompletionItems(documentUri: string, position: vscode.Position): Promise<vscode.CompletionItem[] | undefined> {
        const key = this.generateCacheKey('completion', `${documentUri}:${position.line}:${position.character}`);
        const result = this.completionCache.get(key);
        
        if (result && this.isCacheEntryValid(key)) {
            this.recordCacheHit('completion', key);
            return result;
        } else {
            this.recordCacheMiss('completion', key, result ? 'expired' : 'not_found');
            if (result) {
                this.completionCache.delete(key);
                this.cleanupCacheEntry(key);
            }
            return undefined;
        }
    }

    async removeCachedCompletionItems(documentUri: string): Promise<void> {
        // Remove all completion cache entries for the document
        const keysToRemove: string[] = [];
        for (const key of this.completionCache.keys()) {
            if (key.includes(documentUri)) {
                keysToRemove.push(key);
            }
        }
        
        for (const key of keysToRemove) {
            this.completionCache.delete(key);
            this.cleanupCacheEntry(key);
        }
    }

    // =============================================================================
    // IMPORT RESOLUTION CACHING
    // =============================================================================

    async cacheImportResolution(documentUri: string, resolution: IImportResolutionCache): Promise<void> {
        const key = this.generateCacheKey('imports', documentUri);
        
        if (this.shouldCache('imports', resolution)) {
            this.importCache.set(key, resolution);
            this.trackCacheEntry(key, 'imports', this.calculateSize(resolution));
        }
    }

    async getCachedImportResolution(documentUri: string): Promise<IImportResolutionCache | undefined> {
        const key = this.generateCacheKey('imports', documentUri);
        const result = this.importCache.get(key);
        
        if (result && this.isCacheEntryValid(key)) {
            this.recordCacheHit('imports', key);
            return result;
        } else {
            this.recordCacheMiss('imports', key, result ? 'expired' : 'not_found');
            if (result) {
                this.importCache.delete(key);
                this.cleanupCacheEntry(key);
            }
            return undefined;
        }
    }

    async removeCachedImportResolution(documentUri: string): Promise<void> {
        const key = this.generateCacheKey('imports', documentUri);
        if (this.importCache.delete(key)) {
            this.cleanupCacheEntry(key);
        }
    }

    // =============================================================================
    // CONFIGURATION CACHING
    // =============================================================================

    async cacheConfiguration(configKey: string, value: IConfigurationCache): Promise<void> {
        const key = this.generateCacheKey('configuration', configKey);
        
        if (this.shouldCache('configuration', value)) {
            this.configurationCache.set(key, value);
            this.trackCacheEntry(key, 'configuration', this.calculateSize(value));
        }
    }

    async getCachedConfiguration(configKey: string): Promise<IConfigurationCache | undefined> {
        const key = this.generateCacheKey('configuration', configKey);
        const result = this.configurationCache.get(key);
        
        if (result && this.isCacheEntryValid(key)) {
            this.recordCacheHit('configuration', key);
            return result;
        } else {
            this.recordCacheMiss('configuration', key, result ? 'expired' : 'not_found');
            if (result) {
                this.configurationCache.delete(key);
                this.cleanupCacheEntry(key);
            }
            return undefined;
        }
    }

    async removeCachedConfiguration(configKey: string): Promise<void> {
        const key = this.generateCacheKey('configuration', configKey);
        if (this.configurationCache.delete(key)) {
            this.cleanupCacheEntry(key);
        }
    }

    // =============================================================================
    // DEPENDENCY CACHING
    // =============================================================================

    async cacheDependencyGraph(graph: IDependencyGraphCache): Promise<void> {
        const key = this.generateCacheKey('dependencies', 'workspace');
        
        if (this.shouldCache('dependencies', graph)) {
            this.dependencyCache.set(key, graph);
            this.trackCacheEntry(key, 'dependencies', this.calculateSize(graph));
        }
    }

    async getCachedDependencyGraph(): Promise<IDependencyGraphCache | undefined> {
        const key = this.generateCacheKey('dependencies', 'workspace');
        const result = this.dependencyCache.get(key);
        
        if (result && this.isCacheEntryValid(key)) {
            this.recordCacheHit('dependencies', key);
            return result;
        } else {
            this.recordCacheMiss('dependencies', key, result ? 'expired' : 'not_found');
            if (result) {
                this.dependencyCache.delete(key);
                this.cleanupCacheEntry(key);
            }
            return undefined;
        }
    }

    async removeCachedDependencyGraph(): Promise<void> {
        const key = this.generateCacheKey('dependencies', 'workspace');
        if (this.dependencyCache.delete(key)) {
            this.cleanupCacheEntry(key);
        }
    }

    // =============================================================================
    // CACHE MANAGEMENT
    // =============================================================================

    async invalidateDocument(documentUri: string): Promise<void> {
        // Invalidate all cache entries related to this document
        await Promise.all([
            this.removeCachedParsingResult(documentUri),
            this.removeCachedValidationResult(documentUri),
            this.removeCachedCompletionItems(documentUri),
            this.removeCachedImportResolution(documentUri)
        ]);
    }

    async invalidateWorkspace(): Promise<void> {
        // Invalidate workspace-level caches
        await Promise.all([
            this.removeCachedSymbolIndex(),
            this.removeCachedDependencyGraph()
        ]);
    }

    async invalidateAll(): Promise<void> {
        // Clear all caches
        this.parsingCache.clear();
        this.validationCache.clear();
        this.symbolCache.clear();
        this.completionCache.clear();
        this.importCache.clear();
        this.configurationCache.clear();
        this.dependencyCache.clear();
        
        this.entryMetadata.clear();
        this.accessTimes.clear();
        this.accessCounts.clear();
        
        this.stats = {
            totalHits: 0,
            totalMisses: 0,
            totalEvictions: 0,
            memoryUsage: 0
        };
    }

    // =============================================================================
    // CACHE STATISTICS AND MONITORING
    // =============================================================================

    getStats(): ICacheStats {
        const totalOperations = this.stats.totalHits + this.stats.totalMisses;
        
        return {
            totalEntries: this.getTotalEntryCount(),
            hitRate: totalOperations > 0 ? this.stats.totalHits / totalOperations : 0,
            missRate: totalOperations > 0 ? this.stats.totalMisses / totalOperations : 0,
            memoryUsage: this.calculateTotalMemoryUsage(),
            diskUsage: 0, // Would be implemented for persistent cache
            lastCleanup: new Date(),
            cacheAge: this.calculateAverageCacheAge(),
            evictions: this.stats.totalEvictions
        };
    }

    getDetailedStats(): IDetailedCacheStats {
        return {
            parsing: this.getCacheTypeStats('parsing'),
            validation: this.getCacheTypeStats('validation'),
            symbols: this.getCacheTypeStats('symbols'),
            completion: this.getCacheTypeStats('completion'),
            imports: this.getCacheTypeStats('imports'),
            configuration: this.getCacheTypeStats('configuration'),
            dependencies: this.getCacheTypeStats('dependencies'),
            overall: this.getStats()
        };
    }

    getMemoryUsage(): ICacheMemoryUsage {
        return {
            totalMemory: this.calculateTotalMemoryUsage(),
            parsing: this.calculateCacheMemoryUsage('parsing'),
            validation: this.calculateCacheMemoryUsage('validation'),
            symbols: this.calculateCacheMemoryUsage('symbols'),
            completion: this.calculateCacheMemoryUsage('completion'),
            imports: this.calculateCacheMemoryUsage('imports'),
            configuration: this.calculateCacheMemoryUsage('configuration'),
            dependencies: this.calculateCacheMemoryUsage('dependencies'),
            overhead: this.calculateOverheadMemory(),
            available: this.settings.maxMemoryMB * 1024 * 1024 - this.calculateTotalMemoryUsage(),
            threshold: this.settings.maxMemoryMB * 1024 * 1024 * 0.8 // 80% threshold
        };
    }

    // =============================================================================
    // CACHE OPTIMIZATION
    // =============================================================================

    async optimizeCache(): Promise<void> {
        // Remove expired entries
        await this.cleanupExpiredEntries();
        
        // Evict least recently used entries if memory pressure
        const memoryUsage = this.getMemoryUsage();
        if (memoryUsage.totalMemory > memoryUsage.threshold) {
            await this.evictLeastRecentlyUsed();
        }
        
        // Compact frequently accessed entries
        await this.compactFrequentlyAccessed();
    }

    async compactCache(): Promise<void> {
        // Compact cache by removing fragmentation
        // Handle each cache type separately to avoid TypeScript type conflicts
        
        // Compact parsing cache
        const parsingEntries = Array.from(this.parsingCache.entries());
        this.parsingCache.clear();
        for (const [key, value] of parsingEntries) {
            this.parsingCache.set(key, value);
        }
        
        // Compact validation cache
        const validationEntries = Array.from(this.validationCache.entries());
        this.validationCache.clear();
        for (const [key, value] of validationEntries) {
            this.validationCache.set(key, value);
        }
        
        // Compact symbol cache
        const symbolEntries = Array.from(this.symbolCache.entries());
        this.symbolCache.clear();
        for (const [key, value] of symbolEntries) {
            this.symbolCache.set(key, value);
        }
        
        // Compact completion cache
        const completionEntries = Array.from(this.completionCache.entries());
        this.completionCache.clear();
        for (const [key, value] of completionEntries) {
            this.completionCache.set(key, value);
        }
        
        // Compact import cache
        const importEntries = Array.from(this.importCache.entries());
        this.importCache.clear();
        for (const [key, value] of importEntries) {
            this.importCache.set(key, value);
        }
        
        // Compact configuration cache
        const configEntries = Array.from(this.configurationCache.entries());
        this.configurationCache.clear();
        for (const [key, value] of configEntries) {
            this.configurationCache.set(key, value);
        }
        
        // Compact dependency cache
        const dependencyEntries = Array.from(this.dependencyCache.entries());
        this.dependencyCache.clear();
        for (const [key, value] of dependencyEntries) {
            this.dependencyCache.set(key, value);
        }
    }

    async cleanupExpiredEntries(): Promise<void> {
        const now = Date.now();
        const expiredKeys: string[] = [];
        
        for (const [key, metadata] of this.entryMetadata.entries()) {
            const age = now - metadata.created.getTime();
            if (age > this.settings.maxAge) {
                expiredKeys.push(key);
            }
        }
        
        for (const key of expiredKeys) {
            await this.evictCacheEntry(key, 'expired');
        }
    }

    // =============================================================================
    // CACHE PERSISTENCE
    // =============================================================================

    async saveToDisk(): Promise<void> {
        // Simplified implementation - would persist to disk in real version
        console.log('Cache would be saved to disk');
    }

    async loadFromDisk(): Promise<void> {
        // Simplified implementation - would load from disk in real version
        console.log('Cache would be loaded from disk');
    }

    async clearDiskCache(): Promise<void> {
        // Simplified implementation - would clear disk cache in real version
        console.log('Disk cache would be cleared');
    }

    // =============================================================================
    // CACHE CONFIGURATION
    // =============================================================================

    async updateCacheSettings(settings: ICacheSettings): Promise<void> {
        this.settings = settings;
        
        // Restart cleanup timer with new interval
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.startCleanupTimer();
        
        // Optimize cache with new settings
        await this.optimizeCache();
    }

    getCacheSettings(): ICacheSettings {
        return { ...this.settings };
    }

    // =============================================================================
    // EVENT HANDLING
    // =============================================================================

    onCacheHit(listener: (event: ICacheHitEvent) => void): vscode.Disposable {
        return this.hitEventEmitter.event(listener);
    }

    onCacheMiss(listener: (event: ICacheMissEvent) => void): vscode.Disposable {
        return this.missEventEmitter.event(listener);
    }

    onCacheEviction(listener: (event: ICacheEvictionEvent) => void): vscode.Disposable {
        return this.evictionEventEmitter.event(listener);
    }

    // =============================================================================
    // CACHE WARMING
    // =============================================================================

    async warmupCache(documentUris?: string[]): Promise<void> {
        // Simplified cache warming implementation
        console.log(`Warming up cache for ${documentUris?.length || 'all'} documents`);
    }

    async preloadSymbols(): Promise<void> {
        // Simplified symbol preloading
        console.log('Preloading symbols into cache');
    }

    async preloadConfigurations(): Promise<void> {
        // Simplified configuration preloading
        console.log('Preloading configurations into cache');
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private generateCacheKey(cacheType: string, identifier: string): string {
        return `${cacheType}:${crypto.createHash('md5').update(identifier).digest('hex')}`;
    }

    private shouldCache(cacheType: string, data: any): boolean {
        const typeSettings = this.getCacheTypeSettings(cacheType);
        
        if (!typeSettings.enabled) {
            return false;
        }
        
        const size = this.calculateSize(data);
        if (size > typeSettings.maxSize) {
            return false;
        }
        
        const cache = this.getCacheForType(cacheType);
        if (cache.size >= typeSettings.maxEntries) {
            // Need to evict before caching
            this.evictLeastRecentlyUsedFromCache(cacheType);
        }
        
        return true;
    }

    private isCacheEntryValid(key: string): boolean {
        const metadata = this.entryMetadata.get(key);
        if (!metadata) {
            return false;
        }
        
        const age = Date.now() - metadata.created.getTime();
        return age <= this.settings.maxAge;
    }

    private trackCacheEntry(key: string, cacheType: string, size: number): void {
        const metadata: ICacheEntryMetadata = {
            key,
            size,
            created: new Date(),
            lastAccessed: new Date(),
            accessCount: 0,
            checksum: this.generateChecksum(key),
            dependencies: [],
            tags: [cacheType]
        };
        
        this.entryMetadata.set(key, metadata);
        this.accessTimes.set(key, new Date());
        this.accessCounts.set(key, 0);
    }

    private cleanupCacheEntry(key: string): void {
        this.entryMetadata.delete(key);
        this.accessTimes.delete(key);
        this.accessCounts.delete(key);
    }

    private recordCacheHit(cacheType: string, key: string): void {
        this.stats.totalHits++;
        
        // Update access tracking
        this.accessTimes.set(key, new Date());
        const count = this.accessCounts.get(key) || 0;
        this.accessCounts.set(key, count + 1);
        
        // Update metadata
        const metadata = this.entryMetadata.get(key);
        if (metadata) {
            metadata.lastAccessed = new Date();
            metadata.accessCount++;
        }
        
        // Emit hit event
        this.hitEventEmitter.fire({
            cacheType,
            key,
            size: metadata?.size || 0,
            age: metadata ? Date.now() - metadata.created.getTime() : 0,
            accessCount: metadata?.accessCount || 0,
            timestamp: new Date()
        });
    }

    private recordCacheMiss(cacheType: string, key: string, reason: 'not_found' | 'expired' | 'invalid' | 'evicted'): void {
        this.stats.totalMisses++;
        
        // Emit miss event
        this.missEventEmitter.fire({
            cacheType,
            key,
            reason,
            cost: 0, // Would calculate cost to recreate
            timestamp: new Date()
        });
    }

    private async evictCacheEntry(key: string, reason: 'memory_pressure' | 'expired' | 'manual' | 'invalid'): Promise<void> {
        const metadata = this.entryMetadata.get(key);
        
        // Remove from appropriate cache
        this.removeFromAllCaches(key);
        this.cleanupCacheEntry(key);
        
        this.stats.totalEvictions++;
        
        // Emit eviction event
        this.evictionEventEmitter.fire({
            cacheType: metadata?.tags[0] || 'unknown',
            key,
            reason,
            size: metadata?.size || 0,
            age: metadata ? Date.now() - metadata.created.getTime() : 0,
            accessCount: metadata?.accessCount || 0,
            timestamp: new Date()
        });
    }

    private removeFromAllCaches(key: string): void {
        this.parsingCache.delete(key);
        this.validationCache.delete(key);
        this.symbolCache.delete(key);
        this.completionCache.delete(key);
        this.importCache.delete(key);
        this.configurationCache.delete(key);
        this.dependencyCache.delete(key);
    }

    private async evictLeastRecentlyUsed(): Promise<void> {
        const entries = Array.from(this.entryMetadata.entries());
        entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());
        
        // Evict oldest 20% of entries
        const evictCount = Math.floor(entries.length * 0.2);
        for (let i = 0; i < evictCount; i++) {
            await this.evictCacheEntry(entries[i][0], 'memory_pressure');
        }
    }

    private evictLeastRecentlyUsedFromCache(cacheType: string): void {
        const cache = this.getCacheForType(cacheType);
        const keys = Array.from(cache.keys());
        
        if (keys.length > 0) {
            // Find least recently used key
            let oldestKey = keys[0];
            let oldestTime = this.accessTimes.get(oldestKey) || new Date(0);
            
            for (const key of keys) {
                const accessTime = this.accessTimes.get(key) || new Date(0);
                if (accessTime < oldestTime) {
                    oldestKey = key;
                    oldestTime = accessTime;
                }
            }
            
            this.evictCacheEntry(oldestKey, 'memory_pressure');
        }
    }

    private async compactFrequentlyAccessed(): Promise<void> {
        // Move frequently accessed items to front (implementation specific)
        console.log('Compacting frequently accessed cache entries');
    }

    private getCacheForType(cacheType: string): Map<string, any> {
        switch (cacheType) {
            case 'parsing': return this.parsingCache;
            case 'validation': return this.validationCache;
            case 'symbols': return this.symbolCache;
            case 'completion': return this.completionCache;
            case 'imports': return this.importCache;
            case 'configuration': return this.configurationCache;
            case 'dependencies': return this.dependencyCache;
            default: return new Map();
        }
    }

    private getCacheTypeSettings(cacheType: string): ICacheTypeSettings {
        const typeSettings = this.settings[cacheType as keyof ICacheSettings];
        
        // Return type-specific settings if they exist and are ICacheTypeSettings
        if (typeSettings && typeof typeSettings === 'object' && 'enabled' in typeSettings) {
            return typeSettings as ICacheTypeSettings;
        }
        
        // Return default settings
        return {
            enabled: true,
            maxEntries: 1000,
            maxSize: 1024 * 1024, // 1MB
            ttl: 300000, // 5 minutes
            priority: 5,
            evictionPolicy: 'lru'
        };
    }

    private getCacheTypeStats(cacheType: string): any {
        const cache = this.getCacheForType(cacheType);
        const entries = Array.from(this.entryMetadata.values()).filter(m => m.tags.includes(cacheType));
        
        const hits = entries.reduce((sum, e) => sum + e.accessCount, 0);
        const totalAccesses = hits + entries.length; // Simplified
        
        return {
            entries: cache.size,
            hits,
            misses: entries.length,
            hitRate: totalAccesses > 0 ? hits / totalAccesses : 0,
            memoryUsage: entries.reduce((sum, e) => sum + e.size, 0),
            averageSize: entries.length > 0 ? entries.reduce((sum, e) => sum + e.size, 0) / entries.length : 0,
            maxSize: Math.max(...entries.map(e => e.size), 0),
            oldestEntry: entries.length > 0 ? new Date(Math.min(...entries.map(e => e.created.getTime()))) : new Date(),
            newestEntry: entries.length > 0 ? new Date(Math.max(...entries.map(e => e.created.getTime()))) : new Date()
        };
    }

    private calculateSize(data: any): number {
        // Simplified size calculation
        return JSON.stringify(data).length * 2; // Rough estimate
    }

    private calculateTotalMemoryUsage(): number {
        return Array.from(this.entryMetadata.values()).reduce((sum, metadata) => sum + metadata.size, 0);
    }

    private calculateCacheMemoryUsage(cacheType: string): number {
        const entries = Array.from(this.entryMetadata.values()).filter(m => m.tags.includes(cacheType));
        return entries.reduce((sum, e) => sum + e.size, 0);
    }

    private calculateOverheadMemory(): number {
        // Estimate overhead from metadata
        return this.entryMetadata.size * 200; // Rough estimate
    }

    private getTotalEntryCount(): number {
        return this.parsingCache.size + this.validationCache.size + this.symbolCache.size +
               this.completionCache.size + this.importCache.size + this.configurationCache.size +
               this.dependencyCache.size;
    }

    private calculateAverageCacheAge(): number {
        const entries = Array.from(this.entryMetadata.values());
        if (entries.length === 0) return 0;
        
        const now = Date.now();
        const totalAge = entries.reduce((sum, e) => sum + (now - e.created.getTime()), 0);
        return totalAge / entries.length;
    }

    private generateChecksum(data: string): string {
        return crypto.createHash('md5').update(data).digest('hex');
    }

    private mergeWithDefaults(settings?: Partial<ICacheSettings>): ICacheSettings {
        const defaults: ICacheSettings = {
            maxMemoryMB: 100,
            maxAge: 300000, // 5 minutes
            enablePersistentCache: false,
            cleanupInterval: 60000, // 1 minute
            parsing: {
                enabled: true,
                maxEntries: 500,
                maxSize: 1024 * 1024,
                ttl: 600000, // 10 minutes
                priority: 8,
                evictionPolicy: 'lru'
            },
            validation: {
                enabled: true,
                maxEntries: 1000,
                maxSize: 512 * 1024,
                ttl: 300000, // 5 minutes
                priority: 9,
                evictionPolicy: 'lru'
            },
            symbols: {
                enabled: true,
                maxEntries: 10,
                maxSize: 5 * 1024 * 1024,
                ttl: 1800000, // 30 minutes
                priority: 10,
                evictionPolicy: 'lru'
            },
            completion: {
                enabled: true,
                maxEntries: 2000,
                maxSize: 256 * 1024,
                ttl: 60000, // 1 minute
                priority: 6,
                evictionPolicy: 'lru'
            },
            imports: {
                enabled: true,
                maxEntries: 500,
                maxSize: 512 * 1024,
                ttl: 600000, // 10 minutes
                priority: 7,
                evictionPolicy: 'lru'
            },
            configuration: {
                enabled: true,
                maxEntries: 100,
                maxSize: 64 * 1024,
                ttl: 1800000, // 30 minutes
                priority: 9,
                evictionPolicy: 'lru'
            },
            dependencies: {
                enabled: true,
                maxEntries: 10,
                maxSize: 2 * 1024 * 1024,
                ttl: 900000, // 15 minutes
                priority: 8,
                evictionPolicy: 'lru'
            },
            maxConcurrentOperations: 10,
            batchSize: 50,
            enablePreloading: true,
            enableOptimization: true,
            compressionEnabled: false,
            compressionLevel: 6
        };
        
        return { ...defaults, ...settings };
    }

    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(async () => {
            await this.cleanupExpiredEntries();
        }, this.settings.cleanupInterval);
    }
} 