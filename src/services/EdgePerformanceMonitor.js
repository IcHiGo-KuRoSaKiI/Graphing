/**
 * EdgePerformanceMonitor - Performance monitoring and optimization for edge processing
 * Tracks metrics, identifies bottlenecks, and provides optimization recommendations
 */

class EdgePerformanceMonitor {
  constructor() {
    this.metrics = {
      edgeProcessing: new Map(),
      workerTasks: new Map(),
      renderingPerformance: new Map(),
      memoryUsage: new Map(),
      userInteractions: new Map()
    };

    this.thresholds = {
      processingTime: {
        good: 16, // 60fps
        warning: 33, // 30fps
        critical: 100 // 10fps
      },
      memoryUsage: {
        good: 50, // MB
        warning: 100, // MB
        critical: 200 // MB
      },
      workerQueue: {
        good: 5,
        warning: 15,
        critical: 30
      }
    };

    this.observers = {
      performance: null,
      memory: null,
      interaction: null
    };

    this.optimizationRules = new Map();
    this.alertCallbacks = new Set();
    
    this.startTime = performance.now();
    this.isMonitoring = false;
    
    this.setupOptimizationRules();
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupPerformanceObserver();
    this.setupMemoryObserver();
    this.setupInteractionObserver();
    
    console.log('🔍 EdgePerformanceMonitor: Started monitoring');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.observers.performance) {
      this.observers.performance.disconnect();
    }
    if (this.observers.memory) {
      clearInterval(this.observers.memory);
    }
    if (this.observers.interaction) {
      this.observers.interaction.disconnect();
    }
    
