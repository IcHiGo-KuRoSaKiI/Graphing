/**
 * Edge & Arrow System - Anchor Point Resolution
 * Module B2: anchorPoint(node, port) resolves side/fixed ports and returns {point, side}
 */

import { SIDES, isValidPort } from './edgeTypes.js';
import { 
  intersectRectPerimeter, 
  intersectRoundedRectPerimeter, 
  intersectEllipsePerimeter,
  getDirectionFromSide,
  getNormalFromSide
} from './perimeterIntersection.js';

// ============================================================================
// NODE TYPES
// ============================================================================

/**
 * @typedef {Object} Node
 * @property {string} id - Node identifier
 * @property {Point} position - Node position
 * @property {number} width - Node width
 * @property {number} height - Node height
 * @property {string} [shape] - Shape type: 'rect', 'roundedRect', 'ellipse'
 * @property {number} [rx] - Corner radius for rounded rectangles
 * @property {number} [ry] - Corner radius for rounded rectangles
 */

// ============================================================================
// ANCHOR POINT RESOLUTION
// ============================================================================

/**
 * Resolve anchor point for a node and port configuration
 * @param {Node} node - Node to anchor to
 * @param {Port} port - Port configuration
 * @param {Point} [targetPoint] - Optional target point for direction calculation
 * @returns {IntersectionResult} {point, side} or null if invalid
 */
export function anchorPoint(node, port, targetPoint = null) {
  if (!node) {
    return null;
  }
  
  // Handle fixed coordinates
  if (port && typeof port.x === 'number' && typeof port.y === 'number') {
    return resolveFixedPort(node, port);
  }
  
  // Handle side-based ports
  if (port && port.side && isValidPort(port)) {
    return resolveSidePort(node, port, targetPoint);
  }
  
  // Fallback: auto-determine best side based on target
  if (targetPoint) {
    return resolveAutoPort(node, targetPoint);
  }
  
  return null;
}

/**
 * Resolve fixed coordinate port
 * @param {Node} node - Node to anchor to
 * @param {Port} port - Port with fixed coordinates
 * @returns {IntersectionResult} {point, side}
 */
function resolveFixedPort(node, port) {
  const { x, y } = port;
  const nodeCenter = {
    x: node.position.x + node.width / 2,
    y: node.position.y + node.height / 2
  };
  
  // Calculate direction from center to fixed point
  const direction = normalizeVector({
    x: x - nodeCenter.x,
    y: y - nodeCenter.y
  });
  
  // Find intersection with perimeter
  const intersection = findPerimeterIntersection(node, nodeCenter, direction);
  
  if (intersection) {
    return {
      point: { x, y }, // Use the fixed coordinates
      side: intersection.side
    };
  }
  
  // Fallback: use center point
  return {
    point: nodeCenter,
    side: SIDES.EAST
  };
}

/**
 * Resolve side-based port
 * @param {Node} node - Node to anchor to
 * @param {Port} port - Port with side constraint
 * @param {Point} targetPoint - Target point for alignment
 * @returns {IntersectionResult} {point, side}
 */
function resolveSidePort(node, port, targetPoint) {
  const { side, align = 0.5 } = port;
  const nodeCenter = {
    x: node.position.x + node.width / 2,
    y: node.position.y + node.height / 2
  };
  
  // Get direction for the specified side
  const direction = getDirectionFromSide(side);
  
  // Find intersection with perimeter
  const intersection = findPerimeterIntersection(node, nodeCenter, direction);
  
  if (!intersection) {
    return null;
  }
  
  // Apply alignment along the side
  const alignedPoint = applySideAlignment(node, intersection.point, side, align);
  
  return {
    point: alignedPoint,
    side: side
  };
}

/**
 * Auto-resolve port based on target direction
 * @param {Node} node - Node to anchor to
 * @param {Point} targetPoint - Target point
 * @returns {IntersectionResult} {point, side}
 */
function resolveAutoPort(node, targetPoint) {
  const nodeCenter = {
    x: node.position.x + node.width / 2,
    y: node.position.y + node.height / 2
  };
  
  // Calculate direction from node center to target
  const direction = normalizeVector({
    x: targetPoint.x - nodeCenter.x,
    y: targetPoint.y - nodeCenter.y
  });
  
  // Find intersection with perimeter
  const intersection = findPerimeterIntersection(node, nodeCenter, direction);
  
  if (!intersection) {
    return null;
  }
  
  return intersection;
}

// ============================================================================
// PERIMETER INTERSECTION HELPERS
// ============================================================================

