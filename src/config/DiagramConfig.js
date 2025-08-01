export class DiagramConfig {
    constructor() {
        this.config = new Map();
        this.configValidators = new Map();
        this.setupDefaultConfig();
    }

    /**
     * Setup default configuration
     */
    setupDefaultConfig() {
        // Diagram defaults
        this.setConfig('diagram', {
            defaultNodeTypes: ['component', 'container', 'diamond', 'circle', 'hexagon', 'triangle'],
            defaultLayout: 'default',
            autoLayout: true,
            technicalDetails: true,
            theme: 'light',
            grid: {
                enabled: false,
                size: 20,
                snapToGrid: false
            },
            zoom: {
                min: 0.2,
                max: 2,
                default: 1
            },
            pan: {
                enabled: true,
                mode: 'free'
            }
        });

        // Node defaults
        this.setConfig('nodes', {
            defaultSize: { width: 150, height: 80 },
            minSize: { width: 50, height: 30 },
            maxSize: { width: 1000, height: 1000 },
            defaultColors: {
                component: '#E3F2FD',
                container: '#F3E5F5',
                diamond: '#FFF3E0',
                circle: '#E8F5E8',
                hexagon: '#FCE4EC',
                triangle: '#E0F2F1'
            },
            defaultBorderColors: {
                component: '#2196F3',
                container: '#9C27B0',
                diamond: '#FF9800',
                circle: '#4CAF50',
                hexagon: '#E91E63',
                triangle: '#009688'
            },
            resizable: true,
            draggable: true,
            selectable: true
        });

        // Edge defaults
        this.setConfig('edges', {
            defaultType: 'adjustable',
            defaultStrokeWidth: 2,
            defaultStrokeColor: '#000000',
            defaultAnimated: false,
            defaultMarkers: {
                start: null,
                end: 'arrow'
            },
            styles: {
                solid: { strokeDasharray: null },
                dashed: { strokeDasharray: '5,5' },
                dotted: { strokeDasharray: '2,2' }
            }
        });

        // Export defaults
        this.setConfig('export', {
            defaultFormat: 'json',
            supportedFormats: ['json', 'png', 'jpg', 'svg', 'drawio'],
            imageDefaults: {
                width: 1920,
                height: 1080,
                backgroundColor: '#ffffff',
                quality: 0.9
            },
            includeMetadata: true,
            includeTechnicalDetails: true
        });

        // Technical details defaults
        this.setConfig('technicalDetails', {
            enabled: true,
            autoExtract: true,
            categories: ['protocol', 'performance', 'security', 'scaling', 'infrastructure', 'monitoring'],
            displayMode: 'badges',
            colorScheme: {
                protocol: '#2196F3',
                performance: '#FF9800',
                security: '#4CAF50',
                scaling: '#9C27B0',
                infrastructure: '#00BCD4',
                monitoring: '#E91E63'
            }
        });

        // Layout defaults
        this.setConfig('layout', {
            algorithms: ['default', 'hierarchical', 'circular', 'grid'],
            defaultAlgorithm: 'default',
            spacing: {
                nodeToNode: 50,
                containerPadding: 30,
                levelSpacing: 100
            },
            constraints: {
                respectHierarchy: true,
                avoidOverlap: true,
                maintainAspectRatio: false
            }
        });

        // Validation defaults
        this.setConfig('validation', {
            enabled: true,
            strictMode: false,
            validateOnChange: true,
            customRules: []
        });

        // Performance defaults
        this.setConfig('performance', {
            maxNodes: 1000,
            maxEdges: 2000,
            renderThreshold: 100,
            enableVirtualization: false,
            debounceDelay: 300
        });
    }

    /**
     * Set a configuration value
     * @param {string} key - Configuration key
     * @param {Object} value - Configuration value
     */
    setConfig(key, value) {
        // Validate configuration if validator exists
        const validator = this.configValidators.get(key);
        if (validator) {
            const validation = validator(value);
            if (!validation.isValid) {
                throw new Error(`Invalid configuration for ${key}: ${validation.errorMessage}`);
            }
        }

        this.config.set(key, {
            value,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Get a configuration value
     * @param {string} key - Configuration key
     * @param {Object} defaultValue - Default value if not found
     * @returns {Object} Configuration value
     */
    getConfig(key, defaultValue = null) {
        const config = this.config.get(key);
        return config ? config.value : defaultValue;
    }

    /**
     * Get all configuration
     * @returns {Object} All configuration values
     */
    getAllConfig() {
        const allConfig = {};
        this.config.forEach((config, key) => {
            allConfig[key] = config.value;
        });
        return allConfig;
    }

    /**
     * Register a validator for a configuration key
     * @param {string} key - Configuration key
     * @param {Function} validator - Validation function
     */
    registerConfigValidator(key, validator) {
        this.configValidators.set(key, validator);
    }

    /**
     * Update configuration with new values
     * @param {Object} updates - Configuration updates
     */
    updateConfig(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.setConfig(key, value);
        });
    }

    /**
     * Merge configuration with existing values
     * @param {string} key - Configuration key
     * @param {Object} updates - Updates to merge
     */
    mergeConfig(key, updates) {
        const existing = this.getConfig(key, {});
        const merged = { ...existing, ...updates };
        this.setConfig(key, merged);
    }

    /**
     * Reset configuration to defaults
     */
    resetConfig() {
        this.config.clear();
        this.setupDefaultConfig();
    }

    /**
     * Export configuration to JSON
     * @returns {string} JSON string
     */
    exportConfig() {
        return JSON.stringify(this.getAllConfig(), null, 2);
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonString - JSON configuration string
     */
    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            this.updateConfig(config);
        } catch (error) {
            throw new Error(`Failed to import configuration: ${error.message}`);
        }
    }

    /**
     * Get configuration metadata
     * @returns {Object} Configuration metadata
     */
    getConfigMetadata() {
        const metadata = {};
        this.config.forEach((config, key) => {
            metadata[key] = {
                updatedAt: config.updatedAt,
                hasValidator: this.configValidators.has(key)
            };
        });
        return metadata;
    }

    /**
     * Validate a specific configuration
     * @param {string} key - Configuration key
     * @param {Object} value - Value to validate
     * @returns {Object} Validation result
     */
    validateConfig(key, value) {
        const validator = this.configValidators.get(key);
        if (!validator) {
            return { isValid: true };
        }
        return validator(value);
    }

    /**
     * Get configuration statistics
     * @returns {Object} Configuration statistics
     */
    getConfigStats() {
        return {
            totalKeys: this.config.size,
            keysWithValidators: Array.from(this.configValidators.keys()).length,
            lastUpdated: this.getLastUpdated(),
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Get the last updated timestamp
     * @returns {string|null} Last updated timestamp
     */
    getLastUpdated() {
        let lastUpdated = null;
        this.config.forEach((config) => {
            if (!lastUpdated || config.updatedAt > lastUpdated) {
                lastUpdated = config.updatedAt;
            }
        });
        return lastUpdated;
    }

    /**
     * Estimate memory usage of configuration
     * @returns {number} Estimated memory usage in bytes
     */
    estimateMemoryUsage() {
        const configString = JSON.stringify(this.getAllConfig());
        return new Blob([configString]).size;
    }

    /**
     * Create a configuration snapshot
     * @returns {Object} Configuration snapshot
     */
    createSnapshot() {
        return {
            timestamp: new Date().toISOString(),
            config: this.getAllConfig(),
            metadata: this.getConfigMetadata()
        };
    }

    /**
     * Restore configuration from snapshot
     * @param {Object} snapshot - Configuration snapshot
     */
    restoreFromSnapshot(snapshot) {
        if (!snapshot.config) {
            throw new Error('Invalid snapshot: missing config');
        }
        this.updateConfig(snapshot.config);
    }

    /**
     * Get configuration for a specific feature
     * @param {string} feature - Feature name
     * @returns {Object} Feature-specific configuration
     */
    getFeatureConfig(feature) {
        const featureConfigs = {
            diagram: this.getConfig('diagram'),
            nodes: this.getConfig('nodes'),
            edges: this.getConfig('edges'),
            export: this.getConfig('export'),
            technicalDetails: this.getConfig('technicalDetails'),
            layout: this.getConfig('layout'),
            validation: this.getConfig('validation'),
            performance: this.getConfig('performance')
        };

        return featureConfigs[feature] || {};
    }

    /**
     * Check if a feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} True if feature is enabled
     */
    isFeatureEnabled(feature) {
        const featureConfig = this.getFeatureConfig(feature);
        return featureConfig.enabled !== false;
    }

    /**
     * Get configuration keys
     * @returns {Array} Array of configuration keys
     */
    getConfigKeys() {
        return Array.from(this.config.keys());
    }

    /**
     * Check if a configuration key exists
     * @param {string} key - Configuration key
     * @returns {boolean} True if key exists
     */
    hasConfig(key) {
        return this.config.has(key);
    }

    /**
     * Remove a configuration key
     * @param {string} key - Configuration key
     * @returns {boolean} True if removed successfully
     */
    removeConfig(key) {
        const removed = this.config.delete(key);
        if (removed) {
            this.configValidators.delete(key);
        }
        return removed;
    }
} 