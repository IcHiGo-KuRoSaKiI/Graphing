// Shadow and effects utility functions for advanced styling
// Provides professional shadow effects and visual enhancements

export const SHADOW_TYPES = {
  NONE: 'none',
  DROP_SHADOW: 'drop-shadow',
  BOX_SHADOW: 'box-shadow',
  INNER_SHADOW: 'inner-shadow',
  GLOW: 'glow',
  MULTI_LAYER: 'multi-layer'
};

export const SHADOW_PRESETS = {
  // No shadow
  none: {
    type: SHADOW_TYPES.NONE,
    shadows: []
  },
  
  // Subtle shadows
  subtle: {
    type: SHADOW_TYPES.BOX_SHADOW,
    shadows: [
      { x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0, 0, 0, 0.1)' }
    ]
  },
  
  // Standard drop shadows
  small: {
    type: SHADOW_TYPES.BOX_SHADOW,
    shadows: [
      { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0, 0, 0, 0.15)' }
    ]
  },
  
  medium: {
    type: SHADOW_TYPES.BOX_SHADOW,
    shadows: [
      { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0, 0, 0, 0.15)' }
    ]
  },
  
  large: {
    type: SHADOW_TYPES.BOX_SHADOW,
    shadows: [
      { x: 0, y: 8, blur: 16, spread: 0, color: 'rgba(0, 0, 0, 0.15)' }
    ]
  },
  
  // Elevated shadows
  elevated: {
    type: SHADOW_TYPES.BOX_SHADOW,
    shadows: [
      { x: 0, y: 4, blur: 12, spread: -2, color: 'rgba(0, 0, 0, 0.12)' },
      { x: 0, y: 8, blur: 24, spread: -4, color: 'rgba(0, 0, 0, 0.08)' }
    ]
  },
  
  // Floating effect
  floating: {
    type: SHADOW_TYPES.BOX_SHADOW,
    shadows: [
      { x: 0, y: 12, blur: 20, spread: -8, color: 'rgba(0, 0, 0, 0.2)' },
      { x: 0, y: 4, blur: 8, spread: -2, color: 'rgba(0, 0, 0, 0.1)' }
    ]
  },
  
  // Glow effects
  blueGlow: {
    type: SHADOW_TYPES.GLOW,
    shadows: [
      { x: 0, y: 0, blur: 8, spread: 0, color: 'rgba(59, 130, 246, 0.5)' }
    ]
  },
  
  greenGlow: {
    type: SHADOW_TYPES.GLOW,
    shadows: [
      { x: 0, y: 0, blur: 8, spread: 0, color: 'rgba(34, 197, 94, 0.5)' }
    ]
  },
  
  // Inner shadows
  inset: {
    type: SHADOW_TYPES.INNER_SHADOW,
    shadows: [
      { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0, 0, 0, 0.1)', inset: true }
    ]
  },
  
  // Professional card style
  card: {
    type: SHADOW_TYPES.BOX_SHADOW,
    shadows: [
      { x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0, 0, 0, 0.12)' },
      { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0, 0, 0, 0.24)' }
    ]
  }
};

/**
 * Creates a shadow definition object
 * @param {string} type - Type of shadow effect
 * @param {Array} shadows - Array of shadow objects
 * @returns {Object} Shadow definition
 */
export const createShadow = (type = SHADOW_TYPES.NONE, shadows = []) => {
  return {
    type,
    shadows: shadows || []
  };
};

/**
 * Converts shadow definition to CSS box-shadow string
 * @param {Object|string} shadowDef - Shadow definition object or 'none'
 * @returns {string} CSS box-shadow value
 */
export const shadowToCss = (shadowDef) => {
  // Backward compatibility: if it's a string, return as-is
  if (typeof shadowDef === 'string') {
    return shadowDef;
  }

  // If no shadow definition or none type, return none
  if (!shadowDef || shadowDef.type === SHADOW_TYPES.NONE || !shadowDef.shadows?.length) {
    return 'none';
  }

  const { shadows } = shadowDef;

  // Convert shadow objects to CSS strings
  const shadowStrings = shadows.map(shadow => {
    const { x = 0, y = 0, blur = 0, spread = 0, color = 'rgba(0, 0, 0, 0.15)', inset = false } = shadow;
    const insetStr = inset ? 'inset ' : '';
    const spreadStr = spread !== 0 ? ` ${spread}px` : '';
    return `${insetStr}${x}px ${y}px ${blur}px${spreadStr} ${color}`;
  });

  return shadowStrings.join(', ');
};

