// =============================================================================
// SYLANG CORE MANAGERS - CENTRAL EXPORT
// =============================================================================

// Export core managers
export { SymbolManager } from './SymbolManager';
export { ImportManager } from './ImportManager';
export { ConfigurationManager } from './ConfigurationManager';

// Core managers interface
export interface CoreManagers {
    symbolManager: ISymbolManager;
    importManager: IImportManager;
    configurationManager: IConfigurationManager;
}

import { 
    ISymbolManager, 
    IImportManager, 
    IConfigurationManager
} from '../interfaces';
import { SymbolManager } from './SymbolManager';
import { ImportManager } from './ImportManager';
import { ConfigurationManager } from './ConfigurationManager';

/**
 * Factory function to create and configure all core managers
 */
export function createCoreManagers(): CoreManagers {
    const symbolManager = new SymbolManager();
    const configurationManager = new ConfigurationManager();
    const importManager = new ImportManager(symbolManager);

    return {
        symbolManager,
        importManager,
        configurationManager
    };
} 