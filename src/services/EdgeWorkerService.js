/**
 * EdgeWorkerService - Web Worker Communication Layer
 * Manages communication with the orthogonal edge processing Web Worker
 * Provides high-level API for Draw.io-style edge operations
 */

class EdgeWorkerService {
  constructor(options = {}) {
    this.worker = null;
    this.taskQueue = new Map();
    this.isInitialized = false;
    this.taskIdCounter = 0;
    this.hasWarnedAboutWorker = false; // Track if we've already warned about worker
    this.useWorker = options.useWorker !== false; // Allow disabling worker
    this.performanceMetrics = {
      totalTasks: 0,
      avgProcessingTime: 0,
      errorCount: 0,
      cacheHitRate: 0
    };
    
    // Make worker path configurable
    this.workerPath = options.workerPath || this.getDefaultWorkerPath();
    
    // Batch processing optimization
    this.batchQueue = [];
    this.batchTimeout = null;
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 50;
    
    // Enhanced caching
    this.resultCache = new Map();
    this.cacheMaxSize = options.cacheMaxSize || 1000;
    this.cacheExpiry = options.cacheExpiry || 30000; // 30 seconds
    
    // Only try to initialize worker if enabled
    if (this.useWorker) {
      this.initWorker();
    } else {
      console.log('🔧 EdgeWorkerService: Web Worker disabled - using synchronous fallback processing');
    }
  }
  
  /**
   * Get default worker path with fallbacks
   */
  getDefaultWorkerPath() {
    // Check for global configuration first
    if (typeof window !== 'undefined' && window.__GRAPHING_WORKER_PATH__) {
      return window.__GRAPHING_WORKER_PATH__;
    }
    
    // Try multiple possible paths for different build scenarios
    const possiblePaths = [
      // For Create React App development
      `${process.env.PUBLIC_URL || ''}/workers/orthogonal-edge-worker.js`,
      // For library builds
      './workers/orthogonal-edge-worker.js',
      // For CDN or absolute paths
      '/workers/orthogonal-edge-worker.js',
      // For relative paths in dist
      '../workers/orthogonal-edge-worker.js'
    ];
    
    return possiblePaths[0]; // Return the first one, will try others in initWorker
  }
  
