/**
 * LayoutAwareRoutingService - Advanced routing with layout pattern detection
 * Provides draw.io-style layout-aware edge routing for different diagram types
 */

class LayoutAwareRoutingService {
  constructor() {
    this.layoutCache = new Map();
    this.routingStatistics = {
      totalRoutes: 0,
      layoutDetections: 0,
      cacheHits: 0,
      averageRoutingTime: 0
    };
    
    // Layout pattern definitions
    this.layoutPatterns = {
      hierarchical: {
        name: 'hierarchical',
        detectionThreshold: 0.7,
        routingStrategy: 'hierarchical'
      },
      flowchart: {
        name: 'flowchart',
        detectionThreshold: 0.6,
        routingStrategy: 'flowchart'
      },
      network: {
        name: 'network',
        detectionThreshold: 0.5,
        routingStrategy: 'network'
      },
      mindmap: {
        name: 'mindmap',
        detectionThreshold: 0.8,
        routingStrategy: 'radial'
      }
    };
  }

  /**
   * Detect layout pattern from node arrangement
   */
  detectLayoutPattern(nodes) {
    if (nodes.length < 3) return 'default';

    const cacheKey = this.createLayoutCacheKey(nodes);
    const cached = this.layoutCache.get(cacheKey);
    if (cached) {
      this.routingStatistics.cacheHits++;
      return cached;
    }

    const scores = {
      hierarchical: this.calculateHierarchicalScore(nodes),
      flowchart: this.calculateFlowchartScore(nodes),
      network: this.calculateNetworkScore(nodes),
      mindmap: this.calculateMindmapScore(nodes)
    };

    // Find the best matching pattern
    let bestPattern = 'default';
    let bestScore = 0;

    Object.entries(scores).forEach(([pattern, score]) => {
      if (score > bestScore && score > this.layoutPatterns[pattern]?.detectionThreshold) {
        bestScore = score;
        bestPattern = pattern;
      }
    });

    this.layoutCache.set(cacheKey, bestPattern);
    this.routingStatistics.layoutDetections++;
    
    return bestPattern;
  }

  /**
   * Calculate hierarchical layout score
   */
  calculateHierarchicalScore(nodes) {
    const levels = this.groupNodesByLevel(nodes);
    const levelCount = Object.keys(levels).length;
    
    if (levelCount < 2) return 0;

    let score = 0;
    let totalConnections = 0;
    let hierarchicalConnections = 0;

    // Check if connections follow hierarchical pattern
    nodes.forEach(node => {
      const nodeLevel = this.getNodeLevel(node, nodes);
      const connections = this.getNodeConnections(node, nodes);
      
      connections.forEach(connection => {
        const targetLevel = this.getNodeLevel(connection, nodes);
        totalConnections++;
        
        // Hierarchical: connections should go from higher to lower levels
        if (targetLevel > nodeLevel) {
          hierarchicalConnections++;
        }
      });
    });

    score = totalConnections > 0 ? hierarchicalConnections / totalConnections : 0;
    
    // Bonus for clear level separation
    const levelSeparation = this.calculateLevelSeparation(levels);
    score += levelSeparation * 0.3;

    return Math.min(score, 1);
  }

