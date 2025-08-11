/**
 * Edge & Arrow System - Perimeter Intersection
 * Module B1: Perimeter intersection for rect, rounded-rect, ellipse
 */

import { SIDES } from './edgeTypes.js';

// ============================================================================
// SHAPE TYPES
// ============================================================================

/**
 * @typedef {Object} Rect
 * @property {number} x - Left edge
 * @property {number} y - Top edge
 * @property {number} width - Width
 * @property {number} height - Height
 */

/**
 * @typedef {Object} RoundedRect
 * @property {number} x - Left edge
 * @property {number} y - Top edge
 * @property {number} width - Width
 * @property {number} height - Height
 * @property {number} rx - X radius of corners
 * @property {number} ry - Y radius of corners
 */

/**
 * @typedef {Object} Ellipse
 * @property {number} cx - Center X
 * @property {number} cy - Center Y
 * @property {number} rx - X radius
 * @property {number} ry - Y radius
 */

/**
 * @typedef {Object} IntersectionResult
 * @property {Point} point - Intersection point
 * @property {Side} side - Side where intersection occurred
 */

// ============================================================================
// RECTANGLE PERIMETER INTERSECTION
// ============================================================================

/**
 * Find intersection of a ray with rectangle perimeter
 * @param {Rect} rect - Rectangle bounds
 * @param {Point} origin - Ray origin point
 * @param {Point} direction - Ray direction vector (normalized)
 * @returns {IntersectionResult} Intersection point and side
 */
export function intersectRectPerimeter(rect, origin, direction) {
  if (!rect || !origin || !direction) {
    return null;
  }
  
  const { x, y, width, height } = rect;
  const right = x + width;
  const bottom = y + height;
  
  // Calculate intersection with each edge
  const intersections = [];
  
  // Top edge (y = rect.y)
  if (Math.abs(direction.y) > 1e-6) {
    const t = (y - origin.y) / direction.y;
    if (t > 0) {
      const ix = origin.x + direction.x * t;
      if (ix >= x && ix <= right) {
        intersections.push({ t, point: { x: ix, y }, side: SIDES.NORTH });
      }
    }
  }
  
  // Right edge (x = rect.x + width)
  if (Math.abs(direction.x) > 1e-6) {
    const t = (right - origin.x) / direction.x;
    if (t > 0) {
      const iy = origin.y + direction.y * t;
      if (iy >= y && iy <= bottom) {
        intersections.push({ t, point: { x: right, y: iy }, side: SIDES.EAST });
      }
    }
  }
  
  // Bottom edge (y = rect.y + height)
  if (Math.abs(direction.y) > 1e-6) {
    const t = (bottom - origin.y) / direction.y;
    if (t > 0) {
      const ix = origin.x + direction.x * t;
      if (ix >= x && ix <= right) {
        intersections.push({ t, point: { x: ix, y: bottom }, side: SIDES.SOUTH });
      }
    }
  }
  
  // Left edge (x = rect.x)
  if (Math.abs(direction.x) > 1e-6) {
    const t = (x - origin.x) / direction.x;
    if (t > 0) {
      const iy = origin.y + direction.y * t;
      if (iy >= y && iy <= bottom) {
        intersections.push({ t, point: { x, y: iy }, side: SIDES.WEST });
      }
    }
  }
  
  // Return closest intersection
  if (intersections.length === 0) {
    return null;
  }
  
  const closest = intersections.reduce((min, current) => 
    current.t < min.t ? current : min
  );
  
  return {
    point: closest.point,
    side: closest.side
  };
}

// ============================================================================
// ROUNDED RECTANGLE PERIMETER INTERSECTION
// ============================================================================

/**
 * Find intersection of a ray with rounded rectangle perimeter
 * @param {RoundedRect} roundedRect - Rounded rectangle bounds
 * @param {Point} origin - Ray origin point
 * @param {Point} direction - Ray direction vector (normalized)
 * @returns {IntersectionResult} Intersection point and side
 */
