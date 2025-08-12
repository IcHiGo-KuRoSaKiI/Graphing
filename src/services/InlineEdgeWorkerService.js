/**
 * InlineEdgeWorkerService - Self-contained Web Worker for Edge Processing
 * Creates workers dynamically from inline code, eliminating external file dependencies
 */

// Inline worker code (the entire worker logic)
const WORKER_CODE = `
/**
 * Orthogonal Edge Processing Web Worker
 * Handles intelligent waypoint optimization, segment intersection detection,
 * and smart pathfinding for Draw.io-style orthogonal edges
 */

// Worker state
let workerState = {
  isProcessing: false,
  cache: new Map(),
  performanceMetrics: {
    totalProcessingTime: 0,
    operationsCount: 0,
    cacheHits: 0
  }
};

// Utility functions
const createCacheKey = (edge, nodes) => {
  const edgeKey = \`\${edge.id}-\${edge.source}-\${edge.target}-\${JSON.stringify(edge.waypoints || [])}\`;
  const nodePositions = nodes.map(n => \`\${n.id}:\${n.position.x},\${n.position.y}\`).join('|');
  return \`\${edgeKey}-\${nodePositions}\`;
};

const getNodeBounds = (node) => ({
  x: node.position.x,
  y: node.position.y,
  width: node.width || 150,
  height: node.height || 60,
  right: (node.position.x) + (node.width || 150),
  bottom: (node.position.y) + (node.height || 60)
});

const getConnectionPoint = (node, position) => {
  const bounds = getNodeBounds(node);
  switch (position) {
    case 'top': return { x: bounds.x + bounds.width / 2, y: bounds.y };
    case 'right': return { x: bounds.right, y: bounds.y + bounds.height / 2 };
    case 'bottom': return { x: bounds.x + bounds.width / 2, y: bounds.bottom };
    case 'left': return { x: bounds.x, y: bounds.y + bounds.height / 2 };
    default: return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  }
};

// Draw.io-style connection point calculation
const calculateOptimalConnectionPoint = (node, targetPoint, sourcePoint) => {
  if (!node) return null;
  
  const bounds = getNodeBounds(node);
  const center = { 
    x: bounds.x + bounds.width / 2, 
    y: bounds.y + bounds.height / 2 
  };
  
  // Calculate which side is closest to the target
  const dx = targetPoint.x - center.x;
  const dy = targetPoint.y - center.y;
  
  // Add margin for better visual appearance (draw.io style)
  const margin = 5;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      return { x: bounds.right + margin, y: center.y };
    } else {
      return { x: bounds.x - margin, y: center.y };
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      return { x: center.x, y: bounds.bottom + margin };
    } else {
      return { x: center.x, y: bounds.y - margin };
    }
  }
};

// Core algorithms

/**
 * Intelligent Waypoint Optimization
 * Removes redundant waypoints and optimizes path
 */
const optimizeWaypoints = (waypoints, sourcePoint, targetPoint) => {
  if (!waypoints || waypoints.length <= 1) return waypoints;

  const allPoints = [sourcePoint, ...waypoints, targetPoint];
  const optimized = [sourcePoint];

  for (let i = 1; i < allPoints.length - 1; i++) {
    const prev = optimized[optimized.length - 1];
    const current = allPoints[i];
    const next = allPoints[i + 1];

    // Check if current point is necessary for orthogonality
    const needsPoint = !isRedundantPoint(prev, current, next);
    
    if (needsPoint) {
      optimized.push(current);
    }
  }

  optimized.push(targetPoint);
  return optimized.slice(1, -1); // Return only waypoints
};

const isRedundantPoint = (p1, p2, p3) => {
  const threshold = 5;
  
  // Check if points are collinear (same line)
  const isHorizontalLine = Math.abs(p1.y - p2.y) < threshold && Math.abs(p2.y - p3.y) < threshold;
  const isVerticalLine = Math.abs(p1.x - p2.x) < threshold && Math.abs(p2.x - p3.x) < threshold;
  
  return isHorizontalLine || isVerticalLine;
};

/**
 * Draw.io-style Segment Intersection Detection & Merging
 * Detects overlapping segments and creates shared waypoints
 */
const detectSegmentIntersections = (edges, nodes) => {
  const intersections = new Map();
  
  edges.forEach((edge, edgeIndex) => {
    const segments = getEdgeSegments(edge, nodes);
    
    segments.forEach((segment, segmentIndex) => {
      const segmentId = \`\${edge.id}-\${segmentIndex}\`;
      segment.edgeId = edge.id;
      segment.segmentIndex = segmentIndex;
      segment.mark = 1 << segmentIndex;
      
      // Check intersections with other segments (draw.io style)
      edges.forEach((otherEdge, otherEdgeIndex) => {
        if (edgeIndex >= otherEdgeIndex) return;
        
        const otherSegments = getEdgeSegments(otherEdge, nodes);
        otherSegments.forEach((otherSegment, otherSegmentIndex) => {
          const intersection = findSegmentIntersection(segment, otherSegment);
          if (intersection) {
            const key = \`\${intersection.x},\${intersection.y}\`;
            if (!intersections.has(key)) {
              intersections.set(key, {
                point: intersection,
                segments: []
              });
            }
            intersections.get(key).segments.push({
              edgeId: edge.id,
              segmentIndex,
              mark: segment.mark
            });
            intersections.get(key).segments.push({
              edgeId: otherEdge.id,
              segmentIndex: otherSegmentIndex,
              mark: 1 << otherSegmentIndex
            });
          }
        });
      });
    });
  });
  
  return intersections;
};

/**
 * Enhanced intersection detection with draw.io-style overlap detection
 */
const detectAdvancedIntersections = (edges, nodes) => {
  const intersections = new Map();
  
  edges.forEach((edge, edgeIndex) => {
    const segments = getEdgeSegments(edge, nodes);
    
    segments.forEach((segment, segmentIndex) => {
      // Check for overlapping segments (draw.io style)
      edges.forEach((otherEdge, otherEdgeIndex) => {
        if (edgeIndex >= otherEdgeIndex) return;
        
        const otherSegments = getEdgeSegments(otherEdge, nodes);
        otherSegments.forEach((otherSegment, otherSegmentIndex) => {
          const intersection = findSegmentOverlap(segment, otherSegment);
          if (intersection) {
            // Merge overlapping segments for cleaner routing
            mergeOverlappingSegments(segment, otherSegment, intersection);
          }
        });
      });
    });
  });
  
  return intersections;
};

const findSegmentOverlap = (seg1, seg2) => {
  // Check if segments overlap significantly
  const tolerance = 10;
  
  if (seg1.isHorizontal && seg2.isHorizontal) {
    // Both horizontal - check for vertical overlap
    if (Math.abs(seg1.start.y - seg2.start.y) < tolerance) {
      const overlap = getHorizontalOverlap(seg1, seg2);
      if (overlap) {
        return { x: overlap.x, y: seg1.start.y, type: 'horizontal' };
      }
    }
  } else if (seg1.isVertical && seg2.isVertical) {
    // Both vertical - check for horizontal overlap
    if (Math.abs(seg1.start.x - seg2.start.x) < tolerance) {
      const overlap = getVerticalOverlap(seg1, seg2);
      if (overlap) {
        return { x: seg1.start.x, y: overlap.y, type: 'vertical' };
      }
    }
  }
  
  return null;
};

const getHorizontalOverlap = (seg1, seg2) => {
  const start1 = Math.min(seg1.start.x, seg1.end.x);
  const end1 = Math.max(seg1.start.x, seg1.end.x);
  const start2 = Math.min(seg2.start.x, seg2.end.x);
  const end2 = Math.max(seg2.start.x, seg2.end.x);
  
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  
  if (overlapStart < overlapEnd) {
    return { x: (overlapStart + overlapEnd) / 2 };
  }
  
  return null;
};

const getVerticalOverlap = (seg1, seg2) => {
  const start1 = Math.min(seg1.start.y, seg1.end.y);
  const end1 = Math.max(seg1.start.y, seg1.end.y);
  const start2 = Math.min(seg2.start.y, seg2.end.y);
  const end2 = Math.max(seg2.start.y, seg2.end.y);
  
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  
  if (overlapStart < overlapEnd) {
    return { y: (overlapStart + overlapEnd) / 2 };
  }
  
  return null;
};

const mergeOverlappingSegments = (seg1, seg2, intersection) => {
  // Mark segments for merging
  seg1.mergePoint = intersection;
  seg2.mergePoint = intersection;
};

const getEdgeSegments = (edge, nodes) => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  
  if (!sourceNode || !targetNode) return [];
  
  const sourcePoint = getConnectionPoint(sourceNode, edge.sourceHandle);
  const targetPoint = getConnectionPoint(targetNode, edge.targetHandle);
  const waypoints = edge.data?.waypoints || [];
  
  const allPoints = [sourcePoint, ...waypoints, targetPoint];
  const segments = [];
  
  for (let i = 0; i < allPoints.length - 1; i++) {
    segments.push({
      start: allPoints[i],
      end: allPoints[i + 1],
      isHorizontal: Math.abs(allPoints[i].y - allPoints[i + 1].y) < 5,
      isVertical: Math.abs(allPoints[i].x - allPoints[i + 1].x) < 5
    });
  }
  
  return segments;
};

const findSegmentIntersection = (seg1, seg2) => {
  // Check if one segment is horizontal and the other is vertical
  if (seg1.isHorizontal && seg2.isVertical) {
    const y = seg1.start.y;
    const x = seg2.start.x;
    
    // Check if intersection point is within both segments
    const withinSeg1 = x >= Math.min(seg1.start.x, seg1.end.x) && 
                      x <= Math.max(seg1.start.x, seg1.end.x);
    const withinSeg2 = y >= Math.min(seg2.start.y, seg2.end.y) && 
                      y <= Math.max(seg2.start.y, seg2.end.y);
    
    if (withinSeg1 && withinSeg2) {
      return { x, y };
    }
  }
  
  if (seg1.isVertical && seg2.isHorizontal) {
    const x = seg1.start.x;
    const y = seg2.start.y;
    
    const withinSeg1 = y >= Math.min(seg1.start.y, seg1.end.y) && 
                      y <= Math.max(seg1.start.y, seg1.end.y);
    const withinSeg2 = x >= Math.min(seg2.start.x, seg2.end.x) && 
                      x <= Math.max(seg2.start.x, seg2.end.x);
    
    if (withinSeg1 && withinSeg2) {
      return { x, y };
    }
  }
  
  return null;
};

/**
 * Smart Pathfinding with Obstacle Avoidance
 * Calculates optimal orthogonal path avoiding node obstacles
 */
const calculateSmartPath = (sourcePoint, targetPoint, nodes, edge) => {
  const obstacles = nodes.filter(n => n.id !== edge.source && n.id !== edge.target)
                         .map(getNodeBounds);
  
  // Use A* pathfinding for optimal routing
  const path = aStarPathfinding(sourcePoint, targetPoint, obstacles);
  
  if (path && path.length > 2) {
    return path.slice(1, -1); // Return only waypoints
  }
  
  // Fallback to simple orthogonal routing
  return calculateSimpleOrthogonalPath(sourcePoint, targetPoint);
};

const aStarPathfinding = (start, end, obstacles) => {
  // Enhanced A* implementation for orthogonal pathfinding
  const GRID_SIZE = 20;
  const startGrid = { x: Math.floor(start.x / GRID_SIZE), y: Math.floor(start.y / GRID_SIZE) };
  const endGrid = { x: Math.floor(end.x / GRID_SIZE), y: Math.floor(end.y / GRID_SIZE) };
  
  const openSet = [{ ...startGrid, f: 0, g: 0, h: manhattanDistance(startGrid, endGrid), parent: null }];
  const closedSet = new Set();
  const visited = new Map();
  
  while (openSet.length > 0) {
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const currentKey = \`\${current.x},\${current.y}\`;
    
    if (current.x === endGrid.x && current.y === endGrid.y) {
      // Reconstruct path
      const path = [];
      let node = current;
      while (node) {
        path.unshift({ x: node.x * GRID_SIZE, y: node.y * GRID_SIZE });
        node = node.parent;
      }
      return path;
    }
    
    closedSet.add(currentKey);
    
    // Check neighbors (4-directional for orthogonal routing)
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];
    
    for (const neighbor of neighbors) {
      const neighborKey = \`\${neighbor.x},\${neighbor.y}\`;
      if (closedSet.has(neighborKey)) continue;
      
      const realPoint = { x: neighbor.x * GRID_SIZE, y: neighbor.y * GRID_SIZE };
      if (isPointInObstacle(realPoint, obstacles)) continue;
      
      const g = current.g + 1;
      const h = manhattanDistance(neighbor, endGrid);
      const f = g + h;
      
      const existingNode = visited.get(neighborKey);
      if (!existingNode || g < existingNode.g) {
        const neighborNode = { ...neighbor, f, g, h, parent: current };
        visited.set(neighborKey, neighborNode);
        openSet.push(neighborNode);
      }
    }
  }
  
  return null; // No path found
};

const manhattanDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const isPointInObstacle = (point, obstacles) => {
  const MARGIN = 10;
  return obstacles.some(obstacle => 
    point.x >= obstacle.x - MARGIN &&
    point.x <= obstacle.right + MARGIN &&
    point.y >= obstacle.y - MARGIN &&
    point.y <= obstacle.bottom + MARGIN
  );
};

const calculateSimpleOrthogonalPath = (sourcePoint, targetPoint) => {
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal first
    const midX = sourcePoint.x + dx / 2;
    return [
      { x: midX, y: sourcePoint.y },
      { x: midX, y: targetPoint.y }
    ];
  } else {
    // Vertical first
    const midY = sourcePoint.y + dy / 2;
    return [
      { x: sourcePoint.x, y: midY },
      { x: targetPoint.x, y: midY }
    ];
  }
};

/**
 * Virtual Bend Points Calculation
 * Calculates positions for virtual bend points that can be clicked to add waypoints
 */
const calculateVirtualBends = (edge, nodes) => {
  const segments = getEdgeSegments(edge, nodes);
  const virtualBends = [];
  
  segments.forEach((segment, index) => {
    const midPoint = {
      x: (segment.start.x + segment.end.x) / 2,
      y: (segment.start.y + segment.end.y) / 2,
      segmentIndex: index,
      isVirtual: true
    };
    virtualBends.push(midPoint);
  });
  
  return virtualBends;
};

// Main processing function
const processEdge = (edgeData) => {
  const startTime = performance.now();
  
  try {
    const { edge, nodes, operation } = edgeData;
    
    // Check cache
    const cacheKey = createCacheKey(edge, nodes);
    if (workerState.cache.has(cacheKey)) {
      workerState.performanceMetrics.cacheHits++;
      return workerState.cache.get(cacheKey);
    }
    
    let result = {};
    
    switch (operation) {
      case 'optimizeWaypoints': {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        const sourcePoint = getConnectionPoint(sourceNode, edge.sourceHandle);
        const targetPoint = getConnectionPoint(targetNode, edge.targetHandle);
        
        result.waypoints = optimizeWaypoints(edge.data?.waypoints, sourcePoint, targetPoint);
        break;
      }
      
      case 'calculatePath': {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        const sourcePoint = getConnectionPoint(sourceNode, edge.sourceHandle);
        const targetPoint = getConnectionPoint(targetNode, edge.targetHandle);
        
        result.waypoints = calculateSmartPath(sourcePoint, targetPoint, nodes, edge);
        break;
      }
      
      case 'calculateVirtualBends': {
        result.virtualBends = calculateVirtualBends(edge, nodes);
        break;
      }
      
      case 'detectIntersections': {
        const intersections = detectSegmentIntersections([edge], nodes);
        result.intersections = Array.from(intersections.values());
        break;
      }
      
      case 'detectAdvancedIntersections': {
        const intersections = detectAdvancedIntersections([edge], nodes);
        result.intersections = Array.from(intersections.values());
        break;
      }
      
      default:
        throw new Error(\`Unknown operation: \${operation}\`);
    }
    
    // Cache result
    workerState.cache.set(cacheKey, result);
    
    // Clean cache if it gets too large
    if (workerState.cache.size > 1000) {
      const oldestKeys = Array.from(workerState.cache.keys()).slice(0, 200);
      oldestKeys.forEach(key => workerState.cache.delete(key));
    }
    
    const endTime = performance.now();
    workerState.performanceMetrics.totalProcessingTime += (endTime - startTime);
    workerState.performanceMetrics.operationsCount++;
    
    return result;
    
  } catch (error) {
    return { error: error.message };
  }
};

// Batch processing for multiple edges
const processBatchEdges = (batchData) => {
  const { edges, nodes } = batchData;
  const results = [];
  
  // Use advanced intersection detection for batch processing
  const intersections = detectAdvancedIntersections(edges, nodes);
  
  for (const edge of edges) {
    const result = processEdge({ edge, nodes, operation: 'optimizeWaypoints' });
    result.intersections = Array.from(intersections.values()).filter(intersection =>
      intersection.segments.some(seg => seg.edgeId === edge.id)
    );
    results.push({ edgeId: edge.id, ...result });
  }
  
  return results;
};

// Worker message handler
self.addEventListener('message', (event) => {
  const { type, data, taskId } = event.data;
  
  workerState.isProcessing = true;
  
  try {
    let result;
    
    switch (type) {
      case 'PROCESS_EDGE':
        result = processEdge(data);
        break;
      
      case 'PROCESS_BATCH':
        result = processBatchEdges(data);
        break;
      
      case 'GET_PERFORMANCE_METRICS':
        result = { ...workerState.performanceMetrics };
        break;
      
      case 'CLEAR_CACHE':
        workerState.cache.clear();
        result = { success: true };
        break;
      
      default:
        throw new Error(\`Unknown message type: \${type}\`);
    }
    
    self.postMessage({
      type: 'SUCCESS',
      taskId,
      result
    });
    
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      taskId,
      error: error.message
    });
  } finally {
    workerState.isProcessing = false;
  }
});

// Worker initialization
self.postMessage({
  type: 'WORKER_READY',
  message: 'Orthogonal Edge Worker initialized successfully'
});
`;

