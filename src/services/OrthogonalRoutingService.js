/**
 * OrthogonalRoutingService - Centralized routing logic and management
 * Coordinates pathfinding, grid alignment, and collision detection
 */

import PathfindingEngine from './PathfindingEngine';
import GridSystem from './GridSystem';
import CollisionDetector from './CollisionDetector';

class OrthogonalRoutingService {
    constructor(options = {}) {
        // Initialize core services
        this.pathfindingEngine = new PathfindingEngine({
            gridSize: options.gridSize || 20,
            jettySize: options.jettySize || 20,
            maxIterations: options.maxIterations || 1000
        });
        
        this.gridSystem = new GridSystem({
            gridSize: options.gridSize || 20,
            snapThreshold: options.snapThreshold || 10,
            showGrid: options.showGrid || false
        });
        
        this.collisionDetector = new CollisionDetector({
            gridSize: options.gridSize || 20,
            nodeMargin: options.nodeMargin || 20,
            edgeMargin: options.edgeMargin || 10
        });
        
        // Service configuration
        this.config = {
            autoRerouteOnNodeMove: options.autoRerouteOnNodeMove !== false,
            enableCollisionAvoidance: options.enableCollisionAvoidance !== false,
            optimizeExistingPaths: options.optimizeExistingPaths !== false,
            maxRerouteAttempts: options.maxRerouteAttempts || 3,
            performanceMode: options.performanceMode || 'balanced' // 'fast', 'balanced', 'quality'
        };
        
        // Performance tracking
        this.stats = {
            routeCalculations: 0,
            rerouteOperations: 0,
            cacheHits: 0,
            totalRoutingTime: 0,
            averageRoutingTime: 0
        };
        
        // Route cache for performance
        this.routeCache = new Map();
        this.lastNodePositions = new Map();
        this.rerouteQueue = new Set();
    }

    /**
     * Calculate optimal route for a new edge
     */
    calculateRoute(sourceNode, targetNode, sourceHandle, targetHandle, excludeEdges = []) {
        const startTime = performance.now();
        
        try {
            // Generate cache key
            const cacheKey = this.generateCacheKey(sourceNode, targetNode, sourceHandle, targetHandle);
            
            // Check cache first
            if (this.routeCache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.routeCache.get(cacheKey);
            }
            
            // Get connection points
            const sourcePoint = this.pathfindingEngine.getConnectionPoint(sourceNode, sourceHandle);
            const targetPoint = this.pathfindingEngine.getConnectionPoint(targetNode, targetHandle);
            
            // Update collision detection (exclude current edge and specified edges)
            const allNodes = this.getCurrentNodes();
            const allEdges = this.getCurrentEdges().filter(e => !excludeEdges.includes(e.id));
            
            this.collisionDetector.updateCollisionMap(
                allNodes.filter(n => n.id !== sourceNode.id && n.id !== targetNode.id),
                allEdges
            );
            
            // Calculate optimal path
            const path = this.pathfindingEngine.findPath(
                sourcePoint,
                targetPoint,
                [],
                allNodes.filter(n => n.id !== sourceNode.id && n.id !== targetNode.id)
            );
            
            // Ensure orthogonal constraints and grid alignment
            const optimizedPath = this.gridSystem.enforceOrthogonalPath(path);
            
            // Create route result
            const route = {
                path: optimizedPath,
                waypoints: optimizedPath.slice(1, -1), // Exclude start and end
                sourcePoint,
                targetPoint,
                metadata: {
                    segments: optimizedPath.length - 1,
                    totalLength: this.calculatePathLength(optimizedPath),
                    isOrthogonal: this.gridSystem.validateOrthogonalPath(optimizedPath),
                    hasCollisions: this.checkPathCollisions(optimizedPath, excludeEdges),
                    calculationTime: performance.now() - startTime,
                    cacheKey
                }
            };
            
            // Cache the result
            this.routeCache.set(cacheKey, route);
            
            // Update statistics
            this.stats.routeCalculations++;
            this.updatePerformanceStats(performance.now() - startTime);
            
            return route;
            
        } catch (error) {
            console.error('OrthogonalRoutingService: Route calculation failed', error);
            
            // Return fallback route
            return this.createFallbackRoute(sourceNode, targetNode, sourceHandle, targetHandle);
        }
    }

    /**
     * Reroute existing edges when nodes move
     */
    rerouteEdges(movedNodeIds, allNodes, allEdges) {
        if (!this.config.autoRerouteOnNodeMove) return [];
        
        const startTime = performance.now();
        const reroutedEdges = [];
        
        // Find edges connected to moved nodes
        const affectedEdges = allEdges.filter(edge => 
            movedNodeIds.includes(edge.source) || movedNodeIds.includes(edge.target)
        );
        
        for (const edge of affectedEdges) {
            try {
                this.rerouteQueue.add(edge.id);
                
                const sourceNode = allNodes.find(n => n.id === edge.source);
                const targetNode = allNodes.find(n => n.id === edge.target);
                
                if (sourceNode && targetNode) {
                    const newRoute = this.calculateRoute(
                        sourceNode, 
                        targetNode, 
                        edge.sourceHandle, 
                        edge.targetHandle,
                        [edge.id] // Exclude current edge from collision detection
                    );
                    
                    // Update edge with new route
                    const updatedEdge = {
                        ...edge,
                        data: {
                            ...edge.data,
                            waypoints: newRoute.waypoints,
                            autoRouted: true,
                            lastReroute: Date.now(),
                            rerouteReason: 'node-moved'
                        }
                    };
                    
                    reroutedEdges.push(updatedEdge);
                }
                
                this.rerouteQueue.delete(edge.id);
                
            } catch (error) {
                console.error(`OrthogonalRoutingService: Failed to reroute edge ${edge.id}`, error);
                this.rerouteQueue.delete(edge.id);
            }
        }
        
        // Update statistics
        this.stats.rerouteOperations++;
        this.updatePerformanceStats(performance.now() - startTime);
        
        // Update node position cache
        for (const nodeId of movedNodeIds) {
            const node = allNodes.find(n => n.id === nodeId);
            if (node) {
                this.lastNodePositions.set(nodeId, { ...node.position });
            }
        }
        
        return reroutedEdges;
    }

