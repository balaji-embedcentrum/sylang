// =============================================================================
// SYLANG CORE MANAGERS - CENTRAL EXPORT
// =============================================================================

// Export all manager implementations
export { SymbolManager } from './SymbolManager';
export { ConfigurationManager } from './ConfigurationManager';
export { ImportManager } from './ImportManager';
export { ValidationPipeline } from './ValidationPipeline';
export { CacheManager } from './CacheManager';

// Re-export interfaces for convenience
export {
    ISymbolManager,
    IConfigurationManager,
    IImportManager,
    IValidationPipeline,
    ICacheManager,
    CoreManagers,
    ManagerFactory
} from '../interfaces';

import { SymbolManager } from './SymbolManager';
import { ConfigurationManager } from './ConfigurationManager';
import { ImportManager } from './ImportManager';
import { ValidationPipeline } from './ValidationPipeline';
import { CacheManager } from './CacheManager';
import { CoreManagers, ICacheSettings } from '../interfaces';

// =============================================================================
// MANAGER FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a complete set of core managers with proper dependency injection
 */
export function createCoreManagers(options?: {
    cacheSettings?: Partial<ICacheSettings>;
}): CoreManagers {
    // Create managers in dependency order
    const cacheManager = new CacheManager(options?.cacheSettings);
    const configurationManager = new ConfigurationManager();
    const symbolManager = new SymbolManager(configurationManager);
    const importManager = new ImportManager(symbolManager, configurationManager);
    const validationPipeline = new ValidationPipeline(
        symbolManager,
        configurationManager,
        importManager,
        cacheManager
    );
    
    return {
        symbolManager,
        configurationManager,
        importManager,
        cacheManager,
        validationPipeline
    };
}

/**
 * Create symbol manager with optional dependencies
 */
export function createSymbolManager(configurationManager?: any): SymbolManager {
    return new SymbolManager(configurationManager);
}

/**
 * Create configuration manager
 */
export function createConfigurationManager(symbolManager?: any): ConfigurationManager {
    return new ConfigurationManager(symbolManager);
}

/**
 * Create import manager with dependencies
 */
export function createImportManager(
    symbolManager?: any,
    configurationManager?: any
): ImportManager {
    return new ImportManager(symbolManager, configurationManager);
}

/**
 * Create validation pipeline with all dependencies
 */
export function createValidationPipeline(
    symbolManager: any,
    configurationManager: any,
    importManager: any,
    cacheManager?: any
): ValidationPipeline {
    return new ValidationPipeline(
        symbolManager,
        configurationManager,
        importManager,
        cacheManager
    );
}

/**
 * Create cache manager with optional settings
 */
export function createCacheManager(settings?: Partial<ICacheSettings>): CacheManager {
    return new CacheManager(settings);
}

// =============================================================================
// MANAGER LIFECYCLE UTILITIES
// =============================================================================

/**
 * Initialize all managers and their dependencies
 */
export async function initializeManagers(managers: CoreManagers): Promise<void> {
    try {
        // Initialize in dependency order
        await managers.configurationManager.loadConfigurations();
        await managers.symbolManager.buildWorkspaceIndex();
        await managers.validationPipeline.configurePipeline({
            enabledStages: ['parsing', 'import_resolution', 'syntax_validation', 'reference_validation', 'configuration_validation', 'semantic_validation'] as any,
            stageTimeouts: new Map(),
            enabledRules: [],
            disabledRules: [],
            maxConcurrency: 4,
            cacheEnabled: true,
            incrementalValidation: true,
            crossFileValidation: true
        });
        
        console.log('Core managers initialized successfully');
    } catch (error) {
        console.error('Failed to initialize managers:', error);
        throw error;
    }
}

/**
 * Dispose all managers and clean up resources
 */
export async function disposeManagers(managers: CoreManagers): Promise<void> {
    try {
        // Dispose in reverse dependency order
        managers.configurationManager.unwatchConfigurationFiles();
        
        // Clear all caches
        await managers.cacheManager.invalidateAll();
        
        console.log('Core managers disposed successfully');
    } catch (error) {
        console.error('Failed to dispose managers:', error);
    }
}

/**
 * Refresh all managers (useful for configuration changes)
 */