export function intersectRoundedRectPerimeter(roundedRect, origin, direction) {
  if (!roundedRect || !origin || !direction) {
    return null;
  }
  
  const { x, y, width, height, rx, ry } = roundedRect;
  const right = x + width;
  const bottom = y + height;
  
  // Clamp corner radii to prevent overlap
  const maxRx = Math.min(rx, width / 2);
  const maxRy = Math.min(ry, height / 2);
  
  // Check if ray intersects with corner circles
  const cornerIntersections = [];
  
  // Top-left corner
  const tlCenter = { x: x + maxRx, y: y + maxRy };
  const tlIntersection = intersectCirclePerimeter(tlCenter, maxRx, maxRy, origin, direction);
  if (tlIntersection && tlIntersection.point.x <= x + maxRx && tlIntersection.point.y <= y + maxRy) {
    cornerIntersections.push({ ...tlIntersection, side: SIDES.NORTH });
  }
  
  // Top-right corner
  const trCenter = { x: right - maxRx, y: y + maxRy };
  const trIntersection = intersectCirclePerimeter(trCenter, maxRx, maxRy, origin, direction);
  if (trIntersection && trIntersection.point.x >= right - maxRx && trIntersection.point.y <= y + maxRy) {
    cornerIntersections.push({ ...trIntersection, side: SIDES.NORTH });
  }
  
  // Bottom-right corner
  const brCenter = { x: right - maxRx, y: bottom - maxRy };
  const brIntersection = intersectCirclePerimeter(brCenter, maxRx, maxRy, origin, direction);
  if (brIntersection && brIntersection.point.x >= right - maxRx && brIntersection.point.y >= bottom - maxRy) {
    cornerIntersections.push({ ...brIntersection, side: SIDES.SOUTH });
  }
  
  // Bottom-left corner
  const blCenter = { x: x + maxRx, y: bottom - maxRy };
  const blIntersection = intersectCirclePerimeter(blCenter, maxRx, maxRy, origin, direction);
  if (blIntersection && blIntersection.point.x <= x + maxRx && blIntersection.point.y >= bottom - maxRy) {
    cornerIntersections.push({ ...blIntersection, side: SIDES.SOUTH });
  }
  
  // Check straight edges (excluding corner areas)
  const straightIntersections = [];
  
  // Top edge (excluding corners)
  if (Math.abs(direction.y) > 1e-6) {
    const t = (y - origin.y) / direction.y;
    if (t > 0) {
      const ix = origin.x + direction.x * t;
      if (ix >= x + maxRx && ix <= right - maxRx) {
        straightIntersections.push({ t, point: { x: ix, y }, side: SIDES.NORTH });
      }
    }
  }
  
  // Right edge (excluding corners)
  if (Math.abs(direction.x) > 1e-6) {
    const t = (right - origin.x) / direction.x;
    if (t > 0) {
      const iy = origin.y + direction.y * t;
      if (iy >= y + maxRy && iy <= bottom - maxRy) {
        straightIntersections.push({ t, point: { x: right, y: iy }, side: SIDES.EAST });
      }
    }
  }
  
  // Bottom edge (excluding corners)
  if (Math.abs(direction.y) > 1e-6) {
    const t = (bottom - origin.y) / direction.y;
    if (t > 0) {
      const ix = origin.x + direction.x * t;
      if (ix >= x + maxRx && ix <= right - maxRx) {
        straightIntersections.push({ t, point: { x: ix, y: bottom }, side: SIDES.SOUTH });
      }
    }
  }
  
  // Left edge (excluding corners)
  if (Math.abs(direction.x) > 1e-6) {
    const t = (x - origin.x) / direction.x;
    if (t > 0) {
      const iy = origin.y + direction.y * t;
      if (iy >= y + maxRy && iy <= bottom - maxRy) {
        straightIntersections.push({ t, point: { x, y: iy }, side: SIDES.WEST });
      }
    }
  }
  
  // Combine all intersections and find closest
  const allIntersections = [...cornerIntersections, ...straightIntersections];
  
  if (allIntersections.length === 0) {
    return null;
  }
  
  const closest = allIntersections.reduce((min, current) => 
    current.t < min.t ? current : min
  );
  
  return {
    point: closest.point,
    side: closest.side
  };
}

// ============================================================================
// ELLIPSE PERIMETER INTERSECTION
// ============================================================================

/**
 * Find intersection of a ray with ellipse perimeter
 * @param {Ellipse} ellipse - Ellipse parameters
 * @param {Point} origin - Ray origin point
 * @param {Point} direction - Ray direction vector (normalized)
 * @returns {IntersectionResult} Intersection point and side
 */
