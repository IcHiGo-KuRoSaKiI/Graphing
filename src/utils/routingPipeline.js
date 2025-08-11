import { calculateOrthogonalRoute, calculateRouteWithObstacles } from './routingAlgorithms.js';
import { modelToView, viewToModel } from './coordinateTransforms.js';
import { snapPoint } from './gridSnapping.js';

/**
 * @typedef {Object} RoutingPipelineContext
 * @property {Object} sourceNode - Source node
 * @property {Object} targetNode - Target node
 * @property {Object} sourcePort - Source port configuration
 * @property {Object} targetPort - Target port configuration
 * @property {Object} transform - Current view transform
 * @property {Object} gridConfig - Grid configuration
 * @property {Array<Object>} obstacles - Array of obstacle nodes
 * @property {boolean} avoidObstacles - Whether to avoid obstacles
 */

/**
 * @typedef {Object} RoutingPipelineResult
 * @property {Array<{x: number, y: number}>} modelPoints - Route points in model coordinates
 * @property {Array<{x: number, y: number}>} viewPoints - Route points in view coordinates
 * @property {Array<string>} sides - Array of sides for each point
 * @property {string} pattern - Pattern name used
 * @property {boolean} success - Whether routing was successful
 * @property {Array<Object>} metadata - Additional routing metadata
 */

/**
 * Complete routing pipeline for orthogonal edges
 * @param {RoutingPipelineContext} context - Routing context
 * @returns {RoutingPipelineResult} Routing result
 */
export function routeOrthogonalEdge(context) {
  const {
    sourceNode,
    targetNode,
    sourcePort,
    targetPort,
    transform,
    gridConfig,
    obstacles = [],
    avoidObstacles = true
  } = context;

  try {
    // Step 1: Validate inputs
    const validation = validateRoutingInputs(context);
    if (!validation.valid) {
      return {
        modelPoints: [],
        viewPoints: [],
        sides: [],
        pattern: null,
        success: false,
        metadata: { error: validation.error }
      };
    }

    // Step 2: Calculate route in model coordinates
    const routingContext = {
      sourceNode,
      targetNode,
      sourcePort,
      targetPort,
      transform,
      gridConfig
    };

    let routeResult;
    if (avoidObstacles && obstacles.length > 0) {
      routeResult = calculateRouteWithObstacles(routingContext, obstacles);
    } else {
      routeResult = calculateOrthogonalRoute(routingContext);
    }

    if (!routeResult.success) {
      return {
        modelPoints: [],
        viewPoints: [],
        sides: [],
        pattern: routeResult.pattern,
        success: false,
        metadata: { error: 'Routing calculation failed' }
      };
    }

    // Step 3: Apply grid snapping to model points
    const snappedModelPoints = routeResult.points.map(point => 
      gridConfig?.enabled ? snapPoint(point, gridConfig) : point
    );

    // Step 4: Transform model points to view coordinates
    const viewPoints = snappedModelPoints.map(point => 
      modelToView(point, transform)
    );

    // Step 5: Generate metadata
    const metadata = generateRoutingMetadata(context, routeResult, snappedModelPoints);

    return {
      modelPoints: snappedModelPoints,
      viewPoints,
      sides: routeResult.sides,
      pattern: routeResult.pattern,
      success: true,
      metadata
    };

  } catch (error) {
    return {
      modelPoints: [],
      viewPoints: [],
      sides: [],
      pattern: null,
      success: false,
      metadata: { error: error.message }
    };
  }
}

/**
 * Validate routing pipeline inputs
 * @param {RoutingPipelineContext} context - Routing context
 * @returns {Object} Validation result {valid: boolean, error?: string}
 */
export function validateRoutingInputs(context) {
  const { sourceNode, targetNode, transform } = context;

  if (!sourceNode || !targetNode) {
    return { valid: false, error: 'Source and target nodes are required' };
  }

  if (!sourceNode.position || !sourceNode.position.x || !sourceNode.position.y || !sourceNode.width || !sourceNode.height) {
    return { valid: false, error: 'Source node must have valid position and dimensions' };
  }

  if (!targetNode.position || !targetNode.position.x || !targetNode.position.y || !targetNode.width || !targetNode.height) {
    return { valid: false, error: 'Target node must have valid position and dimensions' };
  }

  if (!transform || typeof transform.x !== 'number' || typeof transform.y !== 'number' || typeof transform.k !== 'number') {
    return { valid: false, error: 'Valid transform is required' };
  }

  // Check if nodes are the same
  if (sourceNode === targetNode) {
    return { valid: false, error: 'Source and target nodes cannot be the same' };
  }

  return { valid: true };
}

/**
 * Generate routing metadata
 * @param {RoutingPipelineContext} context - Routing context
 * @param {Object} routeResult - Route calculation result
 * @param {Array<Object>} modelPoints - Model points
 * @returns {Object} Metadata object
 */
