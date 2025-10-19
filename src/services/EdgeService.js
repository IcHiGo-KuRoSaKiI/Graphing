/**
 * EdgeService - Unified facade for all edge routing functionality
 *
 * This service consolidates the following services:
 * - EdgeWorkerService (Web Worker processing)
 * - LayoutAwareRoutingService (Layout-aware routing)
 * - EdgeRoutingService (Basic routing)
 * - OrthogonalRoutingService (Orthogonal routing)
 * - PathfindingEngine (Pathfinding algorithms)
 * - EnhancedEdgeManager (Orchestration)
 *
 * Use this service as the single entry point for all edge-related operations.
 */

import enhancedEdgeManager from './EnhancedEdgeManager';

class EdgeService {
    constructor() {
        this.manager = enhancedEdgeManager;
        this.isInitialized = false;
    }

    /**
     * Initialize the edge service
     * @param {Object} config - Configuration options
     */
    async initialize(config = {}) {
        if (this.isInitialized) return;

        const defaultConfig = {
            enablePerformanceMonitoring: true,
            enableLayoutAwareRouting: true,
            enableBatchProcessing: true,
            virtualBendsEnabled: true,
            intersectionDetectionEnabled: true,
            debounceTime: 100
        };

        await this.manager.initialize({ ...defaultConfig, ...config });
        this.isInitialized = true;

        console.log('[EdgeService] Initialized successfully');
    }

    /**
     * Process edges for a diagram
     * @param {Array} edges - Array of edge objects
     * @param {Array} nodes - Array of node objects
     * @param {Object} options - Processing options
     * @returns {Promise<Array>} Processed edges
     */
    async processEdges(edges, nodes, options = {}) {
        this.ensureInitialized();

        return await this.manager.processEdges(edges, nodes, options);
    }

    /**
     * Process a single edge
     * @param {Object} edge - Edge object
     * @param {Array} nodes - Array of node objects
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processed edge
     */
    async processEdge(edge, nodes, options = {}) {
        this.ensureInitialized();

        return await this.manager.processEdge(edge, nodes, options);
    }

    /**
     * Update edge routing when nodes change
     * @param {Array} updatedNodes - Updated node objects
     * @param {Array} currentEdges - Current edge objects
     * @returns {Promise<Array>} Updated edges
     */
    async updateEdgesForNodeChanges(updatedNodes, currentEdges) {
        this.ensureInitialized();

        return await this.manager.updateEdgesForNodeChanges(updatedNodes, currentEdges);
    }

    /**
     * Get edge routing statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        this.ensureInitialized();

        return this.manager.getStatistics();
    }

    /**
     * Subscribe to edge events
     * @param {string} eventName - Event name
     * @param {Function} callback - Event callback
     */
    on(eventName, callback) {
        this.ensureInitialized();

        return this.manager.on(eventName, callback);
    }

    /**
     * Unsubscribe from edge events
     * @param {string} eventName - Event name
     * @param {Function} callback - Event callback
     */
    off(eventName, callback) {
        this.ensureInitialized();

        return this.manager.off(eventName, callback);
    }

    /**
     * Reset the edge service
     */
    reset() {
        if (this.manager.reset) {
            this.manager.reset();
        }
        this.isInitialized = false;
    }

    /**
     * Ensure service is initialized before use
     * @private
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error(
                'EdgeService not initialized. Call initialize() before using edge operations.'
            );
        }
    }

    /**
     * Get the underlying edge manager (advanced use only)
     * @returns {Object} EnhancedEdgeManager instance
     */
    getManager() {
        return this.manager;
    }
}

// Export singleton instance
const edgeService = new EdgeService();
export default edgeService;

/**
 * MIGRATION GUIDE:
 *
 * Old code:
 *   import EdgeWorkerService from './EdgeWorkerService';
 *   import LayoutAwareRoutingService from './LayoutAwareRoutingService';
 *   import enhancedEdgeManager from './EnhancedEdgeManager';
 *
 * New code:
 *   import edgeService from './EdgeService';
 *   await edgeService.initialize();
 *   const processedEdges = await edgeService.processEdges(edges, nodes);
 *
 * Benefits:
 * - Single import instead of multiple
 * - Consistent API across all edge operations
 * - Centralized configuration
 * - Easier testing and mocking
 */
