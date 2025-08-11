/**
 * Edge & Arrow System - Jetty System
 * Module B3: jetty(point, side, size=20) outward offset; themeable
 */

import { EdgeConfig, SIDES } from './edgeTypes.js';
import { getNormalFromSide } from './perimeterIntersection.js';

// ============================================================================
// JETTY CONFIGURATION
// ============================================================================

/**
 * @typedef {Object} JettyConfig
 * @property {number} size - Jetty size in pixels
 * @property {boolean} enabled - Whether jetty is enabled
 * @property {number} [minSize] - Minimum jetty size
 * @property {number} [maxSize] - Maximum jetty size
 */

/**
 * Default jetty configuration
 */
export const DEFAULT_JETTY_CONFIG = {
  size: EdgeConfig.JETTY_SIZE, // 20px default
  enabled: true,
  minSize: 5,
  maxSize: 50
};

// ============================================================================
// JETTY CALCULATION
// ============================================================================

/**
 * Apply jetty offset to a point along a side
 * @param {Point} point - Base point
 * @param {Side} side - Side to offset along
 * @param {JettyConfig} [config] - Jetty configuration
 * @returns {Point} Point with jetty offset applied
 */
export function jetty(point, side, config = DEFAULT_JETTY_CONFIG) {
  if (!point || !side || !config.enabled) {
    return point;
  }
  
  const size = clampJettySize(config.size, config);
  const normal = getNormalFromSide(side);
  
  return {
    x: point.x + normal.x * size,
    y: point.y + normal.y * size
  };
}

/**
 * Apply jetty offset with custom size
 * @param {Point} point - Base point
 * @param {Side} side - Side to offset along
 * @param {number} size - Jetty size in pixels
 * @returns {Point} Point with jetty offset applied
 */
export function jettyWithSize(point, side, size) {
  if (!point || !side || size <= 0) {
    return point;
  }
  
  const normal = getNormalFromSide(side);
  
  return {
    x: point.x + normal.x * size,
    y: point.y + normal.y * size
  };
}

/**
 * Remove jetty offset from a point
 * @param {Point} point - Point with jetty offset
 * @param {Side} side - Side the offset was applied along
 * @param {JettyConfig} [config] - Jetty configuration
 * @returns {Point} Point with jetty offset removed
 */
export function unjetty(point, side, config = DEFAULT_JETTY_CONFIG) {
  if (!point || !side || !config.enabled) {
    return point;
  }
  
  const size = clampJettySize(config.size, config);
  const normal = getNormalFromSide(side);
  
  return {
    x: point.x - normal.x * size,
    y: point.y - normal.y * size
  };
}

// ============================================================================
// ARRAY JETTY OPERATIONS
// ============================================================================

/**
 * Apply jetty to an array of points
 * @param {Point[]} points - Array of points
 * @param {Side[]} sides - Array of sides (must match points length)
 * @param {JettyConfig} [config] - Jetty configuration
 * @returns {Point[]} Array of points with jetty applied
 */
export function jettyPoints(points, sides, config = DEFAULT_JETTY_CONFIG) {
  if (!Array.isArray(points) || !Array.isArray(sides) || points.length !== sides.length) {
    return points;
  }
  
  return points.map((point, index) => jetty(point, sides[index], config));
}

/**
 * Remove jetty from an array of points
 * @param {Point[]} points - Array of points with jetty
 * @param {Side[]} sides - Array of sides (must match points length)
 * @param {JettyConfig} [config] - Jetty configuration
 * @returns {Point[]} Array of points with jetty removed
 */
export function unjettyPoints(points, sides, config = DEFAULT_JETTY_CONFIG) {
  if (!Array.isArray(points) || !Array.isArray(sides) || points.length !== sides.length) {
    return points;
  }
  
  return points.map((point, index) => unjetty(point, sides[index], config));
}

// ============================================================================
// JETTY FOR EDGE ENDPOINTS
// ============================================================================

/**
 * Apply jetty to edge endpoints
 * @param {Point} sourcePoint - Source anchor point
 * @param {Side} sourceSide - Source side
 * @param {Point} targetPoint - Target anchor point
 * @param {Side} targetSide - Target side
 * @param {JettyConfig} [config] - Jetty configuration
 * @returns {Object} {sourceJetty, targetJetty} - Points with jetty applied
 */
export function jettyEdgeEndpoints(sourcePoint, sourceSide, targetPoint, targetSide, config = DEFAULT_JETTY_CONFIG) {
  if (!sourcePoint || !targetPoint || !sourceSide || !targetSide) {
    return { sourceJetty: sourcePoint, targetJetty: targetPoint };
  }
  
  return {
    sourceJetty: jetty(sourcePoint, sourceSide, config),
    targetJetty: jetty(targetPoint, targetSide, config)
  };
}

