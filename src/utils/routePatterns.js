import { SIDES } from './edgeTypes.js';

/**
 * @typedef {Object} RoutePattern
 * @property {string} name - Pattern name (e.g., 'L', 'S')
 * @property {Array<{x: number, y: number}>} segments - Array of relative segment points
 * @property {Array<string>} sides - Array of sides for each segment
 */

/**
 * L-shape routing patterns for orthogonal edges
 * Maps source side to target side to available patterns
 */
export const L_PATTERNS = {
  [SIDES.NORTH]: {
    [SIDES.SOUTH]: [
      {
        name: 'L-NS',
        segments: [
          { x: 0, y: 0.5 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0.5, y: 1 }    // Midpoint of target side
        ],
        sides: [SIDES.NORTH, SIDES.EAST, SIDES.SOUTH]
      }
    ],
    [SIDES.EAST]: [
      {
        name: 'L-NE',
        segments: [
          { x: 0, y: 0.5 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 1, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.NORTH, SIDES.EAST, SIDES.EAST]
      }
    ],
    [SIDES.WEST]: [
      {
        name: 'L-NW',
        segments: [
          { x: 0, y: 0.5 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.NORTH, SIDES.WEST, SIDES.WEST]
      }
    ]
  },
  [SIDES.SOUTH]: {
    [SIDES.NORTH]: [
      {
        name: 'L-SN',
        segments: [
          { x: 0, y: 0.5 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0.5, y: 0 }    // Midpoint of target side
        ],
        sides: [SIDES.SOUTH, SIDES.EAST, SIDES.NORTH]
      }
    ],
    [SIDES.EAST]: [
      {
        name: 'L-SE',
        segments: [
          { x: 0, y: 0.5 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 1, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.SOUTH, SIDES.EAST, SIDES.EAST]
      }
    ],
    [SIDES.WEST]: [
      {
        name: 'L-SW',
        segments: [
          { x: 0, y: 0.5 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.SOUTH, SIDES.WEST, SIDES.WEST]
      }
    ]
  },
  [SIDES.EAST]: {
    [SIDES.WEST]: [
      {
        name: 'L-EW',
        segments: [
          { x: 0.5, y: 0 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0.5, y: 1 }    // Midpoint of target side
        ],
        sides: [SIDES.EAST, SIDES.SOUTH, SIDES.WEST]
      }
    ],
    [SIDES.NORTH]: [
      {
        name: 'L-EN',
        segments: [
          { x: 0.5, y: 0 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.EAST, SIDES.NORTH, SIDES.NORTH]
      }
    ],
    [SIDES.SOUTH]: [
      {
        name: 'L-ES',
        segments: [
          { x: 0.5, y: 0 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.EAST, SIDES.SOUTH, SIDES.SOUTH]
      }
    ]
  },
  [SIDES.WEST]: {
    [SIDES.EAST]: [
      {
        name: 'L-WE',
        segments: [
          { x: 0.5, y: 0 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0.5, y: 1 }    // Midpoint of target side
        ],
        sides: [SIDES.WEST, SIDES.SOUTH, SIDES.EAST]
      }
    ],
    [SIDES.NORTH]: [
      {
        name: 'L-WN',
        segments: [
          { x: 0.5, y: 0 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.WEST, SIDES.NORTH, SIDES.NORTH]
      }
    ],
    [SIDES.SOUTH]: [
      {
        name: 'L-WS',
        segments: [
          { x: 0.5, y: 0 },   // Midpoint of source side
          { x: 0.5, y: 0.5 }, // Center point
          { x: 0, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.WEST, SIDES.SOUTH, SIDES.SOUTH]
      }
    ]
  }
};

/**
 * S-shape routing patterns for orthogonal edges
 * Used when L-shape patterns are not suitable
 */
export const S_PATTERNS = {
  [SIDES.NORTH]: {
    [SIDES.NORTH]: [
      {
        name: 'S-NN',
        segments: [
          { x: 0, y: 0.5 },   // Midpoint of source side
          { x: 0, y: 0.3 },   // Above source
          { x: 0.5, y: 0.3 }, // Center above
          { x: 0.5, y: 0.7 }, // Center below
          { x: 0, y: 0.7 },   // Below source
          { x: 0, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.NORTH, SIDES.NORTH, SIDES.EAST, SIDES.SOUTH, SIDES.NORTH, SIDES.NORTH]
      }
    ]
  },
  [SIDES.SOUTH]: {
    [SIDES.SOUTH]: [
      {
        name: 'S-SS',
        segments: [
          { x: 0, y: 0.5 },   // Midpoint of source side
          { x: 0, y: 0.7 },   // Below source
          { x: 0.5, y: 0.7 }, // Center below
          { x: 0.5, y: 0.3 }, // Center above
          { x: 0, y: 0.3 },   // Above source
          { x: 0, y: 0.5 }    // Midpoint of target side
        ],
        sides: [SIDES.SOUTH, SIDES.SOUTH, SIDES.EAST, SIDES.NORTH, SIDES.SOUTH, SIDES.SOUTH]
      }
    ]
  },
  [SIDES.EAST]: {
    [SIDES.EAST]: [
      {
        name: 'S-EE',
        segments: [
          { x: 0.5, y: 0 },   // Midpoint of source side
          { x: 0.7, y: 0 },   // Right of source
          { x: 0.7, y: 0.5 }, // Center right
          { x: 0.3, y: 0.5 }, // Center left
          { x: 0.3, y: 0 },   // Left of source
          { x: 0.5, y: 0 }    // Midpoint of target side
        ],
        sides: [SIDES.EAST, SIDES.EAST, SIDES.SOUTH, SIDES.NORTH, SIDES.EAST, SIDES.EAST]
      }
    ]
  },
  [SIDES.WEST]: {
    [SIDES.WEST]: [
      {
        name: 'S-WW',
        segments: [
          { x: 0.5, y: 0 },   // Midpoint of source side
          { x: 0.3, y: 0 },   // Left of source
          { x: 0.3, y: 0.5 }, // Center left
          { x: 0.7, y: 0.5 }, // Center right
          { x: 0.7, y: 0 },   // Right of source
          { x: 0.5, y: 0 }    // Midpoint of target side
        ],
        sides: [SIDES.WEST, SIDES.WEST, SIDES.SOUTH, SIDES.NORTH, SIDES.WEST, SIDES.WEST]
      }
    ]
  }
};

/**
 * Get available L-shape patterns for a source-target side combination
 * @param {string} sourceSide - Source side
 * @param {string} targetSide - Target side
 * @returns {Array<RoutePattern>} Available patterns
 */
export function getLPatterns(sourceSide, targetSide) {
  return L_PATTERNS[sourceSide]?.[targetSide] || [];
}

/**
 * Get available S-shape patterns for a source-target side combination
 * @param {string} sourceSide - Source side
 * @param {string} targetSide - Target side
 * @returns {Array<RoutePattern>} Available patterns
 */
export function getSPatterns(sourceSide, targetSide) {
  return S_PATTERNS[sourceSide]?.[targetSide] || [];
}

/**
 * Get all available patterns for a source-target side combination
 * @param {string} sourceSide - Source side
 * @param {string} targetSide - Target side
 * @returns {Array<RoutePattern>} All available patterns
 */
export function getAllPatterns(sourceSide, targetSide) {
  const lPatterns = getLPatterns(sourceSide, targetSide);
  const sPatterns = getSPatterns(sourceSide, targetSide);
  return [...lPatterns, ...sPatterns];
}

/**
 * Check if a pattern is an L-shape pattern
 * @param {RoutePattern} pattern - Pattern to check
 * @returns {boolean} True if L-shape pattern
 */
export function isLPattern(pattern) {
  return pattern.name.startsWith('L-');
}

/**
 * Check if a pattern is an S-shape pattern
 * @param {RoutePattern} pattern - Pattern to check
 * @returns {boolean} True if S-shape pattern
 */
export function isSPattern(pattern) {
  return pattern.name.startsWith('S-');
}
