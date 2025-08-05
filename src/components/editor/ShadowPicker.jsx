// Advanced shadow picker component for the Properties Editor
// Provides professional shadow effects and visual controls

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, Plus, X, Eye } from 'lucide-react';
import { 
  SHADOW_TYPES, 
  SHADOW_PRESETS,
  createShadow, 
  shadowToCss, 
  cssToShadow, 
  getShadowPresets,
  ensureShadowCompatibility,
  createCustomShadow
} from '../utils/shadowUtils';

const ShadowPicker = ({ 
  value, 
  onChange, 
  label = "Shadow", 
  disabled = false,
  showPresets = true 
}) => {
  const [isPresetsExpanded, setIsPresetsExpanded] = useState(false);
  const [shadowDef, setShadowDef] = useState(() => {
    // Initialize from value - could be CSS string or shadow object
    if (typeof value === 'string') {
      return cssToShadow(value);
    }
    return value || createShadow(SHADOW_TYPES.NONE);
  });

  // Update shadow definition when value changes externally
  useEffect(() => {
    if (typeof value === 'string') {
      setShadowDef(cssToShadow(value));
    } else if (value) {
      setShadowDef(value);
    }
  }, [value]);

  // Handle shadow changes
  const handleShadowChange = useCallback((newShadowDef) => {
    setShadowDef(newShadowDef);
    const cssValue = shadowToCss(newShadowDef);
    onChange(cssValue);
  }, [onChange]);

  // Handle type change
  const handleTypeChange = useCallback((newType) => {
    if (newType === SHADOW_TYPES.NONE) {
      handleShadowChange(createShadow(SHADOW_TYPES.NONE));
    } else {
      // Start with a basic shadow for non-none types
      const basicShadow = createCustomShadow({ offsetY: 4, blur: 8 });
      handleShadowChange({ ...basicShadow, type: newType });
    }
  }, [handleShadowChange]);

  // Update shadow parameter
  const updateShadowParam = useCallback((index, param, value) => {
    const shadows = [...shadowDef.shadows];
    if (shadows[index]) {
      shadows[index] = { ...shadows[index], [param]: value };
      handleShadowChange({ ...shadowDef, shadows });
    }
  }, [shadowDef, handleShadowChange]);

  // Add shadow layer
  const addShadowLayer = useCallback(() => {
    const shadows = [...shadowDef.shadows];
    shadows.push({ x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0, 0, 0, 0.15)' });
    handleShadowChange({ ...shadowDef, shadows });
  }, [shadowDef, handleShadowChange]);

  // Remove shadow layer
  const removeShadowLayer = useCallback((index) => {
    if (shadowDef.shadows.length <= 1) {
      handleShadowChange(createShadow(SHADOW_TYPES.NONE));
      return;
    }
    const shadows = shadowDef.shadows.filter((_, i) => i !== index);
    handleShadowChange({ ...shadowDef, shadows });
  }, [shadowDef, handleShadowChange]);

  // Apply preset
  const applyPreset = useCallback((presetShadow) => {
    handleShadowChange(presetShadow);
  }, [handleShadowChange]);

  // Render shadow layer editor
  const renderShadowLayer = (shadow, index) => (
    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Shadow Layer {index + 1}
        </span>
        {shadowDef.shadows.length > 1 && (
          <button
            onClick={() => removeShadowLayer(index)}
            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
            disabled={disabled}
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* X Offset */}
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">X:</label>
          <input
            type="number"
            value={shadow.x || 0}
            onChange={(e) => updateShadowParam(index, 'x', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
            disabled={disabled}
          />
        </div>

        {/* Y Offset */}
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Y:</label>
          <input
            type="number"
            value={shadow.y || 0}
            onChange={(e) => updateShadowParam(index, 'y', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
            disabled={disabled}
          />
        </div>

        {/* Blur */}
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Blur:</label>
          <input
            type="number"
            value={shadow.blur || 0}
            min="0"
            onChange={(e) => updateShadowParam(index, 'blur', Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
            disabled={disabled}
          />
        </div>

        {/* Spread */}
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Spread:</label>
          <input
            type="number"
            value={shadow.spread || 0}
            onChange={(e) => updateShadowParam(index, 'spread', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Color */}
      <div className="mb-2">
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Color:</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={shadow.color?.includes('rgba') ? '#000000' : (shadow.color || '#000000')}
            onChange={(e) => updateShadowParam(index, 'color', e.target.value)}
            className="w-8 h-8 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            disabled={disabled}
          />
          <input
            type="text"
            value={shadow.color || 'rgba(0, 0, 0, 0.15)'}
            onChange={(e) => updateShadowParam(index, 'color', e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded font-mono"
            placeholder="rgba(0, 0, 0, 0.15)"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Inset toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={shadow.inset || false}
            onChange={(e) => updateShadowParam(index, 'inset', e.target.checked)}
            className="rounded"
            disabled={disabled}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">Inner shadow</span>
        </label>
      </div>
    </div>
  );

  // Get current CSS value for preview
  const previewStyle = {
    background: '#ffffff',
    width: '60px',
    height: '40px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
    boxShadow: ensureShadowCompatibility(shadowDef),
    margin: '10px auto'
  };

  const presets = getShadowPresets();

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </label>
      
      {/* Preview */}
      <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded">
        <div style={previewStyle} />
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          Preview
        </div>
      </div>

      {/* Type selector */}
      <div className="mb-3">
        <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Type:</label>
        <select
          value={shadowDef.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={disabled}
        >
          <option value={SHADOW_TYPES.NONE}>No Shadow</option>
          <option value={SHADOW_TYPES.BOX_SHADOW}>Box Shadow</option>
          <option value={SHADOW_TYPES.DROP_SHADOW}>Drop Shadow</option>
          <option value={SHADOW_TYPES.GLOW}>Glow Effect</option>
          <option value={SHADOW_TYPES.MULTI_LAYER}>Multi-layer</option>
        </select>
      </div>

      {/* Shadow controls */}
      {shadowDef.type !== SHADOW_TYPES.NONE && (
        <div>
          {/* Shadow layers */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Shadow Layers:</label>
              <button
                onClick={addShadowLayer}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
                disabled={disabled}
              >
                <Plus size={12} />
                Add Layer
              </button>
            </div>
            {shadowDef.shadows.map((shadow, index) => renderShadowLayer(shadow, index))}
          </div>
        </div>
      )}

      {/* Presets */}
      {showPresets && (
        <div className="mb-3">
          <button
            onClick={() => setIsPresetsExpanded(!isPresetsExpanded)}
            className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ChevronRight className={`transition-transform ${isPresetsExpanded ? 'rotate-90' : ''}`} size={12} />
            Shadow Presets
          </button>
          
          {isPresetsExpanded && (
            <div className="mt-2">
              {Object.entries(presets).map(([categoryName, categoryPresets]) => (
                <div key={categoryName} className="mb-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {categoryName}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(categoryPresets).map(([name, preset]) => (
                      <button
                        key={name}
                        onClick={() => applyPreset(preset)}
                        className="relative p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:border-indigo-500 transition-colors"
                        style={{ boxShadow: shadowToCss(preset) }}
                        disabled={disabled}
                        title={name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      >
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {name.replace(/([A-Z])/g, ' $1')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShadowPicker;