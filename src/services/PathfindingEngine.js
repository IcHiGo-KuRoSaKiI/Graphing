/**
 * PathfindingEngine - A* algorithm optimized for orthogonal routing
 * Based on draw.io's pathfinding approach with React Flow integration
 */

class PathfindingEngine {
    constructor(options = {}) {
        this.gridSize = options.gridSize || 20;
        this.jettySize = options.jettySize || 20; // Minimum distance from nodes
        this.maxIterations = options.maxIterations || 1000;
        this.obstacles = new Set();
        this.nodeCache = new Map();
    }

    /**
     * Find optimal orthogonal path between two points
     */
    findPath(startPoint, endPoint, obstacles = [], nodes = []) {
        try {
            // Convert to grid coordinates
            const start = this.snapToGrid(startPoint);
            const end = this.snapToGrid(endPoint);
            
            // Update obstacle map
            this.updateObstacles(obstacles, nodes);
            
            // A* pathfinding with orthogonal constraints
            const path = this.aStarOrthogonal(start, end);
            
            // Convert back to world coordinates and optimize
            const optimizedPath = this.optimizePath(path);
            
            // Ensure we always return a valid path
            if (optimizedPath && optimizedPath.length >= 2) {
                return optimizedPath;
            }
            
            // If optimization failed, return the original path
            if (path && path.length >= 2) {
                return path;
            }
            
            // Final fallback - create direct path
            return this.createDirectOrthogonalPath(start, end);
            
        } catch (error) {
            console.warn('PathfindingEngine: Error in findPath, using direct route', error);
            return this.createDirectOrthogonalPath(startPoint, endPoint);
        }
    }

