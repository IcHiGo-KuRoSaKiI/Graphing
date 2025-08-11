/**
 * Edge & Arrow System - Core Types and Constants
 * Module A1: Define types: Edge, Port, Label, Side, EdgeStyle, Point + config constants
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * @typedef {'N' | 'E' | 'S' | 'W'} Side
 * Cardinal directions for port constraints
 */

/**
 * @typedef {'orthogonal' | 'segment' | 'straight' | 'elbow'} EdgeStyle
 * Edge routing and editing styles
 */

/**
 * @typedef {Object} Point
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} Port
 * @property {Side} [side] - Side constraint (N/E/S/W)
 * @property {boolean} [sticky] - Whether to persist side across reroutes
 * @property {number} [align] - Alignment fraction 0..1 along the side
 * @property {number} [x] - Fixed X coordinate (node-relative, overrides side)
 * @property {number} [y] - Fixed Y coordinate (node-relative, overrides side)
 */

/**
 * @typedef {Object} Label
 * @property {string} text - Label text content
 * @property {number} t - Position along polyline (0..1)
 * @property {number} dx - X offset in screen space
 * @property {number} dy - Y offset in screen space
 */

/**
 * @typedef {Object} EdgeMeta
 * @property {number} [parallelIndex] - Index for parallel edge spacing
 * @property {Object} [custom] - Custom metadata
 */

/**
 * @typedef {Object} Edge
 * @property {string} id - Unique edge identifier
 * @property {string} source - Source node ID
 * @property {string} target - Target node ID
 * @property {EdgeStyle} style - Edge routing style
 * @property {Label} [label] - Edge label
 * @property {Point[]} [waypoints] - Intermediate points (model coordinates)
 * @property {Port} [sourcePort] - Source port configuration
 * @property {Port} [targetPort] - Target port configuration
 * @property {EdgeMeta} [meta] - Edge metadata
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Edge system configuration constants
 * These match the requirements specification
 */
export const EdgeConfig = {
  // Spacing and sizing
  JETTY_SIZE: 20,                    // Connection extension from node perimeter
  ORTH_BUFFER: 10,                   // Base spacing for orthogonal routing
  PARALLEL_SPACING: 8,               // Spacing between parallel edges
  OVERLAP_NUDGE: 6,                  // Minimal offset to avoid exact overlap
  MIN_SEGMENT_FOR_HANDLE: 24,        // Minimum segment length for virtual handles
  
  // Tolerance and precision
  SNAP_TOLERANCE: 6,                 // Grid snapping tolerance
  COLLINEAR_EPS: 0.75,               // Collinearity detection epsilon
  WAYPOINT_SOFT_CAP: 12,             // Soft limit on waypoints per edge
  
  // Performance
  FRAME_BUDGET_MS: 16,               // Target frame time (60fps)
  DRAG_DEBOUNCE_MS: 16,              // Drag update debounce
};

// ============================================================================
// SIDE CONSTANTS
// ============================================================================

export const SIDES = {
  NORTH: 'N',
  EAST: 'E', 
  SOUTH: 'S',
  WEST: 'W'
};

export const SIDE_VALUES = Object.values(SIDES);

// ============================================================================
// EDGE STYLES
// ============================================================================

export const EDGE_STYLES = {
  ORTHOGONAL: 'orthogonal',
  SEGMENT: 'segment',
  STRAIGHT: 'straight',
  ELBOW: 'elbow'
};

export const EDGE_STYLE_VALUES = Object.values(EDGE_STYLES);

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid Side
 */
export function isValidSide(value) {
  return SIDE_VALUES.includes(value);
}

/**
 * Type guard to check if a value is a valid EdgeStyle
 */
export function isValidEdgeStyle(value) {
  return EDGE_STYLE_VALUES.includes(value);
}

/**
 * Type guard to check if a value is a valid Point
 */
export function isValidPoint(value) {
  return value !== null && 
         value !== undefined &&
         typeof value === 'object' &&
         typeof value.x === 'number' && 
         typeof value.y === 'number' &&
         !isNaN(value.x) && 
         !isNaN(value.y);
}

/**
 * Type guard to check if a value is a valid Port
 */
export function isValidPort(value) {
  if (!value || typeof value !== 'object') return false;
  
  // Must have either side or fixed coordinates
  const hasSide = value.side && isValidSide(value.side);
  const hasFixed = typeof value.x === 'number' && typeof value.y === 'number';
  
  return hasSide || hasFixed;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a default port configuration
 */
export function createDefaultPort(side = SIDES.EAST) {
  return {
    side,
    sticky: true,
    align: 0.5
  };
}

/**
 * Create a default edge configuration
 */
export function createDefaultEdge(id, source, target, style = EDGE_STYLES.ORTHOGONAL) {
  return {
    id,
    source,
    target,
    style,
    sourcePort: createDefaultPort(SIDES.EAST),
    targetPort: createDefaultPort(SIDES.WEST),
    waypoints: [],
    meta: {
      parallelIndex: 0,
      custom: {}
    }
  };
}

/**
 * Validate an edge object against the schema
 */
export function validateEdge(edge) {
  if (!edge || typeof edge !== 'object') {
    throw new Error('Edge must be an object');
  }
  
  if (!edge.id || typeof edge.id !== 'string') {
    throw new Error('Edge must have a string id');
  }
  
  if (!edge.source || typeof edge.source !== 'string') {
    throw new Error('Edge must have a string source');
  }
  
  if (!edge.target || typeof edge.target !== 'string') {
    throw new Error('Edge must have a string target');
  }
  
  if (!isValidEdgeStyle(edge.style)) {
    throw new Error(`Invalid edge style: ${edge.style}`);
  }
  
  if (edge.sourcePort && !isValidPort(edge.sourcePort)) {
    throw new Error('Invalid sourcePort configuration');
  }
  
  if (edge.targetPort && !isValidPort(edge.targetPort)) {
    throw new Error('Invalid targetPort configuration');
  }
  
  if (edge.waypoints && !Array.isArray(edge.waypoints)) {
    throw new Error('waypoints must be an array');
  }
  
  if (edge.waypoints) {
    for (let i = 0; i < edge.waypoints.length; i++) {
      if (!isValidPoint(edge.waypoints[i])) {
        throw new Error(`Invalid waypoint at index ${i}`);
      }
    }
  }
  
  return true;
}

export default {
  EdgeConfig,
  SIDES,
  EDGE_STYLES,
  isValidSide,
  isValidEdgeStyle,
  isValidPoint,
  isValidPort,
  createDefaultPort,
  createDefaultEdge,
  validateEdge
};