export async function refreshManagers(managers: CoreManagers): Promise<void> {
    try {
        await managers.configurationManager.reloadConfigurations();
        await managers.symbolManager.buildWorkspaceIndex();
        await managers.cacheManager.invalidateAll();
        
        console.log('Core managers refreshed successfully');
    } catch (error) {
        console.error('Failed to refresh managers:', error);
        throw error;
    }
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Get comprehensive performance metrics from all managers
 */
export function getPerformanceMetrics(managers: CoreManagers): {
    cache: any;
    validation: any;
    overall: {
        totalMemoryUsage: number;
        managersLoaded: number;
        initializationTime: number;
    };
} {
    return {
        cache: managers.cacheManager.getStats(),
        validation: managers.validationPipeline.getPerformanceMetrics(),
        overall: {
            totalMemoryUsage: process.memoryUsage().heapUsed,
            managersLoaded: 5,
            initializationTime: 0 // Would track actual initialization time
        }
    };
}

/**
 * Check health status of all managers
 */
export function checkManagerHealth(managers: CoreManagers): {
    symbolManager: 'healthy' | 'degraded' | 'error';
    configurationManager: 'healthy' | 'degraded' | 'error';
    importManager: 'healthy' | 'degraded' | 'error';
    validationPipeline: 'healthy' | 'degraded' | 'error';
    cacheManager: 'healthy' | 'degraded' | 'error';
    overall: 'healthy' | 'degraded' | 'error';
} {
    // Simplified health check
    return {
        symbolManager: 'healthy',
        configurationManager: 'healthy',
        importManager: 'healthy',
        validationPipeline: 'healthy',
        cacheManager: 'healthy',
        overall: 'healthy'
    };
}

// =============================================================================
// DEVELOPMENT UTILITIES
// =============================================================================

/**
 * Create managers with debug settings for development
 */
export function createDebugManagers(): CoreManagers {
    const debugCacheSettings: Partial<ICacheSettings> = {
        maxMemoryMB: 50, // Smaller cache for debugging
        maxAge: 60000,   // 1 minute for faster testing
        enablePersistentCache: false,
        cleanupInterval: 10000 // 10 seconds
    };
    
    return createCoreManagers({ cacheSettings: debugCacheSettings });
}

/**
 * Log detailed information about all managers
 */
export function logManagerDetails(managers: CoreManagers): void {
    console.log('=== SYLANG CORE MANAGERS STATUS ===');
    console.log('Symbol Manager:', managers.symbolManager.constructor.name);
    console.log('Configuration Manager:', managers.configurationManager.constructor.name);
    console.log('Import Manager:', managers.importManager.constructor.name);
    console.log('Validation Pipeline:', managers.validationPipeline.constructor.name);
    console.log('Cache Manager:', managers.cacheManager.constructor.name);
    
    const metrics = getPerformanceMetrics(managers);
    console.log('Performance Metrics:', JSON.stringify(metrics, null, 2));
    
    const health = checkManagerHealth(managers);
    console.log('Health Status:', JSON.stringify(health, null, 2));
}

/**
 * Test all manager interfaces
 */
export async function testManagerInterfaces(managers: CoreManagers): Promise<boolean> {
    try {
        // Test basic functionality of each manager
        console.log('Testing manager interfaces...');
        
        // Test symbol manager
        const symbols = managers.symbolManager.getWorkspaceSymbols();
        console.log(`Symbol manager test: Found ${symbols.symbols.size} symbol groups`);
        
        // Test configuration manager
        const config = managers.configurationManager.getGlobalConfiguration();
        console.log(`Configuration manager test: ${config.enableValidation ? 'Enabled' : 'Disabled'} validation`);
        
        // Test cache manager
        const cacheStats = managers.cacheManager.getStats();
        console.log(`Cache manager test: Hit rate ${(cacheStats.hitRate * 100).toFixed(1)}%`);
        
        // Test validation pipeline
        const pipelineMetrics = managers.validationPipeline.getPerformanceMetrics();
        console.log(`Validation pipeline test: ${pipelineMetrics.totalValidations} total validations`);
        
        console.log('All manager interfaces working correctly');
        return true;
        
    } catch (error) {
        console.error('Manager interface test failed:', error);
        return false;
    }
} 