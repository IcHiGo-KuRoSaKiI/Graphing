import { SIDES } from './edgeTypes.js';
import { getAllPatterns, isLPattern, isSPattern } from './routePatterns.js';
import { anchorPoint } from './anchorPoint.js';
import { jettyEdgeEndpoints } from './jetty.js';

/**
 * @typedef {Object} RoutingContext
 * @property {Object} sourceNode - Source node
 * @property {Object} targetNode - Target node
 * @property {Object} sourcePort - Source port configuration
 * @property {Object} targetPort - Target port configuration
 * @property {Object} transform - Current view transform
 * @property {Object} gridConfig - Grid configuration
 */

/**
 * @typedef {Object} RoutingResult
 * @property {Array<{x: number, y: number}>} points - Array of route points
 * @property {Array<string>} sides - Array of sides for each point
 * @property {string} pattern - Pattern name used
 * @property {boolean} success - Whether routing was successful
 */

/**
 * Calculate the best route between two nodes using orthogonal routing
 * @param {RoutingContext} context - Routing context
 * @returns {RoutingResult} Routing result
 */
export function calculateOrthogonalRoute(context) {
  const { sourceNode, targetNode, sourcePort, targetPort, transform, gridConfig } = context;

  // Get anchor points
  const sourceAnchor = anchorPoint(sourceNode, sourcePort, { x: targetNode.position.x, y: targetNode.position.y });
  const targetAnchor = anchorPoint(targetNode, targetPort, { x: sourceNode.position.x, y: sourceNode.position.y });

  if (!sourceAnchor || !targetAnchor) {
    return {
      points: [],
      sides: [],
      pattern: null,
      success: false
    };
  }

  // Determine source and target sides
  const sourceSide = sourceAnchor.side;
  const targetSide = targetAnchor.side;

  if (!sourceSide || !targetSide) {
    return {
      points: [],
      sides: [],
      pattern: null,
      success: false
    };
  }

  // Get available patterns
  const patterns = getAllPatterns(sourceSide, targetSide);

  if (patterns.length === 0) {
    // Fallback to straight line
    return calculateStraightRoute(sourceAnchor.point, targetAnchor.point);
  }

  // Try L-shape patterns first, then S-shape
  const lPatterns = patterns.filter(isLPattern);
  const sPatterns = patterns.filter(isSPattern);

  // Try L-shape routing first
  if (lPatterns.length > 0) {
    const result = calculatePatternRoute(sourceAnchor, targetAnchor, lPatterns[0], context);
    if (result.success) {
      return result;
    }
  }

  // Try S-shape routing
  if (sPatterns.length > 0) {
    const result = calculatePatternRoute(sourceAnchor, targetAnchor, sPatterns[0], context);
    if (result.success) {
      return result;
    }
  }

  // Fallback to straight line
  return calculateStraightRoute(sourceAnchor.point, targetAnchor.point);
}

/**
 * Calculate route using a specific pattern
 * @param {Object} sourceAnchor - Source anchor point
 * @param {Object} targetAnchor - Target anchor point
 * @param {Object} pattern - Route pattern to use
 * @param {RoutingContext} context - Routing context
 * @returns {RoutingResult} Routing result
 */
export function calculatePatternRoute(sourceAnchor, targetAnchor, pattern, context) {
  const { sourceNode, targetNode, transform, gridConfig } = context;

  try {
    // Debug: Check if nodes are defined
    if (!sourceNode || !targetNode) {
      throw new Error('Source or target node is undefined');
    }

    // Convert relative pattern segments to absolute coordinates
    const points = pattern.segments.map((segment, index) => {
      const side = pattern.sides[index];
      
      if (index === 0) {
        // First point is source anchor
        return sourceAnchor.point;
      } else if (index === pattern.segments.length - 1) {
        // Last point is target anchor
        return targetAnchor.point;
      } else {
        // Intermediate points are calculated based on pattern
        return calculatePatternPoint(segment, side, sourceNode, targetNode, context);
      }
    });

    // Apply jetty to endpoints
    const jettiedPoints = jettyEdgeEndpoints(
      points[0],
      sourceAnchor.side,
      points[points.length - 1],
      targetAnchor.side
    );

    // Update first and last points with jetty
    points[0] = jettiedPoints.sourcePoint;
    points[points.length - 1] = jettiedPoints.targetPoint;

    // Snap points to grid
    const snappedPoints = points.map(point => 
      gridConfig?.enabled ? snapPointToGrid(point, gridConfig) : point
    );

    return {
      points: snappedPoints,
      sides: pattern.sides,
      pattern: pattern.name,
      success: true
    };
  } catch (error) {
    return {
      points: [],
      sides: [],
      pattern: pattern.name,
      success: false
    };
  }
}

/**
 * Calculate a pattern point based on relative coordinates and side
 * @param {Object} segment - Relative segment coordinates
 * @param {string} side - Side for this segment
 * @param {Object} sourceNode - Source node
 * @param {Object} targetNode - Target node
 * @param {RoutingContext} context - Routing context
 * @returns {Object} Absolute point coordinates
 */
export function calculatePatternPoint(segment, side, sourceNode, targetNode, context) {
  const { transform } = context;

  // Calculate bounding box of both nodes
  const minX = Math.min(sourceNode.position.x, targetNode.position.x);
  const maxX = Math.max(sourceNode.position.x + sourceNode.width, targetNode.position.x + targetNode.width);
  const minY = Math.min(sourceNode.position.y, targetNode.position.y);
  const maxY = Math.max(sourceNode.position.y + sourceNode.height, targetNode.position.y + targetNode.height);

  // Calculate center point
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Convert relative coordinates to absolute
  let x, y;

  if (side === SIDES.NORTH || side === SIDES.SOUTH) {
    // Vertical segment - x is relative to source node width
    x = sourceNode.position.x + segment.x * sourceNode.width;
    y = segment.y === 0.5 ? centerY : (segment.y < 0.5 ? minY : maxY);
  } else {
    // Horizontal segment - y is relative to source node height
    x = segment.x === 0.5 ? centerX : (segment.x < 0.5 ? minX : maxX);
    y = sourceNode.position.y + segment.y * sourceNode.height;
  }

  return { x, y };
}