/**
 * Parses CSS box-shadow to shadow definition (basic implementation)
 * @param {string} cssBoxShadow - CSS box-shadow value
 * @returns {Object} Shadow definition object
 */
export const cssToShadow = (cssBoxShadow) => {
  if (!cssBoxShadow || cssBoxShadow === 'none') {
    return createShadow(SHADOW_TYPES.NONE);
  }

  // Simple parsing - for complex shadows, this is a basic implementation
  // In production, you might want a more robust parser
  try {
    const shadowStrings = cssBoxShadow.split(', ');
    const shadows = shadowStrings.map(shadowStr => {
      const parts = shadowStr.trim().split(/\s+/);
      const inset = parts[0] === 'inset';
      const startIndex = inset ? 1 : 0;
      
      return {
        x: parseInt(parts[startIndex]) || 0,
        y: parseInt(parts[startIndex + 1]) || 0,
        blur: parseInt(parts[startIndex + 2]) || 0,
        spread: parseInt(parts[startIndex + 3]) || 0,
        color: parts.slice(startIndex + 4).join(' ') || 'rgba(0, 0, 0, 0.15)',
        inset
      };
    });

    return createShadow(SHADOW_TYPES.BOX_SHADOW, shadows);
  } catch (error) {
    console.warn('Failed to parse shadow CSS:', error);
    return createShadow(SHADOW_TYPES.NONE);
  }
};

/**
 * Gets shadow presets organized by category
 * @returns {Object} Categorized shadow presets
 */
export const getShadowPresets = () => {
  return {
    basic: {
      none: SHADOW_PRESETS.none,
      subtle: SHADOW_PRESETS.subtle,
      small: SHADOW_PRESETS.small,
      medium: SHADOW_PRESETS.medium,
      large: SHADOW_PRESETS.large
    },
    elevated: {
      elevated: SHADOW_PRESETS.elevated,
      floating: SHADOW_PRESETS.floating,
      card: SHADOW_PRESETS.card
    },
    effects: {
      blueGlow: SHADOW_PRESETS.blueGlow,
      greenGlow: SHADOW_PRESETS.greenGlow,
      inset: SHADOW_PRESETS.inset
    }
  };
};

/**
 * Creates custom shadow with common parameters
 * @param {Object} options - Shadow options
 * @returns {Object} Shadow definition
 */
export const createCustomShadow = ({
  offsetX = 0,
  offsetY = 4,
  blur = 8,
  spread = 0,
  color = 'rgba(0, 0, 0, 0.15)',
  inset = false
} = {}) => {
  return createShadow(SHADOW_TYPES.BOX_SHADOW, [{
    x: offsetX,
    y: offsetY,
    blur,
    spread,
    color,
    inset
  }]);
};

/**
 * Validates shadow definition
 * @param {Object} shadowDef - Shadow definition to validate
 * @returns {boolean} True if valid
 */
export const isValidShadow = (shadowDef) => {
  if (!shadowDef || typeof shadowDef !== 'object') {
    return false;
  }

  const { type, shadows } = shadowDef;
  
  if (!Object.values(SHADOW_TYPES).includes(type)) {
    return false;
  }

  if (type === SHADOW_TYPES.NONE) {
    return true; // None type doesn't need shadows array
  }

  if (!Array.isArray(shadows)) {
    return false;
  }

  // Validate shadow objects
  for (const shadow of shadows) {
    if (typeof shadow !== 'object' || !shadow.color) {
      return false;
    }
  }

  return true;
};

/**
 * Ensures backward compatibility with existing shadow properties
 * @param {*} shadowOrString - Either a shadow object or CSS string
 * @returns {string} CSS box-shadow value
 */
export const ensureShadowCompatibility = (shadowOrString) => {
  if (typeof shadowOrString === 'string') {
    return shadowOrString;
  }
  
  if (isValidShadow(shadowOrString)) {
    return shadowToCss(shadowOrString);
  }
  
  // Fallback to no shadow if invalid
  return 'none';
};

/**
 * Creates opacity effect
 * @param {number} opacity - Opacity value (0-1)
 * @returns {number} Clamped opacity value
 */
export const createOpacity = (opacity = 1) => {
  return Math.max(0, Math.min(1, opacity));
};