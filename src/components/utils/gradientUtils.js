// Gradient utility functions for advanced styling
// Provides backward compatibility with existing solid color system

export const GRADIENT_TYPES = {
  SOLID: 'solid',
  LINEAR: 'linear',
  RADIAL: 'radial',
  CONIC: 'conic'
};

export const GRADIENT_DIRECTIONS = {
  TO_RIGHT: 'to right',
  TO_LEFT: 'to left',
  TO_BOTTOM: 'to bottom',
  TO_TOP: 'to top',
  TO_BOTTOM_RIGHT: 'to bottom right',
  TO_BOTTOM_LEFT: 'to bottom left',
  TO_TOP_RIGHT: 'to top right',
  TO_TOP_LEFT: 'to top left'
};

/**
 * Creates a gradient definition object
 * @param {string} type - Type of gradient (solid, linear, radial, conic)
 * @param {Array} colors - Array of color objects {color: string, position: number}
 * @param {string} direction - Direction for linear gradients
 * @param {Object} options - Additional options (center, shape, etc.)
 * @returns {Object} Gradient definition
 */
export const createGradient = (type = GRADIENT_TYPES.SOLID, colors = [], direction = GRADIENT_DIRECTIONS.TO_RIGHT, options = {}) => {
  return {
    type,
    colors: colors.length > 0 ? colors : [{ color: '#ffffff', position: 0 }],
    direction,
    options: {
      center: options.center || [50, 50], // [x%, y%]
      shape: options.shape || 'ellipse', // for radial gradients
      ...options
    }
  };
};

/**
 * Converts gradient definition to CSS background string
 * @param {Object|string} gradientDef - Gradient definition object or solid color string
 * @returns {string} CSS background value
 */
export const gradientToCss = (gradientDef) => {
  // Backward compatibility: if it's a string, treat as solid color
  if (typeof gradientDef === 'string') {
    return gradientDef;
  }

  // If no gradient definition or solid type, return solid color
  if (!gradientDef || gradientDef.type === GRADIENT_TYPES.SOLID) {
    const color = gradientDef?.colors?.[0]?.color || '#ffffff';
    return color;
  }

  const { type, colors, direction, options } = gradientDef;

  // Build color stops string
  const colorStops = colors
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');

  switch (type) {
    case GRADIENT_TYPES.LINEAR:
      return `linear-gradient(${direction}, ${colorStops})`;
    
    case GRADIENT_TYPES.RADIAL:
      const shape = options.shape || 'ellipse';
      const center = options.center || [50, 50];
      return `radial-gradient(${shape} at ${center[0]}% ${center[1]}%, ${colorStops})`;
    
    case GRADIENT_TYPES.CONIC:
      const conicCenter = options.center || [50, 50];
      const angle = options.angle || 0;
      return `conic-gradient(from ${angle}deg at ${conicCenter[0]}% ${conicCenter[1]}%, ${colorStops})`;
    
    default:
      return colors[0]?.color || '#ffffff';
  }
};

/**
 * Parses CSS background to gradient definition (best effort)
 * @param {string} cssBackground - CSS background value
 * @returns {Object} Gradient definition object
 */
export const cssToGradient = (cssBackground) => {
  if (!cssBackground || typeof cssBackground !== 'string') {
    return createGradient(GRADIENT_TYPES.SOLID, [{ color: '#ffffff', position: 0 }]);
  }

  // Check if it's a gradient
  if (cssBackground.includes('linear-gradient')) {
    // Simple linear gradient parsing (basic implementation)
    const match = cssBackground.match(/linear-gradient\((.*?)\)/);
    if (match) {
      const parts = match[1].split(',').map(s => s.trim());
      const direction = parts[0].startsWith('to ') ? parts[0] : GRADIENT_DIRECTIONS.TO_RIGHT;
      const colors = parts.slice(direction === parts[0] ? 1 : 0).map((part, index) => {
        const colorMatch = part.match(/^(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgba?\([^)]+\)|[a-zA-Z]+)/);
        const positionMatch = part.match(/(\d+(?:\.\d+)?)%/);
        return {
          color: colorMatch ? colorMatch[0] : '#ffffff',
          position: positionMatch ? parseFloat(positionMatch[1]) : (index * 100 / Math.max(1, parts.length - 1))
        };
      });
      return createGradient(GRADIENT_TYPES.LINEAR, colors, direction);
    }
  }

  // Treat as solid color
  return createGradient(GRADIENT_TYPES.SOLID, [{ color: cssBackground, position: 0 }]);
};

