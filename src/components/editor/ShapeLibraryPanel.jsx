import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Star, X } from 'lucide-react';
import { SHAPE_DEFINITIONS, SHAPE_CATEGORIES, searchShapes, getShapesByCategory } from '../../config/ShapeDefinitions';

const ShapeLibraryPanel = ({ isOpen, onClose, onShapeSelect, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage
    try {
      const saved = localStorage.getItem('shapeLibraryFavorites');
      return new Set(saved ? JSON.parse(saved) : ['basic-rectangle', 'flowchart-process']);
    } catch {
      return new Set(['basic-rectangle', 'flowchart-process']);
    }
  });

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('shapeLibraryFavorites', JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);

  // Filter shapes based on search and category
  const filteredShapes = useMemo(() => {
    let shapes;
    
    if (searchTerm) {
      shapes = searchShapes(searchTerm);
    } else if (selectedCategory !== 'all') {
      shapes = getShapesByCategory(selectedCategory);
    } else {
      shapes = Object.values(SHAPE_DEFINITIONS);
    }
    
    return shapes;
  }, [searchTerm, selectedCategory]);

  // Group shapes by category
  const groupedShapes = useMemo(() => {
    const groups = {};
    filteredShapes.forEach(shape => {
      if (!groups[shape.category]) {
        groups[shape.category] = [];
      }
      groups[shape.category].push(shape);
    });
    return groups;
  }, [filteredShapes]);

  const handleShapeClick = useCallback((shapeDefinition) => {
    onShapeSelect({
      type: 'universalShape',
      shapeType: shapeDefinition.id,
      label: shapeDefinition.name,
      style: { ...shapeDefinition.style },
      defaultSize: { ...shapeDefinition.defaultSize }
    });
  }, [onShapeSelect]);

  const handleDragStart = useCallback((event, shapeDefinition) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: 'universalShape',
      shapeType: shapeDefinition.id,
      label: shapeDefinition.name,
      style: { ...shapeDefinition.style },
      defaultSize: { ...shapeDefinition.defaultSize }
    }));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const toggleCategory = useCallback((categoryId) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const toggleFavorite = useCallback((shapeId) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shapeId)) {
        newSet.delete(shapeId);
      } else {
        newSet.add(shapeId);
      }
      return newSet;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  if (!isOpen) return null;

  return (
    <div className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Shape Library</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          title="Close Shape Library"
        >
          <X size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search shapes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {Object.entries(SHAPE_CATEGORIES).map(([id, category]) => (
            <option key={id} value={id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Favorites Section */}
      {favorites.size > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
              <Star size={16} className="text-yellow-500 fill-current" />
              Favorites ({favorites.size})
            </div>
          </div>
          <div className="p-2 grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {Array.from(favorites).map(shapeId => {
              const shape = SHAPE_DEFINITIONS[shapeId];
              return shape ? (
                <ShapePreview
                  key={`fav-${shapeId}`}
                  shape={shape}
                  onClick={() => handleShapeClick(shape)}
                  onDragStart={(e) => handleDragStart(e, shape)}
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavorite(shapeId)}
                />
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Shape Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedShapes).length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>No shapes found</p>
            {searchTerm && (
              <p className="text-sm mt-2">Try a different search term</p>
            )}
          </div>
        ) : (
          Object.entries(groupedShapes).map(([categoryId, shapes]) => {
            const category = SHAPE_CATEGORIES[categoryId];
            const isCollapsed = collapsedCategories.has(categoryId);
            
            return (
              <div key={categoryId} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-lg">{category?.icon || '📦'}</span>
                    <span>{category?.name || categoryId}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                      {shapes.length}
                    </span>
                  </div>
                  {isCollapsed ? 
                    <ChevronRight size={16} className="text-gray-500" /> : 
                    <ChevronDown size={16} className="text-gray-500" />
                  }
                </button>
                
                {/* Shapes Grid */}
                {!isCollapsed && (
                  <div className="p-2 grid grid-cols-4 gap-2 bg-gray-25 dark:bg-gray-800/50">
                    {shapes.map(shape => (
                      <ShapePreview
                        key={shape.id}
                        shape={shape}
                        onClick={() => handleShapeClick(shape)}
                        onDragStart={(e) => handleDragStart(e, shape)}
                        isFavorite={favorites.has(shape.id)}
                        onToggleFavorite={() => toggleFavorite(shape.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Drag shapes to canvas or click to add at center
        </p>
      </div>
    </div>
  );
};

// Shape Preview Component
const ShapePreview = ({ shape, onClick, onDragStart, isFavorite, onToggleFavorite }) => {
  const handleFavoriteClick = useCallback((e) => {
    e.stopPropagation();
    onToggleFavorite();
  }, [onToggleFavorite]);

  const renderShapePreview = () => {
    switch (shape.renderType) {
      case 'svg':
        return (
          <svg
            viewBox={`0 0 ${shape.defaultSize.width} ${shape.defaultSize.height}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d={shape.svgPath}
              fill={shape.style.fill}
              stroke={shape.style.stroke}
              strokeWidth={shape.style.strokeWidth}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        );
      
      case 'icon':
      default:
        return (
          <div
            className="w-full h-full flex items-center justify-center rounded"
            style={{
              backgroundColor: shape.style.fill,
              border: `1px solid ${shape.style.stroke}`,
              borderRadius: shape.style.borderRadius || '4px'
            }}
          >
            {shape.icon && (
              <span style={{ fontSize: '16px', lineHeight: '1' }}>
                {shape.icon}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className="group relative p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-400 cursor-pointer bg-white dark:bg-gray-800 transition-all"
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      title={`${shape.name}\n${shape.tags.join(', ')}`}
    >
      {/* Shape Preview Container */}
      <div className="w-full h-8 mx-auto mb-1 flex items-center justify-center">
        {renderShapePreview()}
      </div>
      
      {/* Shape Name */}
      <div className="text-xs text-center text-gray-600 dark:text-gray-400 truncate">
        {shape.name}
      </div>
      
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star
          size={12}
          className={isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400 hover:text-yellow-500'}
        />
      </button>

      {/* Drag Indicator */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-blue-500 rounded-lg pointer-events-none transition-opacity" />
    </div>
  );
};

export default ShapeLibraryPanel;