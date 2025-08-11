/**
 * Edge & Arrow System - Coordinate Transforms
 * Module A2: Implement model↔view↔screen transforms and zoom-aware hit tolerances
 */

import { EdgeConfig } from './edgeTypes.js';

// ============================================================================
// COORDINATE SPACES
// ============================================================================

/**
 * @typedef {Object} Transform
 * @property {number} x - X translation
 * @property {number} y - Y translation
 * @property {number} k - Scale factor (zoom)
 */

/**
 * @typedef {Object} Viewport
 * @property {number} x - Viewport X position
 * @property {number} y - Viewport Y position
 * @property {number} zoom - Viewport zoom level
 * @property {number} width - Viewport width
 * @property {number} height - Viewport height
 */

// ============================================================================
// COORDINATE TRANSFORMATIONS
// ============================================================================

/**
 * Transform a point from model space to view space
 * @param {Point} point - Point in model coordinates
 * @param {Transform} transform - Current transform
 * @returns {Point} Point in view coordinates
 */
export function modelToView(point, transform) {
  if (!point || !transform) return point;
  
  return {
    x: point.x * transform.k + transform.x,
    y: point.y * transform.k + transform.y
  };
}

/**
 * Transform a point from view space to model space
 * @param {Point} point - Point in view coordinates
 * @param {Transform} transform - Current transform
 * @returns {Point} Point in model coordinates
 */
export function viewToModel(point, transform) {
  if (!point || !transform) return point;
  
  return {
    x: (point.x - transform.x) / transform.k,
    y: (point.y - transform.y) / transform.k
  };
}

/**
 * Transform a point from view space to screen space
 * @param {Point} point - Point in view coordinates
 * @param {Viewport} viewport - Current viewport
 * @returns {Point} Point in screen coordinates
 */
export function viewToScreen(point, viewport) {
  if (!point || !viewport) return point;
  
  return {
    x: point.x,
    y: point.y
  };
}

/**
 * Transform a point from screen space to view space
 * @param {Point} point - Point in screen coordinates
 * @param {Viewport} viewport - Current viewport
 * @returns {Point} Point in view coordinates
 */
export function screenToView(point, viewport) {
  if (!point || !viewport) return point;
  
  return {
    x: point.x,
    y: point.y
  };
}

/**
 * Transform a point from model space to screen space
 * @param {Point} point - Point in model coordinates
 * @param {Transform} transform - Current transform
 * @param {Viewport} viewport - Current viewport
 * @returns {Point} Point in screen coordinates
 */
export function modelToScreen(point, transform, viewport) {
  const viewPoint = modelToView(point, transform);
  return viewToScreen(viewPoint, viewport);
}

/**
 * Transform a point from screen space to model space
 * @param {Point} point - Point in screen coordinates
 * @param {Transform} transform - Current transform
 * @param {Viewport} viewport - Current viewport
 * @returns {Point} Point in model coordinates
 */
export function screenToModel(point, transform, viewport) {
  const viewPoint = screenToView(point, viewport);
  return viewToModel(viewPoint, transform);
}

// ============================================================================
// ARRAY TRANSFORMATIONS
// ============================================================================

/**
 * Transform an array of points from model space to view space
 * @param {Point[]} points - Array of points in model coordinates
 * @param {Transform} transform - Current transform
 * @returns {Point[]} Array of points in view coordinates
 */
export function transformPointsToView(points, transform) {
  if (!Array.isArray(points) || !transform) return points;
  
  return points.map(point => modelToView(point, transform));
}

/**
 * Transform an array of points from view space to model space
 * @param {Point[]} points - Array of points in view coordinates
 * @param {Transform} transform - Current transform
 * @returns {Point[]} Array of points in model coordinates
 */
export function transformPointsToModel(points, transform) {
  if (!Array.isArray(points) || !transform) return points;
  
  return points.map(point => viewToModel(point, transform));
}

// ============================================================================
// ZOOM-AWARE HIT TOLERANCES
// ============================================================================

/**
 * Calculate zoom-aware hit tolerance for handle detection
 * @param {number} baseTolerance - Base tolerance in pixels
 * @param {number} zoom - Current zoom level
 * @returns {number} Adjusted tolerance
 */
export function getZoomAwareTolerance(baseTolerance, zoom) {
  // Scale tolerance inversely with zoom to maintain consistent hit area
  return Math.max(baseTolerance / zoom, 2); // Minimum 2px tolerance
}

/**
 * Calculate zoom-aware handle size for rendering
 * @param {number} baseSize - Base handle size in pixels
 * @param {number} zoom - Current zoom level
 * @returns {number} Adjusted handle size
 */
export function getZoomAwareHandleSize(baseSize, zoom) {
  // Scale handle size with zoom for consistent visual appearance
  return Math.max(baseSize * zoom, 4); // Minimum 4px handle size
}

/**
 * Calculate zoom-aware stroke width for edge rendering
 * @param {number} baseWidth - Base stroke width in pixels
 * @param {number} zoom - Current zoom level
 * @returns {number} Adjusted stroke width
 */