  /**
   * Calculate flowchart layout score
   */
  calculateFlowchartScore(nodes) {
    const flowDirections = this.analyzeFlowDirections(nodes);
    let score = 0;

    // Check for left-to-right or top-to-bottom flow
    const horizontalFlow = flowDirections.horizontal / Math.max(flowDirections.total, 1);
    const verticalFlow = flowDirections.vertical / Math.max(flowDirections.total, 1);

    if (horizontalFlow > 0.6 || verticalFlow > 0.6) {
      score = Math.max(horizontalFlow, verticalFlow);
    }

    // Bonus for decision nodes (diamond shapes)
    const decisionNodes = nodes.filter(node => 
      node.type === 'diamond' || 
      node.data?.shape === 'diamond' ||
      node.width === node.height
    );
    
    if (decisionNodes.length > 0) {
      score += (decisionNodes.length / nodes.length) * 0.2;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate network layout score
   */
  calculateNetworkScore(nodes) {
    const connectivity = this.calculateConnectivity(nodes);
    const distribution = this.calculateNodeDistribution(nodes);
    
    let score = 0;

    // High connectivity indicates network
    if (connectivity > 0.3) {
      score += connectivity * 0.6;
    }

    // Even distribution indicates network
    if (distribution > 0.5) {
      score += distribution * 0.4;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate mindmap layout score
   */
  calculateMindmapScore(nodes) {
    const centerNode = this.findCenterNode(nodes);
    if (!centerNode) return 0;

    const radialConnections = this.calculateRadialConnections(centerNode, nodes);
    const radialDistribution = this.calculateRadialDistribution(centerNode, nodes);
    
    let score = 0;

    // High radial connectivity indicates mindmap
    if (radialConnections > 0.5) {
      score += radialConnections * 0.7;
    }

    // Good radial distribution
    if (radialDistribution > 0.6) {
      score += radialDistribution * 0.3;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate layout-aware path for an edge
   */
  async calculateLayoutAwarePath(edge, nodes, layoutType = 'auto') {
    const startTime = performance.now();
    
    try {
      // Detect layout if not specified
      if (layoutType === 'auto') {
        layoutType = this.detectLayoutPattern(nodes);
      }

      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) {
        return this.calculateDefaultOrthogonalPath(sourceNode, targetNode);
      }

      let path;
      switch (layoutType) {
        case 'hierarchical':
          path = this.calculateHierarchicalPath(sourceNode, targetNode, nodes);
          break;
        case 'flowchart':
          path = this.calculateFlowchartPath(sourceNode, targetNode, nodes);
          break;
        case 'network':
          path = this.calculateNetworkPath(sourceNode, targetNode, nodes);
          break;
        case 'mindmap':
          path = this.calculateMindmapPath(sourceNode, targetNode, nodes);
          break;
        default:
          path = this.calculateDefaultOrthogonalPath(sourceNode, targetNode);
      }

      const endTime = performance.now();
      this.updateRoutingStatistics(endTime - startTime);

      return path;
    } catch (error) {
      console.error('❌ LayoutAwareRoutingService: Path calculation failed:', error);
      return this.calculateDefaultOrthogonalPath(
        nodes.find(n => n.id === edge.source),
        nodes.find(n => n.id === edge.target)
      );
    }
  }

  /**
   * Calculate hierarchical path (top-down or left-right)
   */
  calculateHierarchicalPath(sourceNode, targetNode, nodes) {
    const sourceLevel = this.getNodeLevel(sourceNode, nodes);
    const targetLevel = this.getNodeLevel(targetNode, nodes);
    
    // Determine if layout is horizontal or vertical
    const isHorizontal = this.isHorizontalHierarchy(nodes);
    
    if (isHorizontal) {
      return this.calculateHorizontalHierarchicalPath(sourceNode, targetNode, sourceLevel, targetLevel);
    } else {
      return this.calculateVerticalHierarchicalPath(sourceNode, targetNode, sourceLevel, targetLevel);
    }
  }

  /**
   * Calculate flowchart path (following flow direction)
   */
  calculateFlowchartPath(sourceNode, targetNode, nodes) {
    const flowDirection = this.determineFlowDirection(nodes);
    
    if (flowDirection === 'horizontal') {
      return this.calculateHorizontalFlowPath(sourceNode, targetNode);
    } else {
      return this.calculateVerticalFlowPath(sourceNode, targetNode);
    }
  }

  /**
   * Calculate network path (shortest path avoiding obstacles)
   */
  calculateNetworkPath(sourceNode, targetNode, nodes) {
    const obstacles = nodes.filter(n => n.id !== sourceNode.id && n.id !== targetNode.id);
    return this.calculateShortestPath(sourceNode, targetNode, obstacles);
  }

  /**
   * Calculate mindmap path (radial from center)
   */
  calculateMindmapPath(sourceNode, targetNode, nodes) {
    const centerNode = this.findCenterNode(nodes);
    if (!centerNode) {
      return this.calculateDefaultOrthogonalPath(sourceNode, targetNode);
    }

    // If one of the nodes is the center, use radial path
    if (sourceNode.id === centerNode.id || targetNode.id === centerNode.id) {
      return this.calculateRadialPath(sourceNode, targetNode, centerNode);
    }

    // Otherwise, route through center or use direct path
    return this.calculateRadialThroughCenterPath(sourceNode, targetNode, centerNode);
  }

  // Helper methods

  groupNodesByLevel(nodes) {
    const levels = {};
    nodes.forEach(node => {
      const level = this.getNodeLevel(node, nodes);
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    });
    return levels;
  }

  getNodeLevel(node, nodes) {
    // Simple level calculation based on Y position (top = level 0)
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const nodeIndex = sortedNodes.findIndex(n => n.id === node.id);
    return Math.floor(nodeIndex / Math.max(1, Math.ceil(nodes.length / 5)));
  }

  getNodeConnections(node, nodes) {
    // This would need to be implemented based on your edge data structure
    // For now, return empty array
    return [];
  }

  calculateLevelSeparation(levels) {
    const levelPositions = Object.keys(levels).map(level => {
      const levelNodes = levels[level];
      const avgY = levelNodes.reduce((sum, node) => sum + node.position.y, 0) / levelNodes.length;
      return { level: parseInt(level), avgY };
    });

    if (levelPositions.length < 2) return 0;

    // Calculate average separation between levels
    let totalSeparation = 0;
    for (let i = 1; i < levelPositions.length; i++) {
      totalSeparation += Math.abs(levelPositions[i].avgY - levelPositions[i-1].avgY);
    }

    return totalSeparation / (levelPositions.length - 1);
  }

  analyzeFlowDirections(nodes) {
    // Analyze connection directions to determine flow
    return {
      horizontal: 0,
      vertical: 0,
      total: 0
    };
  }

  calculateConnectivity(nodes) {
    // Calculate average connections per node
    return 0.5; // Placeholder
  }

  calculateNodeDistribution(nodes) {
    // Calculate how evenly nodes are distributed
    const positions = nodes.map(n => ({ x: n.position.x, y: n.position.y }));
    const bounds = this.calculateBounds(positions);
    
    if (bounds.width === 0 || bounds.height === 0) return 0;
    
    const area = bounds.width * bounds.height;
    const nodeArea = nodes.length * 100 * 100; // Assuming average node size
    
    return Math.min(nodeArea / area, 1);
  }

  findCenterNode(nodes) {
    const center = this.calculateCenter(nodes);
    return nodes.reduce((closest, node) => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - center.x, 2) + 
        Math.pow(node.position.y - center.y, 2)
      );
      return distance < closest.distance ? { node, distance } : closest;
    }, { node: null, distance: Infinity }).node;
  }

  calculateRadialConnections(centerNode, nodes) {
    // Calculate percentage of nodes connected to center
    return 0.5; // Placeholder
  }

  calculateRadialDistribution(centerNode, nodes) {
    // Calculate how well nodes are distributed around center
    const angles = nodes
      .filter(n => n.id !== centerNode.id)
      .map(node => {
        const dx = node.position.x - centerNode.position.x;
        const dy = node.position.y - centerNode.position.y;
        return Math.atan2(dy, dx);
      });

    if (angles.length === 0) return 0;

    // Check distribution across quadrants
    const quadrants = [0, 0, 0, 0];
    angles.forEach(angle => {
      const quadrant = Math.floor(((angle + Math.PI) / (Math.PI / 2))) % 4;
      quadrants[quadrant]++;
    });

    const maxQuadrant = Math.max(...quadrants);
    const minQuadrant = Math.min(...quadrants);
    
    return minQuadrant / Math.max(maxQuadrant, 1);
  }

  isHorizontalHierarchy(nodes) {
    // Determine if hierarchy is horizontal or vertical
    const sortedByX = [...nodes].sort((a, b) => a.position.x - b.position.x);
    const sortedByY = [...nodes].sort((a, b) => a.position.y - b.position.y);
    
    const xVariance = this.calculateVariance(sortedByX.map(n => n.position.x));
    const yVariance = this.calculateVariance(sortedByY.map(n => n.position.y));
    
    return xVariance > yVariance;
  }

  determineFlowDirection(nodes) {
    // Determine primary flow direction
    const xVariance = this.calculateVariance(nodes.map(n => n.position.x));
    const yVariance = this.calculateVariance(nodes.map(n => n.position.y));
    
    return xVariance > yVariance ? 'horizontal' : 'vertical';
  }

  calculateShortestPath(sourceNode, targetNode, obstacles) {
    // A* pathfinding implementation
    const start = { x: sourceNode.position.x, y: sourceNode.position.y };
    const end = { x: targetNode.position.x, y: targetNode.position.y };
    
    // Simple orthogonal path for now
    return this.calculateDefaultOrthogonalPath(sourceNode, targetNode);
  }

  calculateRadialPath(sourceNode, targetNode, centerNode) {
    const sourcePoint = { x: sourceNode.position.x, y: sourceNode.position.y };
    const targetPoint = { x: targetNode.position.x, y: targetNode.position.y };
    const centerPoint = { x: centerNode.position.x, y: centerNode.position.y };
    
    // Calculate radial path
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      const midX = sourcePoint.x + dx / 2;
      return [
        { x: midX, y: sourcePoint.y },
        { x: midX, y: targetPoint.y }
      ];
    } else {
      const midY = sourcePoint.y + dy / 2;
      return [
        { x: sourcePoint.x, y: midY },
        { x: targetPoint.x, y: midY }
      ];
    }
  }

  calculateRadialThroughCenterPath(sourceNode, targetNode, centerNode) {
    const sourcePoint = { x: sourceNode.position.x, y: sourceNode.position.y };
    const targetPoint = { x: targetNode.position.x, y: targetNode.position.y };
    const centerPoint = { x: centerNode.position.x, y: centerNode.position.y };
    
    return [
      { x: centerPoint.x, y: sourcePoint.y },
      { x: centerPoint.x, y: targetPoint.y }
    ];
  }

  calculateHorizontalHierarchicalPath(sourceNode, targetNode, sourceLevel, targetLevel) {
    const sourcePoint = { x: sourceNode.position.x, y: sourceNode.position.y };
    const targetPoint = { x: targetNode.position.x, y: targetNode.position.y };
    
    // Horizontal hierarchy: route vertically first, then horizontally
    const midY = sourcePoint.y + (targetPoint.y - sourcePoint.y) / 2;
    return [
      { x: sourcePoint.x, y: midY },
      { x: targetPoint.x, y: midY }
    ];
  }

  calculateVerticalHierarchicalPath(sourceNode, targetNode, sourceLevel, targetLevel) {
    const sourcePoint = { x: sourceNode.position.x, y: sourceNode.position.y };
    const targetPoint = { x: targetNode.position.x, y: targetNode.position.y };
    
    // Vertical hierarchy: route horizontally first, then vertically
    const midX = sourcePoint.x + (targetPoint.x - sourcePoint.x) / 2;
    return [
      { x: midX, y: sourcePoint.y },
      { x: midX, y: targetPoint.y }
    ];
  }

  calculateHorizontalFlowPath(sourceNode, targetNode) {
    const sourcePoint = { x: sourceNode.position.x, y: sourceNode.position.y };
    const targetPoint = { x: targetNode.position.x, y: targetNode.position.y };
    
    // Horizontal flow: prefer horizontal routing
    const midY = sourcePoint.y + (targetPoint.y - sourcePoint.y) / 2;
    return [
      { x: sourcePoint.x, y: midY },
      { x: targetPoint.x, y: midY }
    ];
  }

  calculateVerticalFlowPath(sourceNode, targetNode) {
    const sourcePoint = { x: sourceNode.position.x, y: sourceNode.position.y };
    const targetPoint = { x: targetNode.position.x, y: targetNode.position.y };
    
    // Vertical flow: prefer vertical routing
    const midX = sourcePoint.x + (targetPoint.x - sourcePoint.x) / 2;
    return [
      { x: midX, y: sourcePoint.y },
      { x: midX, y: targetPoint.y }
    ];
  }

  calculateDefaultOrthogonalPath(sourceNode, targetNode) {
    if (!sourceNode || !targetNode) return [];
    
    const sourcePoint = { x: sourceNode.position.x, y: sourceNode.position.y };
    const targetPoint = { x: targetNode.position.x, y: targetNode.position.y };
    
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      const midX = sourcePoint.x + dx / 2;
      return [
        { x: midX, y: sourcePoint.y },
        { x: midX, y: targetPoint.y }
      ];
    } else {
      const midY = sourcePoint.y + dy / 2;
      return [
        { x: sourcePoint.x, y: midY },
        { x: targetPoint.x, y: midY }
      ];
    }
  }

