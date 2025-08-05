import OrthogonalRouter from './OrthogonalRouter';

/**
 * EdgeRoutingService - Handles automatic edge routing and collision avoidance
 * Provides smart pathfinding when nodes move or edges are created
 */
class EdgeRoutingService {
  constructor(options = {}) {
    this.router = new OrthogonalRouter(options);
    this.autoRouteEnabled = options.autoRouteEnabled !== false;
    this.collisionAvoidanceEnabled = options.collisionAvoidanceEnabled !== false;
    this.rerouteOnNodeMove = options.rerouteOnNodeMove !== false;
  }

  /**
   * Auto-route a new edge when it's created
   */
  autoRouteNewEdge(edge, nodes) {
    if (!this.autoRouteEnabled) return edge;

    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return edge;

    // Get obstacles (all other nodes)
    const obstacles = nodes
      .filter(node => node.id !== sourceNode.id && node.id !== targetNode.id)
      .map(node => ({
        x: node.position.x,
        y: node.position.y,
        width: node.width || 100,
        height: node.height || 100
      }));

    // Calculate optimal route
    const route = this.router.calculateOptimalRoute(sourceNode, targetNode, obstacles);

    return {
      ...edge,
      data: {
        ...edge.data,
        waypoints: route.waypoints,
        routeType: 'orthogonal',
        autoRouted: true
      }
    };
  }

  /**
   * Re-route edges when a node moves
   */
  rerouteEdgesOnNodeMove(movedNodeId, edges, nodes) {
    if (!this.rerouteOnNodeMove) return edges;

    const movedNode = nodes.find(n => n.id === movedNodeId);
    if (!movedNode) return edges;

    return edges.map(edge => {
      // Only reroute edges connected to the moved node
      if (edge.source === movedNodeId || edge.target === movedNodeId) {
        return this.rerouteEdge(edge, nodes);
      }
      return edge;
    });
  }

  /**
   * Re-route a specific edge
   */
  rerouteEdge(edge, nodes) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return edge;

    // Only auto-reroute if no manual waypoints exist
    if (edge.data?.waypoints && edge.data.waypoints.length > 0) {
      return edge;
    }

    // Get obstacles
    const obstacles = nodes
      .filter(node => node.id !== sourceNode.id && node.id !== targetNode.id)
      .map(node => ({
        x: node.position.x,
        y: node.position.y,
        width: node.width || 100,
        height: node.height || 100
      }));

    // Calculate new route
    const route = this.router.calculateOptimalRoute(sourceNode, targetNode, obstacles);

