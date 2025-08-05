/**
 * GridSystem - Handles grid-based coordinate alignment and snapping
 * Ensures all elements align to a consistent grid like draw.io
 */

class GridSystem {
    constructor(options = {}) {
        this.gridSize = options.gridSize || 20;
        this.snapThreshold = options.snapThreshold || 10;
        this.showGrid = options.showGrid || false;
        this.gridColor = options.gridColor || '#e5e5e5';
        this.majorGridInterval = options.majorGridInterval || 5; // Every 5th line is major
    }

    /**
     * Snap a point to the nearest grid intersection
     */
    snapToGrid(point) {
        return {
            x: Math.round(point.x / this.gridSize) * this.gridSize,
            y: Math.round(point.y / this.gridSize) * this.gridSize
        };
    }

    /**
     * Snap multiple points to grid
     */
    snapPointsToGrid(points) {
        return points.map(point => this.snapToGrid(point));
    }

    /**
     * Check if a point should snap to grid based on threshold
     */
    shouldSnapToGrid(point, snapThreshold = this.snapThreshold) {
        const snapped = this.snapToGrid(point);
        const distance = Math.sqrt(
            Math.pow(point.x - snapped.x, 2) + Math.pow(point.y - snapped.y, 2)
        );
        return distance <= snapThreshold;
    }

    /**
     * Get the nearest grid line coordinates
     */
    getNearestGridLines(point) {
        const snapped = this.snapToGrid(point);
        return {
            vertical: snapped.x,
            horizontal: snapped.y,
            intersection: snapped
        };
    }

    /**
     * Calculate grid bounds for a given viewport
     */
    getGridBounds(viewport) {
        const { x, y, zoom } = viewport;
        const adjustedGridSize = this.gridSize * zoom;
        
        // Calculate visible grid range
        const startX = Math.floor(x / adjustedGridSize) * adjustedGridSize;
        const endX = startX + (window.innerWidth / zoom) + adjustedGridSize;
        const startY = Math.floor(y / adjustedGridSize) * adjustedGridSize;
        const endY = startY + (window.innerHeight / zoom) + adjustedGridSize;
        
        return { startX, endX, startY, endY, adjustedGridSize };
    }

    /**
     * Generate grid lines for rendering
     */
    generateGridLines(viewport) {
        const bounds = this.getGridBounds(viewport);
        const lines = [];
        
        // Vertical lines
        for (let x = bounds.startX; x <= bounds.endX; x += this.gridSize) {
            const isMajor = (x / this.gridSize) % this.majorGridInterval === 0;
            lines.push({
                type: 'vertical',
                position: x,
                start: bounds.startY,
                end: bounds.endY,
                isMajor
            });
        }
        
        // Horizontal lines
        for (let y = bounds.startY; y <= bounds.endY; y += this.gridSize) {
            const isMajor = (y / this.gridSize) % this.majorGridInterval === 0;
            lines.push({
                type: 'horizontal',
                position: y,
                start: bounds.startX,
                end: bounds.endX,
                isMajor
            });
        }
        
        return lines;
    }

    /**
     * Snap rectangle to grid (for nodes)
     */
    snapRectangleToGrid(rectangle) {
        const topLeft = this.snapToGrid({ x: rectangle.x, y: rectangle.y });
        
        // Optionally snap size to grid as well
        const width = Math.max(this.gridSize, Math.round(rectangle.width / this.gridSize) * this.gridSize);
        const height = Math.max(this.gridSize, Math.round(rectangle.height / this.gridSize) * this.gridSize);
        
        return {
            x: topLeft.x,
            y: topLeft.y,
            width,
            height
        };
    }

    /**
     * Get alignment guides for a point
     */
    getAlignmentGuides(point, existingPoints = []) {
        const guides = [];
        const snapped = this.snapToGrid(point);
        
        // Grid alignment guides
        guides.push({
            type: 'grid-vertical',
            position: snapped.x,
            isActive: Math.abs(point.x - snapped.x) <= this.snapThreshold
        });
        
        guides.push({
            type: 'grid-horizontal',
            position: snapped.y,
            isActive: Math.abs(point.y - snapped.y) <= this.snapThreshold
        });
        
        // Alignment with existing points
        for (const existingPoint of existingPoints) {
            // Vertical alignment
            if (Math.abs(point.x - existingPoint.x) <= this.snapThreshold) {
                guides.push({
                    type: 'align-vertical',
                    position: existingPoint.x,
                    reference: existingPoint,
                    isActive: true
                });
            }
            
            // Horizontal alignment
            if (Math.abs(point.y - existingPoint.y) <= this.snapThreshold) {
                guides.push({
                    type: 'align-horizontal',
                    position: existingPoint.y,
                    reference: existingPoint,
                    isActive: true
                });
            }
        }
        
        return guides;
    }

    /**
     * Validate orthogonal constraints
     */
    validateOrthogonalPath(points) {
        if (points.length < 2) return true;
        
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const current = points[i];
            
            // Check if segment is perfectly horizontal or vertical
            const isHorizontal = prev.y === current.y;
            const isVertical = prev.x === current.x;
            
            if (!isHorizontal && !isVertical) {
                return false; // Diagonal segment found
            }
        }
        
        return true;
    }

    /**
     * Force orthogonal constraints on a path
     */
    enforceOrthogonalPath(points) {
        if (points.length < 2) return points;
        
        const orthogonalPoints = [this.snapToGrid(points[0])];
        
        for (let i = 1; i < points.length; i++) {
            const prev = orthogonalPoints[orthogonalPoints.length - 1];
            const current = this.snapToGrid(points[i]);
            
            // Force orthogonal movement
            const deltaX = Math.abs(current.x - prev.x);
            const deltaY = Math.abs(current.y - prev.y);
            
            if (deltaX > deltaY) {
                // Prefer horizontal movement
                orthogonalPoints.push({ x: current.x, y: prev.y });
                if (current.y !== prev.y) {
                    orthogonalPoints.push(current);
                }
            } else {
                // Prefer vertical movement
                orthogonalPoints.push({ x: prev.x, y: current.y });
                if (current.x !== prev.x) {
                    orthogonalPoints.push(current);
                }
            }
        }
        
        return orthogonalPoints;
    }

    /**
     * Get grid configuration for rendering
     */
    getGridConfig() {
        return {
            gridSize: this.gridSize,
            showGrid: this.showGrid,
            gridColor: this.gridColor,
            majorGridInterval: this.majorGridInterval,
            snapThreshold: this.snapThreshold
        };
    }

    /**
     * Update grid configuration
     */
    updateConfig(newConfig) {
        this.gridSize = newConfig.gridSize || this.gridSize;
        this.snapThreshold = newConfig.snapThreshold || this.snapThreshold;
        this.showGrid = newConfig.showGrid !== undefined ? newConfig.showGrid : this.showGrid;
        this.gridColor = newConfig.gridColor || this.gridColor;
        this.majorGridInterval = newConfig.majorGridInterval || this.majorGridInterval;
    }

    /**
     * Calculate optimal grid size for current zoom level
     */
    getOptimalGridSize(zoom) {
        const baseGridSize = this.gridSize;
        
        if (zoom < 0.5) {
            return baseGridSize * 4; // Larger grid when zoomed out
        } else if (zoom < 0.8) {
            return baseGridSize * 2;
        } else if (zoom > 2) {
            return baseGridSize / 2; // Smaller grid when zoomed in
        }
        
        return baseGridSize;
    }
}

export default GridSystem;