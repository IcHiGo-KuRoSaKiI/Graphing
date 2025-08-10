/**
 * EdgePerformanceMonitor - Advanced performance monitoring for edge processing
 * Tracks performance metrics and provides optimization recommendations
 */

class EdgePerformanceMonitor {
  constructor() {
    this.isMonitoring = false;
    this.metrics = {
      processingTimes: [],
      memoryUsage: [],
      cacheHitRates: [],
      workerLatency: [],
      renderTimes: [],
      totalOperations: 0,
      averageProcessingTime: 0,
      peakMemoryUsage: 0,
      averageCacheHitRate: 0,
      averageWorkerLatency: 0,
      averageRenderTime: 0
    };
    
    this.alerts = [];
    this.optimizationRecommendations = [];
    this.alertCallbacks = new Set();
    
    // Performance thresholds
    this.thresholds = {
      processingTime: 100, // ms
      memoryUsage: 50 * 1024 * 1024, // 50MB
      cacheHitRate: 0.3, // 30%
      workerLatency: 50, // ms
      renderTime: 16 // ms (60fps)
    };
    
    // Monitoring interval
    this.monitoringInterval = null;
    this.monitoringFrequency = 1000; // 1 second
    
    // Performance history for trend analysis
    this.history = {
      processingTimes: [],
      memoryUsage: [],
      cacheHitRates: [],
      workerLatency: [],
      renderTimes: []
    };
    
    // Maximum history size
    this.maxHistorySize = 100;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(options = {}) {
    if (this.isMonitoring) return;
    
    this.thresholds = { ...this.thresholds, ...options.thresholds };
    this.monitoringFrequency = options.frequency || this.monitoringFrequency;
    
    this.isMonitoring = true;
    
    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      this.checkAlerts();
    }, this.monitoringFrequency);
    
