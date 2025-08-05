// Transform utility functions for advanced node styling
// Handles rotation, scale, and other CSS transforms

/**
 * Creates a CSS transform string from transform properties
 * @param {Object} data - Node data containing transform properties
 * @returns {string} CSS transform value
 */
export const createTransform = (data = {}) => {
  const transforms = [];
  
  // Add rotation
  if (data.rotation && data.rotation !== 0) {
    transforms.push(`rotate(${data.rotation}deg)`);
  }
  
  // Add scale
  if (data.scale && data.scale !== 1) {
    transforms.push(`scale(${data.scale})`);
  }
  
  // Add translate if needed (for future expansion)
  if (data.translateX || data.translateY) {
    const x = data.translateX || 0;
    const y = data.translateY || 0;
    transforms.push(`translate(${x}px, ${y}px)`);
  }
  
  // Add skew if needed (for future expansion)
  if (data.skewX || data.skewY) {
    const x = data.skewX || 0;
    const y = data.skewY || 0;
    transforms.push(`skew(${x}deg, ${y}deg)`);
  }
  
  return transforms.length > 0 ? transforms.join(' ') : 'none';
};

/**
 * Ensures backward compatibility with transform properties
 * @param {Object} data - Node data
 * @returns {string} CSS transform value
 */
export const ensureTransformCompatibility = (data = {}) => {
  const transform = createTransform(data);
  return transform === 'none' ? undefined : transform;
};

/**
 * Gets transform origin based on node type and properties
 * @param {Object} data - Node data
 * @param {string} nodeType - Type of node (circle, diamond, etc.)
 * @returns {string} CSS transform-origin value
 */
export const getTransformOrigin = (data = {}, nodeType = 'default') => {
  // Custom transform origin if specified
  if (data.transformOrigin) {
    return data.transformOrigin;
  }
  
  // Default origins based on node type
  switch (nodeType) {
    case 'circle':
    case 'diamond':
    case 'hexagon':
    case 'triangle':
      return 'center center';
    case 'container':
    case 'component':
    default:
      return 'center center';
  }
};

/**
 * Creates animation-friendly transform styles
 * @param {Object} data - Node data
 * @param {string} nodeType - Type of node
 * @returns {Object} Style object with transform properties
 */
export const createTransformStyles = (data = {}, nodeType = 'default') => {
  const transform = ensureTransformCompatibility(data);
  
  if (!transform) {
    return {};
  }
  
  return {
    transform,
    transformOrigin: getTransformOrigin(data, nodeType),
    // Add smooth transitions for better UX
    transition: data.disableTransition 
      ? undefined 
      : 'transform 0.2s ease, opacity 0.2s ease'
  };
};