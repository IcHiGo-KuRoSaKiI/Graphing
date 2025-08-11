/**
 * Edge & Arrow System - Module A Index
 * Foundation layer: Types, Coordinates, and Snap
 */

// Export all Module A components
export * from './edgeTypes.js';
export * from './coordinateTransforms.js';
export * from './gridSnapping.js';

// Re-export commonly used items for convenience
export {
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
} from './edgeTypes.js';

export {
  modelToView,
  viewToModel,
  modelToScreen,
  screenToModel,
  getZoomAwareTolerance,
  getZoomAwareHandleSize,
  getZoomAwareStrokeWidth,
  roundToDevicePixels,
  roundPointToDevicePixels,
  distance,
  distanceSquared,
  findClosestPoint
} from './coordinateTransforms.js';

export {
  DEFAULT_GRID_CONFIG,
  snapScalar,
  snapPoint,
  snapPoints,
  createGridConfig,
  validateGridConfig
} from './gridSnapping.js';
