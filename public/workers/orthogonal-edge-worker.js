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
  const edgeKey = `${edge.id}-${edge.source}-${edge.target}-${JSON.stringify(edge.waypoints || [])}`;
  const nodePositions = nodes.map(n => `${n.id}:${n.position.x},${n.position.y}`).join('|');
  return `${edgeKey}-${nodePositions}`;
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
 * Segment Intersection Detection & Merging
 * Detects overlapping segments and creates shared waypoints
 */
const detectSegmentIntersections = (edges, nodes) => {
  const intersections = new Map();
  
  edges.forEach((edge, edgeIndex) => {
    const segments = getEdgeSegments(edge, nodes);
    
    segments.forEach((segment, segmentIndex) => {
      const segmentId = `${edge.id}-${segmentIndex}`;
      segment.edgeId = edge.id;
      segment.segmentIndex = segmentIndex;
      segment.mark = 1 << segmentIndex;
      
      // Check intersections with other segments
      edges.forEach((otherEdge, otherEdgeIndex) => {
        if (edgeIndex >= otherEdgeIndex) return;
        
        const otherSegments = getEdgeSegments(otherEdge, nodes);
        otherSegments.forEach((otherSegment, otherSegmentIndex) => {
          const intersection = findSegmentIntersection(segment, otherSegment);
          if (intersection) {
            const key = `${intersection.x},${intersection.y}`;
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
  // Simplified A* implementation for orthogonal pathfinding
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
    const currentKey = `${current.x},${current.y}`;
    
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
      const neighborKey = `${neighbor.x},${neighbor.y}`;
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
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
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
  
  const intersections = detectSegmentIntersections(edges, nodes);
  
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
        throw new Error(`Unknown message type: ${type}`);
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