class InlineEdgeWorkerService {
  constructor(options = {}) {
    this.worker = null;
    this.taskQueue = new Map();
    this.isInitialized = false;
    this.taskIdCounter = 0;
    this.hasWarnedAboutWorker = false;
    this.useWorker = options.useWorker !== false;
    this.performanceMetrics = {
      totalTasks: 0,
      avgProcessingTime: 0,
      errorCount: 0,
      cacheHitRate: 0
    };
    
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
      console.log('🔧 InlineEdgeWorkerService: Web Worker disabled - using synchronous fallback processing');
    }
  }
  
  /**
   * Create worker from inline code
   */
  createInlineWorker() {
    try {
      // Create a blob URL from the worker code
      const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      // Create the worker
      const worker = new Worker(workerUrl);
      
      // Clean up the blob URL after worker creation
      setTimeout(() => URL.revokeObjectURL(workerUrl), 1000);
      
      return worker;
    } catch (error) {
      console.error('❌ InlineEdgeWorkerService: Failed to create inline worker:', error);
      return null;
    }
  }
  
  /**
   * Initialize the Web Worker
   */
  async initWorker() {
    try {
      console.log('🔧 InlineEdgeWorkerService: Creating inline worker...');
      
      this.worker = this.createInlineWorker();
      
      if (!this.worker) {
        throw new Error('Failed to create worker');
      }
      
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));
      
      // Wait for worker to be ready
      const isReady = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('⚠️ InlineEdgeWorkerService: Worker timeout');
          reject(new Error('Worker initialization timeout'));
        }, 3000);
        
        const handleReady = (event) => {
          if (event.data.type === 'WORKER_READY') {
            clearTimeout(timeout);
            this.worker.removeEventListener('message', handleReady);
            this.isInitialized = true;
            console.log('🚀 InlineEdgeWorkerService: Worker initialized successfully');
            resolve(true);
          }
        };
        
        this.worker.addEventListener('message', handleReady);
      });
      
      if (isReady) {
        return; // Successfully initialized
      }
      
    } catch (error) {
      console.warn('⚠️ InlineEdgeWorkerService: Failed to initialize worker:', error.message);
      this.isInitialized = false;
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
    console.error('❌ InlineEdgeWorkerService: Worker error:', error);
    
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
      console.log('⚠️ InlineEdgeWorkerService: Worker restart skipped - already using fallback processing');
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
        console.warn('⚠️ InlineEdgeWorkerService: Worker not available - using fallback processing for all operations');
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
        console.warn('⚠️ InlineEdgeWorkerService: Chunk processing failed, using fallback:', error.message);
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
      console.warn('⚠️ InlineEdgeWorkerService: Failed to optimize waypoints, using fallback:', error.message);
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
      console.warn('⚠️ InlineEdgeWorkerService: Failed to calculate smart path, using fallback:', error.message);
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
      console.warn('⚠️ InlineEdgeWorkerService: Failed to calculate virtual bends, using fallback:', error.message);
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
      console.warn('⚠️ InlineEdgeWorkerService: Failed to detect intersections, using fallback:', error.message);
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
      console.error('❌ InlineEdgeWorkerService: Failed to clear cache:', error);
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

// Create singleton instance
const shouldUseWorker = typeof window !== 'undefined' ? 
  window.__GRAPHING_USE_WORKER__ !== false : true;

const inlineEdgeWorkerService = new InlineEdgeWorkerService({ useWorker: shouldUseWorker });

export default inlineEdgeWorkerService;
