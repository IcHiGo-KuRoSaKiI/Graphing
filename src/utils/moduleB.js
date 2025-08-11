/**
 * Edge & Arrow System - Module B Index
 * Ports, Anchors, and Jetty layer
 */

// Export all Module B components
export * from './perimeterIntersection.js';
export * from './anchorPoint.js';
export * from './jetty.js';

// Re-export commonly used items for convenience
export {
  intersectRectPerimeter,
  intersectRoundedRectPerimeter,
  intersectEllipsePerimeter,
  getDirectionFromSide,
  getNormalFromSide,
  isPointInRect,
  isPointInEllipse
} from './perimeterIntersection.js';

export {
  anchorPoint,
  getBestSide,
  createDefaultPortForNode,
  validatePortForNode
} from './anchorPoint.js';

export {
  DEFAULT_JETTY_CONFIG,
  jetty,
  jettyWithSize,
  unjetty,
  jettyPoints,
  unjettyPoints,
  jettyEdgeEndpoints,
  calculateAdaptiveJettySize,
  createJettyConfig,
  validateJettyConfig,
  hasJettyOffset,
  getJettyOffset
} from './jetty.js';