export function generateRoutingMetadata(context, routeResult, modelPoints) {
  const { sourceNode, targetNode, obstacles, avoidObstacles } = context;

  // Calculate route statistics
  const totalDistance = calculateRouteDistance(modelPoints);
  const segmentCount = Math.max(0, modelPoints.length - 1);
  
  // Calculate bounding box
  const minX = Math.min(...modelPoints.map(p => p.x));
  const maxX = Math.max(...modelPoints.map(p => p.x));
  const minY = Math.min(...modelPoints.map(p => p.y));
  const maxY = Math.max(...modelPoints.map(p => p.y));

  return {
    totalDistance,
    segmentCount,
    boundingBox: { minX, maxX, minY, maxY },
    pattern: routeResult.pattern,
    obstacleCount: obstacles?.length || 0,
    obstacleAvoidance: avoidObstacles,
    timestamp: Date.now()
  };
}

/**
 * Calculate total distance of a route
 * @param {Array<Object>} points - Route points
 * @returns {number} Total distance
 */
export function calculateRouteDistance(points) {
  if (points.length < 2) {
    return 0;
  }

  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  return totalDistance;
}

/**
 * Update route when nodes move
 * @param {RoutingPipelineResult} originalRoute - Original route result
 * @param {Object} sourceNode - Updated source node
 * @param {Object} targetNode - Updated target node
 * @param {RoutingPipelineContext} context - Updated routing context
 * @returns {RoutingPipelineResult} Updated route result
 */
export function updateRoute(originalRoute, sourceNode, targetNode, context) {
  // If nodes haven't moved significantly, return original route
  if (!hasNodesMovedSignificantly(originalRoute, sourceNode, targetNode, context)) {
    return originalRoute;
  }

  // Recalculate route with updated nodes
  const updatedContext = {
    ...context,
    sourceNode,
    targetNode
  };

  return routeOrthogonalEdge(updatedContext);
}

/**
 * Check if nodes have moved significantly enough to warrant route recalculation
 * @param {RoutingPipelineResult} route - Current route
 * @param {Object} sourceNode - Current source node
 * @param {Object} targetNode - Current target node
 * @param {RoutingPipelineContext} context - Routing context
 * @returns {boolean} True if nodes have moved significantly
 */
export function hasNodesMovedSignificantly(route, sourceNode, targetNode, context) {
  if (!route.success || route.modelPoints.length === 0) {
    return true;
  }

  const tolerance = context.gridConfig?.tolerance || 5;
  
  // Check if source or target anchor points have moved significantly
  const sourceAnchor = route.modelPoints[0];
  const targetAnchor = route.modelPoints[route.modelPoints.length - 1];

  const sourceMoved = Math.abs(sourceAnchor.x - sourceNode.position.x) > tolerance ||
                     Math.abs(sourceAnchor.y - sourceNode.position.y) > tolerance;
  
  const targetMoved = Math.abs(targetAnchor.x - targetNode.position.x) > tolerance ||
                     Math.abs(targetAnchor.y - targetNode.position.y) > tolerance;

  return sourceMoved || targetMoved;
}

/**
 * Optimize route for better visual appearance
 * @param {RoutingPipelineResult} route - Route to optimize
 * @param {RoutingPipelineContext} context - Routing context
 * @returns {RoutingPipelineResult} Optimized route
 */
export function optimizeRoute(route, context) {
  if (!route.success || route.modelPoints.length < 3) {
    return route;
  }

  const { gridConfig } = context;
  const optimizedPoints = [...route.modelPoints];

  // Remove redundant points (points that are too close together)
  const minDistance = gridConfig?.size || 20;
  for (let i = optimizedPoints.length - 2; i > 0; i--) {
    const prev = optimizedPoints[i - 1];
    const curr = optimizedPoints[i];
    const next = optimizedPoints[i + 1];

    const dist1 = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
    const dist2 = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);

    if (dist1 < minDistance && dist2 < minDistance) {
      optimizedPoints.splice(i, 1);
    }
  }

  // Transform optimized points to view coordinates
  const optimizedViewPoints = optimizedPoints.map(point => 
    modelToView(point, context.transform)
  );

  return {
    ...route,
    modelPoints: optimizedPoints,
    viewPoints: optimizedViewPoints,
    metadata: {
      ...route.metadata,
      optimized: true,
      originalPointCount: route.modelPoints.length,
      optimizedPointCount: optimizedPoints.length
    }
  };
}

/**
 * Create a routing context from basic parameters
 * @param {Object} sourceNode - Source node
 * @param {Object} targetNode - Target node
 * @param {Object} transform - View transform
 * @param {Object} options - Additional options
 * @returns {RoutingPipelineContext} Routing context
 */
export function createRoutingContext(sourceNode, targetNode, transform, options = {}) {
  return {
    sourceNode,
    targetNode,
    sourcePort: options.sourcePort || null,
    targetPort: options.targetPort || null,
    transform,
    gridConfig: options.gridConfig || { enabled: true, size: 20, tolerance: 5 },
    obstacles: options.obstacles || [],
    avoidObstacles: options.avoidObstacles !== false
  };
}