    console.log('📊 EdgePerformanceMonitor: Started monitoring');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('📊 EdgePerformanceMonitor: Stopped monitoring');
  }

  /**
   * Record processing time for an operation
   */
  recordProcessingTime(edgeId, processingTime, operation = 'unknown') {
    if (!this.isMonitoring) return;
    
    const metric = {
      edgeId,
      processingTime,
      operation,
      timestamp: Date.now()
    };
    
    this.metrics.processingTimes.push(metric);
    this.history.processingTimes.push(metric);
    
    // Keep history size manageable
    if (this.history.processingTimes.length > this.maxHistorySize) {
      this.history.processingTimes.shift();
    }
    
    // Update average
    this.updateAverageProcessingTime();
    
    // Check for performance issues
    if (processingTime > this.thresholds.processingTime) {
      this.createAlert('high_processing_time', {
        edgeId,
        processingTime,
        threshold: this.thresholds.processingTime,
        operation
      });
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(memoryUsage) {
    if (!this.isMonitoring) return;
    
    this.metrics.memoryUsage.push({
      memoryUsage,
      timestamp: Date.now()
    });
    
    this.history.memoryUsage.push({
      memoryUsage,
      timestamp: Date.now()
    });
    
    if (this.history.memoryUsage.length > this.maxHistorySize) {
      this.history.memoryUsage.shift();
    }
    
    // Update peak memory usage
    this.metrics.peakMemoryUsage = Math.max(this.metrics.peakMemoryUsage, memoryUsage);
    
    // Check for memory issues
    if (memoryUsage > this.thresholds.memoryUsage) {
      this.createAlert('high_memory_usage', {
        memoryUsage,
        threshold: this.thresholds.memoryUsage
      });
    }
  }

  /**
   * Record cache hit rate
   */
  recordCacheHitRate(cacheHitRate) {
    if (!this.isMonitoring) return;
    
    this.metrics.cacheHitRates.push({
      cacheHitRate,
      timestamp: Date.now()
    });
    
    this.history.cacheHitRates.push({
      cacheHitRate,
      timestamp: Date.now()
    });
    
    if (this.history.cacheHitRates.length > this.maxHistorySize) {
      this.history.cacheHitRates.shift();
    }
    
    // Update average
    this.updateAverageCacheHitRate();
    
    // Check for cache issues
    if (cacheHitRate < this.thresholds.cacheHitRate) {
      this.createAlert('low_cache_hit_rate', {
        cacheHitRate,
        threshold: this.thresholds.cacheHitRate
      });
    }
  }

  /**
   * Record worker latency
   */
  recordWorkerLatency(latency) {
    if (!this.isMonitoring) return;
    
    this.metrics.workerLatency.push({
      latency,
      timestamp: Date.now()
    });
    
    this.history.workerLatency.push({
      latency,
      timestamp: Date.now()
    });
    
    if (this.history.workerLatency.length > this.maxHistorySize) {
      this.history.workerLatency.shift();
    }
    
    // Update average
    this.updateAverageWorkerLatency();
    
    // Check for latency issues
    if (latency > this.thresholds.workerLatency) {
      this.createAlert('high_worker_latency', {
        latency,
        threshold: this.thresholds.workerLatency
      });
    }
  }

  /**
   * Record render time
   */
  recordRenderTime(renderTime) {
    if (!this.isMonitoring) return;
    
    this.metrics.renderTimes.push({
      renderTime,
      timestamp: Date.now()
    });
    
    this.history.renderTimes.push({
      renderTime,
      timestamp: Date.now()
    });
    
    if (this.history.renderTimes.length > this.maxHistorySize) {
      this.history.renderTimes.shift();
    }
    
    // Update average
    this.updateAverageRenderTime();
    
    // Check for render issues
    if (renderTime > this.thresholds.renderTime) {
      this.createAlert('high_render_time', {
        renderTime,
        threshold: this.thresholds.renderTime
      });
    }
  }

  /**
   * Collect current metrics
   */
  collectMetrics() {
    // Collect memory usage if available
    if (typeof performance !== 'undefined' && performance.memory) {
      this.recordMemoryUsage(performance.memory.usedJSHeapSize);
    }
    
    // Collect other system metrics
    this.metrics.totalOperations++;
  }

  /**
   * Analyze performance trends
   */
  analyzePerformance() {
    this.analyzeTrends();
    this.generateOptimizationRecommendations();
  }

  /**
   * Analyze performance trends
   */
  analyzeTrends() {
    const trends = {
      processingTime: this.calculateTrend(this.history.processingTimes, 'processingTime'),
      memoryUsage: this.calculateTrend(this.history.memoryUsage, 'memoryUsage'),
      cacheHitRate: this.calculateTrend(this.history.cacheHitRates, 'cacheHitRate'),
      workerLatency: this.calculateTrend(this.history.workerLatency, 'latency'),
      renderTime: this.calculateTrend(this.history.renderTimes, 'renderTime')
    };
    
    // Check for concerning trends
    Object.entries(trends).forEach(([metric, trend]) => {
      if (trend.direction === 'increasing' && trend.slope > 0.1) {
        this.createAlert('trend_warning', {
          metric,
          trend: trend.slope,
          direction: trend.direction
        });
      }
    });
  }

  /**
   * Calculate trend for a metric
   */
  calculateTrend(data, valueKey) {
    if (data.length < 2) return { direction: 'stable', slope: 0 };
    
    const recent = data.slice(-10); // Last 10 data points
    const values = recent.map(item => item[valueKey]);
    
    // Simple linear regression
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const direction = slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable';
    
    return { direction, slope: Math.abs(slope) };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations() {
    this.optimizationRecommendations = [];
    
    // Check processing time
    if (this.metrics.averageProcessingTime > this.thresholds.processingTime * 0.8) {
      this.optimizationRecommendations.push({
        action: 'enable_batching',
        priority: 'high',
        description: 'Enable batch processing to reduce individual operation overhead',
        impact: 'high'
      });
    }
    
    // Check cache hit rate
    if (this.metrics.averageCacheHitRate < this.thresholds.cacheHitRate) {
      this.optimizationRecommendations.push({
        action: 'clear_cache',
        priority: 'medium',
        description: 'Clear cache to improve hit rates',
        impact: 'medium'
      });
    }
    
    // Check memory usage
    if (this.metrics.peakMemoryUsage > this.thresholds.memoryUsage * 0.8) {
      this.optimizationRecommendations.push({
        action: 'reduce_batch_size',
        priority: 'high',
        description: 'Reduce batch size to lower memory usage',
        impact: 'high'
      });
    }
    
    // Check worker latency
    if (this.metrics.averageWorkerLatency > this.thresholds.workerLatency) {
      this.optimizationRecommendations.push({
        action: 'debounce_increase',
        priority: 'medium',
        description: 'Increase debounce time to reduce worker load',
        impact: 'medium'
      });
    }
    
    // Check render performance
    if (this.metrics.averageRenderTime > this.thresholds.renderTime) {
      this.optimizationRecommendations.push({
        action: 'optimize_rendering',
        priority: 'high',
        description: 'Optimize rendering by reducing visual effects',
        impact: 'high'
      });
    }
  }

  /**
   * Check for alerts
   */
  checkAlerts() {
    // Process any pending alerts
    while (this.alerts.length > 0) {
      const alert = this.alerts.shift();
      this.emitAlert(alert);
    }
  }

  /**
   * Create an alert
   */
  createAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: Date.now(),
      severity: this.getAlertSeverity(type)
    };
    
    this.alerts.push(alert);
  }

  /**
   * Get alert severity
   */
  getAlertSeverity(type) {
    const severityMap = {
      high_processing_time: 'warning',
      high_memory_usage: 'error',
      low_cache_hit_rate: 'warning',
      high_worker_latency: 'warning',
      high_render_time: 'error',
      trend_warning: 'info'
    };
    
    return severityMap[type] || 'info';
  }

  /**
   * Emit alert to callbacks
   */
  emitAlert(alert) {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('❌ EdgePerformanceMonitor: Alert callback error:', error);
      }
    });
  }

  /**
   * Register alert callback
   */
  onAlert(callback) {
    this.alertCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.alertCallbacks.delete(callback);
    };
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    return [...this.optimizationRecommendations];
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const report = {
      summary: {
        totalOperations: this.metrics.totalOperations,
        averageProcessingTime: this.metrics.averageProcessingTime,
        peakMemoryUsage: this.metrics.peakMemoryUsage,
        averageCacheHitRate: this.metrics.averageCacheHitRate,
        averageWorkerLatency: this.metrics.averageWorkerLatency,
        averageRenderTime: this.metrics.averageRenderTime
      },
      trends: {
        processingTime: this.calculateTrend(this.history.processingTimes, 'processingTime'),
        memoryUsage: this.calculateTrend(this.history.memoryUsage, 'memoryUsage'),
        cacheHitRate: this.calculateTrend(this.history.cacheHitRates, 'cacheHitRate'),
        workerLatency: this.calculateTrend(this.history.workerLatency, 'latency'),
        renderTime: this.calculateTrend(this.history.renderTimes, 'renderTime')
      },
      recommendations: this.optimizationRecommendations,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      thresholds: this.thresholds,
      isMonitoring: this.isMonitoring
    };
    
    return report;
  }

  /**
   * Update average processing time
   */
  updateAverageProcessingTime() {
    const times = this.metrics.processingTimes.map(m => m.processingTime);
    this.metrics.averageProcessingTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Update average cache hit rate
   */
  updateAverageCacheHitRate() {
    const rates = this.metrics.cacheHitRates.map(m => m.cacheHitRate);
    this.metrics.averageCacheHitRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  }

  /**
   * Update average worker latency
   */
  updateAverageWorkerLatency() {
    const latencies = this.metrics.workerLatency.map(m => m.latency);
    this.metrics.averageWorkerLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
  }

  /**
   * Update average render time
   */
  updateAverageRenderTime() {
    const times = this.metrics.renderTimes.map(m => m.renderTime);
    this.metrics.averageRenderTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      processingTimes: [],
      memoryUsage: [],
      cacheHitRates: [],
      workerLatency: [],
      renderTimes: [],
      totalOperations: 0,
      averageProcessingTime: 0,
      peakMemoryUsage: 0,
      averageCacheHitRate: 0,
      averageWorkerLatency: 0,
      averageRenderTime: 0
    };
    
    this.history = {
      processingTimes: [],
      memoryUsage: [],
      cacheHitRates: [],
      workerLatency: [],
      renderTimes: []
    };
    
    this.alerts = [];
    this.optimizationRecommendations = [];
    
    console.log('📊 EdgePerformanceMonitor: Metrics reset');
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopMonitoring();
    this.alertCallbacks.clear();
    this.reset();
  }
}

// Create singleton instance
const edgePerformanceMonitor = new EdgePerformanceMonitor();

export default edgePerformanceMonitor;