/**
 * Calculate jetty size based on edge length and configuration
 * @param {Point} sourcePoint - Source point
 * @param {Point} targetPoint - Target point
 * @param {JettyConfig} [config] - Jetty configuration
 * @returns {number} Adaptive jetty size
 */
export function calculateAdaptiveJettySize(sourcePoint, targetPoint, config = DEFAULT_JETTY_CONFIG) {
  if (!sourcePoint || !targetPoint) {
    return config.size;
  }
  
  const distance = Math.sqrt(
    Math.pow(targetPoint.x - sourcePoint.x, 2) + 
    Math.pow(targetPoint.y - sourcePoint.y, 2)
  );
  
  // Scale jetty size based on edge length
  const baseSize = config.size;
  const minSize = config.minSize || 5;
  const maxSize = config.maxSize || 50;
  
  // For very short edges, use smaller jetty
  if (distance < 100) {
    return Math.max(minSize, baseSize * 0.5);
  }
  
  // For very long edges, use larger jetty
  if (distance > 500) {
    return Math.min(maxSize, baseSize * 1.5);
  }
  
  return baseSize;
}

// ============================================================================
// JETTY VALIDATION AND UTILITIES
// ============================================================================

/**
 * Clamp jetty size to valid range
 * @param {number} size - Jetty size
 * @param {JettyConfig} config - Jetty configuration
 * @returns {number} Clamped jetty size
 */
function clampJettySize(size, config) {
  const minSize = config.minSize || 5;
  const maxSize = config.maxSize || 50;
  
  return Math.max(minSize, Math.min(maxSize, size));
}

/**
 * Create jetty configuration from options
 * @param {Object} options - Jetty options
 * @returns {JettyConfig} Jetty configuration
 */
export function createJettyConfig(options = {}) {
  return {
    ...DEFAULT_JETTY_CONFIG,
    ...options
  };
}

/**
 * Validate jetty configuration
 * @param {JettyConfig} config - Jetty configuration to validate
 * @returns {boolean} True if configuration is valid
 */
export function validateJettyConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  if (typeof config.size !== 'number' || config.size < 0) {
    return false;
  }
  
  if (typeof config.enabled !== 'boolean') {
    return false;
  }
  
  if (config.minSize !== undefined && (typeof config.minSize !== 'number' || config.minSize < 0)) {
    return false;
  }
  
  if (config.maxSize !== undefined && (typeof config.maxSize !== 'number' || config.maxSize < 0)) {
    return false;
  }
  
  if (config.minSize !== undefined && config.maxSize !== undefined && config.minSize > config.maxSize) {
    return false;
  }
  
  return true;
}

/**
 * Check if a point has jetty offset applied
 * @param {Point} point - Point to check
 * @param {Point} basePoint - Base point (without jetty)
 * @param {Side} side - Side jetty was applied along
 * @param {JettyConfig} [config] - Jetty configuration
 * @returns {boolean} True if point has jetty offset
 */
export function hasJettyOffset(point, basePoint, side, config = DEFAULT_JETTY_CONFIG) {
  if (!point || !basePoint || !side) {
    return false;
  }
  
  const expectedJetty = jetty(basePoint, side, config);
  const tolerance = 1; // 1px tolerance
  
  const dx = Math.abs(point.x - expectedJetty.x);
  const dy = Math.abs(point.y - expectedJetty.y);
  
  return dx <= tolerance && dy <= tolerance;
}

/**
 * Get jetty offset vector for a side
 * @param {Side} side - Side to get offset for
 * @param {JettyConfig} [config] - Jetty configuration
 * @returns {Point} Offset vector
 */
export function getJettyOffset(side, config = DEFAULT_JETTY_CONFIG) {
  if (!side || !config.enabled) {
    return { x: 0, y: 0 };
  }
  
  const size = clampJettySize(config.size, config);
  const normal = getNormalFromSide(side);
  
  return {
    x: normal.x * size,
    y: normal.y * size
  };
}

export default {
  // Configuration
  DEFAULT_JETTY_CONFIG,
  createJettyConfig,
  validateJettyConfig,
  
  // Basic jetty operations
  jetty,
  jettyWithSize,
  unjetty,
  
  // Array operations
  jettyPoints,
  unjettyPoints,
  
  // Edge operations
  jettyEdgeEndpoints,
  calculateAdaptiveJettySize,
  
  // Utilities
  hasJettyOffset,
  getJettyOffset
};