/**
 * Calculate a straight line route between two points
 * @param {Object} sourcePoint - Source point
 * @param {Object} targetPoint - Target point
 * @returns {RoutingResult} Routing result
 */
export function calculateStraightRoute(sourcePoint, targetPoint) {
  return {
    points: [sourcePoint, targetPoint],
    sides: [null, null],
    pattern: 'straight',
    success: true
  };
}

/**
 * Snap a point to the grid
 * @param {Object} point - Point to snap
 * @param {Object} gridConfig - Grid configuration
 * @returns {Object} Snapped point
 */
export function snapPointToGrid(point, gridConfig) {
  const { size, tolerance } = gridConfig;
  
  const snappedX = Math.round(point.x / size) * size;
  const snappedY = Math.round(point.y / size) * size;

  // Only snap if within tolerance
  if (Math.abs(point.x - snappedX) <= tolerance && Math.abs(point.y - snappedY) <= tolerance) {
    return { x: snappedX, y: snappedY };
  }

  return point;
}

/**
 * Calculate route with obstacle avoidance
 * @param {RoutingContext} context - Routing context
 * @param {Array<Object>} obstacles - Array of obstacle nodes
 * @returns {RoutingResult} Routing result
 */
export function calculateRouteWithObstacles(context, obstacles) {
  // First try simple orthogonal routing
  const simpleRoute = calculateOrthogonalRoute(context);
  
  if (simpleRoute.success && !hasCollisions(simpleRoute.points, obstacles)) {
    return simpleRoute;
  }

  // If collision detected, try alternative patterns
  const { sourceNode, targetNode, sourcePort, targetPort, transform, gridConfig } = context;
  
  const sourceAnchor = anchorPoint(sourceNode, sourcePort, { x: targetNode.position.x, y: targetNode.position.y });
  const targetAnchor = anchorPoint(targetNode, targetPort, { x: sourceNode.position.x, y: sourceNode.position.y });

  if (!sourceAnchor || !targetAnchor) {
    return simpleRoute;
  }

  const patterns = getAllPatterns(sourceAnchor.side, targetAnchor.side);
  
  // Try each pattern until we find one without collisions
  for (const pattern of patterns) {
    const route = calculatePatternRoute(sourceAnchor, targetAnchor, pattern, context);
    if (route.success && !hasCollisions(route.points, obstacles)) {
      return route;
    }
  }

  // If all patterns have collisions, return the best one
  return simpleRoute;
}

/**
 * Check if a route has collisions with obstacles
 * @param {Array<Object>} points - Route points
 * @param {Array<Object>} obstacles - Array of obstacle nodes
 * @returns {boolean} True if collision detected
 */
export function hasCollisions(points, obstacles) {
  if (!obstacles || obstacles.length === 0) {
    return false;
  }

  // Check each segment of the route
  for (let i = 0; i < points.length - 1; i++) {
    const segment = {
      x1: points[i].x,
      y1: points[i].y,
      x2: points[i + 1].x,
      y2: points[i + 1].y
    };

    for (const obstacle of obstacles) {
      if (segmentIntersectsRect(segment, obstacle)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a line segment intersects with a rectangle
 * @param {Object} segment - Line segment {x1, y1, x2, y2}
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} True if intersection detected
 */
export function segmentIntersectsRect(segment, rect) {
  const { x1, y1, x2, y2 } = segment;
  const { x, y, width, height } = rect;

  // Check if either endpoint is inside the rectangle
  if (x1 >= x && x1 <= x + width && y1 >= y && y1 <= y + height) {
    return true;
  }
  if (x2 >= x && x2 <= x + width && y2 >= y && y2 <= y + height) {
    return true;
  }

  // Check intersection with rectangle edges
  const edges = [
    { x1: x, y1: y, x2: x + width, y2: y }, // Top
    { x1: x + width, y1: y, x2: x + width, y2: y + height }, // Right
    { x1: x, y1: y + height, x2: x + width, y2: y + height }, // Bottom
    { x1: x, y1: y, x2: x, y2: y + height } // Left
  ];

  for (const edge of edges) {
    if (linesIntersect(segment, edge)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if two line segments intersect
 * @param {Object} line1 - First line segment {x1, y1, x2, y2}
 * @param {Object} line2 - Second line segment {x1, y1, x2, y2}
 * @returns {boolean} True if lines intersect
 */
export function linesIntersect(line1, line2) {
  const { x1: x1a, y1: y1a, x2: x2a, y2: y2a } = line1;
  const { x1: x1b, y1: y1b, x2: x2b, y2: y2b } = line2;

  // Calculate the direction vectors
  const dx1 = x2a - x1a;
  const dy1 = y2a - y1a;
  const dx2 = x2b - x1b;
  const dy2 = y2b - y1b;

  // Calculate the determinant
  const det = dx1 * dy2 - dy1 * dx2;
  
  if (Math.abs(det) < 1e-10) {
    return false; // Parallel lines
  }

  // Calculate the parameters
  const dx = x1b - x1a;
  const dy = y1b - y1a;
  
  const t1 = (dx * dy2 - dy * dx2) / det;
  const t2 = (dx * dy1 - dy * dx1) / det;

  const result = t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;
  
  return result;
}