/**
 * Find intersection with node perimeter based on shape type
 * @param {Node} node - Node to intersect with
 * @param {Point} origin - Ray origin
 * @param {Point} direction - Ray direction
 * @returns {IntersectionResult} {point, side} or null
 */
function findPerimeterIntersection(node, origin, direction) {
  const shape = node.shape || 'rect';
  
  switch (shape) {
    case 'rect':
      return intersectRectPerimeter({
        x: node.position.x,
        y: node.position.y,
        width: node.width,
        height: node.height
      }, origin, direction);
      
    case 'roundedRect':
      return intersectRoundedRectPerimeter({
        x: node.position.x,
        y: node.position.y,
        width: node.width,
        height: node.height,
        rx: node.rx || 0,
        ry: node.ry || 0
      }, origin, direction);
      
    case 'ellipse':
      return intersectEllipsePerimeter({
        cx: node.position.x + node.width / 2,
        cy: node.position.y + node.height / 2,
        rx: node.width / 2,
        ry: node.height / 2
      }, origin, direction);
      
    default:
      // Default to rectangle
      return intersectRectPerimeter({
        x: node.position.x,
        y: node.position.y,
        width: node.width,
        height: node.height
      }, origin, direction);
  }
}

// ============================================================================
// SIDE ALIGNMENT
// ============================================================================

/**
 * Apply alignment along a side
 * @param {Node} node - Node
 * @param {Point} basePoint - Base intersection point
 * @param {Side} side - Side to align along
 * @param {number} align - Alignment fraction (0..1)
 * @returns {Point} Aligned point
 */
function applySideAlignment(node, basePoint, side, align) {
  const { position, width, height } = node;
  
  switch (side) {
    case SIDES.NORTH:
    case SIDES.SOUTH:
      // Align horizontally along top/bottom edge
      const minX = position.x;
      const maxX = position.x + width;
      const alignedX = minX + (maxX - minX) * align;
      return { x: alignedX, y: basePoint.y };
      
    case SIDES.EAST:
    case SIDES.WEST:
      // Align vertically along left/right edge
      const minY = position.y;
      const maxY = position.y + height;
      const alignedY = minY + (maxY - minY) * align;
      return { x: basePoint.x, y: alignedY };
      
    default:
      return basePoint;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize a vector to unit length
 * @param {Point} vector - Vector to normalize
 * @returns {Point} Normalized vector
 */
function normalizeVector(vector) {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  
  if (length < 1e-6) {
    return { x: 0, y: 0 };
  }
  
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

/**
 * Get the best side for connecting to a target point
 * @param {Node} node - Source node
 * @param {Point} targetPoint - Target point
 * @returns {Side} Best side for connection
 */
export function getBestSide(node, targetPoint) {
  const nodeCenter = {
    x: node.position.x + node.width / 2,
    y: node.position.y + node.height / 2
  };
  
  const dx = targetPoint.x - nodeCenter.x;
  const dy = targetPoint.y - nodeCenter.y;
  
  // Determine best side based on direction
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? SIDES.EAST : SIDES.WEST;
  } else {
    return dy > 0 ? SIDES.SOUTH : SIDES.NORTH;
  }
}

/**
 * Create a default port configuration for a node
 * @param {Node} node - Node to create port for
 * @param {Point} [targetPoint] - Optional target point
 * @returns {Port} Default port configuration
 */
export function createDefaultPortForNode(node, targetPoint = null) {
  if (!node) {
    return { side: SIDES.EAST, sticky: true, align: 0.5 };
  }
  
  if (targetPoint) {
    const bestSide = getBestSide(node, targetPoint);
    return { side: bestSide, sticky: true, align: 0.5 };
  }
  
  return { side: SIDES.EAST, sticky: true, align: 0.5 };
}

/**
 * Validate that a port configuration is valid for a node
 * @param {Node} node - Node to validate against
 * @param {Port} port - Port configuration to validate
 * @returns {boolean} True if valid
 */
export function validatePortForNode(node, port) {
  if (!node || !port) {
    return false;
  }
  
  if (!isValidPort(port)) {
    return false;
  }
  
  // Check fixed coordinates are within node bounds
  if (typeof port.x === 'number' && typeof port.y === 'number') {
    const { position, width, height } = node;
    return port.x >= position.x && 
           port.x <= position.x + width &&
           port.y >= position.y && 
           port.y <= position.y + height;
  }
  
  return true;
}

export default {
  anchorPoint,
  getBestSide,
  createDefaultPortForNode,
  validatePortForNode
};