  /**
   * Initialize the Web Worker
   */
  async initWorker() {
    const possiblePaths = [
      // For Create React App development
      `${process.env.PUBLIC_URL || ''}/workers/orthogonal-edge-worker.js`,
      // For library builds
      './workers/orthogonal-edge-worker.js',
      // For CDN or absolute paths
      '/workers/orthogonal-edge-worker.js',
      // For relative paths in dist
      '../workers/orthogonal-edge-worker.js'
    ];
    
    for (const workerPath of possiblePaths) {
      try {
        console.log('🔧 EdgeWorkerService: Trying worker path:', workerPath);
        
        this.worker = new Worker(workerPath);
        
        this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
        this.worker.addEventListener('error', this.handleWorkerError.bind(this));
        
        // Wait for worker to be ready
        const isReady = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.warn(`⚠️ EdgeWorkerService: Worker timeout at path: ${workerPath}`);
            reject(new Error('Worker initialization timeout'));
          }, 3000); // Reduced timeout for faster fallback
          
          const handleReady = (event) => {
            if (event.data.type === 'WORKER_READY') {
              clearTimeout(timeout);
              this.worker.removeEventListener('message', handleReady);
              this.isInitialized = true;
              console.log('🚀 EdgeWorkerService: Worker initialized successfully at:', workerPath);
              resolve(true);
            }
          };
          
          this.worker.addEventListener('message', handleReady);
        });
        
        if (isReady) {
          return; // Successfully initialized
        }
        
      } catch (error) {
        console.warn(`⚠️ EdgeWorkerService: Failed to initialize worker at ${workerPath}:`, error.message);
        // Continue to next path
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
      }
    }
    
    // If all paths failed, fall back to sync processing
    console.warn('⚠️ EdgeWorkerService: All worker paths failed - falling back to synchronous processing');
    this.isInitialized = false;
  }
  
  /**
   * Handle messages from the Web Worker
   */
  handleWorkerMessage(event) {
    const { type, taskId, result, error } = event.data;
    
    if (type === 'WORKER_READY') return;
    
    const task = this.taskQueue.get(taskId);
    if (!task) return;
    
    this.taskQueue.delete(taskId);
    
    if (type === 'SUCCESS') {
      task.resolve(result);
      this.updatePerformanceMetrics(task.startTime, false);
    } else if (type === 'ERROR') {
      task.reject(new Error(error));
      this.updatePerformanceMetrics(task.startTime, true);
    }
  }
  
  /**
   * Handle worker errors
   */
  handleWorkerError(error) {
    console.error('❌ EdgeWorkerService: Worker error:', error);
    console.error('Worker error details:', {
      message: error.message,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno
    });
    
    // Reject all pending tasks
    for (const [taskId, task] of this.taskQueue) {
      task.reject(new Error(`Worker error occurred: ${error.message}`));
    }
    this.taskQueue.clear();
    
    // Attempt to restart worker
    this.restartWorker();
  }
  
  /**
   * Restart the Web Worker
   */
  async restartWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isInitialized = false;
    
    // Don't restart if we've already failed - prevents infinite restart loops
    if (this.hasWarnedAboutWorker) {
      console.log('⚠️ EdgeWorkerService: Worker restart skipped - already using fallback processing');
      return;
    }
    
    await this.initWorker();
  }
  
  /**
   * Send a task to the Web Worker
   */
  async sendTask(type, data) {
    if (!this.isInitialized || !this.worker) {
      // Only warn once to avoid spam
      if (!this.hasWarnedAboutWorker) {
        console.warn('⚠️ EdgeWorkerService: Worker not available - using fallback processing for all operations');
        this.hasWarnedAboutWorker = true;
      }
      return null;
    }
    
    const taskId = ++this.taskIdCounter;
    const startTime = performance.now();
    
    return new Promise((resolve, reject) => {
      this.taskQueue.set(taskId, { resolve, reject, startTime });
      
      this.worker.postMessage({
        type,
        data,
        taskId
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.taskQueue.has(taskId)) {
          this.taskQueue.delete(taskId);
          reject(new Error('Task timeout'));
        }
      }, 10000);
    });
  }
  
  /**
   * Enhanced batch processing with chunking
   */
  async processBatchOptimized(edges, nodes, operation = 'optimizeWaypoints') {
    if (!this.isInitialized || !this.worker) {
      return edges.map(edge => ({
        edgeId: edge.id,
        waypoints: this.fallbackOptimizeWaypoints(edge, nodes),
        intersections: []
      }));
    }

    // Group operations by type for better batching
    const operations = edges.map(edge => ({
      type: operation,
      edge,
      nodes
    }));

    // Process in chunks to avoid blocking
    const chunks = this.chunkArray(operations, this.batchSize);
    const results = [];

    for (const chunk of chunks) {
      try {
        const chunkResult = await this.sendTask('PROCESS_BATCH', { operations: chunk });
        results.push(...chunkResult);
        
        // Allow UI to update between chunks
        await new Promise(resolve => setTimeout(resolve, 0));
      } catch (error) {
        console.warn('⚠️ EdgeWorkerService: Chunk processing failed, using fallback:', error.message);
        // Fallback for failed chunks
        chunk.forEach(op => {
          results.push({
            edgeId: op.edge.id,
            waypoints: this.fallbackOptimizeWaypoints(op.edge, op.nodes),
            intersections: []
          });
        });
      }
    }

    return results;
  }

  /**
   * Chunk array into smaller pieces
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Enhanced caching with expiry
   */
  getCachedResult(key) {
    const cached = this.resultCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.resultCache.delete(key);
      return null;
    }

    this.performanceMetrics.cacheHits++;
    return cached.data;
  }

  setCachedResult(key, data) {
    // Clean cache if it gets too large
    if (this.resultCache.size >= this.cacheMaxSize) {
      const oldestKeys = Array.from(this.resultCache.keys()).slice(0, this.cacheMaxSize / 2);
      oldestKeys.forEach(key => this.resultCache.delete(key));
    }

    this.resultCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Create cache key for edge operations
   */
  createCacheKey(edge, nodes, operation) {
    const edgeKey = `${edge.id}-${edge.source}-${edge.target}-${JSON.stringify(edge.data?.waypoints || [])}`;
    const nodePositions = nodes.map(n => `${n.id}:${n.position.x},${n.position.y}`).join('|');
    return `${operation}-${edgeKey}-${nodePositions}`;
  }
  
  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(startTime, isError) {
    const processingTime = performance.now() - startTime;
    
    this.performanceMetrics.totalTasks++;
    if (isError) {
      this.performanceMetrics.errorCount++;
    }
    
    // Calculate moving average
    const alpha = 0.1; // Smoothing factor
    this.performanceMetrics.avgProcessingTime = 
      this.performanceMetrics.avgProcessingTime * (1 - alpha) + 
      processingTime * alpha;
  }
  
  // Helper method to clean data for worker communication
  cleanDataForWorker(data) {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      // Skip functions and other non-serializable data
      if (typeof value === 'function') return undefined;
      if (value instanceof HTMLElement) return undefined;
      if (value instanceof Event) return undefined;
      return value;
    }));
  }

  // High-level API methods
  
  /**
   * Optimize waypoints for an edge with caching
   */
  async optimizeWaypoints(edge, nodes) {
    const cacheKey = this.createCacheKey(edge, nodes, 'optimizeWaypoints');
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const cleanData = this.cleanDataForWorker({
        edge,
        nodes,
        operation: 'optimizeWaypoints'
      });
      
      const result = await this.sendTask('PROCESS_EDGE', cleanData);
      
      // If sendTask returns null (worker not available), use fallback
      if (result === null) {
        const fallbackResult = this.fallbackOptimizeWaypoints(edge, nodes);
        this.setCachedResult(cacheKey, fallbackResult);
        return fallbackResult;
      }
      
      const waypoints = result.waypoints || [];
      this.setCachedResult(cacheKey, waypoints);
      return waypoints;
    } catch (error) {
      console.warn('⚠️ EdgeWorkerService: Failed to optimize waypoints, using fallback:', error.message);
      const fallbackResult = this.fallbackOptimizeWaypoints(edge, nodes);
      this.setCachedResult(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }
  
  /**
   * Calculate smart path for an edge with caching
   */
  async calculateSmartPath(edge, nodes) {
    const cacheKey = this.createCacheKey(edge, nodes, 'calculatePath');
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const cleanData = this.cleanDataForWorker({
        edge,
        nodes,
        operation: 'calculatePath'
      });
      
      const result = await this.sendTask('PROCESS_EDGE', cleanData);
      
      // If sendTask returns null (worker not available), use fallback
      if (result === null) {
        const fallbackResult = this.fallbackCalculatePath(edge, nodes);
        this.setCachedResult(cacheKey, fallbackResult);
        return fallbackResult;
      }
      
      const waypoints = result.waypoints || [];
      this.setCachedResult(cacheKey, waypoints);
      return waypoints;
    } catch (error) {
      console.warn('⚠️ EdgeWorkerService: Failed to calculate smart path, using fallback:', error.message);
      const fallbackResult = this.fallbackCalculatePath(edge, nodes);
      this.setCachedResult(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }
  
  /**
   * Calculate virtual bend points with caching
   */
  async calculateVirtualBends(edge, nodes) {
    const cacheKey = this.createCacheKey(edge, nodes, 'calculateVirtualBends');
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const cleanData = this.cleanDataForWorker({
        edge,
        nodes,
        operation: 'calculateVirtualBends'
      });
      
      const result = await this.sendTask('PROCESS_EDGE', cleanData);
      
      // If sendTask returns null (worker not available), use fallback
      if (result === null) {
        const fallbackResult = [];
        this.setCachedResult(cacheKey, fallbackResult);
        return fallbackResult;
      }
      
      const virtualBends = result.virtualBends || [];
      this.setCachedResult(cacheKey, virtualBends);
      return virtualBends;
    } catch (error) {
      console.warn('⚠️ EdgeWorkerService: Failed to calculate virtual bends, using fallback:', error.message);
      const fallbackResult = [];
      this.setCachedResult(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }
  
  /**
   * Detect intersections with other edges with caching
   */
  async detectIntersections(edge, nodes) {
    const cacheKey = this.createCacheKey(edge, nodes, 'detectIntersections');
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const cleanData = this.cleanDataForWorker({
        edge,
        nodes,
        operation: 'detectIntersections'
      });
      
      const result = await this.sendTask('PROCESS_EDGE', cleanData);
      
      // If sendTask returns null (worker not available), use fallback
      if (result === null) {
        const fallbackResult = [];
        this.setCachedResult(cacheKey, fallbackResult);
        return fallbackResult;
      }
      
      const intersections = result.intersections || [];
      this.setCachedResult(cacheKey, intersections);
      return intersections;
    } catch (error) {
      console.warn('⚠️ EdgeWorkerService: Failed to detect intersections, using fallback:', error.message);
      const fallbackResult = [];
      this.setCachedResult(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }
  
  /**
   * Process multiple edges in batch with optimized processing
   */
  async processBatch(edges, nodes) {
    return this.processBatchOptimized(edges, nodes, 'optimizeWaypoints');
  }
  
  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const workerMetrics = await this.sendTask('GET_PERFORMANCE_METRICS');
      return {
        ...this.performanceMetrics,
        worker: workerMetrics,
        cacheSize: this.resultCache.size,
        cacheHitRate: this.performanceMetrics.cacheHits / Math.max(this.performanceMetrics.totalTasks, 1)
      };
    } catch (error) {
      return {
        ...this.performanceMetrics,
        cacheSize: this.resultCache.size,
        cacheHitRate: this.performanceMetrics.cacheHits / Math.max(this.performanceMetrics.totalTasks, 1)
      };
    }
  }
  
  /**
   * Clear worker cache
   */
  async clearCache() {
    try {
      await this.sendTask('CLEAR_CACHE');
      this.resultCache.clear();
      return true;
    } catch (error) {
      console.error('❌ EdgeWorkerService: Failed to clear cache:', error);
      this.resultCache.clear();
      return false;
    }
  }
  
  // Fallback methods (runs on main thread)
  
  fallbackOptimizeWaypoints(edge, nodes) {
    const waypoints = edge.data?.waypoints || [];
    if (waypoints.length <= 1) return waypoints;
    
    // Simple redundant point removal
    const optimized = [];
    for (let i = 0; i < waypoints.length; i++) {
      const prev = i > 0 ? waypoints[i - 1] : null;
      const current = waypoints[i];
      const next = i < waypoints.length - 1 ? waypoints[i + 1] : null;
      
      if (!prev || !next) {
        optimized.push(current);
        continue;
      }
      
      // Check if point is necessary
      const isHorizontalLine = Math.abs(prev.y - current.y) < 5 && Math.abs(current.y - next.y) < 5;
      const isVerticalLine = Math.abs(prev.x - current.x) < 5 && Math.abs(current.x - next.x) < 5;
      
      if (!isHorizontalLine && !isVerticalLine) {
        optimized.push(current);
      }
    }
    
    return optimized;
  }
  
  fallbackCalculatePath(edge, nodes) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return [];
    
    // Simple orthogonal path
    const sourcePoint = {
      x: sourceNode.position.x + (sourceNode.width || 150) / 2,
      y: sourceNode.position.y + (sourceNode.height || 60) / 2
    };
    const targetPoint = {
      x: targetNode.position.x + (targetNode.width || 150) / 2,
      y: targetNode.position.y + (targetNode.height || 60) / 2
    };
    
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      const midX = sourcePoint.x + dx / 2;
      return [
        { x: midX, y: sourcePoint.y },
        { x: midX, y: targetPoint.y }
      ];
    } else {
      const midY = sourcePoint.y + dy / 2;
      return [
        { x: sourcePoint.x, y: midY },
        { x: targetPoint.x, y: midY }
      ];
    }
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.taskQueue.clear();
    this.resultCache.clear();
    this.batchQueue = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    this.isInitialized = false;
  }
}

// Create singleton instance - disable worker by default for library builds
const shouldUseWorker = typeof window !== 'undefined' ? 
  window.__GRAPHING_USE_WORKER__ === true : false; // Only enable if explicitly set to true

const edgeWorkerService = new EdgeWorkerService({ useWorker: shouldUseWorker });

export default edgeWorkerService;