    console.log('🔍 EdgePerformanceMonitor: Stopped monitoring');
  }

  /**
   * Setup Performance Observer for frame timing
   */
  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    try {
      this.observers.performance = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            this.recordProcessingTime(entry.name, entry.duration);
          } else if (entry.entryType === 'navigation') {
            this.recordPageLoadTime(entry.loadEventEnd - entry.loadEventStart);
          }
        });
      });

      this.observers.performance.observe({ 
        entryTypes: ['measure', 'navigation'] 
      });
      
    } catch (error) {
      console.warn('🔍 EdgePerformanceMonitor: Performance Observer not available:', error);
    }
  }

  /**
   * Setup memory usage monitoring
   */
  setupMemoryObserver() {
    if (!performance.memory) return;

    this.observers.memory = setInterval(() => {
      const memInfo = {
        used: performance.memory.usedJSHeapSize / (1024 * 1024), // MB
        total: performance.memory.totalJSHeapSize / (1024 * 1024), // MB
        limit: performance.memory.jsHeapSizeLimit / (1024 * 1024), // MB
        timestamp: performance.now()
      };

      this.recordMemoryUsage(memInfo);
    }, 1000); // Check every second
  }

  /**
   * Setup user interaction monitoring
   */
  setupInteractionObserver() {
    if (!window.PerformanceObserver) return;

    try {
      this.observers.interaction = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'event') {
            this.recordInteractionTiming(entry.name, entry.duration, entry.startTime);
          }
        });
      });

      this.observers.interaction.observe({ 
        entryTypes: ['event'],
        buffered: true
      });
      
    } catch (error) {
      console.warn('🔍 EdgePerformanceMonitor: Interaction Observer not available:', error);
    }
  }

  /**
   * Record edge processing time
   */
  recordProcessingTime(edgeId, duration, operation = 'unknown') {
    const timestamp = performance.now();
    
    if (!this.metrics.edgeProcessing.has(edgeId)) {
      this.metrics.edgeProcessing.set(edgeId, []);
    }

    const record = {
      operation,
      duration,
      timestamp,
      level: this.getPerformanceLevel(duration, 'processingTime')
    };

    this.metrics.edgeProcessing.get(edgeId).push(record);
    
    // Keep only recent records (last 100)
    const records = this.metrics.edgeProcessing.get(edgeId);
    if (records.length > 100) {
      records.splice(0, records.length - 100);
    }

    // Check for performance issues
    this.checkPerformanceThresholds(edgeId, record);
  }

  /**
   * Record Web Worker task performance
   */
  recordWorkerTask(taskType, duration, queueSize = 0) {
    const timestamp = performance.now();
    
    if (!this.metrics.workerTasks.has(taskType)) {
      this.metrics.workerTasks.set(taskType, []);
    }

    const record = {
      duration,
      queueSize,
      timestamp,
      level: this.getPerformanceLevel(duration, 'processingTime')
    };

    this.metrics.workerTasks.get(taskType).push(record);
    
    // Keep only recent records (last 50)
    const records = this.metrics.workerTasks.get(taskType);
    if (records.length > 50) {
      records.splice(0, records.length - 50);
    }

    // Check queue size thresholds
    if (queueSize > this.thresholds.workerQueue.warning) {
      this.triggerAlert('worker_queue_high', {
        taskType,
        queueSize,
        threshold: this.thresholds.workerQueue.warning
      });
    }
  }

  /**
   * Record rendering performance
   */
  recordRenderingPerformance(frameTime, edgeCount) {
    const timestamp = performance.now();
    const key = `edges-${edgeCount}`;
    
    if (!this.metrics.renderingPerformance.has(key)) {
      this.metrics.renderingPerformance.set(key, []);
    }

    const record = {
      frameTime,
      edgeCount,
      timestamp,
      fps: 1000 / frameTime,
      level: this.getPerformanceLevel(frameTime, 'processingTime')
    };

    this.metrics.renderingPerformance.get(key).push(record);
    
    // Keep only recent records (last 30)
    const records = this.metrics.renderingPerformance.get(key);
    if (records.length > 30) {
      records.splice(0, records.length - 30);
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(memInfo) {
    const timestamp = performance.now();
    const key = 'global';
    
    if (!this.metrics.memoryUsage.has(key)) {
      this.metrics.memoryUsage.set(key, []);
    }

    const record = {
      ...memInfo,
      level: this.getPerformanceLevel(memInfo.used, 'memoryUsage')
    };

    this.metrics.memoryUsage.get(key).push(record);
    
    // Keep only recent records (last 60)
    const records = this.metrics.memoryUsage.get(key);
    if (records.length > 60) {
      records.splice(0, records.length - 60);
    }

    // Check memory thresholds
    if (memInfo.used > this.thresholds.memoryUsage.warning) {
      this.triggerAlert('memory_usage_high', {
        used: memInfo.used,
        threshold: this.thresholds.memoryUsage.warning
      });
    }
  }

  /**
   * Record user interaction timing
   */
  recordInteractionTiming(eventType, duration, startTime) {
    const key = eventType;
    
    if (!this.metrics.userInteractions.has(key)) {
      this.metrics.userInteractions.set(key, []);
    }

    const record = {
      duration,
      startTime,
      timestamp: performance.now(),
      level: this.getPerformanceLevel(duration, 'processingTime')
    };

    this.metrics.userInteractions.get(key).push(record);
    
    // Keep only recent records (last 20)
    const records = this.metrics.userInteractions.get(key);
    if (records.length > 20) {
      records.splice(0, records.length - 20);
    }
  }

  /**
   * Get performance level based on thresholds
   */
  getPerformanceLevel(value, category) {
    const threshold = this.thresholds[category];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.warning) return 'warning';
    return 'critical';
  }

  /**
   * Check performance thresholds and trigger alerts
   */
  checkPerformanceThresholds(edgeId, record) {
    if (record.level === 'critical') {
      this.triggerAlert('edge_performance_critical', {
        edgeId,
        duration: record.duration,
        operation: record.operation
      });
    }
  }

  /**
   * Setup optimization rules
   */
  setupOptimizationRules() {
    // Rule: High processing time -> suggest debouncing
    this.optimizationRules.set('high_processing_time', {
      condition: (metrics) => this.getAverageProcessingTime() > this.thresholds.processingTime.warning,
      suggestion: 'Consider increasing debounce time for edge processing',
      action: 'debounce_increase',
      priority: 'high'
    });

    // Rule: High memory usage -> suggest cache clearing
    this.optimizationRules.set('high_memory_usage', {
      condition: (metrics) => this.getCurrentMemoryUsage() > this.thresholds.memoryUsage.warning,
      suggestion: 'Clear edge processing cache to reduce memory usage',
      action: 'clear_cache',
      priority: 'medium'
    });

    // Rule: High worker queue -> suggest batch processing
    this.optimizationRules.set('high_worker_queue', {
      condition: (metrics) => this.getAverageWorkerQueueSize() > this.thresholds.workerQueue.warning,
      suggestion: 'Enable batch processing for multiple edges',
      action: 'enable_batching',
      priority: 'high'
    });

    // Rule: Many edges -> suggest virtualization
    this.optimizationRules.set('many_edges', {
      condition: (metrics) => this.getEdgeCount() > 50,
      suggestion: 'Consider edge virtualization for better performance',
      action: 'enable_virtualization',
      priority: 'medium'
    });
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    const currentMetrics = this.getAggregatedMetrics();

    this.optimizationRules.forEach((rule, ruleName) => {
      if (rule.condition(currentMetrics)) {
        recommendations.push({
          rule: ruleName,
          suggestion: rule.suggestion,
          action: rule.action,
          priority: rule.priority,
          timestamp: performance.now()
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics() {
    return {
      processingTime: {
        average: this.getAverageProcessingTime(),
        p95: this.getPercentileProcessingTime(95),
        distribution: this.getProcessingTimeDistribution()
      },
      memoryUsage: {
        current: this.getCurrentMemoryUsage(),
        peak: this.getPeakMemoryUsage(),
        average: this.getAverageMemoryUsage()
      },
      workerPerformance: {
        averageQueueSize: this.getAverageWorkerQueueSize(),
        taskThroughput: this.getWorkerTaskThroughput(),
        errorRate: this.getWorkerErrorRate()
      },
      rendering: {
        averageFPS: this.getAverageFPS(),
        frameDrops: this.getFrameDrops(),
        edgeCount: this.getEdgeCount()
      },
      interactions: {
        averageResponseTime: this.getAverageInteractionTime(),
        slowInteractions: this.getSlowInteractionCount()
      }
    };
  }

  // Metric calculation methods
  getAverageProcessingTime() {
    let totalTime = 0;
    let count = 0;

    this.metrics.edgeProcessing.forEach(records => {
      records.forEach(record => {
        totalTime += record.duration;
        count++;
      });
    });

    return count > 0 ? totalTime / count : 0;
  }

  getPercentileProcessingTime(percentile) {
    const allTimes = [];
    
    this.metrics.edgeProcessing.forEach(records => {
      records.forEach(record => allTimes.push(record.duration));
    });

    if (allTimes.length === 0) return 0;

    allTimes.sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * allTimes.length);
    return allTimes[index] || 0;
  }

  getProcessingTimeDistribution() {
    const distribution = { good: 0, warning: 0, critical: 0 };
    
    this.metrics.edgeProcessing.forEach(records => {
      records.forEach(record => {
        distribution[record.level]++;
      });
    });

    return distribution;
  }

  getCurrentMemoryUsage() {
    const records = this.metrics.memoryUsage.get('global');
    if (!records || records.length === 0) return 0;
    
    return records[records.length - 1].used;
  }

  getPeakMemoryUsage() {
    const records = this.metrics.memoryUsage.get('global');
    if (!records || records.length === 0) return 0;
    
    return Math.max(...records.map(r => r.used));
  }

  getAverageMemoryUsage() {
    const records = this.metrics.memoryUsage.get('global');
    if (!records || records.length === 0) return 0;
    
    const total = records.reduce((sum, r) => sum + r.used, 0);
    return total / records.length;
  }

  getAverageWorkerQueueSize() {
    let totalSize = 0;
    let count = 0;

    this.metrics.workerTasks.forEach(records => {
      records.forEach(record => {
        totalSize += record.queueSize;
        count++;
      });
    });

    return count > 0 ? totalSize / count : 0;
  }

  getWorkerTaskThroughput() {
    const now = performance.now();
    const oneMinuteAgo = now - 60000; // 1 minute in milliseconds
    let count = 0;

    this.metrics.workerTasks.forEach(records => {
      records.forEach(record => {
        if (record.timestamp >= oneMinuteAgo) {
          count++;
        }
      });
    });

    return count; // Tasks per minute
  }

  getWorkerErrorRate() {
    // This would need to be tracked separately when errors occur
    return 0; // Placeholder
  }

  getAverageFPS() {
    let totalFPS = 0;
    let count = 0;

    this.metrics.renderingPerformance.forEach(records => {
      records.forEach(record => {
        totalFPS += record.fps;
        count++;
      });
    });

    return count > 0 ? totalFPS / count : 60;
  }

  getFrameDrops() {
    let drops = 0;

    this.metrics.renderingPerformance.forEach(records => {
      records.forEach(record => {
        if (record.fps < 30) drops++; // Consider < 30fps as dropped frames
      });
    });

    return drops;
  }

  getEdgeCount() {
    return this.metrics.edgeProcessing.size;
  }

  getAverageInteractionTime() {
    let totalTime = 0;
    let count = 0;

    this.metrics.userInteractions.forEach(records => {
      records.forEach(record => {
        totalTime += record.duration;
        count++;
      });
    });

    return count > 0 ? totalTime / count : 0;
  }

  getSlowInteractionCount() {
    let slowCount = 0;

    this.metrics.userInteractions.forEach(records => {
      records.forEach(record => {
        if (record.duration > this.thresholds.processingTime.warning) {
          slowCount++;
        }
      });
    });

    return slowCount;
  }

  /**
   * Trigger performance alert
   */
  triggerAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: performance.now(),
      severity: this.getAlertSeverity(type)
    };

    // Notify registered callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('🔍 EdgePerformanceMonitor: Alert callback error:', error);
      }
    });

    console.warn(`🔍 EdgePerformanceMonitor: ${type}`, data);
  }

  getAlertSeverity(type) {
    const severityMap = {
      edge_performance_critical: 'high',
      memory_usage_high: 'medium',
      worker_queue_high: 'high'
    };
    
    return severityMap[type] || 'low';
  }

  /**
   * Register alert callback
   */
  onAlert(callback) {
    this.alertCallbacks.add(callback);
    
    return () => {
      this.alertCallbacks.delete(callback);
    };
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const metrics = this.getAggregatedMetrics();
    const recommendations = this.getOptimizationRecommendations();
    
    return {
      timestamp: performance.now(),
      uptime: performance.now() - this.startTime,
      metrics,
      recommendations,
      summary: {
        overallHealth: this.getOverallHealthScore(metrics),
        criticalIssues: recommendations.filter(r => r.priority === 'high').length,
        totalEdges: this.getEdgeCount(),
        memoryEfficiency: this.getMemoryEfficiency(metrics)
      }
    };
  }

  getOverallHealthScore(metrics) {
    let score = 100;
    
    // Deduct points for performance issues
    if (metrics.processingTime.average > this.thresholds.processingTime.warning) score -= 20;
    if (metrics.memoryUsage.current > this.thresholds.memoryUsage.warning) score -= 15;
    if (metrics.workerPerformance.averageQueueSize > this.thresholds.workerQueue.warning) score -= 15;
    if (metrics.rendering.averageFPS < 30) score -= 25;
    if (metrics.interactions.averageResponseTime > this.thresholds.processingTime.warning) score -= 15;
    
    return Math.max(0, score);
  }

  getMemoryEfficiency(metrics) {
    const efficiency = 100 - (metrics.memoryUsage.current / this.thresholds.memoryUsage.critical * 100);
    return Math.max(0, Math.min(100, efficiency));
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.edgeProcessing.clear();
    this.metrics.workerTasks.clear();
    this.metrics.renderingPerformance.clear();
    this.metrics.memoryUsage.clear();
    this.metrics.userInteractions.clear();
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopMonitoring();
    this.clearMetrics();
    this.alertCallbacks.clear();
  }
}

// Create singleton instance
const edgePerformanceMonitor = new EdgePerformanceMonitor();

export default edgePerformanceMonitor;