import React, { useState, useCallback } from 'react';
import { Layout, Grid, Circle, Zap, TreePine, Layers, Settings2 } from 'lucide-react';
import { layoutAlgorithms, applyLayoutAlgorithm } from '../utils/autoLayout';

const LayoutSettingsPanel = ({ 
  nodes, 
  setNodes, 
  isOpen, 
  onClose,
  currentLayoutAlgorithm = 'hierarchical',
  onLayoutChange 
}) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(currentLayoutAlgorithm);
  const [previewMode, setPreviewMode] = useState(false);

  // Group algorithms by category
  const algorithmsByCategory = Object.entries(layoutAlgorithms).reduce((acc, [key, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ key, ...config });
    return acc;
  }, {});

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Basic': return <Grid className="w-4 h-4" />;
      case 'Organization': return <Layers className="w-4 h-4" />;
      case 'Tree': return <TreePine className="w-4 h-4" />;
      case 'Special': return <Zap className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  // Get icon for specific algorithm
  const getAlgorithmIcon = (algorithm) => {
    if (algorithm.includes('circular') || algorithm.includes('radial')) {
      return <Circle className="w-4 h-4" />;
    }
    if (algorithm.includes('grid') || algorithm.includes('hanger')) {
      return <Grid className="w-4 h-4" />;
    }
    if (algorithm.includes('force') || algorithm.includes('organic')) {
      return <Zap className="w-4 h-4" />;
    }
    if (algorithm.includes('tree')) {
      return <TreePine className="w-4 h-4" />;
    }
    return <Layout className="w-4 h-4" />;
  };

  const handleAlgorithmSelect = useCallback((algorithmKey) => {
    setSelectedAlgorithm(algorithmKey);
    
    if (previewMode) {
      // Apply layout immediately for preview
      const updatedNodes = applyLayoutAlgorithm([...nodes], algorithmKey);
      setNodes(updatedNodes);
    }
  }, [nodes, setNodes, previewMode]);

  const handleApplyLayout = useCallback(() => {
    const updatedNodes = applyLayoutAlgorithm([...nodes], selectedAlgorithm);
    setNodes(updatedNodes);
    
    if (onLayoutChange) {
      onLayoutChange(selectedAlgorithm);
    }
    
    onClose();
  }, [nodes, setNodes, selectedAlgorithm, onLayoutChange, onClose]);

  const handlePreviewToggle = useCallback(() => {
    setPreviewMode(!previewMode);
  }, [previewMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[75vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Layout Settings
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={previewMode}
                onChange={handlePreviewToggle}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Live Preview
            </label>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(75vh-120px)]">
          <div className="space-y-4">
            {Object.entries(algorithmsByCategory).map(([category, algorithms]) => (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  {getCategoryIcon(category)}
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    {category} Layouts
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {algorithms.length} options
                  </span>
                </div>

                {/* Algorithm Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {algorithms.map((algorithm) => (
                    <div
                      key={algorithm.key}
                      onClick={() => handleAlgorithmSelect(algorithm.key)}
                      className={`
                        relative p-3 rounded-md border cursor-pointer transition-all duration-200
                        ${
                          selectedAlgorithm === algorithm.key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                        }
                      `}
                    >
                      {/* Selection Indicator */}
                      {selectedAlgorithm === algorithm.key && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}

                      {/* Algorithm Info */}
                      <div className="flex items-start gap-2">
                        <div className={`
                          p-1.5 rounded-sm
                          ${
                            selectedAlgorithm === algorithm.key
                              ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }
                        `}>
                          {getAlgorithmIcon(algorithm.key)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`
                            font-medium text-xs leading-tight
                            ${
                              selectedAlgorithm === algorithm.key
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-gray-900 dark:text-white'
                            }
                          `}>
                            {algorithm.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight line-clamp-2">
                            {getAlgorithmDescription(algorithm.key)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Selected: <span className="font-medium">{layoutAlgorithms[selectedAlgorithm]?.name}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyLayout}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get algorithm descriptions
const getAlgorithmDescription = (algorithmKey) => {
  const descriptions = {
    'hierarchical': 'Arranges nodes in levels with containers first, then components below',
    'grid': 'Organizes nodes in a regular grid pattern with optimal spacing',
    'circular': 'Places nodes in a circle around a center point',
    'force-directed': 'Uses physics simulation to position nodes naturally',
    'org-linear': 'Vertical linear arrangement, ideal for simple hierarchies',
    'org-hanger2': '2-column layout for medium-sized organizations',
    'org-hanger4': '4-column layout for larger organizational structures',
    'org-fishbone1': 'Alternating left-right branching pattern',
    'org-fishbone2': 'Four-quadrant radial branching layout',
    'tree-vertical': 'Top-down tree structure with clear hierarchy',
    'tree-horizontal': 'Left-to-right tree structure',
    'radial': 'Radial arrangement with equal angular spacing',
    'compact': 'Space-efficient grid with minimal gaps',
    'organic': 'Natural, organic positioning with collision avoidance'
  };
  return descriptions[algorithmKey] || 'Layout algorithm for node arrangement';
};

// Helper function to get layout preview icons
const getLayoutPreview = (algorithmKey) => {
  const previews = {
    'hierarchical': '□□□\n □□',
    'grid': '□□□\n□□□',
    'circular': ' □\n□○□\n □',
    'force-directed': '□ □\n ○\n □',
    'org-linear': '□\n□\n□',
    'org-hanger2': '□□\n□□',
    'org-hanger4': '□□□□',
    'org-fishbone1': '□ □\n□ □',
    'org-fishbone2': '□ □\n ○\n□ □',
    'tree-vertical': ' □\n□□□',
    'tree-horizontal': '□─□□',
    'radial': '□□□',
    'compact': '□□\n□□',
    'organic': '□ □\n ○'
  };
  return previews[algorithmKey] || '□□□';
};

export default LayoutSettingsPanel;