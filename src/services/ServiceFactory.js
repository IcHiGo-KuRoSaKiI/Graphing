import { DiagramService } from './DiagramService.js';
import { ValidationService } from './ValidationService.js';
import { LayoutService } from './LayoutService.js';
import { ExportService } from './ExportService.js';
import { TechnicalDetailsService } from './TechnicalDetailsService.js';
import { NodeTypePlugin } from '../plugins/NodeTypePlugin.js';
import { ExportFormatPlugin } from '../plugins/ExportFormatPlugin.js';
import { DiagramConfig } from '../config/DiagramConfig.js';

export class ServiceFactory {
    constructor() {
        this.services = new Map();
        this.plugins = new Map();
        this.config = null;
        this.initialized = false;
    }

    /**
     * Initialize the service factory with all dependencies
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // Initialize configuration
            this.config = new DiagramConfig();

            // Initialize plugins
            this.plugins.set('nodeTypes', new NodeTypePlugin());
            this.plugins.set('exportFormats', new ExportFormatPlugin());

            // Initialize services with dependency injection
            const validationService = new ValidationService();
            const layoutService = new LayoutService();
            const exportService = new ExportService();
            const technicalDetailsService = new TechnicalDetailsService();

            const diagramService = new DiagramService(
                validationService,
                layoutService,
                exportService,
                technicalDetailsService
            );

            // Register services
            this.services.set('diagram', diagramService);
            this.services.set('validation', validationService);
            this.services.set('layout', layoutService);
            this.services.set('export', exportService);
            this.services.set('technicalDetails', technicalDetailsService);

            this.initialized = true;
            console.log('ServiceFactory initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ServiceFactory:', error);
            throw error;
        }
    }

    /**
     * Get a service by name
     * @param {string} serviceName - Name of the service
     * @returns {Object} Service instance
     */
    getService(serviceName) {
        if (!this.initialized) {
            throw new Error('ServiceFactory not initialized. Call initialize() first.');
        }

        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service '${serviceName}' not found`);
        }

        return service;
    }

    /**
     * Get a plugin by name
     * @param {string} pluginName - Name of the plugin
     * @returns {Object} Plugin instance
     */
    getPlugin(pluginName) {
        if (!this.initialized) {
            throw new Error('ServiceFactory not initialized. Call initialize() first.');
        }

        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            throw new Error(`Plugin '${pluginName}' not found`);
        }

        return plugin;
    }

    /**
     * Get the configuration instance
     * @returns {DiagramConfig} Configuration instance
     */
    getConfig() {
        if (!this.initialized) {
            throw new Error('ServiceFactory not initialized. Call initialize() first.');
        }

        return this.config;
    }

    /**
     * Get all available services
     * @returns {Array} Array of service names
     */
    getAvailableServices() {
        return Array.from(this.services.keys());
    }

    /**
     * Get all available plugins
     * @returns {Array} Array of plugin names
     */
    getAvailablePlugins() {
        return Array.from(this.plugins.keys());
    }

    /**
     * Create a diagram using the service layer
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Creation options
     * @returns {Promise<Object>} Created diagram
     */
    async createDiagram(diagramData, options = {}) {
        const diagramService = this.getService('diagram');
        return await diagramService.createDiagram(diagramData, options);
    }

    /**
     * Export a diagram using the service layer
     * @param {Object} diagramData - Diagram data
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportDiagram(diagramData, format, options = {}) {
        const exportService = this.getService('export');
        return await exportService.export(diagramData, format, options);
    }

    /**
     * Apply layout to a diagram using the service layer
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Promise<Object>} Layouted diagram
     */
    async layoutDiagram(diagramData, options = {}) {
        const layoutService = this.getService('layout');
        return await layoutService.layout(diagramData, options);
    }

    /**
     * Validate diagram data using the service layer
     * @param {Object} diagramData - Diagram data
     * @returns {Promise<Object>} Validation result
     */
    async validateDiagram(diagramData) {
        const validationService = this.getService('validation');
        return await validationService.validateDiagram(diagramData);
    }

    /**
     * Enrich diagram with technical details using the service layer
     * @param {Object} diagramData - Diagram data
     * @returns {Promise<Object>} Enriched diagram
     */
    async enrichDiagramWithTechnicalDetails(diagramData) {
        const technicalDetailsService = this.getService('technicalDetails');
        return await technicalDetailsService.enrichDiagram(diagramData);
    }

    /**
     * Get service factory statistics
     * @returns {Object} Factory statistics
     */
    getFactoryStats() {
        return {
            initialized: this.initialized,
            servicesCount: this.services.size,
            pluginsCount: this.plugins.size,
            availableServices: this.getAvailableServices(),
            availablePlugins: this.getAvailablePlugins(),
            configStats: this.config ? this.config.getConfigStats() : null
        };
    }

    /**
     * Reset the service factory
     */
    reset() {
        this.services.clear();
        this.plugins.clear();
        this.config = null;
        this.initialized = false;
    }

    /**
     * Create a new service factory instance
     * @returns {ServiceFactory} New service factory instance
     */
    static create() {
        return new ServiceFactory();
    }

    /**
     * Create a singleton instance
     * @returns {ServiceFactory} Singleton service factory instance
     */
    static getInstance() {
        if (!ServiceFactory.instance) {
            ServiceFactory.instance = new ServiceFactory();
        }
        return ServiceFactory.instance;
    }
} 