  // Utility methods

  createLayoutCacheKey(nodes) {
    const positions = nodes.map(n => `${n.id}:${n.position.x},${n.position.y}`).join('|');
    return positions;
  }

  calculateBounds(positions) {
    if (positions.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    
    const xs = positions.map(p => p.x);
    const ys = positions.map(p => p.y);
    
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }

  calculateCenter(nodes) {
    if (nodes.length === 0) return { x: 0, y: 0 };
    
    const sumX = nodes.reduce((sum, node) => sum + node.position.x, 0);
    const sumY = nodes.reduce((sum, node) => sum + node.position.y, 0);
    
    return {
      x: sumX / nodes.length,
      y: sumY / nodes.length
    };
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    
    return variance;
  }

  updateRoutingStatistics(processingTime) {
    this.routingStatistics.totalRoutes++;
    this.routingStatistics.averageRoutingTime = 
      (this.routingStatistics.averageRoutingTime * (this.routingStatistics.totalRoutes - 1) + processingTime) / 
      this.routingStatistics.totalRoutes;
  }

  getRoutingStatistics() {
    return { ...this.routingStatistics };
  }

  clearCaches() {
    this.layoutCache.clear();
  }
}

// Create singleton instance
const layoutAwareRoutingService = new LayoutAwareRoutingService();

export default layoutAwareRoutingService;