    return {
      ...edge,
      data: {
        ...edge.data,
        waypoints: route.waypoints,
        routeType: 'orthogonal',
        autoRouted: true
      }
    };
  }

  /**
   * Batch reroute all edges
   */
  rerouteAllEdges(edges, nodes) {
    return edges.map(edge => this.rerouteEdge(edge, nodes));
  }

  /**
   * Optimize edge layout to minimize crossings
   */
  optimizeEdgeLayout(edges, nodes) {
    const optimizedEdges = [...edges];
    
    // Group edges by source and target
    const edgeGroups = this.groupEdgesByNodes(edges);
    
    // Optimize each group
    for (const [nodePair, groupEdges] of edgeGroups) {
      if (groupEdges.length > 1) {
        const optimizedGroup = this.optimizeEdgeGroup(groupEdges, nodes);
        
        // Update edges with optimized routes
        optimizedGroup.forEach((optimizedEdge, index) => {
          const originalEdge = groupEdges[index];
          const edgeIndex = optimizedEdges.findIndex(e => e.id === originalEdge.id);
          if (edgeIndex !== -1) {
            optimizedEdges[edgeIndex] = optimizedEdge;
          }
        });
      }
    }
    
    return optimizedEdges;
  }

  /**
   * Group edges by source-target pairs
   */
  groupEdgesByNodes(edges) {
    const groups = new Map();
    
    edges.forEach(edge => {
      const key = `${edge.source}-${edge.target}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(edge);
    });
    
    return groups;
  }

  /**
   * Optimize a group of edges between the same nodes
   */
  optimizeEdgeGroup(edges, nodes) {
    if (edges.length <= 1) return edges;

    const sourceNode = nodes.find(n => n.id === edges[0].source);
    const targetNode = nodes.find(n => n.id === edges[0].target);

    if (!sourceNode || !targetNode) return edges;

    // Get obstacles
    const obstacles = nodes
      .filter(node => node.id !== sourceNode.id && node.id !== targetNode.id)
      .map(node => ({
        x: node.position.x,
        y: node.position.y,
        width: node.width || 100,
        height: node.height || 100
      }));

    // Calculate different route patterns for each edge
    const patterns = [
      ['horizontal', 'vertical'],
      ['vertical', 'horizontal'],
      ['horizontal', 'vertical', 'horizontal'],
      ['vertical', 'horizontal', 'vertical']
    ];

    return edges.map((edge, index) => {
      const pattern = patterns[index % patterns.length];
      const route = this.router.calculateRoute(sourceNode, targetNode, obstacles);
      route.pattern = pattern;

      return {
        ...edge,
        data: {
          ...edge.data,
          waypoints: route.waypoints,
          routeType: 'orthogonal',
          autoRouted: true
        }
      };
    });
  }

  /**
   * Validate edge routing
   */
  validateEdgeRouting(edge, nodes) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      return { valid: false, error: 'Source or target node not found' };
    }

    // Check if waypoints are valid
    if (edge.data?.waypoints) {
      for (const waypoint of edge.data.waypoints) {
        if (!waypoint || typeof waypoint.x !== 'number' || typeof waypoint.y !== 'number') {
          return { valid: false, error: 'Invalid waypoint coordinates' };
        }
      }
    }

    // Check for collisions
    if (this.collisionAvoidanceEnabled) {
      const obstacles = nodes
        .filter(node => node.id !== sourceNode.id && node.id !== targetNode.id)
        .map(node => ({
          x: node.position.x,
          y: node.position.y,
          width: node.width || 100,
          height: node.height || 100
        }));

      const waypoints = edge.data?.waypoints || [];
      const points = [
        { x: sourceNode.position.x + (sourceNode.width || 100) / 2, y: sourceNode.position.y + (sourceNode.height || 100) / 2 },
        ...waypoints,
        { x: targetNode.position.x + (targetNode.width || 100) / 2, y: targetNode.position.y + (targetNode.height || 100) / 2 }
      ];

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        for (const obstacle of obstacles) {
          if (this.segmentIntersectsObstacle(p1, p2, obstacle)) {
            return { valid: false, error: 'Edge intersects with obstacle' };
          }
        }
      }
    }

    return { valid: true };
  }

  /**
   * Check if a line segment intersects with an obstacle
   */
  segmentIntersectsObstacle(p1, p2, obstacle) {
    const { x, y, width = 0, height = 0 } = obstacle;
    const margin = this.router.obstacleMargin;

    // Check if either endpoint is inside the obstacle
    if (this.router.isPointInObstacle(p1, obstacle) || this.router.isPointInObstacle(p2, obstacle)) {
      return true;
    }

    // Check if the line segment intersects with the obstacle rectangle
    const rect = {
      x: x - margin,
      y: y - margin,
      width: width + 2 * margin,
      height: height + 2 * margin
    };

    return this.lineIntersectsRect(p1, p2, rect);
  }

  /**
   * Check if a line intersects with a rectangle
   */
  lineIntersectsRect(p1, p2, rect) {
    const { x, y, width, height } = rect;
    
    // Check intersection with each edge of the rectangle
    const edges = [
      { x1: x, y1: y, x2: x + width, y2: y }, // Top
      { x1: x + width, y1: y, x2: x + width, y2: y + height }, // Right
      { x1: x, y1: y + height, x2: x + width, y2: y + height }, // Bottom
      { x1: x, y1: y, x2: x, y2: y + height } // Left
    ];

    for (const edge of edges) {
      if (this.linesIntersect(p1, p2, { x: edge.x1, y: edge.y1 }, { x: edge.x2, y: edge.y2 })) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if two line segments intersect
   */
  linesIntersect(p1, p2, p3, p4) {
    const det = (a, b, c, d) => a * d - b * c;
    
    const delta = det(p2.x - p1.x, p4.x - p3.x, p2.y - p1.y, p4.y - p3.y);
    
    if (Math.abs(delta) < 1e-10) return false; // Lines are parallel
    
    const s = det(p4.x - p3.x, p4.x - p1.x, p4.y - p3.y, p4.y - p1.y) / delta;
    const t = det(p2.x - p1.x, p4.x - p1.x, p2.y - p1.y, p4.y - p1.y) / delta;
    
    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
  }

  /**
   * Get routing statistics
   */
  getRoutingStats(edges) {
    const stats = {
      totalEdges: edges.length,
      autoRouted: 0,
      manualRouted: 0,
      averageWaypoints: 0,
      totalWaypoints: 0
    };

    edges.forEach(edge => {
      if (edge.data?.autoRouted) {
        stats.autoRouted++;
      } else {
        stats.manualRouted++;
      }

      const waypoints = edge.data?.waypoints || [];
      stats.totalWaypoints += waypoints.length;
    });

    stats.averageWaypoints = stats.totalEdges > 0 ? stats.totalWaypoints / stats.totalEdges : 0;

    return stats;
  }

  /**
   * Update router configuration
   */
  updateConfiguration(config) {
    this.router = new OrthogonalRouter(config);
    this.autoRouteEnabled = config.autoRouteEnabled !== false;
    this.collisionAvoidanceEnabled = config.collisionAvoidanceEnabled !== false;
    this.rerouteOnNodeMove = config.rerouteOnNodeMove !== false;
  }
}

export default EdgeRoutingService; 