    /**
     * A* pathfinding algorithm with orthogonal movement only
     */
    aStarOrthogonal(start, end) {
        // If start and end are the same, return direct path
        if (start.x === end.x && start.y === end.y) {
            return [start];
        }

        const openSet = [{ point: start, g: 0, h: this.heuristic(start, end), f: 0, parent: null }];
        const closedSet = new Set();
        const visited = new Map();
        
        let iterations = 0;
        const maxIterations = this.maxIterations * 3; // Increase max iterations significantly
        
        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;
            
            // Get node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = `${current.point.x},${current.point.y}`;
            
            // Reached destination
            if (current.point.x === end.x && current.point.y === end.y) {
                return this.reconstructPath(current);
            }
            
            closedSet.add(currentKey);
            
            // Check orthogonal neighbors (up, down, left, right)
            const neighbors = this.getOrthogonalNeighbors(current.point);
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (closedSet.has(neighborKey) || this.isObstacle(neighbor)) {
                    continue;
                }
                
                const g = current.g + this.gridSize;
                const h = this.heuristic(neighbor, end);
                const f = g + h;
                
                const existingNode = visited.get(neighborKey);
                if (!existingNode || g < existingNode.g) {
                    const node = { point: neighbor, g, h, f, parent: current };
                    visited.set(neighborKey, node);
                    
                    if (!openSet.find(n => n.point.x === neighbor.x && n.point.y === neighbor.y)) {
                        openSet.push(node);
                    }
                }
            }
        }
        
        // If we can't find a path, try with a larger search area
        if (iterations >= maxIterations) {
            console.warn('PathfindingEngine: Max iterations reached, using direct route');
        }
        return this.createDirectOrthogonalPath(start, end);
    }

    /**
     * Get orthogonal neighbors (up, down, left, right only)
     */
    getOrthogonalNeighbors(point) {
        return [
            { x: point.x, y: point.y - this.gridSize }, // Up
            { x: point.x, y: point.y + this.gridSize }, // Down
            { x: point.x - this.gridSize, y: point.y }, // Left
            { x: point.x + this.gridSize, y: point.y }  // Right
        ];
    }

    /**
     * Manhattan distance heuristic (perfect for orthogonal routing)
     */
    heuristic(point, end) {
        return Math.abs(point.x - end.x) + Math.abs(point.y - end.y);
    }

    /**
     * Reconstruct path from A* result
     */
    reconstructPath(node) {
        const path = [];
        let current = node;
        
        while (current) {
            path.unshift(current.point);
            current = current.parent;
        }
        
        return path;
    }

    /**
     * Create direct orthogonal path as fallback
     */
    createDirectOrthogonalPath(start, end) {
        // Ensure we have valid start and end points
        if (!start || !end) {
            console.warn('PathfindingEngine: Invalid start or end point', { start, end });
            return [{ x: 0, y: 0 }, { x: 100, y: 100 }];
        }
        
        const path = [start];
        
        // Create L-shaped path with better positioning
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        
        // Only add intermediate points if there's significant distance
        if (dx > this.gridSize || dy > this.gridSize) {
            // Create L-shaped path with intelligent direction choice
            if (dx > dy) {
                // Horizontal first - go most of the way horizontally, then vertically
                const midX = start.x + (end.x - start.x) * 0.8;
                const midXSnapped = this.snapToGrid({ x: midX, y: start.y }).x;
                
                // Only add intermediate points if they're different from start/end
                if (Math.abs(midXSnapped - start.x) > this.gridSize) {
                    path.push({ x: midXSnapped, y: start.y });
                }
                if (Math.abs(end.y - start.y) > this.gridSize) {
                    path.push({ x: midXSnapped, y: end.y });
                }
            } else {
                // Vertical first - go most of the way vertically, then horizontally
                const midY = start.y + (end.y - start.y) * 0.8;
                const midYSnapped = this.snapToGrid({ x: start.x, y: midY }).y;
                
                // Only add intermediate points if they're different from start/end
                if (Math.abs(midYSnapped - start.y) > this.gridSize) {
                    path.push({ x: start.x, y: midYSnapped });
                }
                if (Math.abs(end.x - start.x) > this.gridSize) {
                    path.push({ x: end.x, y: midYSnapped });
                }
            }
        }
        
        // Only add end point if it's different from the last point
        const lastPoint = path[path.length - 1];
        if (lastPoint.x !== end.x || lastPoint.y !== end.y) {
            path.push(end);
        }
        
        // Ensure we always have at least 2 points
        if (path.length < 2) {
            path.push(end);
        }
        
        return path;
    }

    /**
     * Update obstacle map from nodes and existing edges
     */
    updateObstacles(obstacles, nodes) {
        this.obstacles.clear();
        
        // Add node boundaries as obstacles with minimal margin
        for (const node of nodes) {
            const bounds = this.getNodeBounds(node);
            this.addRectangleObstacle(bounds);
        }
        
        // Add custom obstacles
        for (const obstacle of obstacles) {
            this.addRectangleObstacle(obstacle);
        }
    }

    /**
     * Get node boundaries with minimal jetty margin
     */
    getNodeBounds(node) {
        const margin = Math.max(5, this.jettySize / 4); // Reduce margin significantly
        const x = node.position.x - margin;
        const y = node.position.y - margin;
        const width = (node.width || node.style?.width || 150) + (margin * 2);
        const height = (node.height || node.style?.height || 100) + (margin * 2);
        
        return { x, y, width, height };
    }

    /**
     * Add rectangular obstacle to obstacle map
     */
    addRectangleObstacle(rect) {
        const startX = this.snapToGrid({ x: rect.x, y: 0 }).x;
        const endX = this.snapToGrid({ x: rect.x + rect.width, y: 0 }).x;
        const startY = this.snapToGrid({ x: 0, y: rect.y }).y;
        const endY = this.snapToGrid({ x: 0, y: rect.y + rect.height }).y;
        
        for (let x = startX; x <= endX; x += this.gridSize) {
            for (let y = startY; y <= endY; y += this.gridSize) {
                this.obstacles.add(`${x},${y}`);
            }
        }
    }

    /**
     * Check if point is an obstacle
     */
    isObstacle(point) {
        return this.obstacles.has(`${point.x},${point.y}`);
    }

    /**
     * Snap point to grid
     */
    snapToGrid(point) {
        return {
            x: Math.round(point.x / this.gridSize) * this.gridSize,
            y: Math.round(point.y / this.gridSize) * this.gridSize
        };
    }

    /**
     * Optimize path by removing unnecessary waypoints
     */
    optimizePath(path) {
        if (path.length <= 2) return path;
        
        const optimized = [path[0]];
        
        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const next = path[i + 1];
            
            // Keep waypoint if it changes direction
            if (!this.isCollinear(prev, current, next)) {
                optimized.push(current);
            }
        }
        
        optimized.push(path[path.length - 1]);
        return optimized;
    }

    /**
     * Check if three points are collinear (on same line)
     */
    isCollinear(p1, p2, p3) {
        return (p1.x === p2.x && p2.x === p3.x) || (p1.y === p2.y && p2.y === p3.y);
    }

    /**
     * Get connection point on node edge with support for multiple connection points
     */
    getConnectionPoint(node, handleId) {
        if (!node) {
            console.error('PathfindingEngine: Node is null/undefined', { handleId });
            return { x: 0, y: 0 };
        }
        
        const x = node.position.x;
        const y = node.position.y;
        const width = node.width || node.style?.width || 150;
        const height = node.height || node.style?.height || 100;
        
        // Calculate connection point based on handle position
        
        // Handle various handle ID formats and provide intelligent defaults
        if (!handleId || handleId === 'undefined') {
            // Default to right for source, left for target
            handleId = 'right';
        }
        
        // Extract position and location from handle ID
        // Support formats: "top-left-source", "right-center-source", "top-source", "right"
        const parts = handleId.split('-');
        const position = parts[0] || 'right';
        const location = (parts.length > 2) ? parts[1] : (parts.length === 2 && !['source', 'target'].includes(parts[1])) ? parts[1] : 'center';
        
        let connectionPoint;
        
        switch (position) {
            case 'top':
                switch (location) {
                    case 'left': connectionPoint = { x: x + width * 0.25, y }; break;
                    case 'right': connectionPoint = { x: x + width * 0.75, y }; break;
                    default: connectionPoint = { x: x + width / 2, y }; break;
                }
                break;
            case 'right':
                switch (location) {
                    case 'top': connectionPoint = { x: x + width, y: y + height * 0.25 }; break;
                    case 'bottom': connectionPoint = { x: x + width, y: y + height * 0.75 }; break;
                    default: connectionPoint = { x: x + width, y: y + height / 2 }; break;
                }
                break;
            case 'bottom':
                switch (location) {
                    case 'left': connectionPoint = { x: x + width * 0.25, y: y + height }; break;
                    case 'right': connectionPoint = { x: x + width * 0.75, y: y + height }; break;
                    default: connectionPoint = { x: x + width / 2, y: y + height }; break;
                }
                break;
            case 'left':
                switch (location) {
                    case 'top': connectionPoint = { x, y: y + height * 0.25 }; break;
                    case 'bottom': connectionPoint = { x, y: y + height * 0.75 }; break;
                    default: connectionPoint = { x, y: y + height / 2 }; break;
                }
                break;
            default:
                // Fallback to right center for unknown positions
                connectionPoint = { x: x + width, y: y + height / 2 };
        }
        
        return this.snapToGrid(connectionPoint);
    }
}

export default PathfindingEngine;