    /**
     * Optimize all existing routes
     */
    optimizeAllRoutes(nodes, edges) {
        if (!this.config.optimizeExistingPaths) return [];
        
        const optimizedEdges = [];
        
        for (const edge of edges) {
            if (edge.data?.autoRouted !== false) {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (sourceNode && targetNode) {
                    const newRoute = this.calculateRoute(
                        sourceNode,
                        targetNode,
                        edge.sourceHandle,
                        edge.targetHandle,
                        [edge.id]
                    );
                    
                    // Only update if route is significantly better
                    if (this.isRouteBetter(newRoute, edge)) {
                        optimizedEdges.push({
                            ...edge,
                            data: {
                                ...edge.data,
                                waypoints: newRoute.waypoints,
                                lastOptimization: Date.now()
                            }
                        });
                    }
                }
            }
        }
        
        return optimizedEdges;
    }

    /**
     * Create fallback route when pathfinding fails
     */
    createFallbackRoute(sourceNode, targetNode, sourceHandle, targetHandle) {
        const sourcePoint = this.gridSystem.snapToGrid({
            x: sourceNode.position.x + (sourceNode.width || 150) / 2,
            y: sourceNode.position.y + (sourceNode.height || 100) / 2
        });
        
        const targetPoint = this.gridSystem.snapToGrid({
            x: targetNode.position.x + (targetNode.width || 150) / 2,
            y: targetNode.position.y + (targetNode.height || 100) / 2
        });
        
        const fallbackPath = this.gridSystem.enforceOrthogonalPath([sourcePoint, targetPoint]);
        
        return {
            path: fallbackPath,
            waypoints: fallbackPath.slice(1, -1),
            sourcePoint,
            targetPoint,
            metadata: {
                segments: fallbackPath.length - 1,
                totalLength: this.calculatePathLength(fallbackPath),
                isOrthogonal: true,
                hasCollisions: false,
                isFallback: true,
                calculationTime: 0,
                cacheKey: null
            }
        };
    }

    /**
     * Check if new route is better than existing
     */
    isRouteBetter(newRoute, existingEdge) {
        if (!existingEdge.data?.waypoints) return true;
        
        const existingLength = this.calculatePathLength([
            newRoute.sourcePoint,
            ...existingEdge.data.waypoints,
            newRoute.targetPoint
        ]);
        
        const improvement = (existingLength - newRoute.metadata.totalLength) / existingLength;
        
        // Consider route better if it's at least 10% shorter or has fewer segments
        return improvement > 0.1 || newRoute.metadata.segments < existingEdge.data.waypoints.length + 1;
    }

    /**
     * Calculate total path length
     */
    calculatePathLength(path) {
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const current = path[i];
            length += Math.abs(current.x - prev.x) + Math.abs(current.y - prev.y);
        }
        return length;
    }

    /**
     * Check if path has collisions
     */
    checkPathCollisions(path, excludeEdges = []) {
        for (let i = 1; i < path.length; i++) {
            if (this.collisionDetector.checkSegmentCollision(path[i - 1], path[i], excludeEdges)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate cache key for route
     */
    generateCacheKey(sourceNode, targetNode, sourceHandle, targetHandle) {
        return `${sourceNode.id}:${sourceHandle}-${targetNode.id}:${targetHandle}:${sourceNode.position.x},${sourceNode.position.y}-${targetNode.position.x},${targetNode.position.y}`;
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats(duration) {
        this.stats.totalRoutingTime += duration;
        this.stats.averageRoutingTime = this.stats.totalRoutingTime / this.stats.routeCalculations;
    }

    /**
     * Clear route cache
     */
    clearCache() {
        this.routeCache.clear();
        this.lastNodePositions.clear();
    }

    /**
     * Get current nodes (to be overridden by implementation)
     */
    getCurrentNodes() {
        // This should be overridden to return current React Flow nodes
        return [];
    }

    /**
     * Get current edges (to be overridden by implementation)
     */
    getCurrentEdges() {
        // This should be overridden to return current React Flow edges
        return [];
    }

    /**
     * Update service configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Update sub-service configurations
        if (newConfig.gridSize) {
            this.pathfindingEngine.gridSize = newConfig.gridSize;
            this.gridSystem.gridSize = newConfig.gridSize;
            this.collisionDetector.gridSize = newConfig.gridSize;
        }
        
        // Clear cache when config changes
        this.clearCache();
    }

    /**
     * Get service statistics
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.routeCache.size,
            queueSize: this.rerouteQueue.size,
            collisionDetectorStats: this.collisionDetector.getStats()
        };
    }

    /**
     * Get service configuration
     */
    getConfig() {
        return { ...this.config };
    }
}

export default OrthogonalRoutingService;