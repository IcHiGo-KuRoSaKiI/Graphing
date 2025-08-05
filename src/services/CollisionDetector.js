/**
 * CollisionDetector - Handles obstacle detection and avoidance for routing
 * Identifies nodes, edges, and other obstacles that paths should avoid
 */

class CollisionDetector {
    constructor(options = {}) {
        this.nodeMargin = options.nodeMargin || 20; // Margin around nodes
        this.edgeMargin = options.edgeMargin || 10; // Margin around edges
        this.gridSize = options.gridSize || 20;
        this.collisionMap = new Map();
        this.nodeCache = new Map();
        this.edgeCache = new Map();
    }

    /**
     * Update collision map with current nodes and edges
     */
    updateCollisionMap(nodes, edges) {
        this.collisionMap.clear();
        this.nodeCache.clear();
        this.edgeCache.clear();
        
        // Add node obstacles
        for (const node of nodes) {
            this.addNodeObstacle(node);
        }
        
        // Add edge obstacles
        for (const edge of edges) {
            this.addEdgeObstacle(edge, nodes);
        }
    }

    /**
     * Add node as obstacle with margin
     */
    addNodeObstacle(node) {
        const bounds = this.getNodeBounds(node);
        this.nodeCache.set(node.id, bounds);
        
        // Add grid points around node as obstacles
        const startX = Math.floor(bounds.x / this.gridSize) * this.gridSize;
        const endX = Math.ceil((bounds.x + bounds.width) / this.gridSize) * this.gridSize;
        const startY = Math.floor(bounds.y / this.gridSize) * this.gridSize;
        const endY = Math.ceil((bounds.y + bounds.height) / this.gridSize) * this.gridSize;
        
        for (let x = startX; x <= endX; x += this.gridSize) {
            for (let y = startY; y <= endY; y += this.gridSize) {
                const key = `${x},${y}`;
                if (!this.collisionMap.has(key)) {
                    this.collisionMap.set(key, []);
                }
                this.collisionMap.get(key).push({
                    type: 'node',
                    id: node.id,
                    bounds,
                    priority: 1
                });
            }
        }
    }

    /**
     * Add edge as obstacle with margin
     */
    addEdgeObstacle(edge, nodes) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return;
        
        const segments = this.getEdgeSegments(edge, sourceNode, targetNode);
        this.edgeCache.set(edge.id, segments);
        
