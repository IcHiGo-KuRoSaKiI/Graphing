/**
 * EnhancedEdgeManager - Central manager for Draw.io-style orthogonal edge functionality
 * Coordinates between Web Worker service, layout-aware routing, and performance monitoring
 */

import EdgeWorkerService from './EdgeWorkerService';
import LayoutAwareRoutingService from './LayoutAwareRoutingService';
import EdgePerformanceMonitor from './EdgePerformanceMonitor';

class EnhancedEdgeManager {
  constructor() {
    this.isInitialized = false;
    this.edgeRegistry = new Map();
    this.activeEdges = new Set();
    this.processingQueue = new Map();
    
    this.config = {
      enablePerformanceMonitoring: true,
      enableLayoutAwareRouting: true,
      enableBatchProcessing: true,
      debounceTime: 100,
      maxConcurrentProcessing: 5,
      virtualBendsEnabled: true,
      intersectionDetectionEnabled: true
    };

    this.statistics = {
      totalProcessed: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      optimizationsSuggested: 0,
      optimizationsApplied: 0
    };

    this.eventCallbacks = new Map();
  }

  /**
   * Initialize the enhanced edge manager
   */
  async initialize(config = {}) {
    if (this.isInitialized) return;

    // Merge configuration
    this.config = { ...this.config, ...config };

    try {
      // Initialize services
      try {
        await EdgeWorkerService.initWorker();
        console.log('✅ EnhancedEdgeManager: Web Worker initialized successfully');
      } catch (error) {
        console.warn('⚠️ EnhancedEdgeManager: Web Worker failed to initialize, using fallback processing:', error.message);
      }

      // Start performance monitoring if enabled
      if (this.config.enablePerformanceMonitoring) {
        EdgePerformanceMonitor.startMonitoring();
        
        // Setup performance alert handler
        EdgePerformanceMonitor.onAlert((alert) => {
          this.handlePerformanceAlert(alert);
        });
      }

      // Setup layout constraints for layout-aware routing
      if (this.config.enableLayoutAwareRouting) {
        this.setupLayoutConstraints();
      }

      this.isInitialized = true;
      console.log('🚀 EnhancedEdgeManager: Initialized successfully');

      // Emit initialization event
      this.emit('initialized', { config: this.config });

    } catch (error) {
      console.error('❌ EnhancedEdgeManager: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Register an edge for enhanced processing
   */
  registerEdge(edgeId, edgeData, nodes) {
    const registration = {
      id: edgeId,
      data: edgeData,
      nodes: nodes,
      lastProcessed: 0,
      processingCount: 0,
      averageProcessingTime: 0,
      optimizedWaypoints: null,
      virtualBends: null,
      intersections: null,
      status: 'registered'
    };

    this.edgeRegistry.set(edgeId, registration);
    this.activeEdges.add(edgeId);

    console.log(`📝 EnhancedEdgeManager: Registered edge ${edgeId}`);
    this.emit('edge_registered', { edgeId, registration });
  }

  /**
   * Unregister an edge
   */
  unregisterEdge(edgeId) {
    if (this.edgeRegistry.has(edgeId)) {
      this.edgeRegistry.delete(edgeId);
      this.activeEdges.delete(edgeId);
      
      // Cancel any pending processing
      if (this.processingQueue.has(edgeId)) {
        this.processingQueue.delete(edgeId);
      }

      console.log(`📝 EnhancedEdgeManager: Unregistered edge ${edgeId}`);
      this.emit('edge_unregistered', { edgeId });
    }
  }

  /**
   * Process an edge with full Draw.io-style functionality
   */
  async processEdge(edgeId, operation = 'full', options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const registration = this.edgeRegistry.get(edgeId);
    if (!registration) {
      throw new Error(`Edge ${edgeId} not registered`);
    }

    const startTime = performance.now();
    registration.status = 'processing';

    try {
      let result = {};

      // Record processing start
      if (this.config.enablePerformanceMonitoring) {
        EdgePerformanceMonitor.recordProcessingTime(edgeId, 0, `${operation}_start`);
      }

      switch (operation) {
        case 'full':
          result = await this.processFullEnhancement(registration, options);
          break;
        
        case 'optimize':
          result = await this.processOptimization(registration, options);
          break;
        
        case 'virtual_bends':
          result = await this.processVirtualBends(registration, options);
          break;
        
        case 'intersections':
          result = await this.processIntersections(registration, options);
          break;
        
        case 'layout_aware':
          result = await this.processLayoutAwareRouting(registration, options);
          break;
        
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      // Update registration with results
      this.updateRegistrationWithResults(registration, result);

      // Record processing completion
      const processingTime = performance.now() - startTime;
      registration.processingCount++;
      registration.averageProcessingTime = 
        (registration.averageProcessingTime * (registration.processingCount - 1) + processingTime) / 
        registration.processingCount;
      registration.lastProcessed = performance.now();
      registration.status = 'completed';

      if (this.config.enablePerformanceMonitoring) {
        EdgePerformanceMonitor.recordProcessingTime(edgeId, processingTime, operation);
      }

      this.statistics.totalProcessed++;
      this.statistics.averageProcessingTime = 
        (this.statistics.averageProcessingTime * (this.statistics.totalProcessed - 1) + processingTime) / 
        this.statistics.totalProcessed;

      console.log(`✅ EnhancedEdgeManager: Processed edge ${edgeId} (${operation}) in ${processingTime.toFixed(2)}ms`);
      this.emit('edge_processed', { edgeId, operation, result, processingTime });

      return result;

    } catch (error) {
      registration.status = 'error';
      console.error(`❌ EnhancedEdgeManager: Failed to process edge ${edgeId}:`, error);
      
      this.emit('edge_processing_error', { edgeId, operation, error });
      throw error;
    }
  }

  /**
   * Process full enhancement (all features)
   */
  async processFullEnhancement(registration, options) {
    const { layoutType = 'default' } = options;

    // Run all processing operations in parallel for maximum performance
    const [optimizedWaypoints, virtualBends, intersections, layoutAwarePath] = await Promise.all([
      EdgeWorkerService.optimizeWaypoints(registration.data, registration.nodes),
      this.config.virtualBendsEnabled ? 
        EdgeWorkerService.calculateVirtualBends(registration.data, registration.nodes) : [],
      this.config.intersectionDetectionEnabled ? 
        EdgeWorkerService.detectIntersections(registration.data, registration.nodes) : [],
      this.config.enableLayoutAwareRouting ? 
        LayoutAwareRoutingService.calculateLayoutAwarePath(registration.data, registration.nodes, layoutType) : null
    ]);

    return {
      optimizedWaypoints,
      virtualBends,
      intersections,
      layoutAwarePath,
      layoutType
    };
  }

  /**
   * Process optimization only
   */
  async processOptimization(registration, options) {
    const optimizedWaypoints = await EdgeWorkerService.optimizeWaypoints(registration.data, registration.nodes);
    
    return {
      optimizedWaypoints
    };
  }

  /**
   * Process virtual bends calculation
   */
  async processVirtualBends(registration, options) {
    if (!this.config.virtualBendsEnabled) {
      return { virtualBends: [] };
    }

    const virtualBends = await EdgeWorkerService.calculateVirtualBends(registration.data, registration.nodes);
    
    return {
      virtualBends
    };
  }

  /**
   * Process intersection detection
   */
  async processIntersections(registration, options) {
    if (!this.config.intersectionDetectionEnabled) {
      return { intersections: [] };
    }

    const intersections = await EdgeWorkerService.detectIntersections(registration.data, registration.nodes);
    
    return {
      intersections
    };
  }

  /**
   * Process layout-aware routing
   */
  async processLayoutAwareRouting(registration, options) {
    if (!this.config.enableLayoutAwareRouting) {
      return { layoutAwarePath: null };
    }

    const { layoutType = 'default' } = options;
    const layoutAwarePath = await LayoutAwareRoutingService.calculateLayoutAwarePath(
      registration.data, 
      registration.nodes, 
      layoutType
    );
    
    return {
      layoutAwarePath,
      layoutType
    };
  }

  /**
   * Batch process multiple edges
   */
  async batchProcessEdges(edgeIds, operation = 'full', options = {}) {
    if (!this.config.enableBatchProcessing) {
      // Process individually if batch processing is disabled
      const results = new Map();
      for (const edgeId of edgeIds) {
        results.set(edgeId, await this.processEdge(edgeId, operation, options));
      }
      return results;
    }

    const startTime = performance.now();
    const results = new Map();
    const validRegistrations = [];

    // Collect valid registrations
    for (const edgeId of edgeIds) {
      const registration = this.edgeRegistry.get(edgeId);
      if (registration) {
        validRegistrations.push({ edgeId, registration });
      }
    }

    if (validRegistrations.length === 0) {
      return results;
    }

    try {
      // Prepare batch data
      const edges = validRegistrations.map(({ registration }) => registration.data);
      const allNodes = validRegistrations[0].registration.nodes; // Assume same nodes for batch

      // Process batch using Web Worker
      const batchResult = await EdgeWorkerService.processBatch(edges, allNodes);

      // Distribute results back to individual edges
      batchResult.forEach((result, index) => {
        const { edgeId, registration } = validRegistrations[index];
        this.updateRegistrationWithResults(registration, result);
        results.set(edgeId, result);
      });

      const processingTime = performance.now() - startTime;
      console.log(`✅ EnhancedEdgeManager: Batch processed ${edgeIds.length} edges in ${processingTime.toFixed(2)}ms`);
      
      this.emit('batch_processed', { edgeIds, operation, results, processingTime });
      return results;

    } catch (error) {
      console.error('❌ EnhancedEdgeManager: Batch processing failed:', error);
      this.emit('batch_processing_error', { edgeIds, operation, error });
      throw error;
    }
  }

  /**
   * Update registration with processing results
   */
  updateRegistrationWithResults(registration, result) {
    if (result.optimizedWaypoints) {
      registration.optimizedWaypoints = result.optimizedWaypoints;
    }
    if (result.virtualBends) {
      registration.virtualBends = result.virtualBends;
    }
    if (result.intersections) {
      registration.intersections = result.intersections;
    }
    if (result.layoutAwarePath) {
      registration.layoutAwarePath = result.layoutAwarePath;
    }
  }

  /**
   * Handle performance alerts
   */
  handlePerformanceAlert(alert) {
    console.warn('⚠️ EnhancedEdgeManager: Performance alert:', alert);

    // Get optimization recommendations
    const recommendations = EdgePerformanceMonitor.getOptimizationRecommendations();
    
    if (recommendations.length > 0) {
      this.statistics.optimizationsSuggested += recommendations.length;
      
      // Auto-apply safe optimizations
      this.applyOptimizations(recommendations.filter(r => r.priority === 'high'));
      
      this.emit('performance_alert', { alert, recommendations });
    }
  }

  /**
   * Apply optimization recommendations
   */
  applyOptimizations(recommendations) {
    recommendations.forEach(recommendation => {
      try {
        switch (recommendation.action) {
          case 'clear_cache':
            EdgeWorkerService.clearCache();
            LayoutAwareRoutingService.clearCaches();
            console.log('🧹 EnhancedEdgeManager: Cleared caches for performance');
            break;
          
          case 'enable_batching':
            this.config.enableBatchProcessing = true;
            console.log('📦 EnhancedEdgeManager: Enabled batch processing');
            break;
          
          case 'reduce_batch_size':
            // Reduce batch size to lower memory usage
            if (EdgeWorkerService.batchSize) {
              EdgeWorkerService.batchSize = Math.max(EdgeWorkerService.batchSize / 2, 5);
              console.log(`📦 EnhancedEdgeManager: Reduced batch size to ${EdgeWorkerService.batchSize}`);
            }
            break;
          
          case 'debounce_increase':
            this.config.debounceTime = Math.min(this.config.debounceTime * 1.5, 500);
            console.log(`⏰ EnhancedEdgeManager: Increased debounce to ${this.config.debounceTime}ms`);
            break;
          
          case 'optimize_rendering':
            // Reduce visual effects for better performance
            this.config.virtualBendsEnabled = false;
            this.config.intersectionDetectionEnabled = false;
            console.log('🎨 EnhancedEdgeManager: Optimized rendering by disabling visual effects');
            break;
          
          default:
            console.warn(`❓ EnhancedEdgeManager: Unknown optimization action: ${recommendation.action}`);
        }
        
        this.statistics.optimizationsApplied++;
      } catch (error) {
        console.error('❌ EnhancedEdgeManager: Failed to apply optimization:', error);
      }
    });
  }

  /**
   * Setup layout constraints
   */
  setupLayoutConstraints() {
    // These are already set up in LayoutAwareRoutingService, but can be customized here
    console.log('📐 EnhancedEdgeManager: Layout-aware routing configured');
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics() {
    const performanceReport = this.config.enablePerformanceMonitoring ? 
      EdgePerformanceMonitor.generateReport() : null;
    
    const routingStats = this.config.enableLayoutAwareRouting ? 
      LayoutAwareRoutingService.getRoutingStatistics() : null;

    return {
      manager: {
        ...this.statistics,
        totalRegisteredEdges: this.edgeRegistry.size,
        activeEdges: this.activeEdges.size,
        pendingProcessing: this.processingQueue.size,
        config: this.config
      },
      performance: performanceReport,
      routing: routingStats,
      worker: {
        initialized: EdgeWorkerService.isInitialized,
        // Add worker-specific stats here
      }
    };
  }

  /**
   * Get edge information
   */
  getEdgeInfo(edgeId) {
    return this.edgeRegistry.get(edgeId) || null;
  }

  /**
   * Get all registered edges
   */
  getAllEdges() {
    return Array.from(this.edgeRegistry.values());
  }

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event).add(callback);

    return () => {
      this.eventCallbacks.get(event)?.delete(callback);
    };
  }

  emit(event, data) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ EnhancedEdgeManager: Event callback error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ EnhancedEdgeManager: Configuration updated');
    this.emit('config_updated', { config: this.config });
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    console.log('🧹 EnhancedEdgeManager: Cleaning up...');

    // Stop performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      EdgePerformanceMonitor.stopMonitoring();
    }

    // Clear all data
    this.edgeRegistry.clear();
    this.activeEdges.clear();
    this.processingQueue.clear();
    this.eventCallbacks.clear();

    // Destroy services
    EdgeWorkerService.destroy();
    EdgePerformanceMonitor.destroy();
    LayoutAwareRoutingService.clearCaches();

    this.isInitialized = false;
    this.emit('destroyed');
  }
}

// Create singleton instance
const enhancedEdgeManager = new EnhancedEdgeManager();

export default enhancedEdgeManager;