export function getZoomAwareStrokeWidth(baseWidth, zoom) {
  // Scale stroke width with zoom for consistent visual appearance
  return Math.max(baseWidth * zoom, 1); // Minimum 1px stroke width
}

// ============================================================================
// PRECISION AND ROUNDING
// ============================================================================

/**
 * Round a value to device pixel boundaries to avoid jitter
 * @param {number} value - Value to round
 * @param {number} devicePixelRatio - Device pixel ratio
 * @returns {number} Rounded value
 */
export function roundToDevicePixels(value, devicePixelRatio = 1) {
  return Math.round(value * devicePixelRatio) / devicePixelRatio;
}

/**
 * Round a point to device pixel boundaries
 * @param {Point} point - Point to round
 * @param {number} devicePixelRatio - Device pixel ratio
 * @returns {Point} Rounded point
 */
export function roundPointToDevicePixels(point, devicePixelRatio = 1) {
  if (!point) return point;
  
  return {
    x: roundToDevicePixels(point.x, devicePixelRatio),
    y: roundToDevicePixels(point.y, devicePixelRatio)
  };
}

/**
 * Round an array of points to device pixel boundaries
 * @param {Point[]} points - Array of points to round
 * @param {number} devicePixelRatio - Device pixel ratio
 * @returns {Point[]} Array of rounded points
 */
export function roundPointsToDevicePixels(points, devicePixelRatio = 1) {
  if (!Array.isArray(points)) return points;
  
  return points.map(point => roundPointToDevicePixels(point, devicePixelRatio));
}

// ============================================================================
// BOUNDS AND CLIPPING
// ============================================================================

/**
 * @typedef {Object} Bounds
 * @property {number} x - Left edge
 * @property {number} y - Top edge
 * @property {number} width - Width
 * @property {number} height - Height
 */

/**
 * Check if a point is within bounds
 * @param {Point} point - Point to test
 * @param {Bounds} bounds - Bounds to test against
 * @param {number} tolerance - Tolerance for boundary testing
 * @returns {boolean} True if point is within bounds
 */
export function isPointInBounds(point, bounds, tolerance = 0) {
  if (!point || !bounds) return false;
  
  return point.x >= bounds.x - tolerance &&
         point.x <= bounds.x + bounds.width + tolerance &&
         point.y >= bounds.y - tolerance &&
         point.y <= bounds.y + bounds.height + tolerance;
}

/**
 * Clip a point to bounds
 * @param {Point} point - Point to clip
 * @param {Bounds} bounds - Bounds to clip to
 * @returns {Point} Clipped point
 */
export function clipPointToBounds(point, bounds) {
  if (!point || !bounds) return point;
  
  return {
    x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
    y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y))
  };
}

/**
 * Transform bounds from model space to view space
 * @param {Bounds} bounds - Bounds in model coordinates
 * @param {Transform} transform - Current transform
 * @returns {Bounds} Bounds in view coordinates
 */
export function transformBoundsToView(bounds, transform) {
  if (!bounds || !transform) return bounds;
  
  const topLeft = modelToView({ x: bounds.x, y: bounds.y }, transform);
  const bottomRight = modelToView({ 
    x: bounds.x + bounds.width, 
    y: bounds.y + bounds.height 
  }, transform);
  
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two points
 * @param {Point} p1 - First point
 * @param {Point} p2 - Second point
 * @returns {number} Distance
 */
export function distance(p1, p2) {
  if (!p1 || !p2) return 0;
  
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance between two points (faster than distance)
 * @param {Point} p1 - First point
 * @param {Point} p2 - Second point
 * @returns {number} Squared distance
 */
export function distanceSquared(p1, p2) {
  if (!p1 || !p2) return 0;
  
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

/**
 * Find the closest point in an array to a target point
 * @param {Point} target - Target point
 * @param {Point[]} points - Array of points to search
 * @returns {Object} {point, index, distance} of closest point
 */
export function findClosestPoint(target, points) {
  if (!target || !Array.isArray(points) || points.length === 0) {
    return null;
  }
  
  let closest = null;
  let minDistance = Infinity;
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const dist = distanceSquared(target, point);
    
    if (dist < minDistance) {
      minDistance = dist;
      closest = { point, index: i, distance: Math.sqrt(dist) };
    }
  }
  
  return closest;
}

export default {
  // Coordinate transformations
  modelToView,
  viewToModel,
  viewToScreen,
  screenToView,
  modelToScreen,
  screenToModel,
  transformPointsToView,
  transformPointsToModel,
  
  // Zoom-aware calculations
  getZoomAwareTolerance,
  getZoomAwareHandleSize,
  getZoomAwareStrokeWidth,
  
  // Precision and rounding
  roundToDevicePixels,
  roundPointToDevicePixels,
  roundPointsToDevicePixels,
  
  // Bounds and clipping
  isPointInBounds,
  clipPointToBounds,
  transformBoundsToView,
  
  // Utility functions
  distance,
  distanceSquared,
  findClosestPoint
};