export function intersectEllipsePerimeter(ellipse, origin, direction) {
  if (!ellipse || !origin || !direction) {
    return null;
  }
  
  const { cx, cy, rx, ry } = ellipse;
  
  // Transform to unit circle space
  const dx = origin.x - cx;
  const dy = origin.y - cy;
  const ux = direction.x / rx;
  const uy = direction.y / ry;
  
  // Solve quadratic equation for intersection
  const a = ux * ux + uy * uy;
  const b = 2 * (dx * ux / rx + dy * uy / ry);
  const c = (dx / rx) * (dx / rx) + (dy / ry) * (dy / ry) - 1;
  
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant < 0) {
    return null; // No intersection
  }
  
  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);
  
  // Use positive t value (ray going outward)
  const t = t1 > 0 ? t1 : t2 > 0 ? t2 : null;
  
  if (t === null || t <= 0) {
    return null;
  }
  
  // Calculate intersection point
  const point = {
    x: origin.x + direction.x * t,
    y: origin.y + direction.y * t
  };
  
  // Determine side based on angle from center
  const angle = Math.atan2(point.y - cy, point.x - cx);
  const side = getSideFromAngle(angle);
  
  return { point, side };
}

/**
 * Find intersection of a ray with circle perimeter (for rounded rect corners)
 * @param {Point} center - Circle center
 * @param {number} rx - X radius
 * @param {number} ry - Y radius
 * @param {Point} origin - Ray origin point
 * @param {Point} direction - Ray direction vector (normalized)
 * @returns {IntersectionResult} Intersection point and side
 */
function intersectCirclePerimeter(center, rx, ry, origin, direction) {
  // Treat as ellipse with given radii
  const ellipse = { cx: center.x, cy: center.y, rx, ry };
  return intersectEllipsePerimeter(ellipse, origin, direction);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get side from angle (in radians)
 * @param {number} angle - Angle in radians
 * @returns {Side} Side constant
 */
function getSideFromAngle(angle) {
  // Normalize angle to [0, 2π)
  const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  
  // Map angle ranges to sides
  if (normalizedAngle >= Math.PI / 4 && normalizedAngle < 3 * Math.PI / 4) {
    return SIDES.SOUTH; // 45° to 135°
  } else if (normalizedAngle >= 3 * Math.PI / 4 && normalizedAngle < 5 * Math.PI / 4) {
    return SIDES.WEST; // 135° to 225°
  } else if (normalizedAngle >= 5 * Math.PI / 4 && normalizedAngle < 7 * Math.PI / 4) {
    return SIDES.NORTH; // 225° to 315°
  } else {
    return SIDES.EAST; // 315° to 45°
  }
}

/**
 * Create a direction vector from side
 * @param {Side} side - Side constant
 * @returns {Point} Normalized direction vector
 */
export function getDirectionFromSide(side) {
  switch (side) {
    case SIDES.NORTH:
      return { x: 0, y: -1 };
    case SIDES.EAST:
      return { x: 1, y: 0 };
    case SIDES.SOUTH:
      return { x: 0, y: 1 };
    case SIDES.WEST:
      return { x: -1, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Get the normal vector for a side (outward pointing)
 * @param {Side} side - Side constant
 * @returns {Point} Normal vector
 */
export function getNormalFromSide(side) {
  return getDirectionFromSide(side);
}

/**
 * Check if a point is inside a rectangle
 * @param {Point} point - Point to test
 * @param {Rect} rect - Rectangle bounds
 * @returns {boolean} True if point is inside
 */
export function isPointInRect(point, rect) {
  if (!point || !rect) return false;
  
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width &&
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}

/**
 * Check if a point is inside an ellipse
 * @param {Point} point - Point to test
 * @param {Ellipse} ellipse - Ellipse parameters
 * @returns {boolean} True if point is inside
 */
export function isPointInEllipse(point, ellipse) {
  if (!point || !ellipse) return false;
  
  const { cx, cy, rx, ry } = ellipse;
  const dx = point.x - cx;
  const dy = point.y - cy;
  
  return (dx / rx) * (dx / rx) + (dy / ry) * (dy / ry) <= 1;
}

export default {
  intersectRectPerimeter,
  intersectRoundedRectPerimeter,
  intersectEllipsePerimeter,
  getDirectionFromSide,
  getNormalFromSide,
  isPointInRect,
  isPointInEllipse
};
