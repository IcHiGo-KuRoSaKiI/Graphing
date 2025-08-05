import { useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';
import EdgeRoutingService from '../services/EdgeRoutingService';

/**
 * Custom hook for orthogonal routing integration with React Flow
 * Provides automatic edge routing, collision avoidance, and smart pathfinding
 */
export const useOrthogonalRouting = (options = {}) => {
  const { getNodes, getEdges, setEdges, addEdges } = useReactFlow();
  const routingServiceRef = useRef(null);
  const lastNodePositionsRef = useRef(new Map());

  // Initialize routing service
  useEffect(() => {
    routingServiceRef.current = new EdgeRoutingService({
      autoRouteEnabled: options.autoRouteEnabled !== false,
      collisionAvoidanceEnabled: options.collisionAvoidanceEnabled !== false,
      rerouteOnNodeMove: options.rerouteOnNodeMove !== false,
      gridSize: options.gridSize || 20,
      minSpacing: options.minSpacing || 50,
      jettySize: options.jettySize || 10,
      obstacleMargin: options.obstacleMargin || 20,
    });
  }, [options]);

  // Auto-route new edges when they're added
  const addEdgeWithRouting = useCallback((edge) => {
    if (!routingServiceRef.current) return;

    const nodes = getNodes();
    const routedEdge = routingServiceRef.current.autoRouteNewEdge(edge, nodes);
    
    addEdges([routedEdge]);
  }, [addEdges, getNodes]);

  // Re-route edges when nodes move
  const handleNodeMove = useCallback((event, node) => {
    if (!routingServiceRef.current || !options.rerouteOnNodeMove) return;

    const lastPosition = lastNodePositionsRef.current.get(node.id);
    const currentPosition = node.position;

    // Check if node actually moved
    if (lastPosition && 
        Math.abs(lastPosition.x - currentPosition.x) < 5 && 
        Math.abs(lastPosition.y - currentPosition.y) < 5) {
      return;
    }

    // Update last position
    lastNodePositionsRef.current.set(node.id, currentPosition);

    // Re-route connected edges
    const edges = getEdges();
    const nodes = getNodes();
    const reroutedEdges = routingServiceRef.current.rerouteEdgesOnNodeMove(node.id, edges, nodes);
    
    setEdges(reroutedEdges);
  }, [getEdges, getNodes, setEdges, options.rerouteOnNodeMove]);

  // Optimize all edges
  const optimizeAllEdges = useCallback(() => {
    if (!routingServiceRef.current) return;

    const edges = getEdges();
    const nodes = getNodes();
    const optimizedEdges = routingServiceRef.current.optimizeEdgeLayout(edges, nodes);
    
    setEdges(optimizedEdges);
  }, [getEdges, getNodes, setEdges]);

  // Re-route all edges
  const rerouteAllEdges = useCallback(() => {
    if (!routingServiceRef.current) return;

    const edges = getEdges();
    const nodes = getNodes();
    const reroutedEdges = routingServiceRef.current.rerouteAllEdges(edges, nodes);
    
    setEdges(reroutedEdges);
  }, [getEdges, getNodes, setEdges]);

  // Validate edge routing
  const validateEdgeRouting = useCallback((edgeId) => {
    if (!routingServiceRef.current) return { valid: false, error: 'Routing service not initialized' };

    const edges = getEdges();
    const nodes = getNodes();
    const edge = edges.find(e => e.id === edgeId);
    
    if (!edge) return { valid: false, error: 'Edge not found' };

    return routingServiceRef.current.validateEdgeRouting(edge, nodes);
  }, [getEdges, getNodes]);

  // Get routing statistics
  const getRoutingStats = useCallback(() => {
    if (!routingServiceRef.current) return null;

    const edges = getEdges();
    return routingServiceRef.current.getRoutingStats(edges);
  }, [getEdges]);

  // Update routing configuration
  const updateRoutingConfig = useCallback((config) => {
    if (!routingServiceRef.current) return;

    routingServiceRef.current.updateConfiguration(config);
  }, []);

  // Manual edge routing
  const routeEdge = useCallback((edgeId) => {
    if (!routingServiceRef.current) return;

    const edges = getEdges();
    const nodes = getNodes();
    const edge = edges.find(e => e.id === edgeId);
    
    if (!edge) return;

    const reroutedEdge = routingServiceRef.current.rerouteEdge(edge, nodes);
    
    setEdges(edges.map(e => e.id === edgeId ? reroutedEdge : e));
  }, [getEdges, getNodes, setEdges]);

  // Batch route multiple edges
  const routeEdges = useCallback((edgeIds) => {
    if (!routingServiceRef.current) return;

    const edges = getEdges();
    const nodes = getNodes();
    
    const updatedEdges = edges.map(edge => {
      if (edgeIds.includes(edge.id)) {
        return routingServiceRef.current.rerouteEdge(edge, nodes);
      }
      return edge;
    });
    
    setEdges(updatedEdges);
  }, [getEdges, getNodes, setEdges]);

  // Clear manual waypoints and auto-route
  const clearManualRouting = useCallback((edgeId) => {
    const edges = getEdges();
    const edge = edges.find(e => e.id === edgeId);
    
    if (!edge) return;

    const clearedEdge = {
      ...edge,
      data: {
        ...edge.data,
        waypoints: [],
        autoRouted: true
      }
    };

    // Auto-route the cleared edge
    const nodes = getNodes();
    const routedEdge = routingServiceRef.current.autoRouteNewEdge(clearedEdge, nodes);
    
    setEdges(edges.map(e => e.id === edgeId ? routedEdge : e));
  }, [getEdges, getNodes, setEdges]);

  // Batch clear manual routing for all edges
  const clearAllManualRouting = useCallback(() => {
    const edges = getEdges();
    const nodes = getNodes();
    
    const clearedEdges = edges.map(edge => ({
      ...edge,
      data: {
        ...edge.data,
        waypoints: [],
        autoRouted: true
      }
    }));

    const routedEdges = clearedEdges.map(edge => 
      routingServiceRef.current.autoRouteNewEdge(edge, nodes)
    );
    
    setEdges(routedEdges);
  }, [getEdges, getNodes, setEdges]);

  return {
    // Core routing functions
    addEdgeWithRouting,
    handleNodeMove,
    optimizeAllEdges,
    rerouteAllEdges,
    routeEdge,
    routeEdges,
    
    // Validation and statistics
    validateEdgeRouting,
    getRoutingStats,
    
    // Configuration
    updateRoutingConfig,
    
    // Manual routing control
    clearManualRouting,
    clearAllManualRouting,
    
    // Service access
    routingService: routingServiceRef.current,
  };
};

export default useOrthogonalRouting; 