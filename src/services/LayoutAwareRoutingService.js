/**
 * LayoutAwareRoutingService - Integration between edge routing and layout systems
 * Provides intelligent edge routing that considers layout algorithms and node hierarchies
 */

import edgeWorkerService from './EdgeWorkerService';
import { LayoutService } from './LayoutService';

class LayoutAwareRoutingService {
  constructor() {
    this.layoutService = new LayoutService();
    this.routingCache = new Map();
    this.layoutConstraints = new Map();
    this.hierarchyCache = new Map();
  }

  /**
   * Set layout constraints that affect edge routing
   */
  setLayoutConstraints(layoutType, constraints) {
    this.layoutConstraints.set(layoutType, {
      preferredRouting: constraints.preferredRouting || 'orthogonal',
      avoidanceMargin: constraints.avoidanceMargin || 20,
      containerAwareness: constraints.containerAwareness !== false,
      hierarchyRespect: constraints.hierarchyRespect !== false,
      ...constraints
    });
  }

  /**
   * Analyze node hierarchy and relationships
   */
  analyzeHierarchy(nodes, edges) {
    const hierarchy = {
      levels: new Map(),
      containers: new Map(),
      relationships: new Map(),
      clusters: new Map()
    };

    // Group nodes by container
    nodes.forEach(node => {
      if (node.parentNode) {
        if (!hierarchy.containers.has(node.parentNode)) {
          hierarchy.containers.set(node.parentNode, []);
        }
        hierarchy.containers.get(node.parentNode).push(node.id);
      }
    });

    // Analyze edge relationships to determine levels
    const inDegree = new Map();
    const outDegree = new Map();
    
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      outDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      if (inDegree.has(edge.target)) inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      if (outDegree.has(edge.source)) outDegree.set(edge.source, outDegree.get(edge.source) + 1);
    });

    // Calculate hierarchy levels using topological sorting approach
    const queue = [];
    nodes.forEach(node => {
      if (inDegree.get(node.id) === 0) {
        queue.push({ id: node.id, level: 0 });
        hierarchy.levels.set(node.id, 0);
      }
    });

    let currentLevel = 0;
    while (queue.length > 0) {
      const { id: nodeId, level } = queue.shift();
      currentLevel = Math.max(currentLevel, level);

      edges.forEach(edge => {
        if (edge.source === nodeId) {
          const targetLevel = level + 1;
          if (!hierarchy.levels.has(edge.target) || hierarchy.levels.get(edge.target) < targetLevel) {
            hierarchy.levels.set(edge.target, targetLevel);
            queue.push({ id: edge.target, level: targetLevel });
          }
        }
      });
    }

    // Detect clusters (nodes at similar positions)
    const positionGroups = new Map();
    nodes.forEach(node => {
      const regionKey = `${Math.floor(node.position.x / 200)}-${Math.floor(node.position.y / 200)}`;
      if (!positionGroups.has(regionKey)) {
        positionGroups.set(regionKey, []);
      }
      positionGroups.get(regionKey).push(node.id);
    });

    positionGroups.forEach((nodeIds, regionKey) => {
      if (nodeIds.length > 1) {
        hierarchy.clusters.set(regionKey, nodeIds);
      }
    });

    this.hierarchyCache.set('current', hierarchy);
    return hierarchy;
  }

  /**
   * Calculate layout-aware routing centers
   */
  calculateRoutingCenters(nodes, layoutType = 'default') {
    const centers = new Map();
    const constraints = this.layoutConstraints.get(layoutType) || {};

    switch (layoutType) {
      case 'hierarchical':
        return this.calculateHierarchicalRoutingCenters(nodes, constraints);
      
      case 'circular':
        return this.calculateCircularRoutingCenters(nodes, constraints);
      
      case 'grid':
        return this.calculateGridRoutingCenters(nodes, constraints);
      
      default:
        return this.calculateDefaultRoutingCenters(nodes, constraints);
    }
  }

  calculateHierarchicalRoutingCenters(nodes, constraints) {
    const centers = new Map();
    const hierarchy = this.hierarchyCache.get('current');
    
    if (!hierarchy) {
      return this.calculateDefaultRoutingCenters(nodes, constraints);
    }

    // Create routing centers between hierarchy levels
    const levelNodes = new Map();
    nodes.forEach(node => {
      const level = hierarchy.levels.get(node.id) || 0;
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level).push(node);
    });

    // Calculate centers between levels
    for (let level = 0; level < levelNodes.size - 1; level++) {
      const currentLevelNodes = levelNodes.get(level) || [];
      const nextLevelNodes = levelNodes.get(level + 1) || [];

      if (currentLevelNodes.length > 0 && nextLevelNodes.length > 0) {
        const currentAvgY = currentLevelNodes.reduce((sum, n) => sum + n.position.y, 0) / currentLevelNodes.length;
        const nextAvgY = nextLevelNodes.reduce((sum, n) => sum + n.position.y, 0) / nextLevelNodes.length;
        
        centers.set(`level-${level}-${level + 1}`, {
          x: (currentLevelNodes[0].position.x + nextLevelNodes[0].position.x) / 2,
          y: (currentAvgY + nextAvgY) / 2,
          type: 'hierarchy-bridge'
        });
      }
    }

    return centers;
  }

  calculateCircularRoutingCenters(nodes, constraints) {
    const centers = new Map();
    
    if (nodes.length === 0) return centers;

    // Calculate the center of all nodes
    const avgX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;
    const avgY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;

    centers.set('center', {
      x: avgX,
      y: avgY,
      type: 'circular-center'
    });

    // Add intermediate routing points on the circle
    const radius = Math.max(
      ...nodes.map(n => Math.sqrt(Math.pow(n.position.x - avgX, 2) + Math.pow(n.position.y - avgY, 2)))
    ) * 0.7;

    for (let i = 0; i < 8; i++) {
      const angle = (2 * Math.PI * i) / 8;
      centers.set(`ring-${i}`, {
        x: avgX + radius * Math.cos(angle),
        y: avgY + radius * Math.sin(angle),
        type: 'circular-waypoint'
      });
    }

    return centers;
  }

  calculateGridRoutingCenters(nodes, constraints) {
    const centers = new Map();
    
    if (nodes.length === 0) return centers;

    // Find grid boundaries
    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxY = Math.max(...nodes.map(n => n.position.y));

    const gridSpacing = 100;
    
    // Create routing centers at grid intersections
    for (let x = minX; x <= maxX; x += gridSpacing) {
      for (let y = minY; y <= maxY; y += gridSpacing) {
        // Only add centers that don't overlap with nodes
        const hasNearbyNode = nodes.some(node => 
          Math.abs(node.position.x - x) < 50 && Math.abs(node.position.y - y) < 50
        );
        
        if (!hasNearbyNode) {
          centers.set(`grid-${x}-${y}`, {
            x, y,
            type: 'grid-intersection'
          });
        }
      }
    }

    return centers;
  }

  calculateDefaultRoutingCenters(nodes, constraints) {
    const centers = new Map();
    
    // Simple approach: add routing centers between clusters of nodes
    const hierarchy = this.hierarchyCache.get('current');
    if (hierarchy && hierarchy.clusters.size > 0) {
      const clusterCenters = [];
      
      hierarchy.clusters.forEach((nodeIds, regionKey) => {
        const clusterNodes = nodes.filter(n => nodeIds.includes(n.id));
        if (clusterNodes.length > 0) {
          const centerX = clusterNodes.reduce((sum, n) => sum + n.position.x, 0) / clusterNodes.length;
          const centerY = clusterNodes.reduce((sum, n) => sum + n.position.y, 0) / clusterNodes.length;
          clusterCenters.push({ x: centerX, y: centerY, region: regionKey });
        }
      });

      // Add routing centers between cluster centers
      for (let i = 0; i < clusterCenters.length; i++) {
        for (let j = i + 1; j < clusterCenters.length; j++) {
          const center1 = clusterCenters[i];
          const center2 = clusterCenters[j];
          
          centers.set(`cluster-bridge-${i}-${j}`, {
            x: (center1.x + center2.x) / 2,
            y: (center1.y + center2.y) / 2,
            type: 'cluster-bridge'
          });
        }
      }
    }

    return centers;
  }

  /**
   * Calculate layout-aware path for an edge
   */
  async calculateLayoutAwarePath(edge, nodes, layoutType = 'default') {
    try {
      // Analyze hierarchy if not cached
      if (!this.hierarchyCache.has('current')) {
        const edges = [edge]; // In real scenario, pass all edges
        this.analyzeHierarchy(nodes, edges);
      }

      // Calculate routing centers
      const routingCenters = this.calculateRoutingCenters(nodes, layoutType);
      
      // Get layout constraints
      const constraints = this.layoutConstraints.get(layoutType) || {};

      // Enhanced edge object with routing information
      const enhancedEdge = {
        ...edge,
        data: {
          ...edge.data,
          layoutType,
          routingCenters: Array.from(routingCenters.values()),
          constraints
        }
      };

      // Use Web Worker for complex pathfinding
      const result = await edgeWorkerService.calculateSmartPath(enhancedEdge, nodes);
      
      // Post-process result based on layout constraints
      return this.postProcessLayoutPath(result, edge, nodes, layoutType, routingCenters);

    } catch (error) {
      console.error('❌ LayoutAwareRoutingService: Failed to calculate layout-aware path:', error);
      
      // Fallback to basic routing
      return edgeWorkerService.fallbackCalculatePath(edge, nodes);
    }
  }

  /**
   * Post-process path based on layout constraints
   */
  postProcessLayoutPath(waypoints, edge, nodes, layoutType, routingCenters) {
    const constraints = this.layoutConstraints.get(layoutType) || {};
    
    if (!waypoints || waypoints.length === 0) return waypoints;

    let processedWaypoints = [...waypoints];

    // Apply container awareness
    if (constraints.containerAwareness) {
      processedWaypoints = this.adjustForContainers(processedWaypoints, edge, nodes);
    }

    // Apply hierarchy respect
    if (constraints.hierarchyRespect) {
      processedWaypoints = this.adjustForHierarchy(processedWaypoints, edge, nodes);
    }

    // Optimize path using routing centers
    if (routingCenters.size > 0) {
      processedWaypoints = this.optimizeWithRoutingCenters(processedWaypoints, routingCenters);
    }

    return processedWaypoints;
  }

  adjustForContainers(waypoints, edge, nodes) {
    // Find container boundaries that might affect the path
    const containers = nodes.filter(n => n.type === 'container');
    if (containers.length === 0) return waypoints;

    const adjustedWaypoints = [];

    for (let i = 0; i < waypoints.length; i++) {
      const waypoint = waypoints[i];
      let adjusted = { ...waypoint };

      // Check if waypoint is inside a container it shouldn't be in
      for (const container of containers) {
        const bounds = {
          x: container.position.x,
          y: container.position.y,
          width: container.width || 400,
          height: container.height || 300
        };

        if (this.isPointInBounds(waypoint, bounds)) {
          // Move waypoint to container edge
          adjusted = this.moveToNearestEdge(waypoint, bounds);
          break;
        }
      }

      adjustedWaypoints.push(adjusted);
    }

    return adjustedWaypoints;
  }

  adjustForHierarchy(waypoints, edge, nodes) {
    const hierarchy = this.hierarchyCache.get('current');
    if (!hierarchy) return waypoints;

    const sourceLevel = hierarchy.levels.get(edge.source) || 0;
    const targetLevel = hierarchy.levels.get(edge.target) || 0;

    // If there's a significant level difference, add intermediate waypoints
    if (Math.abs(targetLevel - sourceLevel) > 1) {
      const adjustedWaypoints = [...waypoints];
      
      // Add waypoints at intermediate levels
      const levelStep = (targetLevel - sourceLevel) / (Math.abs(targetLevel - sourceLevel) + 1);
      
      for (let level = sourceLevel + levelStep; 
           Math.abs(level - targetLevel) > Math.abs(levelStep / 2); 
           level += levelStep) {
        
        // Find nodes at this level for reference
        const levelNodes = nodes.filter(n => 
          Math.abs((hierarchy.levels.get(n.id) || 0) - Math.round(level)) < 0.5
        );
        
        if (levelNodes.length > 0) {
          const avgY = levelNodes.reduce((sum, n) => sum + n.position.y, 0) / levelNodes.length;
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (sourceNode && targetNode) {
            adjustedWaypoints.push({
              x: (sourceNode.position.x + targetNode.position.x) / 2,
              y: avgY,
              type: 'hierarchy-bridge'
            });
          }
        }
      }
      
      return adjustedWaypoints.sort((a, b) => a.y - b.y);
    }

    return waypoints;
  }

  optimizeWithRoutingCenters(waypoints, routingCenters) {
    if (routingCenters.size === 0) return waypoints;

    const optimized = [];
    const centerArray = Array.from(routingCenters.values());

    for (const waypoint of waypoints) {
      // Find the nearest routing center
      let nearestCenter = null;
      let minDistance = Infinity;

      for (const center of centerArray) {
        const distance = Math.sqrt(
          Math.pow(waypoint.x - center.x, 2) + Math.pow(waypoint.y - center.y, 2)
        );
        
        if (distance < minDistance && distance < 100) { // Only snap if within 100px
          minDistance = distance;
          nearestCenter = center;
        }
      }

      // Snap to routing center if close enough
      if (nearestCenter && minDistance < 50) {
        optimized.push({
          x: nearestCenter.x,
          y: nearestCenter.y,
          snappedTo: nearestCenter.type
        });
      } else {
        optimized.push(waypoint);
      }
    }

    return optimized;
  }

  // Utility methods
  isPointInBounds(point, bounds) {
    return point.x >= bounds.x && 
           point.x <= bounds.x + bounds.width &&
           point.y >= bounds.y && 
           point.y <= bounds.y + bounds.height;
  }

  moveToNearestEdge(point, bounds) {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    
    // Determine which edge is closest
    const ratioX = Math.abs(dx) / (bounds.width / 2);
    const ratioY = Math.abs(dy) / (bounds.height / 2);
    
    if (ratioX > ratioY) {
      // Move to left or right edge
      return {
        x: dx > 0 ? bounds.x + bounds.width + 10 : bounds.x - 10,
        y: point.y
      };
    } else {
      // Move to top or bottom edge
      return {
        x: point.x,
        y: dy > 0 ? bounds.y + bounds.height + 10 : bounds.y - 10
      };
    }
  }

  /**
   * Clear caches
   */
  clearCaches() {
    this.routingCache.clear();
    this.hierarchyCache.clear();
    edgeWorkerService.clearCache();
  }

  /**
   * Get routing statistics
   */
  getRoutingStatistics() {
    const hierarchy = this.hierarchyCache.get('current');
    
    return {
      cacheSize: this.routingCache.size,
      constraintsCount: this.layoutConstraints.size,
      hierarchyLevels: hierarchy ? hierarchy.levels.size : 0,
      containerGroups: hierarchy ? hierarchy.containers.size : 0,
      clusters: hierarchy ? hierarchy.clusters.size : 0
    };
  }
}

// Create singleton instance
const layoutAwareRoutingService = new LayoutAwareRoutingService();

// Set up default layout constraints
layoutAwareRoutingService.setLayoutConstraints('hierarchical', {
  preferredRouting: 'orthogonal',
  avoidanceMargin: 30,
  containerAwareness: true,
  hierarchyRespect: true
});

layoutAwareRoutingService.setLayoutConstraints('circular', {
  preferredRouting: 'curved',
  avoidanceMargin: 20,
  containerAwareness: false,
  hierarchyRespect: false
});

layoutAwareRoutingService.setLayoutConstraints('grid', {
  preferredRouting: 'orthogonal',
  avoidanceMargin: 25,
  containerAwareness: true,
  hierarchyRespect: false
});

export default layoutAwareRoutingService;