/**
 * Creates common gradient presets
 * @returns {Object} Object with preset gradient definitions
 */
export const getGradientPresets = () => {
  return {
    // Solid colors (for backward compatibility)
    white: createGradient(GRADIENT_TYPES.SOLID, [{ color: '#ffffff', position: 0 }]),
    lightGray: createGradient(GRADIENT_TYPES.SOLID, [{ color: '#f5f5f5', position: 0 }]),
    blue: createGradient(GRADIENT_TYPES.SOLID, [{ color: '#3b82f6', position: 0 }]),
    
    // Linear gradients
    blueToIndigo: createGradient(GRADIENT_TYPES.LINEAR, [
      { color: '#3b82f6', position: 0 },
      { color: '#6366f1', position: 100 }
    ], GRADIENT_DIRECTIONS.TO_RIGHT),
    
    sunsetGlow: createGradient(GRADIENT_TYPES.LINEAR, [
      { color: '#ff7e5f', position: 0 },
      { color: '#feb47b', position: 100 }
    ], GRADIENT_DIRECTIONS.TO_BOTTOM_RIGHT),
    
    oceanBreeze: createGradient(GRADIENT_TYPES.LINEAR, [
      { color: '#00c6ff', position: 0 },
      { color: '#0072ff', position: 100 }
    ], GRADIENT_DIRECTIONS.TO_BOTTOM),
    
    // Radial gradients
    spotlight: createGradient(GRADIENT_TYPES.RADIAL, [
      { color: '#ffffff', position: 0 },
      { color: '#f0f0f0', position: 100 }
    ], null, { center: [50, 50], shape: 'circle' }),
    
    // Professional gradients
    corporate: createGradient(GRADIENT_TYPES.LINEAR, [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 }
    ], GRADIENT_DIRECTIONS.TO_BOTTOM_RIGHT),
    
    modern: createGradient(GRADIENT_TYPES.LINEAR, [
      { color: '#e0e7ff', position: 0 },
      { color: '#c7d2fe', position: 50 },
      { color: '#a5b4fc', position: 100 }
    ], GRADIENT_DIRECTIONS.TO_BOTTOM)
  };
};

/**
 * Validates gradient definition
 * @param {Object} gradientDef - Gradient definition to validate
 * @returns {boolean} True if valid
 */
export const isValidGradient = (gradientDef) => {
  if (!gradientDef || typeof gradientDef !== 'object') {
    return false;
  }

  const { type, colors } = gradientDef;
  
  if (!Object.values(GRADIENT_TYPES).includes(type)) {
    return false;
  }

  if (!Array.isArray(colors) || colors.length === 0) {
    return false;
  }

  // Validate color stops
  for (const color of colors) {
    if (!color.color || typeof color.position !== 'number') {
      return false;
    }
  }

  return true;
};

/**
 * Ensures backward compatibility with existing color properties
 * @param {*} colorOrGradient - Either a color string or gradient object
 * @returns {string} CSS background value
 */
export const ensureBackwardCompatibility = (colorOrGradient) => {
  if (typeof colorOrGradient === 'string') {
    return colorOrGradient;
  }
  
  if (isValidGradient(colorOrGradient)) {
    return gradientToCss(colorOrGradient);
  }
  
  // Fallback to white if invalid
  return '#ffffff';
};