        for (const segment of segments) {
            this.addSegmentObstacle(segment, edge.id);
        }
    }

    /**
     * Get edge segments with waypoints
     */
    getEdgeSegments(edge, sourceNode, targetNode) {
        const segments = [];
        const waypoints = edge.data?.waypoints || [];
        
        // Calculate connection points
        const sourcePoint = this.getConnectionPoint(sourceNode, edge.sourceHandle);
        const targetPoint = this.getConnectionPoint(targetNode, edge.targetHandle);
        
        // Build path: source -> waypoints -> target
        const pathPoints = [sourcePoint, ...waypoints, targetPoint];
        
        // Convert to segments
        for (let i = 0; i < pathPoints.length - 1; i++) {
            segments.push({
                start: pathPoints[i],
                end: pathPoints[i + 1],
                edgeId: edge.id
            });
        }
        
        return segments;
    }

    /**
     * Add segment as obstacle
     */
    addSegmentObstacle(segment, edgeId) {
        const points = this.getSegmentGridPoints(segment);
        
        for (const point of points) {
            const key = `${point.x},${point.y}`;
            if (!this.collisionMap.has(key)) {
                this.collisionMap.set(key, []);
            }
            this.collisionMap.get(key).push({
                type: 'edge',
                id: edgeId,
                segment,
                priority: 0.5
            });
        }
    }

    /**
     * Get grid points along a segment with margin
     */
    getSegmentGridPoints(segment) {
        const points = [];
        const { start, end } = segment;
        
        // Determine if segment is horizontal or vertical
        const isHorizontal = Math.abs(start.y - end.y) < Math.abs(start.x - end.x);
        
        if (isHorizontal) {
            // Horizontal segment
            const minX = Math.min(start.x, end.x);
            const maxX = Math.max(start.x, end.x);
            const y = start.y;
            
            // Add points along the segment with margin
            for (let x = minX; x <= maxX; x += this.gridSize) {
                // Add margin above and below
                for (let my = -this.edgeMargin; my <= this.edgeMargin; my += this.gridSize) {
                    points.push(this.snapToGrid({ x, y: y + my }));
                }
            }
        } else {
            // Vertical segment
            const minY = Math.min(start.y, end.y);
            const maxY = Math.max(start.y, end.y);
            const x = start.x;
            
            // Add points along the segment with margin
            for (let y = minY; y <= maxY; y += this.gridSize) {
                // Add margin left and right
                for (let mx = -this.edgeMargin; mx <= this.edgeMargin; mx += this.gridSize) {
                    points.push(this.snapToGrid({ x: x + mx, y }));
                }
            }
        }
        
        return points;
    }

    /**
     * Check if a point is blocked by obstacles
     */
    isBlocked(point, excludeIds = []) {
        const key = `${point.x},${point.y}`;
        const obstacles = this.collisionMap.get(key) || [];
        
        for (const obstacle of obstacles) {
            if (!excludeIds.includes(obstacle.id)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get obstacles at a specific point
     */
    getObstaclesAt(point) {
        const key = `${point.x},${point.y}`;
        return this.collisionMap.get(key) || [];
    }

    /**
     * Check if a path segment intersects with obstacles
     */
    checkSegmentCollision(start, end, excludeIds = []) {
        const points = this.getSegmentGridPoints({ start, end });
        
        for (const point of points) {
            if (this.isBlocked(point, excludeIds)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get node bounds with margin
     */
    getNodeBounds(node) {
        const x = node.position.x - this.nodeMargin;
        const y = node.position.y - this.nodeMargin;
        const width = (node.width || 150) + (this.nodeMargin * 2);
        const height = (node.height || 100) + (this.nodeMargin * 2);
        
        return { x, y, width, height };
    }

    /**
     * Get connection point on node edge
     */
    getConnectionPoint(node, handleId) {
        const x = node.position.x;
        const y = node.position.y;
        const width = node.width || 150;
        const height = node.height || 100;
        
        // Extract position from handle ID (e.g., "top-source" -> "top")
        const position = handleId?.split('-')[0] || 'right';
        
        switch (position) {
            case 'top': return this.snapToGrid({ x: x + width / 2, y });
            case 'right': return this.snapToGrid({ x: x + width, y: y + height / 2 });
            case 'bottom': return this.snapToGrid({ x: x + width / 2, y: y + height });
            case 'left': return this.snapToGrid({ x, y: y + height / 2 });
            default: return this.snapToGrid({ x: x + width / 2, y: y + height / 2 });
        }
    }

    /**
     * Find clear areas around obstacles
     */
    findClearAreas(bounds) {
        const clearAreas = [];
        const startX = Math.floor(bounds.x / this.gridSize) * this.gridSize;
        const endX = Math.ceil((bounds.x + bounds.width) / this.gridSize) * this.gridSize;
        const startY = Math.floor(bounds.y / this.gridSize) * this.gridSize;
        const endY = Math.ceil((bounds.y + bounds.height) / this.gridSize) * this.gridSize;
        
        for (let x = startX; x <= endX; x += this.gridSize) {
            for (let y = startY; y <= endY; y += this.gridSize) {
                if (!this.isBlocked({ x, y })) {
                    clearAreas.push({ x, y });
                }
            }
        }
        
        return clearAreas;
    }

    /**
     * Get routing channels (clear paths between obstacles)
     */
    getRoutingChannels(start, end) {
        const channels = [];
        
        // Horizontal channels
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);
        
        for (let y = minY; y <= maxY; y += this.gridSize) {
            const channelStart = Math.min(start.x, end.x);
            const channelEnd = Math.max(start.x, end.x);
            
            let clearStart = null;
            for (let x = channelStart; x <= channelEnd; x += this.gridSize) {
                if (this.isBlocked({ x, y })) {
                    if (clearStart !== null) {
                        channels.push({
                            type: 'horizontal',
                            y,
                            startX: clearStart,
                            endX: x - this.gridSize
                        });
                        clearStart = null;
                    }
                } else if (clearStart === null) {
                    clearStart = x;
                }
            }
            
            if (clearStart !== null) {
                channels.push({
                    type: 'horizontal',
                    y,
                    startX: clearStart,
                    endX: channelEnd
                });
            }
        }
        
        // Vertical channels
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        
        for (let x = minX; x <= maxX; x += this.gridSize) {
            const channelStart = Math.min(start.y, end.y);
            const channelEnd = Math.max(start.y, end.y);
            
            let clearStart = null;
            for (let y = channelStart; y <= channelEnd; y += this.gridSize) {
                if (this.isBlocked({ x, y })) {
                    if (clearStart !== null) {
                        channels.push({
                            type: 'vertical',
                            x,
                            startY: clearStart,
                            endY: y - this.gridSize
                        });
                        clearStart = null;
                    }
                } else if (clearStart === null) {
                    clearStart = y;
                }
            }
            
            if (clearStart !== null) {
                channels.push({
                    type: 'vertical',
                    x,
                    startY: clearStart,
                    endY: channelEnd
                });
            }
        }
        
        return channels;
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
     * Clear cache and collision map
     */
    clear() {
        this.collisionMap.clear();
        this.nodeCache.clear();
        this.edgeCache.clear();
    }

    /**
     * Get statistics about current collision map
     */
    getStats() {
        const nodeCount = this.nodeCache.size;
        const edgeCount = this.edgeCache.size;
        const obstaclePoints = this.collisionMap.size;
        
        return {
            nodeCount,
            edgeCount,
            obstaclePoints,
            memoryUsage: {
                collisionMap: this.collisionMap.size,
                nodeCache: this.nodeCache.size,
                edgeCache: this.edgeCache.size
            }
        };
    }
}

export default CollisionDetector;