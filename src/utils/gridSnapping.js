/**
 * Edge & Arrow System - Grid Snapping
 * Module A3: Grid snapping utilities (snapScalar, snapPoint) with tolerance
 */

import { EdgeConfig } from './edgeTypes.js';

// ============================================================================
// GRID CONFIGURATION
// ============================================================================

/**
 * @typedef {Object} GridConfig
 * @property {number} size - Grid cell size (0 = disabled)
 * @property {number} tolerance - Snap tolerance in pixels
 * @property {boolean} enabled - Whether grid snapping is enabled
 */

/**
 * Default grid configuration
 */
export const DEFAULT_GRID_CONFIG = {
  size: 20,                    // 20px grid cells
  tolerance: EdgeConfig.SNAP_TOLERANCE, // 6px snap tolerance
  enabled: true
};

// ============================================================================
// SCALAR SNAPPING
// ============================================================================

/**
 * Snap a scalar value to the nearest grid line
 * @param {number} value - Value to snap
 * @param {GridConfig} gridConfig - Grid configuration
 * @returns {number} Snapped value
 */
export function snapScalar(value, gridConfig = DEFAULT_GRID_CONFIG) {
  if (!gridConfig.enabled || gridConfig.size <= 0) {
    return value;
  }
  
  const tolerance = gridConfig.tolerance;
  const gridSize = gridConfig.size;
  
  // Find the nearest grid line
  const gridLine = Math.round(value / gridSize) * gridSize;
  
  // Check if within tolerance
  if (Math.abs(value - gridLine) <= tolerance) {
    return gridLine;
  }
  
  return value;
}

/**
 * Snap a scalar value to the nearest grid line with custom tolerance
 * @param {number} value - Value to snap
 * @param {number} gridSize - Grid cell size
 * @param {number} tolerance - Snap tolerance
 * @returns {number} Snapped value
 */
export function snapScalarWithTolerance(value, gridSize, tolerance) {
  if (gridSize <= 0) {
    return value;
  }
  
  // Find the nearest grid line
  const gridLine = Math.round(value / gridSize) * gridSize;
  
  // Check if within tolerance
  if (Math.abs(value - gridLine) <= tolerance) {
    return gridLine;
  }
  
  return value;
}

// ============================================================================
// POINT SNAPPING
// ============================================================================

/**
 * Snap a point to the nearest grid intersection
 * @param {Point} point - Point to snap
 * @param {GridConfig} gridConfig - Grid configuration
 * @returns {Point} Snapped point
 */
export function snapPoint(point, gridConfig = DEFAULT_GRID_CONFIG) {
  if (!point || !gridConfig.enabled || gridConfig.size <= 0) {
    return point;
  }
  
  return {
    x: snapScalar(point.x, gridConfig),
    y: snapScalar(point.y, gridConfig)
  };
}

/**
 * Snap a point to the nearest grid intersection with custom tolerance
 * @param {Point} point - Point to snap
 * @param {number} gridSize - Grid cell size
 * @param {number} tolerance - Snap tolerance
 * @returns {Point} Snapped point
 */
export function snapPointWithTolerance(point, gridSize, tolerance) {
  if (!point || gridSize <= 0) {
    return point;
  }
  
  return {
    x: snapScalarWithTolerance(point.x, gridSize, tolerance),
    y: snapScalarWithTolerance(point.y, gridSize, tolerance)
  };
}

/**
 * Snap a point to the nearest grid intersection, preserving original if not within tolerance
 * @param {Point} point - Point to snap
 * @param {GridConfig} gridConfig - Grid configuration
 * @returns {Point} Snapped point or original if not within tolerance
 */
export function snapPointPreserve(point, gridConfig = DEFAULT_GRID_CONFIG) {
  if (!point || !gridConfig.enabled || gridConfig.size <= 0) {
    return point;
  }
  
  const snapped = snapPoint(point, gridConfig);
  
  // Check if the point was actually snapped (changed)
  const tolerance = gridConfig.tolerance;
  const wasSnapped = Math.abs(point.x - snapped.x) > 0.001 || 
                     Math.abs(point.y - snapped.y) > 0.001;
  
  return wasSnapped ? snapped : point;
}

// ============================================================================
// ARRAY SNAPPING
// ============================================================================

/**
 * Snap an array of points to the grid
 * @param {Point[]} points - Array of points to snap
 * @param {GridConfig} gridConfig - Grid configuration
 * @returns {Point[]} Array of snapped points
 */
export function snapPoints(points, gridConfig = DEFAULT_GRID_CONFIG) {
  if (!Array.isArray(points) || !gridConfig.enabled || gridConfig.size <= 0) {
    return points;
  }
  
  return points.map(point => snapPoint(point, gridConfig));
}

/**
 * Snap an array of points to the grid, preserving originals if not within tolerance
 * @param {Point[]} points - Array of points to snap
 * @param {GridConfig} gridConfig - Grid configuration
 * @returns {Point[]} Array of snapped points
 */
export function snapPointsPreserve(points, gridConfig = DEFAULT_GRID_CONFIG) {
  if (!Array.isArray(points) || !gridConfig.enabled || gridConfig.size <= 0) {
    return points;
  }
  
  return points.map(point => snapPointPreserve(point, gridConfig));
}

// ============================================================================
// GRID UTILITIES
// ============================================================================

