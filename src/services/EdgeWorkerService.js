/**
 * EdgeWorkerService - Web Worker Communication Layer
 * Manages communication with the orthogonal edge processing Web Worker
 * Provides high-level API for Draw.io-style edge operations
 */

class EdgeWorkerService {
  constructor() {
    this.worker = null;
    this.taskQueue = new Map();
    this.isInitialized = false;
    this.taskIdCounter = 0;
    this.performanceMetrics = {
      totalTasks: 0,
      avgProcessingTime: 0,
      errorCount: 0,
      cacheHitRate: 0
    };
    
    this.initWorker();
  }
  
  /**
   * Initialize the Web Worker
   */
  async initWorker() {
    try {
      this.worker = new Worker('/workers/orthogonal-edge-worker.js');
      
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));
      
      // Wait for worker to be ready
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Worker initialization timeout'));
        }, 5000);
        
        const handleReady = (event) => {
          if (event.data.type === 'WORKER_READY') {
            clearTimeout(timeout);
            this.worker.removeEventListener('message', handleReady);
            this.isInitialized = true;
            console.log('🚀 EdgeWorkerService: Worker initialized successfully');
            resolve();
          }
        };
        
        this.worker.addEventListener('message', handleReady);
      });
      
    } catch (error) {
      console.error('❌ EdgeWorkerService: Failed to initialize worker:', error);
      throw error;
    }
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
    
    // Reject all pending tasks
    for (const [taskId, task] of this.taskQueue) {
      task.reject(new Error('Worker error occurred'));
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
    }
    
    this.isInitialized = false;
    await this.initWorker();
  }
  
  /**
   * Send a task to the Web Worker
   */
  async sendTask(type, data) {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
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
  
  // High-level API methods
  
  /**
   * Optimize waypoints for an edge
   */
  async optimizeWaypoints(edge, nodes) {
    try {
      const result = await this.sendTask('PROCESS_EDGE', {
        edge,
        nodes,
        operation: 'optimizeWaypoints'
      });
      
      return result.waypoints || [];
    } catch (error) {
      console.error('❌ EdgeWorkerService: Failed to optimize waypoints:', error);
      return this.fallbackOptimizeWaypoints(edge, nodes);
    }
  }
  
  /**
   * Calculate smart path for an edge
   */
  async calculateSmartPath(edge, nodes) {
    try {
      const result = await this.sendTask('PROCESS_EDGE', {
        edge,
        nodes,
        operation: 'calculatePath'
      });
      
      return result.waypoints || [];
    } catch (error) {
      console.error('❌ EdgeWorkerService: Failed to calculate smart path:', error);
      return this.fallbackCalculatePath(edge, nodes);
    }
  }
  
  /**
   * Calculate virtual bend points
   */
  async calculateVirtualBends(edge, nodes) {
    try {
      const result = await this.sendTask('PROCESS_EDGE', {
        edge,
        nodes,
        operation: 'calculateVirtualBends'
      });
      
      return result.virtualBends || [];
    } catch (error) {
      console.error('❌ EdgeWorkerService: Failed to calculate virtual bends:', error);
      return [];
    }
  }
  
  /**
   * Detect segment intersections
   */
  async detectIntersections(edge, nodes) {
    try {
      const result = await this.sendTask('PROCESS_EDGE', {
        edge,
        nodes,
        operation: 'detectIntersections'
      });
      
      return result.intersections || [];
    } catch (error) {
      console.error('❌ EdgeWorkerService: Failed to detect intersections:', error);
      return [];
    }
  }
  
  /**
   * Process multiple edges in batch
   */
  async processBatch(edges, nodes) {
    try {
      const result = await this.sendTask('PROCESS_BATCH', {
        edges,
        nodes
      });
      
      return result || [];
    } catch (error) {
      console.error('❌ EdgeWorkerService: Failed to process batch:', error);
      return edges.map(edge => ({ edgeId: edge.id, waypoints: [] }));
    }
  }
  
  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const workerMetrics = await this.sendTask('GET_PERFORMANCE_METRICS');
      return {
        ...this.performanceMetrics,
        worker: workerMetrics
      };
    } catch (error) {
      return this.performanceMetrics;
    }
  }
  
  /**
   * Clear worker cache
   */
  async clearCache() {
    try {
      await this.sendTask('CLEAR_CACHE');
      return true;
    } catch (error) {
      console.error('❌ EdgeWorkerService: Failed to clear cache:', error);
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
    this.isInitialized = false;
  }
}

// Create singleton instance
const edgeWorkerService = new EdgeWorkerService();

export default edgeWorkerService;