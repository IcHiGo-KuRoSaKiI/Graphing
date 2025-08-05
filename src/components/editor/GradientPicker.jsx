// Advanced gradient picker component for the Properties Editor
// Provides both simple and advanced gradient controls

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, Plus, X, Palette } from 'lucide-react';
import { 
  GRADIENT_TYPES, 
  GRADIENT_DIRECTIONS, 
  createGradient, 
  gradientToCss, 
  cssToGradient, 
  getGradientPresets,
  ensureBackwardCompatibility 
} from '../utils/gradientUtils';

const GradientPicker = ({ 
  value, 
  onChange, 
  label = "Background", 
  disabled = false,
  showPresets = true,
  allowPatterns = false 
}) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [gradientDef, setGradientDef] = useState(() => {
    // Initialize from value - could be color string or gradient object
    if (typeof value === 'string') {
      return cssToGradient(value);
    }
    return value || createGradient(GRADIENT_TYPES.SOLID, [{ color: '#ffffff', position: 0 }]);
  });

  // Update gradient definition when value changes externally
  useEffect(() => {
    if (typeof value === 'string') {
      setGradientDef(cssToGradient(value));
    } else if (value) {
      setGradientDef(value);
    }
  }, [value]);

  // Handle gradient changes
  const handleGradientChange = useCallback((newGradientDef) => {
    setGradientDef(newGradientDef);
    const cssValue = gradientToCss(newGradientDef);
    onChange(cssValue);
  }, [onChange]);

  // Handle type change
  const handleTypeChange = useCallback((newType) => {
    const newGradient = { ...gradientDef, type: newType };
    
    // Ensure we have at least 2 colors for gradients
    if (newType !== GRADIENT_TYPES.SOLID && newGradient.colors.length < 2) {
      newGradient.colors = [
        { color: newGradient.colors[0]?.color || '#3b82f6', position: 0 },
        { color: '#6366f1', position: 100 }
      ];
    }
    
    handleGradientChange(newGradient);
  }, [gradientDef, handleGradientChange]);

  // Handle direction change
  const handleDirectionChange = useCallback((newDirection) => {
    handleGradientChange({ ...gradientDef, direction: newDirection });
  }, [gradientDef, handleGradientChange]);

  // Add color stop
  const addColorStop = useCallback(() => {
    const colors = [...gradientDef.colors];
    const newPosition = colors.length > 0 ? Math.min(100, Math.max(...colors.map(c => c.position)) + 25) : 50;
    colors.push({ color: '#6366f1', position: newPosition });
    handleGradientChange({ ...gradientDef, colors });
  }, [gradientDef, handleGradientChange]);

  // Remove color stop
  const removeColorStop = useCallback((index) => {
    if (gradientDef.colors.length <= 1) return; // Keep at least one color
    const colors = gradientDef.colors.filter((_, i) => i !== index);
    handleGradientChange({ ...gradientDef, colors });
  }, [gradientDef, handleGradientChange]);

  // Update color stop
  const updateColorStop = useCallback((index, updates) => {
    const colors = [...gradientDef.colors];
    colors[index] = { ...colors[index], ...updates };
    handleGradientChange({ ...gradientDef, colors });
  }, [gradientDef, handleGradientChange]);

  // Apply preset
  const applyPreset = useCallback((presetGradient) => {
    handleGradientChange(presetGradient);
  }, [handleGradientChange]);

  // Render color stop editor
  const renderColorStop = (colorStop, index) => (
    <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
      <input
        type="color"
        value={colorStop.color}
        onChange={(e) => updateColorStop(index, { color: e.target.value })}
        className="w-8 h-8 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
        disabled={disabled}
      />
      <input
        type="text"
        value={colorStop.color}
        onChange={(e) => updateColorStop(index, { color: e.target.value })}
        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded font-mono"
        disabled={disabled}
      />
      <input
        type="number"
        value={colorStop.position}
        onChange={(e) => updateColorStop(index, { position: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
        min="0"
        max="100"
        className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
        disabled={disabled}
      />
      <span className="text-xs text-gray-500">%</span>
      {gradientDef.colors.length > 1 && (
        <button
          onClick={() => removeColorStop(index)}
          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
          disabled={disabled}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );

  // Get current CSS value for preview
  const previewStyle = {
    background: ensureBackwardCompatibility(gradientDef),
    width: '100%',
    height: '40px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb'
  };

  const presets = getGradientPresets();

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </label>
      
      {/* Preview */}
      <div className="mb-3">
        <div style={previewStyle} />
      </div>

      {/* Type selector */}
      <div className="mb-3">
        <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Type:</label>
        <select
          value={gradientDef.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={disabled}
        >
          <option value={GRADIENT_TYPES.SOLID}>Solid Color</option>
          <option value={GRADIENT_TYPES.LINEAR}>Linear Gradient</option>
          <option value={GRADIENT_TYPES.RADIAL}>Radial Gradient</option>
          <option value={GRADIENT_TYPES.CONIC}>Conic Gradient</option>
        </select>
      </div>

      {/* Simple solid color mode */}
      {gradientDef.type === GRADIENT_TYPES.SOLID && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={gradientDef.colors[0]?.color || '#ffffff'}
            onChange={(e) => updateColorStop(0, { color: e.target.value })}
            className="w-12 h-10 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            disabled={disabled}
          />
          <input
            type="text"
            value={gradientDef.colors[0]?.color || '#ffffff'}
            onChange={(e) => updateColorStop(0, { color: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            disabled={disabled}
          />
        </div>
      )}

      {/* Gradient controls */}
      {gradientDef.type !== GRADIENT_TYPES.SOLID && (
        <div>
          {/* Direction selector for linear gradients */}
          {gradientDef.type === GRADIENT_TYPES.LINEAR && (
            <div className="mb-3">
              <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Direction:</label>
              <select
                value={gradientDef.direction}
                onChange={(e) => handleDirectionChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={disabled}
              >
                {Object.entries(GRADIENT_DIRECTIONS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value.replace('to ', '').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Color stops */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Colors:</label>
              <button
                onClick={addColorStop}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
                disabled={disabled}
              >
                <Plus size={12} />
                Add
              </button>
            </div>
            {gradientDef.colors.map((colorStop, index) => renderColorStop(colorStop, index))}
          </div>
        </div>
      )}

      {/* Presets */}
      {showPresets && (
        <div className="mb-3">
          <button
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ChevronRight className={`transition-transform ${isAdvancedMode ? 'rotate-90' : ''}`} size={12} />
            Presets
          </button>
          
          {isAdvancedMode && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {Object.entries(presets).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => applyPreset(preset)}
                  className="relative h-8 rounded border border-gray-300 dark:border-gray-600 hover:border-indigo-500 overflow-hidden group"
                  style={{ background: gradientToCss(preset) }}
                  disabled={disabled}
                  title={name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center">
                    <span className="text-xs text-white opacity-0 group-hover:opacity-100 drop-shadow">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GradientPicker;