/**
 * Get the grid line coordinates for a given range
 * @param {number} start - Start coordinate
 * @param {number} end - End coordinate
 * @param {GridConfig} gridConfig - Grid configuration
 * @returns {number[]} Array of grid line coordinates
 */
export function getGridLines(start, end, gridConfig = DEFAULT_GRID_CONFIG) {
  if (!gridConfig.enabled || gridConfig.size <= 0) {
    return [];
  }
  
  const lines = [];
  const gridSize = gridConfig.size;
  
  // Find the first grid line after or at start
  const firstLine = Math.ceil(start / gridSize) * gridSize;
  
  // Generate all grid lines in range
  for (let line = firstLine; line <= end; line += gridSize) {
    lines.push(line);
  }
  
  return lines;
}

/**
 * Get the grid cell that contains a point
 * @param {Point} point - Point to find cell for
 * @param {GridConfig} gridConfig - Grid configuration
 * @returns {Object} {x, y} grid cell coordinates
 */
export function getGridCell(point, gridConfig = DEFAULT_GRID_CONFIG) {
  if (!point || !gridConfig.enabled || gridConfig.size <= 0) {
    return { x: 0, y: 0 };
  }
  
  const gridSize = gridConfig.size;
  
  return {
    x: Math.floor(point.x / gridSize),
    y: Math.floor(point.y / gridSize)
  };
}

/**
 * Get the grid cell bounds for a point
 * @param {Point} point - Point to find cell bounds for
 * @param {GridConfig} gridConfig - Grid configuration
 * @returns {Object} {x, y, width, height} cell bounds
 */
export function getGridCellBounds(point, gridConfig = DEFAULT_GRID_CONFIG) {
  if (!point || !gridConfig.enabled || gridConfig.size <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  const gridSize = gridConfig.size;
  const cell = getGridCell(point, gridConfig);
  
  return {
    x: cell.x * gridSize,
    y: cell.y * gridSize,
    width: gridSize,
    height: gridSize
  };
}

/**
 * Check if a point is on a grid line
 * @param {Point} point - Point to check
 * @param {GridConfig} gridConfig - Grid configuration
 * @param {number} tolerance - Tolerance for checking (defaults to grid tolerance)
 * @returns {boolean} True if point is on a grid line
 */
export function isOnGridLine(point, gridConfig = DEFAULT_GRID_CONFIG, tolerance = null) {
  if (!point || !gridConfig.enabled || gridConfig.size <= 0) {
    return false;
  }
  
  const tol = tolerance !== null ? tolerance : gridConfig.tolerance;
  const gridSize = gridConfig.size;
  
  // Check if both X and Y are on grid lines
  const xOnGrid = Math.abs(point.x - Math.round(point.x / gridSize) * gridSize) <= tol;
  const yOnGrid = Math.abs(point.y - Math.round(point.y / gridSize) * gridSize) <= tol;
  
  return xOnGrid || yOnGrid;
}

/**
 * Check if a point is on a grid intersection
 * @param {Point} point - Point to check
 * @param {GridConfig} gridConfig - Grid configuration
 * @param {number} tolerance - Tolerance for checking (defaults to grid tolerance)
 * @returns {boolean} True if point is on a grid intersection
 */
export function isOnGridIntersection(point, gridConfig = DEFAULT_GRID_CONFIG, tolerance = null) {
  if (!point || !gridConfig.enabled || gridConfig.size <= 0) {
    return false;
  }
  
  const tol = tolerance !== null ? tolerance : gridConfig.tolerance;
  const gridSize = gridConfig.size;
  
  // Check if both X and Y are on grid lines
  const xOnGrid = Math.abs(point.x - Math.round(point.x / gridSize) * gridSize) <= tol;
  const yOnGrid = Math.abs(point.y - Math.round(point.y / gridSize) * gridSize) <= tol;
  
  return xOnGrid && yOnGrid;
}

// ============================================================================
// GRID CONFIGURATION UTILITIES
// ============================================================================

/**
 * Create a grid configuration from options
 * @param {Object} options - Grid options
 * @returns {GridConfig} Grid configuration
 */
export function createGridConfig(options = {}) {
  return {
    ...DEFAULT_GRID_CONFIG,
    ...options
  };
}

/**
 * Validate a grid configuration
 * @param {GridConfig} gridConfig - Grid configuration to validate
 * @returns {boolean} True if configuration is valid
 */
export function validateGridConfig(gridConfig) {
  if (!gridConfig || typeof gridConfig !== 'object') {
    return false;
  }
  
  if (typeof gridConfig.size !== 'number' || gridConfig.size < 0) {
    return false;
  }
  
  if (typeof gridConfig.tolerance !== 'number' || gridConfig.tolerance < 0) {
    return false;
  }
  
  if (typeof gridConfig.enabled !== 'boolean') {
    return false;
  }
  
  return true;
}

export default {
  // Configuration
  DEFAULT_GRID_CONFIG,
  createGridConfig,
  validateGridConfig,
  
  // Scalar snapping
  snapScalar,
  snapScalarWithTolerance,
  
  // Point snapping
  snapPoint,
  snapPointWithTolerance,
  snapPointPreserve,
  
  // Array snapping
  snapPoints,
  snapPointsPreserve,
  
  // Grid utilities
  getGridLines,
  getGridCell,
  getGridCellBounds,
  isOnGridLine,
  isOnGridIntersection
};
